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

struct imgInf {
  const int frame, browser, sortBy;
  static constexpr int f = 1;
  static constexpr int b = 2;
  imgInf (int f, int b, int s) : frame {f}, browser {b}, sortBy {s} {};
  bool operator==(const imgInf & other) const {
    if (sortBy == (f | b))
      return frame == other.frame && browser == other.browser;
    else if (sortBy == f)
      return frame == other.frame;
    else if (sortBy == b)
      return browser == other.browser;
    else
      return false;
  }
  bool operator<(const imgInf & o) const {
    if (sortBy == (f | b))
      return browser < o.browser ||
        (browser == o.browser && frame < o.frame);
    else if (sortBy == f)
      return frame < o.frame;
    else if (sortBy == b)
      return browser < o.browser;
    else
      return false;
  }
};

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
  for (int i = 1; i < imgs.size(); ++i) {
    norms[i] = cv::norm($1, imgs[i], cv::NORM_L2);
    if (norms[i] != 0) {
      ++numFails;
    }
  }
  for (int i = 1; i < imgs.size(); ++i)
    ave += norms[i];
  ave /= imgs.size() - 1;

  for (int i = 1; i < imgs.size(); ++i) {
    stdev += (ave - norms[i])*(ave - norms[i]);
  }

  stdev /= imgs.size() - 2;
  stdev = std::sqrt(stdev);
  delete [] norms;
  return numFails;
}

static double hasMatch(const std::vector<cv::Mat> & $1,
                    const std::vector<cv::Mat> & $2) {
  double minNorm = 1e10;
  for (auto & i : $1)
    for (auto & ii : $2)
      minNorm = std::min(minNorm, cv::norm(i, ii, cv::NORM_L2));
  return minNorm;
}

static void diffAll(const std::vector<cv::Mat> & imgs, int frame) {
  int count = 0;
  for (int i = 1; i < imgs.size(); ++i) {
    const double norm = cv::norm(imgs[0], imgs[i], cv::NORM_L2);
    if (norm == 0)
      continue;
    cv::Mat diff;
    cv::absdiff(imgs[0], imgs[i], diff);
    cv::Mat out (imgs[0].size(), imgs[0].type());
    imgs[0].copyTo(out);
    for (int j = 0; j < diff.rows; ++j) {
      uchar * data = diff.ptr<uchar>(j);
      uchar * dst = out.ptr<uchar>(j);
      for (int i = 0; i < diff.cols*diff.channels(); ++i) {
        data[i] = cv::saturate_cast<uchar>(100*data[i]);
        if (data[i]) {
          dst[3*(i/3) + 0] = 0;
          dst[3*(i/3) + 1] = 0;
          dst[3*(i/3) + 2] = 255;
        }
      }
    }
    if (false) {
      std::cout << norm << std::endl;
      cvNamedWindow("Diff", CV_WINDOW_NORMAL);
      cv::imshow("Diff", diff);
      cvNamedWindow("Out", CV_WINDOW_NORMAL);
      cv::imshow("Out", out);
      cv::waitKey(0);
    }

    if (true) {
      const std::string diffName = "results/diff_" + std::to_string(frame) + "_" + std::to_string(count) + ".png";
      cv::imwrite(diffName, diff);

      const std::string markedName = "results/marked_" + std::to_string(frame) + "_" + std::to_string(count) + ".png";
      cv::imwrite(markedName, out);
      ++count;
    }

  }
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
      const int frame = std::stoi(name.substr(name.find("_") + 1, name.find(".") - name.find("_") - 1));
      const int browser = std::stoi(name.substr(name.find("-") + 1, 1));
      const int gl = frame % 2 == 0 ? 0 : 1;
      // if (browser != 0 || gl != 1) continue;
      auto it = frameToImages[gl].find({frame, browser, imgInf::f});
      if (it == frameToImages[gl].cend())
        frameToImages[gl].emplace(imgInf(frame, browser, imgInf::f), img);
      else
        it->second.insert(it->second.end(), img.begin(), img.end());
    }
    std::cout << "Number of dud frames: " << numDuds << std::endl;
    for (auto & i : frameToImages[1]) {
      if (i.first.browser != 0) continue;
      std::cout << i.first << std::endl;
      diffAll(i.second, i.first.frame);
    }
    constexpr int exclude = 0;
    double totalMatches = 0, numImgs = 0;
    for (auto & l : frameToImages[0]) {
      for (auto & p : frameToImages[0]) {
        if (l.first.browser == p.first.browser) continue;
        totalMatches += hasMatch(l.second, p.second);
        ++numImgs;
      }
    }
    std::cout << "CTX match rate: " << totalMatches/numImgs << std::endl;

    totalMatches = 0, numImgs = 0;
    for (auto & l : frameToImages[1]) {
      for (auto & p : frameToImages[1]) {
        if (l.first.browser == p.first.browser) continue;
        totalMatches += hasMatch(l.second, p.second);
        ++numImgs;
      }
    }
    std::cout << "GL match rate: " << totalMatches/numImgs << std::endl;


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
    cv::Mat ground, test;
    double aveNorm = 0;
    int frame = 0;
    cv::VideoCapture groundVid (argv[1]),
      testVid (argv[2]);
    groundVid >> ground;
    while (testVid.read(test)) {
      const double norm = cv::norm(ground, test, cv::NORM_L2);
      aveNorm += norm;
      frame++;
      if (false) {
        if (!norm) continue;
        std::cout << norm << std::endl;
        std::cout << frame << std::endl;
        cv::Mat diff;
        cv::absdiff(ground, test, diff);
        for (int j = 0; j < diff.rows; ++j) {
          uchar * data = diff.ptr<uchar>(j);
          for (int i = 0; i < diff.cols*diff.channels(); ++i) {
            data[i] = cv::saturate_cast<uchar>(50*data[i]);
          }
        }
        cvNamedWindow("Ground", CV_WINDOW_NORMAL);
        cv::imshow("Ground", ground);
        cvNamedWindow("Diff", CV_WINDOW_NORMAL);
        cv::imshow("Diff", diff);
        cvNamedWindow("Test", CV_WINDOW_NORMAL);
        cv::imshow("Test", test);
        cv::waitKey(0);
      }
    }
    std::cout << "Average L2 norm: " << aveNorm/frame << std::endl;
  }
}
