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
        if('chrome' in ip2line[ip].keys()):
            line = ip2line[ip]['chrome']
            standard += linecache.getline('../collect/dataurls.data', line) + ' '
        else:
            standard += 'NULL' + ' ' + 'NULL' + ' ' + 'NULL' + ' '

        if('firefox' in ip2line[ip].keys()):
            line = ip2line[ip]['firefox']
            standard += linecache.getline('../collect/dataurls.data', line) + ' '
        else:
            standard += 'NULL' + ' ' + 'NULL' + ' ' + 'NULL' + ' '
        
        if('edge' in ip2line[ip].keys()):
            line = ip2line[ip]['edge']
            standard += linecache.getline('../collect/dataurls.data', line) + ' '
        elif('safari' in ip2line[ip].keys()):
            line = ip2line[ip]['safari']
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

        if(post_data[0] == 'R'):
            linecache.clearcache()
            numLine = 0
            browser_name = ''
            f = open('../collect/database.csv','r')
            for line in f.readlines():
                numLine += 1
                item = line.split(',')
                #the order can't change!

                if(item[5].find('Firefox') != -1):
                    browser_name = 'firefox'
                elif(item[5].find('Edge') != -1 or item[2].find('Microsoft') != -1):
                    browser_name = 'edge'
                elif(item[5].find('Chrome') != -1):
                    browser_name = 'chrome'
                elif(item[5].find('Safari') != -1):
                    browser_name = 'safari'

                if(item[0] in ip2line):
                    ip2line[item[0]].update({browser_name:numLine})
                else:
                    ip2line[item[0]] = {browser_name: numLine}

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
