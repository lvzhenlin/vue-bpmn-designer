/**
 * BPMN 命名空间转换工具
 * 用于在 Flowable 和 Activiti 版本之间转换 XML
 */
export const namespaceConverter = {
  /**
   * 将 XML 从 Flowable 转换为 Activiti
   */
  toActiviti(xml: string): string {
    return xml
      .replace(/flowable:/g, 'activiti:')
      .replace(/xmlns:flowable="http:\/\/flowable\.org\/bpmn"/g, 'xmlns:activiti="http://activiti.org/bpmn"')
      .replace(/targetNamespace="http:\/\/flowable\.org\/bpmn"/g, 'targetNamespace="http://activiti.org/bpmn"')
  },

  /**
   * 将 XML 从 Activiti 转换为 Flowable
   */
  toFlowable(xml: string): string {
    return xml
      .replace(/activiti:/g, 'flowable:')
      .replace(/xmlns:activiti="http:\/\/activiti\.org\/bpmn"/g, 'xmlns:flowable="http://flowable.org/bpmn"')
      .replace(/targetNamespace="http:\/\/activiti\.org\/bpmn"/g, 'targetNamespace="http://flowable.org/bpmn"')
  },

  /**
   * 判断 XML 属于哪个版本
   */
  detectVersion(xml: string): 'flowable' | 'activiti' | 'unknown' {
    if (xml.includes('xmlns:flowable') || xml.includes('xmlns:activiti')) {
      return xml.includes('xmlns:flowable') ? 'flowable' : 'activiti'
    }
    return 'unknown'
  },

  /**
   * 转换 XML 到目标版本
   */
  convert(xml: string, targetVersion: 'flowable' | 'activiti'): string {
    const currentVersion = this.detectVersion(xml)
    if (currentVersion === targetVersion) {
      return xml
    }
    if (currentVersion === 'flowable') {
      return this.toActiviti(xml)
    }
    return this.toFlowable(xml)
  }
}