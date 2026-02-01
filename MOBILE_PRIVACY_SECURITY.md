# 🔒 Mobile App Privacy & Security Documentation

## Photo/File Access - How It Actually Works

### ✅ What the App DOES:
1. **Single File Access Only**: When you tap "Take Photo" or "Upload File", the browser shows a file picker
2. **Explicit User Selection**: YOU must explicitly select ONE photo/file
3. **No Background Access**: The app cannot access your photo library without your action
4. **Manual Upload Only**: Files are ONLY uploaded when you tap "Save Evidence"
5. **One at a Time**: Each photo/file requires a separate action to select

### ❌ What the App DOES NOT Do:
1. ❌ Does NOT access all your photos
2. ❌ Does NOT automatically upload anything
3. ❌ Does NOT scan your photo library
4. ❌ Does NOT have background access to files
5. ❌ Does NOT upload without explicit confirmation

---

## Technical Implementation

### HTML5 File API (Standard Web Technology)

The app uses standard HTML file inputs:

```html
<input 
  type="file" 
  accept="image/*" 
  capture="environment"
/>
```

#### What Each Attribute Does:
- **`type="file"`**: Standard file input - user must click/tap to open
- **`accept="image/*"`**: Filter to show only images (helps user find photos)
- **`capture="environment"`**: Opens rear camera on mobile (convenience feature)

#### Browser Security:
- File inputs are sandboxed by the browser
- User must explicitly interact to select a file
- No access to filesystem without user action
- Selected file is held in memory temporarily
- Cleared when page is refreshed or closed

---

## How Photo Capture Works

### Step-by-Step Process:

```
┌─────────────────────────────────────────┐
│  1. User taps "Take Photo" button       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Browser requests camera permission  │
│     (only if not previously granted)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. User grants/denies permission       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. If granted: Camera opens            │
│     (native phone camera app)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  5. User takes ONE photo                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  6. Photo is stored in app state        │
│     (temporary, in-memory only)         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  7. User sees preview and file info     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  8. User taps "Save Evidence"           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  9. ONLY THEN is photo uploaded         │
│     to server database                  │
└─────────────────────────────────────────┘
```

### If User Cancels:
- Photo is never uploaded
- Photo is cleared from memory
- No data is saved
- Process can be restarted

---

## Camera Permission Request

### iOS Safari:
```
┌────────────────────────────────────────┐
│  "PearsonNexusAI" Would Like to       │
│  Access the Camera                     │
│                                        │
│  [Don't Allow]  [OK]                  │
└────────────────────────────────────────┘
```

### Android Chrome:
```
┌────────────────────────────────────────┐
│  Allow 192.168.0.28 to access your    │
│  camera?                               │
│                                        │
│  [Block]  [Allow]                     │
└────────────────────────────────────────┘
```

### Permission Scope:
- **Per-session**: Permission typically lasts for browser session
- **Per-use**: Some browsers ask each time
- **Revocable**: Can be revoked in browser settings anytime
- **Domain-specific**: Only granted to this specific website

---

## Data Flow

### What Happens to Your Photo:

```
1. Photo taken/selected
   └─> Stored in JavaScript variable (RAM only)
   
2. User reviews photo
   └─> Displayed as preview (never leaves device yet)
   
3. User taps "Save Evidence"
   └─> Photo sent via HTTPS to your local server
   
4. Server receives photo
   └─> Saves to: project/server/uploads/
   └─> Creates database entry: project/server/data.json
   
5. Photo stored with:
   ├─> Unique filename (UUID)
   ├─> Timestamp
   ├─> User info
   ├─> File hash (for integrity)
   └─> Original filename
```

### Important Notes:
- Photos are stored on YOUR local server (not cloud)
- Server runs on YOUR PC (192.168.0.28)
- No third-party access
- You control the data

---

## File Upload Security

### What Gets Uploaded:

```javascript
// Only these fields are sent:
{
  file: <The single file you selected>,
  capturedAt: <Timestamp when you clicked save>,
  // Optional metadata (if you added it):
  caseId: <Case ID if selected>,
  tags: <Tags if added>,
  notes: <Notes if added>,
  location: <Location if added>
}
```

### What Does NOT Get Uploaded:
- ❌ Other photos from your library
- ❌ Photo metadata you didn't approve
- ❌ Location (unless explicitly enabled)
- ❌ Contact information
- ❌ Other files on your device
- ❌ Browsing history
- ❌ Any personal data

---

## Browser Permissions Explained

### Camera Permission:
**Purpose**: Take photos with device camera  
**Scope**: This website only  
**When**: Only when you tap "Take Photo"  
**Revoke**: Browser Settings → Site Permissions → Camera

