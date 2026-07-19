<div align="center">
    <h1>@tiancom/vue-bpmn-designer</h1>
    <p>bpmn-js流程设计器 (Flowable版)</p>
    <p>
      <a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a>
    </p>
</div>

---

## 在线预览

- 预览地址：https://tsai996.github.io/vue-bpmn-designer/

基于 **Vue 3** + **Vite 6** + **TypeScript** 构建的现代化流程设计器组件库。本项目深度集成了 `bpmn-js`，并针对 Flowable 规范进行了深度定制，提供了开箱即用的流程绘制、属性编辑和 BPMN lint 校验等能力。

## ✨ 特性 (Features)

- **⚡️ 最新技术栈**: Vue 3 (Composition API), Vite 6, TypeScript
- **🎨 全新 UI 体系**: 基于 Element Plus 和 SCSS
- **⚙️ 深度集成 Bpmn-js**:
  - 内置 `bpmn-js` (Flowable 语法支持)
  - `bpmn-js-bpmnlint` 实时语法校验
  - `bpmn-js-token-simulation` 模拟执行
  - 内置网格背景、迷你小地图 (`diagram-js-minimap`) 等增强插件
- **💻 强大的代码编辑器**: 内置 CodeMirror 6，用于高级脚本或配置编辑
- **🧩 极致的开发体验**:
  - 配置了 `unplugin-auto-import` 和 `unplugin-vue-components` 实现组件和 API 自动引入
  - 集成 ESLint、Prettier 进行代码规范检查
- **📦 组件库模式**: 支持作为 npm 组件库安装使用

## 相关项目

- 如果对仿钉钉流程设计器感兴趣可查看：[lowflow-design](https://gitee.com/cai_xiao_feng/lowflow-design)

## 仓库地址

- Gitee: https://gitee.com/cai_xiao_feng/vue-bpmn-designer
- GitHub: https://github.com/tsai996/vue-bpmn-designer

## 🖼️ 示例图

<p>
  <img alt="示例图1" src="public/sl1.png" width="480" style="display:inline-block" />
  <img alt="示例图2" src="public/sl2.png" width="480" style="display:inline-block" />
</p>

---

## 📦 安装 (Installation)

### 方式一：本地安装（开发阶段）

```bash
# 在目标项目中执行，使用 file: 协议
pnpm add file:D:\tiancom\workspace\vue-bpmn-designer

# 或使用相对路径（假设两个项目在同一级目录）
pnpm add file:../vue-bpmn-designer
```

### 方式二：使用 pnpm link（多项目共享）

```bash
# 在组件库项目中创建全局链接
cd D:\tiancom\workspace\vue-bpmn-designer
pnpm link --global

# 在目标项目中链接
cd D:\path\to\target-project
pnpm link --global @tiancom/vue-bpmn-designer
```

### 方式三：发布到 npm 后安装

```bash
pnpm add @tiancom/vue-bpmn-designer
```

---

## 📋 依赖要求 (Peer Dependencies)

目标项目需安装以下依赖：

```bash
pnpm add vue@^3.5.13 \
pinia@^3.0.1 \
vue-i18n@^11.2.8 \
element-plus@^2.11.7 \
         @element-plus/icons-vue@^2.3.1 \
@iconify/vue@^4.3.0 @vueuse/core@^13.0.0 \
         bpmn-js@^18.6.2 bpmn-js-bpmnlint@^0.23.0 bpmn-js-color-picker@^0.7.1 \
         bpmn-js-create-append-anything@^0.6.0 bpmn-js-token-simulation@^0.38.1 \
         bpmn-auto-layout@^1.0.0 diagram-js@^15.2.4 diagram-js-minimap@^5.2.0 \
         diagram-js-grid@^1.1.0 diagram-js-grid-bg@^1.1.0 bpmnlint@^11.4.2 \
         didi@^10.2.2 lodash-es@^4.17.21 min-dash@^4.2.3 tiny-svg@^4.1.3 \
         ids@^1.0.5 codemirror@^6.0.1 @codemirror/autocomplete@^6.18.6 \
         @codemirror/commands@^6.8.1 @codemirror/lang-javascript@^6.2.4 \
         @codemirror/lang-json@^6.0.1 @codemirror/language@^6.11.0 \
         @codemirror/legacy-modes@^6.5.1 @codemirror/lint@^6.8.5 \
         @codemirror/state@^6.5.2 @codemirror/view@^6.36.8 @lezer/highlight@^1.2.1
```

---

## ⚙️ 配置 (Configuration)

### 1. 配置 Pinia 和 Vue I18n

在目标项目的 `main.ts` 中配置：

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': { /* 目标项目中文语言包 */ },
    'en-US': { /* 目标项目英文语言包 */ },
  },
})
app.use(i18n)

app.use(ElementPlus)
app.mount('#app')
```

### 2. 配置 SVG 图标（可选）

如果目标项目使用了自定义图标，需配置 `vite-plugin-svg-icons`：

```typescript
// vite.config.ts
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
    }),
  ],
})
```

```typescript
// main.ts
import 'virtual:svg-icons-register'
```

---

## 🚀 快速开始 (Quick Start)

### 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ProcessDesigner } from '@tiancom/vue-bpmn-designer'

const processXml = ref('')
const processName = ref('我的流程')
const processId = ref('process-1')
</script>

<template>
  <ProcessDesigner 
    :id="processId"
    :name="processName"
    :xml="processXml"
  />
</template>
```

