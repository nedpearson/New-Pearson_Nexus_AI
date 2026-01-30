# PWA Implementation Summary

## Features Implemented

### 1. Persistent Install App Button
- **Desktop**: TopBar component displays "Install App" button at top of dashboard
- **Mobile**: Same TopBar appears on mobile route `/m` with install button
- **States**:
  - Shows "Install App" when PWA can be installed
  - Shows "Installing..." during installation
  - Shows "Installed" (green) when app is already installed
  - Disabled/grayed out when browser doesn't support PWA install

### 2. Mobile View Navigation
- **Desktop TopBar** includes "Mobile View" button that navigates to `/m`
- **Routes**: Both `/mobile` and `/m` point to mobile dashboard
- **Mobile View** has back button to return to desktop view

### 3. Simple ↔ Advanced Toggle
- **Location**: Desktop TopBar (top-left)
- **Persistence**: Stores preference in `localStorage` as `viewMode`
- **Values**: `'simple'` or `'advanced'`
- **Display**: Shows current mode with ↔ icon

### 4. Full PWA Support
- **Manifest**: `/public/manifest.json` properly configured
- **Service Worker**: `/public/sw.js` handles offline caching
- **Registration**: Service worker auto-registers in `main.tsx`
- **Install Prompt**: Captured via `beforeinstallprompt` event

## File Structure

```
src/
├── pwa/
│   └── useInstallPrompt.ts          # PWA install hook
├── components/
│   └── TopBar.tsx                    # Persistent top bar with install button
├── routes/
│   ├── DesktopDashboard.tsx          # Desktop wrapper with TopBar
│   └── MobileDashboard.tsx           # Mobile route wrapper
├── pages/
│   ├── Dashboard.tsx                 # Main dashboard component (unchanged)
│   └── MobileDashboard.tsx           # Mobile dashboard with TopBar
├── App.tsx                           # Updated routing
└── main.tsx                          # Service worker registration (existing)

public/
├── manifest.json                     # PWA manifest (existing)
└── sw.js                             # Service worker (existing)
```

## How It Works

### Install Button Logic
1. Hook listens for `beforeinstallprompt` event
2. When user clicks "Install App", calls `prompt()` on event
3. Tracks installation state via `appinstalled` event
4. Detects if already installed via `display-mode: standalone` media query

### View Mode Persistence
```typescript
// Stored in localStorage as 'viewMode'
localStorage.getItem('viewMode') // 'simple' | 'advanced'
```

### Routes
- `/` and `/dashboard` → Desktop view with TopBar
- `/m` and `/mobile` → Mobile view with TopBar

## Run Instructions

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Available Scripts (from package.json)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

## Testing PWA Install

### Desktop (Chrome/Edge)
1. Run `npm run dev`
2. Open http://localhost:5173
3. Look for install icon in address bar OR
4. Click "Install App" button in TopBar
5. Follow browser prompts

### Mobile (iOS Safari)
1. Deploy to HTTPS domain or use ngrok
2. Visit site in Safari
3. Tap "Install App" button in TopBar
4. Follow iOS prompts

### Mobile (Android Chrome)
1. Deploy to HTTPS domain or use ngrok
2. Visit site in Chrome
3. Tap "Install App" button in TopBar
4. Follow Android prompts

## Notes

- PWA requires HTTPS in production (localhost is exempt)
- Service worker caches app shell for offline use
- Install button only appears when PWA is installable
- View mode preference survives page reloads
- Existing branding and layout preserved
- All features work without breaking existing functionality
