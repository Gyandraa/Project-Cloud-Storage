Desain Database
Cloud Storage Pribadi — PostgreSQL + Prisma 7   
DATABASE.md

Status: draf skema logis. Konfirmasi nama field, indeks, batasan, dan detail migrasi yang tepat terhadap repositori yang ada sebelum implementasi.   
DATABASE.md

1. Prinsip desain
Satu User tunggal memiliki semua data pribadi.   
DATABASE.md

Setiap kueri yang dimiliki pengguna dicakup oleh userId yang telah diautentikasi.   
DATABASE.md

Kuliah dan Umum berbagi satu tabel File.   
DATABASE.md

Folder digunakan untuk folder Umum dan subfolder bersarang.   
DATABASE.md

Simpan file biner di penyimpanan objek privat; PostgreSQL hanya menyimpan metadata.   
DATABASE.md

Gunakan penghitungan byte bilangan bulat (BIGINT) untuk akuntansi penyimpanan.   
DATABASE.md

Gunakan penghapusan lunak (soft deletion) dan root Sampah eksplisit untuk pemulihan.   
DATABASE.md

Gunakan transaksi database dan batasan keunikan untuk mencegah kondisi balap (race conditions).   
DATABASE.md

Jangan gunakan itemId polimorfik tanpa integritas referensial untuk root Sampah.   
DATABASE.md

2. Entitas
2.1 User
Saran field:

id UUID primary key

name string

email string unique

passwordHash string

emailVerifiedAt timestamp yang boleh bernilai null (nullable)

baseQuotaBytes BIGINT, default 7516192768 (7 GiB)

usedBytes BIGINT, default 0

reservedBytes BIGINT, default 0

accountStatus string/enum (misalnya ACTIVE, DELETION_PENDING)

createdAt, updatedAt

usedBytes menghitung objek tersimpan yang telah difinalisasi, termasuk file di Sampah. reservedBytes melacak reservasi unggah yang sedang berjalan. Kuota tersedia yang efektif harus memperhitungkan keduanya.

Langganan di masa depan dapat menambahkan hak kuota; tabel pembayaran berada di luar MVP.

2.2 Session
id UUID

userId FK → User

tokenHash unique

expiresAt

createdAt

lastActiveAt

opsional revokedAt

Indeks: userId, expiresAt, unique tokenHash.

2.3 OtpChallenge
id UUID

userId boleh bernilai null hanya jika alur pendaftaran memerlukan tantangan sebelum pembuatan User; jika tidak, buat pengguna yang tertunda (pending user) terlebih dahulu

email (berguna untuk tantangan pendaftaran)

purpose string: REGISTER, FORGOT_PASSWORD, CHANGE_PASSWORD

codeHash

expiresAt

attemptCount

maxAttempts default 3

lastSentAt

consumedAt

createdAt

Aturan:

Kode enam digit.

Kedaluwarsa 3 menit.

Jeda waktu (cooldown) pengiriman ulang 60 detik.

Sekali pakai.

Tantangan baru membatalkan tantangan aktif sebelumnya untuk email/pengguna dan tujuan yang sama.

Simpan hanya hash aman dari OTP.

Batasi tingkat (rate-limit) penerbitan dan verifikasi secara independen.

2.4 Semester
id UUID

userId FK → User

name atau number (keputusan produk: label yang dibuat pengguna seperti “Semester 1”)

createdAt, updatedAt

metadata penghapusan lunak jika root Sampah semester didukung

Batasan unik harus mencegah nama semester duplikat untuk pengguna yang sama di antara catatan aktif, tunduk pada semantik Sampah yang dipilih.

2.5 Course (Mata Kuliah)
id UUID

userId FK → User

semesterId FK → Semester

name

createdAt, updatedAt

metadata penghapusan lunak jika root Sampah mata kuliah didukung

Pastikan Course.userId cocok dengan Semester.userId. Ini dapat ditegakkan melalui kunci asing gabungan (composite foreign keys) atau pemeriksaan transaksi backend ditambah batasan database.

2.6 Folder
id UUID

userId FK → User

parentId self-FK yang boleh bernilai null → Folder

name

createdAt, updatedAt

metadata penghapusan lunak jika root Sampah folder didukung

parentId = null berarti folder root di dalam Umum. Kategori Umum itu sendiri bersifat virtual dan tidak memerlukan baris database.

Pastikan folder induk milik pengguna yang sama. Cegah siklus dalam logika aplikasi dan uji itu.

2.7 File
Satu tabel untuk Kuliah dan Umum:

id UUID

userId FK → User

category string/enum: KULIAH atau UMUM

