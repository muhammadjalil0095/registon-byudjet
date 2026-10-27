'use strict';

/* =====================================================================
   1. SOZLANADIGAN QIYMATLAR — Moliya boʻlimi shu yerda oʻzgartiradi
   ===================================================================== */

// Meʼyorlar: guruh xarajatining reja tushumga nisbatan ulushi, %.
// Test bosqichi uchun taxminiy qiymatlar — keyin haqiqiy raqamlarga almashtiriladi.
const MEYORLAR = {
  ishhaqi: 45,    // Ish haqi + ijtimoiy soliq
  bonus: 5,       // Bonuslar
  bino: 15,       // Arenda + kommunal
  aloqa: 2,       // Aloqa va bank
  ofis: 4,        // Ofis va xoʻjalik
  marketing: 7,   // Marketing
  tamir: 3,       // Taʼmir
  boshqa: null    // meʼyor yoʻq
};

// Status chegaralari: marja, %. Qizil — shuncha va undan koʻp guruh oshganda ham.
const STATUS_CHEGARA = {
  yashil: 25,
  qizil: 10,
  qizilOshganGuruh: 3
};

// Oʻqituvchi oylik + avans — reja tushumning shu foizi boʻlishi kerak.
// Farq ruxsat etilgan chegaradan (foiz punktida) oshsa, ogohlantirish chiqadi.
const OQITUVCHI_FOIZI = 30;
const OQITUVCHI_RUXSAT = 0.5;

/* =====================================================================
   2. MAʼLUMOTNOMA: guruhlar, moddalar, statuslar
   ===================================================================== */

const GURUHLAR = [
  { id: 'ishhaqi', nom: 'Ish haqi + ijtimoiy soliq', qisqa: 'Ish haqi',
    tavsiya: 'Kam toʻlgan guruhlarni birlashtiring va oʻqituvchi soatini guruh toʻliqligi bilan solishtiring.' },
  { id: 'bonus', nom: 'Bonuslar', qisqa: 'Bonuslar',
    tavsiya: 'Daraja va natija bonuslarini rejadagi sertifikat natijalari soni bilan asoslang.' },
  { id: 'bino', nom: 'Bino (arenda + kommunal)', qisqa: 'Bino',
    tavsiya: 'Arenda shartnomasi muddati va xona bandligini tekshiring; boʻsh soatlarga qoʻshimcha guruh qoʻying.' },
  { id: 'aloqa', nom: 'Aloqa va bank', qisqa: 'Aloqa va bank',
    tavsiya: 'Bank komissiyasini kamaytirish uchun toʻlovlarni hisob raqamga oʻtkazing.' },
  { id: 'ofis', nom: 'Ofis va xoʻjalik', qisqa: 'Ofis va xoʻjalik',
    tavsiya: 'Konstovar va xoʻjalik xaridini oyiga bir marta, roʻyxat boʻyicha qiling.' },
  { id: 'marketing', nom: 'Marketing', qisqa: 'Marketing',
    tavsiya: 'Har bir reklama kanali uchun bitta lid narxini yozing; natija bermagan kanalni toʻxtating.' },
  { id: 'tamir', nom: 'Taʼmir', qisqa: 'Taʼmir',
    tavsiya: 'Qayta taʼmirlash smetasini Moliya boʻlimi bilan oldindan kelishing.' },
  { id: 'boshqa', nom: 'Boshqa', qisqa: 'Boshqa', tavsiya: null }
];

