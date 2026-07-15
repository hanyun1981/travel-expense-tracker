// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyBK2FhH_A49a5W7-fvUJoeje7Euc7desLA",
  authDomain: "travel-expense-tracker-bf01b.firebaseapp.com",
  projectId: "travel-expense-tracker-bf01b",
  storageBucket: "travel-expense-tracker-bf01b.firebasestorage.app",
  messagingSenderId: "725288274454",
  appId: "1:725288274454:web:a1f926b22763c8b2b90337",
  measurementId: "G-DS8HE1LY9S"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const FieldValue = firebase.firestore.FieldValue;

// ===== Currency definitions =====
const CURRENCIES = [
  { code: 'TWD', name: '新台幣', flag: '🇹🇼' },
  { code: 'JPY', name: '日圓', flag: '🇯🇵' },
  { code: 'USD', name: '美元', flag: '🇺🇸' },
  { code: 'EUR', name: '歐元', flag: '🇪🇺' },
  { code: 'KRW', name: '韓元', flag: '🇰🇷' },
  { code: 'CNY', name: '人民幣', flag: '🇨🇳' },
  { code: 'HKD', name: '港幣', flag: '🇭🇰' },
  { code: 'THB', name: '泰銖', flag: '🇹🇭' },
  { code: 'GBP', name: '英鎊', flag: '🇬🇧' },
  { code: 'SGD', name: '新加坡幣', flag: '🇸🇬' },
  { code: 'MYR', name: '馬來西亞令吉', flag: '🇲🇾' },
  { code: 'VND', name: '越南盾', flag: '🇻🇳' },
  { code: 'AUD', name: '澳幣', flag: '🇦🇺' },
  { code: 'CAD', name: '加幣', flag: '🇨🇦' },
  { code: 'IDR', name: '印尼盾', flag: '🇮🇩' },
  { code: 'PHP', name: '菲律賓披索', flag: '🇵🇭' },
  { code: 'CHF', name: '瑞士法郎', flag: '🇨🇭' },
  { code: 'NZD', name: '紐西蘭幣', flag: '🇳🇿' },
];

const CATEGORY_ICONS = {
  general: '📝', food: '🍴', transport: '🚕',
  lodging: '🏨', ticket: '🎫', shopping: '🛍️'
};

const TRIP_EMOJIS = ['🏝️', '🗼', '🗽', '🏯', '🏔️', '🌋', '🌴', '🚆', '⛩️', '🎡', '🏖️', '🌅'];

