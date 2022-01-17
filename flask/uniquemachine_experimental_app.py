from flask import Flask, request,make_response, current_app
from flask_failsafe import failsafe
import flask
from flask_cors import CORS, cross_origin
import json
import hashlib
from flaskext.mysql import MySQL
import re
import os
from tinydb import TinyDB, Query

root = "./"
app = Flask(__name__)
CORS(app)
db = TinyDB('db.json')

@app.route('/details', methods=['POST'])
def details():
    res = {}
    ID = request.get_json()["ID"]

    # sql injection vulnerability but whatever
    query = Query()
    res = db.search(query.browser_fingerprint==ID)[0]

    # historical bug
    if 'gpuImgs' in res:
        res['gpuimgs'] = res['gpuImgs']
    if 'langsDetected' in res:
        res['langsdetected'] = res['langsDetected']

    print(flask.jsonify(res))
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

    fonts = list(result['fonts'])

    cnt = 0
    
    # Do not consider masks for now
    """
    for i in range(len(mask)):
        fonts[i] = str(int(fonts[i]) & mask[i] & mac_mask[i])
        if fonts[i] == '1':
            cnt += 1
    """

    result['agent'] = agent
    result['accept'] = accept
    result['encoding'] = encoding
    result['language'] = language
   
    value_dict = {}
    value_dict['IP'] = IP
    value_str = "'" + IP + "'"

    for feature in feature_list:
        print(result[feature])
        
        if result[feature] is not "":
            value = result[feature]
        else:
            value = "NULL"

        #for gpu imgs
        if feature == "gpuImgs":
            value = ",".join('%s_%s' % (k,v) for k,v in value.iteritems())
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
        value_dict[feature] = str(value)
        #print feature, hash_object.hexdigest()


    result['fonts'] = fonts
    for feature in cross_feature_list:
        cross_hash += str(result[feature])
        hash_object = hashlib.md5(str(result[feature]))

    hash_object = hashlib.md5(value_str)
    single_hash = hash_object.hexdigest()

    hash_object = hashlib.md5(cross_hash)
    cross_hash = hash_object.hexdigest()

    value_dict['browser_fingerprint'] = single_hash
    value_dict['computer_fingerprint_1'] = cross_hash

    print(value_dict)
    db.insert(value_dict)

    print(single_hash, cross_hash)
    return flask.jsonify({"single": single_hash, "cross": cross_hash})
