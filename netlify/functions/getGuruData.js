// 文件路径: netlify/functions/getGuruData.js

exports.handler = async function (event, context) {
  // 在这里替换为您自己的EODHD API Token
  const apiToken = 'YOUR_EODHD_API_TOKEN_HERE'; 
  
  // 我们的“批发”清单
  const tickers = [
    'AAPL.US', 'MSFT.US', 'GOOG.US', 'AMZN.US', 'NVDA.US', 
    'TSLA.US', 'META.US', 'LLY.US', 'JPM.US', 'V.US'
  ];

  const fetchStockData = async (ticker) => {
    const realTimeUrl = `https://eodhistoricaldata.com/api/real-time/${ticker}?api_token=${apiToken}&fmt=json`;
    const fundamentalsUrl = `https://eodhistoricaldata.com/api/fundamentals/${ticker}?api_token=${apiToken}`;
    
    // 并行获取一只股票的两种数据
    const [realTimeResponse, fundamentalsResponse] = await Promise.all([
      fetch(realTimeUrl),
      fetch(fundamentalsUrl)
    ]);

    if (!realTimeResponse.ok || !fundamentalsResponse.ok) {
      console.error(`Failed to fetch data for ${ticker}`);
      // 对于单个股票的失败，我们返回null，而不是让整个流程失败
      return null; 
    }

    return {
      quote: await realTimeResponse.json(),
      fundamentals: await fundamentalsResponse.json()
    };
  };
  
  try {
    // 并行处理所有股票的数据请求
    const promises = tickers.map(ticker => fetchStockData(ticker));
    // Promise.allSettled 会等待所有请求完成，无论成功或失败
    const results = await Promise.allSettled(promises);
    
    return {
      statusCode: 200,
      body: JSON.stringify(results) // 将所有结果（包括成功和失败的）返回给前端
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
