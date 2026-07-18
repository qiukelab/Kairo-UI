import type { Locale } from '@/lib/i18n';

export interface HomeCopy {
  badge: string;
  title: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  pills: string[];
  previewHeading: string;
  previewDescription: string;
  featuresHeading: string;
  featuresDescription: string;
  /** Same order as `FEATURE_ICONS` in `components/home-page.tsx`. */
  features: { title: string; description: string }[];
  closingHeading: string;
  closingDescription: string;
  finalCta: string;
}

export const HOME_COPY: Record<Locale, HomeCopy> = {
  en: {
    badge: 'React UI kit · MIT licensed',
    title: 'Build interfaces with Kairo',
    description:
      "Lightweight, accessible React components with a CSS-first theme system. No Tailwind required — just import a stylesheet and go. Built for Next.js App Router and Vite alike.",
    ctaPrimary: 'Get Started',
    ctaSecondary: 'Browse Components',
    pills: ['No Tailwind required', 'Next.js & Vite', 'Light/Dark + 3 presets', 'Built on Base UI'],
    previewHeading: 'See it in action',
    previewDescription:
      'Real components, rendered straight from @kairo-ui/react — variants, sizes and all.',
    featuresHeading: "Everything you need, nothing you don't",
    featuresDescription:
      'Kairo focuses on the fundamentals: small, themeable, accessible components you can drop into any React setup.',
    features: [
      {
        title: 'No Tailwind required',
        description:
          "Ships plain CSS and --kairo-* variables. Drop it into any React app — Tailwind is welcome, but never required.",
      },
      {
        title: 'Full theming, built in',
        description:
          'Light and dark mode plus three presets — Default, Ocean, Sunset — all driven by CSS variables and a tiny setTheme API.',
      },
      {
        title: 'Next.js & Vite ready',
        description:
          "Static components render as zero-JS Server Components in the App Router. Interactive parts carry their own 'use client' boundary. Drops into Vite just as easily.",
      },
      {
        title: 'CSS-first animations',
        description:
          'Transitions and keyframes live in CSS, not a JS animation runtime — smaller bundles, and prefers-reduced-motion is respected out of the box.',
      },
      {
        title: 'Accessible by default',
        description:
          'Interactive components are built on Base UI, giving you correct ARIA semantics, keyboard support and focus management for free.',
      },
      {
        title: 'Tree-shakeable',
        description:
          'Import from the package root or per-component subpaths like @kairo-ui/react/button — bundlers only ship what you use.',
      },
    ],
    closingHeading: 'Ready to build?',
    closingDescription: 'Install two packages, import one stylesheet, and start composing accessible UI.',
    finalCta: 'Read the docs',
  },
  th: {
    badge: 'React UI kit · ไลเซนส์ MIT',
    title: 'สร้างอินเทอร์เฟซด้วย Kairo',
    description:
      'คอมโพเนนต์ React ที่มีน้ำหนักเบาและเข้าถึงง่าย พร้อมระบบธีมแบบ CSS-first ไม่จำเป็นต้องใช้ Tailwind แค่ import สไตล์ชีตแล้วเริ่มใช้งานได้เลย รองรับทั้ง Next.js App Router และ Vite',
    ctaPrimary: 'เริ่มต้นใช้งาน',
    ctaSecondary: 'ดูคอมโพเนนต์ทั้งหมด',
    pills: ['ไม่ต้องใช้ Tailwind', 'Next.js & Vite', 'โหมดสว่าง/มืด + 3 พรีเซ็ต', 'สร้างบน Base UI'],
    previewHeading: 'ดูการทำงานจริง',
    previewDescription: 'คอมโพเนนต์จริง render ตรงจาก @kairo-ui/react — ครบทั้ง variant และขนาด',
    featuresHeading: 'ครบทุกสิ่งที่ต้องการ ไม่มีสิ่งที่ไม่จำเป็น',
    featuresDescription:
      'Kairo มุ่งเน้นพื้นฐานสำคัญ: คอมโพเนนต์ขนาดเล็ก ปรับธีมได้ เข้าถึงง่าย ที่นำไปวางในโปรเจกต์ React แบบไหนก็ได้',
    features: [
      {
        title: 'ไม่ต้องใช้ Tailwind',
        description:
          'มาพร้อม CSS ธรรมดาและตัวแปร --kairo-* นำไปใช้ในแอป React ไหนก็ได้ — จะใช้ Tailwind ร่วมด้วยก็ได้ แต่ไม่จำเป็น',
      },
      {
        title: 'ระบบธีมครบวงจร',
        description:
          'โหมดสว่าง/มืด พร้อมสามพรีเซ็ต — Default, Ocean, Sunset — ควบคุมด้วย CSS variables และ API ขนาดเล็กอย่าง setTheme',
      },
      {
        title: 'พร้อมใช้กับ Next.js และ Vite',
        description:
          "คอมโพเนนต์แบบ static จะ render เป็น Server Component ที่ไม่มี JS ใน App Router ส่วนคอมโพเนนต์ที่โต้ตอบได้จะมี 'use client' ในตัวเอง ใช้กับ Vite ได้ง่ายพอกัน",
      },
      {
        title: 'แอนิเมชันแบบ CSS-first',
        description:
          'ทรานซิชันและ keyframe อยู่ใน CSS ไม่ใช่ JS animation runtime — bundle เล็กลง และรองรับ prefers-reduced-motion ให้อัตโนมัติ',
      },
      {
        title: 'เข้าถึงง่ายตั้งแต่ต้น',
        description:
          'คอมโพเนนต์ที่โต้ตอบได้สร้างบน Base UI ทำให้ได้ ARIA ที่ถูกต้อง รองรับคีย์บอร์ด และจัดการโฟกัสให้ฟรี',
      },
      {
        title: 'Tree-shakeable',
        description:
          'import จาก package root หรือ subpath ของแต่ละคอมโพเนนต์ เช่น @kairo-ui/react/button — bundler จะรวมเฉพาะส่วนที่ใช้จริง',
      },
    ],
    closingHeading: 'พร้อมเริ่มสร้างหรือยัง',
    closingDescription: 'ติดตั้งสองแพ็กเกจ import สไตล์ชีตหนึ่งไฟล์ แล้วเริ่มประกอบ UI ที่เข้าถึงง่ายได้เลย',
    finalCta: 'อ่านเอกสาร',
  },
};
