module {
    public type UserID   = Principal;
    public type Username = Text;
    public type AvatarType = {
        #url;
        #base64;
        #none;
    };
    public type UserStatus = {
        #active;
        #inactive;
        #incomplete;
        #banned;
    };
    public type UserData = {
        userID     : UserID;
        accountID  : Blob;
        username   : Username;
        hashtag    : Text;
        avatar     : Text;
        avatarType : AvatarType;
        status     : UserStatus;
    };
}