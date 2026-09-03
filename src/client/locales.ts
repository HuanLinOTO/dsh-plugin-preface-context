/** Locale bundles for the preface-context settings card. */

/** Locale keys the preface-context card renders. */
export type PrefaceLocaleKey =
  | 'title' | 'description'
  | 'enabled' | 'enabledHint'
  | 'contextText' | 'contextTextHint' | 'contextTextPlaceholder'
  | 'overridden' | 'reset'
  | 'save' | 'saving' | 'discard' | 'unsaved' | 'saveFailed'
  | 'readOnly' | 'expand' | 'collapse'

/** English copy. */
export const en: Record<PrefaceLocaleKey, string> = {
  title: 'Preface context',
  description: 'Inject a text block as model-visible instructions at the start of every session.',
  enabled: 'Enabled',
  enabledHint: 'When off, no context is injected at session start.',
  contextText: 'Context text',
  contextTextHint: 'Injected once per session as instructions context, closest to the model\u2019s first answer. Empty text injects nothing.',
  contextTextPlaceholder: 'Enter the text to inject at the start of every session\u2026',
  overridden: 'Overridden',
  reset: 'Reset to default',
  save: 'Save',
  saving: 'Saving\u2026',
  discard: 'Discard',
  unsaved: 'Unsaved',
  saveFailed: 'The deployment did not accept these values; they were left for you to correct.',
  readOnly: 'This deployment stores settings read-only.',
  expand: 'Show settings',
  collapse: 'Hide settings',
}

/** Simplified Chinese copy. */
export const zh: Record<PrefaceLocaleKey, string> = {
  title: '前言上下文',
  description: '在每次会话开头注入一段文本作为模型可见的指令上下文。',
  enabled: '启用',
  enabledHint: '关闭后，会话开始时不注入任何上下文。',
  contextText: '上下文文本',
  contextTextHint: '每次会话注入一次，作为指令上下文最贴近模型的首个回答。文本为空则不注入。',
  contextTextPlaceholder: '输入要在每次会话开头注入的文本\u2026',
  overridden: '已覆盖',
  reset: '恢复默认',
  save: '保存',
  saving: '保存中\u2026',
  discard: '放弃修改',
  unsaved: '未保存',
  saveFailed: '本部署没有接受这些值，已保留供你修改。',
  readOnly: '本部署的设置为只读。',
  expand: '展开设置',
  collapse: '收起设置',
}
