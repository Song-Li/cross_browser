import BaseHTTPServer
import os.path
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import urllib
import json
import linecache 
from PIL import Image, ImageChops, ImageFilter
import numpy as np
from scipy.ndimage import (label,find_objects)

open_root = "/home/sol315/data/images/"


def thicker(img):
    pixels = img.load()
    origin = img.copy()
    ori = origin.load()
    for i in range(1, 255):
        for j in range(1,255):
            pixels[i,j] = ori[i - 1, j - 1] | ori[i,j] | ori[i,j - 1] | ori[i + 1, j - 1] | ori[i - 1,j] | ori[i + 1,j] | ori[i - 1, j + 1] | ori[i, j + 1] | ori[i + 1, j + 1]

    return img

def getEdge(img):
    edge = img
    edge = edge.convert('L')
    edge = edge.point(lambda x: 0 if x < 110 else 255, '1')
    return edge

img = Image.open(open_root + 'edge.png')
getEdge(img).convert('RGBA').save(open_root + 'thickEdge.png')
