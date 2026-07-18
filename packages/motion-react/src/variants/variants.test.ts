import { describe, expect, it } from 'vitest';
import { variants } from './variants';

describe('variants', () => {
  it('exports fade, slideUp, slideDown and scale', () => {
    expect(Object.keys(variants).sort()).toEqual(['fade', 'scale', 'slideDown', 'slideUp']);
  });

  it('each variant has hidden and visible states', () => {
    for (const variant of Object.values(variants)) {
      expect(variant).toHaveProperty('hidden');
      expect(variant).toHaveProperty('visible');
    }
  });

  it('fades between opacity 0 and 1', () => {
    expect(variants.fade.hidden).toEqual({ opacity: 0 });
    expect(variants.fade.visible).toMatchObject({ opacity: 1 });
  });

  it('slideUp animates from below (positive y) to y: 0', () => {
    expect(variants.slideUp.hidden).toEqual({ opacity: 0, y: 16 });
    expect(variants.slideUp.visible).toMatchObject({ opacity: 1, y: 0 });
  });

  it('slideDown animates from above (negative y) to y: 0', () => {
    expect(variants.slideDown.hidden).toEqual({ opacity: 0, y: -16 });
    expect(variants.slideDown.visible).toMatchObject({ opacity: 1, y: 0 });
  });

  it('scale animates from a smaller scale to scale: 1', () => {
    expect(variants.scale.hidden).toEqual({ opacity: 0, scale: 0.95 });
    expect(variants.scale.visible).toMatchObject({ opacity: 1, scale: 1 });
  });

  it('uses transitions.normal by default for the visible state', () => {
    expect(variants.fade.visible).toMatchObject({
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    });
  });
});
