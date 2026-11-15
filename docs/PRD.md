Requirements Perangkat Lunak (PRD)
Penyimpanan Cloud Pribadi

Status: Draf untuk perencanaan implementasi

Tipe produk: Aplikasi web penyimpanan cloud pribadi

Versi: 1.0

Gambaran umum produk
Membangun aplikasi web penyimpanan cloud pribadi yang terinspirasi dari pengalaman pengelolaan file yang familiar di Google Drive. Pengguna dapat menyimpan, mengorganisasi, pratinjau, mengunduh, mencari, dan mengelola file mereka sendiri.

MVP ini hanya mendukung akun individu. Setiap akun memiliki ruang penyimpanan privat. Workspace tim, berbagi file, kolaborasi, tautan publik, dan pembayaran langganan berada di luar cakupan MVP.
1.1 Tujuan

Memungkinkan pengguna dengan aman menyimpan dan mengorganisasi dokumen serta file lainnya.

Mendukung dua kategori penyimpanan yang jelas: Kuliah dan Umum.

Menyediakan alur unggah, unduh, pratinjau, pemulihan, dan penghapusan yang andal.

Menegakkan isolasi yang ketat antar pengguna.

Menjaga arsitektur tetap dapat dipelihara dan siap untuk pertumbuhan di masa depan.
1.2 Bukan tujuan untuk MVP

Berbagi file atau folder dengan pengguna lain.

Workspace tim/organisasi dan penyuntingan kolaboratif.

Penyuntingan dokumen Office di dalam peramban (browser).

Pencarian teks lengkap di dalam isi dokumen.

Pemindaian antivirus/malware (ditunda; tidak pernah mengeksekusi file yang diunggah).

Checkout langganan dan gateway pembayaran.

Penghapusan akun otomatis karena tidak aktif.

URL objek publik.

Pengguna dan model akun

Target pengguna mencakup mahasiswa, pekerja, dan pengguna umum.

Model akun MVP adalah satu akun pribadi per pengguna.

Setiap catatan dan objek yang disimpan harus dikaitkan dengan tepat satu pemilik.

Pengguna hanya dapat mengakses catatan dan file mereka sendiri.

Dukungan tim di masa depan dapat dipertimbangkan, namun tidak boleh diimplementasikan dalam MVP.

Organisasi penyimpanan
Setiap pengguna menerima dua kategori tingkat atas (top-level) yang tetap. Kategori ini tidak dapat dihapus atau diubah namanya.
3.1 Kuliah
Hierarki:
Kuliah → Semester → Mata Kuliah → File

Pengguna membuat dan mengelola semester.

Pengguna membuat dan mengelola mata kuliah di dalam semester.

Mata kuliah bisa kosong.

Pengguna dapat mengubah nama dan menghapus semester serta mata kuliah.

File disimpan langsung di dalam mata kuliah; folder bersarang di dalam mata kuliah tidak didukung di MVP.
3.2 Umum
Hierarki:
Umum → Folder → Subfolder → File

File juga dapat disimpan langsung di root Umum.

Folder mendukung subfolder bersarang.

Bersarangnya folder harus dilindungi dari siklus (cycles).
3.3 Model file bersama
Kuliah dan Umum adalah kategori logis, bukan sistem penyimpanan fisik yang terpisah. Gunakan satu entitas/tabel File untuk kedua kategori.

Untuk sebuah file:

category = KULIAH memerlukan courseId yang valid.

category = UMUM memerlukan courseId = null; folderId boleh bernilai null untuk root Umum.

Sebuah file tidak dapat menjadi bagian dari mata kuliah dan folder secara bersamaan.

Semua catatan yang direferensikan harus milik pengguna yang sama.

Persyaratan fungsional
4.1 Dasbor
Dasbor berisi:

Ringkasan penyimpanan: kuota, byte terpakai, byte tersisa.

Akses cepat ke Kuliah dan Umum.

File Terbaru di kedua kategori.
File Terbaru:

Urutkan berdasarkan updatedAt secara menurun (descending).

Kecualikan item yang ada di Sampah (Trash).

Tampilkan nama file, ikon/thumbnail, kategori, jalur lokasi (location path), dan waktu terakhir diperbarui.
Jangan tambahkan umpan aktivitas (activity feeds) atau pratinjau Favorit ke dasbor MVP.
4.2 Navigasi
Bilah sisi (Sidebar):

