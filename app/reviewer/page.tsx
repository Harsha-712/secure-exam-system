"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

type QuestionPaper = {
  id: string;
  title: string;
  subject: string;
  year: string;
  semester: string;
  fileName: string;
  fileUrl: string;
  uploadedByEmail: string;
  createdAt: any;
  status: string;
  reviewedByEmail?: string;
  reviewedAt?: any;
  reviewComment?: string;
};

export default function ReviewerPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");
  const [pendingPapers, setPendingPapers] = useState<QuestionPaper[]>([]);
  const [reviewedPapers, setReviewedPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPaper, setSelectedPaper] =
    useState<QuestionPaper | null>(null);

  const [comment, setComment] = useState("");

  const [checklist, setChecklist] = useState({
    syllabus: false,
    correctness: false,
    difficulty: false,
    duplicates: false,
    marks: false,
    formatting: false,
  });

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const email = user.email || "";
      setUserEmail(email);

      try {
        // Check reviewer role
        const usersRef = collection(db, "users");

        const userQuery = query(
          usersRef,
          where("email", "==", email)
        );

        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          router.push("/unauthorized");
          return;
        }

        const userData = userSnapshot.docs[0].data();
        const role = (userData.role || "").trim();

        if (role !== "REVIEWER") {
          router.push("/unauthorized");
          return;
        }

        await loadPapers();
      } catch (error) {
        console.error("Error loading reviewer data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function loadPapers() {
    try {
      const papersRef = collection(db, "questionPapers");

      // Pending papers
      const pendingQuery = query(
        papersRef,
        where("status", "==", "PENDING"),
        orderBy("createdAt", "desc")
      );

      const pendingSnapshot = await getDocs(pendingQuery);

      const pendingData = pendingSnapshot.docs.map((paper) => ({
        id: paper.id,
        ...paper.data(),
      })) as QuestionPaper[];

      setPendingPapers(pendingData);

      // Reviewed papers
      const reviewedQuery = query(
        papersRef,
        where("status", "in", ["APPROVED", "REJECTED"]),
        orderBy("reviewedAt", "desc")
      );

      const reviewedSnapshot = await getDocs(reviewedQuery);

      const reviewedData = reviewedSnapshot.docs.map((paper) => ({
        id: paper.id,
        ...paper.data(),
      })) as QuestionPaper[];

      setReviewedPapers(reviewedData);
    } catch (error) {
      console.error("Error loading papers:", error);
    }
  }

  function openReview(paper: QuestionPaper) {
    setSelectedPaper(paper);
    setComment("");

    setChecklist({
      syllabus: false,
      correctness: false,
      difficulty: false,
      duplicates: false,
      marks: false,
      formatting: false,
    });
  }

  function toggleChecklist(
    key: keyof typeof checklist
  ) {
    setChecklist((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  }

  async function approvePaper() {
    if (!selectedPaper) return;

    const allChecked = Object.values(checklist).every(
      (value) => value === true
    );

    if (!allChecked) {
      alert("Please complete all review checklist items before approving.");
      return;
    }

    setProcessing(true);

    try {
      const paperRef = doc(
        db,
        "questionPapers",
        selectedPaper.id
      );

      await updateDoc(paperRef, {
        status: "APPROVED",
        reviewedBy: auth.currentUser?.uid || "",
        reviewedByEmail: userEmail,
        reviewedAt: new Date(),
        reviewComment: comment.trim(),
      });

      alert("Question paper approved successfully.");

      setSelectedPaper(null);
      setComment("");

      await loadPapers();
    } catch (error) {
      console.error("Error approving paper:", error);
      alert("Failed to approve question paper.");
    } finally {
      setProcessing(false);
    }
  }

  async function rejectPaper() {
    if (!selectedPaper) return;

    if (!comment.trim()) {
      alert("Please enter a reason before rejecting the paper.");
      return;
    }

    setProcessing(true);

    try {
      const paperRef = doc(
        db,
        "questionPapers",
        selectedPaper.id
      );

      await updateDoc(paperRef, {
        status: "REJECTED",
        reviewedBy: auth.currentUser?.uid || "",
        reviewedByEmail: userEmail,
        reviewedAt: new Date(),
        reviewComment: comment.trim(),
      });

      alert("Question paper rejected.");

      setSelectedPaper(null);
      setComment("");

      await loadPapers();
    } catch (error) {
      console.error("Error rejecting paper:", error);
      alert("Failed to reject question paper.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow">
          <p className="text-lg">Loading reviewer dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-sm text-gray-500">
                Secure Examination System
              </p>

              <h1 className="text-3xl font-bold text-gray-900">
                Reviewer Dashboard
              </h1>

              <p className="text-gray-600 mt-1">
                Review and validate submitted question papers.
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-sm text-gray-500">
                Logged in as
              </p>

              <p className="font-semibold text-gray-900">
                {userEmail}
              </p>

              <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                REVIEWER
              </span>
            </div>

          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">
              Pending Reviews
            </p>

            <p className="text-3xl font-bold text-orange-600 mt-2">
              {pendingPapers.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">
              Approved Papers
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {
                reviewedPapers.filter(
                  (paper) => paper.status === "APPROVED"
                ).length
              }
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">
              Rejected Papers
            </p>

            <p className="text-3xl font-bold text-red-600 mt-2">
              {
                reviewedPapers.filter(
                  (paper) => paper.status === "REJECTED"
                ).length
              }
            </p>
          </div>

        </div>

        {/* Pending Papers */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Pending Question Papers
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                These papers are waiting for your review.
              </p>
            </div>

            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
              {pendingPapers.length} Pending
            </span>
          </div>

          {pendingPapers.length === 0 ? (
            <div className="border border-dashed rounded-xl p-10 text-center">
              <p className="text-gray-500">
                No question papers are currently waiting for review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {pendingPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="border rounded-xl p-5 hover:shadow-md transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {paper.title}
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">

                        <div>
                          <p className="text-gray-400">
                            Subject
                          </p>
                          <p className="font-medium">
                            {paper.subject}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400">
                            Year
                          </p>
                          <p className="font-medium">
                            {paper.year}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400">
                            Semester
                          </p>
                          <p className="font-medium">
                            {paper.semester}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400">
                            Uploaded By
                          </p>
                          <p className="font-medium break-all">
                            {paper.uploadedByEmail}
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="flex gap-3">

                      <a
                        href={paper.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        View PDF
                      </a>

                      <button
                        onClick={() => openReview(paper)}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Review
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* Review History */}
        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-xl font-bold text-gray-900">
            Review History
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Previously reviewed question papers.
          </p>

          {reviewedPapers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No review history available.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b">

                    <th className="p-3 text-sm text-gray-500">
                      Paper
                    </th>

                    <th className="p-3 text-sm text-gray-500">
                      Subject
                    </th>

                    <th className="p-3 text-sm text-gray-500">
                      Status
                    </th>

                    <th className="p-3 text-sm text-gray-500">
                      Reviewed By
                    </th>

                    <th className="p-3 text-sm text-gray-500">
                      Comment
                    </th>

                    <th className="p-3 text-sm text-gray-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {reviewedPapers.map((paper) => (

                    <tr
                      key={paper.id}
                      className="border-b last:border-b-0"
                    >

                      <td className="p-3 font-medium">
                        {paper.title}
                      </td>

                      <td className="p-3">
                        {paper.subject}
                      </td>

                      <td className="p-3">

                        {paper.status === "APPROVED" ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                            APPROVED
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                            REJECTED
                          </span>
                        )}

                      </td>

                      <td className="p-3 text-sm">
                        {paper.reviewedByEmail || "-"}
                      </td>

                      <td className="p-3 text-sm max-w-xs">
                        {paper.reviewComment || "-"}
                      </td>

                      <td className="p-3">

                        <a
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View PDF
                        </a>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* Review Modal */}
        {selectedPaper && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

              <div className="p-6 border-b">

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-sm text-gray-500">
                      Question Paper Review
                    </p>

                    <h2 className="text-2xl font-bold mt-1">
                      {selectedPaper.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedPaper(null)}
                    className="text-gray-500 hover:text-gray-900 text-2xl"
                  >
                    ×
                  </button>

                </div>

              </div>

              <div className="p-6">

                {/* Paper Details */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 mb-6">

                  <div>
                    <p className="text-xs text-gray-500">
                      Subject
                    </p>
                    <p className="font-semibold">
                      {selectedPaper.subject}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Year
                    </p>
                    <p className="font-semibold">
                      {selectedPaper.year}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Semester
                    </p>
                    <p className="font-semibold">
                      {selectedPaper.semester}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Uploaded By
                    </p>
                    <p className="font-semibold break-all">
                      {selectedPaper.uploadedByEmail}
                    </p>
                  </div>

                </div>

                {/* PDF */}
                <a
                  href={selectedPaper.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 mb-6"
                >
                  Open Question Paper PDF
                </a>

                {/* Checklist */}
                <div>

                  <h3 className="text-lg font-bold mb-3">
                    Review Checklist
                  </h3>

                  <div className="space-y-3">

                    <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checklist.syllabus}
                        onChange={() =>
                          toggleChecklist("syllabus")
                        }
                        className="w-5 h-5"
                      />

                      <span>
                        Questions are relevant to the syllabus
                      </span>
                    </label>

                    <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checklist.correctness}
                        onChange={() =>
                          toggleChecklist("correctness")
                        }
                        className="w-5 h-5"
                      />

                      <span>
                        Questions are technically correct
                      </span>
                    </label>

                    <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checklist.difficulty}
                        onChange={() =>
                          toggleChecklist("difficulty")
                        }
                        className="w-5 h-5"
                      />

                      <span>
                        Difficulty level is appropriate
                      </span>
                    </label>

                    <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checklist.duplicates}
                        onChange={() =>
                          toggleChecklist("duplicates")
                        }
                        className="w-5 h-5"
                      />

                      <span>
                        No duplicate or repeated questions
                      </span>
                    </label>

                    <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checklist.marks}
                        onChange={() =>
                          toggleChecklist("marks")
                        }
                        className="w-5 h-5"
                      />

                      <span>
                        Marks distribution is correct
                      </span>
                    </label>

                    <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={checklist.formatting}
                        onChange={() =>
                          toggleChecklist("formatting")
                        }
                        className="w-5 h-5"
                      />

                      <span>
                        Question paper formatting is acceptable
                      </span>
                    </label>

                  </div>

                </div>

                {/* Comments */}
                <div className="mt-6">

                  <label className="block font-semibold mb-2">
                    Reviewer Comments
                  </label>

                  <textarea
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    placeholder="Enter comments or observations about this question paper..."
                    rows={5}
                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">

                  <button
                    onClick={rejectPaper}
                    disabled={processing}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Reject Paper"}
                  </button>

                  <button
                    onClick={approvePaper}
                    disabled={processing}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Approve Paper"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* Back */}
        <div className="mt-6">

          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>

        </div>

      </div>
    </main>
  );
}