// Byudjetdagi xarajat moddalari (ekran tartibida).
const MODDALAR = [
  { id: 'menejer_oylik', nom: 'Menejer oylik', guruh: 'ishhaqi', ekran: 4 },
  { id: 'menejer_avans', nom: 'Menejer avans', guruh: 'ishhaqi', ekran: 4 },
  { id: 'oqituvchi_oylik', nom: 'Oʻqituvchi oylik', guruh: 'ishhaqi', ekran: 4 },
  { id: 'oqituvchi_avans', nom: 'Oʻqituvchi avans', guruh: 'ishhaqi', ekran: 4 },
  { id: 'farrosh', nom: 'Farrosh', izoh: 'Avans va oylik', guruh: 'ishhaqi', ekran: 4 },
  { id: 'support', nom: 'Support', izoh: 'Avans va oylik', guruh: 'ishhaqi', ekran: 4 },
  { id: 'soliq', nom: 'Ijtimoiy soliq', izoh: 'Rasmiy ishlaydigan xodimlar soniga qarab', guruh: 'ishhaqi', ekran: 5 },

  { id: 'daraja_bonusi', nom: 'Daraja bonusi', izoh: 'Ustozlar va moderatorlarning daraja bonuslari va ragʻbatlar', guruh: 'bonus', ekran: 6 },
  { id: 'natija_bonusi', nom: 'Natijalar bonusi', izoh: 'IELTS, SAT, TOPIK va Milliy sertifikat natijalari uchun', guruh: 'bonus', ekran: 6 },

  { id: 'arenda', nom: 'Arenda', izoh: 'Markaz arendasi', guruh: 'bino', ekran: 7 },
  { id: 'elektr', nom: 'Elektr energiya', guruh: 'bino', ekran: 7 },
  { id: 'suv', nom: 'Suv', guruh: 'bino', ekran: 7 },
  { id: 'chiqindi', nom: 'Chiqindi', guruh: 'bino', ekran: 7 },

  { id: 'telefon_internet', nom: 'Telefon va Internet', izoh: 'Wi-Fi, SMS, kassa apparati, korporativ boʻlmagan raqamlarga Paynet', guruh: 'aloqa', ekran: 8 },
  { id: 'bank', nom: 'Bank xizmatlari', izoh: 'Plastikdan yechilgan pul va hisob raqamdagi foiz xarajat', guruh: 'aloqa', ekran: 8 },

  { id: 'konstovar', nom: 'Konstovar', izoh: 'Kitoblar, list, ruchka, daftar', guruh: 'ofis', ekran: 9 },
  { id: 'xojalik', nom: 'Xoʻjalik', izoh: 'Tozalik vositalari, stakan, kofe, batareyka', guruh: 'ofis', ekran: 9 },
  { id: 'kuler', nom: 'Kuler suv', izoh: 'Ichimlik suvi', guruh: 'ofis', ekran: 9 },
  { id: 'ovqat', nom: 'Ovqatlanish', izoh: 'Abed va abed uchun mahsulotlar', guruh: 'ofis', ekran: 9 },
  { id: 'dori', nom: 'Dori-darmon', izoh: 'Aptekadan olinadigan dorilar', guruh: 'ofis', ekran: 9 },

  { id: 'reklama', nom: 'Reklama', izoh: 'Reklama, oylik obunalar va blogerlar', guruh: 'marketing', ekran: 10 },
  { id: 'media', nom: 'Media', izoh: 'Media avans va oyliklari, syomka uchun ijaraga olingan buyumlar', guruh: 'marketing', ekran: 10 },
  { id: 'tadbirlar', nom: 'Tadbirlar', izoh: 'Bayram va tugʻilgan kunlar, sovgʻalar', guruh: 'marketing', ekran: 10 },

  { id: 'mayda_qurilish', nom: 'Mayda qurilish', izoh: 'Jihozlar uchun, bitta xarajat 1 000 000 soʻmdan kam', guruh: 'tamir', ekran: 11 },
  { id: 'qayta_tamir', nom: 'Qayta taʼmirlash', izoh: 'Remont, bitta xarajat 1 000 000 soʻmdan koʻp', guruh: 'tamir', ekran: 11 },

  { id: 'yolkira', nom: 'Yoʻlkira', izoh: 'Pochta, safar xizmati', guruh: 'boshqa', ekran: 12 },
  { id: 'qaytarish', nom: 'Talaba pulini qaytarish', izoh: 'Shartnoma bekor qilinishi kutilayotgan summa', guruh: 'boshqa', ekran: 12 },
  { id: 'markaziy_qomita', nom: 'Markaziy qoʻmita uchun', guruh: 'boshqa', ekran: 12 }
];

