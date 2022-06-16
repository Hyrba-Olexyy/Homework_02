const http = require('http');

const options = {
    method: 'GET',
    hostname: 'localhost',
    port: 3010,
    path: '/users',
    headers: {},
    maxRedirects: 20,
};

const req = http.request(options, (res) => {
    const chunks = [];

    res.on('data', (chunk) => {
        chunks.push(chunk);
    });

    res.on('end', () => {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
    });

    res.on('error', (error) => {
        console.error(error);
    });
});

req.end();