Dasbor

File Saya

Kuliah

Umum

Favorit

Sampah

Pengaturan

Indikator penggunaan penyimpanan
4.3 Operasi file dan folder
Mendukung:

Membuat semester, mata kuliah, folder, dan subfolder.

Mengubah nama file dan folder.

Memindahkan file dan folder.

Menyalin file dan folder.

Menghapus ke Sampah.

Memulihkan dari Sampah.

Menghapus secara permanen.

Menandai favorit/batal favorit pada file.

Seleksi massal dan tindakan massal.
Aturan:

Nama tidak boleh kosong atau hanya berisi spasi.

Pertahankan ekstensi file secara default saat mengubah nama.

Nama duplikat dalam tujuan yang sama diselesaikan secara otomatis dengan akhiran: Nama (1).ext, Nama (2).ext, dan seterusnya.

Penyelesaian duplikat harus aman terhadap konkurensi (concurrency-safe) pada backend.

Perubahan nama mengubah metadata dan updatedAt, bukan isi objek.

Memindahkan tidak menambah penyimpanan yang terpakai.

Menyalin membuat metadata dan isi objek yang independen serta mengonsumsi kuota tambahan.

Menyalin folder mempertahankan hierarkinya.

Memindahkan folder ke dalam dirinya sendiri atau salah satu turunannya dilarang.

Backend memvalidasi kepemilikan dan aturan kategori/hubungan tujuan untuk setiap operasi.
Tindakan massal (Bulk actions):

Pindahkan

Salin

Hapus ke Sampah

Unduh sebagai ZIP

Favorit
Kegagalan sebagian (partial failures) tidak boleh membatalkan operasi massal yang tidak terkait. Kembalikan hasil per item.
4.4 Penghapusan semester/mata kuliah

Menghapus semester/mata kuliah yang kosong memerlukan konfirmasi.

Jika tidak kosong, konfirmasi harus menjelaskan berapa banyak catatan anak/file yang terdampak.

Menghapus semester memindahkan mata kuliah dan filenya ke Sampah sebagai satu penghapusan logis.

Menghapus mata kuliah memindahkan filenya ke Sampah sebagai satu penghapusan logis.

Pemulihan harus merekonstruksi hierarki dan hubungan asli.
4.5 Sampah

Penghapusan lunak (Soft deletion) menggunakan metadata penghapusan seperti deletedAt.

Retensi Sampah adalah 30 hari, setelah itu penghapusan permanen dijadwalkan.

Pengguna dapat menghapus item secara permanen lebih awal.

Mengosongkan Sampah memerlukan konfirmasi eksplisit.

File di Sampah tidak dapat dipratinjau atau diunduh hingga dipulihkan.

Halaman Sampah menampilkan nama, lokasi asli, tanggal penghapusan, dan sisa waktu retensi.

Objek yang dihapus secara lunak terus dihitung terhadap kuota.

Kuota dilepaskan hanya setelah penghapusan objek berhasil dan finalisasi metadata selesai.

Jika penghapusan objek gagal, coba lagi dengan aman; jangan mengklaim penghapusan berhasil lebih awal.

Menghapus folder/mata kuliah/semester membuat satu entri Sampah yang terlihat untuk root penghapusan, bukan satu baris per turunan.

Turunan dikelola sebagai bagian dari grup penghapusan root. Memulihkan root akan memulihkan seluruh subpohon.

Selama induk berada di Sampah, turunan tidak dapat dioperasikan secara mandiri; pulihkan induknya terlebih dahulu.

Penghapusan permanen sebuah root akan menghapus semua turunannya secara permanen.

Entri favorit dihapus atau dikecualikan ketika file masuk ke Sampah; penghapusan permanen menghapus catatan favorit.
Implementasi harus menentukan perilaku yang aman untuk operasi penghapusan yang tumpang tindih (misalnya, anak yang sudah ada di Sampah ketika induknya dihapus). Lebih baik mencegah root Sampah bersarang yang ambigu atau secara eksplisit melepaskan/menggabungkan grup penghapusan dalam sebuah transaksi.
4.6 Favorit

Favorit hanya berlaku untuk file, bukan folder.

Pasangan favorit pengguna/file bersifat unik.

