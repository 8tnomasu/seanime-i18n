package handlers

import (
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestGetMediastreamClientIdUsesContextIdentity(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest("GET", "/api/v1/mediastream/transcode/master.m3u8", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.Set(clientIdCookieName, "player-client")

	assert.Equal(t, "player-client", getMediastreamClientId(c))
}

func TestGetMediastreamClientIdReturnsEmptyWithoutContextIdentity(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest("GET", "/api/v1/mediastream/transcode/master.m3u8", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	assert.Equal(t, "", getMediastreamClientId(c))
}
