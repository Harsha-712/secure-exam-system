
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/lib/getUserRole";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");

      try {
        const userRole = await getUserRole(user.email || "");

        if (userRole) {
          setRole(userRole);
        } else {
          setRole("NO ROLE ASSIGNED");
        }
      } catch (error) {
        console.error("Error fetching role:", error);
        setRole("NO ROLE ASSIGNED");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">

        <h1 className="text-3xl font-bold mb-6">
          Secure Examination Dashboard
        </h1>

        <div className="bg-gray-50 p-5 rounded-lg mb-8">
          <p className="mb-2">
            <strong>Email:</strong> {email}
          </p>

          <p>
            <strong>Role:</strong>{" "}
            <span className="font-semibold">
              {role}
            </span>
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-4">
          Available Actions
        </h2>

        {role === "QUESTION_SETTER" && (
          <button
            onClick={() => router.push("/question-setter")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Upload Question Paper
          </button>
        )}

        {role === "REVIEWER" && (
          <button
            onClick={() => router.push("/reviewer")}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
          >
            Review Question Papers
          </button>
        )}

        {role === "ADMIN" && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Manage Question Papers
            </button>

            <button
              onClick={() => router.push("/admin")}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
            >
              Schedule Release
            </button>
          </div>
        )}

        {role === "EXAM_CENTRE" && (
          <button
            onClick={() => router.push("/exam-centre")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
          >
            View Released Papers
          </button>
        )}

        {role === "AUDITOR" && (
          <button
            className="bg-gray-700 text-white px-5 py-2 rounded-lg"
          >
            View Audit Logs
          </button>
        )}

        {role === "NO ROLE ASSIGNED" && (
          <p className="text-red-600">
            No role has been assigned to this account.
          </p>
        )}

        <button
          onClick={handleLogout}
          className="mt-10 bg-red-600 text-white px-5 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>
    </main>
  );
}

