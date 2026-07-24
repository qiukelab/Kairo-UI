# Demo copy glossary (EN → TH)

Every user-visible string pulled out of `apps/docs/src/components/demos/*.tsx`
into a per-file `COPY: Record<Locale, ...>` table, with the exact Thai chosen.
MDX translators: mirror these exact strings into the corresponding
`.th.mdx` code samples so the rendered demo and the printed code sample agree.

Not included below (left untouched, not translated):

- prop names, CSS class names, `variant`/`side`/`size` values
- `value=` identifiers used as data keys (e.g. Select/Combobox/RadioGroup/Tabs/Toggle `value` props — `apple`, `pro`, `account`, `light`, …)
- keyboard shortcuts (`Ctrl+C`, `Ctrl+V`)
- the placeholder name `Jane Doe` (proper noun) in `avatar-demo.tsx`

## accordion-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| shipping.trigger | What are the shipping options? | ตัวเลือกการจัดส่งมีอะไรบ้าง |
| shipping.panel | Standard shipping arrives in 3-5 business days. Express shipping arrives the next business day. | จัดส่งแบบมาตรฐานถึงภายใน 3-5 วันทำการ ส่วนจัดส่งด่วนถึงในวันทำการถัดไป |
| returns.trigger | What is the return policy? | นโยบายการคืนสินค้าเป็นอย่างไร |
| returns.panel | Unused items can be returned within 30 days of delivery for a full refund. | สินค้าที่ยังไม่ได้ใช้งานสามารถคืนได้ภายใน 30 วันหลังจัดส่ง รับเงินคืนเต็มจำนวน |
| support.trigger | Priority support (unavailable on this plan) | ซัพพอร์ตแบบเร่งด่วน (ไม่พร้อมใช้งานในแพ็กเกจนี้) |
| support.panel | Upgrade to a paid plan to unlock priority support. | อัปเกรดเป็นแพ็กเกจเสียเงินเพื่อปลดล็อกซัพพอร์ตแบบเร่งด่วน |

## alert-dialog-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| trigger | Delete account | ลบบัญชี |
| title | Delete account? | ลบบัญชีใช่ไหม |
| description | This will permanently delete your account and all of its data. This action cannot be undone. | การดำเนินการนี้จะลบบัญชีของคุณและข้อมูลทั้งหมดอย่างถาวร ไม่สามารถย้อนกลับได้ |
| cancel | Cancel | ยกเลิก |
| delete | Delete | ลบ |

## avatar-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| simulateBroken | Simulate a broken image URL (falls back to initials) | จำลอง URL รูปภาพที่เสีย (ตกกลับไปแสดงอักษรย่อ) |

## checkbox-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| defaultAria (aria-label) | Default (uncontrolled) | ค่าเริ่มต้น (ไม่ควบคุม) |
| default | Default | ค่าเริ่มต้น |
| controlledAria (aria-label) | Controlled | ควบคุมด้วยสถานะ |
| controlled | Controlled | ควบคุมด้วยสถานะ |
| checkedWord | checked | เลือกอยู่ |
| uncheckedWord | unchecked | ไม่ได้เลือก |
| indeterminateAria (aria-label) | Indeterminate | ไม่ระบุสถานะ |
| indeterminate | Indeterminate | ไม่ระบุสถานะ |
| disabledAria (aria-label) | Disabled | ปิดใช้งาน |
| disabled | Disabled | ปิดใช้งาน |

## collapsible-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| free.trigger | What's included in the free plan? | แพ็กเกจฟรีมีอะไรให้บ้าง |
| free.panel | Unlimited projects, up to 3 collaborators, and community support. Upgrade any time to unlock more seats and priority support. | โปรเจกต์ไม่จำกัด ผู้ร่วมงานได้สูงสุด 3 คน และซัพพอร์ตจากคอมมูนิตี้ อัปเกรดได้ทุกเมื่อเพื่อปลดล็อกที่นั่งเพิ่มและซัพพอร์ตแบบเร่งด่วน |
| cancelAnytime.trigger | Can I cancel at any time? | ยกเลิกได้ทุกเมื่อไหม |
| cancelAnytime.panel | Yes — cancel from your account settings and you'll keep access until the end of the current billing period. | ได้ — ยกเลิกได้จากหน้าตั้งค่าบัญชี และคุณจะยังใช้งานได้จนถึงสิ้นสุดรอบบิลปัจจุบัน |
| enterprise.trigger | Enterprise plan (coming soon) | แพ็กเกจ Enterprise (เร็วๆ นี้) |
| enterprise.panel | Not yet available. | ยังไม่พร้อมให้บริการ |

