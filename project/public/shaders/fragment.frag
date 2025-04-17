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
    float centerWeight = 1.0 - smoothstep(1.0, 0.03, dist);  // More effect in center


    // Use centered_uv instead of uv for the tangent calculation to ensure proper centering
    float waveX = sin(centered_uv.x * 22.0) * 0.1 * centerWeight;
    float waveY = sin(centered_uv.y * 22.0) * 0.1 * centerWeight;
    vec2 waveOffset = vec2(waveX, waveY);
    centered_uv += waveOffset;

    // Convert back to texture space
    uv = (centered_uv + 1.0) * 0.5;  // Convert back to [0,1] range for texture sampling

    // Sample the original image at the center position
    vec4 originalColor = texture2D(uTexture, uv);

    // Chromatic aberration - slightly increased effect
    float aberrationAmount = 0.0002;
    vec2 redOffset = uv + waveOffset + vec2(aberrationAmount, 0.0);
    vec2 blueOffset = uv + waveOffset - vec2(aberrationAmount, 0.0);
    vec2 greenOffset = uv + waveOffset;

    // Sample colors with offsets
    vec4 redChannel = texture2D(uTexture, redOffset);
    vec4 greenChannel = texture2D(uTexture, greenOffset);
    vec4 blueChannel = texture2D(uTexture, blueOffset);

    // Calculate the chromatic aberration color difference
    float redDiff = redChannel.r - originalColor.r;
    float greenDiff = greenChannel.g - originalColor.g;
    float blueDiff = blueChannel.b - originalColor.b;

    // Apply 50% saturation to the color difference
    float saturationLevel = 1.0;
    redDiff *= saturationLevel;
    greenDiff *= saturationLevel;
    blueDiff *= saturationLevel;

    // Add the reduced aberration effect back to the original color
    vec4 color = vec4(
        originalColor.r + redDiff,
        originalColor.g + greenDiff,
        originalColor.b + blueDiff,
        1.0
    );

    gl_FragColor = color;
}