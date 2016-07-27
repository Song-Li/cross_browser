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
from enum import Enum

browser_to_id = {'chrome': 0, 'firefox': 1, 'others': 2}
standard_pics = []
open_root = "/home/site/data/"
output_root = open_root + "images/generated/"
db_name = "cross_browser"
table_name = "round_2_data"

class Feature_Lists(Enum):
    All="agent, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, headerkeys, dnt, adBlock,language, hashes, langs, fonts, gpu, vendor, lang_hash".replace(" ", "").split(",")
    Cross_Browser="langs, timezone, fonts".replace(" ", "").split(",")
    Single_Browser=All
    Amiunique="agent, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock".replace(" ", "").split(",")
    CB_Amiunique="accept, timezone, resolution, localstorage, cookie".replace(" ", "").split(",")

def update_table(db):
    cursor = db.cursor()
    cursor.execute("SELECT image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock FROM new_data")
    for image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock in cursor.fetchall():
        cursor.execute("SELECT COUNT(*) FROM {} where image_id='{}'".format(table_name, image_id))
        if not cursor.fetchone()[0]:
            cursor.execute("INSERT INTO {} (image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock) VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}')".format(table_name, image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock))
    db.commit()

    cursor.execute("SELECT distinct(ip) from {}".format(table_name))
    ips = [ip for ip, in cursor.fetchall()]
    for ip in ips:
        num = cursor.execute("SELECT distinct(user_id) from {} where ip='{}'".format(table_name, ip))
        if num > 1:
            uids = [uid for uid, in cursor.fetchall()]
            uid_to_keep = 0
            max_brow = 0
            for uid in uids:
               cursor.execute("SELECT COUNT(image_id)from {} where user_id='{}'".format(table_name, uid))
               num_brow = cursor.fetchone()[0]
               if num_brow > max_brow:
                    uid_to_keep = uid
                    max_brow = num_brow

            for uid in uids:
                if uid != uid_to_keep:
                    cursor.execute("DELETE from {} where user_id='{}'".format(table_name, uid))
    cursor.execute("DELETE from {} where ip like '128.180.%'".format(table_name))
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
    elif vendor.find('Microsoft') != -1:
        if agent.find('Edge') != -1:
            browser = 'Edge'
        else:
            browser = "IE"
    elif agent.find('OPR') != -1:
        browser = 'OPR'
    elif agent.find('Chrome') != -1 or vendor.find('Google') != -1:
        browser = 'Chrome'
    elif agent.find('Safari') != -1:
        browser = 'Safari'
    else:
        browser = 'Other'
    return browser

def get_rgb(file):
    img = Image.open(file)
    return "".join('{}{}{}'.format(r, g, b) for r, g, b in img.getdata())

def hash_pix(pixels):
    m = hasher1()
    n = hasher2()
    m.update(pixels)
    n.update(pixels)
    b64m = encode(m.digest()).replace('=', '')
    b64n = encode(n.digest()).replace('=', '')
    return "{}{}".format(b64m, b64n)

def hash_img(file):
    return hash_pix(get_rgb(file))

def gen_hash_codes(image_id):
    hashes = []
    files = glob("{}images/origins/{}_*.png".format(open_root, image_id))
    files = [f for f in files if f.find("lang") == -1]
    files = sorted(files, key=lambda f: int(f.split("_")[1].split(".")[0]))

    for file in files:
        hashes.append(hash_img(file))
    return hashes

def gen_lang_hash(image_id):
    hashes = []
    files = glob("{}images/origins/{}_*.png".format(open_root, image_id))
    files = [f for f in files if f.find("lang") != -1]
    files = sorted(files, key=lambda f: int(f.split("_")[1].split(".")[0]))

    pixels = "".join(get_rgb(file) for file in files)

    return hash_pix(pixels)

def update_hashes(db):
    cursor = db.cursor()
    cursor.execute("SELECT image_id FROM {} where hashes IS NULL or video is NULL".format(table_name))
    for image_id, in cursor.fetchall():
        print image_id
        hash_codes = gen_hash_codes(image_id)
        cursor.execute("UPDATE {} SET hashes='{}', video='{}' WHERE image_id='{}'".format(table_name, "&".join(hash_codes[:27]), "&".join(hash_codes[27:]), image_id))

    cursor.execute("SELECT image_id FROM {} where lang_hash IS NULL".format(table_name))
    for image_id, in cursor.fetchall():
        print image_id
        hash_code = gen_lang_hash(image_id)
        cursor.execute("UPDATE {} SET lang_hash='{}' WHERE image_id='{}'".format(table_name, hash_code, image_id))

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

