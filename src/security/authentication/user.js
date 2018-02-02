class User {
  constructor(id) {
    this._userId = id;
  }

  get id() {
    return this._userId;
  }

  async verifyPassphrase() {
    return false;
  }

  async verifyScopes(scopes) {
    return true;
  }

  static async getFromId(userId) {
    return new User(userId);
  }
}

export default User;