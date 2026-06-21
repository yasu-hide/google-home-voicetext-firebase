'use strict';
require('date-utils');

function validateEnv() {
    if (!process.env['SERVER_ADDRESS']) {
        throw new Error('SERVER_ADDRESS required.');
    }
    if (!process.env['DEVICE_ADDRESS']) {
        throw new Error('DEVICE_ADDRESS required.');
    }
    if (!process.env['FIREBASE_CREDENTIAL']) {
        throw new Error('FIREBASE_CREDENTIAL required.');
    }
}

function buildEndpointUrl() {
    const port = process.env['SERVER_PORT'] || 8080;
    return `http://${process.env['SERVER_ADDRESS']}:${port}${process.env['DEVICE_ADDRESS']}`;
}

async function handleSnapshot(docSnapshot, endpointUrl, document) {
    const text = docSnapshot.get('message');
    if (!text) return;

    const body = new URLSearchParams({ text });
    console.log(new Date().toFormat('YYYY-MM-DD HH24:MI:SS'), ' POST ' + endpointUrl);

    try {
        const res = await fetch(endpointUrl, { method: 'POST', body });
        const resText = await res.text();
        try {
            await document.update({ message: '' });
            console.log(resText);
        } catch (err) {
            console.error(err);
        }
    } catch (err) {
        console.error(err);
    }
}

function handleFirestoreError(err, document) {
    console.error('Firestore error:', err);
    console.error(document);
}

module.exports = { validateEnv, buildEndpointUrl, handleSnapshot, handleFirestoreError };
