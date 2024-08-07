"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
class ConversationRepository {
    save(conversation) {
        return new Promise((resolve, reject) => {
            db_1.default.query("INSERT INTO conversations (context, model) VALUES(?,?)", [conversation.context, conversation.model], (err, res) => {
                if (err)
                    reject(err);
                else
                    this.retrieveById(res.insertId)
                        .then((conversation) => resolve(conversation))
                        .catch(reject);
            });
        });
    }
    retrieveAll(searchParams) {
        let query = "SELECT * FROM conversations";
        let condition = "";
        if (searchParams === null || searchParams === void 0 ? void 0 : searchParams.context)
            condition += `LOWER(context) LIKE '%${searchParams.context}%'`;
        if (searchParams === null || searchParams === void 0 ? void 0 : searchParams.model)
            condition += `LOWER(model) LIKE '%${searchParams.model}%'`;
        if (condition.length)
            query += " WHERE " + condition;
        query += " ORDER BY updated_at DESC";
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
        });
    }
    retrieveById(conversationId) {
        return new Promise((resolve, reject) => {
            db_1.default.query("SELECT * FROM conversations WHERE id = ?", [conversationId], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res === null || res === void 0 ? void 0 : res[0]);
            });
        });
    }
    update(conversation) {
        return new Promise((resolve, reject) => {
            db_1.default.query("UPDATE conversations SET context = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [conversation.context, conversation.id], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res.affectedRows);
            });
        });
    }
    delete(conversationId) {
        return new Promise((resolve, reject) => {
            db_1.default.query("DELETE FROM conversations WHERE id = ?", [conversationId], (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res.affectedRows);
            });
        });
    }
    deleteAll() {
        return new Promise((resolve, reject) => {
            db_1.default.query("DELETE FROM conversations", (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res.affectedRows);
            });
        });
    }
}
exports.default = new ConversationRepository();
