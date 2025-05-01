precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;

void main() {
    // Flip the y coordinate to match p5js coordinate system
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    // Center UV coordinates without distorting aspect ratio
    vec2 centered_uv = uv * 2.0 - 1.0;  // Convert from [0,1] to [-1,1] range

    // Calculate distance from center (0,0) and create center-weighted multiplier
    float dist = length(centered_uv);
    float centerWeight = 1.0 - smoothstep(1.0, 0.05, dist);  // More effect in center

    // Create pulsing effect
    float pulse = sin(uTime * 10.7) * 0.5 + 0.5;

    // More intense wave effect that changes over time
    float waveX = tan(centered_uv.x * (20.0 + sin(uTime) * 0.00001)) * 0.000001 * centerWeight * (1.0 + pulse * 10.5);
    float waveY = tan(centered_uv.y * (8.0 + cos(uTime * 0.000001) * 0.000001) + uTime) * 0.000001 * centerWeight * (1.0 + pulse * 10.5);

    // Add spiral effect
    float angle = atan(centered_uv.y, centered_uv.x);
    float spiral = sin(dist * 15.0 - uTime * 0.75) * 0.5;

    vec2 waveOffset = vec2(waveX, waveY);
    vec2 spiralOffset = vec2(cos(angle), sin(angle)) * spiral * centerWeight;

    centered_uv += waveOffset + spiralOffset;

    // Convert back to texture space
    uv = (centered_uv + 1.0) * 0.5;  // Convert back to [0,1] range for texture sampling

    // Sample the original image at the center position
    vec4 originalColor = texture2D(uTexture, uv);

    // Enhanced chromatic aberration
    float aberrationAmount = 0.0000001 * (1.0 + pulse * 0.5);
    vec2 redOffset = uv + vec2(aberrationAmount * sin(uTime * 0.3), aberrationAmount * cos(uTime * 0.2));
    vec2 blueOffset = uv - vec2(aberrationAmount * cos(uTime * 0.2), aberrationAmount * sin(uTime * 0.3));
    vec2 greenOffset = uv + vec2(-aberrationAmount * sin(uTime * 0.5), aberrationAmount * sin(uTime * 0.4));

    // Sample colors with offsets
    vec4 redChannel = texture2D(uTexture, redOffset);
    vec4 greenChannel = texture2D(uTexture, greenOffset);
    vec4 blueChannel = texture2D(uTexture, blueOffset);

    // Create psychedelic color mixing
    vec4 color = vec4(
        redChannel.r,
        greenChannel.g,
        blueChannel.b,
        1.0
    );

    gl_FragColor = color;
}