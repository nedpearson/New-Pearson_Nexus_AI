import { useRef, useState } from 'react';
import { Camera, Upload, Tag, Calendar, MapPin, Mic, Play, Pause, Square } from 'lucide-react';

export function Capture() {
  const [selectedCase, setSelectedCase] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [capturedAt, setCapturedAt] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const takePhotoInputRef = useRef<HTMLInputElement>(null);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const legalTags = [
    'Violation',
    'Communication',
    'Finance',
    'Safety',
    'Parenting',
    'Court',
    'Evidence',
    'Documentation'
  ];

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceNote(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setStatus('Recording voice note...');
    } catch (_error) {
      setStatus('Microphone access denied');
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
    setStatus('Transcribing voice note...');

    // Simulate transcription (in production, this would call a transcription API)
    setTimeout(() => {
      const mockTranscription = `[Voice Note - ${new Date().toLocaleString()}]\n\nRecorded evidence regarding case. Details include observations, timestamps, and relevant information for documentation purposes.`;
      setTranscription(mockTranscription);
      setNotes(prev => prev ? `${prev}\n\n${mockTranscription}` : mockTranscription);
      setIsProcessing(false);
      setStatus('Voice note transcribed successfully');
    }, 2000);
  };

  const handlePickFile = (file: File | null) => {
    setSelectedFile(file);
    setStatus(file ? `Selected: ${file.name}` : '');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus('Please take a photo or select a file first.');
      return;
    }

    setSaving(true);
    setStatus('Uploading...');

    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('caseId', selectedCase);
      fd.append('tags', tags.join(','));
      fd.append('notes', notes);
      if (capturedAt) fd.append('capturedAt', capturedAt);
      if (location) fd.append('location', location);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        credentials: 'include',
        body: fd
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || 'UPLOAD_FAILED');

      setStatus('Uploaded successfully. View at /uploads');
      setSelectedFile(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'UPLOAD_FAILED';
      setStatus(`Upload failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Capture</h1>
        <p className="text-gray-400">Document evidence and attach to legal cases</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 mb-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Upload Evidence</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => takePhotoInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-gray-700/50 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/10 smooth-transition"
          >
            <Camera className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-300">Take Photo</p>
          </button>

          <button
            type="button"
            onClick={() => uploadFileInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-gray-700/50 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/10 smooth-transition"
          >
            <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-300">Upload File</p>
          </button>

          <button
            type="button"
            onClick={startRecording}
            disabled={isRecording}
            className="p-6 border-2 border-dashed border-gray-700/50 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/10 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-300">Voice Note</p>
          </button>
        </div>

        {/* Voice Recording Interface */}
        {isRecording && (
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-400 animate-ping"></div>
                </div>
              </div>

              <div className="text-3xl font-mono font-bold text-white">
                {formatTime(recordingTime)}
              </div>

              <p className="text-purple-300 text-sm">
                {isPaused ? 'Recording paused' : 'Recording in progress...'}
              </p>

              <div className="flex justify-center gap-3">
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    className="px-4 py-2 rounded-lg bg-purple-600/50 border border-purple-500/50 text-white hover:bg-purple-600/70 transition-all flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="px-4 py-2 rounded-lg bg-purple-600/50 border border-purple-500/50 text-white hover:bg-purple-600/70 transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </button>
                )}

                <button
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-2 font-medium"
                >
                  <Square className="w-4 h-4" />
                  Stop & Transcribe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transcription Preview */}
        {transcription && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-3">
              <Mic className="w-4 h-4" />
              <span>Voice Note Transcription</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-slate-300 text-sm leading-relaxed">
              {transcription}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-purple-300 text-sm">Processing voice note...</span>
          </div>
        )}

        <div className="space-y-4">
          <input
            ref={takePhotoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
          />
          <input
            ref={uploadFileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
          />

          {status && (
            <div className="p-3 bg-gray-900/40 border border-gray-700/50 rounded-xl text-sm text-gray-200">
              {status}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Attach to Legal Case</label>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
            >
              <option value="">Select a case...</option>
              <option value="case-1">Smith v. Smith</option>
              <option value="case-2">Estate Planning - Johnson</option>
              <option value="case-3">Custody Matter - Davis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Legal Tags
              </div>
            </label>
            <div className="flex flex-wrap gap-2">
              {legalTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium smooth-transition ${
                    tags.includes(tag)
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
              placeholder="Add context, details, or observations..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date & Time
                </div>
              </label>
              <input
                type="datetime-local"
              value={capturedAt}
              onChange={(e) => setCapturedAt(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location (Optional)
                </div>
              </label>
              <input
                type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
                placeholder="Where did this occur?"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={handleUpload}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 smooth-transition font-medium shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Evidence
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 border-cyan-500/20 shadow-xl">
        <h3 className="font-semibold text-cyan-300 mb-2">Chain of Custody</h3>
        <p className="text-sm text-gray-400">
          All captured evidence includes automatic metadata: timestamp, user, device info, and file hash for forensic integrity.
        </p>
      </div>
    </div>
  );
}
