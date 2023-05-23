export const idlFactory = ({ IDL }) => {
  const UserID__1 = IDL.Principal;
  const GroupID__1 = IDL.Nat;
  const Username__1 = IDL.Text;
  const GroupID = IDL.Nat;
  const GroupData = IDL.Record({
    'isDirect' : IDL.Bool,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'groupID' : GroupID,
    'isPrivate' : IDL.Bool,
    'canister' : IDL.Text,
    'avatar' : IDL.Text,
  });
  const Username = IDL.Text;
  const UserID = IDL.Principal;
  const UserData = IDL.Record({
    'username' : Username,
    'userSince' : IDL.Nat64,
    'userID' : UserID,
    'banned' : IDL.Bool,
    'description' : IDL.Text,
    'avatar' : IDL.Text,
  });
  const Friends = IDL.Record({
    'pending' : IDL.Vec(UserID),
    'list' : IDL.Vec(UserID),
  });
  const UserFavorite = IDL.Record({ 'order' : IDL.Nat, 'project' : UserID });
  const UserFriendData = IDL.Record({
    'status' : IDL.Text,
    'username' : Username,
    'userID' : UserID,
    'avatar' : IDL.Text,
  });
  const UserGroups = IDL.Record({ 'groups' : IDL.Vec(GroupID) });
  const UserSearchData = IDL.Record({
    'status' : IDL.Text,
    'username' : Username,
    'userID' : UserID,
    'commonFriends' : IDL.Nat,
    'commonGroups' : IDL.Nat,
    'avatar' : IDL.Text,
  });
  const ChatCore = IDL.Service({
    'addUserFavApp' : IDL.Func([UserID__1], [IDL.Bool], []),
    'add_user_to_group' : IDL.Func(
        [GroupID__1, UserID__1],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'approveUserPendingGroup' : IDL.Func(
        [GroupID__1, UserID__1],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'ban_user' : IDL.Func([UserID__1], [IDL.Bool], []),
    'changeGroupAvatar' : IDL.Func(
        [GroupID__1, IDL.Text],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'changeGroupDescription' : IDL.Func(
        [GroupID__1, IDL.Text],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'changeGroupName' : IDL.Func(
        [GroupID__1, IDL.Text],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'changeGroupPrivacy' : IDL.Func(
        [GroupID__1, IDL.Bool],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'changeUserDescription' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'create_group' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Bool, IDL.Text],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'create_private_chat' : IDL.Func(
        [UserID__1],
        [IDL.Bool, IDL.Text, IDL.Nat],
        [],
      ),
    'create_user_profile' : IDL.Func(
        [Username__1, IDL.Text],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'friendRequest' : IDL.Func([UserID__1], [IDL.Bool, IDL.Text], []),
    'getAllGroups' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(GroupID__1, GroupData))],
        ['query'],
      ),
    'getAllUsers' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(UserID__1, UserData))],
        ['query'],
      ),
    'getFriendListData' : IDL.Func([], [IDL.Opt(Friends)], ['query']),
    'getIsFriend' : IDL.Func([UserID__1], [IDL.Nat], ['query']),
    'getMyFavorites' : IDL.Func([], [IDL.Vec(UserFavorite)], ['query']),
    'getMyFriendRequests' : IDL.Func([], [IDL.Vec(UserFriendData)], ['query']),
    'getMyFriends' : IDL.Func([], [IDL.Vec(UserFriendData)], ['query']),
    'getPrivateChat' : IDL.Func([UserID__1], [IDL.Nat, IDL.Bool], ['query']),
    'getUserAvatar' : IDL.Func([UserID__1], [IDL.Text], []),
    'getUserGroupsAdmin' : IDL.Func(
        [UserID__1],
        [IDL.Opt(UserGroups)],
        ['query'],
      ),
    'getUserID' : IDL.Func([], [IDL.Principal], []),
    'getUsername' : IDL.Func([UserID__1], [Username__1], ['query']),
    'getUsersActivity' : IDL.Func([UserID__1], [IDL.Text], ['query']),
    'get_user' : IDL.Func([UserID__1], [IDL.Opt(UserData)], ['query']),
    'get_user_groups' : IDL.Func([], [IDL.Vec(GroupData)], ['query']),
    'hasUserRequestedJoin' : IDL.Func([GroupID__1], [IDL.Bool], ['query']),
    'initialize' : IDL.Func([], [IDL.Bool], []),
    'is_used_added' : IDL.Func([GroupID__1, UserID__1], [IDL.Bool], ['query']),
    'logUserActivity' : IDL.Func(
        [IDL.Text, IDL.Bool],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'rejectFriendRequest' : IDL.Func([UserID__1], [IDL.Bool, IDL.Text], []),
    'rejectUserPendingGroup' : IDL.Func(
        [GroupID__1, UserID__1],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'remove_user_from_group' : IDL.Func(
        [UserID__1, GroupID__1],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'search_group_by_name' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Vec(GroupData))],
        ['query'],
      ),
    'search_user_by_name' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Vec(UserSearchData))],
        ['query'],
      ),
    'setImageToUser' : IDL.Func([IDL.Text], [IDL.Bool], []),
  });
  return ChatCore;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
