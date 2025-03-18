precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;

void main() {
    vec2 uv = vTexCoord;

    // Wave distortion
    float waveX = sin(uv.y * ((uTime/1.0)*1.0) + uTime) * 0.0031;
    float waveY = cos(uv.x * ((uTime/1.0)*1.0) + uTime) * 0.0031;
    vec2 waveOffset = vec2(waveX, waveY);

    // Chromatic aberration
    float aberrationAmount = 0.002;
    vec2 redOffset = uv   + vec2(aberrationAmount, waveY);
    vec2 greenOffset = uv  - vec2(0.0, 0.0);
    vec2 blueOffset = uv + vec2(waveX, aberrationAmount);

    // Sample colors with offsets
    vec4 redChannel = texture2D(uTexture, redOffset);
    vec4 greenChannel = texture2D(uTexture, greenOffset);
    vec4 blueChannel = texture2D(uTexture, blueOffset);

    // Combine channels
    vec4 color = vec4(redChannel.r, greenChannel.g, blueChannel.b, 1.0);



    gl_FragColor = color;
}