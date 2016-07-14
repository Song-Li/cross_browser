/* crc32.h */
#ifndef CRC32_H
#define CRC32_H

#ifdef __cplusplus
extern "C" {
#endif

/* hash functions */

unsigned rhash_get_crc32(unsigned crcinit, const unsigned char* msg, size_t size);
unsigned rhash_get_crc32_str(unsigned crcinit, const char* str);

#ifdef GENERATE_CRC32_TABLE
void rhash_crc32_init_table(void); /* initialize algorithm static data */
#endif

#ifdef __cplusplus
} /* extern "C" */
#endif /* __cplusplus */

#endif /* CRC32_H */
