    2. Tumpukan teknologi
    Frontend
    Next.js

    TypeScript

    Tailwind CSS

    UI yang responsif dan mengutamakan desktop (desktop-first)

    Backend
    Node.js

    Express.js

    TypeScript

    Prisma 7

    PostgreSQL

    Penyimpanan objek
    Backblaze B2 adalah pilihan sementara.

    Gunakan antarmuka yang kompatibel dengan S3 jika didukung.

    Bucket harus privat.

    Bungkus panggilan penyedia dalam adaptor penyimpanan internal sehingga perubahan penyedia di masa depan tidak menyebar melalui logika bisnis.

    Repositori yang ada
    Plaintext
    fullstack-project/
    ├── backend/
    └── frontend/
    Pertahankan pemisahan ini. Jangan memindahkan API backend ke dalam penangan rute (route handlers) Next.js.

    3. Gaya arsitektur
    Pilihan pasti antara Monolit Modular (Modular Monolith) dan Usaha Mikro (Microservices) ditunda. Untuk MVP, implementasikan satu backend Express dengan batas fitur yang jelas dan tanpa infrastruktur usaha mikro terdistribusi. Ini adalah rekomendasi implementasi, bukan keputusan produk yang dikonfirmasi secara terpisah.

    Modul backend yang disarankan:

    auth

    users

    semesters

    courses

    folders

    files

    favorites

    trash

    storage

    upload-reservations

    search

    account-deletion

    Modul dapat memanggil layanan aplikasi bersama (shared application services), tetapi tidak boleh merambah ke dalam implementasi internal modul lain secara sembarangan.

    4. Pelapisan backend yang disarankan
    Plaintext
    backend/src/
    ├── app.ts
    ├── server.ts
    ├── config/
    ├── middleware/
    │   ├── authenticate.ts
    │   ├── rate-limit.ts
    │   ├── validate.ts
    │   └── error-handler.ts
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.routes.ts
    │   │   ├── auth.controller.ts
    │   │   ├── auth.service.ts
    │   │   ├── auth.repository.ts
    │   │   └── auth.schemas.ts
    │   ├── files/
    │   ├── folders/
    │   ├── semesters/
    │   ├── courses/
    │   ├── favorites/
    │   ├── trash/
    │   ├── storage/
    │   ├── uploads/
    │   ├── search/
    │   └── account-deletion/
    ├── shared/
    │   ├── errors/
    │   ├── types/
    │   ├── utils/
    │   └── services/
    └── prisma/
    Tanggung jawab lapisan:

    Routes: Pemetaan URL/metode dan middleware.

    Controllers: Input/output HTTP; orkestrasi tipis saja.

    Services: Aturan bisnis dan batas transaksi.

    Repositories: Kueri Prisma dan detail persistensi.

    Schemas: Validasi permintaan.

    Shared: Infrastruktur yang dapat digunakan kembali, bukan tempat pembuangan logika fitur.

    5. Rekomendasi struktur frontend
    Plaintext
    frontend/
    ├── app/
    │   ├── (auth)/
    │   └── (dashboard)/
    ├── components/
    │   ├── layout/
    │   ├── files/
    │   ├── folders/
    │   ├── upload/
    │   └── ui/
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── files/
    │   ├── folders/
    │   ├── semesters/
    │   ├── courses/
    │   ├── favorites/
    │   ├── trash/
    │   └── storage/
    ├── lib/
    │   ├── api-client.ts
    │   └── validators/
    ├── hooks/
    └── types/
    Sesuaikan ini dengan proyek yang ada alih-alih memaksakan restrukturisasi penuh. Jauhkan panggilan API dari komponen presentasional jika memungkinkan.

    6. Autentikasi dan siklus hidup permintaan
    Pengguna mengirimkan kredensial.

    Backend memverifikasi hash kata sandi.

    Backend membuat token sesi acak kriptografis.

    Simpan hanya hash dari token di PostgreSQL.

    Setel token mentah di cookie HttpOnly.

    Pada setiap permintaan yang dilindungi, backend melakukan hashing/pencarian token, memvalidasi kedaluwarsa/pencabutan, dan melampirkan konteks pengguna yang diautentikasi.

    Perbarui masa berlaku geser (sliding expiry) sesuai dengan kebijakan 7 hari.

    Keluar (logout) mencabut sesi saat ini dan menghapus cookie.

    Perubahan kata sandi mencabut semua sesi.

    Konfigurasi cookie:

    HttpOnly = true

    Secure = true dalam produksi

    Kebijakan SameSite yang sesuai berdasarkan model asal penerapan (deployment origin)

    Jalur/domain cookie yang sempit jika memungkinkan

    Perlindungan CSRF untuk permintaan yang mengubah status (state-changing)

    Daftar izin CORS yang ketat; kredensial hanya untuk asal frontend yang tepercaya

    7. Penegakkan kepemilikan wajib
    Ini adalah batasan keamanan, bukan sekadar perilaku frontend.

    Jangan pernah menerima ID pengguna dari peramban sebagai bukti kepemilikan.

    Dapatkan ID pemilik dari konteks sesi yang diautentikasi.

    Semua kueri untuk data milik pengguna harus menyertakan cakupan pemilik (owner scope).

    Untuk sumber daya bersarang, verifikasi setiap relasi milik pengguna yang sama.

    Jangan mengambil catatan secara global berdasarkan ID lalu berasumsi bahwa catatan tersebut aman untuk digunakan.

    URL presigned dikeluarkan hanya setelah otorisasi sisi server.

    Jaga agar bucket tetap privat dan kredensial hanya ada di server.

    Hindari mengembalikan kunci penyimpanan kecuali benar-benar diperlukan; jangan pernah memperlakukan kunci sebagai otorisasi.

    Buat pola layanan/repositori yang sadar kepemilikan dan dapat digunakan kembali serta pengujian otomatis.

    8. Arsitektur unggah
    Reservasi dan kuota
    Frontend meminta niat unggah (upload intent) dengan tujuan dan metadata file.

    Backend memvalidasi pengguna yang diautentikasi, kepemilikan tujuan, maksimal 100 MB, status yang diizinkan, dan kuota.

    Dalam transaksi database, pesan byte secara atomik dan buat UploadReservation.

    Terapkan tiga unggahan konkuren per pengguna; file tambahan tetap berada dalam antrean frontend atau status slot yang dikendalikan backend.

    Keluarkan otorisasi unggah berumur pendek untuk kunci objek.

    Transfer
    Peramban mentransfer langsung ke penyimpanan objek privat.

    Gunakan unggah multipart untuk file yang lebih besar bila didukung oleh API yang kompatibel dengan B2 S3 yang dipilih.

    Simpan ID unggah multipart penyedia di sisi server.

    Lacak bagian/kemajuan di sisi klien seperlunya.

    Jangan pernah mengekspos kredensial penyimpanan.

    Finalisasi
    Peramban memanggil endpoint penyelesaian backend.

    Backend memverifikasi keberadaan objek penyedia dan ukuran/checksum yang diharapkan jika didukung.

    Backend menyelesaikan metadata File dan transaksi akuntansi secara transaksional.

    Reservasi diselesaikan tepat satu kali.

    Pada kegagalan/kedaluwarsa, batalkan sesi multipart, hapus objek parsial/yatim piatu, lepaskan byte yang dipesan tepat satu kali.

    Jangan memproksi unggahan 100 MB melalui Express secara default.

    9. Arsitektur unduh dan pratinjau
    Peramban meminta akses ke file berdasarkan ID file aplikasi.

    Backend memeriksa sesi, kepemilikan, status aktif/bukan-Sampah, dan operasi yang diminta.

    Backend mengembalikan URL GET presigned berumur pendek atau respons pratinjau terkontrol.

    Bucket objek tetap privat.

    Gunakan disposition konten yang aman dan header respons.

    Pratinjau PDF dan gambar menggunakan halaman aplikasi khusus.

    Jangan menyimpan tautan publik permanen.

    10. Pekerjaan ZIP
    Validasi semua ID yang dipilih dan kepemilikan.

    Terapkan maksimal 500 file dan total ukuran sumber agregat 2 GB.

    Pertahankan hierarki folder di dalam arsip.

    Streaming objek sumber ke dalam output ZIP atau gunakan pemrosesan latar belakang untuk pekerjaan besar.

    Jangan pernah memuat (buffer) semua file sumber ke dalam RAM Express.

    Output sementara harus memiliki kebijakan pembersihan.

    Status pekerjaan harus terlihat oleh frontend jika bersifat asinkron.

    Gunakan konkurensi pekerja dan batas sumber daya/waktu yang terikat.

    Teknologi antrean dan ambang batas asinkron yang tepat tetap menjadi keputusan implementasi.

    11. Sampah dan penghapusan permanen
    Penghapusan pengguna memindahkan entitas root ke Sampah dan menyembunyikan turunan dari tampilan normal.

    Sampah hanya menampilkan entri root.

    Pemulihan/pembersihan beroperasi pada seluruh grup penghapusan.

    Pembersihan retensi 30 hari adalah pekerjaan latar belakang.

    Penghapusan objek harus idempoten dan dapat dicoba kembali.

    Kuota dilepaskan hanya setelah penghapusan objek berhasil dan transisi metadata akhir selesai.

    Simpan catatan pekerjaan/outbox yang tahan lama sehingga proses yang dimulai ulang tidak kehilangan pekerjaan penghapusan.

    12. Penghapusan akun
    Memerlukan konfirmasi yang disengaja.

    Segera tandai akun DELETION_PENDING dan cabut sesi.

    Ambil snapshot dari semua kunci objek milik pengguna dan pekerjaan pembersihan terkait sebelum menghapus referensi database.

    Pekerja latar belakang menghapus objek dan memverifikasi hasil.

    Coba lagi kegagalan penyedia yang bersifat sementara.

    Hapus data relasional hanya jika aman, atau pertahankan catatan pekerjaan penghapusan minimal hingga pembersihan objek selesai.

    Jangan pernah menghapus (cascade) satu-satunya inventaris kunci objek sebelum penghapusan penyimpanan.

    Penyelesaian dicatat hanya setelah semua objek milik pengguna dikonfirmasi terhapus.

    Cakup setiap operasi pembersihan ke inventaris objek target pengguna yang telah diambil snapshot-nya.

    13. Pekerjaan latar belakang
    Pekerjaan yang diperlukan:

    Kedaluwarsa dan bersihkan reservasi unggah.

    Batalkan unggahan multipart yang kedaluwarsa.

    Bersihkan objek yatim piatu (orphaned objects).

    Hapus entri Sampah yang kedaluwarsa secara permanen.

    Hasilkan arsip ZIP besar.

    Hapus data dan objek akun.

    Bersihkan sesi dan tantangan OTP yang kedaluwarsa.

    Rekonsiliasi akuntansi penyimpanan.

    Terapkan kebijakan siklus hidup versi objek di mana konfigurasi penyedia mendukungnya.

    Pekerjaan harus bersifat idempoten, dapat dicoba kembali, dapat diamati, dan terikat (bounded).

    14. Cadangan dan pemulihan
    PostgreSQL:

    Cadangan otomatis harian.

    Retensi tujuh hari.

    Simpan secara terpisah dari host utama.

    Batasi akses dan enkripsi jika didukung.

    Dokumentasikan dan uji prosedur pemulihan.

    Penyimpanan objek:

    Bucket privat.

    Target pemulihan versi objek: tiga hari, tunduk pada kapabilitas penyedia dan validasi aturan siklus hidup.

    Tidak ada salinan penuh kedua dari semua objek di MVP.

    Bedakan retensi Sampah 30 hari dari retensi versi lama tingkat penyedia.

    Uji perilaku pemulihan dan pembersihan permanen sebelum produksi.

    15. Observabilitas dan pengamanan operasional
    Log terstruktur dengan ID korelasi permintaan/pekerjaan.

    Jangan pernah mencatat kata sandi, nilai OTP, token sesi mentah, atau URL presigned.

    Lacak kegagalan unggah, kebocoran reservasi, percobaan ulang penghapusan objek, kegagalan pekerjaan ZIP, dan perbedaan rekonsiliasi kuota.

    Tambahkan pemeriksaan kesehatan/kesiapan (health/readiness checks).

    Terapkan batas tingkat (rate limits) pada masuk, OTP, pencarian, dan operasi yang mahal.

    Tetapkan batas waktu (timeouts) untuk unggah, unduh, ZIP, dan pekerja.

    Simpan rahasia di lingkungan/manajer rahasia, jangan di kontrol sumber.

    16. Penerapan dan keputusan penyedia yang ditunda
    Penyedia hosting dan topologi.

    Penyedia email.

    Konfirmasi akhir Backblaze B2.

    Implementasi antrean (queue).

    Penyedia pemantauan/pencatatan log.

    Perkakas cadangan yang tepat dan RPO/RTO.

    Konfigurasi siklus hidup versi objek akhir.