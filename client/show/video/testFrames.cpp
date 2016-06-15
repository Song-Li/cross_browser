/* Takes a folder of images and makes sure that every image
  in the folder is the same

  usage: ./testImages <folder>
*/

#include <boost/filesystem.hpp>
#include <eigen3/Eigen/Eigen>
#include <iostream>
#include <map>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/opencv.hpp>
#include <string>
#include <unordered_map>
#include <vector>

struct imgInf {
  const int frame, browser, sortBy;
  static constexpr int fram = 1;
  static constexpr int brow = 2;
  static constexpr int none = 10;
  imgInf(int f, int b, int s) : frame{f}, browser{b}, sortBy{s} {};
  bool operator==(const imgInf &other) const {
    if (sortBy == (fram | brow))
      return frame == other.frame && browser == other.browser;
    else if (sortBy == fram)
      return frame == other.frame;
    else if (sortBy == brow)
      return browser == other.browser;
    else
      return true;
  }
  bool operator<(const imgInf &o) const {
    if (sortBy == (fram | brow))
      return browser < o.browser || (browser == o.browser && frame < o.frame);
    else if (sortBy == fram)
      return frame < o.frame;
    else if (sortBy == brow)
      return browser < o.browser;
    else
      return false;
  }
  bool operator>=(const imgInf &o) const {
    return !operator<(o);
  }
  bool operator>(const imgInf &o) const {
    return !(operator<(o) || operator==(o));
  }
};

std::ostream &operator<<(std::ostream &os, const imgInf &p) {
  os << "Browser: " << p.browser << " Frame: " << p.frame;
  return os;
}

namespace std {
template <> struct hash<imgInf> {
  static constexpr double A = 1.6180339887498948482 * 1e5;
  hash<double> h;
  size_t operator()(const imgInf &a) const {
    size_t seed = h(A * a.frame);
    seed ^= h(A * a.browser) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
    return seed;
  }
};
} // std

static void diffImgs(const cv::Mat &imgA, const cv::Mat &imgB) {

  cv::Mat diff;
  cv::absdiff(imgA, imgB, diff);
  cv::Mat out(imgA.size(), imgA.type());
  imgA.copyTo(out);
  for (int j = 0; j < diff.rows; ++j) {
    uchar *data = diff.ptr<uchar>(j);
    uchar *dst = out.ptr<uchar>(j);
    for (int i = 0; i < diff.cols * diff.channels(); ++i) {
      data[i] = cv::saturate_cast<uchar>(100 * data[i]);
      if (data[i]) {
        dst[3 * (i / 3) + 0] = 0;
        dst[3 * (i / 3) + 1] = 0;
        dst[3 * (i / 3) + 2] = 255;
      }
    }
  }
  if (true) {
    cvNamedWindow("Diff", CV_WINDOW_NORMAL);
    cv::imshow("Diff", diff);
    cvNamedWindow("Out", CV_WINDOW_NORMAL);
    cv::imshow("Out", out);
    cv::waitKey(0);
  }

  /*if (false) {
    const std::string diffName = "results/diff_" + std::to_string(frame) +
                                 "_" + std::to_string(count) + ".png";
    cv::imwrite(diffName, diff);

    const std::string markedName = "results/marked_" + std::to_string(frame) +
                                   "_" + std::to_string(count) + ".png";
    cv::imwrite(markedName, out);
    ++count;
  }*/
}

static double entropy(const cv::Mat_<cv::Vec3b> &img) {
  Eigen::Vector3d sum = Eigen::Vector3d::Zero();
  for (int j = 0; j < img.rows; ++j) {
    for (int i = 0; i < img.cols; ++i) {
      for (int c = 0; c < img.channels(); ++c) {
        sum[c] += img(j, i)[c];
      }
    }
  }

  Eigen::Vector3d entropy = Eigen::Vector3d::Zero();
  for (int j = 0; j < img.rows; ++j) {
    for (int i = 0; i < img.cols; ++i) {
      for (int c = 0; c < img.channels(); ++c) {
        const double frac = img(j, i)[c] / sum[c];
        if (frac > 0) {
          entropy[c] -= frac * std::log(frac);
        }
      }
    }
  }

  return entropy.sum() / 3;
}

static double isallsame(const std::vector<cv::Mat> &a,
                        const std::vector<cv::Mat> &b, double &ave,
                        double &stdev) {

  double numFails = 0, count = 0;
  std::vector<double> norms;
  for (auto &i : a) {
    for (auto &ii : b) {
      if (i.ptr<uchar>(0) == ii.ptr<uchar>(0))
        continue;
      const double norm = cv::norm(i, ii, cv::NORM_L2);
      ++count;
      if (norm != 0) {
        ++numFails;
        // diffImgs(i, ii);
        cv::Mat diff;
        cv::absdiff(i, ii, diff);
        cv::Mat_<cv::Vec3b> _diff = diff;
        const double ent = entropy(_diff);
        norms.push_back(ent);
      }
    }
  }
  ave = 0;
  for (int i = 0; i < norms.size(); ++i)
    ave += norms[i];
  ave /= norms.size();

  stdev = 0;
  for (int i = 1; i < norms.size(); ++i)
    stdev += (ave - norms[i]) * (ave - norms[i]);

  stdev /= norms.size() - 1;
  stdev = std::sqrt(stdev);

  return numFails / count * 100;
}

