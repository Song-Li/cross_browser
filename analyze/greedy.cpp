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
  element **data = nullptr;
  size_t mask;

  ResultTable() {}
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

  static inline Ptr Create() { return std::make_shared<ResultTable>(); };

  ~ResultTable() { deleteData(); }

  void writeToFile(std::ofstream &out) {
    out.write(reinterpret_cast<const char *>(&mask), sizeof(mask));
    out.write(reinterpret_cast<const char *>(&numBrowsers),
              sizeof(numBrowsers));
    for (int i = 0; i < numBrowsers; ++i)
      for (int j = 0; j < numBrowsers; ++j)
        out.write(reinterpret_cast<const char *>(data[i] + j), sizeof(element));
  }

  void loadFromFile(std::ifstream &in) {
    in.read(reinterpret_cast<char *>(&mask), sizeof(mask));
    in.read(reinterpret_cast<char *>(&numBrowsers), sizeof(numBrowsers));
    createData();
    for (int i = 0; i < numBrowsers; ++i)
      for (int j = 0; j < numBrowsers; ++j)
        in.read(reinterpret_cast<char *>(data[i] + j), sizeof(element));
  }
  friend std::ostream &operator<<(std::ostream &out, const ResultTable &p);

private:
  int numBrowsers;
  void deleteData() {
    if (data != nullptr) {
      for (int i = 0; i < numBrowsers; ++i)
        delete[] data[i];

      delete[] data;
      data = nullptr;
    }
  }

  void createData() {
    data = new element *[numBrowsers];
    for (int i = 0; i < numBrowsers; ++i)
      data[i] = new element[numBrowsers]();
  }
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
      if (p.data[i][j].cb != -1)
        oss << static_cast<int>(p.data[i][j].cb * 100) << "% "
            << static_cast<int>(p.data[i][j].unique * 100) << "%";
      std::cout << std::setw(width) << oss.str();
    }
    std::cout << std::endl;
  }
  return out;
}

typedef std::shared_ptr<std::map<std::string, DataPoint::Ptr>> Test;

constexpr int cutoff = 26;

ResultTable::Ptr analyze(const std::vector<Test> &data,
                         const std::set<std::string> &browsers,
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

  std::list<ResultTable::Ptr> results;
  std::ifstream binIn ("results.dat", std::ios::in | std::ios::binary);
  if (binIn.is_open()) {
    size_t num;
    binIn.read(reinterpret_cast<char *>(&num), sizeof(num));
    std::cout << num << std::endl;
    results.resize(num, ResultTable::Create());
    for (auto & res : results)
      res->loadFromFile(binIn);

    for (auto & res : results)
      std::cout << *res << std::endl;
  } else {
#pragma omp parallel for reduction(merge : results)
    for (size_t mask = 1; mask < std::pow(2, cutoff); ++mask)
      results.emplace_back(analyze(data, browsers, mask));

    std::ofstream out("results.dat", std::ios::out | std::ios::binary);
    size_t num = results.size();
    std::cout << num << std::endl;
    out.write(reinterpret_cast<const char *>(&num), sizeof(num));
    for (auto &res : results)
      res->writeToFile(out);

    out.close();
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

ResultTable::Ptr analyze(const std::vector<Test> &data,
                         const std::set<std::string> &browsers,
                         const size_t mask) {
  int i = 0;
  auto res = ResultTable::Create(browsers.size(), mask);
  for (auto &b1 : browsers) {
    int j = 0;
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
        res->data[i][j].cb = crossBrowser / count;
        res->data[i][j].unique = unique_codes.size() / crossBrowser;
      } else {
        res->data[i][j].cb = -1;
        res->data[i][j].unique = -1;
      }

      ++j;
    }
    ++i;
  }
  return res;
}