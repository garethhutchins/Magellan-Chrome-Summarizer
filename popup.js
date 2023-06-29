
  function update() {
    console.log("Call Update")
    executeStuff()
  }
  function cleanXmlChars(input) {
    var NOT_SAFE_IN_XML_1_0 = /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm;
    return input.replace(NOT_SAFE_IN_XML_1_0, '');
};

  function callMagellan(content,ranger,summary,Subjectivity,tone) {
    var retSummary = '';
    //Clean the Content
    var text = content;
    text = cleanXmlChars(text);
    text = text.replace(/[\n\r]+/g, ' ');
    text = text.replace(/&/g,"&amp;");
    text = text.replace(/</g,"&lt;");
    text = text.replace(/>/g,"&gt;");
    text = text.replace(/"/g,"&quot;");
    text = text.replace(/'/g,"&apos;");
    text = text.replace(/\[\d*\]/g, ' ');
    text = text.replace( /\.(?=[^\d])[ ]*/g , '. ')
    //Now create the request
    var command = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><Nserver><ResultEncoding>UTF-8</ResultEncoding><TextID>summarizer</TextID><NSTEIN_Text>";
    command = command + text;
    //Say we're looking for # sentences
    command = command + "</NSTEIN_Text><LanguageID>ENGLISH</LanguageID><Methods><nsummarizer><NbSentences>" + ranger.value + "</NbSentences><KBid>IPTC</KBid></nsummarizer><NSentiment></NSentiment></Methods></Nserver>";
    //now do the post

    var URL = 'http://otca-demo.eastus2.cloudapp.azure.com:40002/rs/';
    //var result = "";
    fetch(URL, {
      method: "POST",
      body : command,
      headers : {"Content-Type" : "application/xml"},
    })
    .then(function(res) {
      if (res.ok) { // ok if status is 2xx
        console.log('OK ' + res.statusText);
      } else {
        console.log('Request failed.  Returned status of ' + res.status);
      }
      return res.text()
    })
    .then(function(text) {
      parser = new DOMParser();
      var xmlDoc = parser.parseFromString(text,"text/xml");
      retSummary = xmlDoc.getElementsByTagName("Summary")[0].textContent;
      console.log(retSummary);
      summary.innerText = retSummary;
      var DocLevels = xmlDoc.getElementsByTagName("DocumentLevel")[0];
      Subjectivity.innerText = DocLevels.getElementsByTagName("Subjectivity")[0].textContent;
      tone.innerText = DocLevels.getElementsByTagName("Tone")[0].textContent;
      console.log('Subjectivity' + Subjectivity);
      console.log('Tone' + tone);
      return retSummary;
    })
  }

  function DOMtoString() {
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
  
  function onWindowLoad() {
    console.log("Window Load")
    executeStuff()
  }
  function executeStuff () {
    var sentences = document.querySelector('#demo');
    var ranger = document.querySelector('#myRange');
    var summary = document.querySelector('#summary');
    ranger.addEventListener("input",update);
    sentences.innerText = ranger.value;
    var subjectivity = document.querySelector('#subjectivity');
    var tone = document.querySelector('#tone');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("Execute Script");
      chrome.scripting.executeScript({
      target : { tabId : tabs[0].id},
      func : DOMtoString
    }, (result)=> {
      var message = result[0].result
      //console.log("Text from Page " + message)
      var magellanResult = callMagellan(message,ranger,summary,subjectivity,tone);
      //console.log("Recv result = " + result[0].result);
    })});
   
  }
  
window.onload = onWindowLoad;







