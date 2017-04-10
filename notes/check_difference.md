# Version Difference

Version 36.0b6 vs Version 37.0.1  
Forlder:/dom/canvas/  
Total 30 differences
## New added
- WebGL1ContextBuffers.cpp
- WebGL1ContextUniforms.cpp

## Important functions
- transformFeedback
- Uniform related
- Something about bindBuffer (seems like a context check, more work needed)
- Validate many things including vertexattribi et.
- Seems added the support for integer vertex?

## Important files
- WebGL2Context.cpp
	- all of the supported extensions (WebGL1 and WebGL2)
	- requiredFeatures (Seems to be the features of WebGL2)
- WebGL2ContextBuffers.cpp
	- Validate somethings
- WebGL2ContextTransformFeedback.cpp
	- implement many not implemented transform feedback features
- WebGL2ContextUniforms.cpp
	- Most of the related functions were not implemented before
	- Still some function are not implemented yet
	- Implement Attribi related functions
	- GetUniformIndices
	- GetActiveUniforms
	- This may help anti-aliasing
