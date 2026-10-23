export interface Friend {
  name: string;
  /** Canonical site or repository; plain URL, no tracking parameters. */
  url: string;
  /** What the project is, in its own terms. */
  what: string;
  /** How a hop.top tool relates to it today; facts only. */
  relation: string;
  /** Catalog slugs of the hop.top tools named in the relation. */
  tools: string[];
}

export interface FriendGroup {
  label: string;
  friends: Friend[];
}

// Open source projects our tools use, build on, or work alongside.
// Each relation must be true in our public repositories today; a pairing
// that still needs work on our side is not listed until it ships.
export const friendGroups: FriendGroup[] = [
  {
    label: 'Agents and editors',
    friends: [
      {
        name: 'Agent Client Protocol',
        url: 'https://agentclientprotocol.com/',
        what: 'A protocol for connecting any editor to any agent.',
        relation:
          'aps runs an ACP server, so editors that speak ACP can open sessions with aps agents.',
        tools: ['aps'],
      },
      {
        name: 'beads',
        url: 'https://beads.gascity.com/',
        what: 'An issue graph that gives coding agents memory across sessions.',
        relation:
          'A neighbour of tlc, our todo list that syncs with issue trackers; each covers a different part of tracking agent work.',
        tools: ['tlc'],
      },
      {
        name: 'opencode',
        url: 'https://opencode.ai/',
        what: 'The open source coding agent.',
        relation:
          'nerv supports OpenCode: a hook written once for nerv runs there and on the other supported AI coding CLIs.',
        tools: ['nerv'],
      },
    ],
  },
  {
    label: 'Specs and guidelines',
    friends: [
      {
        name: 'JSON Schema',
        url: 'https://json-schema.org/',
        what: 'The specification for describing and validating JSON data.',
        relation:
          'The crtx envelope and event schemas are written in JSON Schema 2020-12.',
        tools: ['spec-crtx'],
      },
      {
        name: 'Command Line Interface Guidelines',
        url: 'https://clig.dev/',
        what: 'An open guide to writing better command-line programs.',
        relation:
          'The 12-Factor AI-CLI spec builds on these guidelines and narrows them for AI-enabled CLIs.',
        tools: ['spec-12fc'],
      },
    ],
  },
  {
    label: 'Command-line tooling',
    friends: [
      {
        name: 'direnv',
        url: 'https://direnv.net/',
        what: 'Loads and unloads environment variables depending on the current directory.',
        relation:
          'Same design space as aps, which scopes environment and credentials to an agent profile instead of a directory.',
        tools: ['aps'],
      },
      {
        name: 'Charm',
        url: 'https://charm.land/',
        what: 'Go libraries for terminal apps, including Bubble Tea, Lip Gloss and Huh.',
        relation:
          'aps builds its terminal interface with Bubble Tea, Lip Gloss and Huh.',
        tools: ['aps'],
      },
      {
        name: 'GoReleaser',
        url: 'https://goreleaser.com/',
        what: 'Release automation that builds, packages and publishes Go projects.',
        relation: 'aps and tlc publish their releases with GoReleaser.',
        tools: ['aps', 'tlc'],
      },
    ],
  },
  {
    label: 'Testing',
    friends: [
      {
        name: 'VCR',
        url: 'https://github.com/vcr/vcr',
        what: "Records a test suite's HTTP interactions and replays them in later runs.",
        relation:
          'xrr applies the same record-and-replay approach to exec, HTTP, gRPC, Redis and SQL.',
        tools: ['xrr'],
      },
    ],
  },
];

export const friends: Friend[] = friendGroups.flatMap((group) => group.friends);
