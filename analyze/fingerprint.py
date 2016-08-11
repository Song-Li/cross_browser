#!/usr/bin/env python

from enum import Enum
from sets import Set
from json import loads

class Feature_Lists(Enum):
  Mapped_All="Agent, Timezone, Screen Ratio, Resolution, Simple Resolution, Fontlist (Flash), Plugins, Cookies enabled, Localstorage enabled, Platform, Acceptable formats, Encoding, Headerkeys, Do not track?, Ad Block Enabled, Canvas Rendering, Prefered Language, GPU Images, Writing Sysem Supported?, Fonts (javascript), Writitng System Display, Video, Audio, Cpu cores, Renderer, Simpled Renderer, Vendor".split(",")
  #Mapped_All="Resolution, Simple Resolution".split(",")
  All="agent, timezone, ratio, resolution, simple_resolution, fontlist, plugins, cookie, localstorage, platform, accept, encoding, headerkeys, dnt, adBlock, canvastest, language, hashes, langs, fonts, lang_hash, video, audio, cpucores, gpu, simple_gpu, vendor".replace(" ", "").split(",")
  #All="resolution, simple_resolution".replace(" ", "").split(",")
  Cross_Browser="cpucores, ratio, fonts, langs, audio, timezone, accept, hashes".replace(" ", "").split(",")
  #Cross_Browser="cpucores".replace(" ", "").split(",")
  Entropy = "agent, plugins, fontlist, simple_resolution, timezone, cookie".replace(" ","").split(",")
  Single_Browser=All
  Amiunique="agent, timezone, simple_resolution, plugins, cookie, localstorage, accept, encoding, language, headerkeys, dnt, adBlock, canvastest".replace(" ", "").split(",")
  CB_Amiunique="accept, timezone, simple_resolution, localstorage".replace(" ", "").split(",")
  Boda="platform, simple_resolution, timezone, fonts".replace(" ", "").split(",")
  #Boda="fonts".replace(" ", "").split(",")

def read_file(name):
  with open(name, "r") as file:
    return file.read()

class Masks(Enum):
  try :
    GPU = loads(read_file("GPU_Mask.txt"))
    Lang = loads(read_file("Lang_Mask.txt"))
    Font = loads(read_file("Font_Mask.txt"))
    #Font = loads(read_file("Font_All_Mask.txt"))
  except:
    pass

class Fingerprint_Type(Enum):
  CROSS = 0
  SINGLE = 1

def masked_array(array, mask):
  return [e for i, e in enumerate(array) if mask[i]]

class Fingerprint_Base:
  def __init__(self):
    self.fp = None
    self.valid = True

  def __eq__(self, other):
    if self.valid and other.valid:
      return self.fp == other.fp
    else:
      return True

  def __ne__(self, other):
    return not self.__eq__(other)

  def __hash__(self):
    if self.valid:
      return hash("".join(str(x) for x in self.fp))
    else:
      return hash(None)

  def __str__(self):
    return str(self.fp)

  def __format__(self, format_spec):
    return format(str(self), format_spec)

class GPU_Fingerprint(Fingerprint_Base):
  #Data is array of gpu hashes up to video
  def __init__(self, data, fp_type, valid, browser, b2, masks=""):
    Fingerprint_Base.__init__(self)
    if fp_type == Fingerprint_Type.CROSS:
      self.valid = valid
      if valid:
        try:
          if masks == "":
            mask = Masks.GPU["{}{}".format(browser, b2)]
          else:
            mask = masks
        except:
          self.valid = False
          self.fp = None
          return

        self.fp = []
        for i, h in enumerate(data):
            if mask[i]:
              self.fp.append(h)
    else:
      self.fp = data


class Lang_Fingerprint(Fingerprint_Base):
  #Data is string of if the lang can be displayed or not
  def __init__(self, data, fp_type, browser, b2):
    Fingerprint_Base.__init__(self)
    if fp_type == Fingerprint_Type.CROSS:
      try:
        mask = Masks.Lang["{}{}".format(browser, b2)]
      except:
        self.valid = False
        self.fp = None
        return
      self.fp = []
      for i, h in enumerate(data):
        if mask[i]:
          self.fp.append(h)
    else:
      self.fp = data

class Video_Fingerprint():
  # Data is array of video hash codes
  def __init__(self, data):
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
  def __init__(self, data, fp_type, browser, b2):
    Fingerprint_Base.__init__(self)
    if fp_type == Fingerprint_Type.CROSS:
      try:
        mask = Masks.Font["{}{}".format(browser, b2)]
      except:
        mask = [1] * len(data);

      self.fp = []
      for i, h in enumerate(data):
        if mask[i]:
          self.fp.append(h)
    else:
      self.fp = data

class Core_Fingerprint():
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
  def __init__(self, cursor, image_id, table_name, fp_type, to_add_attrs, b2=None, masks=""):
    self.cursor, self.image_id, self.table_name, self.fp_type, self.b2,self.masks = cursor, image_id, table_name, fp_type, b2, masks
    if fp_type == Fingerprint_Type.CROSS:
      assert(b2 is not None)

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
          Lang_Fingerprint(data, self.fp_type, self.browser, self.b2)
        )

      elif attr == 'hashes':
        hashes = data.split("&")
        if self.browser == self.b2:
            self.fp.append(
              GPU_Fingerprint(hashes[:28], self.fp_type, not self.software_render, self.browser, self.b2, masks=[1 for i in range(28)])
            )
        else:
            self.fp.append(
              GPU_Fingerprint(hashes[:28], self.fp_type, not self.software_render, self.browser, self.b2, masks=self.masks)
            )

      elif attr == 'fonts':
        self.fp.append(
          Font_Fingerprint(list(data), self.fp_type, self.browser, self.b2)
        )
      elif attr == 'video':
        hashes = data.split("&")
        self.fp.append(
          Video_Fingerprint(hashes)
        )
      elif attr == 'audio':
        if self.browser == 'IE' or self.b2 == 'IE':
            self.fp.append('not supported')
        else:
          self.fp.append(
            Feature_Fingerprint(data.split('_')[0])
          )
      elif attr == 'cpucores':
        if self.browser == 'Chrome' and self.b2 == 'Firefox':
          self.fp.append(
            data.split(',')[0]
          )

        if self.browser == 'Firefox' and self.b2 == 'Chrome':
          self.cursor.execute("SELECT user_id from {} where image_id='{}'".format(self.table_name, self.image_id))
          user = self.cursor.fetchone()[0]

          self.cursor.execute("SELECT {} from {} where user_id='{}' and browser='{}'".format(attr, self.table_name, user, 'Chrome'))
          data = self.cursor.fetchone()[0]
          self.fp.append(
            data.split(',')[0]
          )

      else:
        self.fp.append(
          Feature_Fingerprint(data)
        )

  def __hash__(self):
    hash_code = hash(None)
    for fp in self.fp:
      hash_code ^= hash((hash_code, fp))

    return hash_code

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
