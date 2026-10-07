
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

export default function StudentPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userQuery = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );

        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          alert("Student profile not found.");
          router.push("/dashboard");
          return;
        }

        const userData = userSnapshot.docs[0].data();

        if (userData.role !== "STUDENT") {
          alert("Access denied.");
          router.push("/dashboard");
          return;
        }

        const examQuery = query(
          collection(db, "exams"),
          where("status", "==", "PUBLISHED")
        );

        const examSnapshot = await getDocs(examQuery);

        const examList = examSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setExams(examList);
      } catch (error) {
        console.error("Error loading student dashboard:", error);
        alert("Failed to load examinations.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <p className="text-slate-600">
            Loading Student Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-5">
      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-8">
          <p className="text-indigo-600 font-semibold text-sm">
            SECURE EXAMINATION SYSTEM
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Student Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            View your published examinations and attend your exams securely.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 bg-indigo-50 px-5 py-3 rounded-xl">
            <span className="text-2xl">📝</span>

            <div>
              <p className="text-sm text-slate-500">
                Available Examinations
              </p>

              <p className="text-2xl font-bold text-indigo-700">
                {exams.length}
              </p>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-2xl border shadow-sm p-8">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Available Examinations
            </h2>

            <p className="text-slate-500 mt-1">
              Select an examination to view instructions and begin.
            </p>
          </div>

          {exams.length === 0 ? (
            <div className="text-center py-14 border border-dashed rounded-xl">
              <p className="text-4xl mb-3">📭</p>

              <h3 className="text-lg font-semibold text-slate-700">
                No examinations available
              </h3>

              <p className="text-slate-500 mt-1">
                Published examinations will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">

              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          📄
                        </span>

                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {exam.paperName || "Examination"}
                          </h3>

                          <p className="text-slate-500">
                            {exam.subject || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-5 mt-5 text-sm text-slate-600">
                        <span>
                          📅 {exam.examDate || "—"}
                        </span>

                        <span>
                          🕐 {exam.startTime || "—"}
                        </span>

                        <span>
                          ⏱ {exam.duration || 0} Minutes
                        </span>

                        <span>
                          📝 {exam.totalMarks || 0} Marks
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/student/exam/${exam.id}/instructions`
                        )
                      }
                      className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                      View Instructions →
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

        <div className="text-center mt-8 text-sm text-slate-400">
          Secure Examination System • Student Portal
        </div>

      </div>
    </main>
  );
}

