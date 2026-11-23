import { describe, expect, test } from 'bun:test';
import { lazyBatch, lazyExtent, lazyNear, lazyPitch, lazyReach } from '../src/lazy-items';

describe('lazily drawn rows and items', () => {
  test('a row\'s pitch is first its offset over the drawn count, then its movement per item', () => {
    expect(lazyPitch(null, 8, 2048, 'x')).toBe(256);
    expect(lazyPitch({ count: 8, at: 2048 }, 14, 3584, 'x')).toBe(256);
  });

  test('a page\'s rows wait for two counts: content above them is not their pitch', () => {
    expect(lazyPitch(null, 3, 1800, 'y')).toBeUndefined();
    expect(lazyPitch({ count: 3, at: 1800 }, 5, 2600, 'y')).toBe(400);
    expect(lazyPitch({ count: 3, at: 1800 }, 3, 1800, 'y')).toBeUndefined();
  });

  test('the spacer holds the undrawn items, guessed until a pitch is known', () => {
    expect(lazyExtent(10, 256, 0)).toBe(2560);
    expect(lazyExtent(4, 0, 300)).toBe(1200);
    expect(lazyExtent(4, 0, 0)).toBe(1);
  });

  test('reach: a row draws ahead only while it is itself near the screen', () => {
    const screen = { width: 1920, height: 1080 };
    expect(lazyNear('y', { x: 0, y: 2000, height: 10 }, screen, 1)).toBe(true);
    expect(lazyNear('y', { x: 0, y: 2300, height: 10 }, screen, 1)).toBe(false);
    expect(lazyNear('x', { x: 3000, y: 500, height: 300 }, screen, 1)).toBe(true);
    expect(lazyNear('x', { x: 4000, y: 500, height: 300 }, screen, 1)).toBe(false);
    expect(lazyNear('x', { x: 1000, y: 3000, height: 300 }, screen, 1)).toBe(false);
  });
});

describe('drawing ahead while scrolling and while still', () => {
  test('a moving scroll draws only what it is about to reach; a still one draws further ahead', () => {
    expect(lazyReach('y', true, false)).toBe(2);
    expect(lazyReach('x', true, false)).toBe(1.5);
    expect(lazyReach('y', false, false)).toBe(2);
    expect(lazyReach('x', false, false)).toBe(1.5);
    expect(lazyReach('y', false, true)).toBe(1);
  });

  test('still-time drawing comes in small pieces', () => {
    expect(lazyBatch('y', 2, true)).toBe(2);
    expect(lazyBatch('y', 2, false)).toBe(1);
    expect(lazyBatch('x', 6, false)).toBe(3);
    expect(lazyBatch('x', 1, false)).toBe(1);
  });
});
