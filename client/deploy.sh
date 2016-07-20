rm -rf /home/sol315/mfChina/*;
cp -rf ./* /home/sol315/mfChina/;
cp -rf ./getid/* /home/sol315/mfChina/;
cd /home/sol315/mfChina;
git checkout coding-pages;
git add -A;
git commit -m "new";
git push -u origin coding-pages;
