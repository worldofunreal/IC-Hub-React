import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  let _prevData = (localStorage.getItem("ICHUB_user") !== null) ? 
      JSON.parse(localStorage.getItem("ICHUB_user")) 
    : 
      {
        wallet: "", 
        walletState: "disconnected",
        walletConnected: "",
        userName: "",
        saveSession: false
      };
  const [walletData, setWalletData] = useState(_prevData);
  /// Player
  const [aID, setAID] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [canister, setCanister] = useState(null);
  const [walletPopup, setWalletPopup] = useState(null);
  const [walletService, setWalletService] = useState(null);
  const [saveSession, setSaveSession] = useState(null);
  /// Values
  const value = { walletData, setWalletData, 
                  aID, setAID, 
                  identity, setIdentity,
                  canister, setCanister,
                  walletPopup, setWalletPopup,
                  walletService, setWalletService,
                  saveSession, setSaveSession
                };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;