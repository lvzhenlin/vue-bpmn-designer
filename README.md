<div align="center">
    <h1>@tiancom/vue-bpmn-designer</h1>
    <p>bpmn-js流程设计器</p>
</div>

***

## 概述

基于 **Vue 3** + **Vite 8** + **TypeScript** 构建的现代化流程设计器组件库。本项目深度集成了 `bpmn-js`，支持activiti和flowable两种模式，提供了开箱即用的流程绘制、属性编辑和 BPMN lint 校验等能力。

## ✨ 特性

- **⚡️ 最新技术栈**: Vue 3 (Composition API), Vite 8, TypeScript \~6.0
- **🎨 全新 UI 体系**: 基于 Element Plus 2.14+ 和 SCSS
- **⚙️ 深度集成 Bpmn-js**:
  - 内置 `bpmn-js` 18.x (Flowable/Activiti 语法支持)
  - `bpmn-js-bpmnlint` 实时语法校验
  - `bpmn-js-token-simulation` 模拟执行
  - 内置网格背景、迷你小地图 (`diagram-js-minimap`) 等增强插件
  - 自定义渲染器、连接器、上下文菜单等扩展能力
- **💻 强大的代码编辑器**: 内置 CodeMirror 6，支持 JavaScript、JSON、Groovy、JUEL、Shell 等语言
- **🧩 极致的开发体验**:
  - 配置了 `unplugin-auto-import` 和 `unplugin-vue-components` 实现组件和 API 自动引入
  - 集成 ESLint、Prettier 进行代码规范检查
- **📦 组件库模式**: 支持作为 npm 组件库安装使用
- **🔌 图标本地化**: 图标数据已内置打包，支持内网离线环境运行
- **🌐 国际化支持**: 支持中英文切换

## 📦 安装

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

***

## 📋 依赖要求 (Peer Dependencies)

> 以下依赖在 [vite.config.ts](./vite.config.ts) 中通过 `external` 声明为外部依赖，**不会**被打包进产物，需由目标项目自行安装。

```bash
pnpm add vue@^3.5.0 \
pinia@^3.0.0 \
vue-i18n@^11.4.7 \
element-plus@^2.14.0 \
@element-plus/icons-vue@^2.3.2 \
@vueuse/core@^14.3.0 \
bpmn-js@^18.19.0 \
bpmn-js-bpmnlint@^0.23.0 \
bpmn-js-color-picker@^0.7.2 \
bpmn-js-create-append-anything@^0.6.0 \
bpmn-auto-layout@^1.3.0 \
diagram-js@^15.22.0 \
diagram-js-minimap@^5.4.0 \
diagram-js-grid@^1.1.0 \
diagram-js-grid-bg@^1.1.0 \
bpmnlint@^11.12.1 \
didi@^10.2.2 \
lodash-es@^4.18.1 \
tiny-svg@^4.1.4 \
codemirror@^6.0.2 \
@codemirror/autocomplete@^6.20.3 \
@codemirror/commands@^6.10.4 \
@codemirror/lang-javascript@^6.2.5 \
@codemirror/lang-json@^6.0.2 \
@codemirror/language@^6.12.4 \
@codemirror/legacy-modes@^6.5.1 \
@codemirror/lint@^6.9.7 \
@codemirror/state@^6.7.0 \
@codemirror/view@^6.43.4 \
@lezer/highlight@^1.2.3
```

> **已内置打包（无需目标项目安装）**：`@iconify/vue`、`bpmn-js-token-simulation`、`bpmn-js-differ`、`ids`、`min-dash` 已打进产物。其中 `ids` 升级到 `3.x` 后通过 `idsFixPlugin` 将 `import Ids from 'ids'` 改写为命名导入以兼容 `bpmn-js-token-simulation`。

***

## ⚙️ 配置

### 1. 配置 Pinia 和 Vue I18n

在目标项目的 `main.ts` 中配置（若目标项目已配置 Pinia 与 I18n，可跳过本步）：

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

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

### 3. 自定义 API（可选）

组件库默认使用 Mock 数据，如果需要连接真实后端接口，可通过 `setApiConfig` 配置自定义 API：

```typescript
// main.ts
import { setApiConfig } from '@tiancom/vue-bpmn-designer'
import axios from 'axios'

setApiConfig({
  saveProcess: async (params) => {
    const response = await axios.post('/api/process/save', params)
    return response.data
  },
  getUserList: async (params) => {
    const response = await axios.get('/api/users', { params })
    return response.data
  },
  getGroupList: async (params) => {
    const response = await axios.get('/api/groups', { params })
    return response.data
  },
})
```

**API 类型定义：**

