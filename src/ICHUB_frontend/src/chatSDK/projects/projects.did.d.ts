import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface NFTsCollections { 'collections' : Array<string> }
export interface ProjectData {
  'id' : bigint,
  'appCategoryIndex' : bigint,
  'twitter' : string,
  'logo' : string,
  'name' : string,
  'banner' : string,
  'description' : string,
  'dscvrPortal' : string,
  'catalyze' : string,
  'distrikt' : string,
  'nftCollections' : NFTsCollections,
  'blockchain' : string,
  'currentVersion' : string,
  'launchLink' : string,
  'newVersion' : string,
  'patchNotes' : string,
  'openChat' : string,
}
export interface ProjectFullData {
  'data' : ProjectData,
  'news' : [] | [Array<ProjectNews>],
  'user' : UserID,
}
export interface ProjectNews {
  'title' : string,
  'textButton' : string,
  'content' : string,
  'imageNews' : string,
  'newsId' : bigint,
  'linkButton' : string,
}
export interface Projects {
  'addNewsToProject' : ActorMethod<[ProjectNews], [boolean, string]>,
  'createProject' : ActorMethod<[ProjectData], [boolean, string]>,
  'deleteVersion' : ActorMethod<[bigint], [boolean, string]>,
  'getAllProjects' : ActorMethod<[], Array<ProjectFullData>>,
  'getMyProject' : ActorMethod<[], [] | [ProjectData]>,
  'getMyProjectNews' : ActorMethod<[], [] | [Array<ProjectNews>]>,
  'getMyProjectsVersions' : ActorMethod<[], [] | [Array<VersionData>]>,
  'getProjectById' : ActorMethod<[bigint], [boolean, [] | [ProjectData]]>,
  'getProjectNewsById' : ActorMethod<[bigint], [] | [Array<ProjectNews>]>,
  'saveProjectVersions' : ActorMethod<[Array<VersionData>], [boolean, string]>,
  'updateProject' : ActorMethod<[bigint, ProjectData], [boolean, string]>,
}
export type UserID = Principal;
export interface VersionData {
  'versionID' : bigint,
  'projectName' : string,
  'blockchain' : string,
  'currentVersion' : string,
  'linkDapp' : string,
}
export interface _SERVICE extends Projects {}
