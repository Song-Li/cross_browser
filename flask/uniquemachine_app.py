from flask import Flask, request,make_response, current_app
import md5
from flask_failsafe import failsafe
import flask
from flask_cors import CORS, cross_origin
import json
import hashlib
from flaskext.mysql import MySQL
import ConfigParser
import re
import numpy as np
from PIL import Image
import base64
import cStringIO

root = "/home/sol315/server/uniquemachine/"
config = ConfigParser.ConfigParser()
config.read(root + 'password.ignore')

mysql = MySQL()
app = Flask(__name__)
app.config['MYSQL_DATABASE_USER'] = config.get('mysql', 'username')
app.config['MYSQL_DATABASE_PASSWORD'] = config.get('mysql', 'password')
app.config['MYSQL_DATABASE_DB'] = 'uniquemachine'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)
CORS(app)
base64_header = "data:image/png;base64,"

mask = []
mac_mask = []

with open(root + "mask.txt", 'r') as f:
    mask = json.loads(f.read())
with open(root + "mac_mask.txt", 'r') as fm:
    mac_mask = json.loads(fm.read())

def run_sql(sql_str):
    db = mysql.get_db()
    cursor = db.cursor()
    cursor.execute(sql_str)
    db.commit()
    res = cursor.fetchall() 
    return res


@app.route("/utils", methods=['POST'])
def utils():
    command = request.values['key']
    sql_str = ""
    if command == "keys":
        sql_str = "SELECT distinct IP, time, id from features"
        res = run_sql(sql_str)
        # return the ip, time and the id
        return ",".join([r[0] + '=' + r[1].isoformat() + '_' + str(r[2]) for r in res])

    elif command.split(',')[0] == "get_pictures_by_id":
        ID = command.split(',')[1]
        sql_str = "SELECT gpuImgs from features where id = " + ID
        res = run_sql(sql_str)
        imgs_str = res[0][0]
        return imgs_str

@app.route("/result", methods=['POST'])
def get_result():
    image_id = request.values['image_id']
    sql_str = "SELECT dataurl from pirctures where ID={image_id}"
    db = mysql.get_db()
    cursor = db.cursor()
    cursor.execute(sql_str)
    db.commit()
    return cursor.fetchone()[0]

@app.route("/pictures", methods=['POST'])
def store_pictures():

    # get ID for this picture
    db = mysql.get_db()
    cursor = db.cursor()
    sql_str = "INSERT INTO pictures (dataurl) VALUES ('" + "tmp"+ "')"
    cursor.execute(sql_str)
    db.commit()

    sql_str = "SELECT LAST_INSERT_ID()"
    cursor.execute(sql_str)
    ID = cursor.fetchone()
    db.commit()

    image_b64 = request.values['imageBase64']
    # remove the define part of image_b64
    image_b64 = re.sub('^data:image/.+;base64,', '', image_b64)
    # decode image_b64
    image_data = image_b64.decode('base64')
    image_data = cStringIO.StringIO(image_data)
    image_PIL = Image.open(image_data)
    image_PIL.save("/home/sol315/pictures/" + str(ID[0]) + ".png")
    return str(ID[0])

@app.route('/details', methods=['POST'])
def details():
    res = {}
    ID = request.get_json()["ID"]
    db = mysql.get_db()
    cursor = db.cursor()
    sql_str = "SELECT * FROM features WHERE browser_fingerprint = '" + ID +"'"
    cursor.execute(sql_str)
    db.commit()
    row = cursor.fetchone()
    for i in range(len(row)):
        value = row[i]
        name = cursor.description[i][0]
        res[name] = value

    if 'fonts' in res:
        fs = list(res['fonts'])
        for i in range(len(mask)):
            fs[i] = str(int(fs[i]) & mask[i] & mac_mask[i])
        res['fonts'] = ''.join(fs)

    return flask.jsonify(res)

@app.route('/features', methods=['POST'])
def features():
    agent = ""
    accept = ""
    encoding = ""
    language = ""
    IP = ""

    try:
        agent = request.headers.get('User-Agent')
        accpet = request.headers.get('Accept')
        encoding = request.headers.get('Accept-Encoding')
        language = request.headers.get('Accept-Language')
        IP = request.remote_addr
    except:
        pass

    feature_list = [
            "agent",
            "accept",
            "encoding",
            "language",
            "langsDetected",
            "resolution",
            "fonts",
            "WebGL", 
            "inc", 
            "gpu", 
            "gpuImgs", 
            "timezone", 
            "plugins", 
            "cookie", 
            "localstorage", 
            "adBlock", 
            "cpu_cores", 
            "canvas_test", 
            "audio"]

    cross_feature_list = [
            "timezone",
            "fonts",
            "langsDetected",
            "audio"
            ]
    

    result = request.get_json()

    single_hash = "single"
    single_hash_str = "single"
    cross_hash = "cross"

    #with open("fonts.txt", 'a') as f:
        #f.write(result['fonts'] + '\n')

    fonts = list(result['fonts'])

    cnt = 0
    for i in range(len(mask)):
        fonts[i] = str(int(fonts[i]) & mask[i] & mac_mask[i])
        if fonts[i] == '1':
            cnt += 1

    result['agent'] = agent
    result['accept'] = accept
    result['encoding'] = encoding
    result['language'] = language
    
    print agent
           
    feature_str = "IP"
    value_str = "'" + IP + "'"


    for feature in feature_list:
        
        if result[feature] is not "":
            value = result[feature]
        else:
            value = "NULL"
        
        # set hash_str as the pure value from js
        hash_str = str(value)

        feature_str += "," + feature
        # for gpu imgs
        if feature == "gpuImgs":
            # only keep the pure value of every result
            hash_str = ",".join(v.split('_')[1] for k, v in value.iteritems())
            # change value to str
            value = ",".join('%s_%s' % (k, v) for k, v in value.iteritems())
        else:
            value = str(value)

#        if feature == "cpu_cores" and type(value) != 'int':
#           value = -1
#fix the bug for N/A for cpu_cores
        if feature == 'cpu_cores':
            value = int(value)

        if feature == 'langsDetected':
            value = str("".join(value))
            value = value.replace(" u'", "")
            value = value.replace("'", "")
            value = value.replace(",", "_")
            value = value.replace("[", "")
            value = value.replace("]", "")
            value = value[1:]

        # if feature is gpuImgs
        # we need to ignore the picture id
        value_str += ",'" + str(value) + "'"
        #print feature, hash_object.hexdigest()
        single_hash_str += hash_str


    result['fonts'] = fonts
    for feature in cross_feature_list:
        cross_hash += str(result[feature])
        hash_object = hashlib.md5(str(result[feature]))

    hash_object = hashlib.md5(single_hash_str)
    single_hash = hash_object.hexdigest()

    hash_object = hashlib.md5(cross_hash)
    cross_hash = hash_object.hexdigest()

    feature_str += ',browser_fingerprint,computer_fingerprint_1'
    value_str += ",'" + single_hash + "','" + cross_hash + "'"

    db = mysql.get_db()
    cursor = db.cursor()
    sql_str = "INSERT INTO features (" + feature_str + ") VALUES (" + value_str + ");"
    cursor.execute(sql_str)
    db.commit()

    sql_str = "SELECT LAST_INSERT_ID()"
    cursor.execute(sql_str)
    ID = cursor.fetchone()[0]
    db.commit()

    print (single_hash, cross_hash, ID)
    return flask.jsonify({"single": single_hash, "cross": cross_hash, "id": ID})
