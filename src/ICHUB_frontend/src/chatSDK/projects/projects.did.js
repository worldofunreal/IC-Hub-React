export const idlFactory = ({ IDL }) => {
  const ProjectNews = IDL.Record({
    'title' : IDL.Text,
    'textButton' : IDL.Text,
    'content' : IDL.Text,
    'imageNews' : IDL.Text,
    'newsId' : IDL.Nat,
    'linkButton' : IDL.Text,
  });
  const NFTsCollections = IDL.Record({ 'collections' : IDL.Vec(IDL.Text) });
  const ProjectData = IDL.Record({
    'id' : IDL.Nat,
    'appCategoryIndex' : IDL.Nat,
    'twitter' : IDL.Text,
    'logo' : IDL.Text,
    'name' : IDL.Text,
    'banner' : IDL.Text,
    'dscvrPortal' : IDL.Text,
    'catalyze' : IDL.Text,
    'distrikt' : IDL.Text,
    'nftCollections' : NFTsCollections,
    'blockchain' : IDL.Text,
    'currentVersion' : IDL.Text,
    'launchLink' : IDL.Text,
    'newVersion' : IDL.Text,
    'patchNotes' : IDL.Text,
    'openChat' : IDL.Text,
  });
  const UserID = IDL.Principal;
  const ProjectFullData = IDL.Record({
    'data' : ProjectData,
    'news' : IDL.Opt(IDL.Vec(ProjectNews)),
    'user' : UserID,
  });
  const Projects = IDL.Service({
    'addNewsToProject' : IDL.Func([ProjectNews], [IDL.Bool, IDL.Text], []),
    'createProject' : IDL.Func([ProjectData], [IDL.Bool, IDL.Text], []),
    'getAllProjects' : IDL.Func([], [IDL.Vec(ProjectFullData)], ['query']),
    'getMyProject' : IDL.Func([], [IDL.Opt(ProjectData)], ['query']),
    'getMyProjectNews' : IDL.Func(
        [],
        [IDL.Opt(IDL.Vec(ProjectNews))],
        ['query'],
      ),
    'getProjectById' : IDL.Func(
        [IDL.Nat],
        [IDL.Bool, IDL.Opt(ProjectData)],
        ['query'],
      ),
    'getProjectNewsById' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(IDL.Vec(ProjectNews))],
        ['query'],
      ),
    'updateProject' : IDL.Func(
        [IDL.Nat, ProjectData],
        [IDL.Bool, IDL.Text],
        [],
      ),
  });
  return Projects;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
