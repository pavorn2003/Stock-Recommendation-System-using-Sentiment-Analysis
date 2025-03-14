import pandas as pd
import numpy as np
from scipy.spatial.distance import cdist
import os
import re
from joblib import load
from keras.models import Sequential
from keras.layers import Dense
from keras.callbacks import EarlyStopping
from keras.layers import LSTM
from keras.utils import plot_model
from sklearn.preprocessing import MinMaxScaler

risk_free_rate_3m = 3/4  # Risk-free rate in percentage
risk_free_rate_6m = 3/2
risk_free_rate_12m = 3

# dates = ['03-31-2022', '06-30-2022', '09-30-2022', '12-31-2022',
#          '03-31-2023', '06-30-2023', '09-30-2023', '12-31-2023',
#          '03-31-2024', '06-30-2024']
# months_back = [3, 6, 12]

DATE_MONTH = "06-30-2023_12"
DATE = "06-30-2023"
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
        (stock_sentiment['recommendation_date'] == '2023-06-30') &
        (stock_sentiment['period_months'] == int(PERIOD_MONTHS))
    ]
    # print(stock_sentiment['recommendation_date'])

    if not stock_boost.empty:
        return stock_boost.iloc[0]['final_boost_score']
    
    sector_info = None
    for key in stock_sector_map:
        if stock in stock_sector_map[key]:
            if key == 'Healthcare': key = "Health_Care"
            sector_name = key.replace(" ","_")
            break

    # If stock sentiment is not found, get sector from no_sentiment.csv
    # sector_info = no_sentiment[no_sentiment['stock'] == stock]
    # if sector_info.empty:
    #     return 0  # If no sector information is found, return 0

    # sector_name = sector_info.iloc[0]['sector']

    # Check sector sentiment
    sector_boost = sector_sentiment[
        (sector_sentiment['sector'] == sector_name) &
        (sector_sentiment['recommendation_date'] == '2023-06-30 00:00:00+00:00') &
        (sector_sentiment['period_months'] == int(PERIOD_MONTHS))
    ]
    if not sector_boost.empty:
        return sector_boost.iloc[0]['final_boost_score']
    
def calculate_similarities(user_vector): #, stock_vectors):
    """
    input
        user_vector (pd.Series)     : [1x9] vectors of the user to be compared
        stock_vectors (pd.Series)   : [Nx9] vectors of the user to be compared (N = num of stocks)
    return
        raw_results (DataFrame)     : DataFrame of stock Data with calculated similarities
    """
    results = []
    file_name = f"data_storage/dated_features/{DATE_MONTH}m_back.csv"
    if not os.path.exists(file_name):
        print(f"File {file_name} not found..")
        return

    stock_features = pd.read_csv(file_name, usecols=range(1, 11))

    # z score norm of user vector
    for col in stock_features.columns:
        if col!='stock':
            user_vector.loc[0,col] = stock_features[col].quantile(user_vector.loc[0,col])

    # Euclidean distance
    euclidean_distances = cdist(user_vector, stock_features.drop(columns=['stock']), metric='euclidean')

    # Convert distances to similarity scores (inverted: smaller distance = higher similarity)
    similarity_scores = 1 / (1 + euclidean_distances) 

    raw_results = stock_features.copy()
    raw_results['similarity'] = similarity_scores[0]
    
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
    for i,stock in enumerate(chosen_sectors):
        if stock == 'Healthcare': chosen_sectors[i] = "Health_Care"
        elif stock == 'Real Estate': continue
        else:chosen_sectors[i] = chosen_sectors[i].replace(" ","_")

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
    sectors = {}
    stock_to_sector = {stock: sector for sector, stocks in stock_sector_map.items() for stock in stocks}
    for stock in stock_data:
        for key in stock_sector_map.keys():
            if stock in stock_sector_map[key]:
                if key in sectors.keys():
                    sectors[key].append(stock)
                else:
                    sectors[key] = [stock]
                break
    return sectors

def calculate_stock_performance(stock,holding_period):
    """
        input
            removed : stock_data (pd.DataFrame)   : stock data of 
            stock (str)                 : ticker of the stock to be evaluated
            holding_period (int)        : period of holding
        return
            return of stock
            Note: I'm not sure if sharpe ratio, stdev, and average could be calculated
    """

    file_name = f"data_storage/stock_data/{DATE_MONTH}m_back.csv"
    if not os.path.exists(file_name):
        print(f"File {file_name} not found..")
        return

    stock_features = pd.read_csv(file_name, usecols=range(1, 15))

    stock_returns = {}
    for sector in stock.keys():
        for s in stock[sector]:

            df = pd.read_csv(f"data_storage/stock_price_data/{sector}/{s}.csv")
            df['Date'] = pd.to_datetime(df['Date'])
            df = df.sort_values(by="Date").reset_index()
            date = pd.to_datetime(DATE)
            while len(df[df['Date'] == date]) == 0:
                date += pd.DateOffset(days=1)
            eval = df[df['Date']==pd.to_datetime(date)-pd.DateOffset(days=30)]["Close/Last"].iloc[0].replace("$","")
            eval = float(eval)

            stock_data = stock_features[stock_features['stock']==s]
            close = float(stock_data['close_extract'])
            
            stock_return = ((close-eval)/eval) * 100

            stock_returns[s] = stock_return
    
    return stock_returns
    
def get_return_prediction(stocks):
    return
