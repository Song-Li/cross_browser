import MySQLdb
from random import randint

db_name = "cross_browser"
table_name = "data"

global inited
inited = 0
global root
root = '/home/sol315/data/'

def gen_UID(cursor, table_name, MAX_UID):
    # Number of times the method will try to generate a UID before it fails
    max_tries = 10000
    for i in range(0, max_tries):
        uid = randint(0, MAX_UID)
        print MAX_UID
        print uid
        cursor.execute("SELECT COUNT(*) FROM {} WHERE id='{}'".format(table_name, uid))
        # If there are 0 IDs in the table with id=UID, we have found a unique ID
        if not cursor.fetchone()[0]:
            return uid

    raise RuntimeError("Ran out of UIDs!")

def insert_into_db(db, table_name, data):
    MAX_UID = int(1e9)
    cursor = db.cursor()
    uid = gen_UID(cursor, table_name, MAX_UID)
    try:
        cursor.execute("INSERT INTO {} (id, str) VALUES ('{}','{}')".format(table_name, uid, data))
        db.commit()
        return uid
    except:
        db.rollback()
        return insert_into_db(db, table_name, data)

def index():
    global inited
    global root
    sub_number = 0
    global db_name
    global table_name
    data = 'just a test'
    db = MySQLdb.connect("localhost", "erik", "erik", db_name)
    uid = insert_into_db(db, table_name, data)
    db.close()
    print data

    return "success"

index()
