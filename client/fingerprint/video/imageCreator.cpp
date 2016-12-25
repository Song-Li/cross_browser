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
  constexpr int AAFactor = 16;
  constexpr int numRows = 10;
  constexpr int d = 2000;
  cv::Mat_<cv::Vec3b> out(AAFactor*d, AAFactor*d, cv::Vec3b(255, 255, 255));
  constexpr int distBetweenRows = d*AAFactor/numRows;

  for (int j = distBetweenRows/2; j < out.rows; j += distBetweenRows) {
    for (int i = distBetweenRows/2; i < out.cols; i += distBetweenRows) {
      auto color = randomColor();
      constexpr double maxRadius = d/50*AAFactor;
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

  cv::Mat_<cv::Vec3b> tmp, AA;
  cv::resize(out, tmp, cv::Size(d, d));
  cv::blur(tmp, AA, cv::Size(3,3));

  for (int j = distBetweenRows/2/AAFactor; j < AA.rows; j += distBetweenRows/AAFactor) {
    for (int i = 0; i < AA.cols; ++i) {
      if (AA(j, i) == cv::Vec3b(255, 255, 255))
        AA(j, i) = cv::Vec3b(0, 0, 0);
    }
  }

  for (int j = 0; j < AA.rows; ++j) {
    for (int i = distBetweenRows/2/AAFactor; i < AA.cols; i += distBetweenRows/AAFactor) {
      if (AA(j, i) == cv::Vec3b(255, 255, 255))
        AA(j, i) = cv::Vec3b(0, 0, 0);
    }
  }

  cv::imwrite("grid.png", AA);

  /*cv::Mat in = cv::imread(argv[1], CV_LOAD_IMAGE_ANYDEPTH |
  CV_LOAD_IMAGE_COLOR);
  cv::Mat out2;
  constexpr double alpha = static_cast<double>((1 << 8) - 1)/((1 << 16) - 1);
  in.convertTo(out2, CV_8UC3, alpha);
  cv::imwrite("test.png", out2);*/
}