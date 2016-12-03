from flask import Flask, request,make_response, current_app
from flask_cors import CORS, cross_origin
import json

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return "Hello World!"

@app.route('/features', methods=['POST'])
def features():
    user = request.form['canvas_test']
    password = request.form['cpu_cores']
    print user
    return json.dumps({'status':'OK','user':user,'pass':password})

if __name__ == "__main__":
    app.run(host = '0.0.0.0')