courseId FK yang boleh bernilai null → Course

folderId FK yang boleh bernilai null → Folder

name

originalName opsional

mimeType

sizeBytes BIGINT

storageKey unique

opsional checksum

createdAt, updatedAt

field hapus-lunak seperti deletedAt, trashRootId (atau relasi melalui Trash)

Invarian:

KULIAH: courseId IS NOT NULL AND folderId IS NULL.

UMUM: courseId IS NULL; folderId boleh bernilai null untuk root Umum.

Sebuah file tidak dapat menjadi milik mata kuliah dan folder secara bersamaan.

userId harus cocok dengan pemilik mata kuliah/folder yang direferensikan.

storageKey harus dihasilkan oleh backend dan tidak boleh diterima sebagai jalur klien yang arbitrer.

Tambahkan batasan CHECK untuk invarian kategori/lokasi menggunakan migrasi SQL jika skema Prisma tidak dapat mengungkapkannya.

Indeks:

(userId, category)

(userId, updatedAt)

(userId, deletedAt)

courseId, folderId

unique storageKey

indeks yang mendukung pencarian dan pemeriksaan nama duplikat.

2.8 Favorite
id UUID atau kunci komposit (composite key)

userId FK → User

fileId FK → File

createdAt

unique (userId, fileId)

Hanya file aktif yang dapat ditandai sebagai favorit. Tegakkan konsistensi kepemilikan dan hapus/kecualikan favorit ketika file masuk ke Sampah; penghapusan permanen menghapusnya.

2.9 Trash (Sampah)
Merepresentasikan satu entri Sampah yang terlihat per root penghapusan. Hindari itemId yang tidak bertipe tanpa FK.

Bentuk yang diusulkan:

id UUID

userId FK → User

fileId FK yang boleh bernilai null → File

folderId FK yang boleh bernilai null → Folder

courseId FK yang boleh bernilai null → Course

semesterId FK yang boleh bernilai null → Semester

deletedAt

expiresAt (biasanya deletedAt + 30 hari)

status (ACTIVE, RESTORING, PURGING, FAILED)

opsional deletionGroupId UUID untuk pengelompokan internal

createdAt, updatedAt

Tepat satu dari fileId, folderId, courseId, semesterId harus diisi. Tambahkan batasan CHECK PostgreSQL.

Turunan harus ditandai sebagai bagian dari grup penghapusan atau dapat ditemukan melalui relasi induk asli mereka. Penghapusan root harus menyembunyikan turunan dari daftar biasa dan hanya menampilkan root di Sampah.

Pilihan skema yang belum diselesaikan yang penting:

Untuk pemulihan yang kuat dan penghapusan bersarang, pertimbangkan TrashEntry khusus ditambah tabel TrashItem/snapshot, atau kolom trashRootId eksplisit pada setiap entitas yang dapat dihapus secara lunak.

Jangan hanya mengandalkan pemeriksaan rekursif pada deletedAt jika item induk/anak dapat dihapus pada waktu yang berbeda.

Tentukan perilaku untuk menghapus induk ketika anak sudah berada di Sampah: sebaiknya cegah operasi tersebut sampai anak dipulihkan, atau gabungkan grup penghapusan dalam satu transaksi.

Pemulihan harus mempertahankan tautan induk/mata kuliah/semester asli.

2.10 UploadReservation
id UUID

userId FK → User

destinationCategory

courseId boleh bernilai null

folderId boleh bernilai null

expectedSizeBytes BIGINT

objectKey unique

status: PENDING, UPLOADING, COMPLETED, FAILED, EXPIRED, ABORTED

expiresAt

createdAt, updatedAt

opsional pengidentifikasi unggah multipart penyedia dan metadata checksum

Transaksi reservasi:

Kunci atau perbarui secara atomik baris kuota User.

Verifikasi usedBytes + reservedBytes + expectedSizeBytes <= effectiveQuotaBytes.

Tambah (increment) reservedBytes.

Buat reservasi.

Pada finalisasi, kurangi yang dicadangkan (reserved) dan tambah yang digunakan (used) secara tepat satu kali.

Pada kegagalan/kedaluwarsa, kurangi yang dicadangkan secara tepat satu kali dan bersihkan objek parsial/yatim piatu.

Gunakan kunci idempotensi/transisi status untuk mencegah akuntansi ganda.

2.11 AccountDeletionJob (disarankan)
Karena penghapusan akun mungkin melibatkan banyak objek dan percobaan ulang (retries):

id UUID

userId (pertahankan sebagai pengidentifikasi buram/opaque, atau snapshot referensi yang diperlukan sebelum menghapus User)

