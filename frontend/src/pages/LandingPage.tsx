import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  Lock,
  Moon,
  Shield,
  Sparkles,
  Sun,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { effectiveTheme, setTheme, theme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              CareerTrack
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              How it Works
            </a>
            <a href="#analytics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Analytics
            </a>
            <a href="#security" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {effectiveTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 hidden sm:block">
                  Sign In
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[800px] bg-gradient-to-tr from-indigo-500/15 to-purple-500/15 blur-3xl rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Modern Job Search Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-white max-w-4xl mx-auto leading-[1.12]">
            Take control of your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
              job search.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Track applications, interviews, offers and every step of your job search in one organized workspace. Built for ambitious professionals.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full justify-center shadow-lg shadow-indigo-500/25" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started Free
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full justify-center">
                Explore Demo Account
              </Button>
            </Link>
          </div>

          {/* Interactive UI Mockup Preview */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-2 sm:p-4 shadow-2xl backdrop-blur-sm">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 text-left shadow-inner">
              {/* Mockup Top Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Good morning, Alex
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Here's an overview of your job search workspace.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    2 Offers Received
                  </span>
                </div>
              </div>

              {/* Mockup KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-5">
                <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">24</p>
                  <span className="text-[10px] text-indigo-600 font-medium">+4 this week</span>
                </div>
                <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Applied</span>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">12</p>
                  <span className="text-[10px] text-slate-500">Awaiting review</span>
                </div>
                <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Interviews</span>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">6</p>
                  <span className="text-[10px] text-purple-600 font-medium">3 this week</span>
                </div>
                <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Offers</span>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">2</p>
                  <span className="text-[10px] text-emerald-600 font-medium">8.3% offer rate</span>
                </div>
              </div>

              {/* Mockup Sample Row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-xs text-indigo-700 dark:text-indigo-300">
                      GO
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Google</span>
                      <span className="text-[11px] text-slate-400">Senior Full-Stack Engineer · Mountain View, CA</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                      Interview
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">$180k – $230k</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-300">
                      ST
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Stripe</span>
                      <span className="text-[11px] text-slate-400">Staff Software Engineer · Remote</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Offer
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">$210k – $270k</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              Powerful Capabilities
            </h2>
            <p className="text-3xl font-extrabold text-slate-950 dark:text-white">
              Everything you need to land your dream job
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Application Tracking
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Log every role with compensation ranges, job URLs, recruiter contacts, and status updates. Never lose context on where you applied.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Interview Timelines
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Schedule and view upcoming technical interviews and recruiter screens with countdowns, meeting links, and prep notes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Actionable Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Visualize application volume, interview progression rates, and offer conversion over time to continuously refine your strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              Workflow
            </h2>
            <p className="text-3xl font-extrabold text-slate-950 dark:text-white">
              How CareerTrack powers your search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-left space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-2xl font-black text-indigo-600">01</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Log Opportunities</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Add positions with company name, position, expected salary, and direct posting links in seconds.
              </p>
            </div>

            <div className="text-left space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-2xl font-black text-indigo-600">02</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Track Progress</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Seamlessly move applications from Applied to Interview and Offer with clear timeline visualizers.
              </p>
            </div>

            <div className="text-left space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-2xl font-black text-indigo-600">03</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Analyze & Optimize</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Review interview conversion percentages, salary benchmarks, and monthly momentum to negotiate best offers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-4 border border-emerald-200 dark:border-emerald-800">
                <Shield className="w-3.5 h-3.5" />
                <span>Enterprise Security Standard</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white mb-4">
                Your data is strictly yours. <br />Private and protected.
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Built from the ground up adhering to OWASP security guidelines. Zero cross-account data leakage (IDOR/BOLA protection), cryptographic password hashing, short-lived tokens, and complete relational isolation.
              </p>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Bcrypt salted password hashing with strict complexity rules
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Stateless JWT access tokens with rotating refresh tokens
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Strict ownership authorization on every API endpoint
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <Lock className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Security Architecture
                </span>
              </div>
              <div className="space-y-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">AUTH:</span> JWT (HS256) · 15m Expiry · Refresh Rotation
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">CRYPTO:</span> Passlib Bcrypt · Automatic Salt Generation
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">DATABASE:</span> PostgreSQL · SQLAlchemy 2.0 · Parameterized Queries
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white">
            Ready to organize your career search?
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Join thousands of candidates tracking applications, practicing interviews, and negotiating higher offers.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              CareerTrack
            </span>
            <span className="text-slate-400">· Organize your job search. Track every opportunity.</span>
          </div>
          <div>
            <p>© {new Date().getFullYear()} CareerTrack. Open-source portfolio project.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
