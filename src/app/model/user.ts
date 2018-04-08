export class User {
    userId: string;
    personId: string;
    userName: string;
    nickName: string;
    email: string;
    mobile: string;
    avatar: string;
    anonymous: boolean;
    constructor(userId: string, personId: string, userName: string, nickName: string, email: string,
         avatar: string, mobile: string, anonymous = true) {
        this.userId = userId;
        this.personId = personId;
        this.userName = userName;
        this.email = email;
        this.nickName = nickName;
        this.avatar = avatar;
        this.mobile = mobile;
        this.anonymous = anonymous;
    }
}
