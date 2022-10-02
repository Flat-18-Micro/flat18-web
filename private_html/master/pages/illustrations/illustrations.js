document.querySelectorAll(".album").forEach(function (e) {
  var first = false;
  e.querySelector(".other-shots").querySelectorAll("img").forEach(function (i) {
    !first && (first = i.getAttribute("src"));
    i.addEventListener("click", function (v) {
      v.currentTarget.parentNode.parentNode.querySelector(".on-show").innerHTML=`<img src="${v.currentTarget.getAttribute("src")}">`;
    })
  })
  e.querySelector(".on-show").innerHTML = `<img src="${first}">`;
})