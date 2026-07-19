'use client';

import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
} from '@kairo-ui/react';

/**
 * Interactive demo for the Accordion docs page: three FAQ-style sections
 * (one disabled), open one at a time, with the first expanded by default.
 */
export function AccordionDemo() {
  return (
    <Accordion defaultValue={['shipping']} className="w-full max-w-md">
      <AccordionItem value="shipping">
        <AccordionHeader>
          <AccordionTrigger>What are the shipping options?</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          Standard shipping arrives in 3-5 business days. Express shipping arrives
          the next business day.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionHeader>
          <AccordionTrigger>What is the return policy?</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          Unused items can be returned within 30 days of delivery for a full refund.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="support" disabled>
        <AccordionHeader>
          <AccordionTrigger>Priority support (unavailable on this plan)</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>Upgrade to a paid plan to unlock priority support.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
