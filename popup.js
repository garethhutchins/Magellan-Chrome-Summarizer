chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
      message.innerText = request.source;
    }
  });
  function update() {
    var sentences = document.querySelector('#demo');
    var ranger = document.querySelector('#myRange');
    var message = document.querySelector('#message');
    var summary = document.querySelector('#summary');
    var subjectivity = document.querySelector('#subjectivity');
    var tone = document.querySelector('#tone');
    sentences.innerText = ranger.value;
    var magellanResult = callMagellan(message,ranger,summary,subjectivity,tone);
  }
  function cleanXmlChars(input) {
    var NOT_SAFE_IN_XML_1_0 = /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm;
    return input.replace(NOT_SAFE_IN_XML_1_0, '');
};

  function callMagellan(content,ranger,summary,Subjectivity,tone) {
    var result = '';
    //Clean the Content
    var text = content.innerText;
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
    var URL = 'http://[Your TME URL]:40002/rs/';
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
      result = xmlDoc.getElementsByTagName("Summary")[0].textContent;
      console.log(result);
      summary.innerText = result;
      var DocLevels = xmlDoc.getElementsByTagName("DocumentLevel")[0];
      Subjectivity.innerText = DocLevels.getElementsByTagName("Subjectivity")[0].textContent;
      tone.innerText = DocLevels.getElementsByTagName("Tone")[0].textContent;
      console.log('Subjectivity' + Subjectivity);
      console.log('Tone' + tone);
      return result;
    })
  }

 
  
  function onWindowLoad() {
  
    var message = document.querySelector('#message');
    var sentences = document.querySelector('#demo');
    var ranger = document.querySelector('#myRange');
    var summary = document.querySelector('#summary');
    ranger.addEventListener("input",update);
    sentences.innerText = ranger.value;
    var subjectivity = document.querySelector('#subjectivity');
    var tone = document.querySelector('#tone');
    chrome.tabs.executeScript(null, {
      file: "getPagesSource.js"
    }, function() {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error
      if (chrome.runtime.lastError) {
        message.innerText = 'There was an error running the script : \n' + chrome.runtime.lastError.message;
      }
      else {
        var magellanResult = callMagellan(message,ranger,summary,subjectivity,tone);
      }
    });
  }
  
window.onload = onWindowLoad;