Favorit tidak mengonsumsi penyimpanan ekstra.

File di Sampah dikecualikan dari Favorit.

Penghapusan file secara permanen menghapus relasi favoritnya.
4.7 Pencarian
Pencarian global di Kuliah dan Umum:

Mencari nama file, nama folder, nama semester, dan nama mata kuliah.

Pencocokan parsial didukung.

Filter: kategori, jenis file, tanggal unggah.

Kecualikan Sampah secara default.

Hasil selalu dicakup untuk pengguna yang diautentikasi.

Pencarian berdasarkan metadata/nama saja di MVP; tidak ada ekstraksi/pengindeksan konten.

Debounce frontend: 500 ms.

Menghapus kueri akan menghapus hasil.

Membatalkan atau mengabaikan permintaan yang kedaluwarsa (stale).

Backend memvalidasi panjang kueri, filter, paginasi, dan batas; debounce bukanlah kontrol keamanan atau beban database dengan sendirinya.
4.8 Unggah file

Tombol unggah dan seret-dan-lepas (drag-and-drop) pada perangkat yang didukung.

Beberapa file per pilihan.

Maksimal 100 MB per file.

Maksimal 3 unggahan konkuren per pengguna; file tambahan menunggu dalam antrean.

Menampilkan kemajuan dan status per file.

Satu unggahan yang gagal tidak boleh menghentikan file lainnya.

Semua jenis file dapat disimpan, termasuk jenis yang tidak dikenal.

Jangan mengeksekusi file yang diunggah.

Pratinjau hanya format yang didukung; format yang tidak dikenal dapat diunduh.

Validasi kepemilikan, tujuan, ukuran, kuota, dan status unggah pada backend.

Pemeriksaan kuota harus aman terhadap konkurensi.
Alur unggah:

Frontend meminta reservasi unggah.

Backend mengautentikasi pengguna dan memvalidasi tujuan, ukuran file, dan kuota yang tersedia.

Backend memesan kuota secara atomik dan membuat niat unggah (upload intent).

Backend mengeluarkan instruksi unggah presigned berumur pendek untuk penyimpanan objek privat.

Peramban mengunggah langsung ke penyimpanan objek menggunakan unggah multipart jika didukung.

Backend memverifikasi penyelesaian unggah dan ukuran/checksum objek jika kapabilitas penyedia memungkinkan.

Backend menyelesaikan metadata file dan mengonversi byte yang dipesan menjadi byte yang terpakai.

Unggahan yang gagal/kedaluwarsa dibatalkan/dibersihkan dan reservasi dilepaskan.

Pembersihan objek yatim piatu (orphan object) harus dapat dicoba kembali dan dapat diamati.
4.9 Unduh dan pratinjau
Pratinjau yang didukung:

PDF: halaman pratinjau khusus dalam aplikasi.

Gambar: halaman pratinjau khusus dalam aplikasi.

Penampil PDF: navigasi halaman, zoom, pas ke halaman (fit-to-page).

Penampil gambar: zoom dan pas ke layar (fit-to-screen).

DOCX/XLSX/PPTX: unduh saja di MVP.

Audio/video: unduh saja di MVP.

ZIP/RAR dan arsip lainnya: unduh saja.

Format tidak dikenal: simpan dan unduh; jangan pernah dieksekusi.
Halaman pratinjau:

Halaman khusus terpisah, bukan modal atau tab baru.

Navigasi kembali mengembalikan ke folder/lokasi sebelumnya.

Setiap permintaan memvalidasi pemilik, status aktif, dan status file.

File Sampah harus dipulihkan sebelum pratinjau/unduh.
Unduhan tunggal:

Backend mengesahkan file dan membuat URL unduhan presigned berumur pendek.

Bucket objek tetap privat.
Unduhan massal/folder:

Dikemas ke dalam ZIP sambil mempertahankan struktur folder.

Maksimal 500 file dan maksimal 2 GB total ukuran sumber yang belum dikompresi per permintaan ZIP.

Jika pilihan melebihi salah satu batas, minta pengguna untuk membagi unduhan.

Pekerjaan ZIP besar harus melakukan streaming atau menggunakan pemrosesan latar belakang; jangan memuat semua isi file ke memori Express.

Terapkan pemeriksaan kepemilikan dan status aktif untuk setiap file yang disertakan.

