'use strict';

/* =====================================================================
   PDF hisobot — jsPDF, A4, 2 sahifa. Shrift: Montserrat (ʻ ʼ belgilari uchun).
   ===================================================================== */

const PDF_RANG = {
  brend: [232, 76, 9],
  och: [253, 238, 230],
  matn: [35, 31, 28],
  ikkinchi: [107, 98, 92],
  chiziq: [226, 218, 212],
  yashil: [30, 142, 62],
  sariq: [201, 138, 0],
  qizil: [198, 40, 40],
  yashilOch: [232, 244, 236],
  sariqOch: [251, 243, 224],
  qizilOch: [251, 233, 233]
};

let pdfResurs = null;

function bufferBase64(buf) {
  const b = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

async function faylBase64(yol) {
  const javob = await fetch(yol);
  if (!javob.ok) throw new Error(yol + ' yuklanmadi: ' + javob.status);
  return bufferBase64(await javob.arrayBuffer());
}

async function pdfResurslar() {
  if (!pdfResurs) {
    const q = await Promise.all([
      faylBase64('fonts/Montserrat-Regular.ttf'),
      faylBase64('fonts/Montserrat-SemiBold.ttf'),
      faylBase64('fonts/Montserrat-ExtraBold.ttf'),
      faylBase64('assets/logo.png')
    ]);
    pdfResurs = { regular: q[0], semi: q[1], xb: q[2], logo: q[3] };
  }
  return pdfResurs;
}

async function yaratPDF(n, j, lid) {
  const r = await pdfResurslar();
  const jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.setLineHeightFactor(1.3);

  doc.addFileToVFS('Montserrat-Regular.ttf', r.regular);
  doc.addFont('Montserrat-Regular.ttf', 'Mont', 'normal');
  doc.addFileToVFS('Montserrat-SemiBold.ttf', r.semi);
  doc.addFont('Montserrat-SemiBold.ttf', 'MontSemi', 'normal');
  doc.addFileToVFS('Montserrat-ExtraBold.ttf', r.xb);
  doc.addFont('Montserrat-ExtraBold.ttf', 'MontXB', 'normal');

  const W = 210;
  const H = 297;
  const M = 16;
  const ICHKI = W - 2 * M;
  const PAST = H - 18;
  const oyMatni = oyNomi(j.oy);
  const stRang = { yashil: PDF_RANG.yashil, sariq: PDF_RANG.sariq, qizil: PDF_RANG.qizil }[n.status];
  const stOch = { yashil: PDF_RANG.yashilOch, sariq: PDF_RANG.sariqOch, qizil: PDF_RANG.qizilOch }[n.status];
  let y = 0;

  function shrift(tur, olcham, rang) {
    doc.setFont(tur === 'xb' ? 'MontXB' : tur === 'semi' ? 'MontSemi' : 'Mont', 'normal');
    doc.setFontSize(olcham);
    doc.setTextColor.apply(doc, rang || PDF_RANG.matn);
  }
  function matn(t, x, yy, opt) { doc.text(Array.isArray(t) ? t : String(t), x, yy, opt); }
  function chiziq(x1, y1, x2, rang, qalinlik) {
    doc.setDrawColor.apply(doc, rang || PDF_RANG.chiziq);
    doc.setLineWidth(qalinlik || 0.2);
    doc.line(x1, y1, x2, y1);
  }
  function yangiSahifaKerakmi(balandlik) {
    if (y + balandlik > PAST) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  }
  function bolimSarlavha(t) {
    yangiSahifaKerakmi(14);
    shrift('xb', 11.5);
    matn(t, M, y);
    y += 6;
  }
  function nuqta(x, yy, rang, radius) {
    doc.setFillColor.apply(doc, rang);
    doc.circle(x, yy, radius || 1.4, 'F');
  }

  /* ---------- 1-sahifa ---------- */

  // Shapka: logo + toʻq sariq chiziq
  doc.addImage('data:image/png;base64,' + r.logo, 'PNG', M, 12, 44, 44 * 211 / 1000);
  shrift('regular', 8, PDF_RANG.ikkinchi);
  matn('Moliya boʻlimi uchun', W - M, 15.5, { align: 'right' });
  shrift('semi', 9.5);
  matn(lid.kod, W - M, 20.5, { align: 'right' });
  chiziq(M, 26, W - M, PDF_RANG.brend, 1.2);

  y = 38;
  shrift('xb', 18);
  matn('Filial byudjeti — ' + oyMatni, M, y);
  y += 9;

  // Maʼlumotlar bloki (3 ustun × 2 qator)
  const malumot = [
    ['Filial', lid.filial], ['Masʼul', lid.ism], ['Telefon', lid.telKorinish],
    ['Byudjet oyi', oyMatni], ['Tuzilgan sana', lid.sana], ['Byudjet kodi', lid.kod]
  ];
  const ustunEni = ICHKI / 3;
  for (let q = 0; q < 2; q++) {
    let qatorBalandligi = 0;
    for (let u = 0; u < 3; u++) {
      const el = malumot[q * 3 + u];
      const x = M + u * ustunEni;
      shrift('regular', 8, PDF_RANG.ikkinchi);
      matn(el[0], x, y);
      shrift('semi', 10);
      const qatorlar = doc.splitTextToSize(String(el[1]), ustunEni - 4);
      matn(qatorlar, x, y + 5);
      qatorBalandligi = Math.max(qatorBalandligi, 5 + qatorlar.length * 4.6);
    }
    y += qatorBalandligi + 3;
  }
  y += 2;

  // Xulosa bloki
  const blokY = y;
  const blokH = 30;
  doc.setFillColor.apply(doc, stOch);
  doc.rect(M, blokY, ICHKI, blokH, 'F');
  doc.setFillColor.apply(doc, stRang);
  doc.rect(M, blokY, 2.2, blokH, 'F');
  shrift('xb', 13, stRang);
  matn(STATUSLAR[n.status].nom, M + 7, blokY + 8);
  const nomEni = doc.getTextWidth(STATUSLAR[n.status].nom);
  shrift('semi', 10.5);
  matn(doc.splitTextToSize(n.xulosa, ICHKI - nomEni - 16)[0], M + 7 + nomEni + 4, blokY + 8);

  const korsatkichlar = [
    ['Reja tushum', formatSon(n.tushum)],
    ['Jami xarajat', formatSon(n.jami)],
    ['Foyda', formatSon(n.foyda)],
    ['Marja', formatFoiz(n.marja)]
  ];
  const kEni = (ICHKI - 7) / 4;
  korsatkichlar.forEach(function (k, i) {
    const x = M + 7 + i * kEni;
    shrift('regular', 8, PDF_RANG.ikkinchi);
    matn(k[0] + (i < 3 ? ', soʻm' : ''), x, blokY + 16.5);
    shrift('xb', 12.5);
    matn(k[1], x, blokY + 23.5);
  });
  y = blokY + blokH + 9;

  // Guruhlar jadvali
  bolimSarlavha('Xarajat guruhlari');
  const X = { summa: M + 100, ulush: M + 120, meyor: M + 138, holat: M + 144 };
  shrift('semi', 8, PDF_RANG.ikkinchi);
  matn('Guruh', M, y);
  matn('Summa, soʻm', X.summa, y, { align: 'right' });
  matn('Ulush', X.ulush, y, { align: 'right' });
  matn('Meʼyor', X.meyor, y, { align: 'right' });
  matn('Holat', X.holat, y);
  y += 2;
  chiziq(M, y, W - M, PDF_RANG.matn, 0.3);
  y += 5;

  n.guruhlar.forEach(function (g) {
    const rang = g.oshgan ? PDF_RANG.qizil : PDF_RANG.matn;
    shrift('regular', 9.5);
    matn(g.nom, M, y);
    shrift(g.oshgan ? 'semi' : 'regular', 9.5, rang);
    matn(formatSon(g.summa), X.summa, y, { align: 'right' });
    matn(formatFoiz(g.ulush), X.ulush, y, { align: 'right' });
    shrift('regular', 9.5, PDF_RANG.ikkinchi);
    matn(g.meyor === null ? '—' : g.meyor + '%', X.meyor, y, { align: 'right' });
    if (g.meyor === null) {
      shrift('regular', 9, PDF_RANG.ikkinchi);
      matn('Meʼyor yoʻq', X.holat, y);
    } else if (g.oshgan) {
      nuqta(X.holat + 1.4, y - 1.2, PDF_RANG.qizil);
      shrift('semi', 9, PDF_RANG.qizil);
      matn('Oshgan +' + g.farq.toFixed(1) + ' p.', X.holat + 4.5, y);
    } else {
      nuqta(X.holat + 1.4, y - 1.2, n.tushum > 0 ? PDF_RANG.yashil : PDF_RANG.chiziq);
      shrift('regular', 9, PDF_RANG.matn);
      matn(n.tushum > 0 ? 'Meʼyorda' : '—', X.holat + 4.5, y);
    }
    y += 2.2;
    chiziq(M, y, W - M);
    y += 3.9;
  });
  shrift('semi', 9.5);
  matn('Jami xarajat', M, y);
  matn(formatSon(n.jami), X.summa, y, { align: 'right' });
  matn(formatFoiz(n.tushum > 0 ? n.jami / n.tushum * 100 : null), X.ulush, y, { align: 'right' });
  y += 8.5;

  // Ogohlantirishlar
  if (n.ogohlar.length) {
    bolimSarlavha('Ogohlantirishlar');
    n.ogohlar.forEach(function (o) {
      shrift('regular', 9.5);
      const qatorlar = doc.splitTextToSize(o, ICHKI - 7);
      yangiSahifaKerakmi(qatorlar.length * 4.4 + 2);
      nuqta(M + 1.8, y - 1.2, PDF_RANG.sariq, 1.8);
      shrift('xb', 7, [255, 255, 255]);
      matn('!', M + 1.8, y - 0.1, { align: 'center' });
      shrift('regular', 9.5);
      matn(qatorlar, M + 6, y);
      y += qatorlar.length * 4.4 + 1.4;
    });
    y += 3;
  }

  // Tavsiyalar
  bolimSarlavha('Tavsiyalar');
  n.tavsiyalar.forEach(function (t, i) {
    shrift('regular', 9.5);
    const qatorlar = doc.splitTextToSize(t, ICHKI - 7);
    yangiSahifaKerakmi(qatorlar.length * 4.4 + 2);
    shrift('xb', 9.5, PDF_RANG.brend);
    matn((i + 1) + '.', M, y);
    shrift('regular', 9.5);
    matn(qatorlar, M + 6, y);
    y += qatorlar.length * 4.4 + 1.4;
  });
  y += 3;

  // Filial maqsadi va 15-savol
  bolimSarlavha('Filial izohi');
  const izoh = j.katta_xarajat === 'ha' ? String(j.katta_izoh || '').trim() : '';
  [
    'Maqsad: ' + (tanlovMatni('maqsad', j.maqsad) || '—') + '. Oʻtgan oyga nisbatan jami xarajat: ' +
      (tanlovMatni('ozgarish', j.ozgarish) || '—').toLowerCase() + '.',
    'Rejadan tashqari katta xarajat: ' + (izoh || 'yoʻq')
  ].forEach(function (t) {
    shrift('regular', 9.5);
    const qatorlar = doc.splitTextToSize(t, ICHKI);
    yangiSahifaKerakmi(qatorlar.length * 4.4 + 2);
    matn(qatorlar, M, y);
    y += qatorlar.length * 4.4 + 1.4;
  });

  /* ---------- 2-sahifa: moddalar boʻyicha toʻliq taqsimot ---------- */

  doc.addPage();
  y = 22;
  shrift('xb', 15);
  matn('Moddalar boʻyicha toʻliq taqsimot', M, y);
  y += 6;
  shrift('regular', 8.5, PDF_RANG.ikkinchi);
  matn(lid.filial + ' · ' + oyMatni + ' · Ulush — reja tushumga nisbatan', M, y);
  y += 8;

  const X2 = { summa: M + 140, ulush: W - M };
  shrift('semi', 8, PDF_RANG.ikkinchi);
  matn('Modda', M, y);
  matn('Summa, soʻm', X2.summa, y, { align: 'right' });
  matn('Ulush', X2.ulush, y, { align: 'right' });
  y += 2;
  chiziq(M, y, W - M, PDF_RANG.matn, 0.3);
  y += 1;

  n.guruhlar.forEach(function (g) {
    yangiSahifaKerakmi(12);
    doc.setFillColor.apply(doc, PDF_RANG.och);
    doc.rect(M, y, ICHKI, 5.8, 'F');
    shrift('semi', 9.5, g.oshgan ? PDF_RANG.qizil : PDF_RANG.matn);
    matn(g.nom, M + 2, y + 4.1);
    matn(formatSon(g.summa), X2.summa, y + 4.1, { align: 'right' });
    matn(formatFoiz(g.ulush), X2.ulush - 2, y + 4.1, { align: 'right' });
    y += 5.8;
    n.moddalar.filter(function (m) { return m.guruh === g.id; }).forEach(function (m) {
      yangiSahifaKerakmi(5);
      const rang = m.summa > 0 ? PDF_RANG.matn : PDF_RANG.ikkinchi;
      shrift('regular', 9, rang);
      matn(m.nom, M + 6, y + 3.3);
      matn(formatSon(m.summa), X2.summa, y + 3.3, { align: 'right' });
      matn(formatFoiz(m.ulush), X2.ulush - 2, y + 3.3, { align: 'right' });
      y += 4.6;
      chiziq(M + 6, y, W - M);
    });
  });
  y += 1;
  chiziq(M, y, W - M, PDF_RANG.matn, 0.3);
  y += 5;
  shrift('xb', 10);
  matn('Jami xarajat', M + 2, y);
  matn(formatSon(n.jami), X2.summa, y, { align: 'right' });
  matn(formatFoiz(n.tushum > 0 ? n.jami / n.tushum * 100 : null), X2.ulush - 2, y, { align: 'right' });
  y += 5.5;
  shrift('regular', 9, PDF_RANG.ikkinchi);
  matn('Reja tushum: ' + formatSom(n.tushum) + ' · Foyda: ' + formatSom(n.foyda) + ' · Marja: ' + formatFoiz(n.marja), M + 2, y);
  y += 10;

  // Tasdiqlash bloki
  yangiSahifaKerakmi(30);
  bolimSarlavha('Tasdiqlash');
  y += 8;
  const imzoEni = (ICHKI - 10) / 2;
  [['Filial rahbari:', '(imzo)'], ['Moliya boʻlimi:', '(imzo)']].forEach(function (im, i) {
    const x = M + i * (imzoEni + 10);
    shrift('semi', 9.5);
    matn(im[0], x, y);
    const lx = x + doc.getTextWidth(im[0]) + 3;
    chiziq(lx, y + 0.6, x + imzoEni, PDF_RANG.matn, 0.3);
    shrift('regular', 7.5, PDF_RANG.ikkinchi);
    matn(im[1], (lx + x + imzoEni) / 2, y + 4.2, { align: 'center' });
  });
  y += 13;
  shrift('semi', 9.5);
  matn('Tasdiqlangan sana:', M, y);
  chiziq(M + doc.getTextWidth('Tasdiqlangan sana:') + 3, y + 0.6, M + imzoEni, PDF_RANG.matn, 0.3);

  /* ---------- Har sahifa pasti ---------- */

  const jamiSahifa = doc.getNumberOfPages();
  for (let s = 1; s <= jamiSahifa; s++) {
    doc.setPage(s);
    chiziq(M, H - 13, W - M);
    shrift('regular', 7.5, PDF_RANG.ikkinchi);
    matn('Registon oʻquv markazi · Filial byudjeti · ' + oyMatni, M, H - 9);
    matn(lid.kod + ' · ' + s + ' / ' + jamiSahifa, W - M, H - 9, { align: 'right' });
  }

  doc.setProperties({
    title: 'Filial byudjeti — ' + oyMatni + ' — ' + lid.filial,
    subject: 'Registon filial byudjeti',
    author: lid.ism,
    creator: 'Registon byudjet sayti'
  });

  return doc.output('blob');
}
