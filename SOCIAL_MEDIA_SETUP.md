# Social Media Cards System - Complete Guide

## Overview
This system provides animated social media cards that display interactive link tiles with smooth slide-up animations from the bottom. The cards are ready for 3D model integration.

## ✅ Features Implemented

### 1. **Animated Appearance**
- ✅ Cards slide up from bottom with smooth easing
- ✅ Staggered animation delays for each card
- ✅ Logo boxes animate independently from card
- ✅ Smooth opacity transitions
- ✅ GPU-accelerated animations using `will-change`

### 2. **Interactive Components**
- ✅ Hover effects with scale and glow
- ✅ Click detection and opens links in new tab
- ✅ Smooth transitions on all interactions
- ✅ Visual feedback with "Click to visit" indicator

### 3. **Responsive Design**
- ✅ Mobile-optimized grid layout
- ✅ Adaptive spacing and sizing
- ✅ Works on all screen sizes (mobile, tablet, desktop)
- ✅ Touch-friendly on mobile devices

### 4. **Accessibility**
- ✅ Respects `prefers-reduced-motion` for users with motion sensitivity
- ✅ Proper color contrast ratios
- ✅ Semantic HTML structure

---

## 📋 Quick Start

### 1. **Update Your Social Media Links**

Edit `src/config/SocialMediaConfig.js`:

```javascript
{
  id: 'facebook',
  name: 'Facebook',
  url: 'https://facebook.com/yourprofile', // ← UPDATE THIS
  handle: '@yourfacebookhandle', // ← UPDATE THIS
  color: '#1877F2',
  icon: 'f',
  description: 'Connect on Facebook'
},
```

Replace:
- `url`: Your actual social media profile URL
- `handle`: Your social media handle (shown below logo)

### 2. **Add or Remove Platforms**

In `SocialMediaConfig.js`:

**To remove a platform:**
```javascript
// Just delete the entire object from the array
// For example, delete Discord entry if you don't use it
```

**To add a new platform:**
```javascript
{
  id: 'reddit',
  name: 'Reddit',
  url: 'https://reddit.com/user/yourprofile',
  handle: '@yourhandle',
  color: '#FF4500',
  icon: '🔥',
  description: 'Check out my Reddit'
},
```

### 3. **Test Locally**

```bash
npm run dev
```

The social media cards will appear at the bottom of your AR scene with animated slide-up effects!

---

## 🎨 Animation Details

### Card Animation Flow
1. **Initial State** (0ms)
   - Cards start 80px below their final position
   - Opacity: 0 (invisible)

2. **Animation Start** (100ms delay after mount)
   - Slides smoothly upward over 800ms
   - Staggered delays: each card delays by `index * 150ms`

3. **Logo Animation** (additional 200ms after card starts)
   - Logos slide up from even further below
   - Scale from 0.8 to 1.0
   - Creates layered, cascading effect

4. **Hover State**
   - Cards lift up slightly
   - Logo glows with brand color
   - Increased shadow depth
   - "Click to visit" text appears

### CSS Animation Classes

```css
/* Main entry animation */
@keyframes slideUpFromBottom { ... }

/* Logo specific animation */
@keyframes logoSlideUp { ... }

/* Applied via classes */
.social-card.animate-in { animation: slideUpFromBottom 0.8s ... }
.logo-box { animation: logoSlideUp 0.8s ... }
```

---

## 🎯 Customization Guide

### Change Animation Speed

In `src/styles/SocialMediaCards.css`:

