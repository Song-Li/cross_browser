class Gen_Masks():
    def __init__(self, browsers):
        self.browsers = browsers

    def run(self, cursor, feat_list, table_name, extra_selector=""):
        masks = __get_mask(cursor, Feature_Lists.Cross_browser, extra_selector=extra_selector)

    self.mask = None
    def getRes(b1, b2, cursor, quiet, attrs="hashes, langs", extra_selector="", fp_type=Fingerprint_Type.CROSS):
        if not quiet:
            print('extra_selector="{}"'.format(extra_selector))
        global mask
        global instability
        tuids = []
        uids = []
        cursor.execute("SELECT COUNT(DISTINCT(ip)) FROM {}".format(table_name))
        if not quiet:
            print('ip', cursor.fetchone()[0])
        cursor.execute("SELECT COUNT(DISTINCT(user_id)) FROM {}".format(table_name))
        if not quiet:
            print('user', cursor.fetchone()[0])

        #cursor.execute("SELECT user_id FROM {} WHERE browser='{}'".format(table_name, b1))
        cursor.execute("SELECT user_id FROM {} WHERE browser='{}' {}".format(table_name, b1, extra_selector))
        for uid, in cursor.fetchall():
            tuids.append(uid)

        if not quiet:
            print(b1, len(tuids))

        for uid in tuids:
            #cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}'".format(table_name, uid, b2))
            cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}' {}".format(table_name, uid, b2, extra_selector))
            for uid, in cursor.fetchall():
                uids.append(uid)

        if not quiet:
            print(b1, 'and', b2 , len(uids))

        if len(uids) is 0:
            return None

        #uids is the list of users uses both b1 and b2
        hash_all = {}
        hash_long = []
        fp_to_count = {}
        hash_all_unique = {}
        index = []
        uid_stability = {}
        instability = {}

        for uid in uids:
            #cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
            cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
            image1_id = cursor.fetchone()[0]
            #cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
            cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
            image2_id = cursor.fetchone()[0]

            fp_1 = Fingerprint(cursor, image1_id, table_name, fp_type, attrs, b2)
            fp_2 = Fingerprint(cursor, image2_id, table_name, fp_type, attrs, b1)

            try:
                # Feature to mask
                feature = "hashes"
                cursor.execute("SELECT {} FROM {} WHERE image_id='{}'".format(feature, table_name, image1_id))
                hashes_1 = cursor.fetchone()[0].split("&")[:27]

                cursor.execute("SELECT {} FROM {} WHERE image_id='{}'".format(feature, table_name, image2_id))
                hashes_2 = cursor.fetchone()[0].split("&")[:27]

                if mask is None:
                    mask = [1 for _ in range(len(hashes_1))]

                if len(hashes_1) == len(hashes_2):
                    s1 = ""
                    s2 = ""

                    uid_stability.update({uid: []})
                    for i in range(len(hashes_1)):

                        if i not in hash_all:
                            hash_all.update({i: []})
                        if i not in hash_all_unique:
                            hash_all_unique.update({i: Set()})
                        if i not in instability:
                            instability.update({i: 0.0})


                        hash1_val = hashes_1[i]
                        hash2_val = hashes_2[i]

                        s1 += hash1_val
                        s2 += hash2_val

                        #if hash1_val == hash2_val and (hash1_val not in hash_all[i]):
                        if hash1_val == hash2_val:
                            hash_all[i].append(hash1_val)
                            hash_all_unique[i].add(hash1_val)
                        else:
                            instability[i] += 1.0/len(uids)
                            uid_stability[uid].append([hash1_val, hash2_val])
            except:
                pass
            if fp_1 == fp_2:
                #else:
                #    print('found: ' + str(uid) + '%' + str(uids[hash_long.index(s1)]))
                hash_long.append(fp_1)
                index.append(uid)
                if fp_1 in fp_to_count:
                    fp_to_count[fp_1] += 1
                else:
                    fp_to_count.update(
                        {
                            fp_1: 1
                        }
                    )

            #else:
            #    print('not same: ' + str(uid))
        #for i in range(case_number):
        #    print(i, instability[i])

        for index, i in instability.items():
            if i > 0.09:
                mask[index] = 0

        num_distinct = max(float(len(fp_to_count)), 1.0)
        num_unique = 0.0
        for _, count in fp_to_count.items():
            if count == 1:
                num_unique += 1.0
        num_cross_browser = float(len(hash_long))
        num_uids = max(float(len(uids)), 1.0)

        if not quiet:
            for i, d in instability.items():
                print("{}: instability: {}".format(i, d))

            print('Cross_browser', num_cross_browser)
            print('Cross_browser rate', num_cross_browser/num_uids)


            print('Cross_browser unique', num_unique/num_distinct)
            print(num_unique, num_distinct)

        return int(num_uids), "{:3.1f}%".format(num_cross_browser/num_uids*100), "{:3.1f}%".format(num_unique/num_distinct*100)

    def __get_mask(self, cursor, feat_list, extra_selector=""):
        
        result_table = {}
        if cross_browser:
            for i in range(len(browsers)):
                for j in range(i + 1, len(browsers)):
                    b1, b2 = browsers[i], browsers[j]
                    result_table.update(
                        {
                            (b1, b2): getRes(b1, b2, cursor, True, feat_list, fp_type=Fingerprint_Type.CROSS, extra_selector=extra_selector)
                        }
                    )
                    if mask is not None:
                        b_mask.update(
                            {
                                "{}{}".format(b1,b2): mask
                            }
                        )
                        mask = None
            for i in range(len(browsers)):
                for j in range(0, i):
                    b1, b2 = browsers[i], browsers[j]
                    result_table.update(
                        {
                            (b1, b2): result_table[(b2, b1)]
                        }
                    )
                    try:
                        b_mask.update(
                            {
                                "{}{}".format(b1, b2): b_mask["{}{}".format(b2, b1)]
                            }
                        )
                    except:
                        pass
        else:
            for b in browsers:
                result_table.update(
                    {
                        (b, b): getRes(b, b, cursor, True, feat_list, fp_type=Fingerprint_Type.SINGLE, extra_selector=extra_selector)
                    }
                )
        return result_table
