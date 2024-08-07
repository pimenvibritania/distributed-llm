import { ResultSetHeader } from "mysql2";
import connection from "../db";

import Conversation from "../models/conversation.model";

interface IConversationRepository {
  save(conversation: Conversation): Promise<Conversation>;
  retrieveAll(searchParams: {context: string, model: string}): Promise<Conversation[]>;
  retrieveById(conversationId: number): Promise<Conversation | undefined>;
  update(conversation: Conversation): Promise<number>;
  delete(conversationId: number): Promise<number>;
  deleteAll(): Promise<number>;
}

class ConversationRepository implements IConversationRepository {
  save(conversation: Conversation): Promise<Conversation> {
    return new Promise((resolve, reject) => {
      connection.query<ResultSetHeader>(
        "INSERT INTO conversations (context, model) VALUES(?,?)",
        [conversation.context, conversation.model],
        (err, res) => {
          if (err) reject(err);
          else
            this.retrieveById(res.insertId)
              .then((conversation) => resolve(conversation!))
              .catch(reject);
        }
      );
    });
  }

  retrieveAll(searchParams: {context?: string, model?: string}): Promise<Conversation[]> {
    let query: string = "SELECT * FROM conversations";
    let condition: string = "";

    if (searchParams?.context)
      condition += `LOWER(context) LIKE '%${searchParams.context}%'`

    if (searchParams?.model)
      condition += `LOWER(model) LIKE '%${searchParams.model}%'`

    if (condition.length)
      query += " WHERE " + condition;

    query += " ORDER BY updated_at DESC";
    
    return new Promise((resolve, reject) => {
      connection.query<Conversation[]>(query, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  retrieveById(conversationId: number): Promise<Conversation> {
    return new Promise((resolve, reject) => {
      connection.query<Conversation[]>(
        "SELECT * FROM conversations WHERE id = ?",
        [conversationId],
        (err, res) => {
          if (err) reject(err);
          else resolve(res?.[0]);
        }
      );
    });
  }

  update(conversation: Conversation): Promise<number> {
    return new Promise((resolve, reject) => {
      connection.query<ResultSetHeader>(
        "UPDATE conversations SET context = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [conversation.context, conversation.id],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }

  delete(conversationId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      connection.query<ResultSetHeader>(
        "DELETE FROM conversations WHERE id = ?",
        [conversationId],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }

  deleteAll(): Promise<number> {
    return new Promise((resolve, reject) => {
      connection.query<ResultSetHeader>("DELETE FROM conversations", (err, res) => {
        if (err) reject(err);
        else resolve(res.affectedRows);
      });
    });
  }
}

export default new ConversationRepository();
