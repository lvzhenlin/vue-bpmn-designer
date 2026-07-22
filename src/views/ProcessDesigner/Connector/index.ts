import type { ModuleDeclaration } from 'didi'
import ConnectorMenuProvider from './ConnectorMenuProvider'
import ConnectorChooser from './ConnectorChooser'

const connectorTemplate: ModuleDeclaration = {
  __init__: ['connectorMenuProvider', 'connectorChooser'],
  connectorMenuProvider: ['type', ConnectorMenuProvider],
  connectorChooser: ['type', ConnectorChooser],
}

export default connectorTemplate
