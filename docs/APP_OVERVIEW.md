# MasukPTN - Platform Persiapan UTBK/SNBT

## Tentang MasukPTN

**MasukPTN** adalah platform web berbasis latihan soal dan simulasi ujian untuk siswa SMA/sederajat di Indonesia yang mempersiapkan diri menghadapi **UTBK (SNBT)** dan **TKA (Tes Kemampuan Akademik)**.

### Target Pengguna

- Siswa SMA/MA/SMK kelas 10-12 di Indonesia
- Usia 15-18 tahun
- Antarmuka Bahasa Indonesia

### Filosofi Desain

Platform ini mengusung estetika **Industrial Web Design** — utilitarian, teknikal, dan fungsional. Desain mengutamakan kejelasan konten, kecepatan interaksi, dan konsistensi visual tanpa dekorasi yang tidak perlu.

---

## Fitur Utama

### 1. Landing Page

Halaman depan yang menampilkan:

- **Hero Section** — Headline utama dan call-to-action untuk memulai latihan
- **Features Grid** — Grid fitur utama platform (Practice Mode, Tryout Mode, Analytics)
- **Testimonials** — Testimoni pengguna (opsional untuk roadmap)

### 2. Autentikasi

Sistem autentikasi menggunakan **Supabase Auth**:

- Sign in dengan email + password
- Sign up dengan email + password
- Profile minimal (nama opsional, asal sekolah opsional)
- Tidak ada mode guest (login wajib)

### 3. Practice Mode (Mode Latihan)

Mode latihan yang dioptimasi untuk **learning loop cepat**:

- **Pilihan Question Set** — Pilih set soal berdasarkan subtest (PU, PPU, PBM, PK, LBI, LBE) atau mata pelajaran TKA
- **Mode Waktu** — Relaxed (default) atau Timed
- **Feedback Instan** — Penjelasan muncul segera setelah menjawab
- **Two-Level Explanations**:
  - **Level 1**: Rationale singkat (kenapa jawaban benar, kenapa jawaban salah)
  - **Level 2**: Step-by-step solution (opsional, untuk soal matematika/logika)
- **Redo Incorrect** — Ulangi hanya soal yang salah

### 4. Tryout Mode (Simulasi Ujian)

Simulasi ujian full yang meniru resmi UTBK:

- **Blueprint Engine** — Struktur ujian versi (UTBK_2025, UTBK_2026, dll)
- **Server-Authoritative Timing** — Waktu dihitung di server untuk mencegah manipulasi
- **Per-Section Countdown** — 30 detik countdown sebelum setiap subtest dimulai
- **Question Palette** — Palet soal dengan indikator status (answered = hijau)
- **Navigation** — Previous/Next, jump-to-question, zoom controls
- **Review Mode** — Penjelasan hanya muncul setelah tryout selesai

### 5. Analytics Dashboard

Dashboard performa pengguna:

- **Overall Metrics**:
  - Total soal dikerjakan
  - Akurasi keseluruhan
  - Total waktu belajar
- **Per-Subtest/Subject Breakdown**:
  - Akurasi per subtest/mata pelajaran
  - Rata-rata waktu per soal
  - Tren 7/30 hari terakhir
- **Recommendations**:
  - Identifikasi subtest terlemah
  - Saran latihan selanjutnya

### 6. Admin Panel

Panel manajemen konten (MVP-Lite):

- **Question Editor** — Buat/edit soal dengan markdown
- **Question Set Builder** — Susun soal menjadi curated set
- **Publish Control** — Status draft/published per soal
- **Blueprint Management** — Konfigurasi struktur tryout

---

## Brand Guidelines

### Design Philosophy

**Industrial Web Design** — Estetika utilitarian dan teknikal:

- Minimalis tapi tidak kosong
- Fokus pada konten dan fungsi
- Konsistensi visual yang ketat
- Tidak ada dekorasi yang tidak perlu

### Color System

Platform menggunakan format **OKLCH** untuk konsistensi light/dark mode.

#### Light Mode Tokens

```css
--background: oklch(1 0 0);           /* Putih murni */
--foreground: oklch(0.145 0 0);       /* Hampir hitam */
--card: oklch(1 0 0);
--card-foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);          /* Gelap utama */
--primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.97 0 0);         /* Abu-abu muda */
--secondary-foreground: oklch(0.205 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);
--accent: oklch(0.97 0 0);
--accent-foreground: oklch(0.205 0 0);
--destructive: oklch(0.58 0.22 27);   /* Merah */
--border: oklch(0.922 0 0);
--input: oklch(0.922 0 0);
--ring: oklch(0.708 0 0);
```

