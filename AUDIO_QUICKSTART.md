# Audio-Reactive Shaders - Quick Start Guide

Your sketch is now set up with **audio-reactive shaders** using a built-in **MIDI chime** for easy testing!

## How to Use

### 1. Start Your Sketch

```bash
npm run start
```

### 2. Interact with Audio

Once the sketch loads, you'll see this in the console:

```
🎵 Audio-reactive mode enabled!
   Press SPACE to toggle auto-play
   Press A-K to play notes
   Press 1-5 to play chords
   Press Z,X,C for drums
   Press V to toggle audio debug display
```

You'll also see an **audio debug panel** in the top-right corner showing real-time:

- Bass, Mid, Treble levels
- Volume and Energy
- Beat detection indicator
- BPM counter

### Keyboard Controls

**Auto-Play:**

- `SPACE` - Start/stop auto-playing chord progressions

**Manual Notes:**

- `A, S, D, F, G, H, J, K` - Play C major scale (middle C to high C)
- `Q, W, E, R, T, Y, U, I` - Play higher octave

**Chords:**

- `1` - C major
- `2` - D minor
- `3` - E minor
- `4` - F major
- `5` - G major

**Drums:**

- `Z` - Kick drum (bass)
- `X` - Snare
- `C` - Hi-hat

### What You'll See

The shaders are now audio-reactive:

- **Chromatic aberration** pulses with overall audio energy
- **Pixel sort** rotates with mid frequencies and threshold follows bass
- All effects respond in real-time to the audio you generate

## Switching to Microphone

To use live microphone input instead of the MIDI chime:

In `sketch.js`, change line 149:

```javascript
// FROM:
shaderEffects.enableAudio('chime', {

// TO:
shaderEffects.enableAudio('microphone', {
```

Your browser will ask for microphone permission, then the shaders will react to any audio input!

## Making More Effects Audio-Reactive

In `shaders/sketch-shaders.js`, you can add audio variables to any uniform:

```javascript
effectsConfig = {
	myEffect: {
		enabled: true,
		baseValue: 1.0,
		uniforms: {
			// Make it react to bass
			uValue: "baseValue * (1 + audioBass * 2)",

			// Or multiple frequencies
			uOther: "0.5 + audioBass * 0.3 + audioTreble * 0.2",
		},
	},
};
```

### Available Audio Variables:

- `audioBass` - Bass frequencies (0-1)
- `audioMid` - Mid frequencies (0-1)
- `audioTreble` - Treble frequencies (0-1)
- `audioVolume` - Overall loudness (0-1)
- `audioEnergy` - Energy level (volume²) (0-1)
- `audioBeat` - Beat detected (0.0 or 1.0)
- `audioBPM` - Detected BPM (number)

Plus more detailed bands: `audioSubBass`, `audioLowMid`, `audioHighMid`, `audioPresence`

## Customizing MIDI Patterns

In `sketch.js` setup, you can change the pattern:

```javascript
shaderEffects.enableAudio("chime", {
	smoothing: 0.85,
	beatThreshold: 0.15,
	chimeOptions: {
		pattern: "chords", // Try: 'scale', 'bassline', 'arpeggio', 'random', 'drums'
		autoPlayInterval: 500, // Time between notes in ms
	},
});
```

Or control it programmatically in your sketch:

```javascript
// In draw() or anywhere:
midiChime.setPattern("bassline");
midiChime.setInterval(250); // Faster tempo
midiChime.startAutoPlay();
```

## Advanced: Playing Custom Notes

You can play notes programmatically:

```javascript
// Single note (MIDI note 60 = middle C)
midiChime.playNote(60);

// Chord
midiChime.playChord([60, 64, 67]); // C major

// Bass note
midiChime.playBass(36);

// Drum
midiChime.playDrum("kick");
```

## Debugging Audio Values

In your browser console, you can check audio values:

```javascript
// Get all audio info
audioAnalyzer.getDebugInfo();

// Get specific values
audioAnalyzer.bass;
audioAnalyzer.beat();
audioAnalyzer.getBPM();
```

## Tips for VJ Performance

1. **Start with auto-play** to get familiar with the reactivity
2. **Use keyboard chords** (1-5) for dramatic changes
3. **Mix drums** (Z,X,C) with chords for rhythmic effects
4. **Adjust smoothing** in sketch.js - lower values = more reactive, higher = smoother
5. **Switch patterns** on the fly using console: `midiChime.setPattern('arpeggio')`

Enjoy creating audio-reactive visuals! 🎨🎵
