# 📱 Pearson Nexus AI - Mobile App Guide

## 🎉 NEW: Tech-Oriented Mobile App

The mobile experience has been completely redesigned with a modern, tech-oriented interface featuring:

✨ **Key Features:**
- **Quick Photo Capture**: Instant camera access for evidence documentation
- **Voice-to-Notes**: Record and auto-transcribe voice notes hands-free
- **File Upload**: Upload documents, PDFs, and images
- **Slick UI**: Dark theme with animated gradients and smooth transitions
- **Fast Access**: Optimized for speed and ease of use

---

## 🚀 How to Access

### Option 1: QR Code (Recommended)
1. On your PC, open: `http://localhost:3001/qr`
2. Scan the QR code with your phone
3. The mobile app will load automatically

### Option 2: Direct Link
- From phone browser: `http://192.168.0.28:3001/mobile`
- Or use the shorter URL: `http://192.168.0.28:3001/m`

### Option 3: Launch Page Auto-Redirect
- Navigate to: `http://192.168.0.28:3001/launch`
- Mobile devices are automatically redirected to the mobile app

---

## 📸 Photo Capture

### How It Works:
1. Tap the **"Take Photo"** button (cyan/blue gradient)
2. Your phone's camera will open
3. Take the photo
4. The photo is automatically selected
5. Tap **"Save Evidence"** to upload

### Use Cases:
- Document physical evidence
- Capture screenshots of messages
- Photograph important documents
- Record visual evidence in real-time

---

## 🎤 Voice-to-Notes

### How It Works:
1. Tap the **"Voice Note"** button (purple/pink gradient)
2. Recording starts automatically
3. Speak clearly into your phone
4. Use **Pause/Resume** for breaks
5. Tap **"Stop & Save"** when done
6. Audio is transcribed automatically
7. Review the transcription
8. Tap **"Save Evidence"** to upload

### Recording Controls:
- **⏸️ Pause**: Temporarily pause recording
- **▶️ Resume**: Continue recording
- **⏹️ Stop & Save**: Finish recording and transcribe

### Recording Timer:
- Real-time timer shows `MM:SS` format
- Visual recording indicator with pulsing animation
- No time limit on recordings

### Best Practices:
- Speak clearly and at normal pace
- Reduce background noise when possible
- Review transcription for accuracy
- Edit if needed before saving

### Use Cases:
- Quick notes during phone calls (after the call)
- Documenting conversations or events
- Recording thoughts or observations
- Creating audio logs with timestamps

---

## 📤 File Upload

### How It Works:
1. Tap the **"Upload File"** button (green/teal gradient)
2. Select file from your phone
3. File info is displayed
4. Tap **"Save Evidence"** to upload

### Supported Files:
- Documents (PDF, DOC, DOCX)
- Images (JPG, PNG, GIF)
- Text files
- Any file type accepted

---

## 🎨 UI Features

### Design Elements:
- **Dark Theme**: Easy on eyes, battery-efficient
- **Animated Gradients**: Smooth, professional look
- **Glassmorphism**: Modern translucent effects
- **Responsive**: Adapts to all phone sizes
- **Smooth Animations**: Polished interactions

### Status Messages:
- ✅ **Green**: Success (saved, uploaded)
- 🔴 **Red**: Error (failed, denied)
- 💠 **Cyan**: Info (processing, recording)

### Quick Access:
- View all uploads button at bottom
- Cancel button to reset
- Back to desktop button in header

---

## 🔐 Authentication

The mobile app uses the same login as desktop:
- **Email**: `nedpearson@gmail.com`
- **Password**: `1Pearson2`

### Cookie-Based Auth:
- Stays logged in automatically
- "Remember Me" keeps you signed in for 30 days
- Secure cookie storage

---

## 📊 How Evidence is Saved

### Automatic Metadata:
Every capture includes:
- ⏰ Timestamp (when captured)
- 👤 User info (who captured it)
- 📱 Device info
- 🔐 File hash (for integrity)

### Storage Location:
- Server path: `project/server/uploads/`
- Database: `project/server/data.json`
- View all: Navigate to `/uploads` page

---

## 🛠️ Troubleshooting

### Camera Not Working:
- Grant camera permission in browser settings
- Try refreshing the page
- Check if another app is using camera

### Microphone Not Working:
- Grant microphone permission
- Check browser mic settings
- Close other apps using mic

### Upload Fails:
- Check internet connection
- Verify file size (max 25MB)
- Try again or restart app

### Page Won't Load:
- Verify phone is on same Wi-Fi as PC
- Check PC's IP address: `192.168.0.28`
- Make sure server is running on PC

---

## 💡 Tips & Best Practices

### For Quick Capture:
1. Save `/mobile` to phone home screen
2. Opens like a native app
3. Always ready for quick evidence capture

### For Voice Notes:
- Test microphone before important recordings
- Use pause feature for long recordings
- Review transcription before saving
- Add manual notes if needed

### For Photos:
- Ensure good lighting
- Keep phone steady
- Capture multiple angles if needed
- Review before saving

### Battery Optimization:
- Dark theme saves battery
- Close app when not in use
- Avoid keeping camera/mic open

---

## 🔗 URL Reference

### Mobile App:
- `http://192.168.0.28:3001/mobile` (full)
- `http://192.168.0.28:3001/m` (short)

### Other Pages:
- Launch: `http://192.168.0.28:3001/launch`
- QR Code: `http://192.168.0.28:3001/qr`
- Uploads: `http://192.168.0.28:3001/uploads`
- Desktop: `http://192.168.0.28:3001/`

### From PC:
- Local: `http://localhost:3001/mobile`
- QR Gen: `http://localhost:3001/qr`

---

## 🎯 Use Cases

### Legal Documentation:
- 📸 Photograph evidence at scene
- 🎤 Record verbal observations
- 📄 Upload court documents
- ⏰ Automatic timestamps for chain of custody

### Quick Notes:
- 🎤 Voice memos while driving (when parked)
- 📸 Capture whiteboard notes
- 📄 Upload PDFs on the go

### Field Work:
- 📸 Document site conditions
- 🎤 Record verbal reports
- 📍 Automatic location capture (planned)

---

## 🔮 Coming Soon

Planned features:
- 📍 GPS location tagging
- 🏷️ Custom tags and categories
- 🔍 Search uploaded files
- 📊 Evidence timeline view
- 🔄 Sync across devices
- ✏️ Edit transcriptions inline
- 📎 Attach to legal cases
- 🔔 Upload notifications

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify network connection
3. Try refreshing the app
4. Restart the server if needed

---

**Last Updated**: February 1, 2026  
**Version**: 1.0.0  
**Status**: ✅ Fully Operational

The new mobile app replaces the old mobile view with a purpose-built interface optimized for quick capture and voice notes. Enjoy! 🎉
