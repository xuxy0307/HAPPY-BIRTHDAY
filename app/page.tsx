'use client';

import { type CSSProperties, TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, BookHeart, ChevronLeft, ChevronRight, Gift, Languages, Music2, Sparkles, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { journalEntries, type JournalEntry } from './journal-data';

type Language = 'zh' | 'th';
type PageToolContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => object }, options: { signal: AbortSignal }) => void | Promise<void> };
const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const copy = {
  zh: {
    musicOn: '关闭音乐', musicOff: '播放音乐', musicError: '音乐暂时无法播放，请再试一次。', heroKicker: '今天的快乐加载中', heroTitle: 'name，祝你快乐，不止生日！', heroBody: '',
    steps: [
      { title: '准备好接收生日惊喜了吗？', body: '点击按钮，让今天变成一场只为你举办的彩虹派对。', button: '开启生日派对' },
      { title: '惊喜其实藏就在身边不起眼的地方', body: '愿你永远有人惦记、有人撑腰，也永远拥有选择快乐的勇气。', button: '寻找彩虹星星' },
      { title: '收集五颗彩虹星，就可以许愿啦~', body: '找到五颗彩虹星星，每一颗都藏着惊喜哦。', button: '' },
      { title: '闭上眼睛，许个愿吧', body: '愿望不必告诉任何人，轻轻吹灭蜡烛，它会替你保守秘密。', button: '吹灭蜡烛' },
      { title: '还有一份礼物等你拆开', body: '愿望已经收好啦。点击礼物，看看是谁来参加你的生日派对。', button: '打开生日礼物' },
    ],
    starFound: '已收集', starUnit: '颗彩虹星', starNotes: ['第一颗：愿你自在地做自己。', '第二颗：愿所有真心都有回应。', '第三颗：愿好运总在转角等你。', '第四颗：愿每次勇敢都带你靠近喜欢的生活。', '第五颗：愿姐姐的爱一直陪在你身边。'],
    wishMade: '愿望已经被彩虹悄悄收藏。', skip: '跳过互动', giftOpening: '小狗们正在赶来…', finalTitle: '五位快乐特派员到齐啦！', finalBody: '五位快乐特派员来咯！', journalButton: '翻开我们的日记', scrollHint: '继续向下，是姐姐写给你的日记', journal: '', chapter: '写给妹妹的每一天', journalIntro: '愿你不只生日快乐，也在每个普通日子里被温柔接住。',
    previous: '上一页', next: '下一页', page: '页', birthdayTitle: '亲爱的 name，生日快乐呀',
    birthdayBody: ['姐姐不会说特别动听的话，不习惯肉麻的话挂在嘴边，但姐姐想让你知道，你是一个很棒的女孩子，又善良、又可爱、又努力、又聪明。', '今天你又长大了一岁，在外面你是一个大孩子，需要勇敢、坚强。但是在姐姐这里，你永远都是个小女孩，我会一直为你加油。', '新的一岁，希望你能遇见善良的人，能够去做真正喜欢的事，也有足够的勇气选择让自己开心的生活。', '要记住，累了就休息，难过了就去吃好吃的，工作要注意劳逸结合，想姐姐就call我，姐姐一直都在滴。', '对了，以后姐姐想你的时候，会把悄悄话写在这里，你有空了就来看哦，我的祝福一定是最长最持久的哈哈！'],
    birthdayQuote: '愿你不只是今天快乐，而是在许多个普通的日子里，也能发现值得开心的小事。', sign: '永远爱你的姐姐', diaryHint: '往后的日子，也会一页一页写进这里。', emptyPhoto: '这一页，留给下一次见面的照片。',
    fortuneLabel: '拆一份好运', fortunes: ['今天会收到一个意料之外的好消息。', '被爱包围，也是今天的超能力。', '想做的事情，会在合适的时候开花。'], photoAlt: '日记照片',
  },
  th: {
    musicOn: 'ปิดเพลง', musicOff: 'เปิดเพลง', musicError: 'ยังเล่นเพลงไม่ได้ กรุณาลองอีกครั้ง', heroKicker: 'กำลังโหลดความสุขของวันนี้', heroTitle: 'name ขอให้มีความสุข ไม่ใช่แค่วันเกิด!', heroBody: '',
    steps: [
      { title: 'พร้อมรับเซอร์ไพรส์วันเกิดหรือยัง?', body: 'แตะปุ่มแล้วให้วันนี้กลายเป็นปาร์ตี้สายรุ้งที่จัดขึ้นเพื่อเธอคนเดียว', button: 'เริ่มปาร์ตี้วันเกิด' },
      { title: 'เซอร์ไพรส์ซ่อนอยู่ในมุมเล็ก ๆ ใกล้ตัวเรา', body: 'ขอให้มีคนคิดถึง คอยอยู่ข้าง ๆ และมีความกล้าที่จะเลือกความสุขให้ตัวเองเสมอ', button: 'ตามหาดาวสายรุ้ง' },
      { title: 'เก็บดาวสายรุ้งให้ครบห้าดวง แล้วก็อธิษฐานได้เลย~', body: 'ตามหาดาวสายรุ้งทั้งห้าดวง แต่ละดวงมีเซอร์ไพรส์ซ่อนอยู่นะ', button: '' },
      { title: 'หลับตาแล้วอธิษฐานนะ', body: 'ไม่ต้องบอกใคร เพียงเป่าเทียนเบา ๆ แล้วมันจะช่วยเก็บความลับให้เธอ', button: 'เป่าเทียน' },
      { title: 'ยังมีของขวัญอีกชิ้นรอให้เปิด', body: 'คำอธิษฐานถูกเก็บไว้อย่างดีแล้ว แตะของขวัญเพื่อดูว่าใครมาร่วมงานวันเกิดของเธอ', button: 'เปิดของขวัญวันเกิด' },
    ],
    starFound: 'เก็บแล้ว', starUnit: 'ดวงสายรุ้ง', starNotes: ['ดวงแรก: ขอให้เป็นตัวเองได้อย่างอิสระ', 'ดวงที่สอง: ขอให้ทุกความจริงใจได้รับการตอบรับ', 'ดวงที่สาม: ขอให้โชคดีรออยู่ตรงทุกหัวมุม', 'ดวงที่สี่: ขอให้ทุกความกล้าพาเธอเข้าใกล้ชีวิตที่ชอบ', 'ดวงที่ห้า: ขอให้ความรักจากพี่อยู่ข้างเธอเสมอ'],
    wishMade: 'สายรุ้งเก็บคำอธิษฐานของเธอไว้แล้ว', skip: 'ข้ามกิจกรรม', giftOpening: 'แก๊งน้องหมากำลังมา…', finalTitle: 'ทูตแห่งความสุขทั้งห้ามาครบแล้ว!', finalBody: 'ทูตแห่งความสุขทั้งห้ามาแล้ว!', journalButton: 'เปิดบันทึกของเรา', scrollHint: 'เลื่อนลงไปอ่านบันทึกที่พี่เขียนถึงเธอ', journal: '', chapter: 'ถึงน้องสาวของพี่ ในทุก ๆ วัน', journalIntro: 'ขอให้เธอมีความสุขไม่ใช่แค่ในวันเกิด แต่ได้รับความอ่อนโยนในทุกวันธรรมดา',
    previous: 'หน้าก่อน', next: 'หน้าถัดไป', page: 'หน้า', birthdayTitle: 'ถึง name ที่รัก สุขสันต์วันเกิดนะ',
    birthdayBody: ['พี่อาจพูดคำเพราะ ๆ ไม่เก่ง และไม่คุ้นกับการพูดอะไรหวานเลี่ยน แต่พี่อยากให้เธอรู้ว่า เธอเป็นผู้หญิงที่ยอดเยี่ยมมาก ทั้งใจดี น่ารัก ขยัน และฉลาด', 'วันนี้เธอโตขึ้นอีกหนึ่งปีแล้ว เมื่ออยู่ข้างนอก เธอเป็นผู้ใหญ่ที่ต้องกล้าหาญและเข้มแข็ง แต่เมื่ออยู่กับพี่ เธอจะเป็นเด็กผู้หญิงตัวน้อยเสมอ พี่จะคอยเป็นกำลังใจให้เธอตลอดไป', 'ในปีใหม่ของชีวิต ขอให้เธอได้พบเจอคนใจดี ได้ทำสิ่งที่ชอบจริง ๆ และมีความกล้ามากพอที่จะเลือกชีวิตที่ทำให้ตัวเองมีความสุข', 'จำไว้นะ เหนื่อยก็พัก เสียใจก็ไปหาอะไรอร่อย ๆ กิน ทำงานก็ต้องรู้จักพักผ่อนให้สมดุล ถ้าคิดถึงพี่ก็โทรมา พี่อยู่ตรงนี้เสมอนะ', 'อ้อ แล้วต่อไปเวลาพี่คิดถึงเธอ พี่จะเขียนคำกระซิบไว้ที่นี่ ว่างเมื่อไรก็แวะมาอ่านนะ คำอวยพรของพี่จะต้องยาวนานและอยู่กับเธอนานที่สุดแน่นอน ฮ่า ๆ!'],
    birthdayQuote: 'ขอให้ไม่ใช่แค่วันนี้ที่มีความสุข แต่ในทุกวันธรรมดา ก็ยังมีเรื่องเล็ก ๆ ที่ทำให้เธอยิ้มได้', sign: 'จากพี่สาวที่รักเธอเสมอ', diaryHint: 'จากวันนี้ เรื่องราวของเราจะค่อย ๆ ถูกเขียนเพิ่มทีละหน้า', emptyPhoto: 'หน้านี้เก็บไว้สำหรับภาพถ่ายในครั้งต่อไปที่เราได้เจอกัน',
    fortuneLabel: 'เปิดกล่องโชคดี', fortunes: ['วันนี้เธอจะได้รับข่าวดีที่คาดไม่ถึง', 'การถูกรักคือพลังวิเศษของเธอในวันนี้', 'สิ่งที่อยากทำจะผลิบานเมื่อถึงเวลาที่เหมาะสม'], photoAlt: 'รูปภาพในบันทึก',
  },
} as const;

