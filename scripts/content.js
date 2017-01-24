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

function downloadSong(meta) {
    $.ajax({
        url: "https://api.soundcloud.com/i1/tracks/" + meta.id + "/streams?client_id=" + clientId.cid2,
        method: "GET"
    }).done(function(data) {
        var downloadLink = data.http_mp3_128_url;

        chrome.runtime.sendMessage({
            downloadLink: downloadLink,
            metadata: meta
        });
    });

    return false;
}

function populateForm(element, type) {
    var title, artist, genre, art, link;

    if (type == "individual") {
        link = window.location.href;
    } else {
        var songListing = $(element).parent().parent().parent().parent().parent().parent().parent().parent().parent();
        link = "https://soundcloud.com" + $(songListing).find(".soundTitle__title").attr('href');
    }

    modal.open();

    $.ajax({
        url: "https://api.soundcloud.com/resolve.json?url=" + encodeURIComponent(link) + "&client_id=" + encodeURIComponent(clientId.cid2),
        method: "GET"
    }).done(function(data) {
        if (data == "") {
            //figure this out later
            console.log("The API Request did not work properly, please try again...");
            /*
            title = $(songListing).find(".soundTitle__title").text();
            artist = $(songListing).find(".soundTitle__usernameText").text();
            genre = $(songListing).find(".soundTitle__tagContent").text();
            art = $(songListing).find(".sc-artwork").css('background-image').replace(/^url|[\(\)]/g, '').replace('200x200', '500x500');
            */
            return false;
        }

        trackId = data.id;
        title = data.title;
        artist = data.user.username;
        genre = data.genre;
        art = data.artwork_url.replace("large", "t500x500");

        setModalValues(trackId, link, artist, title, title, genre, art);
    });
}

function addButton(sound, type) {
    if (type == "sound") {
        var buttonContainer = sound.find(".sc-button-group")[0];
        $(buttonContainer).append('<button class="sc-ext-download sc-button sc-button-download sc-button-small sc-button-responsive">Download</button>');
        var newButton = sound.find(".sc-ext-download");
        newButton.click(function() {
            return populateForm(this);
        });
    } else if (type == "individual") {
        var buttonContainer = sound.find(".sc-button-group")[0];
        $(buttonContainer).append('<button class="sc-ext-download sc-button sc-button-download sc-button-medium sc-button-responsive">Download</button>');
        var newButton = sound.find(".sc-ext-download");
        newButton.click(function() {
            return populateForm(this, "individual");
        });
    }
}

function updateSounds() {
    $(".sound").each(function(i, obj) {
        if ($(obj).find(".sc-ext-download").length == 0) {
            addButton($(obj), "sound");
        }
    });

    $(".sc-button-toolbar.soundActions__medium").each(function(i, obj) {
        if ($(obj).find(".sc-ext-download").length == 0) {
            addButton($(obj), "individual");
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

modal = $('[data-remodal-id=modal]').remodal({
    hashTracking: false
});

$(document).on('confirmation', '.remodal', function() {
    var data = getModalValues();
    downloadSong(data);
});

function setImageURL(image_url) {
    $("#song-album-art")
      .on("load", function(){
        $("#error-message-text").html("");
      })
      .on("error", function(){
        $("#error-message-text").html("Note: The image link you entered is not valid. Attempting to download will require you to refresh the page.");
      })
      .attr("src", image_url);
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
