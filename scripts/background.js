console.log("running...");

function deleteListing(element) {
    var songListing = $(element).parent().parent().parent().parent();
    songListing.parent().remove(songListing);
}

function downloadSong(element) {
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
    var download_link = "https://soundcloud-downloader.herokuapp.com/getSound?link=" + link.replace("https", "http") + "&artist=" + artist + "&title=" + title + "&genre=" + genre + "&album=" + title + "&album_art=" + art;

    /*
    var downloadSong = new XMLHttpRequest();
    downloadSong.open('GET', "https://soundcloud-downloader.herokuapp.com/getSound?link=" + link.replace("https", "http") + "&artist=" + artist + "&title=" + title + "&genre=" + genre + "&album=" + title + "&album_art=" + art, false);
    downloadSong.send();
    */

    var win = window.open(download_link, '_blank');

    return false;
}

function addButton(sound) {
    var buttonContainer = sound.find(".sc-button-group")[0];
    $(buttonContainer).append('<button class="sc-ext-download sc-button sc-button-download sc-button-small sc-button-responsive">Download</button>');
    var newButton = sound.find(".sc-ext-download");
    newButton.click(function () {
        return downloadSong(this);
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

document.addEventListener('DOMContentLoaded', function () {
    getCurrentTabUrl(function (url) {
        document.body.innerHTML = url.split('/')[2];
        var webName = url.split('/')[2];
        if (webName === "soundcloud.com") {
            chrome.tabs.insertCSS(null, {
                file: "resources/ext-main.css"
            });
            chrome.tabs.insertCSS(null, {
                file: "resources/font-awesome.css"
            });
            chrome.tabs.executeScript(null, {
                file: "scripts/jquery.js"
            });
            chrome.tabs.executeScript(null, {
                file: "scripts/remodal.min.js"
            });

            $("body").append('<div data-remodal-id="modal">\
                                <button data-remodal-action="close" class="remodal-close"></button>\
                                  <h1>Remodal</h1>\
                                  <p>\
                                    Download\
                                  </p>\
                                </div>');

            var options = {};
            var modal = $('[data-remodal-id=modal]').remodal();
            modal.open();
        }
    });
    chrome.tabs.executeScript('console.log("' + webName + '");');
});