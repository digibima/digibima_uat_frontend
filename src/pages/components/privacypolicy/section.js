import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { motion, animate } from 'framer-motion'
import {
  Cookie as CookieIcon,
  Shield,
  Lock,
  Users,
  Mail,
  ArrowUp,
} from 'lucide-react'

const MotionLink = motion(Link)

// Scroll-reveal wrapper for sections
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

export default function PrivacyPolicy() {
  const lastUpdated = '01 June 2025'
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'collect', label: 'Information We Collect' },
    { id: 'use', label: 'How We Use Data' },
    { id: 'share', label: 'Sharing & Disclosure' },
    { id: 'cookies', label: 'Cookies' },
    { id: 'security', label: 'Security' },
    { id: 'links', label: 'Third-Party Links' },
    { id: 'rights', label: 'Your Rights' },
    { id: 'changes', label: 'Changes' },
    { id: 'contact', label: 'Contact' }
  ]

  const [activeId, setActiveId] = useState('overview')

  // ------- Framer-motion smooth scroll helper -------
  const scrollToId = useCallback((id) => {
    if (typeof window === 'undefined') return
    const target = document.getElementById(id)
    if (!target) return
    const headerOffset = 80 // adjust if your header height differs
    const y = target.getBoundingClientRect().top + window.scrollY - headerOffset

    // animate scroll position
    const controls = animate(window.scrollY, y, {
      duration: 0.6,
      ease: 'easeInOut',
      onUpdate: latest => window.scrollTo(0, latest),
    })

    // update URL hash without jumping
    controls.then(() => {
      if (history.replaceState) {
        history.replaceState(null, '', `#${id}`)
      } else {
        window.location.hash = id
      }
    })
  }, [])

  // Click handler for MotionLink/Link to prevent default jump
  const onAnchorClick = useCallback((e, id) => {
    e.preventDefault()
    scrollToId(id)
  }, [scrollToId])

  // Scroll spy (no extra lib)
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0.1 }
    )
    sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
   

      {/* Background gradient mesh */}
      {/* <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-10 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="absolute top-40 -left-16 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-8 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </div> */}

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8  bg-linear-gradient(to bottom, #C2EBFF, #D3FFF8)">
        {/* Hero card */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/50 backdrop-blur shadow-sm">
          <div className="absolute inset-0 opacity-70 bg-[radial-gradient(60rem_30rem_at_90%_-20%,rgba(99,102,241,.15),transparent),radial-gradient(40rem_24rem_at_10%_-10%,rgba(236,72,153,.12),transparent)]" />
          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Trusted insurance web aggregator
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Privacy Policy
              </h1>
              <p className="mt-3 max-w-2xl text-slate-700 dark:text-slate-300">
                We respect your privacy. This page explains what we collect, why we collect it, and how you can control it.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-slate-300/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-slate-600 dark:text-slate-300">Last Updated: {lastUpdated}</span>

                <MotionLink
                  href="#rights"
                  scroll={false}
                  onClick={(e) => onAnchorClick(e, 'rights')}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1 hover:opacity-90 transition"
                >
                  View Your Rights
                </MotionLink>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="w-full max-w-md grid grid-cols-2 gap-3">
                <MotionLink
                  href="#cookies"
                  scroll={false}
                  onClick={(e) => onAnchorClick(e, 'cookies')}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4 shadow hover:shadow-md transition"
                >
                  <CookieIcon className="h-5 w-5 text-slate-700 dark:text-slate-200" aria-hidden />
                  <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">Cookies</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage preferences</p>
                </MotionLink>

                <MotionLink
                  href="#contact"
                  scroll={false}
                  onClick={(e) => onAnchorClick(e, 'contact')}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4 shadow hover:shadow-md transition"
                >
                  <Shield className="h-5 w-5 text-slate-700 dark:text-slate-200" aria-hidden />
                  <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">Need help?</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Contact privacy team</p>
                </MotionLink>
              </div>
            </div>
          </div>
        </header>

        {/* TOC + Content */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-8">
          {/* TOC (desktop) */}
          <aside className="hidden lg:block sticky top-24 h-max self-start">
            <nav aria-label="Table of contents" className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-4 shadow-sm">
              <div className="mb-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">On this page</div>
              <ul className="space-y-1 text-sm">
                {sections.map(s => (
                  <li key={s.id}>
                    <MotionLink
                      href={`#${s.id}`}
                      scroll={false}
                      onClick={(e) => onAnchorClick(e, s.id)}
                      whileHover={{ x: 2 }}
                      className={`group flex items-center gap-2 rounded-md px-2 py-1 transition ${activeId===s.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${activeId===s.id ? 'bg-slate-700 dark:bg-slate-200' : 'bg-slate-300 dark:bg-slate-700'}`}/>
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
              <ScrollSection id="overview" className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm">
                <p className="text-slate-700 dark:text-slate-300">
  Welcome to <strong>Digibima Insurance Web Aggregator Pvt Ltd</strong> (&quot;Digibima&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). 
  We are committed to protecting your personal information and your right to privacy. 
  By using our website (the &ldquo;Site&rdquo;) or any services provided by us, you agree to this Privacy Policy.
</p>

              </ScrollSection>

              {/* Collect */}
              <ScrollSection id="collect" className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">1. Information We Collect</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-4">
                    <h3 className="font-medium mb-2">a) Personal Information</h3>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                      <li>Full name; contact details (email, phone); date of birth; gender; address</li>
                      <li>Vehicle or health information (for relevant quotes)</li>
                      <li>Identity documents (PAN, masked Aadhaar, Driving License, etc.)</li>
                      <li>Payment information (where applicable)</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-4">
                    <h3 className="font-medium mb-2">b) Non-Personal Information</h3>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                      <li>IP address; browser type & version; device info</li>
                      <li>Website usage (pages visited, time spent, clicks, etc.)</li>
                    </ul>
                  </div>
                </div>
              </ScrollSection>

              {/* Use */}
              <ScrollSection id="use" className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">2. How We Use Your Information</h2>
                <ul className="grid sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                  {[
                    'Provide personalized insurance quotes and policy comparisons',
                    'Assist in policy purchase and renewal',
                    'Communicate via email, SMS, or phone',
                    'Send updates, offers, or service-related messages',
                    'Improve our website, services, and user experience',
                    'Comply with legal and regulatory requirements'
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-3">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-slate-500"/>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </ScrollSection>

              {/* Share */}
              <ScrollSection id="share" className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden />
                  3. Sharing Your Information
                </h2>
                <p className="text-slate-700 dark:text-slate-300 mb-3">We <strong>do not sell</strong> your personal data. We may share information with:</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    ['Insurance partners', 'To process your requests or applications'],
                    ['Regulatory bodies', 'As per IRDAI guidelines or applicable laws'],
                    ['Tech & service partners', 'Payments, analytics under confidentiality']
                  ].map(([title, desc], i) => (
                    <div key={i} className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-4">
                      <div className="text-sm font-medium">{title}</div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollSection>

              {/* Cookies */}
              <ScrollSection id="cookies" className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <CookieIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden />
                  4. Cookies & Tracking
                </h2>
                <details className="group rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-4">
                  <summary className="cursor-pointer select-none font-medium">Cookie categories</summary>
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                    <li>Essential (security, core features)</li>
                    <li>Analytics (usage insights)</li>
                    <li>Preference (remember choices)</li>
                    <li>Marketing (where applicable)</li>
                  </ul>
                </details>
                <p className="mt-3 text-slate-700 dark:text-slate-300">You can control cookies via your browser settings.</p>
              </ScrollSection>

              {/* Security */}
              <ScrollSection id="security" className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden />
                  5. Data Security
                </h2>
                <p className="text-slate-700 dark:text-slate-300">We apply industry-standard safeguards to protect your information. No method is 100% secure; we continually improve our protections.</p>
              </ScrollSection>

              {/* Links */}
              <ScrollSection id="links" className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">6. Third-Party Links</h2>
                <p className="text-slate-700 dark:text-slate-300">Our site may link to external websites. Their privacy practices are their own; please review their policies.</p>
              </ScrollSection>

              {/* Rights */}
              <ScrollSection id="rights" className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">7. Your Rights</h2>
                <ul className="grid sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                  {[
                    'Access or correct your personal data',
                    'Withdraw consent (where applicable)',
                    'Request deletion subject to legal limits',
                    'Opt-out of marketing messages'
                  ].map((t,i)=> (
                    <li key={i} className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 p-3">{t}</li>
                  ))}
                </ul>
                <p className="mt-3 text-slate-700 dark:text-slate-300">To exercise rights, use the contact below. We may need to verify your identity.</p>
              </ScrollSection>

              {/* Changes */}
              <ScrollSection id="changes" className="mb-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">8. Changes to This Policy</h2>
                <p className="text-slate-700 dark:text-slate-300">We may update this policy periodically. The new date will be posted here; significant changes may be notified.</p>
              </ScrollSection>

              {/* Contact */}
              <ScrollSection id="contact" className="mb-16 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-900/60 p-6 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3">Contact</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  <Mail className="inline h-4 w-4 mr-1 -mt-0.5 text-slate-500 dark:text-slate-400" aria-hidden />
                  Questions or requests? Email us at{' '}
                  <a href="mailto:privacy@digibima.com" className="underline decoration-dotted underline-offset-4">privacy@digibima.com</a>.
                </p>
              </ScrollSection>
            </div>

            {/* Back to top */}
            <MotionLink
              href="#overview"
              scroll={false}
              onClick={(e) => onAnchorClick(e, 'overview')}
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

        {/* Cookie banner (inline, optional) */}
        <CookieBanner onAnchorClick={onAnchorClick} />
      </main>
    </>
  )
}

function CookieBanner({ onAnchorClick }){
  const KEY='cookie_consent_v1'
  const [show,setShow]=useState(false)
  useEffect(()=>{ if(!localStorage.getItem(KEY)) setShow(true) },[])
  if(!show) return null
  return (
    <div className="fixed inset-x-0 bottom-5 z-40 mx-auto max-w-3xl rounded-xl border bg-white/90 dark:bg-slate-900/90 backdrop-blur border-slate-200 dark:border-slate-800 shadow p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between text-sm text-slate-700 dark:text-slate-300">
      <p>
        We use cookies to improve your experience. By using our site, you agree to our{' '}
        <Link
          href="#cookies"
          scroll={false}
          onClick={(e) => onAnchorClick?.(e, 'cookies')}
          className="underline"
        >
          Cookie Policy
        </Link>.
      </p>
      <div className="flex gap-2">
        <motion.button
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={()=>{localStorage.setItem(KEY,'yes');setShow(false)}}
          className="rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1"
        >
          Accept
        </motion.button>

        <MotionLink
          href="#cookies"
          scroll={false}
          onClick={(e) => onAnchorClick?.(e, 'cookies')}
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1"
        >
          Manage
        </MotionLink>
      </div>
    </div>
  )
}
