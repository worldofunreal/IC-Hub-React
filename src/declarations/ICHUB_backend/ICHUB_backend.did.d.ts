import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type AccountIdentifier = Uint8Array;
export type AvatarType = { 'url' : null } |
  { 'none' : null } |
  { 'base64' : null };
export type AvatarType__1 = { 'url' : null } |
  { 'none' : null } |
  { 'base64' : null };
export interface ICHub {
  'createUser' : ActorMethod<[string, string], boolean>,
  'getBalanceFromAccount' : ActorMethod<
    [AccountIdentifier],
    { 'e8s' : bigint },
  >,
  'getICPBalance' : ActorMethod<[], { 'e8s' : bigint }>,
  'getUserAvatar' : ActorMethod<[], [string, AvatarType]>,
  'getUserData' : ActorMethod<[], [] | [UserData]>,
  'setImageToUser' : ActorMethod<[string, AvatarType], boolean>,
}
export interface UserData {
  'status' : UserStatus,
  'username' : Username,
  'accountID' : Uint8Array,
  'hashtag' : string,
  'avatarType' : AvatarType__1,
  'userID' : UserID,
  'avatar' : string,
}
export type UserID = Principal;
export type UserStatus = { 'incomplete' : null } |
  { 'active' : null } |
  { 'banned' : null } |
  { 'inactive' : null };
export type Username = string;
export interface _SERVICE extends ICHub {}
