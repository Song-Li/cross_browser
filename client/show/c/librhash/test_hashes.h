/* test_hashes.h - detect compiler defines */

/* first some magic to convert a macro value to a string */
#define STRINGIZE_ARG(x) #x
#define EXPAND_TO_STRING(x) STRINGIZE_ARG(x)

/* the string containing defined macros */
char* compiler_flags = "Compile-time flags:"
#ifdef i386
	" i386"
#endif
#ifdef __i386__
	" __i386__"
#endif
#ifdef __i486__
	" __i486__"
#endif
#ifdef __i586__
	" __i586__"
#endif
#ifdef __i686__
	" __i686__"
#endif
#ifdef __pentium__
	" __pentium__"
#endif
#ifdef __pentiumpro__
	" __pentiumpro__"
#endif
#ifdef __pentium4__
	" __pentium4__"
#endif
#ifdef __nocona__
	" __nocona__"
#endif
#ifdef prescott
	" prescott"
#endif
#ifdef __core2__
	" __core2__"
#endif
#ifdef __k6__
	" __k6__"
#endif
#ifdef __k8__
	" __k8__"
#endif
#ifdef __athlon__
	" __athlon__"
#endif
#ifdef __amd64
	" __amd64"
#endif
#ifdef __amd64__
	" __amd64__"
#endif
#ifdef __x86_64
	" __x86_64"
#endif
#ifdef __x86_64__
	" __x86_64__"
#endif
#ifdef _M_IX86
	" _M_IX86"
#endif
#ifdef _M_AMD64
	" _M_AMD64"
#endif
#ifdef _M_IA64
	" _M_IA64"
#endif
#ifdef _M_X64
	" _M_X64"
#endif
#ifdef _LP64
	" _LP64"
#endif
#ifdef __LP64__
	" __LP64__"
#endif
#ifdef __x86_64
	" __x86_64"
#endif
#ifdef __x86_64__
	" __x86_64__"
#endif
#ifdef _M_AMD64
	" _M_AMD64"
#endif
#ifdef _M_X64
	" _M_X64"
#endif
#ifdef CPU_X64
	" CPU_X64"
#endif
#ifdef CPU_IA32
	" CPU_IA32"
#endif
#ifdef __ia64
	" __ia64"
#endif
#ifdef __ia64__
	" __ia64__"
#endif
#ifdef __alpha__
	" __alpha__"
#endif
#ifdef _M_ALPHA
	" _M_ALPHA"
#endif
#ifdef vax
	" vax"
#endif
#ifdef MIPSEL
	" MIPSEL"
#endif
#ifdef _ARM_
	" _ARM_"
#endif
#ifdef __sparc
	" __sparc"
#endif
#ifdef __sparc__
	" __sparc__"
#endif
#ifdef sparc
	" sparc"
#endif
#ifdef _ARCH_PPC
	" _ARCH_PPC"
#endif
#ifdef _ARCH_PPC64
	" _ARCH_PPC64"
#endif
#ifdef _POWER
	" _POWER"
#endif
#ifdef __POWERPC__
	" __POWERPC__"
#endif
#ifdef POWERPC
	" POWERPC"
#endif
#ifdef __powerpc
	" __powerpc"
#endif
#ifdef __powerpc__
	" __powerpc__"
#endif
#ifdef __powerpc64__
	" __powerpc64__"
#endif
#ifdef __ppc__
	" __ppc__"
#endif
#ifdef __hpux
	" __hpux"
#endif
#ifdef _MIPSEB
	" _MIPSEB"
#endif
#ifdef mc68000
	" mc68000"
#endif
#ifdef __s390__
	" __s390__"
#endif
#ifdef __s390x__
	" __s390x__"
#endif
#ifdef sel
	" sel"
#endif

/* detect compiler and OS */
#ifdef _MSC_VER
	" _MSC_VER=" EXPAND_TO_STRING(_MSC_VER)
#endif
#ifdef __BORLANDC__
	" __BORLANDC__"
#endif
#if defined(__GNUC__) && defined(__VERSION__)
	" GCC=" __VERSION__
#endif
#ifdef __INTEL_COMPILER
	" __INTEL_COMPILER=" EXPAND_TO_STRING(__INTEL_COMPILER)
#endif
#ifdef __clang__
	" __clang__"
#endif
#ifdef __llvm__
	" __llvm__"
#endif
#ifdef __TINYC__ /* tcc */
	" __TINYC__"
#endif
#ifdef __MINGW32__
	" __MINGW32__"
#endif
#ifdef _WIN32
	" _WIN32"
#endif
#ifdef _WIN64
	" _WIN64"
#endif
#ifdef __linux
	" __linux"
#endif
#ifdef __sun /* Solaris */
	" __sun"
#endif
#ifdef __FreeBSD__
	" __FreeBSD__"
#endif
#ifdef __OpenBSD__
	" __OpenBSD__"
#endif
#ifdef __NetBSD__
	" __NetBSD__"
#endif
#ifdef __APPLE__
	" __APPLE__"
#endif
#ifdef __MACH__ /* Mac OS X = __APPLE__ & __MACH__ on gcc/icc */
	" __MACH__"
#endif

#include <limits.h>
#ifdef __GLIBC__ /* GLIBC >= 6 */
	" __GLIBC__"
#endif
#ifdef __UCLIBC__
	" __UCLIBC__"
#endif



/* other defines */
#ifdef __STDC_VERSION__
	" __STDC_VERSION__=" EXPAND_TO_STRING(__STDC_VERSION__)
#endif
#ifdef _UNICODE
	" _UNICODE"
#endif
#ifdef __STRICT_ANSI__
	" __STRICT_ANSI__"
#endif
#ifdef __PIC__
	" __PIC__"
#endif
#ifdef USE_RHASH_DLL
	" USE_RHASH_DLL"
#endif
#ifdef USE_OPENSSL
	" USE_OPENSSL"
#endif
#ifdef OPENSSL_RUNTIME
	" OPENSSL_RUNTIME"
#endif

/* detect endianness */
#ifdef CPU_LITTLE_ENDIAN
	" CPU_LITTLE_ENDIAN"
#endif
#ifdef CPU_BIG_ENDIAN
	" CPU_BIG_ENDIAN"
#endif
#if defined(__BYTE_ORDER)
#if (__BYTE_ORDER==__LITTLE_ENDIAN)
	" (__BYTE_ORDER==__LITTLE_ENDIAN)"
#elif (__BYTE_ORDER==__BIG_ENDIAN)
	" (__BYTE_ORDER==__BIG_ENDIAN)"
#endif
#endif
	"\n";
