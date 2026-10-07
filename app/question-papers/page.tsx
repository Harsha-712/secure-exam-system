
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

type Paper = {
  id: string;
  title: string;
  subject: string;
  year: string;
  semester: string;
  fileName: string;
  fileUrl: string;
};

export default function QuestionPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPapers();
  }, []);

  async function loadPapers() {
    try {
      setLoading(true);

      const q = query(
        collection(db, "questionPapers"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data: Paper[] = snapshot.docs.map((doc) => {
        const item = doc.data();

        return {
          id: doc.id,
          title: item.title || "Untitled",
          subject: item.subject || "Unknown",
          year: item.year || "",
          semester: item.semester || "",
          fileName: item.fileName || "",
          fileUrl: item.fileUrl || "",
        };
      });

      setPapers(data);
    } catch (error) {
      console.error(
        "Error loading question papers:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  const subjects = [
    ...new Set(
      papers
        .map((p) => p.subject)
        .filter(Boolean)
    ),
  ];

  const years = [
    ...new Set(
      papers
        .map((p) => p.year)
        .filter(Boolean)
    ),
  ];

  const semesters = [
    ...new Set(
      papers
        .map((p) => p.semester)
        .filter(Boolean)
    ),
  ];

  const filteredPapers = papers.filter((paper) => {
    const text = search.toLowerCase();

    const matchesSearch =
      paper.title.toLowerCase().includes(text) ||
      paper.subject.toLowerCase().includes(text) ||
      paper.year.toLowerCase().includes(text) ||
      paper.semester.toLowerCase().includes(text);

    const matchesSubject =
      !subject || paper.subject === subject;

    const matchesYear =
      !year || paper.year === year;

    const matchesSemester =
      !semester || paper.semester === semester;

    return (
      matchesSearch &&
      matchesSubject &&
      matchesYear &&
      matchesSemester
    );
  });

  function getDownloadUrl(fileUrl: string) {
    if (!fileUrl) {
      return "#";
    }

    return fileUrl.includes("?")
      ? `${fileUrl}&fl_attachment`
      : `${fileUrl}?fl_attachment`;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-3xl font-bold">
              Question Papers
            </h1>

            <p className="mt-2 text-gray-600">
              Search and access uploaded question papers.
            </p>
          </div>

          {/* Correct Upload Route */}

          <a
            href="/question-setter/question-papers"
            className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
          >
            Upload New Paper
          </a>

        </div>

        {/* Search and Filters */}

        <div className="mt-6 rounded-xl bg-white p-5 shadow">

          <input
            type="text"
            placeholder="Search question papers..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-3">

            {/* Subject */}

            <select
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              className="rounded-lg border p-3"
            >
              <option value="">
                All Subjects
              </option>

              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Year */}

            <select
              value={year}
              onChange={(e) =>
                setYear(e.target.value)
              }
              className="rounded-lg border p-3"
            >
              <option value="">
                All Years
              </option>

              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Semester */}

            <select
              value={semester}
              onChange={(e) =>
                setSemester(e.target.value)
              }
              className="rounded-lg border p-3"
            >
              <option value="">
                All Semesters
              </option>

              {semesters.map((item) => (
                <option key={item} value={item}>
                  Semester {item}
                </option>
              ))}
            </select>

          </div>

          {/* Clear Filters */}

          <button
            onClick={() => {
              setSearch("");
              setSubject("");
              setYear("");
              setSemester("");
            }}
            className="mt-4 rounded-lg border px-5 py-2 hover:bg-gray-50"
          >
            Clear Filters
          </button>

        </div>

        {/* Loading */}

        {loading ? (

          <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">
            Loading question papers...
          </div>

        ) : filteredPapers.length === 0 ? (

          /* No Papers */

          <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">

            <p className="text-lg font-semibold">
              No question papers found.
            </p>

            <p className="mt-2 text-gray-500">
              Upload a question paper to see it here.
            </p>

          </div>

        ) : (

          /* Papers */

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {filteredPapers.map((paper) => (

              <div
                key={paper.id}
                className="rounded-xl bg-white p-6 shadow"
              >

                {/* Paper Header */}

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-2xl">
                    📄
                  </div>

                  <div className="min-w-0">

                    <h2 className="text-xl font-bold">
                      {paper.title}
                    </h2>

                    <p className="mt-1 break-all text-sm text-gray-500">
                      {paper.fileName}
                    </p>

                  </div>

                </div>

                {/* Paper Details */}

                <div className="mt-5 space-y-2">

                  <p>
                    <strong>Subject:</strong>{" "}
                    {paper.subject}
                  </p>

                  <p>
                    <strong>Year:</strong>{" "}
                    {paper.year}
                  </p>

                  <p>
                    <strong>Semester:</strong>{" "}
                    {paper.semester}
                  </p>

                </div>

                {/* View and Download */}

                {paper.fileUrl ? (

                  <div className="mt-6 flex flex-wrap gap-3">

                    <a
                      href={paper.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
                    >
                      👁 View PDF
                    </a>

                    <a
                      href={getDownloadUrl(
                        paper.fileUrl
                      )}
                      className="rounded-lg border border-gray-300 px-5 py-2 font-semibold hover:bg-gray-50"
                    >
                      ⬇ Download
                    </a>

                  </div>

                ) : (

                  <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    PDF file URL is missing.
                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </div>
    </main>
  );
}
