#!/usr/bin/env python

import MySQLdb

db_name = "cross_browser"
table_name = "round_2_data"

db = MySQLdb.connect("localhost", "erik", "erik", db_name)
cursor = db.cursor()

cursor.execute("SELECT browser, hashes FROM {}".format(table_name))
f = open("hashes.txt", "w")
for browser, hashes in cursor.fetchall():
  f.write(("{} " * (1 + len(hashes))).format(browser, *hashes))
  f.write("\n")

f.flush()
f.close()
db.close()
