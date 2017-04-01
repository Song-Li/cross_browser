rm -r ~/projs/test_site/*
cp -rf ./* ~/projs/test_site/;
cd ~/projs/test_site/ ;
git add -A;
git commit -m "new";
git push -u origin master;
