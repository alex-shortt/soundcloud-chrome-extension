console.log("Running Script...");

$(window).ready(function () {
    console.log(document);
    console.log($('.soundList__item'));
    var length = $('.soundList__item').length;
    console.log(length);
    if (length > 0) {
        console.log("detected list page");
    } else if (length > 0) {
        console.log("badge list page");
    } else
        console.log(length);
});