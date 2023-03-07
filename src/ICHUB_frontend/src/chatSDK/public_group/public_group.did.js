export const idlFactory = ({ IDL }) => {
  const UserID = IDL.Principal;
  const UserRoles = IDL.Variant({
    'admin' : IDL.Null,
    'nouser' : IDL.Null,
    'owner' : IDL.Null,
    'user' : IDL.Null,
    'banned' : IDL.Null,
  });
  const UserID__1 = IDL.Principal;
  const RequestJoinData = IDL.Record({
    'dateRequested' : IDL.Nat64,
    'userID' : UserID__1,
    'seenByAdmin' : IDL.Bool,
  });
  const Username = IDL.Text;
  const FullUserData = IDL.Record({
    'username' : Username,
    'userSince' : IDL.Nat64,
    'userID' : UserID__1,
    'role' : IDL.Nat,
    'banned' : IDL.Bool,
    'avatar' : IDL.Text,
  });
  const MessageID = IDL.Nat;
  const MessageData = IDL.Record({
    'username' : Username,
    'userID' : UserID__1,
    'text' : IDL.Text,
    'time' : IDL.Nat64,
  });
  const UserData = IDL.Record({
    'username' : Username,
    'userSince' : IDL.Nat64,
    'userID' : UserID__1,
    'banned' : IDL.Bool,
    'description' : IDL.Text,
    'avatar' : IDL.Text,
  });
  const ChatGroups = IDL.Service({
    'add_text_message' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'approveUserPending' : IDL.Func([UserID], [IDL.Bool], []),
    'exit_chat' : IDL.Func([UserID], [IDL.Bool], []),
    'getCaller' : IDL.Func([], [IDL.Principal], ['query']),
    'getUserRole' : IDL.Func([], [UserRoles], ['query']),
    'getUsersPending' : IDL.Func([], [IDL.Vec(RequestJoinData)], ['query']),
    'get_group_users' : IDL.Func([], [IDL.Vec(FullUserData)], ['query']),
    'get_messages' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(MessageID, MessageData))],
        ['query'],
      ),
    'get_total_messages' : IDL.Func([], [MessageID], ['query']),
    'hasUserRequestedJoin' : IDL.Func([UserID], [IDL.Bool], ['query']),
    'is_user_added' : IDL.Func([UserID], [IDL.Bool], ['query']),
    'join_chat' : IDL.Func([UserID, UserData], [IDL.Bool], []),
    'rejectUserPending' : IDL.Func([UserID], [IDL.Bool], []),
    'transferOwner' : IDL.Func([UserID], [IDL.Bool, IDL.Text], []),
    'user_request_join' : IDL.Func([UserID], [IDL.Bool, IDL.Text], []),
  });
  return ChatGroups;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
