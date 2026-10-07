
"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow">

        <div className="text-6xl">
          🔒
        </div>

        <h1 className="mt-5 text-3xl font-bold">
          Access Denied
        </h1>

        <p className="mt-3 text-gray-600">
          You do not have permission to access
          this page.
        </p>

        <button
          onClick={() => router.back()}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Go Back
        </button>

      </div>

    </main>
  );
}

