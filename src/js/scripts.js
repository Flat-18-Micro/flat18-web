window.addEventListener("chatwoot:ready", function () {
    document.querySelectorAll(".chat-trigger").forEach((ele) => {
        ele.removeAttribute("href")
        ele.addEventListener("click", () => {
            window.$chatwoot.toggle("open")
        })
        ele.classList.remove("chat-trigger")
    })
});
let themeButton = document.querySelector(".lightDark")
themeButton.addEventListener("click", () => {
    let theme = localStorage.getItem('theme') === 'light' ? 'dark' : 'light'
    setTheme(theme)
})
if (localStorage) {
    let initialTheme = 'dark'
    if (localStorage.getItem('theme')) {
        initialTheme = localStorage.getItem('theme')
    }
    setTheme(initialTheme)
} else {
    themeButton.style = "display:none;"
}

function setTheme(theme) {
    let themeButtonIcon = document.querySelector(".lightDark").querySelector('.ico')
    theme = theme ? theme : 'dark'
    let class_ = theme === 'light' ? 'ico icon-moon' : 'ico icon-sun'
    themeButtonIcon.setAttribute("class", class_)
    document.body.setAttribute('class', theme)
    setTimeout(() => {
        themeButtonIcon.classList.add("drop-in")
    }, 10)
    localStorage.setItem('theme', theme)
}
document.querySelectorAll(".animate-rotate").forEach((parent) => {
    let count = 0
    parent.querySelectorAll(".target").forEach((ele) => {
        ele.classList.remove("playing-animation")
        count = count<4?4:count
        setTimeout(() => { ele.classList.add("playing-animation") }, count * 1000)
        setTimeout(() => {
            setInterval(() => {
                ele.classList.remove("playing-animation")
                setTimeout(() => { ele.classList.add("playing-animation") }, 100)
            }, count * 2000)
        }, count * 2000)
        count++
    })


})


var saturatedContactFormArray = {};
document.querySelectorAll(".contact-form-input").forEach((ele) => {
    ele.addEventListener("input", (element) => {
        let type = element.target.getAttribute("data-type")
        validateField(element.target, type)
    })
})
function validateField(t, n) {
    var fieldValue = t.value;
    var thisID = t.getAttribute('id');
    var thisIcon = thisID + 'Icon';

    function setCheck() {
        t.classList.add('isValid'), t.classList.remove('isInvalid')
    }

    function setExclaim() {
        t.classList.add('isInvalid'), t.classList.remove('isValid')
    }
    if (!fieldValue || fieldValue.length < 2) {
        setExclaim()
    } else {
        if (n === 'name' || n === 'message') {
            setCheck();
            if (n === 'name') {
                saturatedContactFormArray.name = fieldValue
            }
            if (n === 'message') {
                saturatedContactFormArray.message = btoa(fieldValue)
            }
        }
        if (n === 'numb') {
            arrayOfDigits = [];
            for (i = 0; i < fieldValue.length; i++) {
                if (isNaN(parseInt(fieldValue[i])) === !1) {
                    arrayOfDigits.push(fieldValue[i])
                }
            }
            if (arrayOfDigits.length >= 7) {
                setCheck();
                arrayOfDigitsAsString = '';
                for (j = 0; j < arrayOfDigits.length; j++) {
                    arrayOfDigitsAsString += arrayOfDigits[j]
                }
                t.value = arrayOfDigitsAsString;
                saturatedContactFormArray.tel = arrayOfDigitsAsString
            } else {
                setExclaim()
            }
        }
        if (n === 'email') {
            if (fieldValue.indexOf('@') > -1 && fieldValue.indexOf('.') > -1 && fieldValue.indexOf('.') != fieldValue.length - 1 && fieldValue.indexOf(' ') === -1) {
                setCheck();
                saturatedContactFormArray.email = fieldValue;
                window.$chatwoot.setCustomAttributes({
                    email: fieldValue
                })
            } else {
                setExclaim()
            }
        }
    }
}

