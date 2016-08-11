#!/usr/bin/env python

from fingerprint import Fingerprint_Type, Fingerprint, Feature_Lists
from enum import Enum
import math


class Table_Base():
  def __init__(self):
    self.print_table = None
    self.summary = None
    self.print_summary = None
    self.latex_summary = None

  def run(self, cursor, table_name, extra_selector=""):
    pass

  def __print_summary(self):
    pass

  def __latex_summary(self):
    pass

  def __str__(self):
    __str = ""
    for row in self.print_table:
      __str += ("{:<30}"*len(row)).format(*row) + "\n"

    if self.print_summary is not None:
      __str += self.print_summary

    return __str

  def __latex_helper(self):
    latex = ""
    for i, row in enumerate(self.print_table):
      if i is 0:
        header = "\\begin{tabular}{l"
        for _ in range(len(row)):
          header += "c"
        header += "c"
        header += "}\hline"
        latex += "{}\n".format(header)
        latex += "{} {}\n".format(" & ".join(row), "\\\\ \hline")
      else:
        latex += "{} {}\n".format(" & ".join(row).replace('%', '\%'), "\\\\")

    latex += "\hline \\end{tabular}\n"
    latex += "\\vspace{0.05in}\n\n"

    if self.latex_summary is not None:
      latex += self.latex_summary

    return latex

  def __format__(self, code):
    if code == "latex":
      return self.__latex_helper()
    else:
      return format(str(self), code)

