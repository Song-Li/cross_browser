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
    feature_list = ["fontlist", "WebGL", "inc", "gpu", "hash", "timezone", "plugins", "cookie", "localstorage", "gpuImgs", "adBlock", "cpu_cores", "canvas_test", "audio"]
    single_hash = ""

    result = request.get_json()
    print (request.form)
    
    for feature in feature_list:
        single_hash += str(result[feature])
#        print str(result[feature])

    hash_object = hashlib.md5(single_hash)
    single_hash = hash_object.hexdigest()

    print (single_hash)
    return flask.jsonify(single_hash)

if __name__ == "__main__":
    app.run(host = '0.0.0.0')
