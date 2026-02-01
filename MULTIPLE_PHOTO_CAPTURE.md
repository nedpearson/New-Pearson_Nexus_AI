# ✅ MULTIPLE PHOTO CAPTURE WITH REQUIRED NOTES

**Updated**: Mobile App now supports multiple photo capture and requires notes with every submission.

---

## 🎯 Key Changes

### 1. **Multiple Photo Capture**
✅ Select multiple photos at once
✅ Add more photos after initial selection
✅ Preview all photos in a grid
✅ Remove individual photos before saving

### 2. **Required Notes**
✅ **Text notes OR voice notes required** with photos
✅ Cannot save photos without context
✅ Character counter for text notes
✅ Combined notes (text + voice) saved together

### 3. **Enhanced UI**
✅ Photo grid with thumbnails
✅ Remove button on each photo
✅ "Add More" button to keep adding
✅ Warning message if notes missing
✅ Save button shows photo count

---

## 📸 How It Works

### Capture Multiple Photos:

1. **Tap "Take Photo"**
2. Select/capture 1st photo → Shows preview
3. **Tap "Add More"** → Capture/select 2nd photo
4. Repeat to add as many as needed
5. **Or** use "Upload File" to select multiple files at once

### Add Required Notes:

**Option 1 - Text Notes:**
- Type directly in the text box
- Describe what's in photos, context, dates, etc.

**Option 2 - Voice Notes:**
- Tap "Voice Note" button
- Speak your description
- Auto-transcribed and added

**Option 3 - Both:**
- Record voice note first
- Then add additional text notes
- Both saved together

### Save:

1. **Photos selected** ✓
2. **Notes added** ✓
3. Tap "Save X Photos" button
4. All photos + notes saved as one submission

---

## 🎨 UI Features

### Photo Grid:
```
┌─────────┬─────────┐
│ Photo 1 │ Photo 2 │  ← Hover to see X button
│  [X]    │  [X]    │  ← Remove individual photo
└─────────┴─────────┘
┌─────────┬─────────┐
│ Photo 3 │ Photo 4 │
│  [X]    │  [X]    │
└─────────┴─────────┘
     [Add More] button
```

### Notes Section:
```
┌──────────────────────────────┐
│ Add Notes (Required)         │
│ ┌──────────────────────────┐ │
│ │ Type description here... │ │
│ │                          │ │
│ └──────────────────────────┘ │
│ 125 characters               │
└──────────────────────────────┘
```

### Save Button States:
```
✅ With notes:     [Save 3 Photos]
❌ Without notes:  [Save 3 Photos] (disabled)
                   ⚠️ Please add notes
```

---

## 💾 Data Storage

### Single Submission Contains:
- **Multiple files** (all photos)
- **Combined notes** (text + voice transcription)
- **Metadata** (timestamp, file count, file names)
- **Offline queue entry** (syncs together)

### Example Queue Item:
```json
{
  "fileIds": ["file_123", "file_124", "file_125"],
  "fileNames": ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
  "notes": "Text notes here\n\nVoice transcription here",
  "timestamp": 1738378934567,
  "fileCount": 3
}
```

---

## 🔄 Sync Behavior

### All photos + notes sync together:
1. Offline: "Saved 3 photos offline"
2. Come back online
3. Tap "Sync Now"
4. **All 3 photos + notes upload as one item**
5. Success: "Synced 1 item" (contains 3 photos)

---

## 📋 Validation Rules

### Cannot Save If:
❌ No photos selected
❌ Photos selected but no notes added

### Can Save If:
✅ Photos + text notes
✅ Photos + voice notes  
✅ Photos + text + voice notes
✅ Voice notes only (no photos needed)

---

## 🎯 User Flow Examples

### Example 1: Car Accident Evidence
1. Take photo of damage (front)
2. Add more → Take photo (side)
3. Add more → Take photo (license plate)
4. Add text notes: "Hit-and-run at Main St & 5th. 2:30pm. Driver fled north."
5. Save 3 Photos → All saved together

### Example 2: Document Collection
1. Upload File → Select multiple PDFs
2. Tap "Voice Note"
3. Record: "Contract negotiations from May 2024 meeting with ABC Corp"
4. Save 5 Photos (PDFs) → All with voice note

### Example 3: Mixed Capture
1. Take 2 photos
2. Upload 1 PDF
3. Add text: "Evidence for case #12345"
4. Record voice note with additional context
5. Save 3 Photos → All files + both notes

---

## 🌐 Access

**Mobile App**: `http://192.168.0.28:3001/mobile`

**Features Working**:
- ✅ Multiple photo selection
- ✅ Camera capture (one at a time, tap multiple times)
- ✅ File upload (multiple at once)
- ✅ Required notes validation
- ✅ Photo grid with remove buttons
- ✅ Combined text + voice notes
- ✅ Offline storage
- ✅ Sync all photos together

---

## 💡 Tips

**Best Practices:**
- ✅ Capture all related photos before adding notes
- ✅ Use voice notes for quick context on-the-go
- ✅ Add text notes for precise details (dates, names, numbers)
- ✅ Review photo grid before saving
- ✅ Remove accidental/blurry photos

**Note Quality:**
- Include: WHO, WHAT, WHEN, WHERE
- Be specific: dates, times, locations, people
- Context matters: why this evidence is important
- Additional details: weather, lighting, angles

---

## ✅ Status

**Server**: ✅ Running on port 3001
**Frontend**: ✅ Running on port 5174
**Features**: ✅ All implemented and tested

**Try it now!** Open `http://192.168.0.28:3001/mobile` on your phone.
