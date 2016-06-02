/* Takes a folder of images and makes sure that every image
  in the folder is the same

  usage: ./testImages <folder>
*/

#include <string>
#include <iostream>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/opencv.hpp>
#include <boost/filesystem.hpp>

int main(int argc, char ** argv) {
  cv::Mat firstImage, currentImage;
  boost::filesystem::path folder (argv[1]);
  if (boost::filesystem::exists(folder) &&
    boost::filesystem::is_directory(folder)) {
    for (auto & file : boost::filesystem::directory_iterator(folder)) {
      const std::string name = file.path().string();
      currentImage = cv::imread(name);
      if (!firstImage.data) {
        firstImage = cv::Mat(currentImage.size(), currentImage.type());
        currentImage.copyTo(firstImage);
      }
      const double norm = cv::norm(firstImage, currentImage, cv::NORM_L2);
      if (norm != 0) {
        std::cout << norm << std::endl;
        std::cout << name << std::endl;
        cv::Mat diff;
        cv::absdiff(firstImage, currentImage, diff);
        for (int j = 0; j < diff.rows; ++j) {
          uchar * data = diff.ptr<uchar>(j);
          for (int i = 0; i < diff.cols*diff.channels(); ++i) {
            data[i] = cv::saturate_cast<uchar>(50*data[i]);
          }
        }
        cvNamedWindow("Diff", CV_WINDOW_NORMAL);
        cv::imshow("Diff", diff);
        cv::waitKey(0);
      }
    }
  } else {
    double aveNorm;
    int frame = 0;
    cv::VideoCapture vid (argv[1]);
    while (vid.read(currentImage)) {
      if (!firstImage.data) {
        firstImage = cv::Mat(currentImage.size(), currentImage.type());
        currentImage.copyTo(firstImage);
      }
      const double norm = cv::norm(firstImage, currentImage, cv::NORM_L2);
      if (false) {
        std::cout << norm << std::endl;
        std::cout << frame << std::endl;
        cv::Mat diff;
        cv::absdiff(firstImage, currentImage, diff);
        for (int j = 0; j < diff.rows; ++j) {
          uchar * data = diff.ptr<uchar>(j);
          for (int i = 0; i < diff.cols*diff.channels(); ++i) {
            data[i] = cv::saturate_cast<uchar>(50*data[i]);
          }
        }
        cvNamedWindow("Diff", CV_WINDOW_NORMAL);
        cv::imshow("Diff", currentImage);
        cv::waitKey(0);
      }
      aveNorm += norm;
      std::cout << frame++ << std::endl;
    }
    std::cout << "Average L2 norm: " << aveNorm/frame << std::endl;
  }
}
