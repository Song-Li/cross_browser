import BaseHTTPServer
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import urllib
import json
import linecache 

global ip2line
ip2line = {}

def not_insane_address_string(self):
    host, port = self.client_address[:2]
    return '%s (no getfqdn)' % host #used to call: socket.getfqdn(host)
BaseHTTPServer.BaseHTTPRequestHandler.address_string = \
        not_insane_address_string

class Serv(BaseHTTPRequestHandler):

    def getData(self, ip):
        standard = ''
        if('Google Inc.' in ip2line[ip].keys()):
            line = ip2line[ip]['Google Inc.']
            standard += linecache.getline('../collect/dataurls.data', line) + ' '
        else:
            standard += 'NULL' + ' ' + 'NULL' + ' ' + 'NULL' + ' '

        if('No debug Info' in ip2line[ip].keys()):
            line = ip2line[ip]['No debug Info']
            standard += linecache.getline('../collect/dataurls.data', line) + ' '
        else:
            standard += 'NULL' + ' ' + 'NULL' + ' ' + 'NULL' + ' '
        
        if('Microsoft' in ip2line[ip].keys()):
            line = ip2line[ip]['Microsoft']
            standard += linecache.getline('../collect/dataurls.data', line) + ' '
        else:
            standard += 'NULL' + ' ' + 'NULL' + ' ' + 'NULL' + ' '

        return standard

    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header("Access-Control-Allow-Origin","*")
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        global ip2line;
        # Doesn't do anything with posted data
        self._set_headers()

        length = int(self.headers['Content-Length'])

        post_data = self.rfile.read(length) #change the string to json format
        send = []

        if(post_data == 'G'):
            linecache.clearcache()
            print 'getG'
            numLine = 0
            f = open('../collect/database.csv','r')
            for line in f.readlines():
                numLine += 1
                item = line.split(',')
                if(item[0] in ip2line):
                    ip2line[item[0]].update({item[2]:numLine})
                else:
                    ip2line[item[0]] = {item[2]: numLine}

            print ip2line
            for ip in ip2line.keys():
                send.append(ip)
            f.close()
        else:
            print post_data
            standard = ''
            picture = ''
            ip = linecache.getline('../collect/database.csv',1).split(',')[0]

            standard = self.getData(ip)
            picture = self.getData(post_data)

            send.append(standard)
            send.append(picture)

        send_string = json.dumps(send)
        self.wfile.write(send_string)
        return 0 



        
def run(server_class=HTTPServer, handler_class=Serv, port=9999):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'Starting httpd...' + str(port)
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
