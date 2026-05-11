"use client";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

import {
  Shield,
  Zap,
  CheckCircle2,
  BarChart3,
  Send,
  Terminal,
  Code,
  Cpu,
  Layers,
  Lock,
  Monitor,
  Command,
  GitBranch,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// --- Internal Button Component ---
const Button = ({ children, variant, size, className = "", ...props }) => {
  let baseStyles =
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  let variantStyles = "bg-cyan-600 text-white hover:bg-cyan-700 shadow-md hover:shadow-lg"; // Default: primary/cyan
  let sizeStyles = "h-11 py-2 px-5 text-base"; // Default: medium

  if (variant === "outline") {
    variantStyles =
      "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm";
  } else if (variant === "secondary") {
    variantStyles =
      "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 shadow-none";
  }

  if (size === "lg") {
    sizeStyles = "h-14 px-8 py-4 text-lg";
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Internal Card Components ---
const Card = ({ className = "", children, ...props }) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg transition-all duration-500 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent = ({ className = "", children, ...props }) => {
  return (
    <div className={`p-8 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Utility component for subtle entrance animation
const AnimateOnLoad = ({ children, delay, className = "", ...props }) => {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Set to true after a small delay to trigger CSS transition
    const timeout = setTimeout(() => setHasAnimated(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-700 ${className} ${
        hasAnimated
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6 scale-95"
      }`}
      {...props}
    >
      {children}
    </div>
  );
};

// --- Main Home Component ---
export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation (Retained) */}
      <nav className="sticky top-0 z-50 transition-all duration-500 border-b bg-white/90 backdrop-blur-sm border-slate-100">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* LEFT — LOGO + TEXT */}
            <AnimateOnLoad delay={0} className="flex items-center gap-3">
              <div className="flex items-center mt-3.5 justify-center">
                <Image
                  src="/Logo01.png"
                  alt="CodeWithAI Logo"
                  width={45}
                  height={45}
                  priority
                  className="object-contain"
                />
              </div>

              <span className="text-2xl font-extrabold tracking-wider text-slate-900 whitespace-nowrap">
                Rapid<span className="text-cyan-600 ">Code</span>
              </span>
            </AnimateOnLoad>

            {/* RIGHT — NAV LINKS + AUTH */}
            <AnimateOnLoad
              delay={100}
              className="flex items-center gap-6"
            >
              {/* Navigation links here... */}
              <a
                href="#features"
                className="relative hidden font-medium transition-colors md:inline text-slate-600 hover:text-cyan-600 group"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="relative hidden font-medium transition-colors md:inline text-slate-600 hover:text-cyan-600 group"
              >
                Pricing
              </a>

              {/* Auth controls (Clerk) */}
              <div className="flex items-center gap-3 ml-4">
                <SignedOut>
                  <a
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-semibold transition rounded-lg text-slate-700 hover:text-cyan-600"
                  >
                    Sign In
                  </a>
                  <Button
                    size="medium"
                    className="text-sm shadow-cyan-500/30"
                  >
                    <a href="/sign-up">Start Free</a>
                  </Button>
                </SignedOut>

                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </AnimateOnLoad>
          </div>
        </div>
      </nav>

      {/* Hero Section - NEW Split-Screen Chat-First UI */}
      <section className="px-4 pb-20 bg-white pt-28 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 mx-auto max-w-7xl lg:grid-cols-2">
          
          {/* LEFT COLUMN: Value Proposition and CTA */}
          <div className="text-center lg:text-left">
            <AnimateOnLoad delay={200}>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium border rounded-full bg-cyan-50 text-cyan-700 border-cyan-200">
                <Terminal className="w-4 h-4" />
                Expert Full-Stack Intelligence
              </div>
            </AnimateOnLoad>
            
            <AnimateOnLoad delay={300}>
              <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl text-slate-900">
                Your <span className="text-cyan-600">Ultimate</span> AI Coding Partner.
              </h1>
            </AnimateOnLoad>
            
            <AnimateOnLoad delay={400}>
              <p className="max-w-xl mx-auto mb-10 text-xl leading-relaxed text-slate-600 lg:mx-0">
                Ship faster with AI-driven code reviews, architecture guidance, and step-by-step logic explanations for complex systems.
              </p>
            </AnimateOnLoad>
            
            <AnimateOnLoad delay={500}>
              <Button
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-700 hover:scale-[1.02] shadow-cyan-500/40"
              >
                <a href="/Main" className="flex items-center">
                  Start Chatting Now
                  <Code className="w-5 h-5 ml-3" />
                </a>
              </Button>
            </AnimateOnLoad>
          </div>

          {/* RIGHT COLUMN: Chat Interface Simulation */}
          <AnimateOnLoad delay={600} className="relative w-full">
            <Card className="shadow-2xl shadow-cyan-300/60 h-[500px] overflow-hidden flex flex-col justify-between border-slate-800 bg-[#0d1117]">
                
                {/* Header Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800 rounded-t-xl">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#0d1117] rounded-md border border-gray-800">
                          <Code className="w-3 h-3 text-cyan-400" />
                          <span className="text-[11px] font-mono text-gray-400">refactor.ts</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 opacity-50">
                          <span className="text-[11px] font-mono text-gray-500">schema.sql</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Image
                            src="/Logo01.png"
                            alt="AI Assistant Icon"
                            width={30}
                            height={30}
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Chat History (Simulated) */}
                <div className="relative p-4 space-y-4 overflow-y-auto grow custom-scrollbar bg-[#0d1117]">
                    
                    {/* Large Logo Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <Image
                            src="/Logo01.png"
                            alt="Code AI Logo Watermark"
                            width={200}
                            height={200}
                            priority
                            className="object-contain"
                            style={{ opacity: 0.08 }} 
                        />
                    </div>

                    {/* AI Message 1 */}
                    <div className="flex justify-start">
                        <div className="bg-[#161b22] text-gray-300 border border-gray-800 p-4 rounded-xl rounded-tl-sm max-w-[90%] text-sm shadow-sm relative z-10 font-mono leading-relaxed">
                            <span className="text-cyan-400">analyze</span>: Found potential memory leak in <code className="text-yellow-200">AuthContext.tsx</code>. 
                            <br /><br />
                            The <code className="text-cyan-300">subscription</code> is never unsubscribed in the cleanup function. Would you like me to refactor this using a <code className="text-cyan-300">AbortController</code>?
                        </div>
                    </div>

                    {/* User Message 1 */}
                    <div className="flex justify-end">
                        <div className="bg-cyan-600/10 text-cyan-100 border border-cyan-500/30 p-3 rounded-xl rounded-br-sm max-w-[80%] text-sm shadow-sm relative z-10 font-medium">
                            Yes, apply the fix and ensure it's thread-safe.
                        </div>
                    </div>
                    
                    {/* AI Message 2 */}
                    <div className="flex justify-start">
                        <div className="bg-[#161b22] text-gray-300 border border-gray-800 p-4 rounded-xl rounded-tl-sm max-w-[90%] text-sm shadow-sm relative z-10 font-mono overflow-x-auto">
                            <div className="flex gap-3">
                              <span className="text-gray-600">1</span>
                              <span><span className="text-purple-400">useEffect</span>(() ={">"} {'{'}</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="text-gray-600">2</span>
                              <span className="pl-4 text-gray-400">// Optimized cleanup logic</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="text-gray-600">3</span>
                              <span className="pl-4"><span className="text-purple-400">return</span> () ={">"} controller.<span className="text-blue-300">abort</span>();</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Bar */}
                <div className="p-4 bg-[#161b22] border-t border-gray-800/50">
                    <div className="flex items-center gap-3 p-2 border border-gray-700 rounded-xl bg-[#0d1117]">
                        <input
                            type="text"
                            placeholder="Refactor the Auth module for performance..."
                            className="p-1 text-sm bg-transparent outline-none grow text-gray-300 placeholder:text-gray-600"
                            disabled
                        />
                        <Button
                            size="medium"
                            className="w-8 h-8 p-0 rounded-lg shrink-0 bg-cyan-600 hover:bg-cyan-700"
                            style={{ pointerEvents: 'none' }}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex justify-center mt-3 gap-4 opacity-40">
                      <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1"><Command className="w-3 h-3"/> K to search</span>
                      <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1"><GitBranch className="w-3 h-3"/> main branch indexed</span>
                    </div>
                </div>
            </Card>
          </AnimateOnLoad>
        </div>
      </section>

      {/* --- Section Separator --- */}
      <hr className="mx-auto border-slate-100 max-w-7xl" />

      {/* Features Section (Revised Layout) */}
      <section id="features" className="px-4 py-24 bg-slate-50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-extrabold md:text-5xl text-slate-900">
              Engineered for Developers
            </h2>
            <p className="text-xl text-slate-600">
              The tools for high-performance software delivery.
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature Cards (Retained content, cleaner styling) */}
            {[
              {
                icon: Terminal,
                title: "AST-Aware Debugging",
                description:
                  "Deep semantic understanding of your codebase. Identify complex logical errors that standard linters miss.",
                color: "cyan",
              },
              {
                icon: Layers,
                title: "Architecture Synthesis",
                description:
                  "Get system design patterns tailored to your stack. Move from monoliths to microservices with guided refactors.",
                color: "cyan",
              },
              {
                icon: Lock,
                title: "CVE & Security Shield",
                description:
                  "Real-time scanning for OWASP vulnerabilities and insecure dependency patterns before deployment.",
                color: "cyan",
              },
              {
                icon: BarChart3,
                title: "Performance Profiling",
                description:
                  "Automated SQL optimization and frontend hydration strategies to keep your Lighthouse score at 100.",
                color: "cyan",
              },
              {
                icon: Zap,
                title: "Real-time Pair Programming",
                description:
                  "Zero-latency context injection. It's like having a Senior Engineer sitting right next to you.",
                color: "cyan",
              },
              {
                icon: CheckCircle2,
                title: "Docstring Automation",
                description:
                  "Keep your TSDoc and JSDoc perfectly synced with your implementation automatically.",
                color: "cyan",
              },
            ].map((feature, index) => (
              <AnimateOnLoad key={feature.title} delay={100 * (index + 9)}>
                <Card className="group hover:shadow-cyan-300/50">
                  <CardContent>
                    <div
                      className={`h-14 w-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-6`}
                    >
                      <feature.icon
                        className={`h-7 w-7 text-${feature.color}-600 group-hover:scale-110 transition-transform`}
                      />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimateOnLoad>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section Separator --- */}
      <hr className="mx-auto border-slate-200 max-w-7xl" />

      {/* How It Works Section (Simplified) */}
      <section
        id="how-it-works"
        className="px-4 py-24 bg-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-extrabold md:text-5xl text-slate-900">
              Streamlined Workflow
            </h2>
            <p className="text-xl text-slate-600">
              A simple, 3-step path to high-quality production code.
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                step: 1,
                title: "Paste & Prompt",
                description:
                  "Upload your code snippets or describe your architectural challenges in plain English.",
              },
              {
                step: 2,
                title: "Contextual Analysis",
                description:
                  "The AI analyzes your stack, language nuances, and modern engineering best practices.",
              },
              {
                step: 3,
                title: "Documented Solution",
                description:
                  "Receive clean, documented code and a breakdown of the underlying logic.",
              },
            ].map((item, index) => (
              <AnimateOnLoad key={item.step} delay={100 * (index + 16)}>
                <div className="p-6 text-center transition-all duration-300 group rounded-xl hover:bg-cyan-50">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-3xl font-bold text-white rounded-full shadow-xl bg-cyan-600 shadow-cyan-500/30">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </AnimateOnLoad>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section Separator --- */}
      <hr className="mx-auto border-slate-200 max-w-7xl" />

      {/* Pricing Section (Retained structure) */}
      <section id="pricing" className="px-4 py-24 bg-slate-50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-extrabold md:text-5xl text-slate-900">
              Flexible Plans
            </h2>
            <p className="text-xl text-slate-600">
              High-powered intelligence for every stage of your career.
            </p>
          </div>
          <div className="grid max-w-6xl gap-8 mx-auto md:grid-cols-3">
            {/* Free Tier */}
            <AnimateOnLoad delay={2000}>
              <Card className="hover:scale-[1.02] border-slate-300 hover:shadow-slate-300/50 transition-all duration-300">
                <CardContent>
                  <h3 className="mb-2 text-3xl font-bold text-slate-900">Free</h3>
                  <p className="mb-6 text-slate-500">Perfect for side projects.</p>
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold text-slate-900">$0</span>
                    <span className="text-xl text-slate-400">/month</span>
                  </div>
                  <ul className="mb-10 space-y-4">
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>15 Code Reviews/month</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>Standard Language Support</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>Community Access</span>
                    </li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full text-slate-700 hover:text-cyan-700 border-slate-300 hover:bg-cyan-50"
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            </AnimateOnLoad>

            {/* Pro Tier (Highlighted) */}
            <AnimateOnLoad delay={2100}>
              <Card className="relative transition-all duration-300 transform scale-105 border-4 shadow-2xl border-cyan-600 hover:scale-107 shadow-cyan-500/50">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-600 text-white px-5 py-1.5 rounded-full text-sm font-bold tracking-wider">
                  BEST VALUE
                </div>
                <CardContent>
                  <h3 className="mb-2 text-3xl font-bold text-slate-900">Pro</h3>
                  <p className="mb-6 text-slate-500">For professional engineers.</p>
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold text-slate-900">$29</span>
                    <span className="text-xl text-slate-600">/month</span>
                  </div>
                  <ul className="mb-10 space-y-4">
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>**Unlimited** Coding Advice</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>**Advanced** Architecture Planning</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>Repo-Wide Context Awareness</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>Priority 24/7 Support</span>
                    </li>
                  </ul>
                  <Button className="w-full transform bg-cyan-600 hover:bg-cyan-700 hover:scale-105">
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>
            </AnimateOnLoad>

            {/* Enterprise Tier */}
            <AnimateOnLoad delay={2200}>
              <Card className="hover:scale-[1.02] border-slate-300 hover:shadow-slate-300/50 transition-all duration-300">
                <CardContent>
                  <h3 className="mb-2 text-3xl font-bold text-slate-900">
                    Enterprise
                  </h3>
                  <p className="mb-6 text-slate-500">For engineering teams.</p>
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold text-slate-900">
                      Custom
                    </span>
                  </div>
                  <ul className="mb-10 space-y-4">
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>Dedicated Dev-Ops Support</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>Private Custom Models</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>Custom IDE Integrations</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 mt-1 text-cyan-600 shrink-0" />
                      <span>99.9% SLA Guarantee</span>
                    </li>
                  </ul>
                  <Button
                    variant="secondary"
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800"
                  >
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </AnimateOnLoad>
          </div>
        </div>
      </section>

      {/* Footer (Retained) */}
      <footer className="px-4 py-12 bg-white border-t border-slate-200 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 mb-12 md:grid-cols-5">
            {/* Branding Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="h-7 w-7 text-cyan-600" />
                <span className="text-2xl font-extrabold tracking-wider text-white">
                  RAPID<span className="text-cyan-500">CODE</span>
                </span>
              </div>
              <p className="max-w-xs text-sm text-slate-500">
                Intelligent coding guidance powered by Gemini. Ship quality code with confidence.
              </p>
            </div>
            {/* Links Columns */}
            <div>
              <h4 className="mb-4 font-bold text-slate-900">Product</h4>
              <ul className="space-y-3 text-slate-600">
                <li><a href="#features" className="transition-colors hover:text-cyan-600">Features</a></li>
                <li><a href="#pricing" className="transition-colors hover:text-cyan-600">Pricing</a></li>
                <li><a href="#" className="transition-colors hover:text-cyan-600">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-slate-900">Company</h4>
              <ul className="space-y-3 text-slate-600">
                <li><a href="#" className="transition-colors hover:text-cyan-600">About Us</a></li>
                <li><a href="#" className="transition-colors hover:text-cyan-600">Blog</a></li>
                <li><a href="#" className="transition-colors hover:text-cyan-600">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-slate-900">Legal</h4>
              <ul className="space-y-3 text-slate-600">
                <li><a href="#" className="transition-colors hover:text-cyan-600">Privacy</a></li>
                <li><a href="#" className="transition-colors hover:text-cyan-600">Terms</a></li>
                <li><a href="#" className="transition-colors hover:text-cyan-600">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t border-slate-900 md:flex-row">
            <p className="text-sm text-slate-500">
              © 2025 RapidCode. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-cyan-600">Status</a>
              <a href="#" className="hover:text-cyan-600">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


// First UI

// "use client";
// import { motion } from "framer-motion";
// import { TypeAnimation } from "react-type-animation";
// import { ArrowRight, MessageSquare, TrendingUp, Shield } from "lucide-react";
// import Loader from '../components/Loader';

// export default function LandingPage() {

//     const features = [
//         {
//             icon: <MessageSquare className="w-8 h-8 text-cyan-400" />,
//             title: "Instant Financial Answers",
//             desc: "Get real-time budget reviews, debt payoff strategies, and personalized advice, 24/7.",
//         },
//         {
//             icon: <TrendingUp className="w-8 h-8 text-lime-400" />,
//             title: "Smart Investment Insights",
//             desc: "AI analyzes market data to suggest diversification and risk management strategies tailored to you.",
//         },
//         {
//             icon: <Shield className="w-8 h-8 text-blue-400" />,
//             title: "Secure & Confidential",
//             desc: "Your financial data is protected with bank-level encryption and strict privacy protocols.",
//         },
//     ];

//     const fadeIn = {
//         initial: { opacity: 0, y: 50 },
//         animate: { opacity: 1, y: 0 },
//         transition: { duration: 0.8 },
//     };

//     return (
//         // Main Background: Deep Navy Blue Gradient
//         <main className="flex flex-col items-center min-h-screen overflow-hidden text-white bg-linear-to-b from-slate-950 via-gray-900 to-slate-900">

//             {/* Header/Navigation */}
//             <header className="z-10 flex items-center justify-between w-full px-8 py-4 max-w-7xl">
//                 <div className="text-4xl font-extrabold tracking-wider text-cyan-400">
//                     F<span className="text-2xl text-blue-500">inMind</span>
//                 </div>
// <button
//   className="cursor-pointer relative bg-white/10 py-2 rounded-full min-w-34 min-h-[2.92rem] group max-w-full flex items-center justify-start hover:bg-green-400 transition-all duration-[0.8s] ease-[cubic-bezier(0.510,0.026,0.368,1.016)] shadow-[inset_1px_2px_5px_#00000080]"
// >
//   <div className="absolute flex px-1 py-0.5 justify-start items-center inset-0">
//     <div
//       className="w-[0%] group-hover:w-full transition-all duration-1000 ease-[cubic-bezier(0.510,0.026,0.368,1.016)]"
//     ></div>
//     <div
//       className="rounded-full shrink-0 flex justify-center items-center shadow-[inset_1px_-1px_3px_0_black] h-full aspect-square bg-green-400 transition-all duration-1000 ease-[cubic-bezier(0.510,0.026,0.368,1.016)] group-hover:bg-black"
//     >
//       <div
//         className="size-[0.8rem] text-black group-hover:text-white group-hover:-rotate-45 transition-all duration-1000 ease-[cubic-bezier(0.510,0.026,0.368,1.016)]"
//       >
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 16 16"
//           height="100%"
//           width="100%"
//         >
//           <path
//             fill="currentColor"
//             d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9Z"
//           ></path>
//         </svg>
//       </div>
//     </div>
//   </div>
//   <div
//     className="pl-[3.4rem] pr-[1.1rem] group-hover:pl-[1.1rem] group-hover:pr-[3.4rem] transition-all duration-1000 ease-[cubic-bezier(0.510,0.026,0.368,1.016)] group-hover:text-black text-white"
//   >
//     Login
//   </div>
// </button>

//             </header>

//             {/* --- */}

//             {/* 🌟 Hero Section */}
//             <section className="flex flex-col items-center justify-center w-full px-8 mt-12 text-center md:flex-row md:text-left md:mt-20 md:px-16 max-w-7xl">

//                 {/* Left Text & CTA */}
//                 <motion.div
//                     {...fadeIn}
//                     transition={{ duration: 0.8, delay: 0.2 }}
//                     className="flex-1 md:pr-10"
//                 >
//                     <h1 className="mb-3 text-5xl font-extrabold leading-tight sm:text-6xl">
//                         <span className="text-transparent bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text">
//                             Chat Your Way
//                         </span>
//                         <br />
//                         <span className="text-white">Financial</span> <span className="text-blue-400">Freedom</span>
//                     </h1>

//                     {/* 👇 TypeAnimation component ADDED/ACTIVATED */}
//                     <div className="mb-6 text-xl font-medium sm:text-2xl text-cyan-300 min-h-12">
//                         <TypeAnimation
//                             sequence={[
//                                 // Updated the sequence to be more feature-focused
//                                 "Plan your finances smarter 💡",
//                                 1500,
//                                 "Automate budgeting & saving 🤖",
//                                 1500,
//                                 "Get personalized advice 🗣️",
//                                 1500,
//                                 "Invest with confidence 📈",
//                                 1500,
//                             ]}
//                             wrapper="span"
//                             speed={50}
//                             repeat={Infinity}
//                             cursor={true}
//                         />
//                     </div>

//                     <p className="max-w-lg mb-8 text-slate-300">
//                         Empower your journey with **real-time AI insights**, smart investment strategies, and 24/7 personal advice.
//                     </p>

//                     <div className="flex flex-wrap justify-center gap-4 md:justify-start">
//                         <a
//                             href="/Main"

//                         >
// <button
//         className={`
//           group relative outline-0

//           /* Define CSS Variables for Sizing/Spacing */
//           /* Adjusted --sz-btn for height, introduced --w-btn for width */
//           [--sz-btn:68px]
//           [--w-btn:200px] /* NEW: Increased width for longer button */
//           [--space:calc(var(--sz-btn)/5.5)]
//           [--gen-sz:calc(var(--space)*2)]
//           [--sz-text:calc(var(--sz-btn)-var(--gen-sz))]

//           /* Button Sizing and Style */
//           h-(--sz-btn) w-(--w-btn) /* Use new --w-btn for width */
//           border border-solid border-transparent rounded-xl
//           flex items-center justify-center
//           cursor-pointer transition-transform duration-200
//           active:scale-[0.95]

//           /* NEW: Custom Background (gradient from purple/blue to pink) */
//           bg-[linear-gradient(45deg,#8A2BE2,#4169E1)]
//           /* NEW: Adjusted box-shadow to match new color aesthetic */
//           [box-shadow:rgba(74,51,139,0.3)_0_1px_2px_0,rgba(74,51,139,0.15)_0_2px_6px_2px,rgba(0,0,0,0.3)_0_30px_60px_-30px,rgba(50,20,100,0.35)_0_-2px_6px_0_inset]
//         `}
//       >
//         <svg
//           className={`
//             animate-pulse absolute z-10 overflow-visible transition-all duration-300
//             /* NEW: Text color for the SVG - light blue */
//             text-[#ADD8E6] group-hover:text-white

//             /* Positioning and Sizing based on variables */
//             /* Adjusted left positioning to center within the longer button */
//             top-[calc(var(--sz-text)/7)]
//             left-[calc(50%-(var(--gen-sz)/2))] /* Center horizontally initially */
//             h-(--gen-sz) w-(--gen-sz)

//             /* Group Hover Transition - adjust hover left to stay visually appealing */
//             group-hover:h-(--sz-text) group-hover:w-(--sz-text)
//             group-hover:left-[calc(50%-(var(--sz-text)/2))] /* Center horizontally on hover */
//             group-hover:top-[calc(calc(var(--gen-sz))/2)]
//           `}
//           stroke="none"
//           viewBox="0 0 24 24"
//           fill="currentColor"
//         >
//           <path
//             fillRule="evenodd"
//             clipRule="evenodd"
//             d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
//           ></path>
//         </svg>
//         <span
//           className={`
//             [font-size:var(--sz-text)] font-extrabold leading-none
//             text-white transition-all duration-200 group-hover:opacity-0
//           `}
//         >
//           GO
//         </span>
//       </button>

//                         </a>
//                     </div>
//                 </motion.div>

//                 {/* Right Visual Section (Loader) - Seamless Gradient */}
//                 <motion.div
//                     {...fadeIn}
//                     transition={{ duration: 0.8, delay: 0.4 }}
//                     className="flex-1 mt-12 md:mt-0 w-full md:w-[600px] h-[300px] md:h-[400px] rounded-2xl shadow-2xl flex items-center justify-center relative bg-linear-to-b from-slate-950 via-gray-900 to-slate-900"
//                 >
//                     <Loader />
//                     <span className="absolute text-sm bottom-4 text-slate-500">
//                         AI-Powered Interface Example
//                     </span>
//                 </motion.div>
//             </section>

//             {/* --- */}

//             {/* ✨ Features Section */}
//             <section className="grid w-full grid-cols-1 gap-10 px-8 mt-24 mb-16 max-w-7xl sm:grid-cols-2 lg:grid-cols-3">
//                 {features.map((feature, index) => (
//                     <motion.div
//                         key={index}
//                         initial={{ opacity: 0, y: 40 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         transition={{ delay: index * 0.2 }}
//                         viewport={{ once: true }}
//                         className="p-8 transition-all duration-300 border shadow-2xl bg-slate-900/70 backdrop-blur-sm border-blue-700/50 rounded-xl hover:shadow-blue-500/10 hover:-translate-y-2"
//                     >
//                         <div className="mb-4">{feature.icon}</div>
//                         <h3 className="mb-3 text-xl font-bold text-white">
//                             {feature.title}
//                         </h3>
//                         <p className="leading-relaxed text-slate-400">{feature.desc}</p>
//                     </motion.div>
//                 ))}
//             </section>

//             {/* --- */}

//             {/* 💬 Call-to-Action / Testimonial Placeholder */}
//             <motion.section
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.8 }}
//                 viewport={{ once: true }}
//                 className="max-w-3xl p-10 mx-8 mb-24 text-center border shadow-2xl bg-blue-600/10 border-blue-500/30 backdrop-blur-lg rounded-2xl"
//             >
//                 <h2 className="mb-4 text-3xl font-bold text-cyan-400">
//                     Ready to grow your wealth?
//                 </h2>
//                 <p className="mb-6 italic text-slate-300">
//                     "This app turned my portfolio around. It's like having a financial guru in your pocket." - Alex K.
//                 </p>
//                 <a
//                     href="/Main"
//                     className="inline-block px-8 py-3 text-lg font-semibold text-white transition-all duration-300 bg-blue-600 rounded-lg shadow-xl hover:bg-blue-500 shadow-blue-500/40"
//                 >
//                     Get Started for Free
//                 </a>
//             </motion.section>

