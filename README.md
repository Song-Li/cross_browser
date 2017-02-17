# Cross browser fingerprinting
Author: Yinzhi Cao, Song Li, Erik Wijmans

Group: SECLAB in Lehigh University

Website: http://uniquemachine.org

[Demo](http://uniquemachine.org)

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
