export interface Project {
  name: string
  slug: string
  description: string
  repo: string
  originHost: string
  category: 'core' | 'tooling' | 'runtime' | 'language-sdk'
}

// Every marketing-catalog slug is routable. Publishing a docs origin at
// <slug>.hop.top therefore activates docs.hop.top/<slug> without a router
// code change. PROJECTS below remains the verified discovery/index subset.
export const ROUTABLE_SLUGS = [
  'agr',
  'aps',
  'axon',
  'ben',
  'c12n',
  'cite',
  'cxr',
  'eva',
  'fit',
  'git',
  'ibr',
  'nerv',
  'pod',
  'stem',
  'tip',
  'tlc',
  'vein',
  'wsm',
  'xat',
  'xrr',
] as const

// Only documentation builds that have been verified in their source project
// belong here. Descriptions come from authoritative GitHub project metadata.
export const PROJECTS: Project[] = [
  {
    name: 'aps',
    slug: 'aps',
    description: 'Agent Profile System',
    repo: 'https://github.com/hop-top/aps',
    originHost: 'aps-site.pages.dev',
    category: 'tooling',
  },
]
