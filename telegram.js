'use strict';

/* =====================================================================
   Telegram: avval xabar (sendMessage), keyin PDF fayl (sendDocument).
   Xato boʻlsa false qaytaradi — foydalanuvchi PDF olishiga xalaqit bermaydi.
   ===================================================================== */

const TELEGRAM_TIMEOUT = 10000;

function telegramXabari(n, j, lid) {
  const st = STATUSLAR[n.status];
  const diqqat = n.status !== 'yashil' && n.oshganlar.length
    ? n.oshganlar.map(function (g) { return g.qisqa + ' ' + formatFoiz(g.ulush) + ' (meʼyor ' + g.meyor + '%)'; }).join(', ')
    : (n.tushum <= 0 ? 'tushum kiritilmagan' : 'yoʻq');
  const qatorlar = [
    '💰 Yangi byudjet · ' + oyNomi(j.oy),
    'Filial: ' + lid.filial,
    'Masʼul: ' + lid.ism,
    'Tel: ' + lid.telKorinish,
    'Tushum: ' + formatSon(n.tushum),
    'Xarajat: ' + formatSon(n.jami),
    'Foyda: ' + formatSon(n.foyda) + ' (' + formatFoiz(n.marja) + ')',
    'Status: ' + st.belgi + ' ' + st.nom,
    'Diqqat: ' + diqqat
  ];
  const izoh = j.katta_xarajat === 'ha' ? String(j.katta_izoh || '').trim() : '';
  if (izoh) qatorlar.push('Katta xarajat: ' + izoh);
  qatorlar.push('Kod: ' + lid.kod);
  return qatorlar.join('\n');
}

async function sorov(url, body) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const taymer = ctrl ? setTimeout(function () { ctrl.abort(); }, TELEGRAM_TIMEOUT) : null;
  try {
    const javob = await fetch(url, { method: 'POST', body: body, signal: ctrl ? ctrl.signal : undefined });
    const d = await javob.json();
    return !!(d && d.ok);
  } finally {
    if (taymer) clearTimeout(taymer);
  }
}

async function yuborTelegram(n, j, lid, blob, faylNomi) {
  const c = window.CONFIG || {};
  const token = String(c.TELEGRAM_BOT_TOKEN || '').trim();
  const chat = String(c.TELEGRAM_CHAT_ID || '').trim();
  if (!token || !chat) return false;
  const asos = 'https://api.telegram.org/bot' + token;

  try {
    // Oddiy forma koʻrinishida yuboriladi — brauzer qoʻshimcha ruxsat soʻrovisiz joʻnatadi.
    const xabar = new URLSearchParams();
    xabar.append('chat_id', chat);
    xabar.append('text', telegramXabari(n, j, lid));
    if (!(await sorov(asos + '/sendMessage', xabar))) return false;

    const fd = new FormData();
    fd.append('chat_id', chat);
    fd.append('document', blob, faylNomi);
    fd.append('caption', lid.filial + ' · ' + oyNomi(j.oy) + ' · ' + lid.kod);
    return await sorov(asos + '/sendDocument', fd);
  } catch (err) {
    console.warn('Telegramʼga yuborilmadi:', err);
    return false;
  }
}
