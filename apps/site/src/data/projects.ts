export interface Project {
  name: string;
  repo: string;
  description: string;
  category: Category;
  install?: string;
  docs?: string;
  spec?: string;
}

export type Category =
  | 'core'
  | 'cli'
  | 'sdk'
  | 'cross-runtime'
  | 'infra'
  | 'ai';

export const categories: Record<Category, { label: string; color: string }> = {
  core: { label: 'Core', color: 'var(--accent-amber)' },
  cli: { label: 'CLI Tools', color: 'var(--accent-cyan)' },
  sdk: { label: 'SDKs & Libraries', color: 'var(--accent-green)' },
  'cross-runtime': { label: 'Cross-Runtime', color: 'var(--accent-rose)' },
  infra: { label: 'Infrastructure', color: 'var(--accent-violet)' },
  ai: { label: 'AI & Eval', color: 'var(--accent-orange)' },
};

// Curated catalog. Descriptions are copied verbatim from GitHub repository
// metadata or from the repository's authored README when metadata is absent.
export const projects: Project[] = [
  {
    name: 'spec-crtx',
    repo: 'https://github.com/hop-top/spec-crtx',
    description: 'Language-agnostic specification for AI agent conversations',
    category: 'core',
    spec: 'https://spec.hop.top/crtx/v0.1/envelope.md',
  },
  {
    name: 'aps',
    repo: 'https://github.com/hop-top/aps',
    description: 'Agent Profile System',
    category: 'cli',
    docs: 'https://docs.hop.top/aps/',
  },
  {
    name: 'wsm',
    repo: 'https://github.com/hop-top/wsm',
    description: 'IDE-agnostic workspace session manager allowing to start in Claude and resume in Gemini.',
    category: 'cli',
  },
  {
    name: 'git',
    repo: 'https://github.com/hop-top/git',
    description: 'Deterministic, isolated, and reproducible multi-branch git worktree wrapper.',
    category: 'cli',
  },
  {
    name: 'ibr',
    repo: 'https://github.com/hop-top/ibr',
    description: 'Human instructions translated into X-Path capable of finding the intended data even after a page structure or location change.',
    category: 'cli',
  },
  {
    name: 'tip',
    repo: 'https://github.com/hop-top/tip',
    description: 'Instantly transform any agent into a CLI token aware power user that never drifts.',
    category: 'cli',
  },
  {
    name: 'ben',
    repo: 'https://github.com/hop-top/ben',
    description: 'General-purpose benchmarking tool — answers "which approach is better, and by how much?" for any measurable task: tools, implementations, deps, LLM calls, agents.',
    category: 'cli',
  },
  {
    name: 'tlc',
    repo: 'https://github.com/hop-top/tlc',
    description: 'IDE-agnostic todo list with full syncing with any issue tracking tool for tasks created remotely.',
    category: 'cli',
  },
  {
    name: 'pod',
    repo: 'https://github.com/hop-top/pod',
    description: 'Session, model, and tooling layer on top of any remote compute.',
    category: 'cli',
  },
  {
    name: 'xat',
    repo: 'https://github.com/hop-top/xat',
    description: 'Cross-Assistant Tester — cross-CLI conformance + regression harness for AI-assistant plugins (Claude Code, Gemini, Codex, OpenCode)',
    category: 'cli',
  },
  {
    name: 'cite',
    repo: 'https://github.com/hop-top/poly-cite',
    description: 'Polyglot toolkit for custom URI schemes (Go, TS, Python, Rust, PHP). Shared contract + parity-tested SDKs.',
    category: 'cross-runtime',
  },
  {
    name: 'nerv',
    repo: 'https://github.com/hop-top/poly-nerv',
    description: 'Write one hook. Run it on every AI coding CLI.',
    category: 'cross-runtime',
  },
  {
    name: 'stem',
    repo: 'https://github.com/hop-top/poly-stem',
    description: 'Polyglot AI agent runtime — Go reference runtime + envelope SDKs for TS, Py, Rs, PHP. Implements crtx v0.1 (pronounced \'cortex\').',
    category: 'cross-runtime',
  },
  {
    name: 'axon',
    repo: 'https://github.com/hop-top/poly-axon',
    description: 'Host-CLI contract for AI-assistant hooks: identity, event maps, envelope and decision shapes, per CLI',
    category: 'cross-runtime',
  },
  {
    name: 'vein',
    repo: 'https://github.com/hop-top/poly-vein',
    description: 'Find any coding session across any AI assistant. One command.',
    category: 'cross-runtime',
  },
  {
    name: 'xrr',
    repo: 'https://github.com/hop-top/poly-xrr',
    description: 'Generic multi-channel interaction recorder/replayer with a pluggable adapter interface.',
    category: 'cross-runtime',
  },
  {
    name: 'cxr',
    repo: 'https://github.com/hop-top/cxr',
    description: 'Capability eXecution Router — domain-agnostic dispatch runtime',
    category: 'infra',
  },
  {
    name: 'agr',
    repo: 'https://github.com/hop-top/agr',
    description: 'AGR is a V*-native, temporal, event-sourced, multi-agent orchestration runtime.',
    category: 'infra',
  },
  {
    name: 'eva',
    repo: 'https://github.com/hop-top/eva',
    description: 'Distributed, extensible framework for testing, routing, and validating LLM-based agents.',
    category: 'ai',
  },
  {
    name: 'c12n',
    repo: 'https://github.com/hop-top/poly-c12n',
    description: 'Classification engine — LLM request classification with signal-based routing',
    category: 'ai',
  },
  {
    name: 'fit',
    repo: 'https://github.com/hop-top/fit',
    description: 'Train small advisor models to steer black-box LLMs without fine-tuning.',
    category: 'ai',
  },
];
