'use strict';

const { validateEnv, buildEndpointUrl, handleSnapshot, handleFirestoreError } = require('./lib/handler');

validateEnv();

const endpointUrl = buildEndpointUrl();

const admin = require('firebase-admin');
const serviceAccount = require(process.env['FIREBASE_CREDENTIAL']);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const docpath = process.env['FIREBASE_DOCPATH'] || '/googlehome/chant';
const firestore = admin.firestore();
const document = firestore.doc(docpath);
document.onSnapshot(
    (docSnapshot) => handleSnapshot(docSnapshot, endpointUrl, document),
    (err) => handleFirestoreError(err, document)
);
