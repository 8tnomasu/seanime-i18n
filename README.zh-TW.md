# Seanime i18n

Seanime 的非官方多語系 fork，初期以繁體中文（zh-TW）作為主要維護語言。

[English](./README.md)

---

## 專案定位

本專案是 Seanime 的非官方 fork，並非官方版本。
原始專案： https://github.com/5rahim/seanime

本 fork 由個人獨立維護，目標是為 Seanime 建立一套可長期維護的 i18n / 多語系架構。

---

## 重要聲明

Seanime 不提供、不託管、不散布任何媒體內容。
使用者需自行確認其媒體來源符合所在地法律。

本 fork 不改變原專案對媒體來源與法律責任的立場，
也不移除任何授權、版權或法律聲明。

---

## 這個 Fork 做了什麼

* 建立前端 i18n 架構
* 保留 `en-US` 作為預設與 fallback 語言
* 新增繁體中文（zh-TW）語系
* 提供語言偏好設定

目前已接入 i18n 的主要區域：

* App shell / 導覽
* 設定頁
* 媒體庫 / 列表頁
* 動畫 / 漫畫詳情頁
* 播放器 UI
* 下載 / Torrent / Debrid UI
* 整合功能 / 離線同步
* 共用 dialogs / toasts / error states

---

## 支援語言

| 語言代碼  | 語言       | 狀態            |
| ----- | -------- | ------------- |
| en-US | English  | 預設 / fallback |
| zh-TW | 繁體中文（台灣） | 主要維護語言        |

---

## 使用方式

1. Clone 本 fork
2. 依照原始 Seanime 專案的 build 流程啟動（參考 `DEVELOPMENT_AND_BUILD.md`）
3. 啟動後於設定中切換語言

原專案請參考：
https://github.com/5rahim/seanime

---

## 開發與翻譯

語系相關檔案：

```
seanime-web/src/i18n/
seanime-web/src/i18n/locales/en-US.json
seanime-web/src/i18n/locales/zh-TW.json
seanime-web/src/i18n/labels.ts
```

規則：

* `en-US` 為預設與 fallback 語言
* `zh-TW` 為繁體中文語系
* React 使用 `useTranslation()`
* hook / toast / 非 React 使用 `i18n.t(...)`
* 新增 key 時需同步更新 en-US 與 zh-TW

詳細說明見 `docs/i18n.md`

---

## 翻譯原則

* 使用台灣慣用繁體中文

* 不使用簡體中文

* 技術名稱（如 Seanime、AniList、Torrent、Debrid、MPV、FFmpeg）保留英文

* 不翻譯：

  * 作品標題
  * 檔名、路徑
  * hash / token
  * provider 名稱
  * 外部 API 回傳內容

* 不在 component 中硬寫中文，所有 UI 文案應透過 i18n key 管理

---

## 授權

本 fork 遵循原專案 GPL-3.0 授權。
保留所有原始授權與版權聲明。

詳見 `LICENSE`

---

## 與原專案關係

本 fork 為獨立維護專案。

目前沒有計畫將 i18n 變更回 upstream。
未來可能視情況同步原專案更新。
