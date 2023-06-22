import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { StoicIdentity } from "ic-stoic-identity";
import { idlFactory as standardsIDL } from "../chatSDK/nfts_standards";

import { idlFactory } from "../../../declarations/ICHUB_backend";

const canisterId              = "oqnbw-faaaa-aaaag-abcvq-cai";
const coreCanisterId          = "2nfjo-7iaaa-aaaag-qawaq-cai";
const publicChatCanisterId    = "yq4sl-yyaaa-aaaag-aaxcq-cai";
const usergeekCanister        = "fbbjb-oyaaa-aaaah-qaojq-cai";
const private_chats           = "ofcrb-2aaaa-aaaan-qcz2q-cai";
const images                  = "avnm2-3aaaa-aaaaj-qacba-cai";
const projects                = "ey7h6-4iaaa-aaaak-aepka-cai";
const nfts_ichub              = "fdaor-cqaaa-aaaao-ai7nq-cai";
const canisterNFTsCollections = "4nxsr-yyaaa-aaaaj-aaboq-cai";
const reportsCanisterId       = "opcce-byaaa-aaaak-qcgda-cai";
let whitelist = [canisterId, coreCanisterId, publicChatCanisterId, usergeekCanister, private_chats, canisterNFTsCollections,
                nfts_ichub, images, projects, reportsCanisterId];
const host = 'https://raw.ic0.app/';


/// INTERNET IDENTITY
export const loginII = async () => {
    const authClient = await AuthClient.create();
    return authClient;
};

export const handleAuthenticated = async (authClient) => {
  const identity = await authClient.getIdentity();
  return identity;
}

/// STOIC IDENTITY
export const loginStoic = async () => {
    let _stoicIdentity = await StoicIdentity.load().then(async identity => {
      if (identity !== false) {
        //ID is a already connected wallet!
      } else {
        //No existing connection, lets make one!
        identity = await StoicIdentity.connect();
      }
      return identity;  
        //Disconnect after
        //StoicIdentity.disconnect();
    });
    return _stoicIdentity;
  };

/// PLUG WALLET
export const loginPlug = async () => {
    try{
      const _can = await setCanisterData(standardsIDL, canisterNFTsCollections, null); 
      let _coll = await _can.getNftsCanisters();
      let _list = _coll.map((c) => {
        whitelist.push(c[0].toString());
        return c[0].toString();
      });
    } catch(err){
      console.log("ERROR RECOVERING EXTs CANISTER", err);
    }
    let connection = await window.ic.plug.requestConnect({ whitelist });
    const principalId = await window.ic.plug.agent.getPrincipal();
    var principal = principalId;
    return principal;
};

/// INFINITY WALLET
export const loginInfinityWallet = async () => {
  try{
    const _can = await setCanisterData(standardsIDL, canisterNFTsCollections, null); 
    let _coll = await _can.getNftsCanisters();
    let _list = _coll.map((c) => {
      whitelist.push(c[0].toString());
      return c[0].toString();
    });
  } catch(err){
    console.log("ERROR RECOVERING EXTs CANISTER", err);
  }
  try {
    await window?.ic?.infinityWallet?.requestConnect({ whitelist });
    let _prin = await window.ic.infinityWallet.getPrincipal();
    return _prin;
  } catch (e) {
    console.log("e1", e);
    alert("Your Infinity Wallet session has expired. Please check your login in the Infinity Wallet app and then reload this page");
  }
};

export const setCanisterData = async (idl, canisterId, identity) => {
  const _canister = Actor.createActor(idl, {
    agent: new HttpAgent({
      host: host,
      identity,
    }),
    canisterId,
  });
  return _canister;
};