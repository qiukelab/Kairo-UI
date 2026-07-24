'use client';

import {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
  Input,
} from '@kairo-ui/react';
import type { Locale } from '@/lib/i18n';
import { useDemoCopy } from './use-demo-locale';

interface FieldCopy {
  emailLabel: string;
  emailDescription: string;
  emailPlaceholder: string;
  usernameLabel: string;
  usernameError: string;
  disabledLabel: string;
}

const COPY: Record<Locale, FieldCopy> = {
  en: {
    emailLabel: 'Email',
    emailDescription: "We'll only use this to send a receipt.",
    emailPlaceholder: 'you@example.com',
    usernameLabel: 'Username (required)',
    usernameError: 'Please enter a username.',
    disabledLabel: 'Email (disabled)',
  },
  th: {
    emailLabel: 'อีเมล',
    emailDescription: 'เราจะใช้อีเมลนี้เพื่อส่งใบเสร็จเท่านั้น',
    emailPlaceholder: 'you@example.com',
    usernameLabel: 'ชื่อผู้ใช้ (จำเป็นต้องกรอก)',
    usernameError: 'กรุณากรอกชื่อผู้ใช้',
    disabledLabel: 'อีเมล (ปิดใช้งาน)',
  },
};

/**
 * Interactive demo for the Field docs page: an email field composing Kairo's
 * plain `Input` through `FieldControl`'s `render` prop, a required username
 * field whose error message appears once the control is blurred empty, and a
 * disabled field.
 */
export function FieldDemo() {
  const t = useDemoCopy(COPY);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <Field className="w-64">
        <FieldLabel>{t.emailLabel}</FieldLabel>
        <FieldControl render={<Input type="email" placeholder={t.emailPlaceholder} />} />
        <FieldDescription>{t.emailDescription}</FieldDescription>
      </Field>

      <Field
        className="w-64"
        validationMode="onBlur"
        validate={(value) => (value ? null : t.usernameError)}
      >
        <FieldLabel>{t.usernameLabel}</FieldLabel>
        <FieldControl render={<Input required />} />
        <FieldError />
      </Field>

      <Field className="w-64" disabled>
        <FieldLabel>{t.disabledLabel}</FieldLabel>
        <FieldControl render={<Input defaultValue="disabled@example.com" />} />
      </Field>
    </div>
  );
}
