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

## Mediastream transcoding checks

For browser HLS transcoding playback:

- Continue Watching should follow the latest meaningful local playback record.
- Episode resume points should remain independent per episode.
- Transcode HLS requests should stay isolated to the active playback session.
- Long-distance seeks should start a fresh transcoder head near the requested segment instead of waiting on an old distant head.

Useful runtime checks:

```bash
docker logs --tail=300 seanime
docker logs -f seanime
ps -eo pid,ppid,stat,etime,cmd | grep -E "ffprobe|ffmpeg|seanime" | grep -v grep
```
