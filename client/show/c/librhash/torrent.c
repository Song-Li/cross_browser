/* torrent.c - create BitTorrent files and calculate BitTorrent  InfoHash (BTIH).
 *
 * Copyright: 2010-2012 Aleksey Kravchenko <rhash.admin@gmail.com>
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
 */

#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <assert.h>
#include <time.h>  /* time() */

#include "byte_order.h"
#include "algorithms.h"
#include "hex.h"
#include "torrent.h"

#ifdef USE_OPENSSL
#define SHA1_INIT(ctx) ((pinit_t)ctx->sha_init)(&ctx->sha1_context)
#define SHA1_UPDATE(ctx, msg, size) ((pupdate_t)ctx->sha_update)(&ctx->sha1_context, (msg), (size))
#define SHA1_FINAL(ctx, result) ((pfinal_t)ctx->sha_final)(&ctx->sha1_context, (result))
#else
#define SHA1_INIT(ctx) rhash_sha1_init(&ctx->sha1_context)
#define SHA1_UPDATE(ctx, msg, size) rhash_sha1_update(&ctx->sha1_context, (msg), (size))
#define SHA1_FINAL(ctx, result) rhash_sha1_final(&ctx->sha1_context, (result))
#endif

#define BT_MIN_HASH_LENGTH 16384
/** size of a SHA1 hash in bytes */
#define BT_HASH_SIZE 20
/** number of SHA1 hashes to store together in one block */
#define BT_BLOCK_SIZE 256

/**
 * Initialize torrent context before calculating hash.
 *
 * @param ctx context to initialize
 */
void bt_init(torrent_ctx* ctx)
{
	memset(ctx, 0, sizeof(torrent_ctx));
	ctx->piece_length = BT_MIN_HASH_LENGTH;
	assert(BT_MIN_HASH_LENGTH == bt_default_piece_length(0));

#ifdef USE_OPENSSL
	{
		/* get the methods of the selected SHA1 algorithm */
		rhash_hash_info *sha1_info = &rhash_info_table[3];
		assert(sha1_info->info->hash_id == RHASH_SHA1);
		assert(sha1_info->context_size <= (sizeof(sha1_ctx) + sizeof(unsigned long)));
		ctx->sha_init = sha1_info->init;
		ctx->sha_update = sha1_info->update;
		ctx->sha_final = sha1_info->final;
	}
#endif

	SHA1_INIT(ctx);
}

/**
 * Free memory allocated by properties of torrent_vect structure.
 *
 * @param vect vector to clean
 */
static void bt_vector_clean(torrent_vect *vect)
{
	size_t i;
	for(i = 0; i < vect->size; i++) {
		free(vect->array[i]);
	}
	free(vect->array);
}

/**
 * Clean up torrent context by freeing all dynamically
 * allocated memory.
 *
 * @param ctx torrent algorithm context
 */
void bt_cleanup(torrent_ctx *ctx)
{
	assert(ctx != NULL);

	/* destroy arrays of hash blocks and file paths */
	bt_vector_clean(&ctx->hash_blocks);
	bt_vector_clean(&ctx->files);

	free(ctx->program_name);
	free(ctx->announce);
	ctx->announce = ctx->program_name = 0;
	free(ctx->content.str);
}

static void bt_generate_torrent(torrent_ctx *ctx);

/**
 * Add an item to vector.
 *
 * @param vect vector to add item to
 * @param item the item to add
 * @return non-zero on success, zero on fail
 */
static int bt_vector_add_ptr(torrent_vect* vect, void* item)
{
	/* check if vector contains enough space for the next item */
	if(vect->size >= vect->allocated) {
		size_t size = (vect->allocated == 0 ? 128 : vect->allocated * 2);
		void *new_array = realloc(vect->array, size * sizeof(void*));
		if(new_array == NULL) return 0; /* failed: no memory */
		vect->array = (void**)new_array;
		vect->allocated = size;
	}
	/* add new item to the vector */
	vect->array[vect->size] = item;
	vect->size++;
	return 1;
}

/**
 * Store a SHA1 hash of a processed file piece.
 *
 * @param ctx torrent algorithm context
 * @return non-zero on success, zero on fail
 */
