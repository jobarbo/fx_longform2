precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;

void main() {
    vec2 uv = vTexCoord;

    // Wave distortion
    float waveX = sin(uv.y * 1.0 + uTime) * 0.001;
    float waveY = cos(uv.x * 1.0 + uTime) * 0.001;
    vec2 waveOffset = vec2(waveX, waveY);

    // Chromatic aberration
    float aberrationAmount = 0.002;
    vec2 redOffset = uv + waveOffset + vec2(aberrationAmount, 0.0);
    vec2 blueOffset = uv + waveOffset - vec2(aberrationAmount, 0.0);
    vec2 greenOffset = uv + waveOffset;

    // Sample colors with offsets
    vec4 redChannel = texture2D(uTexture, redOffset);
    vec4 greenChannel = texture2D(uTexture, greenOffset);
    vec4 blueChannel = texture2D(uTexture, blueOffset);

    // Combine channels
    vec4 color = vec4(redChannel.r, greenChannel.g, blueChannel.b, 1.0);



    gl_FragColor = color;
}