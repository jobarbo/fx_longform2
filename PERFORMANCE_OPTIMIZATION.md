# Shader Performance Optimization

## Problem

When `continueShadersAfterCompletion` was set to `true`, the shader animation became laggy because:

1. **Unlimited frame rate**: Shaders were running at full speed (60fps+) instead of controlled speed
2. **Excessive GPU usage**: Continuous shader pipeline execution without frame limiting
3. **Pipeline rebuilding**: Shader pipeline was being rebuilt every frame unnecessarily
4. **Uniform recalculation**: Expensive uniform calculations (eval, regex) happening every single frame

## Solution

Implemented a simple, effective performance optimization that matches p5.js draw speed:

### 1. p5.js Draw Speed Matching

- **Controlled frame rate**: Shaders now run at the same speed as p5.js draw function (typically 30fps)
- **Consistent timing**: Matches the timing you're used to from the original draw function
- **Configurable**: Use `setShaderFrameRate(fps)` to match your specific p5.js settings

### 2. Pipeline Optimization

- **Smart rebuilding**: Only rebuilds shader pipeline when effects change
- **Eliminated waste**: No more unnecessary pipeline reconstruction every frame

### 3. Simple Delay Approach

- **setTimeout delay**: Uses `1000 / shaderFrameRate` to match p5.js timing
- **No complexity**: Simple, reliable frame rate control
- **Easy adjustment**: Press 'F' to cycle between common frame rates

## Usage

### Basic Controls

```javascript
// Set frame rate to match your p5.js draw speed
setShaderFrameRate(30); // Default p5.js speed

// If you use frameRate(60) in your sketch, set this to match
setShaderFrameRate(60);
```

### Keyboard Shortcuts

- **D**: Toggle debug bounds (existing)

### Performance Tuning

```javascript
// For maximum performance (lower GPU usage)
setShaderFrameRate(15);

// For balanced performance (matches p5.js default)
setShaderFrameRate(30);

// For smooth animation (higher GPU usage)
setShaderFrameRate(60);
```

## Technical Details

### Frame Rate Matching

The solution uses `setTimeout` to match p5.js draw speed:

```javascript
setTimeout(() => {
	requestAnimationFrame(customAnimate);
}, 1000 / shaderFrameRate); // Configurable frame rate to match p5.js
```

### Pipeline Caching

Shader pipeline is only rebuilt when enabled effects change:

```javascript
if (JSON.stringify(lastEnabledEffects) !== JSON.stringify(currentEnabledEffects)) {
	// Rebuild pipeline only when necessary
}
```

## Results

- **Before**: Unlimited frame rate + no timing control = GPU overload and lag
- **After**: Controlled frame rate matching p5.js draw speed = smooth, consistent performance
- **Improvement**: Eliminated lag while maintaining the timing you're familiar with

## Troubleshooting

### Still experiencing lag?

1. Reduce frame rate: `setShaderFrameRate(15)`
2. Press 'F' to cycle to lower frame rates
3. Ensure your p5.js frameRate() setting matches the shader frame rate
4. Consider disabling some shader effects

### Want smoother animation?

1. Increase frame rate: `setShaderFrameRate(60)`
2. Press 'F' to cycle to higher frame rates
3. Make sure your p5.js sketch can handle higher frame rates
4. Monitor GPU usage to ensure smooth performance

### Frame rate not matching p5.js?

1. Check your p5.js `frameRate()` setting
2. Use `setShaderFrameRate()` to match that exact value
3. Press 'F' to quickly test different frame rates
4. The goal is to match your p5.js draw function timing exactly
