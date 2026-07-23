import type { ProcessRequest, ProcessResponse, PageRequest, PageResponse, Option } from './processDesigner'
import { saveProcess as defaultSaveProcess, getUserList as defaultGetUserList, getGroupList as defaultGetGroupList } from './processDesigner'

export interface ApiConfig {
  saveProcess?: (params: ProcessRequest) => Promise<ProcessResponse>
  getUserList?: (params: PageRequest) => Promise<PageResponse>
  getGroupList?: (params: PageRequest) => Promise<PageResponse>
}

let apiConfig: ApiConfig = {}

export const setApiConfig = (config: ApiConfig): void => {
  apiConfig = { ...apiConfig, ...config }
}

export const saveProcess = (params: ProcessRequest): Promise<ProcessResponse> => {
  return apiConfig.saveProcess ? apiConfig.saveProcess(params) : defaultSaveProcess(params)
}

export const getUserList = (params: PageRequest): Promise<PageResponse> => {
  return apiConfig.getUserList ? apiConfig.getUserList(params) : defaultGetUserList(params)
}

export const getGroupList = (params: PageRequest): Promise<PageResponse> => {
  return apiConfig.getGroupList ? apiConfig.getGroupList(params) : defaultGetGroupList(params)
}

export type { ProcessRequest, ProcessResponse, PageRequest, PageResponse, Option }
