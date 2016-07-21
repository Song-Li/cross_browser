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

def index(req):
    global inited
    global root
    db_name = "cross_browser_cn"
    post_data = str(req.form.list)
    json_data = post_data[8:-7]
    one_test = json.loads(json_data)
    ip = req.connection.remote_ip
    db = MySQLdb.connect("localhost", "erik", "erik", db_name)
    cursor = db.cursor()
    cursor.execute("SELECT score FROM {} WHERE ip='{}'".format('survey', ip))
    score = cursor.fetchone()


    if score is not None:
        db.close()
        return score[0]
    else:
        if one_test['browser'] == '-1':
            return '-1'

        cursor.execute("INSERT INTO {} (ip, score, browser) VALUES ('{}', '{}', '{}')".format('survey', ip, one_test['score'], int(one_test['browser'][-1]) + 1))
        db.commit()
        cursor.close()
        db.close()
        return '-1'
