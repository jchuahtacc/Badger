var students = {
  photos : { },
  displayNames: { }
};
var gamedata = {
  levels : { },
};
var xpladder = [ ];
var defaultGameData = {
  badges : {
    badge_1: today()
  },
  level : 1,
  medals: {
    bronze : 0,
    gold : 0,
    silver : 0,
  },
  xp : 0
};

var badges = { };

var iconTemplate = $("<div></div>");
var badgeTemplate = $("<div></div>");

var current_uid;
var current_xp;
var current_level;
var current_displayName;

function today() {
  var d = new Date();
  return (d.getMonth() + 1) + "/" + d.getDate() + "/" + (d.getYear() - 100 + 2000);
}

function buildBadgeTemplate() {
  badgeTemplate.addClass("text-center");
  badgeTemplate.attr('style', "display: inline-block; width: 30%; vertical-align: text-top; margin: 1% 1% 1% 1%;");
  badgeTemplate.load("./elements/badge.html", function() {
    badgeTemplate.find('[data-badge="award"]').click(awardBadge);
    loadBadges();
  });
}

function awardBadge(event) {
  var badge_id = $(event.currentTarget).attr('data-badge-id');
  var xp = badges[badge_id].value;
  firebase.database().ref('/gamedata').child('by_uid').child(current_uid).child('badges').child(badge_id).set(today());
  firebase.database().ref('/gamedata').child('badges').child(current_uid).child(badge_id).set(today());
  $("#studentModal").modal("hide");
  $.bootstrapGrowl("Awarded badge: " + badges[badge_id].name + " (" + badges[badge_id].value + " xp)", { type: 'info' });
  addXP(xp);
}

function addXP(xp) {
  var newXP = current_xp + xp;
  firebase.database().ref('/gamedata').child('by_uid').child(current_uid).child('xp').set(newXP);
  firebase.database().ref('/gamedata').child('xp').child(current_uid).set(newXP);
  if (newXP > xpladder[current_level]) {
    current_level++;
    $.bootstrapGrowl(current_displayName + " reached level " + current_level, { type: 'success' });
    firebase.database().ref('/gamedata').child('by_uid').child(current_uid).child('level').set(current_level);
    firebase.database().ref('/gamedata').child('levels').child(current_uid).set(current_level);
  }
}

function buildBadge(badge_id, data) {
  if ($("[data-badge-id=' + badge_id ']").length) {
    // badge exists, do nothing?
  } else {
    var div = badgeTemplate.clone(true);
    div.attr('data-badge-id', badge_id);
    div.find('[data-badge="thumbnail"]').attr('src', data.url);
    div.find('[data-badge="xp"]').html(data.value);
    div.find('[data-badge="name"]').html(data.name);
    div.find('[data-badge="award"]').removeClass("disabled").attr('data-badge-id', badge_id);
    div.appendTo("#badgeCollection");
  }
}

function buildStudentIconTemplate() {
  iconTemplate.click(studentClick);
  iconTemplate.addClass("text-center");
  iconTemplate.attr('style', "display: inline-block; width: 30%; vertical-align: text-top; margin: 1% 1% 1% 1%;");
  iconTemplate.load("./elements/studenticon.html");
}

function buildStudent(uid) {
  if ($("[data-uid='" + uid + "']").length) {
    // element exists already. do nothing?
  } else {
    var div = iconTemplate.clone(true);
    div.attr('data-uid', uid);
    div.appendTo("#students");
  }
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
  $("#studentModal").find('[data-icon="level"]').html(gamedata.levels[uid]);
  $("#studentModal").find('[data-icon="name"]').html(students.displayNames[uid]);
  $("#studentModal").find('[data-icon="thumbnail"]').attr('src', students.photos[uid]);
  firebase.database().ref('/gamedata').child('by_uid').child(uid).once('value').then(function(snapshot) {
    var data = defaultGameData;
    if (snapshot.val()) {
      data = snapshot.val();
    } else {
      // couldn't find record. write default info
      writeDefaultGamedata(uid);
    }
    current_xp = data.xp;
    current_level = data.level;
    current_displayName = students.displayNames[uid];
    var currentLvlXp = xpladder[data.level - 1];
    var nextLvlXp = xpladder[data.level];
    var progressPercent = (data.xp - currentLvlXp) * 100.0 / (nextLvlXp - currentLvlXp);

    $("#studentModal").find("#goldbadge").html(data.medals.gold);
    $("#studentModal").find("#silverbadge").html(data.medals.silver);
    $("#studentModal").find("#bronzebadge").html(data.medals.bronze);
    $("#studentModal").find("#currentLevel").html(data.level);
    $("#studentModal").find("#nextLevel").html(data.level + 1);
    $("#studentModal").find("#progressBar").attr('aria-valuemin', currentLvlXp);
    $("#studentModal").find("#progressBar").attr('aria-valuemax', nextLvlXp);
    $("#studentModal").find("#progressBar").attr('aria-valuenow', data.xp);
    $("#studentModal").find("#progressBar").attr('aria-valuenow', data.xp);
    $("#studentModal").find("#progressBar").attr('style', 'width: ' + progressPercent + '%;');
    $("[data-badge='award']").removeClass("disabled");
    if (data.badges) {
      for (badge_id in data.badges) {
        if ($("[data-badge-id='" + badge_id + "']").length) {
          var button = $("[data-badge-id='" + badge_id + "']").find('[data-badge="award"]');
          if (button.length) {
            $(button).html(data.badges[badge_id]);
            $(button).addClass("disabled");
          }
        }
      }
    }
    current_uid = uid;
    $("#studentModal").modal("show");
  });
}

function writeDefaultGamedata(uid) {
  firebase.database().ref('/gamedata').child('by_uid').child(uid).set(defaultGameData);
  firebase.database().ref('/gamedata').child('badges').child(uid).set(defaultGameData.badges);
  firebase.database().ref('/gamedata').child('levels').child(uid).set(defaultGameData.level);
  firebase.database().ref('/gamedata').child('xp').child(uid).set(defaultGameData.xp);
  firebase.database().ref('/gamedata').child('medals').child(uid).set(defaultGameData.medals);
}

function updateLevel(uid, level) {
  if (!level) {
    level = "";
  }
  gamedata.levels[uid] = level;
  getIcon(uid).find('[data-icon="level"]').html(level);
}

function setupHandlers() {
  firebase.database().ref('xpladder').once('value', function(snapshot) {
    xpladder = snapshot.val();
  });
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

function loadBadges() {
  firebase.database().ref('/badges').once('value').then(function(snapshot) {
    badges = snapshot.val();
    for (var badge_id in badges) {
      buildBadge(badge_id, badges[badge_id]);
    }
    firebase.database().ref('/badges').on('child_added', function(snapshot) {
      if (!(snapshot.key in badges)) {
        badges[snapshot.key] = snapshot.val();
        buildBadge(snapshot.key, snapshot.val());
      }
    });
  });
}

function loggedIn() {
  setupHandlers();
}

function loggedOut() {
  // clean up screen
}

$(document).ready(function() {
  buildBadgeTemplate();
  buildStudentIconTemplate();
  $('[data-icon="studentView"]').load("./elements/studentview.html");
  firebase.auth().onAuthStateChanged(function(user) {
    // Event when a Firebase user authenticates or signs out
    if (user) {
      loggedIn();
    } else {
      loggedOut();
    }
  });
});
