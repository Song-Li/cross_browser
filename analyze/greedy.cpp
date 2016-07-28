#include <algorithm>
#include <cmath>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <list>
#include <map>
#include <memory>
#include <random>
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

struct MaskScore {
  size_t mask;
  double score;
  MaskScore(size_t mask, double score) : mask{mask}, score{score} {};
};
typedef std::map<std::pair<std::string, std::string>, MaskScore> Result;

constexpr int cutoff = 27;

Result analyze(const std::vector<Test> &data,
               const std::set<std::string> &browsers, const size_t mask);
double analyze(const std::vector<Test> &data,
               const std::set<std::string> &browsers, Result masks);

void reduceMaps(const Result &candidate, Result &master);

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
  constexpr int numRounds = 4;
  constexpr size_t start = (1 << cutoff) - 1;
  constexpr size_t numIt = 1 << 15;
  Result results;
  std::random_device rng;
  std::mt19937_64 gen(rng());
  std::uniform_int_distribution<> dist();
  for (int i = 0; i < numRounds; ++i) {
    std::vector<Test> trainingData, testData;
    for (auto & d : data)
      if (dist(gen) % 5 == 0)
        testData.emplace_back(d);
      else
        trainingData.emplace_back(d);
#pragma omp parallel
    {
      Result privateResults;
#pragma omp for nowait
      for (size_t mask = start; mask > start - numIt; --mask) {
        auto res = analyze(data, browsers, mask);
        reduceMaps(res, privateResults);
      }

#pragma omp for schedule(static) ordered
      for (int i = 0; i < omp_get_num_threads(); ++i) {
#pragma omp ordered
        reduceMaps(privateResults, results);
      }
    }
  }

  std::cout << "Results" << std::endl;
  for (auto &res : results) {
    auto &b1 = res.first.first;
    auto &b2 = res.first.second;
    auto &mask = res.second.mask;
    auto &score = res.second.score;
    std::cout << "(" << b1 << ", " << b2 << "): "
              << "mask: [";
    for (int i = 0; i < cutoff; ++i) {
      if (i != 0)
        std::cout << ", ";
      std::cout << ((mask >> i) & 0x1);
    }
    std::cout << "] score: " << score << std::endl;
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

Result analyze(const std::vector<Test> &data,
               const std::set<std::string> &browsers, const size_t mask) {
  int j = 0;
  auto res = ResultTable::Create(browsers.size(), mask);
  for (auto &b1 : browsers) {
    int i = 0;
    for (auto &b2 : browsers) {
      double count = 0.0;
      double crossBrowser = 0.0;
      std::unordered_map<std::vector<int>, double> codeToCount;
      if (b1.compare(b2) != 0) {
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
            auto it = codeToCount.find(codeA);
            if (it == codeToCount.cend())
              codeToCount.emplace(codeA, 1.0);
            else
              ++it->second;
          }
        }
      }

      if (count != 0.0) {
        res->at(j, i).cb = crossBrowser / count;
        double numUnique = 0.0;
        for (auto &p : codeToCount)
          if (p.second == 1.0)
            ++numUnique;

        double numDistinct =
            std::max(1.0, static_cast<double>(codeToCount.size()));
        res->at(j, i).unique = numUnique / numDistinct;
      } else {
        res->at(j, i).cb = -1;
        res->at(j, i).unique = -1;
      }
      ++i;
    }
    ++j;
  }

  Result browsersToScore;
  j = 0;
  for (auto &b1 : browsers) {
    int i = 0;
    for (auto &b2 : browsers) {
      if (b1.compare(b2) != 0 && res->at(j, i).cb != -1) {
        browsersToScore.emplace(
            std::make_pair(b1, b2),
            MaskScore(mask,
                      std::pow(res->at(j, i).cb, 1.5) * res->at(j, i).unique));
      }
      ++i;
    }
    ++j;
  }
  return browsersToScore;
}

double analyze(const std::vector<Test> &data,
               const std::set<std::string> &browsers, Result masks) {
  int j = 0;
  auto res = ResultTable::Create(browsers.size(), 0);
  for (auto &b1 : browsers) {
    int i = 0;
    for (auto &b2 : browsers) {
      double count = 0.0;
      double crossBrowser = 0.0;
      std::unordered_map<std::vector<int>, double> codeToCount;
      if (b1.compare(b2) != 0) {
        for (auto &test : data) {
          auto A = test->find(b1);
          auto B = test->find(b2);
          auto mask = masks.find(std::make_pair(b1, b2));
          if (A == test->cend() || B == test->cend() || mask == masks.cend())
            continue;

          ++count;
          auto codeA = genCode(A->second->ids, mask->second.mask);
          auto codeB = genCode(B->second->ids, mask->second.mask);

          if (codeA == codeB) {
            ++crossBrowser;
            auto it = codeToCount.find(codeA);
            if (it == codeToCount.cend())
              codeToCount.emplace(codeA, 1.0);
            else
              ++it->second;
          }
        }
      }

      if (count != 0.0) {
        res->at(j, i).cb = crossBrowser / count;
        double numUnique = 0.0;
        for (auto &p : codeToCount)
          if (p.second == 1.0)
            ++numUnique;

        double numDistinct =
            std::max(1.0, static_cast<double>(codeToCount.size()));
        res->at(j, i).unique = numUnique / numDistinct;
      } else {
        res->at(j, i).cb = -1;
        res->at(j, i).unique = -1;
      }
      ++i;
    }
    ++j;
  }

  double score = 0;
  double count = 0;
  j = 0;
  for (auto &b1 : browsers) {
    int i = 0;
    for (auto &b2 : browsers) {
      if (b1.compare(b2) != 0 && res->at(j, i).cb != -1) {
        score += std::pow(res->at(j, i).cb, 1.5) * res->at(j, i).unique;
        ++count;
      }
      ++i;
    }
    ++j;
  }
  return score / count;
}

void reduceMaps(const Result &candidate, Result &master) {
  for (auto &pair : candidate) {
    auto &browsers = pair.first;
    double score = pair.second.score;
    size_t mask = pair.second.mask;
    auto it = master.find(browsers);
    if (it == master.cend()) {
      master.emplace(browsers, pair.second);
    } else {
      if (it->second.score <= score) {
        it->second.mask = mask;
        it->second.score = score;
      }
    }
  }
}