
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
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
  uploadedBy: string;
  uploadedByEmail: string;
  createdAt?: any;

  status: string;

  reviewedBy?: string;
  reviewedByEmail?: string;
  reviewedAt?: any;
  reviewComment?: string;

  finalizedBy?: string;
  finalizedByEmail?: string;
  finalizedAt?: any;

  releaseDate?: string;
  releaseTime?: string;

  scheduledBy?: string;
  scheduledByEmail?: string;
  scheduledAt?: any;

  releasedBy?: string;
  releasedByEmail?: string;
  releasedAt?: any;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const [approvedPapers, setApprovedPapers] = useState<QuestionPaper[]>([]);
  const [finalizedPapers, setFinalizedPapers] = useState<QuestionPaper[]>([]);
  const [scheduledPapers, setScheduledPapers] = useState<QuestionPaper[]>([]);
  const [releasedPapers, setReleasedPapers] = useState<QuestionPaper[]>([]);

  const [finalizingId, setFinalizingId] = useState<string | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const [schedulePaper, setSchedulePaper] =
    useState<QuestionPaper | null>(null);

  const [releaseDate, setReleaseDate] = useState("");
  const [releaseTime, setReleaseTime] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        setUserEmail(user.email || "");

        const usersRef = collection(db, "users");

        const roleQuery = query(
          usersRef,
          where("email", "==", user.email || "")
        );

        const roleSnapshot = await getDocs(roleQuery);

        if (roleSnapshot.empty) {
          router.push("/unauthorized");
          return;
        }

        const userData = roleSnapshot.docs[0].data();
        const role = (userData.role || "").trim();

        if (role !== "ADMIN") {
          router.push("/unauthorized");
          return;
        }

        await loadPapers();
      } catch (err) {
        console.error("Admin authentication error:", err);
        setError("Unable to load the Admin dashboard.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function loadPapers() {
    try {
      setError("");

      const papersRef = collection(db, "questionPapers");

      // APPROVED PAPERS
      const approvedQuery = query(
        papersRef,
        where("status", "==", "APPROVED"),
        orderBy("reviewedAt", "desc")
      );

      const approvedSnapshot = await getDocs(approvedQuery);

      const approvedData: QuestionPaper[] = approvedSnapshot.docs.map(
        (paper) =>
          ({
            id: paper.id,
            ...paper.data(),
          }) as QuestionPaper
      );

      setApprovedPapers(approvedData);

      // FINALIZED PAPERS
      const finalizedQuery = query(
        papersRef,
        where("status", "==", "FINALIZED"),
        orderBy("finalizedAt", "desc")
      );

      const finalizedSnapshot = await getDocs(finalizedQuery);

      const finalizedData: QuestionPaper[] = finalizedSnapshot.docs.map(
        (paper) =>
          ({
            id: paper.id,
            ...paper.data(),
          }) as QuestionPaper
      );

      setFinalizedPapers(finalizedData);

      // SCHEDULED PAPERS
      const scheduledQuery = query(
        papersRef,
        where("status", "==", "SCHEDULED"),
        orderBy("scheduledAt", "desc")
      );

      const scheduledSnapshot = await getDocs(scheduledQuery);

      const scheduledData: QuestionPaper[] = scheduledSnapshot.docs.map(
        (paper) =>
          ({
            id: paper.id,
            ...paper.data(),
          }) as QuestionPaper
      );

      setScheduledPapers(scheduledData);

      // RELEASED PAPERS
      const releasedQuery = query(
        papersRef,
        where("status", "==", "RELEASED"),
        orderBy("releasedAt", "desc")
      );

      const releasedSnapshot = await getDocs(releasedQuery);

      const releasedData: QuestionPaper[] = releasedSnapshot.docs.map(
        (paper) =>
          ({
            id: paper.id,
            ...paper.data(),
          }) as QuestionPaper
      );

      setReleasedPapers(releasedData);
    } catch (err) {
      console.error("Error loading papers:", err);

      setError(
        "Unable to load question papers. Please check your Firebase indexes."
      );
    }
  }

  async function finalizePaper(paper: QuestionPaper) {
    const confirmed = window.confirm(
      `Are you sure you want to finalize "${paper.title}"?\n\nOnce finalized, this paper will move to the scheduling stage.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setFinalizingId(paper.id);
      setMessage("");
      setError("");

      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const paperRef = doc(db, "questionPapers", paper.id);

      await updateDoc(paperRef, {
        status: "FINALIZED",
        finalizedBy: currentUser.uid,
        finalizedByEmail: currentUser.email || userEmail,
        finalizedAt: new Date(),
      });

      setMessage(`"${paper.title}" has been finalized successfully.`);

      await loadPapers();
    } catch (err) {
      console.error("Error finalizing paper:", err);
      setError("Unable to finalize the question paper.");
    } finally {
      setFinalizingId(null);
    }
  }

  function openScheduleModal(paper: QuestionPaper) {
    setSchedulePaper(paper);
    setReleaseDate("");
    setReleaseTime("");
    setMessage("");
    setError("");
  }

  function closeScheduleModal() {
    if (schedulingId) {
      return;
    }

    setSchedulePaper(null);
    setReleaseDate("");
    setReleaseTime("");
  }

  async function confirmSchedule() {
    if (!schedulePaper) {
      return;
    }

    if (!releaseDate) {
      setError("Please select a release date.");
      return;
    }

    if (!releaseTime) {
      setError("Please select a release time.");
      return;
    }

    const selectedDateTime = new Date(
      `${releaseDate}T${releaseTime}:00`
    );

    if (Number.isNaN(selectedDateTime.getTime())) {
      setError("Please enter a valid release date and time.");
      return;
    }

    if (selectedDateTime <= new Date()) {
      setError("Release date and time must be in the future.");
      return;
    }

    try {
      setSchedulingId(schedulePaper.id);
      setMessage("");
      setError("");

      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const paperId = schedulePaper.id;
      const paperTitle = schedulePaper.title;

      const paperRef = doc(db, "questionPapers", paperId);

      await updateDoc(paperRef, {
        status: "SCHEDULED",
        releaseDate,
        releaseTime,
        scheduledBy: currentUser.uid,
        scheduledByEmail: currentUser.email || userEmail,
        scheduledAt: new Date(),
      });

      setSchedulePaper(null);
      setReleaseDate("");
      setReleaseTime("");

      setMessage(
        `"${paperTitle}" has been scheduled successfully for ${releaseDate} at ${releaseTime}.`
      );

      await loadPapers();
    } catch (err) {
      console.error("Error scheduling paper:", err);
      setError("Unable to schedule the question paper.");
    } finally {
      setSchedulingId(null);
    }
  }

  async function releasePaper(paper: QuestionPaper) {
    const confirmed = window.confirm(
      `Are you sure you want to release "${paper.title}"?\n\nOnce released, this paper will become available to the Exam Centre.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setReleasingId(paper.id);
      setMessage("");
      setError("");

      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const paperRef = doc(db, "questionPapers", paper.id);

      await updateDoc(paperRef, {
        status: "RELEASED",
        releasedBy: currentUser.uid,
        releasedByEmail: currentUser.email || userEmail,
        releasedAt: new Date(),
      });

      setMessage(
        `"${paper.title}" has been released successfully. It is now available to the Exam Centre.`
      );

      await loadPapers();
    } catch (err) {
      console.error("Error releasing paper:", err);
      setError("Unable to release the question paper.");
    } finally {
      setReleasingId(null);
    }
  }

  function formatDate(timestamp: any) {
    if (!timestamp) {
      return "-";
    }

    try {
      if (timestamp?.toDate) {
        return timestamp.toDate().toLocaleString();
      }

      if (timestamp instanceof Date) {
        return timestamp.toLocaleString();
      }

      return new Date(timestamp).toLocaleString();
    } catch {
      return "-";
    }
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "FINALIZED":
        return "bg-blue-100 text-blue-700";

      case "SCHEDULED":
        return "bg-purple-100 text-purple-700";

      case "RELEASED":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-slate-600 font-medium">
            Loading Admin Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                Secure Examination System
              </p>

              <h1 className="text-3xl font-bold text-slate-900 mt-1">
                Admin Dashboard
              </h1>

              <p className="text-slate-600 mt-1">
                Finalize, schedule and release examination question papers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500">
                  Logged in as
                </p>

                <p className="text-sm font-semibold text-slate-800">
                  {userEmail}
                </p>

                <span className="inline-block mt-1 px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                  ADMIN
                </span>
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-5 py-4 text-green-700">
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Approved Papers
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {approvedPapers.length}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Waiting for finalization
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Finalized Papers
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {finalizedPapers.length}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Ready for scheduling
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Scheduled Papers
            </p>

            <p className="text-3xl font-bold text-purple-600 mt-2">
              {scheduledPapers.length}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Waiting for release
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Released Papers
            </p>

            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {releasedPapers.length}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Available to Exam Centre
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Controlled
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {approvedPapers.length +
                finalizedPapers.length +
                scheduledPapers.length +
                releasedPapers.length}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Admin workflow papers
            </p>
          </div>
        </div>

        {/* APPROVED PAPERS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Approved Question Papers
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                These papers have passed Reviewer validation and are ready for
                Admin finalization.
              </p>
            </div>

            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {approvedPapers.length} Approved
            </span>
          </div>

          <div className="p-6">
            {approvedPapers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✓</div>

                <h3 className="text-lg font-semibold text-slate-800">
                  No approved papers waiting
                </h3>

                <p className="text-slate-500 mt-2">
                  Papers approved by the Reviewer will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {paper.title}
                          </h3>

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(
                              paper.status
                            )}`}
                          >
                            {paper.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-slate-400">Subject</p>

                            <p className="font-medium text-slate-700">
                              {paper.subject || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Year</p>

                            <p className="font-medium text-slate-700">
                              {paper.year || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Semester</p>

                            <p className="font-medium text-slate-700">
                              {paper.semester || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Reviewed</p>

                            <p className="font-medium text-slate-700">
                              {formatDate(paper.reviewedAt)}
                            </p>
                          </div>
                        </div>

                        {paper.reviewedByEmail && (
                          <p className="text-xs text-slate-500 mt-4">
                            Reviewed by:{" "}
                            <span className="font-medium">
                              {paper.reviewedByEmail}
                            </span>
                          </p>
                        )}

                        {paper.reviewComment && (
                          <div className="mt-3 bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-400">
                              Reviewer Comment
                            </p>

                            <p className="text-sm text-slate-700 mt-1">
                              {paper.reviewComment}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <a
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold text-center hover:bg-slate-200 transition"
                        >
                          View PDF
                        </a>

                        <button
                          onClick={() => finalizePaper(paper)}
                          disabled={finalizingId === paper.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                        >
                          {finalizingId === paper.id
                            ? "Finalizing..."
                            : "Finalize Paper"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FINALIZED PAPERS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Finalized Papers
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                These papers are finalized by the Admin and are ready for
                release scheduling.
              </p>
            </div>

            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {finalizedPapers.length} Finalized
            </span>
          </div>

          <div className="p-6">
            {finalizedPapers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-500">
                  No finalized papers yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {finalizedPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {paper.title}
                          </h3>

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(
                              paper.status
                            )}`}
                          >
                            {paper.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-slate-400">Subject</p>

                            <p className="font-medium text-slate-700">
                              {paper.subject || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Year</p>

                            <p className="font-medium text-slate-700">
                              {paper.year || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Semester</p>

                            <p className="font-medium text-slate-700">
                              {paper.semester || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Finalized</p>

                            <p className="font-medium text-slate-700">
                              {formatDate(paper.finalizedAt)}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-4">
                          Finalized by:{" "}
                          <span className="font-medium">
                            {paper.finalizedByEmail || "-"}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <a
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold text-center hover:bg-slate-200 transition"
                        >
                          View PDF
                        </a>

                        <button
                          onClick={() => openScheduleModal(paper)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                        >
                          Schedule Release
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SCHEDULED PAPERS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Scheduled Papers
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Papers scheduled for release will appear here.
              </p>
            </div>

            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              {scheduledPapers.length} Scheduled
            </span>
          </div>

          <div className="p-6">
            {scheduledPapers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-500">
                  No papers have been scheduled yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="border border-purple-200 bg-purple-50/30 rounded-xl p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {paper.title}
                          </h3>

                          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                            SCHEDULED
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 mt-2">
                          {paper.subject} • {paper.year} • Semester{" "}
                          {paper.semester}
                        </p>

                        <div className="mt-3 space-y-1">
                          <p className="text-sm text-purple-700 font-medium">
                            Release Date: {paper.releaseDate || "-"}
                          </p>

                          <p className="text-sm text-purple-700 font-medium">
                            Release Time: {paper.releaseTime || "-"}
                          </p>

                          <p className="text-xs text-slate-500">
                            Scheduled by:{" "}
                            {paper.scheduledByEmail || "-"}
                          </p>

                          <p className="text-xs text-slate-500">
                            Scheduled at:{" "}
                            {formatDate(paper.scheduledAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <a
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold text-center hover:bg-slate-200 transition"
                        >
                          View PDF
                        </a>

                        <button
                          onClick={() => releasePaper(paper)}
                          disabled={releasingId === paper.id}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition"
                        >
                          {releasingId === paper.id
                            ? "Releasing..."
                            : "Release Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RELEASED PAPERS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Released Papers
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                These papers have been officially released and are now
                available to the Exam Centre.
              </p>
            </div>

            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
              {releasedPapers.length} Released
            </span>
          </div>

          <div className="p-6">
            {releasedPapers.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📄</div>

                <h3 className="text-lg font-semibold text-slate-800">
                  No released papers
                </h3>

                <p className="text-slate-500 mt-2">
                  Papers released by the Admin will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {releasedPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {paper.title}
                          </h3>

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(
                              paper.status
                            )}`}
                          >
                            RELEASED
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-slate-400">Subject</p>

                            <p className="font-medium text-slate-700">
                              {paper.subject || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Year</p>

                            <p className="font-medium text-slate-700">
                              {paper.year || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Semester</p>

                            <p className="font-medium text-slate-700">
                              {paper.semester || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400">Released</p>

                            <p className="font-medium text-slate-700">
                              {formatDate(paper.releasedAt)}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-4">
                          Released by:{" "}
                          <span className="font-medium">
                            {paper.releasedByEmail || "-"}
                          </span>
                        </p>
                      </div>

                      <a
                        href={paper.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold text-center hover:bg-emerald-700 transition"
                      >
                        View Released Paper
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BACK TO DASHBOARD */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </section>

      {/* SCHEDULE MODAL */}
      {schedulePaper && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Schedule Question Paper
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Set when this paper should become available for release.
                  </p>
                </div>

                <button
                  onClick={closeScheduleModal}
                  disabled={!!schedulingId}
                  className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-slate-500">
                  Question Paper
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  {schedulePaper.title}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {schedulePaper.subject} • {schedulePaper.year} • Semester{" "}
                  {schedulePaper.semester}
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Release Date
                  </label>

                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(event) =>
                      setReleaseDate(event.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Release Time
                  </label>

                  <input
                    type="time"
                    value={releaseTime}
                    onChange={(event) =>
                      setReleaseTime(event.target.value)
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-7">
                <button
                  onClick={closeScheduleModal}
                  disabled={!!schedulingId}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmSchedule}
                  disabled={!!schedulingId}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
                >
                  {schedulingId
                    ? "Scheduling..."
                    : "Confirm Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

