python wipe_table.py cross_browser data
cp -r /home/sol315/data /home/sol315/databk;
sudo rm -r /home/sol315/data/images/origins/* ;
sudo rm -r /home/sol315/data/images/generated/* ;
sudo /etc/init.d/apache2 restart
