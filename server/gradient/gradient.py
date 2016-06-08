import sys
from mod_python import apache, Session, util
import os.path
import datetime
import SocketServer
import urllib
import json
from PIL import Image, ImageChops, ImageFilter
from base64 import urlsafe_b64decode as decode

global root
root = '/home/site/data/images/gradient/'

def saveImg(b64raw, name, path):
    global root
    img = Image.new('RGBA', (256,256))
    pixel_map = img.load()
    img_data = rawToIntArray(decode(b64raw))
    curr = 0
    for i in range(256):
        for j in range(256):
            pixel_map[i,j] = (img_data[curr], img_data[curr + 1], img_data[curr + 2], img_data[curr + 3])
            curr += 4
    img.save(path + name)

def rawToIntArray(raw):
    raw = list(raw)
    ints = []
    for r in raw:
        ints.append(ord(r))
    return ints

# Adds back in the amount of padding that was taken off the
# b64 string as AJAX doesn't support sending the padding
def padb64(b64):
    return "{}===".format(b64)[0:len(b64) + (len(b64) % 4)]

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
        saveImg(padb64(pi), str(one_test['pic_id']) + '.png', path)

    return "success"
