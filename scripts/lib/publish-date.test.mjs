import assert from 'node:assert/strict';
import test from 'node:test';
import { isPublishablePubDate } from './publish-date.mjs';

const now = Date.parse('2026-10-14T00:15:00Z');

test('past date is publishable', () => {
  assert.equal(isPublishablePubDate('2026-10-13', now), true);
});

test('today is publishable at 00:15 UTC', () => {
  assert.equal(isPublishablePubDate('2026-10-14', now), true);
});

test('future date is not publishable', () => {
  assert.equal(isPublishablePubDate('2026-10-15', now), false);
});

test('missing date is publishable', () => {
  assert.equal(isPublishablePubDate(undefined, now), true);
});

test('unparseable date is publishable', () => {
  assert.equal(isPublishablePubDate('garbage', now), true);
});
