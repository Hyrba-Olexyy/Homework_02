const http = require('http');
const {
    handleGetReq,
    handleDeleteReq,
    handlePostReq,
    handlePutReq,
} = require('./functions');

const port = '3010';

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
    if (req.method === 'PUT') {
        return handlePutReq(req, res);
    }
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
