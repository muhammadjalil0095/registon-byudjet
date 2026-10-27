// Hisob-kitob testi: CLAUDE.md dagi A va B ssenariylar.
// Ishga tushirish: `node tests/hisob.test.js` yoki brauzerda tests/hisob.test.html ni oching.
(function () {
  'use strict';
  const lib = typeof require === 'function' ? require('../app.js') : window;
  const hisobla = lib.hisobla;

  // Telegram xabari matni: Nodeʼda app.js + telegram.js bitta muhitda ishga tushiriladi
  let telegramXabari = null;
  if (typeof require === 'function') {
    const fs = require('fs');
    const path = require('path');
    const vm = require('vm');
    const muhit = vm.createContext({ window: {}, console: console });
    ['app.js', 'telegram.js'].forEach(function (f) {
      vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), muhit, { filename: f });
    });
    telegramXabari = muhit.telegramXabari;
  } else if (typeof window.telegramXabari === 'function') {
    telegramXabari = window.telegramXabari;
  }

  const A = {
    oy: '2026-11',
    oquvchilar: 320, tolov: 550000,
    menejer_oylik: 6000000, menejer_avans: 3000000, oqituvchi_oylik: 36000000, oqituvchi_avans: 14000000,
    farrosh: 3000000, support: 4000000, soliq: 7920000,
    daraja_bonusi: 3000000, natija_bonusi: 1000000,
    arenda: 18000000, elektr: 2000000, suv: 800000, chiqindi: 700000,
    telefon_internet: 900000, bank: 1200000,
    konstovar: 2000000, xojalik: 1200000, kuler: 400000, ovqat: 1500000, dori: 100000,
    reklama: 7000000, media: 2000000, tadbirlar: 1500000,
    mayda_qurilish: 800000, qayta_tamir: 0,
    yolkira: 300000, qaytarish: 2000000, markaziy_qomita: 0,
    maqsad: 'barqaror', ozgarish: 'teng', katta_xarajat: 'yoq'
  };
  const B = Object.assign({}, A, { oquvchilar: 280, reklama: 20000000, tadbirlar: 6000000, qayta_tamir: 15000000 });
  const LID = { filial: 'Registon Chilonzor filiali', ism: 'Dilshod', telKorinish: '+998 90 123 45 67', kod: 'BUD-2611-4821' };

  const natijalar = [];
  function tekshir(nom, haqiqiy, kutilgan) {
    natijalar.push({ nom: nom, ok: haqiqiy === kutilgan, haqiqiy: haqiqiy, kutilgan: kutilgan });
  }
  const f1 = function (x) { return x === null ? null : x.toFixed(1); };
  const oshgan = function (n) {
    return n.oshganlar.map(function (g) { return g.qisqa + ' ' + f1(g.ulush) + '%'; }).join(', ');
  };

  // Qisqa summalar
  tekshir('Qisqa: 152.8 mln', lib.formatMln(152820000), '152.8 mln');
  tekshir('Qisqa: butun mln', lib.formatMln(154000000), '154 mln');
  tekshir('Qisqa: ming', lib.formatMln(800000), '800 ming');
  tekshir('Qisqa: manfiy', lib.formatMln(-5400000), '-5.4 mln');
  tekshir('Qisqa: 1 mln chegarasi', lib.formatMln(999600), '1 mln');
  tekshir('Qisqa: mlrd', lib.formatMln(1500000000), '1.5 mlrd');
  tekshir('Qisqa: nol', lib.formatMln(0), '0');

  // A — yashil
  const a = hisobla(A);
  tekshir('A: tushum', a.tushum, 176000000);
  tekshir('A: soliq (qoʻlda kiritilgan)', a.soliq, 7920000);
  tekshir('A: xarajat', a.jami, 120320000);
  tekshir('A: foyda', a.foyda, 55680000);
  tekshir('A: marja', f1(a.marja), '31.6');
  tekshir('A: oshgan guruhlar', a.oshganlar.length, 0);
  tekshir('A: status', a.status, 'yashil');
  tekshir('A: oʻqituvchi ulushi', f1(a.oqituvchiUlush), '28.4');
  tekshir('A: ogohlantirishlar (faqat 30% qoidasi)', a.ogohlar.join(' | '),
    'Oʻqituvchi ulushi 28.4% — 30% (52.8 mln soʻm) boʻlishi kerak.');
  tekshir('A: keyingi qadam', lib.keyingiQadamMatni(a), 'Marja 25% dan yuqori va hamma guruh meʼyorda.');
  tekshir('A: qadamlar yoʻq', a.amallar.length + '|' + lib.keyinMatni(a), '0|');

  const a30 = hisobla(Object.assign({}, A, { oqituvchi_oylik: 38800000, oqituvchi_avans: 14000000 }));
  tekshir('Oʻqituvchi 30%: ogohlantirish yoʻq', a30.ogohlar.length, 0);

  // B — qizil
  const b = hisobla(B);
  tekshir('B: tushum', b.tushum, 154000000);
  tekshir('B: xarajat', b.jami, 152820000);
  tekshir('B: foyda', b.foyda, 1180000);
  tekshir('B: marja', f1(b.marja), '0.8');
  tekshir('B: oshgan guruhlar', oshgan(b), 'Ish haqi 48.0%, Marketing 18.2%, Taʼmir 10.3%');
  tekshir('B: status', b.status, 'qizil');
  tekshir('B: tavsiyalar soni', b.tavsiyalar.length, 4);
  tekshir('B: qadamlar tartibi va ortiqcha summa',
    b.amallar.map(function (g) { return g.id + ' ' + g.ortiqcha; }).join(', '),
    'marketing 17220000, tamir 11180000, ishhaqi 4620000');
  tekshir('B: sariqqa chiqish uchun', b.sariqUchun, 14220000);
  tekshir('B: yashilga chiqish uchun', b.yashilUchun, 37320000);
  tekshir('B: qadamlardan keyin marja', f1(b.keyinMarja), '22.2');
  tekshir('B: qadamlardan keyin status', b.keyinStatus, 'sariq');
  tekshir('B: keyingi qadam', lib.keyingiQadamMatni(b), 'Sariqqa chiqish uchun xarajatni 14.2 mln soʻmga kamaytiring.');
  tekshir('B: 1-qadam', lib.amalMatni(b.amallar[0]).sarlavha, 'Marketing — 17.2 mln soʻmga kamaytiring');
  tekshir('B: 1-qadam izohi', lib.amalMatni(b.amallar[0]).izoh, 'Hozir 28 mln, meʼyor 10.8 mln soʻm (tushumning 7%)');
  tekshir('B: natija keyin', lib.keyinMatni(b), 'Shunda marja 22.2% boʻladi — status Sariq');

  // Sariq: bitta guruh oshgan, marja yetarli
  const s = hisobla(Object.assign({}, A, { reklama: 14000000 }));
  tekshir('Sariq: status', s.status, 'sariq');
  tekshir('Sariq: keyingi qadam', lib.keyingiQadamMatni(s), 'Yashilga chiqish uchun meʼyordan oshgan guruhlarni meʼyorga tushiring.');
  tekshir('Sariq: natija keyin', lib.keyinMatni(s), 'Shunda marja 30.6% boʻladi — status Yashil');

  // Qizil faqat 3 ta guruh oshgani uchun (marja yaxshi)
  const q = hisobla(Object.assign({}, A, { daraja_bonusi: 8000000, dori: 2100000, bank: 3000000 }));
  tekshir('3 guruh: status', q.status, 'qizil');
  tekshir('3 guruh: keyingi qadam', lib.keyingiQadamMatni(q),
    '3 ta guruh meʼyordan oshgan — Sariqqa chiqish uchun kamida 1 tasini meʼyorga tushiring.');

  const c = hisobla(Object.assign({}, A, { oquvchilar: 0 }));
  tekshir('Tushum 0: status', c.status, 'qizil');

  const x0 = hisobla({ oquvchilar: 65, tolov: 500000, maqsad: 'barqaror', ozgarish: 'teng', katta_xarajat: 'yoq' });
  tekshir('Xarajat 0: status', x0.status, 'qizil');
  tekshir('Xarajat 0: xulosa', x0.xulosa, 'Xarajat kiritilmagan. Byudjetni qayta koʻrib chiqish kerak.');

  const d = hisobla(Object.assign({}, A, { soliq: 5000000, mayda_qurilish: 1500000 }));
  tekshir('Boshqa soliq summasi: ogohlantirish yoʻq; mayda qurilish: bor', d.ogohlar.length, 2);
  tekshir('Soliq kiritilmasa 0', hisobla(Object.assign({}, A, { soliq: undefined })).soliq, 0);

  // Telegram xabari
  if (telegramXabari) {
    tekshir('Telegram: B xabari', telegramXabari(b, B, LID), [
      '💰 Yangi byudjet · 🔴 Qizil · Noyabr 2026',
      '____________________________________',
      'Filial: Registon Chilonzor filiali',
      'Masʼul: Dilshod',
      'Tel: +998 90 123 45 67',
      '____________________________________',
      '',
      '👥 Oʻquvchilar: 280 nafar',
      '🧾 Oʻrtacha chek: 550 000',
      '🟢 Tushum: 154 000 000',
      '🔴 Xarajat: 152 820 000',
      '💵 Foyda: 1 180 000 (0.8%)',
      '____________________________________',
      'Meʼyordan oshgan:',
      '• Marketing 18.2% (meʼyor 7%) — +17 220 000',
      '• Taʼmir 10.3% (meʼyor 3%) — +11 180 000',
      '• Ish haqi 48.0% (meʼyor 45%) — +4 620 000',
      '⚠️ Oʻqituvchi ulushi 32.5% — 30% (46.2 mln soʻm) boʻlishi kerak.',
      'Kod: BUD-2611-4821'
    ].join('\n'));
    const ta = telegramXabari(a, A, LID).split('\n');
    tekshir('Telegram: A sarlavhasi', ta[0], '💰 Yangi byudjet · 🟢 Yashil · Noyabr 2026');
    tekshir('Telegram: A oshgan guruh yoʻq', ta[13], 'Meʼyordan oshgan: yoʻq');
    tekshir('Telegram: A oʻquvchilar va oʻrtacha chek', ta.slice(7, 9).join(' | '),
      '👥 Oʻquvchilar: 320 nafar | 🧾 Oʻrtacha chek: 550 000');
  }

  const xatolar = natijalar.filter(function (n) { return !n.ok; });
  const qatorlar = natijalar.map(function (n) {
    return (n.ok ? 'OK   ' : 'XATO ') + n.nom + (n.ok ? '' : ' — kutilgan: ' + n.kutilgan + ', chiqdi: ' + n.haqiqiy);
  });
  qatorlar.push('', xatolar.length ? xatolar.length + ' ta tekshiruv oʻtmadi.' : 'Hammasi toʻgʻri: ' + natijalar.length + ' ta tekshiruv.');

  if (typeof document !== 'undefined') {
    document.getElementById('natija').textContent = qatorlar.join('\n');
  } else {
    console.log(qatorlar.join('\n'));
    if (xatolar.length) process.exitCode = 1;
  }
})();
