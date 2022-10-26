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
    let theme = localStorage.getItem("theme") === "light" ? "dark" : "light"
    setTheme(theme)
})
if (localStorage) {
    let initialTheme = "dark"
    if (localStorage.getItem("theme")) {
        initialTheme = localStorage.getItem("theme")
    }
    setTheme(initialTheme)
} else {
    themeButton.style = "display:none;"
}

function setTheme(theme) {
    let themeButtonIcon = document.querySelector(".lightDark").querySelector(".ico")
    theme = theme ? theme : "dark"
    let class_ = theme === "light" ? "ico icon-moon" : "ico icon-sun"
    themeButtonIcon.setAttribute("class", class_)
    document.body.setAttribute("class", theme)
    setTimeout(() => {
        themeButtonIcon.classList.add("drop-in")
    }, 10)
    localStorage.setItem("theme", theme)
}
document.querySelectorAll(".animate-rotate").forEach((parent) => {
    let count = 0
    parent.querySelectorAll(".target").forEach((ele) => {
        ele.classList.remove("playing-animation")
        count = count < 5 ? 5 : count
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
    var thisID = t.getAttribute("id");
    var thisIcon = thisID + "Icon";

    function setCheck() {
        t.classList.add("isValid")
        t.classList.remove("isInvalid")
    }

    function setExclaim() {
        t.classList.add("isInvalid")
        t.classList.remove("isValid")
    }
    if (!fieldValue || fieldValue.length < 2) {
        setExclaim()
    } else {
        if (n === "name" || n === "message") {
            setCheck();
            if (n === "name") {
                saturatedContactFormArray.name = fieldValue
            }
            if (n === "message") {
                saturatedContactFormArray.message = btoa(fieldValue)
            }
        }
        if (n === "numb") {
            arrayOfDigits = [];
            for (i = 0; i < fieldValue.length; i++) {
                if (isNaN(parseInt(fieldValue[i])) === !1) {
                    arrayOfDigits.push(fieldValue[i])
                }
            }
            if (arrayOfDigits.length >= 7) {
                setCheck();
                arrayOfDigitsAsString = "";
                for (j = 0; j < arrayOfDigits.length; j++) {
                    arrayOfDigitsAsString += arrayOfDigits[j]
                }
                t.value = arrayOfDigitsAsString;
                saturatedContactFormArray.tel = arrayOfDigitsAsString
            } else {
                setExclaim()
            }
        }
        if (n === "email") {
            if (fieldValue.indexOf("@") > -1 && fieldValue.indexOf(".") > -1 && fieldValue.indexOf(".") != fieldValue.length - 1 && fieldValue.indexOf(" ") === -1) {
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
        t.parentNode.querySelector(".errorHelpForm").innerHTML = "You'll need to enter the information above to continue."
    }
}

function sendThisForm(f, t) {
    saturatedContactFormArray.typeOfForm = f;
    saturatedContactFormArray.token = window.psSes || "unavailable";
    t.style.display = "none";
    t.parentNode.querySelector(".errorHelpForm").innerHTML = "";
    t.parentNode.parentNode.querySelector(".workingForm").style.display = "block";
    fetch("https://api.flat18.co.uk/contact-form-handler/v2/index.php", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: JSON.stringify(saturatedContactFormArray),
    }).then((response) => { response.json() }).then((data) => {
        console.log("Success:", data);
        t.parentNode.querySelector(".errorHelpForm").innerHTML = "Thanks, " + saturatedContactFormArray.name + ` <i class="em em-wink"></i>`;
        t.style.display = "";
        t.parentNode.parentNode.querySelector(".workingForm").style.display = ""
    }).catch((error) => {
        console.error("Error:", error);
        t.parentNode.querySelector(".errorHelpForm").innerHTML = "Oops. Something went wrong.";
        t.style.display = "";
        t.parentNode.querySelector(".workingForm").style.display = ""
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
    fetch("https://api.flat18.co.uk/money/v2/exchange/").then(response => response.json()).then(data => {
        window.currencyRates = data.currencyRates
        updateCurrencyUI()
    }).catch((error) => {
        console.error("Error:", error)
    })
}

function pricingStrategy(price) {
    return price > 100 ? (Math.ceil(price / 100) * 100) - 1 : (Math.ceil(price / 10) * 10) - 1
}

function updateCurrencyUI(event) {
    window.currency = event ? event.target.innerHTML : "GBP";
    let currency = window.currency.toUpperCase();
    document.querySelectorAll(".currency-options").forEach((ele) => {
        for (const child of ele.children) {
            if (child.innerHTML !== currency) {
                child.classList.remove("selected")
            } else {
                child.classList.add("selected")
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
        let newValue = currency === "BTC" ? bitcoinValue : bitcoinValue * window.currencyRates[currency]
        if (!ele.querySelector(".currency-value").classList.contains("no-strategy")) {
            newValue = currency === "BTC" ? newValue : pricingStrategy(newValue)
        }
        ele.querySelector(".currency-value").innerHTML = currency === "BTC" ? newValue.toFixed(8) : Math.ceil(newValue).toLocaleString("gb");
        ele.querySelector(".currency-symbol").innerHTML = sym[currency]
    })
}


for (const ele of document.querySelectorAll(".clickable-target")) {
    ele.addEventListener("click", (e) => {
        if (!e.target.classList.contains("clicked")) {
            e.target.classList.add("clicked")
        }
    })
}



(function (factory) { if (typeof define === "function" && define.amd) { define(factory) } else if (typeof module !== "undefined" && module.exports) { module.exports = factory() } else { window.enterView = factory.call(this) } })((() => { const lib = ({ selector: selector, enter: enter = (() => { }), exit: exit = (() => { }), progress: progress = (() => { }), offset: offset = 0, once: once = false }) => { let raf = null; let ticking = false; let elements = []; let height = 0; function setupRaf() { raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) { return setTimeout(callback, 1e3 / 60) } } function getOffsetHeight() { if (offset && typeof offset === "number") { const fraction = Math.min(Math.max(0, offset), 1); return height - fraction * height } return height } function updateHeight() { const cH = document.documentElement.clientHeight; const wH = window.innerHeight || 0; height = Math.max(cH, wH) } function updateScroll() { ticking = false; const targetFromTop = getOffsetHeight(); elements = elements.filter((el => { const { top: top, bottom: bottom, height: height } = el.getBoundingClientRect(); const entered = top < targetFromTop; const exited = bottom < targetFromTop; if (entered && !el.__ev_entered) { enter(el); el.__ev_progress = 0; progress(el, el.__ev_progress); if (once) return false } else if (!entered && el.__ev_entered) { el.__ev_progress = 0; progress(el, el.__ev_progress); exit(el) } if (entered && !exited) { const delta = (targetFromTop - top) / height; el.__ev_progress = Math.min(1, Math.max(0, delta)); progress(el, el.__ev_progress) } if (entered && exited && el.__ev_progress !== 1) { el.__ev_progress = 1; progress(el, el.__ev_progress) } el.__ev_entered = entered; return true })); if (!elements.length) { window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", onResize, true); window.removeEventListener("load", onLoad, true) } } function onScroll() { if (!ticking) { ticking = true; raf(updateScroll) } } function onResize() { updateHeight(); updateScroll() } function onLoad() { updateHeight(); updateScroll() } function selectionToArray(selection) { const len = selection.length; const result = []; for (let i = 0; i < len; i += 1){ result.push(selection[i]) } return result } function selectAll(selector, parent = document) { if (typeof selector === "string") { return selectionToArray(parent.querySelectorAll(selector)) } else if (selector instanceof NodeList) { return selectionToArray(selector) } else if (selector instanceof Array) { return selector } } function setupElements() { elements = selectAll(selector) } function setupEvents() { window.addEventListener("resize", onResize, true); window.addEventListener("scroll", onScroll, true); window.addEventListener("load", onLoad, true); onResize() } function init() { if (!selector) { console.error("must pass a selector"); return false } setupElements(); if (!elements || !elements.length) { console.error("no selector elements found"); return false } setupRaf(); setupEvents(); updateScroll() } init() }; return lib }));


// build-in-scroll
for(const e of document.querySelectorAll(".build-in-scroll")){e.classList.add("build-in-scroll-active")}

enterView({
  selector: '.build-in-scroll-active',
  offset: 0.3,
  enter: function(el) {
   el.classList.add('build-in');
  },
//   exit: function(el) {
//    el.classList.remove('build-in');
//   },
 });