## combobox-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| apple (fruit label) | Apple | แอปเปิล |
| banana (fruit label) | Banana | กล้วย |
| cherry (fruit label) | Cherry | เชอร์รี |
| grape (fruit label) | Grape | องุ่น |
| orange (fruit label) | Orange | ส้ม |
| ariaFruit (aria-label) | Fruit | ผลไม้ |
| ariaFruitControlled (aria-label) | Fruit (controlled) | ผลไม้ (ควบคุมด้วยสถานะ) |
| ariaFruitGrouped (aria-label) | Fruit (grouped) | ผลไม้ (จัดกลุ่ม) |
| searchPlaceholder | Search fruit… | ค้นหาผลไม้… |
| pickPlaceholder | Pick a fruit | เลือกผลไม้ |
| citrus (group label) | Citrus | ตระกูลส้ม |
| selectedLabel | Selected | เลือกแล้ว |
| noneLabel | none | ไม่มี |

Note: `value=` on each `ComboboxItem`/fruit object stays `apple`/`banana`/`cherry`/`grape`/`orange`.

## context-menu-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| triggerArea | Right-click (or long-press on touch) this area to open the menu | คลิกขวา (หรือกดค้างบนหน้าจอสัมผัส) บริเวณนี้เพื่อเปิดเมนู |
| copy | Copy | คัดลอก |
| paste | Paste | วาง |
| delete | Delete | ลบ |
| more (group label) | More | เพิ่มเติม |
| rename | Rename | เปลี่ยนชื่อ |

Keyboard shortcuts `Ctrl+C` / `Ctrl+V` are unchanged in both locales.

## dialog-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| trigger | Edit profile | แก้ไขโปรไฟล์ |
| title | Edit profile | แก้ไขโปรไฟล์ |
| description | Make changes to your profile here. Click save when you're done. | แก้ไขข้อมูลโปรไฟล์ของคุณที่นี่ แล้วกดบันทึกเมื่อเสร็จ |
| cancel | Cancel | ยกเลิก |
| save | Save changes | บันทึกการเปลี่ยนแปลง |

## drawer-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| sideLabel.top | top | บน |
| sideLabel.right | right | ขวา |
| sideLabel.bottom | bottom | ล่าง |
| sideLabel.left | left | ซ้าย |
| description(label) | This panel is pinned to the {label} edge and slides in from there. | แผงนี้ถูกปักไว้ที่ขอบด้าน{label} และเลื่อนเข้ามาจากด้านนั้น |
| close | Close | ปิด |

Trigger/title text is `capitalize(sideLabel)` + " drawer" in English (e.g. "Top drawer"); in Thai it's `capitalize(sideLabel)` + " drawer" with the Thai side word (e.g. "บน drawer" — `capitalize` is a no-op on Thai text). The `side` prop passed to `<Drawer>` stays the English data key (`top`/`right`/`bottom`/`left`).

## field-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| emailLabel | Email | อีเมล |
| emailDescription | We'll only use this to send a receipt. | เราจะใช้อีเมลนี้เพื่อส่งใบเสร็จเท่านั้น |
| emailPlaceholder | you@example.com | you@example.com |
| usernameLabel | Username (required) | ชื่อผู้ใช้ (จำเป็นต้องกรอก) |
| usernameError | Please enter a username. | กรุณากรอกชื่อผู้ใช้ |
| disabledLabel | Email (disabled) | อีเมล (ปิดใช้งาน) |

`emailPlaceholder` is left untranslated on purpose: `you@example.com` is a reserved example address, not prose.

## fieldset-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| legend | Shipping address | ที่อยู่จัดส่ง |
| disabledLegend | Shipping address (disabled) | ที่อยู่จัดส่ง (ปิดใช้งาน) |
| name | Full name | ชื่อ-นามสกุล |
| email | Email | อีเมล |
| emailDescription | We'll only use this to send delivery updates. | เราจะใช้อีเมลนี้เพื่อแจ้งสถานะการจัดส่งเท่านั้น |