def is_all_same(array):
    first = array[0]
    for e in array:
        if e != first:
            return False

    return True

def get_feature_res(cursor, feature, extra_selector=""):
    cursor.execute("SELECT DISTINCT(user_id) from {}".format(table_name))

    cb_total = 0.0
    num_vals = 0.0
    cb_count = 0.0
    fp_to_count_cross = {}
    fp_to_count_single = {}
    data = cursor.fetchall()

    for user_id, in data:
        cb_prints = []
        cursor.execute("SELECT image_id from {} where user_id='{}' {}".format(table_name, user_id, extra_selector))
        ids = [x for x, in cursor.fetchall()]
        for image_id in ids:
            cb_prints.append(Fingerprint(cursor, image_id, table_name, Fingerprint_Type.CROSS, feature))
            single_fp = Fingerprint(cursor, image_id, table_name, Fingerprint_Type.SINGLE, feature)
            if single_fp in fp_to_count_single:
                fp_to_count_single[single_fp] += 1
            else:
                fp_to_count_single.update(
                    {
                        single_fp: 1
                    }
                )

        if len(ids) > 1:
            cb_total += 1.0;
            if is_all_same(cb_prints):
                cb_count += 1.0
                fp = cb_prints[0]
                if fp in fp_to_count_cross:
                    fp_to_count_cross[fp] += 1
                else:
                    fp_to_count_cross.update(
                        {
                            fp: 1
                        }
                    )

    cb_distinct = float(len(fp_to_count_cross))
    cb_unique = 0.0
    for _, count in fp_to_count_cross.items():
        if count == 1:
            cb_unique += 1.0

    single_distinct = float(len(fp_to_count_single))
    single_unique = 0.0
    for _, count in fp_to_count_single.items():
        if count == 1:
            single_unique += 1.0
    cb_total = max(cb_total, 1.0)
    single_distinct = max(single_distinct, 1.0)
    cb_distinct = max(cb_distinct, 1.0)
    frmt = "{:3.1f}%"
    return frmt.format(single_unique/single_distinct*100), frmt.format(cb_count/cb_total*100), frmt.format(cb_unique/cb_distinct*100)


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
    fp_to_count = {}
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

        fp_1 = Fingerprint(cursor, image1_id, table_name, fp_type, attrs)
        fp_2 = Fingerprint(cursor, image2_id, table_name, fp_type, attrs)

        try:
            if quiet:
                _, opps = None
            cursor.execute("SELECT fonts FROM {} WHERE image_id='{}'".format(table_name, image1_id))

            hashes_1 = list(cursor.fetchone()[0])

            cursor.execute("SELECT fonts FROM {} WHERE image_id='{}'".format(table_name, image2_id))
            hashes_2 = list(cursor.fetchone()[0])

            if mask is None:
                mask = [1 for _ in range(len(hashes_1))]

            if len(hashes_1) == len(hashes_2):
                s1 = ""
                s2 = ""

                uid_stability.update({uid: []})
                for i in range(len(hashes_1)):

                    if i not in hash_all:
                        hash_all.update({i: []})
                    if i not in hash_all_unique:
                        hash_all_unique.update({i: Set()})
                    if i not in diff:
                        diff.update({i: 0.0})


                    hash1_val = hashes_1[i]
                    hash2_val = hashes_2[i]

                    s1 += hash1_val
                    s2 += hash2_val

                    #if hash1_val == hash2_val and (hash1_val not in hash_all[i]):
                    if hash1_val == hash2_val:
                        hash_all[i].append(hash1_val)
                        hash_all_unique[i].add(hash1_val)
                    else:
                        diff[i] += 1.0/len(uids)
                        uid_stability[uid].append([hash1_val, hash2_val])
        except:
            pass
        if fp_1 == fp_2:
            #else:
            #    print 'found: ' + str(uid) + '%' + str(uids[hash_long.index(s1)])
            hash_long.append(fp_1)
            index.append(uid)
            if fp_1 in fp_to_count:
                fp_to_count[fp_1] += 1
            else:
                fp_to_count.update(
                    {
                        fp_1: 1
                    }
                )

        #else:
        #    print 'not same: ' + str(uid)
    #for i in range(case_number):
    #    print i, diff[i]

    for i, d in diff.items():
        if d > 0.0:
            mask[i] = 0

    num_distinct = max(float(len(fp_to_count)), 1.0)
    num_unique = 0.0
    for _, count in fp_to_count.items():
        if count == 1:
            num_unique += 1.0
    num_cross_browser = float(len(hash_long))
    num_uids = max(float(len(uids)), 1.0)

    if not quiet:
        for i, d in diff.items():
            print "{}: instability: {}".format(
                i, d
            )
        for u, s in uid_stability.items():
            print "{}: {}".format(u, s)


        print 'Cross_browser', num_cross_browser
        print 'Cross_browser rate', num_cross_browser/num_uids


        print 'Cross_browser unique', num_unique/num_distinct
        print num_unique, num_distinct

    return int(num_uids), "{:3.1f}%".format(num_cross_browser/num_uids*100), "{:3.1f}%".format(num_unique/num_distinct*100)

