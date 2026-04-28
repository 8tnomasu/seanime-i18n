# Playback Notes

## Continue Watching and watched episodes

Continue Watching should represent the latest meaningful local playback record for a media entry.

- Episode resume progress is stored per episode.
- The home Continue Watching section should use the latest local playback record for that media.
- Watched / completed status is a separate concept and follows Seanime's playback completion threshold behavior.

Current watched / completed behavior:

- Browser playback dispatches the completion event after roughly 80% playback progress.
- Continuity resume entries are hidden once playback progress reaches 90% or higher.

## Checking for zombie ffprobe processes

After triggering browser transcoding or metadata probing, check for zombie `ffprobe` processes:

```bash
ps -eo pid,ppid,stat,etime,cmd | awk '$3 ~ /Z/ { print }'
```

No `[ffprobe] <defunct>` process should remain.
