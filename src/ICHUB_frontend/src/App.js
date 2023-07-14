



/**
 * 
 * 
 * REVISAR LEAK DE MEMORIA RAM Y EXCESO DE USO DE CPU
 * 
 * 
 */



/*
*
*
*
* NECESITO HACER QUE EL ENVIO DE ICP SEA TANTO A PRINCIPAL COMO ADDRESS
* HACER PRUEBAS DE ENVIO DE ICP
*
*
*
*/





import React, { useEffect, useState, useContext } from 'react';
import Unity, { UnityContext } from "react-unity-webgl";
import { Principal } from '@dfinity/principal';
import { loginII, handleAuthenticated, loginStoic, loginPlug, loginInfinityWallet, setCanisterData } from './functions/login';
import { idlFactory as backendIDL } from '../../declarations/ICHUB_backend';
import { fromHexString, toHexString, getAccountId } from "./functions/account";
import { AppContext } from './context';
import { ChatAppContext } from './chatSDK/chatAppContext';
import { Usergeek } from "usergeek-ic-js";
import axios from 'axios';
import "./styles/main.css";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";
import Lottie from "lottie-react";
import loadingAnim from "./resources/loading_anim/hubanim.json";


/// Add Unity build files to the project
const chunkSize = 2000000;
const unityContext = new UnityContext({
    codeUrl:      "ICHUB/Build/ICHUB.wasm",
    dataUrl:      "ICHUB/Build/ICHUB.data",
    frameworkUrl: "ICHUB/Build/ICHUB.framework.js",
    loaderUrl:    "ICHUB/Build/ICHUB.loader.js",
});
const backendCanisterID = "oqnbw-faaaa-aaaag-abcvq-cai";
const version = 0.51;

let ccID = "acedcf79daec4cb86dd7b44c53dd5111a81a006d26a63b8dd5e822b6fd711ad5";

