var students = { };
var gamedata = { };

function buildStudent(uid, data) {
  var div = $("<div></div>");
  div.addClass("col-md-2 text-center");
  div.attr('data-uid', uid);
  var studentData = data;
  div.load("elements.html #studentIcon", function() {
    // build student with data
    div.find('[data-icon="thumbnail"]').attr('src', data.photo);
    div.find('[data-icon="name"]').html(data.displayName);
  });
  div.appendTo("#students");
}

function processStudents() {
  for (var uid in students) {
    buildStudent(uid, students[uid]);
  }
}

function processGamedata() {
  
}

function loggedIn() {
  firebase.database().ref('/students').once('value', function(snapshot) {
    students = snapshot.val();
    processStudents();
    firebase.database().ref('/gamedata').once('value', function(snapshot) {
      gamedata = snapshot.val();
      processGamedata();
    });
  });
}

function loggedOut() {
  // clean up screen
}

$(document).ready(function() {
  firebase.auth().onAuthStateChanged(function(user) {
    // Event when a Firebase user authenticates or signs out
    if (user) {
      loggedIn();
    } else {
      loggedOut();
    }
  });
  console.log("Hello world");
});
