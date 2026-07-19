import type { Locale } from '@/lib/i18n';

export interface HomeCopy {
  /** Left (pinned) pane. */
  badge: string;
  title: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  pills: string[];

  /** Top nav across the scrolling pane. `github` is the emphasised end cap. */
  nav: {
    overview: string;
    docs: string;
    components: string;
    theming: string;
    github: string;
    toggleTheme: string;
    toggleLocale: string;
    togglePreset: string;
    toggleSidebar: string;
    showSidebar: string;
  };

  /** Opening block of the scrolling pane. */
  overviewLabel: string;
  lead: string;
  installLabel: string;
  /** Row of things Kairo is built on, in place of a logo wall we haven't earned. */
  builtOnLabel: string;
  builtOn: string[];

  previewHeading: string;
  previewDescription: string;

  featuresHeading: string;
  featuresDescription: string;
  /** Same order as `FEATURE_ICONS` in `components/home-page.tsx`. */
  features: { title: string; description: string }[];

  themingHeading: string;
  themingDescription: string;
  themingPoints: { title: string; description: string }[];

  closingHeading: string;
  closingDescription: string;
  finalCta: string;
}

/**
 * Display names for the theme presets. The preset *ids* stay English (they are
 * `data-kairo-theme` attribute values) and the library ships only English
 * labels on `themes[]`, but a Thai reader shouldn't have to read "Black" to
 * pick the black theme.
 */
export const PRESET_NAMES: Record<Locale, Record<string, string>> = {
  en: { default: 'Black', blue: 'Blue', pink: 'Pink' },
  th: { default: 'ดำ', blue: 'ฟ้า', pink: 'ชมพู' },
};

/** Package-manager tabs for the install snippet. Locale-independent. */
export const INSTALL_COMMANDS = [
  { id: 'pnpm', command: 'pnpm add @kairo-ui/react @kairo-ui/theme' },
  { id: 'npm', command: 'npm install @kairo-ui/react @kairo-ui/theme' },
  { id: 'yarn', command: 'yarn add @kairo-ui/react @kairo-ui/theme' },
  { id: 'bun', command: 'bun add @kairo-ui/react @kairo-ui/theme' },
] as const;

export const THEMING_SNIPPET = `import '@kairo-ui/theme/styles.css';
import { setPreset, setMode } from '@kairo-ui/theme';

setPreset('pink');   // 'default' | 'blue' | 'pink'
setMode('dark');     // 'light'   | 'dark'

// …or skip the API entirely and override the tokens:
// :root { --kairo-primary: oklch(0.58 0.2 355); }`;

