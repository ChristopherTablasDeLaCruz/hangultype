import Link from "next/link"
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          HangulType
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Master Korean typing with interactive lessons and real-time feedback
        </p>
        <Link 
          href="/practice"
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Start Practicing →
        </Link>
      </div>
    </main>
  )
}