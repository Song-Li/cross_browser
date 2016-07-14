#!/usr/bin/env python

from PIL import Image, ImageChops
import os
from sets import Set
import pdb, traceback, sys

def main():
  img_root = '.'
  uids = Set()
  for f in os.listdir(img_root):
    if f.find("lang.png") != -1:
      num = int(f.split("_")[0])
      uids.add(num)

  for uid in uids:
    analyzer = LangAnalyzer(img_root, uid)
    print analyzer.anaylze()

class LangAnalyzer:
  def __init__(self, img_root, uid):
    self.img_root = img_root
    self.uid = uid
    img = Image.open("{}/{}_{}_lang.png".format(self.img_root, self.uid, 36))
    img = img.convert("1")
    pixels = img.load()
    minRow = int(1e9)
    minCol = int(1e9)
    maxRow = 0
    maxCol = 0
    cols, rows = img.size
    for j in range(rows):
      for i in range(cols):
        if pixels[i, j] is 0:
          minRow = min(j, minRow)
          minCol = min(i, minCol)
          maxRow = max(j, maxRow)
          maxCol = max(i, maxCol)

    self.cannot_disp_img = img.crop((minCol, minRow, maxCol + 1, maxRow + 1))
    self.cols, self.rows = self.cannot_disp_img.size

  def anaylze(self):
    results = []
    for index in range(35):
      img = Image.open("{}/{}_{}_lang.png".format(self.img_root, self.uid, index))
      img = img.convert("1")
      test_cols, test_rows = img.size
      cannot_disp = False
      for j in range(test_rows - self.rows):
        for i in range(test_cols - self.cols):

          try:
            test_img = img.crop((i, j, self.cols, self.rows))
            if ImageChops.difference(self.cannot_disp_img, test_img).getbbox() is None:
              cannot_disp = True
              break
          except:
            type, value, tb = sys.exc_info()
            traceback.print_exc()
            pdb.post_mortem(tb)

        if cannot_disp:
          break

      if cannot_disp:
        results.append(1)
      else:
        results.append(0)


if __name__ == '__main__':
  main()