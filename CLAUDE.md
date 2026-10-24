# Registon — Filial byudjeti diagnostika sayti

Bu fayl Claude Code uchun topshiriq. Loyiha egasi — Registon o‘quv markazi Moliya bo‘limi rahbari (CFO), dasturchi emas. Unga javoblarni **lotin o‘zbek tilida**, oddiy so‘zlar bilan, texnik atamalarsiz ber. Har bir katta qadamdan keyin nima qilinganini 1–2 gapda ayt.

## 1. Nima quriladi

Filial rahbari qisqa so‘rovnomadan o‘tib, keyingi oy byudjetini Registon xarajat moddalari bo‘yicha yig‘adi va me’yorlarga solishtirilgan “byudjet salomatligi” xulosasini PDF’da oladi. Moliya bo‘limi esa har bir filialdan bir xil formatdagi byudjetni Telegram guruhida darhol oladi.

Zanjir: **Landing → So‘rovnoma (15 ekran) → Natija → Filial nomi + raqam → PDF → Telegram guruh**

| Parametr | Qiymat |
| --- | --- |
| Auditoriya | 60 filial rahbarlari va filial menejerlari |
| Lid | Filial nomi, mas’ul ismi, raqam, byudjet oyi, tushum, xarajat, marja, status |
| Asosiy CTA | Byudjetni Moliya bo‘limiga tasdiqlashga yuborish |

## 2. Qat’iy shartlar

- **Faqat statik sayt.** Backend, server, ma’lumotlar bazasi yo‘q. Hammasi brauzerda ishlaydi. Oddiy HTML + CSS + JavaScript, framework va build bosqichisiz (npm build kerak emas).
- **GitHub Pages’ga joylanadi**, istalgan telefondan ochiladi.
- **Registon brendi:** logo, brend rangi, shrift. Sayt ham, PDF ham bitta uslubda.
- **Mobil birinchi:** 360–390 px kenglikda qulay, gorizontal skroll yo‘q, tugmalar kamida 48 px balandlikda.
- **Lotin o‘zbek tili.** Barcha matnlarda `oʻ`, `gʻ` uchun U+02BB (ʻ), tutuq belgisi uchun U+02BC (ʼ) ishlatiladi. Saytda ham, PDF’da ham to‘g‘ri chiqishi shart.
- **Haqiqiy kontent:** “Lorem ipsum” va bo‘sh joylar yo‘q. Quyidagi matnlar tayyor — o‘zgartirmasdan ishlat.
- Tashqi CDN ishlatilmaydi: barcha kutubxona va shriftlar papkaning ichida.

## 3. Papkada allaqachon tayyor narsalar

```
assets/logo.png            — Registon logosi (to‘q sariq, shaffof fon, 1000×211)
assets/logo-white.png      — oq varianti (to‘q sariq fon ustida ishlatish uchun)
fonts/Montserrat-Regular.ttf
fonts/Montserrat-SemiBold.ttf
fonts/Montserrat-ExtraBold.ttf   — lotin + ʻ ʼ belgilari bor (tekshirilgan)
vendor/jspdf.umd.min.js    — PDF yaratish kutubxonasi (jsPDF 2.x)
```

Yaratilishi kerak bo‘lgan fayllar (taklif):

```
index.html     — bitta sahifa, ekranlar JS orqali almashadi
styles.css
app.js         — so‘rovnoma, hisob-kitob, forma
pdf.js         — PDF hisobot
telegram.js    — Telegram’ga yuborish
config.js      — Telegram bot kaliti va guruh ID (egasi to‘ldiradi)
README.md      — egasi uchun: botni ulash va GitHub Pages’ga joylash, o‘zbekcha
```

## 4. Brend va dizayn

| Token | Qiymat | Qayerda |
| --- | --- | --- |
| Registon to‘q sariq | `#E84C09` (logodan o‘lchangan) | asosiy tugma, progress, sarlavha urg‘ulari, PDF sarlavha chizig‘i |
| Och sariq fon | `#FDEEE6` | kartochka/blok foni |
| Matn | `#231F1C` | asosiy matn |
| Ikkinchi darajali matn | `#6B625C` | izohlar |
| Fon | `#FFFFFF` | sahifa |
| Yashil status | `#1E8E3E` | |
| Sariq status | `#C98A00` | |
| Qizil status | `#C62828` | |

