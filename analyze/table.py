#!/usr/bin/env python

from fingerprint import Fingerprint_Type, Fingerprint, Feature_Lists
from enum import Enum

class Table_Base():
  def __init__(self):
    self.print_table = None
    self.summary = None

  def run(self, cursor, table_name, extra_selector=""):
    raise RuntimeError("Method not implemeneted")

  def __str__(self):
    __str = ""
    for row in self.print_table:
      __str += ("{:<20}"*len(row)).format(*row) + "\n"

    if self.summary is not None:
      if self.fp_type == Fingerprint_Type.CROSS:
        __str += "Summary: {:3.2f}%CB  {:3.2f}%U\n".format(self.summary[0]*100.0, self.summary[1]*100.0)
      else:
        __str += "Summary: {:3.2f}%U\n".format(self.summary*100.0)
    return __str

  def __latex_helper(self):
    latex = ""
    for i, row in enumerate(self.print_table):
      if i is 0:
        header = "\\begin{tabular}{|l||"
        for _ in range(len(row)):
          header += "l|"
        header += "}\hline"
        latex += "{}\n".format(header)
        latex += "{} {}\n".format(" & ".join(row), "\\\\ \hline \hline")
      else:
        latex += "{} {}\n".format(" & " * (len(row) - 1), "\\\\[-7pt]")
        latex += "{} {}\n".format(" & ".join(row).replace('%', '\%'), "\\\\ \hline")

    latex += "\\end{tabular}\n"
    latex += "\\vspace{0.05in}\n\n"
    if self.summary is not None:
      if self.fp_type == Fingerprint_Type.CROSS:
        latex += "Summary: ${:3.2f}$\%CB  ${:3.2f}$\%U\n".format(self.summary[0]*100.0, self.summary[1]*100.0)
        latex += "Average Identifable: ${:3.2f}$\%\n".format(self.summary[0]*self.summary[1]*100)
      else:
        latex += "Summary: ${}$\%U\n".format(self.summary*100)
    return latex

  def __format__(self, code):
    if code == "latex":
      return self.__latex_helper()
    else:
      return self.__str__()

