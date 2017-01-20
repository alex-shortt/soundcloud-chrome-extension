function errorHandler(e) {
    var msg = '';

    switch (e.code) {
    case e.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
    case e.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
    case e.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
    case e.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
    case e.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
    default:
        msg = 'Unknown Error';
        break;
    };

    console.log('Error: ' + msg);
}

function onInitFs(fs) {
    console.log('Opened file system: ' + fs.name);
    fs.root.getFile('log.txt', {
        create: true,
        exclusive: true
    }, function (fileEntry) {

        console.log(fileEntry.isFile);
        console.log(fileEntry.name);
        console.log(fileEntry.fullPath);

    }, errorHandler);
}

//https://www.html5rocks.com/en/tutorials/file/filesystem/
window.webkitRequestFileSystem(window.TEMPORARY, 15 * 1024 * 1024 /*15MB*/ , onInitFs, errorHandler);

function downloadSongChrome(url, name) {

    var location = chrome.extension.getURL('/songs/');
    console.log("songs folder: " + location);
    chrome.downloads.download({
        url: url,
        filename: location + name + ".mp3"
    });
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        downloadSongChrome(request.downloadLink, request.filename);
    });