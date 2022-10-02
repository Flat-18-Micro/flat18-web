//LIVECHAT

// REDUNANDCY 
if (document.querySelectorAll("a").length > 0) {
  for (i = 0; i < document.querySelectorAll("a").length; i++) {
      var fn = document.querySelectorAll("a")[i].getAttribute("onclick");
      if (fn && fn.substring(0, 17) === "window.engageChat") {
          document.querySelectorAll("a")[i].classList.add("recoverable");
          if (typeof contactFormWarpMagic("test") !== "undefined") {
              // safe to use the function
              document.querySelectorAll("a")[i].removeAttribute("onclick");
              document.querySelectorAll("a")[i].setAttribute("onclick", "contactFormWarpMagic()");
          } else {
              document.querySelectorAll("a")[i].style.display = "none";
          }
      }
  }
}

var lcurl = 'https://api.flat18.co.uk/f18/php/publicLiveChat.php?owner=flat18.co.uk&webM='+window.webM;

fetch(lcurl)
  .then(function (response) {
      // When the page is loaded convert it to text
      return response.text()
  })
  .then(function (html) {
      // Initialize the DOM parser
      var parser = new DOMParser();
      // Parse the text
      var doc = parser.parseFromString(html, "text/html");
      // You can now even select part of that html as you would in the regular DOM 
      // Example:
      // var docArticle = doc.querySelector('article').innerHTML;
      console.log(doc);
      console.log("scripts", doc.querySelectorAll("script").length)

      var s = document.createElement("script");
      for (i = 0; i < doc.querySelectorAll("script").length; i++) {
          var t = doc.querySelectorAll("script")[i].innerHTML;
          s.append(t);
      }
      document.body.appendChild(doc.querySelectorAll("container")[0]);
      document.body.appendChild(eval(s));
      try { analyticsInit.resolve(true); }catch(e){}
  })
  .catch(function (err) {
  });

//END LIVECHAT

window.currency = function (c) {
  window.workingDisplayCurrency = !c ? 'gbp' : c;
  window.workingDisplayCurrency = window.workingDisplayCurrency.toUpperCase();
  var t = new XMLHttpRequest;
  if (!window.currencyRates) {
      t.open("POST", "https://api.flat18.co.uk/money/v1/exchange/"), t.onload = function () {
          if (200 === t.status && t.responseText.length < 1) { 
          } else {
              window.currencyRates = JSON.parse(t.responseText);
              exchangeCurrencues(c);
          }
      }, t.send();
  } else {
      exchangeCurrencues(c);
  }

  function exchangeCurrencues(c) {
      var displayMarkers = document.querySelectorAll('.discur_');
      var displayMarkersSymbols = document.querySelectorAll('.discur_s');
      var o = window.workingDisplayCurrency;
      var sym = { "BTC": "₿", "TTD": "TT$", "USD": "US$", "GBP": "£", "EUR": "€" };
      for (i = 0; i < displayMarkersSymbols.length; i++) { displayMarkersSymbols[i].innerText = sym[o]; }
      for (i = 0; i < displayMarkers.length; i++) {
          var f = !displayMarkers[i].getAttribute('cur_') ? 'gbp' : displayMarkers[i].getAttribute('cur_');
          f = f.toUpperCase();
          var v = isNaN(displayMarkers[i].innerText) ? 1 : Number(displayMarkers[i].innerText);
          !displayMarkers[i].hasAttribute("originalValue") && (displayMarkers[i].setAttribute("originalValue", v))

          v = displayMarkers[i].getAttribute("originalValue");
          if (f == o) {
              //DO NOTHING
          }
          var s = o != "BTC" ? 2 : 8;
          var r = window.currencyRates["GBP"];
          var b = window.currencyRates[o];
          var n = ((v / r) * b).toFixed(s);
          c == "btc" && (n = (v / window.currencyRates["GBP"]).toFixed(s))
          displayMarkers[i].setAttribute('cur_', c);
          displayMarkers[i].innerText = n;
      };
  }

  for (i = 0; i < document.querySelectorAll("." + c + "-price-selector").length; i++) {
      focus_(document.querySelectorAll("." + c + "-price-selector")[i]);
  }
}

function focus_(e) {
  var p = e.parentElement;
  var t = e.tagName;
  p.querySelectorAll(t).forEach(function (e) {
      e.classList.remove('focused');
  })
  e.classList.add('focused');
}

var saturatedContactFormArray = {};

