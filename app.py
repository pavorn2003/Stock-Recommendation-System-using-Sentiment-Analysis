from flask import Flask, jsonify, request, render_template
from flask_cors import CORS

from utils import *
app = Flask(__name__)
CORS(app)

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

@app.route('/submit-data',methods=['POST'])
def submit_data():
    data = request.get_json()
    features = {
        'avg_volume': [float(data['avg_volume'])],
        'volatility': [float(data['volatility'])],
        'pc_change': [float(data['pc_change'])],
        'trend_consistency': [float(data['trend_consistency'])],
        'avg_close': [float(data['avg_price'])],
        'avg_open': [float(data['avg_price'])],
        'avg_high': [float(data['avg_price'])],
        'avg_low': [float(data['avg_price'])],
        'momentum': [float(data['price_momentum'])]
    }
    sectors = [
        "Basic Materials",
        "Consumer Discretionary",
        "Consumer Staples",
        "Energy",
        "Finance",
        "Healthcare",
        "Industrials",
        "Real Estate",
        "Technology",
        "Telecommunications",
        "Utilities"
    ]

    chosen_sectors = [sector for sector in sectors if data[sector]==1]
    user_vectors_df = pd.DataFrame(features)
    sim_result = calculate_similarities(user_vectors_df)
    filtered_result = filter_stocks_by_sector(sim_result,chosen_sectors).reset_index()
    n_results = get_N_stocks(filtered_result,int(data['numberOfRecommendations'])).reset_index()
    grouped_stocks = group_stocks_by_sector(n_results['stock'].to_list())
    print("stocks: ",grouped_stocks)
    performance = calculate_stock_performance(stock=grouped_stocks,holding_period=int(data['selectedTimePeriod']))
    print(performance)

    return jsonify({"status": "success", "stock": grouped_stocks, "performance": performance}) #"preds": preds})


if __name__ == '__main__':
    app.run(debug=True)
