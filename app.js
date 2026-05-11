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

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  if (!name) return '?';
  return name.trim().slice(0, 2);
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

    card.innerHTML = `
      <div class="trip-card-banner">
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
  }));

  state.unsubscribers.push(membersCol(tripId).orderBy('createdAt', 'asc').onSnapshot((snap) => {
    state.members = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderTripDetail();
  }));

  state.unsubscribers.push(
    expensesCol(tripId).orderBy('date', 'desc').orderBy('createdAt', 'desc').onSnapshot((snap) => {
      state.expenses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      updateTripStats();
      renderTripDetail();
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
      <div class="avatar" style="background: ${colorFor(m.name)}">${escapeHtml(initials(m.name))}</div>
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
    item.innerHTML = `
      <div class="balance-name">
        <div class="avatar" style="background: ${colorFor(b.name)}; width: 34px; height: 34px; font-size: 13px">${escapeHtml(initials(b.name))}</div>
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
    item.innerHTML = `
      <div class="avatar" style="background: ${colorFor(s.from)}; width: 36px; height: 36px; font-size: 13px">${escapeHtml(initials(s.from))}</div>
      <div class="settlement-from">${escapeHtml(s.from)}</div>
      <div class="settlement-arrow">→</div>
      <div class="settlement-to">
        ${escapeHtml(s.to)}
        <span class="settlement-amount">${baseCurrency} ${fmtNum(s.amount)}</span>
      </div>
      <div class="avatar" style="background: ${colorFor(s.to)}; width: 36px; height: 36px; font-size: 13px">${escapeHtml(initials(s.to))}</div>
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
function openMemberModal(member = null) {
  $('member-modal-title').textContent = member ? '編輯旅伴' : '新增旅伴';
  $('member-name-input').value = member?.name || '';
  $('member-form').dataset.editId = member?.id || '';
  $('delete-member-btn').classList.toggle('hidden', !member);
  openModal('member-modal');
  setTimeout(() => $('member-name-input').focus(), 100);
}

async function handleMemberSubmit(e) {
  e.preventDefault();
  const name = $('member-name-input').value.trim();
  if (!name) return;
  const id = $('member-form').dataset.editId;
  try {
    if (id) {
      await memberDoc(state.currentTripId, id).update({ name });
    } else {
      await membersCol(state.currentTripId).add({ name, createdAt: FieldValue.serverTimestamp() });
    }
    closeModal('member-modal');
    toast('已儲存');
  } catch (err) {
    toast('儲存失敗：' + err.message, 'error');
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
    chip.innerHTML = `
      <span class="chip-avatar" style="background: ${colorFor(m.name)}">${escapeHtml(initials(m.name))}</span>
      ${escapeHtml(m.name)}
    `;
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
      <div class="avatar" style="background: ${colorFor(member.name)}; width: 30px; height: 30px; font-size: 12px">${escapeHtml(initials(member.name))}</div>
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

  const baseAmount = amount * rate;
  const splitsWithBase = splits.map((s) => ({
    memberId: s.memberId,
    value: s.value,
    amount: Math.round(s.amount * 100) / 100,
    baseAmount: Math.round(s.amount * rate * 100) / 100,
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
    const baseAmt = amt * rate;
    display.classList.remove('hidden');
    display.className = 'rate-display';
    display.innerHTML = `💱 1 ${cur} = ${fmtNum(rate, 6)} ${state.currentTrip.baseCurrency}${amt > 0 ? ` · 約 ${state.currentTrip.baseCurrency} ${fmtNum(baseAmt)}` : ''}`;
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
  $('delete-expense-btn').addEventListener('click', handleExpenseDelete);
  $('delete-member-btn').addEventListener('click', handleMemberDelete);

  $('action-share-trip').addEventListener('click', () => { closeAllModals(); openShareModal(); });
  $('action-edit-trip').addEventListener('click', () => { closeAllModals(); openTripModal(state.currentTrip); });
  $('action-rates').addEventListener('click', () => { closeAllModals(); openRatesModal(); });
  $('action-export').addEventListener('click', () => { closeAllModals(); exportTrip(); });
  $('action-delete-trip').addEventListener('click', () => { closeAllModals(); deleteTrip(); });

  $('copy-link-btn').addEventListener('click', copyShareLink);
  $('join-trip-btn').addEventListener('click', openJoinModal);
  $('join-form').addEventListener('submit', handleJoinSubmit);

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
