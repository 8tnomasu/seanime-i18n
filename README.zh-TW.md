# Seanime i18n

[English](./README.md)

`seanime-i18n` 是由 [8tnomasu/seanime-i18n](https://github.com/8tnomasu/seanime-i18n) 維護的 Seanime 非官方 fork。

## 關於此 fork

本專案是 Seanime 的非官方 fork。

本 fork 最初目標是加入 i18n 架構與繁體中文介面，但目前也包含 Docker / GHCR 發布流程、瀏覽器轉碼播放修正、播放進度 / Continue Watching 修正、更新來源調整，以及 release workflow 調整。

因此，本專案不再只是單純的「中文化版本」，而是帶有額外維護修正的 i18n fork。

本 fork 並非 upstream Seanime 官方版本，也不代表 upstream 專案立場。

## Fork 專屬變更

- 新增 i18n 架構與繁體中文介面
- 提供 GHCR Docker image
- Docker image 內建 FFmpeg / FFprobe，用於瀏覽器轉碼播放
- 修正 mediastream 轉碼播放穩定性問題
- 改善長距離 seek / 轉碼 loading 行為
- 修正 Continue Watching / 繼續觀看的播放進度選擇邏輯
- 每集獨立保存 resume progress
- 修正 ffprobe 子行程回收，避免 `<defunct>` zombie process
- Web UI / updater 的更新檢查改為使用本 fork 的 GitHub Releases
- 調整 release workflow，使 i18n 版本資產與 Docker publish 流程一致
- Docker publish 改為在 GitHub Release 發布後觸發

維護者若要了解 fork 專屬差異與 upstream 同步決策，請參考 [`docs/fork-deltas.md`](docs/fork-deltas.md) 與 [`docs/upstream-sync.md`](docs/upstream-sync.md)。

## 狀態與聲明

- 這是 Seanime 的非官方 fork。
- 本專案由 fork 維護者獨立管理。
- 本 fork 的行為可能與 upstream Seanime 不同。
- 本 fork 的更新檢查應以 [8tnomasu/seanime-i18n releases](https://github.com/8tnomasu/seanime-i18n/releases) 為準，而不是 upstream Seanime releases。
- Seanime 不提供、不託管、不散布任何媒體內容。
- 使用者需自行確認其媒體來源符合所在地法律。
- 本 fork 不移除原專案的授權、版權與法律聲明。

## 支援語言

| 語言代碼 | 語言 | 狀態 |
| --- | --- | --- |
| `en-US` | English | 預設 / fallback |
| `zh-TW` | 繁體中文（台灣） | 主要維護語言 |

## 使用方式

- Clone 本 fork。
- 依照原始 Seanime 的開發 / 建置說明執行，參考 [DEVELOPMENT_AND_BUILD.md](./DEVELOPMENT_AND_BUILD.md)。
- 啟動後可在設定頁切換語言。
- Docker 部署請參考 [docs/docker.md](./docs/docker.md)。
- release 流程請參考 [docs/release.md](./docs/release.md)。

## Docker 部署

本 fork 會將 Docker image 發佈到 GHCR：

```yaml
image: ghcr.io/8tnomasu/seanime-i18n:v3.7.1-i18n.1
```

正式部署建議使用固定版本 tag，不建議直接使用 `latest`。

官方 image 的 runtime 內建 FFmpeg 與 FFprobe，可直接用於瀏覽器轉碼播放。

## i18n 說明

主要 i18n 檔案位於：

- `seanime-web/src/i18n/`
- `seanime-web/src/i18n/locales/en-US.json`
- `seanime-web/src/i18n/locales/zh-TW.json`
- `seanime-web/src/i18n/labels.ts`

更多本地化說明請參考 [docs/i18n.md](./docs/i18n.md)。

## Upstream

本 fork 基於 5rahim 的 Seanime。

Upstream repository: [5rahim/seanime](https://github.com/5rahim/seanime)

## 授權

- 本 fork 仍遵循原專案的 GPL-3.0 授權。
- 原始授權與版權聲明必須保留。
- 詳見 [LICENSE](./LICENSE)。
