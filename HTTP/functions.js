const fs = require('fs');
const url = require('url');
const path = require('path');
const http = require('http');

const contactsPath = path.join(__dirname, '..', 'db', 'contacts.json');

const listContacts = () => new Promise((resolve, reject) => {
    fs.readFile(contactsPath, (err, data) => {
        if (err) {
            return reject(err);
        }
        const contacts = [...JSON.parse(data.toString())];
        return resolve(contacts);
    });
});

const getContactById = async (contactId) => {
    const contacts = await listContacts();
    const user = contacts.find((contact) => contact.id === contactId);
    if (user) {
        return user;
    }
    return 'Not have user ID';
};

const changeInDatabase = (changes) => new Promise((resolve, reject) => {
    fs.writeFile(contactsPath, JSON.stringify(changes), (err) => {
        if (err) {
            reject(err);
        }
        resolve('Good write');
    });
});

const removeContact = async (contactId, res) => {
    const contacts = await listContacts();
    const userDeleted = await getContactById(contactId);
    const newContacts = contacts.filter((user) => user.id !== userDeleted.id);
    await changeInDatabase(newContacts);
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.end(`{"userDeleted id": ${userDeleted}}`);
};

const addContact = async (defineteId, data, res) => {
    const contacts = await listContacts();
    const newUser = { ...data, id: contacts.length + 1, id: defineteId };
    const newContacts = [...contacts, newUser];
    await changeInDatabase(newContacts);
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.end(`You Posted: ${JSON.stringify(newUser)}`);
};

const replaceContact = async (id, data, res) => {
    let contacts = await listContacts();
    const contactUpdated = await getContactById(id);
    console.log('contactUpdated :>> ', contactUpdated);
    if (contactUpdated !== 'Not have user ID') {
        contacts = contacts.map((cont) => {
            if (id === cont.id) {
                cont = { id: cont.id, ...data };
            }
            return cont;
        });
        await changeInDatabase(contacts);
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.end(`"contactUpdated": ${contactUpdated}`);
        return;
    }
    addContact(id, data, res);
};

function handleError(res, code) {
    res.statusCode = code;
    res.end(`{"error": "${http.STATUS_CODES[code]}"}`);
}

async function handleGetReq(req, res) {
    const { pathname } = url.parse(req.url, true);
    if (pathname !== '/users') {
        return handleError(res, 404);
    }

    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    const contacts = await listContacts();
    return res.end(JSON.stringify(contacts));
}

async function handleDeleteReq(req, res) {
    const { pathname } = url.parse(req.url, true);
    if (!pathname.includes('/users')) {
        return handleError(res, 404);
    }
    const [, id] = pathname.split('/users/');
    return removeContact(id, res);
}

function handlePostReq(req, res, reject) {
    const size = parseInt(req.headers['content-length'], 10);
    const buffer = Buffer.allocUnsafe(size);
    let pos = 0;

    const { pathname } = url.parse(req.url, true);
    if (pathname !== '/users') {
        return handleError(res, 404);
    }

    req.on('data', (chunk) => {
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

function handlePutReq(req, res, reject) {
    const { pathname } = url.parse(req.url, true);
    if (!pathname.includes('/users')) {
        return handleError(res, 404);
    }
    const [, id] = pathname.split('/users/');
    const size = parseInt(req.headers['content-length'], 10);
    const buffer = Buffer.allocUnsafe(size);
    let pos = 0;
    req.on('data', (chunk) => {
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
        replaceContact(id, data, res);
    });
}

module.exports = {
    handleGetReq,
    handleDeleteReq,
    handlePostReq,
    handlePutReq,
};
