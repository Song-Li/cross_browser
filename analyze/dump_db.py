#!/usr/bin/env python

import MySQLdb

db_name = "cross_browser"
table_name = "round_2_data"

db = MySQLdb.connect("localhost", "erik", "erik", db_name)
cursor = db.cursor()

cursor.execute("SELECT DISTINCT(user_id) FROM {}".format(table_name))
uids = [x for x, in cursor.fetchall()]
f = open("hashes.txt", "w")
for uid in uids:
  cursor.execute("SELECT browser, hashes FROM {} where user_id='{}'".format(table_name, uid))
  data = cursor.fetchall()
  f.write("{}\n".format(len(data)))
  for browser, h in data:
    hashes = h.split("&")
    f.write(("{} " * (1 + len(hashes))).format(browser, *hashes))
    f.write("\n")

f.flush()
f.close()
db.close()