static int bt_store_piece_sha1(torrent_ctx *ctx)
{
	unsigned char* block;
	unsigned char* hash;

	if((ctx->piece_count % BT_BLOCK_SIZE) == 0) {
		block = (unsigned char*)malloc(BT_HASH_SIZE * BT_BLOCK_SIZE);
		if(block == NULL || !bt_vector_add_ptr(&ctx->hash_blocks, block)) {
			if(block) free(block);
			return 0;
		}
	} else {
		block = (unsigned char*)(ctx->hash_blocks.array[ctx->piece_count / BT_BLOCK_SIZE]);
	}

	hash = &block[BT_HASH_SIZE * (ctx->piece_count % BT_BLOCK_SIZE)];
	SHA1_FINAL(ctx, hash); /* write the hash */
	ctx->piece_count++;
	return 1;
}

/**
 * A filepath and filesize information.
 */
typedef struct bt_file_info
{
	uint64_t size;
	char path[1];
} bt_file_info;

/**
 * Add a file info into the batch of files of given torrent.
 *
 * @param ctx torrent algorithm context
 * @param path file path
 * @param filesize file size
 * @return non-zero on success, zero on fail
 */
int bt_add_file(torrent_ctx *ctx, const char* path, uint64_t filesize)
{
	size_t len = strlen(path);
	bt_file_info* info = (bt_file_info*)malloc(sizeof(uint64_t) + len + 1);
	if(info == NULL) {
		ctx->error = 1;
		return 0;
	}

	info->size = filesize;
	memcpy(info->path, path, len + 1);
	if(!bt_vector_add_ptr(&ctx->files, info)) return 0;

	/* recalculate piece length (but only if hashing not started yet) */
	if(ctx->piece_count == 0 && ctx->index == 0) {
		/* note: in case of batch of files should use a total batch size */
		ctx->piece_length = bt_default_piece_length(filesize);
	}
	return 1;
}

/**
 * Calculate message hash.
 * Can be called repeatedly with chunks of the message to be hashed.
 *
 * @param ctx the algorithm context containing current hashing state
 * @param msg message chunk
 * @param size length of the message chunk
 */
void bt_update(torrent_ctx *ctx, const void* msg, size_t size)
{
	const unsigned char* pmsg = (const unsigned char*)msg;
	size_t rest = (size_t)(ctx->piece_length - ctx->index);
	assert(ctx->index < ctx->piece_length);

	while(size > 0) {
		size_t left = (size < rest ? size : rest);
		SHA1_UPDATE(ctx, pmsg, left);
		if(size < rest) {
			ctx->index += left;
			break;
		}
		bt_store_piece_sha1(ctx);
		SHA1_INIT(ctx);
		ctx->index = 0;

		pmsg += rest;
		size -= rest;
		rest = ctx->piece_length;
	}
}

/**
 * Finalize hashing and optionally store calculated hash into the given array.
 * If the result parameter is NULL, the hash is not stored, but it is
 * accessible by bt_get_btih().
 *
 * @param ctx the algorithm context containing current hashing state
 * @param result pointer to the array store message hash into
 */
void bt_final(torrent_ctx *ctx, unsigned char result[20])
{
	if(ctx->index > 0) {
		bt_store_piece_sha1(ctx); /* flush buffered data */
	}

	bt_generate_torrent(ctx);
	if(result) memcpy(result, ctx->btih, btih_hash_size);
}

/* BitTorrent functions */

/**
 * Grow, if needed, the torrent_str buffer to ensure it contains
 * at least (length + 1) characters.
 *
 * @param ctx the torrent algorithm context
 * @param length length of the string, the allocated buffer must contain
 * @return 1 on success, 0 on error
 */
static int bt_str_ensure_length(torrent_ctx* ctx, size_t length)
{
	char* new_str;
	if(length >= ctx->content.allocated && !ctx->error) {
		length++; /* allocate one character more */
		if(length < 64) length = 64;
		else length = (length + 255) & ~255;
		new_str = (char*)realloc(ctx->content.str, length);
		if(new_str == NULL) {
			ctx->error = 1;
			ctx->content.allocated = 0;
			return 0;
		}
		ctx->content.str = new_str;
		ctx->content.allocated = length;
	}
	return 1;
}

/**
 * Append a null-terminated string to the string string buffer.
 *
 * @param ctx the torrent algorithm context
 * @param text the null-terminated string to append
 */
static void bt_str_append(torrent_ctx *ctx, const char* text)
{
	size_t length = strlen(text);

	if(!bt_str_ensure_length(ctx, ctx->content.length + length)) return;
	memcpy(ctx->content.str + ctx->content.length, text, length);
	ctx->content.length += length;
	ctx->content.str[ctx->content.length] = '\0';
}

/**
 * B-encode given integer.
 *
 * @param ctx the torrent algorithm context
 * @param number the integer to output
 */
