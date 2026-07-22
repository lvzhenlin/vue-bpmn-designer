import type { ModuleDeclaration } from 'didi'
import CustomPopupMenuProvider from './CustomPopupMenuProvider'
import ConnectorModule from '../Connector'

const customPopupMenu: ModuleDeclaration = {
  __depends__: [ConnectorModule],
  __init__: ['replaceMenuProvider'],
  replaceMenuProvider: ['type', CustomPopupMenuProvider],
}

export default customPopupMenu
