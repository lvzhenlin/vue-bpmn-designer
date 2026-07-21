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
  console.log('saveProcess >>', params)
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

export interface Option {
  name: string
  id: string
}

export interface PageResponse {
  code: number
  data: Option[]
  total: number
  message?: string
}

export interface PageParams {
  page: number
  pageSize: number
  keyword?: string
  excludeIds?: string[]
}

export const getUserList = async (params: PageParams): Promise<PageResponse> => {
  const total = 20000
  const { page, pageSize } = params
  const start = (page - 1) * pageSize

  const mockData: Option[] = []
  const baseUsers = [
    { name: '张三', id: 'zhangsan' },
    { name: '李四', id: 'lisi' },
    { name: '王五', id: 'wangwu' },
    { name: '毛六', id: 'maoliu' },
    { name: '钱七', id: 'qianqi' },
    { name: '赵八', id: 'zhaoba' },
    { name: '孙九', id: 'sunjiu' },
    { name: '周十', id: 'zhoushi' },
    { name: '吴十一', id: 'wushiyi' },
    { name: '郑十二', id: 'zhengshier' },
    { name: '王管理员', id: 'admin' },
    { name: '李审批员', id: 'approver' },
  ]

  for (let i = 0; i < pageSize && start + i < total; i++) {
    const baseIndex = (start + i) % baseUsers.length
    const suffix = Math.floor((start + i) / baseUsers.length)
    const base = baseUsers[baseIndex]
    mockData.push({
      name: `${base.name}${suffix > 0 ? suffix : ''}`,
      id: `${base.id}${suffix > 0 ? suffix : ''}`,
    })
  }
  console.log('getUserList >>', params)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 200, data: mockData, total })
    }, 200)
  })
}

export const getGroupList = async (params: PageParams): Promise<PageResponse> => {
  const total = 2000
  const { page, pageSize } = params
  const start = (page - 1) * pageSize

  const mockData: Option[] = []
  const baseGroups = [
    { name: '部门A', id: 'deptA' },
    { name: '部门B', id: 'deptB' },
    { name: '部门C', id: 'deptC' },
    { name: '部门D', id: 'deptD' },
    { name: '部门E', id: 'deptE' },
    { name: '财务部', id: 'finance' },
    { name: '人力资源部', id: 'hr' },
    { name: '技术部', id: 'tech' },
    { name: '市场部', id: 'marketing' },
    { name: '运营部', id: 'operations' },
  ]

  for (let i = 0; i < pageSize && start + i < total; i++) {
    const baseIndex = (start + i) % baseGroups.length
    const suffix = Math.floor((start + i) / baseGroups.length)
    const base = baseGroups[baseIndex]
    mockData.push({
      name: `${base.name}${suffix > 0 ? suffix : ''}`,
      id: `${base.id}${suffix > 0 ? suffix : ''}`,
    })
  }
  console.log('getGroupList >>', params)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 200, data: mockData, total })
    }, 200)
  })
}
