"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conversation_repository_1 = __importDefault(require("../repositories/conversation.repository"));
const axios_1 = __importDefault(require("axios"));
const LLM_HOST = process.env.LLM_HOST;
const LLM_PORT = process.env.LLM_PORT;
const LLM_URI = `http://${LLM_HOST}:${LLM_PORT}`;
class ConversationController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.model) {
                res.status(400).send({
                    message: "Model can not be empty!"
                });
                return;
            }
            if (!req.body.query) {
                res.status(400).send({
                    message: "Query can not be empty!"
                });
                return;
            }
            const modelLLM = {
                model: req.body.model
            };
            let cookie;
            try {
                const response = yield axios_1.default.post(`${LLM_URI}/select_model`, modelLLM);
                cookie = response.headers['set-cookie'];
            }
            catch (error) {
                res.status(400).send({
                    message: "Invalid model selection",
                    error: error
                });
                return;
            }
            const conversationId = req.body.conversationId;
            if (conversationId) {
                const continueConversation = yield conversation_repository_1.default.retrieveById(conversationId);
                if (continueConversation) {
                    req.body.context = continueConversation.context;
                }
            }
            let query = `Q: ${req.body.query}`;
            const queryLLM = {
                model: req.body.model,
                context: req.body.context,
                query: query
            };
            let answerLLM = "";
            try {
                const responseQuery = yield axios_1.default.post(`${LLM_URI}/query`, queryLLM, {
                    headers: {
                        "Set-Cookie": cookie
                    }
                });
                answerLLM = `A: ${responseQuery.data.response.choices[0].text}`;
                console.log(answerLLM);
            }
            catch (error) {
                res.status(400).send({
                    message: "Invalid query"
                });
                return;
            }
            try {
                req.body.context += query += answerLLM;
                const conversation = req.body;
                let savedconversation;
                if (conversationId) {
                    conversation.id = conversationId;
                    savedconversation = yield conversation_repository_1.default.update(conversation);
                    res.status(201).send({
                        "answer": answerLLM,
                        "data": conversation
                    });
                }
                else {
                    savedconversation = yield conversation_repository_1.default.save(conversation);
                    res.status(201).send({
                        "answer": answerLLM,
                        "data": savedconversation
                    });
                }
            }
            catch (err) {
                res.status(500).send({
                    message: "Some error occurred while retrieving conversation."
                });
            }
        });
    }
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = typeof req.query.context === "string" ? req.query.context : "";
            const model = typeof req.query.model === "string" ? req.query.model : "";
            try {
                const conversation = yield conversation_repository_1.default.retrieveAll({ context: context, model: model });
                res.status(200).send(conversation);
            }
            catch (err) {
                res.status(500).send({
                    message: "Some error occurred while retrieving conversation."
                });
            }
        });
    }
    findOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const id = parseInt(req.params.id);
            try {
                const conversation = yield conversation_repository_1.default.retrieveById(id);
                if (conversation) {
                    const regex = /Q:\s*([^?]+?)\s*(?=A:|Q:|$)(?:A:\s*([^Q]+?))?(?=\s*Q:|$)/g;
                    const context = conversation.context;
                    let matches;
                    const results = [];
                    if (context) {
                        while ((matches = regex.exec(context)) !== null) {
                            const question = matches[1].trim();
                            const answer = (_a = matches[2]) === null || _a === void 0 ? void 0 : _a.trim();
                            results.push({ question, answer });
                        }
                    }
                    console.log(results);
                    res.status(200).send(results);
                }
                else
                    res.status(404).send({
                        message: `Cannot find Tutorial with id=${id}.`
                    });
            }
            catch (err) {
                res.status(500).send({
                    message: `Error retrieving Tutorial with id=${id}.`
                });
            }
        });
    }
}
exports.default = ConversationController;