```typescript
interface ApiConfig {
  saveProcess?: (params: SaveProcessRequest) => Promise<SaveProcessResponse>
  getUserList?: (params: PageParams) => Promise<PageResponse>
  getGroupList?: (params: PageParams) => Promise<PageResponse>
}

interface SaveProcessRequest {
  xmlContent: string
  processName?: string
}

interface SaveProcessResponse {
  code: number
  message: string
  data?: { id: string; processName: string }
}

interface PageParams {
  page: number
  pageSize: number
  keyword?: string
  excludeIds?: string[]
}

interface PageResponse {
  code: number
  data: Option[]
  total: number
  message?: string
}

interface Option {
  name: string
  id: string
}
```

***

## 🚀 快速开始

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

***

## 📝 Props 说明

| 属性         | 类型       | 默认值 | 说明                   |
| ---------- | -------- | --- | -------------------- |
| `id`       | `string` | -   | 流程定义 ID              |
| `name`     | `string` | -   | 流程名称                 |
| `xml`      | `string` | -   | BPMN XML 字符串，用于初始化流程 |
| `idPrefix` | `string` | -   | 生成元素 ID 的前缀          |

***

## 📤 导出内容

```typescript
import { 
  ProcessDesigner,      // 核心设计器组件
  useBpmnVersionStore,  // BPMN 版本管理 Store
  useAppStore,          // 应用配置 Store
  setApiConfig,         // API 配置函数
} from '@tiancom/vue-bpmn-designer'

import type { 
  BpmnVersion,          // 'flowable' | 'activiti'
  LanguageType,         // 'zh-CN' | 'en-US'
  ApiConfig,            // API 配置类型
  SaveProcessRequest,   // 保存请求类型
  SaveProcessResponse,  // 保存响应类型
  PageParams,           // 分页参数类型
  PageResponse,         // 分页响应类型
} from '@tiancom/vue-bpmn-designer'
```

***

## 🔧 开发构建

```bash
# 克隆项目
# git clone https://github.com/tsai996/vue-bpmn-designer.git
git clone https://github.com/lvzhenlin/vue-bpmn-designer.git

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

***

## 🛠️ 核心目录结构

```text
├── src/                    # 源码核心目录
│   ├── api/                # API 接口（支持外部配置）
│   ├── assets/             # 静态资源 (icons, images)
│   ├── components/         # 公共组件 (CodemirrorEditor, SvgIcon)
│   │   ├── icons-data.ts   # 图标数据（内置打包，支持离线）
│   │   └── index.ts        # 组件库导出入口
│   ├── hooks/              # 自定义 hooks
│   ├── languages/          # 国际化配置 (zh-CN, en-US)
│   ├── stores/             # Pinia 状态管理
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型定义
│   ├── views/ProcessDesigner/  # 核心设计器视图
│   │   ├── index.vue       # ProcessDesigner 主组件
│   │   ├── BpmnPanel.vue   # 属性面板
│   │   ├── BpmnModeler.tsx # BPMN 模型器
│   │   ├── Panel/          # 属性面板各组件配置
│   │   ├── Connector/      # 连接器扩展
│   │   ├── ContextPad/     # 上下文菜单
│   │   ├── Lint/           # BPMN 校验规则
│   │   ├── Modeling/       # 建模扩展
│   │   ├── Palette/        # 工具栏
│   │   ├── Renderer/       # 自定义渲染器
│   │   └── utils/          # 工具函数
│   ├── App.vue             # 根组件
│   └── main.ts             # 挂载入口
├── .env.*                  # 多环境变量配置文件
├── AGENTS.md               # ⚠️ AI 开发规则与约束
├── vite.config.ts          # Vite 配置（库模式）
└── package.json            # 依赖管理和脚本定义
```

***

## ⚠️ 注意事项

1. **样式自动注入**: 组件库已配置 `vite-plugin-css-injected-by-js`，样式会自动注入，**无需手动引入 CSS**
2. **Pinia 和 I18n**: 组件库会复用目标项目已配置的 pinia 和 I18n，无需重复配置
3. **图标本地化**: 图标数据已内置打包到 `icons-data.ts`，无需网络即可加载，适合内网环境
4. **Bpmn-js 操作**: 操作底层 BPMN 模型数据时，必须通过 `modeling.updateProperties` 等内部 Command API 修改，严禁直接修改 DOM 或业务对象，否则会破坏撤销重做 (Undo/Redo) 功能
5. **版本兼容**: 确保目标项目的 Vue、Element Plus 版本与组件库兼容
6. **自动导入**: 如目标项目未配置 `unplugin-auto-import`，需手动导入 Vue API

***

## 🔄 卸载组件库

```bash
# 使用 file: 协议安装时
pnpm remove @tiancom/vue-bpmn-designer

# 使用 link 安装时
pnpm unlink --global @tiancom/vue-bpmn-designer
```

***

## 📄 协议

[Apache-2.0 License](./LICENSE)
