

# Give Bach a Voice — ElevenLabs Text-to-Speech

## What This Adds

Bach will be able to speak responses aloud using ElevenLabs TTS. The feature includes:

- A **speaker button** on each assistant message to replay it
- A **voice toggle** in the panel header to enable/disable auto-speak
- **Auto-speak** for new assistant messages (including briefings) when enabled
- **Stop-on-interrupt** when the user sends a new message, closes the panel, or starts voice input

## Changes

### 1. Edge Function: `text-to-speech`
- New file: `supabase/functions/text-to-speech/index.ts`
- Accepts `{ text, voice_id? }`, cleans markdown/emoji from text, truncates to ~2000 chars, calls ElevenLabs API, returns binary MP3
- Uses the `ELEVENLABS_API_KEY` secret (already connected)
- Auth-protected: requires valid user session
- Config entry in `supabase/config.toml` with `verify_jwt = false` (auth validated in code)

### 2. Frontend Hook: `useTextToSpeech`
- New file: `src/components/admin/assistant/hooks/useTextToSpeech.ts`
- Manages speak/stop/loading/error state
- Uses `fetch()` directly for binary audio response (not `supabase.functions.invoke`)
- Persists auto-speak preference in localStorage

### 3. ChatMessage Update
- File: `src/components/admin/assistant/ChatMessage.tsx`
- Add speaker button (Volume2/VolumeX icon) in the timestamp row of assistant messages
- Shows loading spinner while generating, stop icon while playing

### 4. AIAssistantPanel Update
- File: `src/components/admin/assistant/AIAssistantPanel.tsx`
- Add voice toggle button in panel header (gold accent when active)
- Wire `useTextToSpeech` hook
- Auto-speak new assistant messages when toggle is on
- Stop speaking on: panel close, new message sent, mic activated
- Pass speak/stop props down to ChatMessage components

### 5. Voice Selection
- Default voice: "Brian" (`nPczCjzI2devNBz1zQrb`) — professional male, warm tone that fits Bach's personality
- Model: `eleven_turbo_v2_5` for lowest latency
- Can be changed via `ELEVENLABS_VOICE_ID` secret without code changes

## Technical Details

### Text Cleaning (server-side)
Before sending to ElevenLabs, the text is cleaned:
- Strip `[SUGGESTIONS:...]` tags, code blocks, markdown formatting, bullet markers
- Truncate at ~2000 chars at a natural sentence break
- Append "For the full details, check the text above." if truncated

### Audio Flow
```text
User clicks speaker (or auto-speak triggers)
  --> fetch() POST to text-to-speech edge function
  --> Edge function cleans text, calls ElevenLabs API
  --> Returns binary MP3
  --> Browser creates Audio object from blob URL
  --> Playback with isSpeaking state tracking
```

### Files Created
- `supabase/functions/text-to-speech/index.ts`
- `src/components/admin/assistant/hooks/useTextToSpeech.ts`

### Files Modified
- `supabase/config.toml` (add function config)
- `src/components/admin/assistant/ChatMessage.tsx` (add speaker button)
- `src/components/admin/assistant/AIAssistantPanel.tsx` (add voice toggle, auto-speak logic, interrupt handling)

