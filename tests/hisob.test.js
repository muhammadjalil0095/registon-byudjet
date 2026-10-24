// Hisob-kitob testi: CLAUDE.md dagi A va B ssenariylar.
// Ishga tushirish: `node tests/hisob.test.js` yoki brauzerda tests/hisob.test.html ni oching.
(function () {
  'use strict';
  const lib = typeof require === 'function' ? require('../app.js') : window;
  const hisobla = lib.hisobla;

  const A = {
    oquvchilar: 320, tolov: 550000,
    menejer_oylik: 6000000, menejer_avans: 3000000, oqituvchi_oylik: 36000000, oqituvchi_avans: 14000000,
    farrosh: 3000000, support: 4000000,
    daraja_bonusi: 3000000, natija_bonusi: 1000000,
    arenda: 18000000, elektr: 2000000, suv: 800000, chiqindi: 700000,
    telefon_internet: 900000, bank: 1200000,
    konstovar: 2000000, xojalik: 1200000, kuler: 400000, ovqat: 1500000, dori: 100000,
    reklama: 7000000, media: 2000000, tadbirlar: 1500000,
    mayda_qurilish: 800000, qayta_tamir: 0,
    yolkira: 300000, qaytarish: 2000000, markaziy_qomita: 0, markaziy: 'yoq',
    maqsad: 'barqaror', ozgarish: 'teng', katta_xarajat: 'yoq'
  };
  const B = Object.assign({}, A, { oquvchilar: 280, reklama: 20000000, tadbirlar: 6000000, qayta_tamir: 15000000 });

  const natijalar = [];
  function tekshir(nom, haqiqiy, kutilgan) {
    natijalar.push({ nom: nom, ok: haqiqiy === kutilgan, haqiqiy: haqiqiy, kutilgan: kutilgan });
  }
  const f1 = function (x) { return x === null ? null : x.toFixed(1); };
  const oshgan = function (n) {
    return n.oshganlar.map(function (g) { return g.qisqa + ' ' + f1(g.ulush) + '%'; }).join(', ');
  };

  const a = hisobla(A);
  tekshir('A: tushum', a.tushum, 176000000);
  tekshir('A: soliq (avto)', a.soliq, 7920000);
  tekshir('A: xarajat', a.jami, 120320000);
  tekshir('A: foyda', a.foyda, 55680000);
  tekshir('A: marja', f1(a.marja), '31.6');
  tekshir('A: oshgan guruhlar', a.oshganlar.length, 0);
  tekshir('A: status', a.status, 'yashil');
  tekshir('A: oʻqituvchi ulushi', f1(a.oqituvchiUlush), '28.4');
  tekshir('A: ogohlantirishlar (faqat 30% qoidasi)', a.ogohlar.join(' | '),
    'Oʻqituvchi oylik va avansi tushumning 28.4% i. 30% boʻlishi kerak: 52 800 000 soʻm.');

  const a30 = hisobla(Object.assign({}, A, { oqituvchi_oylik: 38800000, oqituvchi_avans: 14000000 }));
  tekshir('Oʻqituvchi 30%: ogohlantirish yoʻq', a30.ogohlar.length, 0);

  const b = hisobla(B);
  tekshir('B: tushum', b.tushum, 154000000);
  tekshir('B: xarajat', b.jami, 152820000);
  tekshir('B: foyda', b.foyda, 1180000);
  tekshir('B: marja', f1(b.marja), '0.8');
  tekshir('B: oshgan guruhlar', oshgan(b), 'Ish haqi 48.0%, Marketing 18.2%, Taʼmir 10.3%');
  tekshir('B: status', b.status, 'qizil');
  tekshir('B: tavsiyalar soni', b.tavsiyalar.length, 4);

  const c = hisobla(Object.assign({}, A, { oquvchilar: 0 }));
  tekshir('Tushum 0: status', c.status, 'qizil');

  const d = hisobla(Object.assign({}, A, { soliq_qolda: true, soliq: 5000000, mayda_qurilish: 1500000 }));
  tekshir('Qoʻlda soliq + mayda qurilish: ogohlantirishlar', d.ogohlar.length, 3);

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