- Shrift: Montserrat (`@font-face` bilan `fonts/` dan). Sarlavhalar ExtraBold, tugmalar SemiBold, matn Regular.
- Shablon ko‘rinishdan qoch: har blokka bir xil soyali kartochka, gradient, hammasi KATTA HARFLI yorliqlar kerak emas. Urg‘u bitta joyda — natija ekranidagi status bloki.
- Animatsiya minimal: faqat ekran almashishi va progress chizig‘i. `prefers-reduced-motion` hurmat qilinadi.
- Klaviatura fokusi ko‘rinadi.

## 5. Landing

- Sarlavha: **“Filialingiz byudjetini 7 daqiqada tuzing”**
- Ostida: “Javob bering, tizim hisoblaydi, Moliya boʻlimi darhol koʻradi.”
- Nima olinishi (qisqa ro‘yxat): jami byudjet; xarajatlarning moddalar boʻyicha taqsimoti; meʼyordan oshgan xarajatlar; imzolanadigan PDF.
- Bitta asosiy tugma: **“Byudjetni tuzishni boshlash”** → 1-ekran.
- Ishonch bloki: “60 filial · 30 xarajat moddasi · bitta standart”. Ostida: “Summalar faqat sizning telefoningizda hisoblanadi, Moliya boʻlimiga faqat yakuniy byudjet yuboriladi.”

## 6. So‘rovnoma — 15 ekran

Umumiy qoidalar:
- Ekranda bitta savol yoki bitta xarajat guruhi.
- Progress ko‘rinadi: “6 / 15” + chiziq.
- “Orqaga” tugmasi kiritilgan summalarni o‘chirmaydi. “Keyingisi” tugmasi.
- Summa maydonlari: `inputmode="numeric"`, kiritilayotganda `1 500 000` ko‘rinishida formatlanadi, oxirida “soʻm”. Bo‘sh = 0.
- Har bir xarajat guruhi ekranida **“Bu oy bu xarajat yoʻq”** tugmasi — guruhdagi barcha maydonlarni 0 qilib keyingisiga o‘tadi.
- Har bir modda nomi ostida kichik izoh (quyidagi jadvaldagi “Izoh”).

