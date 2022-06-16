const http = require('http');

const options = {
    method: 'DELETE',
    hostname: 'localhost',
    port: 3010,
    path: '/users/1',
    headers: {
        'Content-Type': 'text/plain',
    },
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

const postData = '<file contents here>';

req.setHeader('Content-Length', postData.length);

req.write(postData);

req.end();
