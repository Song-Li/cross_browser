from flask import Flask, request,make_response, current_app
from flask_failsafe import failsafe
import flask
from flask_cors import CORS, cross_origin
import json
import hashlib
from flaskext.mysql import MySQL
import configparser
import re
import os

# root = "/Users/chenghaosun/Documents/local_github/cross_browser/flask/"
path = 'mask.txt'
root = os.path.dirname(path)
config = configparser.ConfigParser()
# config.read(root + 'password.ignore')

mysql = MySQL()
app = Flask(__name__)
# app.config['MYSQL_DATABASE_USER'] = config.get('mysql', 'username')
# app.config['MYSQL_DATABASE_PASSWORD'] = config.get('mysql', 'password')
# # app.config['MYSQL_DATABASE_PASSWORD'] = os.environ.get('mySqlPSWD')
# app.config['MYSQL_DATABASE_DB'] = 'uniquemachine'
# app.config['MYSQL_DATABASE_HOST'] = 'localhost'

app.config['MYSQL_DATABASE_USER'] = "admin"
app.config['MYSQL_DATABASE_PASSWORD'] = "Mong!#%8"
# app.config['MYSQL_DATABASE_PASSWORD'] = os.environ.get('mySqlPSWD')
app.config['MYSQL_DATABASE_DB'] = 'uniquemachine'
app.config['MYSQL_DATABASE_HOST'] = 'uniquemachine.cwmjd3rybf92.us-east-1.rds.amazonaws.com'
mysql.init_app(app)
CORS(app)

print("PSWD:" , os.environ)

mask = []
mac_mask = []


with open(root + "mask.txt", 'r') as f:
    mask = json.loads(f.read())
with open(root + "mac_mask.txt", 'r') as fm:
    mac_mask = json.loads(fm.read())

@app.route("/")
def hello():
    return "Hello World!"

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
    
    print(agent)
           
    feature_str = "IP"
    value_str = "'" + IP + "'"

    for feature in feature_list:
        
        if result[feature] is not "":
            value = result[feature]
        else:
            value = "NULL"

        feature_str += "," + feature
#for gpu imgs
        if feature == "gpuImgs":
            value = ",".join('%s_%s' % (k,v) for k,v in value.items())
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
        
        value_str += ",'" + str(value) + "'"
        #print feature, hash_object.hexdigest()


    result['fonts'] = fonts
    for feature in cross_feature_list:
        cross_hash += str(result[feature])
        hash_object = hashlib.md5(str(result[feature]).encode('utf-8'))

    hash_object = hashlib.md5(value_str.encode('utf-8'))
    single_hash = hash_object.hexdigest()

    hash_object = hashlib.md5(cross_hash.encode('utf-8'))
    cross_hash = hash_object.hexdigest()

    feature_str += ',browser_fingerprint,computer_fingerprint_1'
    value_str += ",'" + single_hash + "','" + cross_hash + "'"

    db = mysql.get_db()
    cursor = db.cursor()
    sql_str = "INSERT INTO features (" + feature_str + ") VALUES (" + value_str + ");"
    cursor.execute(sql_str)
    db.commit()

    print (single_hash, cross_hash)
    return flask.jsonify({"single": single_hash, "cross": cross_hash})
