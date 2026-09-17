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
      const q = query(
        collection(db, "questionPapers"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => {
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
      console.error("Error loading question papers:", error);
    } finally {
      setLoading(false);
    }
  }

  const subjects = [
    ...new Set(papers.map((p) => p.subject)),
  ];

  const years = [
    ...new Set(papers.map((p) => p.year)),
  ];

  const semesters = [
    ...new Set(papers.map((p) => p.semester)),
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

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold">
          Question Papers
        </h1>

        <p className="mt-2 text-gray-600">
          Search and access uploaded question papers.
        </p>

        <div className="mt-6 rounded-xl bg-white p-5 shadow">

          <input
            type="text"
            placeholder="Search question papers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-3">

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
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

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
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

            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
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

          <button
            onClick={() => {
              setSearch("");
              setSubject("");
              setYear("");
              setSemester("");
            }}
            className="mt-4 rounded-lg border px-5 py-2"
          >
            Clear Filters
          </button>

        </div>

        {loading ? (
          <div className="mt-6 rounded-xl bg-white p-8 text-center">
            Loading question papers...
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="mt-6 rounded-xl bg-white p-8 text-center">
            No question papers found.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className="rounded-xl bg-white p-6 shadow"
              >

                <h2 className="text-xl font-bold">
                  {paper.title}
                </h2>

                <p className="mt-3">
                  <strong>Subject:</strong>{" "}
                  {paper.subject}
                </p>

                <p className="mt-1">
                  <strong>Year:</strong>{" "}
                  {paper.year}
                </p>

                <p className="mt-1">
                  <strong>Semester:</strong>{" "}
                  {paper.semester}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {paper.fileName}
                </p>

                <div className="mt-5 flex gap-3">

                  <a
                    href={paper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-blue-600 px-5 py-2 text-white"
                  >
                    View
                  </a>
<a
  href={paper.fileUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="rounded-lg border px-5 py-2"
>
  Download
</a>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </main>
  );
}