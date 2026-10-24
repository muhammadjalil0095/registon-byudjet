# Registon — Filial byudjeti sayti

Filial rahbari 15 ta qisqa savolga javob beradi, sayt keyingi oy byudjetini hisoblaydi, meʼyorlarga solishtiradi va imzolanadigan PDF beradi. Shu PDF va qisqa xabar Moliya boʻlimining Telegram guruhiga avtomatik tushadi.

Sayt toʻliq brauzerda ishlaydi: server, baza, oylik toʻlov kerak emas.

---

## 1. Telegram botni ulash (bir marta, 10 daqiqa)

> **Muhim — xavfsizlik.** Bot kaliti saytning `config.js` faylida ochiq turadi va uni istalgan odam koʻra oladi. Shuning uchun:
> - faqat shu ish uchun **alohida, yangi bot** oching (boshqa botlaringizni ishlatmang);
> - botni **faqat Moliya boʻlimi guruhiga** qoʻshing;
> - kalit begona qoʻlga tushdi deb oʻylasangiz, BotFather’da `/revoke` buyrugʻi bilan kalitni almashtiring va `config.js` ga yangisini yozing.

**a) Bot ochish.** Telegram’da `@BotFather` ni toping → `/newbot` yozing → botga nom bering (masalan, “Registon Byudjet”) → username bering (oxiri `bot` bilan tugashi shart, masalan `registon_byudjet_bot`). BotFather sizga kalit (token) beradi, u shunga oʻxshaydi: `7123456789:AAHk...`. Uni nusxalab qoʻying.

**b) Botni guruhga qoʻshish.** Moliya boʻlimi guruhini oching → guruh nomi → “Aʼzo qoʻshish” → botning username’ini yozib qoʻshing. Soʻng guruhga istalgan xabar yozing, masalan “salom”.

**c) Guruh ID sini topish.** Brauzerda quyidagi manzilni oching (`<TOKEN>` oʻrniga oʻz kalitingizni qoʻying):

```
https://api.telegram.org/bot<TOKEN>/getUpdates
```

Ochilgan matndan `"chat":{"id":-100…` qismini toping. Minus belgisi bilan boshlanadigan son — guruh ID si (masalan `-1001234567890`). Agar boʻsh `[]` chiqsa, guruhga yana bitta xabar yozib, sahifani yangilang.

**d) `config.js` ni toʻldirish.** Papkadagi `config.js` faylini istalgan matn muharririda (Bloknot ham boʻladi) oching va qoʻshtirnoq ichiga yozing:

```js
window.CONFIG = {
  TELEGRAM_BOT_TOKEN: "7123456789:AAHk...",
  TELEGRAM_CHAT_ID: "-1001234567890",
  MUDDAT: "har oyning 25-sanasigacha"
};
```

`MUDDAT` ixtiyoriy: yozsangiz, bosh sahifada “Topshirish muddati: …” chiqadi; boʻsh qoldirsangiz, koʻrinmaydi.

Kalit yoki ID boʻsh/xato boʻlsa ham sayt ishlayveradi: filial PDF’ni oladi va ekranda “PDF yuklandi. Moliya boʻlimiga yuborilmadi — faylni guruhga oʻzingiz tashlang.” degan yozuv chiqadi.

---

## 2. Saytni internetga joylash (GitHub Pages, bepul)

1. [github.com](https://github.com) da roʻyxatdan oʻting (agar akkauntingiz boʻlmasa).
2. Oʻng yuqoridagi **+** → **New repository**. Nomi: masalan `registon-byudjet`. **Public** ni tanlang → **Create repository**.
3. Ochilgan sahifada **uploading an existing file** havolasini bosing va `byudjet` papkasining **ichidagi** barcha fayl va papkalarni (`index.html`, `app.js`, `assets`, `fonts`, `vendor` va h.k.) sudrab tashlang → **Commit changes**.
4. Repozitoriyda **Settings** → chap menyuda **Pages** → “Build and deployment” boʻlimida **Source: Deploy from a branch** → Branch: **main**, papka: **/ (root)** → **Save**.
5. 1–2 daqiqadan soʻng shu sahifada sayt manzili chiqadi: `https://<username>.github.io/registon-byudjet/`. Shu havolani filial rahbarlariga yuboring.

Keyinchalik biror faylni (masalan, `config.js` yoki meʼyorlarni) oʻzgartirsangiz — repozitoriyda faylni ochib, qalam belgisini bosib tahrirlang yoki yangisini qayta yuklang. Sayt 1–2 daqiqada yangilanadi.

---

## 3. Meʼyorlar va chegaralarni oʻzgartirish

Hammasi `app.js` faylining eng boshida:

- `MEYORLAR` — har bir xarajat guruhining tushumga nisbatan meʼyori (%). Hozirgi qiymatlar **test uchun taxminiy**.
- `STATUS_CHEGARA` — yashil (marja ≥ 25%) va qizil (marja < 10%) chegaralari, hamda nechta guruh oshganda qizil boʻlishi (3).
- `SOLIQ_FOIZI` — ijtimoiy soliq (12%).

Faqat raqamlarni almashtiring, vergul va qavslarga tegmang.

---

## 4. Tekshirish

- **Hisob-kitob testi:** saytni ochib, manzil oxiriga `tests/hisob.test.html` qoʻshing (masalan `https://<username>.github.io/registon-byudjet/tests/hisob.test.html`). Hujjatdagi A (yashil) va B (qizil) ssenariylar tekshiriladi; hammasi toʻgʻri boʻlsa “Hammasi toʻgʻri” yozuvi chiqadi.
- **Kompyuterda ochish:** `index.html` ni ikki marta bosib ochsangiz, PDF shriftlari yuklanmaydi (brauzer cheklovi). Kompyuterda sinash uchun papkada kichik server kerak (masalan, `npx serve` yoki `python -m http.server 8000`). Internetga joylangan saytda bu muammo yoʻq.

---

## 5. Fayllar

| Fayl | Nima uchun |
| --- | --- |
| `index.html` | Sahifa |
| `styles.css` | Dizayn (Registon ranglari, Montserrat shrifti) |
| `app.js` | Meʼyorlar, moddalar roʻyxati va hisob-kitob |
| `ui.js` | Ekranlar: bosh sahifa, 15 savol, natija, forma |
| `pdf.js` | PDF hisobot (2 sahifa) |
| `telegram.js` | Telegram guruhga yuborish |
| `config.js` | Bot kaliti, guruh ID, topshirish muddati |
| `tests/` | Hisob-kitob testi |
| `assets/`, `fonts/`, `vendor/` | Logo, shriftlar, PDF kutubxonasi |