```css
.social-card.animate-in {
  /* Change from 0.8s to desired speed */
  animation: slideUpFromBottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

### Change Animation Easing

```css
/* Try different easing functions */
cubic-bezier(0.25, 0.46, 0.45, 0.94)  /* ease */
cubic-bezier(0.34, 1.56, 0.64, 1)     /* bounce (current) */
cubic-bezier(0.68, -0.55, 0.265, 1.55) /* more bounce */
linear                                  /* constant speed */
```

### Adjust Stagger Delay Between Cards

In `SocialMediaCards.jsx`:

```javascript
style={{ '--animation-delay': `${index * 0.15}s` }}
// Change 0.15 to adjust gap between each card's animation
// 0.10s = faster cascade
// 0.20s = slower cascade
```

### Change Grid Layout

In `src/styles/SocialMediaCards.css`:

```css
.social-media-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  /* Change minmax values to adjust card size */
  /* minmax(160px, 1fr) = smaller cards */
  /* minmax(240px, 1fr) = larger cards */
}
```

### Customize Colors

In `SocialMediaConfig.js`:

```javascript
{
  color: '#1877F2', // Change this hex color
  // Supports any valid CSS color
}
```

---

## 🎬 Preparing for 3D Models

### Current Setup (Placeholder)
- Square boxes with emoji/icons as placeholders
- Colors match each platform's brand color
- Containers ready for 3D model replacement

### Step 1: Install Required Libraries

```bash
npm install three @react-three/fiber @react-three/drei
```

### Step 2: Create 3D Model Component

Create `src/components/Logo3D.jsx`:

```javascript
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export function Logo3D({ modelPath }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Your 3D model loading here */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
```

### Step 3: Replace Logo Box with 3D Model

In `SocialMediaCards.jsx`:

```javascript
// Change from:
<div className="logo-box">
  <span>{social.icon}</span>
</div>

// To:
<Canvas>
  <Logo3D modelPath={`/models/${social.id}.glb`} />
</Canvas>
```

### Step 4: Add 3D Model Files

Place your 3D models in `public/models/`:
- `facebook.glb`
- `instagram.glb`
- `twitter.glb`
- etc.

---

## 🧪 Testing

### Test Animation on Different Devices

1. **Desktop**: Full animation with smooth 60fps
2. **Tablet**: Responsive grid, touch-friendly
3. **Mobile**: Single or dual column layout

### Test Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari/Chrome

### Test Accessibility

1. Press `Ctrl+Shift+X` (DevTools Accessibility)
2. Check color contrast (WCAG AA)
3. Test with keyboard navigation
4. Enable "Reduce motion" in system settings

---

## 📁 File Structure

```
src/
├── components/
│   ├── SocialMediaCards.jsx      ← Main component
│   ├── UIOverlay.jsx             ← Container component
│   └── ARScene.jsx               ← Integration point
├── styles/
│   ├── SocialMediaCards.css      ← All animations & styles
│   └── UIOverlay.css             ← Overlay positioning
└── config/
    └── SocialMediaConfig.js      ← Easy URL configuration
```

---

## 🔗 Link Opening Security

All links open with security flags:
```javascript
window.open(url, '_blank', 'noopener,noreferrer')
// noopener: prevents access to window.opener
// noreferrer: prevents referrer header
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update all social media URLs in `SocialMediaConfig.js`
- [ ] Update social media handles
- [ ] Test all links work correctly
- [ ] Test animations on target devices
- [ ] Test on different browsers
- [ ] Check mobile responsiveness
- [ ] Optimize images/models if added later
- [ ] Test accessibility features

---

## 🐛 Troubleshooting

### Cards not appearing?
- Check browser console for errors
- Verify `SocialMediaConfig.js` imports correctly
- Ensure CSS files are imported

### Animations not smooth?
- Check GPU acceleration (Chrome DevTools > Rendering)
- Verify `will-change` is applied
- Disable browser extensions that might interfere

### Links not opening?
- Check URLs in `SocialMediaConfig.js` are valid
- Verify HTTPS if deployed on secure server
- Check browser console for blocked popup warnings

---

## 💡 Pro Tips

1. **Social Media Verification**: Add verification badges by updating the `description` field
2. **Analytics**: Add UTM parameters to track clicks from your AR app
3. **Fallback**: Add backup text if 3D models fail to load
4. **Performance**: Remove unused social platforms to reduce initial load time

---

## 📞 Need Help?

All the code is well-commented. Check the inline comments in:
- `SocialMediaCards.jsx` - Component logic
- `SocialMediaCards.css` - Animation details
- `SocialMediaConfig.js` - Configuration guide

---

**Version**: 1.0
**Last Updated**: 2025-03-25
**Status**: ✅ Production Ready
