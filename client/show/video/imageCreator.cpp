#include <iostream>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/opencv.hpp>
#include <opencv2/videoio.hpp>
#include <random>

std::string type2str(int type) {
  std::string r;

  uchar depth = type & CV_MAT_DEPTH_MASK;
  uchar chans = 1 + (type >> CV_CN_SHIFT);

  switch (depth) {
  case CV_8U:
    r = "8U";
    break;
  case CV_8S:
    r = "8S";
    break;
  case CV_16U:
    r = "16U";
    break;
  case CV_16S:
    r = "16S";
    break;
  case CV_32S:
    r = "32S";
    break;
  case CV_32F:
    r = "32F";
    break;
  case CV_64F:
    r = "64F";
    break;
  default:
    r = "User";
    break;
  }

  r += "C";
  r += (chans + '0');

  return r;
}

static cv::Vec3b randomColor() {
  static cv::RNG rng(0xFFFFFFFF);
  int icolor = (unsigned)rng;
  return cv::Vec3b(icolor & 255, (icolor >> 8) & 255, (icolor >> 16) & 255);
}

int main(int agrc, char **argv) {
  constexpr int d = 1000;
  cv::Mat_<cv::Vec3b> out(d, d, cv::Vec3b(255, 255, 255));

  for (int j = 50; j < d; j += 100) {
    for (int i = 0; i < d; ++i) {
      out(j, i) = cv::Vec3b(0, 0, 0);
    }
  }

  for (int j = 0; j < d; ++j) {
    for (int i = 50; i < d; i += 100) {
      out(j, i) = cv::Vec3b(0, 0, 0);
    }
  }

  for (int j = 50; j < d; j += 100) {
    for (int i = 50; i < d; i += 100) {
      auto color = randomColor();
      constexpr double maxRadius = 10;
      for (double radius = 0; radius <= maxRadius; radius += 0.5) {
        for (double y = -radius; y <= radius; ++y) {
          double xMag = std::sqrt(radius * radius - y * y);
          for (double x = -xMag; x <= xMag; ++x) {
            out(j + y, i + x) = color;
          }
        }
      }
    }
  }

  cv::imwrite("grid.png", out);

  /*cv::Mat in = cv::imread(argv[1], CV_LOAD_IMAGE_ANYDEPTH |
  CV_LOAD_IMAGE_COLOR);
  cv::Mat out2;
  constexpr double alpha = static_cast<double>((1 << 8) - 1)/((1 << 16) - 1);
  in.convertTo(out2, CV_8UC3, alpha);
  cv::imwrite("test.png", out2);*/
}