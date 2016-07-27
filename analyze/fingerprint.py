#!/usr/bin/env python

from enum import Enum
from sets import Set
from json import loads

class Feature_Lists(Enum):
  All="agent, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, headerkeys, dnt, adBlock,language, hashes, langs, fonts, gpu, vendor, lang_hash, canvastest, video".replace(" ", "").split(",")
  Cross_Browser="langs, timezone, fonts, hashes".replace(" ", "").split(",")
  Single_Browser=All
  Amiunique="agent, timezone, resolution, fontlist, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock, canvastest".replace(" ", "").split(",")
  CB_Amiunique="accept, timezone, resolution, localstorage, cookie".replace(" ", "").split(",")

def read_file(name):
  with open(name, "r") as file:
    return file.read()

class Masks(Enum):
  GPU = loads(read_file("GPU_Mask.txt"))
  Langs = loads(read_file("Lang_Mask.txt"))
  Fonts = loads(read_file("Font_Mask.txt"))

class Fingerprint_Type(Enum):
  CROSS = 0
  SINGLE = 1

def masked_array(array, mask):
  return [e for i, e in enumerate(array) if mask[i]]

class Fingerprint_Base:
  def __init__(self, browser):
    self.fp = None
    self.valid = True
    self.mask = None
    self.browser = browser

  def __eq__(self, other):
    self.masked_fp = []
    other.masked_fp = []
    if self.valid and other.valid:
      if self.mask is not None and self.browser != other.browser:
        self.masked_fp = masked_array(self.fp, self.mask["{}{}".format(self.browser, other.browser)])
        other.masked_fp = masked_array(other.fp, other.mask["{}{}".format(self.browser, other.browser)])
        return self.masked_fp == other.masked_fp
      else:
        return self.fp == other.fp
    else:
      return True

  def __ne__(self, other):
    return not self.__eq__(other)

  def __hash__(self):
    return hash(None)

  def __str__(self):
    return str(self.fp)

  def __format__(self, format_spec):
    return format(str(self), format_spec)

class GPU_Fingerprint(Fingerprint_Base):
  #Data is array of gpu hashes up to video
  def __init__(self, data, fp_type, valid, browser):
    Fingerprint_Base.__init__(self, browser)
    self.fp = data
    if fp_type == Fingerprint_Type.CROSS:
      self.valid = valid
      if valid:
        self.mask = Masks.GPU


class Lang_Fingerprint(Fingerprint_Base):
  #Data is string of if the lang can be displayed or not
  def __init__(self, data, fp_type, browser):
    Fingerprint_Base.__init__(self, browser)
    self.fp = data

    if fp_type == Fingerprint_Type.CROSS:
      self.mask = Masks.Langs

class Video_Fingerprint():
  # Data is array of video hash codes
  def __init__(self, data, browser):
    self.valid = (data[0] != 'No video')
    self.ctx = Set()
    self.gl = Set()
    for i, h in enumerate(data):
      if i % 2 == 0:
        self.ctx.add(h)
      else:
        self.gl.add(h)

  def __eq__(self, other):
    if not self.valid or not other.valid:
      return True
    else:
      return len(self.ctx & other.ctx) != 0 and len(self.gl & other.gl) != 0

  def __ne__(self, other):
    return not self.__eq__(other)

  def __hash__(self):
    if self.valid:
      return hash(1.6180339887498948482*1e10)
    else:
      return hash(1.6180339887498948482*1e15)

  def __str__(self):
    return "{} {}".format(self.ctx, self.gl)

class Font_Fingerprint(Fingerprint_Base):
  def __init__(self, data, fp_type, browser):
    Fingerprint_Base.__init__(self, browser)
    self.fp = data
    if fp_type == Fingerprint_Type.CROSS:
      self.mask = Masks.Fonts

class Feature_Fingerprint():
  def __init__(self, data):
    self.fp = data

  def __eq__(self, other):
    return self.fp == other.fp

  def __ne__(self, other):
    return not self.__eq__(other)

  def __hash__(self):
    return hash(self.fp)

  def __str__(self):
    return str(self.fp)

class Fingerprint():
  # to_add_attrs a list or string
  def __init__(self, cursor, image_id, table_name, fp_type, to_add_attrs):
    self.cursor, self.image_id, self.table_name, self.fp_type = cursor, image_id, table_name, fp_type

    self.attrs = Set()
    self.fp = []
    self.cursor.execute("SELECT gpu, browser from {} where image_id='{}'".format(table_name, image_id))
    gpu, self.browser = cursor.fetchone()
    self.software_render = (gpu == "SwiftShader" or gpu == "Microsoft Basic Render Driver")
    if isinstance(to_add_attrs, list):
      for attr in to_add_attrs:
        self.__add_attr(attr)
    else:
      self.__add_attr(to_add_attrs)

  def __add_attr(self, attr):
    if attr not in self.attrs:
      self.attrs.add(attr)

      self.cursor.execute("SELECT {} from {} where image_id='{}'".format(attr, self.table_name, self.image_id))
      data = self.cursor.fetchone()[0]

      if attr == 'langs':
        self.fp.append(
          Lang_Fingerprint(data, self.fp_type, self.browser)
        )
      elif attr == 'hashes':
        hashes = data.split("&")
        self.fp.append(
          GPU_Fingerprint(hashes[:27], self.fp_type, not self.software_render, self.browser)
        )
      elif attr == 'fonts':
        self.fp.append(
          Font_Fingerprint(list(data), self.fp_type, self.browser)
        )
      elif attr == 'video':
        hashes = data.split("&")
        self.fp.append(
          Video_Fingerprint(hashes, self.browser)
        )
      else:
        self.fp.append(
          Feature_Fingerprint(data)
        )

  def __hash__(self):
    return hash("".join(str(x) for x in self.fp))

  def __eq__(self, other):
    return self.fp == other.fp

  def __ne__(self, other):
    return not self.__eq__(other)

  def __str__(self):
    if isinstance(self.fp, list):
      return ", ".join(str(x) for x in self.fp)
    else:
      return str(self.fp)

  def __format__(self, format_spec):
    return format(str(self), format_spec)