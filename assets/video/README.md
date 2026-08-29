# Product videos

Put short product videos here and reference them from
`assets/js/data/products.js` with a `video: "assets/video/your-file.mp4"` key.

Until then, every product modal plays the shared demo clip configured as
`demoVideo` in `assets/js/site.config.js`. **Replace that before you go live.**

## Recommended specs

- **Format:** MP4, H.264 video + AAC audio (plays on Android, iOS, macOS and Windows)
- **Resolution:** 1080 × 1080 (square) or 1080 × 1350 (4:5)
- **Length:** 8–20 seconds
- **Weight:** under 4 MB — the video only downloads when a customer presses play
  (`preload="none"`)
- **Audio:** optional; most people watch muted

## Quick compression with ffmpeg

```bash
ffmpeg -i input.mov -vf "scale=1080:-2" -c:v libx264 -crf 26 -preset slow \
       -movflags +faststart -c:a aac -b:a 96k output.mp4
```

`-movflags +faststart` is important: it lets playback begin before the whole
file has downloaded.
