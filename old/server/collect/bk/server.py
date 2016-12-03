import BaseHTTPServer
import os.path
import datetime
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import urllib
import json
from PIL import Image, ImageChops, ImageFilter
import linecache 

global line_number

def not_insane_address_string(self):
    host, port = self.client_address[:2]
    return '%s (no getfqdn)' % host #used to call: socket.getfqdn(host)
BaseHTTPServer.BaseHTTPRequestHandler.address_string = \
        not_insane_address_string

class Serv(BaseHTTPRequestHandler):
    img_root = './images/origins/'
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header("Access-Control-Allow-Origin","*")
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        

    def do_HEAD(self):
        self._set_headers()

    def saveImg(self, pixel, name):
        img = Image.new('RGBA', (256,256))
        pixel_map = img.load()
        img_data = json.loads(pixel)
        curr = 0
        for i in range(256):
            for j in range(256):
                pixel_map[i,j] = (img_data[curr], img_data[curr + 1], img_data[curr + 2], img_data[curr + 3])
                curr += 4
        img.save(self.img_root + name + '.png')

    def do_POST(self):
        global ip2line
        global line_number
        sub_number = 0
        # Doesn't do anything with posted data
        self._set_headers()

        length = int(self.headers['Content-Length'])

        post_data = self.rfile.read(length) #change the string to json format
        one_test = json.loads(post_data)
        
        agent = self.headers['User-Agent'].replace(',', ' ')

        print agent

        f = open('./database.csv', 'a')
        f.write(self.client_address[0] + ',' + str(one_test['WebGL']) + ',' + one_test['inc'] + ',' + one_test['gpu'] + ',' + str(datetime.datetime.now()) + ',' + agent + '\n')
        f.close()

        pixels = one_test['pixels'].split(' ')
        for pi in pixels:
            self.saveImg(pi, str(line_number) + '_' + str(sub_number))
            sub_number += 1

        print 'finished'

        line_number += 1

        f = open('line_number', 'w')
        f.write(str(line_number))
        f.close()

        self.wfile.write('success')

        
def run(server_class=HTTPServer, handler_class=Serv, port=9999):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    global line_number
    if os.path.exists('line_number'):
        f = open('line_number','r')
        line_number = int(f.readline())
    else:
        f = open('line_number','w')
        f.write('0')
        line_number = 0

    f.close()
    print 'Starting httpd...' + str(port)
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
