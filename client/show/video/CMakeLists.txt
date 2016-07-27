cmake_minimum_required(VERSION 2.8)
if (APPLE)
  set(CMAKE_CXX_COMPILER clang++)
else()
  set(CMAKE_CXX_COMPILER g++)
endif()
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++14 -g -O3")

project( testFrames )
find_package( OpenCV REQUIRED )
find_package( Boost COMPONENTS system filesystem REQUIRED )
include_directories( ${Boost_INCLUDE_DIRS} )
file( GLOB src
   "testFrames.cpp")
add_executable( testFrames ${src} )
target_link_libraries( testFrames ${OpenCV_LIBS}
                      ${Boost_SYSTEM_LIBRARIES}
                      ${Boost_FILESYSTEM_LIBRARIES})

project( imageCreator )
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++14 -g -O3")
find_package(OpenCV REQUIRED)
file(GLOB src
     "imageCreator.cpp")
add_executable(imageCreator ${src})
target_link_libraries(imageCreator ${OpenCV_LIBS})
