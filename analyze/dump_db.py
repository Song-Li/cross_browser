#!/usr/bin/env python

import MySQLdb

db_name = "cross_browser"
table_name = "round_2_data"

db = MySQLdb.connect("localhost", "erik", "erik", db_name)
cursor = db.cursor()

cursor.execute("SELECT hashes FROM {}".format(table_name))
f = open("hashes.txt", "w")
for hashes, in cursor.fetchall():
  for h in hashes.split("&"):
    f.write("{} ".format(h))

  f.write("\n")

f.flush()
f.close()
db.close()