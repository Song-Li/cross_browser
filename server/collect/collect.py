import BaseHTTPServer
import sys
#from mod_python import apache, Session, util
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
    if not os.path.exists(img_root):
        os.makedirs(img_root)

    img = Image.new('RGB', (256,256))
    pixel_map = img.load()
    img_data = rawToIntArray(decode(b64raw))

    curr = 0
    for i in range(256):
        for j in range(256):
            pixel_map[i,j] = (img_data[curr], img_data[curr + 1], img_data[curr + 2])
            curr += 3
    img = img.rotate(90)
    img.save(img_root + name + '.png')

def gen_image_id(cursor, table_name, MAX_ID, agent):
    cursor.execute("SELECT COUNT(*) FROM {}".format(table_name))
    if not cursor.fetchone()[0]:
        return 0

    # Number of times the method will try to generate a UID before it fails
    max_tries = 100000
    for i in range(0, max_tries):
        image_id = randint(0, MAX_ID)
        cursor.execute("SELECT COUNT(*) FROM {} WHERE image_id='{}'".format(table_name, image_id))
        # If there are 0 IDs in the table with id=UID, we have found a unique ID
        if not cursor.fetchone()[0]:
            return image_id
    raise RuntimeError("Ran out of UIDs!")

def insert_into_db(db, table_name, ip, one_test, time, agent):
    user_id = one_test['user_id']
    cursor = db.cursor()
    cursor.execute("SELECT image_id FROM {} WHERE user_id='{}' AND agent='{}'".format(table_name, user_id, agent))
    row = cursor.fetchone()
    if row is not None:
        return row[0]

    vendor = one_test['inc']
    browser = ''
    if(agent.find('Firefox') != -1):
      browser = 'firefox'
    elif(agent.find('Edge') != -1 or vendor.find('Microsoft') != -1):
      browser = 'others'
    elif(agent.find('OPR') != -1):
      browser = 'others'
    elif(agent.find('Chrome') != -1 or vendor.find('Google') != -1):
      browser = 'chrome'
    else:
      browser = 'others'

    gpu = one_test['gpu']
    fps = float(one_test['fps'])
    manufacturer = one_test['manufacturer']

    MAX_ID = int(1e9)
    image_id = gen_image_id(cursor, table_name, MAX_ID, agent)
    try:
        sql = "INSERT INTO {} (image_id, user_id, ip, vendor, gpu, time, agent, browser, fps, manufacturer) VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}')".format(table_name, image_id, user_id, ip, vendor, gpu, time.split('.')[0], agent, browser, fps, manufacturer)
        cursor.execute(sql)
        db.commit()
        cursor.close()
        return image_id
    except:
        db.rollback()
        # If something went wrong with the insert, it was probably
        # the super unlikely race of two threads with the same UID,
        # so the insert can be tried again
        return insert_into_db(db, table_name, ip, one_test, time, agent)

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
    db_name = "cross_browser"
    sub_number = 0
    post_data = str(req.form.list)
    json_data = post_data[8:-7]
    one_test = json.loads(json_data)
    ip = req.connection.remote_ip
    db = MySQLdb.connect("localhost", "erik", "erik", db_name)
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) FROM {} WHERE id='{}'".format('uid', one_test['user_id']))
    if not cursor.fetchone()[0]:
        return "user_id error"

    agent = req.headers_in[ 'User-Agent' ]
    agent = agent.replace(',', ' ')

    table_name = "new_data"
    time = str(datetime.datetime.now())
    image_id = insert_into_db(db, table_name, ip, one_test, time, agent)


    pixels = one_test['pixels'].split(" ")
    for pi in pixels:
        saveImg(padb64(pi), "{}_{}".format(image_id, sub_number))
        sub_number += 1


    cursor.execute("SELECT COUNT(*) FROM {} WHERE user_id='{}'".format(table_name, one_test['user_id']))
    row = cursor.fetchone()[0]
    db.close()
    if row >= 3:
        return str(row) + ',8293847'
    else:
        return str(row) + ',not finished'
