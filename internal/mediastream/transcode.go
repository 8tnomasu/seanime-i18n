package mediastream

import (
	"errors"
	"net/http"
	"seanime/internal/events"
	"seanime/internal/mediastream/cassette"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/samber/mo"
)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Transcode
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (r *Repository) ServeEchoTranscodeStream(c echo.Context, clientId string) error {
	c.Response().Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Response().Header().Set("Pragma", "no-cache")
	c.Response().Header().Set("Expires", "0")

	if !r.IsInitialized() {
		r.wsEventManager.SendEvent(events.MediastreamShutdownStream, "Module not initialized")
		return errors.New("module not initialized")
	}

	if !r.TranscoderIsInitialized() {
		r.wsEventManager.SendEvent(events.MediastreamShutdownStream, "Transcoder not initialized")
		return errors.New("transcoder not initialized")
	}

	path := c.Param("*")

	mediaContainer, found := r.playbackManager.currentMediaContainer.Get()
	if !found {
		return errors.New("no file has been loaded")
	}

	token := c.QueryParam("token")
	playback := c.QueryParam("playback")

	r.logger.Trace().
		Str("client_id", clientId).
		Str("request_path", path).
		Str("requested_playback", playback).
		Str("current_playback", mediaContainer.Hash).
		Msg("mediastream: transcode asset request")

	if playback != "" && playback != mediaContainer.Hash {
		r.logger.Warn().
			Str("client_id", clientId).
			Str("requested_playback", playback).
			Str("current_playback", mediaContainer.Hash).
			Str("path", path).
			Msg("mediastream: Ignoring stale transcode asset request")
		return echo.NewHTTPError(http.StatusGone, "stale mediastream playback request")
	}

	if path == "master.m3u8" {
		ret, err := r.transcoder.MustGet().GetMaster(mediaContainer.Filepath, mediaContainer.Hash, mediaContainer.MediaInfo, clientId, playback, token)
		if err != nil {
			return err
		}

		return c.String(200, ret)
	}

	// Video stream
	// /:quality/index.m3u8
	if strings.HasSuffix(path, "index.m3u8") && !strings.Contains(path, "audio") {
		split := strings.Split(path, "/")
		if len(split) != 2 {
			return errors.New("invalid index.m3u8 path")
		}

		quality, err := cassette.QualityFromString(split[0])
		if err != nil {
			return err
		}

		ret, err := r.transcoder.MustGet().GetVideoIndex(mediaContainer.Filepath, mediaContainer.Hash, mediaContainer.MediaInfo, quality, clientId, playback, token)
		if err != nil {
			return err
		}

		return c.String(200, ret)
	}

	// Audio stream
	// /audio/:audio/index.m3u8
	if strings.HasSuffix(path, "index.m3u8") && strings.Contains(path, "audio") {
		split := strings.Split(path, "/")
		if len(split) != 3 {
			return errors.New("invalid index.m3u8 path")
		}

		audio, err := strconv.ParseInt(split[1], 10, 32)
		if err != nil {
			return err
		}

		ret, err := r.transcoder.MustGet().GetAudioIndex(mediaContainer.Filepath, mediaContainer.Hash, mediaContainer.MediaInfo, int32(audio), clientId, playback, token)
		if err != nil {
			return err
		}

		return c.String(200, ret)
	}

	// Video segment
	// /:quality/segments-:chunk.ts
	if strings.HasSuffix(path, ".ts") && !strings.Contains(path, "audio") {
		split := strings.Split(path, "/")
		if len(split) != 2 {
			return errors.New("invalid segments-:chunk.ts path")
		}

		quality, err := cassette.QualityFromString(split[0])
		if err != nil {
			return err
		}

		segment, err := cassette.ParseSegment(split[1])
		if err != nil {
			return err
		}

		ret, err := r.transcoder.MustGet().GetVideoSegment(
			c.Request().Context(),
			mediaContainer.Filepath, mediaContainer.Hash, mediaContainer.MediaInfo, quality, segment, clientId)
		if err != nil {
			return err
		}

		return c.File(ret)
	}

	// Audio segment
	// /audio/:audio/segments-:chunk.ts
	if strings.HasSuffix(path, ".ts") && strings.Contains(path, "audio") {
		split := strings.Split(path, "/")
		if len(split) != 3 {
			return errors.New("invalid segments-:chunk.ts path")
		}

		audio, err := strconv.ParseInt(split[1], 10, 32)
		if err != nil {
			return err
		}

		segment, err := cassette.ParseSegment(split[2])
		if err != nil {
			return err
		}

		ret, err := r.transcoder.MustGet().GetAudioSegment(
			c.Request().Context(),
			mediaContainer.Filepath, mediaContainer.Hash, mediaContainer.MediaInfo, int32(audio), segment, clientId)
		if err != nil {
			return err
		}

		return c.File(ret)
	}

	return errors.New("invalid path")
}

// ShutdownTranscodeStream It should be called when unmounting the player (playback is no longer needed).
// This will also send an events.MediastreamShutdownStream event.
func (r *Repository) ShutdownTranscodeStream(clientId string, playbackId string) {
	r.reqMu.Lock()
	defer r.reqMu.Unlock()

	if !r.IsInitialized() {
		return
	}

	if !r.TranscoderIsInitialized() {
		return
	}

	mediaContainer, found := r.playbackManager.currentMediaContainer.Get()
	if !found {
		return
	}

	if playbackId != "" && mediaContainer.Filepath != playbackId {
		r.logger.Debug().
			Str("client_id", clientId).
			Str("playback_id", playbackId).
			Str("current_playback_id", mediaContainer.Filepath).
			Msg("mediastream: Ignoring shutdown transcode stream request for stale playback")
		return
	}

	r.logger.Warn().
		Str("client_id", clientId).
		Str("playback_id", playbackId).
		Msg("mediastream: Received shutdown transcode stream request")

	// Kill playback
	r.playbackManager.KillPlayback()

	// Destroy the current transcoder
	r.transcoder.MustGet().Destroy()

	// Load a new transcoder
	r.transcoder = mo.None[*cassette.Cassette]()
	r.initializeTranscoder(r.settings)

	// Send event
	r.wsEventManager.SendEvent(events.MediastreamShutdownStream, nil)
}
