var distance = 0;

console.log("running...");

function deleteListing(element) {
    var songListing = $(element).parent().parent().parent().parent();
    songListing.parent().remove(songListing);
}

function downloadSong(element) {
    var songListing = $(element).parent().parent().parent().parent();
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

function updateSounds(offset) {
    var sounds = $(".sound").each(function (i, obj) {
        if (i > offset - 1) {
            distance++;
            var titleBar = $(obj).find(".g-flex-row-centered");
            var hideButton = $("<a>", {
                class: "fa fa-cloud-download ext-hideButton"
            });
            hideButton.click(function () {
                return downloadSong(this);
            });
            titleBar.append(hideButton);
            console.log("added download: " + i);
        }
    });
}

updateSounds(0);

$(document).on("DOMNodeRemoved", function (a) {
    $("#content").each(function (a, b) {
        setTimeout(function () {
            if ($(".sound").length > distance) {
                updateSounds(distance);
                console.log("add download button 7");
            }
        }, 5)
    })
});