const dogs = [
  { src: `${PUBLIC_BASE_PATH}/dogs/pomeranian-party.png`, zh: '橙色博美快乐特派员', th: 'ปอมเมอเรเนียนสีส้ม' },
  { src: `${PUBLIC_BASE_PATH}/dogs/merle-dog.png`, zh: '蓝陨石牧羊犬快乐特派员', th: 'สุนัขเมิร์ลสีฟ้าทูตแห่งความสุข' },
  { src: `${PUBLIC_BASE_PATH}/dogs/chihuahua-rainbow.png`, zh: '白色吉娃娃彩虹特派员', th: 'ชิวาวาขาวผูกโบสายรุ้ง' },
  { src: `${PUBLIC_BASE_PATH}/dogs/gray-puppy.png`, zh: '灰色生日帽小狗特派员', th: 'ลูกสุนัขสีเทาสวมหมวกวันเกิด' },
  { src: `${PUBLIC_BASE_PATH}/dogs/puppy-rainbow.png`, zh: '彩虹项链小狗特派员', th: 'ลูกชิวาวาจี้สายรุ้ง' },
];

const dogMotions = ['stroll', 'sit', 'wag', 'dash', 'hop'] as const;
const dogCutoutCache = new Map<string, Promise<string>>();
type StarPosition = { top: number; left: number; slot: number };
type StarLayout = { rainbow: StarPosition[]; ordinary: StarPosition[] };
const STAR_LAYOUT_STORAGE_KEY = 'birthday-card-last-rainbow-layout';
const DOG_ORDER_STORAGE_KEY = 'birthday-card-last-dog-order';
const starSlots: Omit<StarPosition, 'slot'>[] = [
  { top: 14, left: 7 }, { top: 13, left: 25 }, { top: 15, left: 43 }, { top: 13, left: 62 }, { top: 15, left: 82 },
  { top: 42, left: 5 }, { top: 43, left: 88 },
  { top: 64, left: 7 }, { top: 65, left: 87 },
  { top: 80, left: 20 }, { top: 82, left: 39 }, { top: 80, left: 59 }, { top: 81, left: 78 },
  { top: 31, left: 16 }, { top: 31, left: 79 },
];

