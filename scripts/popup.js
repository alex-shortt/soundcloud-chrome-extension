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

function trackEvent(category, action, label) {
    _gaq.push(['_trackEvent', category, action, label]);
}

document.addEventListener('DOMContentLoaded', function() {});

chrome.storage.local.get(["folder", "edit"], function(items) {
    $('#folder-check').prop('checked', items.folder);
    $('#edit-check').prop('checked', items.edit);
});


$("#follow-check").change(function() {
    trackEvent("popup", "follow", "" + $('#follow-check').is(':checked'));
    if ($('#follow-check').is(':checked'))
        chrome.tabs.create({
            url: 'https://soundcloud.com/alex_shortt'
        });
});

$("#folder-check").change(function() {
    console.log("hi");
    trackEvent("popup", "folder", "" + $('#folder-check').is(':checked'));
    chrome.storage.local.set({
        "folder": $('#folder-check').is(':checked')
    });
});

$("#edit-check").change(function() {
    trackEvent("popup", "edit", "" + $('#edit-check').is(':checked'));
    chrome.storage.local.set({
        "edit": $('#edit-check').is(':checked')
    });
});
