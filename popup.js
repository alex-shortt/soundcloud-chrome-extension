function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        var tab = tabs[0];
        var url = tab.url;
        console.assert(typeof url == 'string', 'tab.url should be a string');
        callback(url);
    });
}

function hideListing() {
    document.getElementsByClassName("soundTitle__title")[3].innerHTML = "test123";
}

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
                file: "scripts/hide-listing.js"
            });
        }
    });
    chrome.tabs.executeScript('console.log("' + webName + '");');
});