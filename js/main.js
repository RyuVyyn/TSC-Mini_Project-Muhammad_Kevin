(function () {
  "use strict";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- Hero spotlight (index.html) ---------- */

  var roster = document.getElementById("roster-list");
  var stage = document.getElementById("hero-stage");
  var art = document.getElementById("hero-art");
  var nameEl = document.getElementById("hero-name");
  var rolesEl = document.getElementById("hero-roles");
  var loreEl = document.getElementById("hero-lore");
  var abilitiesEl = document.getElementById("hero-abilities");
  var info = document.querySelector(".select__info");
  var hasData = typeof HEROES !== "undefined";

  function heroBySlug(slug) {
    for (var i = 0; i < HEROES.length; i++) {
      if (HEROES[i].slug === slug) {
        return HEROES[i];
      }
    }
    return null;
  }

  function abilitiesMarkup(hero) {
    return hero.abilities
      .map(function (ability) {
        var glyph = ability.icon
          ? '<img src="' + esc(ability.icon) + '" alt="" width="90" height="90" />'
          : "";
        return (
          '<li class="ability-icon">' +
          '<span class="ability-icon__glyph">' +
          glyph +
          "</span>" +
          '<span class="ability-icon__name">' +
          esc(ability.name) +
          "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  function renderHero(hero) {
    stage.style.setProperty("--accent", hero.accent || "#c9a227");
    art.src = hero.render;
    art.alt = hero.name + ", in-game render";
    nameEl.textContent = hero.name;
    rolesEl.innerHTML = hero.roles
      .map(function (role) {
        return "<li>" + esc(role) + "</li>";
      })
      .join("");
    loreEl.textContent = hero.summary || (hero.lore && hero.lore[0]) || "";
    abilitiesEl.innerHTML = abilitiesMarkup(hero);

    info.classList.remove("is-entering");
    void info.offsetWidth;
    info.classList.add("is-entering");
  }

  function setActiveTile(slug) {
    var tiles = roster.querySelectorAll(".hero-tile");
    for (var i = 0; i < tiles.length; i++) {
      var isTarget = tiles[i].dataset.slug === slug;
      tiles[i].classList.toggle("is-active", isTarget);
      tiles[i].setAttribute("aria-pressed", isTarget ? "true" : "false");
    }
  }

  function gridColumns() {
    var cols = getComputedStyle(roster).gridTemplateColumns;
    return cols && cols.indexOf(" ") !== -1 ? cols.split(" ").length : 1;
  }

  function moveFocus(step) {
    var tiles = Array.prototype.slice.call(roster.querySelectorAll(".hero-tile"));
    var idx = tiles.indexOf(document.activeElement);
    var cols = gridColumns();
    var next;

    if (idx === -1) {
      next = 0;
    } else if (step === "left") {
      next = idx - 1;
    } else if (step === "right") {
      next = idx + 1;
    } else if (step === "up") {
      next = idx - cols;
    } else {
      next = idx + cols;
    }

    if (next < 0 || next >= tiles.length) {
      return;
    }
    tiles[next].focus();
    selectHero(tiles[next].dataset.slug);
  }

  function selectHero(slug) {
    var hero = heroBySlug(slug);
    if (!hero) {
      return;
    }
    setActiveTile(slug);
    renderHero(hero);

    if (window.matchMedia("(max-width: 1000px)").matches) {
      stage.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setupRoster() {
    if (!roster || !stage || !hasData) {
      return;
    }

    roster.addEventListener("click", function (event) {
      var tile = event.target.closest(".hero-tile");
      if (tile) {
        selectHero(tile.dataset.slug);
      }
    });

    roster.addEventListener("keydown", function (event) {
      var map = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down"
      };
      if (map[event.key]) {
        event.preventDefault();
        moveFocus(map[event.key]);
      }
    });
  }

  /* ---------- Background music (both pages) ---------- */

  function setupBgm() {
    var bgm = document.getElementById("bgm");
    var toggle = document.getElementById("bgm-toggle");

    if (!bgm || !toggle) {
      return;
    }

    bgm.volume = 0.05;

    function start() {
      var attempt = bgm.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          /* autoplay blocked until the first user gesture */
        });
      }
    }

    function onFirstGesture(event) {
      if (!toggle.contains(event.target) && bgm.paused) {
        start();
      }
      document.removeEventListener("pointerdown", onFirstGesture);
      document.removeEventListener("keydown", onFirstGesture);
    }

    start();
    document.addEventListener("pointerdown", onFirstGesture);
    document.addEventListener("keydown", onFirstGesture);

    toggle.addEventListener("click", function () {
      if (bgm.paused) {
        start();
      } else {
        bgm.pause();
      }
    });

    bgm.addEventListener("play", function () {
      toggle.classList.add("is-playing");
      toggle.setAttribute("aria-pressed", "true");
    });

    bgm.addEventListener("pause", function () {
      toggle.classList.remove("is-playing");
      toggle.setAttribute("aria-pressed", "false");
    });

    bgm.addEventListener("error", function () {
      toggle.disabled = true;
      toggle.setAttribute("title", "Background music could not be loaded.");
    });
  }

  function init() {
    setupRoster();
    setupBgm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
