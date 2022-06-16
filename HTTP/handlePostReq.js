const url = require('url');
const { handleError, addContact } = require('./functions');

function handlePostReq(req, res) {
    const size = parseInt(req.headers['content-length'], 10);
    const buffer = Buffer.allocUnsafe(size);
    let pos = 0;

    const { pathname } = url.parse(req.url, true);
    if (pathname !== '/users') {
        return handleError(res, 404);
    }

    req.on('data', chunk => {
        const offset = pos + chunk.length;
        if (offset > size) {
            reject(413, 'Too Large', res);
            return;
        }
        chunk.copy(buffer, pos);
        pos = offset;
    }).on('end', () => {
        if (pos !== size) {
            reject(400, 'Bad Request', res);
            return;
        }
        const data = JSON.parse(buffer.toString());

        addContact(data, res);
    });
}
