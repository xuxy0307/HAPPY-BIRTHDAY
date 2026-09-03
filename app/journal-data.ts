export type JournalEntry = {
  id: string;
  date: string;
  titleZh: string;
  titleTh: string;
  contentZh: string;
  contentTh: string;
  images: string[];
};

// winnoe 在 GitHub 上新增日记时，只需在数组中加入一项。
// 图片先上传到 public/journal/，然后在 images 中填写 /journal/文件名。
export const journalEntries: JournalEntry[] = [];
