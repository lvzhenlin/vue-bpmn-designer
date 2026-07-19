export interface Option {
  label: string
  value: string
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
}

export const getUserList = async (params: PageParams): Promise<PageResponse> => {
  const total = 20000
  const { page, pageSize } = params
  const start = (page - 1) * pageSize

  const mockData: Option[] = []
  const baseUsers = [
    { label: '张三', value: 'zhangsan' },
    { label: '李四', value: 'lisi' },
    { label: '王五', value: 'wangwu' },
    { label: '毛六', value: 'maoliu' },
    { label: '钱七', value: 'qianqi' },
    { label: '赵八', value: 'zhaoba' },
    { label: '孙九', value: 'sunjiu' },
    { label: '周十', value: 'zhoushi' },
    { label: '吴十一', value: 'wushiyi' },
    { label: '郑十二', value: 'zhengshier' },
    { label: '王管理员', value: 'admin' },
    { label: '李审批员', value: 'approver' },
  ]

  for (let i = 0; i < pageSize && start + i < total; i++) {
    const baseIndex = (start + i) % baseUsers.length
    const suffix = Math.floor((start + i) / baseUsers.length)
    const base = baseUsers[baseIndex]
    mockData.push({
      label: `${base.label}${suffix > 0 ? suffix : ''}`,
      value: `${base.value}${suffix > 0 ? suffix : ''}`,
    })
  }

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
    { label: '部门A', value: 'deptA' },
    { label: '部门B', value: 'deptB' },
    { label: '部门C', value: 'deptC' },
    { label: '部门D', value: 'deptD' },
    { label: '部门E', value: 'deptE' },
    { label: '财务部', value: 'finance' },
    { label: '人力资源部', value: 'hr' },
    { label: '技术部', value: 'tech' },
    { label: '市场部', value: 'marketing' },
    { label: '运营部', value: 'operations' },
  ]

  for (let i = 0; i < pageSize && start + i < total; i++) {
    const baseIndex = (start + i) % baseGroups.length
    const suffix = Math.floor((start + i) / baseGroups.length)
    const base = baseGroups[baseIndex]
    mockData.push({
      label: `${base.label}${suffix > 0 ? suffix : ''}`,
      value: `${base.value}${suffix > 0 ? suffix : ''}`,
    })
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 200, data: mockData, total })
    }, 200)
  })
}
