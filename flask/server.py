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

    print agent, accept, encoding, language

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

    single_hash = ""
    print single_hash

    result = request.get_json()
    result['agent'] = agent
    result['accept'] = accept
    result['encoding'] = encoding
    result['language'] = language
   # print (request.form)
    
    for feature in feature_list:
        single_hash += str(result[feature])
        hash_object = hashlib.md5(str(result[feature]))
        print feature, hash_object.hexdigest()
#        print str(result[feature])

    hash_object = hashlib.md5(single_hash)
    single_hash = hash_object.hexdigest()

    print (single_hash)
    return flask.jsonify(single_hash)

if __name__ == "__main__":
    app.run(host = '0.0.0.0')
