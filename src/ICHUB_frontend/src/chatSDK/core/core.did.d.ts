import type { Principal } from '@dfinity/principal';
export interface ChatCore {
  'add_user_to_group' : (arg_0: GroupID__1, arg_1: UserID) => Promise<
      [boolean, string]
    >,
  'ban_user' : (arg_0: UserID) => Promise<boolean>,
  'create_group' : (arg_0: string, arg_1: boolean, arg_2: boolean) => Promise<
      [boolean, string]
    >,
  'create_user_profile' : (arg_0: Username__1) => Promise<boolean>,
  'get_user' : (arg_0: UserID) => Promise<[] | [UserData]>,
  'get_user_groups' : () => Promise<[] | [UserGroups]>,
  'initialize' : () => Promise<boolean>,
}
export interface GroupData {
  'isDirect' : boolean,
  'owner' : Principal,
  'name' : string,
  'groupID' : GroupID,
  'isPrivate' : boolean,
  'canister' : string,
}
export type GroupID = bigint;
export type GroupID__1 = bigint;
export interface UserData {
  'username' : Username,
  'userID' : UserID__1,
  'banned' : boolean,
}
export interface UserGroups { 'groups' : Array<GroupData> }
export type UserID = Principal;
export type UserID__1 = Principal;
export type Username = string;
export type Username__1 = string;
export interface _SERVICE extends ChatCore {}
