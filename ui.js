'use strict';

/* =====================================================================
   Ekranlar: Landing → Filial maʼlumotlari → 15 savol → Natija.
   Natija ochilishi bilan byudjet Moliya boʻlimiga avtomatik yuboriladi, PDF — tugma bilan.
   Hisob-kitob app.js da (hisobla), PDF — pdf.js, Telegram — telegram.js.
   ===================================================================== */

const SAVOLLAR_SONI = 15;
const SAQLASH_KALITI = 'registon-byudjet-v1';
const OPERATORLAR = ['20', '33', '50', '55', '77', '88', '90', '91', '93', '94', '95', '97', '98', '99'];

const EKRANLAR = {
  1: { tur: 'oy', sarlavha: 'Byudjet qaysi oy uchun?', izoh: 'Byudjet har doim keyingi oy uchun tuziladi.' },
  2: { tur: 'son', id: 'oquvchilar', sarlavha: 'Rejadagi faol oʻquvchilar soni', yorliq: 'Faol oʻquvchilar',
    birlik: 'nafar', izoh: 'Joriy oy oxiridagi faol oʻquvchilar + kutilayotgan yangilar.' },
  3: { tur: 'son', id: 'tolov', sarlavha: 'Bir oʻquvchining oʻrtacha oylik toʻlovi', yorliq: 'Oʻrtacha oylik toʻlov',
    birlik: 'soʻm', tushum: true },
  4: { tur: 'guruh', sarlavha: 'Ish haqi', izoh: 'Avans va oylik qoʻshilib shu oyning ish haqi fondini beradi.' },
  5: { tur: 'soliq', sarlavha: 'Ijtimoiy soliq',
    izoh: 'Ish haqi fondining ' + SOLIQ_FOIZI + '% i avtomatik hisoblandi. Toʻgʻri boʻlsa, tasdiqlab keyingisiga oʻting.' },
  6: { tur: 'guruh', sarlavha: 'Bonuslar' },
  7: { tur: 'guruh', sarlavha: 'Bino', izoh: 'Kommunal — shu byudjet oyiga tegishli summa.' },
  8: { tur: 'guruh', sarlavha: 'Aloqa va bank' },
  9: { tur: 'guruh', sarlavha: 'Ofis va xoʻjalik' },
  10: { tur: 'guruh', sarlavha: 'Marketing' },
  11: { tur: 'guruh', sarlavha: 'Taʼmir' },
  12: { tur: 'guruh', sarlavha: 'Boshqa xarajatlar' },
  13: { tur: 'tanlov', id: 'maqsad', sarlavha: 'Bu oy filialning asosiy maqsadi', variantlar: 'maqsad' },
  14: { tur: 'tanlov', id: 'ozgarish', sarlavha: 'Oʻtgan oyga nisbatan jami xarajat', variantlar: 'ozgarish' },
  15: { tur: 'tanlov', id: 'katta_xarajat', sarlavha: 'Rejadan tashqari katta xarajat bormi?', variantlar: 'hayoq' }
};

const holat = {
  ekran: 'bosh',
  javob: yangiJavob(),
  lid: { filial: '', ism: '', tel: '' },
  saqlanganEkran: null,
  natija: null,
  pdf: null,
  tg: null,
  tgSabab: '',
  yuborilgan: null,       // { imzo, kod } — oxirgi yuborilgan byudjet (takror yubormaslik uchun)
  formadanKeyin: null     // filial formasidan keyin qaysi ekranga oʻtish
};

let ilova;

/* ---------- Yordamchilar ---------- */

function yangiJavob() {
  const d = new Date();
  return { oy: oyKodi(d.getFullYear(), d.getMonth() + 1), markaziy: 'yoq' };
}

function oyVariantlari() {
  const d = new Date();
  const royxat = [];
  for (let i = 0; i <= 6; i++) royxat.push(oyKodi(d.getFullYear(), d.getMonth() + i));
  if (royxat.indexOf(holat.javob.oy) === -1) royxat.unshift(holat.javob.oy);
  return royxat;
}

