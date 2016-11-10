console.log("running...");
var listings = document.getElementsByClassName("soundList__item");


function testThis(element) {
    element.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(element.parentNode.parentNode.parentNode.parentNode);
}

for (var i = 0; i < listings.length; i++) {
    console.log(listings[i]);
    var titleBar = listings[i].getElementsByClassName("g-flex-row-centered")[0];
    var hideButton = document.createElement("a");
    hideButton.className = "fa fa-times ext-hideButton";
    hideButton.href = "#";
    hideButton.onclick = function () {
        testThis(this);
    }
    titleBar.appendChild(hideButton);
}


/*

    position: absolute;
    right: 0;
    top: 0;
    z-index: 0;
    
    in class="soundContext g-flex-row-centered  "
*/