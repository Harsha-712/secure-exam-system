"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function QuestionSetterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a question paper.");
      return;
    }

    if (!title.trim()) {
      setMessage("Please enter the question paper title.");
      return;
    }

    if (!subject.trim()) {
      setMessage("Please enter the subject.");
      return;
    }

    if (!auth.currentUser) {
      setMessage("Please login first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Uploading question paper...");

      // CLOUDINARY UPLOAD
      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", "exam_papers");

      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/xdnwszco/raw/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        console.error(
          "Cloudinary Error:",
          cloudinaryData
        );

        throw new Error(
          cloudinaryData?.error?.message ||
            "Cloudinary upload failed."
        );
      }

      const fileUrl = cloudinaryData.secure_url;

      // FIRESTORE SAVE
      await addDoc(
        collection(db, "questionPapers"),
        {
          title: title.trim(),
          subject: subject.trim(),
          year: year.trim(),
          semester: semester.trim(),

          fileName: file.name,
          fileUrl: fileUrl,

          cloudinaryPublicId:
            cloudinaryData.public_id || "",

          uploadedBy: auth.currentUser.uid,

          uploadedByEmail:
            auth.currentUser.email || "",

          createdAt: serverTimestamp(),
        }
      );

      setMessage(
        "Question paper uploaded successfully!"
      );

      setFile(null);
      setTitle("");
      setSubject("");
      setYear("");
      setSemester("");

    } catch (error: any) {
      console.error("Upload Error:", error);

      setMessage(
        error?.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">

        <h1 className="mb-2 text-3xl font-bold">
          Upload Question Paper
        </h1>

        <p className="mb-6 text-gray-600">
          Upload a question paper to the cloud.
        </p>

        {/* TITLE */}
        <div className="mb-5">
          <label className="mb-2 block font-medium">
            Question Paper Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Example: Data Structures April 2026"
            className="w-full rounded-lg border p-3"
          />
        </div>

        {/* SUBJECT */}
        <div className="mb-5">
          <label className="mb-2 block font-medium">
            Subject
          </label>

          <input
            type="text"
            value={subject}
            onChange={(e) =>
              setSubject(e.target.value)
            }
            placeholder="Example: Data Structures"
            className="w-full rounded-lg border p-3"
          />
        </div>

        {/* YEAR */}
        <div className="mb-5">
          <label className="mb-2 block font-medium">
            Year
          </label>

          <input
            type="text"
            value={year}
            onChange={(e) =>
              setYear(e.target.value)
            }
            placeholder="Example: 2026"
            className="w-full rounded-lg border p-3"
          />
        </div>

        {/* SEMESTER */}
        <div className="mb-5">
          <label className="mb-2 block font-medium">
            Semester
          </label>

          <input
            type="text"
            value={semester}
            onChange={(e) =>
              setSemester(e.target.value)
            }
            placeholder="Example: 4"
            className="w-full rounded-lg border p-3"
          />
        </div>

        {/* FILE */}
        <div className="mb-6">
          <label className="mb-2 block font-medium">
            Question Paper File
          </label>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full rounded-lg border p-3"
          />

          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* UPLOAD BUTTON */}
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Uploading..."
            : "Upload Question Paper"}
        </button>

        {/* MESSAGE */}
        {message && (
          <div className="mt-5 rounded-lg bg-gray-100 p-4 text-center">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}