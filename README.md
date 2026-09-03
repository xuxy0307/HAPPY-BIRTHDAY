# 给 name 的生日贺卡

五只小狗会陪寿星一起开启派对、收集星星并吹灭蜡烛。继续下滑进入日记本区域，寿星可以阅读来自作者的祝福，作者会通过 winnoe 的管理入口添加内容。

## 本地运行

```bash
npm install
npm run dev
```

浏览器访问终端显示的本地地址。管理演示口令为 `winnoe`。

背景音乐使用 `public/audio/kawaii-fifth.mp3`，通过页面右上角的音乐按钮播放或暂停，并自动循环。

## Demo 数据说明

- 新增日记与上传照片保存在当前浏览器的 `localStorage` 中。
- 更换浏览器或设备后，数据不会自动同步。
- 这个前端口令只用于演示交互，不能作为正式的权限保护。
- 正式上线并实现“winnoe 编辑、name 只读”时，需要接入账号鉴权与云端数据库/对象存储。

## 小狗角色素材

五张动画角色图位于 `public/dogs/`，分别对应用户提供的小狗照片。蓝陨石牧羊犬角色已去除背心、项圈和牵引链。网页通过 CSS 为角色添加漂浮、跳跃与庆祝动作，原始角色图保持静态 PNG，便于后续替换和优化。

## 构建

```bash
npm run build
```

静态网页会生成到 `dist/client/`。

## 部署到 GitHub Pages

项目已经包含 `.github/workflows/deploy-pages.yml`。首次部署时：

1. 在 GitHub 新建一个空仓库。
2. 将此项目提交并推送到仓库的 `main` 分支。
3. 打开仓库的 **Settings → Pages**，将 **Source** 设置为 **GitHub Actions**。
4. 打开 **Actions** 页面等待 `Deploy birthday card to GitHub Pages` 完成。
5. 部署地址会显示在任务的 `deploy` 步骤和 **Settings → Pages** 中。

以后每次推送到 `main` 分支都会自动重新构建和发布。工作流会自动识别仓库子路径，因此普通项目仓库和 `用户名.github.io` 仓库都可以使用。
