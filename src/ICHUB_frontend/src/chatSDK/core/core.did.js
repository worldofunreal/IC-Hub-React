export const idlFactory = ({ IDL }) => {
  const GroupID__1 = IDL.Nat;
  const UserID = IDL.Principal;
  const Username__1 = IDL.Text;
  const Username = IDL.Text;
  const UserID__1 = IDL.Principal;
  const UserData = IDL.Record({
    'username' : Username,
    'userID' : UserID__1,
    'banned' : IDL.Bool,
  });
  const GroupID = IDL.Nat;
  const GroupData = IDL.Record({
    'isDirect' : IDL.Bool,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'groupID' : GroupID,
    'isPrivate' : IDL.Bool,
    'canister' : IDL.Text,
  });
  const UserGroups = IDL.Record({ 'groups' : IDL.Vec(GroupData) });
  const ChatCore = IDL.Service({
    'add_user_to_group' : IDL.Func(
        [GroupID__1, UserID],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'ban_user' : IDL.Func([UserID], [IDL.Bool], []),
    'create_group' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Bool],
        [IDL.Bool, IDL.Text],
        [],
      ),
    'create_user_profile' : IDL.Func([Username__1], [IDL.Bool], []),
    'get_user' : IDL.Func([UserID], [IDL.Opt(UserData)], ['query']),
    'get_user_groups' : IDL.Func([], [IDL.Opt(UserGroups)], ['query']),
    'initialize' : IDL.Func([], [IDL.Bool], []),
  });
  return ChatCore;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
