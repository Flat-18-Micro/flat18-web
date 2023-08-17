// let TxtType = function (el, toRotate, period) {
//   this.toRotate = toRotate;
//   this.el = el;
//   this.loopNum = 0;
//   this.period = parseInt(period, 10) || 2000;
//   this.txt = '';
//   this.tick();
//   this.isDeleting = false;
// };
// TxtType.prototype.tick = function () {
//   let i = this.loopNum % this.toRotate.length;
//   let fullTxt = this.toRotate[i];
//   if (this.isDeleting) {
//     this.txt = fullTxt.substring(0, this.txt.length - 1);
//   } else {
//     this.txt = fullTxt.substring(0, this.txt.length + 1);
//   }
//   this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';
//   let that = this;
//   let delta = 200 - Math.random() * 100;
//   if (this.isDeleting) { delta /= 2; }
//   if (!this.isDeleting && this.txt === fullTxt) {
//     delta = fullTxt.length * 700
//     this.isDeleting = true;
//   } else if (this.isDeleting && this.txt === '') {
//     this.isDeleting = false;
//     this.loopNum++;
//     delta = 200;
//   }
//   setTimeout(function () {
//     that.tick();
//   }, delta);
// };
// let writers = document.querySelectorAll('.typewriter-magic');
// for (const write of writers) {
//   let toRotate = write.getAttribute('data-type');
//   let period = write.getAttribute('data-period');
//   if (toRotate) {
//     new TxtType(write, JSON.parse(toRotate), period);
//   }
// }
function getTranslateInitial() {
  const width = window.outerWidth >= 1200 ? (1200) : window.outerWidth
  return width * .08
}
// setTimeout(() => {
//   if (document.querySelector(".image-ddd")) {
//     document.querySelector(".image-ddd").style.setProperty("--translate-y", `${getTranslateInitial()}px`)
//     document.querySelector(".image-ddd").classList.add("initialised")
//   }
// }, 200)
// setTimeout(() => { document.querySelector(".initialised").classList.add("sped-up") }, 1000)

// enterView({
//   selector: '.image-ddd',
//   offset: 0.4,
//   enter: function (el) {
//     el.classList.remove("exited")
//     setTimeout(() => { el.classList.add("sped-up") }, 1000)
//   },
//   exit: function (el) {
//     el.classList.add("exited")
//   },
//   progress: function (el, progress) {
//     el.style.setProperty("--translate-y", `${getTranslateInitial() * (progress * 1.6)}px`)
//   }
// });

enterView({
  selector: '.zoom-in-out',
  offset: 0.35,
  enter: function (el) {
    el.classList.add('entered');
  },
  // exit: function (el) {
  //   el.classList.remove('entered');
  // },
  progress: function (el, progress) {
    let prog = Math.ceil(progress * 100)// / 1) * 1) / 100
    el.setAttribute("data-progress", progress.toFixed(2))
    // if (progress < .99) { el.classList.remove("exited") }
    if (el.classList.contains("laptop")) {
      let rotate = (-60 + (60 * Number(progress * 1.3)))
      rotate = rotate > 1 ? 1 : rotate
      let scale = 1.3 - (progress * .2)
      scale = scale <= 1.142 ? 1.142 : scale
      scale = window.outerWidth <= 960 ? scale * .9 : scale
      el.querySelector(".display").style.transform = `rotate3d(1,0,0,${rotate}deg)`
      el.querySelector(".display").setAttribute("class", `display at-position-${prog}`)
      el.querySelector(".laptop-body").style.transform = `scale(${scale})translateY(90%)`
    }
    if (el.classList.contains("inspired-16")) {
      let rotate = ((Number(progress.toFixed(2)) * 360) * .1).toFixed(3)
      el.style.setProperty("--l1-rotate", `${rotate}deg`)
      el.style.setProperty("--l2-rotate", `${rotate * .5}deg`)
      if (progress >= .5) {
      }
    }
  }
});

window.addEventListener("scroll", () => {
  const hero = document.querySelector(".hero")
  if (window.scrollY <= window.outerHeight) {
    const scrollCalc = Math.round(window.scrollY * .1)
    hero.style.setProperty('--transform-hero-scroll', scrollCalc + "px");
    hero.style.setProperty('--transform-hero-scroll-x2', scrollCalc * 2 + "px");
    // dddUIPlacement()
  }
})

// window.addEventListener("resize",()=>{dddUIPlacement()})

// function dddUIPlacement() {
//   const scrollCalc = Math.round(window.scrollY * .1)
//   const ddd = document.querySelector(".image-ddd")
//   ddd.style.setProperty("--translate-y", `${getTranslateInitial() + (scrollCalc * 2)}px`)
//   const halfHeight = window.outerHeight * .35
//   const opacity = window.scrollY >= (halfHeight) ? (1 - (window.scrollY - halfHeight) / halfHeight) : 1
//   ddd.style.setProperty("--opacity", `${opacity}`)
// }