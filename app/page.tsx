
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-slate-950/95">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Secure Examination System
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Digital Examination Management Platform
            </p>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl font-semibold transition"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm font-medium mb-7">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Secure Digital Examination Platform
          </div>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Conduct examinations with
            <span className="text-blue-400"> security, control and confidence.</span>
          </h2>

          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-3xl leading-8">
            A role-based examination management system that connects
            question setters, reviewers, administrators, examination centres
            and students through a secure digital workflow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-9">
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700 px-7 py-3.5 rounded-xl font-semibold transition shadow-lg shadow-blue-900/20"
            >
              Access Examination Portal →
            </button>

            <button
              onClick={() => router.push("/login")}
              className="border border-white/15 hover:bg-white/5 px-7 py-3.5 rounded-xl font-semibold transition"
            >
              Login to System
            </button>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-white text-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-blue-600 font-semibold uppercase tracking-wider text-sm">
              Examination Workflow
            </p>

            <h3 className="text-3xl md:text-4xl font-bold mt-3">
              From question creation to secure examination
            </h3>

            <p className="text-slate-500 mt-4 text-lg">
              Every stage is organized through role-based access and a
              controlled examination workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-5 mt-14">
            {[
              {
                number: "01",
                title: "Question Setter",
                text: "Creates and uploads examination question papers.",
              },
              {
                number: "02",
                title: "Reviewer",
                text: "Reviews submitted papers before approval.",
              },
              {
                number: "03",
                title: "Administrator",
                text: "Finalizes and releases approved papers.",
              },
              {
                number: "04",
                title: "Exam Centre",
                text: "Creates examinations and manages questions.",
              },
              {
                number: "05",
                title: "Student",
                text: "Attempts the examination through a secure interface.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="border border-slate-200 rounded-2xl p-6 bg-slate-50 hover:shadow-md transition"
              >
                <div className="text-blue-600 font-bold text-sm">
                  {item.number}
                </div>

                <h4 className="text-lg font-bold mt-4">
                  {item.title}
                </h4>

                <p className="text-slate-500 text-sm leading-6 mt-3">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-100 py-20 text-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-blue-600 font-semibold uppercase tracking-wider text-sm">
              Key Features
            </p>

            <h3 className="text-3xl md:text-4xl font-bold mt-3">
              Everything needed for digital examinations
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: "🔐",
                title: "Role-Based Security",
                text: "Different users receive access according to their examination responsibilities.",
              },
              {
                icon: "📄",
                title: "Question Paper Management",
                text: "Create, review, finalize and release examination papers through a structured workflow.",
              },
              {
                icon: "⏱️",
                title: "Timed Examinations",
                text: "Students can attempt published examinations with a controlled countdown timer.",
              },
              {
                icon: "☁️",
                title: "Cloud-Based Platform",
                text: "Examination data is managed using Firebase cloud services.",
              },
              {
                icon: "📝",
                title: "MCQ Examination",
                text: "Students can answer multiple-choice questions through a clean examination interface.",
              },
              {
                icon: "⚡",
                title: "Automatic Submission",
                text: "The examination can automatically submit when the allotted time expires.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-lg transition"
              >
                <div className="text-3xl">{feature.icon}</div>

                <h4 className="text-xl font-bold mt-5">
                  {feature.title}
                </h4>

                <p className="text-slate-500 leading-7 mt-3">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold">
            Ready to access the examination portal?
          </h3>

          <p className="text-blue-100 mt-4 text-lg">
            Login to continue to your role-specific dashboard.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-8 bg-white text-blue-700 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-bold transition"
          >
            Login to Examination System →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-7 flex flex-col md:flex-row justify-between gap-3 text-sm text-slate-400">
          <p>
            © 2026 Secure Examination System
          </p>

          <p>
            Secure • Role-Based • Digital Examination Platform
          </p>
        </div>
      </footer>
    </main>
  );
}
