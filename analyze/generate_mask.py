from fingerprint import Fingerprint, Fingerprint_Type
class Gen_Masks():
    def __init__(self, browsers):
        self.browsers = browsers

    def run(self, cursor, feat_list, table_name, extra_selector=""):
        return self.__get_mask(cursor, table_name, feat_list, extra_selector=extra_selector)

    def __getRes(self, b1, b2, cursor, quiet, rate, table_name, attrs="", extra_selector=""):
        if not quiet:
            print('extra_selector="{}"'.format(extra_selector))

        tuids = []
        uids = []

        cursor.execute("SELECT user_id FROM {} WHERE browser='{}' {}".format(table_name, b1, extra_selector))
        for uid, in cursor.fetchall():
            tuids.append(uid)

        if not quiet:
            print(b1, len(tuids))

        for uid in tuids:
            cursor.execute("SELECT user_id FROM {} WHERE user_id='{}' AND browser='{}' {}".format(table_name, uid, b2, extra_selector))
            for uid, in cursor.fetchall():
                uids.append(uid)

        if not quiet:
            print(b1, 'and', b2 , len(uids))

        #uids is the list of users uses both b1 and b2
        hash_all = {}
        hash_long = []
        fp_to_count = {}
        hash_all_unique = {}
        index = []
        uid_stability = {}
        instability = {}
        mask = [1 for _ in range(28)]

        if len(uids) == 0:
            return 0, mask

        for uid in uids:
            cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
            image1_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
            image2_id = cursor.fetchone()[0]

            try:
                # Feature to mask
                feature = "hashes"
                cursor.execute("SELECT {} FROM {} WHERE image_id='{}'".format(feature, table_name, image1_id))
                hashes_1 = cursor.fetchone()[0].split("&")[:28]

                cursor.execute("SELECT {} FROM {} WHERE image_id='{}'".format(feature, table_name, image2_id))
                hashes_2 = cursor.fetchone()[0].split("&")[:28]

                if len(hashes_1) == len(hashes_2):

                    uid_stability.update({uid: []})
                    for i in range(len(hashes_1)):
                        if i not in instability:
                            instability.update({i: 0.0})


                        hash1_val = hashes_1[i]
                        hash2_val = hashes_2[i]

                        if hash1_val != hash2_val:
                            instability[i] += 1.0/len(uids)
            except:
                pass

        for index, i in instability.items():
            if i > rate:
                mask[index] = 0



        for uid in uids:
            cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b1, uid))
            image1_id = cursor.fetchone()[0]
            
            cursor.execute("SELECT image_id FROM {} WHERE browser='{}' AND user_id='{}'".format(table_name, b2, uid))
            image2_id = cursor.fetchone()[0]

            fp_1 = Fingerprint(cursor, image1_id, table_name, Fingerprint_Type.CROSS, attrs, b2, mask)
            fp_2 = Fingerprint(cursor, image2_id, table_name, Fingerprint_Type.CROSS, attrs, b1, mask)

            if fp_1 == fp_2:
                hash_long.append(fp_1)
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
        num_cross_browser = max(float(len(hash_long)), 1.0)
        num_uids = max(float(len(uids)), 1.0)

        if not quiet:
            for i, d in instability.items():
                print("{}: instability: {}".format(i, d))

            print('Cross_browser', num_cross_browser)
            print('Cross_browser rate', num_cross_browser/num_uids)


            print('Cross_browser unique', num_unique/num_distinct)
            print(num_unique, num_distinct)

        return num_cross_browser/num_uids*num_unique/num_cross_browser*100, mask

    def __get_mask(self, cursor, table_name, feat_list, extra_selector=""):
        masks = {}
        max_number = -1
        for i in range(len(self.browsers)):
            for j in range(i + 1, len(self.browsers)):
                max_number = -1
                print self.browsers[i], self.browsers[j]
                for r in range(50):
                    rate = 0.00 + float(r) / 100.0
                    b1, b2 = self.browsers[i], self.browsers[j]
                    res, mask = self.__getRes(b1, b2, cursor, True, rate, table_name, attrs=feat_list, extra_selector=extra_selector)
                    print rate, res, mask
                    if res > max_number:
                        max_number = res
                        masks.update({"{}{}".format(b1, b2): mask})
                        masks.update({"{}{}".format(b2, b1): mask})

        return masks
