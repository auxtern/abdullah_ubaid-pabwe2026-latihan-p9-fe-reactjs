# Abdullah Ubaid - PABWE 2026 Praktikum 9 — Todolist Frontend (ReactJS)

Frontend Single Page Application (SPA) modern untuk aplikasi Todolist dengan arsitektur **Feature-First Approach & TDD (100% Code Coverage)**, mengacu pada struktur proyek **Praktikum 4** (`helpers/`, `hooks/`, dan `features/<feature>/{api,components,modals}`).

---

## 📁 Struktur Proyek (Mengacu Praktikum 4)

```text
src/
├── helpers/
│   ├── apiHelper.js            # Wrapper fetch API terpusat & manajemen token
│   ├── apiHelper.test.js
│   ├── toolsHelper.js          # Helper dialog (alert/confirm) & formatDate
│   └── toolsHelper.test.js
├── hooks/
│   ├── useInput.js             # Custom hook state two-way data binding
│   └── useInput.test.js
├── features/
│   ├── admin/
│   │   ├── api/
│   │   │   ├── adminApi.js     # API monitoring user & todo
│   │   │   └── adminApi.test.js
│   │   └── components/
│   │       ├── AdminDashboard.jsx
│   │       └── AdminDashboard.test.jsx
│   ├── auth/
│   │   ├── api/
│   │   │   ├── authApi.js      # API login, register, profil
│   │   │   └── authApi.test.js
│   │   └── modals/
│   │       ├── AuthModal.jsx   # id="login-username", id="login-password", id="login-submit"
│   │       └── AuthModal.test.jsx
│   ├── template/
│   │   ├── api/
│   │   │   ├── templateApi.js  # API template publik & clone template
│   │   │   └── templateApi.test.js
│   │   └── components/
│   │       ├── TemplateCatalog.jsx
│   │       └── TemplateCatalog.test.jsx
│   └── todo/
│       ├── api/
│       │   ├── todoApi.js      # API todo CRUD, toggle status, AI generator
│       │   └── todoApi.test.js
│       ├── components/
│       │   ├── TodoList.jsx    # List view ringkas + Kebab menu (⋮)
│       │   ├── TodoList.test.jsx
│       │   ├── TodoStats.jsx   # 3 kartu statistik ringkasan
│       │   └── TodoStats.test.jsx
│       └── modals/
│           ├── TodoModal.jsx        # Full-screen modal (tambah/ubah tugas)
│           ├── TodoModal.test.jsx
│           ├── TodoDetailModal.jsx  # Full-screen modal detail tugas
│           ├── TodoDetailModal.test.jsx
│           ├── AiGeneratorModal.jsx # Full-screen modal AI generator
│           └── AiGeneratorModal.test.jsx
├── App.jsx
├── App.test.jsx
├── main.jsx
└── setupTests.js
```

---

## 🚀 Fitur Antarmuka (UI/UX)

1. **List View Ringkas & Kebab Menu (`⋮`)**:
   - Menampilkan daftar todolist dalam format list view yang bersih (tanpa deskripsi panjang di baris utama).
   - Menu kebab vertikal (`⋮`) menyediakan akses ke **Detail** (ikon mata), **Ubah Edit** (ikon pensil), dan **Hapus** (ikon tempat sampah).

2. **Ringkasan Statistik Real-time**:
   - Menampilkan kartu ringkasan interaktif: **Total Todo**, **Total Selesai**, dan **Belum Selesai**.

3. **Modal Dialog Full-Screen**:
   - Modal Tambah dan Ubah tugas dirancang layar penuh dengan warna latar header (Indigo) dan footer (Slate) yang kontras, serta tombol aksi rata kanan.

4. **Katalog Template Publik & Kloning**:
   - Pengunjung umum (guest) dapat menjelajahi galeri template publik dan membaca detail tugas di dalamnya.
   - Pengguna terdaftar dapat mengkloning template publik menjadi todolist pribadi dengan satu klik.

5. **AI Todo Generator (OpenAI)**:
   - Formulir interaktif dengan input prompt dan jumlah todo (`type="number"`).
   - Dilengkapi pratinjau hasil AI dan opsi simpan massal ke basis data.

6. **Panel Pengawasan Admin**:
   - Tabel monitoring seluruh pengguna terdaftar dan inspeksi tugas pengguna lain dalam mode baca saja (read-only).

7. **Standarisasi Form Login**:
   - Form autentikasi dilengkapi ID standar: `id="login-username"`, `id="login-password"`, `id="login-submit"`.

---

## 🧪 Menjalankan Pengujian (100% Coverage)

```bash
npm test
```
*Seluruh pengujian unit dan integrasi (17 test suite, 43 test case) lulus dengan **100% Statement & Line Coverage**.*

---

## 🏃 Menjalankan Aplikasi

```bash
# Menjalankan Vite dev server:
npm install
npm run dev
```
- Frontend aktif pada: `http://localhost:5173`
- Request `/api/*` secara otomatis di-proxy ke Backend Golang Gin (`http://localhost:7071`).

---

## 📦 Build Static untuk Deployment Mandiri

```bash
npm run build
```
Output berkas statis dihasilkan di folder `dist/` dan siap dideploy secara mandiri ke layanan hosting statis (seperti Vercel, Netlify, atau Cloudflare Pages).
