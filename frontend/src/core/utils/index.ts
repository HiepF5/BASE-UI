import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { QueryOptions, FilterGroup, FilterCondition } from '@/types';

// ── Class name merge (CVA-friendly) ─────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ── Date helpers ─────────────────────────────────────────────
export function formatDate(dateStr: string | Date, fmt = 'dd/MM/yyyy HH:mm'): string {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isValid(d) ? format(d, fmt) : '—';
}

export function formatRelative(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true, locale: vi }) : '—';
}

// ── Debounce ─────────────────────────────────────────────────
export function debounce<T extends (...args: any[]) => any>(fn: T, ms = 300) {
  let timerId: ReturnType<typeof setTimeout>;
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
}

// ── Query string builder (for CRUD API) ─────────────────────
export function buildQueryString(opts: QueryOptions): string {
  const params = new URLSearchParams();

  if (opts.page)  params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));

  if (opts.sort?.length) {
    params.set('sort', opts.sort.map((s) => `${s.field}:${s.direction}`).join(','));
  }

  if (opts.search) params.set('search', opts.search);

  if (opts.include?.length) {
    params.set('include', opts.include.join(','));
  }

  if (opts.select?.length) {
    params.set('select', opts.select.join(','));
  }

  if (opts.filter) {
    params.set('filter', JSON.stringify(opts.filter));
  }

  return params.toString();
}

// ── Filter AST helpers ──────────────────────────────────────
export function createEmptyFilter(): FilterGroup {
  return { logic: 'AND', conditions: [] };
}

export function createCondition(field: string, operator = 'eq' as const, value: any = ''): FilterCondition {
  return { field, operator, value };
}

export function isFilterGroup(node: any): node is FilterGroup {
  return node && 'logic' in node && 'conditions' in node;
}

export function isFilterEmpty(group: FilterGroup): boolean {
  return group.conditions.length === 0;
}

// ── String helpers ──────────────────────────────────────────
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pluralize(str: string): string {
  if (str.endsWith('s')) return str;
  if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
  return str + 's';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Number helpers ──────────────────────────────────────────
export function formatNumber(n: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale).format(n);
}

// ── Deep clone (structuredClone fallback) ───────────────────
export function deepClone<T>(obj: T): T {
  if (typeof structuredClone === 'function') return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

// ── Sleep (for loading demo) ────────────────────────────────
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