## form-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| emailLabel | Email | อีเมล |
| emailTaken | That email is already registered. | อีเมลนี้ถูกใช้ลงทะเบียนไปแล้ว |
| submit | Create account | สร้างบัญชี |
| checking | Checking… | กำลังตรวจสอบ… |
| success | Account created! | สร้างบัญชีสำเร็จ! |

`taken@example.com` is the reserved address the demo's fake server rejects — a data key, not prose, so it stays as-is in both locales.

## menu-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| file | File | ไฟล์ |
| newFile | New file | สร้างไฟล์ใหม่ |
| rename | Rename | เปลี่ยนชื่อ |
| delete | Delete | ลบ |
| wordWrap | Word wrap | ตัดคำอัตโนมัติ |
| theme (group label) | Theme | ธีม |
| light | Light | สว่าง |
| dark | Dark | มืด |
| system | System | ตามระบบ |
| share | Share | แชร์ |
| email | Email | อีเมล |
| copyLink | Copy link | คัดลอกลิงก์ |
| openMenu | Open menu | เปิดเมนู |
| closeMenu | Close menu | ปิดเมนู |
| profile | Profile | โปรไฟล์ |
| settings | Settings | ตั้งค่า |
| signOut | Sign out | ออกจากระบบ |
| openLabel | Open | เปิดอยู่ |
| trueWord | true | ใช่ |
| falseWord | false | ไม่ใช่ |

Note: `value=` on `MenuRadioItem` stays `light`/`dark`/`system`.

## motion-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| addButton | Add 137 | เพิ่ม 137 |
| revealText | I animate in the first time I scroll into view. | ฉันจะเคลื่อนไหวเข้ามาในครั้งแรกที่เลื่อนเข้ามาในมุมมอง |

## number-field-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| quantityUncontrolled | Quantity (uncontrolled) | จำนวน (ไม่ควบคุม) |
| quantityControlled | Quantity (controlled) | จำนวน (ควบคุมด้วยสถานะ) |
| quantityDisabled | Quantity (disabled) | จำนวน (ปิดใช้งาน) |
| decrease (aria-label) | Decrease quantity | ลดจำนวน |
| increase (aria-label) | Increase quantity | เพิ่มจำนวน |
| quantityAria (aria-label) | Quantity | จำนวน |
| valueLabel | Value | ค่า |

## popover-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| trigger | Share | แชร์ |
| title | Share this document | แชร์เอกสารนี้ |
| description | Anyone with the link will be able to view this. | ทุกคนที่มีลิงก์นี้จะสามารถดูเอกสารนี้ได้ |
| done | Done | เสร็จสิ้น |

## radio-group-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| planUncontrolledAria (aria-label) | Plan (uncontrolled) | แพ็กเกจ (ไม่ควบคุม) |
| planControlledAria (aria-label) | Plan (controlled) | แพ็กเกจ (ควบคุมด้วยสถานะ) |
| planOneDisabledAria (aria-label) | Plan (one option disabled) | แพ็กเกจ (ตัวเลือกหนึ่งปิดใช้งาน) |
| planDisabledGroupAria (aria-label) | Plan (disabled group) | แพ็กเกจ (กลุ่มปิดใช้งาน) |
| free | Free | ฟรี |
| pro | Pro | โปร |
| team | Team | ทีม |
| proUnavailable | Pro (unavailable) | โปร (ไม่พร้อมใช้งาน) |
| selectedLabel | Selected | เลือกแล้ว |

Note: `value=` on each `Radio` stays `free`/`pro`/`team`, and the "Selected:" readout in the controlled example shows the raw state value (e.g. `pro`) unchanged in both locales, since it displays the data key itself rather than a label.

## select-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| apple (fruit label) | Apple | แอปเปิล |
| banana (fruit label) | Banana | กล้วย |
| grape (fruit label) | Grape | องุ่น |
| orange (fruit label) | Orange | ส้ม |
| ariaFruit (aria-label) | Fruit | ผลไม้ |
| ariaFruitControlled (aria-label) | Fruit (controlled) | ผลไม้ (ควบคุมด้วยสถานะ) |
| placeholder | Select a fruit | เลือกผลไม้ |
| citrus (group label) | Citrus | ตระกูลส้ม |
| selectedLabel | Selected | เลือกแล้ว |
| noneLabel | none | ไม่มี |