// 精選封面照片（Unsplash 公開 CDN，可自由嵌入）
const COVER_PRESETS = [
  { label: '雪山湖泊（北海道/富士）', keywords: ['北海道','hokkaido','富士','fuji','雪','snow','日本','japan'],
    url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=80&auto=format&fit=crop' },
  { label: '日本紅葉古寺（京都）', keywords: ['京都','kyoto','古都','寺廟'],
    url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80&auto=format&fit=crop' },
  { label: '東京夜景', keywords: ['東京','tokyo'],
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80&auto=format&fit=crop' },
  { label: '熱帶海島（沖繩/峇里）', keywords: ['沖繩','okinawa','峇里','bali','海島','beach','海邊'],
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop' },
  { label: '泰國寺廟（曼谷/清邁）', keywords: ['泰國','thailand','曼谷','bangkok','清邁','chiangmai'],
    url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200&q=80&auto=format&fit=crop' },
  { label: '韓國首爾', keywords: ['韓國','korea','首爾','seoul'],
    url: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200&q=80&auto=format&fit=crop' },
  { label: '巴黎鐵塔', keywords: ['巴黎','paris','法國','france'],
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80&auto=format&fit=crop' },
  { label: '紐約曼哈頓', keywords: ['紐約','new york','美國','usa','america'],
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80&auto=format&fit=crop' },
  { label: '義大利羅馬', keywords: ['義大利','italy','羅馬','rome','威尼斯','venice'],
    url: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1200&q=80&auto=format&fit=crop' },
  { label: '雪山健行（瑞士/紐西蘭）', keywords: ['瑞士','switzerland','紐西蘭','new zealand','阿爾卑斯','alps','山'],
    url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80&auto=format&fit=crop' },
  { label: '熱帶叢林（峇里/越南）', keywords: ['越南','vietnam','叢林','rainforest'],
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80&auto=format&fit=crop' },
  { label: '都市夜景', keywords: ['city','都市'],
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80&auto=format&fit=crop' },
];

function autoCoverFor(tripName) {
  if (!tripName) return null;
  const lower = tripName.toLowerCase();
  for (const p of COVER_PRESETS) {
    if (p.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return p.url;
    }
  }
  return null;
}

const AVATAR_COLORS = [
  '#f97316', '#06b6d4', '#10b981', '#8b5cf6',
  '#ec4899', '#f59e0b', '#3b82f6', '#ef4444',
  '#06b6d4', '#84cc16', '#a855f7', '#f43f5e'
];

// ===== App state =====
const state = {
  user: null,
  trips: [],
  currentTrip: null,
  currentTripId: null,
  expenses: [],
  members: [],
  rates: {},
  unsubscribers: [],
  view: 'trips',
  expenseDraft: null,
  splitMode: 'equal',
  editingExpenseId: null,
  editingMemberId: null,
};

// ===== DOM helpers =====
const $ = (id) => document.getElementById(id);
const create = (tag, opts = {}) => {
  const el = document.createElement(tag);
  if (opts.className) el.className = opts.className;
  if (opts.text != null) el.textContent = opts.text;
  if (opts.html != null) el.innerHTML = opts.html;
  if (opts.attrs) for (const k in opts.attrs) el.setAttribute(k, opts.attrs[k]);
  if (opts.on) for (const evt in opts.on) el.addEventListener(evt, opts.on[evt]);
  return el;
};

function toast(msg, type = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  setTimeout(() => t.classList.add('hidden'), 2400);
  t.classList.remove('hidden');
}

function fmtNum(n, decimals = 2) {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toLocaleString('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

// 外幣換算成主要幣別。JPY→TWD 時無條件進位取整數
function toBase(amount, currency, baseCurrency, rate) {
  const raw = amount * rate;
  if (currency === 'JPY' && baseCurrency === 'TWD') return Math.ceil(raw);
  return Math.round(raw * 100) / 100;
}

// 用於分攤金額的換算（同上邏輯）
function splitToBase(splitAmt, currency, baseCurrency, rate) {
  return toBase(splitAmt, currency, baseCurrency, rate);
}

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  if (!name) return '?';
  return name.trim().slice(0, 2);
}

// 統一 avatar 渲染 — 有 avatarUrl 顯示圖片，否則顯示首字
function avatarMarkup(member, size = 38) {
  const sz = `width:${size}px;height:${size}px;font-size:${Math.max(11, Math.round(size * 0.38))}px`;
  if (member?.avatarUrl) {
    return `<div class="avatar" style="${sz}"><img src="${escapeHtml(member.avatarUrl)}" alt="" loading="lazy" /></div>`;
  }
  return `<div class="avatar" style="background:${colorFor(member?.name || '')};${sz}">${escapeHtml(initials(member?.name || '?'))}</div>`;
}

// 壓縮頭像到正方形（中心裁切），儲存為 data URL
function compressAvatarFile(file, size = 256, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const srcSize = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - srcSize) / 2;
      const sy = (img.naturalHeight - srcSize) / 2;
      // 白色底（透明 PNG 變白底）
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, size, size);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function tripEmoji(name) {
  if (!name) return '✈️';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  return TRIP_EMOJIS[Math.abs(hash) % TRIP_EMOJIS.length];
}

function tripTheme(name) {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  return Math.abs(hash) % 6;
}

const TRIP_GRADIENTS = [
  ['#fb923c', '#ec4899'],
  ['#06b6d4', '#3b82f6'],
  ['#10b981', '#14b8a6'],
  ['#8b5cf6', '#ec4899'],
  ['#f59e0b', '#ef4444'],
  ['#6366f1', '#06b6d4'],
];

// ===== Auth =====
function showLogin() {
  $('loading').classList.add('hidden');
  $('app-header').classList.add('hidden');
  $('login-screen').classList.remove('hidden');
  $('fab').classList.add('hidden');
  $('trips-view').classList.add('hidden');
  $('trip-detail-view').classList.add('hidden');
}

function hideLogin() {
  $('login-screen').classList.add('hidden');
  $('app-header').classList.remove('hidden');
}

function showLoginError(msg) {
  const el = $('login-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

async function handleGoogleSignIn() {
  const btn = $('google-signin-btn');
  btn.disabled = true;
  $('login-error').classList.add('hidden');
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await auth.signInWithPopup(provider);
  } catch (err) {
    console.error(err);
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/operation-not-supported-in-this-environment' ||
      err.code === 'auth/cancelled-popup-request'
    ) {
      try {
        await auth.signInWithRedirect(provider);
        return;
      } catch (e2) {
        showLoginError('登入失敗：' + (e2.message || e2.code));
        btn.disabled = false;
        return;
      }
    }
    let msg = err.message || '登入失敗';
    if (err.code === 'auth/popup-closed-by-user') msg = '視窗已關閉，請再試一次。';
    else if (err.code === 'auth/unauthorized-domain') msg = '此網域未授權。請到 Firebase Console → Authentication → Settings → Authorized domains 加入此網域。';
    else if (err.code === 'auth/operation-not-allowed') msg = '尚未啟用 Google 登入。請到 Firebase Console → Authentication → Sign-in method 啟用 Google。';
    showLoginError(msg);
    btn.disabled = false;
  }
}

async function handleLogout() {
  try {
    closeAllModals();
    clearSubs();
    state.user = null;
    state.trips = [];
    state.currentTrip = null;
    state.currentTripId = null;
    state.expenses = [];
    state.members = [];
    await auth.signOut();
  } catch (err) {
    toast('登出失敗：' + err.message, 'error');
  }
}

function updateUserUI() {
  const u = state.user;
  if (!u) return;
  const photo = u.photoURL || '';
  const name = u.displayName || u.email || '使用者';
  const email = u.email || '';
  if (photo) {
    $('user-avatar-img').src = photo;
    $('user-info-avatar').src = photo;
  } else {
    const initial = encodeURIComponent(name.slice(0, 1).toUpperCase());
    const fallback = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='%23f97316'/><text x='50%' y='55%' text-anchor='middle' fill='white' font-size='18' font-family='sans-serif' font-weight='700'>${initial}</text></svg>`;
    $('user-avatar-img').src = fallback;
    $('user-info-avatar').src = fallback;
  }
  $('user-info-name').textContent = name;
  $('user-info-email').textContent = email;
}

function startAuth() {
  auth.getRedirectResult().catch((err) => {
    console.error('Redirect sign-in error:', err);
    let msg = err.message || '登入失敗';
    if (err.code === 'auth/unauthorized-domain') msg = '此網域未授權。請到 Firebase Console → Authentication → Settings → Authorized domains 加入此網域。';
    else if (err.code === 'auth/operation-not-allowed') msg = '尚未啟用 Google 登入。';
    showLoginError(msg);
  });

  auth.onAuthStateChanged((u) => {
    if (u) {
      state.user = u;
      hideLogin();
      updateUserUI();
      bootstrap();
    } else {
      showLogin();
    }
  });
}

// ===== Firestore paths =====
// New shared paths: trips/{tripId}/...
function tripsCol() { return db.collection('trips'); }
function tripDoc(id) { return tripsCol().doc(id); }
function membersCol(tripId) { return tripDoc(tripId).collection('members'); }
function memberDoc(tripId, mid) { return membersCol(tripId).doc(mid); }
function expensesCol(tripId) { return tripDoc(tripId).collection('expenses'); }
function expenseDoc(tripId, eid) { return expensesCol(tripId).doc(eid); }
// Old per-user paths (only used for one-time migration)
function oldTripsCol() { return db.collection('users').doc(state.user.uid).collection('trips'); }

// ===== Bootstrap =====
async function bootstrap() {
  populateCurrencySelect($('trip-currency-input'));
  populateCurrencySelect($('exp-currency'));
  // Migrate old data once (silent if nothing to do)
  await migrateOldData();
  await loadTrips();
  // Auto-join if URL has ?trip=ID
  await handleJoinFromUrl();
  $('loading').classList.add('hidden');
  showTripsView();
}

// ===== Migration: 把舊的個人資料搬到新的共享格式 =====
async function migrateOldData() {
  try {
    const old = await oldTripsCol().get();
    if (old.empty) return;
    let count = 0;
    for (const oldDoc of old.docs) {
      const data = oldDoc.data();
      if (data._migratedTo) continue; // already migrated
      const newRef = await tripsCol().add({
        name: data.name || '未命名旅程',
        baseCurrency: data.baseCurrency || 'TWD',
        rates: data.rates || { [data.baseCurrency || 'TWD']: 1 },
        ownerUid: state.user.uid,
        ownerName: state.user.displayName || state.user.email || '使用者',
        memberUids: [state.user.uid],
        createdAt: data.createdAt || FieldValue.serverTimestamp(),
        totalAmount: data.totalAmount || 0,
        expenseCount: data.expenseCount || 0,
        memberCount: data.memberCount || 0,
      });

      const memSnap = await oldDoc.ref.collection('members').get();
      const memberMap = {};
      for (const m of memSnap.docs) {
        const newM = await membersCol(newRef.id).add(m.data());
        memberMap[m.id] = newM.id;
      }

      const expSnap = await oldDoc.ref.collection('expenses').get();
      for (const e of expSnap.docs) {
        const ed = e.data();
        const remappedSplits = (ed.splits || []).map((s) => ({
          ...s,
          memberId: memberMap[s.memberId] || s.memberId,
        }));
        await expensesCol(newRef.id).add({
          ...ed,
          payerId: memberMap[ed.payerId] || ed.payerId,
          splits: remappedSplits,
        });
      }

      await oldDoc.ref.update({ _migratedTo: newRef.id });
      count++;
    }
    if (count > 0) toast(`已將 ${count} 個舊旅程轉為可共享 ✓`, 'success');
  } catch (err) {
    console.error('Migration error:', err);
    // Silent failure — user might just be new
  }
}

// ===== Join trip via URL ?trip=ID =====
async function handleJoinFromUrl() {
  const params = new URLSearchParams(location.search);
  const tripId = params.get('trip');
  if (!tripId) return;
  history.replaceState({}, '', location.pathname);
  try {
    await tripDoc(tripId).update({
      memberUids: firebase.firestore.FieldValue.arrayUnion(state.user.uid),
    });
    toast('已加入旅程 🎉', 'success');
    setTimeout(() => openTrip(tripId), 600);
  } catch (err) {
    console.error('Join error:', err);
    toast('加入失敗：' + (err.message || '請確認連結正確'), 'error');
  }
}

async function joinTripById(input) {
  // Accept full URL or raw ID
  let tripId = input.trim();
  const m = tripId.match(/[?&]trip=([^&]+)/);
  if (m) tripId = decodeURIComponent(m[1]);
  if (!tripId) { toast('請輸入旅程 ID 或連結', 'error'); return; }
  try {
    await tripDoc(tripId).update({
      memberUids: firebase.firestore.FieldValue.arrayUnion(state.user.uid),
    });
    closeAllModals();
    toast('已加入旅程 🎉', 'success');
    setTimeout(() => openTrip(tripId), 600);
  } catch (err) {
    toast('加入失敗：' + (err.message || '請確認連結正確'), 'error');
  }
}

function clearSubs() {
  state.unsubscribers.forEach((u) => u());
  state.unsubscribers = [];
}

async function loadTrips() {
  const unsub = tripsCol()
    .where('memberUids', 'array-contains', state.user.uid)
    .onSnapshot((snap) => {
      state.trips = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort client-side (createdAt may be null briefly during write)
      state.trips.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
      });
      if (state.view === 'trips') renderTripsList();
    }, (err) => {
      console.error(err);
      toast('讀取失敗：' + err.message, 'error');
    });
  state.unsubscribers.push(unsub);
}

function userCanEditCurrentTrip() {
  return Boolean(state.user && state.currentTrip);
}

function userCanDeleteCurrentTrip() {
  if (!state.user || !state.currentTrip) return false;
  return state.currentTrip.ownerUid === state.user.uid;
}

// ===== Render: trips list =====
function renderTripsList() {
  const list = $('trips-list');
  list.innerHTML = '';

  // Hero stats
  const totalTrips = state.trips.length;
  const totalExpenses = state.trips.reduce((s, t) => s + (t.expenseCount || 0), 0);
  const totalMembers = state.trips.reduce((s, t) => s + (t.memberCount || 0), 0);
  $('hero-stats').innerHTML = `
    <span class="hero-stat">🗺️ ${totalTrips} 旅程</span>
    <span class="hero-stat">📋 ${totalExpenses} 筆支出</span>
    <span class="hero-stat">👥 ${totalMembers} 旅伴</span>
  `;

  if (state.trips.length === 0) {
    $('trips-empty').classList.remove('hidden');
    document.querySelector('.section-title').classList.add('hidden');
    return;
  }
  $('trips-empty').classList.add('hidden');
  document.querySelector('.section-title').classList.remove('hidden');

  state.trips.forEach((trip) => {
    const themeIdx = tripTheme(trip.name || '');
    const card = create('div', { className: 'trip-card', attrs: { 'data-theme': themeIdx } });
    card.addEventListener('click', () => openTrip(trip.id));

    const memberCount = (trip.memberCount ?? 0);
    const expenseCount = (trip.expenseCount ?? 0);
    const totalAmount = (trip.totalAmount ?? 0);
    const emoji = tripEmoji(trip.name || '');
    const cover = trip.coverImageUrl || autoCoverFor(trip.name);

    card.innerHTML = `
      <div class="trip-card-banner ${cover ? 'has-cover' : ''}">
        ${cover ? `<img class="trip-card-banner-img" src="${escapeHtml(cover)}" alt="" loading="lazy" />` : ''}
        <div class="trip-card-emoji">${emoji}</div>
      </div>
      <div class="trip-card-body">
        <div class="trip-card-name">${escapeHtml(trip.name)}</div>
        <div class="trip-card-meta">
          <span>👥 ${memberCount} 旅伴</span>
          <span class="dot"></span>
          <span>📋 ${expenseCount} 筆</span>
        </div>
        <div class="trip-card-bottom">
          <div>
            <div class="trip-card-currency">${trip.baseCurrency} 總計</div>
            <div class="trip-card-amount">${fmtNum(totalAmount)}</div>
          </div>
          <div class="trip-card-arrow">→</div>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

// ===== Open trip =====
async function openTrip(tripId) {
  state.currentTripId = tripId;
  clearSubs();

  const tripSnap = await tripDoc(tripId).get();
  if (!tripSnap.exists) { toast('旅程不存在', 'error'); showTripsView(); return; }
  state.currentTrip = { id: tripSnap.id, ...tripSnap.data() };
  state.rates = state.currentTrip.rates || {};

  state.unsubscribers.push(tripDoc(tripId).onSnapshot((snap) => {
    if (!snap.exists) return;
    state.currentTrip = { id: snap.id, ...snap.data() };
    state.rates = state.currentTrip.rates || {};
    renderTripDetail();
  }, (err) => {
    console.error('Trip load error:', err);
    toast('旅程讀取失敗：' + err.message, 'error');
  }));

  state.unsubscribers.push(membersCol(tripId).orderBy('createdAt', 'asc').onSnapshot((snap) => {
    state.members = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderTripDetail();
  }, (err) => {
    console.error('Members load error:', err);
    toast('成員讀取失敗：' + err.message, 'error');
  }));

  state.unsubscribers.push(
    expensesCol(tripId).orderBy('date', 'desc').onSnapshot((snap) => {
      state.expenses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Secondary sort by createdAt within the same date (client-side, no composite index needed)
      state.expenses.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
      });
      updateTripStats();
      renderTripDetail();
    }, (err) => {
      console.error('Expenses load error:', err);
      toast('支出讀取失敗：' + err.message, 'error');
    })
  );

  showTripDetailView();
}

async function updateTripStats() {
  if (!state.currentTrip) return;
  if (!userCanEditCurrentTrip()) return;
  const total = state.expenses.reduce((s, e) => s + (e.baseAmount || 0), 0);
  const count = state.expenses.length;
  const memberCount = state.members.length;
  if (total !== state.currentTrip.totalAmount || count !== state.currentTrip.expenseCount || memberCount !== state.currentTrip.memberCount) {
    try {
      await tripDoc(state.currentTripId).update({
        totalAmount: total,
        expenseCount: count,
        memberCount: memberCount,
      });
    } catch (e) { /* silent */ }
  }
}

// ===== Render: trip detail =====
function renderTripDetail() {
  if (!state.currentTrip) return;

  const themeIdx = tripTheme(state.currentTrip.name || '');
  const [from, to] = TRIP_GRADIENTS[themeIdx];
  const hero = $('trip-detail-hero');
  hero.style.setProperty('--theme-from', from);
  hero.style.setProperty('--theme-to', to);

  // Cover photo support
  const cover = state.currentTrip.coverImageUrl || autoCoverFor(state.currentTrip.name);
  const existingImg = hero.querySelector('.trip-detail-hero-img');
  if (cover) {
    hero.classList.add('has-cover');
    if (existingImg) existingImg.src = cover;
    else {
      const img = document.createElement('img');
      img.className = 'trip-detail-hero-img';
      img.src = cover;
      img.alt = '';
      img.loading = 'lazy';
      hero.insertBefore(img, hero.firstChild);
    }
  } else {
    hero.classList.remove('has-cover');
    if (existingImg) existingImg.remove();
  }

  $('trip-detail-emoji').textContent = tripEmoji(state.currentTrip.name || '');
  $('trip-name').textContent = state.currentTrip.name;
  $('trip-meta').textContent = `${state.members.length} 位旅伴 · 主要幣別 ${state.currentTrip.baseCurrency}`;

  const total = state.expenses.reduce((s, e) => s + (e.baseAmount || 0), 0);
  $('total-expense').textContent = `${state.currentTrip.baseCurrency} ${fmtNum(total)}`;
  $('expense-count').textContent = state.expenses.length;

  renderExpensesList();
  renderMembersList();
  renderSettlement();
  updateActionAvailability();
}

function renderExpensesList() {
  const container = $('expenses-list');
  container.innerHTML = '';
  const empty = $('expenses-empty');
  const canEdit = userCanEditCurrentTrip();

  if (state.expenses.length === 0) {
    empty.classList.remove('hidden');
    if (!canEdit) {
      $('expenses-empty-title').textContent = '還沒有支出';
      $('expenses-empty-text').textContent = '這趟旅程目前沒有支出紀錄';
      $('expenses-empty-action').classList.add('hidden');
    } else if (state.members.length === 0) {
      $('expenses-empty-title').textContent = '先邀請旅伴吧';
      $('expenses-empty-text').textContent = '加入夥伴後，就能開始記錄支出';
      $('expenses-empty-action').classList.remove('hidden');
    } else {
      $('expenses-empty-title').textContent = '還沒有支出';
      $('expenses-empty-text').textContent = '點右下角 + 新增第一筆';
      $('expenses-empty-action').classList.add('hidden');
    }
    return;
  }
  empty.classList.add('hidden');

  let lastDate = null;
  state.expenses.forEach((exp) => {
    if (exp.date !== lastDate) {
      lastDate = exp.date;
      container.appendChild(create('div', { className: 'date-divider', text: formatDate(exp.date) }));
    }
    const item = create('div', { className: 'expense-item' });
    if (canEdit) item.addEventListener('click', () => openExpenseModal(exp));
    const payerName = state.members.find((m) => m.id === exp.payerId)?.name || '?';
    const splitCount = (exp.splits || []).length;

    item.innerHTML = `
      <div class="expense-icon">${CATEGORY_ICONS[exp.category] || '📝'}</div>
      <div class="expense-info">
        <div class="expense-title">${escapeHtml(exp.title)}</div>
        <div class="expense-meta">${escapeHtml(payerName)} 付款 · ${splitCount} 人分攤</div>
      </div>
      <div class="expense-amount">
        ${state.currentTrip.baseCurrency} ${fmtNum(exp.baseAmount || 0)}
        ${exp.currency !== state.currentTrip.baseCurrency
          ? `<span class="expense-amount-foreign">${exp.currency} ${fmtNum(exp.amount)}</span>`
          : ''}
      </div>
    `;
    container.appendChild(item);
  });
}

function renderMembersList() {
  const container = $('members-list');
  container.innerHTML = '';
  const empty = $('members-empty');
  const canEdit = userCanEditCurrentTrip();
  $('add-member-btn').classList.toggle('hidden', !canEdit);
  if (state.members.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  state.members.forEach((m) => {
    const paidTotal = state.expenses
      .filter((e) => e.payerId === m.id)
      .reduce((s, e) => s + (e.baseAmount || 0), 0);
    const owedTotal = state.expenses.reduce((s, e) => {
      const split = (e.splits || []).find((sp) => sp.memberId === m.id);
      return s + (split?.baseAmount || 0);
    }, 0);

    const item = create('div', { className: 'member-item' });
    if (canEdit) item.addEventListener('click', () => openMemberModal(m));
    item.innerHTML = `
      ${avatarMarkup(m, 40)}
      <div style="flex:1">
        <div class="member-name">${escapeHtml(m.name)}</div>
        <div class="member-stats">已付 ${fmtNum(paidTotal)} · 應分 ${fmtNum(owedTotal)}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

// ===== Settlement calculation =====
function calculateSettlements() {
  if (state.members.length === 0) return { balances: [], settlements: [] };

  const balances = {};
  state.members.forEach((m) => { balances[m.id] = 0; });

  state.expenses.forEach((exp) => {
    if (balances[exp.payerId] != null) balances[exp.payerId] += (exp.baseAmount || 0);
    (exp.splits || []).forEach((sp) => {
      if (balances[sp.memberId] != null) balances[sp.memberId] -= (sp.baseAmount || 0);
    });
  });

  Object.keys(balances).forEach((k) => { balances[k] = Math.round(balances[k] * 100) / 100; });

  const balanceList = state.members.map((m) => ({
    id: m.id,
    name: m.name,
    balance: balances[m.id] || 0,
  }));

  const debtors = balanceList.filter((b) => b.balance < -0.005).map((b) => ({ ...b, balance: -b.balance }));
  const creditors = balanceList.filter((b) => b.balance > 0.005).map((b) => ({ ...b }));
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const settlements = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].balance, creditors[j].balance);
    settlements.push({
      from: debtors[i].name, fromId: debtors[i].id,
      to: creditors[j].name, toId: creditors[j].id,
      amount: Math.round(amt * 100) / 100,
    });
    debtors[i].balance -= amt;
    creditors[j].balance -= amt;
    if (debtors[i].balance < 0.005) i++;
    if (creditors[j].balance < 0.005) j++;
  }

  return { balances: balanceList, settlements };
}

function renderSettlement() {
  const { balances, settlements } = calculateSettlements();
  const total = state.expenses.reduce((s, e) => s + (e.baseAmount || 0), 0);
  const baseCurrency = state.currentTrip.baseCurrency;

  $('settle-summary').innerHTML = `
    <h3>本次旅程總支出</h3>
    <div class="big">${baseCurrency} ${fmtNum(total)}</div>
  `;

  const balContainer = $('balance-list');
  balContainer.innerHTML = '';
  if (balances.length === 0) {
    balContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><h3>請先新增旅伴</h3></div>';
  }
  balances.forEach((b) => {
    let cls = 'zero', prefix = '';
    if (b.balance > 0.005) { cls = 'positive'; prefix = '+ '; }
    else if (b.balance < -0.005) { cls = 'negative'; prefix = '- '; }
    const item = create('div', { className: 'balance-item' });
    const m = state.members.find((x) => x.id === b.id) || { name: b.name };
    item.innerHTML = `
      <div class="balance-name">
        ${avatarMarkup(m, 34)}
        ${escapeHtml(b.name)}
      </div>
      <div class="balance-amount ${cls}">${prefix}${baseCurrency} ${fmtNum(Math.abs(b.balance))}</div>
    `;
    balContainer.appendChild(item);
  });

  const settleContainer = $('settlements-list');
  settleContainer.innerHTML = '';
  if (settlements.length === 0) {
    settleContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><h3>已結清</h3><p>大家收支平衡，無需互轉</p></div>';
    return;
  }
  settlements.forEach((s) => {
    const item = create('div', { className: 'settlement-item' });
    const mFrom = state.members.find((x) => x.id === s.fromId) || { name: s.from };
    const mTo = state.members.find((x) => x.id === s.toId) || { name: s.to };
    item.innerHTML = `
      ${avatarMarkup(mFrom, 36)}
      <div class="settlement-from">${escapeHtml(s.from)}</div>
      <div class="settlement-arrow">→</div>
      <div class="settlement-to">
        ${escapeHtml(s.to)}
        <span class="settlement-amount">${baseCurrency} ${fmtNum(s.amount)}</span>
      </div>
      ${avatarMarkup(mTo, 36)}
    `;
    settleContainer.appendChild(item);
  });
}

// ===== Views =====
function showTripsView() {
  state.view = 'trips';
  state.currentTrip = null;
  state.currentTripId = null;
  clearSubs();
  loadTrips();
  $('trips-view').classList.remove('hidden');
  $('trip-detail-view').classList.add('hidden');
  $('back-btn').classList.add('hidden');
  $('header-action').classList.add('hidden');
  $('page-title').textContent = '旅遊記帳';
  $('fab').classList.remove('hidden');
}

function showTripDetailView() {
  state.view = 'detail';
  $('trips-view').classList.add('hidden');
  $('trip-detail-view').classList.remove('hidden');
  $('back-btn').classList.remove('hidden');
  $('header-action').classList.remove('hidden');
  $('page-title').textContent = state.currentTrip?.name || '旅程';
  updateActionAvailability();
  switchTab('expenses');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach((c) => c.classList.add('hidden'));
  $('tab-' + tab).classList.remove('hidden');
  if (tab === 'settle' || !userCanEditCurrentTrip()) $('fab').classList.add('hidden');
  else $('fab').classList.remove('hidden');
}

function updateActionAvailability() {
  const canEdit = userCanEditCurrentTrip();
  $('action-edit-trip').classList.toggle('hidden', !canEdit);
  $('action-rates').classList.toggle('hidden', !canEdit);
  $('action-delete-trip').classList.toggle('hidden', !userCanDeleteCurrentTrip());
}

// ===== Modals =====
function openModal(id) {
  $(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  $(id).classList.add('hidden');
  document.body.style.overflow = '';
}
function closeAllModals() {
  document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
  document.body.style.overflow = '';
}

// ===== Trip modal =====
function openTripModal(trip = null) {
  $('trip-modal-title').textContent = trip ? '編輯旅程' : '新增旅程';
  $('trip-name-input').value = trip?.name || '';
  $('trip-currency-input').value = trip?.baseCurrency || 'TWD';
  $('trip-members-input').value = '';
  $('trip-members-group').style.display = trip ? 'none' : '';
  $('trip-form').dataset.editId = trip?.id || '';
  openModal('trip-modal');
  setTimeout(() => $('trip-name-input').focus(), 100);
}

async function handleTripSubmit(e) {
  e.preventDefault();
  const id = $('trip-form').dataset.editId;
  const name = $('trip-name-input').value.trim();
  const baseCurrency = $('trip-currency-input').value;
  if (!name) return;

  try {
    if (id) {
      await tripDoc(id).update({ name, baseCurrency });
      toast('已更新');
      closeModal('trip-modal');
    } else {
      const docRef = await tripsCol().add({
        name,
        baseCurrency,
        rates: { [baseCurrency]: 1 },
        ownerUid: state.user.uid,
        ownerName: state.user.displayName || state.user.email || '使用者',
        memberUids: [state.user.uid],
        createdAt: FieldValue.serverTimestamp(),
        totalAmount: 0,
        expenseCount: 0,
        memberCount: 0,
      });
      const lines = $('trip-members-input').value.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const batch = db.batch();
        lines.forEach((nm) => {
          const mref = membersCol(docRef.id).doc();
          batch.set(mref, { name: nm, createdAt: FieldValue.serverTimestamp() });
        });
        await batch.commit();
      }
      toast('旅程已建立 ✈️', 'success');
      closeModal('trip-modal');
      // Auto-open the newly created trip so the user can immediately add members/expenses
      openTrip(docRef.id);
    }
  } catch (err) {
    console.error(err);
    toast('儲存失敗：' + err.message, 'error');
  }
}

// ===== Member modal =====
let memberAvatarDraft = null; // base64 data URL OR null OR 'KEEP' (no change)

function openMemberModal(member = null) {
  $('member-modal-title').textContent = member ? '編輯旅伴' : '新增旅伴';
  $('member-name-input').value = member?.name || '';
  $('member-form').dataset.editId = member?.id || '';
  $('delete-member-btn').classList.toggle('hidden', !member);

  memberAvatarDraft = 'KEEP';
  refreshAvatarPreview(member?.avatarUrl, member?.name || '?');
  openModal('member-modal');
  setTimeout(() => $('member-name-input').focus(), 100);
}

function refreshAvatarPreview(url, name) {
  const preview = $('member-avatar-preview');
  preview.innerHTML = '';
  preview.removeAttribute('style');
  if (url) {
    preview.style.width = '88px';
    preview.style.height = '88px';
    preview.innerHTML = `<img src="${escapeHtml(url)}" alt="" />`;
    $('remove-avatar-btn').classList.remove('hidden');
  } else {
    preview.style.cssText = `width:88px;height:88px;font-size:32px;background:${colorFor(name || '?')};`;
    preview.textContent = initials(name || '?');
    $('remove-avatar-btn').classList.add('hidden');
  }
}

async function handleAvatarFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { toast('檔案太大（>10MB）', 'error'); return; }
  try {
    const dataUrl = await compressAvatarFile(file);
    memberAvatarDraft = dataUrl;
    refreshAvatarPreview(dataUrl, $('member-name-input').value);
    e.target.value = '';
  } catch (err) {
    toast('處理圖片失敗：' + err.message, 'error');
  }
}

function handleAvatarRemove() {
  memberAvatarDraft = null; // 表示要移除
  refreshAvatarPreview(null, $('member-name-input').value);
}

async function handleMemberSubmit(e) {
  e.preventDefault();
  const name = $('member-name-input').value.trim();
  if (!name) return;
  const id = $('member-form').dataset.editId;
  const payload = { name };
  if (memberAvatarDraft === null) {
    payload.avatarUrl = firebase.firestore.FieldValue.delete();
  } else if (memberAvatarDraft && memberAvatarDraft !== 'KEEP') {
    payload.avatarUrl = memberAvatarDraft;
  }
  try {
    if (id) {
      await memberDoc(state.currentTripId, id).update(payload);
    } else {
      const data = { name, createdAt: FieldValue.serverTimestamp() };
      if (memberAvatarDraft && memberAvatarDraft !== 'KEEP') data.avatarUrl = memberAvatarDraft;
      await membersCol(state.currentTripId).add(data);
    }
    closeModal('member-modal');
    toast('已儲存');
  } catch (err) {
    if (err.code === 'invalid-argument' && /maximum/.test(err.message || '')) {
      toast('圖片太大，請選較小的照片', 'error');
    } else {
      toast('儲存失敗：' + err.message, 'error');
    }
  }
}

async function handleMemberDelete() {
  const id = $('member-form').dataset.editId;
  if (!id) return;
  const usedIn = state.expenses.filter((e) =>
    e.payerId === id || (e.splits || []).some((sp) => sp.memberId === id)
  );
  if (usedIn.length > 0) {
    if (!confirm(`這位旅伴已參與 ${usedIn.length} 筆支出。確定要移除嗎？`)) return;
  } else {
    if (!confirm('確定要移除這位旅伴？')) return;
  }
  try {
    await memberDoc(state.currentTripId, id).delete();
    closeModal('member-modal');
    toast('已移除');
  } catch (err) {
    toast('移除失敗：' + err.message, 'error');
  }
}

// ===== Expense modal =====
function openExpenseModal(expense = null) {
  if (state.members.length === 0) {
    toast('請先新增旅伴', 'error');
    switchTab('members');
    return;
  }
  state.editingExpenseId = expense?.id || null;
  $('expense-modal-title').textContent = expense ? '編輯支出' : '新增支出';
  $('exp-title').value = expense?.title || '';
  $('exp-amount').value = expense?.amount ?? '';
  $('exp-currency').value = expense?.currency || state.currentTrip.baseCurrency;
  $('exp-date').value = expense?.date || todayISO();
  $('exp-note').value = expense?.note || '';
  $('delete-expense-btn').classList.toggle('hidden', !expense);

  const cat = expense?.category || 'general';
  document.querySelectorAll('.cat-btn').forEach((b) => b.classList.toggle('active', b.dataset.cat === cat));

  renderPayerChips(expense?.payerId);

  state.splitMode = expense?.splitMode || 'equal';
  document.querySelectorAll('.split-mode').forEach((b) => b.classList.toggle('active', b.dataset.mode === state.splitMode));

  if (expense && expense.splits) {
    state.expenseDraft = {
      splits: state.members.map((m) => {
        const s = expense.splits.find((sp) => sp.memberId === m.id);
        return {
          memberId: m.id,
          included: !!s,
          value: s ? s.value : 1,
        };
      }),
    };
  } else {
    state.expenseDraft = {
      splits: state.members.map((m) => ({ memberId: m.id, included: true, value: state.splitMode === 'equal' ? 1 : 0 })),
    };
  }

  renderSplitList();
  updateRateDisplay();
  openModal('expense-modal');
  setTimeout(() => $('exp-title').focus(), 100);
}

function renderPayerChips(selectedId) {
  const c = $('payer-chips');
  c.innerHTML = '';
  state.members.forEach((m) => {
    const chip = create('div', {
      className: 'chip' + (m.id === selectedId ? ' active' : ''),
      attrs: { 'data-id': m.id },
    });
    const av = m.avatarUrl
      ? `<span class="chip-avatar chip-avatar-img"><img src="${escapeHtml(m.avatarUrl)}" alt=""/></span>`
      : `<span class="chip-avatar" style="background: ${colorFor(m.name)}">${escapeHtml(initials(m.name))}</span>`;
    chip.innerHTML = `${av}${escapeHtml(m.name)}`;
    chip.addEventListener('click', () => {
      document.querySelectorAll('#payer-chips .chip').forEach((c2) => c2.classList.remove('active'));
      chip.classList.add('active');
    });
    c.appendChild(chip);
  });
  if (!selectedId && state.members[0]) {
    c.firstChild.classList.add('active');
  }
}

function getSelectedPayerId() {
  const chip = document.querySelector('#payer-chips .chip.active');
  return chip ? chip.dataset.id : null;
}

function renderSplitList() {
  const c = $('split-list');
  c.innerHTML = '';
  state.expenseDraft.splits.forEach((sp) => {
    const member = state.members.find((m) => m.id === sp.memberId);
    if (!member) return;
    const row = create('div', { className: 'split-row' + (sp.included ? ' included' : '') });
    row.innerHTML = `
      <div class="split-checkbox">${sp.included ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</div>
      ${avatarMarkup(member, 30)}
      <div class="split-name">${escapeHtml(member.name)}</div>
      ${state.splitMode !== 'equal' ? `
        <input type="number" class="split-input" step="0.01" min="0" value="${sp.included ? sp.value : ''}" data-id="${sp.memberId}" inputmode="decimal" />
        <span class="split-input-suffix">${splitSuffix()}</span>
      ` : ''}
    `;
    row.querySelector('.split-checkbox').addEventListener('click', (e) => {
      e.stopPropagation();
      sp.included = !sp.included;
      if (sp.included && state.splitMode === 'equal') sp.value = 1;
      renderSplitList();
    });
    row.addEventListener('click', (e) => {
      if (e.target.closest('input')) return;
      sp.included = !sp.included;
      if (sp.included && state.splitMode === 'equal') sp.value = 1;
      renderSplitList();
    });
    if (state.splitMode !== 'equal') {
      const input = row.querySelector('input');
      input.addEventListener('input', (e) => {
        sp.value = parseFloat(e.target.value) || 0;
        sp.included = sp.value > 0 || sp.included;
        updateSplitSummary();
      });
      input.addEventListener('focus', () => {
        if (!sp.included) { sp.included = true; row.classList.add('included'); }
      });
    }
    c.appendChild(row);
  });
  updateSplitSummary();
}

function splitSuffix() {
  const cur = $('exp-currency').value;
  if (state.splitMode === 'amount') return cur;
  if (state.splitMode === 'percent') return '%';
  if (state.splitMode === 'share') return '份';
  return '';
}

function updateSplitSummary() {
  const summary = $('split-summary');
  const amount = parseFloat($('exp-amount').value) || 0;
  const included = state.expenseDraft.splits.filter((s) => s.included);
  if (included.length === 0) {
    summary.textContent = '請至少選擇一位分攤者';
    summary.className = 'split-summary error';
    return;
  }
  if (state.splitMode === 'equal') {
    const each = amount / included.length;
    summary.textContent = `${included.length} 人均分，每人 ${$('exp-currency').value} ${fmtNum(each)}`;
    summary.className = 'split-summary ok';
    return;
  }
  if (state.splitMode === 'amount') {
    const total = included.reduce((s, x) => s + (x.value || 0), 0);
    const diff = amount - total;
    if (Math.abs(diff) < 0.01) {
      summary.textContent = `分攤總計 ${fmtNum(total)} = 支出 ${fmtNum(amount)} ✓`;
      summary.className = 'split-summary ok';
    } else {
      summary.textContent = `分攤總計 ${fmtNum(total)}，差額 ${fmtNum(diff)}`;
      summary.className = 'split-summary error';
    }
    return;
  }
  if (state.splitMode === 'percent') {
    const total = included.reduce((s, x) => s + (x.value || 0), 0);
    const diff = 100 - total;
    if (Math.abs(diff) < 0.01) {
      summary.textContent = `比例總計 ${fmtNum(total)}% ✓`;
      summary.className = 'split-summary ok';
    } else {
      summary.textContent = `比例總計 ${fmtNum(total)}%，差 ${fmtNum(diff)}%`;
      summary.className = 'split-summary error';
    }
    return;
  }
  if (state.splitMode === 'share') {
    const total = included.reduce((s, x) => s + (x.value || 0), 0);
    if (total <= 0) {
      summary.textContent = '請輸入份數';
      summary.className = 'split-summary error';
      return;
    }
    summary.textContent = `總份數 ${fmtNum(total)}，每份 ${$('exp-currency').value} ${fmtNum(amount / total)}`;
    summary.className = 'split-summary ok';
  }
}

function computeFinalSplits(amount) {
  const included = state.expenseDraft.splits.filter((s) => s.included);
  const result = [];
  if (included.length === 0) return null;

  if (state.splitMode === 'equal') {
    const cents = Math.round(amount * 100);
    const baseCents = Math.floor(cents / included.length);
    let remainder = cents - baseCents * included.length;
    included.forEach((s, idx) => {
      const c = baseCents + (idx < remainder ? 1 : 0);
      result.push({ memberId: s.memberId, value: 1, amount: c / 100 });
    });
  } else if (state.splitMode === 'amount') {
    included.forEach((s) => result.push({ memberId: s.memberId, value: s.value, amount: s.value }));
  } else if (state.splitMode === 'percent') {
    included.forEach((s) => result.push({ memberId: s.memberId, value: s.value, amount: amount * s.value / 100 }));
  } else if (state.splitMode === 'share') {
    const total = included.reduce((sum, s) => sum + s.value, 0);
    included.forEach((s) => result.push({ memberId: s.memberId, value: s.value, amount: amount * s.value / total }));
  }
  return result;
}

async function handleExpenseSubmit(e) {
  e.preventDefault();
  const title = $('exp-title').value.trim();
  const amount = parseFloat($('exp-amount').value) || 0;
  const currency = $('exp-currency').value;
  const date = $('exp-date').value;
  const note = $('exp-note').value.trim();
  const category = document.querySelector('.cat-btn.active')?.dataset.cat || 'general';
  const payerId = getSelectedPayerId();

  if (!title || amount <= 0 || !payerId || !date) {
    toast('請填寫完整資訊', 'error');
    return;
  }

  const splits = computeFinalSplits(amount);
  if (!splits || splits.length === 0) {
    toast('請選擇分攤者', 'error');
    return;
  }

  if (state.splitMode === 'amount') {
    const total = splits.reduce((s, x) => s + x.amount, 0);
    if (Math.abs(total - amount) > 0.01) { toast('指定金額總和與支出不符', 'error'); return; }
  }
  if (state.splitMode === 'percent') {
    const total = splits.reduce((s, x) => s + x.value, 0);
    if (Math.abs(total - 100) > 0.01) { toast('比例總和不為 100%', 'error'); return; }
  }

  const rate = currency === state.currentTrip.baseCurrency ? 1 : (state.rates[currency] || 0);
  if (rate <= 0) {
    toast(`尚未設定 ${currency} 的匯率，請先到右上角選單 → 設定匯率`, 'error');
    return;
  }

  const baseAmount = toBase(amount, currency, state.currentTrip.baseCurrency, rate);
  const splitsWithBase = splits.map((s) => ({
    memberId: s.memberId,
    value: s.value,
    amount: Math.round(s.amount * 100) / 100,
    baseAmount: splitToBase(s.amount, currency, state.currentTrip.baseCurrency, rate),
  }));

  const data = {
    title,
    amount: Math.round(amount * 100) / 100,
    currency,
    rate,
    baseAmount: Math.round(baseAmount * 100) / 100,
    date,
    note,
    category,
    payerId,
    splitMode: state.splitMode,
    splits: splitsWithBase,
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    if (state.editingExpenseId) {
      await expenseDoc(state.currentTripId, state.editingExpenseId).update(data);
    } else {
      data.createdAt = FieldValue.serverTimestamp();
      await expensesCol(state.currentTripId).add(data);
    }
    closeModal('expense-modal');
    toast('已儲存 💰', 'success');
  } catch (err) {
    console.error(err);
    toast('儲存失敗：' + err.message, 'error');
  }
}

async function handleExpenseDelete() {
  if (!state.editingExpenseId) return;
  if (!confirm('確定要刪除這筆支出？')) return;
  try {
    await expenseDoc(state.currentTripId, state.editingExpenseId).delete();
    closeModal('expense-modal');
    toast('已刪除');
  } catch (err) {
    toast('刪除失敗：' + err.message, 'error');
  }
}

// ===== Rates modal =====
function openRatesModal() {
  $('rates-base').textContent = `主要結算幣別：${state.currentTrip.baseCurrency}（1 ${state.currentTrip.baseCurrency} = 1）`;
  renderRatesList();
  openModal('rates-modal');
}

function renderRatesList() {
  const c = $('rates-list');
  c.innerHTML = '';
  CURRENCIES.filter((cur) => cur.code !== state.currentTrip.baseCurrency).forEach((cur) => {
    const row = create('div', { className: 'rate-row' });
    const rate = state.rates[cur.code] || '';
    row.innerHTML = `
      <span class="currency-label">${cur.flag} ${cur.code}</span>
      <span class="currency-name">${cur.name}</span>
      <input type="number" step="0.000001" min="0" value="${rate}" data-cur="${cur.code}" placeholder="0" inputmode="decimal" />
    `;
    c.appendChild(row);
  });
}

async function saveRates() {
  const inputs = document.querySelectorAll('#rates-list input');
  const newRates = { [state.currentTrip.baseCurrency]: 1 };
  inputs.forEach((inp) => {
    const v = parseFloat(inp.value);
    if (v > 0) newRates[inp.dataset.cur] = v;
  });
  try {
    await tripDoc(state.currentTripId).update({ rates: newRates });
    closeModal('rates-modal');
    toast('匯率已儲存', 'success');
  } catch (err) {
    toast('儲存失敗：' + err.message, 'error');
  }
}

async function fetchRates() {
  const base = state.currentTrip.baseCurrency;
  toast('取得匯率中...');
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!res.ok) throw new Error('API 失敗');
    const data = await res.json();
    if (data.result !== 'success') throw new Error(data['error-type'] || '取得失敗');
    const inputs = document.querySelectorAll('#rates-list input');
    inputs.forEach((inp) => {
      const cur = inp.dataset.cur;
      if (data.rates[cur] && data.rates[cur] > 0) {
        inp.value = (1 / data.rates[cur]).toFixed(6);
      }
    });
    toast('已自動填入最新匯率', 'success');
  } catch (err) {
    console.error(err);
    toast('自動取得失敗，請手動輸入：' + err.message, 'error');
  }
}

function updateRateDisplay() {
  const cur = $('exp-currency').value;
  const display = $('rate-display');
  if (cur === state.currentTrip.baseCurrency) {
    display.classList.add('hidden');
    return;
  }
  const rate = state.rates[cur];
  if (!rate || rate <= 0) {
    display.classList.remove('hidden');
    display.className = 'rate-display warning';
    display.innerHTML = `⚠️ 尚未設定 ${cur} 匯率，請點右上角選單 → 設定匯率`;
  } else {
    const amt = parseFloat($('exp-amount').value) || 0;
    const baseCurrency = state.currentTrip.baseCurrency;
    const baseAmt = toBase(amt, cur, baseCurrency, rate);
    display.classList.remove('hidden');
    display.className = 'rate-display';
    const rounding = (cur === 'JPY' && baseCurrency === 'TWD') ? '（無條件進位）' : '';
    display.innerHTML = `💱 1 ${cur} = ${fmtNum(rate, 6)} ${baseCurrency}${amt > 0 ? ` · 約 ${baseCurrency} ${fmtNum(baseAmt, 0)}${rounding}` : ''}`;
  }
}

// ===== Helpers =====
function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function populateCurrencySelect(select) {
  select.innerHTML = '';
  CURRENCIES.forEach((c) => {
    const opt = create('option', { text: `${c.flag} ${c.code} ${c.name}`, attrs: { value: c.code } });
    select.appendChild(opt);
  });
}

// ===== Trip delete / export =====
async function deleteTrip() {
  if (!state.currentTripId) return;
  if (!confirm(`確定要刪除「${state.currentTrip.name}」？所有支出與成員都會被刪除，無法復原。`)) return;
  try {
    const [memSnap, expSnap] = await Promise.all([
      membersCol(state.currentTripId).get(),
      expensesCol(state.currentTripId).get(),
    ]);
    const batch = db.batch();
    memSnap.forEach((d) => batch.delete(d.ref));
    expSnap.forEach((d) => batch.delete(d.ref));
    batch.delete(tripDoc(state.currentTripId));
    await batch.commit();
    toast('已刪除');
    showTripsView();
  } catch (err) {
    toast('刪除失敗：' + err.message, 'error');
  }
}

// ===== Receipt OCR (Gemini Vision) =====
const AI_KEY_STORAGE = 'gemini_api_key';

function getAiKey() {
  return localStorage.getItem(AI_KEY_STORAGE) || '';
}

function openAiKeyModal() {
  const key = getAiKey();
  $('ai-key-input').value = key;
  $('clear-key-btn').classList.toggle('hidden', !key);
  openModal('ai-key-modal');
}

function saveAiKey() {
  const key = $('ai-key-input').value.trim();
  if (!key) { toast('請輸入 API key', 'error'); return; }
  if (!key.startsWith('AIza')) {
    if (!confirm('這看起來不像 Gemini API key（通常以 AIza 開頭），仍要儲存嗎？')) return;
  }
  localStorage.setItem(AI_KEY_STORAGE, key);
  toast('已儲存 ✓', 'success');
  closeModal('ai-key-modal');
}

function clearAiKey() {
  localStorage.removeItem(AI_KEY_STORAGE);
  $('ai-key-input').value = '';
  $('clear-key-btn').classList.add('hidden');
  toast('已清除');
}

function compressImage(file, maxSize = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          // iOS Safari canvas size limit ~4096px
          const limit = 4096;
          if (width > limit || height > limit) {
            const scale = Math.min(limit / width, limit / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas 不可用')); return; }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({
            base64: dataUrl.split(',')[1],
            mimeType: 'image/jpeg',
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('圖片載入失敗'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('檔案讀取失敗'));
    reader.readAsDataURL(file);
  });
}

async function callGeminiVision(base64, mimeType, apiKey) {
  const tripCurrency = state.currentTrip?.baseCurrency || 'TWD';
  const today = todayISO();
  const prompt = `這是一張收據或發票照片。請辨識出主要資訊，並回傳純 JSON（不要 markdown code block，不要其他文字）：
{
  "title": "商家或品項簡短名稱（中文，10 字內）",
  "amount": 總金額數字（不含貨幣符號）,
  "currency": "ISO 4217 三字母代碼，常見：TWD JPY USD EUR KRW CNY HKD THB GBP SGD MYR VND AUD CAD IDR PHP",
  "date": "YYYY-MM-DD 格式",
  "category": "food|transport|lodging|ticket|shopping|general 其中一項",
  "note": "其他補充（選填，例如店家地址）",
  "items": [ { "name": "品項名稱（中文，15 字內）", "qty": 數量, "amount": 該品項小計金額 } ]
}
規則：
- amount 必須是數字（例如 1234.56），不要加千分位或貨幣符號
- date 若收據沒寫，回傳 "${today}"
- currency 從收據幣別判斷；若無法判斷，回傳 "${tripCurrency}"
- category 按項目分類：餐廳食物=food、交通計程車車票=transport、飯店住宿=lodging、票券門票=ticket、購物商品=shopping、其他=general
- title 用中文，簡短描述（例如「拉麵店」「7-11」「地鐵車票」）
- items 是收據中明確列出的個別品項（例如：拉麵 280、餃子 80、可樂 50）。
  - 不要把「小計」「稅金」「服務費」「總計」「找零」等彙總列入。
  - 數量沒寫的話 qty 用 1。
  - 若收據沒有逐項列出（例如計程車收據只有總額、或單一項目），items 回傳空陣列 []。`;

  // Try models in order: latest first, then fallback
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastErr = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64 } }
        ]
      }],
      generationConfig: { temperature: 0.1 },
    };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        // Model not found → try next
        if (res.status === 404 || res.status === 400) {
          lastErr = new Error(`${model}: ${res.status}`);
          continue;
        }
        throw new Error(`API 錯誤 ${res.status}: ${errText.slice(0, 200)}`);
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('AI 沒有回傳結果');
      // Parse JSON from response (may be wrapped in markdown code block)
      const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        const m = cleaned.match(/\{[\s\S]*\}/);
        if (m) return JSON.parse(m[0]);
        throw new Error('無法解析 AI 回應');
      }
    } catch (err) {
      lastErr = err;
      // Only retry on model-not-found errors
      if (err.message && !err.message.includes('404') && !err.message.includes('400')) {
        throw err;
      }
    }
  }
  throw lastErr || new Error('所有 AI 模型均不可用');
}

function applyReceiptData(d) {
  if (!d) return;
  if (d.title) $('exp-title').value = d.title;
  if (d.amount != null) $('exp-amount').value = d.amount;
  if (d.currency) {
    const opt = [...$('exp-currency').options].find(o => o.value === d.currency);
    if (opt) $('exp-currency').value = d.currency;
  }
  if (d.date && /^\d{4}-\d{2}-\d{2}$/.test(d.date)) $('exp-date').value = d.date;
  if (d.category) {
    document.querySelectorAll('.cat-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.cat === d.category);
    });
  }
  if (d.note) {
    const noteField = $('exp-note');
    if (!noteField.value) noteField.value = d.note;
  }
  updateRateDisplay();
  updateSplitSummary();
}

async function handleReceiptFile(file) {
  if (!file) return;
  const key = getAiKey();
  if (!key) {
    toast('請先設定 Gemini API key', 'error');
    openAiKeyModal();
    return;
  }
  $('ai-scanning').classList.remove('hidden');
  try {
    const { base64, mimeType } = await compressImage(file);
    if (!base64) throw new Error('圖片壓縮失敗');
    const data = await callGeminiVision(base64, mimeType, key);
    if (!data || typeof data !== 'object') throw new Error('AI 回傳格式錯誤');
    // 若辨識出 2+ 個品項 → 跳出拆分視窗讓使用者選
    if (Array.isArray(data.items) && data.items.length >= 2) {
      $('ai-scanning').classList.add('hidden');
      openScanResultModal(data);
      return;
    }
    // 單筆 → 直接填入支出表單（原本行為）
    applyReceiptData(data);
    toast('辨識完成，請確認資料 ✨', 'success');
  } catch (err) {
    console.error('Receipt scan error:', err);
    let msg = err.message || '請再試一次';
    if (msg.includes('403')) msg = 'API key 無效或未啟用 Gemini API，請重新確認';
    else if (msg.includes('429')) msg = 'API 額度已滿，請稍後再試';
    else if (msg.includes('PERMISSION_DENIED')) msg = 'API key 權限不足，請確認已啟用 Generative Language API';
    toast('辨識失敗：' + msg, 'error');
  } finally {
    $('ai-scanning').classList.add('hidden');
    $('receipt-file').value = '';
  }
}

// ===== 拍照拆分品項 modal =====
let scanDraft = null; // { currency, date, category, total, items: [{name, qty, amount, checked}], payerId, splitterIds: Set }

function openScanResultModal(data) {
  const currency = data.currency || state.currentTrip.baseCurrency;
  const date = (data.date && /^\d{4}-\d{2}-\d{2}$/.test(data.date)) ? data.date : todayISO();
  scanDraft = {
    currency,
    date,
    category: data.category || 'general',
    total: data.amount || 0,
    title: data.title || '',
    note: data.note || '',
    items: (data.items || []).map((it) => ({
      name: String(it.name || '').slice(0, 30),
      qty: Number(it.qty) || 1,
      amount: Number(it.amount) || 0,
      checked: true,
    })),
    payerId: state.members[0]?.id || null,
    splitterIds: new Set(state.members.map((m) => m.id)),
  };

  // Render summary
  $('scan-summary').innerHTML = `
    <div>
      <div class="scan-summary-info">📅 ${escapeHtml(date)} · 收據總額</div>
      <div class="scan-summary-total">${escapeHtml(currency)} ${fmtNum(scanDraft.total)}</div>
    </div>
    <div class="scan-summary-info">${scanDraft.items.length} 個品項</div>
  `;

  // Set category
  document.querySelectorAll('#scan-category-grid .cat-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.cat === scanDraft.category);
  });

  renderScanItems();
  renderScanPayerChips();
  renderScanSplitterChips();

  // Close any other modal first (the expense modal is open behind us)
  closeModal('expense-modal');
  openModal('scan-result-modal');
}

function renderScanItems() {
  const c = $('scan-items-list');
  c.innerHTML = '';
  scanDraft.items.forEach((it, i) => {
    const row = create('div', { className: 'scan-item' + (it.checked ? ' checked' : '') });
    row.innerHTML = `
      <div class="scan-cb">${it.checked ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</div>
      <input class="scan-item-name" type="text" value="${escapeHtml(it.name)}" placeholder="品項名稱" />
      <input class="scan-item-amount" type="number" step="0.01" min="0" value="${it.amount}" inputmode="decimal" />
      <button type="button" class="scan-item-del" title="刪除">×</button>
    `;
    const cb = row.querySelector('.scan-cb');
    const nameInp = row.querySelector('.scan-item-name');
    const amtInp = row.querySelector('.scan-item-amount');
    const del = row.querySelector('.scan-item-del');

    cb.addEventListener('click', () => {
      it.checked = !it.checked;
      renderScanItems();
    });
    nameInp.addEventListener('input', (e) => { it.name = e.target.value; });
    amtInp.addEventListener('input', (e) => {
      it.amount = parseFloat(e.target.value) || 0;
      updateScanTotal();
    });
    del.addEventListener('click', () => {
      scanDraft.items.splice(i, 1);
      renderScanItems();
    });
    c.appendChild(row);
  });
  updateScanTotal();
}

function updateScanTotal() {
  const sum = scanDraft.items.filter((i) => i.checked).reduce((s, i) => s + (i.amount || 0), 0);
  const checked = scanDraft.items.filter((i) => i.checked).length;
  $('scan-items-total').innerHTML = `
    <span>勾選 ${checked} 筆，加總</span>
    <span>${scanDraft.currency} ${fmtNum(sum)}</span>
  `;
}

function renderScanPayerChips() {
  const c = $('scan-payer-chips');
  c.innerHTML = '';
  state.members.forEach((m) => {
    const isActive = m.id === scanDraft.payerId;
    const chip = create('div', { className: 'chip' + (isActive ? ' active' : '') });
    const av = m.avatarUrl
      ? `<span class="chip-avatar chip-avatar-img"><img src="${escapeHtml(m.avatarUrl)}" alt=""/></span>`
      : `<span class="chip-avatar" style="background: ${colorFor(m.name)}">${escapeHtml(initials(m.name))}</span>`;
    chip.innerHTML = `${av}${escapeHtml(m.name)}`;
    chip.addEventListener('click', () => {
      scanDraft.payerId = m.id;
      renderScanPayerChips();
    });
    c.appendChild(chip);
  });
}

function renderScanSplitterChips() {
  const c = $('scan-splitter-chips');
  c.innerHTML = '';
  state.members.forEach((m) => {
    const isActive = scanDraft.splitterIds.has(m.id);
    const chip = create('div', { className: 'chip' + (isActive ? ' active' : '') });
    const av = m.avatarUrl
      ? `<span class="chip-avatar chip-avatar-img"><img src="${escapeHtml(m.avatarUrl)}" alt=""/></span>`
      : `<span class="chip-avatar" style="background: ${colorFor(m.name)}">${escapeHtml(initials(m.name))}</span>`;
    chip.innerHTML = `${av}${escapeHtml(m.name)}`;
    chip.addEventListener('click', () => {
      if (scanDraft.splitterIds.has(m.id)) scanDraft.splitterIds.delete(m.id);
      else scanDraft.splitterIds.add(m.id);
      renderScanSplitterChips();
    });
    c.appendChild(chip);
  });
}

function scanToggleAllSplitters() {
  if (scanDraft.splitterIds.size === state.members.length) {
    scanDraft.splitterIds.clear();
  } else {
    scanDraft.splitterIds = new Set(state.members.map((m) => m.id));
  }
  renderScanSplitterChips();
}

function scanAddItem() {
  scanDraft.items.push({ name: '', qty: 1, amount: 0, checked: true });
  renderScanItems();
  // Focus the new item's name field
  setTimeout(() => {
    const rows = document.querySelectorAll('#scan-items-list .scan-item-name');
    rows[rows.length - 1]?.focus();
  }, 50);
}

function computeScanExpenseData(item) {
  const currency = scanDraft.currency;
  const baseCurrency = state.currentTrip.baseCurrency;
  const rate = currency === baseCurrency ? 1 : (state.rates[currency] || 0);
  if (rate <= 0) return null;
  const amount = Number(item.amount) || 0;
  const splitterIds = [...scanDraft.splitterIds];
  // Equal split with cents-distribution
  const cents = Math.round(amount * 100);
  const baseCents = Math.floor(cents / splitterIds.length);
  let remainder = cents - baseCents * splitterIds.length;
  const splits = splitterIds.map((mid, idx) => {
    const c = baseCents + (idx < remainder ? 1 : 0);
    const amt = c / 100;
    return {
      memberId: mid,
      value: 1,
      amount: Math.round(amt * 100) / 100,
      baseAmount: splitToBase(amt, currency, baseCurrency, rate),
    };
  });
  return {
    title: item.name || '收據品項',
    amount: Math.round(amount * 100) / 100,
    currency,
    rate,
    baseAmount: toBase(amount, currency, baseCurrency, rate),
    date: scanDraft.date,
    note: scanDraft.note || '',
    category: document.querySelector('#scan-category-grid .cat-btn.active')?.dataset.cat || scanDraft.category,
    payerId: scanDraft.payerId,
    splitMode: 'equal',
    splits,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

async function handleScanCreate(mergeAll = false) {
  if (!scanDraft) return;
  const checked = scanDraft.items.filter((i) => i.checked && i.amount > 0);
  if (!mergeAll && checked.length === 0) {
    toast('請至少勾選一個品項', 'error');
    return;
  }
  if (!scanDraft.payerId) { toast('請選付款人', 'error'); return; }
  if (scanDraft.splitterIds.size === 0) { toast('請選分攤者', 'error'); return; }

  const currency = scanDraft.currency;
  const rate = currency === state.currentTrip.baseCurrency ? 1 : (state.rates[currency] || 0);
  if (rate <= 0) {
    toast(`尚未設定 ${currency} 匯率，請先到右上選單 → 設定匯率`, 'error');
    return;
  }

  try {
    const batch = db.batch();
    let count = 0;
    if (mergeAll) {
      // Merge to single expense
      const mergedAmount = checked.length > 0
        ? checked.reduce((s, i) => s + i.amount, 0)
        : scanDraft.total;
      const mergedTitle = scanDraft.title || (checked[0]?.name) || '收據合計';
      const data = computeScanExpenseData({
        name: mergedTitle,
        amount: mergedAmount,
      });
      if (!data) { toast('匯率錯誤', 'error'); return; }
      const ref = expensesCol(state.currentTripId).doc();
      batch.set(ref, data);
      count = 1;
    } else {
      for (const item of checked) {
        const data = computeScanExpenseData(item);
        if (!data) { toast('匯率錯誤', 'error'); return; }
        const ref = expensesCol(state.currentTripId).doc();
        batch.set(ref, data);
        count++;
      }
    }
    await batch.commit();
    closeModal('scan-result-modal');
    scanDraft = null;
    toast(`已建立 ${count} 筆支出 💰`, 'success');
  } catch (err) {
    console.error(err);
    toast('儲存失敗：' + err.message, 'error');
  }
}

// ===== Cover photo picker =====
let coverDraft = null;

function openCoverModal() {
  if (!state.currentTrip) return;
  coverDraft = state.currentTrip.coverImageUrl || null;
  const grid = $('cover-grid');
  grid.innerHTML = '';
  COVER_PRESETS.forEach((p) => {
    const item = create('div', {
      className: 'cover-item' + (coverDraft === p.url ? ' active' : ''),
    });
    item.innerHTML = `
      <img src="${escapeHtml(p.url)}" alt="${escapeHtml(p.label)}" loading="lazy" />
      <div class="cover-item-label">${escapeHtml(p.label)}</div>
    `;
    item.addEventListener('click', () => {
      coverDraft = p.url;
      $('cover-url-input').value = p.url;
      document.querySelectorAll('.cover-item').forEach((x) => x.classList.remove('active'));
      item.classList.add('active');
    });
    grid.appendChild(item);
  });
  $('cover-url-input').value = coverDraft || '';
  $('cover-url-input').addEventListener('input', onCoverUrlInput);
  openModal('cover-modal');
}

function onCoverUrlInput(e) {
  coverDraft = e.target.value.trim() || null;
  document.querySelectorAll('.cover-item').forEach((item) => {
    const url = item.querySelector('img')?.src;
    item.classList.toggle('active', url === coverDraft);
  });
}

async function saveCover() {
  if (!state.currentTripId) return;
  try {
    await tripDoc(state.currentTripId).update({
      coverImageUrl: coverDraft || firebase.firestore.FieldValue.delete(),
    });
    closeModal('cover-modal');
    toast('封面已更新 🖼️', 'success');
  } catch (err) {
    toast('儲存失敗：' + err.message, 'error');
  }
}

async function clearCover() {
  if (!state.currentTripId) return;
  try {
    await tripDoc(state.currentTripId).update({
      coverImageUrl: firebase.firestore.FieldValue.delete(),
    });
    closeModal('cover-modal');
    toast('已移除封面');
  } catch (err) {
    toast('移除失敗：' + err.message, 'error');
  }
}

// ===== Share trip =====
function openShareModal() {
  if (!state.currentTrip) return;
  const url = `${location.origin}${location.pathname}?trip=${state.currentTripId}`;
  $('share-link-input').value = url;

  // Show shared user list
  const list = $('share-members-list');
  list.innerHTML = '';
  const memberUids = state.currentTrip.memberUids || [];
  memberUids.forEach((uid) => {
    const isOwner = uid === state.currentTrip.ownerUid;
    const isMe = uid === state.user.uid;
    const label = isOwner
      ? (isMe ? `你（${state.user.email || ''}）` : (state.currentTrip.ownerName || '建立者'))
      : (isMe ? `你（${state.user.email || ''}）` : `成員 ${uid.slice(0, 6)}…`);
    const row = create('div', { className: 'share-member-row' });
    row.innerHTML = `
      <span>👤</span>
      <span>${escapeHtml(label)}</span>
      ${isOwner ? '<span class="badge-owner">建立者</span>' : ''}
    `;
    list.appendChild(row);
  });
  openModal('share-modal');
}

async function copyShareLink() {
  const input = $('share-link-input');
  input.select();
  try {
    await navigator.clipboard.writeText(input.value);
    toast('連結已複製 📋', 'success');
  } catch (e) {
    document.execCommand('copy');
    toast('連結已複製', 'success');
  }
}

function openJoinModal() {
  $('join-input').value = '';
  openModal('join-modal');
  setTimeout(() => $('join-input').focus(), 100);
}

async function handleJoinSubmit(e) {
  e.preventDefault();
  const val = $('join-input').value.trim();
  if (!val) return;
  await joinTripById(val);
}

function exportTrip() {
  if (!state.currentTrip) return;
  const data = {
    trip: state.currentTrip,
    members: state.members,
    expenses: state.expenses,
    settlements: calculateSettlements(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.currentTrip.name}-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('已匯出');
}

// ===== Event bindings =====
function bindEvents() {
  $('google-signin-btn').addEventListener('click', handleGoogleSignIn);
  $('user-menu-btn').addEventListener('click', () => openModal('user-menu'));
  $('action-logout').addEventListener('click', handleLogout);

  $('back-btn').addEventListener('click', showTripsView);

  $('header-action').addEventListener('click', () => {
    if (state.view === 'detail') openModal('action-sheet');
  });

  $('fab').addEventListener('click', () => {
    if (state.view === 'trips') {
      openTripModal();
      return;
    }
    // Trip detail view
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
    if (activeTab === 'members') {
      openMemberModal();
    } else {
      // Expenses tab — if no members, take user to add member first
      if (state.members.length === 0) {
        switchTab('members');
        openMemberModal();
        toast('請先新增旅伴', 'error');
      } else {
        openExpenseModal();
      }
    }
  });

  $('empty-create-trip').addEventListener('click', () => openTripModal());
  $('expenses-empty-action').addEventListener('click', () => {
    switchTab('members');
    openMemberModal();
  });

  document.querySelectorAll('.tab-btn').forEach((b) => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });

  $('add-member-btn').addEventListener('click', () => openMemberModal());

  $('trip-form').addEventListener('submit', handleTripSubmit);
  $('expense-form').addEventListener('submit', handleExpenseSubmit);
  $('member-form').addEventListener('submit', handleMemberSubmit);
  $('upload-avatar-btn').addEventListener('click', () => $('member-avatar-file').click());
  $('member-avatar-file').addEventListener('change', handleAvatarFileChange);
  $('remove-avatar-btn').addEventListener('click', handleAvatarRemove);
  $('member-name-input').addEventListener('input', (e) => {
    // 即時更新預覽（若還沒換頭像）
    if (memberAvatarDraft === 'KEEP' || memberAvatarDraft === null) {
      const id = $('member-form').dataset.editId;
      const existing = id ? state.members.find((x) => x.id === id) : null;
      const url = memberAvatarDraft === 'KEEP' ? existing?.avatarUrl : null;
      refreshAvatarPreview(url, e.target.value);
    }
  });
  $('delete-expense-btn').addEventListener('click', handleExpenseDelete);
  $('delete-member-btn').addEventListener('click', handleMemberDelete);

  $('action-share-trip').addEventListener('click', () => { closeAllModals(); openShareModal(); });
  $('action-cover').addEventListener('click', () => { closeAllModals(); openCoverModal(); });
  $('save-cover-btn').addEventListener('click', saveCover);
  $('clear-cover-btn').addEventListener('click', clearCover);
  $('action-edit-trip').addEventListener('click', () => { closeAllModals(); openTripModal(state.currentTrip); });
  $('action-rates').addEventListener('click', () => { closeAllModals(); openRatesModal(); });
  $('action-export').addEventListener('click', () => { closeAllModals(); exportTrip(); });
  $('action-delete-trip').addEventListener('click', () => { closeAllModals(); deleteTrip(); });

  $('copy-link-btn').addEventListener('click', copyShareLink);
  $('join-trip-btn').addEventListener('click', openJoinModal);
  $('join-form').addEventListener('submit', handleJoinSubmit);

  // Receipt OCR
  $('action-ai-key').addEventListener('click', () => { closeAllModals(); openAiKeyModal(); });
  $('save-key-btn').addEventListener('click', saveAiKey);
  $('clear-key-btn').addEventListener('click', clearAiKey);
  $('scan-receipt-btn').addEventListener('click', () => {
    if (!getAiKey()) {
      toast('請先設定 Gemini API key', 'error');
      openAiKeyModal();
      return;
    }
    $('receipt-file').click();
  });
  $('receipt-file').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleReceiptFile(file);
  });

  // Scan result modal
  $('scan-create-btn').addEventListener('click', () => handleScanCreate(false));
  $('scan-merge-btn').addEventListener('click', () => handleScanCreate(true));
  $('scan-add-item-btn').addEventListener('click', scanAddItem);
  $('scan-toggle-all-btn').addEventListener('click', scanToggleAllSplitters);
  document.querySelectorAll('#scan-category-grid .cat-btn').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#scan-category-grid .cat-btn').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
    });
  });

  $('save-rates-btn').addEventListener('click', saveRates);
  $('fetch-rates-btn').addEventListener('click', fetchRates);

  document.querySelectorAll('.close-modal').forEach((el) => {
    el.addEventListener('click', closeAllModals);
  });
  document.querySelectorAll('.modal').forEach((m) => {
    m.addEventListener('click', (e) => {
      if (e.target === m) closeAllModals();
    });
  });

  document.querySelectorAll('.cat-btn').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
    });
  });

  document.querySelectorAll('.split-mode').forEach((b) => {
    b.addEventListener('click', () => {
      state.splitMode = b.dataset.mode;
      document.querySelectorAll('.split-mode').forEach((x) => x.classList.toggle('active', x.dataset.mode === state.splitMode));
      state.expenseDraft.splits.forEach((s) => {
        if (state.splitMode === 'equal') s.value = 1;
        else if (state.splitMode === 'percent') s.value = s.included ? Math.round(100 / state.expenseDraft.splits.filter(x => x.included).length * 100) / 100 : 0;
        else s.value = 0;
      });
      renderSplitList();
    });
  });

  $('exp-amount').addEventListener('input', () => { updateRateDisplay(); updateSplitSummary(); });
  $('exp-currency').addEventListener('change', () => { updateRateDisplay(); renderSplitList(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });
}

// ===== Boot =====
bindEvents();
startAuth();
