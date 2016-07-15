root = exports ? this

root.emscript = emscript = root.emscript ? Module()

hasher = null

root.hashRGB = hashRGB = (pixels) ->
  RGB = new Uint8Array(pixels.length*3.0/4.0)
  for i in [0...pixels.length/4.0]
    RGB[3*i + 0] = pixels[4*i + 0]
    RGB[3*i + 1] = pixels[4*i + 1]
    RGB[3*i + 2] = pixels[4*i + 2]


  hasher = hasher ? emscript.cwrap 'pixelsToHashCode', 'string', ['number', 'number']
  ptr = emscript._malloc RGB.length
  emscript.writeArrayToMemory RGB, ptr

  b64 = hasher ptr, RGB.length

  emscript._free ptr

  return b64
