# Cross browser fingerprinting
Author: Yinzhi Cao, Song Li, Erik Wijmans

Group: SECLAB in Johns Hopkins University

Website: http://uniquemachine.org

Paper: [Paper](https://yinzhicao.org/TrackingFree/crossbrowsertracking_NDSS17.pdf)

## Rebuild schedule
Rebuilding in branch Guanlong. Should be finished in weeks. Once generated a usable script, the code will be merged to master and be released. At that time, the license will be changed to MIT.

## Demo 
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

### Deploy to AWS Lambda
Below is our recommanded way to deploy our application on AWS, it is totally free! But, feel free to implement your own ways!

1.Follow this tutorial to set up AWS account and all the credentials you need
https://pythonforundergradengineers.com/deploy-serverless-web-app-aws-lambda-zappa.html

2.Follow this tutorial to utilize zappa to link AWS credentials and deploy
https://towardsdatascience.com/deploy-a-python-api-on-aws-c8227b3799f0

3.Create a database on AWS RDS

4.Store the database credentials using environment variables in lambda functions

5.Change the ip_address variable defined in cross_browser/client/fingerprint/js/toServer.js line 1 to your deployed address.

6.Change the ip_address variable defined in cross_browser/client/fingerprint/js/details.js line 284 to your deployed address.

