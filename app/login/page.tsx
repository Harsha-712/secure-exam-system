
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = credential.user;

      const userQuery = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );

      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setMessage("User profile not found.");
        setLoading(false);
        return;
      }

      const userData = userSnapshot.docs[0].data();

      switch (userData.role) {
        case "STUDENT":
          router.push("/student");
          break;

        case "QUESTION_SETTER":
          router.push("/question-setter");
          break;

        case "REVIEWER":
          router.push("/reviewer");
          break;

        case "ADMIN":
          router.push("/admin");
          break;

        case "EXAM_CENTRE":
          router.push("/exam-centre");
          break;

        case "AUDITOR":
          router.push("/auditor");
          break;

        default:
          setMessage("Invalid user role.");
          break;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setMessage("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-5">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border">

        <div className="text-center mb-8">
          <p className="text-indigo-600 font-semibold text-sm">
            SECURE EXAMINATION SYSTEM
          </p>

          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Secure Login
          </h1>

          <p className="text-gray-500 mt-2">
            Login to access your examination portal
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {message && (
          <div className="mt-5 bg-red-50 border border-red-200 text-red-600 text-center p-3 rounded-xl">
            {message}
          </div>
        )}

      </div>
    </main>
  );
}

