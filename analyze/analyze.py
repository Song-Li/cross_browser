import MySQLdb

db_name = "uniquemachine"
table_name = "features"

def get_distinct(column_names, cursor):
    aim = ""
    for c in column_names:
        aim += c + ","
    aim = aim[:-1] #remove the lase ,
    command = "SELECT DISTINCT " + aim + " FROM " + table_name
    cursor.execute(command)
    reses = cursor.fetchall()

    res = []
    for r in reses:
        res.append(r)
    return res

def get_column(column_name, cursor):
    command = "SELECT " + column_name + " FROM " + table_name
    res = []
    cursor.execute(command)
    reses = cursor.fetchall()

    for r in reses:
        res.append(r)
    return res

def get_cursor():
    db = MySQLdb.connect("localhost", "sol315", "sol315pass", db_name)
    cursor = db.cursor()
    return cursor



cursor = get_cursor()

cursor.execute('show columns from features')
distinct_column_names = []

for f in cursor.fetchall():
    if f[0] != 'time':
        distinct_column_names.append(f[0])

ip_fingerprint = get_distinct(distinct_column_names, cursor)
print (len(ip_fingerprint))

webgls = get_column('gpuimgs', cursor)
IPs = get_column('IP', cursor)

size = len(webgls)
happend = {}
overlap = {}
