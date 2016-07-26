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
from random import randint
from base64 import urlsafe_b64decode as decode, urlsafe_b64encode as encode
from hashlib import md5 as hasher

global inited
inited = 0

global root
root = '/home/site/data/'

def saveImg(toSave, name):
    global root
    img_root = root + 'images/origins/'
    if not os.path.exists(img_root):
        os.makedirs(img_root)
    cols = toSave['w']
    rows = toSave['h']
    img = Image.new('RGB', (cols, rows))
    pixel_map = img.load()
    img_data = rawToIntArray(decode(padb64(toSave['pixels'])))

    curr = 0
    for j in range(rows):
        for i in range(cols):
            pixel_map[i, j] = (img_data[curr], img_data[curr + 1], img_data[curr + 2])
            curr += 3

    img.save(img_root + name + '.png')

def gen_image_id(cursor, table_name, MAX_ID):
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

def getBrowser(vendor, agent):
    browser = ''
    if agent.find('Vivaldi') != -1:
        browser = 'Vivaldi'
    elif agent.find('Maxthon') != -1:
        browser = 'IE'
    elif agent.find('ASW') != -1:
        browser = 'ASW'
    elif agent.find('Firefox') != -1:
        browser = 'Firefox'
    elif agent.find('Edge') != -1 or vendor.find('Microsoft') != -1:
        browser = 'Edge'
    elif agent.find('OPR') != -1:
        browser = 'OPR'
    elif agent.find('Chrome') != -1 or vendor.find('Google') != -1:
        browser = 'Chrome'
    else:
        browser = 'others'
    return browser


def insert_into_db(db, table_name, ip, one_test, time, agent, accept, encoding, language, keys, DNT):

    user_id = one_test['user_id']
    vendor = one_test['inc']
    browser = getBrowser(vendor, agent)
    gpu = one_test['gpu']
    fps = float(one_test['fps'])
    fonts = one_test['fonts']
    manufacturer = one_test['manufacturer']
    timezone = one_test['timezone']
    resolution = one_test['resolution']
    fontlist = one_test['fontlist']
    canvas_test = one_test['canvas_test']
    if isinstance(fontlist, list):
        fontlist = "_".join(fontlist)
    plgs = one_test['plugins']
    cookie = one_test['cookie']
    localStorage = one_test['localstorage']
    adBlock = one_test['adBlock']

    cursor = db.cursor()
    cursor.execute("SELECT image_id FROM {} WHERE user_id='{}' AND agent='{}'".format(table_name, user_id, agent))
    row = cursor.fetchone()
    if row is not None:
        image_id = row[0]
        sql = "UPDATE {} SET ip='{}', vendor='{}', gpu='{}', agent='{}', browser='{}', fps='{}', manufacturer='{}', timezone='{}', resolution='{}', fontlist='{}', accept='{}', encoding='{}', language='{}', headerkeys='{}', plugins='{}', cookie='{}', localstorage='{}', dnt='{}', adBlock='{}', fonts='{}', canvastest='{}' where image_id='{}'".format(table_name, ip, vendor, gpu, agent, browser, fps, manufacturer, timezone, resolution, fontlist, accept, encoding, language, keys, plgs, cookie, localStorage, DNT, adBlock, fonts, canvas_test, image_id)
        cursor.execute(sql)
        db.commit()
        return image_id


    MAX_ID = int(1e9)
    image_id = gen_image_id(cursor, table_name, MAX_ID)
    try:
        sql = "INSERT INTO {} (image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, timezone, resolution, fontlist, accept, encoding, language, headerkeys, plugins, cookie, localstorage, dnt, adBlock, fonts, canvastest) VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}')".format(table_name, image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, timezone, resolution, fontlist, accept, encoding, language, keys, plgs, cookie, localStorage, DNT, adBlock, fonts, canvas_test)

        cursor.execute(sql)
        db.commit()
        cursor.close()
        return image_id
    except:
        db.rollback()
        # If something went wrong with the insert, it was probably
        # the super unlikely race of two threads with the same UID,
        # so the insert can be tried again
        return (db, table_name, ip, one_test, time, agent, accept, encoding, language, keys, DNT)

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

def getEncrypt(code):
    mapping = ['D','E','F','B','G','M','N','A','I','L']
    res = ""
    for c in code:
        if c != '_':
            res += mapping[int(c)]
        else:
            res += 'O';
    return res


def index(req):
    global inited
    global root
    db_name = "cross_browser"
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
    accept = 'NULL'
    encodeing = 'NULL'
    language = 'NULL'
    try:
        accept = req.headers_in['Accept']
        encoding = req.headers_in['Accept-Encoding']
        language = req.headers_in['Accept-Language']
    except:
        pass

    DNT = 'NULL'
    try:
        DNT = req.headers_in['DNT']
    except:
        DNT = 'Not Defined'

    keys = "_".join(req.headers_in.keys())

    table_name = "new_data"
    time = str(datetime.datetime.now())
    image_id = insert_into_db(db, table_name, ip, one_test, time, agent, accept, encoding, language, keys, DNT)

    gpu_imgs = one_test['gpuImgs']
    for i, img in enumerate(gpu_imgs):
        saveImg(img, "{}_{}".format(image_id, i))

    for i, img in enumerate(one_test['langsDetected']):
        saveImg(img, "{}_{}_lang".format(image_id, i))

    h = hasher()
    string = ''
    for i in range(len(gpu_imgs) - 6):
        string += gpu_imgs[i]['pixels']
    h.update(string)
    hash_code = encode(h.digest()).replace('=', '')
    cursor.execute("UPDATE {} SET simple_hash='{}' WHERE image_id='{}'".format(table_name, hash_code, image_id))
    db.commit()

    cursor.execute("SELECT COUNT(*) FROM {} WHERE user_id='{}'".format(table_name, one_test['user_id']))
    row = cursor.fetchone()[0]
    db.close()
    if row == 3:
        return str(row) + ',' + getEncrypt(str(one_test['user_id']) + '_3')
    if row == 2:
        return str(row) + ',' + getEncrypt(str(one_test['user_id']))
    else:
        return str(row) + ',not finished'
