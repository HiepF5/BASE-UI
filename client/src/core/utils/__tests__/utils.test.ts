// ============================================================
// Unit Tests – Core Utils (Phase 5 – Quality)
// Tests: cn, formatDate, formatDateTime, truncate, debounce, buildQueryString
// ============================================================

import { describe, it, expect, vi } from 'vitest';
import { cn, formatDate, formatDateTime, truncate, debounce, buildQueryString } from '../index';

// ─── cn (class merge) ────────────────────────────────────────

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('deduplicates Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles undefined/null', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b');
  });

  it('handles empty args', () => {
    expect(cn()).toBe('');
  });
});

// ─── formatDate ──────────────────────────────────────────────

describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2024-06-15');
    expect(result).toBeTruthy();
    // Should contain 2024, 06, 15 in some format
    expect(result).toContain('2024');
  });

  it('formats Date object', () => {
    const result = formatDate(new Date('2024-01-01'));
    expect(result).toBeTruthy();
  });
});

// ─── formatDateTime ──────────────────────────────────────────

describe('formatDateTime', () => {
  it('formats date-time string', () => {
    const result = formatDateTime('2024-06-15T10:30:00Z');
    expect(result).toBeTruthy();
    expect(result).toContain('2024');
  });
});

// ─── truncate ────────────────────────────────────────────────

describe('truncate', () => {
  it('truncates long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('does not truncate short text', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
});

// ─── debounce ────────────────────────────────────────────────

describe('debounce', () => {
  it('debounces function calls', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('a');
    debounced('b');
    debounced('c');

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');

    vi.useRealTimers();
  });

  it('allows call after debounce period', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced('first');
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledWith('first');

    debounced('second');
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledWith('second');
    expect(fn).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

// ─── buildQueryString ────────────────────────────────────────

describe('buildQueryString', () => {
  it('builds simple params', () => {
    const qs = buildQueryString({ page: 1, limit: 20 });
    expect(qs).toContain('page=1');
    expect(qs).toContain('limit=20');
  });

  it('skips undefined and null values', () => {
    const qs = buildQueryString({ a: 'val', b: undefined, c: null, d: '' });
    expect(qs).toBe('a=val');
  });

  it('serializes objects as JSON', () => {
    const qs = buildQueryString({ filter: { field: 'name' } });
    expect(qs).toContain('filter=');
    // Should be JSON encoded
    const decoded = decodeURIComponent(qs.split('filter=')[1]);
    expect(JSON.parse(decoded)).toEqual({ field: 'name' });
  });

  it('handles empty params', () => {
    expect(buildQueryString({})).toBe('');
  });
});
