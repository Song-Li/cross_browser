#include "librhash/sha3.h"

#include <stdio.h>
#include <string.h>

#include <stdint.h>
#include <stdlib.h>

static char encoding_table[] = {
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_'};
static int mod_table[] = {0, 2, 1};

char *base64_encode(const unsigned char *data, size_t input_length,
                    size_t *output_length) {

  *output_length = 4 * ((input_length + 2) / 3);

  char *encoded_data = malloc(*output_length);
  if (encoded_data == NULL)
    return NULL;

  for (int i = 0, j = 0; i < input_length;) {

    uint32_t octet_a = i < input_length ? (unsigned char)data[i++] : 0;
    uint32_t octet_b = i < input_length ? (unsigned char)data[i++] : 0;
    uint32_t octet_c = i < input_length ? (unsigned char)data[i++] : 0;

    uint32_t triple = (octet_a << 0x10) + (octet_b << 0x08) + octet_c;

    encoded_data[j++] = encoding_table[(triple >> (3 * 6)) & 0x3F];
    encoded_data[j++] = encoding_table[(triple >> (2 * 6)) & 0x3F];
    encoded_data[j++] = encoding_table[(triple >> (1 * 6)) & 0x3F];
    encoded_data[j++] = encoding_table[(triple >> (0 * 6)) & 0x3F];
  }

  for (int i = 0; i < mod_table[input_length % 3]; i++)
    encoded_data[*output_length - 1 - i] = '=';

  return encoded_data;
}

unsigned char *hashSha512(const unsigned char *msg, size_t length) {
  sha3_ctx sha;
  rhash_sha3_512_init(&sha);
  rhash_sha3_update(&sha, msg, length);
  unsigned char *result =
      (unsigned char *)malloc(sha3_512_hash_size * sizeof(char));
  rhash_sha3_final(&sha, result);
  return result;
}

unsigned char *hashSha256(const unsigned char *msg, size_t length) {
  sha3_ctx sha;
  rhash_sha3_256_init(&sha);
  rhash_sha3_update(&sha, msg, length);
  unsigned char *result =
      (unsigned char *)malloc(sha3_256_hash_size * sizeof(char));
  rhash_sha3_final(&sha, result);
  return result;
}

char *pixelsToHashCode(const unsigned char *pixels, size_t length) {

  unsigned char *combinedHash = (unsigned char *)malloc(
      (sha3_512_hash_size + sha3_256_hash_size) * sizeof(char));

  unsigned char *sha512 = hashSha512(pixels, length);
  memcpy((void *)combinedHash, (const void *)sha512,
         sha3_512_hash_size);
  free(sha512);

  unsigned char *sha256 = hashSha256(pixels, length);
  memcpy((void *)(combinedHash + sha3_512_hash_size),
         (const void *)sha256, sha3_256_hash_size);
  free(sha256);


  size_t b64length;
  char *b64 = base64_encode(
      combinedHash, sha3_512_hash_size + sha3_256_hash_size, &b64length);
  b64 = realloc(b64, b64length + 1);
  b64[b64length] = '\0';

  free(combinedHash);

  return b64;
}