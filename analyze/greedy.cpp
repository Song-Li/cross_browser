#include <fstream>
#include <iomanip>
#include <iostream>
#include <list>
#include <map>
#include <memory>
#include <set>
#include <sstream>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include <assert.h>
#include <omp.h>

struct DataPoint {
  std::vector<std::string> hashes;
  std::vector<int> ids;
  DataPoint() {}
  typedef std::shared_ptr<DataPoint> Ptr;
  template <typename... Targs> static inline Ptr Create(Targs &&... args) {
    return std::make_shared<DataPoint>(std::forward<Targs &&>(args)...);
  };
  template <typename... Targs> static inline Ptr Create(Targs &... args) {
    return std::make_shared<DataPoint>(std::forward<Targs &>(args)...);
  };
  static inline Ptr Create() { return std::make_shared<DataPoint>(); };
};

struct ResultTable {
  struct element {
    double cb, unique;
  };

  ResultTable() : data{nullptr} {}
  ResultTable(const int numBrowsers) : numBrowsers{numBrowsers} {
    createData();
  }
  ResultTable(const int numBrowsers, const size_t mask)
      : numBrowsers{numBrowsers}, mask{mask} {
    createData();
  }

  typedef std::shared_ptr<ResultTable> Ptr;
  template <typename... Targs> static inline Ptr Create(Targs &&... args) {
    return std::make_shared<ResultTable>(std::forward<Targs &&>(args)...);
  };
  template <typename... Targs> static inline Ptr Create(Targs &... args) {
    return std::make_shared<ResultTable>(std::forward<Targs &>(args)...);
  };

  element &operator()(int j, int i) { return data[j * numBrowsers + i]; };

  element &at(int j, int i) { return operator()(j, i); };

  const element &operator()(int j, int i) const {
    return data[j * numBrowsers + i];
  };

  const element &at(int j, int i) const { return operator()(j, i); };

  static inline Ptr Create() { return std::make_shared<ResultTable>(); };

  ~ResultTable() { deleteData(); }

  friend std::ostream &operator<<(std::ostream &out, const ResultTable &p);
  element *data;

private:
  size_t mask;
  int numBrowsers;
  void deleteData() {
    if (data != nullptr) {
      delete[] data;
      data = nullptr;
    }
  }

  void createData() { data = new element[numBrowsers * numBrowsers]; }
};

std::ostream &operator<<(std::ostream &out, const ResultTable &p) {
  constexpr int width = 12;
  for (int i = 0; i < p.numBrowsers; ++i)
    std::cout << std::setw(width) << i;
  std::cout << std::endl;
  for (int i = 0; i < p.numBrowsers; ++i) {
    std::cout << std::setw(width) << i;
    for (int j = 0; j < p.numBrowsers; ++j) {
      std::ostringstream oss;
      if (p(j, i).cb != -1)
        oss << static_cast<int>(p(j, i).cb * 100) << "% "
            << static_cast<int>(p(j, i).unique * 100) << "%";
      std::cout << std::setw(width) << oss.str();
    }
    std::cout << std::endl;
  }
  return out;
}

typedef std::shared_ptr<std::map<std::string, DataPoint::Ptr>> Test;

constexpr int cutoff = 27;

std::tuple<float, float, float, float, int>
analyze(const std::vector<Test> &data, const std::set<std::string> &browsers,
        const size_t mask);

#pragma omp declare reduction(                                                 \
    merge : std::list <                                                        \
    ResultTable::Ptr > : omp_out.insert(                                       \
                           omp_out.end(), omp_in.begin(), omp_in.end()))

