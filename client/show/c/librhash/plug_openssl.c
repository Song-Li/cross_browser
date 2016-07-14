/* plug_openssl.c - plug-in openssl algorithms
 *
 * Copyright: 2011-2012 Aleksey Kravchenko <rhash.admin@gmail.com>
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
#if defined(USE_OPENSSL) || defined(OPENSSL_RUNTIME)

#include <string.h>
#include <assert.h>
#include <openssl/opensslv.h>
#include <openssl/md4.h>
#include <openssl/md5.h>
#include <openssl/ripemd.h>
#include <openssl/sha.h>

#if (OPENSSL_VERSION_NUMBER >= 0x10000000L)
#include <openssl/whrlpool.h>
#define USE_OPENSSL_WHIRLPOOL
#endif

#include "algorithms.h"
#include "plug_openssl.h"

#if defined(OPENSSL_RUNTIME)
# ifdef _WIN32
#  include <windows.h>
# else
#  include <dlfcn.h>
# endif
#endif

/* the mask of ids of hashing algorithms to use from the OpenSLL library */
unsigned rhash_openssl_hash_mask = RHASH_OPENSSL_DEFAULT_HASHES;

#ifdef OPENSSL_RUNTIME
typedef void (*os_fin_t)(void*, void*);
#define OS_METHOD(name) os_fin_t p##name##_final = 0
OS_METHOD(MD4);
OS_METHOD(MD5);
OS_METHOD(RIPEMD160);
OS_METHOD(SHA1);
OS_METHOD(SHA224);
OS_METHOD(SHA256);
OS_METHOD(SHA384);
OS_METHOD(SHA512);
OS_METHOD(WHIRLPOOL);

#define CALL_FINAL(name, result, ctx) p##name##_final(result, ctx)

#define HASH_INFO_METHODS(name) 0, 0, wrap##name##_Final, 0
#else /* non-runtime linking */
#define CALL_FINAL(name, result, ctx) name##_Final(result, ctx)
#define HASH_INFO_METHODS(name) (pinit_t)name##_Init, (pupdate_t)name##_Update, wrap##name##_Final, 0
#endif


/* The openssl * _Update functions have the same signature as RHash ones:
 * void update_func(void *ctx, const void* msg, size_t size),
 * so we can use them in RHash directly. But the _Final functions
 * have different order of arguments, so we need to wrap them. */
#define WRAP_FINAL(name) WRAP_FINAL2(name, name##_CTX)
#define WRAP_FINAL2(name, CTX_TYPE) \
	static void wrap##name##_Final(void* ctx, unsigned char* result) { \
		CALL_FINAL(name, result, (CTX_TYPE*)ctx); \
	}

WRAP_FINAL(MD4)
WRAP_FINAL(MD5)
WRAP_FINAL(RIPEMD160)
WRAP_FINAL2(SHA1, SHA_CTX)
WRAP_FINAL2(SHA224, SHA256_CTX)
WRAP_FINAL(SHA256)
WRAP_FINAL2(SHA384, SHA512_CTX)
WRAP_FINAL(SHA512)

/* wrapping WHIRLPOOL_Final requires special attention. */
#ifdef USE_OPENSSL_WHIRLPOOL
static void wrapWHIRLPOOL_Final(void* ctx, unsigned char* result)
{
	/* must pass NULL as the result argument, otherwise ctx will be zeroed */
	CALL_FINAL(WHIRLPOOL, NULL, ctx);
	memcpy(result, ((WHIRLPOOL_CTX*)ctx)->H.c, 64);
}
#endif

rhash_info info_sslwhpl = { RHASH_WHIRLPOOL, 0, 64, "WHIRLPOOL", "whirlpool" };

/* The table of supported OpenSSL hash functions */
rhash_hash_info rhash_openssl_methods[] = {
	{ &info_md4, sizeof(MD4_CTX), offsetof(MD4_CTX, A), HASH_INFO_METHODS(MD4) }, /* 128 bit */
	{ &info_md5, sizeof(MD5_CTX), offsetof(MD5_CTX, A), HASH_INFO_METHODS(MD5) }, /* 128 bit */
	{ &info_sha1, sizeof(SHA_CTX), offsetof(SHA_CTX, h0),  HASH_INFO_METHODS(SHA1) }, /* 160 bit */
	{ &info_rmd160, sizeof(RIPEMD160_CTX), offsetof(RIPEMD160_CTX, A), HASH_INFO_METHODS(RIPEMD160) }, /* 160 bit */
	{ &info_sha224, sizeof(SHA256_CTX), offsetof(SHA256_CTX, h), HASH_INFO_METHODS(SHA224) }, /* 224 bit */
	{ &info_sha256, sizeof(SHA256_CTX), offsetof(SHA256_CTX, h), HASH_INFO_METHODS(SHA256) }, /* 256 bit */
	{ &info_sha384, sizeof(SHA512_CTX), offsetof(SHA512_CTX, h), HASH_INFO_METHODS(SHA384) }, /* 384 bit */
	{ &info_sha512, sizeof(SHA512_CTX), offsetof(SHA512_CTX, h), HASH_INFO_METHODS(SHA512) }, /* 512 bit */
#ifdef USE_OPENSSL_WHIRLPOOL
	/* note: should be flags=0 */
	{ &info_sslwhpl, sizeof(WHIRLPOOL_CTX), offsetof(WHIRLPOOL_CTX, H.c), HASH_INFO_METHODS(WHIRLPOOL) }, /* 512 bit */
#endif
};

