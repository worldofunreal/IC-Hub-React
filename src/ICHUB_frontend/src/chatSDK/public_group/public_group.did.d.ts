import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface ChatGroups {
  'add_text_message' : ActorMethod<[string], boolean>,
  'approveUserPending' : ActorMethod<[UserID], boolean>,
  'exit_chat' : ActorMethod<[UserID], boolean>,
  'getCaller' : ActorMethod<[], Principal>,
  'getUserRole' : ActorMethod<[], UserRoles>,
  'getUsersPending' : ActorMethod<[], Array<RequestJoinData>>,
  'get_group_users' : ActorMethod<[], Array<FullUserData>>,
  'get_messages' : ActorMethod<[], Array<[MessageID, MessageData]>>,
  'get_total_messages' : ActorMethod<[], MessageID>,
  'hasUserRequestedJoin' : ActorMethod<[UserID], boolean>,
  'is_user_added' : ActorMethod<[UserID], boolean>,
  'join_chat' : ActorMethod<[UserID, UserData], boolean>,
  'rejectUserPending' : ActorMethod<[UserID], boolean>,
  'transferOwner' : ActorMethod<[UserID], [boolean, string]>,
  'user_request_join' : ActorMethod<[UserID], [boolean, string]>,
}
export interface FullUserData {
  'username' : Username,
  'userSince' : bigint,
  'userID' : UserID__1,
  'role' : bigint,
  'banned' : boolean,
  'avatar' : string,
}
export interface MessageData {
  'username' : Username,
  'userID' : UserID__1,
  'text' : string,
  'time' : bigint,
}
export type MessageID = bigint;
export interface RequestJoinData {
  'dateRequested' : bigint,
  'userID' : UserID__1,
  'seenByAdmin' : boolean,
}
export interface UserData {
  'username' : Username,
  'userSince' : bigint,
  'userID' : UserID__1,
  'banned' : boolean,
  'description' : string,
  'avatar' : string,
}
export type UserID = Principal;
export type UserID__1 = Principal;
export type UserRoles = { 'admin' : null } |
  { 'nouser' : null } |
  { 'owner' : null } |
  { 'user' : null } |
  { 'banned' : null };
export type Username = string;
export interface _SERVICE extends ChatGroups {}
