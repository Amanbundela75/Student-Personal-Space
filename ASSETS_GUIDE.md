# Assets Guide (GIFs & Banner)

This short guide helps you add eye-catching animations to your README.

## Folder Structure

```
assets/
  banner.gif                # Hero banner at top of README
  demo/
    login.gif               # Face login flow
    dashboard.gif           # Student dashboard interactions
    admin.gif               # Admin course management
    portfolio-heatmap.gif   # Portfolio stats/heatmap
    course-enroll.gif       # Enrollment flow
```

Create the folders if they don’t exist.

## Recording Tips

- Keep clips short (6–12 seconds).
- Use 1280x720 or 1080p when possible.
- Trim extra frames and compress (Gifsicle or Ezgif online).
- Avoid sensitive data exposure in recordings.

## Tools

- Windows: ScreenToGif (free)
- macOS: Kap (free), CleanShot X
- Linux: Peek (free)
- Cross-platform: OBS Studio, ffmpeg

### ffmpeg quick command

Convert MP4 to GIF (basic):
```bash
ffmpeg -i input.mp4 -vf "fps=12,scale=1280:-1:flags=lanczos" -loop 0 output.gif
```

Dithered palette (higher quality, smaller size):
```bash
ffmpeg -i input.mp4 -vf "fps=12,scale=1280:-1:flags=lanczos,palettegen" -y palette.png
ffmpeg -i input.mp4 -i palette.png -lavfi "fps=12,scale=1280:-1:flags=lanczos,paletteuse" -loop 0 output.gif
```

## Banner Ideas

- Use a simple gradient or a looping wave in a GIF.
- Alternatively, export a short UI montage (2–3s loop) as banner.gif.

Once added, confirm paths in README.md point to your files.
