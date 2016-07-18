#include <stdlib.h>

#define imAccess(__array, __y, __x) (__array)[(__y)*cols + (__x)]

int boxTester(unsigned char * pixels, int rows, int cols) {
  int * xCountDict = (int *)calloc(cols, sizeof(int));
  for (int j = 0; j < rows; ++j) {
    int xcount = 0;
    for (int i = 0; i < cols; ++i) {
      if (imAccess(pixels, j, i))
        ++xcount;
    }
    ++xCountDict[xcount];
  }
  int numXCounts = 0;
  for (int i = 0; i < cols; ++i)
    if (xCountDict[i])
      ++numXCounts;
  free(xCountDict);

  int *yCountDict = (int *)calloc(rows, sizeof(int));
  for (int i = 0; i < cols; ++i) {
    int ycount = 0;
    for (int j = 0; j < rows; ++j) {
      if (imAccess(pixels, j, i))
        ++ycount;
    }
    ++yCountDict[ycount];
  }
  int numYCounts = 0;
  for (int j = 0; j < rows; ++j)
    if (yCountDict[j])
      ++numYCounts;
  free(yCountDict);

  return numYCounts <= 5 && numXCounts <= 5;
}