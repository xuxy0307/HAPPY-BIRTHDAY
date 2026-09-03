'use client';

import { FormEvent, TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, BookHeart, ChevronLeft, ChevronRight, Gift, ImagePlus, Languages, LockKeyhole, Music2, PenLine, Plus, Sparkles, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Language = 'zh' | 'th';
type JournalEntry = { id: string; date: string; titleZh: string; titleTh: string; contentZh: string; contentTh: string; images: string[] };
type PageToolContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => object }, options: { signal: AbortSignal }) => void | Promise<void> };
const STORAGE_KEY = 'winnoe-birthday-journal-v1';
const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const copy = {
  zh: {
    musicOn: '关闭音乐', musicOff: '播放音乐', musicError: '音乐暂时无法播放，请再试一次。', heroKicker: '今天的快乐加载中', heroTitle: 'name，生日快乐！', heroBody: '五位毛茸茸的快乐特派员，带着彩虹和姐姐的爱来报到。',
    steps: [
      { title: '准备好接收生日惊喜了吗？', body: '点击按钮，让今天变成一场只为你举办的彩虹派对。', button: '开启生日派对' },
      { title: '第一份祝福：被爱包围', body: '愿你永远有人惦记、有人撑腰，也永远拥有选择快乐的勇气。', button: '接住彩虹星星' },
      { title: '收集三颗彩虹星', body: '找到画面里的三颗星星，每一颗都藏着姐姐想对你说的话。', button: '' },
      { title: '闭上眼睛，许个愿吧', body: '愿望不必告诉任何人，轻轻吹灭蜡烛，它会替你保守秘密。', button: '吹灭蜡烛' },
      { title: '今天和每一天，都要快乐', body: '愿你不只生日快乐，也在每个普通日子里被温柔接住。', button: '翻开我们的日记' },
    ],
    starFound: '已收集', starUnit: '颗星', starNotes: ['第一颗：愿你自在地做自己。', '第二颗：愿所有真心都有回应。', '第三颗：愿好运总在转角等你。'],
    wishMade: '愿望已经被彩虹悄悄收藏。', scrollHint: '继续向下，是姐姐写给你的日记', journal: '姐妹日记', chapter: '写给妹妹的每一天', journalIntro: '一页生日祝福，和以后许多个值得记住的日子。',
    previous: '上一页', next: '下一页', page: '页', manage: 'winnoe · 管理', add: '写下今天', birthdayTitle: '亲爱的 name，生日快乐呀',
    birthdayBody: ['我们或许不会每天都把肉麻的话挂在嘴边，但姐姐想让你知道，不管你又长大几岁，你永远都是我想护着、想偏心，也想一直为你加油的妹妹。', '愿新的一岁对你温柔一点：遇见善良的人，做真正喜欢的事，也有足够的勇气选择让自己开心的生活。', '累了就休息，难过了就回来，姐姐一直都在。'],
    birthdayQuote: '愿你不只是今天快乐，而是在许多个普通的日子里，也能发现值得开心的小事。', sign: '永远爱你的姐姐', diaryHint: '往后的日子，也会一页一页写进这里。', emptyPhoto: '这一页，留给下一次见面的照片。',
    dialogTitle: '写下今天', dialogDescription: '内容保存在当前浏览器中，用来演示日记新增与翻页。', date: '日期', titleZh: '中文标题', titleTh: '泰文标题（可选）', contentZh: '中文内容', contentTh: '泰文内容（可选）', photos: '照片（最多 3 张）', cancel: '取消', save: '保存这一页', needContent: '请至少写下一段中文或泰文内容。', saved: '今天的回忆已经放进日记本了。', wrongCode: '口令不对，这本日记只给 winnoe 编辑。', adminReady: '管理模式已开启。', secret: '输入 winnoe 的演示管理口令', fortuneLabel: '拆一份好运', fortunes: ['今天会收到一个意料之外的好消息。', '被爱包围，也是今天的超能力。', '想做的事情，会在合适的时候开花。'], photoAlt: '日记照片',
  },
  th: {
    musicOn: 'ปิดเพลง', musicOff: 'เปิดเพลง', musicError: 'ยังเล่นเพลงไม่ได้ กรุณาลองอีกครั้ง', heroKicker: 'กำลังโหลดความสุขของวันนี้', heroTitle: 'สุขสันต์วันเกิดนะ name!', heroBody: 'ทูตแห่งความสุขขนฟูทั้งห้ามาพร้อมสายรุ้งและความรักจากพี่สาว',
    steps: [
      { title: 'พร้อมรับเซอร์ไพรส์วันเกิดหรือยัง?', body: 'แตะปุ่มแล้วให้วันนี้กลายเป็นปาร์ตี้สายรุ้งที่จัดขึ้นเพื่อเธอคนเดียว', button: 'เริ่มปาร์ตี้วันเกิด' },
      { title: 'คำอวยพรแรก: ขอให้รายล้อมด้วยความรัก', body: 'ขอให้มีคนคิดถึง คอยอยู่ข้าง ๆ และมีความกล้าที่จะเลือกความสุขให้ตัวเองเสมอ', button: 'เก็บดาวสายรุ้ง' },
      { title: 'เก็บดาวสายรุ้งให้ครบสามดวง', body: 'ตามหาดาวสามดวงบนหน้าจอ แต่ละดวงมีคำที่พี่อยากบอกเธอซ่อนอยู่', button: '' },
      { title: 'หลับตาแล้วอธิษฐานนะ', body: 'ไม่ต้องบอกใคร เพียงเป่าเทียนเบา ๆ แล้วมันจะช่วยเก็บความลับให้เธอ', button: 'เป่าเทียน' },
      { title: 'ขอให้มีความสุขทั้งวันนี้และทุกวัน', body: 'ไม่ใช่แค่วันเกิด แต่ขอให้ทุกวันธรรมดาโอบกอดเธอไว้อย่างอ่อนโยน', button: 'เปิดบันทึกของเรา' },
    ],
    starFound: 'เก็บแล้ว', starUnit: 'ดวง', starNotes: ['ดวงแรก: ขอให้เป็นตัวเองได้อย่างอิสระ', 'ดวงที่สอง: ขอให้ทุกความจริงใจได้รับการตอบรับ', 'ดวงที่สาม: ขอให้โชคดีรออยู่ตรงทุกหัวมุม'],
    wishMade: 'สายรุ้งเก็บคำอธิษฐานของเธอไว้แล้ว', scrollHint: 'เลื่อนลงไปอ่านบันทึกที่พี่เขียนถึงเธอ', journal: 'บันทึกของสองพี่น้อง', chapter: 'ถึงน้องสาวของพี่ ในทุก ๆ วัน', journalIntro: 'หนึ่งหน้าสำหรับคำอวยพรวันเกิด และอีกหลายหน้าสำหรับวันธรรมดาที่ควรจดจำ',
    previous: 'หน้าก่อน', next: 'หน้าถัดไป', page: 'หน้า', manage: 'winnoe · จัดการ', add: 'เขียนบันทึกวันนี้', birthdayTitle: 'ถึง name ที่รัก สุขสันต์วันเกิดนะ',
    birthdayBody: ['เราอาจไม่ได้พูดคำหวานกันทุกวัน แต่พี่อยากให้รู้ว่า ไม่ว่าเธอจะโตขึ้นอีกกี่ปี เธอก็ยังเป็นน้องสาวคนสำคัญที่พี่อยากปกป้อง อยากตามใจ และคอยเป็นกำลังใจให้อยู่เสมอ', 'ขอให้ปีใหม่นี้ของชีวิตใจดีกับเธอ ให้เธอได้พบเจอคนดี ๆ ได้ทำสิ่งที่รัก และมีความกล้ามากพอที่จะเลือกชีวิตที่ทำให้ตัวเองมีความสุข', 'วันที่เหนื่อยก็พัก วันที่เสียใจก็กลับมา พี่ยังอยู่ตรงนี้เสมอ'],
    birthdayQuote: 'ขอให้ไม่ใช่แค่วันนี้ที่มีความสุข แต่ในทุกวันธรรมดา ก็ยังมีเรื่องเล็ก ๆ ที่ทำให้เธอยิ้มได้', sign: 'จากพี่สาวที่รักเธอเสมอ', diaryHint: 'จากวันนี้ เรื่องราวของเราจะค่อย ๆ ถูกเขียนเพิ่มทีละหน้า', emptyPhoto: 'หน้านี้เก็บไว้สำหรับภาพถ่ายในครั้งต่อไปที่เราได้เจอกัน',
    dialogTitle: 'เขียนบันทึกวันนี้', dialogDescription: 'ข้อมูลจะถูกเก็บไว้ในเบราว์เซอร์นี้ เพื่อสาธิตการเพิ่มและพลิกหน้าบันทึก', date: 'วันที่', titleZh: 'ชื่อเรื่องภาษาจีน', titleTh: 'ชื่อเรื่องภาษาไทย (ไม่บังคับ)', contentZh: 'เนื้อหาภาษาจีน', contentTh: 'เนื้อหาภาษาไทย (ไม่บังคับ)', photos: 'รูปภาพ (สูงสุด 3 รูป)', cancel: 'ยกเลิก', save: 'เก็บหน้านี้ไว้', needContent: 'กรุณาเขียนข้อความภาษาจีนหรือภาษาไทยอย่างน้อยหนึ่งย่อหน้า', saved: 'บันทึกของวันนี้ถูกเก็บไว้แล้ว', wrongCode: 'รหัสไม่ถูกต้อง บันทึกเล่มนี้แก้ไขได้โดย winnoe เท่านั้น', adminReady: 'เปิดโหมดจัดการแล้ว', secret: 'กรอกรหัสสาธิตสำหรับ winnoe', fortuneLabel: 'เปิดกล่องโชคดี', fortunes: ['วันนี้เธอจะได้รับข่าวดีที่คาดไม่ถึง', 'การถูกรักคือพลังวิเศษของเธอในวันนี้', 'สิ่งที่อยากทำจะผลิบานเมื่อถึงเวลาที่เหมาะสม'], photoAlt: 'รูปภาพในบันทึก',
  },
} as const;

