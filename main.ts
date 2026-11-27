// Deal Beacon — a black-friday-deal-finder-01 entry (Node 22, standard library
// only). The site lives in app/ as plain static files: index.html plus its
// own CSS and JS modules, with the deals held in app/deals.js. Nothing the
// site runs, styles or shows loads over the network; each deal only links out
// to its store with a plain <a href>.
//
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file into /output and writes /output/dossier.json, the summary
// the judge reads (screenshots, first-load files and bytes, and the source),
// built with the vendored make.fun library. vendor/makefun-frontend.ts must
// stay exactly as the kit shipped it — the scorer rebuilds the dossier with
// its own copy and compares the two byte for byte.
//
// To check it locally:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 16 MiB of app files — app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
const dossier = buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 });
writeFileSync(join(out, 'dossier.json'), dossier);

// Read it straight back as a smoke check: the grader runs this program
// twice and requires byte-identical output, so a write that silently
// truncated would be worse than a loud failure here. buildDossier returns
// bytes (Uint8Array), so compare the read-back bytes, not a string.
const written = (await import('node:fs')).readFileSync(join(out, 'dossier.json'));
if (!written.equals(Buffer.from(dossier))) throw new Error('dossier.json read-back differs from what buildDossier returned');
console.log(`dossier.json OK: ${dossier.length} bytes`);
