#!/usr/bin/env python

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
from langs.analyze_langs import LangAnalyzer
from glob import glob
from sets import Set

browser_to_id = {'chrome': 0, 'firefox': 1, 'others': 2}
standard_pics = []
open_root = "/home/site/data/"
output_root = open_root + "images/generated/"
db_name = "cross_browser"
table_name = "round_2_data"
extra_selector = "and agent like '%NT%' and gpu!='SwiftShader'"

def update_table(db):
    cursor = db.cursor()
    cursor.execute("SELECT image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock FROM new_data")
    for image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock in cursor.fetchall():
        cursor.execute("SELECT COUNT(*) FROM {} where image_id='{}'".format(table_name, image_id))
        if not cursor.fetchone()[0]:
            cursor.execute("INSERT INTO {} (image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock) VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}')".format(table_name, image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock))
    db.commit()
    cursor.close()

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
    elif agent.find('Safari') != -1:
        browser = 'Safari'
    else:
        browser = 'others'
    return browser

def gen_hash_codes(image_id):
    hashes = []
    files = glob("{}images/origins/{}_*.png".format(open_root, image_id))
    files = [f for f in files if f.find("lang") == -1]
    files = sorted(files, key=lambda f: int(f.split("_")[1].split(".")[0]))

    for file in files:
        img = Image.open(file)
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

def update_hashes(db):
    cursor = db.cursor()
    cursor.execute("SELECT image_id FROM {}".format(table_name))
    for image_id, in cursor.fetchall():
        print image_id
        hash_codes = gen_hash_codes(image_id)
        cursor.execute("UPDATE {} SET hashes='{}' WHERE image_id='{}'".format(table_name, "&".join(hash_codes), image_id))

    db.commit()
    cursor.close()

def update_langs(db):
    cursor = db.cursor()
    cursor.execute("SELECT image_id FROM {}".format(table_name))

    for image_id, in cursor.fetchall():
        langs = LangAnalyzer("{}images/origins/".format(open_root), image_id).analyze()
        cursor.execute("UPDATE {} SET langs='{}' WHERE image_id='{}'".format(table_name, "".join(str(x) for x in langs), image_id))

    db.commit()
    cursor.close()

def update_browser(db):
    cursor = db.cursor()
    cursor.execute("SELECT DISTINCT(user_id) FROM {}".format(table_name))
    for uid, in cursor.fetchall():
        cursor.execute("SELECT image_id, agent, vendor FROM {} WHERE user_id='{}'".format(table_name, uid))
        for image_id, agent, vendor in cursor.fetchall():
            browser = getBrowser(vendor, agent)
            cursor.execute("UPDATE {} SET browser='{}' WHERE image_id='{}'".format(table_name, browser, image_id))
    db.commit()
    cursor.close()


