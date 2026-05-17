# McMSF浆果服服务器 - SJMCL扩展

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Vxiaolong666/mcmsf-SJMC)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![SJMCL](https://img.shields.io/badge/SJMCL-Compatible-orange.svg)](https://mc.sjtu.cn/sjmcl/)

> 开放的 Minecraft 服务器宣传平台，致力于连接服务器与玩家，提供服务器展示、资源共享与互动支持，共建自由协作的 Minecraft 多元生态

## 📖 项目简介

McMSF浆果服服务器扩展是一个为SJMCL启动器设计的插件，旨在为用户提供便捷的MCMSF服务器浏览和接入体验。通过本扩展，用户可以直接在启动器中浏览、筛选和连接MCMSF平台上的各类Minecraft服务器。

## ✨ 功能特性

### 🏠 首页服务器推荐
- 展示MCMSF平台推荐的服务器
- 支持按热度、随机、时间三种方式筛选
- "换一批"功能快速刷新服务器列表
- 一键刷新获取最新服务器信息

### 📋 服务器详情页
- 完整的服务器信息展示
  - 服务器名称、版本、类型
  - 服务器简介和标签
  - 服务器IP地址（支持一键复制）
  - QQ群等联系方式
- 图片轮播展示
  - 支持多张服务器宣传图片
  - 流畅的切换动画
  - 指示器快速导航
- B站视频嵌入播放
  - 支持B站视频直接播放
  - 默认静音自动播放
  - 响应式视频播放器

### 📊 服务器状态实时展示
- 服务器在线状态
- 当前玩家数/最大玩家数
- 服务器图标展示
- MOTD消息展示
  - 支持Minecraft颜色代码解析
  - 支持粗体、斜体、下划线等格式
  - 真实还原服务器MOTD效果
- 服务器状态贴图（仅在线服务器）

### 🎮 便捷操作
- 一键添加服务器到实例
- 应用内页面导航（无需跳转浏览器）
- 复制服务器IP地址
- 在浏览器中查看更多信息

### 🎨 用户体验优化
- 骨架屏加载动画
- 流畅的页面过渡
- 响应式设计
- 友好的错误提示

## 📥 安装说明

### 方式一：从Releases下载
1. 访问 [Releases页面](https://github.com/Vxiaolong666/mcmsf-SJMC/releases)
2. 下载最新版本的 `.sjmclx` 文件
3. 在SJMCL启动器中打开扩展管理
4. 选择"从文件安装"，选择下载的 `.sjmclx` 文件

### 方式二：从源码构建
```bash
# 克隆仓库
git clone https://github.com/Vxiaolong666/mcmsf-SJMC.git
cd mcmsf-SJMC

# 安装依赖
npm install

# 构建项目
npm run build

# 构建产物位于 dist/mcmsf.hellow-1.0.0.sjmclx
```

## 🚀 使用方法

### 浏览服务器
1. 打开SJMCL启动器
2. 在首页找到"McMSF浆果服服务器"卡片
3. 使用筛选按钮选择排序方式：
   - 🔥 热门：按服务器热度排序
   - ⭐ 推荐：随机推荐服务器
   - 🕐 最新：按添加时间排序
4. 点击"换一批"刷新服务器列表

### 查看服务器详情
1. 点击任意服务器卡片
2. 查看服务器详细信息
3. 浏览服务器图片和视频
4. 查看服务器在线状态

### 添加服务器到实例
1. 在服务器详情页点击"添加到实例"
2. 选择目标实例
3. 确认添加

### 复制服务器IP
1. 在服务器详情页找到服务器IP
2. 点击"复制"按钮
3. IP地址已复制到剪贴板

## 🛠️ 开发指南

### 项目结构
```
mcmsf-SJMC/
├── src/
│   ├── index.ts                 # 扩展入口
│   ├── pages/
│   │   ├── server-detail-page.ts  # 服务器详情页
│   │   └── settings-page.ts       # 设置页面
│   ├── widgets/
│   │   └── home-mcmsf-servers.ts  # 首页组件
│   └── types/
│       └── host.ts               # 类型定义
├── assets/                       # 静态资源
├── dist/                         # 构建产物
├── sjmcl.ext.json               # 扩展配置
└── package.json                 # 项目配置
```

### 开发命令
```bash
# 安装依赖
npm install

# 开发模式构建
npm run build -- --mode development

# 生产模式构建
npm run build

# 版本升级
npm run bump -- 1.2.3
```

### API文档
- [SJMCL扩展API](https://mc.sjtu.cn/sjmcl/dev/extension/api.html)
- [Deeplink API](https://mc.sjtu.cn/sjmcl/dev/deeplink-api.html)
- [MCMSF API](https://mcmsf.com/api/)

### 构建选项
| 参数 | 值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `--mode` | `production`, `development` | `production` | 构建模式 |
| `--obfuscate` | `true`, `false` | production时开启 | 代码混淆 |

示例：
```bash
npm run build
npm run build -- --mode development
npm run build -- --obfuscate=off
```

## 📝 版本历史

### v1.0.0 (2026-05-17)
- 🎉 首个正式版本发布
- ✅ 实现服务器浏览和筛选功能
- ✅ 实现服务器详情页展示
- ✅ 实现图片轮播和视频播放
- ✅ 实现服务器状态实时展示
- ✅ 实现MOTD颜色代码解析
- ✅ 实现一键添加服务器功能
- ✅ 优化用户体验

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [McMSF官网](https://mcmsf.com/)
- [SJMCL启动器](https://mc.sjtu.cn/sjmcl/)
- [GitHub仓库](https://github.com/Vxiaolong666/mcmsf-SJMC)
- [问题反馈](https://github.com/Vxiaolong666/mcmsf-SJMC/issues)

## 💬 联系方式

- 作者：Loong
- Email：2257923688@qq.com
- GitHub：[@Vxiaolong666](https://github.com/Vxiaolong666)

## 🙏 致谢

感谢以下项目和平台的支持：
- [SJMCL](https://mc.sjtu.cn/sjmcl/) - 强大的Minecraft启动器
- [McMSF](https://mcmsf.com/) - Minecraft服务器宣传平台
- [Chakra UI](https://chakra-ui.com/) - 优秀的React组件库

---

⭐ 如果这个项目对你有帮助，请给一个星标支持！
