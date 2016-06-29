var config = {
  apiKey: "AIzaSyBGIPwjzHvTPvhf9R3cJtqDzIU83I42FCI",
  authDomain: "badger-695a9.firebaseapp.com",
  databaseURL: "https://badger-695a9.firebaseio.com",
  storageBucket: "badger-695a9.appspot.com",
};
firebase.initializeApp(config);


function login() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
    console.log("user signed in", result);
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    console.log("error", error);
  });
}
