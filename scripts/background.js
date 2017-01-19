function downloadSongChrome(url, name) {
    console.log(url);
    chrome.downloads.download({
        url: url,
        filename: name + ".mp3"
    });
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        downloadSongChrome(request.downloadLink, request.filename);
    });