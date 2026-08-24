import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Scale, ArrowUp } from "lucide-react";
import Link from "next/link";

const MotionLink = motion(Link);

function CookieBanner() {
  const KEY = "cookie_consent_v1";
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 mx-auto max-w-3xl rounded-xl border bg-white/90 dark:bg-slate-900/90 backdrop-blur border-slate-200 dark:border-slate-800 shadow p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between text-sm text-slate-700 dark:text-slate-300">
      <p>
        We use cookies to improve your experience. By using our site, you agree
        to our{" "}
        <Link href="#cookies" className="underline">
          Cookie Policy
        </Link>
        .
      </p>
      <div className="flex gap-2">
        <motion.button
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            localStorage.setItem(KEY, "yes");
            setShow(false);
          }}
          className="rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1"
        >
          Accept
        </motion.button>

        <MotionLink
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="#"
          className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1"
        >
          Manage
        </MotionLink>
      </div>
    </div>
  );
}

// Reusable animated section
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

export default function TermsAndConditions() {
  const lastUpdated = "01 June 2025";

  // Same TOC + scroll spy structure as your Privacy page
  const sections = [
    { id: "overview", label: "Overview" },
    { id: "about", label: "About Us" },
    { id: "eligibility", label: "Eligibility" },
    { id: "use", label: "Use of Services" },
    { id: "accuracy", label: "Accuracy of Information" },
    { id: "thirdparty", label: "Third-Party Services" },
    { id: "consent", label: "Communication Consent" },
    { id: "ip", label: "Intellectual Property" },
    { id: "liability", label: "Limitation of Liability" },
    { id: "indemnity", label: "Indemnity" },
    { id: "modifications", label: "Modifications" },
  ];
  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        }),
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.1 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Background gradient mesh — same vibe */}
      {/* <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-10 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="absolute top-40 -left-16 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-8 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </div> */}

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 pt-30">
        {/* Hero card — identical styling */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/50 backdrop-blur shadow-sm">
          <div className="absolute inset-0 opacity-70 bg-[radial-gradient(60rem_30rem_at_90%_-20%,rgba(99,102,241,.15),transparent),radial-gradient(40rem_24rem_at_10%_-10%,rgba(236,72,153,.12),transparent)]" />
          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Trusted insurance web aggregator
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Terms & Conditions
              </h1>
              <p className="mt-3 max-w-2xl text-slate-700 dark:text-slate-300">
                By accessing or using our website and services, you agree to
                these Terms & Conditions.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-slate-300/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-slate-600 dark:text-slate-300">
                  Last Updated: {lastUpdated}
                </span>
                <Link
                  href="#about"
                  className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1 hover:opacity-90 transition"
                >
                  Start Reading
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="w-full max-w-md grid grid-cols-2 gap-3">
                <MotionLink
                  href="#ip"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4 shadow hover:shadow-md transition"
                >
                  <FileText
                    className="h-5 w-5 text-slate-700 dark:text-slate-200"
                    aria-hidden
                  />
                  <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                    Usage & IP
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rights & restrictions
                  </p>
                </MotionLink>

                <MotionLink
                  href="#liability"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4 shadow hover:shadow-md transition"
                >
                  <Scale
                    className="h-5 w-5 text-slate-700 dark:text-slate-200"
                    aria-hidden
                  />
                  <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                    Liability
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Limits & disclaimers
                  </p>
                </MotionLink>
              </div>
            </div>
          </div>
        </header>

        {/* TOC + Content */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-8">
          {/* TOC (desktop) */}
          <aside className="hidden lg:block sticky top-24 h-max self-start">
            <nav
              aria-label="Table of contents"
              className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4 shadow-sm"
            >
              <div className="mb-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                On this page
              </div>
              <ul className="space-y-1 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <MotionLink
                      href={`#${s.id}`}
                      whileHover={{ x: 2 }}
                      className={`group flex items-center gap-2 rounded-md px-2 py-1 transition ${
                        activeId === s.id
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          activeId === s.id
                            ? "bg-slate-700 dark:bg-slate-200"
                            : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      />
                      {s.label}
                    </MotionLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <article className="relative">
            <div className="[&_:target]:outline [&_:target]:outline-2 [&_:target]:outline-indigo-400 [&_:target]:rounded-xl">
              {/* Overview */}
              <ScrollSection
                id="overview"
                className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <p className="text-slate-700 dark:text-slate-300 text-justify">
                  Welcome to{" "}
                  <strong>Digibima Insurance Web Aggregator Pvt Ltd</strong>{" "}
                  (“Digibima”, “we”, “us”, or “our”). By accessing or using our
                  website (the “Site”) and services (the “Services”), you agree
                  to be bound by the following Terms and Conditions (“Terms”).
                  If you do not agree to these Terms, please do not use our Site
                  or Services.
                </p>
              </ScrollSection>

              {/* 1. About Us */}
              <ScrollSection
                id="about"
                className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  1. About Us
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-justify">
                  Digibima is a licensed Insurance Web Aggregator (IRDAI License
                  No.:{" "}
                  <span className="underline decoration-dotted underline-offset-4">
                    IRDAI/INT/WBA/76/2023
                  </span>
                  ) in India, offering users comparative information and access
                  to insurance products provided by various insurers. We do not
                  underwrite any insurance policy. Our role is limited to
                  displaying product features, premium rates, and facilitating
                  the purchase process through our platform.
                </p>
              </ScrollSection>

              {/* 2. Eligibility */}
              <ScrollSection
                id="eligibility"
                className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  2. Eligibility
                </h2>
                <p className="text-slate-700 dark:text-slate-300">
                  By using our website, you represent that you are:
                </p>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>At least 18 years old;</li>
                  <li>Legally capable of entering into binding contracts;</li>
                  <li>
                    Using the Services for personal or commercial purposes
                    permitted under Indian laws.
                  </li>
                </ul>
              </ScrollSection>

              {/* 3. Use of Services */}
              <ScrollSection
                id="use"
                className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  3. Use of Services
                </h2>
                <ul className="list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>
                    You agree to use our Site only for lawful purposes and in a
                    manner that does not infringe the rights of any third party.
                  </li>
                  <li>
                    You must not misuse our Site or attempt to gain unauthorized
                    access to our systems or data.
                  </li>
                </ul>
              </ScrollSection>

              {/* 4. Accuracy of Information */}
              <ScrollSection
                id="accuracy"
                className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  4. Accuracy of Information
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-justify">
                  While we strive to ensure all information provided on our
                  platform is accurate, we do not guarantee the accuracy or
                  completeness of the data presented. Users are advised to
                  verify policy details directly with the respective insurance
                  providers.
                </p>
              </ScrollSection>

              {/* 5. Third-Party Services */}
              <ScrollSection
                id="thirdparty"
                className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  5. Third-Party Services
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-justify">
                  Our Site contains links to third-party websites, including
                  insurance companies and partners. Digibima is not responsible
                  for the content, privacy practices, or terms of these
                  third-party platforms.
                </p>
              </ScrollSection>

              {/* 6. Communication Consent */}
              <ScrollSection
                id="consent"
                className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  6. Communication Consent
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-justify">
                  By using our services, you consent to receive transactional
                  and promotional communications from Digibima via SMS, voice
                  calls, email, WhatsApp and other electronic or telephonic
                  means. These communications may include reminders, product
                  information, policy updates and promotional offers. You may
                  opt out of promotional communication at any time by following
                  the unsubscribe instructions in the message.
                </p>
              </ScrollSection>

              {/* 7. Intellectual Property */}
              <ScrollSection
                id="ip"
                className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  7. Intellectual Property
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-justify">
                  All content on the Site, including text, graphics, logos, and
                  software, is the property of Digibima or its licensors and is
                  protected by applicable intellectual property laws. You may
                  not reproduce, modify, or distribute any content without our
                  prior written permission.
                </p>
              </ScrollSection>

              {/* 8. Limitation of Liability */}
              <ScrollSection
                id="liability"
                className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  8. Limitation of Liability
                </h2>
                <p className="text-slate-700 dark:text-slate-300">
                  Digibima shall not be liable for any indirect, incidental, or
                  consequential damages resulting from:
                </p>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Use or inability to use the website;</li>
                  <li>Any unauthorized access to or alteration of your data;</li>
                  <li>Actions or omissions of third-party insurers.</li>
                </ul>
              </ScrollSection>

              {/* 9. Indemnity */}
              <ScrollSection
                id="indemnity"
                className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  9. Indemnity
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-justify">
                  You agree to indemnify and hold harmless Digibima, its
                  directors, officers, employees and agents from and against all
                  liabilities, damages and expenses arising out of your use of
                  the Site or violation of these Terms.
                </p>
              </ScrollSection>

              {/* 10. Modifications */}
              <ScrollSection
                id="modifications"
                className="mb-16 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm"
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                  10. Modifications
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-justify">
                  We reserve the right to modify these Terms at any time. Any
                  changes will be posted on this page with an updated effective
                  date. Continued use of our Site after such changes constitutes
                  your acceptance of the revised Terms.
                </p>
              </ScrollSection>
            </div>

            {/* Back to top */}
            <MotionLink
              href="#overview"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 shadow transition"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
              Top
            </MotionLink>
          </article>
        </div>

        {/* Cookie banner (optional) */}
        <CookieBanner />
      </main>
    </>
  );
}
