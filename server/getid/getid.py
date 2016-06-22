import os.path
from PIL import Image, ImageChops, ImageFilter
import MySQLdb
from random import randint, seed

def gen_UID(cursor, table_name, ip):
    MAX_UID = int(1e9)
    # Number of times the method will try to generate a UID before it fails
    seed()
    max_tries = 1000000
    for i in range(0, max_tries):
        uid = randint(0, MAX_UID)
        cursor.execute("SELECT COUNT(*) FROM {} WHERE id='{}'".format(table_name, uid))
        # If there are 0 IDs in the table with id=UID, we have found a unique ID
        if not cursor.fetchone()[0]:
            return uid
    raise RuntimeError("Ran out of UIDs!")

def insert_into_db(db, table_name, ip):
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) FROM {} WHERE ip='{}'".format(table_name, ip))
    row = cursor.fetchone()[0]
    if row > 100:
        return "error"

    uid = gen_UID(cursor, table_name, ip)

    try:
        cursor.execute("INSERT INTO {} (id, ip) VALUES ('{}','{}')".format(table_name, uid, ip))
        db.commit()
        return uid
    except:
        db.rollback()


def index(req):
    ip = req.connection.remote_ip
    db_name = "cross_browser"
    table_name = "uid"
    db = MySQLdb.connect("localhost", "erik", "erik", db_name)
    uid = insert_into_db(db, table_name, ip)
    db.close()
    return uid
