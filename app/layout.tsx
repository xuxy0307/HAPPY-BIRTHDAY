import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '写给 name 的生日祝福 · winnoe',
  description: '一封会继续生长的中泰双语生日贺卡。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
