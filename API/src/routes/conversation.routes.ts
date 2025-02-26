import { Router } from "express";
import ConversationController from "../controllers/conversation.controller";

class ConversationRoutes {
  router = Router();
  controller = new ConversationController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    // Create a new Tutorial
    this.router.post("/", this.controller.create);

    // Retrieve all Tutorials
    this.router.get("/", this.controller.findAll);

    // // Retrieve all published Tutorials
    // this.router.get("/published", this.controller.findAllPublished);

    // // Retrieve a single Tutorial with id
    this.router.get("/:id", this.controller.findOne);

    // // Update a Tutorial with id
    // this.router.put("/:id", this.controller.update);

    // // Delete a Tutorial with id
    // this.router.delete("/:id", this.controller.delete);

    // // Delete all Tutorials
    // this.router.delete("/", this.controller.deleteAll);
  }
}

export default new ConversationRoutes().router;
