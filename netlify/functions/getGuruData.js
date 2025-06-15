// 文件路径: netlify/functions/getGuruData.js
exports.handler = async function (event, context) {
  const apiKey = 'LEDD4MQ1WUEN7HG2'; // 替换您的Key
  const tickers = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'NVDA', 'TSLA', 'META', 'LLY', 'JPM', 'V'];

  const fetchStockData = async (ticker) => {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) { throw new Error(`请求 ${ticker} 失败`); }
    return response.json();
  };

  try {
    // Netlify函数的超时限制是10秒。我们不能在这里长时间等待。
    // 所以，我们只请求第一只股票的数据作为快速响应的示例！
    // 这能立刻验证API Key和基本逻辑是否正确。
    const firstTicker = tickers[0];
    const data = await fetchStockData(firstTicker);

    if (data['Error Message'] || !data['Global Quote']) {
      throw new Error(`Alpha Vantage API返回错误: ${data['Note'] || data['Error Message']}`);
    }

    const formattedData = {
      status: 'fulfilled',
      value: {
        quote: { close: parseFloat(data['Global Quote']['05. price']) },
        fundamentals: {
          General: { Code: data['GlobalQuote']['01. symbol'], Name: firstTicker },
          AnalystRatings: { // --- 模拟的分析师数据 ---
            TargetPrice: parseFloat(data['Global Quote']['05. price']) * 1.20,
            Low: parseFloat(data['Global Quote']['05. price']) * 0.95,
            High: parseFloat(data['Global Quote']['05. price']) * 1.35,
            Rating: 15
          }
        }
      }
    };
    
    // 我们只返回第一只股票的数据，确保在10秒内完成
    return {
      statusCode: 200,
      body: JSON.stringify([formattedData]) // 以数组格式返回
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
