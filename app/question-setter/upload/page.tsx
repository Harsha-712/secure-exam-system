"use client";

export default function UploadQuestionPaper() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "white",
        color: "black",
      }}
    >
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
        UPLOAD TEST PAGE
      </h1>

      <button
        onClick={() => alert("BUTTON IS WORKING")}
        style={{
          marginTop: "30px",
          padding: "15px 30px",
          background: "blue",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        TEST BUTTON
      </button>
    </div>
  );
}