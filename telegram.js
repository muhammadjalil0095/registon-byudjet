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
    : (n.tushum <= 0 ? 'tushum kiritilmagan' : n.jami <= 0 ? 'xarajat kiritilmagan' : 'yoʻq');
  const qatorlar = [
    (lid.yangilangan ? '♻️ Yangilangan byudjet · ' : '💰 Yangi byudjet · ') + oyNomi(j.oy),
    'Filial: ' + lid.filial,
    'Masʼul: ' + lid.ism,
    'Tel: ' + lid.telKorinish,
    'Tushum: ' + formatSon(n.tushum),
    'Xarajat: ' + formatSon(n.jami),
    'Foyda: ' + formatSon(n.foyda) + ' (' + formatFoiz(n.marja) + ')',
    'Status: ' + st.belgi + ' ' + st.nom,
    'Diqqat: ' + diqqat
  ];
  n.ogohlar.forEach(function (o) { qatorlar.push('⚠️ ' + o); });
  const izoh = j.katta_xarajat === 'ha' ? String(j.katta_izoh || '').trim() : '';
  if (izoh) qatorlar.push('Katta xarajat: ' + izoh);
  qatorlar.push('Kod: ' + lid.kod);
  return qatorlar.join('\n');
}

// Natija: { ok: true } yoki { ok: false, sabab: '…' } — sabab ekranda koʻrsatiladi.
async function sorov(url, body) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const taymer = ctrl ? setTimeout(function () { ctrl.abort(); }, TELEGRAM_TIMEOUT) : null;
  try {
    const javob = await fetch(url, { method: 'POST', body: body, signal: ctrl ? ctrl.signal : undefined });
    let d = null;
    try { d = await javob.json(); } catch (err) { /* JSON emas */ }
    if (d && d.ok) return { ok: true };
    return { ok: false, sabab: 'Telegram rad etdi: ' + ((d && d.description) || ('HTTP ' + javob.status)) };
  } catch (err) {
    if (err && err.name === 'AbortError') {
      return { ok: false, sabab: 'Telegram ' + (TELEGRAM_TIMEOUT / 1000) + ' soniyada javob bermadi (internet sekin).' };
    }
    return { ok: false, sabab: 'Telegram serveriga ulanib boʻlmadi — internet yoki tarmoq api.telegram.org ni toʻsyapti.' };
  } finally {
    if (taymer) clearTimeout(taymer);
  }
}

// config.js ni brauzer keshini chetlab, yangidan oʻqiydi — kalit keyin qoʻshilgan
// yoki almashtirilgan boʻlsa ham telefon eski nusxani ishlatib qolmasin.
async function yangiSozlama() {
  const c = Object.assign({}, window.CONFIG || {});
  try {
    const javob = await fetch('config.js?t=' + Date.now(), { cache: 'no-store' });
    if (javob.ok) {
      const matn = await javob.text();
      ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'].forEach(function (kalit) {
        const m = matn.match(new RegExp(kalit + '\\s*:\\s*["\']([^"\']*)["\']'));
        if (m && m[1].trim()) c[kalit] = m[1];
      });
    }
  } catch (err) { /* tarmoq xatosi — sahifadagi sozlama ishlatiladi */ }
  return c;
}

async function yuborTelegram(n, j, lid, blob, faylNomi) {
  const c = await yangiSozlama();
  const token = String(c.TELEGRAM_BOT_TOKEN || '').trim();
  const chat = String(c.TELEGRAM_CHAT_ID || '').trim();
  if (!token || !chat) return { ok: false, sabab: 'Saytda bot kaliti yoki guruh ID si sozlanmagan.' };
  const asos = 'https://api.telegram.org/bot' + token;

  // Oddiy forma koʻrinishida yuboriladi — brauzer qoʻshimcha ruxsat soʻrovisiz joʻnatadi.
  const xabar = new URLSearchParams();
  xabar.append('chat_id', chat);
  xabar.append('text', telegramXabari(n, j, lid));
  const r1 = await sorov(asos + '/sendMessage', xabar);
  if (!r1.ok) {
    console.warn('Telegram xabar:', r1.sabab);
    return r1;
  }

  const fd = new FormData();
  fd.append('chat_id', chat);
  fd.append('document', blob, faylNomi);
  fd.append('caption', lid.filial + ' · ' + oyNomi(j.oy) + ' · ' + lid.kod);
  const r2 = await sorov(asos + '/sendDocument', fd);
  if (!r2.ok) {
    console.warn('Telegram PDF:', r2.sabab);
    return { ok: false, sabab: 'Xabar guruhga ketdi, lekin PDF ketmadi. ' + r2.sabab };
  }
  return { ok: true };
}
