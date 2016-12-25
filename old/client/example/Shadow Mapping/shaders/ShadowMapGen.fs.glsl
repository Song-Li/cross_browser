precision mediump float;

uniform vec3 pointLightPosition;
uniform vec2 shadowClipNearFar;

varying vec3 fPos;

void main()
{
	vec3 fromLightToFrag = (fPos - pointLightPosition);

	float lightFragDist =
		(length(fromLightToFrag) - shadowClipNearFar.x)
		/
		(shadowClipNearFar.y - shadowClipNearFar.x);

	gl_FragColor = vec4(lightFragDist, lightFragDist, lightFragDist, 1.0);
}