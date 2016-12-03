import BaseHTTPServer
import os.path
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import urllib
import json
import linecache 
from PIL import Image, ImageChops, ImageFilter
import numpy as np
from scipy.ndimage import (label,find_objects)


def not_insane_address_string(self):
    host, port = self.client_address[:2]
    return '%s (no getfqdn)' % host #used to call: socket.getfqdn(host)
BaseHTTPServer.BaseHTTPRequestHandler.address_string = \
        not_insane_address_string

class Serv(BaseHTTPRequestHandler):

    case_number = 7
    standard_pics = []
    ip2line = {}
    root = "./images/generated/"
    open_root = "../collect/images/origins/"

    def thicker(self, img):
        pixels = img.load()
        origin = img.copy()
        ori = origin.load()
        for i in range(1, 255):
            for j in range(1,255):
                pixels[i,j] = ori[i - 1, j - 1] | ori[i,j - 1] | ori[i + 1, j - 1] | ori[i - 1,j] | ori[i + 1,j] | ori[i - 1, j + 1] | ori[i, j + 1] | ori[i + 1, j + 1]

        return img

    #input a picture
    #return a img of edge data
    def getEdge(self, img):
        edge = img.filter(ImageFilter.FIND_EDGES)
        edge = edge.convert('L')
        edge = edge.point(lambda x: 0 if x < 100 else 255, '1')
        edge = self.thicker(edge)
        edge = edge.convert('RGBA')
        return edge

        
    #input the raw data of many pictures in one browser
    #return a string of handled data
    #the four pics is, origin picture, edge picture, standard - img and img - standard
    #the name is ip/a_b_c.png a is browser, b is test case number, c is id inside a test case
    def generateData(self, root, browser, line):
        for i in range(self.case_number):
            img = Image.open(self.open_root + str(line) + '_' + str(i) + '.png')
            img.save(root + str(browser) + '_' + str(i) + '_0.png')  #origin picture

            edge = self.getEdge(img) 
            if i == 3 or i == 4:
                sub = ImageChops.subtract(self.standard_pics[browser][i],img, 0.01)
                subt = ImageChops.subtract(img, self.standard_pics[browser][i], 0.01)
                ImageChops.add(sub, subt).convert('RGB').save(root + str(browser) + '_' + str(i) + '_1.png')  #edge picture
            else:
                edge.save(root + str(browser) + '_' + str(i) + '_1.png')  #edge picture

            sub = ImageChops.subtract(self.standard_pics[browser][i],img, 0.01)
            if i == 3 or i == 4:
                sub = ImageChops.subtract(sub, edge)
            sub = sub.convert('RGB')
            sub.save(root + str(browser) + '_' + str(i) + '_2.png')  #standard - img

            sub = ImageChops.subtract(img, self.standard_pics[browser][i], 0.01)
            if i == 3 or i == 4:
                sub = ImageChops.subtract(sub, edge)
            sub = sub.convert('RGB')
            sub.save(root + str(browser) + '_' + str(i) + '_3.png')  #img - standard
    

    def generatePictures(self, ip):#get the string to send
        #3 type of browsers: chrome, firefox, and others
        if not os.path.exists(self.root + ip):
            os.makedirs(self.root + ip)
        if 'chrome' in self.ip2line[ip].keys():
            line = self.ip2line[ip]['chrome']
            self.generateData(self.root + ip + '/', 0, line)

        if 'firefox' in self.ip2line[ip].keys():
            line = self.ip2line[ip]['firefox']
            self.generateData(self.root + ip + '/', 1, line)
        
        if 'others' in self.ip2line[ip].keys() :
            line = self.ip2line[ip]['others']
            self.generateData(self.root + ip + '/', 2, line)


    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header("Access-Control-Allow-Origin","*")
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        

    def do_HEAD(self):
        self._set_headers()

    def generateLineNumber(self):
        linecache.clearcache()
        numLine = 0
        f = open('../collect/database.csv','r')
        for line in f.readlines():
            item = line.split(',')
            #the order can't change!

            if(item[5].find('Firefox') != -1):
                browser_name = 'firefox'
            elif(item[5].find('Edge') != -1 or item[2].find('Microsoft') != -1):
                browser_name = 'others'
            elif(item[5].find('Chrome') != -1):
                browser_name = 'chrome'
            else:
                browser_name = 'others'

            if(item[0] in self.ip2line):
                self.ip2line[item[0]].update({browser_name:numLine})
            else:
                self.ip2line[item[0]] = {browser_name: numLine}
            numLine += 1
        f.close()
        
    def generateStandard(self):
        tmp = []
        for i in range(self.case_number):
            tmp.append(Image.open(self.open_root + '0_' + str(i) + ".png"))
        self.standard_pics.append(tmp)

        tmp = []
        for i in range(self.case_number):
            tmp.append(Image.open(self.open_root + '1_' + str(i) + ".png"))
        self.standard_pics.append(tmp)

        tmp = []
        for i in range(self.case_number):
            tmp.append(Image.open(self.open_root + '2_' + str(i) + ".png"))
        self.standard_pics.append(tmp)

    def getGroupNumber(self, path): # get how many groups in one image
        s = [[1,1,1],
            [1,1,1],
            [1,1,1]]
        try:
            img = Image.open(path)
        except IOError:
            return -1
        img = img.convert('L')
        a = np.array(img, dtype=np.uint8)
        labeled_array, num_features = label(a, structure=s)
        return num_features

    def getGroupNumberList(self,ip): #get how many groups in picture 1 and pic 2
        #return 12 numbers
        ret = []
        for i in range(3):
            ret.append(self.getGroupNumber(self.root + ip + '/' + str(i) + '_1_2' + '.png'))
            ret.append(self.getGroupNumber(self.root + ip + '/' + str(i) + '_1_3' + '.png'))
            ret.append(self.getGroupNumber(self.root + ip + '/' + str(i) + '_2_2' + '.png'))
            ret.append(self.getGroupNumber(self.root + ip + '/' + str(i) + '_2_3' + '.png'))

        return ret
        

    def do_POST(self):
        # Doesn't do anything with posted data
        self._set_headers()

        length = int(self.headers['Content-Length'])

        post_data = self.rfile.read(length) #change the string to json format
        send = []

        if(post_data[0] == 'R'):
            self.generateLineNumber()
            self.generateStandard()
            for ip in self.ip2line.keys():
                send.append(ip)

        else:
            print post_data
            self.generatePictures(post_data)
            send = self.getGroupNumberList(post_data)

        send_string = json.dumps(send)
        self.wfile.write(send_string)
        return 0 



        
def run(server_class=HTTPServer, handler_class=Serv, port=9999):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'Starting httpd...' + str(port)
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
