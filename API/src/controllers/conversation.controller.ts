import { Request, Response } from "express";
import Conversation from "../models/conversation.model";
import ConversationRepository from "../repositories/conversation.repository";
import axios, { AxiosResponse } from 'axios';

const LLM_HOST = process.env.LLM_HOST
const LLM_PORT =  process.env.LLM_PORT

const LLM_URI = `http://${LLM_HOST}:${LLM_PORT}`

interface ModelLLM {
  model: string;
}

interface QueryLLM {
  query: string, 
  model: string, 
  context: string
}

export default class ConversationController {
  async create(req: Request, res: Response) {
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

    const modelLLM: ModelLLM = {
      model: req.body.model
    };
    
    let cookie : any 

    try {
      const response = await axios.post(`${LLM_URI}/select_model`, modelLLM);
      cookie = response.headers['set-cookie']
    } catch (error: any) {
      res.status(400).send({
        message: "Invalid model selection",
        error: error
      });
      return;
    }

    let conversationId = req.body.conversationId
    if (conversationId) {
      const continueConversation = await ConversationRepository.retrieveById(conversationId)
      if (continueConversation) {
        req.body.context = continueConversation.context
      } else {
        conversationId = null
        req.body.conversationId = null
      }
    }

    let query = `Q: ${req.body.query}`
    const queryLLM : QueryLLM = {
      model: req.body.model,
      context: req.body.context,
      query: query
    }

    let answerLLM = ""

    try {
      const responseQuery = await axios.post(`${LLM_URI}/query`, queryLLM, {
        headers: {
          "Set-Cookie": cookie
        }
      });
      answerLLM = `A: ${responseQuery.data.response.choices[0].text}`
      console.log(answerLLM)
    } catch (error: any) {
      res.status(400).send({
        message: "Invalid query"
      });
      return;
    }

    try {
      req.body.context += query +=  answerLLM
      const conversation: Conversation = req.body
      
      let savedconversation: Conversation | number

      if (conversationId) {
        conversation.id = conversationId
        savedconversation = await ConversationRepository.update(conversation)
        res.status(201).send({
          "answer": answerLLM,
          "data": conversation
        });
      } else {
        savedconversation = await ConversationRepository.save(conversation);
        res.status(201).send({
          "answer": answerLLM,
          "data": savedconversation
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while retrieving conversation."
      });
    }
  }

  async findAll(req: Request, res: Response) {
    const context = typeof req.query.context === "string" ? req.query.context : "";
    const model = typeof req.query.model === "string" ? req.query.model : "";

    try {
      const conversation = await ConversationRepository.retrieveAll({ context: context, model: model });

      res.status(200).send(conversation);
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while retrieving conversation."
      });
    }
  }

  async findOne(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    try {
      const conversation = await ConversationRepository.retrieveById(id);

      if (conversation){
        const regex = /Q:\s*([^?]+?)\s*(?=A:|Q:|$)(?:A:\s*([^Q]+?))?(?=\s*Q:|$)/g;
        const context = conversation.context
        let matches;
        const results = [];

        if (context) {
          while ((matches = regex.exec(context)) !== null) {
            const question = matches[1].trim();
            const answer = matches[2]?.trim();
            results.push({ question, answer });
          } 
        }

        console.log(results);

        res.status(200).send(results);
      } 
      else
        res.status(404).send({
          message: `Cannot find Conversation with id=${id}.`
        });
    } catch (err) {
      res.status(500).send({
        message: `Error retrieving Conversation with id=${id}.`
      });
    }
  }

  // async update(req: Request, res: Response) {
  //   let conversation: Conversation = req.body;
  //   conversation.id = parseInt(req.params.id);

  //   try {
  //     const num = await conversationRepository.update(conversation);

  //     if (num == 1) {
  //       res.send({
  //         message: "Conversation was updated successfully."
  //       });
  //     } else {
  //       res.send({
  //         message: `Cannot update Conversation with id=${conversation.id}. Maybe Conversation was not found or req.body is empty!`
  //       });
  //     }
  //   } catch (err) {
  //     res.status(500).send({
  //       message: `Error updating Conversation with id=${conversation.id}.`
  //     });
  //   }
  // }

  // async delete(req: Request, res: Response) {
  //   const id: number = parseInt(req.params.id);

  //   try {
  //     const num = await conversationRepository.delete(id);

  //     if (num == 1) {
  //       res.send({
  //         message: "Conversation was deleted successfully!"
  //       });
  //     } else {
  //       res.send({
  //         message: `Cannot delete Conversation with id=${id}. Maybe Conversation was not found!`,
  //       });
  //     }
  //   } catch (err) {
  //     res.status(500).send({
  //       message: `Could not delete Conversation with id==${id}.`
  //     });
  //   }
  // }

  // async deleteAll(req: Request, res: Response) {
  //   try {
  //     const num = await conversationRepository.deleteAll();

  //     res.send({ message: `${num} conversations were deleted successfully!` });
  //   } catch (err) {
  //     res.status(500).send({
  //       message: "Some error occurred while removing all conversations."
  //     });
  //   }
  // }

  // async findAllPublished(req: Request, res: Response) {
  //   try {
  //     const conversations = await conversationRepository.retrieveAll({ published: true });

  //     res.status(200).send(conversations);
  //   } catch (err) {
  //     res.status(500).send({
  //       message: "Some error occurred while retrieving conversations."
  //     });
  //   }
  // }
}
