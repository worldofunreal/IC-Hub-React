export const idlFactory = ({ IDL }) => {
  const AvatarType = IDL.Variant({
    'url' : IDL.Null,
    'none' : IDL.Null,
    'base64' : IDL.Null,
  });
  const UserStatus = IDL.Variant({
    'incomplete' : IDL.Null,
    'active' : IDL.Null,
    'banned' : IDL.Null,
    'inactive' : IDL.Null,
  });
  const Username = IDL.Text;
  const AvatarType__1 = IDL.Variant({
    'url' : IDL.Null,
    'none' : IDL.Null,
    'base64' : IDL.Null,
  });
  const UserID = IDL.Principal;
  const UserData = IDL.Record({
    'status' : UserStatus,
    'username' : Username,
    'accountID' : IDL.Vec(IDL.Nat8),
    'hashtag' : IDL.Text,
    'avatarType' : AvatarType__1,
    'userID' : UserID,
    'avatar' : IDL.Text,
  });
  const ICHub = IDL.Service({
    'createUser' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'getICPBalance' : IDL.Func([], [IDL.Record({ 'e8s' : IDL.Nat64 })], []),
    'getUserAvatar' : IDL.Func([], [IDL.Text, AvatarType], ['query']),
    'getUserData' : IDL.Func([], [IDL.Opt(UserData)], ['query']),
    'setImageToUser' : IDL.Func([IDL.Text, AvatarType], [IDL.Bool], []),
  });
  return ICHub;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
