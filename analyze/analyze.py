#!/usr/bin/env python

import json
from PIL import Image
# from scipy.ndimage import (label,find_objects)
import MySQLdb
from hashlib import sha512 as hasher1, sha256 as hasher2
from base64 import urlsafe_b64encode as encode
from langs.analyze_langs import LangAnalyzer
from glob import glob
from sets import Set
import math
from fingerprint import Fingerprint, Fingerprint_Type, Feature_Lists
from table import Results_Table, Feature_Table, Diff_Table, Summary_Table
from generate_mask import Gen_Masks

browser_to_id = {'chrome': 0, 'firefox': 1, 'others': 2}
standard_pics = []
open_root = "/home/site/data/"
output_root = open_root + "images/generated/"
db_name = "cross_browser"
table_name = "round_3_data"

def update_ratio(db):
    ratio = {}
    cursor = db.cursor()
    cursor.execute("SELECT resolution,image_id from {}".format(table_name))
    for r,i in cursor.fetchall():
        d = r.split('_')
        ratio[i] = '{:.2f}'.format(float(d[3]) / float(d[4]))

    for i in ratio:
        cursor.execute("UPDATE {} SET ratio=".format(table_name) + str(ratio[i]) + " where image_id=" + str(i))

    db.commit()


def update_table(db):
    cursor = db.cursor()
    cursor.execute("SELECT image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock, canvastest, cpucores, cpucal, audio FROM new_data")
    for image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock, canvastest, cpucores, cpucal, audio in cursor.fetchall():
        cursor.execute("SELECT COUNT(*) FROM {} where image_id='{}'".format(table_name, image_id))
        if not cursor.fetchone()[0]:
            cursor.execute("INSERT INTO {} (image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock, canvastest, cpucores, cpucal, audio) VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}')".format(table_name, image_id, user_id, ip, vendor, gpu, agent, browser, fps, manufacturer, fonts, simple_hash, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock, canvastest, cpucores, cpucal, audio))
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

def getPlatform(agent):
    p = agent.split('(')
    p = p[1].split(';')
    return p[0].split(')')[0]

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
        print(image_id)
        hash_codes = gen_hash_codes(image_id)
        cursor.execute("UPDATE {} SET hashes='{}', video='{}' WHERE image_id='{}'".format(table_name, "&".join(hash_codes[:27]), "&".join(hash_codes[27:]), image_id))

    cursor.execute("SELECT image_id FROM {} where lang_hash IS NULL".format(table_name))
    for image_id, in cursor.fetchall():
        print(image_id)
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
            platform = getPlatform(agent)
            cursor.execute("UPDATE {} SET browser='{}',platform='{}' WHERE image_id='{}'".format(table_name, browser, platform, image_id))
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
        print('extra_selector="{}"'.format(extra_selector))
    global mask
    global b_mask
    mask = None
    global instability
    tuids = []
    uids = []
    cursor.execute("SELECT COUNT(DISTINCT(ip)) FROM {}".format(table_name))
    if not quiet:
        print('ip', cursor.fetchone()[0])
    cursor.execute("SELECT COUNT(DISTINCT(user_id)) FROM {}".format(table_name))
    if not quiet:
        print('user', cursor.fetchone()[0])

    #cursor.execute("SELECT user_id FROM {} WHERE browser='{}'".format(table_name, b1))
    cursor.execute("SELECT user_id FROM {} WHERE browser='{}' {}".format(table_name, b1, extra_selector))
    for uid, in cursor.fetchall():
        tuids.append(uid)

    if not quiet:
        print(b1, len(tuids))

    for uid in tuids:
        #cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}'".format(table_name, uid, b2))
        cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}' {}".format(table_name, uid, b2, extra_selector))
        for uid, in cursor.fetchall():
            uids.append(uid)

    if not quiet:
        print(b1, 'and', b2 , len(uids))

    if len(uids) is 0:
        return None

    #uids is the list of users uses both b1 and b2
    hash_all = {}
    hash_long = []
    fp_to_count = {}
    hash_all_unique = {}
    index = []
    uid_stability = {}
    instability = {}

    for uid in uids:
        #cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
        cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
        image1_id = cursor.fetchone()[0]
        #cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
        cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
        image2_id = cursor.fetchone()[0]

        fp_1 = Fingerprint(cursor, image1_id, table_name, fp_type, attrs, b2)
        fp_2 = Fingerprint(cursor, image2_id, table_name, fp_type, attrs, b1)

        try:
            # Feature to mask
            feature = "fonts"
            cursor.execute("SELECT {} FROM {} WHERE image_id='{}'".format(feature, table_name, image1_id))
            hashes_1 = cursor.fetchone()[0]#.split("&")[:27]

            cursor.execute("SELECT {} FROM {} WHERE image_id='{}'".format(feature, table_name, image2_id))
            hashes_2 = cursor.fetchone()[0]#.split("&")[:27]

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
                    if i not in instability:
                        instability.update({i: 0.0})


                    hash1_val = hashes_1[i]
                    hash2_val = hashes_2[i]

                    s1 += hash1_val
                    s2 += hash2_val

                    #if hash1_val == hash2_val and (hash1_val not in hash_all[i]):
                    if hash1_val == hash2_val:
                        hash_all[i].append(hash1_val)
                        hash_all_unique[i].add(hash1_val)
                    else:
                        instability[i] += 1.0/len(uids)
                        uid_stability[uid].append([hash1_val, hash2_val])
        except:
            pass
        if fp_1 == fp_2:
            #else:
            #    print('found: ' + str(uid) + '%' + str(uids[hash_long.index(s1)]))
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
        #    print('not same: ' + str(uid))
    #for i in range(case_number):
    #    print(i, instability[i])

    for index, i in instability.items():
        if i > 0.005:
            mask[index] = 0


    num_distinct = max(float(len(fp_to_count)), 1.0)
    num_unique = 0.0
    for _, count in fp_to_count.items():
        if count == 1:
            num_unique += 1.0
    num_cross_browser = float(len(hash_long))
    num_uids = max(float(len(uids)), 1.0)

    if not quiet:
        for i, d in instability.items():
            print("{}: instability: {}".format(i, d))

        print('Cross_browser', num_cross_browser)
        print('Cross_browser rate', num_cross_browser/num_uids)

        print('Cross_browser unique', num_unique/num_distinct)
        print(num_unique, num_distinct)

    return int(num_uids), "{:3.1f}%".format(num_cross_browser/num_uids*100), "{:3.1f}%".format(num_unique/num_distinct*100)

