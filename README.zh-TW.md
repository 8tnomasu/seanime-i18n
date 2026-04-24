[English](./README.md)

# Seanime i18n

Seanime 的非官方多語系 fork，初期以繁體中文 `zh-TW` 作為主要維護語言。

## 專案定位

- 本專案是 Seanime 的非官方 fork。
- 本專案不是 Seanime 官方版本。
- 原始專案為 [5rahim/seanime](https://github.com/5rahim/seanime)。
- 本 fork 由我自行維護。
- 本專案目標是為 Seanime 加入可維護的 i18n / 多語系架構。

## 重要聲明

- Seanime 不提供、不託管、不散布任何媒體內容。
- 使用者需自行確認媒體來源符合所在地法律。
- 本 fork 不改變 Seanime 原本的媒體來源責任聲明。
- 本 fork 不移除原專案的授權、版權與法律聲明。

## 這個 Fork 做了什麼

- 新增前端 i18n 架構。
- 保留 `en-US` 作為預設與 fallback 語言。
- 新增繁體中文 `zh-TW` 語系。
- 新增語言偏好設定。
- 主要 UI 區域已接入 i18n：
  - App shell / 導覽
  - 設定頁
  - 媒體庫 / 列表頁
  - 動畫 / 漫畫詳情頁
  - 播放器 UI
  - 下載 / Torrent / Debrid UI
  - 整合功能 / 離線同步
  - 共用 dialogs / toasts / error states

## 支援語言

| 語言代碼 | 語言 | 狀態 |
| --- | --- | --- |
| `en-US` | English | 預設 / fallback |
| `zh-TW` | 繁體中文（台灣） | 主要維護語言 |

## 使用方式

- clone 本 fork
- 依照原始 Seanime 專案的開發 / build 流程啟動，請參考 [DEVELOPMENT_AND_BUILD.md](./DEVELOPMENT_AND_BUILD.md)
- 啟動後到 UI 設定中切換語言

如需查看原專案內容，請參考 [5rahim/seanime](https://github.com/5rahim/seanime)。

## 開發與翻譯

語系與相關檔案位於：

- `seanime-web/src/i18n/`
- `seanime-web/src/i18n/locales/en-US.json`
- `seanime-web/src/i18n/locales/zh-TW.json`
- `seanime-web/src/i18n/labels.ts`

目前規則：

- `en-US.json` 是預設與 fallback 語言來源。
- `zh-TW.json` 是繁體中文語系。
- React component 使用 `useTranslation()`。
- hook、toast、非 React 模組可使用 `i18n.t(...)`。
- 新增 key 時要同步補 `en-US` 與 `zh-TW`。

更多 i18n 維護說明可參考 [docs/i18n.md](./docs/i18n.md)。

## 翻譯原則

- 使用台灣慣用繁體中文。
- 不使用簡體中文。
- Seanime、AniList、Torrent、Debrid、MPV、FFmpeg 等技術名稱原則上保留英文。
- 不翻譯作品標題、檔名、路徑、hash、token、provider 名稱、外部 API 回傳內容。
- 不在 component 中硬寫中文，所有 UI 文案應走 i18n key。

## 授權

- 本 fork 遵循原專案 GPL-3.0 授權。
- 保留原專案授權與版權聲明。
- 詳見 [LICENSE](./LICENSE)。

## 與原專案關係

- 本 fork 獨立維護。
- 目前沒有打算將 i18n 變更 PR 回原始 Seanime repo。
- 未來可視情況同步 upstream 更新。
