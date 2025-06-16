// 文件路径: netlify/functions/getGuruData.js
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = 'd14ml61r01qq13os71igd14ml61r01qq13os71j0'; // 替换为您的Finnhub API Key
  const ticker = 'AAPL';

  const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
  const recommendationUrl = `https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${apiKey}`;
  const priceTargetUrl = `https://finnhub.io/api/v1/stock/price-target?symbol=${ticker}&token=${apiKey}`;
  const companyProfileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`;

  try {
    const [quoteRes, recRes, targetRes, profileRes] = await Promise.all([
      fetch(quoteUrl), fetch(recommendationUrl), fetch(priceTargetUrl), fetch(companyProfileUrl)
    ]);

    // 即使某个请求失败，我们也不让整个函数崩溃，而是继续处理成功的部分
    const quoteData = quoteRes.ok ? await quoteRes.json() : null;
    const recData = recRes.ok ? await recRes.json() : null;
    const targetData = targetRes.ok ? await targetRes.json() : null;
    const profileData = profileRes.ok ? await profileRes.json() : null;

    // 将所有获取到的数据（无论成功与否）都返回给前端
    return {
      statusCode: 200,
      body: JSON.stringify({
        quote: quoteData,
        recommendation: (recData && recData.length > 0) ? recData[0] : null,
        priceTarget: targetData,
        profile: profileData
      })
    };
  } catch (error) {
    console.error('后端函数执行出错:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
