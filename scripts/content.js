var modal;
var clientId = {
  cid1: "pPmFkm7w8XvU1oRdViIbG2nMmhimho6K",
  cid2: "a3e059563d7fd3372b49b37f00a00bcf",
  cid3: "b45b1aa10f1ac2941910a7f0d10f8e28"
}

var songInfo = {
  id: "",
  link: ""
}

function setModalValues(trackId, link, artist, title, album, genre, art) {
  $("#song-header-title").html(artist + " - " + title);
  $("#song-input-title").val(title);
  $("#song-input-artist").val(artist);
  $("#song-input-genre").val(genre);
  $("#song-input-album").val(album);
  $("#song-input-art").val(art);
  $("#song-album-art").attr('src', art);

  songInfo.link = link;
  songInfo.id = trackId;
}

function getModalValues() {
  var data = {};
  data.link = songInfo.link;
  data.id = songInfo.id;
  data.title = $("#song-input-title").val();
  data.artist = $("#song-input-artist").val();
  data.genre = $("#song-input-genre").val();
  data.album = $("#song-input-album").val();
  data.art = $("#song-input-art").val();
  return data;
}

function parseArtwork(url) {
  if (url == null) {
    url = "";
  } else if (url.indexOf("t200x200") != -1) {
    url = url.replace("t200x200", "t500x500");
  } else if (url.indexOf("large") != -1) {
    url = url.replace("large", "t500x500");
  }

  return url;
}

function trackEvent(category, action, label) {
  chrome.runtime.sendMessage({message: "track", category: category, action: action, label: label});
}

function downloadPlaylist(plist) {
  plist.tracks.forEach(function(track) {
    var meta = {};
    meta.link = track.permalink_url;
    meta.id = track.id;
    meta.title = track.title;
    meta.artist = track.user.username;
    meta.genre = track.genre;
    meta.album = plist.title;
    meta.art = track.artwork_url;
    meta.playlist = plist.title;

    $.ajax({
      url: "https://api.soundcloud.com/i1/tracks/" + meta.id + "/streams?client_id=" + clientId.cid2,
      method: "GET"
    }).done(function(data) {
      var downloadLink = data.http_mp3_128_url;

      chrome.runtime.sendMessage({downloadLink: downloadLink, metadata: meta});
    });
  });
}

function downloadSong(meta) {
  $.ajax({
    url: "https://api.soundcloud.com/i1/tracks/" + meta.id + "/streams?client_id=" + clientId.cid2,
    method: "GET"
  }).done(function(data) {
    var downloadLink = data.http_mp3_128_url;

    chrome.runtime.sendMessage({downloadLink: downloadLink, metadata: meta});
  });

  return false;
}

function populateForm(element, type) {
  chrome.storage.local.get(["edit"], function(storage) {
    var title,
      artist,
      genre,
      art,
      link,
      trackId,
      songListing;

    if (type == "individual" || type == "playlist-individual") {
      link = window.location.href;
      songListing = $(element).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().find(".l-listen-hero");
    } else {
      songListing = $(element).parent().parent().parent().parent().parent().parent().parent().parent();
      link = "https://soundcloud.com" + $(songListing).find(".soundTitle__title").attr('href');
    }

    trackEvent('download-button', 'song link', link);

    if (storage.edit && type != "playlist" && type != "playlist-individual") {
      modal.open();
    }

    $.ajax({
      url: "https://api.soundcloud.com/resolve.json?url=" + encodeURIComponent(link) + "&client_id=" + encodeURIComponent(clientId.cid2),
      method: "GET"
    }).done(function(data) {
      if (data == "") {
        alert("The API Request did not work properly, please try again...");
        return false;
      }

      trackId = data.id;
      title = data.title;
      artist = data.user.username;
      genre = data.genre;
      art = parseArtwork(data.artwork_url);

      setModalValues(trackId, link, artist, title, title, genre, art);

      if (type == "playlist" || type == "playlist-individual") {
        downloadPlaylist(data);
      } else if (!storage.edit) {
        var data = getModalValues();
        downloadSong(data);
      }
    });
  });
}

function addButton(sound, type) {
  var buttonContainer = sound.find(".sc-button-group")[0];
  $(buttonContainer).append('<button class="sc-ext-download sc-button sc-button-download sc-button-medium sc-button-responsive">Download</button>');
  var newButton = sound.find(".sc-ext-download");
  newButton.click(function() {
    return populateForm(
      this, type == "sound"
      ? null
      : type);
  });
}

function updateSounds() {
  $(".sound").each(function(i, obj) {
    if ($(obj).find(".sc-ext-download").length == 0) {
      if ($(obj).hasClass("playlist")) {
        addButton($(obj), "playlist");
      } else {
        addButton($(obj), "sound");
      }
    }
  });

  $(".sc-button-toolbar.soundActions__medium").each(function(i, obj) {
    if ($(obj).find(".sc-ext-download").length == 0) {
      if (window.location.href.indexOf("sets") != -1) {
        addButton($(obj), "playlist-individual");
      } else {
        addButton($(obj), "individual");
      }
    }
  });
}

$(document).on("DOMNodeRemoved", function(a) {
  $("#content").each(function(a, b) {
    setTimeout(function() {
      updateSounds();
    }, 5)
  })
});

$("body").append('<div data-remodal-id="modal" id="modal-wrapper"></div>');
$("#modal-wrapper").load(chrome.extension.getURL("resources/modal.html"));

modal = $('[data-remodal-id=modal]').remodal({hashTracking: false});

$(document).on('confirmation', '.remodal', function() {
  var data = getModalValues();
  downloadSong(data);
  trackEvent('modal', 'download', data.artist + ' - ' + data.title);
});

function setImageURL(image_url) {
  $("#song-album-art").on("load", function() {
    $("#error-message-text").html("");
    $("#download-button").prop("disabled", false);
  }).on("error", function() {
    $("#error-message-text").html("Error: The image link you entered is not valid. Please fix your image link to download the song.");
    $("#download-button").prop("disabled", true);
  }).attr("src", image_url);
}

$(document).on('opened', '.remodal', function() {
  $("body").css("padding-right", "0px");
  $("#song-input-art").off('input').on("input", function() {
    setImageURL($("#song-input-art").val());
  });
});

$(document).on('closing', '.remodal', function() {
  setModalValues("", "", "", "", "", "", "");
});
