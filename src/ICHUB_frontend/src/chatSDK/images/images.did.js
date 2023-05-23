export const idlFactory = ({ IDL }) => {
  const ImageData = IDL.Record({
    'user' : IDL.Principal,
    'iType' : IDL.Text,
    'image' : IDL.Vec(IDL.Nat8),
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'status_code' : IDL.Nat16,
  });
  return IDL.Service({
    'getAllImages' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, ImageData))],
        ['query'],
      ),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'saveImage' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Text],
        [IDL.Bool, IDL.Text],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
