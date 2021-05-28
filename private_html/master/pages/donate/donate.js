var wkCur_, ivFr_, frWtr_, ckWr_, ivFr_Doc, val_, ifSD_, storeId = "I1wxWgfpeUCfsIKSx9sqvLvdGXCKUqTKGt8EXDUkdZbsgouxUInNLrxQEyK1b3R6P0cAGhT6YFjNvd1V3RMTe6RwB6SDOay1eOdgDgLVSUXljlsI83QNOcZJDRdbnqnFnLhrwL87exLP9ymIgP0HMfeT59OiVApX4BROH4xV1G61KhkViIFXzrbfTPM73YObf6kUQODIyzqod778Ya62YYZ6elWIu1lksZsdggkcRneN5VqR4dHsClu75b3hHKXoPWzTHPgKbdf1YqdvlCgio4iG6lwZ9zDB2cCf4bAVFP3BRN7hRjaoDkLbAWg37iNYxN4rjaWpCp0zDPDHJUWGTY7l49hdU7YOoS2IuvFzRkAyti2uE8eurgUU2XRIV4Hb9SfA4AirZT2PMOWbxhzftomYYbpZgnMHagkHsAX80z70lwosOoufnjmNvErZNvTwP6buMVXcHI6FCv1ZOX4LqaM4GpLwMXhfjpFMqWZiBzxmWpZL574n3DEFVNgELd9z",
    storeURL = "money.flat18.co.uk/api/v1/invoices/";



function makeStripeInvoice() {

    document.getElementById("jsInvoiceWorkspacePre").style.display = "none", document.getElementById("statusButton").style.display = "block", wkCur_ = wkCur_ || "USD";
    var e = "USD";
    var v = val_ && val_ * 100 >= 100 ? parseFloat(val_ * 100) : 100;
    var sessionID;

    if (!document.getElementById('stripe_0')) {
        var script = document.createElement('script');
        script.id = 'stripe_0';
        script.src = 'https://js.stripe.com/v3/stripe.js';
        document.head.appendChild(script);
    }
    var t = new XMLHttpRequest;
    t.open("POST", "https://api.flat18.co.uk/payments/receive-stripe-payment.php"), t.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), t.onload = function () {
        200 === t.status && t.responseText.length < 1 ? console.log("error: " + t.responseText) : 200 !== t.status ? console.log("failed: " + t.status) : sessionID = JSON.parse(t.responseText).id;

        try {
            var stripe = Stripe('pk_live_co9p2inylaoTVrbvPoRq9F4i002DbGgUOK');
            stripe.redirectToCheckout({
                sessionId: sessionID
            }).then(function (result) { });
        } catch (e) {
            alert("Sorry. Let's start over. Please refresh this page.");
            window.location = "https://flat18.co.uk/donate";
        }


    }, t.send(encodeURI("v=" + v + "&c=" + wkCur_))


}

function genInvoice_(e) {
    if (document.getElementById("jsInvoiceWorkspacePre").style.display = "none", document.getElementById("statusButton").style.display = "block", wkCur_ = wkCur_ || "EUR", !ivFr_) {
        var t = val_ || 1;
        var d_typ = window.d_typ ? window.d_typ : "donation";
        d_typ = d_typ + "<?php $origin_. '|' .$origin; ?>";
        var d_det = window.psSes ? window.psSes : "N/A";
        var btcpay_wkCur_ = wkCur_ !== 'ttd' ? wkCur_ : 'usd';
        var t_ = wkCur_ !== 'ttd' ? t : t / 6.8;
        (ivFr_ = document.createElement("iframe")).style.border = "none", ivFr_.setAttribute("onLoad", "window.informOfProgress(event, this)"), ivFr_.setAttribute("srcdoc", '<!doctype html><html><body><form method="GET"  action="https://' + storeURL + '" style="width:0px;height:0px"><input type="hidden" name="store_id" value="' + storeId + '" /><input type="hidden" name="price" value="' + t_ + '" /><input type="hidden" name="browserRedirect" value="https://flat18.co.uk/thanks_for_your_support" /><input type="hidden" name="currency" value="' + btcpay_wkCur_ + '" /><input type="hidden" name="defaultLanguage" value="en" /><input type="hidden" name="orderId" value="' + d_typ + ' | ' + d_det + '" /><input type="image" src="" name="submit"></form></body></html>'), ivFr_.style.height = "0px", ivFr_.style.width = "0px", ivFr_.style.visibility = "hidden", document.getElementById("jsInvoiceWorkspace").appendChild(ivFr_)
    }
    watchFrameChange("btcpay")
}

function watchFrameChange(e, t) {
    var n = "btcpay" === e ? 1 : 0,
        o = "btcpay" === e ? 2 : 1;
    frWtr_ = setInterval(function () {
        var e = document.getElementById("jsInvoiceWorkspace").querySelector("iframe");
        ifSD_ == o && (clearInterval(frWtr_), setTimeout(function () {
            var n = t || 720;
            n = n >= screen.height * 0.8 ? screen.height * 0.8 : n;
            document.getElementById("jsInvoiceWorkspace").style.display = "block", document.getElementById("statusButton").style.display = "none", e.style.height = n + "px", document.getElementById("jsInvoiceWorkspace").style.height = n + "px", e.style.width = "100%", e.style.visibility = "visible"
        }, 300)), ifSD_ == n && (ckWr_ || (ivFr_Doc = e.contentDocument).querySelector("form") && (ivFr_Doc.querySelector("form").submit(), ckWr_ = 1))
    }, 500)
}

function startDonation() {
    document.getElementById("valueSelector").querySelector("input").value = 20;
    document.getElementById("valueSelector").querySelector(".currency_").selectedIndex = 0;
    val_ = document.getElementById("valueSelector").querySelector("input").value;
    wkCur_ = document.getElementById("valueSelector").querySelector(".currency_").value;
     document.getElementById("donationModuleMaster").style.display = "grid";
}

function cancelDonation(e) {
    document.getElementById("donationModuleMaster").style.display = "none", document.getElementById("statusButton").style.display = "none", document.getElementById("jsInvoiceWorkspacePre").style.display = "block", ivFr_ = void 0, ckWr_ = void 0, document.getElementById("jsInvoiceWorkspace").style.display = "none", document.getElementById("jsInvoiceWorkspace").innerHTML = "", ifSD_ = 0;
    var t = window.location.href.replace("/donate", "");
}

ifSD_ = 0,
    window.informOfProgress = function (e, t) {
    ifSD_++;
    try {
        "about:srcdoc" === t.contentWindow.location.href && ifSD_ >= 3 && (window.location = "/")
    } catch (e) {
        console.log(e)
    }
    ifSD_ >= 3 && cancelDonation(), console.log("Debug: frame stage: " + ifSD_)
}