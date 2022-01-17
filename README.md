# Cross browser fingerprinting
Author: Yinzhi Cao, Song Li, Erik Wijmans

Group: System Security Lab in Johns Hopkins University

Website: http://uniquemachine.org

Paper: [Paper](https://yinzhicao.org/TrackingFree/crossbrowsertracking_NDSS17.pdf)

## NOTE
The ```master``` branch is used for testing purposes only. If you want to deploy it and collect browser fingerprints, please visit the [aws_deploy](https://github.com/Song-Li/cross_browser/tree/aws_deploy) branch.

## Demo 
[Demo](http://uniquemachine.org) 

Related repo: https://github.com/Song-Li/LanguageDetector  Used to detect supported languages

## Description
This is a project for a browser fingerprinting technique that can track users not only within a single browser but also across different browsers on the same machine. 

Specifically, our approach utilizes many novel OS and hardware level features, such as those from graphics cards, CPU, and installed writing scripts (Implementing). We extract these features by asking browsers to perform tasks that rely on corresponding OS and hardware functionalities.

## How to Deploy
In this project, we have a client side, web-based application, and a backend flask server file. 
The server side is written in Python 2. 
### Client Side
- Change the ```YOURSERVER``` text at Line 286 of the ```./client/fingerprint/js/details.js``` file to your server address.
- Change the ```YOURSERVER``` text at Line 2 of the ```./client/fingerprint/js/toServer.js``` file to your server address.
- Host the client side files by running ```python -m http.server 9876``` (for python 3) or ```python -m SimpleHTTPServer 9876``` (for python 2)

### Server Side
- Install the dependencies by running ```pip install -r requirements.txt``` in the root dir of the project folder
- Start the server by running ```python flask/server.py```

## Testing 
After you deployed the client side and the server side, you can start to play with it by visiting ```localhost:9876```

## File Structure
### Client
The whole client part is JS based in "client" dir. Some of the modules are generated from C or coffee.
Here is a list of usful description of dirs in "client":
- fingerprint: Including all files related to fingerprinting tests.
- js: Javascript part used for index.html

### Server

The server part is writen in python. Using apache2 and flask as the framework. 
