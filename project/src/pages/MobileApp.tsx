import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Mic,
  FileText,
  Upload,
  Zap,
  Clock,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Pause,
  Square,
  Home,
  Settings,
  Cloud
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SyncStatusBanner } from '../components/SyncIndicator';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { MicrophonePermissionHelp } from '../components/MicrophonePermissionHelp';
import { OfflineIndicator, OfflineStatusBadge } from '../components/OfflineIndicator';
import { SafariMicWarning } from '../components/SafariMicWarning';
import { getOfflineQueue } from '../lib/offlineQueue';
import { getSyncManager } from '../lib/syncManager';

export default function MobileApp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [transcription, setTranscription] = useState('');
  const [textNotes, setTextNotes] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({
    type: null,
    message: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMode, setActiveMode] = useState<'capture' | 'voice' | 'upload' | null>(null);
  const [showMicHelp, setShowMicHelp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Update unsynced count
    const updateCount = () => {
      const queue = getOfflineQueue();
      setUnsyncedCount(queue.getUnsyncedCount());
    };

    updateCount();
    const interval = setInterval(updateCount, 2000);

    return () => clearInterval(interval);
  }, []);

  // Check microphone permission state on mount
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let permissionStatus: PermissionStatus | null = null;

    const checkMicPermission = async () => {
      try {
        // Check if Permissions API is supported
        if (!navigator.permissions || typeof navigator.permissions.query !== 'function') {
          console.log('Permissions API not supported');
          return;
        }
        
        // Try to query microphone permission
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        permissionStatus = result;
        setMicPermissionState(result.state as 'prompt' | 'granted' | 'denied');
        
        // Listen for permission changes
        const handleChange = () => {
          setMicPermissionState(result.state as 'prompt' | 'granted' | 'denied');
        };
        result.addEventListener('change', handleChange);
        
        // Store handler for cleanup
        (result as any)._changeHandler = handleChange;
      } catch (_error) {
        // Permissions API not supported or error - will check when user tries to record
        // This is normal on Safari/iOS and some other browsers
        console.log('Permissions API not available (this is normal on some browsers)');
      }
    };

    // Use setTimeout to avoid blocking render
    timeoutId = setTimeout(checkMicPermission, 100);

    // Cleanup function
    return () => {
      // Clear timeout if component unmounts before it fires
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Remove event listener if it was added
      if (permissionStatus && (permissionStatus as any)._changeHandler) {
        permissionStatus.removeEventListener('change', (permissionStatus as any)._changeHandler);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone access - this will prompt user if not already granted
      setStatus({ type: 'info', message: 'Requesting microphone access...' });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Permission granted! Update state
      setMicPermissionState('granted');
      
      // Safari/iOS compatibility: use different MIME types
      let options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          options = { mimeType: 'audio/aac' };
        } else {
          // Let browser choose default
          options = {} as any;
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // Use the same MIME type that was used for recording
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processVoiceNote(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording immediately after permission granted
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Clear any previous status and show success
      setStatus({ type: 'success', message: '✓ Recording started! Speak now...' });
      
    } catch (error) {
      console.error('Microphone error:', error);
      
      // Update permission state
      setMicPermissionState('denied');
      
      // Check if it's a security/HTTPS issue on iOS
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      
      // More detailed error message
      let errorMessage = 'Microphone access denied';
      
      if (isIOS && !isSecure) {
        errorMessage = 'iOS requires HTTPS for microphone. Use Settings > Safari > Website Settings to allow.';
        setShowMicHelp(true);
      }
      else if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = 'Microphone permission denied. Tap below for help.';
          setShowMicHelp(true); // Show help dialog
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please check your device settings.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Microphone is already in use by another app. Please close other apps using the microphone.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Microphone not supported on this device/browser.';
        } else if (error.name === 'SecurityError') {
          errorMessage = 'Security error. Check browser permissions and reload the page.';
          setShowMicHelp(true);
        } else {
          // Generic error - still show help
          errorMessage = `Microphone error: ${error.message}. Tap below for help.`;
          setShowMicHelp(true);
        }
      }
      
      setStatus({ type: 'error', message: errorMessage });
      setActiveMode(null);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processVoiceNote = async (_audioBlob: Blob) => {
    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Transcribing audio...' });

    // Simulate transcription (replace with actual API call)
    setTimeout(() => {
      const mockTranscription = `[${new Date().toLocaleString()}] Spoke with opposing counsel regarding custody arrangement. They proposed alternating weekends. Need to review parenting plan before responding.`;
      setTranscription(mockTranscription);
      setIsProcessing(false);
      setStatus({ type: 'success', message: 'Voice note transcribed!' });
    }, 2000);
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // IMPORTANT: Only store the explicitly selected files
    // Do NOT access all photos - only the files user selected
    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
    setActiveMode('capture');
    setStatus({ 
      type: 'success', 
      message: `${fileArray.length} photo${fileArray.length > 1 ? 's' : ''} added (${selectedFiles.length + fileArray.length} total)` 
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // IMPORTANT: Only store the explicitly selected files
    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
    setActiveMode('upload');
    setStatus({ 
      type: 'success', 
      message: `${fileArray.length} file${fileArray.length > 1 ? 's' : ''} added (${selectedFiles.length + fileArray.length} total)` 
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setStatus({ type: 'info', message: 'File removed' });
  };

  const uploadEvidence = async () => {
    // Validate: Must have files AND notes
    if (selectedFiles.length === 0) {
      setStatus({ type: 'error', message: 'Please capture or upload photos first' });
      return;
    }

    if (!transcription && !textNotes) {
      setStatus({ type: 'error', message: 'Please add text or voice notes to describe the photos' });
      return;
    }

    setIsProcessing(true);
    
    const offlineQueue = getOfflineQueue();
    const isOnline = navigator.onLine;

    // Store all files with their notes
    try {
      const fileIds: string[] = [];
      
      // Store each file locally
      for (const file of selectedFiles) {
        const fileId = await offlineQueue.storeFile(file);
        fileIds.push(fileId);
      }

      // Combine transcription and text notes
      const combinedNotes = [textNotes, transcription].filter(Boolean).join('\n\n');

      // Add to offline queue as a single submission
      const queueItem = {
        fileIds,
        fileNames: selectedFiles.map(f => f.name),
        fileTypes: selectedFiles.map(f => f.type),
        notes: combinedNotes,
        textNotes,
        transcription,
        category: 'General',
        timestamp: Date.now(),
        fileCount: selectedFiles.length
      };

      offlineQueue.addToQueue('photo', queueItem);

      // Success message
      const photoCount = selectedFiles.length;
      if (isOnline) {
        setStatus({ 
          type: 'success', 
          message: `✓ Saved ${photoCount} photo${photoCount > 1 ? 's' : ''} with notes! Tap sync when ready.` 
        });
      } else {
        setStatus({ 
          type: 'success', 
          message: `✓ Saved ${photoCount} photo${photoCount > 1 ? 's' : ''} offline! Will sync when online.` 
        });
      }

      // Clear form after short delay
      setTimeout(() => {
        setSelectedFiles([]);
        setTranscription('');
        setTextNotes('');
        setActiveMode(null);
        setStatus({ type: null, message: '' });
      }, 2000);
      
      setIsProcessing(false);

      // Update count
      setUnsyncedCount(offlineQueue.getUnsyncedCount());

    } catch (error) {
      console.error('Save error:', error);
      setStatus({ type: 'error', message: 'Failed to save locally' });
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setTranscription('');
    setTextNotes('');
    setActiveMode(null);
    setStatus({ type: null, message: '' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualSync = async () => {
    if (!navigator.onLine) {
      setStatus({ type: 'error', message: 'No internet connection. Connect and try again.' });
      return;
    }

    const offlineQueue = getOfflineQueue();
    const unsyncedItems = offlineQueue.getUnsyncedItems();

    if (unsyncedItems.length === 0) {
      setStatus({ type: 'info', message: 'Nothing to sync!' });
      return;
    }

    setIsSyncing(true);
    setStatus({ type: 'info', message: `Syncing ${unsyncedItems.length} item${unsyncedItems.length > 1 ? 's' : ''}...` });

    try {
      let successCount = 0;
      let failCount = 0;

      for (const item of unsyncedItems) {
        try {
          const fd = new FormData();
          
          // Handle multiple files (new format)
          if (item.data.fileIds && Array.isArray(item.data.fileIds)) {
            for (const fileId of item.data.fileIds) {
              const storedFile = offlineQueue.getStoredFile(fileId);
              if (storedFile) {
                const response = await fetch(storedFile.data);
                const blob = await response.blob();
                const file = new File([blob], storedFile.name, { type: storedFile.type });
                fd.append('file', file);
              }
            }
          }
          // Handle single file (legacy format)
          else if (item.data.fileId) {
            const storedFile = offlineQueue.getStoredFile(item.data.fileId);
            if (storedFile) {
              const response = await fetch(storedFile.data);
              const blob = await response.blob();
              const file = new File([blob], storedFile.name, { type: storedFile.type });
              fd.append('file', file);
            }
          }

          // Add combined notes as text file
          if (item.data.notes) {
            const textBlob = new Blob([item.data.notes], { type: 'text/plain' });
            const textFile = new File([textBlob], `notes-${item.timestamp}.txt`, { type: 'text/plain' });
            fd.append('file', textFile);
          }
          // Legacy: Add transcription only
          else if (item.data.transcription) {
            const textBlob = new Blob([item.data.transcription], { type: 'text/plain' });
            const textFile = new File([textBlob], `voice-note-${item.timestamp}.txt`, { type: 'text/plain' });
            fd.append('file', textFile);
          }

          fd.append('capturedAt', new Date(item.timestamp).toISOString());

          const res = await fetch('/api/uploads', {
            method: 'POST',
            credentials: 'include',
            body: fd
          });

          if (res.ok) {
            offlineQueue.markAsSynced(item.id);
            
            // Remove all stored files
            if (item.data.fileIds && Array.isArray(item.data.fileIds)) {
              for (const fileId of item.data.fileIds) {
                offlineQueue.removeStoredFile(fileId);
              }
            } else if (item.data.fileId) {
              offlineQueue.removeStoredFile(item.data.fileId);
            }
            
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error('Failed to sync item:', item.id, error);
          failCount++;
        }
      }

      // Clean up synced items
      offlineQueue.clearSyncedItems();

      if (failCount === 0) {
        setStatus({ type: 'success', message: `✓ Synced ${successCount} item${successCount > 1 ? 's' : ''} successfully!` });
      } else {
        setStatus({ type: 'error', message: `Synced ${successCount}, failed ${failCount}. Try again.` });
      }

      // Trigger sync manager too
      getSyncManager().syncNow();

    } catch (error) {
      console.error('Sync error:', error);
      setStatus({ type: 'error', message: 'Sync failed. Check connection and try again.' });
    } finally {
      setIsSyncing(false);
      setUnsyncedCount(offlineQueue.getUnsyncedCount());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Sync Status Banner */}
      <SyncStatusBanner />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Safari Microphone Warning */}
      <SafariMicWarning />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-slate-950/50 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Quick Capture</h1>
                <p className="text-xs text-cyan-400">{user?.email}</p>
                <OfflineStatusBadge className="mt-1" />
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700/50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Bar */}
          {status.message && (
            <div
              className={`mt-3 px-4 py-3 rounded-lg border ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : status.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-cyan-500/10 border-cyan-500/30'
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                {status.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {status.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                {status.type === 'info' && <Zap className="w-4 h-4 animate-pulse text-cyan-400" />}
                <span className={
                  status.type === 'success' ? 'text-emerald-400' :
                  status.type === 'error' ? 'text-red-400' :
                  'text-cyan-400'
                }>
                  {status.message}
                </span>
              </div>
              {status.type === 'error' && status.message.includes('Microphone') && (
                <button
                  onClick={() => setShowMicHelp(true)}
                  className="mt-2 w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-xs font-medium transition-all"
                >
                  📋 How to Enable Microphone
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8 space-y-6">
        {/* Quick Actions */}
        {!activeMode && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              <span>Choose capture method</span>
            </div>

            {/* Camera Button */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 hover:border-cyan-400/50 transition-all p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-white mb-1">Take Photo</h3>
                    <p className="text-sm text-slate-400">Capture evidence instantly</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* Voice Note Button */}
            <button
              onClick={() => {
                setActiveMode('voice');
                startRecording();
              }}
              className="w-full group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-400/50 transition-all p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-white mb-1">
                      Voice Note
                      {micPermissionState === 'granted' && (
                        <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                          Ready
                        </span>
                      )}
                      {micPermissionState === 'denied' && (
                        <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                          Blocked
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {micPermissionState === 'granted' 
                        ? 'Tap to start recording instantly'
                        : micPermissionState === 'denied'
                        ? 'Permission needed - tap for help'
                        : 'Speak your thoughts, auto-transcribed'
                      }
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* Upload Button */}
            <button
              onClick={() => uploadInputRef.current?.click()}
              className="w-full group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-400/50 transition-all p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-white mb-1">Upload File</h3>
                    <p className="text-sm text-slate-400">Documents, PDFs, images</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Voice Recording Interface */}
        {activeMode === 'voice' && isRecording && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 p-8">
              <div className="text-center space-y-6">
                {/* Recording Indicator */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Mic className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-purple-400 animate-ping"></div>
                  </div>
                </div>

                {/* Timer */}
                <div className="text-4xl font-mono font-bold text-white">
                  {formatTime(recordingTime)}
                </div>

                <p className="text-purple-300 text-sm">
                  {isPaused ? 'Recording paused' : 'Recording in progress...'}
                </p>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  {!isPaused ? (
                    <button
                      onClick={pauseRecording}
                      className="px-6 py-3 rounded-xl bg-purple-600/50 border border-purple-500/50 text-white hover:bg-purple-600/70 transition-all flex items-center gap-2"
                    >
                      <Pause className="w-5 h-5" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="px-6 py-3 rounded-xl bg-purple-600/50 border border-purple-500/50 text-white hover:bg-purple-600/70 transition-all flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Resume
                    </button>
                  )}

                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-2 font-medium"
                  >
                    <Square className="w-5 h-5" />
                    Stop & Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transcription Preview */}
        {transcription && (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-700 p-6 space-y-4">
            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
              <FileText className="w-4 h-4" />
              <span>Voice Transcription</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-300 text-sm leading-relaxed">
              {transcription}
            </div>
          </div>
        )}

        {/* Photos Preview */}
        {selectedFiles.length > 0 && (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                <Camera className="w-4 h-4" />
                <span>{selectedFiles.length} Photo{selectedFiles.length > 1 ? 's' : ''} Selected</span>
              </div>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="text-xs px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all"
              >
                Add More
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-xl bg-slate-950/50 border border-slate-800 overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 border-2 border-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="mt-1 text-xs text-slate-500 truncate">{file.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Notes Input - REQUIRED with photos */}
        {(selectedFiles.length > 0 || transcription || activeMode === 'capture' || activeMode === 'upload') && (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-700 p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
              <FileText className="w-4 h-4" />
              <span>Add Notes {selectedFiles.length > 0 && '(Required)'}</span>
            </div>
            <textarea
              value={textNotes}
              onChange={(e) => setTextNotes(e.target.value)}
              placeholder="Describe what's in the photos, context, dates, people involved, etc..."
              className="w-full min-h-32 p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-300 text-sm leading-relaxed placeholder-slate-600 focus:outline-none focus:border-amber-500/50 resize-none"
            />
            <div className="text-xs text-slate-500">
              {textNotes.length > 0 
                ? `${textNotes.length} characters` 
                : 'Type or use voice notes above to add context to your photos'}
            </div>
          </div>
        )}

        {/* Save Button */}
        {(selectedFiles.length > 0 || transcription) && (
          <div className="space-y-4">
            <button
              onClick={uploadEvidence}
              disabled={isProcessing || (selectedFiles.length > 0 && !transcription && !textNotes)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Save {selectedFiles.length > 0 && `${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`}
                </>
              )}
            </button>

            {selectedFiles.length > 0 && !transcription && !textNotes && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm text-center">
                ⚠️ Please add text or voice notes to describe the photos
              </div>
            )}

            <button
              onClick={resetForm}
              className="w-full py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700/50 transition-all"
            >
              Cancel & Clear All
            </button>
          </div>
        )}

        {/* Recent Activity */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-700 p-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-4">
            <Clock className="w-4 h-4" />
            <span>Quick Access</span>
          </div>
          <div className="space-y-2">
            {/* Sync Button */}
            {unsyncedCount > 0 && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing || !navigator.onLine}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 border border-blue-400/30 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  {isSyncing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Cloud className="w-5 h-5 text-white" />
                  )}
                  <div>
                    <div className="text-white font-bold">
                      {isSyncing ? 'Syncing...' : `Sync Now (${unsyncedCount})`}
                    </div>
                    <div className="text-xs text-white/80">
                      {navigator.onLine ? 'Upload offline data to server' : 'Waiting for connection...'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-all" />
              </button>
            )}
            
            <button
              onClick={() => navigate('/uploads')}
              className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-medium">View All Uploads</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </button>
            
            <button
              onClick={() => navigate('/settings')}
              className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* Bottom spacing for mobile keyboards */}
        <div className="h-24"></div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-cyan-500/20 z-50">
        <div className="flex items-center justify-around px-4 py-3">
          <button
            onClick={() => navigate('/mobile')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
          >
            <Zap className="w-6 h-6 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-medium">Capture</span>
          </button>
          
          <button
            onClick={() => navigate('/uploads')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-all"
          >
            <FileText className="w-6 h-6 text-slate-400" />
            <span className="text-xs text-slate-400">Files</span>
          </button>
          
          <button
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-all"
          >
            <Settings className="w-6 h-6 text-slate-400" />
            <span className="text-xs text-slate-400">Settings</span>
          </button>
          
          <button
            onClick={() => {
              // Set preference for desktop view
              sessionStorage.setItem('prefer_desktop', 'true');
              navigate('/');
            }}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-all"
          >
            <Home className="w-6 h-6 text-slate-400" />
            <span className="text-xs text-slate-400">Desktop</span>
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      {/* 
        SECURITY NOTE: Photo/Camera Access
        
        These file inputs use the HTML5 File API which:
        1. Only accesses the SINGLE photo/file the user explicitly selects
        2. Does NOT grant access to the entire photo library
        3. Does NOT automatically upload anything
        4. Requires explicit user interaction to select each file
        
        How it works:
        - User taps "Take Photo" or "Upload File"
        - Browser shows native file/camera picker
        - User explicitly selects file(s) - can select multiple
        - Only selected files are stored in state (selectedFiles array)
        - Files are ONLY uploaded when user taps "Save" button
        - No background access, no automatic uploads
        
        The 'accept' and 'capture' attributes:
        - accept="image/*": Filters to show only images (user protection)
        - capture="environment": Opens rear camera on mobile (convenience)
        
        Browser permissions:
        - Camera permission is requested ONLY when user taps "Take Photo"
        - Permission is temporary and per-use
        - User must grant permission each time (browser security)
      */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          // Handle multiple files the user selected
          handleCameraCapture(e);
          // Clear the input so the same file can be selected again
          e.target.value = '';
        }}
      />
      <input
        ref={uploadInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          // Handle multiple files the user selected
          handleFileUpload(e);
          // Clear the input so the same file can be selected again
          e.target.value = '';
        }}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Microphone Permission Help */}
      {showMicHelp && <MicrophonePermissionHelp onClose={() => setShowMicHelp(false)} />}
    </div>
  );
}
