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
case_number = 7
standard_pics = []
ip2line = {}
output_root = "/home/sol315/data/images/generated/"
open_root = "/home/sol315/data/"

def generateLineNumber():
    global db_name
    global table_name
    db = MySQLdb.connect("localhost", "erik", "erik", db_name)
    cursor = db.cursor()
    cursor.execute("SELECT id, str FROM {}".format(table_name))
    data = cursor.fetchall()
    db.close()
    print data

generateLineNumber()
