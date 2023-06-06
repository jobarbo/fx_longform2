#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float t = u_time * 0.1;

float random(vec2 st){
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x ) +
           (d - b) * u.x * u.y;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = vec3(0.0);

  // Define the size of each cell
  float cellSize = 10.0;

  // Calculate the position of the current cell
  vec2 cellPosition = floor(st * u_resolution.xy / cellSize);

  // Generate noise value for the current cell using Perlin noise
  float noiseValue = noise(cellPosition * 0.02 + t * 0.1);

  // Define an array of colors
  vec3 colors[3];
  colors[0] = vec3(1.0, 0.0, 0.0); // Red
  colors[1] = vec3(0.0, 0.0, 0.0); // Black
  colors[2] = vec3(1.0, 1.0, 1.0); // White

  // Map the noise value to colors using the array
  if (noiseValue < 0.33) {
    color = colors[0];
  } else if (noiseValue < 0.66) {
    color = colors[1];
  } else {
    color = colors[2];
  }

  gl_FragColor = vec4(color, 1.0);
}
