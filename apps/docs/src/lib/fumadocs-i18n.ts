import type { Translations } from 'fumadocs-ui/i18n';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { i18n } from '@/lib/i18n';

/**
 * Thai strings for every stock Fumadocs UI chrome string: the search dialog,
 * table-of-contents ("On this page" / "No Headings"), pagination, "Edit on
 * GitHub", "Last updated on", the 404 page, theme/language switcher
 * aria-labels, sidebar/menu aria-labels, code-block copy buttons, and the
 * page-action ("Copy Markdown" / "Open in …") popover.
 *
 * English is left out entirely — `defineI18nUI` falls back to Fumadocs' own
 * built-in English defaults for any locale without an entry here (see
 * `provider()`'s usage in `routes/__root.tsx`).
 *
 * Voice matches `lib/home-copy.ts`'s `th` block and the demo-copy glossary in
 * `components/demos/DEMO_COPY.th.md` (e.g. "ปิดใช้งาน", never
 * "ปิดการใช้งาน"). Product/API names stay in English: Kairo, GitHub, ChatGPT,
 * Claude, Cursor, Scira AI, Markdown.
 */
const th: Translations = {
  displayName: 'ไทย',

  // Search dialog / trigger
  'Search(search dialog)': 'ค้นหา',
  'Search(search trigger)': 'ค้นหา',
  'Open Search(search trigger)(aria-label)': 'เปิดการค้นหา',
  'Close Search(search dialog)(aria-label)': 'ปิดการค้นหา',
  'No results found(search dialog)': 'ไม่พบผลลัพธ์',

  // Table of contents
  'On this page(table of contents)': 'ในหน้านี้',
  'No Headings(table of contents)': 'ไม่มีหัวข้อในหน้านี้',
  'Table of Contents(inline table of contents)': 'สารบัญ',

  // Pagination
  'Next Page(pagination)': 'หน้าถัดไป',
  'Previous Page(pagination)': 'หน้าก่อนหน้า',

  // Edit page / page footer
  'Edit on GitHub(edit page)': 'แก้ไขบน GitHub',
  'Last updated on(page footer)': 'อัปเดตล่าสุดเมื่อ',

  // Theme switcher
  'Light(theme switcher)(aria-label)': 'สว่าง',
  'Dark(theme switcher)(aria-label)': 'มืด',
  'System(theme switcher)(aria-label)': 'ตามระบบ',
  'Toggle Theme(theme switcher)(aria-label)': 'สลับธีม',

  // Language switcher
  'Choose a language(language switcher)': 'เลือกภาษา',
  'Choose a language(language switcher)(aria-label)': 'เลือกภาษา',

  // Sidebar / mobile menu
  'Open Sidebar(sidebar)(aria-label)': 'เปิดเมนูนำทาง',
  'Close Sidebar(sidebar)(aria-label)': 'ปิดเมนูนำทาง',
  'Collapse Sidebar(sidebar)(aria-label)': 'ย่อเมนูนำทาง',
  'Toggle Menu(mobile menu)(aria-label)': 'สลับเมนู',

  // Banner
  'Close Banner(banner)(aria-label)': 'ปิดแบนเนอร์',

  // Code block / heading anchor / accordion copy buttons
  'Copy Text(code block)(aria-label)': 'คัดลอกข้อความ',
  'Copied Text(code block)(aria-label)': 'คัดลอกข้อความแล้ว',
  'Copy Anchor Link(heading anchor)(aria-label)': 'คัดลอกลิงก์หัวข้อ',
  'Copy Link(accordion)(aria-label)': 'คัดลอกลิงก์',

  // Page actions (copy-as-markdown / open-in-AI popover)
  'Copy Markdown(page actions)': 'คัดลอก Markdown',
  'View as Markdown(page actions)': 'ดูในรูปแบบ Markdown',
  'Open(page actions)': 'เปิด',
  'Open in GitHub(page actions)': 'เปิดใน GitHub',
  'Open in ChatGPT(page actions)': 'เปิดใน ChatGPT',
  'Open in Claude(page actions)': 'เปิดใน Claude',
  'Open in Cursor(page actions)': 'เปิดใน Cursor',
  'Open in Scira AI(page actions)': 'เปิดใน Scira AI',
  'Read {url}, I want to ask questions about it.(page actions)': 'อ่าน {url} ฉันมีคำถามเกี่ยวกับเนื้อหานี้',

  // 404 page
  'Page Not Found(404 page)': 'ไม่พบหน้านี้',
  'Back to Home(404 page)': 'กลับหน้าแรก',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)':
    'หน้าที่คุณกำลังค้นหาอาจถูกลบ เปลี่ยนชื่อ หรือไม่พร้อมใช้งานชั่วคราว',

  // Type table (API reference tables) — these name API contracts, so they stay
  // English on Thai pages too, matching the hand-written prop tables' English
  // headers (Prop | Type | Default | Description, per the Phase 8.7 convention).
  // Fumadocs' <TypeTable> isn't used today; the identity mapping keeps it
  // consistent with those tables if it ever is.
  'Prop(type table)': 'Prop',
  'Type(type table)': 'Type',
  'Default(type table)': 'Default',
  'Parameters(type table)': 'Parameters',
  'Returns(type table)': 'Returns',
};

export const fumadocsI18n = defineI18nUI(i18n, { th });
