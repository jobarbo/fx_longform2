precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;

void main() {
    vec2 uv = vTexCoord;
    // Flip the y coordinate
    uv.y = 1.0 - uv.y;

    // Create a more pronounced chromatic aberration effect
    float aberrationAmount = 0.0015; // Increase this for stronger effect
    float timeScale = 0.5;

    // Add some wave distortion
    vec2 uvOffset = vec2(
        sin(uv.y * 20.0 + uTime * timeScale) * 0.005,
        cos(uv.x * 15.0 + uTime * timeScale) * 0.005
    );

    // Sample the texture with different offsets for each color channel
    float r = texture2D(uTexture, uv + uvOffset + vec2(aberrationAmount, 0.0)).r;
    float g = texture2D(uTexture, uv + uvOffset).g;
    float b = texture2D(uTexture, uv + uvOffset - vec2(aberrationAmount, 0.0)).b;

    // Add some subtle color shifting based on position
    vec3 color = vec3(r, g, b);

    // Add vignette effect


    // Combine effects


    gl_FragColor = vec4(color, 1.0);
}