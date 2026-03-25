# MindAR Image Targets

This folder should contain `.mind` compiled target files for MindAR.

## How to create a target file:

1. Visit: https://hiukim.github.io/mind-ar-js/tools/compile
2. Upload an image (JPG/PNG) that you want to use as a marker
3. Download the compiled `.mind` file
4. Place it in this folder (e.g., `card.mind`)

## Update ARScene.jsx

Once you have your `.mind` file, update `src/components/ARScene.jsx`:

```javascript
imageTargetSrc: "/targets/card.mind",  // Change this to your file name
```

## Testing

- Desktop testing: Open http://localhost:5173
- Mobile testing: Open http://<YOUR_IP>:5173 (from your mobile device on same network)
- HTTPS: Required for ARCore/ARKit on real deployment
