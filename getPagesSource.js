function DOMtoString(document_root) {
   //Remove all of the hidden stuff
   var divs = document.getElementsByTagName("div");
   for (divx of divs) {
       if (divx.style.display === 'none') {
           var divId = divx.id;
           console.log(divId);
           var divR = document.getElementById(divId);
           console.log(divR);
           if (divR !== null) {
            divR.parentNode.removeChild(divR);
           }
           
       }
   }
    var allPs = document.getElementsByTagName("p");
    var rText = "";
    for (val of allPs) {
        if (val.style.display != 'none' || val.hidden != true) {
            rText += val.innerText + '. ';
        }
    }
    return rText;
    
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
})