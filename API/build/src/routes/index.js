"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conversation_routes_1 = __importDefault(require("./conversation.routes"));
const home_routes_1 = __importDefault(require("./home.routes"));
class Routes {
    constructor(app) {
        app.use("/api", home_routes_1.default);
        app.use("/api/conversation", conversation_routes_1.default);
    }
}
exports.default = Routes;
