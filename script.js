(function(){
  "use strict";
  var cfg = window.SITE_CONFIG || {};
  var doc = document.documentElement;
  doc.classList.remove("no-js");

  /* ---- contact + social links from site-config.js (empty = hidden) ---- */
  function waLink(){
    var n = String(cfg.whatsapp || "").replace(/\D/g, "");
    if(!n) return "";
    var msg = cfg.whatsappMessage ? "?text=" + encodeURIComponent(cfg.whatsappMessage) : "";
    return "https://wa.me/" + n + msg;
  }
  var wa = waLink();
  document.querySelectorAll(".js-wa").forEach(function(a){
    if(wa){ a.href = wa; } else { a.hidden = true; }
  });
  if(cfg.whatsappDisplay){
    document.querySelectorAll(".js-wa-text").forEach(function(a){ a.textContent = cfg.whatsappDisplay; });
  }
  ["instagram","facebook","youtube","email"].forEach(function(key){
    var val = String(cfg[key] || "").trim();
    document.querySelectorAll('[data-social="' + key + '"]').forEach(function(el){
      if(!val){ el.hidden = true; return; }
      if(key === "email"){
        el.href = "mailto:" + val;
        var t = el.querySelector(".js-email-text"); if(t) t.textContent = val;
      } else {
        el.href = /^https?:\/\//i.test(val) ? val : "https://" + val;
      }
      el.hidden = false;
    });
  });

  /* ---- hero intro ---- */
  var hero = document.querySelector(".hero");
  requestAnimationFrame(function(){ setTimeout(function(){ hero && hero.classList.add("ready"); }, 60); });

  var heroVid = document.querySelector(".hero-video");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(heroVid){
    if(reduce){ heroVid.removeAttribute("autoplay"); heroVid.pause(); }
    else { var p = heroVid.play(); if(p && p.catch) p.catch(function(){}); }
  }

  /* ---- running timecode ---- */
  var tc = document.getElementById("timecode");
  if(tc && !reduce){
    var start = performance.now();
    var pad = function(n){ return (n < 10 ? "0" : "") + n; };
    setInterval(function(){
      var t = (performance.now() - start) / 1000;
      var f = Math.floor((t % 1) * 25), s = Math.floor(t) % 60, m = Math.floor(t / 60) % 60, h = Math.floor(t / 3600);
      tc.textContent = pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
    }, 40);
  }

  /* ---- header + floating button ---- */
  var header = document.querySelector(".site-header");
  var fab = document.querySelector(".wa-float");
  function onScroll(){
    var y = window.scrollY || 0;
    header.classList.toggle("scrolled", y > 40);
    if(fab) fab.classList.toggle("show", y > window.innerHeight * 0.8);
  }
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

  /* ---- mobile menu ---- */
  var btn = document.getElementById("menuBtn"), nav = document.getElementById("nav");
  function setMenu(open){
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  btn.addEventListener("click", function(){ setMenu(!nav.classList.contains("open")); });
  nav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ setMenu(false); }); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") setMenu(false); });

  /* ---- scroll reveals ---- */
  var items = document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window && !reduce){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
    }, {rootMargin:"0px 0px -8% 0px", threshold:0.08});
    items.forEach(function(el){ io.observe(el); });
  } else {
    items.forEach(function(el){ el.classList.add("in"); });
  }

  /* ---- showreel play overlay ---- */
  var frame = document.querySelector(".reel-frame");
  if(frame){
    var rv = frame.querySelector("video"), rb = frame.querySelector(".reel-play");
    rb.addEventListener("click", function(){ rv.play(); });
    rv.addEventListener("play", function(){ frame.classList.add("playing"); });
  }

  /* ---- only one video plays at a time; pause when scrolled away ---- */
  var vids = document.querySelectorAll("main video:not(.hero-video)");
  vids.forEach(function(v){
    v.addEventListener("play", function(){ vids.forEach(function(o){ if(o !== v) o.pause(); }); });
  });
  if("IntersectionObserver" in window){
    var vo = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(!en.isIntersecting && !en.target.paused) en.target.pause(); });
    }, {threshold:0});
    vids.forEach(function(v){ vo.observe(v); });
  }


  /* ---- YouTube lite embeds: thumbnail first, iframe only on tap ---- */
  document.querySelectorAll(".yt-lite").forEach(function(b){
    b.addEventListener("click", function(){
      var id = b.getAttribute("data-yt");
      if(!/^[\w-]{11}$/.test(id)) return;
      vids.forEach(function(o){ o.pause(); });
      document.querySelectorAll(".yt-lite.on iframe").forEach(function(f){ var p = f.parentNode; p.classList.remove("on"); f.remove(); });
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&playsinline=1&rel=0&modestbranding=1";
      f.title = b.getAttribute("aria-label") || "YouTube video";
      f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.loading = "lazy";
      b.appendChild(f); b.classList.add("on");
    });
  });

  var yr = document.getElementById("year"); if(yr) yr.textContent = new Date().getFullYear();
})();