#### Dark Mode Tokens

```css
--background: oklch(0.145 0 0);       /* Hampir hitam */
--foreground: oklch(0.985 0 0);       /* Putih */
--card: oklch(0.205 0 0);
--card-foreground: oklch(0.985 0 0);
--primary: oklch(0.87 0 0);           /* Terang utama */
--primary-foreground: oklch(0.205 0 0);
--secondary: oklch(0.269 0 0);
--secondary-foreground: oklch(0.985 0 0);
--muted: oklch(0.269 0 0);
--muted-foreground: oklch(0.708 0 0);
--accent: oklch(0.371 0 0);
--accent-foreground: oklch(0.985 0 0);
--destructive: oklch(0.704 0.191 22.216);
--border: oklch(1 0 0 / 10%);
--input: oklch(1 0 0 / 15%);
--ring: oklch(0.556 0 0);
```

#### Chart Colors (Same for both modes)

```css
--chart-1: oklch(0.809 0.105 251.813);  /* Biru muda */
--chart-2: oklch(0.623 0.214 259.815);  /* Biru medium */
--chart-3: oklch(0.546 0.245 262.881);  /* Biru gelap */
--chart-4: oklch(0.488 0.243 264.376);  /* Ungu */
--chart-5: oklch(0.424 0.199 265.638);  /* Ungu gelap */
```

### Typography

**Primary Font**: JetBrains Mono Variable (Google Fonts)

- Font: monospace
- Variable: `--font-sans`
- Digunakan untuk semua teks (headings, body, UI)

**Secondary Fonts** (opsional untuk variasi):
- Geist Sans (`--font-geist-sans`)
- Geist Mono (`--font-geist-mono`)

### Border Radius

Sistem radius minimal dan konsisten:

```css
--radius: 0.625rem;   /* Base radius */
--radius-sm: calc(var(--radius) - 4px);   /* 2.5px */
--radius-md: calc(var(--radius) - 2px);   /* 5px */
--radius-lg: var(--radius);               /* 10px */
--radius-xl: calc(var(--radius) + 4px);   /* 14px */
--radius-2xl: calc(var(--radius) + 8px);  /* 18px */
--radius-3xl: calc(var(--radius) + 12px); /* 22px */
--radius-4xl: calc(var(--radius) + 16px); /* 26px */
```

### Component System

Platform menggunakan **shadcn/ui** dengan custom tokens:

- Base UI components dari shadcn/ui
- Custom theme dengan semantic tokens di atas
- Tailwind CSS 4 untuk styling
- Dark mode dengan class-based (`.dark` pada parent)

---

## Domain Knowledge

### UTBK Subtests

| Subtest | Nama | Deskripsi |
|---------|------|-----------|
| **PU** | Penalaran Umum | General Reasoning |
| **PPU** | Pengetahuan & Pemahaman Umum | General Knowledge |
| **PBM** | Pengetahuan Kuantitatif | Quantitative Knowledge |
| **PK** | Penalaran Matematika | Mathematical Reasoning |
| **LBI** | Literasi Bahasa Indonesia | Indonesian Literacy |
| **LBE** | Literasi Bahasa Inggris | English Literacy |

### TKA Subjects

**Wajib** (SMA/SMK):
- Bahasa Indonesia
- Matematika
- Bahasa Inggris

**Pilihan** (2 mata pelajaran):
- Fisika, Kimia, Biologi
- Ekonomi, Sosiologi, Geografi
- Sejarah, PPKn
- Produk/Projek Kreatif dan Kewirausahaan

### Question Types

1. **Single-Choice** — Pilihan ganda A-E
2. **Complex Selection** — Tabel dengan dua pilihan per baris
3. **Fill-in** — Isian singkat (rumpang)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | Framework React dengan App Router |
| **Supabase** | Database hosting & auth |
| **Drizzle ORM** | Database ORM |
| **shadcn/ui** | Component library |
| **Tailwind CSS 4** | Styling framework |
| **PostgreSQL** | Database (via Supabase) |
| **TypeScript 5+** | Language |
| **Bun** | Package manager & runtime |

---

## Documentation Structure

| File | Description |
|------|-------------|
| `CLAUDE.md` | Project instructions (root monorepo) |
| `docs/APP_OVERVIEW.md` | This file — application overview |
| `docs/DEPLOYMENT.md` | Deployment guide |
