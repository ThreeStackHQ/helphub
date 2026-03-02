import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, FileText, Search, Globe, BarChart2, Code2, Zap, Check, ChevronDown } from 'lucide-react';
import LandingFAQ from './LandingFAQ';

export const metadata: Metadata = {
  title: 'HelpHub — Self-serve knowledge base for indie SaaS',
  description:
    'Stop answering the same questions twice. Build a beautiful help center with real-time search, embed it in 5 lines of code.',
  keywords: ['help center', 'knowledge base', 'FAQ', 'SaaS', 'documentation', 'widget'],
  openGraph: {
    title: 'HelpHub — Self-serve knowledge base for indie SaaS',
    description: 'Stop answering the same questions twice. Build a beautiful help center in minutes.',
    type: 'website',
    url: 'https://helphub.threestack.io',
    siteName: 'HelpHub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HelpHub — Self-serve knowledge base for indie SaaS',
    description: 'Stop answering the same questions twice.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'HelpHub',
      applicationCategory: 'BusinessApplication',
      description: 'Self-serve knowledge base & FAQ widget for indie SaaS',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '19',
        priceCurrency: 'USD',
        offerCount: '3',
      },
      url: 'https://helphub.threestack.io',
    }),
  },
};

const features = [
  {
    icon: FileText,
    title: 'Markdown Editor',
    desc: 'Write articles in Markdown with a live preview. Full formatting support, code blocks, images.',
  },
  {
    icon: Search,
    title: 'Real-Time Search',
    desc: 'Postgres full-text search with < 200ms response. Customers find answers before finishing typing.',
  },
  {
    icon: Globe,
    title: 'SEO Optimized',
    desc: 'Every article gets its own URL with metadata. Rank on Google for your support queries.',
  },
  {
    icon: HelpCircle,
    title: 'Custom Domain',
    desc: 'Point docs.yourapp.com to HelpHub. Looks native to your product.',
  },
  {
    icon: BarChart2,
    title: 'Analytics',
    desc: 'See which articles get the most views, top search queries, and content gaps.',
  },
  {
    icon: Code2,
    title: 'Widget Embed',
    desc: 'Drop 5 lines of JS into your app. Instant in-app help without leaving your product.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Write Articles',
    desc: 'Use the Markdown editor to create helpful docs. Organize into collections.',
  },
  {
    number: '02',
    title: 'Embed 5 Lines',
    desc: 'Copy your embed snippet. Paste into your app. Your help widget is live.',
    code: `<script>
  window.HelpHub = { workspaceId: 'wks_abc123' };
</script>
<script src="https://cdn.helphub.io/widget.js"></script>`,
  },
  {
    number: '03',
    title: 'Watch Searches',
    desc: 'See what customers search for. Spot gaps. Write more targeted content.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    desc: 'Perfect for getting started',
    features: ['10 articles', '1 collection', 'Public help center', 'Widget embed', 'Community support'],
    cta: 'Start for free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Indie',
    price: '$9',
    period: '/mo',
    desc: 'For growing indie makers',
    features: ['Unlimited articles', 'Unlimited collections', 'Custom domain', 'Analytics', 'Search insights', 'Email support'],
    cta: 'Start Indie',
    href: '/signup?plan=indie',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    desc: 'For scaling SaaS products',
    features: ['Everything in Indie', 'Priority support', 'Advanced analytics', 'Webhook events', 'Remove HelpHub branding', 'API access'],
    cta: 'Start Pro',
    href: '/signup?plan=pro',
    popular: false,
  },
];

const competitors = [
  { feature: 'Starting price', helphub: '$0 free / $9/mo', helpkit: '$29/mo', intercom: '$100+/mo', zendesk: '$55+/mo' },
  { feature: 'Markdown editor', helphub: true, helpkit: true, intercom: false, zendesk: false },
  { feature: 'Real-time search', helphub: true, helpkit: true, intercom: true, zendesk: true },
  { feature: 'Widget embed', helphub: true, helpkit: false, intercom: true, zendesk: true },
  { feature: 'Custom domain', helphub: true, helpkit: true, intercom: false, zendesk: true },
  { feature: 'Search analytics', helphub: true, helpkit: true, intercom: true, zendesk: true },
  { feature: 'SEO optimized', helphub: true, helpkit: true, intercom: false, zendesk: false },
  { feature: 'Free tier', helphub: true, helpkit: false, intercom: false, zendesk: false },
];

const testimonials = [
  {
    quote: "Saved me hours every week. My users find answers themselves now — support tickets dropped 60% in the first month.",
    name: 'Alex R.',
    title: 'Founder, DataSync',
    avatar: 'AR',
  },
  {
    quote: "Setup took 20 minutes. The search widget just works. Best $9 I spend each month.",
    name: 'Maya T.',
    title: 'Solo founder, FormCraft',
    avatar: 'MT',
  },
  {
    quote: "Finally a help center that looks good and doesn't cost a fortune. HelpHub is exactly what indie makers need.",
    name: 'James W.',
    title: 'Maker, ShipFast',
    avatar: 'JW',
  },
];

