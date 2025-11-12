import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDf9BLcZcy6l2L9kHtnGeBf0sGdQHceqjU",
  authDomain: "restaurant-management-platform.firebaseapp.com",
  projectId: "restaurant-management-platform",
  storageBucket: "restaurant-management-platform.firebasestorage.app",
  messagingSenderId: "675390978659",
  appId: "1:675390978659:web:79bb345fbb527531ead656"
};

function initializeFirebase() {
  return initializeApp(firebaseConfig);
}

const app = initializeFirebase();
const auth = getAuth(app); // auth solo contiene el estado de autenticación, no los proveedores.

export {app, auth}