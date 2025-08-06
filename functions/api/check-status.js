export async function onRequest(context) {
	const { request } = context;

	// 从 URL 中获取查询参数
	const url = new URL(request.url).searchParams.get('url');

	if (!url) {
		return new Response(JSON.stringify({ error: 'URL is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// console.log(`[check-status] Checking URL: ${url}`);

	try {
		// Workers 内置了 fetch API
		const response = await fetch(url, {
			signal: AbortSignal.timeout(5000), // 5秒超时
			headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36' }
		});

		// 检查响应是否成功
		if(response.ok) {
			return new Response(JSON.stringify({ status: 'ok' }), {
				headers: { 'Content-Type': 'application/json' },
			});
		} else {
			// console.error(`[check-status] FAILED for ${url} with status: ${response.status}`);
			return new Response(JSON.stringify({ status: 'error' }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}

	} catch (error) {
		// console.error(`[check-status] CRITICAL_ERROR for ${url}:`, error.message);
		return new Response(JSON.stringify({ status: 'error' }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