def get_print_table(result_table, browsers):
    table = []
    table.append(["Browser"] + browsers)
    if len(result_table) == len(browsers):
        disp = [""]
        for b in browsers:
            try:
                _, _, u = result_table[(b, b)]
                disp.append("{}".format(u))
            except:
                disp.append("")

        table.append(disp)
    else:
        for b1 in browsers:
            disp = [b1]
            for b2 in browsers:
                try:
                    _, cb, u = result_table[(b1, b2)]
                    disp.append("{} {}".format(cb, u))
                except:
                    disp.append("")

            table.append(disp)

    return table

def print_table(table):
    row_size = 15
    for row in table:
        row_format = ("{:<15" + str(row_size) + "}") * (len(row))
        print row_format.format(*row)

def latex_table(table):
    for i, row in enumerate(table):
        if i is 0:
            header = "\\begin{tabular}{|l||"
            for _ in range(len(row)):
                header += "l|"
            header += "}\hline"
            print header
            info = ["Cell Format"]
            for _ in range(1, len(row)):
                if len(table) is 2:
                    info.append("Unique")
                else:
                    info.append("CB U")

            print " & ".join(row), "\\\\ \hline \hline"
            print " & " * (len(row) - 1), "\\\\[-7pt]"
            print " & ".join(info), "\\\\ \hline"

        else:
            print " & " * (len(row) - 1), "\\\\[-7pt]"
            print " & ".join(row).replace('%', '\%'), "\\\\ \hline"

    print "\\end{tabular}"
    print "\\vspace{0.05in}\n"

def format_comp(e, b):
    ef, bf = 0.0, 0.0
    if isinstance(e, str):
        ef = float(e.replace("%", ""))
    else:
        ef = float(e)

    if isinstance(b, str):
        bf = float(b.replace("%", ""))
    else:
        bf = float(b)

    if ef == bf:
        return str(e)
    elif ef < bf:
        return "{\\color{blue}" + str(e) + "$\\downarrow$}"
    else:
        return "{\\color{red}" + str(e) + "$\\uparrow$}"
def print_diff(new, base, browsers):
    table = []
    table.append(["Browsers"] + browsers)
    if len(new) == len(browsers):
        disp = [""]
        for b in browsers:
            try:
                _, _, nu = new[(b, b)]
                _, _, bu = base[(b, b)]

            except:
                disp.append("")
                continue
            disp.append(format_comp(nu, bu))
        table.append(disp)
    else:
        for b1 in browsers:
            disp = [b1]
            for b2 in browsers:
                try:
                    _, bcb, bu = base[(b1, b2)]
                    _, ncb, nu = new[(b1, b2)]
                    disp.append("{} {}".format(format_comp(ncb, bcb), format_comp(nu, bu)))
                except:
                    disp.append("")

            table.append(disp)

    latex_table(table)
    print "\n{\\color{red} red} denotes values that have increased\n"
    print "{\\color{blue} blue} denotes values that have decreased"

