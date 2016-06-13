#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/opencv.hpp>
#include <iostream>


constexpr double PI = 3.14159265358979323846;
static constexpr double degreesToRadians(double degrees) {
  return degrees*PI/180.0;
}

int main() {
  cv::Mat out (1080, 1920, CV_8UC3);
  constexpr double nu = 2*PI/1920;
  for (int j = 0; j < 1080; ++j) {
    uchar * dst = out.ptr<uchar>(j);
    for (int i = 0; i < 1920; ++i) {
      const int r = cv::saturate_cast<uchar>(
        std::sin(nu*i + degreesToRadians(0))*127.5 + 127.5);
      const int g = cv::saturate_cast<uchar>(
        std::sin(nu*i + degreesToRadians(120))*127.5 + 127.5);
      const int b = cv::saturate_cast<uchar>(
        std::sin(nu*i + degreesToRadians(240))*127.5 + 127.5);
      dst[3*i + 0] = b;
      dst[3*i + 1] = g;
      dst[3*i + 2] = r;
    }
  }

  cv::imwrite("rainbow.png", out);
}