from boto.mturk.connection import MTurkConnection
from boto.mturk.price import Price
import MySQLdb
import ConfigParser

config = ConfigParser.ConfigParser()
config.read("./keys.ignore")
ACCESS_ID = config.get('keys', 'ACCESS_ID')
SECRET_KEY = config.get('keys', 'SECRET_KEY')


HOST = 'mechanicalturk.amazonaws.com'

mturk = MTurkConnection(aws_access_key_id=ACCESS_ID,
        aws_secret_access_key=SECRET_KEY,
        host=HOST)

hits = mturk.get_all_hits()
for hit in hits:
    print hit.HITStatus, hit.HITId

for i in range(10):
    mturk.create_hit(hit_type='3OYYRRZZOMBPXNS8UV52M21YUT83I4', hit_layout='3D2E7O6ZDT0A5UK6ZRYSZBRT8ADMAZ', max_assignments=9)
#mturk.expire_hit(hit_id='3QE4DGPGBRXCU1WYAT52RFNY0DKG4H')

