'use strict'
require("date-utils");
const request = require('request-promise');
const url = require("url");

if(!process.env["SERVER_ADDRESS"]) {
    throw new Error("SERVER_ADDRESS required.");
}
if(!process.env["DEVICE_ADDRESS"]) {
    throw new Error("DEVICE_ADDRESS required.");
}
if(!process.env["FIREBASE_CREDENTIAL"]) {
    throw new Error("FIREBASE_CREDENTIAL required.");
}

const endpointUrl = url.format({
    protocol: 'http',
    port: process.env["SERVER_PORT"] || 8080,
    hostname: process.env["SERVER_ADDRESS"],
    pathname: process.env["DEVICE_ADDRESS"]
}).toString();

const options = {
    url: endpointUrl,
    method: 'POST',
    form: {}
};

const admin = require("firebase-admin");
const serviceAccount = require(process.env["FIREBASE_CREDENTIAL"]);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const docpath = process.env["FIREBASE_DOCPATH"] || '/googlehome/chant';
const firestore = admin.firestore();
const document = firestore.doc(docpath);
document.onSnapshot((docSnapshot) => {
    const text = docSnapshot.get("message");
    if (text) {
        options.form = {'text': text};
        console.log(new Date().toFormat("YYYY-MM-DD HH24:MI:SS"), ' POST ' + endpointUrl);
        request(options).then((res) => {
            document.update({message: ""}).then(() => {
                console.log(res);
            }).catch((err) => console.error(err));
        }).catch((err) => console.error(err));
    }
}, (err) => {
    console.error("Firestore error:", err);
    console.error(document);
});