Arsip sementara harus dibersihkan.

Tetapkan batas waktu operasional dan batas sumber daya yang dapat dikonfigurasi.
4.10 Kuota penyimpanan

Kuota default: 7 GiB per pengguna (7 * 1024^3 byte). UI dapat melabeli ini sebagai “7 GB” jika salinan produk (product copy) secara sengaja menggunakan terminologi yang dibulatkan.

Semua file aktif dan file di Sampah dihitung terhadap penyimpanan yang terpakai.

Favorit tidak menduplikasi penyimpanan.

Menyalin mengonsumsi kuota tambahan.

Memindahkan tidak mengonsumsi kuota tambahan.

Kuota terpakai berkurang hanya setelah penghapusan objek secara permanen dikonfirmasi.

Simpan penghitungan byte sebagai nilai integer (lebih disukai BIGINT database).

usedBytes dan reservedBytes (atau agregat reservasi yang setara) harus dikelola dengan aman.

Pekerjaan rekonsiliasi membandingkan metadata/akuntansi dengan penyimpanan objek dan melaporkan perbedaan.
Kapasitas langganan masa depan:

Pembayaran/langganan berada di luar MVP.

Rancang agar kuota tambahan dapat diberikan nanti tanpa mengganti logika penyimpanan file inti.

Ketika hak kuota ekstra di masa depan kedaluwarsa, kuota efektif kembali ke kuota dasar. Jika byte terpakai melebihi kuota tersebut, file tetap aman dan dapat diunduh; pengguna dapat memindahkan/menghapus tetapi tidak dapat mengunggah atau menyalin dengan cara yang meningkatkan penggunaan penyimpanan. Pengguna dapat memperpanjang atau menghapus file untuk kembali di bawah kuota.

Simpan riwayat langganan saat diimplementasikan nanti.
4.11 Autentikasi dan keamanan akun
Bidang pendaftaran (Registration fields):

Nama lengkap

Email unik

Kata sandi

Konfirmasi kata sandi (validasi frontend saja; jangan pernah menyimpan konfirmasi)
Pendaftaran:

Validasi masukan dan email unik.

Keluarkan OTP pendaftaran.

Verifikasi OTP.

Tandai email terverifikasi.

Izinkan masuk.
Masuk (Login):

Email dan kata sandi.

Keluar (Logout).

Rute yang diautentikasi memerlukan sesi yang valid.
OTP:

Kode numerik enam digit.

Pengiriman email.

Berlaku selama 3 menit.

Maksimal 3 percobaan.

Jeda waktu (cooldown) pengiriman ulang 60 detik.

Sekali pakai.

OTP baru membatalkan tantangan sebelumnya untuk tujuan/pengguna yang sama.

OTP yang kedaluwarsa atau habis tidak dapat digunakan kembali.

Simpan OTP dengan aman sebagai hash, jangan pernah plaintext.

Tujuan: REGISTER, FORGOT_PASSWORD, CHANGE_PASSWORD.

Gunakan satu model/tabel tantangan OTP dengan bidang tujuan.
Kata sandi:

Lupa Kata Sandi menggunakan OTP email.

Ubah Kata Sandi menggunakan OTP email.

Setelah perubahan kata sandi, cabut semua sesi yang ada; pengguna harus masuk lagi.

Algoritma hashing kata sandi dan kebijakan akan disesuaikan dalam desain teknis; gunakan algoritma hashing kata sandi modern seperti Argon2id di mana dukungan runtime mengizinkan.
Sesi:

Tabel sesi sisi server.

Cookie bersifat HttpOnly; Secure dalam produksi; Perlindungan SameSite dan CSRF dikonfigurasi dengan tepat.

Token sesi mentah hanya di dalam cookie; simpan hash token di database.

Beberapa sesi/perangkat per pengguna.

Masa pakai sesi: 7 hari dengan pembaruan geser (sliding renewal) pada aktivitas.

Keluar membatalkan sesi saat ini.

Perubahan kata sandi mencabut semua sesi.

Sesi yang kedaluwarsa ditolak dan dibersihkan.

CORS hanya boleh mengizinkan asal frontend yang dikonfigurasi dengan kredensial sebagaimana mestinya.
Pengaturan MVP:

Ubah Kata Sandi

Keluar