| # | Ekran sarlavhasi | Maydon (id) — nomi — izoh |
| --- | --- | --- |
| 1 | Byudjet qaysi oy uchun? | `oy` — oylar ro‘yxati, keyingi oy oldindan tanlangan (bugun 2026-yil oktabr → “Noyabr 2026”). Izoh: “Byudjet har doim keyingi oy uchun tuziladi.” |
| 2 | Rejadagi faol oʻquvchilar soni | `oquvchilar` — butun son. Izoh: “Joriy oy oxiridagi faol oʻquvchilar + kutilayotgan yangilar.” |
| 3 | Bir oʻquvchining oʻrtacha oylik toʻlovi | `tolov` — soʻm. Ekranda darhol: “Reja tushum: oʻquvchilar × toʻlov = … soʻm” |
| 4 | Ish haqi | `menejer_oylik` Menejer oylik · `menejer_avans` Menejer avans · `oqituvchi_oylik` Oʻqituvchi oylik · `oqituvchi_avans` Oʻqituvchi avans · `farrosh` Farrosh (avans va oylik) · `support` Support (avans va oylik). Izoh: “Avans va oylik qoʻshilib shu oyning ish haqi fondini beradi.” |
| 5 | Ijtimoiy soliq | `soliq` — avtomatik = 4-ekran yig‘indisi × 12%. Ko‘rsatiladi, menejer tasdiqlaydi; qo‘lda o‘zgartirish mumkin (ogohlantirish chiqadi). |
| 6 | Bonuslar | `daraja_bonusi` Daraja bonusi — “Ustozlar va moderatorlarning daraja bonuslari va ragʻbatlar” · `natija_bonusi` Natijalar bonusi — “IELTS, SAT, TOPIK va Milliy sertifikat natijalari uchun” |
| 7 | Bino | `arenda` Arenda — “Markaz arendasi” · `elektr` Elektr energiya · `suv` Suv · `chiqindi` Chiqindi. Izoh: “Kommunal — shu byudjet oyiga tegishli summa.” |
| 8 | Aloqa va bank | `telefon_internet` Telefon va Internet — “Wi-Fi, SMS, kassa apparati, korporativ boʻlmagan raqamlarga Paynet” · `bank` Bank xizmatlari — “Plastikdan yechilgan pul va hisob raqamdagi foiz xarajat” |
| 9 | Ofis va xoʻjalik | `konstovar` Konstovar — “Kitoblar, list, ruchka, daftar” · `xojalik` Xoʻjalik — “Tozalik vositalari, stakan, kofe, batareyka” · `kuler` Kuler suv — “Ichimlik suvi” · `ovqat` Ovqatlanish — “Abed va abed uchun mahsulotlar” · `dori` Dori-darmon — “Aptekadan olinadigan dorilar” |
| 10 | Marketing | `reklama` Reklama — “Reklama, oylik obunalar va blogerlar” · `media` Media — “Media avans va oyliklari, syomka uchun ijaraga olingan buyumlar” · `tadbirlar` Tadbirlar — “Bayram va tugʻilgan kunlar, sovgʻalar” |
| 11 | Taʼmir | `mayda_qurilish` Mayda qurilish — “Jihozlar uchun, bitta xarajat 1 000 000 soʻmdan kam” · `qayta_tamir` Qayta taʼmirlash — “Remont, bitta xarajat 1 000 000 soʻmdan koʻp” |
| 12 | Boshqa xarajatlar | `yolkira` Yoʻlkira — “Pochta, safar xizmati” · `qaytarish` Talaba pulini qaytarish — “Shartnoma bekor qilinishi kutilayotgan summa” · `markaziy_qomita` Markaziy qoʻmita uchun · Savol: “Filialingiz Chilonzor, Yakkasaroy yoki Shirinmi?” Ha/Yoʻq → “Ha” bo‘lsa `avaz_aka` Avaz aka maydoni ochiladi |
| 13 | Bu oy filialning asosiy maqsadi | `maqsad` — Oʻsish · Barqaror ishlash · Xarajatni qisqartirish |
| 14 | Oʻtgan oyga nisbatan jami xarajat | `ozgarish` — Kamayadi · Taxminan teng · 10% gacha oshadi · 10% dan koʻp oshadi |
| 15 | Rejadan tashqari katta xarajat bormi? | `katta_xarajat` — Ha · Yoʻq. “Ha” bo‘lsa `katta_izoh` matn maydoni (majburiy): “Qanday xarajat va nima uchun?” |

**Byudjetga kirmaydigan 3 modda** (so‘ralmaydi): “Boshqaga pulni oʻtkazish”, “Boshqa filialimizga oʻtkazish”, “Adashib kirim qilingan” — bular balans ko‘chirish va xato tuzatish, xarajat emas. Landingdagi “30 xarajat moddasi” — qo‘llanmadagi umumiy son; byudjetda 27 tasi ishlatiladi.

## 7. Natija mantiqi

Formulalar:
- Reja tushum = `oquvchilar × tolov`
- Ish haqi fondi = 4-ekran yig‘indisi; Soliq = fond × 12% (yoki qo‘lda kiritilgan)
- Jami xarajat = barcha summa maydonlari yig‘indisi (4–12-ekranlar)
- Foyda = tushum − xarajat; Marja = foyda ÷ tushum (tushum 0 bo‘lsa — qizil status, “Tushum kiritilmagan”)

Guruhlar va me’yorlar (tushumga nisbatan ulush). **Bu test bosqichi uchun taxminiy qiymatlar** — keyin haqiqiy raqamlarga almashtiriladi, shuning uchun ular `app.js` boshida bitta `MEYORLAR` obyektida turishi shart:

| Guruh (id) | Maydonlar | Me’yor | Oshsa chiqadigan tavsiya |
| --- | --- | --- | --- |
| `ishhaqi` Ish haqi + ijtimoiy soliq | 4–5-ekran | 45% | “Kam toʻlgan guruhlarni birlashtiring va oʻqituvchi soatini guruh toʻliqligi bilan solishtiring.” |
| `bonus` Bonuslar | 6-ekran | 5% | “Daraja va natija bonuslarini rejadagi sertifikat natijalari soni bilan asoslang.” |
| `bino` Bino (arenda + kommunal) | 7-ekran | 15% | “Arenda shartnomasi muddati va xona bandligini tekshiring; boʻsh soatlarga qoʻshimcha guruh qoʻying.” |
| `marketing` Marketing | 10-ekran | 7% | “Har bir reklama kanali uchun bitta lid narxini yozing; natija bermagan kanalni toʻxtating.” |
| `ofis` Ofis va xoʻjalik | 9-ekran | 4% | “Konstovar va xoʻjalik xaridini oyiga bir marta, roʻyxat boʻyicha qiling.” |
| `aloqa` Aloqa va bank | 8-ekran | 2% | “Bank komissiyasini kamaytirish uchun toʻlovlarni hisob raqamga oʻtkazing.” |
| `tamir` Taʼmir | 11-ekran | 3% | “Qayta taʼmirlash smetasini Moliya boʻlimi bilan oldindan kelishing.” |
| `boshqa` Boshqa | 12-ekran | me’yor yo‘q | — |