int main(int argc, char **argv) {
  std::vector<Test> data;
  std::unordered_set<std::string> unique_hashes;
  std::set<std::string> browsers;
  std::ifstream in(argv[1]);
  int numData;

  while (in >> numData) {
    std::string line;
    getline(in, line);
    Test test = std::make_shared<std::map<std::string, DataPoint::Ptr>>();
    data.emplace_back(test);
    for (int i = 0; i < numData; ++i) {
      getline(in, line);

      std::istringstream iss(line);
      std::string browser;
      assert(iss >> browser);
      auto tmp = DataPoint::Create();
      test->emplace(browser, tmp);
      browsers.emplace(browser);
      std::string hash;
      for (int i = 0; i < cutoff; ++i) {
        assert(iss >> hash);
        tmp->hashes.push_back(hash);
        unique_hashes.emplace(hash);
      }
    }
  }

  std::set<std::string> ordered_hashes(unique_hashes.begin(),
                                       unique_hashes.end());
  std::unordered_map<std::string, int> ided_hashes;
  int nextID = 0;
  for (auto &hash : ordered_hashes) {
    ided_hashes.emplace(hash, nextID++);
  }

  for (auto &tests : data) {
    for (auto &test : *tests) {
      auto &point = *(test.second);
      point.ids.resize(point.hashes.size());
      for (int i = 0; i < point.hashes.size(); ++i) {
        auto it = ided_hashes.find(point.hashes[i]);
        point.ids[i] = it->second;
      }
    }
  }
  constexpr size_t numIt = 1 << cutoff;

  std::list<std::tuple<float, float, float, float, int>> results;
  std::ifstream binIn("results.dat", std::ios::in | std::ios::binary);
  if (binIn.is_open()) {
    size_t num;
    binIn.read(reinterpret_cast<char *>(&num), sizeof(num));
    std::cout << num << std::endl;
    for (int i = 0; i < num; ++i) {
      float a[4];
      int e;
      in.read(reinterpret_cast<char *>(a), sizeof(a));
      in.read(reinterpret_cast<char *>(&e), sizeof(e));
      results.emplace_back(a[0], a[1], a[2], a[3], e);
    }
  } else {
    constexpr size_t numIt = 1 << cutoff;

#pragma omp parallel
    {
      std::list<std::tuple<float, float, float, float, int>> privateResults;
#pragma omp for nowait
      for (size_t mask = 1; mask < numIt; ++mask)
        privateResults.emplace_back(analyze(data, browsers, mask));

#pragma omp for schedule(static) ordered
      for (int i = 0; i < omp_get_num_threads(); ++i) {
#pragma omp ordered
        results.insert(results.end(), privateResults.begin(),
                       privateResults.end());
      }
    }

    std::ofstream out ("results.dat", std::ios::out | std::ios::binary);
    size_t num = results.size();
    out.write(reinterpret_cast<const char *>(&num), sizeof(num));
    for (auto & res : results) {
      float a[4];
      int e;
      std::tie(a[0], a[1], a[2], a[3], e) = res;
      out.write(reinterpret_cast<const char *>(a), sizeof(a));
      out.write(reinterpret_cast<const char *>(&e), sizeof(e));
    }
  }
}

namespace std {
template <> struct hash<std::vector<int>> {
  static constexpr double A = 1.6180339887498948482 * 1e5;
  hash<double> h;
  size_t operator()(const std::vector<int> &k) const {
    size_t seed = 0;
    for (auto v : k) {
      seed ^= h(v * A) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
    }
    return seed;
  }
};
} // std

std::vector<int> genCode(const std::vector<int> &ids, const int mask) {
  std::vector<int> code;
  for (int i = 0; i < ids.size(); ++i)
    if ((mask >> i) & 0x1)
      code.push_back(ids[i]);

  return code;
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

std::tuple<float, float, float, float, int>
analyze(const std::vector<Test> &data, const std::set<std::string> &browsers,
        const size_t mask) {
  int j = 0;
  auto res = ResultTable::Create(browsers.size(), mask);
  for (auto &b1 : browsers) {
    int i = 0;
    for (auto &b2 : browsers) {
      std::unordered_set<std::vector<int>> unique_codes;
      double count = 0;
      double crossBrowser = 0.0;
      for (auto &test : data) {
        auto A = test->find(b1);
        auto B = test->find(b2);
        if (A == test->cend() || B == test->cend())
          continue;
        ++count;
        auto codeA = genCode(A->second->ids, mask);
        auto codeB = genCode(B->second->ids, mask);

        if (codeA == codeB) {
          ++crossBrowser;
          unique_codes.emplace(codeA);
          unique_codes.emplace(codeB);
        }
      }

      if (count) {
        res->at(j, i).cb = crossBrowser / count;
        res->at(j, i).unique = unique_codes.size() / crossBrowser;
      } else {
        res->at(j, i).cb = -1;
        res->at(j, i).unique = -1;
      }
      ++i;
    }
    ++j;
  }

  int count = 0;
  double avecb, stdcb;
  std::tie(avecb, stdcb) =
      aveAndStdev(res->data, res->data + (browsers.size() * browsers.size()),
                  [](auto &e) { return e.cb; },
                  [&count](auto &e) {
                    if (e.cb != -1) {
                      ++count;
                      return true;
                    } else {
                      return false;
                    }
                  });
  double aveu, stdu;
  std::tie(aveu, stdu) = aveAndStdev(
      res->data, res->data + (browsers.size() * browsers.size()),
      [](auto &e) { return e.unique; }, [](auto &e) { return e.unique != -1; });

  return std::make_tuple(avecb, stdcb, aveu, stdu, count);
}