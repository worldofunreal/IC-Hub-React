import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type AccountIdentifier = Uint8Array | number[];
export type AvatarType = { 'url' : null } |
  { 'none' : null } |
  { 'base64' : null };
export type AvatarType__1 = { 'url' : null } |
  { 'none' : null } |
  { 'base64' : null };
export type BlockIndex = bigint;
export interface ICHub {
  'createUser' : ActorMethod<[string, string], boolean>,
  'getBalanceFromAccount' : ActorMethod<
    [AccountIdentifier],
    { 'e8s' : bigint }
  >,
  'getICPBalance' : ActorMethod<[], { 'e8s' : bigint }>,
  'getUserAvatar' : ActorMethod<[], [string, AvatarType]>,
  'getUserData' : ActorMethod<[], [] | [UserData]>,
  'sendICP' : ActorMethod<
    [bigint, AccountIdentifier],
    [boolean, string, [] | [TransferResult]]
  >,
  'setImageToUser' : ActorMethod<[string, AvatarType], boolean>,
}
export interface ICP { 'e8s' : bigint }
export type TransferError = {
    'TxTooOld' : { 'allowed_window_nanos' : bigint }
  } |
  { 'BadFee' : { 'expected_fee' : ICP } } |
  { 'TxDuplicate' : { 'duplicate_of' : BlockIndex } } |
  { 'TxCreatedInFuture' : null } |
  { 'InsufficientFunds' : { 'balance' : ICP } };
export type TransferResult = { 'Ok' : BlockIndex } |
  { 'Err' : TransferError };
export interface UserData {
  'status' : UserStatus,
  'username' : Username,
  'accountID' : Uint8Array | number[],
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
