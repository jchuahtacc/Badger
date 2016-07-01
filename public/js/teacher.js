var students = {
  photos : { },
  displayNames: { }
};
var gamedata = {
  levels : { },
};

var iconTemplate = $("<div></div>");

function buildStudentIconTemplate() {
  iconTemplate.click(studentClick);
  iconTemplate.addClass("text-center");
  iconTemplate.attr('style', "display: inline-block; width: 30%; vertical-align: text-top; margin: 1% 1% 1% 1%;");
  iconTemplate.load("elements.html #studentIcon");
}

function buildStudent(uid) {
  var div = iconTemplate.clone(true);
  div.attr('data-uid', uid);
  div.appendTo("#students");
}

function getIcon(uid) {
  return $("#students").find('[data-uid="' + uid + '"]');
}

function updateName(uid, name) {
  students.displayNames[uid] = name;
  getIcon(uid).find('[data-icon="name"]').html(name);
}

function updateThumbnail(uid, photo) {
  students.photos[uid] = photo;
  getIcon(uid).find('[data-icon="thumbnail"]').attr('src', photo);
}

function studentClick(event) {
  var uid = $(event.currentTarget).attr('data-uid');
  $("#badge").find('[data-icon="level"]').html(gamedata.levels[uid]);
  $("#badge").find('[data-icon="name"]').html(students.displayNames[uid]);
  $("#badge").find('[data-icon="thumbnail"]').attr('src', students.photos[uid]);
  firebase.database().ref('/gamedata').child('by_uid').child(uid).once('value').then(function(snapshot) {

    $("#badge").modal("show");
  });
}

function updateLevel(uid, level) {
  if (!level) {
    level = "";
  }
  gamedata.levels[uid] = level;
  getIcon(uid).find('[data-icon="level"]').html(level);
}

function setupHandlers() {
  firebase.database().ref('/gamedata').child('levels').on('child_changed', function(snapshot, prevKey) {
    updateLevel(snapshot.key, snapshot.val());
  });
  firebase.database().ref('/gamedata').child('levels').on('child_added', function(snapshot, prevKey) {
    updateLevel(snapshot.key, snapshot.val());
  });
  firebase.database().ref('/students').child('displayNames').on('child_changed', function(snapshot, prevKey) {
    updateName(snapshot.key, snapshot.val());
  });
  firebase.database().ref('/students').child('displayNames').on('child_added', function(snapshot, prevKey) {
    var uid = snapshot.key;
    buildStudent(snapshot.key);
    updateName(snapshot.key, snapshot.val());
    firebase.database().ref('/gamedata').child('levels').child(uid).once('value', function(snapshot) {
      var level = snapshot.val();
      updateLevel(uid, level);
    });
  });
  firebase.database().ref('/students').child('photos').on('child_changed', function(snapshot, prevKey) {
    updateThumbnail(snapshot.key, snapshot.val());
  });
  firebase.database().ref('/students').child('photos').on('child_added', function(snapshot, prevKey) {
    updateThumbnail(snapshot.key, snapshot.val());
  });
}

function loggedIn() {
  setupHandlers();
}

function loggedOut() {
  // clean up screen
}

$(document).ready(function() {
  buildStudentIconTemplate();
  $('[data-icon="studentView"]').load("elements.html #studentView");
  firebase.auth().onAuthStateChanged(function(user) {
    // Event when a Firebase user authenticates or signs out
    if (user) {
      loggedIn();
    } else {
      loggedOut();
    }
  });
});
