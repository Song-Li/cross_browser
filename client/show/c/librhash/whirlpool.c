/* whirlpool.c - an implementation of the Whirlpool Hash Function.
 *
 * Copyright: 2009-2012 Aleksey Kravchenko <rhash.admin@gmail.com>
 *
 * Permission is hereby granted,  free of charge,  to any person  obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction,  including without limitation
 * the rights to  use, copy, modify,  merge, publish, distribute, sublicense,
 * and/or sell copies  of  the Software,  and to permit  persons  to whom the
 * Software is furnished to do so.
 *
 * This program  is  distributed  in  the  hope  that it will be useful,  but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  Use this program  at  your own risk!
 *
 * Documentation:
 * P. S. L. M. Barreto, V. Rijmen, ``The Whirlpool hashing function,''
 * NESSIE submission, 2000 (tweaked version, 2001)
 *
 * The algorithm is named after the Whirlpool Galaxy in Canes Venatici.
 */

#include <assert.h>
#include <string.h>
#include "byte_order.h"
#include "whirlpool.h"

/**
 * Initialize context before calculaing hash.
 *
 * @param ctx context to initialize
 */
void rhash_whirlpool_init(struct whirlpool_ctx* ctx)
{
	ctx->length = 0;
	memset(ctx->hash, 0, sizeof(ctx->hash));
}

/* Algorithm S-Box */
extern uint64_t rhash_whirlpool_sbox[8][256];

#define WHIRLPOOL_OP(src, shift) ( \
	rhash_whirlpool_sbox[0][(int)(src[ shift      & 7] >> 56)       ] ^ \
	rhash_whirlpool_sbox[1][(int)(src[(shift + 7) & 7] >> 48) & 0xff] ^ \
	rhash_whirlpool_sbox[2][(int)(src[(shift + 6) & 7] >> 40) & 0xff] ^ \
	rhash_whirlpool_sbox[3][(int)(src[(shift + 5) & 7] >> 32) & 0xff] ^ \
	rhash_whirlpool_sbox[4][(int)(src[(shift + 4) & 7] >> 24) & 0xff] ^ \
	rhash_whirlpool_sbox[5][(int)(src[(shift + 3) & 7] >> 16) & 0xff] ^ \
	rhash_whirlpool_sbox[6][(int)(src[(shift + 2) & 7] >>  8) & 0xff] ^ \
	rhash_whirlpool_sbox[7][(int)(src[(shift + 1) & 7]      ) & 0xff])

/**
 * The core transformation. Process a 512-bit block.
 *
 * @param hash algorithm state
 * @param block the message block to process
 */
