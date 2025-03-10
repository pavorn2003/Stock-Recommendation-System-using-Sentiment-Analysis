from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

# Sample data
data = {"message": "Hello, World!"}

@app.route('/')
def home():
    return render_template("about.html")

@app.route('/navbar-select', methods=['POST'])
def navselect():
    selected_item = request.form.get("selected_item","Unknown")
    print(selected_item)
    # return f'message: {message}', 200
    return render_template(f'{selected_item}.html')

@app.route('/get', methods=['GET'])
def get_data():
    return jsonify(data), 200

@app.route('/post', methods=['POST'])
def post_data():
    new_data = request.json
    print(new_data)
    if not new_data or "message" not in new_data:
        return jsonify({"error": "Invalid data"}), 400
    data["message"] = new_data["message"]
    return jsonify(data), 201


if __name__ == '__main__':
    app.run(debug=True)