//             {/* --- */}

//             {/* Footer */}
//             <footer className="w-full py-6 text-sm text-center border-t border-slate-800 text-slate-500">
//                 © {new Date().getFullYear()} AI Finance Advisor · Smarter Investing.
//             </footer>
//         </main>
//     );
// }

// second UI

// import React from 'react';

// // Use a placeholder for the icon/logo since we don't have the actual asset
// const FinanceAILogo = () => (
//   <div className="flex items-center space-x-1">
//     {/* Placeholder for the chart/graph icon */}
//     <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2-5h12M7 20h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v13a2 2 0 002 2z"></path>
//     </svg>
//     <span className="text-xl font-bold text-gray-800">FinMind</span>
//   </div>
// );

// // Placeholder for the chat icon used in the button
// const ChatIcon = () => (
//   <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
//   </svg>
// );

// const BoltIcon = () => (
//   <svg className="w-4 h-4 mr-1 text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//     <path d="M11 2.158A1 1 0 009.28.948l-6 11A1 1 0 004 14h5v4a1 1 0 001.72.639l6-11A1 1 0 0015 6h-5V2.158z"></path>
//   </svg>
// );

// const HeroSection = () => {
//   return (
//     <div className="min-h-screen font-sans">

//       {/* 1. Navigation Bar */}
//       <header className="px-6 py-4 border-b border-gray-100 md:px-12">
//         <nav className="flex items-center justify-between mx-auto max-w-7xl">
//           <FinanceAILogo />
//           <div className="flex items-center space-x-6">
//             <div className="hidden space-x-6 font-medium text-gray-600 md:flex">
//               <a href="#" className="hover:text-green-600">Features</a>
//               <a href="#" className="hover:text-green-600">How It Works</a>
//               <a href="#" className="hover:text-green-600">Pricing</a>
//             </div>
//             <a href="#" className="font-medium text-gray-600 hover:text-green-600">Sign In</a>
//             <button className="px-4 py-2 font-semibold text-white transition duration-300 bg-green-600 rounded-lg shadow-md hover:bg-green-700">
//               Get Started
//             </button>
//           </div>
//         </nav>
//       </header>

