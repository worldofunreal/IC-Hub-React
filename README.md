# ICHUB

Welcome to ICHUB, a project where users will be able to add their own projects, publish their news, connect with your friends, chat in public and private groups and much more!

This repository contains the Frontend in React and Backend in Motoko
Both are hosted in the Internet Computer and the frontend can be found in:
[https://md7ke-jyaaa-aaaak-qbrya-cai.raw.ic0.app/](https://md7ke-jyaaa-aaaak-qbrya-cai.raw.ic0.app/)

# Code documentation

The code splits in the Core Project and the ChatSDK, each one have a Context file to use their functions and variables in any file.

The user needs to follow a flow:
- Login selecting a wallet

New user:
- Create account
- Select Username and Tag
- Pick image (in process)

Already a user:
- Get User's info from the Canisters

For both type of users:
- Send the user to the Main Panel and open the Public Chat
- User can select any of the listed projects to show their news and links
- User can send and read messages from the Chat

# Frontend
## Core project
### Project Structure

`src/context.js`
Here are defined the variables that are going to be used along the rest of the flow
```
const [aID, setAID] = useState(null);                     // User's account ID
const [identity, setIdentity] = useState(null);           // User's Identity
const [canister, setCanister] = useState(null);           // Canister instantiated
const [walletPopup, setWalletPopup] = useState(null);     // If wallet selected is type Popup or not
const [walletService, setWalletService] = useState(null); // The wallet service selected by the user
```

`src/functions/account.js`
This is a helper file containing the functions necessary to interact with the User's account in HexString and Bytes
```
export const toHexString = (byteArray) => {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

export const fromHexString = (hex) => {
    if (hex.substr(0,2) === "0x") hex = hex.substr(2);
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}
```
* IF YOU ARE USING THE ACCOUNTID THIS FUNCTIONS CAN BE REALLY HELPFUL

`src/functions/login`
In the login helper we have the functions to login with any of the 4 wallets 
```
// Internet Identity
loginII() & handleAuthenticated(authClient)

// Stoic Wallet
loginStoic()

// Plug Wallet
loginPlug()

// Bitfinity Wallet (Infinity Wallet)
loginInfinityWallet()
```

Also you can find a function to set the canister data once logged in
```
setCanisterData(idl, canisterId, identity)
```

To check the CatSDK documentation please go to the [github](https://github.com/WorldOfUnreal/chatsdk) of the project
In this project we will add the ChatSDK and import it's context in App.js

`src/App.js`
Here is imported the Unity3D build along many of the functions that have connection between Unity3D and React
This file contains the heavy logic and the functions it contains are:

From the App context
```
    let { identity, setIdentity, canister, setCanister, walletPopup, setWalletPopup, walletService, setWalletService } = useContext(AppContext);
    /// Functions from the Chat context
    let { setUnityApp, setWalletSelected, setCoreCanisterExternal, setUserPrincipal, setIdentityChat, setUsername } = useContext(ChatAppContext);
```
Local variables
```
    const [usergeekInitialized, setUsergeekInitialized] = useState(false);
```

Control functions
```
    unityContext.on("CopyToClipboard", (txt) => {
        navigator.clipboard.writeText(txt);
    });
```

Initialize functions
```
    useEffect(() => {
        setUnityApp(unityContext);
        initializeUsergeek();
    }, []);
```

Start Usergeek
```
    initializeUsergeek()
    setUsergeekPrincipal()
```

The Full login process
```
/// Login with selected wallet
unityContext.on("WalletsLogin", (walletSelectedByUser) => {
    loginWallet(walletSelectedByUser);
});

loginWallet(walletSelected) /// Switch-case with the wallet selected by the user and login according to this selection
finishIILogin()             /// Only for Internet Identity to get the Identity once logged in
generatePlugCan()           /// For Plug Wallet
generateIWCan()             /// For Infinity Wallet
```

Once the user has logged in with any of the wallets we need to set the canisters we are going to use
```
setAllCanisters() /// Also depends on the wallet selected by the user as it vary from popup wallets (Plug an InfinityWallet) to non popup wallets (Internet Identity and StoicWallet)
```

When we have the canisters set, we can get the user's info and check if the user is a new one or have already created their account
```
    ///////// USER DATA /////////
    getUserData()
```

And we have some hooks to process the data in the correct time
```
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
```

Then we can get the user's ICP Balance
```
getICPBalance()
```

If the user is a new one
```
/// The username is expected from Unity3D
unityContext.on("SetNameLogin", (usernamePlusHash) => {})

/// Then saving it to the blockchain along with account creation in the canister
saveNewUser()

/// [WIP] Save the user's image
unityContext.on("SetAvatar", () => {})
saveUserImage()
```

And for this first version we have provided the list of projects in a manual way, sending the json with the projects
```
/// This will be updated in the next milestone where all the data will be stored and sent from blockchain
sendProjectsManual()
```


# Backend
## Core project
### Project structure
`/Account.mo`
This is a module with functions and data types for interacting with the user's account
```
// 32-byte array.
public type AccountIdentifier = Blob;
// 32-byte array.
public type Subaccount = Blob;

beBytes(n: Nat32) : [Nat8]
principalToSubaccount(principal : Principal) : Blob
validateAccountIdentifier(accountIdentifier : AccountIdentifier) : Bool
getSubaccount(arr : Nat8) : Subaccount
defaultSubaccount() : Subaccount
accountIdentifier(principal: Principal, subaccount: Subaccount) : AccountIdentifier
```

`/CRC32.mo`
Module with functions and data types for interacting with the user's account
```
crc32Table : [Nat32]
seed : Nat32

ofArray(arr : [Nat8]) : Nat32
ofBlob(blob: Blob) : Nat32
```

`ledger_interface.mo`
Module wid functions and data type for interacting with the ICP Ledger
```
Interface = actor
type ICP
type Timestamp
type AccountIdentifier = Blob
type SubAccount = Blob
type BlockIndex = Nat64
type Memo = Nat64
type TransferArgs
type TransferError
type TransferResult
type AccountBalanceArgs
```