const ISH_HAQI_FOND = ['menejer_oylik', 'menejer_avans', 'oqituvchi_oylik', 'oqituvchi_avans', 'farrosh', 'support'];

const STATUSLAR = {
  yashil: { nom: 'Yashil', belgi: '🟢', xulosa: 'Byudjet sogʻlom. Tasdiqlashga tayyor.' },
  sariq: { nom: 'Sariq', belgi: '🟡', xulosa: 'Tasdiqlanadi, lekin oshgan moddalarga izoh kerak.' },
  qizil: { nom: 'Qizil', belgi: '🔴', xulosa: 'Byudjetni qayta koʻrib chiqish kerak.' }
};

const TANLOVLAR = {
  maqsad: [
    { v: 'osish', t: 'Oʻsish' },
    { v: 'barqaror', t: 'Barqaror ishlash' },
    { v: 'qisqartirish', t: 'Xarajatni qisqartirish' }
  ],
  ozgarish: [
    { v: 'kamayadi', t: 'Kamayadi' },
    { v: 'teng', t: 'Taxminan teng' },
    { v: 'oshadi10', t: '10% gacha oshadi' },
    { v: 'oshadi10kop', t: '10% dan koʻp oshadi' }
  ],
  hayoq: [
    { v: 'ha', t: 'Ha' },
    { v: 'yoq', t: 'Yoʻq' }
  ]
};

const OYLAR = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

/* =====================================================================
   3. YORDAMCHI FUNKSIYALAR
   ===================================================================== */