class Results_Table(Table_Base):
  def __init__(self, fp_type, feat_list, browsers):
    Table_Base.__init__(self)
    self.fp_type, self.feat_list, self.browsers = fp_type, feat_list, browsers

  def __cross_helper(self, b1, b2, cursor, table_name, attrs, extra_selector):
    cursor.execute("SELECT user_id FROM {} WHERE browser='{}' {}".format(table_name, b1, extra_selector))
    tuids = [uid for uid, in cursor.fetchall()]

    uids = []
    for uid in tuids:
      cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}' {}".format(table_name, uid, b2, extra_selector))
      for uid, in cursor.fetchall():
        uids.append(uid)

    if len(uids) is 0:
        return None

    fp_to_count = {}
    num_cross_browser = 0.0

    for uid in uids:
      cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
      image1_id = cursor.fetchone()[0]
      #cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
      cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
      image2_id = cursor.fetchone()[0]

      fp_1 = Fingerprint(cursor, image1_id, table_name, Fingerprint_Type.CROSS, attrs)
      fp_2 = Fingerprint(cursor, image2_id, table_name, Fingerprint_Type.CROSS, attrs)

      if fp_1 == fp_2:
        num_cross_browser += 1
        if fp_1 in fp_to_count:
          fp_to_count[fp_1] += 1
        else:
          fp_to_count.update(
            {
              fp_1: 1
            }
          )

    num_distinct = max(float(len(fp_to_count)), 1.0)
    num_unique = 0.0
    for _, count in fp_to_count.items():
      if count == 1:
        num_unique += 1.0

    num_uids = max(float(len(uids)), 1.0)

    return int(num_uids), num_cross_browser/num_uids, num_unique/num_distinct

  def __single_helper(self, b, cursor, table_name, attrs, extra_selector):
    cursor.execute("SELECT image_id FROM {} WHERE browser='{}' {}".format(table_name, b, extra_selector))
    image_ids = [uid for uid, in cursor.fetchall()]

    if len(image_ids) is 0:
      return None

    fp_to_count = {}
    for uid in image_ids:
      fp = Fingerprint(cursor, uid, table_name, Fingerprint_Type.SINGLE, attrs)
      if fp in fp_to_count:
        fp_to_count[fp] += 1
      else:
        fp_to_count.update(
          {
            fp : 1
          }
        )

    num_distinct = max(float(len(fp_to_count)), 1.0)
    num_unique = 0.0
    for _, count in fp_to_count.items():
      if count == 1:
        num_unique += 1.0
    num_uids = len(image_ids)

    return int(num_uids), num_unique/num_distinct

  def run(self, cursor, table_name, extra_selector=""):
    self.res_table = {}
    if self.fp_type == Fingerprint_Type.CROSS:
      for i in range(len(self.browsers)):
        for j in range(i + 1, len(self.browsers)):
          b1, b2 = self.browsers[i], self.browsers[j]
          self.res_table.update(
            {
              (b1, b2): self.__cross_helper(b1, b2, cursor, table_name, self.feat_list, extra_selector)
            }
          )

      for i in range(len(self.browsers)):
        for j in range(0, i):
          b1, b2 = self.browsers[i], self.browsers[j]
          self.res_table.update(
            {
              (b1, b2): self.res_table[(b2, b1)]
            }
          )
      self.print_table = []
      self.print_table.append(["Browser"] + self.browsers)
      for b1 in self.browsers:
        row = [b1]
        for b2 in self.browsers:
          try:
            _, cb, u = self.res_table[(b1, b2)]
            row.append("{:3.1f}%CB  {:3.1f}%U".format(cb*100.0, u*100.0))
          except:
            row.append("")
        self.print_table.append(row)

      ave_cb, ave_u, sum_weights = 0.0, 0.0, 0.0
      for _, val in self.res_table.items():
        try:
          count, cb, u = val
        except:
          continue

        sum_weights += float(count)
        ave_cb += float(cb)*float(count)
        ave_u += float(u)*float(count)

      self.summary = ave_cb/sum_weights, ave_u/sum_weights
    else:
      for b in self.browsers:
        self.res_table.update(
          {
            b : self.__single_helper(b, cursor, table_name, self.feat_list, extra_selector)
          }
        )

      self.print_table = []
      self.print_table.append(["Browser"] + self.browsers)
      row = [""]
      for b in self.browsers:
        try:
          _, u = self.res_table[b]
          row.append("{:3.1f} %U".format(u*100.0))
        except:
          row.append("")
      self.print_table.append(row)

      ave_u, sum_weights = 0.0, 0.0
      for _, val in self.res_table.items():
        try:
          count, u = val
        except:
          continue

        sum_weights += count
        ave_u += u*count

      self.summary = ave_u/sum_weights


class Feature_Table(Table_Base):
  def __init__(self):
    Table_Base.__init__(self)


  def __is_all_same(self, array):
    first = array[0]
    for e in array:
      if e != first:
        return False

    return True

  def __helper(self, cursor, table_name, feature, extra_selector=""):
    cursor.execute("SELECT DISTINCT(user_id) from {}".format(table_name))

    cb_total = 0.0
    num_vals = 0.0
    cb_count = 0.0
    fp_to_count_cross = {}
    fp_to_count_single = {}
    data = cursor.fetchall()

    for user_id, in data:
      cb_prints = []
      cursor.execute("SELECT image_id from {} where user_id='{}' {}".format(table_name, user_id, extra_selector))
      ids = [x for x, in cursor.fetchall()]
      for image_id in ids:
        cb_prints.append(Fingerprint(cursor, image_id, table_name, Fingerprint_Type.CROSS, feature))
        single_fp = Fingerprint(cursor, image_id, table_name, Fingerprint_Type.SINGLE, feature)
        if single_fp in fp_to_count_single:
          fp_to_count_single[single_fp] += 1
        else:
          fp_to_count_single.update(
            {
              single_fp: 1
            }
          )

      if len(ids) > 1:
        cb_total += 1.0;
        if self.__is_all_same(cb_prints):
          cb_count += 1.0
          fp = cb_prints[0]
          if fp in fp_to_count_cross:
            fp_to_count_cross[fp] += 1
          else:
            fp_to_count_cross.update(
              {
                fp: 1
              }
            )

    cb_distinct = float(len(fp_to_count_cross))
    cb_unique = 0.0
    for _, count in fp_to_count_cross.items():
      if count == 1:
        cb_unique += 1.0

    single_distinct = float(len(fp_to_count_single))
    single_unique = 0.0
    for _, count in fp_to_count_single.items():
      if count == 1:
        single_unique += 1.0
    cb_total = max(cb_total, 1.0)
    single_distinct = max(single_distinct, 1.0)
    cb_distinct = max(cb_distinct, 1.0)

    return single_unique/single_distinct, cb_count/cb_total, cb_unique/cb_distinct

  def run(self, cursor, table_name, extra_selector=""):
    self.res_table = []
    for feat in Feature_Lists.All:
      self.res_table.append(self.__helper(cursor, table_name, feat, extra_selector))

    self.print_table = [["Feature", "Single-browser uniqueness", "Cross-browser stability", "Cross-browser uniqueness"]]
    for i in range(len(self.res_table)):
      feat = Feature_Lists.All[i]
      su, cb, cbu = self.res_table[i]
      self.print_table.append([feat, "{:3.1f}%U".format(su*100), "{:3.1f}%CB".format(cb*100),"{:3.1f}%U".format(cbu*100)])

