files = boxTester.c hasher.c librhash/sha3.c librhash/byte_order.c
outName = emscripten.js
functions = ['_pixelsToHashCode', '_boxTester']
flags = -O3 -s MODULARIZE=1 -s NO_EXIT_RUNTIME=1 --closure 1 --llvm-lto 3

all:
	emcc $(flags) $(files) -o $(outName) -s EXPORTED_FUNCTIONS="$(functions)"
	cp emscripten.js.mem ../emscripten.js.mem