function shuffledIndices(length: number) {
  const indices = Array.from({ length }, (_, index) => index);
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]];
  }
  return indices;
}

function starLayoutSignature(layout: StarLayout) {
  return layout.rainbow.map((position) => position.slot).sort((a, b) => a - b).join(',');
}

function createStarLayout(previousSignature = ''): StarLayout {
  let slotOrder = shuffledIndices(starSlots.length);
  for (let attempt = 0; attempt < 12 && slotOrder.slice(0, 5).sort((a, b) => a - b).join(',') === previousSignature; attempt += 1) {
    slotOrder = shuffledIndices(starSlots.length);
  }
  if (previousSignature && slotOrder.slice(0, 5).sort((a, b) => a - b).join(',') === previousSignature) {
    [slotOrder[0], slotOrder[5]] = [slotOrder[5], slotOrder[0]];
  }
  const shuffled = slotOrder.map((slot) => ({
    slot,
    top: starSlots[slot].top + (Math.random() * 4 - 2),
    left: starSlots[slot].left + (Math.random() * 4 - 2),
  }));
  return { rainbow: shuffled.slice(0, 5), ordinary: shuffled.slice(5) };
}

function createDogRevealOrder(previousSignature = '') {
  const previousFirst = previousSignature ? Number(previousSignature.split(',')[0]) : Number.NaN;
  let order = shuffledIndices(dogs.length);
  for (let attempt = 0; attempt < 12 && (order.join(',') === previousSignature || order[0] === previousFirst); attempt += 1) {
    order = shuffledIndices(dogs.length);
  }
  if (Number.isInteger(previousFirst) && order[0] === previousFirst) {
    const differentIndex = order.findIndex((dogIndex) => dogIndex !== previousFirst);
    [order[0], order[differentIndex]] = [order[differentIndex], order[0]];
  }
  return order;
}

