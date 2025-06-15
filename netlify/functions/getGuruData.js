// 文件路径: netlify/functions/getGuruData.js

exports.handler = async function (event, context) {
  // 在这里替换为您自己的 Alpha Vantage API Key
  const apiKey = 'LEDD4MQ1WUEN7HG2'; 
  
  const tickers = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'NVDA', 'TSLA', 'META', 'LLY', 'JPM', 'V'];

  const fetchStockData = async (ticker) => {
    // Alpha Vantage 的API端点
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
    
    // 注意：Alpha Vantage没有直接的分析师评级API。我们将使用其他数据来模拟，或暂时留空。
    // 这是一个重要的妥协，为了换取更高的免费额度和更稳定的连接。
    
    const response = await fetch(quoteUrl);
    if (!response.ok) {
      console.error(`Failed to fetch quote for ${ticker}`);
      return null;
    }
    const data = await response.json();

    // Alpha Vantage的免费API有频率限制（每分钟5次），我们需要在请求之间增加延迟。
    await new Promise(resolve => setTimeout(resolve, 13000)); // 等待13秒

    // 检查API返回的数据是否包含错误信息
    if (data['Error Message'] || !data['Global Quote'] || !data['Global Quote']['05. price']) {
        console.error(`Invalid data for ${ticker}:`, data);
        return null;
    }

    // 格式化数据以匹配我们的前端需求
    return {
      quote: {
        close: parseFloat(data['Global Quote']['05. price'])
      },
      fundamentals: {
        General: {
          Code: data['Global Quote']['01. symbol'],
          Name: ticker // 暂时用ticker作为名字
        },
        AnalystRatings: { // --- 模拟的分析师数据 ---
          TargetPrice: parseFloat(data['Global Quote']['05. price']) * 1.2, // 模拟目标价为当前价的1.2倍
          Low: parseFloat(data['Global Quote']['05. price']) * 0.9,
          High: parseFloat(data['Global Quote']['05. price']) * 1.4,
          Rating: 15, // 模拟分析师数量
        }
      }
    };
  };
  
  try {
    const promises = tickers.map(ticker => fetchStockData(ticker));
    const results = await Promise.allSettled(promises);
    const successfulResults = results.filter(r => r.status === 'fulfilled' && r.value);
    
    return {
      statusCode: 200,
      body: JSON.stringify(successfulResults)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
