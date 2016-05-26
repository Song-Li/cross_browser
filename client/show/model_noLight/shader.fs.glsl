precision mediump float;

varying vec2 fragTexCoord;
uniform sampler2D sampler;
uniform float uAlpha;

void main()
{
  gl_FragColor = texture2D(sampler, fragTexCoord * uAlpha);
}
