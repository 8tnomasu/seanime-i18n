# Seanime i18n

[English](./README.md)

`seanime-i18n` 是由 [8tnomasu/seanime-i18n](https://github.com/8tnomasu/seanime-i18n) 維護的非官方 Seanime fork。

## 關於這個 fork

本儲存庫是 Seanime 的非官方 fork。

它最初是為了 i18n 與繁體中文在地化而建立，現在也持續維護 fork 專用的 Docker 封裝、mediastream 播放修正、播放連續性修正、updater 來源調整，以及 release workflow 相關變更。

目前這個維護分支正在準備把 fork 從 upstream Seanime `v3.7.1` 同步到 `v3.8.2`，目標 fork release 版本為 `v3.8.2-i18n.1`。

本 fork 與上游 Seanime 專案沒有隸屬或背書關係。

## 目前同步 / release 準備狀態

- Upstream base: `v3.8.2`
- Fork release target: `v3.8.2-i18n.1`
- 目前這個準備階段不會建立 release tag、GitHub Release 或 Docker image

## Fork 專屬行為

- 提供 i18n 基礎架構與繁體中文在地化
- `zh-TW` 持續作為主要維護語系，`en-US` 保留為 fallback
- Web UI 與 updater 的 release 檢查持續指向 `8tnomasu/seanime-i18n`
- Denshi 桌面版 updater feed 持續指向 fork release channel
- fork 版本比較邏輯持續支援 `v3.8.2-i18n.1` 這類 tag
- GHCR Docker 封裝持續由 fork 維護
- Docker runtime 持續內含 FFmpeg 與 FFprobe，以支援 browser transcoding playback
- mediastream、transcoding 與 playback continuity 修正持續保留

若要查看維護者導向的 fork 差異說明，請參考 [`docs/fork-deltas.md`](docs/fork-deltas.md) 與 [`docs/upstream-sync.md`](docs/upstream-sync.md)。

## 狀態 / 聲明

- 這是 Seanime 的非官方 fork。
- 本專案獨立維護。
- 本 fork 的行為可能與 upstream Seanime 不同。
- 本 fork 的更新檢查應追蹤 [8tnomasu/seanime-i18n releases](https://github.com/8tnomasu/seanime-i18n/releases)，而不是 upstream Seanime releases。
- Seanime 不提供、代管或散佈媒體內容。
- 使用者需自行確認媒體來源符合所在地法律與使用規範。
- 本 fork 不會移除或弱化 Seanime 原有的版權、授權與法律聲明。

## 支援語系

| Locale | Language | Status |
| --- | --- | --- |
| `en-US` | English | 預設 / fallback |
| `zh-TW` | 繁體中文 | 主要維護語系 |

## 安裝 / 使用

- Clone 此 fork。
- 依照原始 Seanime 的開發與建置說明操作，請參考 [DEVELOPMENT_AND_BUILD.md](./DEVELOPMENT_AND_BUILD.md)。
- 啟動後可在 UI settings 內選擇偏好的語系。
- Docker 部署請參考 [docs/docker.md](./docs/docker.md)。
- Release 流程請參考 [docs/release.md](./docs/release.md)。

## Docker 部署

本 fork 會將 Docker image 發佈到 GHCR。本次同步所準備的固定 tag 為：

```yaml
image: ghcr.io/8tnomasu/seanime-i18n:v3.8.2-i18n.1
```

正式部署建議使用固定版本 tag，而不是 `latest`。

官方 image 的 runtime 內含 FFmpeg 與 FFprobe，可支援 browser transcoding playback。

注意：在這個 release 準備 PR 階段，上述 tag 是預計發布版本，實際上可能要等到 release 階段完成後才會出現在 GHCR。

## i18n 說明

主要 i18n 檔案位於：

- `seanime-web/src/i18n/`
- `seanime-web/src/i18n/locales/en-US.json`
- `seanime-web/src/i18n/locales/zh-TW.json`
- `seanime-web/src/i18n/labels.ts`

其他在地化備註請參考 [docs/i18n.md](./docs/i18n.md)。

## Upstream

此 fork 以上游 5rahim 的 Seanime 為基礎。

Upstream repository: [5rahim/seanime](https://github.com/5rahim/seanime)

## 授權

- 本 fork 持續沿用原始 GPL-3.0 授權。
- 原始版權與授權聲明必須保留。
- 請參考 [LICENSE](./LICENSE)。
