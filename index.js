const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    // Разрешаем твоему основному сайту Clearweb забирать данные без ошибок CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Достаем адрес сайта из параметров (например, ?url=https://dzen.ru)
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const targetUrl = reqUrl.searchParams.get('url');

    if (!targetUrl) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Ошибка: укажите целевой URL (?url=...)');
        return;
    }

    try {
        // Динамически загружаем node-fetch для скачивания сайтов
        const { default: fetch } = await import('node-fetch');
        
        const response = await fetch(decodeURIComponent(targetUrl), {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' }
        });
        const html = await response.text();
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Ошибка проксирования: ' + error.message);
    }
});

server.listen(PORT, () => {
    console.log(`Прокси запущен на порту ${PORT}`);
});
