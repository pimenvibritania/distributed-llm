
# Running Distributed LLM on Python and Nodejs



## Prerequisite
I am using local models for this setup. Please download the models (Llama2 & Mistral) first:

 - [LLAMA-2-7B](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q2_K.gguf)
 - [Mistral-7B](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/mistral-7b-instruct-v0.1.Q2_K.gguf)

After downloading the models, move them into the `./LLM/models` folder and rename the files to:

```
./LLM/models/llama2.gguf
./LLM/models/minstral.gguf

```

*-- Currently, I can't auto-download the models from the script due to network issues.*

Next, look at `./API/database.json`. You can update the JSON values for database migration purposes. Based on the `docker-compose.yaml` network configuration, set the host to `10.5.0.2`.


## Start Services
After completing the prerequisites, you can start the services by running:
 ```
 docker compose up -d
 ```



## API Reference
### API (NodeJS)
#### New & Continue Conversation

```http
  POST /api/conversation
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `conversationId`      | `integer` | **Optional**. Given `id` to continuing previous conversation, fill with `null` or remove to start new conversation |
| `model` | `string` | **Required**. Select your model (llama2 or mistral) |
| `query` | `string` | **Required**. You can ask anything! |



#### Get Detailed Conversation


```http
  GET /api/conversation/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `:id` | `integer` | **Required**. Conversation ID |

#### Get All Conversation

Getting historical conversation ordered by last update descending, you can filter/search the conversation based on `model` and `context`

```http
  GET /api/conversation?model=""&context=""
```

| Query String | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `model` | `string` | **Optional**. Model (llama2 or mistral) |
| `context` | `string` | **Optional**. Chat/topic want to search |





### LLM Server (Python)
#### Select Model

```http
  POST /select_model
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `model` | `string` | **Required**. Select your model (llama2 or mistral) |


#### Querying

```http
  POST /query
```

| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `model` | `string` | **Required**. Select your model (llama2 or mistral) |
| `query` | `string` | **Required**. You can ask anything! |
| `context` | `string` | **Optional**. To resuming conversation |

## Network


| Service | IP Address     | 
| :-------- | :------- | 
| `subnet` | `10.5.0.0/16` | 
| `mysql` | `10.5.0.2` | 
| `llm-server` | `10.5.0.3` | 
| `llm-api` | `10.5.0.4` | 
| `init-migration` | `10.5.0.5` | 

## Authors

- [pimenvibritania](https://www.linkedin.com/in/pimenvibritania/)