import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'status_code' : number,
}
export interface ImageData {
  'user' : Principal,
  'iType' : string,
  'image' : Uint8Array | number[],
}
export interface _SERVICE {
  'getAllImages' : ActorMethod<[], Array<[string, ImageData]>>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'saveImage' : ActorMethod<[Uint8Array | number[], string], [boolean, string]>,
}
