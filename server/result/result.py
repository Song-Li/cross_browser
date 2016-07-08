import BaseHTTPServer
import os.path
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import urllib
import json
import linecache
from PIL import Image, ImageChops, ImageFilter
import numpy as np
# from scipy.ndimage import (label,find_objects)
import MySQLdb
from hashlib import sha512 as hasher1, sha256 as hasher2
from base64 import urlsafe_b64encode as encode

browser_to_id = {'Chrome': 0, 'Firefox': 1, 'others': 2, 'OPR': 2, 'Edge': 2, 'IE': 2}
case_number = 33
standard_pics = []
open_root = "/home/site/data/"
output_root = open_root + "images/generated/"
db_name = "cross_browser"
table_name = "new_data"

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


def generatePictures(data, user_id):#get the string to send
    #3 type of browsers: chrome, firefox, and others
    if not os.path.exists(output_root + str(user_id)):
        os.makedirs(output_root + str(user_id))

    for image_id, browser in data:
        generateData(output_root + str(user_id) + '/', browser_to_id[browser], image_id)


def gen_hash_codes(data):
    hash_codes = {}
    for image_id, browser in data:
        hashes = []
        for i in range(case_number):
            img = Image.open(open_root + "images/origins/" + str(image_id) + '_' + str(i) + '.png')
            m = hasher1()
            n = hasher2()
            pixels = ''
            for r, g, b in img.getdata():
                pixels += '{}{}{}'.format(r, g, b)
            m.update(pixels)
            n.update(pixels)
            b64m = encode(m.digest()).replace('=', '')
            b64n = encode(n.digest()).replace('=', '')
            hashes.append(b64m + b64n)

        hash_codes.update({browser_to_id[browser]: hashes})
    return hash_codes

def generateStandard():
    open_img_dir = open_root + "images/origins/"

    for i in range(case_number):
        standard_pics.append(Image.open(open_img_dir + '0_' + str(i) + ".png"))


def equal(im1, im2):
    return ImageChops.difference(im1, im2).getbbox() is None

def getSubtract(user_id, caseNumber):
    #6 pictures
    #0 1 for chrome and firefox
    #2 3 for chrome and others
    #4 5 for firefox and others
    if not os.path.exists(output_root + 'tmp/'):
        os.makedirs(output_root + 'tmp/')

    img1 = Image.open(output_root + str(user_id) + '/' + '0_' + caseNumber + '_2.png')
    img2 = Image.open(output_root + str(user_id) + '/' + '0_' + caseNumber + '_3.png')
    img3 = Image.open(output_root + str(user_id) + '/' + '1_' + caseNumber + '_2.png')
    img4 = Image.open(output_root + str(user_id) + '/' + '1_' + caseNumber + '_3.png')
    img5 = Image.open(output_root + str(user_id) + '/' + '2_' + caseNumber + '_2.png')
    img6 = Image.open(output_root + str(user_id) + '/' + '2_' + caseNumber + '_3.png')

    img7 = Image.open(output_root + str(user_id) + '/' + '0_' + caseNumber + '_0.png')
    img8 = Image.open(output_root + str(user_id) + '/' + '1_' + caseNumber + '_0.png')
    img9 = Image.open(output_root + str(user_id) + '/' + '2_' + caseNumber + '_0.png')

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
        generateStandard()
        db = MySQLdb.connect("localhost", "erik", "erik", db_name)
        cursor = db.cursor()
        cursor.execute("SELECT DISTINCT(user_id) FROM {}".format(table_name))
        send = cursor.fetchall()
        db.close()

    elif post_data[0] == 'S':
        tmp = post_data.split(',')
        getSubtract(tmp[1], tmp[2])

    else:
        user_id = int(post_data)
        db = MySQLdb.connect("localhost", "erik", "erik", db_name)
        cursor = db.cursor()
        cursor.execute("SELECT image_id, browser FROM {} WHERE user_id='{}'".format(table_name, user_id))
        data = cursor.fetchall()
        db.close()
        generatePictures(data, user_id)
        send = gen_hash_codes(data)

    send_string = json.dumps(send)
    return send_string