static void rhash_whirlpool_process_block(uint64_t *hash, uint64_t* p_block)
{
	int i;                /* loop counter */
	uint64_t K1[8];       /* key used in even rounds */
	uint64_t K2[8];       /* key used in odd  rounds */
	uint64_t state1[8];   /* state used in even rounds */
	uint64_t state2[8];   /* state used in odd rounds */

	/* the number of rounds of the internal dedicated block cipher */
	const int number_of_rounds = 10;

	/* array used in the rounds */
	static const uint64_t rc[10] = {
		I64(0x1823c6e887b8014f),
		I64(0x36a6d2f5796f9152),
		I64(0x60bc9b8ea30c7b35),
		I64(0x1de0d7c22e4bfe57),
		I64(0x157737e59ff04ada),
		I64(0x58c9290ab1a06b85),
		I64(0xbd5d10f4cb3e0567),
		I64(0xe427418ba77d95d8),
		I64(0xfbee7c66dd17479e),
		I64(0xca2dbf07ad5a8333)
	};

	/* map the message buffer to a block */
	for(i = 0; i < 8; i++) {
		/* store K^0 and xor it with intermediate hash state */
		state1[i] = hash[i] = be2me_64(p_block[i]) ^ (K1[i] = hash[i]);
	}

	/* iterate over algorithm rounds */
	for(i = 0; i < number_of_rounds; i++)
	{
		/* compute K^i from K^{i-1} */
		K2[0] = WHIRLPOOL_OP(K1, 0) ^ rc[i];
		K2[1] = WHIRLPOOL_OP(K1, 1);
		K2[2] = WHIRLPOOL_OP(K1, 2);
		K2[3] = WHIRLPOOL_OP(K1, 3);
		K2[4] = WHIRLPOOL_OP(K1, 4);
		K2[5] = WHIRLPOOL_OP(K1, 5);
		K2[6] = WHIRLPOOL_OP(K1, 6);
		K2[7] = WHIRLPOOL_OP(K1, 7);

		/* apply the i-th round transformation */
		state2[0] = WHIRLPOOL_OP(state1, 0) ^ K2[0];
		state2[1] = WHIRLPOOL_OP(state1, 1) ^ K2[1];
		state2[2] = WHIRLPOOL_OP(state1, 2) ^ K2[2];
		state2[3] = WHIRLPOOL_OP(state1, 3) ^ K2[3];
		state2[4] = WHIRLPOOL_OP(state1, 4) ^ K2[4];
		state2[5] = WHIRLPOOL_OP(state1, 5) ^ K2[5];
		state2[6] = WHIRLPOOL_OP(state1, 6) ^ K2[6];
		state2[7] = WHIRLPOOL_OP(state1, 7) ^ K2[7];
		i++;

		/* compute K^i from K^{i-1} */
		K1[0] = WHIRLPOOL_OP(K2, 0) ^ rc[i];
		K1[1] = WHIRLPOOL_OP(K2, 1);
		K1[2] = WHIRLPOOL_OP(K2, 2);
		K1[3] = WHIRLPOOL_OP(K2, 3);
		K1[4] = WHIRLPOOL_OP(K2, 4);
		K1[5] = WHIRLPOOL_OP(K2, 5);
		K1[6] = WHIRLPOOL_OP(K2, 6);
		K1[7] = WHIRLPOOL_OP(K2, 7);

		/* apply the i-th round transformation */
		state1[0] = WHIRLPOOL_OP(state2, 0) ^ K1[0];
		state1[1] = WHIRLPOOL_OP(state2, 1) ^ K1[1];
		state1[2] = WHIRLPOOL_OP(state2, 2) ^ K1[2];
		state1[3] = WHIRLPOOL_OP(state2, 3) ^ K1[3];
		state1[4] = WHIRLPOOL_OP(state2, 4) ^ K1[4];
		state1[5] = WHIRLPOOL_OP(state2, 5) ^ K1[5];
		state1[6] = WHIRLPOOL_OP(state2, 6) ^ K1[6];
		state1[7] = WHIRLPOOL_OP(state2, 7) ^ K1[7];
	}

	/* apply the Miyaguchi-Preneel compression function */
	hash[0] ^= state1[0];
	hash[1] ^= state1[1];
	hash[2] ^= state1[2];
	hash[3] ^= state1[3];
	hash[4] ^= state1[4];
	hash[5] ^= state1[5];
	hash[6] ^= state1[6];
	hash[7] ^= state1[7];
}

/**
 * Calculate message hash.
 * Can be called repeatedly with chunks of the message to be hashed.
 *
 * @param ctx the algorithm context containing current hashing state
 * @param msg message chunk
 * @param size length of the message chunk
 */
void rhash_whirlpool_update(whirlpool_ctx *ctx, const unsigned char* msg, size_t size)
{
	unsigned index = (unsigned)ctx->length & 63;
	unsigned left;
	ctx->length += size;

	/* fill partial block */
	if(index) {
		left = whirlpool_block_size - index;
		memcpy(ctx->message + index, msg, (size < left ? size : left));
		if(size < left) return;

		/* process partial block */
		rhash_whirlpool_process_block(ctx->hash, (uint64_t*)ctx->message);
		msg  += left;
		size -= left;
	}
	while(size >= whirlpool_block_size) {
		uint64_t* aligned_message_block;
		if(IS_ALIGNED_64(msg)) {
			/* the most common case is processing of an already aligned message
			without copying it */
			aligned_message_block = (uint64_t*)msg;
		} else {
			memcpy(ctx->message, msg, whirlpool_block_size);
			aligned_message_block = (uint64_t*)ctx->message;
		}

		rhash_whirlpool_process_block(ctx->hash, aligned_message_block);
		msg += whirlpool_block_size;
		size -= whirlpool_block_size;
	}
	if(size) {
		/* save leftovers */
		memcpy(ctx->message, msg, size);
	}
}

/**
 * Store calculated hash into the given array.
 *
 * @param ctx the algorithm context containing current hashing state
 * @param result calculated hash in binary form
 */
void rhash_whirlpool_final(whirlpool_ctx *ctx, unsigned char* result)
{
	unsigned index = (unsigned)ctx->length & 63;
	uint64_t* msg64 = (uint64_t*)ctx->message;

	/* pad message and run for last block */
	ctx->message[index++] = 0x80;

	/* if no room left in the message to store 256-bit message length */
	if(index > 32) {
		/* then pad the rest with zeros and process it */
		while(index < 64) {
			ctx->message[index++] = 0;
		}
		rhash_whirlpool_process_block(ctx->hash, msg64);
		index = 0;
	}
	/* due to optimization actually only 64-bit of message length are stored */
	while(index < 56) {
		ctx->message[index++] = 0;
	}
	msg64[7] = be2me_64(ctx->length << 3);
	rhash_whirlpool_process_block(ctx->hash, msg64);

	/* save result hash */
	be64_copy(result, 0, ctx->hash, 64);
}
