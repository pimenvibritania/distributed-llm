import { RowDataPacket } from "mysql2"

export default interface Conversation extends RowDataPacket {
  id?: number;
  context?: string;
  model?: string;
  created_at?: Date;
  updated_at?: Date;
}
