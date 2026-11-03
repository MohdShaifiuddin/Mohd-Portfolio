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
  ["instagram","facebook","linkedin","youtube","email"].forEach(function(key){
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
  document.querySelectorAll(".reel-frame").forEach(function(frame){
    var rv = frame.querySelector("video"), rb = frame.querySelector(".reel-play");
    if(!rv) return;
    if(rb) rb.addEventListener("click", function(){ var p = rv.play(); if(p && p.catch) p.catch(function(){}); });
    rv.addEventListener("play", function(){ frame.classList.add("playing"); });
  });

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

  /* ---- platform showreel tabs ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".pr-tab"));
  function selectTab(t, focus){
    tabs.forEach(function(o){
      var on = o === t, panel = document.getElementById(o.getAttribute("aria-controls"));
      o.setAttribute("aria-selected", on ? "true" : "false");
      o.tabIndex = on ? 0 : -1;
      if(panel){
        panel.hidden = !on;
        if(!on){ panel.querySelectorAll("video").forEach(function(v){ v.pause(); }); }
        else { panel.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("in"); }); }
      }
    });
    if(focus) t.focus();
  }
  tabs.forEach(function(t, i){
    t.addEventListener("click", function(){ selectTab(t); });
    t.addEventListener("keydown", function(e){
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if(d){ e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });

  /* ---- animated number counters ---- */
  function parseCount(s){
    var m = String(s).match(/^([\d,]*\.?\d+)\s*([KMB]?)(\+?)$/);
    if(!m) return null;
    var raw = m[1].replace(/,/g, "");
    return { n: parseFloat(raw), dec: (raw.split(".")[1] || "").length, comma: m[1].indexOf(",") > -1, suf: m[2] + m[3] };
  }
  function fmt(v, c){
    var s = v.toFixed(c.dec);
    if(c.comma){ s = Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
    return s + c.suf;
  }
  var counters = document.querySelectorAll("[data-count]");
  if("IntersectionObserver" in window && !reduce){
    var co = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        co.unobserve(en.target);
        var el = en.target, c = parseCount(el.getAttribute("data-count"));
        if(!c) return;
        var t0 = null, dur = 1400;
        function step(ts){
          if(!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = fmt(c.n * e, c);
          if(k < 1) requestAnimationFrame(step); else el.textContent = el.getAttribute("data-count");
        }
        el.textContent = fmt(0, c);
        requestAnimationFrame(step);
      });
    }, {threshold:0.4});
    counters.forEach(function(el){ co.observe(el); });
  }

  /* ---- gallery carousel ---- */
  document.querySelectorAll(".gal").forEach(function(gal){
    var track = gal.querySelector(".gal-track");
    var slides = Array.prototype.slice.call(track.querySelectorAll(".gal-slide"));
    var dotsBox = gal.querySelector(".gal-dots");
    var current = 0, timer = null, paused = false, visible = false;
    var delay = parseInt(gal.getAttribute("data-autoplay"), 10) || 0;
    var dots = slides.map(function(s, i){
      var d = document.createElement("button");
      d.type = "button"; d.className = "gal-dot"; d.setAttribute("aria-label", "Photo " + (i + 1));
      d.addEventListener("click", function(){ go(i); restart(); });
      dotsBox.appendChild(d); return d;
    });
    function setActive(i){
      current = i;
      dots.forEach(function(d, j){ d.classList.toggle("on", j === i); d.setAttribute("aria-current", j === i ? "true" : "false"); });
      slides.forEach(function(s, j){ s.classList.toggle("on", j === i); });
    }
    function go(i){
      i = (i + slides.length) % slides.length;
      var s = slides[i];
      var left = s.offsetLeft - (track.clientWidth - s.clientWidth) / 2;
      track.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
      setActive(i);
    }
    var raf = null;
    track.addEventListener("scroll", function(){
      if(raf) return;
      raf = requestAnimationFrame(function(){
        raf = null;
        var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bd = Infinity;
        slides.forEach(function(s, j){ var c = s.offsetLeft + s.clientWidth / 2, dd = Math.abs(c - mid); if(dd < bd){ bd = dd; best = j; } });
        if(best !== current) setActive(best);
      });
    }, {passive:true});
    gal.querySelector(".gal-prev").addEventListener("click", function(){ go(current - 1); restart(); });
    gal.querySelector(".gal-next").addEventListener("click", function(){ go(current + 1); restart(); });
    track.addEventListener("keydown", function(e){
      if(e.key === "ArrowRight"){ e.preventDefault(); go(current + 1); restart(); }
      if(e.key === "ArrowLeft"){ e.preventDefault(); go(current - 1); restart(); }
    });
    function tick(){ if(!paused && visible && !document.hidden) go(current + 1); }
    function restart(){ if(timer){ clearInterval(timer); timer = null; } if(delay && !reduce) timer = setInterval(tick, delay); }
    ["mouseenter","touchstart","focusin","pointerdown"].forEach(function(ev){ gal.addEventListener(ev, function(){ paused = true; }, {passive:true}); });
    ["mouseleave","focusout"].forEach(function(ev){ gal.addEventListener(ev, function(){ paused = false; }); });
    gal.addEventListener("touchend", function(){ setTimeout(function(){ paused = false; }, 5000); }, {passive:true});
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }, {threshold:0.35}).observe(gal);
    } else { visible = true; }
    setActive(0); restart();

    /* lightbox */
    var lb = document.getElementById("lightbox");
    if(!lb) return;
    var img = lb.querySelector(".lb-img"), count = lb.querySelector(".lb-count"), idx = 0, lastFocus = null;
    var buttons = slides.map(function(s){ return s.querySelector(".gal-open"); });
    function show(i){
      idx = (i + buttons.length) % buttons.length;
      var b = buttons[idx], th = b.querySelector("img");
      img.src = b.getAttribute("data-full"); img.alt = th ? th.alt : "";
      count.textContent = (idx + 1) + " / " + buttons.length;
    }
    function openLb(i){ lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; paused = true; lb.querySelector(".lb-close").focus(); }
    function closeLb(){ lb.hidden = true; document.body.style.overflow = ""; paused = false; img.removeAttribute("src"); if(lastFocus) lastFocus.focus(); }
    buttons.forEach(function(b, i){ b.addEventListener("click", function(){ openLb(i); }); });
    lb.querySelector(".lb-close").addEventListener("click", closeLb);
    lb.querySelector(".lb-prev").addEventListener("click", function(){ show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function(){ show(idx + 1); });
    lb.addEventListener("click", function(e){ if(e.target === lb) closeLb(); });
    document.addEventListener("keydown", function(e){
      if(lb.hidden) return;
      if(e.key === "Escape") closeLb();
      if(e.key === "ArrowRight") show(idx + 1);
      if(e.key === "ArrowLeft") show(idx - 1);
    });
    var sx = null;
    lb.addEventListener("touchstart", function(e){ sx = e.touches[0].clientX; }, {passive:true});
    lb.addEventListener("touchend", function(e){ if(sx === null) return; var dx = e.changedTouches[0].clientX - sx; if(Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1)); sx = null; }, {passive:true});
  });

  /* ---- staggered reveals inside grids ---- */
  document.querySelectorAll(".yt-grid, .svc-grid, .skill-grid, .social-grid, .timeline").forEach(function(g){
    Array.prototype.slice.call(g.querySelectorAll(".reveal")).forEach(function(el, i){ el.style.transitionDelay = (Math.min(i, 7) * 70) + "ms"; });
  });

  var yr = document.getElementById("year"); if(yr) yr.textContent = new Date().getFullYear();
})();
