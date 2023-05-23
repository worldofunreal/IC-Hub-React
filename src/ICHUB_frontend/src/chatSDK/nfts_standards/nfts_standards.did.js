export const idlFactory = ({ IDL }) => {
  const NFTMetadata = IDL.Record({
    'marketplace' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'addedBy' : IDL.Principal,
    'standard' : IDL.Text,
    'canisterID' : IDL.Principal,
  });
  const Projects = IDL.Service({
    'addNFTCollection' : IDL.Func([NFTMetadata], [IDL.Bool, IDL.Text], []),
    'getNftsCanisters' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, NFTMetadata))],
        ['query'],
      ),
  });
  return Projects;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
