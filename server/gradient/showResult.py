import os
import matplotlib.pyplot as plt
import array
from PIL import Image, ImageChops, ImageFilter

root = '/home/sol315/data/images/gradient/'
global num
num = 0

def getDifference(img1, img2):
    sub = ImageChops.subtract(img1,img2, 0.005)
    subt = ImageChops.subtract(img2, img1, 0.005)
    return ImageChops.add(sub, subt).convert('RGB')

def getDiff(img1, img2, pic_id):
    global num
    res = 0
    img1 = img1.convert('RGB')
    img2 = img2.convert('RGB')
    diff = ImageChops.difference(img1, img2)
    diff = getDifference(img1, img2)

    if not os.path.exists(root + "diff/" + str(pic_id)):
        os.makedirs(root + "diff/" + str(pic_id))
    diff.save(root + "diff/" + str(pic_id) + '/' + str(num) + '.png')
    num += 1
    pixels = diff.getdata()
    for pixel in pixels:
        if pixel != (0,0,0):
            res += 1
    return res


dirs = os.listdir(root + "origin/")
res = array.array('f')

for i in range(1,256):
    total = 0;
    num = 0
    print i
    res.append(0)
    for dir_name1 in dirs:
        for dir_name2 in dirs:
            img1 = Image.open(root + "origin/" + dir_name1 + '/' + str(i) + '.png')
            img2 = Image.open(root + "origin/" + dir_name2 + '/' + str(i) + '.png')
            dif = getDiff(img1, img2, i)
            res[i - 1] += dif 
            total += 256 * 256
    #res[i - 1] = res[i - 1] * 100 / total

plt.plot(range(255), res)
plt.savefig(root + 'res.png')
print res
