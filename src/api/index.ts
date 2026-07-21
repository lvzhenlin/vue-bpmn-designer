import type { SaveProcessRequest, SaveProcessResponse, PageParams, PageResponse, Option } from './processDesigner'
import { saveProcess as defaultSaveProcess, getUserList as defaultGetUserList, getGroupList as defaultGetGroupList } from './processDesigner'

export interface ApiConfig {
  saveProcess?: (params: SaveProcessRequest) => Promise<SaveProcessResponse>
  getUserList?: (params: PageParams) => Promise<PageResponse>
  getGroupList?: (params: PageParams) => Promise<PageResponse>
}

let apiConfig: ApiConfig = {}

export const setApiConfig = (config: ApiConfig): void => {
  apiConfig = { ...apiConfig, ...config }
}

export const saveProcess = (params: SaveProcessRequest): Promise<SaveProcessResponse> => {
  return apiConfig.saveProcess ? apiConfig.saveProcess(params) : defaultSaveProcess(params)
}

export const getUserList = (params: PageParams): Promise<PageResponse> => {
  return apiConfig.getUserList ? apiConfig.getUserList(params) : defaultGetUserList(params)
}

export const getGroupList = (params: PageParams): Promise<PageResponse> => {
  return apiConfig.getGroupList ? apiConfig.getGroupList(params) : defaultGetGroupList(params)
}

export type { SaveProcessRequest, SaveProcessResponse, PageParams, PageResponse, Option }
