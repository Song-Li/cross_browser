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
import math
from fingerprint import Fingerprint, Fingerprint_Type

browser_to_id = {'chrome': 0, 'firefox': 1, 'others': 2}
standard_pics = []
open_root = "/home/site/data/"
output_root = open_root + "images/generated/"
db_name = "cross_browser"
table_name = "round_2_data"

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
        browser = 'Other'
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
    cursor.execute("SELECT image_id FROM {} where hashes IS NULL".format(table_name))
    for image_id, in cursor.fetchall():
        print image_id
        hash_codes = gen_hash_codes(image_id)
        cursor.execute("UPDATE {} SET hashes='{}' WHERE image_id='{}'".format(table_name, "&".join(hash_codes), image_id))

    db.commit()
    cursor.close()

def update_langs(db):
    cursor = db.cursor()
    cursor.execute("SELECT image_id FROM {} where langs IS NULL".format(table_name))

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


def get_gpu_entropy(cursor):
    cursor.execute("SELECT hashes from {}".format(table_name))
    image_to_hashes = {}
    for h, in cursor.fetchall():
        for i, e in enumerate(h.split("&")):
            if i not in image_to_hashes:
                image_to_hashes.update({i : [e]})
            else:
                image_to_hashes[i].append(e)

    table = []
    for num, hashes in image_to_hashes.items():
        count_per_hash = {}
        for h in hashes:
            if h not in count_per_hash:
                count_per_hash.update({h : 1})
            else:
                count_per_hash[h] += 1

        entropy = 0
        for _, count in count_per_hash.items():
            P = float(count)/float(len(hashes))
            entropy -= P * math.log(P, 2)

        entropy /= math.log(len(hashes), 2)
        table.append(["GPU Image {}".format(num), entropy])

    return table

def get_lang_entropy(cursor):
    cursor.execute("SELECT langs from {}".format(table_name))
    lang_to_boxes = {}
    for langs, in cursor.fetchall():
        for i, e in enumerate(list(langs)):
            if i not in lang_to_boxes:
                lang_to_boxes.update({i : [e]})
            else:
                lang_to_boxes[i].append(e)

    table = []
    for num, boxes in lang_to_boxes.items():
        count_per_hash = {}
        for h in boxes:
            if h not in count_per_hash:
                count_per_hash.update({h : 1})
            else:
                count_per_hash[h] += 1

        entropy = 0
        for _, count in count_per_hash.items():
            P = float(count)/float(len(boxes))
            entropy -= P * math.log(P, 2)

        entropy /= math.log(len(boxes), 2)
        table.append(["lang {}".format(num), entropy])
    return table

def get_feature_entropy(cursor, feature):
    cursor.execute("SELECT {} from {}".format(feature, table_name))
    data = cursor.fetchall()
    val_to_count = {}
    for val in data:
        if val not in val_to_count:
            val_to_count.update({val : 1})
        else:
            val_to_count[val] += 1

    table = []

    entropy = 0
    for _, count in val_to_count.items():
        P = float(count)/float(len(data))
        entropy -= P * math.log(P, 2)

    entropy /= math.log(len(data), 2)
    table.append([feature, entropy])
    return table

mask = None
def getRes(b1, b2, cursor, quiet, attrs="hashes, langs", extra_selector="", fp_type=Fingerprint_Type.CROSS):
    if not quiet:
        print 'extra_selector="{}"'.format(extra_selector)
    global mask
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

        fp_1 = Fingerprint(cursor, image1_id, table_name, fp_type, attrs.replace(" ", "").split(","))
        fp_2 = Fingerprint(cursor, image2_id, table_name, fp_type, attrs.replace(" ", "").split(","))

        cursor.execute("SELECT fonts FROM {} WHERE image_id='{}'".format(table_name, image1_id))
        hashes_1 = list(cursor.fetchone()[0])

        if mask is None:
            mask = [1 for _ in range(len(hashes_1))]

        cursor.execute("SELECT fonts FROM {} WHERE image_id='{}'".format(table_name, image2_id))
        hashes_2 = list(cursor.fetchone()[0])

        s1 = ""
        s2 = ""

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

        if fp_1 == fp_2:
            hash_long_unique.add(fp_1)
            #else:
            #    print 'found: ' + str(uid) + '%' + str(uids[hash_long.index(s1)])
            hash_long.append(fp_1)
            index.append(uid)
        elif not quiet:
            print fp_1
            print fp_2
            return
        #else:
        #    print 'not same: ' + str(uid)

    for key, val in diff.items():
        if val > 0.0:
            mask[key] = 0
    #for i in range(case_number):
    #    print i, diff[i]
    if not quiet:
        # for i, d in diff.items():
        #     print "{}: {}".format(i, d)
        # for u, s in uid_stability.items():
        #     print "{}: {}".format(u, s)

        print 'Cross_browser', len(hash_long)
        print 'Cross_browser rate', float(len(hash_long)) / len(uids)



        print mask

    res = 0
    for i, hash_code in enumerate(hash_long):
    #    print hash_long.count(row)
        if hash_long.count(hash_code) == 1:
            res += 1

    if not quiet:
        print 'Cross_browser unique', float(res) / max(len(hash_long_unique), 1)
        print res,len(hash_long_unique)

    return len(uids), "{:3.1f}%".format(len(hash_long) / float(len(uids))*100), "{:3.1f}%".format(float(res) / max(len(hash_long_unique), 1)*100)

    for i, hashes in enumerate(hash_all):
        res = 0
        for row in hashes:
            if hashes.count(row) == 1:
                res += 1
        print str(i) + ' ' + str(res) + '%' + str(len(hash_all_unique[i]))

