// 文件路径: netlify/functions/getGuruData.js
exports.handler = async function (event, context) {
  const apiKey = 'LEDD4MQ1WUEN7HG2'; // 替换您的Key
  const ticker = 'IBM'; // 我们只请求一只股票来确保成功！

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Alpha Vantage服务器响应错误: ${response.status}`);
    }
    const data = await response.json();

    // 关键的错误处理：检查Alpha Vantage是否因为频率限制等原因返回了Note
    if (data.Note) {
      throw new Error(`Alpha Vantage API 提示: ${data.Note}`);
    }
    
    // 检查核心数据是否存在
    if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
        throw new Error('API返回的数据格式不正确，缺少Global Quote信息。');
    }

    // 成功后，将数据作为JSON返回
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('后端函数执行出错:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