Status (chegaralar ham `STATUS_CHEGARA` obyektida: yashil 25%, qizil 10%):

| Status | Shart | Ekrandagi xulosa |
| --- | --- | --- |
| Yashil | Marja ≥ 25% **va** hech bir guruh me’yordan oshmagan | “Byudjet sogʻlom. Tasdiqlashga tayyor.” |
| Qizil | Marja < 10% **yoki** xarajat > tushum **yoki** 3 va undan ko‘p guruh oshgan | “Byudjetni qayta koʻrib chiqish kerak.” |
| Sariq | Qolgan barcha holatlar (marja 10–25% yoki 1–2 guruh oshgan) | “Tasdiqlanadi, lekin oshgan moddalarga izoh kerak.” |

Tavsiyalar: me’yordan eng ko‘p oshgan (punktlarda) 3 ta guruh tavsiyasi + maqsadga qarab bittasi:
- O‘sish: “Marketing meʼyordan oshishi mumkin, agar yangi oʻquvchilar rejasi bilan asoslangan boʻlsa.”
- Xarajatni qisqartirish: “Eng katta 3 modda: … Ularni 5% ga kamaytirish oyiga … soʻm tejaydi.” (hisoblab qo‘yiladi)
- Barqaror ishlash: “Oʻtgan oy darajasini saqlang, oshgan moddalarga izoh yozing.”
- Hech qaysi guruh oshmagan bo‘lsa: “Barcha guruhlar meʼyor ichida.”

Ogohlantirishlar (natijada va PDF’da sariq belgi bilan):
- `mayda_qurilish` > 1 000 000: “Bu summa Qayta taʼmirlash moddasiga tegishli boʻlishi mumkin.”
- `arenda` = 0 yoki `elektr`+`suv`+`chiqindi` = 0: “Bu oy arenda/kommunal toʻlovi yoʻqmi? Tekshiring.”
- Soliq qo‘lda o‘zgartirilib 12% dan farq qilsa: “Soliq summasi ish haqi fondining 12% iga mos emas.”
- `menejer_avans` > `menejer_oylik` yoki `oqituvchi_avans` > `oqituvchi_oylik`: “Avans oylikdan koʻp kiritilgan.”
- `ozgarish` = “10% dan koʻp oshadi” va `katta_xarajat` = “Yoʻq”: “Xarajat oʻsmoqda, lekin sababi koʻrsatilmagan.”

**Natija ekrani** (qisqa): status rangi + xulosa matni, 3 raqam (Tushum, Xarajat, Marja %), oshgan guruhlar soni. Ostida: “Toʻliq taqsimot, tavsiyalar va imzo varagʻi — PDF’da.” va formaga o‘tish tugmasi **“Tasdiqlashga yuborish va PDF olish”**.

## 8. Lid formasi

- Sarlavha: “Byudjetingiz tayyor. Tasdiqlashga yuborish va PDF olish uchun maʼlumotlarni kiriting.”
- `filial` — Filial nomi, qo‘lda yoziladi, placeholder: “Registon Shaxriston filiali” (kamida 3 belgi).
- `ism` — Masʼul ismi (kamida 2 belgi).
- `tel` — Telefon: `+998` prefiksi oldindan turadi, keyin 9 raqam, `+998 90 123 45 67` ko‘rinishida formatlanadi. Operator kodi ro‘yxatdan bo‘lishi kerak: 20, 33, 50, 55, 77, 88, 90, 91, 93, 94, 95, 97, 98, 99. Xato bo‘lsa: “Raqamni +998 XX XXX XX XX koʻrinishida kiriting.”
- Uchala maydon to‘g‘ri bo‘lmaguncha tugma faol emas. PDF berilmaydi.

