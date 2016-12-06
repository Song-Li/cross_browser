from flask import Flask, request,make_response, current_app
import flask
from flask_cors import CORS, cross_origin
import json
import hashlib

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return "Hello World!"

@app.route('/features', methods=['POST'])
def features():
    agent = ""
    accept = ""
    encoding = ""
    language = ""

    try:
        agent = request.headers.get('User-Agent')
        accpet = request.headers.get('Accept')
        encoding = request.headers.get('Accept-Encoding')
        language = request.headers.get('Accept-Language')
    except:
        pass

    feature_list = [
            #"fontlist", 
            "agent",
            "accept",
            "encoding",
            "language",
            "fonts",
            "WebGL", 
            "inc", 
            "gpu", 
            "hash", 
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
            "fonts"
            ]
    

    result = request.get_json()
    mask = []
    mac_mask = []

    with open("mask.txt", 'r') as f:
        mask = json.loads(f.read())

    if 'Mac' in agent:
        print "mac"
        with open("mac_mask.txt", 'r') as fm:
            mac_mask = json.loads(fm.read())
    else:
        print 'not mac'
        mac_mask = [1 for i in range(len(mask))]

    single_hash = ""
    cross_hash = ""

    with open("fonts.txt", 'a') as f:
        f.write(result['fonts'] + '\n')

    fonts = list(result['fonts'])

    print mac_mask
    cnt = 0
    for i in range(len(mask)):
        fonts[i] = str(int(fonts[i]) & mask[i] & mac_mask[i])
        if fonts[i] == '1':
            cnt += 1
    print "cnt is ", cnt

    result['agent'] = agent
    result['accept'] = accept
    result['encoding'] = encoding
    result['language'] = language
    
    print agent
    for feature in feature_list:
        single_hash += str(result[feature])
        hash_object = hashlib.md5(str(result[feature]))
        print feature, hash_object.hexdigest()
#        print str(result[feature])

    result['fonts'] = fonts
    for feature in cross_feature_list:
        cross_hash += str(result[feature])
        hash_object = hashlib.md5(str(result[feature]))
        print feature, hash_object.hexdigest()

    hash_object = hashlib.md5(single_hash)
    single_hash = hash_object.hexdigest()

    hash_object = hashlib.md5(cross_hash)
    cross_hash = hash_object.hexdigest()

    print (single_hash, cross_hash)
    return flask.jsonify({"single": single_hash, "cross": cross_hash})

if __name__ == "__main__":
    app.run(host = '0.0.0.0')
