#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

const float cellSize = 70.0;
const vec3 phase3 = vec3(0.0, 2.0943951023931953, 4.1887902047863905);
const vec3 gamma = vec3(2.2); // Gamma correction factor
const vec3 igamma = vec3(1.0 / 2.2); // Inverse gamma correction factor
const vec2 cos_plz = vec2(0, 0.25); //

vec3 getColor(float value) {
    if (value < 0.333)
        return vec3(1.0, 0.0, 0.0); // Red
    else if (value < 0.666)
        return vec3(1.0); // White
    else
        return vec3(0.0); // Black
}
vec3 florp(float a, float p) {
    // this one maps the color
    // a = brightness
    // p = mushrooms
    float b = clamp(2.0 * a - 1.0, 0.0, 1.0);
    b *= b;
    b *= b;
    b *= b;
    vec3 res = pow(vec3(2.0 * a - a * a, a * a, b), gamma); // sRGB stands for stupid RGB
    vec3 f = (1.0 + sin(phase3 + p)) * 0.333333333;
    return res.bgr * f.x + res.rbg * f.y + res.rgb * f.z;
}

float onk(vec2 uv, float t) {
    // this one makes a wobbly function over t, ranged -1 .. 1
    float bx = uv.x * -3.13 + 2.04 * sin(uv.y * -2.3 + 1.3 * t) - 0.5 * t;
    float by = uv.y * 4.17 - 1.73 * sin(uv.x * 2.5 - 0.7 * t) + 0.9 * t;
    return 0.5 * (sin(bx) + sin(by));
}

float unk(vec2 uv, float t) {
    // this one ALSO makes a wobbly function over t, ranged 0 .. 1
    float cx = uv.x * 2.23 - 3.33 * sin(uv.y * -1.3 + 0.3 * t) - 0.4 * t;
    float cy = uv.y * -1.41 + 3.15 * sin(uv.x * 1.5 + 0.4 * t) + 0.1 * t;
    return 0.5 + 0.25 * (sin(cx) + sin(cy));
}

void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 aspect = u_resolution.xy / u_resolution.y;
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy - 0.5) * aspect;
    uv *= 1.2; // scale
    float t = u_time * 0.2; // global speed
    vec2 ee = vec2(4.35, -5.33); // bonus numbers
    float c = unk(uv * vec2(0.43, -0.53), t); // weirdness amount
    vec2 trun = sin(cos_plz + c * 8. + t * 0.61);
    vec2 wp = uv + trun;
    vec2 wq = uv - trun;
    float lava = 3. * onk(wp, t) * (1. + onk((wq + ee * c) * 0.618, t * .7)); // left as an exercise for the reader
    float hi = 1.000420 + .7 * c; // how high we are
    float a = smoothstep(-1., hi, lava); // brightness
    float hole = smoothstep(hi + .02, hi, lava); // no more brightness
    hole = max(0., hole - .4 * smoothstep(0., -1., lava));

    // Map colors based on noise
    vec2 gridPos = floor(uv * vec2(cellSize, cellSize));
    float value1 = onk(gridPos, t);
    float value2 = unk(gridPos, t);
    vec3 col1 = getColor(value1);
    vec3 col2 = getColor(value2);

    // Output to screen
    gl_FragColor = vec4(pow(col1, vec3(2.2)), 1.0);
}