def getRes(b1, b2, cursor, quiet):
    tuids = []
    uids = []
    cursor.execute("SELECT COUNT(DISTINCT(ip)) FROM {}".format(table_name))
    if not quiet:
        print 'ip', cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT(user_id)) FROM {}".format(table_name))
    if not quiet:
        print 'user', cursor.fetchone()[0]

    #cursor.execute("SELECT user_id FROM {} WHERE browser='{}'".format(table_name, b1))
    cursor.execute("SELECT user_id FROM {} WHERE browser='{}' {}".format(table_name, b1, extra_selector))
    for uid, in cursor.fetchall():
        tuids.append(uid)

    if not quiet:
        print b1, len(tuids)

    for uid in tuids:
        #cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}'".format(table_name, uid, b2))
        cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}' {}".format(table_name, uid, b2, extra_selector))
        for uid, in cursor.fetchall():
            uids.append(uid)

    if not quiet:
        print b1, 'and', b2 , len(uids)

    if len(uids) is 0:
        return None

    #uids is the list of users uses both b1 and b2
    hash_all = {}
    hash_long = []
    hash_long_unique = Set()
    hash_all_unique = {}
    stability = {}
    diff = {}
    index = []
    uid_stability = {}

    for uid in uids:
        #cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
        cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
        image1_id = cursor.fetchone()[0]
        #cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
        cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
        image2_id = cursor.fetchone()[0]

        s1 = ""
        s2 = ""
        cursor.execute("SELECT hashes FROM {} WHERE image_id='{}'".format(table_name, image1_id))
        hashes_1 = cursor.fetchone()[0].split("&")

        cursor.execute("SELECT hashes FROM {} WHERE image_id='{}'".format(table_name, image2_id))
        hashes_2 = cursor.fetchone()[0].split("&")


        cursor.execute("SELECT langs FROM {} WHERE image_id='{}'".format(table_name, image1_id))
        langs_1 = [x for i, x in enumerate(list(cursor.fetchone()[0])) if i <= 28 or i == 33 or i == 34]
        langs_1 = "".join(langs_1)

        cursor.execute("SELECT langs FROM {} WHERE image_id='{}'".format(table_name, image2_id))
        langs_2 = [x for i, x in enumerate(list(cursor.fetchone()[0])) if i <= 28 or i == 33 or i == 34]
        langs_2 = "".join(langs_2)

        s1 += langs_1
        s2 += langs_2


        extras = "timezone, resolution"
        # extras = ""
        if extras != "":

            cursor.execute("SELECT {} FROM {} WHERE image_id='{}'".format(extras, table_name, image1_id))
            extras_1 = cursor.fetchone()

            cursor.execute("SELECT {} FROM {} WHERE image_id='{}'".format(extras, table_name, image2_id))
            extras_2 = cursor.fetchone()

            s1 += ("{}" * len(extras_1)).format(*extras_1)
            s2 += ("{}" * len(extras_2)).format(*extras_2)

        uid_stability.update({uid: []})
        for i in range(len(hashes_1)):

            if i not in hash_all:
                hash_all.update({i: []})
            if i not in hash_all_unique:
                hash_all_unique.update({i: []})
            if i not in diff:
                diff.update({i: 0.0})

            hash1_val = hashes_1[i]
            hash2_val = hashes_2[i]

            if i <= 2 and i != 23 and i != 24 and i != 19:
                s1 += hash1_val
                s2 += hash2_val

            #if hash1_val == hash2_val and (hash1_val not in hash_all[i]):
            if hash1_val == hash2_val:
                hash_all[i].append(hash1_val)
                if hash1_val not in hash_all_unique[i]:
                    hash_all_unique[i].append(hash1_val)
            else:
                diff[i] += 1.0/len(uids)
                uid_stability[uid].append(i)

        if s1 == s2:
            hash_long_unique.add(s1)
            #else:
            #    print 'found: ' + str(uid) + '%' + str(uids[hash_long.index(s1)])
            hash_long.append(s1)
            index.append(uid)
        #else:
        #    print 'not same: ' + str(uid)

    #for i in range(case_number):
    #    print i, diff[i]
    if not quiet:
        for i, d in diff.items():
            print "{}: {}".format(i, d)
        for u, s in uid_stability.items():
            print "{}: {}".format(u, s)

        print 'Cross_browser', len(hash_long)
        print 'Cross_browser rate', float(len(hash_long)) / len(uids)

    res = 0
    for i, hash_code in enumerate(hash_long):
    #    print hash_long.count(row)
        if hash_long.count(hash_code) == 1:
            res += 1

    if not quiet:
        print 'Cross_browser unique', float(res) / max(len(hash_long_unique), 1)
        print res,len(hash_long_unique)

    return len(uids), "{:3.0f}%".format(len(hash_long) / float(len(uids))*100), "{:3.0f}%".format(float(res) / max(len(hash_long_unique), 1)*100)

    for i, hashes in enumerate(hash_all):
        res = 0
        for row in hashes:
            if hashes.count(row) == 1:
                res += 1
        print str(i) + ' ' + str(res) + '%' + str(len(hash_all_unique[i]))


def index():
    print 'extra_selector="{}"'.format(extra_selector)
    db = MySQLdb.connect("localhost", "erik", "erik", db_name)
    cursor = db.cursor()

    # update_table(db)
    # update_browser(db)
    # update_hashes(db)
    # update_langs(db)
    # return

    if False:
        getRes("Edge", "Firefox", cursor, False)
    else:
        cursor.execute('SELECT DISTINCT(browser) from {}'.format(table_name))
        browsers = [b for b, in cursor.fetchall()]

        result_table = {}
        for b1 in browsers:
            for b2 in browsers:
                result_table.update({(b1, b2): getRes(b1, b2, cursor, True)})

        row_format = "{:<15}" * (len(browsers) + 1)
        print row_format.format("Browser", *browsers)
        for b1 in browsers:
            disp = []
            for b2 in browsers:
                try:
                    res = result_table[(b1, b2)]
                    disp.append(("{} " * len(res)).format(*res))
                except:
                    disp.append("")

            print row_format.format(b1, *disp)


    db.commit()
    db.close()

index()
