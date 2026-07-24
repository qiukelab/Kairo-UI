'use client';

import { useState } from 'react';
import { Form, Field, FieldLabel, FieldControl, FieldError, Input, Button } from '@kairo-ui/react';
import type { Locale } from '@/lib/i18n';
import { useDemoCopy } from './use-demo-locale';

interface FormCopy {
  emailLabel: string;
  emailTaken: string;
  submit: string;
  checking: string;
  success: string;
}

const COPY: Record<Locale, FormCopy> = {
  en: {
    emailLabel: 'Email',
    emailTaken: 'That email is already registered.',
    submit: 'Create account',
    checking: 'Checking…',
    success: 'Account created!',
  },
  th: {
    emailLabel: 'อีเมล',
    emailTaken: 'อีเมลนี้ถูกใช้ลงทะเบียนไปแล้ว',
    submit: 'สร้างบัญชี',
    checking: 'กำลังตรวจสอบ…',
    success: 'สร้างบัญชีสำเร็จ!',
  },
};

/**
 * Stands in for a real server round-trip: rejects one reserved address so
 * the demo has something to reject, and accepts everything else.
 */
function checkEmailAvailable(email: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(email.trim().toLowerCase() !== 'taken@example.com'), 400);
  });
}

/**
 * Interactive demo for the Form docs page: a one-field signup form
 * showcasing Form's headline feature — server-side errors. Submitting
 * `taken@example.com` simulates the server rejecting it; `onFormSubmit`
 * hands the rejection back to `errors`, keyed by the `email` field's `name`,
 * and `FieldError` picks it up automatically with no manual wiring.
 */
export function FormDemo() {
  const t = useDemoCopy(COPY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'checking' | 'success'>('idle');

  return (
    <Form
      errors={errors}
      onFormSubmit={async (values) => {
        setStatus('checking');
        const available = await checkEmailAvailable(String(values.email ?? ''));
        if (available) {
          setErrors({});
          setStatus('success');
        } else {
          setErrors({ email: t.emailTaken });
          setStatus('idle');
        }
      }}
      className="flex w-full max-w-sm flex-col items-start gap-4"
    >
      <Field name="email" className="flex w-full flex-col gap-1.5">
        <FieldLabel>{t.emailLabel}</FieldLabel>
        <FieldControl render={<Input type="email" />} required />
        <FieldError />
      </Field>
      <Button type="submit" disabled={status === 'checking'}>
        {status === 'checking' ? t.checking : t.submit}
      </Button>
      {status === 'success' && (
        <p className="text-sm" style={{ color: 'var(--kairo-success)' }}>
          {t.success}
        </p>
      )}
    </Form>
  );
}