function validateField(t, n) {
    var fieldValue = t.value;
    var thisID = t.getAttribute('id');
    var thisIcon = thisID + 'Icon';

    function setCheck() {
        t.classList.add('isValid'), t.classList.remove('isInvalid');
    }

    function setExclaim() {
        t.classList.add('isInvalid'), t.classList.remove('isValid');
    }



    if (!fieldValue || fieldValue.length < 2) { setExclaim(); } else {
        if (n === 'name' || n === 'message') {
            setCheck();
            if (n === 'name') { saturatedContactFormArray['name'] = fieldValue; }
            if (n === 'message') { saturatedContactFormArray['message'] = btoa(fieldValue); }
        }
        if (n === 'numb') {
            arrayOfDigits = [];
            for (i = 0; i < fieldValue.length; i++) {
                if (isNaN(parseInt(fieldValue[i])) === false) { arrayOfDigits.push(fieldValue[i]); }
            }
            if (arrayOfDigits.length >= 7) {
                setCheck();
                arrayOfDigitsAsString = '';
                for (j = 0; j < arrayOfDigits.length; j++) { arrayOfDigitsAsString += arrayOfDigits[j]; }
                t.value = arrayOfDigitsAsString;
                saturatedContactFormArray['tel'] = arrayOfDigitsAsString;
            } else {
                setExclaim();
            }
        }
        if (n === 'email') {
            if (fieldValue.indexOf('@') > -1 && fieldValue.indexOf('.') > -1 && fieldValue.indexOf(' ') === -1) {
                setCheck();
                saturatedContactFormArray['email'] = fieldValue;
            } else { setExclaim(); }
        }
    }
}

function infoTransformsToButton(t) {
    if (saturatedContactFormArray['name'] && saturatedContactFormArray['message'] && saturatedContactFormArray['tel'] && saturatedContactFormArray['email']) {
        sendThisForm("contactForm", t);
    } else {
        t.parentNode.querySelector('.errorHelpForm').innerHTML = "You'll need to enter the information above to continue.";
    }
}

function sendThisForm(f, t) {
    saturatedContactFormArray['typeOfForm'] = f;
    saturatedContactFormArray['token'] = window.psSes;
    t.style.display = "none";
    t.parentNode.querySelector('.errorHelpForm').innerHTML = "";
    t.parentNode.querySelector('.workingForm').style.display = "block";


    var n = new XMLHttpRequest();
    n.open('POST', 'https://api.flat18.co.uk/contact-form-handler/index.php', false);
    n.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    n.onload = function () {
        if (200 === n.status && n.responseText.length < 1) {
            console.log("success: " + n.responseText),
            t.parentNode.querySelector('.errorHelpForm').innerHTML = 'Thanks, ' + saturatedContactFormArray['name'] + ' <i class="em em-wink"></i>';
            t.style.display = "";
            t.parentNode.querySelector('.workingForm').style.display = "";
            try {
                var v = `Your message has been delivered. It's been sent here as well -just to be sure 😉<br><br>name:${saturatedContactFormArray["name"]}<br>tel:${saturatedContactFormArray["tel"]}<br>email:${saturatedContactFormArray["email"]}<br>message:<br><br>${atob(saturatedContactFormArray["message"])}`;
                var e = btoa(unescape(encodeURIComponent(v)));
                doSend(
                    JSON.stringify({ type: "newMessage", sendTo: [window.psSes], msg: e })
                );
            } catch (e) { console.error("unable to send form as socket message:", e) }
            setTimeout(function () {
                try { contactFormWarpMagic('reverse') } catch (e) { }
                window.engageChat();
            }, 3000);
        } else if (200 !== n.status) {
            t.parentNode.querySelector('.errorHelpForm').innerHTML = "Oops. Something went wrong.";
            t.style.display = "";
            t.parentNode.querySelector('.workingForm').style.display = "";
        }
    };
    n.send(JSON.stringify(saturatedContactFormArray));


}

function contactFormWarpMagic(e) {
    if (e === "test") { return true; }

    if (!document.getElementById("contactFormCopy")) {
        var c = document.createElement("div");
        c.setAttribute("id", "contactFormCopy");
        c.innerHTML = document.getElementById("cfParent").innerHTML.replace("display:none;", "");
        c.style.display = "none";
        document.body.append(c);
    }

    var t = document.getElementById("contactFormCopy");

    if ("reverse" !== e) {
        t.style.display = "";
        t.classList.add("contactFormWarpMagic");
        t.querySelector(".contactFormMiniEmbeded").querySelector(".hiddenTitle").style.display = "";
    }
    else {
        t.style.display = "none";
        t.classList.remove("contactFormWarpMagic");
        t.querySelector(".contactFormMiniEmbeded").querySelector(".hiddenTitle").style.display = "none";
    }
}



document.getElementById("MenuTrigger").addEventListener("click", toggleMenu)

function toggleMenu(){
  document.getElementById("MenuShortcuts").classList.contains("open") ? (document.getElementById("MenuShortcuts").classList.remove("open")) : (document.getElementById("MenuShortcuts").classList.add("open"))
}