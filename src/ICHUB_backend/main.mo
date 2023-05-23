import Blob      "mo:base/Blob";
import Hash      "mo:base/Hash";
import HashMap   "mo:base/HashMap";
import Int       "mo:base/Int";
import Iter      "mo:base/Iter";
import Nat64     "mo:base/Nat64";
import Principal "mo:base/Principal";
import Text      "mo:base/Text";
import Time      "mo:base/Time";

import Account "./Account";
import Types   "./types";

import Ledger    "./ledger_interface";

actor class ICHub(_owner : Principal){

  private let canisterID : Text = "oqnbw-faaaa-aaaag-abcvq-cai";
  private let ledger     : Ledger.Interface = actor("ryjl3-tyaaa-aaaaa-aaaba-cai");

  private stable var transfer_fee : Nat64 = 10_000;

  type AvatarType     = Types.AvatarType;
  type UserID         = Types.UserID;
  type UserData       = Types.UserData;
  type UserStatus     = Types.UserStatus;

  private stable var _users : [(UserID, UserData)] = [];
  var users : HashMap.HashMap<UserID, UserData> = HashMap.fromIter(_users.vals(), 0, Principal.equal, Principal.hash);

  /// START SYSTEM CALLS
        system func preupgrade() {
            _users := Iter.toArray(users.entries());
        };

        system func postupgrade() {
            _users := [];
        };
    /// END SYSTEM CALLS

  public shared(msg) func createUser(username : Text, hasht : Text) : async Bool {
    switch(users.get(msg.caller)){
      case null {
        let _newUser : UserData = {
          userID     = msg.caller;
          accountID  = Account.accountIdentifier(Principal.fromActor(actor(canisterID)), Account.principalToSubaccount(msg.caller));
          username   = username;
          hashtag    = hasht;
          avatar     = "";
          avatarType = #none;
          status     = #incomplete;
        };
        users.put(msg.caller, _newUser);
        return true;
      };
      case (?_){
        return false;
      };
    };
  };

  public shared(msg) func setImageToUser(avatarImage : Text, imageType : AvatarType) : async Bool {
    switch(users.get(msg.caller)){
      case null {
        return false;
      };
      case (?u){
        switch(u.status){
          case (#incomplete){
            let _User : UserData = {
              userID     = u.userID;
              accountID  = u.accountID;
              username   = u.username;
              hashtag    = u.hashtag;
              avatar     = avatarImage;
              avatarType = imageType;
              status     = #active;
            };
            users.put(msg.caller, _User);
            return true;
          };
          case (#active)   { return false; };
          case (#inactive) { return false; };
          case (#banned)   { return false; };
        };
      };
    };
  };

  public shared query(msg) func getUserData() : async ?UserData {
    return users.get(msg.caller);
  };

  public shared query(msg) func getUserAvatar() : async (Text, AvatarType) {
    switch(users.get(msg.caller)){
      case null {
        return ("", #none);
      };
      case (?u){
        return(u.avatar, u.avatarType);
      };
    };
  };

  public shared(msg) func getICPBalance() : async {e8s:Nat64} {
    let {e8s = payment} = await ledger.account_balance({
      // account = Account.accountIdentifier(Principal.fromActor(Self), Account.defaultSubaccount())
      account = getUserSubaccount(msg.caller)
    });
  };

  public shared(msg) func getBalanceFromAccount(acc : Account.AccountIdentifier) : async {e8s:Nat64} {
    let {e8s = payment} = await ledger.account_balance({
      // account = Account.accountIdentifier(Principal.fromActor(Self), Account.defaultSubaccount())
      account = acc
    });
  };

  public shared(msg) func sendICP(icp: Nat64, to : Account.AccountIdentifier) : async (Bool, Text, ?Ledger.TransferResult){
    let _userAccount    = getUserSubaccount(msg.caller);
    let _userICPBalance : {e8s : Nat64} = await ledger.account_balance({
      account = _userAccount
    });
    if(_userICPBalance.e8s >= icp){
      let res_icp = await ledger.transfer({
              memo : Nat64    = 0;
              //from_subaccount = ?_userAccount;
              from_subaccount = ?Account.principalToSubaccount(msg.caller);
              to              = to;
              amount          = { e8s = icp - transfer_fee };
              fee             = { e8s = transfer_fee };
              created_at_time = ?{ timestamp_nanos = Nat64.fromNat(Int.abs(Time.now())) };
      });
      return (true, "Sent", ?res_icp);
    };
    return (false, "Insufficient balance", null);
  };

  func getUserSubaccount(u : Principal) : Account.AccountIdentifier{
    return Account.accountIdentifier(Principal.fromActor(actor(canisterID)), Account.principalToSubaccount(u));
  };


}