## 9. PDF hisobot (jsPDF, A4, 2 sahifa)

- Shrift: `fonts/*.ttf` ni `fetch` qilib base64 ga o‘tkazib, `addFileToVFS` + `addFont` bilan ulash. Standart Helvetica ishlatilmasin — u ʻ belgisini chiqarmaydi.
- **1-sahifa:** yuqorida logo (`assets/logo.png`) va to‘q sariq chiziq; sarlavha “Filial byudjeti — Noyabr 2026”; blok: Filial, Masʼul, Telefon, Tuzilgan sana, Byudjet kodi. Xulosa bloki: status rangi va matni, Reja tushum, Jami xarajat, Foyda, Marja. Guruhlar jadvali: guruh, summa, ulush %, me’yor, belgi (oshgan bo‘lsa qizil). Ogohlantirishlar, 3 tavsiya, 15-savoldagi izoh.
- **2-sahifa:** 27 modda bo‘yicha to‘liq taqsimot (guruhlab): modda, summa, ulush %. Pastda tasdiqlash bloki: “Filial rahbari: ______ (imzo)”, “Moliya boʻlimi: ______ (imzo)”, “Tasdiqlangan sana: ______”.
- Byudjet kodi: `BUD-YYMM-NNNN` (YYMM = byudjet oyi, NNNN = 4 tasodifiy raqam), masalan `BUD-2611-4821`.
- Summalar `120 320 000 soʻm` ko‘rinishida (minglik ajratgich — bo‘sh joy).
- Fayl avtomatik yuklanadi: `Byudjet_<filial>_<YYYY-MM>.pdf`, filial nomidagi bo‘sh joylar `_` ga, ʻ ʼ ' belgilari olib tashlanadi. Masalan: `Byudjet_Registon_Shaxriston_filiali_2026-11.pdf`.
- iPhone Safari’da ham yuklanishini tekshir (kerak bo‘lsa yangi oynada ochish zaxira yo‘li).

## 10. Telegram

`config.js`:
```js
window.CONFIG = {
  TELEGRAM_BOT_TOKEN: "",   // BotFather bergan kalit
  TELEGRAM_CHAT_ID: ""      // Moliya bo‘limi guruhining ID si (manfiy son, masalan -1001234567890)
};
```

Tartib: **avval PDF yuklanadi, keyin Telegram’ga yuboriladi.** Telegram xatosi foydalanuvchining PDF olishiga hech qachon to‘sqinlik qilmaydi.

1. `sendMessage` (POST `https://api.telegram.org/bot<TOKEN>/sendMessage`) — matn:
```
💰 Yangi byudjet · Noyabr 2026
Filial: Registon Shaxriston filiali
Masʼul: Dilshod
Tel: +998 90 123 45 67
Tushum: 176 000 000
Xarajat: 120 320 000
Foyda: 55 680 000 (31.6%)
Status: 🟢 Yashil
Diqqat: yoʻq
Kod: BUD-2611-4821
```
   Sariq 🟡 / qizil 🔴 statusda “Diqqat” qatorida oshgan guruhlar: `Ish haqi 48.0% (meʼyor 45%), Marketing 18.2% (meʼyor 7%), Taʼmir 10.3% (meʼyor 3%)`. 15-savolda izoh bo‘lsa — alohida qator “Katta xarajat: …”.
2. `sendDocument` (FormData: `chat_id`, `document` = PDF Blob fayl nomi bilan) — shu PDF guruhga ham tushadi.
3. Har bir so‘rov 10 soniya timeout bilan. Muvaffaqiyat: “Byudjet Moliya boʻlimiga yuborildi.” Xato yoki kalit bo‘sh: “PDF yuklandi. Moliya boʻlimiga yuborilmadi — faylni guruhga oʻzingiz tashlang.”

Xavfsizlik: statik saytda bot kaliti kodda ochiq turadi. Shuning uchun bu ish uchun **alohida bot** ochiladi va faqat shu guruhga qo‘shiladi; kalit oshkor bo‘lsa BotFather’da almashtiriladi. README’da shu ogohlantirish bo‘lsin.

## 11. Sinov ssenariylari (demo uchun)

