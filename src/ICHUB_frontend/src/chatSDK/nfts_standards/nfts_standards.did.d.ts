import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface NFTMetadata {
  'marketplace' : [] | [string],
  'name' : string,
  'avatarURL' : string,
  'addedBy' : Principal,
  'standard' : string,
  'canisterID' : Principal,
}
export interface Projects {
  'addNFTCollection' : ActorMethod<[NFTMetadata], [boolean, string]>,
  'getMyCollections' : ActorMethod<[], Array<[Principal, NFTMetadata]>>,
  'getNftsCanisters' : ActorMethod<[], Array<[Principal, NFTMetadata]>>,
  'updateAvatarNFTCollection' : ActorMethod<
    [Principal, string],
    [boolean, string]
  >,
}
export interface _SERVICE extends Projects {}
