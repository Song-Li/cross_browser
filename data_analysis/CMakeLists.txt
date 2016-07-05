cmake_minimum_required(VERSION 2.8)
if (APPLE)
  set(CMAKE_CXX_COMPILER clang++)
else()
  set(CMAKE_CXX_COMPILER g++)
endif()

project( analyzer )
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++14 -g -O3")
find_package( OpenCV REQUIRED )
find_package( Boost COMPONENTS system filesystem REQUIRED )
include_directories( ${Boost_INCLUDE_DIRS} )
file( GLOB src
   "analyzer.cpp")
add_executable( analyzer ${src} )
target_link_libraries( analyzer ${OpenCV_LIBS}
                      ${Boost_SYSTEM_LIBRARIES}
                      ${Boost_FILESYSTEM_LIBRARIES})
