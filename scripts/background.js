function downloadSong(urlToSong, metadata) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', urlToSong, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
        if (xhr.status === 200) {
            const arrayBuffer = xhr.response;
            const writer = new ID3Writer(arrayBuffer);
            writer.setFrame('TIT2', 'Home')
                .setFrame('TPE1', ['Eminem', '50 Cent'])
                .setFrame('TPE2', 'Eminem')
                .setFrame('TALB', 'Friday Night Lights')
                .setFrame('TYER', 2004)
            writer.addTag();
            const taggedSongBuffer = writer.arrayBuffer;
            const blob = writer.getBlob();
            const url = writer.getURL();
            
            chrome.downloads.download({
                url: url,
                filename: 'song with tags.mp3'
            });
        } else {
            // handle error
            console.error(xhr.statusText + ' (' + xhr.status + ')');
        }
    };
    xhr.onerror = function () {
        // handle error
        console.error('Network error');
    };
    xhr.send();
}

function downloadSongChrome(url, metadata) {
    downloadSong(url, metatdata);
    return;
}


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        downloadSongChrome(request.downloadLink, request.metadata);
    });