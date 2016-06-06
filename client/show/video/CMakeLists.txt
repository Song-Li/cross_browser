cmake_minimum_required(VERSION 2.8)

set(CMAKE_CXX_COMPILER clang++)

project( testFrames )
find_package( OpenCV REQUIRED )
find_package( Boost COMPONENTS system filesystem REQUIRED )
include_directories( ${Boost_INCLUDE_DIRS} )
file( GLOB src
   "testFrames.cpp")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fopenmp -std=gnu++14 -g -O3")

add_executable( testFrames ${src} )
target_link_libraries( testFrames ${OpenCV_LIBS}
                      ${Boost_SYSTEM_LIBRARIES}
                      ${Boost_FILESYSTEM_LIBRARIES})