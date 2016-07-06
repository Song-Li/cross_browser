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

browser_to_id = {'chrome': 0, 'firefox': 1, 'others': 2}
case_number = 34
standard_pics = []
open_root = "/home/site/data/"
output_root = open_root + "images/generated/"
db_name = "cross_browser"
table_name = "in_use"

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

def gen_hash_codes(image_id):
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
    return hashes

def gen_hash_db(cursor):
    cursor.execute("SELECT image_id FROM {}".format(table_name))
    rows = cursor.fetchall()
    for j in range(len(rows)):
        print str(j) + '/' + str(len(rows))
        row = rows[j]
        hash_codes = gen_hash_codes(row[0])
        for i in range(case_number):
            cursor.execute("INSERT INTO {} (image_id, hash) VALUES ('{}', '{}')".format('hashes', str(row[0]) + '_' + str(i), hash_codes[i]))
    db.commit()
    return 0

def updateBrowser(uids, cursor):
    for uid in uids:
        cursor.execute("SELECT image_id, agent, vendor FROM {} WHERE user_id='{}'".format(table_name, uid))
        rows = cursor.fetchall()
        for row in rows:
            print row
            browser = getBrowser(row[2], row[1])
            cursor.execute("UPDATE {} SET browser='{}' WHERE image_id='{}'".format(table_name, browser, row[0]))


def getRes(b1, b2, cursor):
    tuids = []
    uids = []
    cursor.execute("SELECT COUNT(DISTINCT(ip)) FROM {}".format(table_name))
    print cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT(user_id)) FROM {}".format(table_name))
    print cursor.fetchone()[0]
    
    cursor.execute("SELECT user_id FROM {} WHERE browser='{}'".format(table_name, b1))
    for row in cursor:
        tuids.append(row[0])

    print len(tuids)

    for uid in tuids:
        cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}'".format(table_name, uid, b2))
        rows = cursor.fetchall()
        for row in rows:
            if row[0] in uids:
                print row[0]
            uids.append(row[0])

    print 'uid number', len(uids)

    #uids is the list of users uses both b1 and b2
    hash_all = []
    hash_long = []
    hash_long_unique = []
    hash_all_unique = []
    index = []
    for i in range(case_number):
        hash_all.append([])
        hash_all_unique.append([])


    for uid in uids:
        cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
        image1_id = cursor.fetchone()[0]
        cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
        image2_id = cursor.fetchone()[0]

        s1 = ""
        s2 = ""

        for i in range(case_number):
            cursor.execute("SELECT hash FROM {} WHERE image_id='{}'".format('hashes', str(image1_id) + '_' + str(i)))
            hash1_val = cursor.fetchone()[0]
            if i <= 23:
                s1 += hash1_val

            cursor.execute("SELECT hash FROM {} WHERE image_id='{}'".format('hashes', str(image2_id) + '_' + str(i)))
            hash2_val = cursor.fetchone()[0]
            if i <= 23:
                s2 += hash2_val

            #if hash1_val == hash2_val and (hash1_val not in hash_all[i]):
            if hash1_val == hash2_val:
                hash_all[i].append(hash1_val)
                if hash1_val not in hash_all_unique[i]:
                    hash_all_unique[i].append(hash1_val)


        if s1 == s2:
            if s1 not in hash_long_unique:
                hash_long_unique.append(s1)
            #else:
            #    print 'found: ' + str(uid) + '%' + str(uids[hash_long.index(s1)])
            hash_long.append(s1)
            index.append(uid)
    
    res = 0
    print 'hash_long:' + str(float(len(hash_long)) / len(uids))

    for i in range(len(hash_long)):
    #    print hash_long.count(row)
        if hash_long.count(hash_long[i]) == 1:
            print index[i]
            res += 1
    print 'res: ' + str(float(res) / len(hash_long_unique))
    print res,len(hash_long_unique)

    return 0
    
    for i in range(case_number):
        res = 0
        for row in hash_all[i]:
            if hash_all[i].count(row) == 1:
                res += 1
        print str(i) + ' ' + str(res) + '%' + str(len(hash_all_unique[i]))


def index():
    db = MySQLdb.connect("localhost", "erik", "erik", db_name)
    cursor = db.cursor()

    cursor.execute("SELECT DISTINCT(user_id) FROM {}".format(table_name))
    uids = []
    for row in cursor:
        uids.append(row[0])

    #updateBrowser(uids, cursor)
    getRes('Chrome', 'Firefox', cursor)

    db.commit()
    db.close()

index()
