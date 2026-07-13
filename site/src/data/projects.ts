export interface Project {
  name: string;
  repo: string;
  description: string;
  category: Category;
  install?: string;
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

export const projects: Project[] = [
  {
    name: 'kit',
    repo: 'https://github.com/hop-top/kit',
    description: 'Shared Go utilities and foundational primitives.',
    category: 'core',
    install: 'go get hop.top/kit',
  },
  {
    name: 'cite',
    repo: 'https://github.com/hop-top/poly-cite',
    description: 'Polyglot toolkit for custom URI schemes and OS handler registration.',
    category: 'core',
    install: 'go get hop.top/cite',
  },
  {
    name: 'mdl',
    repo: 'https://github.com/hop-top/mdl',
    description: 'Model definitions and shared data structures.',
    category: 'core',
    install: 'go get hop.top/mdl',
  },
  {
    name: 'tlc',
    repo: 'https://github.com/hop-top/tlc',
    description: 'Task lifecycle manager — tracks, plans, and flows.',
    category: 'cli',
    install: 'go install hop.top/tlc@latest',
  },
  {
    name: 'aps',
    repo: 'https://github.com/hop-top/aps',
    description: 'Agent profile store and workspace manager.',
    category: 'cli',
    install: 'go install hop.top/aps@latest',
  },
  {
    name: 'wsm',
    repo: 'https://github.com/hop-top/wsm',
    description: 'Workspace and squad management.',
    category: 'cli',
    install: 'go install hop.top/wsm@latest',
  },
  {
    name: 'rsx',
    repo: 'https://github.com/hop-top/rsx',
    description: 'Repository signal extractor for dependency vetting.',
    category: 'cli',
    install: 'go install hop.top/rsx@latest',
  },
  {
    name: 'ibr',
    repo: 'https://github.com/hop-top/ibr',
    description: 'Intent-driven headless browser automation.',
    category: 'cli',
  },
  {
    name: 'ben',
    repo: 'https://github.com/hop-top/ben',
    description: 'Benchmark runner and reporting.',
    category: 'cli',
  },
  {
    name: 'rlz',
    repo: 'https://github.com/hop-top/rlz',
    description: 'Release automation and changelog generation.',
    category: 'cli',
  },
  {
    name: 'stk',
    repo: 'https://github.com/hop-top/stk',
    description: 'Stack orchestration and environment setup.',
    category: 'cli',
  },
  {
    name: 'upgrade',
    repo: 'https://github.com/hop-top/upgrade',
    description: 'Self-update mechanism for hop binaries.',
    category: 'cli',
  },
  {
    name: 'tip',
    repo: 'https://github.com/hop-top/tip',
    description: 'Contextual tips and onboarding hints.',
    category: 'cli',
  },
  {
    name: 'par',
    repo: 'https://github.com/hop-top/par',
    description: 'Parallel task runner with dependency awareness.',
    category: 'cli',
  },
  {
    name: 'gym',
    repo: 'https://github.com/hop-top/gym',
    description: 'Skill package manager for agent workflows.',
    category: 'cli',
  },
  {
    name: 'tab',
    repo: 'https://github.com/hop-top/tab',
    description: 'Terminal dashboard and tab manager.',
    category: 'cli',
  },
  {
    name: 'mde',
    repo: 'https://github.com/hop-top/mde',
    description: 'Markdown editor and preview tooling.',
    category: 'cli',
  },
  {
    name: 'hdox',
    repo: 'https://github.com/hop-top/hdox',
    description: 'Documentation site generator.',
    category: 'cli',
  },
  {
    name: 'git',
    repo: 'https://github.com/hop-top/git',
    description: 'Git extensions including worktree management.',
    category: 'cli',
    install: 'go install hop.top/git@latest',
  },
  {
    name: 'hop',
    repo: 'https://github.com/hop-top/hop',
    description: 'Meta-CLI orchestrator for the hop ecosystem.',
    category: 'cli',
    install: 'go install hop.top/hop@latest',
  },
  {
    name: 'rux',
    repo: 'https://github.com/hop-top/rux',
    description: 'Reactive UX primitives for Go CLIs.',
    category: 'sdk',
    install: 'go get hop.top/rux',
  },
  {
    name: 'aom',
    repo: 'https://github.com/hop-top/aom',
    description: 'Agent orchestration model and runtime.',
    category: 'sdk',
    install: 'go get hop.top/aom',
  },
  {
    name: 'xrr',
    repo: 'https://github.com/hop-top/xrr',
    description: 'Cross-runtime router for Go.',
    category: 'cross-runtime',
    install: 'go get hop.top/xrr',
  },
  {
    name: 'xrr-ts',
    repo: 'https://github.com/hop-top/xrr-ts',
    description: 'Cross-runtime router for TypeScript.',
    category: 'cross-runtime',
    install: 'npm install @hop-top/xrr',
  },
  {
    name: 'xrr-rs',
    repo: 'https://github.com/hop-top/xrr-rs',
    description: 'Cross-runtime router for Rust.',
    category: 'cross-runtime',
    install: 'cargo add xrr',
  },
  {
    name: 'xrr-php',
    repo: 'https://github.com/hop-top/xrr-php',
    description: 'Cross-runtime router for PHP.',
    category: 'cross-runtime',
    install: 'composer require hop-top/xrr',
  },
  {
    name: 'xrr-py',
    repo: 'https://github.com/hop-top/xrr-py',
    description: 'Cross-runtime router for Python.',
    category: 'cross-runtime',
    install: 'pip install xrr',
  },
  {
    name: 'xrr-poly',
    repo: 'https://github.com/hop-top/xrr-poly',
    description: 'Polyglot cross-runtime router specs and tests.',
    category: 'cross-runtime',
  },
  {
    name: 'cxr',
    repo: 'https://github.com/hop-top/cxr',
    description: 'Context exchange runtime for distributed agents.',
    category: 'infra',
  },
  {
    name: 'x402',
    repo: 'https://github.com/hop-top/x402',
    description: 'HTTP 402 payment-required protocol implementation.',
    category: 'infra',
  },
  {
    name: 'eva',
    repo: 'https://github.com/hop-top/eva',
    description: 'Evaluation framework for agent quality.',
    category: 'ai',
  },
  {
    name: 'eva-pkg',
    repo: 'https://github.com/hop-top/eva-pkg',
    description: 'Shareable evaluation packages and presets.',
    category: 'ai',
  },
  {
    name: 'eva-ee',
    repo: 'https://github.com/hop-top/eva-ee',
    description: 'Enterprise evaluation extensions.',
    category: 'ai',
  },
  {
    name: 'orb',
    repo: 'https://github.com/hop-top/orb',
    description: 'Graph-native runtime for modeling and operating organizations as living worlds of humans, agents, and processes.',
    category: 'infra',
    install: 'go install hop.top/orb@latest',
  },
];
