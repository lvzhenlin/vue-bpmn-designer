import CustomBpmnFactory from './CustomBpmnFactory'

const customModeling = {
  __init__: ['bpmnFactory'],
  bpmnFactory: ['type', CustomBpmnFactory],
}

export default customModeling