function readStoredSequence(key: string) {
  try { return window.localStorage.getItem(key) ?? ''; }
  catch { return ''; }
}

function storeSequence(key: string, value: string) {
  try { window.localStorage.setItem(key, value); }
  catch { /* Randomization still works when browser storage is unavailable. */ }
}

function createDogCutout(source: string) {
  const cached = dogCutoutCache.get(source);
  if (cached) return cached;

  const cutout = new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 900 / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) { reject(new Error('Canvas is unavailable')); return; }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      const imageData = context.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      const corners = [0, width - 1, (height - 1) * width, height * width - 1];
      const background = corners.reduce((total, index) => {
        const offset = index * 4;
        total[0] += pixels[offset]; total[1] += pixels[offset + 1]; total[2] += pixels[offset + 2];
        return total;
      }, [0, 0, 0]).map((value) => value / corners.length);
      const visited = new Uint8Array(width * height);
      const queue = new Int32Array(width * height);
      let head = 0;
      let tail = 0;

      const isBackground = (index: number) => {
        const offset = index * 4;
        const red = pixels[offset];
        const green = pixels[offset + 1];
        const blue = pixels[offset + 2];
        const distance = (red - background[0]) ** 2 + (green - background[1]) ** 2 + (blue - background[2]) ** 2;
        return red > 172 && green - red > 5 && green - blue > 15 && distance < 4400;
      };
      const enqueue = (index: number) => {
        if (index < 0 || index >= visited.length || visited[index] || !isBackground(index)) return;
        visited[index] = 1;
        queue[tail++] = index;
      };

      for (let x = 0; x < width; x += 1) { enqueue(x); enqueue((height - 1) * width + x); }
      for (let y = 1; y < height - 1; y += 1) { enqueue(y * width); enqueue(y * width + width - 1); }
      while (head < tail) {
        const index = queue[head++];
        const x = index % width;
        if (x > 0) enqueue(index - 1);
        if (x < width - 1) enqueue(index + 1);
        if (index >= width) enqueue(index - width);
        if (index < width * (height - 1)) enqueue(index + width);
      }

      for (let index = 0; index < visited.length; index += 1) {
        if (visited[index]) pixels[index * 4 + 3] = 0;
      }
      for (let y = 1; y < height - 1; y += 1) {
        for (let x = 1; x < width - 1; x += 1) {
          const index = y * width + x;
          if (!visited[index] && (visited[index - 1] || visited[index + 1] || visited[index - width] || visited[index + width])) pixels[index * 4 + 3] = Math.min(pixels[index * 4 + 3], 150);
        }
      }

      context.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => blob ? resolve(URL.createObjectURL(blob)) : reject(new Error('Cutout could not be created')), 'image/png');
    };
    image.onerror = () => reject(new Error(`Could not load ${source}`));
    image.src = source;
  });

  dogCutoutCache.set(source, cutout);
  return cutout;
}

