# 🎨 UI/UX Design Specification (DESIGN.md)
**Project:** Sistem Informasi Keuangan Masjid (SI-KEMAS)
**Version:** 1.0

## 1. Design Philosophy
Desain SI-KEMAS dibangun dengan mengutamakan **aksesibilitas dan kejelasan (clarity)**. Mengingat pengguna utama adalah pengurus masjid (rentang usia 40-60+ tahun), antarmuka harus menanamkan rasa percaya (trustworthy), tidak membingungkan (uncluttered), dan mudah dibaca tanpa kacamata baca khusus.

**Prinsip Utama:**
*   **Aksesibilitas Pertama:** Area sentuh (touch targets) yang besar dan kontras teks yang tinggi.
*   **Beban Kognitif Rendah:** Jangan menyembunyikan fitur di balik menu yang rumit. Tampilkan aksi utama secara langsung.
*   **Figma-Quality Cleanliness:** Menggunakan ruang kosong (whitespace) yang luas dan bayangan (shadow) yang sangat halus untuk membedakan elemen, bukan menggunakan garis tepi (border) yang tebal dan kaku.

---

## 2. Color Palette
Sistem warna dipilih untuk memberikan kesan tenang, profesional, dan menyoroti status finansial dengan jelas.

| Penggunaan | Warna | Kode Hex | Keterangan |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | Navy Blue | `#1E3A8A` | Digunakan untuk Navbar, Judul Halaman, dan teks utama. |
| **Background (Canvas)** | Off-White | `#F9FAFB` | Latar belakang utama aplikasi agar mata tidak cepat lelah (bukan putih murni). |
| **Surface (Cards/Forms)** | Pure White | `#FFFFFF` | Latar belakang untuk kartu metrik, form, dan tabel data. |
| **Accent: Income / Success** | Emerald Green | `#10B981` | Warna teks metrik pemasukan dan tombol 'Simpan'. |
| **Accent: Expense / Danger**| Orange / Red | `#F97316` | Warna teks metrik pengeluaran dan tombol 'Hapus'. |
| **Borders / Dividers** | Slate 200 | `#E2E8F0` | Garis pemisah tabel yang sangat tipis dan halus. |

---

## 3. Typography
Tipografi difokuskan pada keterbacaan angka dan label data. Disarankan menggunakan font Sans-Serif modern seperti **Inter** atau **Roboto**.

*   **Heading 1 (Page Titles):** 24px, Font Weight: Semi-Bold.
*   **Metric Numbers (Angka Saldo):** 36px - 48px, Font Weight: Bold, Tracking: Tight (Rapat).
*   **Body Text & Table Data:** 16px (Minimum absolute), Font Weight: Regular.
*   **Small Labels:** 14px, Font Weight: Medium, Text Color: Slate 500 (`#64748B`).

---

## 4. Component Guidelines

### A. Cards (Kartu Kontainer)
Digunakan untuk mengelompokkan informasi seperti ringkasan metrik dan form input.
*   **Border Radius:** Besar (`1.5rem` atau `24px`) untuk kesan ramah.
*   **Shadow:** Bayangan menyebar dan sangat halus. *CSS parameter: `box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);`*
*   **Border:** Tidak ada border (No border), pemisahan visual murni mengandalkan shadow dan kontras antara Surface White dan Canvas Off-White.

### B. Buttons (Tombol Aksi)
Dirancang agar ramah layar sentuh (touch-friendly) untuk pengguna tablet atau HP.
*   **Minimum Height:** 48px (Sangat penting untuk aksesibilitas jari).
*   **Padding:** Horizontal minimum 24px.
*   **Border Radius:** `0.75rem` atau `12px`.
*   **Primary Button:** Background warna solid dengan teks putih.
*   **Secondary Button:** Background transparan/putih dengan border 1px warna Primary.

### C. Forms (Input Data)
*   **Input Fields:** Tinggi minimum 56px.
*   **Placeholder:** Gunakan contoh data yang jelas (misal: "Contoh: Rp 150.000").
*   **Feedback:** Berikan warna latar hijau muda/merah muda yang tipis jika input berhasil/gagal divalidasi.

### D. Data Tables (Buku Kas)
*   **Header Tabel:** Gunakan warna latar abu-abu kebiruan terang (`#F1F5F9`) untuk membedakan dengan baris data.
*   **Baris (Rows):** Terapkan efek *hover* (perubahan warna latar belakang menjadi sangat abu-abu terang) ketika kursor diarahkan, untuk membantu mata pengguna usia lanjut membaca satu baris dari kiri ke kanan.

---

## 5. Layout & Grid System
*   **Max Width:** Kontainer utama dibatasi maksimal `1200px` di layar desktop agar mata tidak perlu membaca dari ujung ke ujung layar.
*   **Spacing (Margin/Padding):** Gunakan kelipatan `8px`. Spasi antar *section* (misal dari Kartu Saldo ke Tabel) minimal `32px` atau `48px` (generous whitespace).
