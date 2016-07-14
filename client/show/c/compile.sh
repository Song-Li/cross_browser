#!/bin/bash

files="boxTester.c hasher.c librhash/sha3.c librhash/byte_order.c"
outName="emscripten.js"
functions="['_pixelsToHashCode', '_boxTester']"
flags="-O1  -s MODULARIZE=1 --closure 1 --js-opts 1"

emcc ${flags} ${files} -o ${outName} -s EXPORTED_FUNCTIONS="${functions}"