function DogCutoutImage({ src, alt }: { src: string; alt: string }) {
  const [cutoutSource, setCutoutSource] = useState('');
  useEffect(() => {
    let active = true;
    void createDogCutout(src).then((result) => { if (active) setCutoutSource(result); }).catch(() => undefined);
    return () => { active = false; };
  }, [src]);
  return <img className={cutoutSource ? 'cutout-ready' : 'cutout-loading'} src={cutoutSource || src} alt={alt} />;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('th');
  const [celebrationStep, setCelebrationStep] = useState(0);
  const [starsFound, setStarsFound] = useState<number[]>([]);
  const [candleOut, setCandleOut] = useState(false);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const [revealedDogs, setRevealedDogs] = useState(0);
  const [dogRevealOrder, setDogRevealOrder] = useState<number[]>([0, 1, 2, 3, 4]);
  const [starLayout, setStarLayout] = useState<StarLayout>(createStarLayout);
  const [birthdayNow, setBirthdayNow] = useState<Date | null>(null);
  const [journalDogScene, setJournalDogScene] = useState<{ dogIndex: number; motion: (typeof dogMotions)[number]; start: number }>({ dogIndex: 0, motion: dogMotions[0], start: 8 });
  const [notice, setNotice] = useState('');
  const journalRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = copy[language];

  useEffect(() => { document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'th'; }, [language]);
  useEffect(() => () => { audioRef.current?.pause(); }, []);
  useEffect(() => { dogs.forEach((dog) => { void createDogCutout(dog.src).catch(() => undefined); }); }, []);
  useEffect(() => {
    const updateBirthdayTime = () => setBirthdayNow(new Date());
    updateBirthdayTime();
    const timer = window.setInterval(updateBirthdayTime, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!giftOpened || revealedDogs === 0 || revealedDogs >= dogs.length) return;
    const timer = window.setTimeout(() => setRevealedDogs((value) => Math.min(value + 1, dogs.length)), 430);
    return () => window.clearTimeout(timer);
  }, [giftOpened, revealedDogs]);

  useEffect(() => {
    setJournalDogScene({
      dogIndex: Math.floor(Math.random() * dogs.length),
      motion: dogMotions[Math.floor(Math.random() * dogMotions.length)],
      start: 5 + Math.floor(Math.random() * 58),
    });
  }, [page]);

  const allEntries = useMemo<(JournalEntry & { birthday?: boolean })[]>(() => [{ id: 'birthday-letter', date: '', titleZh: copy.zh.birthdayTitle, titleTh: copy.th.birthdayTitle, contentZh: copy.zh.birthdayBody.join('\n\n'), contentTh: copy.th.birthdayBody.join('\n\n'), images: [], birthday: true }, ...journalEntries], []);
  const current = allEntries[page] ?? allEntries[0];

  useEffect(() => {
    const context = (document as Document & { modelContext?: PageToolContext }).modelContext; if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name: 'open_journal_page', title: 'Open a journal page', description: 'Scroll to the birthday journal and open a visible page by one-based page number.', inputSchema: { type: 'object', properties: { pageNumber: { type: 'integer', minimum: 1, maximum: allEntries.length } }, required: ['pageNumber'], additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute(input: unknown) { const pageNumber = (input as { pageNumber?: unknown })?.pageNumber; if (!Number.isInteger(pageNumber) || Number(pageNumber) < 1 || Number(pageNumber) > allEntries.length) throw new Error('Invalid journal page number'); setPage(Number(pageNumber) - 1); journalRef.current?.scrollIntoView({ behavior: 'smooth' }); return { opened: true, pageNumber, totalPages: allEntries.length }; } }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [allEntries.length]);

  function showNotice(message: string) { setNotice(message); window.setTimeout(() => setNotice(''), 3200); }
  function startMusicFromGesture() {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;
    audio.muted = false;
    audio.volume = .24;
    void audio.play().catch(() => showNotice(t.musicError));
  }
  function advanceCelebration() {
    if (celebrationStep === 0) startMusicFromGesture();

    if (celebrationStep === 1) {
      setStarsFound([]);
      const previousSignature = readStoredSequence(STAR_LAYOUT_STORAGE_KEY) || starLayoutSignature(starLayout);
      const nextLayout = createStarLayout(previousSignature);
      storeSequence(STAR_LAYOUT_STORAGE_KEY, starLayoutSignature(nextLayout));
      setStarLayout(nextLayout);
      setCelebrationStep(2);
    }
    else setCelebrationStep((value) => Math.min(value + 1, 4));
  }
  function collectStar(index: number) { if (starsFound.includes(index)) return; const next = [...starsFound, index]; setStarsFound(next); showNotice(t.starNotes[index]); if (next.length === 5) window.setTimeout(() => setCelebrationStep(3), 650); }
  function blowCandle() { if (candleOut) return; setCandleOut(true); showNotice(t.wishMade); window.setTimeout(() => setCelebrationStep(4), 900); }
  function skipInteraction() { startMusicFromGesture(); setStarsFound([0, 1, 2, 3, 4]); setCandleOut(true); setCelebrationStep(4); }
  function openGift() {
    if (giftOpened) return;
    const previousSignature = readStoredSequence(DOG_ORDER_STORAGE_KEY);
    const nextOrder = createDogRevealOrder(previousSignature);
    storeSequence(DOG_ORDER_STORAGE_KEY, nextOrder.join(','));
    setDogRevealOrder(nextOrder);
    setGiftOpened(true);
    setRevealedDogs(1);
  }
  function scrollToJournal() { journalRef.current?.scrollIntoView({ behavior: 'smooth' }); }
  function changePage(delta: number) { setDirection(delta > 0 ? 'next' : 'previous'); setPage((value) => Math.min(Math.max(value + delta, 0), allEntries.length - 1)); }
  function toggleMusic() { const audio = audioRef.current; if (!audio) return; if (!audio.paused) { audio.pause(); return; } startMusicFromGesture(); }
  function onTouchStart(event: TouchEvent<HTMLDivElement>) { touchStart.current = event.touches[0]?.clientX ?? null; }
  function onTouchEnd(event: TouchEvent<HTMLDivElement>) { if (touchStart.current === null) return; const distance = touchStart.current - (event.changedTouches[0]?.clientX ?? touchStart.current); if (Math.abs(distance) > 55) changePage(distance > 0 ? 1 : -1); touchStart.current = null; }
  function openFortune() { showNotice(t.fortunes[Math.floor(Math.random() * t.fortunes.length)]); }

  const entryTitle = language === 'zh' ? current.titleZh || current.titleTh : current.titleTh || current.titleZh;
  const entryContent = language === 'zh' ? current.contentZh || current.contentTh : current.contentTh || current.contentZh;
  const formattedDate = current.date
    ? new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'th-TH', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${current.date}T12:00:00`))
    : birthdayNow
      ? new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(birthdayNow)
      : '';
  const stepCopy = t.steps[celebrationStep];
  const allDogsRevealed = giftOpened && revealedDogs >= dogs.length;
  const cardTitle = allDogsRevealed ? t.finalTitle : stepCopy.title;
  const heroBody = celebrationStep === 0 ? t.heroBody : giftOpened ? t.finalBody : stepCopy.body;
  const revealedDogIndices = dogRevealOrder.slice(0, revealedDogs);
  const journalDog = dogs[journalDogScene.dogIndex];

  return (
    <main className="site-shell">
      <audio ref={audioRef} src={`${PUBLIC_BASE_PATH}/audio/kawaii-fifth.mp3`} loop preload="auto" onPlay={() => setIsMusicPlaying(true)} onPause={() => setIsMusicPlaying(false)} />
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
        {giftOpened && <div className="dog-gang" aria-label={language === 'zh' ? '五只小狗动画角色' : 'ตัวละครสุนัขทั้งห้า'}>
          {dogs.slice(0, 4).map((dog, index) => <figure className={`dog-character dog-${index + 1} ${revealedDogIndices.includes(index) ? 'is-revealed' : ''}`} key={dog.src}><DogCutoutImage src={dog.src} alt={language === 'zh' ? dog.zh : dog.th} /><figcaption>{language === 'zh' ? dog.zh : dog.th}</figcaption></figure>)}
        </div>}
        {celebrationStep === 2 && <div className="star-hunt">
          <div className="ordinary-star-field" aria-hidden="true">{starLayout.ordinary.map((position, index) => <span className="ordinary-star" key={position.slot} style={{ top: `${position.top}%`, left: `${position.left}%`, animationDelay: `${-index * .19}s` }}><span>★</span></span>)}</div>
          {[0, 1, 2, 3, 4].map((index) => <button key={index} className={`collect-star ${starsFound.includes(index) ? 'is-found' : ''}`} style={{ top: `${starLayout.rainbow[index].top}%`, left: `${starLayout.rainbow[index].left}%`, animationDelay: `${-index * .28}s` }} onClick={() => collectStar(index)} aria-label={`${t.starFound} ${index + 1}`}><span>★</span></button>)}
        </div>}
        <div className="hero-copy">
          <p className="eyebrow">{t.heroKicker}</p>
          <h1 id="birthday-title" className={`single-line-title ${language === 'th' ? 'thai-title' : ''}`}>{language === 'zh' ? <>name，祝你<span className="happy-emphasis">快乐</span>，不止生日！</> : <>name ขอให้มี<span className="happy-emphasis">ความสุข</span> ไม่ใช่แค่วันเกิด!</>}</h1>
          {heroBody && <p className={`hero-body ${giftOpened ? 'dog-arrival-copy' : ''}`}>{heroBody}</p>}
          <div className="interaction-scene">
            {giftOpened && <figure className={`dog-character card-dog ${revealedDogIndices.includes(4) ? 'is-revealed' : ''}`}><DogCutoutImage src={dogs[4].src} alt={language === 'zh' ? dogs[4].zh : dogs[4].th} /><figcaption>{language === 'zh' ? dogs[4].zh : dogs[4].th}</figcaption></figure>}
            <div className="interaction-card" aria-live="polite">
              <span className="step-number">0{celebrationStep + 1}</span>
              <h2>{cardTitle}</h2>
              <div className="interaction-actions">
                {celebrationStep === 2 ? <div className="star-progress"><span>{t.starFound} {starsFound.length} / 5 {t.starUnit}</span><i style={{ width: `${starsFound.length / 5 * 100}%` }} /></div> : celebrationStep === 3 ? <button className={`candle-interaction ${candleOut ? 'is-out' : ''}`} onClick={blowCandle}><span className="birthday-candle-visual" aria-hidden="true"><b>{candleOut ? '' : '🎂'}</b>{candleOut ? <em className="wish-fireworks"><i /><i /><i /></em> : <><i className="flame-burst burst-one" /><i className="flame-burst burst-two" /><i className="flame-burst burst-three" /></>}</span><strong>{stepCopy.button}</strong></button> : celebrationStep === 4 ? allDogsRevealed ? <Button className="party-button" onClick={scrollToJournal}><BookHeart aria-hidden="true" />{t.journalButton}</Button> : <button className={`gift-button ${giftOpened ? 'is-opening' : ''}`} onClick={openGift} disabled={giftOpened}><Gift aria-hidden="true" /><strong>{giftOpened ? t.giftOpening : stepCopy.button}</strong></button> : <Button className="party-button" onPointerDown={celebrationStep === 0 ? startMusicFromGesture : undefined} onClick={advanceCelebration}><Sparkles aria-hidden="true" />{stepCopy.button}</Button>}
                {celebrationStep < 4 && <button className="skip-button" onClick={skipInteraction}>{t.skip}</button>}
              </div>
            </div>
          </div>
        </div>
        {allDogsRevealed && <button className="scroll-cue" onClick={scrollToJournal}><span>{t.scrollHint}</span><ArrowDown aria-hidden="true" /></button>}
      </section>

      <section className="journal-section" id="journal" ref={journalRef} aria-labelledby="journal-heading">
        <div className="journal-heading-row"><div>{t.journal && <p className="eyebrow">{t.journal}</p>}<h2 id="journal-heading">{t.chapter}</h2><p>{t.journalIntro}</p></div></div>
        <div className="book-wrap">
          <div className={`book book-turn-${direction}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <span className="cover-layer cover-layer-one" aria-hidden="true" /><span className="cover-layer cover-layer-two" aria-hidden="true" />
            <div className="binding" aria-hidden="true">{Array.from({ length: 7 }).map((_, index) => <i key={index} />)}</div>
            <article className="paper paper-left" key={`${current.id}-left`}>
              <div className="paper-topline"><span>{formattedDate}</span><span>NO. {String(page + 1).padStart(2, '0')}</span></div>
              <div className={`entry-copy ${current.birthday ? 'scrollable-entry' : ''}`}><BookHeart className="entry-mark" aria-hidden="true" /><h3>{entryTitle}</h3>{entryContent.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><span className="paper-page">{page * 2 + 1}</span>
            </article>
            <article className="paper paper-right" key={`${current.id}-right`}>
              {current.birthday ? <div className="quote-page"><span className="rainbow-sticker" aria-hidden="true">🌈</span><blockquote>“{t.birthdayQuote}”</blockquote><div className="signature"><span>{t.sign}</span><strong>winnoe</strong></div><p className="diary-hint">{t.diaryHint}</p></div> : current.images.length ? <div className={`photo-grid photos-${Math.min(current.images.length, 3)}`}>{current.images.map((source, index) => <figure key={source}><img src={`${PUBLIC_BASE_PATH}${source}`} alt={`${t.photoAlt} ${index + 1}`} /></figure>)}</div> : <div className="empty-photo"><Sparkles aria-hidden="true" /><p>{t.emptyPhoto}</p></div>}
              <span className="paper-page">{page * 2 + 2}</span>
            </article>
            <div className="journal-dog-stage" aria-hidden="true">
              <span key={`${current.id}-${journalDogScene.dogIndex}-${journalDogScene.motion}`} className={`journal-dog-walker motion-${journalDogScene.motion}`} style={{ '--dog-start': `${journalDogScene.start}%` } as CSSProperties}><DogCutoutImage src={journalDog.src} alt="" /></span>
            </div>
            <span className="ribbon" aria-hidden="true" />
          </div>
        </div>
        <nav className="page-controls" aria-label={t.journal || t.chapter}><Button variant="ghost" onClick={() => changePage(-1)} disabled={page === 0}><ChevronLeft aria-hidden="true" />{t.previous}</Button><div className="page-status"><span>{t.page} {page + 1} / {allEntries.length}</span><button className="fortune-button" onClick={openFortune} aria-label={t.fortuneLabel}><Gift aria-hidden="true" /></button></div><Button variant="ghost" onClick={() => changePage(1)} disabled={page === allEntries.length - 1}>{t.next}<ChevronRight aria-hidden="true" /></Button></nav>
      </section>
      {notice && <output className="toast" aria-live="polite">{notice}</output>}
    </main>
  );
}
