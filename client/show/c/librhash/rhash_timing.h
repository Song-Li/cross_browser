/** @file rhash_timing.h timer and benchmarking functions */
#ifndef RHASH_TIMING_H
#define RHASH_TIMING_H

#ifdef __cplusplus
extern "C" {
#endif

#ifndef RHASH_API
/* modifier for LibRHash functions */
# define RHASH_API
#endif

/* portable timer definition */
#ifdef _WIN32
typedef unsigned long long timedelta_t;
#else
#include <sys/time.h> /* for timeval */
typedef struct timeval timedelta_t;
#endif

/* timer functions */

RHASH_API void rhash_timer_start(timedelta_t* timer);
RHASH_API double rhash_timer_stop(timedelta_t* timer);

/* flags for running a benchmark */

/** Benchmarking flag: don't print intermediate benchmarking info */
#define RHASH_BENCHMARK_QUIET 1
/** Benchmarking flag: measure the CPU "clocks per byte" speed */
#define RHASH_BENCHMARK_CPB 2
/** Benchmarking flag: print benchmark result in tab-delimed format */
#define RHASH_BENCHMARK_RAW 4

RHASH_API void rhash_run_benchmark(unsigned hash_id, unsigned flags,
				   FILE* output);

#ifdef __cplusplus
} /* extern "C" */
#endif /* __cplusplus */

#endif /* RHASH_TIMING_H */
