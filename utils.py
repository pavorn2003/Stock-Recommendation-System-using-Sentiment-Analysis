import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from scipy.spatial.distance import cdist
import os
import re

risk_free_rate_3m = 3/4  # Risk-free rate in percentage
risk_free_rate_6m = 3/2
risk_free_rate_12m = 3

# dates = ['03-31-2022', '06-30-2022', '09-30-2022', '12-31-2022',
#          '03-31-2023', '06-30-2023', '09-30-2023', '12-31-2023',
#          '03-31-2024', '06-30-2024']
# months_back = [3, 6, 12]

DATE_MONTH = "06-30-2024_12"
DATE = "06-30-2024"
PERIOD_MONTHS = "12"
# Sentiment files
stock_sentiment = pd.read_csv("data_storage/sentiment_scores/stock_sentiment_final.csv")
sector_sentiment = pd.read_csv("data_storage/sentiment_scores/sector_sentiment_final.csv")
no_sentiment = pd.read_csv("data_storage/sentiment_scores/no_sentiment.csv")

# User vectors
test_users = pd.DataFrame({
    'user': ['Defensive', 'Conservative', 'Balanced', 'Growth', 'Aggressive'],
    'avg_volume': [1, 0.75, 0.75, 0.5, 0.25],
    'volatility': [0, 0.25, 0.5, 1, 1],
    'pc_change': [0, 0.25, 0.5, 1, 1],
    'trend_consistency': [1, 1, 0.5, 0.25, 0],
    'avg_close': [0.75, 0.75, 0.5, 0.25, 0],
    'avg_open': [0.75, 0.75, 0.5, 0.25, 0],
    'avg_high': [0.75, 0.75, 0.5, 0.25, 0],
    'avg_low': [0.75, 0.75, 0.5, 0.25, 0],
    'momentum': [0.25, 0.5, 0.5, 1, 1]
})

#stocks and sectors
stock_sector_map = {
    "Basic_Materials" : [ "AMWD", "ATCOL", "CRML", "GSM", "IPX", "MERC", "NB", "SGML", "UFPI", "VOXR"],
    "Consumer_Discretionary" : [ "AMZN", "BKNG", "COST", "CTAS", "MAR", "MELI", "NFLX", "PDD", "SBUX", "TSLA"],
    "Consumer_Staples" : [ "CCEP", "CELH", "COKE", "KDP", "KHC", "MDLZ", "MNST", "PEP", "PPC", "WBA"],
    "Energy" : [ "APA", "CHRD", "EXE", "FANG", "PAA", "VNOM", "WWD"],
    "Finance" : [ "ABNB", "ACGL", "CME", "COIN", "CSGP", "HBANM", "NDAQ", "TROW", "TW", "WTW"],
    "Healthcare" : [ "AMGN", "AZN", "DXCM", "GILD", "IDXX", "ISRG", "MRNA", "REGN", "SNY", "VRTX"],
    "Industrials" : [ "AXON", "BKR", "CSX", "FER", "HON", "LIN", "ODFL", "ROP", "SYM", "TER"],
    "Real Estate" : [ "AGNC", "AGNCL", "AGNCM", "AGNCN", "EQIX", "GLPI", "HST", "LAMR", "REG", "SBAC"],
    "Technology" : [ "AAPL", "AMD", "ASML", "AVGO", "GOOG", "GOOGL", "META", "MSFT", "NVDA", "QCOM"],
    "Telecommunications" : [ "CHTR", "CMCSA", "CSCO", "FYBR", "LBRDA", "LBRDK", "ROKU", "TMUS", "VOD", "WBD"],
    "Utilities" : [ "AEP", "CEG", "CWST", "EVRG", "EXC", "LNT", "NFE", "NWE", "OTTR", "XEL"]
}
#ED_comparison functionalities
def get_boosted_score(stock):
    # Check stock sentiment
    stock_boost = stock_sentiment[
        (stock_sentiment['stock'] == stock) &
        (stock_sentiment['recommendation_date'] == DATE) &
        (stock_sentiment['period_months'] == PERIOD_MONTHS)
    ]
    if not stock_boost.empty:
        return stock_boost.iloc[0]['final_boost_score']
    
    # If stock sentiment is not found, get sector from no_sentiment.csv
    sector_info = no_sentiment[no_sentiment['stock'] == stock]
    if sector_info.empty:
        return 0  # If no sector information is found, return 0

    sector_name = sector_info.iloc[0]['sector']

    # Check sector sentiment
    sector_boost = sector_sentiment[
        (sector_sentiment['sector'] == sector_name) &
        (sector_sentiment['recommendation_date'] == DATE) &
        (sector_sentiment['period_months'] == PERIOD_MONTHS)
    ]
    if not sector_boost.empty:
        return sector_boost.iloc[0]['final_boost_score']
    
