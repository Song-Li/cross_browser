python wipe_table.py cross_browser new_data uid;
find /home/site/data/images/origins/ -name "*.*" -delete
sudo rm -r /home/site/data/images/generated/* ;
sudo /etc/init.d/apache2 restart
