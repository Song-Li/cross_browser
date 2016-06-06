/* Takes a folder of images and makes sure that every image
  in the folder is the same

  usage: ./testImages <folder>
*/

#include <string>
#include <iostream>
#include <vector>
#include <unordered_map>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/opencv.hpp>
#include <boost/filesystem.hpp>


typedef struct imgInf{
  int frame, browser;
  imgInf (int f, int b) : frame {f}, browser {b} {};
  bool operator==(const imgInf & other) const {
    return frame == other.frame && browser == other.browser;
  }
} imgInf;

namespace std {
  template<>
  struct hash<imgInf> {
    static constexpr double A = 1.6180339887498948482*1e5;
    hash<double> h;
    size_t operator()(const imgInf & a) const {
      size_t seed = h(A*a.frame);
      seed ^= h(A*a.browser) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
      return seed;
    }
  };
} // std

static int isallsame(const std::vector<cv::Mat> & imgs) {
  cv::Mat $1 = imgs[0];
  int numFails = 0;
  for (auto & i : imgs) {
    if (cv::norm($1, i, cv::NORM_L2) != 0) {
      ++numFails;
    }
  }
  return numFails;
}

static int hasMatch(const std::vector<cv::Mat> & $1,
                    const std::vector<cv::Mat> & $2) {
  for (auto & i : $1)
    for (auto & ii : $2)
      if (cv::norm(ii, i, cv::NORM_L2) == 0)
        return 1;
  return 0;
}

int main(int argc, char ** argv) {
  std::unordered_map<int, std::vector<cv::Mat> > browserToImages [2];
  boost::filesystem::path folder (argv[1]);
  if (boost::filesystem::exists(folder) &&
    boost::filesystem::is_directory(folder)) {
    for (auto & file : boost::filesystem::directory_iterator(folder)) {
      const std::string name = file.path().string();
      std::vector<cv::Mat> img (1);
      img[0] = cv::imread(name);
      const int frame = std::stoi(name.substr(name.find("_") + 1, name.find(".") - name.find("_") - 1));
      const int browser = std::stoi(name.substr(name.find("-") + 1, 1));
      const int can = frame % 2 == 0 ? 0 : 1;
      auto it = browserToImages[can].find(browser);
      if (it == browserToImages[can].cend())
        browserToImages[can].emplace(browser, img);
      else
        it->second.insert(it->second.end(), img.begin(), img.end());
    }
    constexpr int exclude = 0;
    double totalMatches = 0, numImgs = 0;
    for (auto & l : browserToImages[0]) {
      for (auto & p : browserToImages[0]) {
        if (l.first == p.first) continue;
        totalMatches += hasMatch(l.second, p.second);
        ++numImgs;
      }
    }

    std::cout << "CTX match rate: " << totalMatches/numImgs << std::endl;
    totalMatches = 0, numImgs = 0;
    for (auto & l : browserToImages[1]) {
      for (auto & p : browserToImages[1]) {
        if (l.first == p.first) continue;
        totalMatches += hasMatch(l.second, p.second);
        ++numImgs;
      }
    }
    std::cout << "GL match rate: " << totalMatches/numImgs << std::endl;
    /*for (int startNum = 8; startNum <= 9; ++startNum) {
      for (int i = 0; i < 10; ++i) {
        auto & $1img = frameToImages.find(startNum + 2*i)->second;
        for (int j = i + 1; j < 10; ++j) {

        }
      }
    }*/
  } else {
    cv::Mat firstImage, currentImage;
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
        cv::imshow("Diff", diff);
        cv::waitKey(0);
      }
      aveNorm += norm;
      frame++;
    }
    std::cout << "Average L2 norm: " << aveNorm/frame << std::endl;
  }
}
