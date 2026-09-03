# 给 name 的生日贺卡

五只小狗会陪寿星一起开启派对、收集星星并吹灭蜡烛。继续下滑进入日记本区域，寿星可以阅读来自作者的祝福，作者会通过 winnoe 的管理入口添加内容。

## 本地运行

```bash
npm install
npm run dev
```

浏览器访问终端显示的本地地址。

背景音乐使用 `public/audio/kawaii-fifth.mp3`，通过页面右上角的音乐按钮播放或暂停，并自动循环。

## 日记维护

日记内容统一保存在 `app/journal-data.ts`。作者 在 GitHub 上编辑并提交这个文件后，GitHub Actions 会自动重新构建和发布网页，寿星都会看到更新后的内容。

## 小狗角色素材

五张动画角色图位于 `public/dogs/`。

## 构建

```bash
npm run build
```

静态网页会生成到 `dist/client/`。

## 部署到 GitHub Pages

项目已经包含 `.github/workflows/deploy-pages.yml`。如果不使用 Git，可以直接通过 GitHub 网页上传：

1. 在 GitHub 新建一个公开仓库。
2. 在仓库的 **Code** 页面点击 **Add file → Upload files**，上传项目内的全部文件和文件夹。
3. 确认仓库中包含 `.github/workflows/deploy-pages.yml` 和 `.openai/hosting.json`。
4. 打开 **Settings → Pages**，将 **Source** 设置为 **GitHub Actions**。
5. 打开 **Actions** 页面，等待 `Deploy birthday card to GitHub Pages` 显示绿色对勾。
6. 部署完成后，可在 **Settings → Pages** 查看公开访问链接。

以后每次在 GitHub 网页中编辑文件，或使用 **Add file → Upload files** 覆盖更新文件并提交到 `main` 分支，GitHub Actions 都会自动重新构建和发布。

普通项目仓库的地址格式通常为：

```text
https://用户名.github.io/仓库名/
