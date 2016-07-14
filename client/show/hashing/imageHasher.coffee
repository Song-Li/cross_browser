root = exports ? this


hasher = $ ->
  Module().cwrap 'pixelsToHashCode', 'string', ['string', 'number']

root.hashRGB = hashRGB = (pixels) ->
  raw = ""
  for i in [0...pixels.length] by 4
    raw += String.fromCharCode pixels[i + 0]
    raw += String.fromCharCode pixels[i + 1]
    raw += String.fromCharCode pixels[i + 2]

  return hasher raw, raw.length