export const HOME_COPY: Record<Locale, HomeCopy> = {
  en: {
    badge: 'React UI kit · MIT licensed',
    title: 'Build interfaces with Kairo',
    description:
      'Lightweight, accessible React components with a CSS-first theme system. No Tailwind required — just import a stylesheet and go. Built for Next.js App Router and Vite alike.',
    ctaPrimary: 'Get Started',
    ctaSecondary: 'Browse Components',
    pills: ['No Tailwind required', 'Next.js & Vite', 'Light/Dark + 3 presets', 'Built on Base UI'],

    nav: {
      overview: 'Overview',
      docs: 'Docs',
      components: 'Components',
      theming: 'Theming',
      github: 'GitHub',
      toggleTheme: 'Toggle light/dark mode',
      toggleLocale: 'Switch language',
      togglePreset: 'Choose theme preset',
      toggleSidebar: 'Toggle navigation menu',
      showSidebar: 'Show sidebar navigation',
    },

    overviewLabel: 'Overview',
    lead: 'UI that stays yours. Fourteen accessible components, plain CSS, and a token system you can re-skin with one variable — from a weekend project to a design system with its own opinions.',
    installLabel: 'Install',
    builtOnLabel: 'Built on',
    builtOn: ['Base UI', 'React 19', 'TypeScript', 'oklch', 'CSS variables', 'ESM'],

    previewHeading: 'See it in action',
    previewDescription:
      'Real components, rendered straight from @kairo-ui/react — variants, sizes and all.',

    featuresHeading: "Everything you need, nothing you don't",
    featuresDescription:
      'Kairo focuses on the fundamentals: small, themeable, accessible components you can drop into any React setup.',
    features: [
      {
        title: 'No Tailwind required.',
        description:
          'Ships plain CSS and --kairo-* variables. Drop it into any React app — Tailwind is welcome, but never required.',
      },
      {
        title: 'Full theming, built in.',
        description:
          'Light and dark mode plus three presets — Black, Blue, Pink — all driven by CSS variables and a tiny setTheme API.',
      },
      {
        title: 'Next.js & Vite ready.',
        description:
          "Static components render as zero-JS Server Components in the App Router. Interactive parts carry their own 'use client' boundary. Drops into Vite just as easily.",
      },
      {
        title: 'CSS-first animations.',
        description:
          'Transitions and keyframes live in CSS, not a JS animation runtime — smaller bundles, and prefers-reduced-motion is respected out of the box.',
      },
      {
        title: 'Accessible by default.',
        description:
          'Interactive components are built on Base UI, giving you correct ARIA semantics, keyboard support and focus management for free.',
      },
      {
        title: 'Tree-shakeable.',
        description:
          'Import from the package root or per-component subpaths like @kairo-ui/react/button — bundlers only ship what you use.',
      },
    ],

    themingHeading: 'Theming',
    themingDescription:
      'Every colour, radius and easing curve is a CSS variable. Change one, change everywhere.',
    themingPoints: [
      {
        title: 'Tokens, not overrides',
        description:
          'Components read --kairo-* variables. You retheme by redefining tokens, never by fighting specificity.',
      },
      {
        title: 'Three presets, or your own',
        description:
          'Black, Blue and Pink ship in the box. A preset is just a block of custom properties — writing a fourth takes minutes.',
      },
      {
        title: 'Light and dark, separately tuned',
        description:
          'Dark mode is not an inversion. Borders brighten and shadows re-tune so elevation still reads on a dark surface.',
      },
      {
        title: 'Contrast held to AA',
        description:
          'Every foreground token is checked against the surface it pairs with, at 4.5:1 or better.',
      },
    ],

    closingHeading: 'Ready to build?',
    closingDescription:
      'Install two packages, import one stylesheet, and start composing accessible UI.',
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

    nav: {
      overview: 'ภาพรวม',
      docs: 'เอกสาร',
      components: 'คอมโพเนนต์',
      theming: 'ธีม',
      github: 'GitHub',
      toggleTheme: 'สลับโหมดสว่าง/มืด',
      toggleLocale: 'เปลี่ยนภาษา',
      togglePreset: 'เลือกชุดสีธีม',
      toggleSidebar: 'สลับเมนูนำทาง',
      showSidebar: 'แสดงเมนูนำทางด้านข้าง',
    },

    overviewLabel: 'ภาพรวม',
    lead: 'UI ที่ยังเป็นของคุณ — คอมโพเนนต์ที่เข้าถึงง่าย 14 ตัว, CSS ธรรมดา และระบบ token ที่เปลี่ยนหน้าตาทั้งระบบได้ด้วยตัวแปรเดียว ตั้งแต่โปรเจกต์เล็กๆ ไปจนถึงดีไซน์ซิสเทมที่มีจุดยืนของตัวเอง',
    installLabel: 'ติดตั้ง',
    builtOnLabel: 'สร้างบน',
    builtOn: ['Base UI', 'React 19', 'TypeScript', 'oklch', 'CSS variables', 'ESM'],

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
          'โหมดสว่าง/มืด พร้อมสามพรีเซ็ต — Black, Blue, Pink — ควบคุมด้วย CSS variables และ API ขนาดเล็กอย่าง setTheme',
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

    themingHeading: 'ระบบธีม',
    themingDescription: 'ทุกสี ทุกความมน ทุกเส้นโค้งการเคลื่อนไหว เป็น CSS variable — แก้ที่เดียวเปลี่ยนทั้งระบบ',
    themingPoints: [
      {
        title: 'ใช้ token ไม่ใช่ override',
        description:
          'คอมโพเนนต์อ่านค่าจากตัวแปร --kairo-* การเปลี่ยนธีมคือการนิยาม token ใหม่ ไม่ใช่การสู้กับ specificity',
      },
      {
        title: 'สามพรีเซ็ต หรือจะเขียนเอง',
        description:
          'Black, Blue, Pink มาให้ในกล่อง พรีเซ็ตหนึ่งตัวคือบล็อกของ custom property เท่านั้น เขียนตัวที่สี่ใช้เวลาไม่กี่นาที',
      },
      {
        title: 'สว่างและมืด ปรับแยกกัน',
        description: 'โหมดมืดไม่ใช่การกลับสี เส้นขอบจะสว่างขึ้นและเงาถูกปรับใหม่ เพื่อให้ระดับความสูงยังอ่านออกบนพื้นมืด',
      },
      {
        title: 'คอนทราสต์ผ่านเกณฑ์ AA',
        description: 'ทุก token ของสีตัวอักษรถูกตรวจกับพื้นผิวที่จับคู่ด้วย ที่อัตราส่วน 4.5:1 ขึ้นไป',
      },
    ],

    closingHeading: 'พร้อมเริ่มสร้างหรือยัง',
    closingDescription: 'ติดตั้งสองแพ็กเกจ import สไตล์ชีตหนึ่งไฟล์ แล้วเริ่มประกอบ UI ที่เข้าถึงง่ายได้เลย',
    finalCta: 'อ่านเอกสาร',
  },
};
