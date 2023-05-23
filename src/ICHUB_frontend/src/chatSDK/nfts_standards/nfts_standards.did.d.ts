import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface NFTMetadata {
  'marketplace' : [] | [string],
  'name' : string,
  'addedBy' : Principal,
  'standard' : string,
  'canisterID' : Principal,
}
export interface Projects {
  'addNFTCollection' : ActorMethod<[NFTMetadata], [boolean, string]>,
  'getNftsCanisters' : ActorMethod<[], Array<[Principal, NFTMetadata]>>,
}
export interface _SERVICE extends Projects {}