Pengeditan profil/foto/perubahan email ditunda.
4.12 Penghapusan akun

Pengguna dapat meminta penghapusan akun permanen.

Memerlukan konfirmasi yang diautentikasi dan langkah konfirmasi tambahan yang disengaja.

Cabut sesi dan cegah akses lebih lanjut segera.

Hapus semua metadata dan objek milik pengguna melalui alur kerja latar belakang yang idempoten.

Coba lagi kegagalan penghapusan objek.

Jangan tandai penghapusan selesai sampai semua data/penghapusan objek yang diperlukan telah diverifikasi.

Tidak boleh memengaruhi catatan atau objek pengguna lain.

Tidak ada penghapusan otomatis karena tidak aktif.

Persyaratan keamanan dan privasi
Isolasi penyewa yang ketat (Strict tenant isolation) adalah wajib:

Turunkan userId dari sesi sisi server yang diautentikasi, jangan pernah mempercayai ID pemilik yang disediakan klien.

Setiap operasi baca/tulis/daftar/cari/pratinjau/unduh/pindah/salin/hapus/pulihkan harus dicakup oleh pemilik.

Verifikasi semua catatan terkait (semester, mata kuliah, folder, file, root sampah) milik pengguna yang sama.

ID yang ditebak atau disubstitusi tidak boleh memberikan akses ke data pengguna lain.

Jaga agar bucket objek tetap privat.

Jangan mengekspos kredensial penyimpanan atau URL objek permanen ke frontend.

URL presigned harus berumur pendek dan dikeluarkan hanya setelah otorisasi.

Jangan mencatat kata sandi, plaintext OTP, token sesi, atau URL yang ditandatangani.

Terapkan batas tingkat (rate limits) pada autentikasi, OTP, dan operasi sensitif.

Validasi tipe MIME dan metadata file; jangan pernah hanya mengandalkan tipe MIME yang disediakan peramban.

Sajikan unduhan dengan disposition konten yang aman dan header keamanan yang sesuai.

Gunakan operasi ORM/database berparameter.

Tambahkan pengujian otorisasi lintas pengguna otomatis untuk setiap keluarga sumber daya.
Contoh penerimaan keamanan

Pengguna B tidak dapat mencantumkan file Pengguna A.

Pengguna B tidak dapat mengakses file Pengguna A dengan mensubstitusi ID-nya di jalur API.

Pengguna B tidak dapat mempratinjau/mengunduh file Pengguna A meskipun mereka mengetahui ID atau kunci penyimpanannya.

Pengguna B tidak dapat memindahkan, menyalin, mengubah nama, memulihkan, atau menghapus sumber daya Pengguna A.

Pengguna B tidak dapat menggunakan ID mata kuliah/folder milik Pengguna A sebagai tujuan unggah.

Penerbitan URL yang ditandatangani ditolak untuk objek yang bukan miliknya.

Semua kegagalan menghindari pengungkapan metadata privat pengguna lain.

Persyaratan UI/UX

Desain responsif yang mengutamakan desktop (desktop-first).

Bilah sisi desktop bersifat persisten.

Bilah sisi tablet dapat diciutkan.

Bilah sisi seluler menggunakan laci (drawer).

Dasbor dan tampilan file beradaptasi dengan layar yang lebih kecil.

Pilihan default Grid/List sengaja ditunda; kedua mode harus didukung jika memungkinkan, dan default dapat diputuskan selama desain UI.

Unggahan seluler menggunakan pemilih file perangkat; seret-dan-lepas bersifat opsional jika didukung.

Menyediakan status memuat, kosong, sukses, dan error.

Mengonfirmasi tindakan destruktif.

Menampilkan status unggah per file yang jelas.

Menggunakan label yang dapat diakses, navigasi keyboard, status fokus, dan kontras yang memadai.

Tumpukan teknis dan batasan repositori
Tata letak repositori yang ada:
fullstack-project/
├── backend/
└── frontend/
Tumpukan yang diperlukan:

Frontend: Next.js + TypeScript + Tailwind CSS.

Backend: Node.js + Express.js + TypeScript.

Database: PostgreSQL.

ORM: Prisma 7.

Penyimpanan objek: Backblaze B2 adalah penyedia sementara; gunakan integrasi yang kompatibel dengan S3 di balik sebuah abstraksi.
Penting:

Periksa repositori yang ada sebelum memodifikasinya.

Pertahankan penyiapan Prisma 7 yang ada; jangan tingkatkan/turunkan versi dependensi tanpa persetujuan.

Gunakan migrasi.

Jangan pernah mereset, menjatuhkan (drop), atau menghapus database tanpa persetujuan pengguna secara eksplisit.

Jangan mengganti backend Express yang terpisah dengan rute API Next.js.

Validasi frontend hanya untuk UX; backend mengulangi semua validasi keamanan dan bisnis.

Cadangan dan pemulihan (Backup and recovery)
Database:

Cadangan PostgreSQL otomatis setiap hari.

Simpan cadangan harian selama 7 hari.

Simpan cadangan secara terpisah dari host aplikasi/database utama.

Lindungi akses cadangan.

Dokumentasikan dan uji prosedur pemulihan.
Penyimpanan objek:

Bucket privat.

Target pemulihan/retensi versi objek: 3 hari, tunduk pada perilaku siklus hidup penyedia dan validasi biaya.

Jangan membuat salinan penuh kedua dari semua objek pengguna untuk MVP.

Pastikan retensi Sampah (30 hari) dan pembersihan versi objek tidak tertukar: objek Sampah tetap menjadi objek saat ini dan dihitung terhadap kuota; versi lama yang menimpa/dihapus adalah versi tingkat penyedia yang terpisah.

Verifikasi aturan siklus hidup penyedia sebelum mengaktifkannya; penghapusan permanen harus menghapus semua versi yang relevan bila diperlukan.

Uji pemulihan objek yang representatif.

Keputusan yang ditunda / asumsi
Ini bukan pilihan akhir yang disetujui pengguna dan harus tetap dapat dikonfigurasi atau didokumentasikan secara eksplisit:

Penyedia pengiriman email/OTP.

Konfirmasi penyedia penyimpanan objek akhir dan konfigurasi bucket/siklus hidup B2 yang tepat.

Keputusan monolit modular backend vs usaha mikro (microservices) (jangan pisahkan layanan untuk MVP tanpa keputusan baru).

Penyedia penerapan/hosting dan topologi.

Default Grid/List.

Penamaan rute API yang tepat dan amplop respons (response envelope).

Kebijakan kata sandi dan pustaka hash akhir.

Ambang batas pekerjaan latar belakang ZIP, teknologi antrean, dan konkurensi operasional.

Strategi pengindeksan pencarian dan batas paginasi yang tepat.

Perkakas cadangan dan tujuan titik pemulihan/waktu pemulihan (RPO/RTO).

Strategi pemindaian malware.

Semantik retensi yang tepat untuk versi objek dan aturan siklus hidup penyedia.

Kriteria penerimaan MVP
MVP siap dirilis hanya ketika:

Pendaftaran, verifikasi OTP, masuk, keluar, lupa kata sandi, dan ubah kata sandi berfungsi.

Kedaluwarsa dan pencabutan sesi berperilaku seperti yang ditentukan.

Data pengguna diisolasi di setiap operasi API.

Pengguna dapat membuat/mengelola semester, mata kuliah, folder, dan file.

Unggahan memberlakukan batas 100 MB per file, tiga slot konkuren, reservasi kuota, dan penanganan kegagalan sebagian.

Unggahan multipart diimplementasikan jika didukung oleh jalur yang kompatibel dengan B2/S3 yang dipilih; jika tidak, cadangan (fallback) yang didokumentasikan disetujui.

Unduh dan pratinjau yang didukung bekerja melalui akses berumur pendek yang disahkan.

Batas ZIP diberlakukan dan hierarki folder dipertahankan.

Pindah/salin/ubah nama/hapus/pulihkan/favorit/cari bekerja dengan kepemilikan dan perilaku kuota yang benar.

Retensi sampah dan pekerjaan penghapusan permanen bersifat idempoten dan dapat dicoba kembali.

Penghapusan akun menghapus semua data dan objek milik sendiri tanpa memengaruhi yang lain.

Cadangan database dan prosedur pemulihan telah diuji.

Tidak ada rahasia (secrets) yang dimasukkan ke dalam kontrol sumber.

Database yang ada tidak dimodifikasi secara destruktif selama penyiapan atau migrasi.