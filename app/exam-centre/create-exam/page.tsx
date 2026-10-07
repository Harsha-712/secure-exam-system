"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

function CreateExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperId = searchParams.get("paperId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paper, setPaper] = useState<any>(null);

  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [totalMarks, setTotalMarks] = useState("100");

  const [instructions, setInstructions] = useState(
    "Read all questions carefully. The examination must be completed within the given time. Only one attempt is allowed."
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      if (!paperId) {
        setLoading(false);
        return;
      }

      try {
        const paperRef = doc(db, "questionPapers", paperId);
        const paperSnap = await getDoc(paperRef);

        if (paperSnap.exists()) {
          setPaper({
            id: paperSnap.id,
            ...paperSnap.data(),
          });
        }
      } catch (error) {
        console.error("Error loading question paper:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [paperId, router]);

  async function handleCreateExam(e: React.FormEvent) {
    e.preventDefault();

    if (!paperId) {
      alert("Question paper ID is missing.");
      return;
    }

    if (!paper || !paper.id) {
      alert("Question paper information is not available.");
      return;
    }

    if (!examDate || !startTime) {
      alert("Please select exam date and start time.");
      return;
    }

    if (!duration || Number(duration) <= 0) {
      alert("Please enter a valid duration.");
      return;
    }

    if (!totalMarks || Number(totalMarks) <= 0) {
      alert("Please enter valid total marks.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("You are not logged in.");
      router.push("/login");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "exams"), {
        paperId: paper.id,
        paperName: paper.paperName || paper.title || "Question Paper",
        subject: paper.subject || "",
        year: paper.year || "",
        semester: paper.semester || "",
        pdfUrl:
          paper.pdfUrl ||
          paper.cloudinaryUrl ||
          paper.fileUrl ||
          paper.url ||
          "",
        examDate,
        startTime,
        duration: Number(duration),
        totalMarks: Number(totalMarks),
        instructions,
        status: "DRAFT",
        createdBy: user.email || "",
        createdAt: serverTimestamp(),
      });

      alert("Examination created successfully.");

      router.push("/exam-centre");
    } catch (error) {
      console.error("Error creating examination:", error);
      alert("Failed to create examination.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow">
          <p className="text-gray-600">
            Loading question paper...
          </p>
        </div>
      </main>
    );
  }

  if (!paperId) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Question Paper Not Selected
          </h1>

          <p className="text-gray-600 mb-6">
            Please return to the Exam Centre and select a released
            question paper.
          </p>

          <button
            onClick={() => router.push("/exam-centre")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Back to Exam Centre
          </button>
        </div>
      </main>
    );
  }

  if (!paper) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Question Paper Not Found
          </h1>

          <p className="text-gray-600 mb-6">
            The selected question paper could not be found.
          </p>

          <button
            onClick={() => router.push("/exam-centre")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Back to Exam Centre
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => router.push("/exam-centre")}
          className="mb-6 text-indigo-600 font-semibold hover:text-indigo-800"
        >
          ← Back to Exam Centre
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          <div className="bg-indigo-600 px-8 py-7 text-white">
            <p className="text-indigo-100 text-sm font-medium mb-1">
              EXAM CENTRE
            </p>

            <h1 className="text-3xl font-bold">
              Create Examination
            </h1>

            <p className="mt-2 text-indigo-100">
              Create an examination from the released question paper.
            </p>
          </div>

          <div className="p-8">

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">

              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Selected Question Paper
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <p className="text-sm text-gray-500">
                    Paper
                  </p>

                  <p className="font-semibold text-gray-900">
                    {paper.paperName ||
                      paper.title ||
                      "Question Paper"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Subject
                  </p>

                  <p className="font-semibold text-gray-900">
                    {paper.subject || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Semester
                  </p>

                  <p className="font-semibold text-gray-900">
                    {paper.semester || "—"}
                  </p>
                </div>

              </div>
            </div>

            <form
              onSubmit={handleCreateExam}
              className="space-y-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exam Date
                  </label>

                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) =>
                      setExamDate(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>

                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) =>
                      setStartTime(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (Minutes)
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) =>
                      setDuration(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Marks
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={totalMarks}
                    onChange={(e) =>
                      setTotalMarks(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Examination Instructions
                </label>

                <textarea
                  value={instructions}
                  onChange={(e) =>
                    setInstructions(e.target.value)
                  }
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Enter examination instructions..."
                />

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    router.push("/exam-centre")
                  }
                  className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Creating..."
                    : "Create Examination"}
                </button>

              </div>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoadingCreateExam() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow">
        <p className="text-gray-600">
          Loading examination page...
        </p>
      </div>
    </main>
  );
}

export default function CreateExamPage() {
  return (
    <Suspense fallback={<LoadingCreateExam />}>
      <CreateExamContent />
    </Suspense>
  );
}