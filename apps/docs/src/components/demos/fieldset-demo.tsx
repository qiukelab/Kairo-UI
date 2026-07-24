'use client';

import {
  Fieldset,
  FieldsetLegend,
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
} from '@kairo-ui/react';
import type { Locale } from '@/lib/i18n';
import { useDemoCopy } from './use-demo-locale';

interface FieldsetCopy {
  legend: string;
  disabledLegend: string;
  name: string;
  email: string;
  emailDescription: string;
}

const COPY: Record<Locale, FieldsetCopy> = {
  en: {
    legend: 'Shipping address',
    disabledLegend: 'Shipping address (disabled)',
    name: 'Full name',
    email: 'Email',
    emailDescription: "We'll only use this to send delivery updates.",
  },
  th: {
    legend: 'ที่อยู่จัดส่ง',
    disabledLegend: 'ที่อยู่จัดส่ง (ปิดใช้งาน)',
    name: 'ชื่อ-นามสกุล',
    email: 'อีเมล',
    emailDescription: 'เราจะใช้อีเมลนี้เพื่อแจ้งสถานะการจัดส่งเท่านั้น',
  },
};

/**
 * Interactive demo for the Fieldset docs page: a `Fieldset` captioned by a
 * `FieldsetLegend` and containing two `Field`s, next to the same fieldset
 * with `disabled` set — showing that a single prop natively disables every
 * control nested inside it.
 */
export function FieldsetDemo() {
  const t = useDemoCopy(COPY);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <Fieldset className="w-full max-w-sm">
        <FieldsetLegend>{t.legend}</FieldsetLegend>
        <Field>
          <FieldLabel>{t.name}</FieldLabel>
          <FieldControl />
        </Field>
        <Field>
          <FieldLabel>{t.email}</FieldLabel>
          <FieldControl type="email" />
          <FieldDescription>{t.emailDescription}</FieldDescription>
        </Field>
      </Fieldset>

      <Fieldset disabled className="w-full max-w-sm">
        <FieldsetLegend>{t.disabledLegend}</FieldsetLegend>
        <Field>
          <FieldLabel>{t.name}</FieldLabel>
          <FieldControl />
        </Field>
        <Field>
          <FieldLabel>{t.email}</FieldLabel>
          <FieldControl type="email" />
        </Field>
      </Fieldset>
    </div>
  );
}
