// 文件路径: netlify/functions/getGuruData.js
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = 'd14ml61r01qq13os71igd14ml61r01qq13os71j0'; // 替换为您的Finnhub API Key
  const ticker = 'AAPL'; // 我们仍然只请求一只股票来确保稳定

  // 我们需要调用两个API端点
  const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
  const recommendationUrl = `https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${apiKey}`;

  try {
    console.log(`开始为 ${ticker} 并行获取股价和评级...`);
    
    // 并行发起两个API请求，效率更高
    const [quoteResponse, recommendationResponse] = await Promise.all([
      fetch(quoteUrl),
      fetch(recommendationUrl)
    ]);

    if (!quoteResponse.ok) throw new Error(`获取股价失败: ${quoteResponse.statusText}`);
    if (!recommendationResponse.ok) throw new Error(`获取分析师评级失败: ${recommendationResponse.statusText}`);

    const quoteData = await quoteResponse.json();
    const recommendationData = await recommendationResponse.json();

    // Finnhub的推荐数据是一个数组，通常我们只需要最新的一个
    const latestRecommendation = (recommendationData && recommendationData.length > 0) ? recommendationData[0] : null;

    if (!quoteData || !latestRecommendation) {
        throw new Error('API返回的数据不完整');
    }

    console.log('成功从Finnhub获取到所有数据!');
    
    // 将两份数据整合后返回给前端
    return {
      statusCode: 200,
      body: JSON.stringify({
        quote: quoteData,
        recommendation: latestRecommendation
      })
    };
  } catch (error) {
    console.error('后端函数执行出错:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
