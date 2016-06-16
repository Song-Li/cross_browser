import BaseHTTPServer
import sys
from mod_python import apache, Session, util
import os.path
import datetime
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import urllib
import json
from PIL import Image, ImageChops, ImageFilter
import linecache
import MySQLdb
from random import randint, seed
from base64 import urlsafe_b64decode as decode

global inited
inited = 0
global root
root = '/home/site/data/'

def saveImg(b64raw, name):
    global root
    img_root = root + 'images/origins/'
    img = Image.new('RGBA', (256,256))
    pixel_map = img.load()
    img_data = rawToIntArray(decode(b64raw))
#    img_data = pixel

    curr = 0
    for i in range(256):
        for j in range(256):
            pixel_map[i,j] = (img_data[curr], img_data[curr + 1], img_data[curr + 2], img_data[curr + 3])
            curr += 4
    img = img.rotate(270)
    img.save(img_root + name + '.png')

def gen_UID(cursor, table_name, MAX_UID):
    cursor.execute("SELECT COUNT(*) FROM {}".format(table_name))
    if not cursor.fetchone()[0]:
        return 0
    # Number of times the method will try to generate a UID before it fails
    seed()
    max_tries = 100000
    for i in range(0, max_tries):
        uid = randint(0, MAX_UID)
        cursor.execute("SELECT COUNT(*) FROM {} WHERE id={}".format(table_name, uid))
        # If there are 0 IDs in the table with id=UID, we have found a unique ID
        if not cursor.fetchone()[0]:
            return uid
    raise RuntimeError("Ran out of UIDs!")

def insert_into_db(db, table_name, data):
    MAX_UID = int(1e9)
    cursor = db.cursor()
    uid = gen_UID(cursor, table_name, MAX_UID)
    try:
        cursor.execute("INSERT INTO {} (id, str) VALUES ({},{})".format(table_name, uid, data))
        db.commit()
        return uid
    except:
        db.rollback()
        # If something went wrong with the insert, it was probably
        # the super unlikely race of two threads with the same UID,
        # so the insert can be tried again
        return insert_into_db(db, table_name, data)

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
    global inited
    global root
    sub_number = 0
    post_data = str(req.form.list)
    json_data = post_data[8:-7]
    one_test = json.loads(json_data)
    ip = req.connection.remote_ip

    agent = req.headers_in[ 'User-Agent' ]
    agent = agent.replace(',', ' ')

    data = "{},{},{},{},{},{}".format(ip, one_test['WebGL'], one_test['inc'], one_test['gpu'], datetime.datetime.now(), agent)

    db_name = "cross_browser"
    table_name = "data"
    db = MySQLdb.connect("localhost", "erik", "erik", db_name)
    uid = insert_into_db(db, table_name, data)
    db.close()

    pixels = one_test['pixels'].split(" ")
    for pi in pixels:
        saveImg(padb64(pi), "{}_{}".format(uid, sub_number))
        sub_number += 1

    return "success"

system.subprocess(['sudo', '/etc/init.d/apache2', 'restart'])
