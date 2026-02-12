

## Fix: Repeated Text in Bach Chat Input (Speech Recognition Bug)

### Root Cause
The speech recognition `onresult` handler loops over **all** results in `event.results` every time it fires, joining them into one big string. When a final result arrives, it appends that entire accumulated transcript to the input -- including text from previous results that was already added.

For example:
- Result 1 fires (final): transcript = "hello" --> input becomes "hello"
- Result 2 fires (final): transcript = "hello how are you" --> input becomes "hellohello how are you"

### Fix
Track which results have already been processed using `event.resultIndex`, and only extract the **new final result** instead of re-reading all results.

### Technical Changes

**File: `src/components/admin/assistant/AIAssistantPanel.tsx`**

Replace the `onresult` handler (lines 33-39) with logic that only processes new results:

```typescript
recognition.onresult = (event: any) => {
  // Only process the latest result, not all accumulated results
  const latestResult = event.results[event.results.length - 1];
  if (latestResult.isFinal) {
    const transcript = latestResult[0].transcript;
    setInput(prev => (prev ? prev + ' ' : '') + transcript.trim());
  }
};
```

This ensures:
- Only the **newest** final transcript segment is appended
- Previously added text is never re-read or duplicated
- A space separator is added between segments for readability

### Additional Safety
Also stop recognition before clearing input in `handleSend`, so any in-flight transcripts don't race with the cleared state:

```typescript
const handleSend = useCallback(async () => {
  if (!input.trim() || isLoading || sendCooldown) return;
  // Stop mic if active to prevent race condition
  if (isListeningRef.current) {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
  }
  const text = input;
  setInput('');
  if (inputRef.current) inputRef.current.style.height = 'auto';
  // ... rest unchanged
});
```

Only one file is modified: `AIAssistantPanel.tsx`.
