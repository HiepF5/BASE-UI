import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../core/utils';

// ============================================================
// TokenShowcasePage – Visual reference for all Design Tokens
// Week 1: Colors, Typography, Spacing, Shadows, Radius, Theme
// ============================================================

/* ── Color palette data ───────────────────────────────────── */
const colorScales = [
  {
    name: 'Primary',
    prefix: 'primary',
    shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  },
  { name: 'Accent', prefix: 'accent', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Success', prefix: 'success', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Warning', prefix: 'warning', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Danger', prefix: 'danger', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Info', prefix: 'info', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  {
    name: 'Neutral',
    prefix: 'neutral',
    shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  },
];

const semanticColors = [
  { label: 'Primary', var: '--color-primary', tw: 'bg-primary' },
  { label: 'Primary Hover', var: '--color-primary-hover', tw: 'bg-primary-700' },
  { label: 'Primary Light', var: '--color-primary-light', tw: 'bg-primary-50' },
  { label: 'Accent', var: '--color-accent', tw: 'bg-accent' },
  { label: 'Success', var: '--color-success', tw: 'bg-success' },
  { label: 'Warning', var: '--color-warning', tw: 'bg-warning' },
  { label: 'Danger', var: '--color-danger', tw: 'bg-danger' },
  { label: 'Info', var: '--color-info', tw: 'bg-info' },
];

const bgColors = [
  { label: 'Background', var: '--color-bg', tw: 'bg-bg' },
  { label: 'BG Secondary', var: '--color-bg-secondary', tw: 'bg-bg-secondary' },
  { label: 'BG Tertiary', var: '--color-bg-tertiary', tw: 'bg-bg-tertiary' },
  { label: 'BG Elevated', var: '--color-bg-elevated', tw: 'bg-bg-elevated' },
];

const textColors = [
  { label: 'Text', var: '--color-text' },
  { label: 'Text Secondary', var: '--color-text-secondary' },
  { label: 'Text Muted', var: '--color-text-muted' },
  { label: 'Text Inverse', var: '--color-text-inverse' },
];

/* ── Section wrapper ──────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-text border-b border-border pb-2">{title}</h2>
      {children}
    </section>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border bg-bg-elevated p-5', className)}>
      {children}
    </div>
  );
}

/* ── Color Swatch ─────────────────────────────────────────── */
function ColorSwatch({ shade, prefix }: { shade: number; prefix: string }) {
  const varName = `--color-${prefix}-${shade}`;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-10 w-10 rounded-md border border-border shadow-sm"
        style={{ backgroundColor: `var(${varName})` }}
        title={varName}
      />
      <span className="text-[10px] text-text-muted font-mono">{shade}</span>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */
export function TokenShowcasePage() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">🎨 Design Tokens</h1>
          <p className="text-sm text-text-secondary mt-1">
            Week 1 – Tokens + Foundation | Theme:{' '}
            <code className="text-primary font-mono">{theme}</code> →{' '}
            <code className="font-mono">{resolvedTheme}</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md border transition-colors',
              theme === 'light'
                ? 'bg-primary text-text-inverse border-primary'
                : 'border-border text-text-secondary hover:bg-bg-tertiary',
            )}
          >
            ☀️ Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md border transition-colors',
              theme === 'dark'
                ? 'bg-primary text-text-inverse border-primary'
                : 'border-border text-text-secondary hover:bg-bg-tertiary',
            )}
          >
            🌙 Dark
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md border transition-colors',
              theme === 'system'
                ? 'bg-primary text-text-inverse border-primary'
                : 'border-border text-text-secondary hover:bg-bg-tertiary',
            )}
          >
            💻 System
          </button>
        </div>
      </div>

      {/* ── Color Scales ──────────────────────────────────── */}
      <Section title="Color Scales">
        <Card>
          <div className="space-y-5">
            {colorScales.map((scale) => (
              <div key={scale.prefix}>
                <p className="text-sm font-semibold text-text mb-2">{scale.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {scale.shades.map((shade) => (
                    <ColorSwatch key={shade} shade={shade} prefix={scale.prefix} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ── Semantic Colors ───────────────────────────────── */}
      <Section title="Semantic Colors">
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {semanticColors.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-md border border-border shadow-sm shrink-0"
                  style={{ backgroundColor: `var(${c.var})` }}
                />
                <div>
                  <p className="text-sm font-medium text-text">{c.label}</p>
                  <p className="text-[10px] font-mono text-text-muted">{c.var}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ── Background & Text ─────────────────────────────── */}
      <Section title="Background & Text Colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <p className="text-sm font-semibold text-text mb-3">Backgrounds</p>
            <div className="space-y-2">
              {bgColors.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <div
                    className="h-10 w-20 rounded-md border border-border"
                    style={{ backgroundColor: `var(${c.var})` }}
                  />
                  <div>
                    <p className="text-sm text-text">{c.label}</p>
                    <p className="text-[10px] font-mono text-text-muted">{c.var}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-text mb-3">Text Colors</p>
            <div className="space-y-3">
              {textColors.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <div
                    className="h-10 w-20 rounded-md border border-border flex items-center justify-center"
                    style={{
                      backgroundColor: c.label === 'Text Inverse' ? 'var(--color-text)' : undefined,
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: `var(${c.var})` }}>
                      Aa
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-text">{c.label}</p>
                    <p className="text-[10px] font-mono text-text-muted">{c.var}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* ── Typography ────────────────────────────────────── */}
      <Section title="Typography">
        <Card>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-mono text-text-muted mb-2">
                Font: var(--font-sans) – Inter
              </p>
              <p className="font-sans text-text">The quick brown fox jumps over the lazy dog.</p>
            </div>
            <div>
              <p className="text-xs font-mono text-text-muted mb-2">
                Font: var(--font-mono) – JetBrains Mono
              </p>
              <p className="font-mono text-text">const data = await fetch('/api/users');</p>
            </div>
            <hr className="border-border" />
            <p className="text-sm font-semibold text-text">Size Scale</p>
            <div className="space-y-2">
              {[
                { label: 'text-xs', size: '0.75rem', cls: 'text-xs' },
                { label: 'text-sm', size: '0.875rem', cls: 'text-sm' },
                { label: 'text-base', size: '1rem', cls: 'text-base' },
                { label: 'text-lg', size: '1.125rem', cls: 'text-lg' },
                { label: 'text-xl', size: '1.25rem', cls: 'text-xl' },
                { label: 'text-2xl', size: '1.5rem', cls: 'text-2xl' },
                { label: 'text-3xl', size: '1.875rem', cls: 'text-3xl' },
              ].map((t) => (
                <div key={t.label} className="flex items-baseline gap-4">
                  <span className="text-[10px] font-mono text-text-muted w-20 shrink-0">
                    {t.label}
                  </span>
                  <span className={cn(t.cls, 'text-text')}>The quick brown fox</span>
                </div>
              ))}
            </div>
            <hr className="border-border" />
            <p className="text-sm font-semibold text-text">Font Weights</p>
            <div className="flex flex-wrap gap-6">
              {[
                { label: 'Light', cls: 'font-light' },
                { label: 'Normal', cls: 'font-normal' },
                { label: 'Medium', cls: 'font-medium' },
                { label: 'Semibold', cls: 'font-semibold' },
                { label: 'Bold', cls: 'font-bold' },
                { label: 'Extrabold', cls: 'font-extrabold' },
              ].map((w) => (
                <span key={w.label} className={cn('text-base text-text', w.cls)}>
                  {w.label}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </Section>

      {/* ── Spacing ───────────────────────────────────────── */}
      <Section title="Spacing Scale">
        <Card>
          <div className="space-y-2">
            {[
              { label: '0.5 (2px)', cls: 'w-0.5' },
              { label: '1 (4px)', cls: 'w-1' },
              { label: '1.5 (6px)', cls: 'w-1.5' },
              { label: '2 (8px)', cls: 'w-2' },
              { label: '3 (12px)', cls: 'w-3' },
              { label: '4 (16px)', cls: 'w-4' },
              { label: '5 (20px)', cls: 'w-5' },
              { label: '6 (24px)', cls: 'w-6' },
              { label: '8 (32px)', cls: 'w-8' },
              { label: '10 (40px)', cls: 'w-10' },
              { label: '12 (48px)', cls: 'w-12' },
              { label: '16 (64px)', cls: 'w-16' },
              { label: '20 (80px)', cls: 'w-20' },
              { label: '24 (96px)', cls: 'w-24' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-text-muted w-24 shrink-0">
                  {s.label}
                </span>
                <div className={cn('h-3 rounded-sm bg-primary/70', s.cls)} />
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ── Shadows ───────────────────────────────────────── */}
      <Section title="Shadow Scale">
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {[
              { label: 'shadow-xs', cls: 'shadow-xs' },
              { label: 'shadow-sm', cls: 'shadow-sm' },
              { label: 'shadow', cls: 'shadow' },
              { label: 'shadow-md', cls: 'shadow-md' },
              { label: 'shadow-lg', cls: 'shadow-lg' },
              { label: 'shadow-xl', cls: 'shadow-xl' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'h-16 w-16 rounded-lg bg-bg-elevated border border-border/50',
                    s.cls,
                  )}
                />
                <span className="text-[10px] font-mono text-text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ── Border Radius ─────────────────────────────────── */}
      <Section title="Border Radius">
        <Card>
          <div className="flex flex-wrap gap-6">
            {[
              { label: 'rounded-none', cls: 'rounded-none' },
              { label: 'rounded-sm', cls: 'rounded-sm' },
              { label: 'rounded', cls: 'rounded' },
              { label: 'rounded-md', cls: 'rounded-md' },
              { label: 'rounded-lg', cls: 'rounded-lg' },
              { label: 'rounded-xl', cls: 'rounded-xl' },
              { label: 'rounded-2xl', cls: 'rounded-2xl' },
              { label: 'rounded-full', cls: 'rounded-full' },
            ].map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-2">
                <div className={cn('h-14 w-14 bg-primary/80', r.cls)} />
                <span className="text-[10px] font-mono text-text-muted">{r.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ── Animations ────────────────────────────────────── */}
      <Section title="Animations">
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'animate-spin', cls: 'animate-spin' },
              { label: 'animate-pulse', cls: 'animate-pulse' },
              { label: 'animate-bounce', cls: 'animate-bounce' },
              { label: 'animate-fade-in', cls: 'animate-fade-in' },
            ].map((a) => (
              <div key={a.label} className="flex flex-col items-center gap-3">
                <div className={cn('h-12 w-12 rounded-lg bg-accent/80', a.cls)} />
                <span className="text-[10px] font-mono text-text-muted">{a.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ── Z-Index ───────────────────────────────────────── */}
      <Section title="Z-Index Layers">
        <Card>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'dropdown', val: 100 },
              { label: 'sticky', val: 200 },
              { label: 'overlay', val: 300 },
              { label: 'modal', val: 400 },
              { label: 'popover', val: 500 },
              { label: 'toast', val: 600 },
              { label: 'tooltip', val: 700 },
            ].map((z) => (
              <div
                key={z.label}
                className="flex flex-col items-center justify-center rounded-md border border-border bg-bg-tertiary px-4 py-3"
              >
                <span className="text-lg font-bold text-primary">{z.val}</span>
                <span className="text-[10px] font-mono text-text-muted">{z.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>
    </div>
  );
}