function e(s) {
  return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function raqamlar(s) {
  return String(s || '').replace(/\D/g, '');
}

function moddalarEkrani(n) {
  return MODDALAR.filter(function (m) { return m.ekran === n; });
}

function inputQiymati(id) {
  const v = holat.javob[id];
  return v === undefined || v === null || v === '' ? '' : formatSon(v);
}

// Kiritilayotgan summani "1 500 000" koʻrinishiga keltiradi, kursorni joyida saqlaydi.
function summaniFormatla(el, maxRaqam) {
  const eski = el.value;
  const kursor = el.selectionStart === null ? eski.length : el.selectionStart;
  const oldingiRaqamlar = raqamlar(eski.slice(0, kursor)).length;
  const r = raqamlar(eski).replace(/^0+(?=\d)/, '').slice(0, maxRaqam || 12);
  const yangi = r === '' ? '' : formatSon(Number(r));
  el.value = yangi;
  if (document.activeElement === el) {
    let i = 0;
    let sanoq = 0;
    while (i < yangi.length && sanoq < oldingiRaqamlar) {
      if (/\d/.test(yangi[i])) sanoq++;
      i++;
    }
    try { el.setSelectionRange(i, i); } catch (err) { /* ayrim brauzerlarda mumkin emas */ }
  }
  return r === '' ? undefined : Number(r);
}

function telFormat(r) {
  const q = [r.slice(0, 2), r.slice(2, 5), r.slice(5, 7), r.slice(7, 9)].filter(Boolean);
  return q.join(' ');
}

function telTozala(qiymat) {
  let r = raqamlar(qiymat);
  if (r.length > 9 && r.indexOf('998') === 0) r = r.slice(3);
  return r.slice(0, 9);
}

function lidXatolari() {
  const l = holat.lid;
  const r = raqamlar(l.tel);
  return {
    filial: l.filial.trim().length >= 3 ? '' : 'Filial nomini toʻliq yozing (kamida 3 belgi).',
    ism: l.ism.trim().length >= 2 ? '' : 'Ismingizni yozing (kamida 2 belgi).',
    tel: r.length === 9 && OPERATORLAR.indexOf(r.slice(0, 2)) !== -1 ? '' : 'Raqamni +998 XX XXX XX XX koʻrinishida kiriting.'
  };
}

function byudjetKodi(oy) {
  const nnnn = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return 'BUD-' + oy.slice(2, 4) + oy.slice(5, 7) + '-' + nnnn;
}

function pdfFaylNomi(filial, oy) {
  const toza = filial
    .replace(/[ʻʼ'‘’`]/g, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return 'Byudjet_' + toza + '_' + oy + '.pdf';
}

function bugun() {
  const d = new Date();
  return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
}

function saqla() {
  try {
    if (holat.ekran !== 'bosh') {
      localStorage.setItem(SAQLASH_KALITI, JSON.stringify({
        ekran: holat.ekran, javob: holat.javob, lid: holat.lid, yuborilgan: holat.yuborilgan
      }));
    }
  } catch (err) { /* xususiy rejimda saqlanmaydi — muhim emas */ }
}

function yukla() {
  try {
    const s = JSON.parse(localStorage.getItem(SAQLASH_KALITI) || 'null');
    if (s && s.javob && s.ekran) {
      holat.javob = Object.assign(yangiJavob(), s.javob);
      holat.lid = Object.assign(holat.lid, s.lid || {});
      holat.yuborilgan = s.yuborilgan || null;
      holat.saqlanganEkran = s.ekran;
    }
  } catch (err) { /* eʼtiborsiz */ }
}

/* ---------- Ekranlarni chizish ---------- */

function korsat(ekran, fokus) {
  holat.ekran = ekran;
  saqla();
  let html;
  if (ekran === 'bosh') html = boshSahifa();
  else if (typeof ekran === 'number') html = savolEkrani(ekran);
  else if (ekran === 'natija') html = natijaEkrani();
  else html = formaEkrani();
  ilova.innerHTML = html;
  document.body.setAttribute('data-ekran', typeof ekran === 'number' ? 'savol' : ekran);
  if (typeof ekran === 'number') jonliYangila(ekran);
  if (ekran === 'forma') formaHolati(false);
  if (ekran === 'natija') avtoYuborish();
  window.scrollTo(0, 0);
  if (fokus !== false) {
    const h = ilova.querySelector('h1');
    if (h) h.focus({ preventScroll: true });
  }
}

function boshSahifa() {
  const muddat = window.CONFIG && String(window.CONFIG.MUDDAT || '').trim();
  const s = holat.saqlanganEkran;
  let davom = '';
  if (s && s !== 'bosh') {
    const qayer = typeof s === 'number' ? s + ' / ' + SAVOLLAR_SONI : s === 'forma' ? 'filial maʼlumotlari' : 'natija';
    davom = '<button type="button" class="tugma ikkinchi" data-amal="davom">Davom etish: ' + qayer + '</button>';
  }
  return '' +
    '<section class="ekran bosh">' +
      '<h1 tabindex="-1">Filialingiz byudjetini <span class="urgu">7 daqiqada</span> tuzing</h1>' +
      '<p class="lead">Javob bering, tizim hisoblaydi, Moliya boʻlimi darhol koʻradi.</p>' +
      '<h2 class="kichik">Natijada olasiz</h2>' +
      '<ul class="olasiz">' +
        '<li>Jami byudjet</li>' +
        '<li>Xarajatlarning moddalar boʻyicha taqsimoti</li>' +
        '<li>Meʼyordan oshgan xarajatlar</li>' +
        '<li>Imzolanadigan PDF</li>' +
      '</ul>' +
      (muddat ? '<p class="muddat">Topshirish muddati: <strong>' + e(muddat) + '</strong></p>' : '') +
      '<div class="harakatlar">' +
        '<button type="button" class="tugma asosiy" data-amal="boshlash">Byudjetni tuzishni boshlash</button>' +
        davom +
      '</div>' +
      '<div class="ishonch">' +
        '<p class="ishonch-raqam">60 filial · 30 xarajat moddasi · bitta standart</p>' +
        '<p>Summalar faqat sizning telefoningizda hisoblanadi, Moliya boʻlimiga faqat yakuniy byudjet yuboriladi.</p>' +
      '</div>' +
    '</section>';
}

function progress(n) {
  const foiz = Math.round(n / SAVOLLAR_SONI * 100);
  return '' +
    '<div class="progress">' +
      '<span class="progress-matn" aria-hidden="true">' + n + ' / ' + SAVOLLAR_SONI + '</span>' +
      '<div class="progress-chiziq" role="progressbar" aria-label="Soʻrovnoma: ' + SAVOLLAR_SONI + ' ta savoldan ' + n + '-savol" ' +
        'aria-valuemin="0" aria-valuemax="' + SAVOLLAR_SONI + '" aria-valuenow="' + n + '">' +
        '<span style="width:' + foiz + '%"></span>' +
      '</div>' +
    '</div>';
}

function summaMaydoni(m, qiymat, yashirin) {
  const izohId = m.izoh ? 'iz-' + m.id : '';
  return '' +
    '<div class="maydon" data-maydon="' + m.id + '"' + (yashirin ? ' hidden' : '') + '>' +
      '<label for="m-' + m.id + '">' + e(m.nom) + '</label>' +
      (m.izoh ? '<p class="maydon-izoh" id="' + izohId + '">' + e(m.izoh) + '</p>' : '') +
      '<div class="kiritish">' +
        '<input id="m-' + m.id + '" name="' + m.id + '" data-summa type="text" inputmode="numeric" autocomplete="off" ' +
          'enterkeyhint="next" placeholder="0" value="' + e(qiymat) + '"' + (izohId ? ' aria-describedby="' + izohId + '"' : '') + '>' +
        '<span class="birlik" aria-hidden="true">' + e(m.birlik || 'soʻm') + '</span>' +
      '</div>' +
    '</div>';
}

function tanlovGuruhi(nom, variantlar, tanlangan, yorliqId) {
  return '' +
    '<div class="variantlar" role="radiogroup"' + (yorliqId ? ' aria-labelledby="' + yorliqId + '"' : '') + '>' +
      variantlar.map(function (v) {
        return '<label class="variant"><input type="radio" name="' + nom + '" value="' + v.v + '"' +
          (tanlangan === v.v ? ' checked' : '') + '><span>' + e(v.t) + '</span></label>';
      }).join('') +
    '</div>';
}

function savolEkrani(n) {
  const ek = EKRANLAR[n];
  const j = holat.javob;
  let tana = '';

  if (ek.tur === 'oy') {
    tana = '' +
      '<div class="maydon">' +
        '<label for="oy">Byudjet oyi</label>' +
        '<div class="tanlash"><select id="oy" name="oy">' +
          oyVariantlari().map(function (k) {
            return '<option value="' + k + '"' + (k === j.oy ? ' selected' : '') + '>' + oyNomi(k) + '</option>';
          }).join('') +
        '</select></div>' +
      '</div>';
  } else if (ek.tur === 'son') {
    tana = summaMaydoni({ id: ek.id, nom: ek.yorliq, birlik: ek.birlik }, inputQiymati(ek.id));
    if (ek.tushum) tana += '<p class="jonli" data-jonli="tushum" aria-live="polite"></p>';
  } else if (ek.tur === 'guruh') {
    tana = moddalarEkrani(n).filter(function (m) { return !m.shart; }).map(function (m) {
      return summaMaydoni(m, inputQiymati(m.id)) +
        (m.id === 'oqituvchi_avans' ? '<p class="jonli" data-jonli="oqituvchi" aria-live="polite"></p>' : '');
    }).join('');
    if (n === 12) {
      const avaz = MODDALAR.find(function (m) { return m.id === 'avaz_aka'; });
      tana += '' +
        '<div class="savolcha">' +
          '<p class="savolcha-matn" id="markaziy-savol">Filialingiz Chilonzor, Yakkasaroy yoki Shirinmi?</p>' +
          tanlovGuruhi('markaziy', TANLOVLAR.hayoq, j.markaziy, 'markaziy-savol') +
        '</div>' +
        summaMaydoni(avaz, inputQiymati('avaz_aka'), j.markaziy !== 'ha');
    }
    tana += '<p class="guruh-jami">Guruh jami: <strong data-jonli="guruh">0 soʻm</strong></p>';
  } else if (ek.tur === 'soliq') {
    const n0 = hisobla(j);
    const qiymat = j.soliq_qolda ? inputQiymati('soliq') : formatSon(n0.soliqAvto);
    tana = '' +
      '<div class="soliq-hisob">' +
        '<p><span>Ish haqi fondi</span><strong>' + formatSom(n0.fond) + '</strong></p>' +
        '<p><span>× ' + SOLIQ_FOIZI + '%</span><strong>' + formatSom(n0.soliqAvto) + '</strong></p>' +
      '</div>' +
      summaMaydoni({ id: 'soliq', nom: 'Ijtimoiy soliq summasi' }, qiymat) +
      '<p class="ogoh" data-jonli="soliq-ogoh" hidden>Soliq summasi ish haqi fondining ' + SOLIQ_FOIZI + '% iga mos emas.</p>' +
      '<button type="button" class="tugma matnli" data-amal="soliq-avto" hidden>Avtomatik summaga qaytarish</button>';
  } else if (ek.tur === 'tanlov') {
    tana = tanlovGuruhi(ek.id, TANLOVLAR[ek.variantlar], j[ek.id], 'sarlavha');
    if (n === 15) {
      tana += '' +
        '<div class="maydon" data-maydon="katta_izoh"' + (j.katta_xarajat === 'ha' ? '' : ' hidden') + '>' +
          '<label for="katta_izoh">Qanday xarajat va nima uchun?</label>' +
          '<textarea id="katta_izoh" name="katta_izoh" rows="4" maxlength="500" required>' + e(j.katta_izoh) + '</textarea>' +
        '</div>';
    }
  }

  return '' +
    '<form class="ekran savol" data-n="' + n + '" novalidate>' +
      progress(n) +
      '<h1 id="sarlavha" tabindex="-1">' + e(ek.sarlavha) + '</h1>' +
      (ek.izoh ? '<p class="izoh">' + e(ek.izoh) + '</p>' : '') +
      (ek.tur === 'guruh' ? '<button type="button" class="tugma matnli yoq" data-amal="yoq">Bu oy bu xarajat yoʻq</button>' : '') +
      '<div class="maydonlar">' + tana + '</div>' +
      '<p class="xato" role="alert" hidden></p>' +
      '<div class="pastki">' +
        '<button type="button" class="tugma ikkinchi" data-amal="orqaga">Orqaga</button>' +
        '<button type="submit" class="tugma asosiy">' + (n === SAVOLLAR_SONI ? 'Natijani koʻrish' : 'Keyingisi') + '</button>' +
      '</div>' +
    '</form>';
}

function natijaEkrani() {
  const n = holat.natija = hisobla(holat.javob);
  const st = STATUSLAR[n.status];
  const oshgan = n.oshganlar.length
    ? n.oshganlar.length + ' ta: ' + n.oshganlar.map(function (g) { return g.qisqa; }).join(', ')
    : 'yoʻq';
  return '' +
    '<section class="ekran natija">' +
      '<p class="ustki">' + e(holat.lid.filial) + ' · ' + e(oyNomi(holat.javob.oy)) + ' byudjeti</p>' +
      '<h1 tabindex="-1">Natija</h1>' +
      '<div class="status status-' + n.status + '">' +
        '<p class="status-nom">' + st.nom + '</p>' +
        '<p class="status-xulosa">' + e(n.xulosa) + '</p>' +
      '</div>' +
      '<dl class="raqamlar">' +
        '<div><dt>Reja tushum</dt><dd>' + formatSon(n.tushum) + ' <span>soʻm</span></dd></div>' +
        '<div><dt>Jami xarajat</dt><dd>' + formatSon(n.jami) + ' <span>soʻm</span></dd></div>' +
        '<div class="marja"><dt>Marja</dt><dd>' + formatFoiz(n.marja) + '</dd></div>' +
      '</dl>' +
      '<p class="oshgan">Meʼyordan oshgan guruhlar: <strong>' + e(oshgan) + '</strong></p>' +
      (n.ogohlar.length
        ? '<ul class="ogohlar" aria-label="Ogohlantirishlar">' + n.ogohlar.map(function (o) { return '<li>' + e(o) + '</li>'; }).join('') + '</ul>'
        : '') +
      '<div data-tg-blok>' + tgBlok() + '</div>' +
      '<p class="pdf-eslatma">Toʻliq taqsimot, tavsiyalar va imzo varagʻi — PDFda.</p>' +
      '<div class="harakatlar">' +
        '<button type="button" class="tugma asosiy" data-amal="pdf" data-pdf-tugma disabled>PDF tayyorlanmoqda…</button>' +
        '<button type="button" class="tugma matnli" data-amal="tahrir">Javoblarni oʻzgartirish</button>' +
        '<button type="button" class="tugma matnli" data-amal="yangi">Yangi byudjet tuzish</button>' +
      '</div>' +
    '</section>';
}

function formaEkrani() {
  const l = holat.lid;
  const maydon = function (id, yorliq, kiritish) {
    return '' +
      '<div class="maydon" data-maydon="' + id + '">' +
        '<label for="l-' + id + '">' + yorliq + '</label>' +
        kiritish +
        '<p class="maydon-xato" id="x-' + id + '" hidden></p>' +
      '</div>';
  };
  return '' +
    '<form class="ekran forma" novalidate>' +
      '<h1 tabindex="-1">Avval filialingiz haqida</h1>' +
      '<p class="lead">Soʻrovnoma tugashi bilan byudjet shu maʼlumotlar bilan Moliya boʻlimiga avtomatik yuboriladi.</p>' +
      '<div class="maydonlar">' +
        maydon('filial', 'Filial nomi',
          '<input id="l-filial" name="filial" type="text" autocomplete="organization" enterkeyhint="next" ' +
          'placeholder="Registon Chilonzor filiali" value="' + e(l.filial) + '" aria-describedby="x-filial">') +
        maydon('ism', 'Masʼul ismi',
          '<input id="l-ism" name="ism" type="text" autocomplete="name" enterkeyhint="next" value="' + e(l.ism) + '" aria-describedby="x-ism">') +
        maydon('tel', 'Telefon',
          '<div class="kiritish tel"><span class="prefiks" aria-hidden="true">+998</span>' +
          '<input id="l-tel" name="tel" type="tel" inputmode="numeric" autocomplete="tel-national" enterkeyhint="done" ' +
          'placeholder="90 123 45 67" value="' + e(telFormat(raqamlar(l.tel))) + '" aria-describedby="x-tel"></div>') +
      '</div>' +
      '<p class="xato" role="alert" hidden></p>' +
      '<div class="pastki">' +
        '<button type="button" class="tugma ikkinchi" data-amal="formadan-orqaga">Orqaga</button>' +
        '<button type="submit" class="tugma asosiy" data-yuborish disabled>' +
          (holat.formadanKeyin === 'natija' ? 'Natijani koʻrish' : 'Keyingisi') + '</button>' +
      '</div>' +
    '</form>';
}

function tgMatni() {
  if (holat.tg === 'ok') return 'Byudjet Moliya boʻlimiga yuborildi.';
  if (holat.tg === 'xato') return 'Moliya boʻlimiga yuborilmadi. «Qayta yuborish»ni bosing yoki PDFni guruhga oʻzingiz tashlang.';
  return 'Moliya boʻlimiga yuborilmoqda…';
}

function tgBlok() {
  return '' +
    '<div class="tg tg-' + (holat.tg || 'kutish') + '" role="status" aria-live="polite">' +
      '<p>' + tgMatni() + '</p>' +
      (holat.tg === 'xato' && holat.tgSabab ? '<p class="tg-sabab">Sabab: ' + e(holat.tgSabab) + '</p>' : '') +
      (holat.tg === 'ok' && holat.lid.kod ? '<p class="tg-sabab">Byudjet kodi: <strong>' + e(holat.lid.kod) + '</strong></p>' : '') +
    '</div>' +
    (holat.tg === 'xato' ? '<button type="button" class="tugma ikkinchi tg-qayta" data-amal="qayta-yuborish">Qayta yuborish</button>' : '');
}

/* ---------- Jonli yangilanishlar ---------- */

function jonliYangila(n) {
  const j = holat.javob;
  const ek = EKRANLAR[n];
  if (ek.tushum) {
    const el = ilova.querySelector('[data-jonli="tushum"]');
    el.textContent = 'Reja tushum: ' + formatSon(son(j.oquvchilar)) + ' × ' + formatSon(son(j.tolov)) +
      ' = ' + formatSom(son(j.oquvchilar) * son(j.tolov));
  }
  if (ek.tur === 'guruh') {
    const jami = moddalarEkrani(n).reduce(function (s, m) {
      if (m.shart && j.markaziy !== 'ha') return s;
      return s + son(j[m.id]);
    }, 0);
    ilova.querySelector('[data-jonli="guruh"]').textContent = formatSom(jami);
  }
  if (n === 4) {
    const h = hisobla(j);
    const el = ilova.querySelector('[data-jonli="oqituvchi"]');
    const mos = h.tushum > 0 && Math.abs(h.oqituvchiUlush - OQITUVCHI_FOIZI) <= OQITUVCHI_RUXSAT;
    el.textContent = h.tushum > 0
      ? 'Oʻqituvchi oylik + avans: ' + formatSom(h.oqituvchi) + ' (' + formatFoiz(h.oqituvchiUlush) + '). ' +
        'Kerak: tushumning ' + OQITUVCHI_FOIZI + '% i = ' + formatSom(h.oqituvchiReja) + '.'
      : 'Oʻqituvchilar ulushini hisoblash uchun 2–3-savollarni toʻldiring.';
    // Summalar qator oxirida boʻlinib ketmasin
    el.textContent = el.textContent.replace(/(\d) (?=\d)/g, '$1 ').replace(/ soʻm/g, ' soʻm');
    el.classList.toggle('mos', mos);
    el.classList.toggle('mos-emas', h.tushum > 0 && !mos && h.oqituvchi > 0);
  }
  if (ek.tur === 'soliq') {
    const farq = j.soliq_qolda && son(j.soliq) !== hisobla(j).soliqAvto;
    ilova.querySelector('[data-jonli="soliq-ogoh"]').hidden = !farq;
    ilova.querySelector('[data-amal="soliq-avto"]').hidden = !j.soliq_qolda;
  }
}

function xatoKorsat(matn) {
  const el = ilova.querySelector('.xato');
  if (!el) return;
  el.textContent = matn || '';
  el.hidden = !matn;
}

function savolniTekshir(n) {
  const j = holat.javob;
  if (n === 2 && !son(j.oquvchilar)) return { matn: 'Oʻquvchilar sonini kiriting.', fokus: '#m-oquvchilar' };
  if (n === 3 && !son(j.tolov)) return { matn: 'Oʻrtacha oylik toʻlovni kiriting.', fokus: '#m-tolov' };
  const ek = EKRANLAR[n];
  if (ek.tur === 'tanlov' && !j[ek.id]) return { matn: 'Variantlardan birini tanlang.', fokus: 'input[name="' + ek.id + '"]' };
  if (n === 15 && j.katta_xarajat === 'ha' && !String(j.katta_izoh || '').trim()) {
    return { matn: 'Qanday xarajat va nima uchun — qisqacha yozing.', fokus: '#katta_izoh' };
  }
  return null;
}

function keyingi(n) {
  const x = savolniTekshir(n);
  if (x) {
    xatoKorsat(x.matn);
    const f = ilova.querySelector(x.fokus);
    if (f) f.focus();
    return;
  }
  if (n < SAVOLLAR_SONI) {
    korsat(n + 1);
  } else if (lidTogrimi()) {
    korsat('natija');
  } else {
    holat.formadanKeyin = 'natija';
    korsat('forma');
  }
}

function lidTogrimi() {
  const x = lidXatolari();
  return !(x.filial || x.ism || x.tel);
}

// rejim: true — hamma xatoni koʻrsatish; 'filial' va h.k. — shu maydonni (chiqib ketganda);
// 'yozish' — yozish paytida faqat avval koʻrsatilgan xatoni yangilash.
function formaHolati(rejim, maydon) {
  const x = lidXatolari();
  ['filial', 'ism', 'tel'].forEach(function (id) {
    const el = ilova.querySelector('#x-' + id);
    const inp = ilova.querySelector('#l-' + id);
    const avval = inp.getAttribute('aria-invalid') === 'true';
    const telTolgan = id === 'tel' && raqamlar(inp.value).length === 9;
    const korsatilsin = !!x[id] && inp.value.trim() !== '' &&
      (rejim === true || rejim === id || (rejim === 'yozish' && (avval || (maydon === id && telTolgan))));
    el.textContent = korsatilsin ? x[id] : '';
    el.hidden = !korsatilsin;
    inp.setAttribute('aria-invalid', korsatilsin ? 'true' : 'false');
  });
  ilova.querySelector('[data-yuborish]').disabled = !!(x.filial || x.ism || x.tel);
}

/* ---------- Filial maʼlumotlari ---------- */

function filialniSaqla() {
  if (!lidTogrimi()) { formaHolati(true); return; }
  const l = holat.lid;
  l.filial = l.filial.trim().replace(/\s+/g, ' ');
  l.ism = l.ism.trim().replace(/\s+/g, ' ');
  const keyin = holat.formadanKeyin || 1;
  holat.formadanKeyin = null;
  korsat(keyin);
}

/* ---------- Natija ochilganda: PDF tayyorlash va Telegramʼga avtomatik yuborish ---------- */

// Bir xil byudjet qayta-qayta yuborilmasligi uchun javoblar va filial maʼlumotlaridan imzo.
function byudjetImzosi() {
  const l = holat.lid;
  return JSON.stringify([holat.javob, l.filial, l.ism, raqamlar(l.tel)]);
}

let pdfNavbati = 0;

async function avtoYuborish() {
  const j = holat.javob;
  const l = holat.lid;
  const navbat = ++pdfNavbati;
  l.telKorinish = '+998 ' + telFormat(raqamlar(l.tel));
  if (!l.kod || l.kodOy !== j.oy) { l.kod = byudjetKodi(j.oy); l.kodOy = j.oy; }
  l.sana = bugun();

  const imzo = byudjetImzosi();
  const avvalYuborilgan = !!holat.yuborilgan && holat.yuborilgan.kod === l.kod;
  const allaqachon = avvalYuborilgan && holat.yuborilgan.imzo === imzo;
  l.yangilangan = avvalYuborilgan && !allaqachon;

  holat.tgSabab = '';
  holat.tg = allaqachon ? 'ok' : 'kutish';
  tgYangila();

  try {
    const blob = await yaratPDF(holat.natija, j, l);
    if (navbat !== pdfNavbati) return;            // bu orada boshqa ekranga oʻtilgan
    if (holat.pdf && holat.pdf.url) URL.revokeObjectURL(holat.pdf.url);
    holat.pdf = { blob: blob, nom: pdfFaylNomi(l.filial, j.oy), url: URL.createObjectURL(blob) };
    pdfTugmasi('PDF yuklab olish', false);
  } catch (err) {
    console.error(err);
    if (navbat !== pdfNavbati) return;
    holat.pdf = null;
    pdfTugmasi('PDF tayyorlanmadi', true);
    holat.tg = 'xato';
    holat.tgSabab = 'PDF yaratib boʻlmadi — sahifani yangilab, qayta urinib koʻring.';
    tgYangila();
    return;
  }

  if (!allaqachon) telegramgaYubor(imzo);
}

function pdfTugmasi(matn, yopiq) {
  const t = ilova.querySelector('[data-pdf-tugma]');
  if (!t) return;
  t.textContent = matn;
  t.disabled = yopiq;
}

function tgYangila() {
  const blok = ilova.querySelector('[data-tg-blok]');
  if (blok) blok.innerHTML = tgBlok();
}

async function telegramgaYubor(imzo) {
  if (!holat.pdf) { avtoYuborish(); return; }
  imzo = imzo || byudjetImzosi();
  holat.tg = 'kutish';
  holat.tgSabab = '';
  tgYangila();
  let natija;
  try {
    natija = await yuborTelegram(holat.natija, holat.javob, holat.lid, holat.pdf.blob, holat.pdf.nom);
  } catch (err) {
    console.error(err);
    natija = { ok: false, sabab: 'Kutilmagan xato: ' + (err && err.message) };
  }
  holat.tg = natija && natija.ok ? 'ok' : 'xato';
  holat.tgSabab = natija && natija.sabab;
  if (holat.tg === 'ok') {
    holat.yuborilgan = { imzo: imzo, kod: holat.lid.kod };
    saqla();
  }
  tgYangila();
}

function pdfniYukla(p) {
  const a = document.createElement('a');
  a.href = p.url;
  a.download = p.nom;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------- Hodisalar ---------- */

function hodisalarniUla() {
  ilova.addEventListener('click', function (ev) {
    const t = ev.target.closest('[data-amal]');
    if (!t) return;
    const amal = t.getAttribute('data-amal');
    const form = t.closest('form.savol');
    const n = form ? Number(form.getAttribute('data-n')) : null;

    if (amal === 'boshlash') {
      holat.javob = yangiJavob();
      holat.saqlanganEkran = null;
      holat.yuborilgan = null;
      holat.lid.kod = '';
      holat.formadanKeyin = null;
      korsat('forma');
    } else if (amal === 'davom') {
      korsat(holat.saqlanganEkran);
    } else if (amal === 'formadan-orqaga') {
      const qayt = holat.formadanKeyin === 'natija' ? SAVOLLAR_SONI : 'bosh';
      holat.formadanKeyin = null;
      korsat(qayt);
    } else if (amal === 'orqaga') {
      korsat(n > 1 ? n - 1 : 'forma');
    } else if (amal === 'yoq') {
      moddalarEkrani(n).forEach(function (m) { holat.javob[m.id] = 0; });
      korsat(n + 1);
    } else if (amal === 'soliq-avto') {
      holat.javob.soliq_qolda = false;
      delete holat.javob.soliq;
      korsat(5, false);
      ilova.querySelector('#m-soliq').focus();
    } else if (amal === 'pdf') {
      if (holat.pdf) pdfniYukla(holat.pdf);
    } else if (amal === 'tahrir') {
      korsat(SAVOLLAR_SONI);
    } else if (amal === 'qayta-yuborish') {
      telegramgaYubor();
    } else if (amal === 'yangi') {
      holat.javob = yangiJavob();
      holat.saqlanganEkran = null;
      holat.tg = null;
      holat.yuborilgan = null;
      holat.lid.kod = '';
      korsat('bosh');
    }
  });

  ilova.addEventListener('input', function (ev) {
    const t = ev.target;
    const form = t.closest('form');
    if (!form) return;

    if (form.classList.contains('savol')) {
      const n = Number(form.getAttribute('data-n'));
      if (t.hasAttribute('data-summa')) {
        const v = summaniFormatla(t, t.name === 'oquvchilar' ? 6 : 12);
        holat.javob[t.name] = v;
        if (t.name === 'soliq') {
          holat.javob.soliq_qolda = (v || 0) !== hisobla(Object.assign({}, holat.javob, { soliq_qolda: false })).soliqAvto;
        }
      } else if (t.name === 'katta_izoh') {
        holat.javob.katta_izoh = t.value;
      }
      xatoKorsat('');
      jonliYangila(n);
      saqla();
    } else if (form.classList.contains('forma')) {
      if (t.name === 'tel') {
        const r = telTozala(t.value);
        t.value = telFormat(r);
        holat.lid.tel = r;
      } else {
        holat.lid[t.name] = t.value;
      }
      formaHolati('yozish', t.name);
      saqla();
    }
  });

  ilova.addEventListener('focusout', function (ev) {
    const t = ev.target;
    if (t.closest && t.closest('form.forma') && t.name) formaHolati(t.name);
  });

  ilova.addEventListener('change', function (ev) {
    const t = ev.target;
    const form = t.closest('form.savol');
    if (!form) return;
    const n = Number(form.getAttribute('data-n'));
    if (t.type === 'radio' || t.tagName === 'SELECT') {
      holat.javob[t.name] = t.value;
      xatoKorsat('');
      if (t.name === 'markaziy') {
        const blok = ilova.querySelector('[data-maydon="avaz_aka"]');
        blok.hidden = t.value !== 'ha';
        if (t.value !== 'ha') delete holat.javob.avaz_aka;
        jonliYangila(n);
      }
      if (t.name === 'katta_xarajat') {
        const blok = ilova.querySelector('[data-maydon="katta_izoh"]');
        blok.hidden = t.value !== 'ha';
        if (t.value === 'ha') ilova.querySelector('#katta_izoh').focus();
      }
      saqla();
    }
  });

  // Enter — keyingi maydonga oʻtadi, oxirgisida formani yuboradi.
  ilova.addEventListener('keydown', function (ev) {
    const t = ev.target;
    if (ev.key !== 'Enter' || t.tagName !== 'INPUT' || t.type === 'radio') return;
    const form = t.closest('form');
    if (!form) return;
    const royxat = Array.prototype.slice.call(form.querySelectorAll('input[type="text"], input[type="tel"], textarea'))
      .filter(function (el) { return !el.closest('[hidden]'); });
    const i = royxat.indexOf(t);
    if (i > -1 && i < royxat.length - 1) {
      ev.preventDefault();
      royxat[i + 1].focus();
    }
  });

  ilova.addEventListener('submit', function (ev) {
    ev.preventDefault();
    const form = ev.target;
    if (form.classList.contains('savol')) keyingi(Number(form.getAttribute('data-n')));
    else if (form.classList.contains('forma')) filialniSaqla();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  ilova = document.getElementById('ilova');
  yukla();
  hodisalarniUla();
  korsat('bosh', false);
});
