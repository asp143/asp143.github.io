import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { getContentFileEntries } from './content-files.mjs';

test('matches Astro glob-loader content IDs', () => {
  const contentDir = mkdtempSync(join(tmpdir(), 'content-files-'));

  try {
    mkdirSync(join(contentDir, 'Dir Name'), { recursive: true });
    mkdirSync(join(contentDir, 'Nested'), { recursive: true });
    writeFileSync(join(contentDir, 'Simple Name.md'), '---\ntitle: Simple\n---\n');
    writeFileSync(join(contentDir, 'Dir Name', 'index.md'), '---\ntitle: Index\n---\n');
    writeFileSync(join(contentDir, 'Nested', 'C++.md'), '---\ntitle: C++\n---\n');
    writeFileSync(
      join(contentDir, 'override.md'),
      '---\ntitle: Override\nslug: custom/path\ntags:\n  - one\n---\n'
    );

    const entries = getContentFileEntries(contentDir);
    assert.deepEqual(
      entries.map(({ slug }) => slug).sort(),
      ['custom/path', 'dir-name', 'nested/c', 'simple-name']
    );
    assert.deepEqual(
      entries.find(({ slug }) => slug === 'custom/path')?.frontmatter.tags,
      ['one']
    );
  } finally {
    rmSync(contentDir, { recursive: true, force: true });
  }
});
