import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, animate } from "framer-motion";
import {
  ArrowUp,
  Shield,
  Mail,
  Receipt,
  Undo2,
  Timer,
  CircleCheck,
} from "lucide-react";

const MotionLink = motion(Link);

function ScrollSection({ children, ...props }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export default function RefundPolicy() {
  const lastUpdated = "01 June 2025";

  const sections = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "eligibility", label: "Refund Eligibility" },
      { id: "process", label: "Refund Process" },
      { id: "timelines", label: "Timelines" },
      { id: "nonrefundable", label: "Non-Refundable Cases" },
      { id: "contact", label: "Contact Support" },
    ],
    []
  );

  const [activeId, setActiveId] = useState("overview");

  const scrollToId = useCallback((id) => {
    const target = document.getElementById(id);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY - 80;

    const controls = animate(window.scrollY, y, {
      duration: 0.6,
      ease: "easeInOut",
      onUpdate: (latest) => window.scrollTo(0, latest),
    });

    controls.then(() => {
      if (history.replaceState) {
        history.replaceState(null, "", `#${id}`);
      } else {
        window.location.hash = id;
      }
    });
  }, []);

  const onAnchorClick = useCallback(
    (e, id) => {
      e.preventDefault();
      scrollToId(id);
    },
    [scrollToId]
  );

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.1 }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, [sections]);

  return (
    <>
      <Head>
        <title>Refund Policy - Digibima</title>
      </Head>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-8">
        {/* HERO */}
        <header
          className="
          relative overflow-hidden rounded-3xl border bg-white/70 
          dark:bg-slate-900/50 backdrop-blur shadow-sm
          border-slate-200/70 dark:border-slate-800/70
          mt-4 sm:mt-6
        "
        >
          <div
            className="absolute inset-0 opacity-70 
          bg-[radial-gradient(60rem_30rem_at_90%_-20%,rgba(99,102,241,.15),transparent),
          radial-gradient(40rem_24rem_at_10%_-10%,rgba(236,72,153,.12),transparent)]"
          />

          <div
            className="relative grid gap-6 sm:gap-10 p-6 sm:p-10 
          lg:grid-cols-[1.1fr_.9fr]"
          >
            {/* LEFT */}
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full border bg-white/80 
                dark:bg-slate-900/80 px-3 py-1 text-xs 
                border-slate-300/60 dark:border-slate-700/60"
              >
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Refund & Cancellation Policy
              </div>

              <h1
                className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold
                tracking-tight text-slate-900 dark:text-slate-50"
              >
                Refund Policy
              </h1>

              <p className="mt-3 max-w-2xl text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                {`Clear, transparent, and simple—our refund process ensures a smooth experience.`}
              </p>

              <div className="mt-4 text-sm flex flex-wrap items-center gap-3">
                <span
                  className="rounded-full bg-white/70 dark:bg-slate-900/70
                  border border-slate-300/60 dark:border-slate-700/60 px-3 py-1
                  text-slate-600 dark:text-slate-300"
                >
                  Last Updated: {lastUpdated}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs sm:max-w-md">
                <MotionLink
                  href="#eligibility"
                  scroll={false}
                  onClick={(e) => onAnchorClick(e, "eligibility")}
                  whileHover={{ scale: 1.03, y: -2 }}
                  className="group rounded-2xl border bg-white/70
                    dark:bg-slate-900/70 p-3 sm:p-4 shadow text-center"
                >
                  <Receipt className="h-5 w-5 mx-auto" />
                  <div className="mt-1 font-medium text-sm sm:text-base">
                    Eligibility
                  </div>
                  <p className="text-xs text-slate-500">Know your rights</p>
                </MotionLink>

                <MotionLink
                  href="#process"
                  scroll={false}
                  onClick={(e) => onAnchorClick(e, "process")}
                  whileHover={{ scale: 1.03, y: -2 }}
                  className="group rounded-2xl border bg-white/70
                    dark:bg-slate-900/70 p-3 sm:p-4 shadow text-center"
                >
                  <Undo2 className="h-5 w-5 mx-auto" />
                  <div className="mt-1 font-medium text-sm sm:text-base">
                    Refund Process
                  </div>
                  <p className="text-xs text-slate-500">Step-by-step</p>
                </MotionLink>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE GRID */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-8">
          <aside className="hidden lg:block sticky top-24 h-max">
            <nav
              className="rounded-2xl border p-4 shadow-sm 
              bg-white/70 dark:bg-slate-900/70"
            >
              <div className="mb-2 text-xs uppercase text-slate-500">
                On this page
              </div>
              <ul className="space-y-1 text-sm">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <MotionLink
                      href={`#${sec.id}`}
                      scroll={false}
                      onClick={(e) => onAnchorClick(e, sec.id)}
                      whileHover={{ x: 2 }}
                      className={`flex items-center gap-2 rounded-md px-2 py-1 transition ${
                        activeId === sec.id
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          activeId === sec.id
                            ? "bg-slate-700 dark:bg-white"
                            : "bg-slate-400 dark:bg-slate-600"
                        }`}
                      />
                      {sec.label}
                    </MotionLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* CONTENT */}
          <article className="space-y-8">
            <ScrollSection
              id="overview"
              className="rounded-2xl border p-5 sm:p-6 shadow-sm bg-white/75"
            >
              <p className="text-sm sm:text-base text-slate-700">
                At <strong>Digibima Insurance Web Aggregator Pvt Ltd</strong>,
                customer satisfaction is our priority. This Refund Policy
                outlines when refunds are applicable and how they are processed.
              </p>
            </ScrollSection>

            <ScrollSection
              id="eligibility"
              className="rounded-2xl border p-5 sm:p-6 shadow-sm bg-white/75"
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-3">
                1. Refund Eligibility
              </h2>
              <ul className="space-y-2 text-sm sm:text-base text-slate-700 list-disc pl-5">
                <li>Duplicate payment due to technical error</li>
                <li>Payment charged but proposal not submitted</li>
                <li>Failed or rejected policy issuance from insurer</li>
                <li>Accidental multiple transactions</li>
              </ul>
            </ScrollSection>

            <ScrollSection
              id="process"
              className="rounded-2xl border p-5 sm:p-6 shadow-sm bg-white/75"
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-3">
                2. Refund Process
              </h2>
              <ol className="space-y-3 list-decimal pl-5 text-sm sm:text-base text-slate-700">
                <li>
                  Send refund request to <strong>info@digibima.com</strong>
                </li>
                <li>Attach proof of payment / transaction ID</li>
                <li>Our team verifies the request</li>
                <li>
                  Eligible refunds are processed back to original payment mode
                </li>
              </ol>
            </ScrollSection>

            <ScrollSection
              id="timelines"
              className="rounded-2xl border p-5 sm:p-6 shadow-sm bg-white/75"
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-3">
                3. Refund Timelines
              </h2>
              <p className="text-sm sm:text-base text-slate-700">
                Refunds are processed within <strong>7–10 business days</strong>{" "}
                after verification.
              </p>
            </ScrollSection>

            <ScrollSection
              id="nonrefundable"
              className="rounded-2xl border p-5 sm:p-6 shadow-sm bg-white/75"
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-3">
                4. Non-Refundable Cases
              </h2>
              <ul className="list-disc pl-5 text-sm sm:text-base text-slate-700 space-y-2">
                <li>Policy successfully issued by insurer</li>
                <li>User provided incorrect details</li>
                <li>User wants cancellation without insurer approval</li>
              </ul>
            </ScrollSection>

            <ScrollSection
              id="contact"
              className="rounded-2xl border mb-20 p-5 sm:p-6 shadow-sm bg-white/75"
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-3">
                Contact Support
              </h2>
              <p className="text-sm sm:text-base text-slate-700">
                <Mail className="inline h-4 w-4 mr-1 text-slate-500" />
                For refund help, email:{" "}
                <a
                  href="mailto:info@digibima.com"
                  className="underline decoration-dotted underline-offset-4"
                >
                  info@digibima.com
                </a>
              </p>
            </ScrollSection>

            <MotionLink
              href="#overview"
              scroll={false}
              onClick={(e) => onAnchorClick(e, "overview")}
              whileHover={{ scale: 1.05, y: -2 }}
              className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full 
              bg-slate-900 text-white px-4 py-2 shadow-lg"
            >
              <ArrowUp className="h-4 w-4" />
              Top
            </MotionLink>
          </article>
        </div>
      </main>
    </>
  );
}