static void bt_bencode_int(torrent_ctx* ctx, const char* name, uint64_t number)
{
	char* p;
	if(name) bt_str_append(ctx, name);

	/* add up to 20 digits and 2 letters */
	if(!bt_str_ensure_length(ctx, ctx->content.length + 22)) return;
	p = ctx->content.str + ctx->content.length;
	*(p++) = 'i';
	p += rhash_sprintI64(p, number);
	*(p++) = 'e';
	*p = '\0'; /* terminate string with \0 */

	ctx->content.length = (p - ctx->content.str);
}

/**
 * B-encode a string.
 *
 * @param ctx the torrent algorithm context
 * @param str the string to encode
 */
static void bt_bencode_str(torrent_ctx* ctx, const char* name, const char* str)
{
	size_t len = strlen(str);
	int num_len;
	char* p;

	if(name) bt_str_append(ctx, name);
	if(!bt_str_ensure_length(ctx, ctx->content.length + len + 21)) return;

	p = ctx->content.str + ctx->content.length;
	p += (num_len = rhash_sprintI64(p, len));
	ctx->content.length += len + num_len + 1;

	*(p++) = ':';
	memcpy(p, str, len + 1); /* copy with trailing '\0' */
}

/**
 * B-encode array of SHA1 hashes of file pieces.
 *
 * @param ctx pointer to the torrent structure containing SHA1 hashes
 */
static void bt_bencode_pieces(torrent_ctx* ctx)
{
	size_t pieces_length = ctx->piece_count * BT_HASH_SIZE;
	int num_len;
	int size, i;
	char* p;

	if(!bt_str_ensure_length(ctx, ctx->content.length + pieces_length + 21))
		return;

	p = ctx->content.str + ctx->content.length;
	p += (num_len = rhash_sprintI64(p, pieces_length));
	ctx->content.length += pieces_length + num_len + 1;

	*(p++) = ':';
	p[pieces_length] = '\0'; /* terminate with \0 just in case */

	for(size = (int)ctx->piece_count, i = 0; size > 0;
		size -= BT_BLOCK_SIZE, i++)
	{
		memcpy(p, ctx->hash_blocks.array[i],
			(size < BT_BLOCK_SIZE ? size : BT_BLOCK_SIZE) * BT_HASH_SIZE);
		p += BT_BLOCK_SIZE * BT_HASH_SIZE;
	}
}

/**
 * Calculate default torrent piece length, using uTorrent algorithm.
 * Algorithm:
 *  length = 16K for total_size < 16M,
 *  length = 8M for total_size >= 4G,
 *  length = top_bit(total_size) / 1024 otherwise.
 *
 * @param total_size total hashed batch size of torrent file
 * @return piece length used by torrent file
 */
size_t bt_default_piece_length(uint64_t total_size)
{
	uint64_t hi_bit;
	if(total_size < 16777216) return BT_MIN_HASH_LENGTH;
	if(total_size >= I64(4294967296) ) return 8388608;
	for(hi_bit = 16777216 << 1; hi_bit <= total_size; hi_bit <<= 1);
	return (size_t)(hi_bit >> 10);
}

/* get file basename */
static const char* bt_get_basename(const char* path)
{
	const char *p = strchr(path, '\0') - 1;
	for(; p >= path && *p != '/' && *p != '\\'; p--);
	return (p + 1);
}

/* extract batchname from the path, modifies the path buffer */
static const char* get_batch_name(char* path)
{
	char* p = (char*)bt_get_basename(path) - 1;
	for(; p > path && (*p == '/' || *p == '\\'); p--) *p = 0;
	if(p <= path) return "BATCH_DIR";
	return bt_get_basename(path);
}

/* write file size and path */
static void bt_file_info_append(torrent_ctx *ctx, const char* length_name,
	const char* path_name, bt_file_info* info)
{
	bt_bencode_int(ctx, length_name, info->size);
	/* store the file basename */
	bt_bencode_str(ctx, path_name, bt_get_basename(info->path));
}

/**
 * Generate torrent file content
 * @see http://wiki.theory.org/BitTorrentSpecification
 *
 * @param ctx the torrent algorithm context
 */
