from flask import Flask, request, session
from transformers import AutoModelForCausalLM, AutoTokenizer
from flask_session import Session

app = Flask(__name__)
app.secret_key = 'supersecretkey'

models = {
    "llama2": "TinyPixel/Llama-2-7B-bf16-sharded",
    "mistral": "mistralai/Mistral-7B-v0.1"
}

model_cache = {}


def get_model(model_name):
    if model_name not in model_cache:
        model_cache[model_name] = {
            "tokenizer": AutoTokenizer.from_pretrained(models[model_name],
                                                       device_map="auto",
                                                       cache_dir="/",
                                                       token="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"),
            "model": AutoModelForCausalLM.from_pretrained(models[model_name], cache_dir="/")
        }
    return model_cache[model_name]


@app.route('/select_model', methods=['POST'])
def select_model():
    print(request)
    model_name = request.json.get('model')
    if model_name not in models:
        return {"error": "Invalid model selection"}, 400
    session['model_name'] = model_name
    session['context'] = []
    return {"message": f"Model {model_name} selected"}


@app.route('/query', methods=['POST'])
def query():
    if 'model_name' not in session:
        return {"error": "No model selected"}, 400
    query_text = request.json.get("query")

    if not query_text:
        return {"error": "No query provided"}, 400

    model_name = session['model_name']
    print(model_name)
    model_data = get_model(model_name)
    context = session.get('context', [])
    context.append(query_text)
    inputs = model_data['tokenizer'](" ".join(context), return_tensors="pt")
    outputs = model_data['model'].generate(inputs['input_ids'], max_length=1000)
    print(outputs)
    response = model_data['tokenizer'].decode(outputs[0], skip_special_tokens=True)

    context.append(response)
    session['context'] = context

    return {"response": model_name}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5555, debug=True)
