precision mediump float;

uniform vec3 pointLightPosition;
uniform vec4 meshColor;

varying vec3 fPos;
varying vec3 fNorm;

void main()
{
	vec3 toLightNormal = normalize(pointLightPosition - fPos);

	float lightIntensity = 0.6 + 0.4 * max(dot(fNorm, toLightNormal), 0.0);

	gl_FragColor = vec4(meshColor.rgb * lightIntensity, meshColor.a);
}