static double hasMatch(const std::vector<cv::Mat> &$1,
                       const std::vector<cv::Mat> &$2) {
  double minNorm = 1e10;
  for (auto &i : $1)
    for (auto &ii : $2)
      minNorm = std::min(minNorm, cv::norm(i, ii, cv::NORM_L2));
  return minNorm;
}

static void tester(const std::map<imgInf, std::vector<cv::Mat>> &a,
                   const std::map<imgInf, std::vector<cv::Mat>> &b, double &out,
                   double &out2) {
  double aveAve = 0, avestd = 0, count = 0;
  for (auto &p : a) {
    for (auto &l : b) {
      if (p.first > l.first)
        continue;
      double ave = 0, stdev = 0;
      const double diff = isallsame(p.second, l.second, ave, stdev);
      std::cout << "\t" << p.first << " vs. " << l.first
                << " failure rate: " << diff << "%"
                << " entropy (ave, stdev): (" << ave << ", " << stdev << ")"
                << std::endl;
      aveAve += ave;
      avestd += stdev;
      ++count;
    }
  }
  aveAve /= count;
  avestd /= count;
  out += aveAve;
  out2 += avestd;
}

int main(int argc, char **argv) {
  std::map<std::string, std::map<imgInf, std::vector<cv::Mat>>> ipToImages[2];
  boost::filesystem::path folder(argv[1]);

  if (boost::filesystem::exists(folder) &&
      boost::filesystem::is_directory(folder)) {
    for (auto &inner : boost::filesystem::directory_iterator(folder)) {
      const std::string ip = inner.path().filename().string();
      std::map<imgInf, std::vector<cv::Mat>> frameToImages[2];
      for (auto &file : boost::filesystem::directory_iterator(inner)) {
        const std::string name = file.path().string();
        std::vector<cv::Mat> img(1);
        img[0] = cv::imread(name);
        const int frame = std::stoi(name.substr(
            name.find("_") + 1, name.find(".") - name.find("_") - 1));
        const int browser = std::stoi(name.substr(name.find("-") + 1, 1));
        const int gl = frame % 2 == 0 ? 0 : 1;
        // if (browser != 0 || gl != 1) continue;
        if (browser == 1) continue;
        constexpr int sortBy = imgInf::brow;
        auto it = frameToImages[gl].find({frame, browser, sortBy});
        if (it == frameToImages[gl].cend())
          frameToImages[gl].emplace(imgInf(frame, browser, sortBy), img);
        else
          it->second.insert(it->second.end(), img.begin(), img.end());
      }
      ipToImages[0].emplace(ip, frameToImages[0]);
      ipToImages[1].emplace(ip, frameToImages[1]);
    }
    double sig[] = {0, 0, 0}, noise[] = {0, 0, 0};
    std::cout << "CTX test: " << std::endl;
    for (auto &a : ipToImages[0]) {
      for (auto &b : ipToImages[0]) {
        /*if (a.first == b.first)
          continue;*/
        std::cout << a.first << " vs. " << b.first << std::endl;
        if (a.first == b.first) {
          tester(a.second, b.second, noise[0], noise[1]);
          ++noise[2];
        } else {
          tester(a.second, b.second, sig[0], sig[1]);
          ++sig[2];
        }
      }
    }

    std::cout << std::endl
              << std::endl
              << "Signal: (" << sig[0] / sig[2] << ", " << sig[1] / sig[2] << ")"
              << std::endl
              << "Noise: (" << noise[0] / noise[2] << ", " << noise[1] / noise[2]
              << ")" << std::endl
              << std::endl;

    memset(sig, 0, 3 * sizeof(double));
    memset(noise, 0, 3 * sizeof(double));
    std::cout << "GL test: " << std::endl;
    for (auto &a : ipToImages[1]) {
      for (auto &b : ipToImages[1]) {
        /*if (a.first == b.first)
          continue;*/
        std::cout << a.first << " vs. " << b.first << std::endl;
        if (a.first == b.first) {
          tester(a.second, b.second, noise[0], noise[1]);
          ++noise[2];
        } else {
          tester(a.second, b.second, sig[0], sig[1]);
          ++sig[2];
        }
      }
    }
    std::cout << std::endl
              << std::endl
              << "Signal: (" << sig[0] / sig[2] << ", " << sig[1] / sig[2] << ")"
              << std::endl
              << "Noise: (" << noise[0] / noise[2] << ", " << noise[1] / noise[2]
              << ")" << std::endl
              << std::endl;
  } else {
    cv::Mat ground, test;
    double aveNorm = 0;
    int frame = 0;
    cv::VideoCapture groundVid(argv[1]), testVid(argv[2]);
    groundVid >> ground;
    while (testVid.read(test)) {
      const double norm = cv::norm(ground, test, cv::NORM_L2);
      aveNorm += norm;
      frame++;
      if (true) {
        if (!norm)
          continue;
        std::cout << norm << std::endl;
        std::cout << frame << std::endl;
        cv::Mat diff;
        cv::absdiff(ground, test, diff);
        for (int j = 0; j < diff.rows; ++j) {
          uchar *data = diff.ptr<uchar>(j);
          for (int i = 0; i < diff.cols * diff.channels(); ++i) {
            data[i] = cv::saturate_cast<uchar>(50 * data[i]);
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
    std::cout << "Average L2 norm: " << aveNorm / frame << std::endl;
  }
}
