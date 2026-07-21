/**
 * Projects that don't have a content-collection write-up.
 * Single source of truth — rendered on the home desktop (window 02/03)
 * AND the /projects/ page, so the two never drift apart again.
 */

export interface OtherWorkItem {
  name: string;
  tech: string;
  description?: string;
}

export const otherWork: OtherWorkItem[] = [
  {
    name: 'remote-mcp-server',
    tech: 'ts · node · docker',
    description:
      'model context protocol server over url — ai assistants hit custom tools via sse transport.'
  },
  {
    name: 'home-infra-lab',
    tech: 'docker · linux · truenas · tailscale',
    description:
      'multi-node self-hosted services — nas, media, workflow automation, monitoring dashboards.'
  },
  {
    name: 'loyalty-points-transfer',
    tech: 'node · ts · react',
    description:
      'cross-program loyalty point transfer flow — backend conversion logic with a clean ui on top.'
  },
  {
    name: 'local-ai-inference-server',
    tech: 'linux · ml-inference',
    description:
      'self-hosted inference box for local llm + transcription workloads — keep data off the cloud.'
  },
  { name: 'airline-route-mapping', tech: 'ts · node' },
  { name: 'audit-report-generator', tech: 'angular · node · sql · aws' },
  { name: 'accident-detection-system', tech: 'rpi · python · mongo · express · angular' }
];

export interface SideProject {
  name: string;
  url: string;
  description: string;
}

export const sideProjects: SideProject[] = [
  {
    name: 'subconscious',
    url: 'https://subconsciousapp.co',
    description: 'subscription tracking — take control of recurring expenses.'
  },
  {
    name: 'spot-the-synth',
    url: 'https://spotthesynth.com',
    description: 'community-driven ai photo spotting and discussion.'
  },
  {
    name: 'ascii-art-gen',
    url: 'https://ascii-art-gen.fly.dev/',
    description: 'generate ascii art from text and images, right in the browser.'
  },
  {
    name: 'the-leon-files',
    url: 'https://theleonfiles.com',
    description: 'fan site — leon kennedy, resident evil.'
  }
];
