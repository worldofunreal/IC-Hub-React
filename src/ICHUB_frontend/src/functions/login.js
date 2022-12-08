import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { StoicIdentity } from "ic-stoic-identity";

import { idlFactory } from "../../../declarations/ICHUB_backend";

const canisterId = "onhpa-giaaa-aaaak-qaafa-cai";
const betaCanisterId = "k7h5q-jyaaa-aaaan-qaaaq-cai";
const whitelist = [canisterId, betaCanisterId];
const host = 'https://raw.ic0.app/';

/// INTERNET IDENTITY
export const loginII = async (setAII) => {
  console.log("Loggin in II");
    const authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      setAII(authClient);
    } else {
      console.log("Not authenticated");
      return await authClient.login({
        onSuccess: async () => {
          setAII(authClient);
        },
      });
    }
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
    let connection = await window.ic.plug.requestConnect({ whitelist });
    console.log("Plug connection:", connection);
    const principalId = await window.ic.plug.agent.getPrincipal();
    var principal = principalId.toString();
    console.log(principal);
    return principal;
};

/// INFINITY WALLET
export const loginInfinityWallet = async () => {
  try {
    const publicKey = await window.ic.infinityWallet.requestConnect({whitelist, host});
    const principalId = await window.ic.infinityWallet.agent.getPrincipal();
    var principal = principalId.toString();
    console.log(principal);
    return principal;
  } catch (e) {
    console.log("e", e);
    alert("Your Infinity Wallet session has expired. Please check your login in the Infinity Wallet app and then reload this page");
  }
};

export const getCanister = async (identity, idL, canID) => {
  const _canister = Actor.createActor(idL, {
    agent: new HttpAgent({
      host: host,
      identity,
    }),
    canID,
  });
  return _canister;
};