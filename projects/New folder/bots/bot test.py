##importing liibraries
import requests, hmac, hashlib, time, math
import pandas as pd
import numpy as np
from pandas import Series, DataFrame
from pandas_ta.overlap import hlc3
from pandas_ta.utils import get_offset, is_datetime_ordered, verify_series
from binance import Client
from binance.enums import HistoricalKlinesType
from binance.exceptions import BinanceAPIException
from time import sleep
from datetime import datetime

## api keys
api_key = "CyJdcSaMkH2rN3ykDaGj9eR8l3S4TGHCz54mTGqMttIYGWkJDe22Iu6eMvql12fT"
api_secret = "hvWIGHPZ0NOHChcGVWF5l2J31MyNuIFokSTS4xvFelQZNVDyG9sS2WyfMEhCEtEe"

##api key
client = Client(api_key,api_secret)

##inputs
symbol = 'WLDUSDT'
interval = '15m'
bands_dev = [-1.1,1.1]
qty = 5


## Get data using api
def getminutedata(symbol, interval, lookback):
    historical_data = None  # Initialize historical_data to None
    try:
        # Retrieve data
        historical_data = client.get_historical_klines(symbol, interval, lookback + 'min ago UTC', klines_type=HistoricalKlinesType.FUTURES)
    except BinanceAPIException as e:
        print(e)
        sleep(60)

    if historical_data is not None:
        # Create a DataFrame from the fetched data
        df = pd.DataFrame(historical_data)

        # Select the first 6 columns
        df = df.iloc[:, :6]

        # Rename columns
        df.columns = ["open_time", "open", "high", "low", "close", "volume"]

        # Convert the 'open_time' column to a datetime format and set as index
        df["open_time"] = pd.to_datetime(df["open_time"], unit="ms")
        df = df.set_index(df.open_time)
        df = df.drop(['open_time'], axis=1)
        df = df.astype(float)

        return df
    else:
        return None


# calculate vwap with bands
def vwap_with_bands(
    high: Series, low: Series, close: Series, volume: Series, bands: list = [-1,1],
    anchor: str = None,
    offset: int = None, **kwargs
):

    # Validate
    high = verify_series(high)
    low = verify_series(low)
    close = verify_series(close)
    volume = verify_series(volume)
    anchor = anchor.upper() if anchor and isinstance(
        anchor, str) and len(anchor) >= 1 else "D"
    offset = get_offset(offset)

    typical_price = hlc3(high=high, low=low, close=close)
    if not is_datetime_ordered(volume):
        _s = "[!] VWAP volume series is not datetime ordered."
        print(f"{_s} Results may not be as expected.")
    if not is_datetime_ordered(typical_price):
        _s = "[!] VWAP price series is not datetime ordered."
        print(f"{_s} Results may not be as expected.")

    # Calculate vwap
    wp = typical_price * volume
    vwap = wp.groupby(wp.index.to_period(anchor)).cumsum()
    vwap /= volume.groupby(volume.index.to_period(anchor)).cumsum()

    # Calculate vwap stdev bands
    var = volume * (typical_price *typical_price)
    var_sum = var.groupby(var.index.to_period(anchor)).cumsum()
    volume_sum = volume.groupby(volume.index.to_period(anchor)).cumsum()
    stddev_vwap = abs(var_sum/volume_sum - vwap*vwap)
    std_volume_weighted =  stddev_vwap.apply(math.sqrt)

    # Build Dataframe
    df = pd.DataFrame()
    df[f"VWAP_{anchor}"] = vwap
    for i in bands:
        df[f"{i}_VWAP_band"] = vwap + (i*std_volume_weighted)

    # Offset
    if offset != 0:
        vwap = vwap.shift(offset)

    # Fill
    if "fillna" in kwargs:
        vwap.fillna(kwargs["fillna"], inplace=True)
    if "fill_method" in kwargs:
        vwap.fillna(method=kwargs["fill_method"], inplace=True)

    # Name and Category
    vwap.name = f"VWAP_{anchor}_bands"
    vwap.category = "overlap"

    return df


## Find signals
def find_signal(close, high, low, vwap,  upperband, lowerband):
    if (low < lowerband) & (close > lowerband) & (close < vwap) & (((close - low) / close) > 0.0015):
        return 'sell'
    elif (high > upperband) & (close < upperband) & (close > vwap) & (((high- close) / close) > 0.0015) :
        return 'buy'



## Get data with bands
def getdata_withbands():
    # Getting minute data
    df = getminutedata(symbol, interval, '1440')

    if df is not None:  # Check if data was successfully fetched
        # Calculate the VWAP with bands
        vwap_bands_df = vwap_with_bands(
            high=df["high"],
            low=df["low"],
            close=df["close"],
            volume=df["volume"],
            bands=bands_dev,
            anchor="D")

        ## Merge vwap with bands with the original df
        new = pd.merge(df, vwap_bands_df, left_index=True, right_index=True)
        new["open_time"] = df.index
        new['signal'] = np.vectorize(find_signal)(df['close'], df['high'], df['low'], new['VWAP_D'], new.iloc[:, 7], new.iloc[:, 6])
        return new
    else:
        return None


## Get current time
def current_time():
    # Get the current Unix timestamp
    timestamp = time.time()

    # Convert the Unix timestamp to a datetime object
    datetime_obj = datetime.fromtimestamp(timestamp)

    # Format the datetime object as a string
    formatted_time = datetime_obj.strftime('%Y-%m-%d %H:%M:%S')

    return formatted_time


