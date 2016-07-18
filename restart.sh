python wipe_table.py cross_browser_cn data uid;
cp -r /home/site/data /home/site/databk;
find /home/site/data/images/origins/ -name "*.*" -delete
sudo rm -r /home/site/data/images/generated/* ;
sudo /etc/init.d/apache2 restart
