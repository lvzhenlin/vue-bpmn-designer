import type { ModuleDeclaration } from 'didi'
import CustomContextPadProvider from '@/views/ProcessDesigner/ContextPad/CustomContextPadProvider'

const customContextPad: ModuleDeclaration = {
  // __init__: ['customContextPadProvider'],
  // customContextPadProvider: ['type', CustomContextPadProvider],
  contextPadProvider: ['type', CustomContextPadProvider],
}

export default customContextPad
