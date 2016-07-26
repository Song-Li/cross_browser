#!/usr/bin/env python

from enum import Enum
from sets import Set

class Fingerprint_Type(Enum):
  CROSS = 0
  SINGLE = 1

class Fingerprint_Base:
  def __init__(self):
    self.fp = None

  def __eq__(self, other):
    return self.fp == other.fp

  def __ne__(self, other):
    return not self.__eq__(other)

  def __hash__(self):
    return hash(self.fp)

  def __str__(self):
    __str = ""
    if isinstance(self.fp, list):
      return ", ".join("{}".format(x) for x in self.fp)
    else:
      __str = str(self.fp)

    return __str

  def __format__(self, format_spec):
    return format(str(self), format_spec)

class GPU_Fingerprint(Fingerprint_Base):
  #Data is array of gpu hashes up to video
  def __init__(self, data, fp_type, valid):
    Fingerprint_Base.__init__(self)
    if fp_type == Fingerprint_Type.CROSS:
      self.valid = valid

      if valid:
        cross_mask = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0]
        self.fp = ""
        for i, h in enumerate(data):
          if cross_mask[i]:
            self.fp += str(h)
    else:
      self.valid = True
      self.fp = "".join(data)

  def __eq__(self, other):
    if self.valid and other.valid:
      return self.fp == other.fp
    else:
      return True

  def __hash__(self):
    if self.valid:
      return hash(self.fp)
    else:
      return hash(1.6180339887498948482*1e10)

class Lang_Fingerprint(Fingerprint_Base):
  #Data is string of if the lang can be displayed or not
  def __init__(self, data, fp_type):
    Fingerprint_Base.__init__(self)
    cross_mask = [1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0]
    if fp_type == Fingerprint_Type.CROSS:
      self.fp = ""
      for i, l in enumerate(list(data)):
        if cross_mask[i]:
          self.fp += str(l)
    else:
      self.fp = data

class Video_Fingerprint(Fingerprint_Base):
  # Data is array of video hash codes
  def __init__(self, data):
    self.ctx = Set()
    self.gl = Set()
    for i, h in enumerate(data):
      if i % 2 == 0:
        self.ctx.add(h)
      else:
        self.gl.add(h)

  def __eq__(self, other):
    return len(self.ctx & other.ctx) != 0 and len(self.gl & other.gl) != 0

  def __hash__(self):
    return hash(1.6180339887498948482*1e10)

  def __str__(self):
    return "{} {}".format(self.ctx, self.gl)

class Font_Fingerprint(Fingerprint_Base):
  def __init__(self, data, fp_type):
    cross_mask = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1]
    if fp_type == Fingerprint_Type.CROSS:
      self.fp = ""
      for i, font in enumerate(data):
        if cross_mask[i]:
          self.fp += font
    else:
      self.fp = "".join(data)

class Feature_Fingerprint(Fingerprint_Base):
  def __init__(self, data):
    Fingerprint_Base.__init__(self)
    self.fp = data

class Fingerprint(Fingerprint_Base):
  # to_add_attrs a list or string
  def __init__(self, cursor, image_id, table_name, fp_type, to_add_attrs):
    Fingerprint_Base.__init__(self)
    self.cursor, self.image_id, self.table_name, self.fp_type = cursor, image_id, table_name, fp_type

    self.attrs = Set()
    self.fp = []
    self.cursor.execute("SELECT gpu, browser from {} where image_id='{}'".format(table_name, image_id))
    gpu, browser = cursor.fetchone()
    self.software_render = gpu == "SwiftShader" or browser == "Edge"
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
          Lang_Fingerprint(data, self.fp_type)
        )
      elif attr == 'hashes':
        hashes = data.split("&")
        self.fp.append(
          GPU_Fingerprint(hashes[:27], self.fp_type, self.software_render)
        )
      elif attr == 'fonts':
        self.fp.append(
          Font_Fingerprint(list(data), self.fp_type)
        )
      else:
        self.fp.append(
          Feature_Fingerprint(data)
        )

  def __hash__(self):
    return hash("".join(str(x) for x in self.fp))