export default function App(props){

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
      };
    
      const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('image', file);
        try {
          await axios.post('/api/upload', formData);
          alert('Image uploaded successfully');
        } catch (error) {
          alert('Error uploading image');
        }
      };

    /// Functions from the App context
    let { identity, setIdentity, canister, setCanister, walletPopup, setWalletPopup, walletService, setWalletService,
          saveSession, setSaveSession } = useContext(AppContext);
    /// Functions from the Chat context
    let { setUnityApp, setWalletSelected, setCoreCanisterExternal, userPrincipal, setUserPrincipal, setIdentityChat, setUsername, 
            searchGroup, createGroup, selectChat, leaveGroup, requestJoinGroup, acceptGroupRequest, rejectGroupRequest, 
            changeGroupTitle, changeGroupDescription, changeGroupPrivacy, getUserDataFromID, getUserFriends, 
            getUserPendingNotifications, setUserdataHub, acceptFriendRequest, rejectFriendRequest, messageUser, 
            requestFriendship, logUserActivity, searchUsers, changeUserDescription, setImageToUser, checkUserActivity,
            getTokens, saveDataApp, canisterImages, canisterImagesId, saveNews, setCurrentSection, nftList, addNFTCollection,
            transferNft, addReport, openSuccessPanel, userAccountID, setUserAccountID, getProjectsCanister, projectsCanister
        } = useContext(ChatAppContext);
    /// Local variables
    const [usergeekInitialized, setUsergeekInitialized] = useState(false);
    const [balance, setBalance] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [imageLoadingSection, setImageLoadingSection] = useState(null);

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
            getProjectsCanister();
        });

        const initAllHUBData = async() => {
            prepHUB();
            getUserAccID();
            getICPBalance();
            //getICPFromAccount();
            getUserFriends();
            getUserPendingNotifications();
            setUserdataHub();
            checkUserActivity();
        }

        useEffect(() => {
            if(projectsCanister !== null){
                initAllHUBData();
            }
        }, [projectsCanister]);

        const getUserAccID = async () => {
            try{
                let _accID  = await canister.mySubaccount();
                setUserAccountID(_accID);
            } catch(err){
                console.log("ERR mySubaccount", err);
            }
        }

        const prepHUB = () => {
            /// Tokens
            let _tokens = JSON.stringify({
                data : [{
                    avatar : "https://logos-download.com/wp-content/uploads/2022/01/Internet_Computer_Logo.png",
                    name   : "ICP",
                    value  : "Loading...",
                    id     : "ICP",
                }]
            });
            /// Friends
            let userFriends = [];
            let _uf = {
                avatar      : "",
                name        : "...",
                status      : "",
                principalID : "",
            };
            userFriends.push(_uf);
            /// Collections
            let _userNfts = [];
            let _userNFTsList = [];
            let _thisCollectionNFTs = [];
            //// let _userAcc = getAccountId(userPrincipal, null);
            _thisCollectionNFTs.push({
                nftName   : "Loading...",
                nftAvatar : "",
                nftUrl    : "",
                nftID     : ""
              });
              _userNFTsList.push({
                idNFT : "",
                can   : ""
              });
            _userNfts.push({
              avatar         : "",
              colectionName  : "Loading...",
              marketplaceURL : "",
              canisterID     : "",
              userNFTs       : ""
            });
            let _n = {
              data : _userNfts
            }
            /// Send pre-data
            unityContext.send("Hub_Panel", "GetTokensInfo", _tokens);
            unityContext.send("Hub_Panel", "GetFriendsInfo", "{\"data\":" + JSON.stringify(userFriends) + "}");
            unityContext.send("Hub_Panel", "GetCollectionInfo", JSON.stringify(_n));
        };

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
        console.clear();
        if(userPrincipal !== undefined){
            let _icp = await canister.getICPBalance();
            // try{
            //     const ledger = LedgerCanister.create();
            //     const _accID = AccountIdentifier.fromHex(getAccountId(userPrincipal, null));

            //     // let _p = Principal.fromText(userPrincipal.toString());//.toUint8Array();
            //     // console.log("_p", _p);
            //     // const accountIdentifier = AccountIdentifier.fromPrincipal({ _p });
            //     // const accountIdentifier = AccountIdentifier.fromPrincipal({ _p });
            //     // console.log("WILL GET NEW ICP", accountIdentifier, "-");
            //     // /*const accountIdentifier = AccountIdentifier.fromHex(
            //     //     "acedcf79daec4cb86dd7b44c53dd5111a81a006d26a63b8dd5e822b6fd711ad5"
            //     // );*/
            //     const _newICP = await ledger.accountBalance( _accID );
            //     // //const _newICP = await ledger.accountBalance( AccountIdentifier.fromPrincipal({principal: userPrincipal, subAccount: null}) , false);
            //     console.log("NEW ICP", _newICP);
            // }catch(err){
            //     console.log("ERR ", err);
            // }
            let icp_dec = parseFloat(parseInt(_icp.e8s)) / 100000000;
            let _tokens = JSON.stringify({
                data : [{
                    avatar : "https://logos-download.com/wp-content/uploads/2022/01/Internet_Computer_Logo.png",
                    name   : "ICP",
                    value  : icp_dec,
                    id     : 1,
                }]
            });
            unityContext.send("Hub_Panel", "GetTokensInfo", _tokens);
        }
        setTimeout(() => {
            getICPBalance();
        }, 15000);
    };

    const sendICP = async (amount, to) => {
        console.clear();
        if(amount > 0){
            let _to, _accID, _isPrincipal;
            let _amount = amount * 100000000;
            _amount = parseInt(_amount) + 10000;
            try{
                _to = Principal.fromText(to);
                _isPrincipal = true;
            } catch(err){
                console.log("Not a principal");
            }
            if(_isPrincipal === true){
                _accID = fromHexString(getAccountId(_to, null));
                try{
                    let _sent = await canister.sendICP(_amount, _accID);
                    if(_sent[0] === true){
                        openSuccessPanel();
                    }
                } catch(err){
                    console.log("ERROR WHILE SENDING ICP", err);
                    alert("ERROR WHILE SENDING ICP, PLEASE CHECK THE ADDRESS AND AMOUNT AND TRY AGAIN");
                }
            } else {
                _to = to;
            }
            _accID = fromHexString(to);
            try{
                let _sent = await canister.sendICP(_amount, _accID);
                if(_sent[0] === true){
                    openSuccessPanel();
                }
            } catch(err){
                console.log("ERROR WHILE SENDING ICP", err);
                alert("ERROR WHILE SENDING ICP, PLEASE CHECK THE ADDRESS AND AMOUNT AND TRY AGAIN");
            }
        } else {
            console.log("INVALID AMOUNT");
            alert("INVALID AMOUNT");
        }
    }

    const getICPFromAccount = async () => {
        let _icp = await canister.getBalanceFromAccount(fromHexString("acedcf79daec4cb86dd7b44c53dd5111a81a006d26a63b8dd5e822b6fd711ad5"));
        setBalance(parseInt(_icp.e8s) / 100000000);
        setTimeout(() => {
            //getICPFromAccount();
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

        unityContext.on("SetAvatarURL", (_url) => {
            console.log("SetAvatarURL", _url);
            saveUserImage(_url);
        });

        const saveUserImage = async (img) => {
            //let img = "https://cdn3.iconfinder.com/data/icons/delivery-and-logistics/24/logistics-25-512.png";
            let _uImg;
            if(img !== undefined && img !== null && img !== ""){
                _uImg = await canister.setImageToUser(img, { "url": null });
                await setImageToUser(img);
            }
            console.log("_uImg", _uImg);
            unityContext.send("Canvas","OnAvatarReady", "");
        };

    ///////// SEARCH GROUPS /////////
        unityContext.on("SearchGroup", (name) => {
            isUserInGroup(name);
        });

        const isUserInGroup = async (name) => {
            let _isUserInGroup = await searchGroup(name);
            unityContext.send("CanvasSearchGroup", "GetGroups", JSON.stringify(_isUserInGroup));
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
        let _requested = await requestJoinGroup(groupID);
        if(_requested[0] === true){
            openSuccessPanel();
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

    /// PANELS
    unityContext.on("CurrentSection", (id) => {
        setCurrentSection(id);
    });

    /// For User Panel Info
    unityContext.on("CallToUser", (userRequestedID) => {
        getUserDataFromID(userRequestedID);
    });

    /// User's activity
    unityContext.on("ChangeStatus", (_data) => {
        logUserActivity(_data);
    });

    /// Search Users
    unityContext.on("SearchUser", (wordToSearch) => {
        searchUsers(wordToSearch);
    });

    unityContext.on("LogoutFromProfile", () => {
        localStorage.removeItem("ichub");
        window.location.reload();
    });

    unityContext.on("SetAvatarToGroup", () => {
        console.log("OPEN SetAvatarToGroup");
        setImageLoadingSection("SetAvatarToGroup");
        openUploadImageProfile();
    });

    /// Tokens
    unityContext.on("SendCrypto", (json) => {
        console.log("DATA NFT SEND", json);
        let _data = JSON.parse(json);
        if(_data.isToken === false){
            /// NFT
            transferNft(_data.idToken, _data.web3Adress);
        } else {
            if(_data.isToken === true){
                /// TOKEN
                if(_data.idToken === "ICP" || _data.idToken === 1 || _data.idToken === "1"){
                    sendICP(_data.quantityToken, _data.web3Adress);
                } else {
                    alert("Token not supported yet");
                }
            } else {
                /// ERROR
            }
        }
        /*
            {"idToken":"f7wxw-aakor-uwiaa-aaaaa-deahc-qaqca-aaerv-q","quantityToken":"","web3Adress":"","isToken":false}
        */
    })


    //// Pk#1234 (Plug)  4fec8917ffd42657c22e82a59eb9ae9f48b8503125811059fc5bffd4c72c6d1f
    //// Pk#4321 (Stoic) fbaab62eb1b779036e885fa186b1abcba2e63571cd50de5ebdf209c79cd0113f

    const readFile = async (files) => {
        let file = files[0];
        window.removeEventListener('focus', handleFocusBack);
        if(file.size > chunkSize){
            alert("File too big. Max size is 2 MB");
            return false;
        }
        switch(imageLoadingSection){
            case "SetAvatarImage":
                unityContext.send("Canvas", "OnAvatarUploadLoading", "");
                break;
            case "SetAvatarImageFromProfile": case "SetAvatarToGroup":
                unityContext.send("CanvasPlayerProfile", "OnAvatarUploadLoading", "");
                break;
        }
        let _u = await canisterImages.saveImage([...new Uint8Array(await file.arrayBuffer())], file.type);
        let urlImage = "https://" + canisterImagesId + ".raw.ic0.app/img=" + _u[1];

        console.log("Image", urlImage);
        switch(imageLoadingSection){
            case null:
                break;
            case "logo":
                unityContext.send("AppManagement_Section", "GetImageLogo", urlImage);
                break;
            case "banner":
                unityContext.send("AppManagement_Section", "GetImageBanner", urlImage);
                break;
            case "imageNews":
                unityContext.send("AppManagement_Section", "GetImageNews", urlImage);
                break;
            case "SetAvatarImage":
                let _uImg = await canister.setImageToUser(urlImage, { "url": null });
                await setImageToUser(urlImage);
                unityContext.send("Canvas", "OnAvatarUploadReady", urlImage);
                break;
            case "SetAvatarToGroup":
                unityContext.send("CanvasPlayerProfile", "OnAvatarUploadReady", urlImage);
                break;
            case "SetAvatarImageFromProfile":
                let _newI = await setImageToUser(urlImage);
                if(_newI === true){
                    openSuccessPanel();
                    setUserdataHub();
                    getUserDataFromID(userPrincipal.toString());
                }
                break;
        }
        setImageLoadingSection(null);
    };

    unityContext.on("SetAvatarImageFromProfile", () => {
        setImageLoadingSection("SetAvatarImageFromProfile");
        openUploadImageProfile();
    });

    unityContext.on("SetAvatarImage", () => {
        setImageLoadingSection("SetAvatarImage");
        openUploadImageProfile();
    });

    const openUploadImageProfile = () => {
        var event = new MouseEvent('click', {
            'view': window, 
            'bubbles': true, 
            'cancelable': false
        });
        var node = document.getElementById('new-file');
        node.dispatchEvent(event);
    };

    unityContext.on("SendDataApp", (json) => {
        saveDataApp(JSON.parse(json));
    });

    unityContext.on("SendDataNews", (json) => {
        saveNews(JSON.parse(json));
    });

    /// IMAGES
    unityContext.on("SetImage", (_option) => {
        setImageLoadingSection(_option);
        openUploadImageProfile();
    });


    /// REPORTS
    unityContext.on("SendReport", (json) => {
        addReport(JSON.parse(json));
    });

    /// Input callback
    const addCallback = () => {
        window.addEventListener('focus', handleFocusBack);
    }

    const handleFocusBack = () => {
        console.log("CLOSE POPUP");
        window.removeEventListener('focus', handleFocusBack);
    }

    return(
        <>
            {
            isLoaded !== true ?
                <div className='loading-anim-div'>
                    <Lottie animationData={loadingAnim} loop={true} className='loading-anim' />
                </div>
                :
                <>
                </>
            }
            <Unity
                unityContext = { unityContext }
                style = {{
                    height: "95vh",
                    width: "100vw",
                }} 
            />
            <br />
            <label>{/*balance*/}</label>
            <br />
            <div className='hide'>
                <input onClick={() => { addCallback(); }} type="file" id="new-file" accept="image/*" onChange={(e)=>{ readFile(e.target.files); }} />
            </div>
            {/*<div>
                <button onClick={() => { addNFTCollection("EXT", "ce2k4-aiaaa-aaaam-qa4ka-cai", "PAW Collection", "https://entrepot.app/marketplace/paw-collection"); }}>ADD PAW COLLECTION COLLECTION</button>
            </div>*/}
            {/*<div><button onClick={() => { getTokens() }}>GET TOKENS</button></div>
            <div>{nftList}</div>*/}
        </>
    );
};
