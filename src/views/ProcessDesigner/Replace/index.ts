import type { ModuleDeclaration } from 'didi'
import CustomBpmnReplace from './CustomBpmnReplace'

const customReplace: ModuleDeclaration = {
  __init__: ['replace'],
  replace: ['type', CustomBpmnReplace],
}

export default customReplace