### 获取流程 XML

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ProcessDesigner } from '@tiancom/vue-bpmn-designer'

const processXml = ref('')

onMounted(() => {
  const modeler = (window as any).bpmnModeler
  if (modeler) {
    const xml = modeler.saveXML({ format: true })
    console.log('流程 XML:', xml)
  }
})
</script>

<template>
  <ProcessDesigner :xml="processXml" />
</template>
```

---

## 📝 Props 说明

| 属性         | 类型       | 默认值 | 说明                   |
| ---------- | -------- | --- | -------------------- |
| `id`       | `string` | -   | 流程定义 ID              |
| `name`     | `string` | -   | 流程名称                 |
| `xml`      | `string` | -   | BPMN XML 字符串，用于初始化流程 |
| `idPrefix` | `string` | -   | 生成元素 ID 的前缀          |

---

## 📤 导出内容

```typescript
import { 
  ProcessDesigner,      // 核心设计器组件
  useBpmnVersionStore,  // BPMN 版本管理 Store
  useAppStore,          // 应用配置 Store
} from '@tiancom/vue-bpmn-designer'

import type { 
  BpmnVersion,          // 'flowable' | 'activiti'
  LanguageType,         // 'zh-CN' | 'en-US'
} from '@tiancom/vue-bpmn-designer'
```

---

## 🔧 开发构建 (Development & Build)

```bash
# 克隆项目
git clone https://github.com/tsai996/vue-bpmn-designer.git

# 进入项目目录
cd vue-bpmn-designer

# 安装依赖
pnpm install

# 启动本地开发服务器
pnpm dev

# 构建组件库
pnpm run build-only

# 完整构建（包含类型检查）
pnpm build

# 预览构建产物
pnpm preview

# 代码类型检查
pnpm type-check

# ESLint 修复和 Prettier 格式化
pnpm lint
pnpm format
```

---

## 🛠️ 核心目录结构 (Structure)

```text
├── public/                 # 静态资源
├── src/                    # 源码核心目录
│   ├── api/                # API 接口
│   ├── assets/             # 静态资源 (icons, images)
│   ├── components/         # 公共组件 (CodemirrorEditor, SvgIcon)
│   │   └── index.ts        # 组件库导出入口
│   ├── hooks/              # 自定义 hooks
│   ├── languages/          # 国际化配置
│   ├── stores/             # Pinia 状态管理
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型定义
│   ├── views/ProcessDesigner/  # 核心设计器视图
│   │   ├── index.vue       # ProcessDesigner 主组件
│   │   ├── BpmnPanel.vue   # 属性面板
│   │   ├── BpmnModeler.tsx # BPMN 模型器
│   │   └── ...             # 其他子模块
│   ├── App.vue             # 根组件
│   └── main.ts             # 挂载入口
├── .env.*                  # 多环境变量配置文件
├── AGENTS.md               # ⚠️ AI 开发规则与约束
├── vite.config.ts          # Vite 配置
└── package.json            # 依赖管理和脚本定义
```

---

## ⚠️ 注意事项 (Important)

1. **样式自动注入**: 组件库已配置 `vite-plugin-css-injected-by-js`，样式会自动注入，**无需手动引入 CSS**
2. **Pinia 和 I18n**: 组件库会复用目标项目已配置的 pinia 和 I18n，无需重复配置
3. **国际化**: 组件库的多语言消息需要合并到目标项目的 I18n 配置中
4. **Bpmn-js 操作**: 操作底层 BPMN 模型数据时，必须通过 `modeling.updateProperties` 等内部 Command API 修改，严禁直接修改 DOM 或业务对象，否则会破坏撤销重做 (Undo/Redo) 功能
5. **版本兼容**: 确保目标项目的 Vue、Element Plus 版本与组件库兼容
6. **自动导入**: 如目标项目未配置 `unplugin-auto-import`，需手动导入 Vue API

---

## 🔄 卸载组件库

```bash
# 使用 file: 协议安装时
pnpm remove @tiancom/vue-bpmn-designer

# 使用 link 安装时
pnpm unlink --global @tiancom/vue-bpmn-designer
```

---

## 社群交流

> 添加微信好友后（备注：bpmn）可邀请入群。

<p>
  <img alt="微信" src="public/wx.jpg" width="240" height="400" style="display:inline-block" />
  <img alt="QQ群" src="public/qq_qun.jpg" width="240" height="400" style="display:inline-block" />
</p>

## 赞助支持

如果项目对你有帮助，欢迎赞助支持持续维护。

<p>
  <img alt="微信支付" src="public/wxpay.png" width="240" height="240" style="display:inline-block" />
  <img alt="支付宝" src="public/alipay.png" width="240" height="240" style="display:inline-block" />
</p>

## 📄 协议 (License)

[Apache-2.0 License](./LICENSE)
