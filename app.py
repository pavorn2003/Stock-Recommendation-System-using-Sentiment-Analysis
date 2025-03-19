from flask import Flask, jsonify, request, render_template
from flask_cors import CORS

from utils import *
app = Flask(__name__)
CORS(app)


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
    filtered_result = filter_stocks_by_sector(sim_result,chosen_sectors,int(data['selectedTimePeriod'])).reset_index()
    n_results = get_N_stocks(filtered_result,int(data['numberOfRecommendations']))
    grouped_stocks = group_stocks_by_sector(n_results['stock'].to_list())
    print("stocks: ",n_results['stock'])
    performance = calculate_stock_performance(stock=grouped_stocks,holding_period=int(data['selectedTimePeriod']))
    articles = get_articles(grouped_stocks)
    # print(performance)

    return jsonify({"status": "success", "stock": grouped_stocks,"articles": articles, "performance": performance}) #"preds": preds})


if __name__ == '__main__':
    app.run(debug=True)
