from boto.mturk.connection import MTurkConnection
from boto.mturk.price import Price
import ConfigParser

def decode(code):
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
    return res

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


for hit in hits:
    print "hit ID: ", hit.HITId
    assignments = mturk.get_assignments(hit.HITId, status="Submitted", page_size=100)
    #assignments = mturk.get_assignments(hit.HITId, page_size=100)
    print len(assignments)
    for assignment in assignments:
        print assignment.WorkerId
        answers = assignment.answers[0]
        code = "-1"
        for answer in answers:
            if answer.qid == 'Q5FreeTextInput':
                code = decode(answer.fields[0])

        if code != '-1':
            if(code.find('_') != -1):
                bonus(mturk, price, assignment.WorkerId, assignment.AssignmentId)
            else:
                approve(mturk, assignment.WorkerId, assignment.AssignmentId)
        else:
            reject(mturk, assignment.WorkerId, assignment.AssignmentId)


