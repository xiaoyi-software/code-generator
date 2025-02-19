import { DataServiceRequest, Query } from './DataServiceRequest'

export class MessageClientService extends DataServiceRequest {
  getUserIdentity(): Promise<any> {
    return this.request(`/api/MessageClient/identity`, {}, 'get')
  }

  getGroups(): Promise<any> {
    return this.request(`/api/MessageClient/groups`, {}, 'get')
  }

  getGroupUsers(groupId: string): Promise<any> {
    return this.request(`/api/MessageClient/getGroupUsers/${groupId}`, {}, 'get')
  }

  getUserFriends(): Promise<any> {
    return this.request(`/api/MessageClient/getUserFriends`, {}, 'get')
  }

  /**
   * 查询组的历史消息
   * @param query {startTime,endTime,groupId,pageIndex,pageSize,orderBy,name}
   * @returns
   */
  getGroupMessage(query: Query): Promise<any> {
    return this.request(`/api/MessageClient/group-message`, query, 'get')
  }

  //#region GroupOperation

  /**
   * 加入用户组
   * @param userId 用户ID
   * @returns
   */
  joinUserGroup(userId: string): Promise<any> {
    return this.request(`/api/MessageClient/join-user-group/${userId}`, {}, 'post')
  }

  /**
   * 离开用户组
   * @param userId 用户ID
   * @returns
   */
  leaveUserGroup(userId: string): Promise<any> {
    return this.request(`/api/MessageClient/leave-user-group/${userId}`, {}, 'post')
  }

  /**
   *
   * @param groupId 加入组
   * @returns
   */
  joinGroup(data: { name: string; secret: string }): Promise<any> {
    return this.request(`/api/MessageClient/join-group`, data, 'post')
  }

  /**
   *
   * @param groupId 离开组
   * @returns
   */
  leaveGroup(groupId: string): Promise<any> {
    return this.request(`/api/MessageClient/leave-group/${groupId}`, {}, 'post')
  }

  addGroup(data: any): Promise<any> {
    return this.request(`/api/MessageClient/add-group`, data, 'post')
  }

  removeGroup(id: string): Promise<any> {
    return this.request(`/api/MessageClient/remove-group/${id}`, {}, 'post')
  }

  addFriend(friend: string): Promise<any> {
    return this.request(`/api/MessageClient/add-friend/${friend}`, {}, 'post')
  }

  removeFriend(friend: string): Promise<any> {
    return this.request(`/api/MessageClient/remove-friend/${friend}`, {}, 'post')
  }

  acceptFriend(friend: string): Promise<any> {
    return this.request(`/api/MessageClient/accept-friend/${friend}`, {}, 'post')
  }

  rejectFriend(friend: string): Promise<any> {
    return this.request(`/api/MessageClient/reject-friend/${friend}`, {}, 'post')
  }

  //#endregion

  //#region 用户消息

  /**
   * 获取一条消息
   * @param id 消息ID
   * @returns
   */
  getUserMessage(id: string): Promise<any> {
    return this.request(`/api/MessageClient/user-message/${id}`, {}, 'get')
  }

  /**
   * 用户消息分页
   * @param query {friendId,groupId,startTime,endTime,isReadonly,isShown,pageIndex,pageSize,orderBy,name}
   * @returns
   */
  queryUserMessage(query: Query): Promise<any> {
    return this.request(`/api/MessageClient/user-message`, {}, 'get')
  }

  /**
   * 删除一条用户消息
   * @param id 消息ID
   * @returns
   */
  deleteUserMessage(id: string): Promise<any> {
    return this.request(`/api/MessageClient/user-message/${id}`, {}, 'delete')
  }

  /**
   * 将用户消息标记为已阅读
   * @param data {groupId,startTime,endTime,messageId}
   * @returns
   */
  shownUserMessage(data: any): Promise<any> {
    return this.request(`/api/MessageClient/shownUserMessage`, {}, 'post')
  }

  //#endregion

  //#region 通知消息

  getNotifyProvider(): Promise<any> {
    return this.request(`/api/MessageClient/notify-provider`, {}, 'get')
  }

  /**
   * 获取一条消息
   * @param id 消息ID
   * @returns
   */
  getNotifyMessage(id: string): Promise<any> {
    return this.request(`/api/MessageClient/notify-message/${id}`, {}, 'get')
  }

  /**
   * 通知消息分页
   * @param query {groupId,provideName,startTime,endTime,isReadonly,isShown,pageIndex,pageSize,orderBy,name}
   * @returns
   */
  queryNotifyMessage(query: Query): Promise<any> {
    return this.request(`/api/MessageClient/notify-message`, {}, 'get')
  }

  /**
   * 删除一条通知消息
   * @param id 消息ID
   * @returns
   */
  deleteNotifyMessage(id: string): Promise<any> {
    return this.request(`/api/MessageClient/notify-message/${id}`, {}, 'delete')
  }

  /**
   * 将通知消息标记为已阅读
   * @param data {groupId,startTime,endTime,messageId}
   * @returns
   */
  shownNotifyMessage(data: any): Promise<any> {
    return this.request(`/api/MessageClient/shownNotifyMessage`, {}, 'post')
  }

  //#endregion
}

const messageClientService = new MessageClientService()
export default messageClientService
