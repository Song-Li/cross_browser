/* plug_openssl.h - plug-in openssl algorithms */
#ifndef RHASH_PLUG_OPENSSL_H
#define RHASH_PLUG_OPENSSL_H
#if defined(USE_OPENSSL) || defined(OPENSSL_RUNTIME)

#ifdef __cplusplus
extern "C" {
#endif

int rhash_plug_openssl(void); /* load openssl algorithms */

#define RHASH_OPENSSL_DEFAULT_HASHES (RHASH_MD5 | RHASH_SHA1 | \
	RHASH_SHA224 | RHASH_SHA256 | RHASH_SHA384 | RHASH_SHA512 | \
	RHASH_WHIRLPOOL)

extern unsigned rhash_openssl_hash_mask; /* mask of hash sums to use */

#ifdef __cplusplus
} /* extern "C" */
#endif /* __cplusplus */

#endif /* defined(USE_OPENSSL) || defined(OPENSSL_RUNTIME) */
#endif /* RHASH_PLUG_OPENSSL_H */
