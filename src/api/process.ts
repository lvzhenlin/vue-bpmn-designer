export interface SaveProcessRequest {
  xmlContent: string
  processName?: string
}

export interface SaveProcessResponse {
  code: number
  message: string
  data?: {
    id: string
    processName: string
  }
}

export const saveProcess = async (params: SaveProcessRequest): Promise<SaveProcessResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '保存成功',
        data: {
          id: 'proc-' + Date.now(),
          processName: params.processName || '未命名流程',
        },
      })
    }, 500)
  })
}
