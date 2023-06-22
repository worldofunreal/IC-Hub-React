export const idlFactory = ({ IDL }) => {
  const ReportData = IDL.Record({
    'userReports' : IDL.Principal,
    'reportType' : IDL.Text,
    'dateReported' : IDL.Text,
    'reasonReport' : IDL.Text,
    'category' : IDL.Nat,
    'reported' : IDL.Text,
  });
  const UserID = IDL.Principal;
  const Reports = IDL.Service({
    'addReport' : IDL.Func([ReportData], [IDL.Bool], []),
    'getAllReports' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(UserID, IDL.Vec(ReportData)))],
        ['query'],
      ),
    'getAllReportsByCategory' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(IDL.Tuple(UserID, IDL.Vec(ReportData)))],
        ['query'],
      ),
    'getUserReports' : IDL.Func(
        [UserID],
        [IDL.Opt(IDL.Vec(ReportData))],
        ['query'],
      ),
  });
  return Reports;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
