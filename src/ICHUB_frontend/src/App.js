import React, { useEffect, useState, useContext } from 'react';
import Unity, { UnityContext } from "react-unity-webgl";
import { loginII, handleAuthenticated, loginStoic, loginPlug, loginInfinityWallet, setCanisterData } from './functions/login';
import { idlFactory as backendIDL } from '../../declarations/ICHUB_backend';
import { fromHexString, toHexString } from "./functions/account";
import { AppContext } from './context';
import { ChatAppContext } from './chatSDK/chatAppContext';
import { Usergeek } from "usergeek-ic-js";
import allProjects from "./resources/projects.json";

/// Add Unity build files to the project
const unityContext = new UnityContext({
    codeUrl:      "ICHUB/Build/ICHUB.wasm",
    dataUrl:      "ICHUB/Build/ICHUB.data",
    frameworkUrl: "ICHUB/Build/ICHUB.framework.js",
    loaderUrl:    "ICHUB/Build/ICHUB.loader.js",
});
const backendCanisterID = "oqnbw-faaaa-aaaag-abcvq-cai";
const version = 0.51;

let ccID = "acedcf79daec4cb86dd7b44c53dd5111a81a006d26a63b8dd5e822b6fd711ad5";

/// For the moment this data is added manually until all the core structure is better planned and then coded into backend
const manual_projects = JSON.stringify(allProjects);

