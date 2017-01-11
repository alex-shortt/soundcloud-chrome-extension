console.log("running...");
var modal;

function deleteListing(element) {
    var songListing = $(element).parent().parent().parent().parent();
    songListing.parent().remove(songListing);
}

function downloadSong(element) {
    var download_link = "https://soundcloud-downloader.herokuapp.com/getSound?link=" + link.replace("https", "http") + "&artist=" + artist + "&title=" + title + "&genre=" + genre + "&album=" + title + "&album_art=" + art;

    var win = window.open(download_link, '_blank');

    return false;
}

function populateForm(element) {
    var songListing = $(element).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent();
    console.log(songListing);
    var clientId = "pPmFkm7w8XvU1oRdViIbG2nMmhimho6K";
    var title, artist, genre, art, link;

    link = "https://soundcloud.com" + $(songListing).find(".soundTitle__title").attr('href');

    var xhr = new XMLHttpRequest();
    console.log(link);
    xhr.open('GET', "https://api.soundcloud.com/resolve.json?url=" + encodeURIComponent(link) + "&client_id=" + encodeURIComponent(clientId), false);
    xhr.send();

    if (xhr.responseText == "") {
        //figure this out later
        console.log("This api does not work for this track. Skipping...");
        /*
        title = $(songListing).find(".soundTitle__title").text();
        artist = $(songListing).find(".soundTitle__usernameText").text();
        genre = $(songListing).find(".soundTitle__tagContent").text();
        art = $(songListing).find(".sc-artwork").css('background-image').replace(/^url|[\(\)]/g, '').replace('200x200', '500x500');
        */
        return false;
    } else {
        var result = JSON.parse(xhr.responseText);
        console.log(result);

        title = result.title;
        artist = result.user.username;
        genre = result.genre;
        art = result.artwork_url.replace("large", "t500x500");
    }
    console.log(artist + " - " + title + " >> " + genre + " >> " + art);
    
    $("#song-header-title").html(title);
    
    $("#song-input-title").val(title);
    $("#song-input-title").addClass("active");
    $("#song-input-artist").addClass("active");
    $("#song-input-artist").val(artist);
    $("#song-input-genre").addClass("active");
    $("#song-input-genre").val(genre);
    $("#song-input-album").addClass("active");
    $("#song-input-album").val(title);

    modal.open();
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
            console.log("added download: " + i);
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

$("body").append('<div data-remodal-id="modal">\
                    <button data-remodal-action="close" class="remodal-close"></button>\
                    <h1 id="song-header-title">...</h1>\
                    <div class="song-form-wrapper">\
                        <form class="song-form">\
                            <div class="row">\
                                <div class="col-md-10 col-md-offset-1">\
                                    <input id="song-input-title" type="text" placeholder="Title" />\
                                </div>\
                            </div>\
                            <div class="row">\
                                <div class="col-md-10 col-md-offset-1">\
                                    <input id="song-input-artist" type="text" placeholder="Artist" />\
                                </div>\
                            </div>\
                            <div class="row">\
                                <div class="col-md-10 col-md-offset-1">\
                                    <input id="song-input-album" type="text" placeholder="Album" />\
                                </div>\
                            </div>\
                            <div class="row">\
                                <div class="col-md-10 col-md-offset-1">\
                                    <input id="song-input-genre" type="text" placeholder="Genre" />\
                                </div>\
                            </div>\
                            <div class="row">\
                                <div class="col-md-4 col-md-offset-2">\
                                    <button data-remodal-action="cancel" class="remodal-cancel">Cancel</button>\
                                </div>\
                                <div class="col-md-4">\
                                    <button data-remodal-action="confirm" class="remodal-confirm">Download</button>\
                                </div>\
                            </div>\
                        </form>\
                    </div>\
                </div>');

var options = {};
modal = $('[data-remodal-id=modal]').remodal();
$('.song-form-wrapper').foxholder({
    demo: 9
});