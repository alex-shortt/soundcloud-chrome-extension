console.log("running...");
var modal;

function deleteListing(element) {
    var songListing = $(element).parent().parent().parent().parent();
    songListing.parent().remove(songListing);
}

function downloadSong(link, artist, title, genre, album, art) {
    var download_link = "https://soundcloud-downloader.herokuapp.com/getSound?link=" + link.replace("https", "http") + "&artist=" + artist + "&title=" + title + "&genre=" + genre + "&album=" + album + "&album_art=" + art;
    var win = window.open(download_link, '_blank');
    return false;
}

function setModalValues(link, artist, title, album, genre, art) {
    $("#song-header-title").html(artist + " - " + title);
    $("#song-header-title").attr('name', link);
    $("#song-input-title").val(title);
    $("#song-input-artist").val(artist);
    $("#song-input-genre").val(genre);
    $("#song-input-album").val(album);
    $("#song-input-art").val(art);
    $("#song-album-art").attr('src', art);
}

function getModalValues() {
    var data = {};
    data.link = $("#song-header-title").attr('name');
    data.title = $("#song-input-title").val();
    data.artist = $("#song-input-artist").val();
    data.genre = $("#song-input-genre").val();
    data.album = $("#song-input-album").val();
    data.art = $("#song-input-art").val();
    return data;
}

function populateForm(element) {
    var songListing = $(element).parent().parent().parent().parent().parent().parent().parent().parent().parent();
    var clientId = "pPmFkm7w8XvU1oRdViIbG2nMmhimho6K";
    var title, artist, genre, art, link;

    link = "https://soundcloud.com" + $(songListing).find(".soundTitle__title").attr('href');

    modal.open();

    $.ajax({
        url: "https://api.soundcloud.com/resolve.json?url=" + encodeURIComponent(link) + "&client_id=" + encodeURIComponent(clientId),
        method: "GET"
    }).done(function (data) {
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

        title = data.title;
        artist = data.user.username;
        genre = data.genre;
        art = data.artwork_url.replace("large", "t500x500");

        console.log(artist + " - " + title + " >> " + genre + " >> " + art);

        setModalValues(link, artist, title, title, genre, art);
    });
}

function addButton(sound) {
    var buttonContainer = sound.find(".sc-button-group")[0];
    $(buttonContainer).append('<button class="sc-ext-download sc-button sc-button-download sc-button-small sc-button-responsive">Download</button>');
    var newButton = sound.find(".sc-ext-download");
    newButton.click(function () {
        return populateForm(this);
    });
}

function updateSounds() {
    $(".sound").each(function (i, obj) {
        if ($(obj).find(".sc-ext-download").length == 0) {
            addButton($(obj));
        }
    });
}

updateSounds();

$(document).on("DOMNodeRemoved", function (a) {
    $("#content").each(function (a, b) {
        setTimeout(function () {
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

$(document).on('confirmation', '.remodal', function () {
    var data = getModalValues();
    downloadSong(data.link, data.artist, data.title, data.genre, data.album, data.art);
});

$(document).on('opened', '.remodal', function () {
    $("body").css("padding-right", "0px");
    $("#song-input-art").off('input').on("input", function () {
        $("#song-album-art").attr('src', $("#song-input-art").val());
        console.log("change!");
    });
});

$(document).on('closing', '.remodal', function (e) {
    setModalValues("", "", "", "", "", "");
});