class Diff_Table(Table_Base):
  VAL = Enum("VAL", "EQ LT GT")
  def __init__(self, fp_type, feat_list_A,  feat_list_B, browsers):
    Table_Base.__init__(self)
    self.fp_type, self.feat_list_A, self. feat_list_B, self.browsers = fp_type, feat_list_A,  feat_list_B, browsers

  def run(self, cursor, table_name, extra_selector=""):
    self.table_A = Results_Table(self.fp_type, self.feat_list_A, self.browsers)
    self.table_A.run(cursor, table_name, extra_selector)

    table_B = Results_Table(self.fp_type, self.feat_list_B, self.browsers)
    table_B.run(cursor, table_name, extra_selector)

    self.res_table = {}
    for key, A in self.table_A.res_table.items():
      if A is not None:
        B = table_B.res_table[key]
        e = []
        for i in range(len(A)):
          t = None
          if A[i] == B[i]:
            t = VAL.EQ
          elif A[i] < B[i]:
            t = VAL.LT
          else:
            t = VAL.GT
          e.append(A[i], t)


    self.summary = self.table_A.summary


  def __str__(self):
    self.print_table = self.table_A.print_table
    return Table_Base.__str__(self)

  def __frmt_helper(_, val, t):
    if t == VAL.EQ:
      return val
    elif t == VAL.LT:
      return "{\\color{blue} " + str(val) + "$\\downarrow$}"
    else:
      return "{\\color{red} " + str(val) + "$\\uparrow$}"

  def __latex_helper(self):
    self.print_table = []
    self.print_table.append(["Browser"] + self.browsers)
    if self.fp_type is Fingerprint_Type.CROSS:
      for b1 in self.browsers:
        row = [b1]
        for b2 in self.browsers:
          try:
            _, cb, u = self.res_table[(b1, b2)]
            val, t = cb
            out = self.__frmt_helper("{}%CB".format(val), t)
            val, t = u
            out += self.__frmt_helper("{}%CB".format(val), t)
            row.append(out)
          except:
            row.append("")
        self.print_table.append(row)

  def __format__(self, code):
    if code == "latex":
      self.__latex_helper()
      return Table_Base.__format__(self, code)
    else:
      return self.__str__()


class Summary_Table(Table_Base):
  def __init__(self, browsers):
    Table_Base.__init__(self)
    self.browsers = browsers

  def run(self, cursor, table_name):

    self.print_table = []
    self.print_table.append(["Type", "amiunique.org", "Our's"])
    row = ["Cross Browser"]

    ami = Results_Table(Fingerprint_Type.CROSS, Feature_Lists.CB_Amiunique, self.browsers)
    ami.run(cursor, table_name)

    ours = Results_Table(Fingerprint_Type.CROSS, Feature_Lists.Cross_Browser, self.browsers)
    ours.run(cursor, table_name)

    summary = ami.summary
    row.append("{:3.2f}%U".format(summary[0]*summary[1]*100.0))
    summary = ours.summary
    row.append("{:3.2f}%U".format(summary[0]*summary[1]*100.0))
    self.print_table.append(row)

    row = ["Single Browser"]

    ami = Results_Table(Fingerprint_Type.SINGLE, Feature_Lists.Amiunique, self.browsers)
    ami.run(cursor, table_name)

    ours = Results_Table(Fingerprint_Type.SINGLE, Feature_Lists.Single_Browser, self.browsers)
    ours.run(cursor, table_name)

    summary = ami.summary
    row.append("{:3.2f}%U".format(summary*100.0))
    summary = ours.summary
    row.append("{:3.2f}%U".format(summary*100.0))
    self.print_table.append(row)