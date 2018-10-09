# Cross browser fingerprinting
Author: Yinzhi Cao, Song Li, Erik Wijmans

Group: SECLAB in Johns Hopkins University

Website: http://uniquemachine.org

Paper: https://drive.google.com/file/d/0B4s900Byvv1ibW5uc1NiU2g3R3c/view

# The repo will be rebuilt from Oct. 10th to Nov. 1st

[Demo](http://uniquemachine.org) This is only a DEMO. Only 2 features in the paper is implemented. Far from finished. 10 ~20 features is waiting for implementation, more masks for GPU and Fonts needed to be updated. The research code can't be used directly...

Related repo: https://github.com/Song-Li/LanguageDetector  Used to detect supported languages

Development: Currentlly I'm focusing on another related project. I will update this repo when I'm free

## Description
This is a project for a browser fingerprinting technique that can track users not only within a single browser but also across different browsers on the same machine. 

Specifically, our approach utilizes many novel OS and hardware level features, such as those from graphics cards, CPU, and installed writing scripts (Implementing). We extract these features by asking browsers to perform tasks that rely on corresponding OS and hardware functionalities.
## Implementation
### Client
The whole client part is JS based in "client" dir. Some of the modules are generated from C or coffee.
Here is a list of usful description of dirs in "client":
- fingerprint: Including all files related to fingerprinting tests.
- js: Javascript part used for index.html

### Server

The server part is writen in python. Using apache2 and flask as the framework. 
