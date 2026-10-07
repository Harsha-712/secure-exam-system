
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

export default function ExamCentrePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [publishing, setPublishing] = useState("");

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
          alert("User role not found.");
          router.push("/dashboard");
          return;
        }

        const userData = userSnapshot.docs[0].data();

        if (userData.role !== "EXAM_CENTRE") {
          alert("Access denied.");
          router.push("/dashboard");
          return;
        }

        const papersQuery = query(
          collection(db, "questionPapers"),
          where("status", "==", "RELEASED"),
          orderBy("releasedAt", "desc")
        );

        const papersSnapshot = await getDocs(papersQuery);

        const releasedPapers = papersSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setPapers(releasedPapers);

        const examsSnapshot = await getDocs(
          collection(db, "exams")
        );

        const examList = examsSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setExams(examList);
      } catch (error) {
        console.error("Error loading Exam Centre:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function handlePublish(examId: string) {
    try {
      setPublishing(examId);

      await updateDoc(doc(db, "exams", examId), {
        status: "PUBLISHED",
        publishedAt: serverTimestamp(),
        publishedBy: auth.currentUser?.email || "",
      });

      setExams((current) =>
        current.map((exam) =>
          exam.id === examId
            ? {
                ...exam,
                status: "PUBLISHED",
              }
            : exam
        )
      );

      alert("Examination published successfully.");
    } catch (error) {
      console.error("Error publishing examination:", error);
      alert("Failed to publish examination.");
    } finally {
      setPublishing("");
    }
  }

  function handleManageQuestions(examId: string) {
    router.push(`/exam-centre/manage-exam?examId=${examId}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow">
          <p className="text-gray-600">
            Loading Exam Centre...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <p className="text-indigo-600 font-semibold text-sm">
            SECURE EXAMINATION SYSTEM
          </p>

          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Exam Centre Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Manage officially released examination papers and
            examinations.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">

            <div className="bg-indigo-50 rounded-xl px-6 py-4">
              <p className="text-sm text-gray-500">
                Released Papers
              </p>

              <p className="text-2xl font-bold text-indigo-700">
                {papers.length}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-xl px-6 py-4">
              <p className="text-sm text-gray-500">
                Draft Exams
              </p>

              <p className="text-2xl font-bold text-yellow-700">
                {
                  exams.filter(
                    (exam) => exam.status === "DRAFT"
                  ).length
                }
              </p>
            </div>

            <div className="bg-green-50 rounded-xl px-6 py-4">
              <p className="text-sm text-gray-500">
                Published Exams
              </p>

              <p className="text-2xl font-bold text-green-700">
                {
                  exams.filter(
                    (exam) => exam.status === "PUBLISHED"
                  ).length
                }
              </p>
            </div>

          </div>
        </div>

        {/* RELEASED PAPERS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Released Question Papers
              </h2>

              <p className="text-gray-500 mt-1">
                These papers have been officially released by
                the Admin.
              </p>
            </div>

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              {papers.length} Released
            </span>
          </div>

          {papers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No released question papers available.
            </div>
          ) : (
            <div className="grid gap-6">

              {papers.map((paper) => {
                const pdfUrl =
                  paper.pdfUrl ||
                  paper.fileUrl ||
                  paper.cloudinaryUrl ||
                  paper.url ||
                  "";

                return (
                  <div
                    key={paper.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                      <div>

                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            📄
                          </span>

                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {paper.paperName ||
                                paper.title ||
                                "Question Paper"}
                            </h3>

                            <p className="text-gray-500">
                              Official examination question paper
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6">

                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Subject
                            </p>

                            <p className="font-semibold text-gray-900">
                              {paper.subject || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Year
                            </p>

                            <p className="font-semibold text-gray-900">
                              {paper.year || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Semester
                            </p>

                            <p className="font-semibold text-gray-900">
                              {paper.semester || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Status
                            </p>

                            <span className="inline-block mt-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                              RELEASED
                            </span>
                          </div>

                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">

                        {pdfUrl && (
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                          >
                            📄 View Question Paper
                          </a>
                        )}

                        <button
                          onClick={() =>
                            router.push(
                              `/exam-centre/create-exam?paperId=${paper.id}`
                            )
                          }
                          className="px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                        >
                          ➕ Create Exam
                        </button>

                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </section>

        {/* MY EXAMINATIONS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                My Examinations
              </h2>

              <p className="text-gray-500 mt-1">
                Examinations created by the Exam Centre.
              </p>
            </div>
          </div>

          {exams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No examinations created yet.
            </div>
          ) : (
            <div className="grid gap-5">

              {exams.map((exam) => (

                <div
                  key={exam.id}
                  className="border border-gray-200 rounded-xl p-6"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {exam.paperName || "Examination"}
                      </h3>

                      <p className="text-gray-500 mt-1">
                        {exam.subject || "—"}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
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

                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`px-4 py-2 rounded-full text-xs font-bold ${
                          exam.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {exam.status || "DRAFT"}
                      </span>

                      {exam.status === "DRAFT" && (
                        <button
                          onClick={() =>
                            handleManageQuestions(exam.id)
                          }
                          className="px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                        >
                          Manage Questions
                        </button>
                      )}

                      {exam.status === "DRAFT" && (
                        <button
                          onClick={() =>
                            handlePublish(exam.id)
                          }
                          disabled={publishing === exam.id}
                          className="px-5 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          {publishing === exam.id
                            ? "Publishing..."
                            : "Publish"}
                        </button>
                      )}

                      {exam.status === "PUBLISHED" && (
                        <button
                          onClick={() =>
                            handleManageQuestions(exam.id)
                          }
                          className="px-5 py-3 rounded-lg border border-indigo-300 text-indigo-700 font-semibold hover:bg-indigo-50"
                        >
                          View Questions
                        </button>
                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

        {/* FOOTER */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Secure Release Workflow: Question Setter → Reviewer →
          Admin → Released → Exam Centre
        </div>

      </div>
    </main>
  );
}

