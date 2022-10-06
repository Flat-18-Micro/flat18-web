function maximiseTile(e) {
  e.stopPropagation();
  let t = e.target.parentNode.parentNode;
  0 == t.parentNode.parentNode.querySelectorAll(".open").length && (t.parentNode.classList.add("open"), positionTileInternals(t), document.querySelector(".project-showcase-workspace").scrollIntoView({
      behavior: "smooth",
      block: "start"
  }), setTimeout(() => {
      let e = 0;
      document.querySelectorAll(".showcase-tile").forEach(t => {
          e > 0 && e++, e >= 2 && t.classList.add("absolute"), t.classList.contains("open") ? (e++, document.querySelector(".project-showcase-workspace").style.height = t.querySelector(".tile-internals").getBoundingClientRect().height + "px") : t.classList.add("invisible")
      })
  }, 600), document.querySelector(".woot-widget-bubble").classList.add("shove-across"))
}

function minimiseTile() {
  event.target && event.stopPropagation(), clearTimeout(window.repositionTileInternals), document.querySelector(".project-showcase-workspace").removeAttribute("style");
  let e = !1;
  document.querySelectorAll(".showcase-tile").forEach(t => {
      t.classList.contains("open") && (e = t.querySelector(".tile-internals"))
  }), e && (e.parentNode.classList.remove("open"), e.style.transform = "translate(0,0)", e.style["margin-bottom"] = "auto"), setTimeout(() => {
      e && (e.parentNode.style["z-index"] = 2, e.removeAttribute("style"))
  }, 600), document.querySelectorAll(".showcase-tile").forEach(e => {
      e.classList.remove("invisible"), e.classList.remove("absolute")
  }), document.querySelector(".woot-widget-bubble").classList.remove("shove-across")
}

function positionTileInternals(e) {
  let t = document.querySelector(".project-showcase-workspace");
  e.parentNode.style["z-index"] = 9;
  let o = document.querySelector(".main").getBoundingClientRect().width <= 960 ? 0 : t.getBoundingClientRect().left,
      s = t.getBoundingClientRect().top,
      l = e.getBoundingClientRect().left,
      c = e.getBoundingClientRect().top,
      n = o - l,
      r = s - c;
  e.style.transform = `translate(${n}px,${r}px)`, e.style["margin-bottom"] = document.querySelector(".project-showcase-workspace").style.height <= e.getBoundingClientRect().height ? "0px" : `${n}px`
}

document.querySelectorAll(".showcase-tile").forEach(e => {
  e.addEventListener("click", maximiseTile)
})

document.querySelectorAll(".close-x").forEach(e => {
  e.addEventListener("click", minimiseTile)
})

document.querySelectorAll(".stop").forEach(e => {
  e.addEventListener("click", e => {
      e.stopPropagation()
  })
})

document.body.addEventListener("click", minimiseTile);



function showcaseYScrollManipulation() {
  let transition = (window.scrollY - document.querySelector(".showcase").clientTop) / window.outerHeight * .5
  document.querySelector(".showcase-slider > input").value = 100 * transition
  let showcaseTranslateBy = (document.querySelector(".showcase").scrollWidth - document.querySelector(".showcase-parent").getBoundingClientRect().width) * transition
  document.querySelector(".showcase").scrollLeft = showcaseTranslateBy
  let dots = document.querySelector(".slider-ui").querySelectorAll(".dot")
  let breakPoint = 1 / dots.length
  let nearest = Math.ceil(transition / breakPoint)
  let scale = nearest - (transition / breakPoint)
  dots.forEach((ele) => ele.style.transform = "scale(1)")
  try { dots[nearest].style.transform = "scale(" + (1 + (scale)) + ")" }catch(e){}
  // try { dots[nearest + 1].style.transform = "scale("+ (1+(1-scale)) +")" }catch(e){}
  // try { dots[nearest - 1].style.transform = "scale("+ (1+(1-scale)) +")" }catch(e){}
  // try { dots[nearest - 1].style.transform = "scale("+ (1+(scale*.25)) +")" }catch(e){}
  // try { dots[nearest + 1].style.transform = "scale("+ (1+(scale*.25)) +")" }catch(e){}
}

function manipulateElements(transition) {
  showcaseTranslateBy = (document.querySelector(".showcase").scrollWidth - document.querySelector(".showcase-parent").getBoundingClientRect().width) * transition,
  document.querySelector(".showcase").scrollLeft = showcaseTranslateBy
  // document.querySelector(".slider-ui").querySelector(".blob").style.transform="translateX(calc(" + transition*document.querySelector(".slider-ui").getBoundingClientRect().width + "px - 1rem))"
}

window.addEventListener("scroll", showcaseYScrollManipulation)

document.querySelector(".showcase").addEventListener("scroll", e => {
  let t = document.querySelector(".showcase").scrollLeft / (document.querySelector(".showcase").scrollWidth - document.querySelector(".showcase-parent").getBoundingClientRect().width);
  document.querySelector(".showcase-slider > input").value = t * 100
  // document.querySelector(".slider-ui").querySelector(".blob").style.transform="translateX(calc(" + t*document.querySelector(".slider-ui").getBoundingClientRect().width + "px - 1rem))"
})

document.querySelector(".showcase-slider > input").value = 50, document.querySelector(".showcase-slider > input").addEventListener("input", e => {
  if ("INPUT" === e.target.nodeName) {
      window.removeEventListener("scroll", showcaseYScrollManipulation);
      let t = Number(e.target.value) / 100;
      manipulateElements(t)
  }
})

if (document.querySelectorAll(".showcase").length > 0 && document.querySelectorAll(".slider-ui").length > 0) {
  let items = document.querySelector(".showcase").querySelectorAll(".item")
  for (i = 0; i < items.length; i++){
      let dot = document.createElement("span")
      dot.classList.add("dot")
      document.querySelector(".slider-ui").append(dot)
  }
}