const faqs = [
  {
    q: 'Can I use my own domain?',
    a: "Yes! On the Indie and Pro plans you can point any domain (e.g. docs.yourapp.com) to HelpHub. Just add a CNAME record and verify it in your settings.",
  },
  {
    q: 'How does the widget embed work?',
    a: "Copy your 5-line script snippet from the dashboard and paste it into your app's HTML. The widget auto-detects data attributes and renders an in-app help search panel — no React or framework required.",
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: "You can start with the Free plan indefinitely. When you're ready to upgrade, paid plans come with a 14-day money-back guarantee if you're not satisfied.",
  },
  {
    q: 'What happens to my help center if I cancel?',
    a: "Your public help center stays live for 30 days after cancellation. You can export all your articles as Markdown at any time — your content is always yours.",
  },
];

function CheckIcon() {
  return <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />;
}

function TickOrCross({ val }: { val: boolean | string }) {
  if (typeof val === 'string') return <span className="text-white text-sm font-medium">{val}</span>;
  return val ? (
    <Check className="w-4 h-4 text-teal-400 mx-auto" />
  ) : (
    <span className="text-slate-600 text-lg leading-none">—</span>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Sticky nav */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-teal-500" />
            <span className="text-xl font-bold">HelpHub</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-900/30 border border-teal-800 rounded-full text-teal-400 text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            Live in under 20 minutes
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Stop answering the
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
              same questions twice
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Build a beautiful help center with real-time search. Embed it in your app with 5 lines of code.
            Your customers get answers; you get your evenings back.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg shadow-teal-900/30"
            >
              Start for free
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-semibold rounded-xl text-lg transition-colors"
            >
              See demo
            </a>
          </div>
          <p className="text-slate-500 text-sm mt-4">No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-800 bg-slate-900/50 py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '500+', label: 'indie makers' },
            { value: '<200ms', label: 'search speed' },
            { value: '99.9%', label: 'uptime SLA' },
            { value: '$9', label: 'vs $29+ elsewhere' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-teal-400 mb-1">{s.value}</div>
              <div className="text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Up and running in minutes</h2>
            <p className="text-slate-400 text-lg">Three steps from signup to live help center.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-700 to-transparent -translate-x-8 z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-4xl font-black text-teal-900/80 mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  {step.code && (
                    <pre className="mt-4 bg-slate-900 border border-slate-700 rounded-lg p-4 text-xs text-teal-300 overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Everything you need</h2>
            <p className="text-slate-400 text-lg">Built for indie makers who want results, not complexity.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-teal-800 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-teal-900/40 border border-teal-900 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Simple, honest pricing</h2>
            <p className="text-slate-400 text-lg">No per-seat pricing. No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-7 flex flex-col ${
                  plan.popular
                    ? 'border-teal-600 bg-teal-950/30 shadow-xl shadow-teal-900/20'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-teal-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.popular
                      ? 'bg-teal-600 hover:bg-teal-500 text-white'
                      : 'border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor table */}
      <section className="py-24 px-4 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">HelpHub vs the alternatives</h2>
            <p className="text-slate-400 text-lg">More features. A fraction of the price.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800">
                  <th className="text-left px-5 py-3.5 text-slate-400 font-medium">Feature</th>
                  <th className="px-5 py-3.5 text-teal-400 font-bold text-center">HelpHub</th>
                  <th className="px-5 py-3.5 text-slate-400 font-medium text-center">HelpKit</th>
                  <th className="px-5 py-3.5 text-slate-400 font-medium text-center">Intercom</th>
                  <th className="px-5 py-3.5 text-slate-400 font-medium text-center">Zendesk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {competitors.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-slate-900/30' : ''}>
                    <td className="px-5 py-3.5 text-slate-300">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center"><TickOrCross val={row.helphub} /></td>
                    <td className="px-5 py-3.5 text-center"><TickOrCross val={row.helpkit} /></td>
                    <td className="px-5 py-3.5 text-center"><TickOrCross val={row.intercom} /></td>
                    <td className="px-5 py-3.5 text-center"><TickOrCross val={row.zendesk} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Loved by indie makers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <p className="text-slate-300 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-slate-900/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Frequently asked questions</h2>
          </div>
          <LandingFAQ faqs={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-teal-900/40 to-slate-800 rounded-2xl border border-teal-800/50 p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to stop answering repeat questions?</h2>
            <p className="text-slate-400 text-lg mb-8">
              Join 500+ indie makers saving hours every week with HelpHub.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-lg transition-colors"
            >
              Start for free →
            </Link>
            <p className="text-slate-500 text-sm mt-4">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-500" />
            <span className="font-bold text-white">HelpHub</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign up</Link>
          </nav>
          <p className="text-slate-500 text-sm">© 2026 HelpHub · ThreeStack</p>
        </div>
      </footer>
    </div>
  );
}
