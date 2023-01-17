import React, { createContext, useEffect, useState } from "react";
import { StoicIdentity } from "ic-stoic-identity";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { idlFactory as coreCanisterIDL } from './core';
import { idlFactory as chatCanisterIDL } from './public_group';

export const ChatAppContext = createContext();

const ChatICAppProvider = ({ children }) => {
  /// Definitions
  const [unityApp,         setUnityApp]         = useState(null); /// unityApp
  const [userPrincipal,    setUserPrincipal]    = useState(null); /// User's principal
  const [username,         setUsername]         = useState(null); /// Username
  const [identity,         setIdentityChat]     = useState(null); /// An identity of the user logged in
  const [chatCoreCanister, setChatCoreCanister] = useState(null); /// The canister of the chat
  const [userGroups,       setUserGroups]       = useState(null); /// The user's groups list
  const [chatSelected,     setChatSelected]     = useState(null); /// The chat selected
  const [chatCanister,     setChatCanister]     = useState(null); /// The canister of the selected chat
  const [chatText,         setChatText]         = useState(null); /// The text in the selected chat
  const [walletSelected,   setWalletSelected]   = useState(null); /// The wallet service selected by the user to login
  
  /// The IC's host URL
  const host = 'https://raw.ic0.app/';
  /// The Chat canisterId
  const coreCanisterId = "2nfjo-7iaaa-aaaag-qawaq-cai";

  /********************* useEffect(() => {
    if(identity !== null) {
      /// When an identity is set, get the Chat canister
      setCoreCanister();
    }
  }, [identity]);*/

  useEffect(() => {
    if(chatCoreCanister !== null){
      /// When the canister is set, get the user's data
      if(unityApp !== null){
        /********************* unityApp.on("CreateUser", (name) => {
          createNewUser(name);
        });*/
        /********************* unityApp.on("CheckLogin", () => {
          console.log("CheckLogin", chatCoreCanister);
          loginUser();
        });*/
      }
      /********************* loginUser();*/
    }
  }, [chatCoreCanister]);

  useEffect(() => {
    if(chatSelected !== null){
      /// When the user selects a group, get it's data
      console.log("Chat selected", chatSelected);
      getChatData();
    }
  }, [chatSelected]);

  useEffect(() => {
    console.log("Chat canister", chatCanister);
    if(chatCanister !== null && unityApp !== null){
      unityApp.on("SendMessage", (text) => {
        sendMessage(text);
      });
      updateChatData();
    }
  }, [chatCanister]);

  useEffect(() => {
    /// Send the messages to Unity
    if(chatSelected !== null){
      renderChatMessages();
    }
  }, [chatText]);

  useEffect(() => { /// COPY-PASTE
    /// Unity has problems to paste into inputs on webgl, so we handle it on react
    const handlePasteAnywhere = event => {
      let _txt = event.clipboardData.getData('text');
      if(unityApp !== null){
        unityApp.send("CanvasChat", "getPaste", _txt);
      }
    };

    window.addEventListener('paste', handlePasteAnywhere);

    return () => {
      window.removeEventListener('paste', handlePasteAnywhere);
    };
  }, []);

  useEffect(() => {
    if(unityApp !== null){
      /// Connections to Unity
      /********************* unityApp.on("Login", () => {
        loginStoic();
      });*/

      /********************* unityApp.on("CheckLogin", () => {
        console.log("CheckLogin", chatCoreCanister);
        if(chatCoreCanister !== null){
          loginUser();
        }
      });*/

      unityApp.on("AddUserToGroup", (json) => {
        addUserToGroup(json);
      });
    
      unityApp.on("CreateGroup", (groupName) => {
        createGroup(groupName);
      });
    
      unityApp.on("SelectChatGroup", (groupID) => {
        selectChat(groupID);
      });
    }
  }, [unityApp]);

  /// STOIC IDENTITY
  /********************* const loginStoic = async () => {
    let _stoicIdentity = await StoicIdentity.load().then(async identity => {
      if (identity !== false) {
        //ID is a already connected wallet!
      } else {
        //No existing connection, lets make one!
        identity = await StoicIdentity.connect();
      }
      return identity;
    });
    setIdentity(_stoicIdentity);
  };*/

  const setCanister = async (idl, canisterId) => {
    /// Code to set a canister requiring idl and the canister id as text
    const _canister = Actor.createActor(idl, {
      agent: new HttpAgent({
        host: host,
        identity,
      }),
      canisterId,
    });
    return _canister;
  };

  const setCanisterExternal = async (idl, canisterId, _identity) => {
    /// Code to set a canister requiring idl and the canister id as text
    console.log("IDENTITY SET CANISTER EXTERNAL", identity);
    const _canister = Actor.createActor(idl, {
      agent: new HttpAgent({
        host: host,
        identity,
      }),
      canisterId,
    });
    return _canister;
  };

  const setCanisterExternalPlug = async (idl, canisterId) => {
    const _can = await window.ic.plug.createActor({
        canisterId: canisterId,
        interfaceFactory: idl,
    });
    return _can;
  };

  const setCanisterExternalIW = async (idl, canisterId) => {
    console.log("CHAT CORE FOR IW", canisterId);
    const _can = await window.ic.infinityWallet.createActor({
      canisterId: canisterId,
      interfaceFactory: idl,
    });
    console.log(_can);
    return _can;
  };

  /********************* const setCoreCanister = async () => {
    ///Get the main canister
    setChatCoreCanister(await setCanister(coreCanisterIDL, coreCanisterId));
  };*/

  const setCoreCanisterExternal = async (_identity) => {
    console.log("IDENTITY FOR CORE CHAT CANISTER", _identity);
    switch(walletSelected){
      case "PlugWallet":
        setChatCoreCanister(await setCanisterExternalPlug(coreCanisterIDL, coreCanisterId));
        break;
      case "InfinityWallet":
        setChatCoreCanister(await setCanisterExternalIW(coreCanisterIDL, coreCanisterId));
        break;
      case "IdentityWallet":
        setChatCoreCanister(await setCanisterExternal(coreCanisterIDL, coreCanisterId, _identity));
        break;
      case "StoicWallet":
        setChatCoreCanister(await setCanisterExternal(coreCanisterIDL, coreCanisterId, _identity));
        break;
    }
  };

  useEffect(() => {
    if(userPrincipal !== null && username !== null){
      loginUser();
    }
  }, [userPrincipal, username]);

  const loginUser = async () => {
    /// Get user if exists or create new one
    if(userPrincipal !== null){
      /********************* if(unityApp !== null){
        unityApp.send("CanvasChat", "LoadingLogin", "");
      }*/
      let _user = await chatCoreCanister.get_user(userPrincipal);
      if(_user === null || _user === [] || _user.length <= 0){
        /// Create new user, send request to ask for user's name from Unity
        /********************* if(unityApp !== null){
          unityApp.send("CanvasChat", "SetNewUser", "");
        }*/
        console.log("Adding new user to chat", username);
        let _newUser = await chatCoreCanister.create_user_profile(username);
        console.log("New user added", _newUser);
      }
      /// Already created, set the data and get the user's groups
      let _userGroups = await chatCoreCanister.get_user_groups();
      console.log("USER GROUPS", _userGroups);
      setUserGroups(_userGroups[0].groups);
      let _publicChat = _userGroups[0].groups[0];
      setChatSelected(_publicChat);
      /********************* if(unityApp !== null){
        unityApp.send("CanvasChat", "Initialize", "");
      }*/
      setTimeout(() => {
        getUserGroups();
      }, 2000);
    }
  };

  /********************* const createNewUser = async (name) => {
    if(name.trim() === ""){
      alert("Select a valid username");
      return false;
    }
    /// Create user with signed accound and selected username
    let _newUser = await chatCoreCanister.create_user_profile(name);
    /// After creating the user we can login as normal
    loginUser();
  };*/

  const renderGroupsList = () => {
    /// Once we have all user's groups we can display them
    let _userGroups = userGroups;
    if(_userGroups !== null){
      console.log("User's groups", _userGroups);
      /// First we sort them by ID asc
      _userGroups.sort((a, b) => { return (parseInt(a.groupID) - parseInt(b.groupID)) });
      let _groupsUnity = [];
      /// Then we prepare the data for Unity3D
      /// The data needs to be on an array and each registry needs to have id and name
      for(let i = 0; i < _userGroups.length; i++){
        if(_userGroups[i].groupID !== chatSelected.groupID){ /// All but the selected chat
          let _group = {
            id:   parseInt(_userGroups[i].groupID),
            name: _userGroups[i].name.split(" ").map((n)=>n[0]).join("")
          };
          _groupsUnity.push(_group);
        }
      }
      /// After we have the array, it needs to be encapsuled into another json to be processed inside Unity3D
      _groupsUnity = "{\"data\":" + JSON.stringify(_groupsUnity) + "}";
      if(unityApp !== null){
        unityApp.send("CanvasChat", "GetGroups", _groupsUnity);
      }
      /// After all data has been send, we set a timeout to continue to query new data
      /*setTimeout(() => {
        updateChatData();
      }, 3000);*/
    }
  };

  const getChatData = async () => {
    if(unityApp !== null){
      unityApp.send("CanvasChat", "ClearMessages", "");
    }
    switch(walletSelected){
      case "PlugWallet":
        setChatCanister(await setCanisterExternalPlug(chatCanisterIDL, chatSelected.canister));
        break;
      case "InfinityWallet":
        setChatCanister(await setCanisterExternalIW(chatCanisterIDL, chatSelected.canister));
        break;
      case "IdentityWallet":
        setChatCanister(await setCanister(chatCanisterIDL, chatSelected.canister));
        break;
      case "StoicWallet":
        setChatCanister(await setCanister(chatCanisterIDL, chatSelected.canister));
        break;
    }
  };

  const updateChatData = async () => {
    if(chatCanister !== null){
      let _chatData = await chatCanister.get_messages();
      setChatText(_chatData);
    }
    setTimeout(() => {
      updateChatData();
    }, 5000);
  };

  const sendMessage = async (message) => {
    if(message !== null && message.trim() !== ""){
      try{
        let _send = await chatCanister.add_text_message(message);
        unityApp.send("CanvasChat", "MessageSent", "");
      } catch(err){
        console.log("Error sending message", err);
        unityApp.send("CanvasChat", "MessageSent", "");
      }
      updateChatData();
    }
  };

  const selectChat = async (groupID) => {
    for(let i = 0; i < userGroups.length; i++){
      console.log(userGroups[i]);
      if(parseInt(userGroups[i].groupID) === groupID){
        setChatSelected(userGroups[i]);
        return true;
      }
    }
    return false;
  };

  const renderChatMessages = () => {
    let _chatText = chatText;
    let _msgUnity = [];
    if(_chatText !== null){
      _chatText.sort((a, b) => { return (parseInt(a[0]) - parseInt(b[0])) });
      for(let i = 0; i < _chatText.length; i++){
        let _msg = {
          id:   parseInt(_chatText[i][0]),
          text:  _chatText[i][1].text,
          username: _chatText[i][1].username.split("#")[0],
          timestamp: "",
          avatarUser: ""
        };
        _msgUnity.push(_msg);
      }
    }
    _msgUnity = "{\"data\":" + JSON.stringify(_msgUnity) + ", \"nameGroup\":\"" + chatSelected.name + "\", \"avatarGroup\":\"" + chatSelected.name.split(" ").map((n)=>n[0]).join("") + "\", \"idGroup\":" + parseInt(chatSelected.groupID) + "}";
    //console.log("renderChatMessages", _msgUnity);
    if(unityApp !== null){
      unityApp.send("CanvasChat", "GetChatMessages", _msgUnity);
    }
  };

  const getUserGroups = async () => {
    let _userGroups = await chatCoreCanister.get_user_groups();
    if(_userGroups !== null){
      setUserGroups(_userGroups[0].groups);
      renderGroupsList();
    } else {
      console.log("USER GROUPS IS NULL");
    }
    setTimeout(() => {
      getUserGroups();
    }, 30000);
  };

  useEffect(() => {
    if(userGroups !== null && chatSelected !== null){
      renderGroupsList();
    }
  }, [userGroups, chatSelected]);

  const createGroup = async (groupName) => {
    let _group = await chatCoreCanister.create_group(groupName, true, false);
  };

  const addUserToGroup = async (json) => {
    try{
      let _data = JSON.parse(json);
      let _principal = Principal.fromText(_data.userId);
      let _addUser = await chatCoreCanister.add_user_to_group(_data.groupId, _principal);
      if(unityApp !== null){
        unityApp.send("CanvasChat", "UserAdded", true);
      }
    } catch(err){
      console.log("Unable to add user", err);
      if(unityApp !== null){
        unityApp.send("CanvasChat", "UserAdded", false);
      }
    }
  };

  const value = { setUnityApp, setWalletSelected, setCoreCanisterExternal, setUserPrincipal, setIdentityChat, setUsername };

  return <ChatAppContext.Provider value={value}>{children}</ChatAppContext.Provider>;
};

export default ChatICAppProvider;