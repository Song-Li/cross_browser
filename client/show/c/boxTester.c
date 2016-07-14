#include <stdlib.h>

int boxTester(unsigned char * pixels, int rows, int cols) {
  int * xCountSet = (int *)calloc(cols, sizeof(int));
  for (int j = 0; j < rows; ++j) {
    int xcount = 0;
    for (int i = 0; i < cols; ++i) {
      if (pixels[j*cols + i])
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
      if (pixels[j*cols + i])
        ++ycount;
    }
    ++yCountSet[ycount];
  }
  int numYCounts = 0;
  for (int j = 0; j < rows; ++j)
    if (yCountSet[j])
      ++numYCounts;
  free(yCountSet);

  return numYCounts <= 4 && numXCounts <= 4;
}