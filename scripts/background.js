function downloadSongChrome(url, name) {
    $.fileDownload(url)
        .done(function () {
            alert('File download a success!');
        })
        .fail(function () {
            alert('File download failed!');
        });

    return;
    chrome.downloads.download({
        url: url,
        filename: name + ".mp3"
    });
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        downloadSongChrome(request.downloadLink, request.filename);
    });