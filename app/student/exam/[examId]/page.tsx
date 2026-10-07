
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
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
import { auth, db } from "@/lib/firebase";

export default function StudentExamPage() {
  const router = useRouter();
  const params = useParams();

  const examId = params.examId as string;

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [attemptId, setAttemptId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const examSnapshot = await getDoc(
          doc(db, "exams", examId)
        );

        if (!examSnapshot.exists()) {
          alert("Examination not found.");
          router.push("/student");
          return;
        }

        const examData = examSnapshot.data();

        if (examData.status !== "PUBLISHED") {
          alert("This examination is not available.");
          router.push("/student");
          return;
        }

        setExam({
          id: examSnapshot.id,
          ...examData,
        });

        const questionQuery = query(
          collection(db, "questions"),
          where("examId", "==", examId)
        );

        const questionSnapshot = await getDocs(questionQuery);

        const questionList = questionSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setQuestions(questionList);

        const attemptRef = await addDoc(
          collection(db, "examAttempts"),
          {
            examId,
            studentId: user.uid,
            studentEmail: user.email || "",
            answers: {},
            status: "IN_PROGRESS",
            startedAt: serverTimestamp(),
          }
        );

        setAttemptId(attemptRef.id);

        setSecondsLeft(
          Number(examData.duration || 60) * 60
        );
      } catch (error) {
        console.error(error);
        alert("Failed to start examination.");
        router.push("/student");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [examId, router]);

  useEffect(() => {
    if (loading || secondsLeft <= 0 || submitting) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitting]);

  useEffect(() => {
    if (
      secondsLeft === 0 &&
      !loading &&
      attemptId &&
      !submitting
    ) {
      submitExam(true);
    }
  }, [secondsLeft, loading, attemptId, submitting]);

  const selectAnswer = (
    questionId: string,
    answer: string
  ) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  };

  async function submitExam(autoSubmit = false) {
    if (!attemptId || submitting) {
      return;
    }

    if (!autoSubmit) {
      const confirmed = confirm(
        "Are you sure you want to submit the examination?"
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      setSubmitting(true);

      await updateDoc(
        doc(db, "examAttempts", attemptId),
        {
          answers,
          status: "SUBMITTED",
          submittedAt: serverTimestamp(),
        }
      );

      alert(
        autoSubmit
          ? "Time is over. Your examination has been submitted automatically."
          : "Examination submitted successfully."
      );

      router.push("/student");
    } catch (error) {
      console.error(error);
      alert("Failed to submit examination.");
      setSubmitting(false);
    }
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <p className="text-slate-600">
            Preparing your examination...
          </p>
        </div>
      </main>
    );
  }

  if (!exam) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-5 py-4">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-xs font-semibold text-indigo-600">
                SECURE EXAMINATION
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                {exam.paperName || "Examination"}
              </h1>

              <p className="text-sm text-slate-500">
                {exam.subject || "—"}
              </p>
            </div>

            <div
              className={`px-6 py-3 rounded-xl font-bold text-lg ${
                secondsLeft <= 60
                  ? "bg-red-100 text-red-700"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              ⏱ {formatTime(secondsLeft)}
            </div>

          </div>

        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-8">

        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">

          <div className="flex flex-wrap justify-between gap-4 text-sm text-slate-600">

            <span>
              Questions: <strong>{questions.length}</strong>
            </span>

            <span>
              Answered:{" "}
              <strong>
                {Object.keys(answers).length}
              </strong>
            </span>

            <span>
              Total Marks:{" "}
              <strong>
                {exam.totalMarks || 0}
              </strong>
            </span>

          </div>

        </div>

        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">
            <p className="text-4xl mb-4">⚠️</p>

            <h2 className="text-xl font-bold text-slate-800">
              No questions available
            </h2>

            <p className="text-slate-500 mt-2">
              Please contact the examination centre.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {questions.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border shadow-sm p-6"
              >

                <div className="flex gap-3">

                  <div className="w-9 h-9 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1">

                    <div className="flex justify-between gap-4">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {item.question}
                      </h2>

                      <span className="text-sm text-slate-500 whitespace-nowrap">
                        {item.marks || 0} mark
                      </span>
                    </div>

                    <div className="grid gap-3 mt-5">

                      {[
                        ["A", item.optionA],
                        ["B", item.optionB],
                        ["C", item.optionC],
                        ["D", item.optionD],
                      ].map(([letter, option]) => (
                        <label
                          key={letter}
                          className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                            answers[item.id] === letter
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >

                          <input
                            type="radio"
                            name={`question-${item.id}`}
                            value={letter}
                            checked={
                              answers[item.id] === letter
                            }
                            onChange={() =>
                              selectAnswer(
                                item.id,
                                letter
                              )
                            }
                            className="w-5 h-5"
                          />

                          <span className="font-semibold text-slate-700">
                            {letter}.
                          </span>

                          <span className="text-slate-700">
                            {option}
                          </span>

                        </label>
                      ))}

                    </div>

                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl border shadow-sm p-6">

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
                <p className="text-sm text-yellow-800">
                  Please review your answers before submitting.
                  Once submitted, the examination cannot be resumed.
                </p>
              </div>

              <button
                onClick={() => submitExam(false)}
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting
                  ? "Submitting Examination..."
                  : "Submit Examination"}
              </button>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}