def summarize_res(result_table):
    ave_cb, ave_u, sum_weights = 0.0, 0.0, 0.0
    for _, val in result_table.items():
        try:
            count, cb, u = val
        except:
            continue

        sum_weights += float(count)
        ave_cb += float(count)*float(cb.replace("%", ""))
        ave_u += float(count)*float(u.replace("%", ""))

    return ave_cb/sum_weights, ave_u/sum_weights

def latex_summarize(result_table):
    cb, u = summarize_res(result_table)
    print "\nAverage cross browser: ${:3.2f}\%$\n".format(cb)
    print "Average unique: ${:3.2f}\%$\n".format(u)
    ident = cb*u/100.0
    print "Average cross-browser unique: ${:3.2f}\% = {:3.2f}\%*{:3.2f}\%$\n".format(ident, cb, u)

def get_res_table(cursor, browsers, feat_list, cross_browser=True, extra_selector=""):
    result_table = {}
    if cross_browser:
        for i in range(len(browsers)):
            for j in range(i + 1, len(browsers)):
                b1, b2 = browsers[i], browsers[j]
                result_table.update(
                    {
                        (b1, b2): getRes(b1, b2, cursor, True, feat_list, fp_type=Fingerprint_Type.CROSS, extra_selector=extra_selector)
                    }
                )
        for i in range(len(browsers)):
            for j in range(0, i):
                b1, b2 = browsers[i], browsers[j]
                result_table.update(
                    {
                        (b1, b2): result_table[(b2, b1)]
                    }
                )
    else:
        for b in browsers:
            result_table.update(
                {
                    (b, b): getRes(b, b, cursor, True, feat_list, fp_type=Fingerprint_Type.SINGLE, extra_selector=extra_selector)
                }
            )
    return result_table

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
    # for feat in Feature_Lists.All:
    #     table += get_feature_entropy(cursor, feat)
    # table += get_feature_entropy(cursor, "timezone, resolution, fontlist, adBlock, plugins, agent, headerKeys, cookie, accept, encoding, language, hashes, langs")
    # print_table(table)
    # return

    # table = [["Feature", "Single-browser uniqueness", "Cross-browser stability", "Cross-browser uniqueness"]]
    # for feat in Feature_Lists.All:
    #     table += [[a for x in [feat], get_feature_res(cursor, feat) for a in x]]
    # print_table(table)
    # latex_table(table)
    # return

    cursor.execute("SELECT DISTINCT(browser) from {}".format(table_name))
    browsers = [b for b, in cursor.fetchall()]
    browsers = sorted(browsers, key=lambda b: -cursor.execute("SELECT gpu from {} where browser='{}'".format(table_name, b)))
    mode = 1
    if mode == 0:
        getRes("Firefox", "Chrome", cursor, False, "resolution", fp_type=Fingerprint_Type.CROSS)
    elif mode == 1:
        result_table = get_res_table(cursor, browsers, Feature_Lists.Cross_Browser, cross_browser=True)

        table = get_print_table(result_table, browsers)
        print_table(table)
        print summarize_res(result_table)

        if LaTex:
            latex_table(table)
            latex_summarize(result_table)
    elif mode == 2:
        b = get_res_table(cursor, browsers, Feature_Lists.Amiunique, cross_browser=False)
        n = get_res_table(cursor, browsers, Feature_Lists.Single_Browser, cross_browser=False)

        print_table(get_print_table(b, browsers))
        print_table(get_print_table(n, browsers))
        print_diff(n, b, browsers)
        latex_summarize(n)
    else:
        table = [["Type", "amiunique", "Our's"]]
        row = ["Single"]
        a, b = summarize_res(get_res_table(cursor, browsers, Feature_Lists.Amiunique, cross_browser=False))
        row += ["{:3.2f}%".format(a*b/100.0)]
        a, b = summarize_res(get_res_table(cursor, browsers, Feature_Lists.Single_Browser, cross_browser=False))
        row += ["{:3.2f}%".format(a*b/100.0)]
        table.append(row)

        row = ["Cross Browser"]
        a, b = summarize_res(get_res_table(cursor, browsers, Feature_Lists.CB_Amiunique, cross_browser=True))
        row += ["{:3.2f}%".format(a*b/100.0)]
        a, b = summarize_res(get_res_table(cursor, browsers, Feature_Lists.Cross_Browser, cross_browser=True))
        row += ["{:3.2f}%".format(a*b/100.0)]
        table.append(row)

        latex_table(table)

    db.commit()
    db.close()

index()