//       {/* 2. Main Content Area (Centered) */}
//       <main className="flex flex-col items-center px-4 pt-20 pb-16 text-center">

//         {/* AI-Powered Financial Guidance Tag */}
//         <div className="inline-flex items-center px-3 py-1 mb-6 text-sm font-semibold text-green-700 rounded-full bg-green-50">
//           <BoltIcon />
//           AI-Powered Financial Guidance
//         </div>

//         {/* Title */}
//         <h1 className="max-w-4xl mb-4 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl">
//           Your Personal <span className="text-green-600">AI Finance Advisor</span>
//         </h1>

//         {/* Subtitle/Description */}
//         <p className="max-w-2xl mb-10 text-xl text-gray-600">
//           Get instant, personalized financial advice powered by advanced AI. Make smarter decisions about investing, budgeting, and growing your wealth.
//         </p>

//         {/* Call to Action Buttons */}
//         <div className="flex flex-col mb-20 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
//           <button className="flex items-center justify-center px-8 py-3 text-lg font-semibold text-white transition duration-300 bg-green-600 rounded-lg shadow-lg hover:bg-green-700">
//             Start Chat Now
//             <ChatIcon />
//           </button>
//           <button className="px-8 py-3 text-lg font-semibold text-gray-700 transition duration-300 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
//             Watch Demo
//           </button>
//         </div>

//         {/* Stats Section */}
//         <div className="flex items-center justify-center w-full max-w-4xl divide-x divide-gray-200">
//           {/* Stat Item Component */}
//           <StatItem value="50K+" label="Active Users" />
//           <StatItem value="1M+" label="Conversations" />
//           <StatItem value="98%" label="Satisfaction" />
//           <StatItem value="24/7" label="Available" />
//         </div>

//       </main>

//       {/* Footer/Bottom Branding (Made in Bolt) */}
//       <div className="py-4 pr-6 text-right md:pr-12">
//         <span className="text-xs font-medium text-gray-500">
//           Made in <span className="font-bold text-gray-800">Bolt</span>
//         </span>
//       </div>
//     </div>
//   );
// };

// // Helper component for the statistics
// const StatItem = ({ value, label }) => (
//   <div className="flex-1 px-4 py-4 sm:px-10">
//     <div className="mb-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">{value}</div>
//     <div className="text-base font-medium text-gray-500">{label}</div>
//   </div>
// );

// export default HeroSection;