const dogs = [
  { src: `${PUBLIC_BASE_PATH}/dogs/pomeranian-party.png`, zh: '橙色博美快乐特派员', th: 'ปอมเมอเรเนียนสีส้ม' },
  { src: `${PUBLIC_BASE_PATH}/dogs/chihuahua-rainbow.png`, zh: '白色吉娃娃彩虹特派员', th: 'ชิวาวาขาวผูกโบสายรุ้ง' },
  { src: `${PUBLIC_BASE_PATH}/dogs/merle-dog.png`, zh: '蓝陨石牧羊犬快乐特派员', th: 'สุนัขเมิร์ลสีฟ้าทูตแห่งความสุข' },
  { src: `${PUBLIC_BASE_PATH}/dogs/puppy-rainbow.png`, zh: '彩虹项链小狗特派员', th: 'ลูกชิวาวาจี้สายรุ้ง' },
  { src: `${PUBLIC_BASE_PATH}/dogs/gray-puppy.png`, zh: '灰色生日帽小狗特派员', th: 'ลูกสุนัขสีเทาสวมหมวกวันเกิด' },
];

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onerror = () => reject(new Error('read error'));
    reader.onload = () => { const image = new Image(); image.onerror = () => reject(new Error('image error')); image.onload = () => { const scale = Math.min(1, 1200 / Math.max(image.width, image.height)); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', .78)); }; image.src = String(reader.result); };
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('zh');
  const [celebrationStep, setCelebrationStep] = useState(0);
  const [starsFound, setStarsFound] = useState<number[]>([]);
  const [candleOut, setCandleOut] = useState(false);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [notice, setNotice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageBusy, setImageBusy] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), titleZh: '', titleTh: '', contentZh: '', contentTh: '' });
  const journalRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = copy[language];

  useEffect(() => { document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'th'; }, [language]);
  useEffect(() => { try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) setEntries(JSON.parse(stored) as JournalEntry[]); } catch { /* remain readable */ } }, []);
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const allEntries = useMemo<(JournalEntry & { birthday?: boolean })[]>(() => [{ id: 'birthday-letter', date: '', titleZh: copy.zh.birthdayTitle, titleTh: copy.th.birthdayTitle, contentZh: copy.zh.birthdayBody.join('\n\n'), contentTh: copy.th.birthdayBody.join('\n\n'), images: [], birthday: true }, ...entries], [entries]);
  const current = allEntries[page] ?? allEntries[0];

  useEffect(() => {
    const context = (document as Document & { modelContext?: PageToolContext }).modelContext; if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name: 'open_journal_page', title: 'Open a journal page', description: 'Scroll to the birthday journal and open a visible page by one-based page number.', inputSchema: { type: 'object', properties: { pageNumber: { type: 'integer', minimum: 1, maximum: allEntries.length } }, required: ['pageNumber'], additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute(input: unknown) { const pageNumber = (input as { pageNumber?: unknown })?.pageNumber; if (!Number.isInteger(pageNumber) || Number(pageNumber) < 1 || Number(pageNumber) > allEntries.length) throw new Error('Invalid journal page number'); setPage(Number(pageNumber) - 1); journalRef.current?.scrollIntoView({ behavior: 'smooth' }); return { opened: true, pageNumber, totalPages: allEntries.length }; } }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [allEntries.length]);

  function showNotice(message: string) { setNotice(message); window.setTimeout(() => setNotice(''), 3200); }
  function advanceCelebration() { if (celebrationStep === 1) setCelebrationStep(2); else if (celebrationStep === 4) journalRef.current?.scrollIntoView({ behavior: 'smooth' }); else setCelebrationStep((value) => Math.min(value + 1, 4)); }
  function collectStar(index: number) { if (starsFound.includes(index)) return; const next = [...starsFound, index]; setStarsFound(next); showNotice(t.starNotes[index]); if (next.length === 3) window.setTimeout(() => setCelebrationStep(3), 650); }
  function blowCandle() { if (candleOut) return; setCandleOut(true); showNotice(t.wishMade); window.setTimeout(() => setCelebrationStep(4), 900); }
  function scrollToJournal() { journalRef.current?.scrollIntoView({ behavior: 'smooth' }); }
  function changePage(delta: number) { setDirection(delta > 0 ? 'next' : 'previous'); setPage((value) => Math.min(Math.max(value + delta, 0), allEntries.length - 1)); }
  function requestAdmin() { if (isAdmin) { setEditorOpen(true); return; } const code = window.prompt(t.secret); if (code?.trim().toLowerCase() === 'winnoe') { setIsAdmin(true); showNotice(t.adminReady); setEditorOpen(true); } else if (code !== null) showNotice(t.wrongCode); }
  async function handleImages(files: FileList | null) { if (!files) return; setImageBusy(true); try { setImages(await Promise.all(Array.from(files).slice(0, 3).map(resizeImage))); } finally { setImageBusy(false); } }
  function saveEntry(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!form.contentZh.trim() && !form.contentTh.trim()) { showNotice(t.needContent); return; } const next = [...entries, { id: crypto.randomUUID(), ...form, images }]; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setEntries(next); setPage(next.length); setDirection('next'); setEditorOpen(false); setImages([]); setForm({ date: new Date().toISOString().slice(0, 10), titleZh: '', titleTh: '', contentZh: '', contentTh: '' }); showNotice(t.saved); } catch { showNotice(language === 'zh' ? '照片较大，请减少照片后再试。' : 'รูปภาพมีขนาดใหญ่เกินไป กรุณาลดจำนวนรูปแล้วลองอีกครั้ง'); } }
  async function toggleMusic() { const audio = audioRef.current; if (!audio) return; if (isMusicPlaying) { audio.pause(); setIsMusicPlaying(false); return; } audio.volume = .24; try { await audio.play(); setIsMusicPlaying(true); } catch { setIsMusicPlaying(false); showNotice(t.musicError); } }
  function onTouchStart(event: TouchEvent<HTMLDivElement>) { touchStart.current = event.touches[0]?.clientX ?? null; }
  function onTouchEnd(event: TouchEvent<HTMLDivElement>) { if (touchStart.current === null) return; const distance = touchStart.current - (event.changedTouches[0]?.clientX ?? touchStart.current); if (Math.abs(distance) > 55) changePage(distance > 0 ? 1 : -1); touchStart.current = null; }
  function openFortune() { showNotice(t.fortunes[Math.floor(Math.random() * t.fortunes.length)]); }

  const entryTitle = language === 'zh' ? current.titleZh || current.titleTh : current.titleTh || current.titleZh;
  const entryContent = language === 'zh' ? current.contentZh || current.contentTh : current.contentTh || current.contentZh;
  const formattedDate = current.date ? new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'th-TH', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${current.date}T12:00:00`)) : language === 'zh' ? '生日特别篇' : 'ฉบับพิเศษวันเกิด';
  const stepCopy = t.steps[celebrationStep];

  return (
    <main className="site-shell">
      <audio ref={audioRef} src={`${PUBLIC_BASE_PATH}/audio/kawaii-fifth.mp3`} loop preload="metadata" />
      <header className="topbar">
        <button className="wordmark" onClick={scrollToJournal}><Sparkles aria-hidden="true" /><span>name&apos;s rainbow day</span></button>
        <div className="top-actions">
          <button className="icon-action" onClick={toggleMusic} aria-label={isMusicPlaying ? t.musicOn : t.musicOff}>{isMusicPlaying ? <Music2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</button>
          <div className="language-switch"><Languages aria-hidden="true" /><button className={language === 'zh' ? 'active' : ''} onClick={() => setLanguage('zh')} aria-pressed={language === 'zh'}>中</button><span>/</span><button className={language === 'th' ? 'active' : ''} onClick={() => setLanguage('th')} aria-pressed={language === 'th'}>ไทย</button></div>
        </div>
      </header>

      <section className={`birthday-hero celebration-step-${celebrationStep}`} aria-labelledby="birthday-title">
        <div className="rainbow-orbit" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        {celebrationStep > 0 && <div className="confetti-field" aria-hidden="true">{Array.from({ length: 28 }).map((_, index) => <i key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${-(index % 9) * .33}s` }} />)}</div>}
        <div className="dog-gang" aria-label={language === 'zh' ? '五只小狗动画角色' : 'ตัวละครสุนัขทั้งห้า'}>
          {dogs.map((dog, index) => <figure className={`dog-character dog-${index + 1}`} key={dog.src}><img src={dog.src} alt={language === 'zh' ? dog.zh : dog.th} /><figcaption>{language === 'zh' ? dog.zh : dog.th}</figcaption></figure>)}
        </div>
        {celebrationStep === 2 && <div className="star-hunt">{[0, 1, 2].map((index) => <button key={index} className={`collect-star star-${index + 1} ${starsFound.includes(index) ? 'is-found' : ''}`} onClick={() => collectStar(index)} aria-label={`${t.starFound} ${index + 1}`}><span>★</span></button>)}</div>}
        <div className="hero-copy">
          <p className="eyebrow">{t.heroKicker}</p>
          <h1 id="birthday-title">{t.heroTitle}</h1>
          <p className="hero-body">{celebrationStep === 0 ? t.heroBody : stepCopy.body}</p>
          <div className="interaction-card" aria-live="polite">
            <span className="step-number">0{celebrationStep + 1}</span>
            <h2>{stepCopy.title}</h2>
            {celebrationStep === 2 ? <div className="star-progress"><span>{t.starFound} {starsFound.length} / 3 {t.starUnit}</span><i style={{ width: `${starsFound.length / 3 * 100}%` }} /></div> : celebrationStep === 3 ? <button className={`candle-interaction ${candleOut ? 'is-out' : ''}`} onClick={blowCandle}><span aria-hidden="true">{candleOut ? '✦' : '🕯️'}</span><strong>{stepCopy.button}</strong></button> : <Button className="party-button" onClick={advanceCelebration}>{celebrationStep === 4 ? <BookHeart aria-hidden="true" /> : <Sparkles aria-hidden="true" />}{stepCopy.button}</Button>}
          </div>
        </div>
        <button className="scroll-cue" onClick={scrollToJournal}><span>{t.scrollHint}</span><ArrowDown aria-hidden="true" /></button>
      </section>

      <section className="journal-section" id="journal" ref={journalRef} aria-labelledby="journal-heading">
        <div className="journal-heading-row"><div><p className="eyebrow">{t.journal}</p><h2 id="journal-heading">{t.chapter}</h2><p>{t.journalIntro}</p></div><button className="admin-link" onClick={requestAdmin}>{isAdmin ? <PenLine aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}{isAdmin ? t.add : t.manage}</button></div>
        <div className="book-wrap">
          <div className={`book book-turn-${direction}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <span className="cover-layer cover-layer-one" aria-hidden="true" /><span className="cover-layer cover-layer-two" aria-hidden="true" />
            <div className="binding" aria-hidden="true">{Array.from({ length: 7 }).map((_, index) => <i key={index} />)}</div>
            <article className="paper paper-left" key={`${current.id}-left`}>
              <div className="paper-topline"><span>{formattedDate}</span><span>NO. {String(page + 1).padStart(2, '0')}</span></div>
              <div className="entry-copy"><BookHeart className="entry-mark" aria-hidden="true" /><h3>{entryTitle}</h3>{entryContent.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><span className="paper-page">{page * 2 + 1}</span>
            </article>
            <article className="paper paper-right" key={`${current.id}-right`}>
              {current.birthday ? <div className="quote-page"><span className="rainbow-sticker" aria-hidden="true">🌈</span><blockquote>“{t.birthdayQuote}”</blockquote><div className="signature"><span>{t.sign}</span><strong>winnoe</strong></div><p className="diary-hint">{t.diaryHint}</p><img className="page-dog" src="/dogs/puppy-rainbow.png" alt="" /></div> : current.images.length ? <div className={`photo-grid photos-${Math.min(current.images.length, 3)}`}>{current.images.map((source, index) => <figure key={source.slice(-28)}><img src={source} alt={`${t.photoAlt} ${index + 1}`} /></figure>)}</div> : <div className="empty-photo"><Sparkles aria-hidden="true" /><p>{t.emptyPhoto}</p></div>}
              <span className="paper-page">{page * 2 + 2}</span>
            </article>
            <span className="ribbon" aria-hidden="true" />
          </div>
        </div>
        <nav className="page-controls" aria-label={t.journal}><Button variant="ghost" onClick={() => changePage(-1)} disabled={page === 0}><ChevronLeft aria-hidden="true" />{t.previous}</Button><div className="page-status"><span>{t.page} {page + 1} / {allEntries.length}</span><button className="fortune-button" onClick={openFortune} aria-label={t.fortuneLabel}><Gift aria-hidden="true" /></button></div><Button variant="ghost" onClick={() => changePage(1)} disabled={page === allEntries.length - 1}>{t.next}<ChevronRight aria-hidden="true" /></Button></nav>
        {isAdmin && <Button className="floating-add" onClick={() => setEditorOpen(true)}><Plus aria-hidden="true" />{t.add}</Button>}
      </section>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}><DialogContent className="editor-dialog sm:max-w-2xl"><DialogHeader><DialogTitle>{t.dialogTitle}</DialogTitle><DialogDescription>{t.dialogDescription}</DialogDescription></DialogHeader><form id="journal-form" className="editor-form" onSubmit={saveEntry}>
        <div className="field full-field"><Label htmlFor="entry-date">{t.date}</Label><Input id="entry-date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></div>
        <div className="field"><Label htmlFor="title-zh">{t.titleZh}</Label><Input id="title-zh" value={form.titleZh} onChange={(event) => setForm({ ...form, titleZh: event.target.value })} /></div><div className="field"><Label htmlFor="title-th">{t.titleTh}</Label><Input id="title-th" value={form.titleTh} onChange={(event) => setForm({ ...form, titleTh: event.target.value })} /></div>
        <div className="field"><Label htmlFor="content-zh">{t.contentZh}</Label><Textarea id="content-zh" rows={6} value={form.contentZh} onChange={(event) => setForm({ ...form, contentZh: event.target.value })} /></div><div className="field"><Label htmlFor="content-th">{t.contentTh}</Label><Textarea id="content-th" rows={6} value={form.contentTh} onChange={(event) => setForm({ ...form, contentTh: event.target.value })} /></div>
        <div className="field full-field"><Label className="upload-control" htmlFor="entry-images"><ImagePlus aria-hidden="true" /><span>{imageBusy ? '…' : t.photos}</span></Label><Input id="entry-images" className="sr-only" type="file" accept="image/*" multiple onChange={(event) => void handleImages(event.target.files)} />{images.length > 0 && <div className="image-preview">{images.map((source) => <img key={source.slice(-24)} src={source} alt={t.photoAlt} />)}</div>}</div>
      </form><DialogFooter><Button type="button" variant="ghost" onClick={() => setEditorOpen(false)}>{t.cancel}</Button><Button type="submit" form="journal-form" disabled={imageBusy}><PenLine aria-hidden="true" />{t.save}</Button></DialogFooter></DialogContent></Dialog>
      {notice && <output className="toast" aria-live="polite">{notice}</output>}
    </main>
  );
}
