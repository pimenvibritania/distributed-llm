from llama_cpp import Llama
LLM = Llama(model_path="../models/llama2.gguf", n_ctx=2048)

# create a text prompt
prompt = "Q: who is facebook founder? A:"

# generate a response (takes several seconds)
output = LLM(prompt, max_tokens=0)

# display the response
print("ini ->", output["choices"][0]["text"])
