# Wipes all data from a mysql table
# usage: python wipe_db.py <db_name> <table_name>

import MySQLdb
import sys

db_name = sys.argv[1]
table_name = sys.argv[2]
db = MySQLdb.connect("localhost", "erik", "erik", db_name)
cursor = db.cursor()
cursor.execute("DELETE FROM {}".format(table_name))
db.commit()
db.close()
