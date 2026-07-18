import { describe, expect, it } from 'vitest';
import { transitions } from './transitions';

describe('transitions', () => {
  it('mirrors --kairo-duration-fast (150ms) and --kairo-ease-standard', () => {
    expect(transitions.fast).toEqual({ duration: 0.15, ease: [0.4, 0, 0.2, 1] });
  });

  it('mirrors --kairo-duration-normal (250ms) and --kairo-ease-standard', () => {
    expect(transitions.normal).toEqual({ duration: 0.25, ease: [0.4, 0, 0.2, 1] });
  });

  it('mirrors --kairo-duration-slow (400ms) and --kairo-ease-standard', () => {
    expect(transitions.slow).toEqual({ duration: 0.4, ease: [0.4, 0, 0.2, 1] });
  });

  it('provides an emphasized spring preset', () => {
    expect(transitions.emphasized).toMatchObject({ type: 'spring' });
    expect(transitions.emphasized).toHaveProperty('stiffness');
    expect(transitions.emphasized).toHaveProperty('damping');
  });
});
