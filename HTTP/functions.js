const fs = require('fs');
const path = require('path');
const url = require('url');

const http = 'http';

const contactsPath = path.join(__dirname, '..', 'db', 'contacts.json');

const listContacts = () =>
    new Promise((resolve, reject) => {
        fs.readFile(contactsPath, (err, data) => {
            if (err) {
                return reject(err);
            }
            const contacts = [...JSON.parse(data.toString())];
            resolve(contacts);
        });
    });

const getContactById = async contactId => {
    const contacts = await listContacts();
    const user = contacts.find(contact => contact.id === contactId);
    if (user) {
        return user;
    }
    return 'Not have user ID';
};

function handleError(res, code) {
    res.statusCode = code;
    res.end(`{"error": "${http.STATUS_CODES[code]}"}`);
}

const changeInDatabase = changes =>
    new Promise((resolve, reject) => {
        fs.writeFile(contactsPath, JSON.stringify(changes), err => {
            if (err) {
                reject(err);
            }

            resolve('Good write');
        });
    });

const removeContact = async (contactId, res) => {
    const contacts = await listContacts();
    const userDeleted = await getContactById(contactId);
    const newContacts = contacts.filter(user => user.id !== userDeleted.id);
    await changeInDatabase(newContacts);
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.end(`{"userDeleted id": ${userDeleted}}`);
};

const addContact = async (data, res) => {
    const contacts = await listContacts();
    const newUser = { ...data, id: contacts.length + 1 };
    const newContacts = [...contacts, newUser];

    await changeInDatabase(newContacts);

    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.end(`You Posted: ${JSON.stringify(newUser)}`);
};

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

module.exports = {
    handleGetReq,
    handleDeleteReq,
    handlePostReq,
};
