# dsh-plugin-preface-context 设计文档

> 在每次会话开始时，把用户在设置页输入的一段文本作为模型可见的上下文注入到该会话的第一轮请求。

## 1. 目标与语义

- **注入时机**：`agent/session-start` 事件 → `agent.inject()` 一次性注入。新会话与 resume 均注入一次。
- **注入内容**：用户在设置页「插件配置」卡片 textarea 中输入的文本，作为一条 `source.kind: 'plugin'`、`form: 'instructions'` 的 `user/message` 进入会话收件箱，被第一轮 `agent/pre-step` 领取后送入模型请求。
- **总开关**：`enabled` 字段控制；关闭时不注入。

## 2. 关键发现（影响实现路径）

核查 `dsh/packages/host/apiproxy/src/api-proxy.ts` 的 `settings.mutate` handler：当前版本**无 `WEB_SETTINGS_NAMESPACES` 白名单**。`settings.mutate` / `settings.describe` 对任意已注册且格式合法的 namespace 开放。

因此 `plugin-settings-exposure.md` 描述的白名单限制（及 `TypertRemoteService` 绕行方案）已过时。本插件采用 `AgentLoopCard` / `BashCard` 同款最简路径：
- Host: `ctx.inject(['settings'], ...)` → `sctx.settings.register(ns, Config, { base: entry })`
- Client: `ctx.settingsScope.bind({ namespace: NS })` → `CardForm` + `PluginCard`

## 3. 架构

双半插件（host + client），预构建 `lib/` 入库策略。

### 文件结构

```
src/
├── index.ts                 # host 入口: name/inject/Config/apply
├── config.ts                # Config schema (Schemastery) + resolvePrefaceConfig
├── settings.ts              # installPrefaceSettings (settings namespace + live source bridge)
├── invariant.ts             # 包级不变量伴生件
└── client/
    ├── index.ts             # client 入口: inject/apply, 挂 settings.plugin.item 槽
    ├── preface-card.tsx     # 设置卡组件
    ├── preface-card-controller.ts  # CardForm<PrefaceSettings> 桥接
    ├── text-field.tsx       # 自定义 textarea 控件
    ├── locales.ts           # zh/en 字典
    └── preface-card.module.css
tests/
├── config.test.ts
├── settings.test.ts
└── preface-card.spec.tsx
```

## 4. 数据流

```
设置页 textarea → CardForm.stage → save → SettingsScope.set
  → connection.api.settings.mutate → ctx.settings.update → 持久化

会话开始:
  agent/session-start → bridge.source() 读最新 config
  → 若 enabled && contextText.trim() !== ''
  → createUserMessage({ content:[{type:'text',text}], source:{kind:'plugin',plugin:'preface-context',form:'instructions'} })
  → agent.inject(message)
```

## 5. Config

```ts
{ enabled: z.boolean().default(true), contextText: z.string().default('') }
```

## 6. 测试

- Unit: config schema 校验、settings bridge source/onChange/fallback
- Component: 卡片渲染 + 保存行为（jsdom）
