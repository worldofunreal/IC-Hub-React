export const idlFactory = ({ IDL }) => {
  const PrivateChats = IDL.Service({});
  return PrivateChats;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
