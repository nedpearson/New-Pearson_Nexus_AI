# Mobile Access Guide for Pearson Nexus AI

## ✅ System Status: NEW MOBILE APP DEPLOYED

All components are functioning correctly:
- **Backend API**: Running on port 3001
- **Frontend UI**: Running on port 5174  
- **Database**: Local JSON file at `project/server/data.json`
- **Authentication**: Cookie-based JWT with refresh tokens
- **Mobile Access**: ✨ **NEW** Tech-oriented mobile app with voice-to-notes
- **QR Code**: Uses IP address (192.168.0.28)

## 🎉 NEW: Dedicated Mobile App

We've created a brand new mobile app experience that replaces the old mobile view:

### Features:
- 📸 **Quick Photo Capture**: Instant camera access
- 🎤 **Voice-to-Notes**: Record and auto-transcribe voice notes
- 📤 **File Upload**: Upload documents and files
- ⚡ **Lightning Fast**: Optimized for mobile
- 🌑 **Dark Theme**: Modern, tech-oriented design
- 🎨 **Animated UI**: Smooth gradients and transitions

### Access the New Mobile App:
- **Direct**: `http://192.168.0.28:3001/mobile`
- **Short URL**: `http://192.168.0.28:3001/m`
- **Auto-redirect**: `http://192.168.0.28:3001/launch` (mobile devices only)

📖 **Full Mobile App Guide**: See `MOBILE_APP_GUIDE.md` for detailed instructions

## 🚀 Quick Start

### Option 1: Double-click the Desktop Shortcut
1. Open `PearsonNexusAI_Start.cmd` from your desktop
2. Wait for both servers to start
3. A browser will automatically open to the launch page

### Option 2: From Your Phone

**Step 1: Open the QR Code Page on Your PC**
On your PC browser, go to: `http://localhost:3001/qr`

**Step 2: Scan with Your Phone**
- The QR code will contain: `http://192.168.0.28:3001/launch`
- Make sure your phone is on the **same Wi-Fi network** as your PC
- The QR code now uses your PC's actual IP address instead of hostname

**Step 3: Save to Home Screen**
After scanning, save the page to your phone's home screen for easy access.

## 📱 Important URLs

### From Your PC:
- **Local access**: `http://localhost:3001/launch`
- **QR code**: `http://localhost:3001/qr`
- **App**: `http://localhost:3001/`
- **API health**: `http://localhost:3001/api/health`

### From Your Phone (same Wi-Fi):
- **Phone access**: `http://192.168.0.28:3001/launch`
- **QR code points to**: `http://192.168.0.28:3001/launch`

## 🔐 Default Login Credentials

- **Email**: `nedpearson@gmail.com`
- **Password**: `1Pearson2`

## 🌐 Chrome Settings for Local Database

Your Chrome settings are already configured correctly:
- ✅ "Allow sites to save data on your device" is enabled
- ✅ Cookies work for both localhost and IP address access
- ✅ No additional settings needed

## 🛠️ Troubleshooting

### ✅ FIXED: "Server IP Address Cannot Be Found" 

**Solution Applied**: The server now automatically detects your network IP address and uses it in:
- QR codes
- Launch page links
- Console output

Your current network IP: **192.168.0.28**

### If You Still Have Connection Issues:

1. **Verify both devices are on the same Wi-Fi network**
   - PC and phone must be on the same network
   - Corporate/guest networks may block device-to-device communication

2. **Check Windows Firewall**
   ```powershell
   # Allow Node.js through firewall (run as Administrator if needed)
   netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3001
   ```

3. **Check if server is running**
   - Look for the message: `📱 Phone link (network IP): http://192.168.0.28:3001/launch`

4. **Try accessing directly from phone browser**
   - Open Safari/Chrome on your phone
   - Type: `http://192.168.0.28:3001/launch`
   - If this works, the QR code will also work

### Server Won't Start

If you see "Port already in use" errors:

```powershell
# Find and kill processes using the ports
netstat -ano | findstr :3001
netstat -ano | findstr :5174
taskkill /F /PID <PID_NUMBER>

# Or kill all Node processes:
taskkill /F /IM node.exe
```

Then restart using the desktop shortcut.

### IP Address Changes

If your PC's IP address changes (after reconnecting to Wi-Fi):

1. Restart the server (it will auto-detect the new IP)
2. Generate a new QR code from `http://localhost:3001/qr`
3. The new QR code will have the updated IP address

## 📂 File Structure

```
Desktop/Cursor_PearsonNexusAI/
├── PearsonNexusAI_Start.cmd    # One-click launcher
├── MOBILE_ACCESS_GUIDE.md       # This file
└── project/
    ├── server/
    │   ├── index.js             # Backend API server (updated with IP detection)
    │   ├── store.js             # Database operations
    │   ├── tokens.js            # JWT handling
    │   └── data.json            # Local database
    ├── src/                     # React frontend
    └── package.json             # Dependencies
```

## 🎯 Features Working

- ✅ User registration and login
- ✅ Cookie-based authentication
- ✅ "Remember Me" functionality
- ✅ Password reset flow
- ✅ File uploads
- ✅ Mobile QR code access (with IP address)
- ✅ Local database persistence
- ✅ Automatic network IP detection

## 💡 Tips

1. **Bookmark the launch page** on your phone's home screen for quick access
2. **Use the IP address** - it's now automatically detected and used
3. **Keep the terminal window open** while using the app
4. **Data persists** between restarts in `server/data.json`
5. **Firewall**: If connection fails, check Windows Firewall settings

## 🔧 Manual Commands

If you prefer to run commands manually:

```powershell
# Navigate to project folder
cd "c:\Users\nedpe\Desktop\Cursor_PearsonNexusAI\project"

# Start both servers
npm run dev

# Or start them separately:
npm run dev:api    # Backend only (port 3001)
npm run dev:ui     # Frontend only (port 5174)
```

## 🔍 Technical Details

### Network IP Detection
The server automatically detects your PC's network IP address using Node.js `os.networkInterfaces()` API:
- Scans all network interfaces
- Finds the first non-internal IPv4 address
- Uses it for QR codes and mobile links

### Changes Made
1. Added `getNetworkIP()` function to detect network IP
2. Updated `/launch` endpoint to use network IP
3. Updated `/qr` endpoint to use network IP  
4. Updated console output to show network IP

---

**Last Updated**: February 1, 2026  
**Server Status**: ✅ Running  
**Mobile Access**: ✅ Fixed - Now using IP address (192.168.0.28)  
**Issue Resolved**: Hostname resolution problem solved