function son(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

// 120320000 → "120 320 000"
function formatSon(n) {
  const manfiy = n < 0;
  const s = String(Math.abs(Math.round(Number(n) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return manfiy ? '-' + s : s;
}

function formatSom(n) {
  return formatSon(n) + ' soʻm';
}

// 31.636 → "31.6%"; null → "—"
function formatFoiz(x) {
  return x === null || x === undefined ? '—' : x.toFixed(1) + '%';
}

// Qisqa summa: 152820000 → { son: '152.8', birlik: 'mln' }; 800000 → { son: '800', birlik: 'ming' }
function qisqaSumma(n) {
  const x = Math.round(Number(n) || 0);
  const ishora = x < 0 ? '-' : '';
  const a = Math.abs(x);
  const kasr = function (v) { return String(Math.round(v * 10) / 10); };
  if (a >= 999950000) return { son: ishora + kasr(a / 1e9), birlik: 'mlrd' };
  if (a >= 999500) return { son: ishora + kasr(a / 1e6), birlik: 'mln' };
  if (a >= 1000) return { son: ishora + formatSon(Math.round(a / 1000)), birlik: 'ming' };
  return { son: ishora + a, birlik: '' };
}

// 152820000 → "152.8 mln"
function formatMln(n) {
  const q = qisqaSumma(n);
  return q.birlik ? q.son + ' ' + q.birlik : q.son;
}

// 152820000 → "152.8 mln soʻm"
function formatMlnSom(n) {
  return formatMln(n) + ' soʻm';
}

function tanlovMatni(tur, qiymat) {
  const t = (TANLOVLAR[tur] || []).find(function (o) { return o.v === qiymat; });
  return t ? t.t : '';
}

// "2026-11" → "Noyabr 2026"
function oyNomi(kod) {
  const q = String(kod || '').split('-').map(Number);
  return OYLAR[q[1] - 1] + ' ' + q[0];
}

function oyKodi(yil, oy0) {
  const d = new Date(yil, oy0, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

/* =====================================================================
   4. HISOB-KITOB — DOMʼsiz, testlanadi (tests/hisob.test.js)
   ===================================================================== */

function hisobla(j) {
  j = j || {};
  const tushum = son(j.oquvchilar) * son(j.tolov);
  const ulush = function (x) { return tushum > 0 ? x / tushum * 100 : null; };

  const summa = {};
  MODDALAR.forEach(function (m) { summa[m.id] = son(j[m.id]); });

  // Ijtimoiy soliqni filial rasmiy xodimlar soniga qarab oʻzi kiritadi.
  const fond = ISH_HAQI_FOND.reduce(function (s, id) { return s + summa[id]; }, 0);

  const oqituvchi = summa.oqituvchi_oylik + summa.oqituvchi_avans;
  const oqituvchiReja = Math.round(tushum * OQITUVCHI_FOIZI / 100);
  const oqituvchiUlush = ulush(oqituvchi);

  const jami = MODDALAR.reduce(function (s, m) { return s + summa[m.id]; }, 0);
  const foyda = tushum - jami;
  const marja = ulush(foyda);

  const moddalar = MODDALAR
    .map(function (m) {
      return { id: m.id, nom: m.nom, guruh: m.guruh, summa: summa[m.id], ulush: ulush(summa[m.id]) };
    });

  const guruhlar = GURUHLAR.map(function (g) {
    const s = moddalar.filter(function (m) { return m.guruh === g.id; })
      .reduce(function (a, m) { return a + m.summa; }, 0);
    const u = ulush(s);
    const meyor = MEYORLAR[g.id];
    const meyorBor = meyor !== null && meyor !== undefined;
    const oshgan = meyorBor && u !== null && u > meyor + 1e-9;
    // Meʼyor boʻyicha ruxsat etilgan summa va undan ortiqcha qismi (soʻmda)
    const meyorSumma = meyorBor ? Math.round(tushum * meyor / 100) : null;
    return {
      id: g.id, nom: g.nom, qisqa: g.qisqa, tavsiya: g.tavsiya, summa: s, ulush: u, meyor: meyor, oshgan: oshgan,
      farq: oshgan ? u - meyor : 0,
      nisbat: meyorBor && u !== null ? u / meyor : null,
      meyorSumma: meyorSumma,
      ortiqcha: oshgan ? Math.max(0, s - meyorSumma) : 0
    };
  });

  const oshganlar = guruhlar.filter(function (g) { return g.oshgan; });
  const oshganlarFarqBoyicha = oshganlar.slice().sort(function (a, b) { return b.farq - a.farq; });
  // "Nima qilish kerak" roʻyxati: eng koʻp ortiqcha soʻmdan boshlab
  const amallar = oshganlar.slice().sort(function (a, b) { return b.ortiqcha - a.ortiqcha; });

  // Status
  let status;
  let xulosa;
  if (tushum <= 0) {
    status = 'qizil';
    xulosa = 'Tushum kiritilmagan. ' + STATUSLAR.qizil.xulosa;
  } else if (jami <= 0) {
    status = 'qizil';
    xulosa = 'Xarajat kiritilmagan. ' + STATUSLAR.qizil.xulosa;
  } else {
    if (marja < STATUS_CHEGARA.qizil || jami > tushum || oshganlar.length >= STATUS_CHEGARA.qizilOshganGuruh) {
      status = 'qizil';
    } else if (marja >= STATUS_CHEGARA.yashil && oshganlar.length === 0) {
      status = 'yashil';
    } else {
      status = 'sariq';
    }
    xulosa = STATUSLAR[status].xulosa;
  }

  // Keyingi rangga chiqish uchun jami xarajatni qancha kamaytirish kerak (soʻmda)
  const kamaytirish = function (marjaChegarasi) {
    return tushum > 0 ? Math.max(0, jami - Math.floor(tushum * (100 - marjaChegarasi) / 100)) : 0;
  };
  const sariqUchun = kamaytirish(STATUS_CHEGARA.qizil);
  const yashilUchun = kamaytirish(STATUS_CHEGARA.yashil);

  // Oshgan guruhlar meʼyorga tushirilsa, natija qanday boʻladi
  const keyinJami = jami - amallar.reduce(function (a, g) { return a + g.ortiqcha; }, 0);
  const keyinMarja = tushum > 0 ? (tushum - keyinJami) / tushum * 100 : null;
  let keyinStatus = null;
  if (amallar.length && tushum > 0 && keyinJami > 0) {
    keyinStatus = keyinMarja < STATUS_CHEGARA.qizil || keyinJami > tushum ? 'qizil'
      : keyinMarja >= STATUS_CHEGARA.yashil ? 'yashil' : 'sariq';
  }
  const keyinSariqUchun = tushum > 0 ? Math.max(0, keyinJami - Math.floor(tushum * (100 - STATUS_CHEGARA.qizil) / 100)) : 0;

  // Tavsiyalar: eng koʻp oshgan 3 guruh + filial maqsadiga qarab bittasi
  const tavsiyalar = [];
  if (oshganlar.length) {
    oshganlarFarqBoyicha.slice(0, 3).forEach(function (g) {
      if (g.tavsiya) tavsiyalar.push(g.tavsiya);
    });
  } else {
    tavsiyalar.push('Barcha guruhlar meʼyor ichida.');
  }
  let maqsadTavsiya = '';
  if (j.maqsad === 'osish') {
    maqsadTavsiya = 'Marketing meʼyordan oshishi mumkin, agar yangi oʻquvchilar rejasi bilan asoslangan boʻlsa.';
  } else if (j.maqsad === 'barqaror') {
    maqsadTavsiya = 'Oʻtgan oy darajasini saqlang, oshgan moddalarga izoh yozing.';
  } else if (j.maqsad === 'qisqartirish') {
    const eng = moddalar.filter(function (m) { return m.summa > 0; })
      .sort(function (a, b) { return b.summa - a.summa; })
      .slice(0, 3);
    if (eng.length) {
      const tejash = Math.round(eng.reduce(function (a, m) { return a + m.summa; }, 0) * 0.05);
      maqsadTavsiya = 'Eng katta ' + eng.length + ' modda: ' + eng.map(function (m) { return m.nom; }).join(', ') +
        '. Ularni 5% ga kamaytirish oyiga ' + formatMlnSom(tejash) + ' tejaydi.';
    }
  }
  if (maqsadTavsiya) tavsiyalar.push(maqsadTavsiya);

  // Ogohlantirishlar — har birida nima boʻlishi kerakligi yoziladi
  const ogohlar = [];
  if (summa.mayda_qurilish > 1000000) {
    ogohlar.push('Mayda qurilish 1 mln soʻmdan oshdi — bu summa Qayta taʼmirlashga tegishli boʻlishi mumkin.');
  }
  const kommunal = summa.elektr + summa.suv + summa.chiqindi;
  if (summa.arenda === 0 && kommunal === 0) {
    ogohlar.push('Arenda va kommunal toʻlovlar 0 — bu oy toʻlanmaydimi? Tekshiring.');
  } else if (summa.arenda === 0) {
    ogohlar.push('Arenda 0 — bu oy arenda toʻlanmaydimi? Tekshiring.');
  } else if (kommunal === 0) {
    ogohlar.push('Kommunal toʻlovlar (elektr, suv, chiqindi) 0 — tekshiring.');
  }
  if (tushum > 0 && Math.abs(oqituvchiUlush - OQITUVCHI_FOIZI) > OQITUVCHI_RUXSAT) {
    ogohlar.push('Oʻqituvchi ulushi ' + formatFoiz(oqituvchiUlush) + ' — ' + OQITUVCHI_FOIZI + '% (' +
      formatMlnSom(oqituvchiReja) + ') boʻlishi kerak.');
  }
  const avansKop = [];
  if (summa.menejer_avans > summa.menejer_oylik) avansKop.push('menejer');
  if (summa.oqituvchi_avans > summa.oqituvchi_oylik) avansKop.push('oʻqituvchi');
  if (avansKop.length) {
    ogohlar.push('Avans oylikdan koʻp kiritilgan: ' + avansKop.join(', ') + '.');
  }
  if (j.ozgarish === 'oshadi10kop' && j.katta_xarajat === 'yoq') {
    ogohlar.push('Xarajat 10% dan koʻp oshadi, lekin sababi yozilmagan (15-savol).');
  }

  return {
    oquvchilar: son(j.oquvchilar),
    tolov: son(j.tolov),
    tushum: tushum,
    fond: fond,
    soliq: summa.soliq,
    oqituvchi: oqituvchi,
    oqituvchiReja: oqituvchiReja,
    oqituvchiUlush: oqituvchiUlush,
    jami: jami,
    foyda: foyda,
    marja: marja,
    moddalar: moddalar,
    guruhlar: guruhlar,
    oshganlar: oshganlar,
    amallar: amallar,
    status: status,
    xulosa: xulosa,
    sariqUchun: sariqUchun,
    yashilUchun: yashilUchun,
    keyinJami: keyinJami,
    keyinMarja: keyinMarja,
    keyinStatus: keyinStatus,
    keyinSariqUchun: keyinSariqUchun,
    tavsiyalar: tavsiyalar,
    maqsadTavsiya: maqsadTavsiya,
    ogohlar: ogohlar
  };
}

/* =====================================================================
   5. NATIJA MATNLARI — ekran, PDF va Telegram uchun bir xil (DOMʼsiz)
   ===================================================================== */

// Status nega shunday va keyingi rangga chiqish uchun nima qilish kerak
function keyingiQadamMatni(n) {
  if (n.tushum <= 0) return 'Oʻquvchilar soni va oʻrtacha toʻlovni kiriting (2–3-savollar).';
  if (n.jami <= 0) return 'Xarajatlarni kiriting (4–12-savollar).';
  if (n.status === 'yashil') {
    return 'Marja ' + STATUS_CHEGARA.yashil + '% dan yuqori va hamma guruh meʼyorda.';
  }
  const oshgan = n.oshganlar.length;
  if (n.status === 'qizil') {
    if (n.sariqUchun > 0) return 'Sariqqa chiqish uchun xarajatni ' + formatMlnSom(n.sariqUchun) + 'ga kamaytiring.';
    return oshgan + ' ta guruh meʼyordan oshgan — Sariqqa chiqish uchun kamida ' +
      (oshgan - STATUS_CHEGARA.qizilOshganGuruh + 1) + ' tasini meʼyorga tushiring.';
  }
  if (n.yashilUchun > 0) {
    return 'Yashilga chiqish uchun xarajatni ' + formatMlnSom(n.yashilUchun) + 'ga kamaytiring' +
      (oshgan ? ' va oshgan guruhlarni meʼyorga tushiring.' : '.');
  }
  return 'Yashilga chiqish uchun meʼyordan oshgan guruhlarni meʼyorga tushiring.';
}

function yashilQoidasi() {
  return 'Yashil: marja ' + STATUS_CHEGARA.yashil + '% va undan yuqori, hamma guruh meʼyorda.';
}

// Bitta oshgan guruh uchun aniq qadam
function amalMatni(g) {
  const amal = formatMlnSom(g.ortiqcha) + 'ga kamaytiring';
  return {
    guruh: g.qisqa,
    amal: amal,
    sarlavha: g.qisqa + ' — ' + amal,
    izoh: 'Hozir ' + formatMln(g.summa) + ', meʼyor ' + formatMlnSom(g.meyorSumma) + ' (tushumning ' + g.meyor + '%)',
    maslahat: g.tavsiya || ''
  };
}

// Barcha qadamlar bajarilsa natija qanday boʻladi
function keyinMatni(n) {
  if (!n.keyinStatus) return '';
  const boshi = 'Shunda marja ' + formatFoiz(n.keyinMarja) + ' boʻladi';
  if (n.keyinStatus === 'qizil') {
    return boshi + ' — hali Qizil. Yana ' + formatMlnSom(n.keyinSariqUchun) + ' kamaytirish kerak.';
  }
  return boshi + ' — status ' + STATUSLAR[n.keyinStatus].nom;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MEYORLAR: MEYORLAR, STATUS_CHEGARA: STATUS_CHEGARA, GURUHLAR: GURUHLAR, MODDALAR: MODDALAR,
    STATUSLAR: STATUSLAR, hisobla: hisobla, formatSon: formatSon, formatFoiz: formatFoiz, oyNomi: oyNomi,
    qisqaSumma: qisqaSumma, formatMln: formatMln, formatMlnSom: formatMlnSom,
    keyingiQadamMatni: keyingiQadamMatni, yashilQoidasi: yashilQoidasi, amalMatni: amalMatni, keyinMatni: keyinMatni
  };
}
