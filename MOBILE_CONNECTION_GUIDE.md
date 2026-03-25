# Mobile Connection Troubleshooting

## ✅ Quick Checklist

- [ ] Both devices on **same WiFi network**?
- [ ] Can you ping your computer from mobile?
- [ ] Windows Firewall allowing port 5173?
- [ ] Mobile browser supports WebGL & WebXR?

---

## 🔥 Fix Windows Firewall (Most Common Issue)

### Method 1: PowerShell (Recommended)
Open PowerShell as Administrator and run:

```powershell
# Allow Vite dev server through firewall
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173

# Verify it was added
Get-NetFirewallRule -DisplayName "Vite Dev Server"
```

### Method 2: Windows Defender Firewall GUI
1. Press `Win+R` → type `wf.msc` → press Enter
2. Click **"Inbound Rules"** (left panel)
3. Click **"New Rule..."** (right panel)
4. Select **"Port"** → Next
5. Select **"TCP"** and enter port: `5173`
6. Select **"Allow the connection"** → Next
7. Check all: Domain, Private, Public → Next
8. Name: `Vite Dev Server` → Finish

---

## 🌐 Verify Network Connectivity

### From Phone
1. Open browser on phone
2. Go to: `http://192.168.29.132:5173/diagnostic.html`
3. Check the diagnostic page for errors

### From PC (verify server is aware of mobile)
1. Open terminal
2. Run: `npm run dev --host`
3. Look for: 
   ```
   ➜  Network: http://192.168.29.132:5173/
   ```
   (This is your computer's LAN IP)

### Test Connectivity
From mobile browser, try:
- `http://192.168.29.132:5173/diagnostic.html` (diagnostic page)
- `http://192.168.29.132:5173/` (main app)

---

## 🐛 Debug Tips

### Check if server is listening:
```powershell
netstat -ano | findstr :5173
```
Look for: `LISTENING` on `0.0.0.0:5173` or `[::]:5173`

### Clear browser cache on mobile:
Settings → Apps → Browser → Storage → Clear Cache & Data

### Try different WiFi:
If corporate WiFi blocks it, try hotspot from PC

### Check mobile firewall:
Some phones have firewall apps that block dev server connections

---

## 🚀 Once Working

1. Desktop: `http://localhost:5173` ✅
2. Mobile: `http://192.168.29.132:5173` (with firewall rule) ✅

Then switch to AR mode once you have a `.mind` marker file.
