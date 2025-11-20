export default class User {
    id;
    username;
    email;
    password;
    isVerified;
    createdAt;
    updatedAt;
    constructor(id, username, email, password, isVerified, createdAt, updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.isVerified = isVerified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
//# sourceMappingURL=User.js.map