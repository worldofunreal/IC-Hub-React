import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface ReportData {
  'userReports' : Principal,
  'reportType' : string,
  'dateReported' : string,
  'reasonReport' : string,
  'category' : bigint,
  'reported' : string,
}
export interface Reports {
  'addReport' : ActorMethod<[ReportData], boolean>,
  'getAllReports' : ActorMethod<[], Array<[UserID, Array<ReportData>]>>,
  'getAllReportsByCategory' : ActorMethod<
    [bigint],
    Array<[UserID, Array<ReportData>]>
  >,
  'getUserReports' : ActorMethod<[UserID], [] | [Array<ReportData>]>,
}
export type UserID = Principal;
export interface _SERVICE extends Reports {}