def print_table(table):
    for row in table:
        row_format = "{:<15}" * (len(row))
        print row_format.format(*row)

def latex_table(table):
    for i, row in enumerate(table):
        if i is 0:
            header = "\\begin{tabular}{|l||"
            for _ in range(len(row)):
                header += "l|"
            header += "}\hline"
            print header
            print " & ".join(row), "\\\\ \hline \hline"
        else:
            print " & " * (len(row) - 1), "\\\\[-7pt]"
            print " & ".join(row).replace('%', '\%'), "\\\\ \hline"

    print "\\end{tabular}"
    print "\\vspace{0.05in}"

def print_diff(new, base, browsers):
    table = []
    table.append(["Browsers"] + browsers)
    for b1 in browsers:
        disp = [b1]
        for b2 in browsers:
            try:
                b = base[(b1, b2)]
                n = new[(b1, b2)]
                out = ""
                for i, e in enumerate(n) :
                    if e == b[i]:
                        out += "{} ".format(e)
                    else:
                        out += "\\textbf{" + str(e) + "} "

                disp.append(out)
            except:
                disp.append("")

        table.append(disp)

    latex_table(table)
    print "\\hfill \\textbf{bold} denotes values that have changed in comparison with the previous table"

def summarize_res(result_table):
    ave_cb, ave_u, sum_weights = 0.0, 0.0, 0.0
    for _, val in result_table.items():
        try:
            count, cb, u = val
            sum_weights += count
            ave_cb += count*float(cb.replace("%", ""))
            ave_u += count*float(u.replace("%", ""))
        except:
            pass

    return ave_cb/sum_weights, ave_u/sum_weights

def latex_summarize(result_table):
    cb, u = summarize_res(result_table)
    print "Average cross browser: ${:3.2f}\%$".format(cb)
    print "Average unique: ${:3.2f}\%$".format(u)
    tu = float(cb)*float(u)/100.0
    print "Average unique total: ${:3.2f}\% = {:3.2f}\%*{:3.2f}\%$".format(tu, cb, u)

def index():
    LaTex = True
    db = MySQLdb.connect("localhost", "erik", "erik", db_name)
    cursor = db.cursor()

    # update_table(db)
    # update_browser(db)
    # update_hashes(db)
    # update_langs(db)
    # return


    # table = get_gpu_entropy(cursor)
    # table += get_lang_entropy(cursor)
    # for feat in "agent, plugins, fontlist, timezone, resolution, cookie, hashes, langs".split(","):
    #     table += get_feature_entropy(cursor, feat.replace(" ", ""))
    # table += get_feature_entropy(cursor, "timezone, resolution, fontlist, adBlock, plugins, agent, headerKeys, cookie, accept, encoding, language, hashes, langs")
    # print_table(table)
    # return


    cursor.execute('SELECT DISTINCT(browser) from {}'.format(table_name))
    browsers = [b for b, in cursor.fetchall()]

    if False:
        getRes("Chrome", "Chrome", cursor, False, "hashes", fp_type=Fingerprint_Type.SINGLE)
    elif True:
        result_table = {}
        if True:
            for b1 in browsers:
                for b2 in browsers:
                    if b1 is b2:
                        continue
                    result_table.update({(b1, b2): getRes(b1, b2, cursor, True, "hashes, langs, timezone, resolution, fonts", fp_type=Fingerprint_Type.SINGLE)})
        else:
            for b in browsers:
                result_table.update({(b, b): getRes(b, b, cursor, True, "hashes", fp_type=Fingerprint_Type.SINGLE)})


        print summarize_res(result_table)
        table = []
        table.append(["Browser"] + browsers)
        for b1 in browsers:
            disp = [b1]
            for b2 in browsers:
                try:
                    res = result_table[(b1, b2)]
                    disp.append(("{} " * len(res)).format(*res))
                except:
                    disp.append("")

            table.append(disp)

        print_table(table)


        if LaTex:
            latex_table(table)
            latex_summarize(result_table)
    else:
        b = {}
        n = {}
        for b1 in browsers:
            for b2 in browsers:
                b.update({(b1, b1): getRes(b1, b1, cursor, True, "timezone, resolution, fontlist, adBlock, plugins, agent, headerKeys, cookie, accept, encoding, language")})
                n.update({(b1, b1): getRes(b1, b1, cursor, True, "timezone, resolution, fontlist, adBlock, plugins, agent, headerKeys, cookie, accept, encoding, language")})
                break

        print_diff(n, b, browsers)

    db.commit()
    db.close()

index()
