'use client';

import { useState } from 'react';
import {
  Slider,
  SliderLabel,
  SliderValue,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
} from '@kairo-ui/react';

/**
 * Interactive demo for the Slider docs page: an uncontrolled slider with a
 * label and value readout, a controlled slider driven by local state, a
 * two-thumb range slider, and a disabled slider.
 */
export function SliderDemo() {
  const [volume, setVolume] = useState(40);

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Slider defaultValue={30}>
        <div className="flex items-center justify-between">
          <SliderLabel>Brightness</SliderLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>

      {/*
        `onValueChange` hands back `number | readonly number[]` because Slider
        also drives multi-thumb ranges — a single-thumb slider has to narrow it
        before it fits a `useState<number>` setter.
      */}
      <Slider
        value={volume}
        onValueChange={(value) => setVolume(typeof value === 'number' ? value : value[0])}
      >
        <div className="flex items-center justify-between">
          <SliderLabel>Volume (controlled)</SliderLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>

      <Slider defaultValue={[20, 80]}>
        <div className="flex items-center justify-between">
          <SliderLabel>Price range</SliderLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb index={0} aria-label="Minimum price" />
            <SliderThumb index={1} aria-label="Maximum price" />
          </SliderTrack>
        </SliderControl>
      </Slider>

      <Slider defaultValue={60} disabled>
        <div className="flex items-center justify-between">
          <SliderLabel>Disabled</SliderLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </div>
  );
}
