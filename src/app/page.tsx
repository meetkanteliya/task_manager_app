"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/actions/auth";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  CheckCircle2,
  BarChart3,
  History,
  Layers,
  Check,
  Sparkles
} from "lucide-react";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }

  function switchMode(newMode: AuthMode) {
    resetForm();
    setMode(newMode);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(name, email, password);

      if (!result.success) {
        setError(result.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Auto sign-in after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created! Please sign in.");
        switchMode("signin");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
              <a href="#capabilities" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Capabilities</a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero & Auth Section */}
      <main className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-500/5" />
          <div className="absolute -right-40 top-40 h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-[100px] dark:bg-indigo-500/5" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            
            {/* Left Column: Headline & Capabilities */}
            <div className="flex flex-col space-y-8 lg:col-span-7">
              <div className="inline-flex max-w-fit items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/50 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-800/30 dark:bg-blue-950/30 dark:text-blue-400">
                <Sparkles size={14} className="text-blue-500 animate-pulse" />
                <span>Modern Project Workspace v1.0</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-[1.1]">
                  Supercharge your productivity with{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                    TaskFlow
                  </span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  An elegant, high-performance task manager built for professionals. Break down complex operations, log activity, and analyze your weekly metrics in real-time.
                </p>
              </div>

              {/* Core Capabilities Checklist */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Interactive Boards</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Jira-inspired card layouts</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Deep Checklist System</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Granular subtask tracker</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Workspace Activity Trail</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Secure log histories for audits</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Productivity Statistics</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Weekly & monthly completions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Authentication Card */}
            <div className="lg:col-span-5 w-full max-w-md mx-auto relative">
              {/* Glassmorphic Card Container */}
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-slate-950/80 sm:p-8">
                
                {/* Form Header */}
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mode === "signin" ? "Sign in to continue" : "Create an account"}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    {mode === "signin"
                      ? "Access your dashboard and workspaces."
                      : "Start tracking tasks and accomplishments."}
                  </p>
                </div>

                {/* Tab switcher */}
                <div className="mb-6 flex rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/80">
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                      mode === "signin"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                      mode === "signup"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                  {/* Name (signup only) */}
                  {mode === "signup" && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Meet Kanteliya"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-12 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (signup only) */}
                  {mode === "signup" && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                    {mode === "signin" ? "Sign In" : "Create Account"}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Capabilities Section */}
      <section id="features" className="border-t border-slate-200/60 bg-white/40 py-20 dark:border-slate-800/60 dark:bg-slate-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Engineered for seamless productivity
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              TaskFlow merges the structured power of professional project management systems with a fluid, distraction-free environment.
            </p>
          </div>

          <div id="capabilities" className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Feature 1 */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Structured Kanban</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Sort, assign, and organize task flow cards with priority ratings, target milestones, and responsive completed hooks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Granular Checklist</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Deconstruct major projects into distinct nested items. Track individual status and check progress bars dynamically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                <History size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Activity Trails</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Keep a chronological history log of task states, project creations, and edits to audit your workflows.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Visual Metrics</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Track weekly and monthly completion counts to stay motivated, analyze progress patterns, and optimize output.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-12 dark:border-slate-800/60 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-6 sm:px-6 lg:px-8">
          <Logo size="md" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}