status: PENDING, RUNNING, COMPLETED, FAILED

attemptCount

lastError yang telah disanitasi

createdAt, updatedAt, completedAt

Jangan menghapus secara berjenjang (cascade-delete) satu-satunya referensi yang diperlukan untuk menghapus objek penyimpanan objek. Ambil snapshot kunci objek ke dalam tugas/outbox penghapusan sebelum menghapus catatan relasional, atau pertahankan akun dalam DELETION_PENDING hingga penghapusan objek diverifikasi.

3. Relasi
User 1:N Semester

Semester 1:N Course

User 1:N Course (untuk penegakkan kepemilikan)

User 1:N Folder

Folder 1:N Folder (induk/anak)

Course 1:N File

Folder 1:N File

User 1:N File

User 1:N Favorite

File 1:0..1 Favorite per pengguna

User 1:N Session

User 1:N OtpChallenge (jika berlaku)

User 1:N UploadReservation

User 1:N Entri root Trash

User 1:N AccountDeletionJob (atau satu pekerjaan aktif per pengguna)

4. Indeks dan batasan
Minimum:

Unique User.email.

Unique Session.tokenHash.

Unique File.storageKey.

Unique Favorite(userId, fileId).

Indeks unik/parsial untuk nama aktif dalam induk/lokasi.

Indeks semua kunci asing yang digunakan dalam pencarian yang dicakup oleh kepemilikan.

Indeks Trash.expiresAt dan status untuk pekerja pembersihan.

Indeks UploadReservation.expiresAt dan status.

CHECK invarian kategori/lokasi File.

CHECK persis satu referensi root Trash bernilai tidak-null (non-null).

CHECK sizeBytes, usedBytes, dan reservedBytes bernilai non-negatif.

Tegakkan relasi pemilik yang sama, lebih baik dengan kunci komposit seperti (userId, id) dan kunci asing komposit jika memungkinkan.

Nama duplikat:

Tentukan cakupan secara terpisah untuk root Umum, folder tertentu, mata kuliah, dan semester.

Sertakan semantik item yang dihapus secara lunak dalam kebijakan keunikan.

Gunakan indeks unik parsial untuk catatan aktif jika sesuai.

Selesaikan pemilihan akhiran dalam loop transaksi/percobaan ulang untuk menghindari pembuatan duplikat secara konkuren.

5. Penghapusan dan akuntansi penyimpanan
Penghapusan lunak Sampah tidak mengurangi usedBytes.

Hapus permanen adalah alur kerja yang memiliki state (stateful) dan idempoten.

Hapus objek dari penyedia; coba lagi jika gagal.

Hanya setelah penghapusan objek berhasil, finalisasikan metadata dan kurangi byte terpakai.

Jika penyedia mendukung versi objek, pastikan penghapusan permanen menghapus semua versi yang diperlukan.

Jangan pernah mengurangi kuota dua kali; gunakan transisi status transaksional/pekerjaan outbox.

Penghapusan induk menciptakan satu root Trash; turunan disembunyikan dan dipulihkan/dibersihkan sebagai sebuah grup.

6. Catatan implementasi Prisma
Periksa konfigurasi Prisma 7 yang ada dan penyiapan klien yang dihasilkan terlebih dahulu.   
DATABASE.md

Pertahankan konfigurasi Prisma 7 yang khusus penyedia tetap utuh.   
DATABASE.md

Gunakan migrasi eksplisit untuk batasan CHECK PostgreSQL dan indeks parsial yang tidak direpresentasikan dalam skema Prisma.   
DATABASE.md

Jangan gunakan db push sebagai pengganti migrasi produksi.   
DATABASE.md

Jangan pernah menjalankan migrate reset, menjatuhkan (drop) skema, atau menghapus data database tanpa persetujuan eksplisit.   
DATABASE.md

Uji migrasi terhadap database lokal/uji coba sekali pakai sebelum menerapkannya ke data yang berharga.   
DATABASE.md

Hasilkan Klien Prisma menggunakan skrip dan versi yang ada di repositori.   
DATABASE.md

7. Keputusan database terbuka
Apakah pendaftaran tertunda (pending registrations) membuat baris User sebelum verifikasi OTP.

Representasi persis dari grup penghapusan Trash dan snapshot subpohon.

Cakupan keunikan yang tepat untuk nama ketika item berada di Sampah.

Apakah Semester dan Course menggunakan deletedAt plus trashRootId atau model snapshot.

Implementasi AccountDeletionJob/outbox akhir.

Indeks persis setelah pola kueri dan skala yang diharapkan diukur.