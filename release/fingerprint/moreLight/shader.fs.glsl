precision mediump float;

struct DirectionalLight
{
	vec3 direction;
	vec3 diffuse;
	vec3 specular;
};

varying vec2 fragTexCoord;
varying vec3 fragNormal;
varying vec4 vPosition;

uniform vec3 ambientLightIntensity;
uniform DirectionalLight sun;
uniform sampler2D sampler;

void main()
{
    vec3 lightDirection = normalize(sun.direction - vPosition.xyz);
    vec3 normSunDir = normalize(sun.direction);
    vec3 surfaceNormal = normalize(fragNormal);
    vec4 texel = texture2D(sampler, fragTexCoord);

    float specularLightWeighting = 0.0;
    vec3 eyeDirection = normalize(-vPosition.xyz);
    vec3 reflectionDirection = reflect(-lightDirection, surfaceNormal);
    specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 16.0);

    float diffuseLightWeighting = max(dot(surfaceNormal, sun.direction), 0.0);

    vec3 lightIntensity = ambientLightIntensity +
        sun.specular * specularLightWeighting + 
        sun.diffuse * diffuseLightWeighting;

	gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
}
