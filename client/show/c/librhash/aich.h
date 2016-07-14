/* aich.h */
#ifndef AICH_H
#define AICH_H
#include "sha1.h"

#ifdef __cplusplus
extern "C" {
#endif

/* algorithm context */
typedef struct aich_ctx
{
	sha1_ctx sha1_context; /* context used to hash tree leaves */
#if defined(USE_OPENSSL) || defined(OPENSSL_RUNTIME)
	unsigned long reserved; /* need more space for openssl sha1 context */
	void *sha_init, *sha_update, *sha_final;
#endif
	unsigned index;        /* algorithm position in the current ed2k chunk */
	unsigned char (*block_hashes)[sha1_hash_size];

	void** chunk_table;    /* table of chunk hashes */
	size_t allocated;      /* allocated size of the chunk_table */
	size_t chunks_number;  /* number of ed2k chunks hashed */
	int error;             /* non-zero if a memory error occurred, 0 otherwise */
} aich_ctx;

/* hash functions */

void rhash_aich_init(aich_ctx *ctx);
void rhash_aich_update(aich_ctx *ctx, const unsigned char* msg, size_t size);
void rhash_aich_final(aich_ctx *ctx, unsigned char result[20]);

/* Clean up context by freeing allocated memory.
 * The function is called automatically by rhash_aich_final.
 * Shall be called when aborting hash calculations. */
void rhash_aich_cleanup(aich_ctx* ctx);

#ifdef __cplusplus
} /* extern "C" */
#endif /* __cplusplus */

#endif /* AICH_H */
