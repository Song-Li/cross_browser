precision mediump float;

uniform vec3 pointLightPosition;
uniform vec4 meshColor;

uniform samplerCube lightShadowMap;
uniform vec2 shadowClipNearFar;

uniform float bias;

varying vec3 fPos;
varying vec3 fNorm;

void main()
{
	vec3 toLightNormal = normalize(pointLightPosition - fPos);

	float fromLightToFrag =
		(length(fPos - pointLightPosition) - shadowClipNearFar.x)
		/
		(shadowClipNearFar.y - shadowClipNearFar.x);

	float shadowMapValue = textureCube(lightShadowMap, -toLightNormal).r;

	float lightIntensity = 0.6;
	if ((shadowMapValue + bias) >= fromLightToFrag) {
		lightIntensity += 0.4 * max(dot(fNorm, toLightNormal), 0.0);
	}

	gl_FragColor = vec4(meshColor.rgb * lightIntensity, meshColor.a);
}