class Gpu_Table(Table_Base):
  def __init__(self):
    Table_Base.__init__(self)
  
  def run(self, cursor, b1, b2, table_name, extra_selector):
    cursor.execute("SELECT user_id FROM {} WHERE browser='{}' {}".format(table_name, b1, extra_selector))
    tuids = [uid for uid, in cursor.fetchall()]

    uids = []
    for uid in tuids:
      cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}' {}".format(table_name, uid, b2, extra_selector))
      for uid, in cursor.fetchall():
        uids.append(uid)

    if len(uids) is 0:
        return None


    num_cross_browser = [0 for i in range(32)]
    all_hashes = [[] for i in range(32)]
    unique = 0
    num_img = 0
    self.print_table = []
    
    for uid in uids:
      cursor.execute("SELECT hashes FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
      hashes1 = cursor.fetchone()[0].split('&')
      num_img = len(hashes1)

      cursor.execute("SELECT hashes FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
      hashes2 = cursor.fetchone()[0].split('&')

      for i in range(len(hashes1)):
        if hashes1[i] == hashes2[i]:
          num_cross_browser[i] += 1.0
          all_hashes[i].append(hashes1[i])

    self.print_table.append(["image ID", "CB Rate", "Unique Rate"])
    for i in range(num_img):
      unique = 0
      row = []
      for a in all_hashes[i]:
        if all_hashes[i].count(a) == 1:
          unique += 1.0
      
      num = max(num_cross_browser[i], 1.0)
      uni = max(unique, 1.0)


      row.append("image " + str(i))
      row.append("{:3.2f}".format(num/len(uids) * 100))
      row.append("{:3.2f}".format(unique/num * 100))

      self.print_table.append(row)


class Cross_Table(Table_Base):
  def __init__(self, feat_list, browsers):
    Table_Base.__init__(self)
    self.feat_list, self.browsers = feat_list, browsers

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

      cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
      image2_id = cursor.fetchone()[0]

      fp_1 = Fingerprint(cursor, image1_id, table_name, Fingerprint_Type.CROSS, attrs, b2)
      fp_2 = Fingerprint(cursor, image2_id, table_name, Fingerprint_Type.CROSS, attrs, b1)

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

    entropy = 0.0
    num_distinct = max(float(len(fp_to_count)), 1.0)
    num_unique = 0.0
    for _, count in fp_to_count.items():
      if count == 1:
        num_unique += 1.0
      
      P = float(count) / float(num_cross_browser) 
      entropy -= P * math.log(P, 2)

    num_uids = max(float(len(uids)), 1.0)
    num_cross_browser = max(num_cross_browser, 1.0)

    return int(num_uids), num_cross_browser/num_uids, num_unique/num_cross_browser, entropy, num_cross_browser

  def __print_summary(self):
    __str = ""

    if self.summary is not None:
      __str += "Summary: {:3.2f}%CB  {:3.2f}%Uni\n".format(self.summary[0]*100.0, self.summary[1]*100.0)
      __str += "Average Identifable: {:3.2f}%Iden".format(self.summary[0]*self.summary[1]*100.0)

    return __str

  def __latex_summary(self):
    latex = "\LARGE\n"
    if self.summary is not None:
      latex += "Summary: ${:3.2f}$\%CB  ${:3.2f}$\%Uni\n\n".format(self.summary[0]*100.0, self.summary[1]*100.0)
      latex += "Average Identifable: ${:3.2f}$\%Iden\n\n".format(self.summary[0]*self.summary[1]*100)
    return latex

  def run(self, cursor, table_name, extra_selector=""):
    self.res_table = {}
    cross_count = 0
    self.entropy = 0.0
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
          num, cb, u, e, cbn = self.res_table[(b1, b2)]
          row.append("{:3d} {:3.1f}%CB  {:3.1f}%Uni {:3.1f}".format(num, cb*100.0, u*100.0, cb*u*100.0))
        except:
          row.append("")
      self.print_table.append(row)

    ave_cb, ave_u, sum_weights = 0.0, 0.0, 0.0

    for _, val in self.res_table.items():
      try:
        count, cb, u, e, cbn = val
      except:
        continue

      cross_count += cbn
      self.entropy += float(cbn) * e
      sum_weights += float(count)
      ave_cb += float(cb)*float(count)
      ave_u += float(u)*float(count)

    self.summary = ave_cb/sum_weights, ave_u/sum_weights
    self.print_summary = self.__print_summary()
    self.latex_summary = self.__latex_summary()
    self.entropy /= cross_count


class Single_Table(Table_Base):
  def __init__(self, feat_list, browsers):
    Table_Base.__init__(self)
    self.feat_list, self.browsers = feat_list, browsers

  def __entropy(self, cursor, feature, table_name):
    if type(feature) is list:
      cursor.execute("SELECT {} from {}".format(','.join(feature), table_name))
    else:
      cursor.execute("SELECT {} from {}".format(feature, table_name))
    data = cursor.fetchall()
    val_to_count = {}
    for val in data:
        if val not in val_to_count:
            val_to_count.update({val : 1})
        else:
            val_to_count[val] += 1

    entropy = 0
    for _, count in val_to_count.items():
        P = float(count)/float(len(data))
        entropy -= P * math.log(P, 2)

    #entropy /= math.log(len(data), 2)
    return entropy


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
    num_uids = max(len(image_ids), 1.0)

    return int(num_uids), num_unique/num_uids

  def __print_summary(self):
    __str = ""
    if self.summary is not None:
      __str += "Summary: {:3.2f}%Iden\n".format(self.summary*100.0)
    return __str

  def __latex_summary(self):
    latex = "\LARGE\n"
    if self.summary is not None:
      latex += "Average Identifable: ${:3.2f}$\%Iden\n".format(self.summary*100)
    return latex

  def run(self, cursor, table_name, extra_selector=""):
    self.res_table = {}
    for b in self.browsers:
      self.res_table.update(
        {
          b : self.__single_helper(b, cursor, table_name, self.feat_list, extra_selector)
        }
      )

    self.print_table = []
    self.print_table.append(["Browser"] + self.browsers)
    row = ["Single"]
    for b in self.browsers:
      try:
        _, u = self.res_table[b]
        row.append("{:3.1f}%Iden".format(u*100.0))
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

    self.entropy = self.__entropy(cursor, self.feat_list, table_name)
    self.summary = ave_u/sum_weights
    self.print_summary = self.__print_summary()
    self.latex_summary = self.__latex_summary()

class Results_Table():
  def factory(fp_type, feat_list, browsers):
    if fp_type == Fingerprint_Type.CROSS:
      return Cross_Table(feat_list, browsers)
    elif fp_type == Fingerprint_Type.SINGLE:
      return Single_Table(feat_list, browsers)
    else:
      RuntimeError("Type not supported!")
  factory = staticmethod(factory)


class Feature_Table(Table_Base):
  def __init__(self, browsers):
    Table_Base.__init__(self)
    self.browsers = browsers

  def __helper(self, cursor, table_name, feature, extra_selector=""):
    cb = Results_Table.factory(Fingerprint_Type.CROSS, feature, self.browsers)
    cb.run(cursor, table_name)
    s = Results_Table.factory(Fingerprint_Type.SINGLE, feature, self.browsers)
    s.run(cursor, table_name)
    return s.summary,s.entropy,cb.summary[0],cb.summary[1],cb.entropy

  def __hashes_helper(self, cursor, b1, b2, img_id, table_name):
    cursor.execute("SELECT user_id FROM {} WHERE browser='{}'".format(table_name, b1))
    tuids = [uid for uid, in cursor.fetchall()]

    uids = []
    for uid in tuids:
      cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}'".format(table_name, uid, b2))
      for uid, in cursor.fetchall():
        uids.append(uid)

    if len(uids) is 0:
        return None

    fp_to_count = {}
    num_cross_browser = 0.0

    for uid in uids:
      cursor.execute("SELECT hashes FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
      hashes1 = cursor.fetchone()[0].split('&')

      cursor.execute("SELECT hashes FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
      hashes2 = cursor.fetchone()[0].split('&')

      fp_1 = hashes1[img_id] 
      fp_2 = hashes2[img_id] 

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

    entropy = 0.0
    num_distinct = max(float(len(fp_to_count)), 1.0)
    num_unique = 0.0
    for _, count in fp_to_count.items():
      if count == 1:
        num_unique += 1.0
      
      P = float(count) / float(num_cross_browser) 
      entropy -= P * math.log(P, 2)

    num_uids = max(float(len(uids)), 1.0)
    num_cross_browser = max(num_cross_browser, 1.0)

    return int(num_uids), num_cross_browser/num_uids, num_unique/num_cross_browser, entropy, num_cross_browser

  def __single_entropy(self, cursor, table_name):
    cursor.execute("SELECT hashes from {}".format(table_name))
    image_to_hashes = {}
    for h, in cursor.fetchall():
      for i, e in enumerate(h.split("&")):
        if i not in image_to_hashes:
          image_to_hashes.update({i : [e]})
        else:
          image_to_hashes[i].append(e)

    table = []
    for num, hashes in image_to_hashes.items():
      count_per_hash = {}
      for h in hashes:
        if h not in count_per_hash:
          count_per_hash.update({h : 1})
        else:
          count_per_hash[h] += 1

      entropy = 0
      for _, count in count_per_hash.items():
        P = float(count)/float(len(hashes))
        entropy -= P * math.log(P, 2)

      #entropy /= math.log(len(hashes), 2)
      table.append(entropy)
    return table

  def __hashes(self, cursor, table_name):
    sin = self.__single_entropy(cursor, table_name)
    table = [[] for i in range(28)]
    for i in range(len(self.browsers)):
      b1 = self.browsers[i]
      for j in range(i + 1, len(self.browsers)):
        b2 = self.browsers[j]
        for k in range(28):
          table[k].append(self.__hashes_helper(cursor, b1, b2, k, table_name))

    res = [[0.0, 0.0, 0.0] for i in range(28)]
    cb_count = 0

    for i in range(28):
      cb_count = 0
      for t in table[i]:
        if not t:
          continue
        nu, cb, cbu, en, cbn = t
        cb_count += cbn
        res[i][1] += en * cbn
        res[i][2] += cb * cbn
      res[i][0] = sin[i]
      res[i][1] /= cb_count
      res[i][2] /= cb_count
    return res

  def run(self, cursor, table_name, extra_selector=""):
    images = self.__hashes(cursor, table_name)
    self.res_table = []
    for feat in Feature_Lists.All:
      self.res_table.append(self.__helper(cursor, table_name, feat, extra_selector))
      print 'finished ' + feat

    self.print_table = [["Feature", "Single-browser", "\multicolumn{2}{c}{Cross-browser} \\\\ \hline & & Sum & Cross Browser Rate"]]
    for i in range(len(self.res_table)):
      feat = Feature_Lists.All[i]
      su, se, cb, cbu, ce = self.res_table[i]
      self.print_table.append([Feature_Lists.Mapped_All[i], "{:3.2f}".format(se), "{:3.2f}".format(ce),"{:3.2f}%".format(cb*100.0)])
    for i in range(len(images)):
        self.print_table.append(["image " + str(i), "{:3.2f}".format(images[i][0]), "{:3.2f}".format(images[i][1]), "{:3.2f}%".format(images[i][2] * 100.0)])


    ami_res = self.__helper(cursor, table_name, Feature_Lists.Amiunique, extra_selector)
    su, se, cb, cbu, ce= ami_res
    self.print_table.append(["Amiunique", "{:3.2f}".format(se), "{:3.2f}".format(ce),"{:3.2f}%".format(cb*100.0)])

    cross_res = self.__helper(cursor, table_name, Feature_Lists.Cross_Browser, extra_selector)
    su, se, cb, cbu, ce = cross_res
    self.print_table.append(["CB Features", "{:3.2f}".format(se), "{:3.2f}".format(ce),"{:3.2f}%".format(cb * 100.0)])

    single_res = self.__helper(cursor, table_name, Feature_Lists.Single_Browser, extra_selector)
    su, se, cb, cbu, ce = single_res
    self.print_table.append(["All Features", "{:3.2f}".format(se), "{:3.2f}".format(ce),"{:3.2f}%".format(cb * 100.0)])

class VAL(Enum):
  EQ = 0
  LT = 1
  GT = 2


class Cross_Diff_Table(Table_Base):
  def __init__(self, feat_list_A, feat_list_B, browsers):
    Table_Base.__init__(self)
    self.feat_list_A, self. feat_list_B, self.browsers = feat_list_A,  feat_list_B, browsers

  def __type_helper(self, a, b):
    t = None
    if a == b:
      t = VAL.EQ
    elif a < b:
      t = VAL.LT
    else:
      t = VAL.GT

    return a, t

  def run(self, cursor, table_name, extra_selector=""):
    self.table_A = Results_Table.factory(Fingerprint_Type.CROSS, self.feat_list_A, self.browsers)
    self.table_A.run(cursor, table_name, extra_selector)

    table_B = Results_Table.factory(Fingerprint_Type.CROSS, self.feat_list_B, self.browsers)
    table_B.run(cursor, table_name, extra_selector)

    self.res_table = {}
    for key, A in self.table_A.res_table.items():
      if A is not None:
        B = table_B.res_table[key]
        e = []
        for i in range(len(A)):
          e.append(self.__type_helper(A[i], B[i]))

        self.res_table.update(
          {
            key : e
          }
        )

    acb, au = self.table_A.summary
    bcb, bu = table_B.summary
    ai = acb*au
    bi = bcb*bu
    cb_out = self.__frmt_helper("{:3.2f}%CB".format(acb*100.0), self.__type_helper(acb, bcb))
    u_out = self.__frmt_helper("{:3.2f}%Uni".format(au*100.0), self.__type_helper(au, bu))
    i_out = self.__frmt_helper("{:3.2f}%Iden".format(ai*100.0), self.__type_helper(ai, bi))

    self.frmt_summary = ["Summary: {} {}".format(cb_out, u_out)]
    self.frmt_summary.append("Average Identifiable: {}".format(i_out))


  def __str__(self):
    self.summary = self.table_A.summary
    self.print_table = self.table_A.print_table
    return Table_Base.__str__(self)

  def __frmt_helper(self, val, t):
    if t == VAL.EQ:
      return val
    elif t == VAL.LT:
      return "{\\color{blue} " + str(val) + "$\\downarrow$}"
    else:
      return "{\\color{red} " + str(val) + "$\\uparrow$}"

  def __latex_helper(self):
    self.print_table = []
    self.print_table.append(["Browser"] + self.browsers)

    for b1 in self.browsers:
      row = [b1]
      for b2 in self.browsers:
        if (b1, b2) in self.res_table:
            _, cb, u = self.res_table[(b1, b2)]
            val, t = cb
            out = self.__frmt_helper("{:3.1f}%CB".format(val*100), t) + " "
            val, t = u
            out += self.__frmt_helper("{:3.1f}%Uni".format(val*100), t)
            row.append(out)
        else:
          row.append("")
      self.print_table.append(row)

  def __format__(self, code):
    if code == "latex":
      self.__latex_helper()
      self.summary = None
      __str = Table_Base.__format__(self, code)

      __str += "\n\LARGE\n"
      for e in self.frmt_summary:
        __str += "{}\n\n".format(e.replace("%", "\%"))

      __str += "{\color{red} red} values have increased\n\n"
      __str += "{\color {blue} blue} values have decreased\n\n"
      return __str
    else:
      return format(str(self), code)


class Single_Diff_Table(Table_Base):
  def __init__(self, feat_list_A,  feat_list_B, browsers):
    Table_Base.__init__(self)
    self.feat_list_A, self. feat_list_B, self.browsers = feat_list_A,  feat_list_B, browsers


  def __type_helper(self, a, b):
    t = None
    if a == b:
      t = VAL.EQ
    elif a < b:
      t = VAL.LT
    else:
      t = VAL.GT

    return a, t

  def run(self, cursor, table_name, extra_selector=""):
    self.table_A = Results_Table.factory(Fingerprint_Type.SINGLE, self.feat_list_A, self.browsers)
    self.table_A.run(cursor, table_name, extra_selector)

    table_B = Results_Table.factory(Fingerprint_Type.SINGLE, self.feat_list_B, self.browsers)
    table_B.run(cursor, table_name, extra_selector)

    self.res_table = {}
    for key, A in self.table_A.res_table.items():
      if A is not None:
        B = table_B.res_table[key]
        e = []
        for i in range(len(A)):
          e.append(self.__type_helper(A[i], B[i]))

        self.res_table.update(
          {
            key : e
          }
        )

    au = self.table_A.summary
    bu = table_B.summary
    i_out = self.__frmt_helper("{:3.2f}%Iden".format(au*100.0), self.__type_helper(au, bu))
    self.frmt_summary = ["Average Identifiable: {}".format(i_out)]


  def __str__(self):
    self.summary = self.table_A.summary
    self.print_table = self.table_A.print_table
    return Table_Base.__str__(self)

  def __frmt_helper(self, val, t):
    if t == VAL.EQ:
      return val
    elif t == VAL.LT:
      return "{\\color{blue} " + str(val) + "$\\downarrow$}"
    else:
      return "{\\color{red} " + str(val) + "$\\uparrow$}"

  def __latex_helper(self):
    self.print_table = []
    self.print_table.append(["Browser"] + self.browsers)
    row = ["Single"]
    for b in self.browsers:
      if b in self.res_table:
        _, u = self.res_table[b]
        val, t = u
        out = self.__frmt_helper("{:3.1f}%Iden".format(val*100), t)
        row.append(out)
      else:
        row.append("")

    self.print_table.append(row)


  def __format__(self, code):
    if code == "latex":
      self.__latex_helper()
      self.summary = None
      __str = Table_Base.__format__(self, code)
      __str += "\n\LARGE\n"
      for e in self.frmt_summary:
        __str += "{}\n\n".format(e.replace("%", "\%"))

      __str += "{\color{red} red} values have increased\n\n"
      __str += "{\color {blue} blue} values have decreased\n\n"
      return __str
    else:
      return format(str(self), code)


class Diff_Table():
  def factory(fp_type, feat_list_A,  feat_list_B, browsers):
    if fp_type == Fingerprint_Type.CROSS:
      return Cross_Diff_Table(feat_list_A, feat_list_B, browsers)
    elif fp_type == Fingerprint_Type.SINGLE:
      return Single_Diff_Table(feat_list_A, feat_list_B, browsers)
    else:
      RuntimeError("Type not supported!")
  factory = staticmethod(factory)

class Summary_Table(Table_Base):
  def __init__(self, browsers):
    Table_Base.__init__(self)
    self.browsers = browsers

  def __get_row(self, cursor, table_name, name, feature, cb_feature):
    row = [name]
    single = Results_Table.factory(Fingerprint_Type.SINGLE, feature, self.browsers)
    single.run(cursor, table_name)

    cross = Results_Table.factory(Fingerprint_Type.CROSS, cb_feature, self.browsers)
    cross.run(cursor, table_name)

    row.append("{:3.2f}%".format(single.summary*100.0))
    row.append("{:3.2f}".format(single.entropy))
    row.append("{:3.2f}%".format(cross.summary[0]*cross.summary[1]*100))
    row.append("{:3.2f}".format(cross.entropy))
    row.append("{:3.2f}%".format(cross.summary[0]*100.0))
    return row

  def run(self, cursor, table_name):
    self.print_table = []
    self.print_table.append(["Features", "Unique", "Entropy", "Unique", "Entropy", "CB Rate"])

    row = self.__get_row(cursor, table_name, 'Amiunique', Feature_Lists.Amiunique, Feature_Lists.CB_Amiunique)
    self.print_table.append(row)

    row = self.__get_row(cursor, table_name, 'Boda', Feature_Lists.Boda, Feature_Lists.Boda)
    self.print_table.append(row)

    row = self.__get_row(cursor, table_name, 'Ours', Feature_Lists.Single_Browser, Feature_Lists.Cross_Browser)
    self.print_table.append(row)
