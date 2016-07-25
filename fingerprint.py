#!/usr/bin/env python

from enum import Enum
from sets import Set

class Fingerprint_Type(Enum):
  CROSS = 0
  SINGLE = 1

def Fingerprint_Base:
  def __init__(self, data):
    self.fp = None

  def __eq__(self, other):
    return self.fp == other.fp

  def __ne__(self, other):
    return not __eq__(other)

  def __hash__(self):
    return hash(self.fp)

def GPU_Fingerprint(Fingerprint_Base):
  #Data is array of gpu hashes up to video
  def __init__(self, data, fp_type):
    self.cross_mask = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
    self.fp = ""
    if fp_type == Fingerprint_Type.CROSS:
      for i, h in enumerate(data):
        if self.cross_mask[i]:
          self.fp += str(h)
    else:
      self.fp = data.join("")

def Lang_Fingerprint(Fingerprint_Base):
  #Data is string of if the lang can be displayed or not
  def __init__(self, data, fp_type):
    self.cross_mask = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0]
    self.fp = ""
    if fp_type == Fingerprint_Type.CROSS:
      for i, l in enumerate(list(data)):
        if self.cross_mask[i]:
          self.fp += str(l)
    else:
      self.fp = data

def Video_Fingerprint(Fingerprint_Base):
  # Data is array of video hash codes
  def __init__(self, data):
    self.ctx = []
    self.gl = []
    for i, h in enumerate(data):
      if i % 2 == 0:
        self.ctx.append(h)
      else:
        self.gl.append(h)

  def __eq__(self, other):
    is_same = False
    for i in range(len(self.ctx)):
      for j in range(i, len(self.ctx)):
        if self.ctx[i] == other.ctx[j]:
          is_same = True

    if not is_same:
      return False

    for i in range(len(self.gl)):
      for j in range(i, len(self.gl)):
        if self.gl[i] == other.gl[j]:
          return True

    return False

  def __ne__(self, other):
    return not __eq__(other)

  def __hash__(self, other):
    return 0

def Feature_Fingerprint(Fingerprint_Base):
  def __init__(self, data):
    self.fp = data


class Fingerprint(Fingerprint_Base):
  def __init__(self, cursor, image_id, table_name, fp_type, attrs):
    self.cursor = cursor
    self.image_id = image_id
    self.table_name = table_name
    self.fp_type = fp_type

    self.attrs = Set()
    self.fp = []

  def add_attr(self, attr):
    if attr not in self.attrs:
      self.attrs.add(attr)

      self.cursor.execute("SELECT {} from {} where image_id='{}'".format(attr, self.table_name, self.image_id))
      data = self.cursor.fetchone()[0]
      if attr == 'langs':
        self.fp.append(Lang_Fingerprint(data, self.fp_type))
      elif attr == 'hashes':
        hashes = data.split("&")
        self.fp.append(GPU_Fingerprint(hashes[:27], self.fp_type))
        if self.fp_type == Fingerprint_Type.SINGLE:
          self.fp.append(Video_Fingerprint(hashes[27:]))
      else:
        self.fp.append(Feature_Fingerprint(data))
