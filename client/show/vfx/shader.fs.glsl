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

uniform float uAlpha;

uniform float offset[3];
uniform float weight[3];
uniform vec2 textureSize;

void main()
{
    vec3 lightDirection = normalize(sun.direction - vPosition.xyz);
    vec3 normSunDir = normalize(sun.direction);
    vec3 surfaceNormal = normalize(fragNormal);
    vec2 onePixel = vec2(1.0, 1.0)/textureSize;

    vec4 texel = 2.0*texture2D( sampler, fragTexCoord)*weight[0];
    for (int i=1; i<3; i++) {
        texel +=
            texture2D(sampler, fragTexCoord + onePixel*vec2(0.0, offset[i]))*weight[i];
        texel +=
            texture2D(sampler, fragTexCoord - onePixel*vec2(0.0, offset[i]))*weight[i];
    }
    for (int i=1; i<3; i++) {
        texel +=
            texture2D(sampler, fragTexCoord + onePixel*vec2(offset[i], 0.0))*weight[i];
        texel +=
            texture2D(sampler, fragTexCoord - onePixel*vec2(offset[i], 0.0))*weight[i];
    }
    texel.a = texture2D(sampler, fragTexCoord).a;

    float specularLightWeighting = 0.0;
    vec3 eyeDirection = normalize(-vPosition.xyz);
    vec3 reflectionDirection = reflect(-lightDirection, surfaceNormal);
    specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 1.0);

    float diffuseLightWeighting = max(dot(surfaceNormal, sun.direction), 0.0);

    vec3 lightIntensity = ambientLightIntensity +
        sun.specular * specularLightWeighting +
        sun.diffuse * diffuseLightWeighting;

	gl_FragColor = vec4((texel.rgb/2.0) * lightIntensity, texel.a * uAlpha);
}