static void bt_generate_torrent(torrent_ctx *ctx)
{
	uint64_t total_size = 0;
	size_t info_start_pos;

	assert(ctx->content.str == NULL);

	if(ctx->piece_length == 0) {
		if(ctx->files.size == 1) {
			total_size = ((bt_file_info*)ctx->files.array[0])->size;
		}
		ctx->piece_length = bt_default_piece_length(total_size);
	}

	/* write torrent header to the ctx->torrent string buffer */
	if((ctx->options & BT_OPT_INFOHASH_ONLY) == 0) {
		bt_str_append(ctx, "d");
		if(ctx->announce) {
			bt_bencode_str(ctx, "8:announce", ctx->announce);
		}

		if(ctx->program_name) {
			bt_bencode_str(ctx, "10:created by", ctx->program_name);
		}
		bt_bencode_int(ctx, "13:creation date", (uint64_t)time(NULL));
	}

	bt_str_append(ctx, "8:encoding5:UTF-8");

	bt_str_append(ctx, "4:infod"); /* start info dictionary */
	info_start_pos = ctx->content.length - 1;

	if(ctx->files.size > 1) {
		size_t i;

		/* process batch torrent */
		bt_str_append(ctx, "5:filesl"); /* start list of files */

		/* write length and path for each file in the batch */
		for(i = 0; i < ctx->files.size; i++) {
			bt_file_info_append(ctx, "d6:length", "4:pathl",
				(bt_file_info*)ctx->files.array[i]);
			bt_str_append(ctx, "ee");
		}
		/* note: get_batch_name modifies path, so should be called here */
		bt_bencode_str(ctx, "e4:name", get_batch_name(
			((bt_file_info*)ctx->files.array[0])->path));
	}
	else if(ctx->files.size > 0) {
		/* write size and basename of the first file */
		/* in the non-batch mode other files are ignored */
		bt_file_info_append(ctx, "6:length", "4:name",
			(bt_file_info*)ctx->files.array[0]);
	}

	bt_bencode_int(ctx, "12:piece length", ctx->piece_length);
	bt_str_append(ctx, "6:pieces");
	bt_bencode_pieces(ctx);

	if(ctx->options & BT_OPT_PRIVATE) {
		bt_str_append(ctx, "7:privatei1e");
	}
	bt_str_append(ctx, "ee");

	/* calculate BTIH */
	SHA1_INIT(ctx);
	SHA1_UPDATE(ctx, (unsigned char*)ctx->content.str + info_start_pos,
		ctx->content.length - info_start_pos - 1);
	SHA1_FINAL(ctx, ctx->btih);
}

/* Getters/Setters */

/**
 * Get BTIH (BitTorrent Info Hash) value.
 *
 * @param ctx the torrent algorithm context
 * @return the 20-bytes long BTIH value
 */
unsigned char* bt_get_btih(torrent_ctx *ctx)
{
	return ctx->btih;
}

/**
 * Set the torrent algorithm options.
 *
 * @param ctx the torrent algorithm context
 * @param options the options to set
 */
void bt_set_options(torrent_ctx *ctx, unsigned options)
{
	ctx->options = options;
}

#if defined(__STRICT_ANSI__)
/* define strdup for gcc -ansi */
static char* bt_strdup(const char* str)
{
	size_t len = strlen(str);
	char* res = (char*)malloc(len + 1);
	if(res) memcpy(res, str, len + 1);
	return res;
}
#define strdup bt_strdup
#endif /* __STRICT_ANSI__ */

/**
 * Set optional name of the program generating the torrent
 * for storing into torrent file.
 *
 * @param ctx the torrent algorithm context
 * @param name the program name
 * @return non-zero on success, zero on error
 */
int bt_set_program_name(torrent_ctx *ctx, const char* name)
{
	ctx->program_name = strdup(name);
	return (ctx->program_name != NULL);
}

/**
 * Set length of a file piece.
 *
 * @param ctx the torrent algorithm context
 * @param piece_length the piece length in bytes
 */
void bt_set_piece_length(torrent_ctx *ctx, size_t piece_length)
{
	ctx->piece_length = piece_length;
}

/**
 * Set torrent announcement-URL for storing into torrent file.
 *
 * @param ctx the torrent algorithm context
 * @param announce_url the announcement-URL
 * @return non-zero on success, zero on error
 */
int bt_set_announce(torrent_ctx *ctx, const char* announce_url)
{
	free(ctx->announce);
	ctx->announce = strdup(announce_url);
	return (ctx->announce != NULL);
}

/**
 * Get the content of generated torrent file.
 *
 * @param ctx the torrent algorithm context
 * @param pstr pointer to pointer receiving the buffer with file content
 * @return length of the torrent file content
 */
size_t bt_get_text(torrent_ctx *ctx, char** pstr)
{
	assert(ctx->content.str);
	*pstr = ctx->content.str;
	return ctx->content.length;
}
