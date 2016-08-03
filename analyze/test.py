import MySQLdb


db = MySQLdb.connect("localhost", "erik", "erik", 'cross_browser')
cursor = db.cursor()

cursor.execute("select distinct(user_id) from new_data")

uids = []
resolution = []
stupid = {}
tmp = []

for uid, in cursor.fetchall():
    uids.append(uid)
    tmp = []
    flag = 0
    cursor.execute("select resolution,browser from new_data where user_id=" + str(uid))
    for r,b in cursor.fetchall():
        if len(tmp) != 0 and r not in tmp:
            flag = 1
        tmp.append(r)
        if flag == 1:
            stupid[uid] = tmp

for s in stupid:
    div = ""
    for d in stupid[s]:
        t = d.split('x')
        div += str('{:.2f}'.format(float(t[0]) / float(t[1]))) + ' '
    print s, stupid[s], div
