const http = require('http');

const postData = JSON.stringify({
    name: 'Allen Raymond',
    email: 'nulla.ante@vestibul.co.uk',
    phone: '(992) 914-3792',
});

const options = {
    method: 'POST',
    hostname: 'localhost',
    port: 3010,
    path: '/users',
    headers: {
        'content-length': postData.length,
        'Content-Type': 'application/json',
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

req.write(postData);

req.end();
