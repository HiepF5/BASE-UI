// ============================================================
// Unit Tests – Logger (Phase 5 – Quality)
// Tests: logger.debug/info/warn/error, configure, addHandler, child
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    logger.reset();
    logger.configure({ enabled: true, minLevel: 'debug', structured: false });
  });

  it('logs at all levels', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('test debug');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('respects minLevel', () => {
    logger.configure({ minLevel: 'warn' });
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logger.debug('should not log');
    logger.warn('should log');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();

    debugSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('does not log when disabled', () => {
    logger.configure({ enabled: false });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('should not log');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('calls custom handlers', () => {
    const handler = vi.fn();
    logger.addHandler(handler);

    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test', { key: 'val' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        message: 'test',
        data: { key: 'val' },
      }),
    );
    spy.mockRestore();
  });

  it('removes handler via dispose function', () => {
    const handler = vi.fn();
    const dispose = logger.addHandler(handler);

    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('first');
    expect(handler).toHaveBeenCalledTimes(1);

    dispose();
    logger.info('second');
    expect(handler).toHaveBeenCalledTimes(1); // not called again

    spy.mockRestore();
  });

  it('structured mode outputs JSON', () => {
    logger.configure({ structured: true });
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test msg');

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('"level":"info"'));
    spy.mockRestore();
  });

  describe('child logger', () => {
    it('prefixes messages', () => {
      const child = logger.child('MyModule');
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      child.warn('something happened');

      expect(spy).toHaveBeenCalledWith(expect.stringContaining('[MyModule] something happened'));
      spy.mockRestore();
    });
  });
});
