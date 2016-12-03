precision mediump float;

uniform mat4 mProj;
uniform mat4 mView;
uniform mat4 mWorld;

attribute vec3 vPos;

varying vec3 fPos;

void main()
{
	fPos = (mWorld * vec4(vPos, 1.0)).xyz;

	gl_Position = mProj * mView * vec4(fPos, 1.0);
}