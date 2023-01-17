export const idlFactory = ({ IDL }) => {
  const UserID = IDL.Principal;
  const Username = IDL.Text;
  const UserID__1 = IDL.Principal;
  const UserData = IDL.Record({
    'username' : Username,
    'userID' : UserID__1,
    'banned' : IDL.Bool,
  });
  const MessageID = IDL.Nat;
  const MessageData = IDL.Record({
    'username' : Username,
    'userID' : UserID__1,
    'text' : IDL.Text,
    'time' : IDL.Nat32,
  });
  const ChatGroups = IDL.Service({
    'add_text_message' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'get_group_users' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(UserID, UserData))],
        ['query'],
      ),
    'get_messages' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(MessageID, MessageData))],
        ['query'],
      ),
    'get_total_messages' : IDL.Func([], [MessageID], ['query']),
    'is_user_added' : IDL.Func([UserID], [IDL.Bool], ['query']),
    'join_chat' : IDL.Func([UserID, UserData], [IDL.Bool], []),
  });
  return ChatGroups;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
