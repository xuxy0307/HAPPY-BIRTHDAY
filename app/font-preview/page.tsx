import styles from './page.module.css';

const options = [
  { id: 1, name: '彩虹圆体', note: '圆润加粗 · 五色渐变 · 浅色描边', className: styles.rounded },
  { id: 2, name: '现代粗黑体', note: '清晰利落 · 横向虹彩 · 现代感', className: styles.modern },
  { id: 3, name: '优雅宋体', note: '细长克制 · 低饱和渐变 · 高级感', className: styles.serif },
  { id: 4, name: '俏皮气泡体', note: '饱满跳跃 · 糖果虹彩 · 派对感', className: styles.bubble },
];

export default function FontPreviewPage() {
  return (
    <main className={styles.page}>
      <div className={styles.orbit} aria-hidden="true" />
      <header className={styles.header}>
        <span>✨ Birthday title lab</span>
        <h1>选择“快乐”的字体效果</h1>
        <p>四种方案都使用正式页面的浅绿色背景、字号和居中排版。</p>
      </header>

      <section className={styles.grid} aria-label="彩虹字体预览">
        {options.map((option) => (
          <article className={styles.card} key={option.id}>
            <div className={styles.meta}>
              <strong>0{option.id}</strong>
              <div><h2>{option.name}</h2><p>{option.note}</p></div>
            </div>
            <p className={styles.title}>
              name，祝你<span className={option.className}>快乐</span>，不止生日！
            </p>
          </article>
        ))}
      </section>

      <p className={styles.hint}>看完后告诉我编号 1–4，我再应用到正式首页。</p>
    </main>
  );
}