/* The rhash_openssl_hash_info static array initialized by rhash_plug_openssl() replaces
 * rhash internal algorithms table. It is kept in an uninitialized-data segment
 * taking no space in the executable. */
rhash_hash_info rhash_openssl_hash_info[RHASH_HASH_COUNT];

#ifdef OPENSSL_RUNTIME
#ifdef _WIN32
#define LOAD_ADDR(n, name) \
	p##name##_final = (os_fin_t)GetProcAddress(handle, #name "_Final"); \
	rhash_openssl_methods[n].update = (pupdate_t)GetProcAddress(handle, #name "_Update"); \
	rhash_openssl_methods[n].init = (rhash_openssl_methods[n].update && p##name##_final ? \
		(pinit_t)GetProcAddress(handle, #name "_Init") : 0);
#else  /* _WIN32 */
#define LOAD_ADDR(n, name) \
	p##name##_final = (os_fin_t)dlsym(handle, #name "_Final"); \
	rhash_openssl_methods[n].update = (pupdate_t)dlsym(handle, #name "_Update"); \
	rhash_openssl_methods[n].init = (rhash_openssl_methods[n].update && p##name##_final ? \
		(pinit_t)dlsym(handle, #name "_Init") : 0);
#endif /* _WIN32 */

/**
 * Load OpenSSL DLL at runtime, store pointers to functions of all
 * supported hash algorithms.
 *
 * @return 1 on success, 0 if the library not found
 */
static int load_openssl_runtime(void)
{
#ifdef _WIN32
	HMODULE handle;
	/* suppress the error popup dialogs */
	UINT oldErrorMode = SetErrorMode(SEM_FAILCRITICALERRORS);
	SetErrorMode(oldErrorMode | SEM_FAILCRITICALERRORS);

	handle = LoadLibraryA("libeay32.dll");

	SetErrorMode(oldErrorMode); /* restore error mode */
#else
	void* handle = dlopen("libcrypto.so", RTLD_NOW);
	if(!handle) handle = dlopen("libcrypto.so.1.0.0", RTLD_NOW); /* hotfix */
	if(!handle) handle = dlopen("libcrypto.so.0.9.8", RTLD_NOW);
#endif

	if(handle == NULL) return 0; /* could not load OpenSSL */

	LOAD_ADDR(0, MD4)
	LOAD_ADDR(1, MD5);
	LOAD_ADDR(2, SHA1);
	LOAD_ADDR(3, RIPEMD160);
	LOAD_ADDR(4, SHA224);
	LOAD_ADDR(5, SHA256);
	LOAD_ADDR(6, SHA384);
	LOAD_ADDR(7, SHA512);
#ifdef USE_OPENSSL_WHIRLPOOL
	LOAD_ADDR(8, WHIRLPOOL);
#endif
	return 1;
}
#endif

/**
 * Replace several RHash internal algorithms with the OpenSSL ones.
 * It replaces MD4/MD5, SHA1/SHA2, RIPEMD, WHIRLPOOL.
 *
 * @return 1 on success, 0 if OpenSSL library not found
 */
int rhash_plug_openssl(void)
{
	int i, bit_index;

	assert(rhash_info_size <= RHASH_HASH_COUNT); /* buffer-overflow protection */

	if( (rhash_openssl_hash_mask & RHASH_OPENSSL_SUPPORTED_HASHES) == 0) {
		return 1; /* do not load OpenSSL */
	}

#ifdef OPENSSL_RUNTIME
	if(!load_openssl_runtime()) return 0;
#endif

	memcpy(rhash_openssl_hash_info, rhash_info_table, sizeof(rhash_openssl_hash_info));

	/* replace internal rhash methods with the OpenSSL ones */
	for(i = 0; i < (int)(sizeof(rhash_openssl_methods) / sizeof(rhash_hash_info)); i++)
	{
		rhash_hash_info *method = &rhash_openssl_methods[i];
		if((rhash_openssl_hash_mask & method->info->hash_id) == 0) continue;
		if(!method->init) continue;
		bit_index = rhash_ctz(method->info->hash_id);
		assert(method->info->hash_id == rhash_openssl_hash_info[bit_index].info->hash_id);
		memcpy(&rhash_openssl_hash_info[bit_index], method, sizeof(rhash_hash_info));
	}

	rhash_info_table = rhash_openssl_hash_info;
	return 1;
}
#endif /* defined(USE_OPENSSL) || defined(OPENSSL_RUNTIME) */
