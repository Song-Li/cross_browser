import json

with open("font_mask.txt",'r') as f:
    res = f.read()
    masks = json.loads(res)
    
    l = len(masks['IEFirefox'])
    print l

    mask = [1 for i in range(l)]

    for pair in masks:
        values = masks[pair]
        for i in range(l):
            mask[i] = mask[i] & values[i]

    print mask


