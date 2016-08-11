import MySQLdb


db = MySQLdb.connect("localhost", "erik", "erik", 'cross_browser')
cursor = db.cursor()

ips = set()

cursor.execute("select distinct(user_id) from round_3_data")
for c in cursor.fetchall():
    ips.add(c)
cursor.execute("select distinct(user_id) from round_2_data")
for c in cursor.fetchall():
    ips.add(c)
print len(ips)

'''
uids = []
resolution = []
stupid = {}
tmp = []
sumUp = 0.0
Font = loads(read_file("Font_Mask.txt"))

for uid, in cursor.fetchall():
    uids.append(uid)
    tmp = []
    browsers = []
    flag = 0
    f = 0
    c = 0
    res = ""
    cursor.execute("select fonts,browser,platform from round_3_data where ip='" + str(uid) + "'")
    for f,b,p in cursor.fetchall():
        mask = Font["{}{}".format(browser, b2)]
        for i, h in enumerate(f):
            if mask[i]:
            if len(tmp) != 0 and r not in tmp and b != 'IE':
                flag = 1
            tmp.append(r)
            browsers.append(b)
            if flag == 1:
                stupid[uid] = tmp + browsers

        #res += cpu + '_' + b + '_' + p + '\t'
        #if b == 'Firefox':
        #    f = float(cpu)
        #elif b == 'Chrome':
        #    c = float(cpu)
    #if f != 0 and c != 0:
    #    print str(int(f / 1000)) + '_' + str(int(c / 3000)) + '_' + b + '_' + p
    #    sumUp = (sumUp + (f / c)) / 2

#print sumUp


for s in stupid:
    print s, stupid[s]
'''
