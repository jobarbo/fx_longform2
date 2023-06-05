#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

const float cellSize = 150.0;

vec3 getColor(float value) {
  if (value < 0.333)
    return vec3(1.0, 0.0, 0.0);
  else if (value < 0.666)
    return vec3(0.0);
  else
    return vec3(1.0);
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

//use the javascript oct3 noise function from piterNoise.js in my public/library/utils folder
// the oct3 function takes a x, y, scale, and index
// the scale is the frequency of the noise





void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;

  vec2 gridPos = floor(st * vec2(cellSize, cellSize));
  float noiseValue = noise(gridPos + vec2(u_time * 0.1));

  vec3 color = getColor(noiseValue);

  gl_FragColor = vec4(color, 1.0);
}
