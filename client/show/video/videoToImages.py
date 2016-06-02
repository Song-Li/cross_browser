#!/usr/bin/env python3
#uses ffmpeg to create a series of stills from a video
#Also will create the folder for the images to live in if it doesn't
#already exist
#fist arg is path to the videofile and filename
#second arg is the path to the output folder
#third arg is the FPS



import subprocess, sys, os

argv = sys.argv

if len(argv) != 4 and len(argv) !=3 :
	print("Usage : python videoToImages.py <input_video> <output_folder/>")
	print("OR Usage :python videoToImages.py <input_video> <output_folder/> <frame_rate>")
	sys.exit();
subprocess.call(['rm','-rf', argv[2]])
subprocess.call(['mkdir', argv[2]])
output = '{}/image-%5d.png'.format(argv[2])
if len(argv) == 4:
	subprocess.call(['ffmpeg', '-i', argv[1], '-r', argv[3], output])

else:
	subprocess.call(['ffmpeg', '-i', argv[1], output])
