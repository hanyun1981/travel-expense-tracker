# 旅遊記帳 Travel Split

一個多幣別、可自訂分攤方式的旅遊記帳網頁應用，介面為繁體中文。

## 功能

- ✅ **多旅程管理**：建立多個旅程，每個旅程獨立記帳。
- ✅ **多成員**：每個旅程可加入任意成員，新增、編輯、移除。
- ✅ **多幣別**：支援 18 種常用幣別，每筆支出可單獨選擇幣別。
- ✅ **匯率換算**：可手動設定匯率，或一鍵自動從網路取得最新匯率（open.er-api.com，免註冊）。
- ✅ **彈性分攤**：
  - 均分（Equal）
  - 指定金額（Custom amount）
  - 指定比例（%）
  - 份數（Shares）
- ✅ **分攤者可不同**：每筆支出可選擇不同的分攤對象與不同的金額/比例。
- ✅ **結算最佳化**：使用貪婪演算法計算最少筆數的轉帳建議（誰要給誰多少）。
- ✅ **即時同步**：使用 Firebase Firestore 即時更新。
- ✅ **匿名登入**：第一次開啟自動匿名登入（每位使用者的資料獨立）。
- ✅ **匯出 JSON**：可匯出整個旅程資料。
- ✅ **行動裝置友善**：響應式設計，支援手機。

## 啟動方式

### 1. 直接打開
此專案為純前端，可直接打開 `index.html`。但因為使用 ES Module，建議用一個簡單的本地伺服器：

```bash
cd /Users/hanyunchiang/Desktop/travel-expense-app
python3 -m http.server 8080
# 然後打開 http://localhost:8080
```

或使用 `npx serve`：
```bash
npx serve .
```

### 2. 部署到 Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# 選擇現有專案 travel-expense-tracker-bf01b
# public 目錄填 .（目前資料夾），不要重寫成 SPA，不要覆寫 index.html
firebase deploy
```

## Firebase 設定

### 1. 啟用 Google 登入
到 Firebase Console → Authentication → Sign-in method → 啟用 **Google**，
並填寫專案的支援電子郵件。

### 1-1. 加入授權網域
到 Authentication → Settings → **Authorized domains**，確認包含：
- `localhost`（本地開發）
- 你的 Hosting 網域（部署後）

> ⚠️ **直接雙擊 file://** 的限制：Google 登入彈出視窗會被 Chrome 封鎖（因為 file:// 不被視為可信來源）。
> 因此使用 Google 登入時建議：
> 1. 用本地伺服器啟動：`python3 -m http.server 8080`
> 2. 或部署到 Firebase Hosting

### 2. 啟用 Firestore
到 Firebase Console → Firestore Database → 建立資料庫（建議選擇靠近的區域，例如 asia-east1）。

### 3. 部署安全規則
規則檔已在 `firestore.rules`：

```bash
firebase deploy --only firestore:rules
```

或直接到 Firebase Console → Firestore → 規則，貼上 `firestore.rules` 的內容。

## 資料結構

```
users/
  {uid}/
    trips/
      {tripId}/
        - name
        - baseCurrency       // 主要幣別
        - rates              // { CUR: rateToBase, ... }
        - totalAmount, expenseCount, memberCount
        - createdAt
        members/
          {memberId}/ - name, createdAt
        expenses/
          {expenseId}/
            - title, amount, currency, rate, baseAmount
            - date, note, category
            - payerId
            - splitMode  ('equal' | 'amount' | 'percent' | 'share')
            - splits: [ { memberId, value, amount, baseAmount } ]
```

## 結算邏輯

對每位成員計算 `付出總額 - 應分攤總額` 得到淨餘額；
正數代表別人欠他、負數代表他欠別人。
然後用「最大欠款 → 最大應收」配對轉帳，產生最少筆數的結算建議。

## 注意事項

- 此專案採匿名登入，**清除瀏覽器資料後 uid 會改變**，原本的旅程不會跟著（但仍存在於 Firebase）。如需多裝置同步，可改寫成電子郵件登入。
- 匯率自動取得使用 [open.er-api.com](https://open.er-api.com)，每日更新一次，免費免註冊。
- 所有金額存儲後皆換算為主要幣別供結算使用，外幣金額也會保留。
