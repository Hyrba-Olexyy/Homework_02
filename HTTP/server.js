const http = require('http');
const {
    handleGetReq,
    handleDeleteReq,
    handlePostReq,
} = require('./functions');

const port = '3010';

// eslint-disable-next-line consistent-return
const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        return handleGetReq(req, res);
    }
    if (req.method === 'DELETE') {
        return handleDeleteReq(req, res);
    }
    if (req.method === 'POST') {
        return handlePostReq(req, res);
    }
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
