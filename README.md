<p align="center">
  <a href="https://dshfind.com/zh/plugins/huanlinoto/dsh-plugin-preface-context"><img src="https://dshfind.com/api/card/huanlinoto/dsh-plugin-preface-context?lang=zh" alt="dsh-plugin-preface-context card"></a>
</p>

# dsh-plugin-preface-context

在每次会话开头固定注入一段用户配置的文本上下文（插件行配置页可编辑），作为模型可见的 instructions 注入第一轮请求。

> Injects a user-configured text block as model-visible instructions context at the start of every DSH session (editable from the plugin row's page in the Plugins manager).

## 功能

- **会话开始注入**：监听 `agent/created` 事件，在每次新建/恢复/清空/压缩会话时，通过 `agent.inject()` 把用户配置的文本作为一条 `source.kind: 'preface-context'`、`form: 'instructions'` 的 `user/message` 注入会话收件箱。该消息被第一轮 `agent/pre-step` 领取后送入模型请求，作为指令上下文最贴近模型的首个回答。
- **插件行配置页可编辑**：在 Plugins 管理页的本插件行配置页注册一张卡片（`plugins.row.config` 槽），包含：
  - **启用开关**（boolean toggle）
  - **上下文文本**（multiline textarea，保留换行和缩进）
- **实时生效**：配置页保存后，下一次会话开始即使用新文本，无需重启（字段为 `.volatile()` Config，读引用取最新值）。

## 开发

### 仓库结构

```
src/
├── index.ts                 # host 入口: name/inject/Config/apply + agent/created hook
├── config.ts                # Config schema (Schemastery, .volatile()) + resolvePrefaceConfig
├── settings.ts              # installPrefacePage (own-page policy; no settings.register)
└── client/
    ├── index.ts             # client 入口: 挂 plugins.row.config 槽
    ├── preface-card.tsx     # 配置卡组件
    ├── preface-card-controller.ts  # ConfigForm 桥接 (staged edit / save / discard)
    ├── bind-snapshot-selector.ts    # 内联 uSES bridge (上游不再从包根导出)
    ├── preface-card.css.ts  # 卡片样式 + <style data-plugin-css> 注入
    └── locales.ts           # zh/en 字典
tests/
├── config.test.ts           # Config schema 校验
├── settings.test.ts         # installPrefacePage 接线
├── index.test.ts            # buildPrefaceMessage 注入决策 + agent/created 接线
├── preface-card-controller.test.ts  # controller stage/save/discard
└── preface-card.spec.tsx    # 卡片渲染 + 交互 (jsdom)
```

### 前置依赖

- Node.js >= 22
- pnpm
- 本机 `~/.dsh/source/current` 指向 DSH 源码 checkout（tsconfig paths 解析 `@deepseek-ai/*` 类型）

### 三件套

```sh
pnpm install
pnpm run typecheck   # tsc --noEmit (host + client)
pnpm test            # vitest run
pnpm run build       # tsdown 双 bundle (host ESM + client __ModuleLoader__ CJS) + tsc 类型产物
```

### 构建策略

**预构建 `lib/` 入库**（不含 `prepare` 脚本）。client 半部依赖 `@deepseek-ai/dsh-client-*` private peer deps，pnpm 在 git install 的 `prepare` 阶段会在临时目录拉不到这些包，所以 `lib/` 必须预构建并提交。改源码后需 `pnpm run build` + commit `lib/`。

## 运行

### 安装到 profile

```sh
# 本地开发（热更新）
dsh plugin --profile web add "link:D:/Projects/deepseek-harness/dsh-plugin-preface-context"

# 从 GitHub 安装
dsh plugin --profile web add "github:huanlinoto/dsh-plugin-preface-context"
```

安装后重启 `dsh web`，浏览器硬刷新（`Ctrl+Shift+R`）。在 Plugins 管理页打开本插件所在 bundle，进入插件行配置页可见「前言上下文」卡片。

### 配置

插件行配置页中：
- **启用**：开关关闭时不注入任何文本。
- **上下文文本**：输入要注入的文本（支持多行）。文本为空时不注入。

也可通过 `cordis.patch.yml` 的 plugin-row `config` 块提供默认值（默认 `enabled: true, contextText: ''`）；表单编辑写回本 profile 的 `cordis.patch.yml` 中该 entry 的 `config`。

## 检查

```sh
pnpm run typecheck   # 类型门禁
pnpm test            # 38 个单元/组件测试
pnpm run build       # 产物: lib/index.js, lib/client.js (+ types)
```

### 为何不发布 `./invariant`

本插件没有独立可分歧的观察：`agent/created` 监听器是 cordis effect，随插件 fiber 自动 dispose；own-page 策略挂在自己的 conditional inject child 上，disposal 由 settings 服务契约保证。按上游收紧的 invariant 规则（空 installer 与「检查服务/元数据存在」式 invariant 无效），不发布 `./invariant` 子路径导出。

### 合规自检

- [x] 零源码 patch：未修改 DSH checkout 任何文件
- [x] B1: `package.json` 声明 `dsh.bundle.patch`
- [x] B2: 自带 `cordis.patch.yml`（insert 行 id/name/config 齐全）
- [x] B3: patch 行 `name` 用包名
- [x] F1: `files` 含 `lib/` + `cordis.patch.yml`
- [x] F2: `peerDependencies` 含 cordis + `@deepseek-ai/*`（全部 optional）
- [x] F3: typecheck/test/build 三 script 齐全
- [x] A4: Config 用 Schemastery `z.object`
- [x] A6: 不导出 default
- [x] 预构建策略：`lib/` 不在 `.gitignore`，无 `prepare` 脚本
- [x] UI1: `plugins.row.config` keyed 槽位
- [x] G: Unit + Component 测试分层

## License

AGPL-3.0
