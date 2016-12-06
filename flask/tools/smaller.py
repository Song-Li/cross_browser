import json

with open("fonts.txt",'r') as f:
    res = f.read()
    masks = res.split('\n')
    print len(masks)
    
    l = len(masks[0])

    mask = [1 for i in range(l)]

    for i in [0,1,2]:
        m = masks[i]
        for j in range(l):
            mask[j] = mask[j] & int(m[j])

    
    print mask
