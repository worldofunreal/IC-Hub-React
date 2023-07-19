export const idlFactory = ({ IDL }) => {
  const NFTMetadata = IDL.Record({
    'marketplace' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'avatarURL' : IDL.Text,
    'addedBy' : IDL.Principal,
    'standard' : IDL.Text,
    'canisterID' : IDL.Principal,
  });
  const Projects = IDL.Service({
    'addNFTCollection' : IDL.Func([NFTMetadata], [IDL.Bool, IDL.Text], []),
    'getMyCollections' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, NFTMetadata))],
        ['query'],
      ),
    'getNftsCanisters' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, NFTMetadata))],
        ['query'],
      ),
    'updateAvatarNFTCollection' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Bool, IDL.Text],
        [],
      ),
  });
  return Projects;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