export default function App(props){

    /// Functions from the App context
    let { identity, setIdentity, canister, setCanister, walletPopup, setWalletPopup, walletService, setWalletService,
          saveSession, setSaveSession } = useContext(AppContext);
    /// Functions from the Chat context
    let { setUnityApp, setWalletSelected, setCoreCanisterExternal, setUserPrincipal, setIdentityChat, setUsername, 
            searchGroup, createGroup, addUserToGroup, userPrincipal, selectChat, leaveGroup, requestJoinGroup, 
            getGroupUsers, acceptGroupRequest, rejectGroupRequest, changeGroupTitle, changeGroupDescription, 
            changeGroupPrivacy, getUserDataFromID, getUserFriends, getUserPendingNotifications, setUserdataHub,
            acceptFriendRequest, rejectFriendRequest, messageUser, requestFriendship, logUserActivity, getUsersActivity,
            searchUsers, changeUserDescription, setImageToUser, checkUserActivity } = useContext(ChatAppContext);
    /// Local variables
    const [usergeekInitialized, setUsergeekInitialized] = useState(false);
    const [balance, setBalance] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    ///////// INITIALIZE /////////
    useEffect(() => {
        setUnityApp(unityContext);
        initializeUsergeek();
    }, []);

    useEffect(function () {
        unityContext.on("loaded", function () {
          setIsLoaded(true);
        });
      }, []);

    ///////// USERGEEK /////////
    const initializeUsergeek = () => {
        try{
            Usergeek.init({
                apiKey: "010D020172DE465FEF2BCEB11CAFCDE4",
                host: "https://fbbjb-oyaaa-aaaah-qaojq-cai.raw.ic0.app/"
            })
        } catch(err){
            console.log("Not able to init Usergeek:", err);
        }
    };

    const setUsergeekPrincipal = async (principal) => {
        try{
            Usergeek.setPrincipal(principal);
            Usergeek.trackSession();
            setUsergeekInitialized(true);
        } catch(err){
            console.log("Not able to track Usergeek:", err);
        }
    };

    ///////// CONTROL /////////
    unityContext.on("CopyToClipboard", (txt) => {
        navigator.clipboard.writeText(txt);
    });

    /// AUTO LOGIN
    useEffect(() => {
        if(isLoaded === true){
            console.log("SESSION", saveSession, walletService);
            if(saveSession === null && walletService === null){
                let _prevSave = localStorage.getItem("ichub");
                if(_prevSave !== null && _prevSave !== undefined){
                    _prevSave = JSON.parse(_prevSave);
                    if(_prevSave.version === undefined || _prevSave.version === null || _prevSave.version < version){
                        localStorage.removeItem("ichub");
                    } else {
                        if(_prevSave.flow === true){
                            loginWallet(_prevSave.walletService, true);
                        } else {
                            localStorage.removeItem("ichub");
                        }
                    }
                }
            } else {
                if(saveSession !== null && walletService !== null){
                    localStorage.setItem("ichub", JSON.stringify({flow: saveSession, walletService: walletService, version: version}));
                }
            }
        }
    }, [saveSession, walletService, isLoaded]);

    ///////// LOGIN PROCESS /////////
        /// Login with selected wallet
        unityContext.on("WalletsLogin", (walletSelectedByUser) => {
            let _data = JSON.parse(walletSelectedByUser);
            loginWallet(_data.wallet, (_data.KeepLogin.toUpperCase() === "TRUE"));
        });

        const loginWallet = async (_wallet, keepLogin) => {
            setWalletService(_wallet);
            setWalletSelected(_wallet);
            if(saveSession === null){
                setSaveSession(keepLogin);
            }
            switch(_wallet){
                case "PlugWallet":
                    setWalletPopup(true);
                    let _Plug = await loginPlug();
                    setIdentityChat(_Plug);
                    setIdentity(_Plug);
                    setUsergeekPrincipal(_Plug);
                    break;
                case "InfinityWallet":
                    setWalletPopup(true);
                    let _IW = await loginInfinityWallet();
                    setIdentityChat(_IW);
                    setIdentity(_IW);
                    setUsergeekPrincipal(_IW);
                    break;
                case "IdentityWallet":
                    setWalletPopup(false);
                    let _II = await loginII();
                    let _Identity;
                    if (await _II.isAuthenticated()){
                        _Identity = await handleAuthenticated(_II);
                        finishIILogin(_Identity);
                    } else {
                        await _II.login({
                            onSuccess: async () => {
                                _Identity = await handleAuthenticated(_II);
                                finishIILogin(_Identity);
                            },
                        });
                    }
                    break;
                case "StoicWallet":
                    setWalletPopup(false);
                    let _StoicI = await loginStoic();
                    setIdentityChat(_StoicI);
                    setIdentity(_StoicI);
                    setUsergeekPrincipal(await _StoicI.getPrincipal());
                    break;
                default:
                    console.log("WALLET SELECTED:", _wallet);
                    alert("ERROR SELECTING WALLET");
                    window.location.reload();
                    break;
            };
        };

        const finishIILogin = async (_Identity) => {
            setIdentityChat(_Identity);
            setIdentity(_Identity);
            setUsergeekPrincipal(await _Identity.getPrincipal());
        };

        const setAllCanisters = async () => {
            if(walletPopup === false){
                let can = await setCanisterData(backendIDL, backendCanisterID, identity);
                setCanister(can);
            } else {
                switch(walletService){
                    case "InfinityWallet":
                        generateIWCan();
                        break;
                    case "PlugWallet":
                        generatePlugCan();
                        break;
                    default:
                        alert("Canister not generated");
                        break;
                }
            }
        };

        const getUserData = async () => {
            let _userData = await canister.getUserData();
            if(_userData[0] !== undefined){
                unityContext.send("Canvas", "OnNamePlayerSet", JSON.stringify({
                    "User" : _userData[0].username + "#" + _userData[0].hashtag,
                    "Wallet" : toHexString(_userData[0].accountID)
                }));
                setUserPrincipal(_userData[0].userID);
                setUsername(_userData[0].username + "#" + _userData[0].hashtag);
                unityContext.send("Canvas","OnAvatarReady", "");
            } else {
                unityContext.send("Canvas", "OnReceiveLoginData", "");
            }
        };

        unityContext.on("OnHubScene", () => {
            sendProjectsManual();
            getICPBalance();
            getICPFromAccount();
            getUserFriends();
            getUserPendingNotifications();
            setUserdataHub();
            checkUserActivity();
        });

        ///Plug wallet
        const generatePlugCan = async () => {
            (async () => {
                const _can = await window.ic.plug.createActor({
                    canisterId: backendCanisterID,
                    interfaceFactory: backendIDL,
                });
                setCanister(_can);
            })()
        };

        const generateIWCan = async () => {
            try{
            (async () => {
                const _can = await window.ic.infinityWallet.createActor({
                    canisterId: backendCanisterID,
                    interfaceFactory: backendIDL,
                });
                setCanister(_can);
            })()
            } catch(e){
                console.log("IW E", e);
                alert("Your Wallet session has expired. Please login again in their app and then reload this page");
            }
        };

        useEffect(() => {
            if(identity !== null && walletPopup !== null && walletService !== null && usergeekInitialized !== false){
                setAllCanisters();
                setCoreCanisterExternal(identity);
                Usergeek.trackEvent(walletService);
            }
        }, [identity, walletPopup, walletService, usergeekInitialized]);

        useEffect(() => {
            if(canister !== null){
                getUserData();
            }
        }, [canister]);

    ///////// ICP //////////
    const getICPBalance = async () => {
        let _tokens = JSON.stringify({
            data : [{
                avatar : "https://logos-download.com/wp-content/uploads/2022/01/Internet_Computer_Logo.png",
                name   : "ICP",
                value  : "Loading...",
                id     : 1,
            }]
        });
        unityContext.send("Hub_Panel", "GetTokensInfo", _tokens);
        let _icp = await canister.getICPBalance();
        let icp_dec = parseFloat(parseInt(_icp.e8s)) / 100000000;
        _tokens = JSON.stringify({
            data : [{
                avatar : "https://logos-download.com/wp-content/uploads/2022/01/Internet_Computer_Logo.png",
                name   : "ICP",
                value  : icp_dec,
                id     : 1,
            }]
        });
        unityContext.send("Hub_Panel", "GetTokensInfo", _tokens);
    };

    const getICPFromAccount = async () => {
        let _icp = await canister.getBalanceFromAccount(fromHexString("acedcf79daec4cb86dd7b44c53dd5111a81a006d26a63b8dd5e822b6fd711ad5"));
        setBalance(parseInt(_icp.e8s) / 100000000);
        setTimeout(() => {
            getICPFromAccount();
        }, 15000);
    };

    ///////// NEW USER PROCESS /////////
        unityContext.on("SetNameLogin", (usernamePlusHash) => {
            if(usernamePlusHash !== undefined){
                let _u = usernamePlusHash.split("#");
                if(_u.length !== 2){
                    alert("You need to provide user and hash");
                    return false;
                }
                if(_u[1].trim().length <= 2 || _u[1].trim().length > 4){
                    alert("Invalid hash");
                    return false;
                }
                saveNewUser(_u[0], _u[1]);
            }
        });

        const saveNewUser = async (_user, _hash) => {
            let _newUser = await canister.createUser(_user, _hash);
            let _userData = await canister.getUserData();
            if(_userData[0] !== undefined){
                unityContext.send("Canvas", "OnNamePlayerSet", JSON.stringify({
                    "User" : _user + "#" + _hash,
                    "Wallet" : toHexString(_userData[0].accountID)
                }));
                setUserPrincipal(_userData[0].userID);
                setUsername(_userData[0].username + "#" + _userData[0].hashtag);
            } else {
                unityContext.send("Canvas", "OnReceiveLoginData", "");
            }
        };

        unityContext.on("SetAvatar", () => {
            saveUserImage();
        });

        const saveUserImage = async () => {
            let img = "https://cdn3.iconfinder.com/data/icons/delivery-and-logistics/24/logistics-25-512.png";
            let _uImg = await canister.setImageToUser(img, { "url": null });
            await setImageToUser(img);
            console.log("_uImg", _uImg);
            unityContext.send("Canvas","OnAvatarReady", "");
        };

        const sendProjectsManual = () => {
            unityContext.send("Hub_Panel","GetAppsInfo", manual_projects);
        };

    ///////// SEARCH GROUPS /////////
        unityContext.on("SearchGroup", (name) => {
            isUserInGroup(name);
        });

        const isUserInGroup = async (name) => {
            let _isUserInGroup = await searchGroup(name);
            console.log("USER IN GROUP", JSON.stringify(_isUserInGroup));
            unityContext.send("SearchGroup Panel", "GetGroups", JSON.stringify(_isUserInGroup));
        };

    /////// SELECT GROUPS
    unityContext.on("SelectChatGroup", (groupID) => {
        selectChat(groupID);
    });

    /////// JOIN CHAT GROUPS
    unityContext.on("RequestJoinGroup", (groupID) => {
        joinGroup(groupID);
    });
    const joinGroup = async (groupID) => {
        console.log("JOIN GROUP", groupID);
        let _requested = await requestJoinGroup(groupID);
        if(_requested[0] === true){
            unityContext.send("CanvasPopup", "OpenSuccessPanel", "");
        } else {
            console.log("Error while trying to add user to group", _requested[1]);
            alert("Error while trying to add user to group");
        }
    };

    //////// EXIT GROUPS
    unityContext.on("LeaveGroup", (groupID) => {
        leaveGroup(groupID);
    });

    //////// ACCEPT AND DENY GROUP REQUESTS
    unityContext.on("AcceptRequest", (json) => {
        acceptGroupRequest(JSON.parse(json));
    });

    unityContext.on("DenyRequest", (json) => {
        rejectGroupRequest(JSON.parse(json));
    });
    
    /// SEND PRIVATE MESSAGE TO USER
    unityContext.on("SendMessageToUser", (principal) => {
        messageUser(principal);
    });

    /// SEND FRIEND REQUEST
    unityContext.on("SentFriendRequest", (principal) => {
        requestFriendship(principal)
    });

    /// ACCEPT AND DENY FRIEND REQUESTS
    unityContext.on("AcceptFriendRequest", (principal) => {
        acceptFriendRequest(principal);
    });

    unityContext.on("DenyFriendRequest", (principal) => {
        rejectFriendRequest(principal);
    });

    /// CHANGE GROUP DATA
    unityContext.on("ChangeTitle", (json) => {
        changeGroupTitle(JSON.parse(json));
    });

    unityContext.on("ChangeDescription", (json) => {
        changeGroupDescription(JSON.parse(json));
    });

    unityContext.on("SetGroupPrivate", (idGroup) => {
        changeGroupPrivacy(idGroup, true);
    });

    unityContext.on("SetGroupPublic", (idGroup) => {
        changeGroupPrivacy(idGroup, false);
    });

    unityContext.on("CreateGroup", (json) => {
        let _data = JSON.parse(json);
        createGroup(_data);
    });

    /// CHANGE USER DATA
    unityContext.on("ChangeDescriptionUser", (newDescription) => {
        changeUserDescription(newDescription);
    });

    /// For User Panel Info
    unityContext.on("CallToUser", (userRequestedID) => {
        getUserDataFromID(userRequestedID);
    });

    /// User's activity
    /*unityContext.on("logUserActivity", (_data) => {
        logUserActivity(_data);
    });

    unityContext.on("getUsersActivity", () => {
        getUsersActivity();
    });
    */

    /// Search Users
    unityContext.on("SearchUser", (wordToSearch) => {
        searchUsers(wordToSearch);
    });

    unityContext.on("LogoutFromProfile", () => {
        localStorage.removeItem("ichub");
        window.location.reload();
    });


    //// Pk#1234 (Plug)  4fec8917ffd42657c22e82a59eb9ae9f48b8503125811059fc5bffd4c72c6d1f
    //// Pk#4321 (Stoic) fbaab62eb1b779036e885fa186b1abcba2e63571cd50de5ebdf209c79cd0113f


    return(
        <>
            <Unity
                unityContext = { unityContext }
                style = {{
                    height: "auto",
                    width: "100%",
                }} 
            />
            <br />
            {/*<label>{balance}</label>*/}
        </>
    );
};