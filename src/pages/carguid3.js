import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, animate } from 'framer-motion'
import {
  Search,
  Car,
  ClipboardList,
  Sliders,
  FileText,
  CreditCard,
  ArrowUp,
} from 'lucide-react'

const MotionLink = motion(Link)

function ScrollSection({ children, ...props }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.section>
  )
}

export default function CarInsuranceGuide() {
  const lastUpdated = '01 June 2025'

const sections = useMemo(() => [
  { id: 'overview', label: 'Overview' },
  { id: 'step1', label: 'Enter Car Number' },
  { id: 'step2', label: 'Confirm Car Details' },
  { id: 'step3', label: 'Previous Policy Info' },
  { id: 'step4', label: 'Compare Plans' },
  { id: 'step5', label: 'Proposal & KYC' },
  { id: 'step6', label: 'Review & Nominee' },
  { id: 'step7', label: 'Payment & Policy' },
], []);


  const [activeId, setActiveId] = useState('overview')

  const scrollToId = useCallback((id) => {
    const el = document.getElementById(id)
    if (!el) return
    const y =
      el.getBoundingClientRect().top + window.scrollY - 80

    animate(window.scrollY, y, {
      duration: 0.6,
      ease: 'easeInOut',
      onUpdate: (v) => window.scrollTo(0, v),
    })
  }, [])

  const onAnchorClick = (e, id) => {
    e.preventDefault()
    scrollToId(id)
  }

useEffect(() => {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActiveId(e.target.id);
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) obs.observe(el);
  });

  return () => obs.disconnect();
}, [sections]);


  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 bg-linear-gradient(to bottom, #C2EBFF, #D3FFF8)">

      <header className="rounded-3xl bg-white/70 backdrop-blur border p-8 shadow-sm">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Steps to Buy Your Car Insurance Plan from DigiBima
        </h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          DigiBima provides a simple, guided and transparent process to help you
          buy the right car insurance in minutes.
        </p>
        <span className="inline-block mt-4 text-sm text-slate-600">
          Last Updated: {lastUpdated}
        </span>
      </header>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-8">

        <aside className="hidden lg:block sticky top-24">
          <nav className="rounded-2xl bg-white/70 border p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500 mb-2">
              On this page
            </p>
            <ul className="space-y-1 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <MotionLink
                    href={`#${s.id}`}
                    scroll={false}
                    onClick={(e) => onAnchorClick(e, s.id)}
                    className={`block px-2 py-1 rounded ${
                      activeId === s.id
                        ? 'bg-slate-100 font-medium'
                        : 'text-slate-600'
                    }`}
                  >
                    {s.label}
                  </MotionLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article>

          <ScrollSection id="overview" className="mb-8 rounded-2xl bg-white/75 p-6 border shadow-sm">
            Buying car insurance on DigiBima is fully guided. Each step ensures
            accurate details, correct pricing, and instant policy issuance.
          </ScrollSection>

          <ScrollSection id="step1" className="mb-8 rounded-2xl bg-white/75 p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              1. Enter Car Number
            </h2>
            <p>
              Enter your vehicle registration number to automatically fetch
              car details and reduce manual errors.
            </p>
          </ScrollSection>

          <ScrollSection id="step2" className="mb-8 rounded-2xl bg-white/75 p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              2. Confirm Car Details
            </h2>
            <p>
              Verify your car’s make, model, fuel type and registration year
              to receive accurate insurance quotes.
            </p>
          </ScrollSection>

          <ScrollSection id="step3" className="mb-8 rounded-2xl bg-white/75 p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              3. Previous Policy Info
            </h2>
            <p>
              Share previous policy details such as expiry date and claim
              history to apply correct NCB benefits.
            </p>
          </ScrollSection>

          <ScrollSection id="step4" className="mb-8 rounded-2xl bg-white/75 p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              4. Compare Plans
            </h2>
            <p>
              Compare plans from top insurers based on premium, coverage,
              add-ons and claim settlement ratios.
            </p>
          </ScrollSection>

          <ScrollSection id="step5" className="mb-8 rounded-2xl bg-white/75 p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              5. Proposal & KYC
            </h2>
            <p>
              Fill in basic personal details and complete KYC as per IRDAI
              guidelines to proceed.
            </p>
          </ScrollSection>

          <ScrollSection id="step6" className="mb-8 rounded-2xl bg-white/75 p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              6. Review & Nominee
            </h2>
            <p>
              Review all information carefully and add a nominee for smooth
              claim settlement in future.
            </p>
          </ScrollSection>

          <ScrollSection id="step7" className="mb-16 rounded-2xl bg-white/75 p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              7. Payment & Policy Issuance
            </h2>
            <p>
              Complete secure payment online. Your policy is issued instantly
              and delivered via email and WhatsApp.
            </p>
          </ScrollSection>
        </article>
      </div>

      <MotionLink
        href="#overview"
        scroll={false}
        onClick={(e) => onAnchorClick(e, 'overview')}
        className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2 rounded-full shadow"
      >
        <ArrowUp className="h-4 w-4" />
      </MotionLink>
    </main>
  )
}
