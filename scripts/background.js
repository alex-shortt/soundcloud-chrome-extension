var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-97408879-2']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

function downloadSong(urlToSong, metadata) {
    console.log(metadata);
    var songXHR = new XMLHttpRequest();
    songXHR.open('GET', urlToSong, true);
    songXHR.responseType = 'arraybuffer';
    songXHR.onerror = function() {
        console.error('Network error getting song');
    };


    var albumXHR = new XMLHttpRequest();
    albumXHR.open('GET', metadata.art, true);
    albumXHR.responseType = 'arraybuffer';
    albumXHR.onerror = function() {
        console.error('Network error getting album cover');
    };

    var coverArrayBuffer;

    albumXHR.onload = function() {
        if (albumXHR.status === 200) {
            coverArrayBuffer = albumXHR.response;
            songXHR.send();
        } else {
            console.error(albumXHR.statusText + ' (' + albumXHR.status + ')');
        }
    };

    songXHR.onload = function() {
        if (songXHR.status === 200) {
            var arrayBuffer = songXHR.response;
            var writer = new ID3Writer(arrayBuffer);

            writer.setFrame('TIT2', metadata.title)
                .setFrame('TPE1', [metadata.artist])
                .setFrame('TALB', metadata.album)
                .setFrame('TCON', [metadata.genre])
            if (coverArrayBuffer != null) {
                writer.setFrame('APIC', coverArrayBuffer);
            }
            writer.addTag();
            var taggedSongBuffer = writer.arrayBuffer;
            var blob = writer.getBlob();
            var url = writer.getURL();

            var fileResultName = (metadata.artist + " - " + metadata.title).replace(/[\/:?*<>|.~`]/g, '');

            const playlist = (metadata.playlist != null ? metadata.playlist.replace(/[\/:?*<>|.~`]/g, '') + "/" : "");

            chrome.storage.local.get(["folder"], function(items) {
                chrome.downloads.download({
                    url: url,
                    filename: (items.folder ? "SoundDown/" : "") + playlist + fileResultName + '.mp3'
                });
            });



        } else {
            console.error(songXHR.statusText + ' (' + songXHR.status + ')');
        }
    };

    if (metadata.art == "") {
        coverArrayBuffer = null;
        songXHR.send();
    } else {
        albumXHR.send();
    }
}

function downloadSongChrome(url, metadata) {
    downloadSong(url, metadata);
    return;
}


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message == "track") {
            _gaq.push(['_trackEvent', request.category, request.action, request.label]);
        } else {
            downloadSongChrome(request.downloadLink, request.metadata);
        }
    });