**A — yashil.** oquvchilar 320, tolov 550 000 → tushum 176 000 000.
menejer_oylik 6 000 000; menejer_avans 3 000 000; oqituvchi_oylik 36 000 000; oqituvchi_avans 14 000 000; farrosh 3 000 000; support 4 000 000; soliq (avto) 7 920 000; daraja_bonusi 3 000 000; natija_bonusi 1 000 000; arenda 18 000 000; elektr 2 000 000; suv 800 000; chiqindi 700 000; telefon_internet 900 000; bank 1 200 000; konstovar 2 000 000; xojalik 1 200 000; kuler 400 000; ovqat 1 500 000; dori 100 000; reklama 7 000 000; media 2 000 000; tadbirlar 1 500 000; mayda_qurilish 800 000; qayta_tamir 0; yolkira 300 000; qaytarish 2 000 000; markaziy_qomita 0; Avaz aka — Yoʻq. Maqsad: Barqaror; o‘zgarish: Taxminan teng; katta xarajat: Yoʻq.
**Kutilgan:** xarajat 120 320 000, foyda 55 680 000, marja 31.6%, hech bir guruh oshmagan → **Yashil**.

**B — qizil.** A bilan bir xil, faqat: oquvchilar 280 (tushum 154 000 000); reklama 20 000 000; tadbirlar 6 000 000; qayta_tamir 15 000 000.
**Kutilgan:** xarajat 152 820 000, foyda 1 180 000, marja 0.8%; oshgan guruhlar: Ish haqi 48.0%, Marketing 18.2%, Ta’mir 10.3% → **Qizil**.

Bu ikki ssenariyni avtomatik tekshiradigan kichik test yoz (masalan `tests/hisob.test.html` yoki Node skript) — hisob-kitob funksiyasi alohida, DOM’siz bo‘lsin.

## 12. Qabul qilish (demo tartibi)

1. Telefondan saytni oching va A ssenariy bilan so‘rovnomani oxirigacha o‘ting.
2. Filial va raqam qoldiring — PDF yuklanadi, o‘zbekcha harflar to‘g‘ri o‘qiladi.
3. Moliya bo‘limi guruhida byudjet xabari va PDF paydo bo‘ladi.
4. B ssenariy bilan qayta o‘ting — status qizil, ogohlantirish va tavsiyalar o‘zgaradi.

Baholash: 30 — zanjir oxirigacha ishlaydi (forma → PDF → Telegram); 25 — natija mantiqi va PDF mazmuni foydali; 20 — brend va dizayn; 15 — mobil qulaylik va matnlar; 10 — 3 daqiqalik jonli demo.
Topshirish: jamoa nomi, sayt havolasi va guruhga tushgan test byudjetning skrinshoti.

## 13. Ishlash tartibi (Claude Code uchun)

1. Avval hisob-kitob (`hisobla()` funksiyasi) va uning testini yoz, A/B ssenariy raqamlari mos kelishini tekshir.
2. Keyin ekranlar, keyin PDF, keyin Telegram.
3. Lokal tekshirish: `python3 -m http.server 8000` (fayl to‘g‘ridan-to‘g‘ri ochilsa shrift `fetch` ishlamaydi). Telefon o‘lchami 390×844 da skrinshot olib ko‘r.
4. PDF’ni ochib, ʻ ʼ belgilari, jadval va logo to‘g‘ri chiqqanini ko‘zdan kechir.
5. `README.md` ni o‘zbekcha yoz: (a) BotFather’da bot ochish, (b) botni guruhga qo‘shish, (c) guruh ID sini `https://api.telegram.org/bot<TOKEN>/getUpdates` orqali topish, (d) `config.js` ni to‘ldirish, (e) GitHub’da repozitoriy ochib, Settings → Pages → “Deploy from a branch” → `main` / root orqali joylash.
6. Git commit xabarlari o‘zbekcha.

## 14. Hali ochiq qarorlar (CFO hal qiladi, kod ularni oson o‘zgartirishga tayyor bo‘lsin)

- Status chegaralari (25% / 10%) — `STATUS_CHEGARA` da.
- “Markaziy qoʻmita” va “Avaz aka” filial byudjetida turadimi — hozircha turadi, “Boshqa” guruhida.
- Byudjetni topshirish muddati (masalan, har oyning 25-sanasi) — hozircha saytda ko‘rsatilmaydi; `config.js` ga `MUDDAT` qo‘shib qo‘y, bo‘sh bo‘lsa ko‘rinmaydi.