def euclidean_distance_comparison(n=10):
    """
    input
        n (int) : number of stocks to be recommended

    return
        results_df (DataFrame): DataFrame of results for each user persona
    """
    results = []
    file_name = f"../data_storage/dated_features/{DATE_MONTH}m_back.csv"
    if not os.path.exists(file_name):
        print(f"File {file_name} not found..")
        return

    stock_features = pd.read_csv(file_name, usecols=range(1, 15))

    # Calculate similarities for each user
    for i, user in test_users.iterrows():
        user_vector = np.array(user.iloc[1:].values).reshape(1, -1)
        stock_vectors = stock_features.iloc[:, 1:10].values  # Exclude stock column

        # Euclidean distance
        euclidean_distances = cdist(user_vector, stock_vectors, metric='euclidean').flatten()

        # Convert distances to similarity scores (inverted: smaller distance = higher similarity)
        similarity_scores = 1 / (1 + euclidean_distances) 

        temp_results = stock_features.copy()
        temp_results['similarity'] = similarity_scores

        # Apply sentiment boosting
        temp_results['boosted_similarity'] = temp_results.apply(
            lambda row: row['similarity'] + get_boosted_score(
                row['stock']
            ), axis=1
        )

        # Get top 10 recommended stocks
        top_N_stocks = temp_results.nlargest(n, 'boosted_similarity')

            # Calculate returns and Sharpe ratios
        close_prices = top_N_stocks['close_extract']
        eval_3m = top_N_stocks['eval_3m']
        eval_6m = top_N_stocks['eval_6m']
        eval_12m = top_N_stocks['eval_1y']

            # Calculate percentage returns
        returns_3m = ((eval_3m - close_prices) / close_prices) * 100
        returns_6m = ((eval_6m - close_prices) / close_prices) * 100
        returns_12m = ((eval_12m - close_prices) / close_prices) * 100

            # Calculate averages and standard deviations
        avg_return_3m = returns_3m.mean()
        avg_return_6m = returns_6m.mean()
        avg_return_12m = returns_12m.mean()

        stdev_return_3m = returns_3m.std(ddof=0)
        stdev_return_6m = returns_6m.std(ddof=0)
        stdev_return_12m = returns_12m.std(ddof=0)

            # Calculate Sharpe ratios (avoid division by zero)
        sharpe_ratio_3m = (avg_return_3m - risk_free_rate_3m) / stdev_return_3m if stdev_return_3m != 0 else np.nan
        sharpe_ratio_6m = (avg_return_6m - risk_free_rate_6m) / stdev_return_6m if stdev_return_6m != 0 else np.nan
        sharpe_ratio_12m = (avg_return_12m - risk_free_rate_12m) / stdev_return_12m if stdev_return_12m != 0 else np.nan

        results.append({
                'date': DATE,
                'user': user['user'],
                'period_months': PERIOD_MONTHS,
                'top_10_recommended_stocks': ', '.join(top_N_stocks['stock'].tolist()),
                'avg_return_3m': avg_return_3m,
                'stdev_return_3m': stdev_return_3m,
                'sharpe_ratio_3m': sharpe_ratio_3m,
                'avg_return_6m': avg_return_6m,
                'stdev_return_6m': stdev_return_6m,
                'sharpe_ratio_6m': sharpe_ratio_6m,
                'avg_return_12m': avg_return_12m,
                'stdev_return_12m': stdev_return_12m,
                'sharpe_ratio_12m': sharpe_ratio_12m
        })
    results_df = pd.DataFrame(results)
    return results_df

def calculate_similarities(user_vector, stock_vectors):
    """
    input
        user_vector (pd.Series)     : [1x9] vectors of the user to be compared
        stock_vectors (pd.Series)   : [Nx9] vectors of the user to be compared (N = num of stocks)
    return
        raw_results (DataFrame)     : DataFrame of stock Data with calculated similarities
    """
    results = []
    file_name = f"../data_storage/dated_features/{DATE_MONTH}m_back.csv"
    if not os.path.exists(file_name):
        print(f"File {file_name} not found..")
        return

    stock_features = pd.read_csv(file_name, usecols=range(1, 15))

    # Euclidean distance
    euclidean_distances = cdist(user_vector, stock_vectors, metric='euclidean')

    # Convert distances to similarity scores (inverted: smaller distance = higher similarity)
    similarity_scores = 1 / (1 + euclidean_distances) 

    raw_results = stock_features.copy()
    raw_results['similarity'] = similarity_scores

    # Apply sentiment boosting
    raw_results['boosted_similarity'] = raw_results.apply(
        lambda row: row['similarity'] + get_boosted_score(
            row['stock']
        ), axis=1
    )

    return raw_results.sort_values("boosted_similarity")

def filter_stocks_by_sector(stock_data, chosen_sectors):
    """
        input
            stock_data (pd.DataFrame)           : dataframe of stock data containing stock name and/or sector
            chosen_sectors (list)               : list containing sectors chosen by the user.
        output
            filtered_stock_data (pd.DataFrame)  : dataframe of filtered stock data input
    """
    stock_to_sector = {stock: sector for sector, stocks in stock_sector_map.items() for stock in stocks}
    
    stocks = []

    for sector in chosen_sectors:
        stocks.extend(stock_sector_map[sector])

    filtered_stock_data = stock_data[stock_data['stock'].isin(stocks)].copy()

    # Add a sector column based on the stock_to_sector mapping
    filtered_stock_data['sector'] = filtered_stock_data['stock'].map(stock_to_sector)

    return filtered_stock_data
def get_N_stocks(filtered_stock_data, N = 15):
    """
        filterd_stock_data (pd.DataFrame)   : filtered dataframe containing stock features of stocks in user chosen sectors (Must contain Boosted Similarities column)
        N (int)                             : number of stocks to be outputted
    """
    try:
        return filtered_stock_data.nlargest(N, 'boosted_similarity')
    except:
        print("\"boosted similarities\" not in column")
        return -1

def group_stocks_by_sector(stock_data):
    """
        input
            stock_data (pd.DataFrame)           : dataframe of stock data containing stock name and/or sector
        output
            grouped_stock_data (pd.DataFrame)   : dataframe of filtered stock data, grouped by sector
    """
    
    return stock_data.groupby("sector").apply(lambda x:x)
