import type { Principal } from '@dfinity/principal';
export interface ChatGroups {
  'add_text_message' : (arg_0: string) => Promise<boolean>,
  'get_group_users' : () => Promise<Array<[UserID, UserData]>>,
  'get_messages' : () => Promise<Array<[MessageID, MessageData]>>,
  'get_total_messages' : () => Promise<MessageID>,
  'is_user_added' : (arg_0: UserID) => Promise<boolean>,
  'join_chat' : (arg_0: UserID, arg_1: UserData) => Promise<boolean>,
}
export interface MessageData {
  'username' : Username,
  'userID' : UserID__1,
  'text' : string,
  'time' : number,
}
export type MessageID = bigint;
export interface UserData {
  'username' : Username,
  'userID' : UserID__1,
  'banned' : boolean,
}
export type UserID = Principal;
export type UserID__1 = Principal;
export type Username = string;
export interface _SERVICE extends ChatGroups {}