### File Access Permission:
**Purpose**: Select files from device  
**Scope**: Single file per selection  
**When**: Only when you tap "Upload File"  
**Revoke**: Not persistent - no permission stored

### Microphone Permission:
**Purpose**: Record voice notes  
**Scope**: This website only  
**When**: Only when you tap "Voice Note"  
**Revoke**: Browser Settings → Site Permissions → Microphone

---

## Database Storage

### Server-Side Storage:

```
project/server/
├── uploads/              ← Photos and files stored here
│   ├── uuid-1.jpg
│   ├── uuid-2.pdf
│   └── uuid-3.txt
└── data.json            ← Metadata stored here
    └── {
          "uploads": [
            {
              "id": "uuid",
              "original_name": "photo.jpg",
              "stored_name": "uuid-1.jpg",
              "size": 12345,
              "created_at": "timestamp",
              "user_id": "your-user-id"
            }
          ]
        }
```

### What's Stored in Database:
- ✅ File metadata (name, size, type)
- ✅ Upload timestamp
- ✅ User who uploaded
- ✅ File hash (integrity check)
- ✅ Optional: tags, notes, case ID

### What's NOT Stored:
- ❌ Original photo location data (unless you add it)
- ❌ EXIF metadata (automatically stripped)
- ❌ Personal information beyond what you provide
- ❌ Device identifiers

---

## Privacy Best Practices

### For Maximum Privacy:

1. **Review Before Upload**:
   - Always review the preview
   - Check file info (name, size)
   - Cancel if wrong file selected

2. **Selective Permissions**:
   - Only grant camera permission when needed
   - Deny if you don't need that feature
   - Revoke permissions when done

3. **Check Uploads**:
   - Visit `/uploads` page to see what's stored
   - Delete unwanted uploads
   - Verify only intended files are saved

4. **Secure Network**:
   - Use on trusted Wi-Fi only
   - Your local network (not public)
   - HTTPS optional (add reverse proxy)

5. **Regular Cleanup**:
   - Delete old uploads you don't need
   - Keep database lean
   - Regular backups

---

## Common Questions

### Q: Can the app access all my photos?
**A**: NO. The HTML5 File API only allows access to files you explicitly select. The app cannot browse your photo library.

### Q: What happens if I deny camera permission?
**A**: You can still upload photos from your library using "Upload File". Camera just won't be accessible via "Take Photo".

### Q: Can the app upload photos without me knowing?
**A**: NO. Every upload requires you to tap "Save Evidence". Nothing uploads automatically.

### Q: Where are my photos stored?
**A**: On your local PC at `project/server/uploads/`. Not in the cloud.

### Q: Can I delete uploaded photos?
**A**: Yes, navigate to `/uploads` and delete any file. You can also delete from the server folder directly.

### Q: Does the app see my photo metadata?
**A**: The app only sees: filename, file size, and file type. EXIF data is preserved in the file but not extracted by the app.

### Q: Is my data encrypted?
**A**: Data is transmitted over your local network. For encryption, add HTTPS via reverse proxy (nginx, Caddy).

---

## Security Guarantees

### What We Guarantee:
✅ **Single File Selection**: One file at a time, your choice  
✅ **Explicit Upload**: Nothing uploads without your tap  
✅ **Local Storage**: Data stays on your PC  
✅ **User Control**: You control all permissions  
✅ **Transparency**: Open source - you can audit the code  

### What Depends On You:
🔒 **Network Security**: Use trusted Wi-Fi  
🔒 **Browser Security**: Keep browser updated  
🔒 **Server Security**: Protect your PC  
🔒 **Permission Management**: Grant only needed permissions  

---

## Audit the Code

### Want to verify? Check these files:

1. **Photo Capture Logic**:
   - `src/pages/MobileApp.tsx` - Lines 458-476
   - Look for `handleCameraCapture` function

2. **Upload Logic**:
   - `src/pages/MobileApp.tsx` - Lines 136-157
   - Look for `uploadEvidence` function

3. **Server Upload Handler**:
   - `server/index.js` - Lines 456-484
   - Look for `/api/uploads` endpoint

All code is open and auditable. No hidden functionality.

---

## Summary

### The Bottom Line:
- 📸 **One photo at a time** - your explicit choice
- 🛡️ **Browser security** - standard HTML5 protections
- 💾 **Local storage** - your PC, your control
- 🔒 **No auto-upload** - manual confirmation required
- ✅ **Transparent** - open source, auditable

### Trust But Verify:
- Review the code
- Test the permissions
- Monitor the uploads
- Check the database
- Revoke permissions if concerned

---

**Last Updated**: February 1, 2026  
**Version**: 1.0.0  

For questions or concerns, review the source code or contact support.