def get_current_position_details(symbol):
    # Define the endpoint URL
    url = 'https://fapi.binance.com'
    # Define the endpoint for getting open positions
    endpoint = '/fapi/v2/positionRisk'
    # Define the parameters for the request
    params = {
    'timestamp': int(time.time() * 1000)
    }
    # Create a query string from the parameters
    query_string = '&'.join([f'{key}={params[key]}' for key in params])
    # Create a signature for the request
    signature = hmac.new(api_secret.encode('utf-8'), query_string.encode('utf-8'), hashlib.sha256).hexdigest()
    # Add the API key and signature to the request headers
    headers = {
    'X-MBX-APIKEY': api_key,
    }
    # Make the GET request to get open positions
    response = requests.get(url + endpoint + '?' + query_string + f'&signature={signature}', headers=headers)
    # Filter the data for the Individual symbol
    current_pos_data = [item for item in response.json() if item['symbol'] == symbol]

    return current_pos_data


def position_qty(info):
    # Assuming info is a list containing a single dictionary
    position_info = info[0]
    # Get the position amount
    position_amt = position_info['positionAmt']
    # Convert it to a floating-point number if needed
    position_amt_float = float(position_amt)
    return position_amt_float

def cancel_orders(order_ids):
    # Loop through the order IDs and cancel each order
    for order_id in order_ids:
        try:
            result = client.futures_cancel_order(symbol=symbol, orderId=order_id)
            print(f"Cancelled order {order_id}: {result}")
        except Exception as e:
            print(f"Error cancelling order {order_id}: {e}")


# defining trading strategy
def tradingstrat(): # Initialize the current position as None
    current_position = None
    global log_df
    log_df = pd.DataFrame(columns=['open_time','open', 'high','low','close','volume','entry_log'])
    log_df["entry_log"] = None

    while True:
        global data
        data = getdata_withbands()
        log_df = pd.concat([log_df, data], ignore_index=True)
        selected_columns = ["open_time", "entry_log"]
        log_df = log_df[selected_columns]
        log_df = log_df.drop_duplicates()
        log_df = log_df.reset_index(drop = True)

        if data is not None:  # Check if data was successfully fetched
            if data['signal'].iloc[-2] == "buy" and log_df['entry_log'].iloc[-2] != ("Buy entered"):
                    order = client.futures_create_order(symbol=symbol, side='BUY', type='MARKET', quantity=qty, recvWindow=60000)
                    buy_limit_price = data.high[-2]
                    tp_limit_order = client.futures_create_order(symbol=symbol,side='SELL',type = 'LIMIT',timeInForce='GTC',quantity=qty,price=buy_limit_price)
                    log_df.loc[log_df.index[-1], "entry_log"] = "Buy entered"
                    print(order)
                    print(tp_limit_order)
                    timex = current_time()
                    print('BOUGHT! , current time:',timex)
                    current_position = "buy"
                    time.sleep(5)
            elif data['signal'].iloc[-2] == "sell" and log_df['entry_log'].iloc[-2] !=("Sell entered"):
                    order = client.futures_create_order(symbol=symbol, side='SELL', type='MARKET', quantity=qty, recvWindow=60000)
                    sell_limit_price = data.low[-2]
                    tp_limit_order =client.futures_create_order(symbol=symbol,side='BUY',type = 'LIMIT',timeInForce='GTC',quantity=qty,price=sell_limit_price)
                    log_df.loc[log_df.index[-1], 'entry_log'] = "Sell entered"
                    print(order)
                    print(tp_limit_order)
                    timex = current_time()
                    print('SHORT! , current time:',timex)
                    current_position = "sell"
                    time.sleep(5)
            elif current_position == "buy" and (data['close'].iloc[-2] <= data['VWAP_D'].iloc[-2]):
                pos_detail = get_current_position_details(symbol)
                Quantity = abs(position_qty(pos_detail))
                if Quantity != 0:
                    order = client.futures_create_order(symbol=symbol, side='SELL', type='MARKET', quantity=Quantity, recvWindow=60000)
                    orders = client.futures_get_open_orders(symbol=symbol)
                    order_ids = [order['orderId'] for order in orders]# Extract order IDs
                    cancel = cancel_orders(order_ids) ## cancelling pending limit orders
                    print("ALL BUY POSITION SQUARED OFF!")
                    current_position = None  # Reset the current position
            elif current_position == "sell" and (data['close'].iloc[-2] > data['VWAP_D'].iloc[-2]):
                pos_detail = get_current_position_details(symbol)
                Quantity = abs(position_qty(pos_detail))
                if Quantity != 0:
                    order = client.futures_create_order(symbol=symbol, side='BUY', type='MARKET', quantity=Quantity, recvWindow=60000)
                    orders = client.futures_get_open_orders(symbol=symbol)
                    order_ids = [order['orderId'] for order in orders]# Extract order IDs
                    cancel = cancel_orders(order_ids) ## cancelling pending limit orders
                    print("SELL POSITION SQUARED OFF!")
                    current_position = None  # Reset the current position
            else:
                print("price")
                timex = current_time()
                print(data.close.iloc[-1],'current time:',timex)
                time.sleep(1)
        else:
            # Handle the case when data is None (e.g., due to API rate limit reached)
            print("No data available. Waiting...")
            time.sleep(60)  # Adjust the sleep duration as needed


while True:
    tradingstrat()