b_mask = {}
def get_res_table(cursor, browsers, feat_list, cross_browser=True, extra_selector=""):
    global b_mask
    global mask
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
                if mask is not None:
                    b_mask.update(
                        {
                            "{}{}".format(b1,b2): mask
                        }
                    )
                    mask = None
        for i in range(len(browsers)):
            for j in range(0, i):
                b1, b2 = browsers[i], browsers[j]
                result_table.update(
                    {
                        (b1, b2): result_table[(b2, b1)]
                    }
                )
                try:
                    b_mask.update(
                        {
                            "{}{}".format(b1, b2): b_mask["{}{}".format(b2, b1)]
                        }
                    )
                except:
                    pass
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
    global b_mask

    #update_table(db)
    #update_browser(db)
    #update_hashes(db)
    #update_langs(db)
    #update_ratio(db)
    #return

    # table = get_gpu_entropy(cursor)
    # table += get_lang_entropy(cursor)
    # for feat in Feature_Lists.All:
    #     table += get_feature_entropy(cursor, feat)
    # table += get_feature_entropy(cursor, "timezone, resolution, fontlist, adBlock, plugins, agent, headerKeys, cookie, accept, encoding, language, hashes, langs")
    # print_table(table)
    # return



    cursor.execute("SELECT DISTINCT(browser) from {}".format(table_name))
    browsers = [b for b, in cursor.fetchall()]
    browsers = sorted(browsers, key=lambda b: -cursor.execute("SELECT gpu from {} where browser='{}'".format(table_name, b)))
    browsers = [b for b in browsers if cursor.execute("SELECT gpu from {} where browser='{}'".format(table_name, b)) > 20]

    # table = Feature_Table(browsers)
    # table.run(cursor, table_name)
    # print("{:latex}".format(table))
    # return

    #print get_res_table(cursor, browsers, "fonts", extra_selector="")
    #f = open("Font_Mask.txt", "w")
    #f.write(json.dumps(b_mask))
    #f.close()
    #return

    mode = 1
    if mode == 0:
        getRes("Firefox", "Chrome", cursor, False, "hashes", fp_type=Fingerprint_Type.CROSS)
    elif mode == 1:
        table = Results_Table.factory(Fingerprint_Type.CROSS, Feature_Lists.Cross_Browser, browsers)
        #table.run(cursor, table_name, extra_selector=" and browser!='IE' and browser !='Edge'")
        #table.run(cursor, table_name, extra_selector="and platform like '%NT%'")
        #table.run(cursor, table_name, extra_selector="and gpu!='SwiftShader'")
        #table.run(cursor, table_name, extra_selector="and platform like '%mac%'")
        table.run(cursor, table_name, extra_selector="")
        #print("{:latex}".format(table))
        print (table)
    elif mode == 2:
        table = Diff_Table.factory(Fingerprint_Type.SINGLE, Feature_Lists.Single_Browser, Feature_Lists.Amiunique, browsers)
        table.run(cursor, table_name)
        #print("{:latex}".format(table))
        print("{}".format(table))
    elif mode == 3:
        table = Summary_Table(browsers)
        table.run(cursor, table_name)
        #print("{:latex}".format(table))
        print("{}".format(table))
    else:
        gen_masks = Gen_Masks(browsers)
        #b_mask = gen_masks.run(cursor, Feature_Lists.Cross_Browser, table_name, extra_selector="and gpu!='SwiftShader' and gpu != 'Microsoft Basic Render Driver'")
        #b_mask = gen_masks.run(cursor, Feature_Lists.Cross_Browser, table_name, extra_selector="and gpu!='Microsoft Basic Render Driver'")
        b_mask = gen_masks.run(cursor, Feature_Lists.Cross_Browser, table_name, extra_selector="and platform like '%NT%'")
        f = open("GPU_Mask.txt", "w")
        f.write(json.dumps(b_mask))
        f.close()


    db.commit()
    db.close()

index()
