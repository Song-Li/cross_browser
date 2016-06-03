python wipe_table.py cross_browser data
cp -r /home/site/data /home/site/databk;
sudo rm -r /home/site/data/images/origins/* ;
sudo rm -r /home/site/data/images/generated/* ;
sudo /etc/init.d/apache2 restart
