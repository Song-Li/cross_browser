from boto.mturk.connection import MTurkConnection
from boto.mturk.price import Price
import MySQLdb
import ConfigParser
db_name = 'cross_browser'

def decode(cursor, code):
    code.strip()
    mapping = ['D','E','F','B','G','M','N','A','I','L']
    res = ""
    for c in code:
        if c != 'O':
            try:
                res += str(mapping.index(c))
            except:
                return '-1'
        else:
            res += '_'

    if res == '':
        return '-1'

    uid = -1
    if res.find('_') != -1:
        uid = int(res[:-2])
    else:
        uid = int(res)

    cursor.execute("SELECT payed FROM {} WHERE id='{}'".format('uid', uid))
    data = cursor.fetchone()
    if data == None or data[0] != None:
        return '-1'

    return res

def update(cursor, uid, text):
    cursor.execute("UPDATE {} SET payed='{}' WHERE id='{}'".format('uid', text, uid))
    

def bonus(mturk, price, workerId, assignmentId):
    mturk.grant_bonus(workerId, assignmentId, price, 'Thank you for finishing three browsers!')
    mturk.approve_assignment(assignmentId, feedback="Thank you")
    print 'Bonus', workerId

def approve(mturk, workerId, assignmentId):
    mturk.approve_assignment(assignmentId, feedback="Thank you")
    print 'approved', workerId

def reject(mturk, workerId, assignmentId):
    mturk.reject_assignment(assignmentId, feedback="Not the right code or you have already done the same task!")
    print 'rejected', workerId

config = ConfigParser.ConfigParser()
config.read("./keys.ignore")
ACCESS_ID = config.get('keys', 'ACCESS_ID')
SECRET_KEY = config.get('keys', 'SECRET_KEY')
price = Price(0.01)


HOST = 'mechanicalturk.amazonaws.com'

mturk = MTurkConnection(aws_access_key_id=ACCESS_ID,
        aws_secret_access_key=SECRET_KEY,
        host=HOST)
hits = mturk.get_all_hits()
db = MySQLdb.connect("localhost", "erik", "erik", db_name)
cursor = db.cursor()


for hit in hits:
    if hit.HITStatus != 'Assignable':
        continue
    assignments = mturk.get_assignments(hit.HITId, status="Submitted", page_size=100)
    #assignments = mturk.get_assignments(hit.HITId, page_size=100)

    for assignment in assignments:
        answers = assignment.answers[0]
        code = "-1"
        for answer in answers:
            if answer.qid == 'Q5FreeTextInput':
                code = decode(cursor, answer.fields[0])
        print code

        if code != '-1':
            if(code.find('_') != -1):
                bonus(mturk, price, assignment.WorkerId, assignment.AssignmentId)
                update(cursor, code[:-2], 'bouns')
                db.commit()
            else:
                approve(mturk, assignment.WorkerId, assignment.AssignmentId)
                update(cursor, code, 'approve')
                db.commit()
        else:
            reject(mturk, assignment.WorkerId, assignment.AssignmentId)
