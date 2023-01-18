import React, { useEffect, useState, useContext } from 'react';
import Unity, { UnityContext } from "react-unity-webgl";
import { loginII, handleAuthenticated, loginStoic, loginPlug, loginInfinityWallet, setCanisterData } from './functions/login';
import { idlFactory as backendIDL } from '../../declarations/ICHUB_backend';
import { fromHexString, toHexString } from "./functions/account";
import { AppContext } from './context';
import { ChatAppContext } from './chatSDK/chatAppContext';
import { Usergeek } from "usergeek-ic-js";

/// Add Unity build files to the project
const unityContext = new UnityContext({
    codeUrl:      "ICHUB/Build/ICHUB.wasm",
    dataUrl:      "ICHUB/Build/ICHUB.data",
    frameworkUrl: "ICHUB/Build/ICHUB.framework.js",
    loaderUrl:    "ICHUB/Build/ICHUB.loader.js",
});
const backendCanisterID = "oqnbw-faaaa-aaaag-abcvq-cai";

/// For the moment this data is added manually until all the core structure is better planned and then coded into backend
const manual_projects = JSON.stringify({ "data": [
    {
        "id": 0,
        "name": "Cosmicrafts",
        "appCategoryIndex": 0,
        "logo": "https://gateway.pinata.cloud/ipfs/QmZaynBFKAg5LVULZh2pwCrh4XyGKph7fX1diVx9xzNG7W",
        "banner": "https://gateway.pinata.cloud/ipfs/QmfPFc4MJt8iKoeuRdJYFZPoQMkmYVhHNzcJb1bYeT3bjA",
        "patchNotes": "https://h5aet-waaaa-aaaab-qaamq-cai.raw.ic0.app/post/7221320/cosmicrafts-v060-is-live",
        "dscvrPortal": "https://h5aet-waaaa-aaaab-qaamq-cai.raw.ic0.app/u/Cosmicrafts",
        "marketPlaces": "https://entrepot.app/marketplace/cosmicrafts",
        "blockchain": "Internet Computer",
        "distrikt": "https://distrikt.app/u/Cosmicrafts",
        "openChat": "https://oc.app/#/l3gqx-hiaaa-aaaaf-aadxa-cai",
        "catalyze": "https://aqs24-xaaaa-aaaal-qbbea-cai.ic0.app/groups/105",
        "twitter" :"https://twitter.com/cosmicrafts",
        "nftCollections": "",
        "newVersion": "",
        "currentVersion": "0.6.0",
        "launchLink": "https://beta.cosmicrafts.com/",
        "listNews": [{
            "imageNews": "https://gateway.pinata.cloud/ipfs/QmdCQXEXkwi7qyo9GrTiKR8gdTzdNx36KNTa2e23Nv7XtP",
            "title": "Beta 0.6.0 is Live!",
            "content": "Play against WeBes on the Interplanetary Defense System, try the new Horizontal mode, farm some $CXP and #GetOnTheShip!",
            "linkButton": "https://beta.cosmicrafts.com/",
            "textButton": "Read More"
        }]
    },{
        "id": 1,
        "name": "DSCVR",
        "appCategoryIndex": 3,
        "logo": "https://gateway.pinata.cloud/ipfs/QmaiCADwrUBsCu56NrvoAf7kTa9Fi9K7LHTiHV3NrF4g2Q",
        "banner": "https://gateway.pinata.cloud/ipfs/Qmf4hY19kUZupgizTWJ4qfMg29rTozrE4vvutMEXLWEukg",
        "patchNotes": "",
        "dscvrPortal": "https://dscvr.one/p/dscvr",
        "marketPlaces": "https://entrepot.app/marketplace/portal-hunt",
        "blockchain": "Internet Computer",
        "distrikt": "https://distrikt.app/u/dscvr",
        "openChat": "https://oc.app/#/l3gqx-hiaaa-aaaaf-aadxa-cai",
        "catalyze": "https://aqs24-xaaaa-aaaal-qbbea-cai.ic0.app/groups/40",
        "twitter" :"https://twitter.com/DSCVR1",
        "nftCollections": "",
        "newVersion": "",
        "currentVersion": "Public",
        "launchLink": "https://dscvr.one/",
        "listNews": [{
        "imageNews": "https://gateway.pinata.cloud/ipfs/Qmf4hY19kUZupgizTWJ4qfMg29rTozrE4vvutMEXLWEukg",
        "title": "New NFT API released!",
        "content": "Enabling your NFTs on DSCVR just got way easier! We're thrilled to announce the rollout of our new API that not only supports over 500 NFTs.",
        "linkButton": "https://dscvr.one/post/8626962/new-nft-api-released",
        "textButton": "Read More!"
        }]
    },{
        "id": 2,
        "name": "Distrikt",
        "appCategoryIndex": 3,
        "logo": "https://gateway.pinata.cloud/ipfs/QmRUJMbrQnw64rHE1Y4FU9W9CaRbspCDyjVGvxAJHLXGf7",
        "banner": "https://gateway.pinata.cloud/ipfs/QmVpXDfmRGx62Siz8Fw86mksKEp8Jqb3kzH9D4M7phE62v",
        "patchNotes": "https://medium.com/distrikt/distrikt-product-release-v-1-2-8eb6af30dcd9",
        "dscvrPortal": "https://dscvr.one/p/distrikt",
        "marketPlaces": "https://tppkg-ziaaa-aaaal-qatrq-cai.raw.ic0.app/market/collection-nft-list?id=ah2fs-fqaaa-aaaak-aalya-cai",
        "blockchain": "Internet Computer",
        "distrikt": "https://distrikt.app/u/distrikt",
        "openChat": "https://oc.app/#/x4lyc-7qaaa-aaaaf-aagka-cai",
        "catalyze": "https://aqs24-xaaaa-aaaal-qbbea-cai.ic0.app/groups/90",
        "twitter" :"https://twitter.com/DistriktApp",
        "nftCollections": "",
        "newVersion": "",
        "currentVersion": "v1.2",
        "launchLink": "https://distrikt.app/",
        "listNews": [{
            "imageNews": "https://gateway.pinata.cloud/ipfs/QmRQ3XujNyvZTxviqxbciC7S44xmg8iV5X1r9JxwFzDNse",
            "title": "Distrikt Product Release v 1.2",
            "content": "We are back with another product release right in time for the New Year. This update includes a range of new features that were heavily requested by our community and we’re excited to see them live and kicking!",
            "linkButton": "https://medium.com/distrikt/distrikt-product-release-v-1-2-8eb6af30dcd9",
            "textButton": "Read More!"
        }]
    },{
        "id": 3,
        "name": "Infinity Swap",
        "appCategoryIndex": 2,
        "logo": "https://gateway.pinata.cloud/ipfs/QmNqeMyXDXZ6JAGPYTNb99rtD3gUPpGZbHUXqj5NbudTpN",
        "banner": "https://gateway.pinata.cloud/ipfs/QmWRGFdCmGp5LhPkRHUUjEE87a9Ckkz2YuBBQb8e9woRkG",
        "patchNotes": "",
        "dscvrPortal": "https://dscvr.one/p/infinity-swap",
        "marketPlaces": "https://tppkg-ziaaa-aaaal-qatrq-cai.raw.ic0.app/market/collection-nft-list?id=n5yqx-uqaaa-aaaap-aatja-cai",
        "blockchain": "Internet Computer",
        "distrikt": "https://distrikt.app/u/InfinitySwap.icp",
        "openChat": "",
        "catalyze": "https://aqs24-xaaaa-aaaal-qbbea-cai.ic0.app/groups/181",
        "twitter" :"https://twitter.com/infinity_swap",
        "nftCollections": "",
        "newVersion": "",
        "currentVersion": "v1.7.4",
        "launchLink": "https://app.infinityswap.one/",
        "listNews": [{
            "imageNews": "https://www.blog.infinityswap.one/content/images/size/w2000/2023/01/JAN-8-LETTER.jpg",
            "title": "Infinity Weekly: New Year, New Beginnings",
            "content": "Issue 36 of our ever popular Newsletter. Tell your friends to sign up for the latest updates in the world of DeFi and Crypto",
            "linkButton": "https://www.blog.infinityswap.one/infinity-weekly-issue-36/",
            "textButton": "Read More!"
        }]
    },{
        "id": 4,
        "name": "ICP Swap",
        "appCategoryIndex": 2,
        "logo": "https://gateway.pinata.cloud/ipfs/QmaSzAUv6mMsBGccjujzYwxLNRbymm9wQyS3ZumDxCWCBb",
        "banner": "https://gateway.pinata.cloud/ipfs/Qmayu3ygEfRtfXjEeP8fpCmra247QuZzAZwehMid9eSW5g",
        "patchNotes": "",
        "dscvrPortal": "https://dscvr.one/p/icpswap",
        "marketPlaces": "",
        "blockchain": "Internet Computer",
        "distrikt": "https://distrikt.app/u/ICPSWAP",
        "openChat": "",
        "catalyze": "https://aqs24-xaaaa-aaaal-qbbea-cai.ic0.app/groups/160",
        "twitter" :"https://twitter.com/ICPSwap",
        "nftCollections": "",
        "newVersion": "",
        "currentVersion": "Swap v3",
        "launchLink": "https://app.icpswap.com/",
        "listNews": [{
            "imageNews": "https://gateway.pinata.cloud/ipfs/QmeniscSNpmPjG9smhRbyckSACMpBQuuc7pT82aV3G3H6t",
            "title": "Swap V3 official version is now available",
            "content": "1/ Support DIP20, EXT, and ICRC-1, ICRC-2 standards launched by the DFINITY Foundation, such as SNS1 tokens, icBTC, etc., and ICS",
            "linkButton": "https://app.icpswap.com/swap",
            "textButton": "Read Thread!"
        }]
    },{
        "id": 5,
        "name": "Yumi",
        "appCategoryIndex": 1,
        "logo": "https://gateway.pinata.cloud/ipfs/QmPA7mSJSFLWZvHtuwy57DKL5TG8wto9i8FiNpkexVDY2d",
        "banner": "https://gateway.pinata.cloud/ipfs/Qmf78aP7S2aseaqM55AcvQa5V5tFY5bSdMN2FPFbY3aaK2",
        "patchNotes": "",
        "dscvrPortal": "https://h5aet-waaaa-aaaab-qaamq-cai.raw.ic0.app/u/yumi_marketplace",
        "marketPlaces": "",
        "blockchain": "Internet Computer",
        "distrikt": "https://distrikt.app/u/yumi",
        "openChat": "https://oc.app/#/jxqvc-rqaaa-aaaaf-avyiq-cai",
        "catalyze": "https://aqs24-xaaaa-aaaal-qbbea-cai.ic0.app/groups/153",
        "twitter" :"https://twitter.com/YumiMarketplace",
        "nftCollections": "",
        "newVersion": "",
        "currentVersion": "Public",
        "launchLink": "https://tppkg-ziaaa-aaaal-qatrq-cai.raw.ic0.app/",
        "listNews": [{
            "imageNews": "https://gateway.pinata.cloud/ipfs/QmWWw2vGFq9T99aXfkWeHnfRTFYJV94rqkKBoeBywTGDCj",
            "title": "Newest Development to Yumi NFT Marketplace–Rarity Calculations",
            "content": "If you’re looking to make a smart pick for your next NFT investment, one important factor to consider is rarity. Rarity can help you determine the value of an NFT and make it easier to decide which one to invest in.",
            "linkButton": "https://yumimarketplace.medium.com/newest-development-to-yumi-nft-marketplace-rarity-calculations-7ec4ae56c7c1",
            "textButton": "Make a smart pick!"
        }]
    },{
        "id": 6,
        "name": "Itoka",
        "appCategoryIndex": 3,
        "logo": "https://gateway.pinata.cloud/ipfs/QmcFYnGEA4o4NLCUen5z1djNSwwFixmZHBuF4BfVTR7vUt",
        "banner": "https://gateway.pinata.cloud/ipfs/QmSJQLAvrdRsV6NRaifNFriPqj9fp1BaPACX7e7F3SsAJy",
        "patchNotes": "",
        "dscvrPortal": "https://dscvr.one/p/itoka",
        "marketPlaces": "https://tppkg-ziaaa-aaaal-qatrq-cai.raw.ic0.app/market/collection-nft-list?id=n46fk-6qaaa-aaaai-ackxa-cai",
        "blockchain": "Internet Computer",
        "distrikt": "",
        "openChat": "https://oc.app/#/zua4b-4yaaa-aaaaf-aidrq-cai",
        "catalyze": "https://aqs24-xaaaa-aaaal-qbbea-cai.ic0.app/groups/107",
        "twitter" :"https://twitter.com/ItokaMusic",
        "nftCollections": "",
        "newVersion": "",
        "currentVersion": "Public",
        "launchLink": "https://ku323-qyaaa-aaaai-ackgq-cai.ic0.app",
        "listNews": [{
            "imageNews": "https://gateway.pinata.cloud/ipfs/Qmb9FbLexfAXF2hEwT39uDnifbzKshSE9ZetQBrdZQNyLM",
            "title": "Music. Yours. Now.",
            "content": "Becoming a musician has never been this smooth and simple with our cutting-edge AI and Web3 technology. ",
            "linkButton": "https://www.itoka.xyz/",
            "textButton": "Visit Website"
        }]
    },{
        "id": 7,
        "name": "Babbel",
        "appCategoryIndex": 3,
        "logo": "https://gateway.pinata.cloud/ipfs/QmaF6g2TRB2sZTTZ9K7F6JCp3G9Bgx53VjxzjxYf8sMDfD",
        "banner": "https://gateway.pinata.cloud/ipfs/QmdokUbzWM8Y54cSDo8uHqCLQBoG9mQHPZ4XgraHq8kpmS",
        "patchNotes": "",
        "dscvrPortal": "https://dscvr.one/p/babble",
        "marketPlaces": "https://entrepot.app/sale/babble-core-cards",
        "blockchain": "Internet Computer",
        "distrikt": "",
        "openChat": "",
        "catalyze": "",
        "twitter" :"https://twitter.com/babbleio",
        "nftCollections": "",
        "newVersion": "",
        "currentVersion": "Public",
        "launchLink": "https://coynw-4qaaa-aaaal-qbgwq-cai.ic0.app/",
        "listNews": [{
            "imageNews": "https://gateway.pinata.cloud/ipfs/QmbS7Jt1Zd7tYwdeNJvvnsHjEAx7mJGZcc7RZcXmU83rV8",
            "title": "The casual and collaborative video chat",
            "content": "Babble is a fun and intuitive open community video chat all hosted on the Internet Computer.",
            "linkButton": "https://coynw-4qaaa-aaaal-qbgwq-cai.ic0.app/",
            "textButton": "Create / Join a Space"
        }]
    },{
        "id": 8,
        "name": "Entrepot",
        "appCategoryIndex": 1,
        "logo": "https://gateway.pinata.cloud/ipfs/QmXrychdvktuZbZi4U4189b6CRBDWxWpBCUuxedDLKsvaa",
        "banner": "https://gateway.pinata.cloud/ipfs/QmWrWLR1pHB5inr4oC7myshFRtGBfSr4xGamVbUKvSLuzn",
        "patchNotes": "",
        "dscvrPortal": "https://dscvr.one/p/entrepot",
        "marketPlaces": "",
        "blockchain": "Internet Computer",
        "distrikt": "",
        "openChat": "https://oc.app/#/bvzkk-xiaaa-aaaaf-begvq-cai",
        "catalyze": "",
        "twitter" :"https://twitter.com/EntrepotApp",
        "nftCollections": "",
        "newVersion": "",
        "currentVersion": "Public",
        "launchLink": "https://entrepot.app/",
        "listNews": [{
            "imageNews": "https://gateway.pinata.cloud/ipfs/QmfGpZYHf13jTWDbzif6P7ig9MD2xgSyBGdUPtFtjcK8Dv",
            "title": "Supercharging the Entrepot Marketplace Experience",
            "content": "We’ve been working hard to bring new features to Entrepot, and we’re excited to announce four major releases",
            "linkButton": "https://toniqlabs.medium.com/supercharging-the-entrepot-marketplace-experience-12f1ee99e09f",
            "textButton": "Read More!"
        }]
    },{
        "id": 9,
        "name": "Eimolad",
        "appCategoryIndex": 0,
        "logo": "https://gateway.pinata.cloud/ipfs/QmZ6cpQWi4anb1HjHykEdEn8xbzwRtSFLnC7trNoT8N3oJ",
        "banner": "https://gateway.pinata.cloud/ipfs/Qma5ttwTkqLNpn4HCbfcmgGPEncJ9s9rLyMynnQMP78EpH",
        "patchNotes": "",
        "dscvrPortal": "https://dscvr.one/p/eimolad",
        "marketPlaces": "",
        "blockchain": "Internet Computer",
        "distrikt": "",
        "openChat": "",
        "catalyze": "",
        "twitter" :"",
        "nftCollections": "",
        "newVersion": "",
        "currentVersion": "Demo",
        "launchLink": "https://5qmpu-tyaaa-aaaan-qad4q-cai.raw.ic0.app/demo",
        "listNews": [{
            "imageNews": "https://gateway.pinata.cloud/ipfs/QmdFBkjhkRZ2RrpxFh4T3qTLrHZEafZ2BEWyMu2v6rR4MA",
            "title": "NEW TOKENS FEATURE.",
            "content": "The internal game Market allows you to trade these tokens using the main currency eGold. Therefore, it is enough to have an exchange (CEX or DEX) eGold/ICP pair to easily monetize any in-game asset.",
            "linkButton": "https://medium.com/@eimolad3d/new-tokens-feature-1ae3bd7dd3f5",
            "textButton": "Read More!"
        }]
    }
 ]});

