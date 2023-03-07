import React, { createContext, useEffect, useState } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { idlFactory as coreCanisterIDL } from './core';
import { idlFactory as chatCanisterIDL } from './public_group';

export const ChatAppContext = createContext();

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
  const [unityApp,         setUnityApp]         = useState(null); /// unityApp
  const [userPrincipal,    setUserPrincipal]    = useState(null); /// User's principal
  const [username,         setUsername]         = useState(null); /// Username
  const [identity,         setIdentityChat]     = useState(null); /// An identity of the user logged in
  const [chatCoreCanister, setChatCoreCanister] = useState(null); /// The canister of the chat
  const [userGroups,       setUserGroups]       = useState(null); /// The user's groups list
  const [chatSelected,     setChatSelected]     = useState(null); /// The chat selected
  const [chatCanister,     setChatCanister]     = useState(null); /// The canister of the selected chat
  const [walletSelected,   setWalletSelected]   = useState(null); /// The wallet service selected by the user to login

  
  /// The IC's host URL
  const host = 'https://raw.ic0.app/';
  /// The Chat canisterId
  const coreCanisterId = "2nfjo-7iaaa-aaaag-qawaq-cai";

  useEffect(() => { }, [chatCoreCanister]);

  const checkUserActivity = async () => {
    if(_lastActivity === null){
      _lastActivity = new Date();
    }
    let _now = new Date();
    const diffTime = (_lastActivity !== null) ?  Math.abs(_now - _lastActivity) : 0;
    console.log("DIFF TIME", diffTime, userPrincipal !== null);
    if(diffTime > 60000 && userPrincipal !== null){
      let _getUserStatus = await chatCoreCanister.getUsersActivity(userPrincipal);
      if(_getUserStatus !== "Away"){
        await chatCoreCanister.logUserActivity("Away");
        setUserdataHub();
      }
    }
    setTimeout(() => {
      checkUserActivity();
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

      unityApp.on("AddUserToGroup", (json) => {
        addUserToGroup(json);
      });
    }
  }, [unityApp]);

  const openSuccessPanel = () => {
    if(unityApp !== null){
      unityApp.send("CanvasPopup", "OpenSuccessPanel", "");
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

  useEffect(() => {
    if(userPrincipal !== null && username !== null){
      loginUser();
    }
  }, [userPrincipal, username]);

  const loginUser = async () => {
    /// Get user if exists or create new one
    if(userPrincipal !== null){
      let _user = await chatCoreCanister.get_user(userPrincipal);
      if(_user === null || _user === [] || _user.length <= 0){
        let _newUser = await chatCoreCanister.create_user_profile(username, "");
      }
      /// Already created, set the data and get the user's groups
      let _userGroups = await chatCoreCanister.get_user_groups();
      if(_userGroups.length > 0) {
        setUserGroups(_userGroups);
        let _publicChat = _userGroups[0];
        setChatSelected(_publicChat);
      }
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
          console.log("Error getting role", err);
        }
        if(_userGroups[i].groupID !== chatSelected.groupID){ /// All but the selected chat
          let _group = {
            id       :   parseInt(_userGroups[i].groupID),
            name     : (_userGroups[i].isDirect === true) ? (_userGroups[i].name.split(" ")[0] === username) ? _userGroups[i].name.split(" ")[1].split("#")[0] : _userGroups[i].name.split(" ")[0].split("#")[0] : _userGroups[i].name.split(" ").map((n)=>n[0]).join(""),
            RoleUser : _role,
            avatar   : _userGroups[i].avatar
          };
          _groupsUnity.push(_group);
        }
      }
      /// After we have the array, it needs to be encapsuled into another json to be processed inside Unity3D
      _groupsUnity = "{\"data\":" + JSON.stringify(_groupsUnity) + "}";
      console.log("CanvasChat", "GetGroups", _groupsUnity);
      if(unityApp !== null){
        unityApp.send("CanvasChat", "GetGroups", _groupsUnity);
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
    let nameGroup        = (chatSelected.isDirect === true) ? (chatSelected.name.split(" ")[0] === username) ? chatSelected.name.split(" ")[1] : chatSelected.name.split(" ")[0] : chatSelected.name;
    let avatarGroup      = chatSelected.avatar;
    let descriptionGroup = chatSelected.description;
    let _roleuser        = getRoleEnum(await chatCanister.getUserRole());
    let isPrivate        = chatSelected.isPrivate;
    let members          = [];
    let pending          = [];
    try{
      members = await chatCanister.get_group_users();
    }catch(err){
      console.log("Error getting members", err);
    }
    if(_roleuser === 0){
      try{
        pending = await chatCanister.getUsersPending();
      }catch(err){
        console.log("Error getting pending users", err);
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

  const sendMessage = async (message) => {
    if(message !== null && message.trim() !== ""){
      try{
        let _send = await chatCanister.add_text_message(message);
        unityApp.send("CanvasChat", "MessageSent", "");
      } catch(err){
        console.log("Error sending message", err);
        unityApp.send("CanvasChat", "MessageSent", "");
      }
    }
  };

  const selectChat = async (groupID) => {
    let _ug;
    let _activity = chatCoreCanister.logUserActivity("Online");
    _lastActivity = new Date();
    console.log("_lastActivity" ,_lastActivity);
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
      let _chatText = await chatCanister.get_messages();
      let _msgUnity = [];
      if(_chatText !== null){
        _chatText.sort((a, b) => { return (parseInt(a[0]) - parseInt(b[0])) });
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
            avatarUser  : "https://cdn3.iconfinder.com/data/icons/delivery-and-logistics/24/logistics-25-512.png",
          };
          _msgUnity.push(_msg);
        }
      }
      let _userRole = getRoleEnum(await chatCanister.getUserRole());
      let nameGroup = (chatSelected.isDirect === true) ? (chatSelected.name.split(" ")[0] === username) ? chatSelected.name.split(" ")[1] : chatSelected.name.split(" ")[0] : chatSelected.name;
      _msgUnity = "{\"data\":" + JSON.stringify(_msgUnity) + ", \"nameGroup\":\"" + nameGroup + "\", \"avatarGroup\":\"" + /*nameGroup.split(" ").map((n)=>n[0]).join("")*/ chatSelected.avatar + "\", \"idGroup\":" + parseInt(chatSelected.groupID) + ", \"role\":" + _userRole + "}";
      if(unityApp !== null){
        unityApp.send("CanvasChat", "GetChatMessages", _msgUnity);
      }
      setTimeout(() => {
        updateMessages(_counter);
      }, 5000);
    }
  };

  const updateMessages = (_counter) => {
    renderChatMessages(_counter);
  };

  const getUserGroups = async () => {
    let _userGroups = await chatCoreCanister.get_user_groups();
    if(_userGroups !== null && _userGroups.length > 0){
      setUserGroups(_userGroups);
      if(_loadingGroups === false){
        _loadingGroups = true;
        loadGroupsUpdated();
      }
    } else {
      console.log("USER GROUPS IS NULL");
    }
  };

  const loadGroupsUpdated = async () => {
    renderGroupsList();
    setTimeout(() => {
      loadGroupsUpdated();
    }, 10000);
  };

  useEffect(() => {
    if(userGroups !== null && chatSelected !== null){
      renderGroupsList();
    }
  }, [userGroups, chatSelected]);

  const createGroup = async (groupData) => {
    let _isPrivate = (groupData.isPrivate.toUpperCase() === "TRUE") ? true : false;
    let _group = await chatCoreCanister.create_group(groupData.namegroup, _isPrivate, false, groupData.description);
    console.log("Group created", _group);
    getUserGroups();
    openSuccessPanel();
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
            console.log("has requested, error", e);
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
        console.log("User json", _userJson);
        if(unityApp !== null){
          unityApp.send("CanvasPlayerProfile", "GetInfoPopupPlayer", _userJson);
        }
      } else {
        console.log("User may not exist", _user);
      }
    };

    const changeUserDescription = async (newDescription) => {
      let _newDesc = await chatCoreCanister.changeUserDescription(newDescription);
      console.log("New description", _newDesc);
      openSuccessPanel();
      getUserDataFromID(userPrincipal.toString());
    };

    /// FRIENDS
    const getUserFriends = async () => {
      let _userFriends = await chatCoreCanister.getMyFriends();
      let userFriends = [];
      for(let i = 0; i < _userFriends.length; i++){
        let _friendUsername = _userFriends[i].username.split("#");
        _friendUsername = _friendUsername[0];
        let _uf = {
          avatar      : _userFriends[i].avatar,
          name        : _friendUsername,
          status      : _userFriends[i].status,
          principalID : _userFriends[i].userID.toString(),
        };
        userFriends.push(_uf);
      }
      if(unityApp !== null){
        unityApp.send("Hub_Panel", "GetFriendsInfo", "{\"data\":" + JSON.stringify(userFriends) + "}");
      }
    };

    const getUserPendingNotifications = async () => {
      let _userFriends = await chatCoreCanister.getFriendListData();
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
        unityApp.send("FriendRequest Panel", "GetInfoNotificationPanel", _upf);
      }
      setTimeout(() => {
        getUserPendingNotifications();
      }, 15000);
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
          selectChat(parseInt(_privateChat[0]));
          openSuccessPanel();
        } else {
          let _createPrivateChat = await chatCoreCanister.create_private_chat(Principal.fromText(principal));
          if(_createPrivateChat[2] > 0){
            await getUserGroups();
            selectChat(parseInt(_createPrivateChat[2]));
          }
        }
      }
    };

  /// USER DATA FOR HUB
  const setUserdataHub = async () => {
    let _avatar = await chatCoreCanister.getUserAvatar(userPrincipal);
    let _status = await chatCoreCanister.getUsersActivity(userPrincipal);
    _status = (_status.length > 0 && _status[0] !== "") ? _status[0] : "Online";
    let _data = JSON.stringify({
        username    : username,
        userState   : _status,
        principalID : userPrincipal.toString(),
        avatar      : _avatar,
    });
    if(unityApp !== null){
      unityApp.send("Hub_Panel", "GetUserInfo", _data);
    }
  };

  const logUserActivity = async (_data) => {
    let _saveActivity = await chatCoreCanister.logUserActivity(_data);
    console.log("_saveActivity", _saveActivity);
  };

  const getUsersActivity = async () => {
    let _getUsersActivity = await chatCoreCanister.getUsersActivity(userPrincipal);
    console.log("User's activity", _getUsersActivity);
  };

  const setImageToUser = async (img) => {
    let _img = await chatCoreCanister.setImageToUser(img);
    console.log("Img saved", _img);
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
    console.log("_users found", _users, _data);
    unityApp.send("SearchUser Panel", "GetUser", _data);
  };


  const value = { setUnityApp, setWalletSelected, setCoreCanisterExternal, setUserPrincipal, setIdentityChat, setUsername, 
                  searchGroup, createGroup, addUserToGroup, selectChat, leaveGroup, userPrincipal, userGroups, 
                  requestJoinGroup, getGroupUsers, transferOwner, acceptGroupRequest, rejectGroupRequest, 
                  changeGroupDescription, changeGroupTitle, changeGroupPrivacy, getUserDataFromID, getUserFriends,
                  getUserPendingNotifications, acceptFriendRequest, rejectFriendRequest, messageUser, requestFriendship,
                  setUserdataHub, logUserActivity, getUsersActivity, searchUsers, changeUserDescription, setImageToUser,
                  checkUserActivity };

  return <ChatAppContext.Provider value={value}>{children}</ChatAppContext.Provider>;
};

export default ChatICAppProvider;