var students = { };

function buildStudent(uid) {
  var div = $("<div></div>");
  div.click(studentClick);
  div.addClass("text-center");
  div.attr('data-uid', uid);
  div.attr('style', "display: inline-block; width: 30%; vertical-align: text-top; margin: 1% 1% 1% 1%;");
  div.load("elements.html #studentIcon", function() {
    // build student with data
    firebase.database().ref('/students').child(uid).on('value', function(snapshot) {
      var data = snapshot.val();
      div.find('[data-icon="thumbnail"]').attr('src', data.photo);
      div.find('[data-icon="name"]').html(data.displayName);
    });
    firebase.database().ref('/gamedata').child(uid).child('level').on('value', function(snapshot) {
      if (snapshot.val()) {
        data = snapshot.val();
      } else {
        data = "";
      }
      div.find('[data-icon="level"]').text(data);
    });
  });
  div.appendTo("#students");
}

function studentClick(event) {
  var uid = $(event.currentTarget).attr('data-uid');
  console.log(uid);
}

function processStudents() {
  for (var uid in students) {
    buildStudent(uid);
  }
}

function loggedIn() {
  firebase.database().ref('/students').once('value', function(snapshot) {
    students = snapshot.val();
    processStudents();
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
});
