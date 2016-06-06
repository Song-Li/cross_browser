import sys
from mod_python import apache, Session, util
import os.path
import datetime
import SocketServer
import urllib
import json
from PIL import Image, ImageChops, ImageFilter

global root
root = '/home/site/data/images/gradient/'

def saveImg(pixel, name, path):
    global root
    img = Image.new('RGBA', (256,256))
    pixel_map = img.load()
    img_data = json.loads(pixel)
    curr = 0
    for i in range(256):
        for j in range(256):
            pixel_map[i,j] = (img_data[curr], img_data[curr + 1], img_data[curr + 2], img_data[curr + 3])
            curr += 4
    img.save(path + name)

def index(req):
    global root
    post_data = str(req.form.list)
    one_test = json.loads(post_data[8:-7])
    ip = req.connection.remote_ip
    path = root + "origin/" + str(ip) + '/'
    
    if not os.path.exists(path):
        os.makedirs(path)
    
    pixels = one_test['pixels'].split(' ')
    for pi in pixels:
        saveImg(pi, str(one_test['pic_id']) + '.png', path)

    return "success"
