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
import MySQLdb

db_name = "cross_browser"
table_name = "data"

case_number = 10
standard_pics = []
ip2line = {}
open_root = "/home/site/data/"
output_root = open_root + "images/generated/"

def thicker(img):
    pixels = img.load()
    origin = img.copy()
    ori = origin.load()
    for i in range(1, 255):
        for j in range(1,255):
            pixels[i,j] = ori[i - 1, j - 1] | ori[i,j - 1] | ori[i + 1, j - 1] | ori[i - 1,j] | ori[i + 1,j] | ori[i - 1, j + 1] | ori[i, j + 1] | ori[i + 1, j + 1]

    return img

#input a picture
#return a img of edge data
def getEdge(img):
    # edge = img.filter(ImageFilter.FIND_EDGES)
    edge = img
    edge = edge.convert('L')
    edge = edge.point(lambda x: 0 if x < 180 else 255, '1')
    #edge = thicker(edge)
    edge = edge.convert('RGBA')
    return edge

def getDifference(img1, img2):
    sub = ImageChops.subtract(img1,img2, 0.005)
    subt = ImageChops.subtract(img2, img1, 0.005)
    return ImageChops.add(sub, subt).convert('RGB')  #edge picture

#input the raw data of many pictures in one browser
#return a string of handled data
#the four pics is, origin picture, edge picture, standard - img and img - standard
#the name is ip/a_b_c.png a is browser, b is test case number, c is id inside a test case
def generateData(root, browser, line):
    for i in range(case_number):
        img = Image.open(open_root + "images/origins/" + str(line) + '_' + str(i) + '.png')
        img.save(root + str(browser) + '_' + str(i) + '_0.png')  #origin picture

        sub = ImageChops.difference(standard_pics[i],img)
        sub = sub.convert('RGB')
        sub.save(root + str(browser) + '_' + str(i) + '_1.png')  #edge picture

        sub = ImageChops.subtract(standard_pics[i],img, 0.005)
        sub = sub.convert('RGB')
        sub.save(root + str(browser) + '_' + str(i) + '_2.png')  #standard - img

        sub = ImageChops.subtract(img, standard_pics[i], 0.005)
        sub = sub.convert('RGB')
        sub.save(root + str(browser) + '_' + str(i) + '_3.png')  #img - standard


def generatePictures(ip):#get the string to send
    #3 type of browsers: chrome, firefox, and others
    if not os.path.exists(output_root + ip):
        os.makedirs(output_root + ip)
    if 'chrome' in ip2line[ip].keys():
        line = ip2line[ip]['chrome']
        generateData(output_root + ip + '/', 0, line)

    if 'firefox' in ip2line[ip].keys():
        line = ip2line[ip]['firefox']
        generateData(output_root + ip + '/', 1, line)

    if 'others' in ip2line[ip].keys() :
        line = ip2line[ip]['others']
        generateData(output_root + ip + '/', 2, line)

def generateLineNumber():
    global db_name
    global table_name
    db = MySQLdb.connect("localhost", "erik", "erik", db_name)
    cursor = db.cursor()
    cursor.execute("SELECT id, str FROM {}".format(table_name))
    data = cursor.fetchall()
    db.close()
    for line in data:
        numLine = line[0]
        item = line[1].split(',')
        #the order can't change!

        if(item[5].find('Firefox') != -1):
            browser_name = 'firefox'
        elif(item[5].find('Edge') != -1 or item[2].find('Microsoft') != -1):
            browser_name = 'others'
        elif(item[5].find('OPR') != -1):
            browser_name = 'others'
        elif(item[5].find('Chrome') != -1 or item[2].find('Google') != -1):
            browser_name = 'chrome'
        else:
            browser_name = 'others'ul.y



        if(item[0] in ip2line):
            ip2line[item[0]].update({browser_name: numLine})
        else:
            ip2line[item[0]] = {browser_name: numLine}
        # numLine += 1

def generateStandard():
    open_img_dir = open_root + "images/origins/"

    for i in range(case_number):
        standard_pics.append(Image.open(open_img_dir + '0_' + str(i) + ".png"))

def getGroupNumber(path): # get how many groups in one image
    s = [[1,1,1],
        [1,1,1],
        [1,1,1]]
    try:
        img = Image.open(path)
    except IOError:
        return 'Do not exist'
    img = img.convert('L')
    a = np.array(img, dtype=np.uint8)
    labeled_array, num_features = label(a, structure=s)
    return num_features

def getGroupNumberList(ip): #get how many groups in picture 1 and pic 2
    #return 12 numbers
    ret = []
    for i in range(3):
        ret.append(getGroupNumber(output_root + ip + '/' + str(i) + '_1_2' + '.png'))
        ret.append(getGroupNumber(output_root + ip + '/' + str(i) + '_1_3' + '.png'))
        ret.append(getGroupNumber(output_root + ip + '/' + str(i) + '_2_2' + '.png'))
        ret.append(getGroupNumber(output_root + ip + '/' + str(i) + '_2_3' + '.png'))

    return ret

def equal(im1, im2):
    return ImageChops.difference(im1, im2).getbbox() is None

def getSubtract(ip, caseNumber):
    #6 pictures
    #0 1 for chrome and firefox
    #2 3 for chrome and others
    #4 5 for firefox and others
    if not os.path.exists(output_root + 'tmp/'):
        os.makedirs(output_root + 'tmp/')

    img1 = Image.open(output_root + ip + '/' + '0_' + caseNumber + '_2.png')
    img2 = Image.open(output_root + ip + '/' + '0_' + caseNumber + '_3.png')
    img3 = Image.open(output_root + ip + '/' + '1_' + caseNumber + '_2.png')
    img4 = Image.open(output_root + ip + '/' + '1_' + caseNumber + '_3.png')
    img5 = Image.open(output_root + ip + '/' + '2_' + caseNumber + '_2.png')
    img6 = Image.open(output_root + ip + '/' + '2_' + caseNumber + '_3.png')

    img7 = Image.open(output_root + ip + '/' + '0_' + caseNumber + '_0.png')
    img8 = Image.open(output_root + ip + '/' + '1_' + caseNumber + '_0.png')
    img9 = Image.open(output_root + ip + '/' + '2_' + caseNumber + '_0.png')

    getDifference(img1, img3).save(output_root + 'tmp/0.png')
    getDifference(img2, img4).save(output_root + 'tmp/1.png')
    getDifference(img1, img5).save(output_root + 'tmp/2.png')
    getDifference(img2, img6).save(output_root + 'tmp/3.png')
    getDifference(img3, img5).save(output_root + 'tmp/4.png')
    getDifference(img4, img6).save(output_root + 'tmp/5.png')

    f = open(output_root + 'tmp/result.html', 'w')
    f.write('chrome and firefox: ' + str(equal(img7, img8)) + '<br>')
    f.write('chrome and others: ' + str(equal(img7, img9)) + '<br>')
    f.write('firefox and others: ' +str(equal(img8, img9)) + '<br>')
    f.flush()
    f.close()



def index(req):
    send = []

    post_data = str(req.form.list)[8:-7]

    if(post_data[0] == 'R'):
        generateLineNumber()
        generateStandard()
        for ip in ip2line.keys():
            send.append(ip)
    elif post_data[0] == 'S':
        tmp = post_data.split(',')
        getSubtract(tmp[1], tmp[2])

    else:
        generatePictures(post_data)
        send = getGroupNumberList(post_data)

    send_string = json.dumps(send)
    return send_string

