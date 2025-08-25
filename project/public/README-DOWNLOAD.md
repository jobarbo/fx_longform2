# Download Button Feature

## Overview

This project now includes a download button that allows users to save the generated artwork as a PNG image. The button automatically appears when the sketch is ready and is hidden when the sketch is embedded in an iframe.

## Features

### ✅ Automatic Detection

- **Iframe Detection**: The button automatically hides itself when the sketch is embedded in an iframe
- **Canvas Ready Detection**: The button waits for the canvas to be ready before appearing
- **Safari Mobile Support**: Special handling for Safari mobile devices

### ✅ Cross-Platform Compatibility

- **All Browsers**: Standard download functionality
- **Mobile & Desktop**: Same download experience

### ✅ User Experience

- **Visual Feedback**: Loading, success, and error states
- **Responsive Design**: Adapts to different screen sizes
- **Touch Optimized**: Proper touch target sizes for mobile devices

## How It Works

### 1. Iframe Detection

```javascript
function isInIframe() {
	try {
		return window !== window.top;
	} catch (e) {
		return true;
	}
}
```

### 3. Download Function

The `saveArtwork()` function uses a simple approach:

- **All browsers**: Uses `canvas.toDataURL()` with download link

## Usage

### For Users

1. The download button appears automatically in the top-right corner
2. **All browsers**: Click to download the image file
3. Simple, clean interface

### For Developers

The download button is automatically created when:

- The sketch is not embedded in an iframe
- The canvas is ready
- The `createDownloadButton()` function is called

## Browser Support

| Browser    | Desktop | Mobile | Download Method |
| ---------- | ------- | ------ | --------------- |
| Chrome     | ✅      | ✅     | Direct download |
| Firefox    | ✅      | ✅     | Direct download |
| Safari     | ✅      | ✅     | Direct download |
| Edge       | ✅      | ✅     | Direct download |
| Safari iOS | ✅      | ✅     | Direct download |

## Mobile Optimizations

### Touch Targets

- Minimum 44px height for iOS compatibility
- Proper touch event handling
- Visual feedback on touch

### Responsive Design

- Smaller button size on mobile devices
- Adjusted positioning for small screens
- Touch-friendly interactions

## CSS Customization

The download button uses inline styles for simplicity, but you can override them with CSS:

```css
#download-button {
	/* Custom styles */
}
```

## Troubleshooting

### Button Not Appearing

1. Check if the sketch is embedded in an iframe
2. Verify the canvas element exists
3. Check browser console for errors

### Download Not Working

1. **All browsers**: Check browser download settings
2. **File size**: Large canvases may take time to process

### Performance Issues

- The button waits for canvas readiness
- Download processing is asynchronous
- Large images may cause temporary UI freezing

## Technical Details

### File Naming

Downloads are named with the format:
`MM_DD_YYYY_HH:MM:SS_fxhash.png`

### Canvas Processing

- Uses the `defaultCanvas0` element
- Converts to PNG format
- Handles different pixel densities

### Error Handling

- Graceful fallbacks for unsupported browsers
- User-friendly error messages
- Console logging for debugging
