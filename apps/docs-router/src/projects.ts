export interface Project {
  name: string
  slug: string
  description: string
  repo: string
  docsHost: string
  category: 'core' | 'tooling' | 'runtime' | 'language-sdk'
}

export const PROJECTS: Project[] = [
  {
    name: 'kit',
    slug: 'kit',
    description: 'Standard library & shared utilities',
    repo: 'https://github.com/hop-top/kit',
    docsHost: 'kit.hop.top',
    category: 'core',
  },
  {
    name: 'tlc',
    slug: 'tlc',
    description: 'Task lifecycle & project tracking',
    repo: 'https://github.com/hop-top/tlc',
    docsHost: 'tlc.hop.top',
    category: 'tooling',
  },
  {
    name: 'cite',
    slug: 'cite',
    description: 'Custom URI schemes & OS handler registration',
    repo: 'https://github.com/hop-top/poly-cite',
    docsHost: 'cite.hop.top',
    category: 'core',
  },
  {
    name: 'xrr',
    slug: 'xrr',
    description: 'Codebase discovery & structural overview',
    repo: 'https://github.com/hop-top/xrr',
    docsHost: 'xrr.hop.top',
    category: 'tooling',
  },
  {
    name: 'eva',
    slug: 'eva',
    description: 'Evaluation & contract testing',
    repo: 'https://github.com/hop-top/eva',
    docsHost: 'eva.hop.top',
    category: 'tooling',
  },
  {
    name: 'rsx',
    slug: 'rsx',
    description: 'Repository signal extractor',
    repo: 'https://github.com/hop-top/rsx',
    docsHost: 'rsx.hop.top',
    category: 'tooling',
  },
  {
    name: 'ibr',
    slug: 'ibr',
    description: 'Intent-driven browser automation',
    repo: 'https://github.com/hop-top/ibr',
    docsHost: 'ibr.hop.top',
    category: 'runtime',
  },
  {
    name: 'gym',
    slug: 'gym',
    description: 'Skill package manager',
    repo: 'https://github.com/hop-top/gym',
    docsHost: 'gym.hop.top',
    category: 'tooling',
  },
  {
    name: 'wsm',
    slug: 'wsm',
    description: 'Workspace & squad management',
    repo: 'https://github.com/hop-top/wsm',
    docsHost: 'wsm.hop.top',
    category: 'tooling',
  },
  {
    name: 'aps',
    slug: 'aps',
    description: 'Profile & workspace lookup',
    repo: 'https://github.com/hop-top/aps',
    docsHost: 'aps.hop.top',
    category: 'tooling',
  },
  {
    name: 'xrr-ts',
    slug: 'xrr-ts',
    description: 'xray TypeScript SDK',
    repo: 'https://github.com/hop-top/xrr-ts',
    docsHost: 'xrr-ts.hop.top',
    category: 'language-sdk',
  },
  {
    name: 'xrr-py',
    slug: 'xrr-py',
    description: 'xray Python SDK',
    repo: 'https://github.com/hop-top/xrr-py',
    docsHost: 'xrr-py.hop.top',
    category: 'language-sdk',
  },
  {
    name: 'xrr-rs',
    slug: 'xrr-rs',
    description: 'xray Rust SDK',
    repo: 'https://github.com/hop-top/xrr-rs',
    docsHost: 'xrr-rs.hop.top',
    category: 'language-sdk',
  },
  {
    name: 'xrr-php',
    slug: 'xrr-php',
    description: 'xray PHP SDK',
    repo: 'https://github.com/hop-top/xrr-php',
    docsHost: 'xrr-php.hop.top',
    category: 'language-sdk',
  },
]