export default function App(props){

    /// Functions from the App context
    let { identity, setIdentity, canister, setCanister, walletPopup, setWalletPopup, walletService, setWalletService } = useContext(AppContext);
    /// Functions from the Chat context
    let { setUnityApp, setWalletSelected, setCoreCanisterExternal, setUserPrincipal, setIdentityChat, setUsername } = useContext(ChatAppContext);
    /// Local variables
    const [usergeekInitialized, setUsergeekInitialized] = useState(false);

    ///////// INITIALIZE /////////
    useEffect(() => {
        setUnityApp(unityContext);
        initializeUsergeek();
    }, []);

    ///////// USERGEEK /////////
    const initializeUsergeek = () => {
        try{
            Usergeek.init({
                apiKey: "010D020172DE465FEF2BCEB11CAFCDE4",
                host: "https://fbbjb-oyaaa-aaaah-qaojq-cai.raw.ic0.app/"
            })
            console.log("Usergeek initialized", Usergeek);
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

    ///////// LOGIN PROCESS /////////
        /// Login with selected wallet
        unityContext.on("WalletsLogin", (walletSelectedByUser) => {
            loginWallet(walletSelectedByUser);
        });

        const loginWallet = async (_wallet) => {
            setWalletService(_wallet);
            setWalletSelected(_wallet);
            switch(_wallet){
                case "PlugWallet":
                    setWalletPopup(true);
                    let _Plug = await loginPlug();
                    setIdentityChat(_Plug);
                    setIdentity(_Plug);
                    console.log("PLUG PRINCIPAL", _Plug);
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
                getICPBalance();
                setTimeout(() => {
                    sendProjectsManual();
                }, 5000);
            } else {
                unityContext.send("Canvas", "OnReceiveLoginData", "");
            }
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
                console.log("CANISTER SET FOR IW", _can);
            })()
            } catch(e){
                console.log("IW E", e);
                alert("Your Wallet session has expired. Please login again in their app and then reload this page");
            }
        };

        useEffect(() => {
            if(identity !== null && walletPopup !== null && walletService !== null){
                setAllCanisters();
                setCoreCanisterExternal(identity);
            }
            if(walletService !== null && usergeekInitialized !== false){
                Usergeek.trackEvent(walletService);
                console.log("Usergeek tracked", Usergeek);
            }
        }, [identity, walletPopup, walletService, usergeekInitialized]);

        useEffect(() => {
            if(canister !== null){
                getUserData();
            }
        }, [canister]);

    ///////// ICP //////////
    const getICPBalance = async () => {
        let _icp = await canister.getICPBalance();
        console.log("ICP BALANCE", _icp);
    };

    ///////// NEW USER PROCESS /////////
        unityContext.on("SetNameLogin", (usernamePlusHash) => {
            if(usernamePlusHash !== undefined){
                let _u = usernamePlusHash.split("#");
                if(_u.length !== 2){
                    console.log(_u.length);
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
            let _uImg = await canister.setImageToUser("https://images.unsplash.com/photo-1655993810480-c15dccf9b3a0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1180&q=80", { "url": null });
            console.log("?Image added", _uImg);
            unityContext.send("Canvas","OnAvatarReady", "");
            getICPBalance();
            setTimeout(() => {
                sendProjectsManual();
            }, 3000);
        };

        const sendProjectsManual = () => {
            unityContext.send("Hub_Panel","GetAppsInfo", manual_projects);
            console.log("Projects Sent");
        };



    return(
        <>
            <Unity
                unityContext = { unityContext }
                style = {{
                    height: "auto",
                    width: "100%",
                }} 
            />
        </>
    );
};