Note: `value=` on each `SelectItem`/fruit object stays `apple`/`banana`/`grape`/`orange`.

## slider-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| brightness | Brightness | ความสว่าง |
| volumeControlled | Volume (controlled) | ระดับเสียง (ควบคุมด้วยสถานะ) |
| priceRange | Price range | ช่วงราคา |
| disabled | Disabled | ปิดใช้งาน |
| minPrice (aria-label) | Minimum price | ราคาต่ำสุด |
| maxPrice (aria-label) | Maximum price | ราคาสูงสุด |

## switch-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| defaultAria (aria-label) | Default (uncontrolled) | ค่าเริ่มต้น (ไม่ควบคุม) |
| default | Default | ค่าเริ่มต้น |
| controlledAria (aria-label) | Controlled | ควบคุมด้วยสถานะ |
| controlled | Controlled | ควบคุมด้วยสถานะ |
| onWord | on | เปิด |
| offWord | off | ปิด |
| disabledAria (aria-label) | Disabled | ปิดใช้งาน |
| disabled | Disabled | ปิดใช้งาน |

## tabs-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| account | Account | บัญชี |
| password | Password | รหัสผ่าน |
| team | Team | ทีม |
| accountPanel | Update your account details here. | อัปเดตรายละเอียดบัญชีของคุณที่นี่ |
| passwordPanel | Change your password here. | เปลี่ยนรหัสผ่านของคุณที่นี่ |
| teamPanel | Manage your team members here. | จัดการสมาชิกในทีมของคุณที่นี่ |

Note: `value=` on each `Tab`/`TabPanel` stays `account`/`password`/`team`.

## toast-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| button | Show toast | แสดง toast |
| title (toast title) | Saved | บันทึกแล้ว |
| description (toast description) | Your changes have been saved. | บันทึกการเปลี่ยนแปลงของคุณเรียบร้อยแล้ว |

## toggle-group-demo.tsx

`ToggleDemo`:

| Key | English | Thai |
| --- | --- | --- |
| toggle.defaultAria (aria-label) | Default (uncontrolled) | ค่าเริ่มต้น (ไม่ควบคุม) |
| toggle.bold | Bold | ตัวหนา |
| toggle.controlledAria (aria-label) | Controlled | ควบคุมด้วยสถานะ |
| toggle.on | On | เปิด |
| toggle.off | Off | ปิด |
| toggle.disabledAria (aria-label) | Disabled | ปิดใช้งาน |
| toggle.disabled | Disabled | ปิดใช้งาน |

`ToggleGroupSingleDemo`:

| Key | English | Thai |
| --- | --- | --- |
| single.groupAria (aria-label) | Text alignment | การจัดตำแหน่งข้อความ |
| single.left (aria-label) | Align left | จัดชิดซ้าย |
| single.center (aria-label) | Align center | จัดกึ่งกลาง |
| single.right (aria-label) | Align right | จัดชิดขวา |

Note: `value=` on each `Toggle` stays `left`/`center`/`right`.

`ToggleGroupMultipleDemo`:

| Key | English | Thai |
| --- | --- | --- |
| multiple.groupAria (aria-label) | Text formatting | การจัดรูปแบบข้อความ |
| multiple.bold (aria-label) | Bold | ตัวหนา |
| multiple.italic (aria-label) | Italic | ตัวเอียง |
| multiple.underline (aria-label) | Underline | ขีดเส้นใต้ |

Note: `value=` on each `Toggle` stays `bold`/`italic`/`underline`.

`ToggleIconDemo`:

| Key | English | Thai |
| --- | --- | --- |
| icon.favorite (aria-label) | Save to favorites | บันทึกลงรายการโปรด |

## tooltip-demo.tsx

| Key | English | Thai |
| --- | --- | --- |
| topLabel | Top (default) | บน (ค่าเริ่มต้น) |
| bottomLabel | Bottom | ล่าง |
| rightLabel | Right | ขวา |
| savedContent (tooltip content) | Saved to your library | บันทึกลงคลังของคุณแล้ว |
| deleteContent (tooltip content) | Deletes this item permanently | ลบรายการนี้อย่างถาวร |
| newTabContent (tooltip content) | Opens in a new tab | เปิดในแท็บใหม่ |
