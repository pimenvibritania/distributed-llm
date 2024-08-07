import { Application } from "express";
import conversationRoutes from "./conversation.routes";
import homeRoutes from "./home.routes";

export default class Routes {
  constructor(app: Application) {
    app.use("/api", homeRoutes);
    app.use("/api/conversation", conversationRoutes);
  }
}
