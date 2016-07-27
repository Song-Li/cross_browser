#!/usr/bin/env python

from fingerprint import Fingerprint_Type

class Table_Base():
  def __init__(self, fp_type, feat_list, browsers):
    self.fp_type, self.feat_list, self.browsers = fp_type, feat_list, browsers
    self.print_table = None

  def gen_res(self, cursor, table_name, extra_selector):
    raise RuntimeError("Method not implemeneted")

  def __str__(self):
    __str = ""
    for row in self.print_table:
      __str += ("{:<15}"*len(row)).format(*row) + "\n"

    return __str

  def __format__(self, code):
    if code == "latex":

