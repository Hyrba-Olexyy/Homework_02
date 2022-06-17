const http = require('http');

const options = {
    method: 'PUT',
    hostname: 'localhost',
    port: 3010,
    path: '/users/3',
    headers: {
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

const postData = JSON.stringify({
    name: 'Andrei',
    email: 'andrey@mail',
    phone: '(542) 8345923',
});

req.write(postData);

req.end();
