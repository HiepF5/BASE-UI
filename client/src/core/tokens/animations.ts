/**
 * Animation & Transition Tokens
 *
 * Consistent timing cho mọi interaction.
 */

export const transition = {
  /** Instant feedback: hover, focus */
  fast: '0.1s ease',
  /** Default transitions: color, opacity */
  base: '0.15s ease',
  /** Content transitions: expand, slide */
  slow: '0.3s ease',
  /** Page transitions */
  slower: '0.5s ease',
} as const;

export const animation = {
  /** Slide in from top (dropdown, toast) */
  slideIn: {
    keyframes: {
      from: { transform: 'translateY(-8px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    duration: '0.2s',
    timing: 'ease-out',
  },
  /** Fade in (modals, overlays) */
  fadeIn: {
    keyframes: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    duration: '0.15s',
    timing: 'ease-out',
  },
  /** Scale in (popover, tooltip) */
  scaleIn: {
    keyframes: {
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    duration: '0.15s',
    timing: 'ease-out',
  },
  /** Slide in from right (drawer) */
  slideInRight: {
    keyframes: {
      from: { transform: 'translateX(100%)' },
      to: { transform: 'translateX(0)' },
    },
    duration: '0.3s',
    timing: 'ease-out',
  },
  /** Spin (loading spinner) */
  spin: {
    keyframes: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    duration: '1s',
    timing: 'linear',
  },
} as const;

export type TransitionToken = keyof typeof transition;
export type AnimationToken = keyof typeof animation;
