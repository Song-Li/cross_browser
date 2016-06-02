cmake_minimum_required(VERSION 2.8)
if (APPLE)
  set(CMAKE_CXX_COMPILER clang++)
else()
  set(CMAKE_CXX_COMPILER g++-4.9)
endif()
project( testFrames )
find_package( OpenCV REQUIRED )
find_package( Boost COMPONENTS system filesystem REQUIRED )
include_directories( ${Boost_INCLUDE_DIRS} )
file( GLOB src
  "testFrames.cpp")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++14 -g -O3")

add_executable( testFrames ${src} ${scan_globals})
target_link_libraries( testFrames ${OpenCV_LIBS}
                      ${Boost_FILESYSTEM_LIBRARY}
                      ${Boost_SYSTEM_LIBRARY})