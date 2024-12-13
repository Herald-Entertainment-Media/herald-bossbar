import { MODULE_ID } from "../main.js";

export class Socket {
  static __$callbacks = {};

  static USERS = {
    GMS: "gms",
    PLAYERS: "players",
    ALL: "all",
    OTHERS: "others",
    FIRSTGM: "firstGM",
    SELF: "self",
  };

  static __$reserved = [
    "__$eventName",
    "__$response",
    "__$onMessage",
    "__$parseUsers",
    "register",
    "USERS",
  ];

  static async __$onMessage(data) {
    const options = data.__$socketOptions;

    if (!options.users.includes(game.user.id)) return;
    const callback = this.__$callbacks[options.__$eventName];
    delete data.__$socketOptions;
    const result = await callback(data);

    if (options.response) {
      const responseKey = `${options.__$eventId}.${game.user.id}`;
      const response = {
        __$socketOptions: {
          __$eventName: "__$response",
          __$responseKey: responseKey,
        },
        result,
      };
      game.socket.emit(`module.${MODULE_ID}`, response);
    }
  }

  static __$parseUsers(options) {
    if (typeof options === "string") options = { users: options };
    options.users = options.users || this.USERS.ALL;

    const activeUsers = game.users.filter((user) => user.active);
    const users = options.users;

    switch (users) {
      case this.USERS.ALL:
        options.users = activeUsers.map((user) => user.id);
        break;
      case this.USERS.GMS:
        options.users = activeUsers
          .filter((user) => user.isGM)
          .map((user) => user.id);
        break;
      case this.USERS.PLAYERS:
        options.users = activeUsers
          .filter((user) => !user.isGM)
          .map((user) => user.id);
        break;
      case this.USERS.OTHERS:
        options.users = activeUsers
          .filter((user) => user.id !== game.user.id)
          .map((user) => user.id);
        break;
      case this.USERS.FIRSTGM:
        options.users = [game.users.activeGM.id];
        break;
      case this.USERS.SELF:
        options.users = [game.user.id];
        break;
      default:
        if (!Array.isArray(users)) throw new Error("Invalid users option.");
        options.users = users;
    }

    return options;
  }

  static register(eventName, callback) {
    if (!this.__$socket) {
      this.__$socket = game.socket;
      game.socket.on(`module.${MODULE_ID}`, this.__$onMessage.bind(this));
    }

    if (this.__$reserved.includes(eventName)) {
      throw new Error(`Socket event name ${eventName} is reserved.`);
    }

    this.__$callbacks[eventName] = callback;

    const wrappedCallback = async (data, options = {}) => {
      options = this.__$parseUsers(options);
      const eventId = foundry.utils.randomID();
      options.__$eventId = eventId;
      options.__$eventName = eventName;

      if (options.users.includes(game.user.id)) {
        const localCallback = async () => {
          return { user: game.user, response: await callback(data) };
        };
        await localCallback();
      }

      data.__$socketOptions = options;
      game.socket.emit(`module.${MODULE_ID}`, data);
    };

    this[eventName] = wrappedCallback.bind(this);
  }

  static async send(eventName, data, options) {
    if (!this[eventName])
      throw new Error(`Event ${eventName} is not registered.`);
    return await this[eventName](data, options);
  }
}