function infoTransformsToButton(t) {
    document.querySelectorAll(".contact-form-input").forEach((ele) => {
        let type = ele.getAttribute("data-type")
        validateField(ele, type)
    })
    dataSetSendForm(t)
}

function dataSetSendForm(t) {
    if (saturatedContactFormArray.name && saturatedContactFormArray.message && saturatedContactFormArray.tel && saturatedContactFormArray.email) {
        sendThisForm("contactForm", t)
    } else {
        t.parentNode.querySelector('.errorHelpForm').innerHTML = "You'll need to enter the information above to continue."
    }
}

function sendThisForm(f, t) {
    saturatedContactFormArray.typeOfForm = f;
    saturatedContactFormArray.token = window.psSes || "unavailable";
    t.style.display = "none";
    t.parentNode.querySelector('.errorHelpForm').innerHTML = "";
    t.parentNode.parentNode.querySelector('.workingForm').style.display = "block";
    fetch('https://api.flat18.co.uk/contact-form-handler/v2/index.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        body: JSON.stringify(saturatedContactFormArray),
    }).then(response => response.json()).then(data => {
        console.log('Success:', data);
        t.parentNode.querySelector('.errorHelpForm').innerHTML = 'Thanks, ' + saturatedContactFormArray.name + ' <i class="em em-wink"></i>';
        t.style.display = "";
        t.parentNode.parentNode.querySelector('.workingForm').style.display = ""
    }).catch((error) => {
        console.error('Error:', error);
        t.parentNode.querySelector('.errorHelpForm').innerHTML = "Oops. Something went wrong.";
        t.style.display = "";
        t.parentNode.querySelector('.workingForm').style.display = ""
    })
}
if (document.querySelectorAll(".currency-options").length > 0) {
    document.querySelectorAll(".currency-options").forEach((ele) => {
        for (const child of ele.children) {
            child.addEventListener("click", updateCurrencyUI)
        }
    })
    if (document.querySelectorAll(".currency-bundle").length > 0) {
        document.querySelectorAll(".currency-bundle").forEach((ele) => {
            ele.setAttribute("baseValue", ele.querySelector(".currency-value").innerHTML.replace(",", "").replace(" ", ""))
            ele.setAttribute("baseCurrency", "GBP")
        })
    }
    fetch('https://api.flat18.co.uk/money/v2/exchange/', {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        body: JSON.stringify([]),
    }).then(response => response.json()).then(data => {
        window.currencyRates = data.currencyRates
        updateCurrencyUI()
    }).catch((error) => {
        console.error('Error:', error)
    })
}

function pricingStrategy(price) {
    return price > 100 ? (Math.ceil(price / 100) * 100) - 1 : (Math.ceil(price / 10) * 10) - 1
}

function updateCurrencyUI(event) {
    window.currency = event ? event.target.innerHTML : 'GBP';
    let currency = window.currency.toUpperCase();
    document.querySelectorAll(".currency-options").forEach((ele) => {
        for (const child of ele.children) {
            if (child.innerHTML !== currency) {
                child.classList.remove('selected')
            } else {
                child.classList.add('selected')
            }
        }
    })
    var sym = {
        "BTC": "₿",
        "TTD": "TT$",
        "USD": "$",
        "GBP": "£",
        "EUR": "€"
    };
    document.querySelectorAll(".currency-bundle").forEach((ele) => {
        let value = Number(ele.getAttribute("baseValue"))
        let cur = ele.getAttribute("baseCurrency")
        let bitcoinValue = value / window.currencyRates[cur]
        let newValue = currency === 'BTC' ? bitcoinValue : bitcoinValue * window.currencyRates[currency]
        if (!ele.querySelector(".currency-value").classList.contains("no-strategy")) {
            newValue = currency === 'BTC' ? newValue : pricingStrategy(newValue)
        }
        ele.querySelector(".currency-value").innerHTML = currency === 'BTC' ? newValue.toFixed(8) : Math.ceil(newValue).toLocaleString("gb");
        ele.querySelector(".currency-symbol").innerHTML = sym[currency]
    })
}
