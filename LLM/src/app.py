import llama_cpp
from flask import Flask, request, session
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY')

models = {
    "llama2": "./models/llama2.gguf",
    "mistral": "./models/minstral.gguf"
}

model_cache = {}


def get_model(model_name):
    if model_name not in model_cache:
        model_cache[model_name] = llama_cpp.Llama(model_path=models[model_name], n_ctx=2048, n_threads=12)
    return model_cache[model_name]


@app.route('/select_model', methods=['POST'])
def select_model():
    model_name = request.json.get('model')
    if model_name not in models:
        return {"error": "Invalid model selection"}, 400
    session['model_name'] = model_name
    session['context'] = []
    return {"message": f"Model {model_name} selected"}


@app.route('/query', methods=['POST'])
def query():
    # if 'model_name' not in session:
    #     return {"error": "No model selected"}, 400

    query_text = request.json.get('query')
    current_context = request.json.get('context')
    model_name = request.json.get('model')
    if not query_text:
        return {"error": "No query provided"}, 400

    if not model_name:
        return {"error": "No model provided"}, 400
    # model_name = session['model_name']
    model = get_model(model_name)

    # context = session.get('context', [])
    prompt = f"{current_context} {query_text}"
    # context.append(query_text)
    # prompt = " ".join(context)

    print("this the prompt-> ", prompt)

    response = model(prompt, max_tokens=50)

    # context.append(response['choices'][0]['text'])
    # session['context'] = context

    return {"response": response}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5555, debug=True)
