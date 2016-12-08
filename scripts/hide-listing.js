console.log("running...");
var listings = document.getElementsByClassName("soundList__item");


function deleteListing(element) {
    var songListing = element.parentNode.parentNode.parentNode.parentNode;
    songListing.parentNode.removeChild(songListing);
}

function downloadSong(element) {
    var songListing = element.parentNode.parentNode.parentNode.parentNode;
    var clientId = "pPmFkm7w8XvU1oRdViIbG2nMmhimho6K";
    var title, artist, genre, art, link;

    link = songListing.getElementsByClassName("soundTitle__title")[0].href;

    var xhr = new XMLHttpRequest();
    console.log(link);
    xhr.open('GET', "https://api.soundcloud.com/resolve.json?url=" + encodeURIComponent(link) + "&client_id=" + encodeURIComponent(clientId), false);
    xhr.send();

    if (xhr.responseText == "") {
        //scrape it
        console.log("This track does not work!");
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

for (var i = 0; i < listings.length; i++) {
    console.log(listings[i]);
    var titleBar = listings[i].getElementsByClassName("g-flex-row-centered")[0];
    var hideButton = document.createElement("a");
    hideButton.className = "fa fa-cloud-download ext-hideButton";
    hideButton.onclick = function () {
        return downloadSong(this);
    }
    titleBar.appendChild(hideButton);
}