"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function ManageExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [marks, setMarks] = useState("2");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      if (!examId) {
        router.push("/exam-centre");
        return;
      }

      try {
        const examSnap = await getDoc(doc(db, "exams", examId));

        if (!examSnap.exists()) {
          alert("Exam not found.");
          router.push("/exam-centre");
          return;
        }

        setExam({
          id: examSnap.id,
          ...examSnap.data(),
        });

        const q = query(
          collection(db, "questions"),
          where("examId", "==", examId)
        );

        const snapshot = await getDocs(q);

        setQuestions(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      } catch (error) {
        console.error(error);
        alert("Failed to load examination.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [examId, router]);

  const loadQuestions = async () => {
    if (!examId) {
      return;
    }

    try {
      const q = query(
        collection(db, "questions"),
        where("examId", "==", examId)
      );

      const snapshot = await getDocs(q);

      setQuestions(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );
    } catch (error) {
      console.error(error);
      alert("Failed to load questions.");
    }
  };

  const addQuestion = async () => {
    if (!examId) {
      alert("Exam ID is missing.");
      return;
    }

    if (
      !question.trim() ||
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim()
    ) {
      alert("Please fill all question fields.");
      return;
    }

    if (!marks || Number(marks) <= 0) {
      alert("Please enter valid marks.");
      return;
    }

    try {
      await addDoc(collection(db, "questions"), {
        examId,
        question: question.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        marks: Number(marks),
        createdAt: serverTimestamp(),
      });

      alert("Question added successfully.");

      setQuestion("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");
      setMarks("2");

      await loadQuestions();
    } catch (error) {
      console.error(error);
      alert("Failed to add question.");
    }
  };

  const publishExam = async () => {
    if (!examId) {
      alert("Exam ID is missing.");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question before publishing.");
      return;
    }

    if (!confirm("Publish this examination now?")) {
      return;
    }

    try {
      await updateDoc(doc(db, "exams", examId), {
        status: "PUBLISHED",
        publishedAt: serverTimestamp(),
        publishedBy: auth.currentUser?.email || "",
      });

      alert("Examination published successfully.");

      router.push("/exam-centre");
    } catch (error) {
      console.error(error);
      alert("Failed to publish examination.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <p className="text-slate-600">
            Loading examination...
          </p>
        </div>
      </main>
    );
  }

  if (!examId) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border shadow-sm p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Examination Not Selected
          </h1>

          <p className="text-slate-500 mt-3 mb-6">
            Please return to the Exam Centre and select an examination.
          </p>

          <button
            onClick={() => router.push("/exam-centre")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Back to Exam Centre
          </button>
        </div>
      </main>
    );
  }

  if (!exam) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border shadow-sm p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Examination Not Found
          </h1>

          <p className="text-slate-500 mt-3 mb-6">
            The selected examination could not be found.
          </p>

          <button
            onClick={() => router.push("/exam-centre")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Back to Exam Centre
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => router.push("/exam-centre")}
          className="mb-6 text-blue-600 font-medium hover:text-blue-800"
        >
          ← Back to Exam Centre
        </button>

        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

          <h1 className="text-3xl font-bold text-slate-900">
            Manage Examination
          </h1>

          <p className="text-slate-500 mt-2">
            {exam.paperName || "Examination"}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">
                Subject
              </p>

              <p className="font-bold">
                {exam.subject || "—"}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">
                Date
              </p>

              <p className="font-bold">
                {exam.examDate || "—"}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">
                Duration
              </p>

              <p className="font-bold">
                {exam.duration || 0} Minutes
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">
                Questions
              </p>

              <p className="font-bold">
                {questions.length}
              </p>
            </div>

          </div>
        </div>

        {exam.status === "DRAFT" && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

            <h2 className="text-xl font-bold mb-5">
              Add Question
            </h2>

            <div className="space-y-4">

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter question"
                className="w-full border rounded-xl p-4 min-h-28 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="grid md:grid-cols-2 gap-4">

                <input
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="Option A"
                  className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="Option B"
                  className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  placeholder="Option C"
                  className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  placeholder="Option D"
                  className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div className="grid md:grid-cols-2 gap-4">

                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">
                    Correct Answer: A
                  </option>

                  <option value="B">
                    Correct Answer: B
                  </option>

                  <option value="C">
                    Correct Answer: C
                  </option>

                  <option value="D">
                    Correct Answer: D
                  </option>
                </select>

                <input
                  type="number"
                  min="1"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="Marks"
                  className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <button
                onClick={addQuestion}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
              >
                + Add Question
              </button>

            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border p-6">

          <h2 className="text-xl font-bold mb-5">
            Questions ({questions.length})
          </h2>

          {questions.length === 0 ? (
            <p className="text-slate-500">
              No questions added yet.
            </p>
          ) : (
            <div className="space-y-5">

              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="border rounded-xl p-5"
                >

                  <p className="font-semibold">
                    {index + 1}. {q.question}
                  </p>

                  <div className="grid md:grid-cols-2 gap-2 mt-4 text-sm">

                    <p>A. {q.optionA}</p>
                    <p>B. {q.optionB}</p>
                    <p>C. {q.optionC}</p>
                    <p>D. {q.optionD}</p>

                  </div>

                  <p className="text-green-600 font-semibold mt-3">
                    Correct Answer: {q.correctAnswer}
                  </p>

                  <p className="text-slate-500 text-sm mt-1">
                    Marks: {q.marks}
                  </p>

                </div>
              ))}

            </div>
          )}

          {exam.status === "DRAFT" && (
            <button
              onClick={publishExam}
              className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700"
            >
              Publish Examination
            </button>
          )}

          {exam.status === "PUBLISHED" && (
            <p className="mt-6 text-green-600 font-bold">
              ✓ Examination Published
            </p>
          )}

        </div>
      </div>
    </main>
  );
}

function LoadingManageExam() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-slate-600">
          Loading examination page...
        </p>
      </div>
    </main>
  );
}

export default function ManageExamPage() {
  return (
    <Suspense fallback={<LoadingManageExam />}>
      <ManageExamContent />
    </Suspense>
  );
}