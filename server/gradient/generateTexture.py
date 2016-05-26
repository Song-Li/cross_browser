import sys
import os.path
import datetime
import urllib
from PIL import Image, ImageChops, ImageFilter
import numpy

global root
root = '/home/sol315/data/'

for i in range(1,256):
    print i
    imarray = numpy.random.rand(256,256,3) * 255

    for j in range(0,256):
        for k in range(0,256):
            imarray[j][k] = imarray[j / i * i][k / i * i]

    img = Image.fromarray(imarray.astype('uint8')).convert('RGBA')
    img.save(root + 'images/gradient/textures/' + str(i) + '.png')
