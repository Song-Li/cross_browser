#include <stdlib.h>

#define imAccess(__array, __y, __x) (__array)[(__y)*cols + (__x)]

int boxTester(unsigned char * pixels, int rows, int cols) {
  int * xCountSet = (int *)calloc(cols, sizeof(int));
  for (int j = 0; j < rows; ++j) {
    int xcount = 0;
    for (int i = 0; i < cols; ++i) {
      if (imAccess(pixels, j, i))
        ++xcount;
    }
    ++xCountSet[xcount];
  }
  int numXCounts = 0;
  for (int i = 0; i < cols; ++i)
    if (xCountSet[i])
      ++numXCounts;
  free(xCountSet);

  int *yCountSet = (int *)calloc(rows, sizeof(int));
  for (int i = 0; i < cols; ++i) {
    int ycount = 0;
    for (int j = 0; j < rows; ++j) {
      if (imAccess(pixels, j, i))
        ++ycount;
    }
    ++yCountSet[ycount];
  }
  int numYCounts = 0;
  for (int j = 0; j < rows; ++j)
    if (yCountSet[j])
      ++numYCounts;
  free(yCountSet);

  return numYCounts <= 5 && numXCounts <= 5;
}