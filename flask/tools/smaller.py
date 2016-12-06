import json

with open("../fonts.txt",'r') as f:
    res = f.read()
    masks = res.split('\n')
    print len(masks)
    
    l = len(masks[0])
    mask = [1 for i in range(l)]

    for i in range(l):
        if masks[0][i] == masks[1][i] and masks[1][i] == masks[2][i]:
            mask[i] = 1;
        else:
            mask[i] = 0

    
    print mask
