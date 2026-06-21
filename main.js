'use strict';

const { validateEnv, buildEndpointUrl, handleSnapshot, handleFirestoreError } = require('./lib/handler');

validateEnv();

const endpointUrl = buildEndpointUrl();

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require(process.env['FIREBASE_CREDENTIAL']);
initializeApp({ credential: cert(serviceAccount) });

const docpath = process.env['FIREBASE_DOCPATH'] || '/googlehome/chant';
const firestore = getFirestore();
const document = firestore.doc(docpath);
document.onSnapshot(
    (docSnapshot) => handleSnapshot(docSnapshot, endpointUrl, document),
    (err) => handleFirestoreError(err, document)
);
