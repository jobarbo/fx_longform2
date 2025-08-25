# Download Button Feature

## Overview

This project now includes a download button that allows users to save the generated artwork as a PNG image. The button automatically appears when the sketch is ready and is hidden when the sketch is embedded in an iframe.

## Features

### ✅ Automatic Detection

- **Iframe Detection**: The button automatically hides itself when the sketch is embedded in an iframe
- **Canvas Ready Detection**: The button waits for the canvas to be ready before appearing
- **Safari Mobile Support**: Special handling for Safari mobile devices

### ✅ Cross-Platform Compatibility

- **Desktop Browsers**: Standard download functionality
- **Mobile Browsers**: Optimized for touch interfaces
- **Safari Mobile**: Enhanced download handling with fallback instructions

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

### 2. Safari Mobile Detection

```javascript
function isSafariMobile() {
	const userAgent = navigator.userAgent;
	const isIOS = /iPad|iPhone|iPod/.test(userAgent);
	const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
	return isIOS && isSafari;
}
```

### 3. Download Function

The `saveArtwork()` function handles different download methods:

- **Standard browsers**: Uses `canvas.toDataURL()` with download link
- **Safari mobile**: Uses `canvas.toBlob()` with object URL and fallback instructions

## Usage

### For Users

1. The download button appears automatically in the top-right corner
2. Click the button to download the current artwork
3. The button shows download progress and success/error states

### For Developers

The download button is automatically created when:

- The sketch is not embedded in an iframe
- The canvas is ready
- The `createDownloadButton()` function is called

## Browser Support

| Browser    | Desktop | Mobile | Download Method        |
| ---------- | ------- | ------ | ---------------------- |
| Chrome     | ✅      | ✅     | Direct download        |
| Firefox    | ✅      | ✅     | Direct download        |
| Safari     | ✅      | ✅     | Direct download / Blob |
| Edge       | ✅      | ✅     | Direct download        |
| Safari iOS | ❌      | ✅     | Blob + fallback        |

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

The download button styles can be customized via CSS:

```css
#download-button {
	/* Custom styles */
}

#download-button-container {
	/* Container positioning */
}

/* Mobile optimizations */
@media (max-width: 768px) {
	#download-button {
		/* Mobile-specific styles */
	}
}
```

## Troubleshooting

### Button Not Appearing

1. Check if the sketch is embedded in an iframe
2. Verify the canvas element exists
3. Check browser console for errors

### Download Not Working

1. **Safari Mobile**: Use long-press and "Save to Photos"
2. **Other browsers**: Check browser download settings
3. **File size**: Large canvases may take time to process

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
