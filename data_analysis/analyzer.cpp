/* Takes a folder of images and makes sure that every image
  in the folder is the same

  usage: ./analyzer <folder>

  Image format:  <user_id>_<browser>_<test_number>.png
*/

#include <boost/filesystem.hpp>
#include <boost/math/distributions/students_t.hpp>
#include <eigen3/Eigen/Eigen>
#include <iostream>
#include <map>
#include <memory>
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/opencv.hpp>
#include <string>
#include <unordered_map>
#include <vector>

struct imgInf {
  const int uid, browser, test;
  imgInf(int uid, int browser, int test)
      : uid{uid}, browser{browser}, test{test} {};
  bool operator==(const imgInf &o) const {
    return uid == o.uid && browser == o.browser && test == o.test;
  };
};

namespace std {
template <> struct hash<imgInf> {
  static constexpr double A = 1.61803398875 * 1e5;
  hash<double> h;
  size_t operator()(const imgInf &k) const {
    size_t seed = h(k.uid * A);
    seed ^= h(k.browser * A) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
    seed ^= h(k.test * A) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
    return seed;
  }
};
}

typedef std::shared_ptr<cv::Mat> MatPtr;
typedef std::vector<MatPtr> vecType;

std::ostream & operator<<(std::ostream & out, const imgInf & p) {
  out << p.test << " " << p.uid << std::endl;
}

template <class It, class UnaryFunc, class UnaryPredicate>
std::tuple<double, double> aveAndStdev(It first, It last, UnaryFunc selector,
                                       UnaryPredicate filter) {
  double average = 0;
  int count = 0;
  std::for_each(first, last, [&](auto &e) {
    if (filter(e)) {
      average += selector(e);
      ++count;
    }
  });
  average /= count;

  double sigma = 0;
  std::for_each(first, last, [&](auto &e) {
    if (filter(e)) {
      const double value = selector(e);
      sigma += (value - average) * (value - average);
    }
  });
  sigma /= count - 1;
  sigma = std::sqrt(sigma);
  return std::make_tuple(average, sigma);
}

template <class It, class UnaryFunc>
std::tuple<double, double> aveAndStdev(It first, It last, UnaryFunc selector) {
  return aveAndStdev(first, last, selector, [](auto &e) { return true; });
}

template <class It> std::tuple<double, double> aveAndStdev(It first, It last) {
  return aveAndStdev(first, last, [](auto &e) { return e; });
}

auto test(vecType & imgs) {
  std::vector<double> norms;
  double count, fails;
  for (auto & a : *imgs) {
    for (auto & b : *)
  }
}

int main(int argc, char **argv) {

  std::unordered_map<imgInf, MatPtr> db;
  boost::filesystem::path folder(argv[1]);

  if (boost::filesystem::exists(folder) &&
      boost::filesystem::is_directory(folder)) {
    for (auto &file : boost::filesystem::directory_iterator(folder)) {
      auto img = std::make_shared<cv::Mat>(cv::imread(file.path().string()));
      std::string nameInf = file.path().stem().string();
      for (auto &c : nameInf) {
        if (c == '_')
          c = ' ';
      }
      std::istringstream in(nameInf);
      int uid, browser, test;
      in >> uid >> browser >> test;
      db.emplace(imgInf(uid, browser, test), img);
    }
  }
  struct comp {
    constexpr bool operator()(const imgInf &lhs, const imgInf &rhs) const {
      return lhs.test < rhs.test || (lhs.test == rhs.test && lhs.uid < rhs.uid);
    };
  };
  std::map<imgInf, vecType, comp> toCompare;
  for (auto &p : db) {
    auto &data = p.first;
    MatPtr img = p.second;
    auto it = toCompare.find(data);
    if (it == toCompare.cend())
      it->second.push_back(img);
    else
      toCompare.emplace(data, vecType({img}));
  }

  int current_test = toCompare.begin()->first.test;
  for (auto &p : toCompare) {

  }
}
