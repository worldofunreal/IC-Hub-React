export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
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
  const BlockIndex = IDL.Nat64;
  const ICP = IDL.Record({ 'e8s' : IDL.Nat64 });
  const TransferError = IDL.Variant({
    'TxTooOld' : IDL.Record({ 'allowed_window_nanos' : IDL.Nat64 }),
    'BadFee' : IDL.Record({ 'expected_fee' : ICP }),
    'TxDuplicate' : IDL.Record({ 'duplicate_of' : BlockIndex }),
    'TxCreatedInFuture' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : ICP }),
  });
  const TransferResult = IDL.Variant({
    'Ok' : BlockIndex,
    'Err' : TransferError,
  });
  const ICHub = IDL.Service({
    'createUser' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'getBalanceFromAccount' : IDL.Func(
        [AccountIdentifier],
        [IDL.Record({ 'e8s' : IDL.Nat64 })],
        [],
      ),
    'getICPBalance' : IDL.Func([], [IDL.Record({ 'e8s' : IDL.Nat64 })], []),
    'getUserAvatar' : IDL.Func([], [IDL.Text, AvatarType], ['query']),
    'getUserData' : IDL.Func([], [IDL.Opt(UserData)], ['query']),
    'mySubaccount' : IDL.Func([], [AccountIdentifier], ['query']),
    'sendICP' : IDL.Func(
        [IDL.Nat64, AccountIdentifier],
        [IDL.Bool, IDL.Text, IDL.Opt(TransferResult)],
        [],
      ),
    'setImageToUser' : IDL.Func([IDL.Text, AvatarType], [IDL.Bool], []),
    'userSubaccount' : IDL.Func(
        [IDL.Principal],
        [AccountIdentifier],
        ['query'],
      ),
  });
  return ICHub;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
