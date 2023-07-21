import React, { createContext, useEffect, useState } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { idlFactory as coreCanisterIDL } from './core';
import { idlFactory as chatCanisterIDL } from './public_group';
import { idlFactory as projectsIDL     } from "./projects";
import { idlFactory as imagesIDL       } from "./images";
import { idlFactory as extIDL          } from "./nfts_ichub";
import { idlFactory as standardsIDL    } from "./nfts_standards";
import { idlFactory as reportsIDL      } from "./reports";
//import { idlFactory as idlExt } from "../../../declarations/ext_token/score_token.did";
import { getAccountId } from "../functions/account";
import { reportError } from "../functions/helpers";

import { computeTokenIdentifier, toHexString } from "../functions/account";

export const ChatAppContext = createContext();


//// TODO
//// UPDATE COLLECTION WHEN RECEIVED AGAIN BY THE SAME USER WHO REGISTERED IT


/*
ENUM ROLES BASE
  0 - Owner
  1 - Admin
  2 - User
*/
var _updateCounter = 0;
var _loadingGroups = false;
var _lastActivity  = null;

const ChatICAppProvider = ({ children }) => {
  /// Definitions
  const [unityApp,          setUnityApp]          = useState(null); /// unityApp
  const [userPrincipal,     setUserPrincipal]     = useState(null); /// User's principal
  const [userAccountID,     setUserAccountID]     = useState(null);
  const [username,          setUsername]          = useState(null); /// Username
  const [identity,          setIdentityChat]      = useState(null); /// An identity of the user logged in
  const [chatCoreCanister,  setChatCoreCanister]  = useState(null); /// The canister of the chat
  const [userGroups,        setUserGroups]        = useState(null); /// The user's groups list
  const [chatSelected,      setChatSelected]      = useState(null); /// The chat selected
  const [chatMessages,      setChatMessages]      = useState(null);
  const [chatCanister,      setChatCanister]      = useState(null); /// The canister of the selected chat
  const [walletSelected,    setWalletSelected]    = useState(null); /// The wallet service selected by the user to login
  const [extCanisters,      setExtCanisters]      = useState(null); /// List of tokens on the EXT Standard
  const [projectsCanister,  setProjectsCanister]  = useState(null); /// The Canister where the projects are
  const [canisterImages,    setCanisterImages]    = useState(null); /// The Canister to store and get images
  const [currentSection,    setCurrentSection]    = useState(null); /// The section of the Hub the user currently is
  const [nftList,           setNftList]           = useState(null); /// List of NFTs
  const [nftsCollCanister,  setNFTsCollCanister]  = useState(null); /// Canister for all the NFTs collections
  const [allNftsCollData,   setAllNftsCollData]   = useState(null); /// All data from NFTs collections
  const [userNFTsList,      setUserNFTsList]      = useState(null);
  const [reportsCanister,   setReportsCanister]   = useState(null);

  
  /// The IC's host URL
  const host = 'https://raw.ic0.app/';
  /// The Chat canisterId
  const coreCanisterId          = "2nfjo-7iaaa-aaaag-qawaq-cai";
  const canisterProjectsId      = "ey7h6-4iaaa-aaaak-aepka-cai";
  const canisterImagesId        = "avnm2-3aaaa-aaaaj-qacba-cai";
  const canisterNFTsICHUB       = "fdaor-cqaaa-aaaao-ai7nq-cai";
  const canisterNFTsCollections = "4nxsr-yyaaa-aaaaj-aaboq-cai";
  const reportsCanisterId       = "opcce-byaaa-aaaak-qcgda-cai";

  useEffect(() => {
    switch(currentSection){
      case 0:
        /// 
        getChatData();
        break;
      case 1:
        /// 
        getUserProjectData();
        break;
      case 2:
        if(projectsCanister !== null){
          //sendProjectsData();
        }
        break;
      case 4:
        if(projectsCanister !== null){
          //sendProjectsData();
        }
        break;
      default:
        break;
    }
  }, [currentSection]);

  useEffect(() => { }, [chatCoreCanister]);

  const checkUserActivity = async () => {
    if(_lastActivity === null){
      _lastActivity = new Date();
    }
    let _now = new Date();
    const diffTime = (_lastActivity !== null) ?  Math.abs(_now - _lastActivity) : 0;
    if(diffTime > 60000 && userPrincipal !== null){
      let _getUserStatus = await chatCoreCanister.getUsersActivity(userPrincipal);
      if(_getUserStatus === "Avaliable"){
        await chatCoreCanister.logUserActivity("Away", false);
        setUserdataHub();
      }
    }
    setTimeout(() => {
      ///checkUserActivity();
    }, 10000);
  };

  useEffect(() => {
    if(chatSelected !== null){
      /// When the user selects a group, get it's data
      getChatData();
    }
  }, [chatSelected]);
  
  useEffect(() => {
    if(chatCanister !== null && unityApp !== null){
      unityApp.on("SendMessage", (text) => {
        sendMessage(text);
      });
      getGroupData(parseInt(chatSelected.groupID));
      _updateCounter = chatSelected.groupID;
      renderChatMessages(_updateCounter);
    }
  }, [chatCanister]);

  useEffect(() => { /// COPY-PASTE
    /// Unity has problems to paste into inputs on webgl, so we handle it on react
    const handlePasteAnywhere = event => {
      let _txt = event.clipboardData.getData('text');
      if(unityApp !== null){
        unityApp.send("Chat_Section", "getPaste", _txt);
      }
    };
    window.addEventListener('paste', handlePasteAnywhere);
    return () => {
      window.removeEventListener('paste', handlePasteAnywhere);
    };
  }, []);

  useEffect(() => {
    if(projectsCanister !== null){
      sendProjectsData();
    }
  }, [projectsCanister]);

  useEffect(() => {
    if(unityApp !== null){

      unityApp.on("AddUserToGroup", (json) => {
        addUserToGroup(json);
      });
    }
  }, [unityApp]);

  useEffect(() => {
    if(extCanisters !== null){
      getTokens();
    }
  }, [extCanisters]);

  useEffect(() => { }, [allNftsCollData]);

  const openSuccessPanel = () => {
    if(unityApp !== null){
      unityApp.send("CanvasPopup", "OpenSuccessPanel", "");
    };
  }

  const openSuccessPanelAppManagement = () => {
    if(unityApp !== null){
      unityApp.send("AppManagement_Section", "OnSubmitProcessSuccess", "");
    };
  }

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
    const _can = await window.ic.infinityWallet.createActor({
      canisterId: canisterId,
      interfaceFactory: idl,
    });
    return _can;
  };

  const setCoreCanisterExternal = async (_identity) => {
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

  const getProjectsCanister = async () => {
    switch(walletSelected){
      case "PlugWallet":
        setProjectsCanister(await setCanisterExternalPlug(projectsIDL, canisterProjectsId));
        break;
      case "InfinityWallet":
        setProjectsCanister(await setCanisterExternalIW(projectsIDL, canisterProjectsId));
        break;
      case "IdentityWallet":
        setProjectsCanister(await setCanister(projectsIDL, canisterProjectsId));
        break;
      case "StoicWallet":
        setProjectsCanister(await setCanister(projectsIDL, canisterProjectsId));
        break;
    }
  };

  const getImagesCanister = async () => {
    switch(walletSelected){
      case "PlugWallet":
        setCanisterImages(await setCanisterExternalPlug(imagesIDL, canisterImagesId));
        break;
      case "InfinityWallet":
        setCanisterImages(await setCanisterExternalIW(imagesIDL, canisterImagesId));
        break;
      case "IdentityWallet":
        setCanisterImages(await setCanister(imagesIDL, canisterImagesId));
        break;
      case "StoicWallet":
        setCanisterImages(await setCanister(imagesIDL, canisterImagesId));
        break;
    }
  }

  useEffect(() => {
    if(userPrincipal !== null && username !== null){
      loginUser();
      getUsersExtTokens();
      getImagesCanister();
      setCurrentSection(4);
    }
  }, [userPrincipal, username]);

  const loginUser = async () => {
    /// Get user if exists or create new one
    if(userPrincipal !== null && chatCoreCanister !== null){
      let _user = await chatCoreCanister.get_user(userPrincipal);
      if(_user === null || _user === [] || _user.length <= 0){
        let _newUser = await chatCoreCanister.create_user_profile(username, "");
      }
      /// Already created, set the data and get the user's groups
      /*let _userGroups = await chatCoreCanister.get_user_groups();
      if(_userGroups.length > 0) {
        setUserGroups(_userGroups);
        let _publicChat = _userGroups[0];
        setChatSelected(_publicChat);
      }*/
      getUserGroups();
    }
  };

  const instantiateCanisterTemp = async (canisterId) => {
    let _tempCan;
    switch(walletSelected){
      case "PlugWallet":
        _tempCan = await setCanisterExternalPlug(chatCanisterIDL, canisterId);
        break;
      case "InfinityWallet":
        _tempCan = await setCanisterExternalIW(chatCanisterIDL, canisterId);
        break;
      case "IdentityWallet":
        _tempCan = await setCanister(chatCanisterIDL, canisterId);
        break;
      case "StoicWallet":
        _tempCan = await setCanister(chatCanisterIDL, canisterId);
        break;
    }
    return _tempCan;
  };

  const renderGroupsList = async () => {
    /// Once we have all user's groups we can display them
    let _userGroups = userGroups;
    if(_userGroups !== null && _userGroups !== undefined){
      /// First we sort them by ID asc
      _userGroups.sort((a, b) => { return (parseInt(a.groupID) - parseInt(b.groupID)) });
      let _groupsUnity = [];
      let _groupsPanel = [];
      /// Then we prepare the data for Unity3D
      /// The data needs to be on an array and each registry needs to have id and name
      for(let i = 0; i < _userGroups.length; i++){
        if(_userGroups[i].isDirect !== true){
          let _gp = {
            avatar : _userGroups[i].avatar,//_userGroups[i].name.split(" ").map((n)=>n[0]).join(""),
            name   : (_userGroups[i].isDirect === true) ? _userGroups[i].name.split(" ")[0] : _userGroups[i].name,
            id     : parseInt(_userGroups[i].groupID),
          };
          _groupsPanel.push(_gp);
        }
      }
      _groupsPanel = "{\"data\":" + JSON.stringify(_groupsPanel) + "}";
      if(unityApp !== null){
        unityApp.send("Hub_Panel", "GetGroupsInfo", _groupsPanel);
      }
      for(let i = 0; i < _userGroups.length; i++){
        let _role = 2;
        let _tempCan = await instantiateCanisterTemp(_userGroups[i].canister);
        try{
          let _roleData = await _tempCan.getUserRole();
          _role = getRoleEnum(_roleData);
        }catch(err){
          reportError("Error getting role", err);
        }
        if(chatSelected !== null && _userGroups[i].groupID !== chatSelected.groupID){ /// All but the selected chat
          let _avt = _userGroups[i].avatar;
          /// GET 1on1 AVATAR
          if(_userGroups[i].isDirect === true){
            let _can;
            switch(walletSelected){
              case "PlugWallet":
                _can = await setCanisterExternalPlug(chatCanisterIDL, _userGroups[i].canister);
                break;
              case "InfinityWallet":
                _can = await setCanisterExternalIW(chatCanisterIDL, _userGroups[i].canister);
                break;
              case "IdentityWallet":
                _can = await setCanister(chatCanisterIDL, _userGroups[i].canister);
                break;
              case "StoicWallet":
                _can = await setCanister(chatCanisterIDL, _userGroups[i].canister);
                break;
            }
            _avt = await getAvatarDirectChat(_can);
          }
          let _group = {
            id       : parseInt(_userGroups[i].groupID),
            name     : (_userGroups[i].isDirect === true) ? (_userGroups[i].name.split(" ")[0].toUpperCase() === username.toUpperCase()) ? _userGroups[i].name.split(" ")[1].split("#")[0] : _userGroups[i].name.split(" ")[0].split("#")[0] : _userGroups[i].name.split(" ").map((n)=>n[0]).join(""),
            RoleUser : _role,
            avatar   : _avt
          };
          _groupsUnity.push(_group);
        }
      }
      /// After we have the array, it needs to be encapsuled into another json to be processed inside Unity3D
      _groupsUnity = "{\"data\":" + JSON.stringify(_groupsUnity) + "}";
      if(unityApp !== null){
        unityApp.send("Chat_Section", "GetGroups", _groupsUnity);
      }
    }
  };

  const getRoleEnum = (role) => {
    if(role.owner !== undefined){
      return 0;
    }
    if(role.admin !== undefined){
      return 1;
    }
    return 2;
  };

  const getGroupData = async (idGroup) => {
    if(currentSection === 0){
      let nameGroup;
      if(chatSelected.isDirect === true){
        let _userOwner     = (chatSelected.name.split(" ")[0].toUpperCase() === username.toUpperCase()) ? 1 : 0;
        nameGroup          = chatSelected.name.split(" ")[_userOwner];
      } else {
        nameGroup          = chatSelected.name;
      }
      let avatarGroup      = chatSelected.avatar;
      let descriptionGroup = chatSelected.description;
      let _roleuser        = 2;
      let isPrivate        = chatSelected.isPrivate;
      let members          = [];
      let pending          = [];
      try{
        _roleuser = getRoleEnum(await chatCanister.getUserRole());
      }catch(err){
        reportError("Error getting user role", err);
      }
      try{
        members = await chatCanister.get_group_users();
      }catch(err){
        reportError("Error getting members", err);
      }
      if(_roleuser === 0){
        try{
          pending = await chatCanister.getUsersPending();
        }catch(err){
          reportError("Error getting pending users", err);
        }
      }
      let _allMembers = [];
      let _allPending = [];
      if(members.length > 0){
        for(let i = 0; i < members.length; i++){
          let _member = {
            roleuser    : parseInt(members[i].role),
            username    : members[i].username,
            principalID : members[i].userID.toString(),
            avatarUser  : members[i].avatar,
          };
          _allMembers.push(_member);
          if(chatSelected.isDirect === true && nameGroup == members[i].username){
            avatarGroup = members[i].avatar;
          }
        }
      }
      //// THIS SHOULD BE IN ANOTHER REQUEST, TO-DO LATER WITH SHIZUKEN
      if(pending.length > 0){
        for(let i = 0; i < pending.length; i++){
          let _dateUnix = parseInt(Math.floor(parseFloat(pending[i].dateRequested) / 1000000));
          let _date = new Date(_dateUnix);
          let _username = await chatCoreCanister.getUsername(pending[i].userID);
          let _avatar   = await chatCoreCanister.getUserAvatar(pending[i].userID);
          let _requestMember = {
            username    : _username,
            principalID : pending[i].userID.toString(),
            avatarUser  : _avatar,
            timeStamp   : _date.toLocaleString()
          }
          _allPending.push(_requestMember);
        }
      }
      let data = {
        idGroup          : idGroup,
        nameGroup        : nameGroup,
        avatarGroup      : avatarGroup,
        descriptionGroup : descriptionGroup,
        isPrivate        : isPrivate,
        roleuser         : _roleuser,
        members          : _allMembers,
        requests         : _allPending
      };
      data = JSON.stringify(data);
      if(unityApp !== null){
        unityApp.send("SettingGroup Panel", "GetInfoPanelSettings", data);
      }
    }
    try{
      /// ADD: CLOSE LOADING CHAT ANIMATION ON UNITY
    } catch(err){
      /// Probably Unity wasn't ready for this call
    }
  };

  const getChatData = async () => {
    if(currentSection === 0){
      if(unityApp !== null){
        unityApp.send("Chat_Section", "ClearMessages", "");
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
    }
  };

  const sendMessage = async (message) => {
    if(message !== null && message.trim() !== ""){
      try{
        let _send = await chatCanister.add_text_message(message);
        unityApp.send("Chat_Section", "MessageSent", "");
      } catch(err){
        reportError("Error sending message", err);
        unityApp.send("Chat_Section", "MessageSent", "");
      }
    }
  };

  const selectChat = async (groupID) => {
    let _ug;
    //let _activity = chatCoreCanister.logUserActivity("Online", false);
    _lastActivity = new Date();
    if(userGroups !== null && userGroups.length > 0){
      _ug = userGroups
    } else {
      let _aug = await chatCoreCanister.get_user_groups();
      if(_aug.length <= 0){
        return false;
      }
      _ug = _aug[0].groups;
    }
    for(let i = 0; i < _ug.length; i++){
      if(parseInt(_ug[i].groupID) === groupID){
        setChatSelected(_ug[i]);
        return true;
      }
    }
    return false;
  };

  const renderChatMessages = async (_counter) => {
    if(chatCanister !== null && _counter === _updateCounter){
      let avatarGroup;
      let nameGroup   = chatSelected.name;
      let _chatText   = await chatCanister.get_messages();
      let _msgUnity   = [];
      if(_chatText !== null){
        _chatText.sort((a, b) => { return (parseInt(a[0]) - parseInt(b[0])) });
        let _users = [];
        let _avatars = [];
        for(let i = 0; i < _chatText.length; i++){
          if(!_users.includes(_chatText[i][1].userID)){
            _users.push(_chatText[i][1].userID);
          }
        }
        if(_users.length > 0){
          _avatars = await chatCoreCanister.getUsersAvatar(_users);
        }
        for(let i = 0; i < _chatText.length; i++){
          let _dateUnix = parseInt(Math.floor(parseFloat(_chatText[i][1].time) / 1000000));
          let _date = new Date(_dateUnix);
          let _formatDate = (_date.getMonth() + 1) + "/" + _date.getDate() + "/" + _date.getFullYear() + " " + _date.getHours() + ":" + _date.getMinutes();
          let _msg = {
            id          : parseInt(_chatText[i][0]),
            principalID : _chatText[i][1].userID.toString(),
            text        : _chatText[i][1].text,
            username    : _chatText[i][1].username.split("#")[0],
            timeStamp   : _formatDate,
            avatarUser  : getAvatar(_chatText[i][1].userID.toString(), _avatars),
          };
          _msgUnity.push(_msg);
        }
      }
      if(chatSelected.isDirect === true){
        avatarGroup = await getAvatarDirectChat();
      }
      let _userRole = 2;
      try{
        _userRole = getRoleEnum(await chatCanister.getUserRole());
      }catch(err){
        reportError("Error while getting user's role", err);
      }
      if(chatSelected.isDirect === true){
        nameGroup = (chatSelected.name.split(" ")[0].toUpperCase() === username.toUpperCase()) ? chatSelected.name.split(" ")[1] : chatSelected.name.split(" ")[0];
      } else {
        avatarGroup = chatSelected.avatar;
      }
      _msgUnity = "{\"data\":" + JSON.stringify(_msgUnity) + ", \"nameGroup\":\"" + nameGroup + "\", \"avatarGroup\":\"" + avatarGroup + "\", \"idGroup\":" + parseInt(chatSelected.groupID) + ", \"role\":" + _userRole + "}";
      if(unityApp !== null){
        unityApp.send("Chat_Section", "GetChatMessages", _msgUnity);
      }
      setTimeout(() => {
        updateMessages(_counter);
      }, 5000);
    }
  };

  const getAvatarDirectChat = async (can = chatCanister) => {
    let _users = await can.get_group_users();
    for(let i = 0; i < _users.length; i++){
      if(_users[i].username.toUpperCase() !== username.toUpperCase()){
        return _users[i].avatar;
      }
    }
    return "";
  };

  const getAvatar = (id, list) => {
    for(let i = 0; i < list.length; i++){
      if(list[i][0].toString() === id && list[i][1] !== ""){
        return list[i][1];
      }
    }
    return "https://cdn3.iconfinder.com/data/icons/delivery-and-logistics/24/logistics-25-512.png";
  }

  const updateMessages = (_counter) => {
    renderChatMessages(_counter);
  };

  const getUserGroups = async () => {
    let _userGroups = await chatCoreCanister.get_user_groups();
    if(_userGroups !== null && _userGroups.length > 0){
      setUserGroups(_userGroups);
      if(_loadingGroups === false){
        let _publicChat = _userGroups[0];
        setChatSelected(_publicChat);
        _loadingGroups = true;
        loadGroupsUpdated();
      }
    } else {
      reportError("USER GROUPS IS NULL", null);
    }
  };

  const loadGroupsUpdated = async () => {
    setTimeout(() => {
      getUserGroups();
    }, 10000);
  };

  useEffect(() => {
    if(userGroups !== null && chatSelected !== null){
      renderGroupsList();
    }
  }, [userGroups, chatSelected]);

  const createGroup = async (groupData) => {
    let _isPrivate = (groupData.isPrivate.toUpperCase() === "TRUE") ? true : false;
    try{
      let _group = await chatCoreCanister.create_group(groupData.namegroup, _isPrivate, false, groupData.description, groupData.avatarURL);
      if(_group[0] === true){
        getUserGroups();
        openSuccessPanel();
      } else {
        alert("Error while creating group, please contact support with code ALPHA-0564");
      }
    } catch(err){
      alert("Error while creating group, please contact support with code ALPHA-0563");
      reportError("ERROR CREATING GROUP", err);
    }
  };

  const addUserToGroup = async (json) => {
    try{
      let _data = JSON.parse(json);
      let _principal = Principal.fromText(_data.userId);
      let _addUser = await chatCoreCanister.add_user_to_group(_data.groupId, _principal);
      if(unityApp !== null){
        unityApp.send("Chat_Section", "UserAdded", true);
      }
    } catch(err){
      reportError("Unable to add user", err);
      if(unityApp !== null){
        unityApp.send("Chat_Section", "UserAdded", false);
      }
    }
  };

  const requestJoinGroup = async (groupID) => {
    let _requested = await chatCoreCanister.add_user_to_group(groupID, userPrincipal);
    return _requested;
  };

  ///////// SEARCH GROUPS /////////
    const searchGroup = async (groupName) => {
      let _g = await chatCoreCanister.search_group_by_name(groupName);
      if(_g != null){
        _g = _g[0];
      }
      let _res = {
        "group_exists": false,
        "StringSearch": groupName,
        "group_data":[]
      };
      if(_g !== null && _g.length > 0){
        _res.group_exists = true;
        let _r = [];
        for(let i = 0; i < _g.length; i++){
          let _userAdded = await chatCoreCanister.is_used_added(parseInt(_g[i].groupID), userPrincipal);
          let _requested;
          try{
            _requested = await chatCoreCanister.hasUserRequestedJoin(_g[i].groupID);
          } catch(e){
            reportError("has requested, error", e);
            _requested = false;
          };
          _r.push({
            "joined"     : _userAdded,
            "id"         : parseInt(_g[i].groupID),
            "name"       : _g[i].name,
            "is_private" : _g[i].isPrivate,
            "requested"  : _requested,
            "avatar"     : _g[i].avatar,
          });
        }
        _res.group_data = _r;
      } else {
        _res.group_data.push({
          "joined": false,
          "id": 0,
          "name": "",
          "is_private": false
        });
      }
      return _res;
    };

    const leaveGroup = async (groupID) => {
      if(groupID > 1){
        let _core = await chatCoreCanister.remove_user_from_group(userPrincipal, groupID);
      }
    };

    const getGroupUsers = async () => {
      let _users = await chatCanister.get_group_users();
    };

    const transferOwner = async (to) => {
      let _transferred = await chatCanister.transferOwner(to);
    };

    //// Accept and reject users from group requests
    const acceptGroupRequest = async (data) => {
      let _approved = await chatCoreCanister.approveUserPendingGroup(data.idGroup, Principal.fromText(data.userPrincipalID));
      if(_approved[0] == true){
        openSuccessPanel();
      }
    };

    const rejectGroupRequest = async (data) => {
      let _rejected = await chatCoreCanister.rejectUserPendingGroup(data.idGroup, Principal.fromText(data.userPrincipalID));
      if(_rejected[0] == true){
        openSuccessPanel();
      }
    };

    ////// CHANGE GROUP DATA
    const changeGroupTitle = async (data) => {
      let _changed = await chatCoreCanister.changeGroupName(data.idGroup, data.text);
      if(_changed[0] == true){
        openSuccessPanel();
      }
    };

    const changeGroupDescription = async (data) => {
      let _changed = await chatCoreCanister.changeGroupDescription(data.idGroup, data.text);
      if(_changed[0] == true){
        openSuccessPanel();
      }
    };

    const changeGroupPrivacy = async (idGroup, privacy) => {
      let _changed = await chatCoreCanister.changeGroupPrivacy(idGroup, privacy);
      if(_changed[0] == true){
        openSuccessPanel();
      }
    };

    //// USER PROFRILE
    const getUserDataFromID = async (userRequestedID) => {
      let _user = await chatCoreCanister.get_user(Principal.fromText(userRequestedID));
      if(_user.length === 1){
        let _dateUnix = parseInt(Math.floor(parseFloat(_user[0].userSince) / 1000000));
        let _date = new Date(_dateUnix);
        let _formatDate = (_date.getMonth() + 1) + "/" + _date.getDate() + "/" + _date.getFullYear();
        let _rolePlayerProfile = (userRequestedID === userPrincipal.toString()) ? 0 : parseInt(await chatCoreCanister.getIsFriend(Principal.fromText(userRequestedID)));
        let _userJson = JSON.stringify({
            username          : _user[0].username,
            principalID       : _user[0].userID.toString(),
            avatar            : _user[0].avatar,
            description       : _user[0].description,
            memberSince       : _formatDate,
            rolePlayerProfile : _rolePlayerProfile,
        });
        if(unityApp !== null){
          unityApp.send("CanvasPlayerProfile", "GetInfoPopupPlayer", _userJson);
        }
      } else {
        reportError("User may not exist", _user);
      }
    };

    const changeUserDescription = async (newDescription) => {
      let _newDesc = await chatCoreCanister.changeUserDescription(newDescription);
      openSuccessPanel();
      getUserDataFromID(userPrincipal.toString());
    };

    /// FRIENDS
    const getUserFriends = async () => {
      if(chatCoreCanister !== null){
        let _userFriends = await chatCoreCanister.getMyFriends();
        let userFriends = [];
        for(let i = 0; i < _userFriends.length; i++){
          let _friendUsername = _userFriends[i].username.split("#");
          _friendUsername = _friendUsername[0];
          let _uf = {
            avatar      : _userFriends[i].avatar,
            name        : _friendUsername,
            status      : getUnityStatusEquivalent(_userFriends[i].status),
            principalID : _userFriends[i].userID.toString(),
          };
          userFriends.push(_uf);
        }
        if(unityApp !== null){
          unityApp.send("Hub_Panel", "GetFriendsInfo", "{\"data\":" + JSON.stringify(userFriends) + "}");
        }
      } else {
        setTimeout(() => {
          getUserFriends()
        }, 1000);
      }
    };

    const getUserPendingNotifications = async () => {
      //let _userFriends = await chatCoreCanister.getFriendListData();
      let _userPendingFriends = await chatCoreCanister.getMyFriendRequests();
      let _upf = [];
      for(let i = 0; i < _userPendingFriends.length; i++){
        let _friendUsername = _userPendingFriends[i].username.split("#");
        _friendUsername = _friendUsername[0];
        let _uf = {
          avatarUser  : _userPendingFriends[i].avatar,
          username    : _friendUsername,
          principalID : _userPendingFriends[i].userID.toString(),
        };
        _upf.push(_uf);
      }
      _upf = JSON.stringify({
        requests      : _upf,
        notifications : []
      });
      if(unityApp !== null){
        unityApp.send("CanvasNotificationRequests", "GetInfoNotificationPanel", _upf);
      }
      setTimeout(() => {
        getUserPendingNotifications();
      }, 20000);
    };

    const acceptFriendRequest = async (user2) => {
      let _accept = await chatCoreCanister.friendRequest(Principal.fromText(user2));
      if(_accept[0] === true){
        openSuccessPanel();
        getUserFriends();
        getUserPendingNotifications();
      }
    };

    const rejectFriendRequest = async (user2) => {
      let _reject = await chatCoreCanister.rejectFriendRequest(Principal.fromText(user2));
      if(_reject[0] === true){
        openSuccessPanel();
      }
    };

    const requestFriendship = async (principal) => {
      let _friendRequest = await chatCoreCanister.friendRequest(Principal.fromText(principal));
      if(_friendRequest[0] === true){
        openSuccessPanel();
        getUserDataFromID(principal);
      }
    };

    /// Direct messages
    const messageUser = async (principal) => {
      let _privateChat = await chatCoreCanister.getPrivateChat(Principal.fromText(principal));
      if(_privateChat[1] === true){
        if(_privateChat[0] > 0){
          await getUserGroups();
          if(unityApp !== null){
            unityApp.send("Chat_Section", "SetGroupSelected", parseInt(_privateChat[0]));
          }
          selectChat(parseInt(_privateChat[0]));
          //openSuccessPanel();
        } else {
          let _createPrivateChat = await chatCoreCanister.create_private_chat(Principal.fromText(principal));
          if(_createPrivateChat[2] > 0){
            await getUserGroups();
            if(unityApp !== null){
              unityApp.send("Chat_Section", "SetGroupSelected", parseInt(_createPrivateChat[2]));
            }
            selectChat(parseInt(_createPrivateChat[2]));
            //openSuccessPanel();
          }
        }
      }
    };

  /// USER DATA FOR HUB
  const setUserdataHub = async () => {
    let _avatar   = await chatCoreCanister.getUserAvatar(userPrincipal);
    let _status   = await chatCoreCanister.getUsersActivity(userPrincipal);
    let _hasApp   = 0;
    if(projectsCanister !== null){
      try{
        let _prevData = await projectsCanister.getMyProject();
        _hasApp = (_prevData !== null && _prevData.length > 0) ? 1 : 0;
      } catch (err){
        reportError("ERROR HAS APP", err);
      }
    }
    _status = (_status.length > 0 && _status[0] !== "") ? getUnityStatusEquivalent(_status) : "Avaliable";
    let _data = JSON.stringify({
        username    : username,
        userState   : _status,
        principalID : userPrincipal.toString(), //getAccountId(userPrincipal, null),
        avatar      : _avatar,
        hasApp      : _hasApp
    });
    if(unityApp !== null){
      unityApp.send("Hub_Panel", "GetUserInfo", _data);
    }
  };

  const getUnityStatusEquivalent = (_id) => {
    switch(_id.toUpperCase()){
      case "AVALIABLE"       : return 0;
      case "DO NOT DISTURBE" : return 1;
      case "AWAY"            : return 2;
      case "OFFLINE"         : return 3;
      default                : return 3;
    }
  };

  const getActivityEquivalent = (_id) => {
    switch(_id){
      case 0: return "Avaliable";
      case 1: return "Do not disturbe";
      case 2: return "Away";
      case 3: return "Offline";
      default: return _id;
    }
  };

  const logUserActivity = async (_data) => {
    let _saveActivity = await chatCoreCanister.logUserActivity(getActivityEquivalent(_data), true);
    if(_saveActivity[0] === true){
      setUserdataHub();
      openSuccessPanel();
    }
  };

  const setImageToUser = async (img) => {
    if(unityApp !== null){
      //unityApp.send("Canvas", "OnAvatarReady", "");
    }
    let _img = await chatCoreCanister.setImageToUser(img);
    return _img;
  };

  /// SEARCH USERS
  const searchUsers = async (userWordToSearch) => {
    let _users = await chatCoreCanister.search_user_by_name(userWordToSearch);
    _users = (_users.length > 0) ? _users[0] : [];
    let _resUsers = [];
    let _data = {
      user_exists  : (_users.length > 0) ? true : false,
      StringSearch : userWordToSearch,
      user_data    : []
    };
    for(let i = 0; i < _users.length; i++){
      let _res = {
        userName    : _users[i].username,
        principalID : _users[i].userID.toString(),
        avatarUser  : _users[i].avatar,
      };
      _resUsers.push(_res);
    }
    _data.user_data = _resUsers;
    _data = JSON.stringify(_data);
    unityApp.send("CanvasSearchUser", "GetUser", _data);
  };



  ///// APPS
  const saveDataApp = async (data) => {
    let _prevData = await projectsCanister.getMyProject();
    let _data = {
      id               : 0,
      name             : data.name,
      appCategoryIndex : data.category,
      logo             : data.Logo,
      banner           : data.Banner,
      patchNotes       : "",
      dscvrPortal      : data.DSCVRPortal,
      blockchain       : "ICP",
      distrikt         : data.Distrikt,
      openChat         : data.OpenChat,
      catalyze         : data.Catalyze,
      twitter          : data.Twitter,
      nftCollections   : {collections : data.nftCollections},
      newVersion       : data.AppVersion,
      currentVersion   : data.AppVersion,
      launchLink       : data.linkDapp
    };
    if(_prevData !== null && _prevData.length > 0){
      let _saveData = await projectsCanister.updateProject(parseInt(_prevData[0].id), _data);
      if(_saveData[0] === true){
        openSuccessPanelAppManagement(); //// THIS MAY CHANGE; CHECK WITH SHIZUKEN
      }
    } else {
      let _createData = await projectsCanister.createProject(_data);
      if(_createData[0] === true){
        openSuccessPanelAppManagement();
      }
    }
  };

  const getUserProjectData = async () => {
    let _prevData = await projectsCanister.getMyProject();
    let _collections = [];
    let _versions    = [];
    try{
      _collections = await nftsCollCanister.getMyCollections();
    } catch (err){
      reportError("ERROR GETTING MY COLLECTIONS", err);
    }
    try{
      _versions = await projectsCanister.getMyProjectsVersions();
    } catch(err){
      reportError("ERROR GETTING MY VERSIONS", err);
    }
    if(_prevData !== undefined && _prevData !== null && _prevData.length > 0){
      let _data = {
        name           : _prevData[0].name,
        category       : parseInt(_prevData[0].appCategoryIndex),
        linkDapp       : _prevData[0].launchLink,
        nftCollections : _prevData[0].nftCollections.collections,
        DSCVRPortal    : _prevData[0].dscvrPortal,
        Distrikt       : _prevData[0].distrikt,
        OpenChat       : _prevData[0].openChat,
        Catalyze       : _prevData[0].catalyze,
        Twitter        : _prevData[0].twitter,
        AppVersion     : _prevData[0].currentVersion,
        Banner         : _prevData[0].banner,
        Logo           : _prevData[0].logo,
      }
      let _versionData = [];
      if(_versions !== undefined && _versions !== null && _versions[0].length > 0){
        for(let i = 0; i < _versions[0].length; i++){
          if(parseInt(_versions[0][i].versionID) !== NaN){
            _versionData.push({
              versionID      : parseInt(_versions[0][i].versionID),
              projectName    : _versions[0][i].projectName,
              linkDapp       : _versions[0][i].linkDapp,
              currentVersion : _versions[0][i].currentVersion,
              blockChain     : _versions[0][i].blockchain
            });
          }
        }
      }
      _versionData = {"versionAppDatas" : _versionData};
      let _collectionsD = [];
      for(let i = 0; i < _collections.length; i++){
        _collectionsD.push({
          "collectionName"    : _collections[i][1].name,
          "canisterID"        : _collections[i][0].toString(),
          "nftStandard"       : getStandardEquivalentNum(_collections[i][1].standard),
          "linkToMarketplace" : _collections[i][1].marketplace[0],
          "avatarUrl"         : _collections[i][1].avatarURL,
        });
      }
      let _collectionData = {"collectionAppDatas" : _collectionsD }
      if(unityApp !== null){
        unityApp.send("AppManagement_Section", "GetInfoApp",         JSON.stringify(_data));
        unityApp.send("AppManagement_Section", "GetInfoVersions",    JSON.stringify(_versionData));
        unityApp.send("AppManagement_Section", "GetInfoCollections", JSON.stringify(_collectionData));
      }
    }
  };
  
  const saveNews = async (data) => {
    let _data = {
      newsId     : 0,
      imageNews  : data.imageNews,
      title      : data.titleNews,
      content    : data.contentNews,
      linkButton : data.linkButtonNews,
      textButton : data.textButtonNews,
    };
    let _createNews = await projectsCanister.addNewsToProject(_data);
    if(_createNews[0] === true){
      openSuccessPanelAppManagement();
    }
    /*
    {"imageNews":"https://avnm2-3aaaa-aaaaj-qacba-cai.raw.ic0.app/img=2295293381","titleNews":"News","contentNews":"This is the news","textButtonNews":"Let's go!","linkButtonNews":"link.com"}
    */
  };

  const saveAppVersions = async (_data) => {
    if(_data.versionAppDatas !== undefined && _data.versionAppDatas !== null && _data.versionAppDatas.length > 0){
      let _versions = [];
      for(let i = 0; i < _data.versionAppDatas.length; i++){
        let _d = _data.versionAppDatas[i];
        _versions.push({
          versionID      : i,
          projectName    : _d.projectName,
          linkDapp       : _d.linkDapp,
          currentVersion : _d.currentVersion,
          blockchain     : _d.blockChain,
        });
      }
      let _saveVersions = await projectsCanister.saveProjectVersions(_versions);
      if(_saveVersions[0] === true){
        openSuccessPanelAppManagement();
      }
    }
  };

  const deleteVersion = async (versionID) => {
    let _deleteVersion = await projectsCanister.deleteVersion(versionID);
    if(_deleteVersion[0] === true){
      openSuccessPanelAppManagement();
    }
  };

  const sendProjectsData = async () => {
    let _projects = await projectsCanister.getAllProjects();
    let _favs     = await chatCoreCanister.getMyFavorites();
    let _allProjects = [];
    for(let i = 0; i < _projects.length; i++){
      let u = _projects[i].user;
      let p = _projects[i].data;
      let n = _projects[i].news[0];
      let _n = [];
      if(n !== undefined && n.length > 0){
        for(let j = 0; j < n.length; j++){
          _n.push({
            "imageNews": n[j].imageNews,
            "title": n[j].title,
            "content": n[j].content,
            "linkButton": getLinkHttps(n[j].linkButton),
            "textButton": n[j].textButton
          });
        }
      }
      let _fav = getIsFavorite(u, _favs);
      let _p = {
        "id": parseInt(p.id),
        "name": p.name,
        "appCategoryIndex": parseInt(p.appCategoryIndex),
        "logo": p.logo,
        "banner": p.banner,
        "patchNotes": p.patchNotes,
        "dscvrPortal": getLinkHttps(p.dscvrPortal),
        "marketPlaces": "",
        "blockchain": p.blockchain,
        "distrikt": getLinkHttps(p.distrikt),
        "openChat": getLinkHttps(p.openChat),
        "catalyze": getLinkHttps(p.catalyze),
        "twitter" : getLinkHttps(p.twitter),
        "nftCollections": p.nftCollections.collections,
        "newVersion": p.newVersion,
        "currentVersion": p.currentVersion,
        "launchLink": getLinkHttps(p.launchLink),
        "listNews": _n,
        "isFavorite" : _fav.isFavorite,
        "favAppOrder" : _fav.favAppOrder
      }
      _allProjects.push(_p);
    }
    let _data = {
      data: _allProjects
    };
    _data = JSON.stringify(_data);
    if(unityApp !== null){
      unityApp.send("AppBrowser_Section","GetAppsInfo", _data);
    }
  };

  const getLinkHttps = (link) => {
    return (link.split("https://").length > 1) ? link : "https://" + link;
  }

  const getIsFavorite = (id, favs) => {
    for(let i = 0; i < favs.length; i++){
      if(favs[i].id === id){
        return {
          isFavorite  : true,
          favAppOrder : parseInt(favs[i].order)
        }
      }
    }
    return {
      isFavorite  : false,
      favAppOrder : -1
    }
  };

  //// EXT TOKENS

  const getUsersExtTokens = async () => {
    let _can;
    if(nftsCollCanister === null){
      switch(walletSelected){
        case "PlugWallet":
          _can = await setCanisterExternalPlug(standardsIDL, canisterNFTsCollections);
          setNFTsCollCanister(_can);
          break;
      };
    } else {
      _can = nftsCollCanister;
    }
    let _coll = await _can.getNftsCanisters();
    setAllNftsCollData(_coll);
    let _list = _coll.map((c) => {
      return c[0].toString();
    });
    //_list.push(canisterNFTsICHUB);
    //_list.push("tnvo7-iaaaa-aaaah-qcy4q-cai");
    setExtCanisters(_list);
  }

  const addNFTCollection = async (standard, canisterID, name, marketplace) => {
    let _data = {
      standard : standard,
      canisterID : Principal.fromText(canisterID),
      name : name,
      marketplace : [marketplace],
      addedBy : userPrincipal
    };
    let _added = await nftsCollCanister.addNFTCollection(_data);
  };

  const getTokens = async () => {
    if(extCanisters.length > 0){
      let _userNfts = [];
      let _userNFTsList = [];
      let _userAcc = getAccountId(userPrincipal, null);
      for(let i = 0; i < extCanisters.length; i++){
        let _can;
        switch(walletSelected){
          case "PlugWallet":
            _can = await setCanisterExternalPlug(extIDL, extCanisters[i]);
            break;
        };
        try{
          let _assets = await _can.getRegistry();
          let _thisCollectionNFTs = [];
          let _thisNftCollData = getNftsCollData(extCanisters[i]);
          if(_thisNftCollData !== null){
            for(let j = 0; j < _assets.length; j++){
              if(_assets[j][1] === _userAcc){
                let _tid = computeTokenIdentifier(extCanisters[i], _assets[j][0]);
                let _url = `https://${extCanisters[i]}.raw.ic0.app/&tokenid=${_tid}`;
                /*let _r = await fetch(_url);
                let _i = await _r.text();
                if(_i.includes("<image href=\"https:")){
                  let _s1 = _i.split("<image href=\"https:");
                  let _s2 = _s1[1].split("\"");
                  _url = _s2[0];
                }*/
                _thisCollectionNFTs.push({
                  nftName   : _thisNftCollData.name + " #" + (parseInt(j) + 1).toString(),
                  nftAvatar : _url,
                  nftUrl    : _url,
                  nftID     : _tid
                });
                _userNFTsList.push({
                  idNFT : _tid,
                  can   : _can
                });
                /*_userNfts.push(
                  <div>
                    <img src={_url} width="100" height="100" />
                    <button onClick={() => { transferNft(_tid, Principal.fromText("24brs-3kr62-c4smi-ptm26-ysspf-zbgrx-lfuux-4sb2b-23wfo-ojhey-rae"), _can); }}>Send</button>
                  </div>
                );*/
              }
            }
            if(_thisCollectionNFTs.length > 0){
              _userNfts.push({
                avatar         : "",
                colectionName  : _thisNftCollData.name,
                marketplaceURL : _thisNftCollData.marketplace,
                canisterID     : _thisNftCollData.canisterID.toString(),
                userNFTs       : _thisCollectionNFTs
              });
            }
          }
          //setNftList(_userNfts);
          //let _balance = await _can.getUserBalance(userPrincipal);
        }catch(err){
          reportError("ERROR GETTING BALANCE", err);
        }
      }
      setUserNFTsList(_userNFTsList);
      let _n = {
        data : _userNfts
      }
      if(unityApp !== null){
        unityApp.send("Hub_Panel", "GetCollectionInfo", JSON.stringify(_n));
      }
    }
  };

  const getNftsCollData = (canID) => {
    for(let i = 0; i < allNftsCollData.length; i++){
      if(allNftsCollData[i][1].canisterID.toString() === canID){
        return allNftsCollData[i][1];
      }
    }
    return null;
  };

  const saveNFTCollection = async (_data) => {
    for(let i = 0; i < _data.collectionAppDatas.length; i++){
      let _c = _data.collectionAppDatas[i];
      let _d = {
        standard    : getStandardEquivalentText(_c.nftStandard),
        canisterID  : Principal.fromText(_c.canisterID),
        name        : _c.collectionName,
        marketplace : [_c.linkToMarketplace],
        addedBy     : userPrincipal,
        avatarURL   : _c.avatarUrl
      };
      let _added = await nftsCollCanister.addNFTCollection(_d);
    }
    getUsersExtTokens();
    //openSuccessPanel();
    openSuccessPanelAppManagement();
  };
  
  /// Receive number from Unity
  const getStandardEquivalentText = (num) => {
    switch(num){
      case 0: case "0": return "EXT";
      default: return "YOU JUST BROKE IT";
    }
  }

  /// Send number to Unity
  const getStandardEquivalentNum = (txt) => {
    switch(txt){
      case "EXT": return 0;
      default: return "YOU JUST BROKE IT";
    }
  }

  const deleteCollection = async (collectionID) => {
    let _remove = await nftsCollCanister.removeCollection(Principal.fromText(collectionID));
    if(_remove[0] === true){
      openSuccessPanelAppManagement();
    }
  };

  const transferNft = async (tid, to) => {
    let _can = getCan(tid);
    if(_can === null){
      return false;
    }
    //let memo = "Sent from IC HUB";
    let memo = [...new Uint8Array(Buffer.from("Sent from IC HUB", "utf-8"))];
    let _transferRequest = {
      from       : { principal : Principal.fromText(userPrincipal.toString()) },
      to         : { principal : Principal.fromText(to) },
      token      : tid,
      amount     : 1,
      memo       : memo,
      notify     : false,
      subaccount : [],
    };
    try{
      let _transfer = await _can.transfer(_transferRequest);
      getTokens();
      openSuccessPanel();
    }catch(err){
      reportError("Error while transferring NFT", err);
    }
  };

  const getCan = (tid) => {
    if(userNFTsList !== null){
      for(let i = 0; i < userNFTsList.length; i++){
        if(userNFTsList[i].idNFT.toString() === tid){
          return userNFTsList[i].can;
        }
      }
    }
    return null;
  };
  

  const addReport = async(data) => {
    let _can;
    if(reportsCanister === null){
      switch(walletSelected){
        case "PlugWallet":
          _can = await setCanisterExternalPlug(reportsIDL, reportsCanisterId);
          setReportsCanister(_can);
          break;
      };
    } else {
      _can = reportsCanister;
    }
    let _date = new Date();
    let _reportData = {
        category     : data.categoryReport,
        reportType   : data.reportType,
        userReports  : userPrincipal,
        reported     : data.idReported,
        dateReported : _date.toLocaleString(),
        reasonReport : data.reasonReport
    }
    let newReport =  await _can.addReport(_reportData);
    if(newReport === true){
      openSuccessPanel();
    }
  }


  const value = { setUnityApp, setWalletSelected, setCoreCanisterExternal, userPrincipal, setUserPrincipal, setIdentityChat, 
                  setUsername, searchGroup, createGroup, addUserToGroup, selectChat, leaveGroup, userGroups, 
                  requestJoinGroup, getGroupUsers, transferOwner, acceptGroupRequest, rejectGroupRequest, 
                  changeGroupDescription, changeGroupTitle, changeGroupPrivacy, getUserDataFromID, getUserFriends,
                  getUserPendingNotifications, acceptFriendRequest, rejectFriendRequest, messageUser, requestFriendship,
                  setUserdataHub, logUserActivity, searchUsers, changeUserDescription, setImageToUser,
                  checkUserActivity, getTokens, saveDataApp, canisterImages, canisterImagesId, saveNews, currentSection,
                  setCurrentSection, nftList, addNFTCollection, transferNft, addReport, openSuccessPanel, 
                  getProjectsCanister, projectsCanister, userAccountID, setUserAccountID, saveNFTCollection,
                  walletSelected, setCanisterExternalPlug, setCanisterExternalIW, setCanisterExternal, deleteCollection, 
                  deleteVersion, saveAppVersions};

  return <ChatAppContext.Provider value={value}>{children}</ChatAppContext.Provider>;
};

export default ChatICAppProvider;