import Parser from 'rss-parser';

// 创建解析器实例
const parser = new Parser();

export async function onRequest(context) {
	// 从请求 URL 中解析出 'rssUrl' 参数
	const { request } = context;
	const rssUrl = new URL(request.url).searchParams.get('rssUrl');

	// 如果客户端没有提供 rssUrl，返回错误
	if (!rssUrl) {
		return new Response(JSON.stringify({ error: 'RSS URL is required' }), {
			status: 400, // 这是一个客户端错误
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// console.log(`[get-latest-post] Checking RSS: ${rssUrl}`);

	try {
		// 使用 fetch 获取 RSS feed 内容
		const response = await fetch(rssUrl, {
			signal: AbortSignal.timeout(8000),
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36'
			}
		});

		if(!response.ok){
			throw new Error(`Failed to fetch RSS feed with status: ${response.status}`);
		}

		const text = await response.text();

		// 使用 rss-parser 解析 feed 字符串
		const feed = await parser.parseString(text);

		let latestPostDate = null;
		if (feed && feed.items && feed.items.length > 0) {
			// 有些博客的发布日期在 pubDate，有些在 isoDate，isoDate 更标准
			latestPostDate = feed.items[0].isoDate || feed.items[0].pubDate;
			// console.log(`[get-latest-post] SUCCESS for ${rssUrl}, Date: ${latestPostDate}`);
		} else {
			// console.log(`[get-latest-post] EMPTY_FEED for ${rssUrl}`);
		}

		// 无论是否成功找到日期，都返回 200 OK，由前端来判断 date 是否为 null
		return new Response(JSON.stringify({ latestPostDate }), {
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		// 在服务端打印错误，方便调试
		console.error(`[get-latest-post] CRITICAL_ERROR for ${rssUrl}:`, error.message);

		// 向客户端返回一个表示失败的空结果
		return new Response(JSON.stringify({ latestPostDate: null }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
