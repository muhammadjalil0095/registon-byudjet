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
  qizilOch: [251, 233, 233],
  yashilToq: [20, 92, 41],
  sariqToq: [107, 74, 0],
  qizilToq: [142, 31, 31],
  trek: [241, 236, 232],
  neytral: [207, 198, 191],
  zonaQizil: [240, 180, 180],
  zonaSariq: [240, 213, 144],
  zonaYashil: [180, 220, 192]
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
  // Qator balandligi (mm) — shrift oʻlchamiga qarab
  function qator(olcham) {
    return olcham * 0.3528 * 1.3;
  }
  // Matnni kenglikka sigʻdirib yozadi va keyingi qatorning y sini qaytaradi
  function yoz(text, x, yy, kenglik, tur, olcham, rang) {
    shrift(tur, olcham, rang);
    const q = doc.splitTextToSize(String(text), kenglik);
    matn(q, x, yy);
    return yy + q.length * qator(olcham);
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

  // Kim va qachon tuzdi — bitta qatorda (byudjet kodi shapkada)
  y = yoz('Filial: ' + lid.filial + ' · Masʼul: ' + lid.ism + ' · Tel: ' + lid.telKorinish + ' · Tuzilgan: ' + lid.sana,
    M, y, ICHKI, 'regular', 9, PDF_RANG.ikkinchi) + 3;

  // Xulosa bloki: status, 4 koʻrsatkich, marja shkalasi va keyingi qadam
  const shkalaBor = n.marja !== null && n.jami > 0;
  const x0 = M + 7;
  const wI = ICHKI - 11;
  const stNom = STATUSLAR[n.status].nom;
  shrift('xb', 13);
  const nomEni = doc.getTextWidth(stNom);
  shrift('semi', 10.5);
  const xulosaYonida = nomEni + 4 + doc.getTextWidth(n.xulosa) <= wI;
  const xulosaQ = xulosaYonida ? [n.xulosa] : doc.splitTextToSize(n.xulosa, wI);
  shrift('semi', 9.5);
  const qadamQ = doc.splitTextToSize(keyingiQadamMatni(n), wI);
  shrift('regular', 8.5);
  const qoidaQ = n.status !== 'yashil' ? doc.splitTextToSize(yashilQoidasi(), wI) : [];

  // Joylashuv blok tepasidan (mm)
  const yNom = 8.5;
  const yXulosa = xulosaYonida ? yNom : yNom + 6;
  const yKYorliq = yXulosa + (xulosaQ.length - 1) * qator(10.5) + 8;
  const yKQiymat = yKYorliq + 6;
  const yK2Yorliq = yKQiymat + 7.5;
  const yK2Qiymat = yK2Yorliq + 6;
  const yZona = yK2Qiymat + 5;
  const yZonaRaqam = yZona + 3 + 3.6;
  const yQadam = shkalaBor ? yZonaRaqam + 6.5 : yK2Qiymat + 7.5;
  const yQoida = yQadam + qadamQ.length * qator(9.5);
  const blokH = (qoidaQ.length ? yQoida + (qoidaQ.length - 1) * qator(8.5) : yQadam + (qadamQ.length - 1) * qator(9.5)) + 5;

  const bY = y;
  doc.setFillColor.apply(doc, stOch);
  doc.rect(M, bY, ICHKI, blokH, 'F');
  doc.setFillColor.apply(doc, stRang);
  doc.rect(M, bY, 2.2, blokH, 'F');
  shrift('xb', 13, stRang);
  matn(stNom, x0, bY + yNom);
  shrift('semi', 10.5);
  matn(xulosaQ, xulosaYonida ? x0 + nomEni + 4 : x0, bY + yXulosa);

  // 1-qator: tushum qanday hisoblangan (oʻquvchilar × oʻrtacha chek = reja tushum)
  // 2-qator: natija (xarajat, foyda, marja)
  const kEni = wI / 3;
  const qatorlar3 = [
    { y: yKYorliq, belgilar: ['×', '='], kor: [
      ['Oʻquvchilar', formatSon(n.oquvchilar) + ' nafar'],
      ['Oʻrtacha chek, soʻm', formatSon(n.tolov)],
      ['Reja tushum, soʻm', formatMln(n.tushum)]
    ] },
    { y: yK2Yorliq, belgilar: [], kor: [
      ['Jami xarajat, soʻm', formatMln(n.jami)],
      ['Foyda, soʻm', formatMln(n.foyda)],
      ['Marja', formatFoiz(n.marja)]
    ] }
  ];
  qatorlar3.forEach(function (q) {
    q.kor.forEach(function (k, i) {
      const x = x0 + i * kEni;
      shrift('regular', 8, PDF_RANG.ikkinchi);
      matn(k[0], x, bY + q.y);
      shrift('xb', 12.5);
      matn(k[1], x, bY + q.y + 6);
      if (i > 0 && q.belgilar[i - 1]) {
        shrift('semi', 12.5, PDF_RANG.ikkinchi);
        matn(q.belgilar[i - 1], x - 6, bY + q.y + 6, { align: 'center' });
      }
    });
  });

  if (shkalaBor) {
    const MAKS = 40;
    const qz = STATUS_CHEGARA.qizil;
    const ys = STATUS_CHEGARA.yashil;
    const oraliq = 0.6;
    const birlik = (wI - 2 * oraliq) / MAKS;
    [[0, qz, PDF_RANG.zonaQizil], [qz, ys, PDF_RANG.zonaSariq], [ys, MAKS, PDF_RANG.zonaYashil]].forEach(function (z, i) {
      doc.setFillColor.apply(doc, z[2]);
      doc.rect(x0 + z[0] * birlik + i * oraliq, bY + yZona, (z[1] - z[0]) * birlik, 3, 'F');
    });
    const m = Math.max(0, Math.min(MAKS, n.marja));
    const bx = x0 + m * birlik + (m >= ys ? 2 : m >= qz ? 1 : 0) * oraliq;
    doc.setFillColor(255, 255, 255);
    doc.rect(bx - 1.1, bY + yZona - 1.6, 2.2, 6.2, 'F');
    doc.setFillColor.apply(doc, PDF_RANG.matn);
    doc.rect(bx - 0.6, bY + yZona - 1.1, 1.2, 5.2, 'F');
    shrift('regular', 7.5, PDF_RANG.ikkinchi);
    const ry = bY + yZonaRaqam;
    matn('0', x0, ry);
    matn(qz + '% — sariq', x0 + qz * birlik + oraliq, ry, { align: 'center' });
    matn(ys + '% — yashil', x0 + ys * birlik + 2 * oraliq, ry, { align: 'center' });
    matn(MAKS + '%', x0 + wI, ry, { align: 'right' });
  }
  shrift('semi', 9.5);
  matn(qadamQ, x0, bY + yQadam);
  if (qoidaQ.length) {
    shrift('regular', 8.5, PDF_RANG.ikkinchi);
    matn(qoidaQ, x0, bY + yQoida);
  }
  y = bY + blokH + 9;

  // Ikki ustun: chapda guruhlar meʼyorga nisbatan, oʻngda nima qilish kerak
  const wL = 86;
  const xR = M + wL + 8;
  const wR = W - M - xR;
  let yL = y;
  let yR = y;

  shrift('xb', 11);
  matn('Guruhlar meʼyorga nisbatan', M, yL);
  if (shkalaBor) {
    shrift('regular', 7.5, PDF_RANG.ikkinchi);
    matn('meʼyor', M + wL, yL, { align: 'right' });
    doc.setFillColor.apply(doc, PDF_RANG.matn);
    doc.rect(M + wL - doc.getTextWidth('meʼyor') - 2, yL - 2.9, 0.5, 3.4, 'F');
  }
  yL += 7;
  if (!shkalaBor) {
    yL = yoz('Tushum yoki xarajat kiritilmagan — ulushlarni hisoblab boʻlmaydi.', M, yL, wL, 'regular', 9, PDF_RANG.ikkinchi);
  } else {
    const yarim = wL / 2;
    const meyorli = n.guruhlar.filter(function (g) { return g.meyor !== null && g.meyor !== undefined; });
    meyorli.sort(function (a, b) {
      if (a.oshgan !== b.oshgan) return a.oshgan ? -1 : 1;
      return a.oshgan ? b.ortiqcha - a.ortiqcha : b.nisbat - a.nisbat;
    });
    meyorli.forEach(function (g) {
      shrift('semi', 9.5);
      matn(g.qisqa, M, yL);
      const nomW = doc.getTextWidth(g.qisqa);
      shrift('regular', 8, PDF_RANG.ikkinchi);
      matn(formatFoiz(g.ulush) + ' / ' + g.meyor + '%', M + nomW + 2, yL);
      if (g.oshgan) {
        shrift('semi', 9, PDF_RANG.qizil);
        matn('+' + formatMln(g.ortiqcha), M + wL, yL, { align: 'right' });
      } else {
        shrift('regular', 8, PDF_RANG.ikkinchi);
        matn('meʼyorda', M + wL, yL, { align: 'right' });
      }
      const by = yL + 2;
      const r = g.nisbat || 0;
      doc.setFillColor.apply(doc, PDF_RANG.trek);
      doc.rect(M, by, wL, 2, 'F');
      doc.setFillColor.apply(doc, PDF_RANG.neytral);
      doc.rect(M, by, Math.min(r, 1) * yarim, 2, 'F');
      if (g.oshgan) {
        const ortiq = (Math.min(r, 2) - 1) * yarim;
        doc.setFillColor.apply(doc, PDF_RANG.qizil);
        doc.rect(M + yarim + 0.5, by, Math.max(0.8, ortiq - 0.5), 2, 'F');
      }
      doc.setFillColor.apply(doc, PDF_RANG.matn);
      doc.rect(M + yarim - 0.25, by - 1, 0.5, 4, 'F');
      yL += 9.4;
    });
    const boshqa = n.guruhlar.find(function (g) { return g.meyor === null; });
    if (boshqa && boshqa.summa > 0) {
      shrift('semi', 9.5);
      matn('Boshqa', M, yL);
      const bw = doc.getTextWidth('Boshqa');
      shrift('regular', 8, PDF_RANG.ikkinchi);
      matn(formatFoiz(boshqa.ulush), M + bw + 2, yL);
      matn('meʼyor yoʻq', M + wL, yL, { align: 'right' });
      yL += 6;
    }
  }

  shrift('xb', 11);
  matn('Nima qilish kerak', xR, yR);
  yR += 7;
  if (n.amallar.length) {
    n.amallar.slice(0, 3).forEach(function (g, i) {
      const a = amalMatni(g);
      doc.setFillColor.apply(doc, PDF_RANG.brend);
      doc.circle(xR + 2.2, yR - 1.2, 2.2, 'F');
      shrift('xb', 7.5, [255, 255, 255]);
      matn(String(i + 1), xR + 2.2, yR - 0.2, { align: 'center' });
      yR = yoz(a.sarlavha, xR + 7, yR, wR - 7, 'semi', 9.5);
      yR = yoz('Hozir ' + formatMln(g.summa) + ' · meʼyor ' + formatMln(g.meyorSumma) + ' (' + g.meyor + '%)',
        xR + 7, yR, wR - 7, 'regular', 8, PDF_RANG.ikkinchi);
      if (a.maslahat) yR = yoz(a.maslahat, xR + 7, yR, wR - 7, 'regular', 8, PDF_RANG.ikkinchi);
      yR += 2.5;
    });
    if (n.amallar.length > 3) {
      yR = yoz('Yana ' + (n.amallar.length - 3) + ' ta guruh meʼyordan oshgan — chapdagi roʻyxatga qarang.',
        xR, yR, wR, 'regular', 8, PDF_RANG.ikkinchi) + 2;
    }
    const keyin = keyinMatni(n);
    if (keyin) {
      const tus = {
        yashil: [PDF_RANG.yashilOch, PDF_RANG.yashilToq],
        sariq: [PDF_RANG.sariqOch, PDF_RANG.sariqToq],
        qizil: [PDF_RANG.qizilOch, PDF_RANG.qizilToq]
      }[n.keyinStatus];
      shrift('semi', 9);
      const kq = doc.splitTextToSize(keyin, wR - 6);
      const tepa = yR - 2;
      const kh = 7 + (kq.length - 1) * qator(9);
      doc.setFillColor.apply(doc, tus[0]);
      doc.rect(xR, tepa, wR, kh, 'F');
      shrift('semi', 9, tus[1]);
      matn(kq, xR + 3, tepa + 4.6);
      yR = tepa + kh + 6;
    }
  } else {
    yR = yoz(n.status === 'yashil' ? 'Hech narsa oʻzgartirish shart emas — byudjet tasdiqlashga tayyor.' : keyingiQadamMatni(n),
      xR, yR, wR, 'regular', 9.5) + 2;
  }
  y = Math.max(yL, yR) + 4;

  // Tekshirish kerak boʻlgan joylar
  if (n.ogohlar.length) {
    bolimSarlavha('Tekshiring');
    n.ogohlar.forEach(function (o) {
      shrift('regular', 9.5);
      const qatorlar = doc.splitTextToSize(o, ICHKI - 7);
      yangiSahifaKerakmi(qatorlar.length * qator(9.5) + 2);
      nuqta(M + 1.8, y - 1.2, PDF_RANG.sariq, 1.8);
      shrift('xb', 7, [255, 255, 255]);
      matn('!', M + 1.8, y - 0.1, { align: 'center' });
      shrift('regular', 9.5);
      matn(qatorlar, M + 6, y);
      y += qatorlar.length * qator(9.5) + 1.4;
    });
    y += 3;
  }

  // Filial maqsadi va 15-savol
  bolimSarlavha('Filial izohi');
  const izoh = j.katta_xarajat === 'ha' ? String(j.katta_izoh || '').trim() : '';
  [
    'Maqsad: ' + (tanlovMatni('maqsad', j.maqsad) || '—') + '. Oʻtgan oyga nisbatan jami xarajat: ' +
      (tanlovMatni('ozgarish', j.ozgarish) || '—').toLowerCase() + '.',
    'Rejadan tashqari katta xarajat: ' + (izoh || 'yoʻq')
  ].concat(n.maqsadTavsiya ? ['Maslahat: ' + n.maqsadTavsiya] : []).forEach(function (t) {
    shrift('regular', 9.5);
    const qatorlar = doc.splitTextToSize(t, ICHKI);
    yangiSahifaKerakmi(qatorlar.length * qator(9.5) + 2);
    matn(qatorlar, M, y);
    y += qatorlar.length * qator(9.5) + 1.4;
  });
  // Eslatma faqat joy boʻlsa — uning uchun alohida sahifa ochilmaydi
  if (y + 6 <= PAST) {
    y += 3;
    shrift('regular', 8.5, PDF_RANG.ikkinchi);
    matn('Moddalar boʻyicha toʻliq taqsimot va imzolar — keyingi sahifada.', M, y);
  }

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
  y = yoz('Reja tushum: ' + formatSon(n.oquvchilar) + ' oʻquvchi × ' + formatSom(n.tolov) + ' (oʻrtacha chek) = ' +
    formatSom(n.tushum), M + 2, y, ICHKI - 4, 'regular', 9, PDF_RANG.ikkinchi);
  yoz('Foyda: ' + formatSom(n.foyda) + ' · Marja: ' + formatFoiz(n.marja), M + 2, y, ICHKI - 4, 'regular', 9, PDF_RANG.ikkinchi);
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
