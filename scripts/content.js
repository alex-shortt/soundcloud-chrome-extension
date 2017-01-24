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

function deleteListing(element) {
    var songListing = $(element).parent().parent().parent().parent();
    songListing.parent().remove(songListing);
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

function downloadSong(trackId, link, artist, title, genre, album, album_art) {
    link = encodeURIComponent(link.replace("https", "http"));
    artist = encodeURIComponent(artist);
    title = encodeURIComponent(title);
    genre = encodeURIComponent(genre);
    album = encodeURIComponent(album);
    album_art = encodeURIComponent(album_art);

    $.ajax({
        url: "https://api.soundcloud.com/i1/tracks/" + trackId + "/streams?client_id=a3e059563d7fd3372b49b37f00a00bcf",
        method: "GET"
    }).done(function(data) {
        console.log(data);
        var downloadLink = data.http_mp3_128_url;

        var meta = getModalValues();
        setModalValues("", "", "", "", "", "", "");

        chrome.runtime.sendMessage({
            downloadLink: downloadLink,
            metadata: meta
        });
    });

    return false;
}

function populateForm(element, type) {
    var clientId = "pPmFkm7w8XvU1oRdViIbG2nMmhimho6K";
    var title, artist, genre, art, link;

    if (type == "individual") {
        link = window.location.href;
    } else {
        var songListing = $(element).parent().parent().parent().parent().parent().parent().parent().parent().parent();
        link = "https://soundcloud.com" + $(songListing).find(".soundTitle__title").attr('href');
    }

    modal.open();

    $.ajax({
        url: "https://api.soundcloud.com/resolve.json?url=" + encodeURIComponent(link) + "&client_id=" + encodeURIComponent(clientId),
        method: "GET"
    }).done(function(data) {
        console.log(data);
        if (data == "") {
            //figure this out later
            console.log("This api does not work for this track. Skipping...");
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

        console.log(artist + " - " + title + " >> " + genre + " >> " + art);

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
    } else if(type == "individual") {
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

updateSounds();

$(document).on("DOMNodeRemoved", function(a) {
    $("#content").each(function(a, b) {
        setTimeout(function() {
            updateSounds();
        }, 5)
    })
});

//https://developer.chrome.com/extensions/background_pages

$("body").append('<div data-remodal-id="modal" id="modal-wrapper"></div>');
$("#modal-wrapper").load(chrome.extension.getURL("resources/modal.html"));

modal = $('[data-remodal-id=modal]').remodal({
    hashTracking: false
});

$(document).on('confirmation', '.remodal', function() {
    var data = getModalValues();
    downloadSong(data.id, data.link, data.artist, data.title, data.genre, data.album, data.art);
});

$(document).on('opened', '.remodal', function() {
    $("body").css("padding-right", "0px");
    $("#song-input-art").off('input').on("input", function() {
        $("#song-album-art").attr('src', $("#song-input-art").val());
        console.log("change!");
    });
});
