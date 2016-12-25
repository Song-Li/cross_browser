"use strict";

self.onmessage = function(event) {
	var
	    workload = event.data
	  , a = 0x08a90db3, b = 0xabd209a0, c = 0x29019b32, d = 0x01ab3291
	;

	for (var i = 0; i < workload; i++) {
		a = (b ^ a) >> 1;
		b = (c ^ b) << 1;
		c = (d ^ c) >> 1;
		d = (a ^ d) << 1;
	}

	postMessage(null);
};