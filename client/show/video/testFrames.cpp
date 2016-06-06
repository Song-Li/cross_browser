/* Takes a folder of images and makes sure that every image
  in the folder is the same

  usage: ./testImages <folder>
*/

#include <string>
#include <iostream>
#include <vector>
#include <unordered_map>
#include <map>
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
  bool operator<(const imgInf & o) const {
    return browser < o.browser ||
      (browser == o.browser && frame < o.frame);
  }
} imgInf;

std::ostream & operator<<(std::ostream & os, const imgInf & p) {
  os << "Browser: " << p.browser << " Frame: " << p.frame;
  return os;
}

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

static int isallsame(const std::vector<cv::Mat> & imgs,
                     double & ave, double & stdev) {
  cv::Mat $1 = imgs[0];
  int numFails = 0;
  double * norms = new double [imgs.size()];
  for (int i = 0; i < imgs.size(); ++i) {
    norms[i] = cv::norm($1, imgs[i], cv::NORM_L2);
    if (norms[i] != 0) {
      ++numFails;
    }
  }
  for (int i = 0; i < imgs.size(); ++i)
    ave += norms[i];
  ave /= imgs.size();

  for (int i = 0; i < imgs.size(); ++i) {
    stdev += (ave - norms[i])*(ave - norms[i]);
  }

  stdev /= imgs.size() - 1;
  stdev = std::sqrt(stdev);
  delete [] norms;
  return numFails;
}

static int hasMatch(const std::vector<cv::Mat> & $1,
                    const std::vector<cv::Mat> & $2) {
  for (auto & i : $1) {
    for (auto & ii : $2) {
      if (cv::norm(i, ii, cv::NORM_L2) == 0)
        return 1;
    }
  }
  return 0;
}

int main(int argc, char ** argv) {
  std::map<imgInf, std::vector<cv::Mat> > frameToImages [2];
  boost::filesystem::path folder (argv[1]);
  int numDuds = 0;
  if (boost::filesystem::exists(folder) &&
    boost::filesystem::is_directory(folder)) {
    for (auto & file : boost::filesystem::directory_iterator(folder)) {
      const std::string name = file.path().string();
      std::vector<cv::Mat> img (1);
      img[0] = cv::imread(name);
      cv::Mat black = cv::Mat::zeros(img[0].size(), img[0].type());
      if (cv::norm(img[0], black, cv::NORM_L2) == 0) {
        ++numDuds;
        continue;
      }
      const int frame = std::stoi(name.substr(name.find("_") + 1, name.find(".") - name.find("_") - 1));
      const int browser = std::stoi(name.substr(name.find("-") + 1, 1));
      // if (browser != 0) continue;
      const int gl = frame % 2 == 0 ? 0 : 1;
      auto it = frameToImages[gl].find({frame, browser});
      if (it == frameToImages[gl].cend())
        frameToImages[gl].emplace(imgInf(frame, browser), img);
      else
        it->second.insert(it->second.end(), img.begin(), img.end());
    }
    std::cout << "Number of dud frames: " << numDuds << std::endl;
    constexpr int exclude = 0;
    double totalMatches = 0, numImgs = 0;
    for (auto & l : frameToImages[0]) {
      for (auto & p : frameToImages[0]) {
        if (l.first.browser != p.first.browser) continue;
        totalMatches += hasMatch(l.second, p.second);
        ++numImgs;
      }
    }
    std::cout << "CTX match rate: " << totalMatches/numImgs*100 << "%" << std::endl;

    totalMatches = 0, numImgs = 0;
    for (auto & l : frameToImages[1]) {
      for (auto & p : frameToImages[1]) {
        if (l.first.browser != p.first.browser) continue;
        totalMatches += hasMatch(l.second, p.second);
        ++numImgs;
      }
    }
    std::cout << "GL match rate: " << totalMatches/numImgs*100 << "%" << std::endl;


    std::cout << "CTX test: " << std::endl;
    for (auto & p : frameToImages[0]) {
      double ave = 0, stdev = 0;
      const double diff = isallsame(p.second, ave, stdev);
      std::cout << "\t" << p.first << " failure rate: "
        << diff/p.second.size()*100 << "%"
        << " L2 norm (ave, stdev): (" << ave
        << ", " << stdev << ")" << std::endl;
    }

    std::cout << "GL test: " << std::endl;
    for (auto & p : frameToImages[1]) {
      double ave = 0, stdev = 0;
      const double diff = isallsame(p.second, ave, stdev);
      std::cout << "\t" << p.first << " failure rate: "
        << diff/p.second.size()*100 << "%"
        << " L2 norm (ave, stdev): (" << ave
        << ", " << stdev << ")" << std::endl;
    }
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
