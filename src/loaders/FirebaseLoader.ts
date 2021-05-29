import firebase from "firebase-admin";
import config from "../config";

const firebaseConfig = {
	type: "service_account",
	projectId: "dollarbot-ds",
	privateKeyId: config.pkid,
	privateKey: config.pk,
	clientEmail: config.ce,
	clientId: config.cid,
	authUri: "https://accounts.google.com/o/oauth2/auth",
	tokenUri: "https://oauth2.googleapis.com/token",
	authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
	clientX509CertUrl: config.curl,
};

firebase.initializeApp({
	credential: firebase.credential.cert(firebaseConfig),
	databaseURL: "https://dollarbot-ds.firebaseio.com",
});

export default firebase;
export const firestore = firebase.firestore();
