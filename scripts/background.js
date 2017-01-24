function downloadSong(urlToSong, metadata) {
    console.log(metadata);
    var songXHR = new XMLHttpRequest();
    songXHR.open('GET', urlToSong, true);
    songXHR.responseType = 'arraybuffer';
    songXHR.onerror = function () {
        console.error('Network error getting song');
    };

    var albumXHR = new XMLHttpRequest();
    albumXHR.open('GET', metadata.art, true);
    albumXHR.responseType = 'arraybuffer';
    albumXHR.onerror = function () {
        console.error('Network error getting album cover');
    };

    var coverArrayBuffer;

    albumXHR.onload = function () {
        if (albumXHR.status === 200) {
            coverArrayBuffer = albumXHR.response;
            songXHR.send();
        } else {
            console.error(albumXHR.statusText + ' (' + albumXHR.status + ')');
        }
    };

    songXHR.onload = function () {
        if (songXHR.status === 200) {
            var arrayBuffer = songXHR.response;
            var writer = new ID3Writer(arrayBuffer);

            writer.setFrame('TIT2', metadata.title)
                .setFrame('TPE1', [metadata.artist])
                .setFrame('TALB', metadata.album)
                .setFrame('TCON', [metadata.genre])
                .setFrame('APIC', coverArrayBuffer);
            writer.addTag();
            var taggedSongBuffer = writer.arrayBuffer;
            var blob = writer.getBlob();
            var url = writer.getURL();

            var fileResultName = (metadata.artist + " - " + metadata.title).replace(/[\/:?*<>|.~`]/g, '');

            chrome.downloads.download({
                url: url,
                filename: fileResultName + '.mp3'
            });
        } else {
            console.error(songXHR.statusText + ' (' + songXHR.status + ')');
        }
    };

    albumXHR.send();
}

function downloadSongChrome(url, metadata) {
    downloadSong(url, metadata);
    return;
}


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        downloadSongChrome(request.downloadLink, request.metadata);
    });
