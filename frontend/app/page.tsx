import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Selamat Datang di Storage App</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Kelola berkas dan data Anda dengan mudah dan aman.
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Masuk (Login)
        </Link>
        <Link
          href="/register"
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          Daftar (Register)
        </Link>
      </div>
    </main>
  );
}