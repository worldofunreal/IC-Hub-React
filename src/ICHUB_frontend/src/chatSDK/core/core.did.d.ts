import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface ChatCore {
  'add_user_to_group' : ActorMethod<[GroupID__1, UserID__1], [boolean, string]>,
  'approveUserPendingGroup' : ActorMethod<
    [GroupID__1, UserID__1],
    [boolean, string],
  >,
  'ban_user' : ActorMethod<[UserID__1], boolean>,
  'changeGroupAvatar' : ActorMethod<[GroupID__1, string], [boolean, string]>,
  'changeGroupDescription' : ActorMethod<
    [GroupID__1, string],
    [boolean, string],
  >,
  'changeGroupName' : ActorMethod<[GroupID__1, string], [boolean, string]>,
  'changeGroupPrivacy' : ActorMethod<[GroupID__1, boolean], [boolean, string]>,
  'changeUserDescription' : ActorMethod<[string], boolean>,
  'create_group' : ActorMethod<
    [string, boolean, boolean, string],
    [boolean, string],
  >,
  'create_private_chat' : ActorMethod<[UserID__1], [boolean, string, bigint]>,
  'create_user_profile' : ActorMethod<[Username__1, string], [boolean, string]>,
  'friendRequest' : ActorMethod<[UserID__1], [boolean, string]>,
  'getAllGroups' : ActorMethod<[], Array<[GroupID__1, GroupData]>>,
  'getAllUsers' : ActorMethod<[], Array<[UserID__1, UserData]>>,
  'getFriendListData' : ActorMethod<[], [] | [Friends]>,
  'getIsFriend' : ActorMethod<[UserID__1], bigint>,
  'getMyFriendRequests' : ActorMethod<[], Array<UserFriendData>>,
  'getMyFriends' : ActorMethod<[], Array<UserFriendData>>,
  'getPrivateChat' : ActorMethod<[UserID__1], [bigint, boolean]>,
  'getUserAvatar' : ActorMethod<[UserID__1], string>,
  'getUserGroupsAdmin' : ActorMethod<[UserID__1], [] | [UserGroups]>,
  'getUserID' : ActorMethod<[], Principal>,
  'getUsername' : ActorMethod<[UserID__1], Username__1>,
  'getUsersActivity' : ActorMethod<[UserID__1], [] | [string]>,
  'get_user' : ActorMethod<[UserID__1], [] | [UserData]>,
  'get_user_groups' : ActorMethod<[], Array<GroupData>>,
  'hasUserRequestedJoin' : ActorMethod<[GroupID__1], boolean>,
  'initialize' : ActorMethod<[], boolean>,
  'is_used_added' : ActorMethod<[GroupID__1, UserID__1], boolean>,
  'logUserActivity' : ActorMethod<[string], [boolean, string]>,
  'rejectFriendRequest' : ActorMethod<[UserID__1], [boolean, string]>,
  'rejectUserPendingGroup' : ActorMethod<
    [GroupID__1, UserID__1],
    [boolean, string],
  >,
  'remove_user_from_group' : ActorMethod<
    [UserID__1, GroupID__1],
    [boolean, string],
  >,
  'search_group_by_name' : ActorMethod<[string], [] | [Array<GroupData>]>,
  'search_user_by_name' : ActorMethod<[string], [] | [Array<UserSearchData>]>,
  'setImageToUser' : ActorMethod<[string], boolean>,
}
export interface Friends { 'pending' : Array<UserID>, 'list' : Array<UserID> }
export interface GroupData {
  'isDirect' : boolean,
  'owner' : Principal,
  'name' : string,
  'description' : string,
  'groupID' : GroupID,
  'isPrivate' : boolean,
  'canister' : string,
  'avatar' : string,
}
export type GroupID = bigint;
export type GroupID__1 = bigint;
export interface UserData {
  'username' : Username,
  'userSince' : bigint,
  'userID' : UserID,
  'banned' : boolean,
  'description' : string,
  'avatar' : string,
}
export interface UserFriendData {
  'status' : string,
  'username' : Username,
  'userID' : UserID,
  'avatar' : string,
}
export interface UserGroups { 'groups' : Array<GroupID> }
export type UserID = Principal;
export type UserID__1 = Principal;
export interface UserSearchData {
  'status' : string,
  'username' : Username,
  'userID' : UserID,
  'commonFriends' : bigint,
  'commonGroups' : bigint,
  'avatar' : string,
}
export type Username = string;
export type Username__1 = string;
export interface _SERVICE extends ChatCore {}
