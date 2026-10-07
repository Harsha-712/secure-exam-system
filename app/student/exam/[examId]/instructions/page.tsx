
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function ExamInstructionsPage() {
  const router = useRouter();
  const params = useParams();

  const examId = params.examId as string;

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const examRef = doc(db, "exams", examId);
        const examSnapshot = await getDoc(examRef);

        if (!examSnapshot.exists()) {
          alert("Examination not found.");
          router.push("/student");
          return;
        }

        const examData = examSnapshot.data();

        if (examData.status !== "PUBLISHED") {
          alert("This examination is not currently available.");
          router.push("/student");
          return;
        }

        setExam({
          id: examSnapshot.id,
          ...examData,
        });
      } catch (error) {
        console.error(error);
        alert("Failed to load examination.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [examId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">
          Loading examination...
        </p>
      </main>
    );
  }

  if (!exam) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-5">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => router.push("/student")}
          className="mb-6 text-indigo-600 font-semibold"
        >
          ← Back to Student Dashboard
        </button>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

          <div className="bg-indigo-600 text-white p-8">
            <p className="text-indigo-200 text-sm font-semibold">
              SECURE EXAMINATION
            </p>

            <h1 className="text-3xl font-bold mt-2">
              {exam.paperName || "Examination"}
            </h1>

            <p className="mt-2 text-indigo-100">
              {exam.subject || "—"}
            </p>
          </div>

          <div className="p-8">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">
                  Date
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  {exam.examDate || "—"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">
                  Start Time
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  {exam.startTime || "—"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">
                  Duration
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  {exam.duration || 0} Minutes
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">
                  Total Marks
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  {exam.totalMarks || 0}
                </p>
              </div>

            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Examination Instructions
              </h2>

              <div className="bg-slate-50 border rounded-xl p-6 whitespace-pre-line text-slate-700 leading-7">
                {exam.instructions ||
                  "Read all questions carefully and submit your examination before the timer expires."}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8">
              <h3 className="font-bold text-yellow-800 mb-3">
                Important Instructions
              </h3>

              <ul className="list-disc ml-5 space-y-2 text-sm text-yellow-800">
                <li>Do not refresh the examination page unnecessarily.</li>
                <li>Do not close the examination window while attempting.</li>
                <li>The examination has a fixed time limit.</li>
                <li>The examination will be submitted automatically when time expires.</li>
                <li>Make sure all required questions are answered before submission.</li>
              </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-8">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5"
              />

              <span className="text-slate-700">
                I have read and understood the examination instructions and
                agree to follow the examination rules.
              </span>
            </label>

            <button
              disabled={!agreed}
              onClick={() =>
                router.push(`/student/exam/${examId}`)
              }
              className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Start Examination →
            </button>

          </div>
        </div>

      </div>
    </main>
  );
}

