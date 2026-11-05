"use strict";

(() => {
  let __scrollY = 0;
  let __normalScrollY = 0;
  const isDesktop = () => window.innerWidth >= 1024.98;
  const tabletBreak = 1024.98;
  const mobileBreak = 767.98;
  const mobileXSBreak = 360;
  const Mask = document.querySelector(".mask"),
    WindBody = document.body,
    HTML = document.documentElement;
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  const delay = (time, callback) => setTimeout(callback, time);

  const initOverviewCounters = () => {
    const stats = document.querySelector('.section-top-overview .overview-stats');
    if (!stats) return;

    const counters = Array.from(stats.querySelectorAll('.overview-value > span'))
      .map((element) => {
        const text = element.textContent.trim();
        const match = text.match(/^(\d[\d,]*)(\.\d+)?$/);
        if (!match) return null;

        const target = Number(`${match[1].replace(/,/g, '')}${match[2] || ''}`);
        const decimals = match[2] ? match[2].length - 1 : 0;
        return { element, text, target, decimals };
      })
      .filter(Boolean);

    if (!counters.length) return;

    let hasPlayed = false;
    const play = () => {
      if (hasPlayed) return;
      hasPlayed = true;

      counters.forEach(({ element, text, target, decimals }, index) => {
        const value = { current: 0 };
        gsap.fromTo(value, { current: 0 }, {
          current: target,
          duration: 1.8,
          delay: index * 0.12,
          ease: 'power2.out',
          onUpdate: () => {
            const rounded = value.current.toFixed(decimals);
            element.textContent = decimals
              ? rounded
              : Math.round(value.current).toLocaleString('en-US');
          },
          onComplete: () => { element.textContent = text; },
        });
      });
    };

    const overview = stats.closest('#section-overview');
    const checkActivePanel = () => {
      if (overview.classList.contains('is-active')) play();
    };
    window.addEventListener('slider:panel-change', checkActivePanel);
    checkActivePanel();

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: overview,
        start: 'top 65%',
        once: true,
        onEnter: play,
      });
    }
  };

  window.__APP_STATE__ = {
    observer: null,
  };

  const detectDevice = () => {
    const html = document.documentElement;

    const init = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const userAgent = navigator.userAgent.toLowerCase();
      const orientation = window.matchMedia("(orientation: portrait)").matches;

      html.classList.toggle("is-device-mac", userAgent.includes("mac"));
      html.classList.toggle("is-device-macos", userAgent.includes("mac"));
      html.classList.toggle("is-device-iphone", /iphone/.test(userAgent));
      html.classList.toggle("is-device-ipod", /ipod/.test(userAgent));
      html.classList.toggle("is-device-ipad", /ipad/.test(userAgent));
      html.classList.toggle(
        "is-device-ios",
        /(iphone|ipod|ipad)/.test(userAgent),
      );
      html.classList.toggle("is-device-android", userAgent.includes("android"));

      if (navigator.maxTouchPoints === 1 && !userAgent.includes("mobile")) {
        html.classList.add("is-device-emulation");
      } else {
        html.classList.remove("is-device-emulation");
      }

      if (
        (html.classList.contains("is-device-mac") ||
          html.classList.contains("is-device-ios") ||
          html.classList.contains("is-device-android")) &&
        navigator.maxTouchPoints >= 1
      ) {
        html.classList.add("is-device-touchable");
      } else {
        html.classList.remove("is-device-touchable");
      }

      if (window.innerWidth < mobileBreak) {
        if (window.screen.width < mobileXSBreak) {
          viewport?.setAttribute(
            "content",
            `width=${mobileXSBreak}, user-scalable=0`,
          );
        } else {
          viewport?.setAttribute(
            "content",
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
          );
        }
        html.classList.add("is-device-mobile");
        html.classList.remove("is-device-desktop", "is-device-tablet");
      } else {
        html.classList.add("is-device-desktop");
        html.classList.remove("is-device-mobile");

        if (
          (window.screen.width >= mobileBreak &&
            window.screen.width <= tabletBreak) ||
          (window.screen.width < mobileBreak &&
            window.screen.height >= mobileBreak &&
            !orientation)
        ) {
          html.classList.add("is-device-tablet");
        } else {
          html.classList.remove("is-device-tablet");
        }

        viewport?.setAttribute(
          "content",
          "width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=0",
        );
      }
    };

    window.addEventListener("load", init);
    window.addEventListener("resize", init);
    init();
  };

  const smoothScroll = () => {
    const header = document.querySelector(".header-common");
    const headerHeight = header ? header.offsetHeight : 0;

    const closeMenu = () => {
      document
        .querySelectorAll(".js-click")
        .forEach((el) => el.classList.remove("is-click-active"));

      document
        .querySelector(".header-common-navigation")
        ?.classList.remove("is-click-active");

      document.querySelector(".mask-common")?.classList.remove("is-active");

      freezeWindow(false);
    };

    document
      .querySelectorAll('a[href*="#"]:not([href="#"])')
      .forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          const id = this.hash.replace("#", "");
          const target = document.getElementById(id);
          if (!target) return;

          e.preventDefault();

          const targetPosition =
            target.getBoundingClientRect().top +
            window.pageYOffset;

          const currentScroll = window.pageYOffset;

          // Nếu đã gần vị trí thì chỉ đóng menu
          if (Math.abs(currentScroll - targetPosition) < 4) {
            closeMenu();
            return;
          }

          closeMenu();

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        });
      });
  };

  const app = () => {
    if (window.innerWidth < 1024.98) return;
    const isTablet = () => window.innerWidth < 1024.98;
    gsap.registerPlugin(Observer);

    const panels = Array.from(document.querySelectorAll(".panel"));
    const outers = panels.map((p) => p.querySelector(".group-central"));
    const inners = panels.map((p) => p.querySelector(".inner"));
    const images = panels.map((p) => p.querySelector(".group-bg"));
    const headings = panels.map((p) =>
      Array.from(p.querySelectorAll(".hero-title")).filter(
        (el) => !el.classList.contains("js-title-fade")
      )
    );
    const subs = panels.map((p) =>
      Array.from(p.querySelectorAll(".hero-sub")).filter(Boolean)
    );
    const stage = document.querySelector(".slider-stage");
    const navEl = document.getElementById("nav");
    const navItems = navEl ? navEl.querySelectorAll(".nav-item") : [];
    const headerLogo = document.getElementById("logo-primary");

    if (
      !headerLogo ||
      !stage ||
      !panels ||
      !outers ||
      !inners ||
      !images ||
      !headings ||
      !subs
    )
      return;

    const s = {
      cur: -1,
      lastPanel: 0,
      animating: false,
      active: true,
      switching: false,
      hidden: false,
      wheelLock: false,
      navLock: false,
      touchY: 0,
    };

    window.__APP_STATE__.sliderState = s;

    const updateLogo = (i) => {
      if (!headerLogo) return;
      const visible = isTablet() || i === 0;
      headerLogo.classList.toggle("is-visible", visible);
    };

    const SLIDER_COUNT = panels.length;

    const prepareNextPanel = (index) => {
      const next = panels[index + 1];
      if (next?.dataset.transition !== "simple") return;
      next.querySelectorAll("img").forEach((image) => {
        image.loading = "eager";
        image.decode?.().catch(() => { });
      });
    };

    const updateNav = (i) =>
      navItems.forEach((n, j) =>
        n.classList.toggle("active", j === i && j < SLIDER_COUNT)
      );

    const updateNavByTarget = (targetId) =>
      navItems.forEach((n) =>
        n.classList.toggle("active", n.dataset.target === targetId)
      );

    const showUI = () => {
      if (isTablet()) return;
      gsap.set(stage, {
        autoAlpha: 1,
        pointerEvents: "auto",
      });
    };

    const getOffset = (el, container) => {
      let top = 0;
      let current = el;
      while (current && current !== container) {
        top += current.offsetTop;
        current = current.offsetParent;
      }
      return top;
    };

    /* ---------------- NAV ---------------- */
    if (navItems.length) {
      navItems.forEach((item, idx) => {
        item.addEventListener("click", () => {
          if (s.navLock) return;

          if (isTablet()) {
            const target = document.getElementById(item.dataset.target);
            if (!target) return;
            target.scrollIntoView({
              behavior: "smooth",
            });
            return;
          }

          if (idx < SLIDER_COUNT) {
            if (!s.active) {
              s.navLock = true;
              relock(idx, () => (s.navLock = false));
            } else {
              if (s.animating) return;
              goto(idx, idx > s.cur ? 1 : -1);
            }
          } else {
            const target = document.getElementById(item.dataset.target);
            if (!target) return;

            s.navLock = true;
            updateNavByTarget(item.dataset.target);

            const normalScroll = document.querySelector(".normal-scroll");

            release(() => {
              if (normalScroll) {
                const y = getOffset(target, normalScroll);

                window.scrollTo({
                  top: y,
                  behavior: "smooth",
                });
              } else {
                target.scrollIntoView({
                  behavior: "smooth",
                });
              }

              setTimeout(() => (s.navLock = false), 1000);
            });
          }
        });
      });
    }

    /* ---------------- EXPLORE CTA ---------------- */
    const exploreBtn = document.querySelector(
      ".section-top-keyvisual .hero-sub, .section-overview-keyvisual .keyvisual-scroll, .section-top-keyvisual .keyvisual-scroll",
    );

    if (exploreBtn) {
      exploreBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (s.animating || s.navLock) return;

        const hash = (exploreBtn.getAttribute("href") || "").split("#")[1];
        if (!hash) return;

        if (isTablet()) {
          const target = document.getElementById(hash);
          if (!target) return;
          target.scrollIntoView({
            behavior: "smooth",
          });
          return;
        }

        const panelIndex = panels.findIndex((panel) => panel.id === hash);
        if (panelIndex < 0) return;

        if (!s.active) {
          s.navLock = true;
          relock(panelIndex, () => (s.navLock = false));
        } else {
          goto(panelIndex, panelIndex > s.cur ? 1 : -1);
        }
      });
    }

    const mobileLinks = document.querySelectorAll(
      ".navigation-menu .item-link"
    );

    if (mobileLinks.length) {
      mobileLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          const href = link.getAttribute("href") || "";
          const hash = href.split("#")[1];

          // If no hash, allow normal navigation
          if (!hash) {
            window.dispatchEvent(new CustomEvent("header:close-menu"));
            return;
          }

          e.preventDefault();

          const panelIndex = panels.findIndex((panel) => panel.id === hash);
          const navItem = Array.from(navItems).find(
            (item) => item.dataset.target === hash
          );
          if (!navItem && panelIndex < 0) return;

          window.dispatchEvent(new CustomEvent("header:close-menu"));

          setTimeout(() => {
            if (s.active) {
              observer?.enable();
            }

            if (panelIndex >= 0 && !s.active) {
              s.navLock = true;
              relock(panelIndex, () => (s.navLock = false));
            } else if (panelIndex >= 0 && !s.animating) {
              goto(panelIndex, panelIndex > s.cur ? 1 : -1);
            } else if (navItem) {
              navItem.click();
            }
          }, 550);
        });
      });
    }

    /* ---------------- GOTO ---------------- */
    const goto = (i, dir, cb) => {
      if (isTablet()) return;

      if (i >= panels.length) {
        s.animating = false;
        cb?.();
        return;
      }

      i = Math.max(i, 0);
      const d = dir === -1 ? -1 : 1;
      const same = i === s.cur;

      showUI();
      updateLogo(i);

      if (same) {
        gsap.set(panels[i], {
          autoAlpha: 1,
          zIndex: 1,
        });

        const sameTargets = [outers[i], inners[i], images[i]].filter(Boolean);
        if (sameTargets.length)
          gsap.set(sameTargets, {
            clearProps: "transform",
          });

        if (headings[i]?.length)
          headings[i].forEach((h) =>
            gsap.set(h, {
              autoAlpha: 1,
              yPercent: 0,
            })
          );
        if (subs[i]?.length)
          subs[i].forEach((sub) =>
            gsap.set(sub, {
              autoAlpha: 1,
              yPercent: 0,
            })
          );

        panels.forEach((p, idx) => p.classList.toggle("is-active", idx === i));
        s.animating = false;
        cb?.();
        return;
      }

      s.animating = true;
      const prev = s.cur;
      const simpleTransition = panels[i].dataset.transition === "simple" &&
        (prev < 0 || panels[prev].dataset.transition === "simple");

      if (simpleTransition) {
        // Move one composited wrapper; keep the masked/blurred scene stationary inside it.
        gsap.set(outers[i], { willChange: "transform", force3D: true });
        gsap.set([inners[i], images[i]].filter(Boolean), { yPercent: 0 });
      }

      const tl = gsap.timeline({
        defaults: {
          duration: simpleTransition ? 0.85 : 1.05,
          ease: "power1.inOut",
        },
        onStart: () => {
          gsap.set(panels[i], {
            autoAlpha: 1,
            zIndex: 1,
          });
          panels[i].classList.add("is-active");

          if (prev >= 0 && prev !== i) {
            setTimeout(() => {
              panels[prev].classList.remove("is-active");
            }, 500);
          }
        },
        onComplete: () => {
          s.animating = false;
          if (simpleTransition) {
            gsap.set(outers[i], { clearProps: "willChange" });
          }
          prepareNextPanel(i);
          panels.forEach((p, idx) => {
            if (idx !== i)
              gsap.set(p, {
                autoAlpha: 0,
                zIndex: 0,
              });
          });
          panels[i].querySelectorAll(".swiper").forEach((el) => {
            if (
              el.swiper &&
              !el.swiper.destroyed &&
              el.getClientRects().length
            ) {
              el.swiper.update();
            }
          });
          window.dispatchEvent(
            new CustomEvent("slider:panel-change", {
              detail: {
                index: i,
              },
            })
          );
          cb?.();
        },
      });

      if (prev >= 0) {
        gsap.set(panels[s.cur], {
          zIndex: 0,
        });

        if (images[s.cur] && !simpleTransition) {
          tl.to(
            images[s.cur], {
            yPercent: -14 * d,
          },
            0
          );
        }
      }

      const curTargets = (simpleTransition ? [outers[i]] : [outers[i], inners[i]]).filter(Boolean);
      if (curTargets.length) {
        tl.fromTo(
          curTargets, {
          yPercent: (j) => (j ? -100 * d : 100 * d),
          immediateRender: false,
        }, {
          yPercent: 0,
        },
          0
        );
      }

      if (images[i] && !simpleTransition) {
        tl.fromTo(
          images[i], {
          yPercent: 14 * d,
        }, {
          yPercent: 0,
        },
          0
        );
      }

      if (headings[i]?.length) {
        headings[i].forEach((h, j) => {
          tl.fromTo(
            h, {
            autoAlpha: 0,
            yPercent: (simpleTransition ? 60 : 200) * d,
          }, {
            autoAlpha: 1,
            yPercent: 0,
            duration: simpleTransition ? 0.6 : 0.9,
            ease: "power2.out",
          },
            // Near the top of a sliding panel, text is still offscreen early on.
            simpleTransition ? 0.55 + j * 0.06 : 0.18
          );
        });
      }

      if (subs[i]?.length) {
        subs[i].forEach((sub, j) => {
          tl.fromTo(
            sub, {
            autoAlpha: 0,
            yPercent: (simpleTransition ? 20 : 200) * d,
          }, {
            autoAlpha: 1,
            yPercent: 0,
            duration: simpleTransition ? 0.55 : 0.8,
            ease: "power2.out",
          },
            simpleTransition ? 0.65 + j * 0.06 : 0.28
          );
        });
      }

      s.cur = i;

      window.__APP_STATE__.goto = goto;

      /* Update dark bg for panel with .js-bg */
      const currentPanel = panels[i];
      if (currentPanel) {
        const isBg = currentPanel.classList.contains("js-bg");
        const isLocation = currentPanel.classList.contains("js-bg-2");
        document.documentElement.classList.toggle("is-dark-bg", isBg);
        document.documentElement.classList.toggle(
          "is-dark-bg-02",
          isBg && isLocation
        );
      }
    };

    /* ---------------- RELEASE ---------------- */
    const release = (onDone) => {
      if (!s.active) {
        onDone?.();
        return;
      }

      s.lastPanel = s.cur;
      s.active = false;
      observer?.disable();
      document.documentElement.classList.remove("is-dark-bg", "is-dark-bg-02");
      const normalScroll = document.querySelector(".normal-scroll");

      gsap.to(stage, {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power1.inOut",
        onComplete: () => {
          document.body.style.overflow = "";
          gsap.set(stage, {
            pointerEvents: "none",
            zIndex: -1,
          });

          window.scrollTo(0, 0);
          window.dispatchEvent(new Event("slider:released"));

          gsap.to(normalScroll, {
            autoAlpha: 1,
            duration: 0.5,
            onComplete: () => {
              onDone?.();
            },
          });
        },
      });
    };

    /* ---------------- RELOCK ---------------- */
    const relock = (targetPanel, onDone) => {
      if (isTablet()) return;
      if (s.active || s.switching) return;

      s.switching = true;
      const normalScroll = document.querySelector(".normal-scroll");

      const savedScrollTop = normalScroll ? normalScroll.scrollTop : 0;

      gsap.to(normalScroll, {
        autoAlpha: 0,
        duration: 0.6,
        onComplete: () => {
          document.body.style.overflow = "hidden";

          gsap.set(stage, {
            zIndex: "",
            pointerEvents: "auto",
            autoAlpha: 1,
          });

          const target = targetPanel ?? 0;

          panels.forEach((p, idx) => {
            gsap.set(p, {
              autoAlpha: idx === target ? 1 : 0,
              zIndex: idx === target ? 1 : 0,
            });
          });

          s.cur = target;
          s.active = true;
          s.switching = false;
          s.animating = false;
          panels.forEach((p, idx) =>
            p.classList.toggle("is-active", idx === target)
          );
          updateLogo(target);
          observer?.enable();
          onDone?.();
          window.dispatchEvent(
            new CustomEvent("slider:panel-change", {
              detail: {
                index: target,
              },
            })
          );

          setTimeout(() => {
            window.dispatchEvent(new Event("scroll"));
          }, 50);
        },
      });
    };

    /* ---------------- OBSERVER (DESKTOP ONLY) ---------------- */
    let observer = null;
    let panelListTarget = 0;
    let activeScrollList = null;

    const scrollPanelList = (direction, deltaY = 0) => {
      const panel = panels[s.cur];
      const list = panel?.querySelector(
        ".capability-list, .amenities-legend, .overview-content, .scale-content"
      );
      if (!list || list.scrollHeight <= list.clientHeight + 2) return false;

      if (activeScrollList !== list) {
        activeScrollList = list;
        panelListTarget = list.scrollTop;
      }

      const atTop = list.scrollTop <= 2;
      const atBottom =
        list.scrollTop + list.clientHeight >= list.scrollHeight - 2;

      const maxScroll = list.scrollHeight - list.clientHeight;
      const targetAtTop = panelListTarget <= 2;
      const targetAtBottom = panelListTarget >= maxScroll - 2;

      if (
        (direction < 0 && atTop && targetAtTop) ||
        (direction > 0 && atBottom && targetAtBottom)
      ) {
        return false;
      }

      const distance = Math.max(35, Math.min(Math.abs(deltaY) * 0.85, 160));
      panelListTarget = Math.max(
        0,
        Math.min(panelListTarget + direction * distance, maxScroll)
      );

      gsap.to(list, {
        scrollTop: panelListTarget,
        duration: 0.7,
        ease: "power3.out",
        overwrite: true,
      });
      return true;
    };

    const initObserver = () => {
      if (isTablet()) return;

      observer = Observer.create({
        type: "wheel,touch",
        ignore: ".masterplan-floor-picker",
        wheelSpeed: -1,
        tolerance: 14,
        preventDefault: true,

        onDown: (self) => {
          if (self.event?.type.startsWith('touch') && self.event.target?.closest?.('.regional-photos, .js-project-videos, .js-project-documents')) return;
          if (!s.animating && s.active && !s.switching) {
            const isAmenitiesTouch =
              self.event?.type.startsWith("touch") &&
              self.event.target?.closest?.(".amenities-legend");

            if (!isAmenitiesTouch && scrollPanelList(-1, self.deltaY)) return;
            goto(s.cur - 1, -1);
          }
        },

        onUp: (self) => {
          if (self.event?.type.startsWith('touch') && self.event.target?.closest?.('.regional-photos, .js-project-videos, .js-project-documents')) return;
          if (!s.animating && s.active && !s.switching) {
            const isAmenitiesTouch =
              self.event?.type.startsWith("touch") &&
              self.event.target?.closest?.(".amenities-legend");

            if (!isAmenitiesTouch && scrollPanelList(1, self.deltaY)) return;
            goto(s.cur + 1, 1);
          }
        },
      });

      window.__APP_STATE__.observer = observer;
    };

    /* ---------------- START ---------------- */
    if (!isTablet()) {
      const hash = window.location.hash?.replace("#", "");

      goto(0, 1, () => {
        if (!hash) return;

        // Bỏ qua hash tabs (tab1, tab2...) - xử lý bởi initTabsFromHash
        if (/^tab\d+$/.test(hash)) return;

        history.replaceState(null, "", window.location.pathname);

        const matchedPanelIndex = panels.findIndex(
          (panel) => panel.id === hash
        );
        const matchedNavItem = Array.from(navItems).find(
          (item) => item.dataset.target === hash
        );

        setTimeout(() => {
          if (matchedPanelIndex >= 0) {
            goto(matchedPanelIndex, matchedPanelIndex > s.cur ? 1 : -1);
          } else if (matchedNavItem) {
            matchedNavItem.click();
          } else {
            const target = document.getElementById(hash);
            if (!target) return;
            if (s.active) {
              release(() =>
                target.scrollIntoView({
                  behavior: "smooth",
                })
              );
            } else {
              target.scrollIntoView({
                behavior: "smooth",
              });
            }
          }
        }, 100);
      });

      initObserver();
    } else {
      gsap.set(stage, {
        clearProps: "all",
      });
      panels.forEach((p) =>
        gsap.set(p, {
          clearProps: "all",
        })
      );
    }

    if (navItems.length) {
      const sectionIds = Array.from(navItems)
        .map((n) => n.dataset.target)
        .filter(Boolean);

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      if (sections.length) {
        const scrollSections = sections.filter(
          (sec) => !sec.classList.contains("panel")
        );
        const bgSections = scrollSections.filter((sec) =>
          sec.classList.contains("js-bg")
        );

        const updateDarkBg = () => {
          if (window.__APP_STATE__?.sliderState?.active) {
            return;
          }
          const anyVisible = bgSections.some((sec) => {
            const rect = sec.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
          });
          document.documentElement.classList.toggle("is-dark-bg", anyVisible);
        };

        const updateNavOnScroll = () => {
          if (window.__APP_STATE__?.sliderState?.active) return;
          if (s.navLock) return;

          let best = null;
          let bestDist = Infinity;
          scrollSections.forEach((sec) => {
            const rect = sec.getBoundingClientRect();
            if (rect.bottom > 0) {
              const dist = Math.abs(rect.top);
              if (dist < bestDist) {
                bestDist = dist;
                best = sec;
              }
            }
          });
          if (best) updateNavByTarget(best.id);
        };

        window.addEventListener("scroll", updateDarkBg, {
          passive: true,
        });
        window.addEventListener("scroll", updateNavOnScroll, {
          passive: true,
        });

        const origRelease = release;
        window.addEventListener("slider:released", () => {
          setTimeout(() => {
            updateDarkBg();
            updateNavOnScroll();
          }, 650);
        });
      }
    }
  };

  const initDeveloperSliders = () => {
    const section = document.querySelector('.section-top-developer');
    if (!section || typeof Swiper === 'undefined') return;
    const options = {
      speed: 700,
      slidesPerView: 2,
      spaceBetween: 24,
      watchOverflow: true,
      grabCursor: true,
      autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
      breakpoints: { 768: { slidesPerView: 3, spaceBetween: 35 } },
    };
    const distributors = section.querySelector('.developer-distributor-logos');
    if (distributors && !distributors.swiper) {
      const wrapper = distributors.querySelector('.swiper-wrapper');
      const originals = [...wrapper.children];
      if (originals.length > 1) {
        while (wrapper.children.length < 14) originals.forEach(slide => wrapper.append(slide.cloneNode(true)));
      }
      new Swiper(distributors, {
        ...options,
        loop: originals.length > 1,
        navigation: {
          prevEl: section.querySelector('.developer-distributor-arrow.is-prev'),
          nextEl: section.querySelector('.developer-distributor-arrow.is-next'),
        },
        breakpoints: { ...options.breakpoints, 1025: { slidesPerView: 7, spaceBetween: 65 } },
      });
    }
    const partners = section.querySelector('.developer-partner-logos');
    const tablet = window.matchMedia('(max-width: 1024.98px)');
    const sync = () => {
      if (!partners) return;
      if (tablet.matches && !partners.swiper) new Swiper(partners, options);
      else if (!tablet.matches && partners.swiper) partners.swiper.destroy(true, true);
    };
    tablet.addEventListener('change', sync);
    sync();
  };

  const initTopGallery = () => {
    const section = document.querySelector('.section-top-gallery');
    if (!section) return;
    const tabs = [...section.querySelectorAll('.gallery-tab')];
    const panels = [...section.querySelectorAll('.gallery-panel')];
    const arrows = [...section.querySelectorAll('.gallery-arrow')];
    if (typeof Swiper === 'undefined') return;
    let current = 0;
    const sliders = [];
    const update = () => {
      const slider = sliders[current];
      if (!slider) return;
      arrows[0].disabled = slider.isLocked || (!slider.params.loop && slider.isBeginning);
      arrows[1].disabled = slider.isLocked || (!slider.params.loop && slider.isEnd);
    };
    panels.forEach(panel => {
      const track = panel.querySelector('.gallery-track');
      const wrapper = track.querySelector('.swiper-wrapper');
      const originals = [...wrapper.querySelectorAll('.swiper-slide')];
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      // Auto-width slides need enough items for both sides of the loop.
      const minimum = Math.max(8, Math.ceil(section.clientWidth / (3.4 * rem)) * 2 + 2);
      if (originals.length > 1) {
        while (wrapper.children.length < minimum) {
          originals.forEach(slide => wrapper.append(slide.cloneNode(true)));
        }
      }
      sliders.push(new Swiper(track, {
        slidesPerView: 'auto',
        spaceBetween: .3 * rem,
        loop: originals.length > 1,
        speed: 700,
        watchOverflow: true,
        on: { slideChange: update, reachBeginning: update, reachEnd: update, lock: update, unlock: update },
      }));
    });
    const resize = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      sliders.forEach(slider => {
        slider.params.spaceBetween = .3 * rem;
        slider.update();
      });
      update();
    };
    const select = index => {
      current = index;
      tabs.forEach((tab, i) => {
        tab.classList.toggle('is-active', i === index);
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        panels[i].classList.toggle('is-active', i === index);
        panels[i].setAttribute('aria-hidden', String(i !== index));
        panels[i].inert = i !== index;
      });
      sliders[index].update();
      update();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        select(next);
        tabs[next].focus();
      });
    });
    arrows.forEach((arrow, index) => arrow.addEventListener('click', () => {
      if (index) sliders[current].slideNext();
      else sliders[current].slidePrev();
    }));
    new ResizeObserver(resize).observe(section);
    resize();
    select(0);
  };

  const projectGallerySlider = () => {
    const containers = document.querySelectorAll(".js-project-gallery");
    if (!containers.length || typeof Swiper === "undefined") return;

    containers.forEach((container) => {
      const slider = container.querySelector(".swiper");
      if (!slider || slider.swiper) return;

      new Swiper(slider, {
        loop: true,
        speed: 700,
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        watchSlidesProgress: true,
        navigation: {
          prevEl: container.querySelector(".project-gallery-arrow.is-prev"),
          nextEl: container.querySelector(".project-gallery-arrow.is-next"),
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
            spaceBetween: 35,
          },
        },
      });
    });
  };

  const projectVideosSlider = () => {
    if (typeof Swiper === 'undefined') return;
    document.querySelectorAll('.js-project-videos').forEach(element => {
      if (element.swiper) return;
      const slider = new Swiper(element, {
        slidesPerView: 'auto',
        spaceBetween: 16,
        speed: 600,
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        grabCursor: true,
        watchSlidesProgress: true,
        mousewheel: { forceToAxis: true },
        breakpoints: { 1025: { spaceBetween: '1.875%' } },
      });
      element.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.key === 'ArrowLeft') slider.slidePrev();
        else if (event.key === 'ArrowRight') slider.slideNext();
        else slider.slideTo(event.key === 'Home' ? 0 : slider.slides.length - 1);
      });
    });
  };

  const projectDocumentsSlider = () => {
    const element = document.querySelector('.js-project-documents');
    if (!element || element.swiper || typeof Swiper === 'undefined') return;
    const slider = new Swiper(element, {
      slidesPerView: 1,
      slidesPerGroup: 1,
      longSwipesRatio: 0.15,
      speed: 700,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      grabCursor: true,
      watchSlidesProgress: true,
      mousewheel: { forceToAxis: true },
      pagination: {
        el: element.closest('.section-project-documents').querySelector('.documents-pagination'),
        clickable: true,
        renderBullet: (index, className) => `<button type="button" class="${className}" aria-label="Trang tài liệu ${index + 1}"><span aria-hidden="true"></span></button>`,
      },
      breakpoints: {
        768: { slidesPerView: 2, slidesPerGroup: 2 },
        1025: { slidesPerView: 3, slidesPerGroup: 3 },
      },
    });
    element.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'ArrowLeft') slider.slidePrev();
      else if (event.key === 'ArrowRight') slider.slideNext();
      else slider.slideTo(event.key === 'Home' ? 0 : slider.slides.length - 1);
    });
  };

   const syncKeyvisualSlogan = (swiper) => {
    const section = swiper.el.closest(".keyvisual");
    if (!section) return;
    const slogan = section.querySelector(".keyvisual-slogan");
    if (!slogan) return;
    const slide = swiper.slides[swiper.activeIndex];
    const show = !!(slide && slide.getAttribute("data-show-slogan") === "1");
    slogan.classList.toggle("is-hidden", !show);
  };

  const sliderKeyvisual = () => {
    const sliders = document.querySelectorAll(".js-slider-keyvisual");
    if (!sliders.length || typeof Swiper === "undefined") return;

    updateParallax(sliders);

    sliders.forEach((element) => {
      if (element.swiper) return;
      const swiper = new Swiper(element, {
        loop: true,
        parallax: true,
        speed: 2000,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        pagination: {
          el: element.querySelector(".swiper-pagination"),
          clickable: true,
        },
        grabCursor: true,
         on: {
          init(swiper) {
            syncKeyvisualSlogan(swiper);
          },
          slideChange(swiper) {
            syncKeyvisualSlogan(swiper);
          },
        },
      });

      kvSliders.push(swiper);
    });

    window.addEventListener("resize", () => updateParallax(sliders));
  };

  let kvSliders = [];
  const updateParallax = (sliders) => {
    const isPC = window.matchMedia("(min-width: 768px)").matches;
    const parallaxValue = isPC ? 365 : 300;

    sliders.forEach((element) => {
      const slideImages = element.querySelectorAll(".slider-image");
      slideImages.forEach((img) => {
        img.dataset.swiperParallax = parallaxValue;
        img.dataset.swiperParallaxOpacity = 1;
      });
    });
  };

  const newsSlider = () => {
    const containers = document.querySelectorAll(".js-news-slider");
    if (!containers.length || typeof Swiper === "undefined") return;

    containers.forEach((container) => {
      const slider = container.querySelector(".swiper");
      if (!slider || slider.swiper) return;

      const isTopNews = !!container.closest('.section-top-news');
      const newsSwiper = new Swiper(slider, {
        loop: true,
        speed: 700,
        slidesPerView: 1,
        spaceBetween: 20,
        watchOverflow: true,
        grabCursor: true,
        pagination: isTopNews ? {
          el: container.querySelector('.news-pagination'),
          clickable: true,
        } : undefined,
        navigation: {
          prevEl: container.querySelector(".news-arrow.is-prev"),
          nextEl: container.querySelector(".news-arrow.is-next"),
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
            spaceBetween: 25,
          },
          1025: {
            slidesPerView: 3,
            spaceBetween: 32,
          },
        },
      });
      if (isTopNews) {
        const resize = () => {
          const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
          const gap = .49 * rem;
          newsSwiper.params.spaceBetween = gap;
          Object.values(newsSwiper.params.breakpoints).forEach(point => { point.spaceBetween = gap; });
          newsSwiper.update();
        };
        new ResizeObserver(resize).observe(container);
        resize();
      }
    });
  }

  // Helper

  const freezeWindow = (lock) => {
    const normalScroll = document.querySelector(".normal-scroll");
    const isProjectsDetail = document.documentElement.classList.contains(
      "is-page-projects-detail"
    );

    if (isProjectsDetail) {
      if (lock) {
        __scrollY = window.scrollY || window.pageYOffset;
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      } else {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";

        if (Math.abs(window.scrollY - __scrollY) > 1) {
          window.scrollTo(0, __scrollY);
        }
      }
      return;
    }

    if (lock) {
      __scrollY = window.scrollY || window.pageYOffset;
      __normalScrollY = normalScroll ? normalScroll.scrollTop : 0;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.position = "fixed";
      document.body.style.top = `-${__scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + "px";
      }
    } else {
      const y = __scrollY;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.body.removeAttribute("style");

      if (y > 0) {
        window.scrollTo(0, y);
      }

      if (normalScroll) {
        normalScroll.scrollTop = __normalScrollY;
      }
    }
  };

  const getPopupElements = (id) => {
    const popup = document.getElementById(id);
    if (!popup) return null;

    return {
      popup,
      body: popup.querySelector(".popup-body"),
      title: popup.querySelector(".popup-title"),
      closeBtn: popup.querySelector(".popup-close"),
      overlay: popup.querySelector(".popup-overlay"),
    };
  };

  const initContactPopup = () => {
    const trigger = document.querySelector(".header-phone");
    const elements = getPopupElements("contactPopup");
    if (!trigger || !elements) return;

    const {
      popup,
      closeBtn,
      overlay
    } = elements;

    const openPopup = (event) => {
      event?.preventDefault();
      popup.classList.add("active");
      popup.setAttribute("aria-hidden", "false");
      freezeWindow(true);
      window.__APP_STATE__?.observer?.disable();
    };

    const closePopup = () => {
      if (!popup.classList.contains("active")) return;
      popup.classList.remove("active");
      popup.setAttribute("aria-hidden", "true");
      freezeWindow(false);
      if (window.__APP_STATE__?.sliderState?.active) {
        window.__APP_STATE__?.observer?.enable();
      }
    };

    trigger.addEventListener("click", openPopup);
    closeBtn?.addEventListener("click", closePopup);
    overlay?.addEventListener("click", closePopup);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closePopup();
    });
  };

  const initMobileAnimations = () => {
    if (isDesktop()) return;

    gsap.registerPlugin(ScrollTrigger);

    const targets = document.querySelectorAll(".js-title");
    if (!targets.length) return;

    targets.forEach((el) => {
      gsap.fromTo(
        el, {
        autoAlpha: 0,
        y: 100,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      },
      );
    });
  };

  const Done = () => {
    const titles = document.querySelectorAll('.js-title-fade');
    if (!titles.length) return;

    let globalIndex = 0;

    titles.forEach((title) => {
      if (title.classList.contains('splitted')) return;
      title.classList.add('splitted');
      const text = title.textContent;
      const chars = text.split('');

      let html = '';
      chars.forEach((ch) => {
        if (ch === ' ') {
          html += `<span class="space"></span>`;
        } else {
          html += `
          <span class="char-wrap">
            <span class="char" style="line-height: 1; transform: translateY(120%); opacity: 0;">
              ${ch}
            </span>
          </span>
        `;
        }
      });

      title.innerHTML = html;
    });
  };

  const isIOSZalo = () => {
    const ua = navigator.userAgent;

    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1);

    return isIOS && /Zalo/i.test(ua);
  };

  const waitForCriticalImages = () => {
    const images = [...document.querySelectorAll(".js-preload")];

    return Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          img.addEventListener("load", resolve, {
            once: true
          });
          img.addEventListener("error", resolve, {
            once: true
          });
        });
      })
    );
  };

  // End helper

  const initIntro = async () => {
    Done();
    const isTablet = () => window.innerWidth < 1024.98;
    const maskIntro = document.getElementById("mask");

    const startApp = () => {
      setTimeout(() => {
        if (!isTablet()) {
          document.body.style.overflow = "hidden";
        }
        app();
        const video = document.getElementById("video-element");

        if (video) {
          video.play().catch(() => {
            console.warn("Autoplay blocked.");
          });
        }
        initMobileAnimations();
      }, 600);
    };

    if (!maskIntro) {
      WindBody.classList.add("showed");
      startApp();
      return;
    }

    if (isIOSZalo()) {
      Mask?.remove();

      WindBody.classList.add("showed");
      document.body.style.overflow = isTablet() ? "" : "hidden";

      app();
      initMobileAnimations();

      // Khi mở từ Zalo: thay video bằng ảnh poster (không chạy video)
      const video = document.getElementById("video-element");
      if (video) {
        const poster = video.getAttribute("poster");
        const parent = video.parentElement;

        // Tạo ảnh thay thế video
        const img = document.createElement("img");
        img.className = "object-common";
        img.src = poster || "";
        img.alt = "BLUEMARQ Development";
        img.width = 1920;
        img.height = 1050;
        img.loading = "eager";

        // Thay video bằng ảnh
        parent?.replaceChild(img, video);
      }

      return;
    }

    window.scrollTo(0, 0);

    if (!isTablet()) {
      document.body.style.overflow = "hidden";
    } else {
      freezeWindow(true);
    }

    delay(1000, () => {
      Mask?.classList.add("showed");
    });
    delay(4000, () => {
      Mask?.classList.add("hide");
    });
    delay(4500, () => {
      Mask?.remove();

      setTimeout(() => {
        WindBody.classList.add("showed");

        const allChars = document.querySelectorAll(".char");
        const titles = document.querySelectorAll(".js-title-fade");

        allChars.forEach((el) => {
          el.style.animation = "none";
          el.style.transition =
            "transform 0.7s cubic-bezier(.22, 1, .36, 1), opacity 0.7s cubic-bezier(.22, 1, .36, 1)";
        });

        let accumulatedDelay = 0;
        let lastShowDelay = 0;

        titles.forEach((title) => {
          const chars = title.querySelectorAll(".char");

          void chars[0]?.offsetHeight;

          chars.forEach((el, i) => {
            const d = accumulatedDelay + i * 50 + 16;
            lastShowDelay = Math.max(lastShowDelay, d);

            setTimeout(() => {
              el.style.transform = "translateY(0%)";
              el.style.opacity = "1";
            }, d);
          });

          accumulatedDelay += chars.length * 50 + 200;

          const hideAfterMs = lastShowDelay + 700 + 3000;

          setTimeout(() => {
            let hideDelay = 0;

            [...titles].reverse().forEach((title) => {
              const chars = [...title.querySelectorAll(".char")].reverse();

              chars.forEach((el, i) => {
                const d = hideDelay + i * 50 + 16;

                setTimeout(() => {
                  el.style.transform = "translateY(120%)";
                  el.style.opacity = "0";
                }, d);
              });

              hideDelay += chars.length * 50 + 200;
            });
          }, hideAfterMs);
        });

        freezeWindow(false);
      }, 50);
    });
    startApp();
  };

  const sliderIntroduction = () => {
    const sliders = document.querySelectorAll(".js-slider-introduction");
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      const sliderThumbnailsDOM = slider.querySelector(
        '.swiper[data-slider-role="slider-thumbnails"]',
      );
      const sliderMainDOM = slider.querySelector(
        '.swiper[data-slider-role="slider-main"]',
      );

      if (!sliderThumbnailsDOM || !sliderMainDOM) return;

      const sliderThumbnailsWrapper =
        sliderThumbnailsDOM.querySelector(".swiper-wrapper");
      sliderThumbnailsWrapper.innerHTML = "";
      const slideMainSlides = sliderMainDOM.querySelectorAll(".swiper-slide");
      slideMainSlides.forEach((slide) => {
        const thumbnail = slide.querySelector(".thumbnail-introduction img");
        if (thumbnail) {
          const nextThumbSrc = thumbnail.dataset.nextThumb || thumbnail.src;
          const thumbnailItem = document.createElement("div");
          thumbnailItem.className = "swiper-slide";
          thumbnailItem.innerHTML = `<figure><img class="object-common" src="${nextThumbSrc}" alt="${thumbnail.alt || ""}" /></figure>`;
          sliderThumbnailsWrapper.appendChild(thumbnailItem);
        }
      });

      const sliderThumbnails = new Swiper(sliderThumbnailsDOM, {
        loop: true,
        speed: 500,
        direction: "vertical",
        slidesPerView: 1,
        spaceBetween: 0,
        allowTouchMove: false,
        slideToClickedSlide: false,
        simulateTouch: false,
        keyboard: false,
        mousewheel: false,
      });

      const sliderMain = new Swiper(sliderMainDOM, {
        loop: true,
        speed: 1500,
        slidesPerView: 1,
        spaceBetween: 0,
        effect: "fade",
        fadeEffect: {
          crossFade: true,
        },
        pagination: {
          el: slider.querySelector('[data-slider-role="pagination"]'),
          clickable: true,
          type: "fraction",
          renderFraction: function (currentClass, totalClass) {
            return `<span class="${currentClass}" data-slider-role="pagination-current"></span>
                  <span class="${totalClass}" data-slider-role="pagination-total"></span>`;
          },
        },
        navigation: {
          nextEl: slider.querySelector('[data-slider-role="arrow-next"]'),
        },
      });

      sliderMain.on("realIndexChange", () => {
        sliderThumbnails.slideToLoop(sliderMain.realIndex);
      });
    });
  };

  const scrollPage = () => {
    const $header = $("header.header-common");
    let lastScroll = window.scrollY;

    const onScroll = () => {
      if (window.__APP_STATE__.forceHideHeader) return;
      if (document.body.style.position === "fixed") return;

      if (isDesktop() && window.__APP_STATE__?.sliderState?.active) {
        lastScroll = window.scrollY;
        $header.removeClass("is-hide");
        return;
      }

      const currentScroll = window.scrollY;

      if (currentScroll <= 0) {
        $header.removeClass("is-hide");
        lastScroll = 0;
        return;
      }

      if (currentScroll > lastScroll) {
        $header.addClass("is-hide");
      } else {
        $header.removeClass("is-hide");
      }

      lastScroll = currentScroll;
    };

    $(window).on("scroll", onScroll);
  };

  const triggerClick = () => {
    const classClickActive = 'is-click-active';

    const classClosing = 'is-closing';

    const header = document.querySelector('.header-common');

    const overlayMenu = document.querySelector('.overlay-menu');

    const navigationWrapper = document.querySelector('.navigation-wrapper');

    const clickElements = document.querySelectorAll('.js-click');

    const buttonClose = document.querySelector('.js-button-close');

    if (
      !header ||
      !overlayMenu ||
      !navigationWrapper ||
      !clickElements.length ||
      !buttonClose
    ) {
      return;
    }

    let isOpen = false;
    let closeTimer;
    let menuTrigger;
    const navigation = header.querySelector('.header-common-navigation');

    // OPEN
    const openMenu = (element) => {
      window.clearTimeout(closeTimer);
      menuTrigger = element;
      navigation.inert = false;
      element.setAttribute('aria-expanded', 'true');
      // RESET
      overlayMenu.classList.remove(classClosing);

      navigationWrapper.classList.remove(classClosing);

      clickElements.forEach((el) => {
        el.classList.remove(classClosing);
        el.classList.remove(classClickActive);
      });

      // Remove is-menu-closing → CSS transitions width 0 → 100%
      header.classList.remove('is-menu-closing');

      // ACTIVE
      header.classList.add('is-menu-open');
      element.classList.add(classClickActive);
      overlayMenu.classList.add(classClickActive);
      navigationWrapper.classList.add(classClickActive);

      // LOCK SCROLL
      document.body.style.overflow = 'hidden';
      // WinScroll.stop();
      freezeWindow(true);
      window.__APP_STATE__?.observer?.disable();

      isOpen = true;
      requestAnimationFrame(() => {
        if (isOpen) buttonClose.focus({
          preventScroll: true
        });
      });
    };

    // CLOSE
    const closeMenu = () => {
      if (!isOpen) return;
      isOpen = false;
      navigation.inert = true;
      menuTrigger?.setAttribute('aria-expanded', 'false');
      menuTrigger?.focus({
        preventScroll: true
      });

      header.classList.add('is-menu-closing');

      overlayMenu.classList.remove(classClickActive);
      navigationWrapper.classList.remove(classClickActive);

      clickElements.forEach((el) => {
        el.classList.remove(classClickActive);
      });

      navigationWrapper.classList.add(classClosing);
      overlayMenu.classList.add(classClosing);

      clickElements.forEach((el) => {
        el.classList.add(classClosing);
      });

      closeTimer = window.setTimeout(() => {
        header.classList.remove('is-menu-open');

        header.classList.remove('is-menu-closing');

        overlayMenu.classList.remove(classClickActive, classClosing);

        navigationWrapper.classList.remove(classClickActive, classClosing);

        clickElements.forEach((el) => {
          el.classList.remove(classClickActive, classClosing);
        });

        document.body.style.overflow = '';
        freezeWindow(false);
        if (window.__APP_STATE__?.sliderState?.active) {
          window.__APP_STATE__?.observer?.enable();
        }
      }, 500);
    };

    window.addEventListener('header:close-menu', closeMenu);

    // TOGGLE
    clickElements.forEach((element) => {
      element.addEventListener('click', (e) => {
        e.stopPropagation();

        if (isOpen) {
          closeMenu();
        } else {
          openMenu(element);
        }
      });
    });

    // OVERLAY CLOSE
    overlayMenu.addEventListener('click', closeMenu);

    // BUTTON CLOSE
    buttonClose.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (event) => {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
      }
      if (event.key !== 'Tab') return;
      const focusable = [...navigation.querySelectorAll('a[href], button:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  };

  const fadeInAnimation = () => {
    const fadeInElements = document.querySelectorAll(".js-fadein");
    if (!fadeInElements.length) return;

    fadeInElements.forEach((element) => {
      gsap.fromTo(
        element, {
        opacity: 0,
        y: 50,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
      );
    });
  };

  const initMobileNavLinks = () => {
    if (isDesktop()) return;

    const mobileLinks = document.querySelectorAll(
      ".navigation-menu .item-link",
    );

    const getTargetSection = (hash) => {
      if (!hash) return null;
      return document.getElementById(hash);
    };

    mobileLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href") || "";
        const hash = href.split("#")[1];
        const linkPath = href.split("#")[0];

        // Links without a hash point to another page and must navigate normally.
        if (!hash) return;

        const isSamePage = !linkPath ||
          linkPath === window.location.pathname ||
          linkPath === window.location.origin + window.location.pathname ||
          linkPath.endsWith(window.location.pathname);

        if (!isSamePage) return;

        e.preventDefault();

        window.dispatchEvent(new CustomEvent("header:close-menu"));

        const target = getTargetSection(hash);
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({
              behavior: "smooth",
            });
          }, 550);
        }
      });
    });

    const hash = window.location.hash?.replace("#", "");
    if (!hash) return;

    // Bỏ qua hash tabs (tab1, tab2...) - xử lý bởi initTabsFromHash
    if (/^tab\d+$/.test(hash)) return;

    const target = getTargetSection(hash);

    if (target) {
      setTimeout(() => {
        target.scrollIntoView({
          behavior: "smooth",
        });
        history.replaceState(null, "", window.location.pathname);
      }, 500);
    }
  };

  const measureAndAnimate = (el, wrapper, originalCount, speed, reverse) => {
    const allSlides = Array.from(wrapper.children);

    const firstSlide = allSlides[0];
    const firstOfSecondSet = allSlides[originalCount];

    const firstRect = firstSlide.getBoundingClientRect();
    const firstOfSecondRect = firstOfSecondSet.getBoundingClientRect();

    const oneSetWidth = firstOfSecondRect.left - firstRect.left;

    wrapper.style.willChange = "transform";
    wrapper.style.backfaceVisibility = "hidden";
    wrapper.style.webkitBackfaceVisibility = "hidden";

    const prefix = reverse ? "marquee-rev-px" : "marquee-px";
    const keyframeName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const style = document.createElement("style");

    style.textContent = reverse ?
      `@keyframes ${keyframeName} { from { transform: translate3d(-${oneSetWidth}px, 0, 0); } to { transform: translate3d(0, 0, 0); } }` :
      `@keyframes ${keyframeName} { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-${oneSetWidth}px, 0, 0); } }`;
    document.head.appendChild(style);

    wrapper.style.width = "max-content";

    requestAnimationFrame(() => {
      wrapper.style.animation = `${keyframeName} ${speed}ms linear infinite`;
    });
  };

  const handleDarkBg = () => {
    if (window.innerWidth > mobileBreak) {
      document.documentElement.classList.remove("is-dark-bg");
      return;
    }

    const bgSections = Array.from(document.querySelectorAll(".js-bg"));

    document.documentElement.classList.toggle(
      "is-dark-bg",
      bgSections.some((sec) => {
        const {
          top,
          bottom
        } = sec.getBoundingClientRect();
        return top < window.innerHeight && bottom > 0;
      }),
    );
  };

  const sliderProjects = () => {
    const sliders = document.querySelectorAll(".js-top-projects");
    if (!sliders.length) return;

    sliders.forEach((container) => {
      const slider = container.querySelectorAll(".swiper")[0];

      new Swiper(slider, {
        loop: true,
        speed: 500,
        slidesPerView: 'auto',
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
      });
    });
  };

  const dragGalleryImage = () => {
    const wrappers = document.querySelectorAll(".section-top-projects .projects-wrapper");
    if (!wrappers.length) return;

    const minVisibleWidth = 50;
    const maxVisibleWidth = 95;
    const isDragDesktop = () => window.innerWidth >= 1024.98;
    const clamp = (value) => Math.min(maxVisibleWidth, Math.max(minVisibleWidth, value));

    wrappers.forEach((wrapper) => {
      const image = wrapper.querySelector(".projects-image");
      if (!image) return;

      const setImageClip = (clientX) => {
        const rect = wrapper.getBoundingClientRect();
        const visibleWidth = clamp(((rect.right - clientX) / rect.width) * 100);
        const clipLeft = 100 - visibleWidth;
        wrapper.style.setProperty("--projects-image-clip-left", `${clipLeft}%`);
        image.classList.toggle("is-active", visibleWidth > minVisibleWidth);
      };

      image.addEventListener("pointerdown", (event) => {
        if (!isDragDesktop()) return;

        const rect = wrapper.getBoundingClientRect();
        const clipLeft = parseFloat(getComputedStyle(wrapper).getPropertyValue("--projects-image-clip-left")) || 50;
        const handleX = rect.left + (rect.width * clipLeft) / 100;
        const handleArea = Math.max(36, rect.width * 0.04);
        const isHandle = Math.abs(event.clientX - handleX) <= handleArea;
        if (!isHandle) return;

        event.preventDefault();
        image.classList.add("is-dragging");
        image.setPointerCapture?.(event.pointerId);
        setImageClip(event.clientX);

        const onPointerMove = (moveEvent) => {
          setImageClip(moveEvent.clientX);
        };

        const onPointerUp = () => {
          image.classList.remove("is-dragging");
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", onPointerUp);
          window.removeEventListener("pointercancel", onPointerUp);
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);
      });
    });
  };

  const partnersSlider = () => {
    const sliders = document.querySelectorAll('.js-relationship-slider');
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      new Swiper(slider, {
        loop: true,
        speed: 1500,
        slidesPerView: 1,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        }
      });
    });
  };

  const galleryImagesSlider = (scope = document) => {
    const sliders = scope.matches?.('.js-gallery-images-slider') ? [scope] : scope.querySelectorAll('.js-gallery-images-slider');
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      const tabPanel = slider.closest('.tab-panel');
      if (slider.swiper || (tabPanel && !tabPanel.classList.contains('active'))) return;

      const slideCount = slider.querySelectorAll('.swiper-slide').length;
      const minimumSlides = window.innerWidth >= 1025 ? 8 :
        window.innerWidth >= 768 ? 4 : 2;
      const canAutoplay = slideCount > minimumSlides;

      new Swiper(slider, {
        speed: 900,
        watchOverflow: true,
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 20,
        grid: {
          rows: 1,
          fill: 'row',
        },
        pagination: {
          el: slider.querySelector('.swiper-pagination'),
          clickable: true,
        },
        autoplay: canAutoplay ? {
          delay: 3000,
          disableOnInteraction: false
        } : false,
        breakpoints: {
          768: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 30,
            grid: {
              rows: 2,
              fill: 'row',
            },
          },
          1025: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            spaceBetween: 30,
            grid: {
              rows: 2,
              fill: 'row',
            },
          },
        },
      });
    });
  };

  const galleryVideoSlider = () => {
    const sliders = document.querySelectorAll('.js-gallery-video-slider');
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      new Swiper(slider, {
        loop: true,
        speed: 900,
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 16,
        pagination: {
          el: slider.querySelector('.swiper-pagination'),
          clickable: true,
        },
        autoplay: {
          delay: 3000,
          disableOnInteraction: false
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 32,
          },
          1025: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 48,
          },
        },
      });
    });
  };

  const projectsSectionSlider = () => {
    const sliders = document.querySelectorAll('.js-projects-slider');
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      new Swiper(slider, {
        speed: 900,
        loop: true,
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 20,
        pagination: {
          el: slider.querySelector('.swiper-pagination'),
          clickable: true,
        },
        autoplay: {
          delay: 3000,
          disableOnInteraction: false
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 28,
          },
          1025: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 52,
          },
        },
      });
    });
  };

  const projectsUtilitiesSlider = () => {
    const sliders = document.querySelectorAll('.js-projects-utilities-slider');
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      new Swiper(slider, {
        loop: true,
        speed: 1000,
        slidesPerView: 1,
        autoplay: {
          delay: 3500,
          disableOnInteraction: false,
        },
      });
    });
  };

  const recruitmentPositionSlider = () => {
    const sliders = document.querySelectorAll('.js-recruitment-position-slider');
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      if (slider.swiper) return;

      const slideCount = slider.querySelectorAll('.swiper-wrapper > .swiper-slide').length;
      const hasFewSlides = slideCount <= 2;
      slider.classList.toggle('is-centered', hasFewSlides);

      new Swiper(slider, {
        loop: !hasFewSlides,
        loopAdditionalSlides: 5,
        loopPreventsSliding: false,
        speed: 700,
        slidesPerView: 'auto',
        slidesPerGroup: 1,
        centerInsufficientSlides: true,
        spaceBetween: 16,
        grabCursor: !hasFewSlides,
        roundLengths: true,
        watchSlidesProgress: true,
        breakpoints: {
          768: {
            spaceBetween: 20,
          },
          1025: {
            spaceBetween: 25,
          },
        },
      });
    });
  };

  const recruitmentFileInput = () => {
    const wrappers = document.querySelectorAll('.recruitment-apply-file');
    if (!wrappers.length) return;

    wrappers.forEach((wrapper) => {
      const input = wrapper.querySelector('input[type="file"]');
      const fileName = wrapper.querySelector('.recruitment-apply-file-name');
      if (!input || !fileName) return;

      input.addEventListener('change', () => {
        const name = input.files?.[0]?.name || 'Chọn CV';
        fileName.textContent = name;
        fileName.title = input.files?.[0]?.name || '';
      });
    });
  };

  const projectsDetailScroll = () => {
    const sections = document.querySelectorAll('.js-projects-detail-scroll');
    if (!sections.length || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    sections.forEach((section) => {
      const track = section.querySelector('.js-projects-detail-track');
      const viewport = section.querySelector('.projects-detail-sticky');
      const panels = section.querySelectorAll('.projects-detail-panel');
      if (!track || !viewport) return;

      const revealPanel = (panel, scrollTrigger, paused = false) => {
        const targets = panel.querySelectorAll('.js-projects-detail-reveal');
        if (!targets.length) return null;

        return gsap.fromTo(targets, {
          autoAlpha: 0,
          y: 32,
        }, {
          autoAlpha: 1,
          y: 0,
          duration: 1.4,
          stagger: .2,
          ease: 'power2.out',
          scrollTrigger,
          paused,
        });
      };



      if (!window.matchMedia('(min-width: 1025px)').matches) {
        section.classList.add('is-static');
        gsap.set(track, {
          clearProps: 'transform'
        });
        panels.forEach((panel) => {
          revealPanel(panel, {
            trigger: panel,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          });
        });
        return;
      }

      gsap.set(track, {
        x: 0
      });
      const revealAnimations = Array.from(panels, (panel) => revealPanel(panel, null, true));
      const revealedPanels = new Set();

      const showPanel = (index) => {
        if (revealedPanels.has(index)) return;
        revealedPanels.add(index);
        revealAnimations[index]?.play();
      };

      const scrollTween = gsap.to(track, {
        x: () => -Math.max(0, track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(1, track.scrollWidth - window.innerWidth)}`,
          scrub: 1.2,
          pin: viewport,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.min(
              panels.length - 1,
              Math.round(self.progress * (panels.length - 1))
            );
            showPanel(index);
          },
        },
      });

      showPanel(0);
    });
  };

  const initTabs = () => {
    const tabsWrappers = document.querySelectorAll('.js-tabs, .list-news-tabs');
    if (!tabsWrappers.length) return;

    tabsWrappers.forEach((wrapper) => {
      const buttons = wrapper.querySelectorAll('.tab-btn');
      const panels = wrapper.querySelectorAll('.tab-panel');
      if (!buttons.length || !panels.length) return;

      let isAnimating = false;

      const activateTab = (targetId) => {
        const targetPanel = wrapper.querySelector(`#panel-${targetId}`);
        if (!targetPanel) return;

        buttons.forEach((btn) =>
          btn.classList.toggle('active', btn.dataset.tab === targetId)
        );

        panels.forEach((panel) => {
          if (panel === targetPanel) {
            panel.classList.add('active');
            galleryImagesSlider(targetPanel);
            gsap.fromTo(
              panel, {
              autoAlpha: 0,
              y: 30
            }, {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              onComplete: () => {
                targetPanel.querySelectorAll('.swiper').forEach((element) => {
                  if (element.swiper && !element.swiper.destroyed) {
                    element.swiper.update();
                  }
                });
                isAnimating = false;
              },
            }
            );
          } else {
            panel.classList.remove('active');
          }
        });
      };

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          if (isAnimating) return;
          const targetId = button.dataset.tab;
          if (!targetId) return;
          if (button.classList.contains('active')) return;
          isAnimating = true;
          activateTab(targetId);
        });
      });

      wrapper.__activateTab = activateTab;
    });
  };

  const initTabsFromHash = () => {
    const applyHash = () => {
      const hash = window.location.hash?.replace('#', '');
      if (!hash) return;
      if (!/^tab\d+$/.test(hash)) return;

      history.replaceState(null, '', window.location.pathname + window.location.search);

      const tabsWrappers = document.querySelectorAll('.js-tabs, .list-news-tabs');
      if (!tabsWrappers.length) return;

      tabsWrappers.forEach((wrapper) => {
        const targetButton = Array.from(
          wrapper.querySelectorAll('.tab-btn')
        ).find((btn) => btn.dataset.tab === hash);
        if (!targetButton) return;

        targetButton.click();

        setTimeout(() => {
          wrapper.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 300);
      });
    };

    applyHash();

    window.addEventListener('hashchange', applyHash);
  };

  const initPanelZoomAnimation = () => {
    const panels = [...document.querySelectorAll('.panel')].filter((panel) =>
      panel.querySelector('.ani-zoom')
    );
    if (!panels.length) return;

    panels.forEach((panel) => {
      const restart = () => {
        panel.querySelectorAll('.ani-zoom').forEach((element) => {
          element.style.animation = 'none';
          void element.offsetWidth;
          element.style.animation = '';
        });
      };

      let wasActive = panel.classList.contains('is-active');
      const observer = new MutationObserver(() => {
        const isActive = panel.classList.contains('is-active');
        if (isActive && !wasActive) restart();
        wasActive = isActive;
      });

      observer.observe(panel, {
        attributes: true,
        attributeFilter: ['class'],
      });

      if (wasActive) restart();
    });
  };

  const sliderGalleryDetail = (scope = document, initialSlide = 0) => {
    const sliders = scope.querySelectorAll(".js-slider-gallery-detail");
    if (!sliders.length) return;

    sliders.forEach((container) => {
      const slider = container.querySelector(".swiper");
      const sliderTitle = container.querySelector(".swiper-title");
      if (!slider || slider.swiper) return;

      const updateTitle = (swiper) => {
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (sliderTitle && activeSlide) {
          sliderTitle.textContent = activeSlide.dataset.title || "";
        }
      };

      new Swiper(slider, {
        initialSlide,
        loop: true,
        speed: 500,
        slidesPerView: 1,
        navigation: {
          nextEl: slider.querySelector(".swiper-button-next"),
          prevEl: slider.querySelector(".swiper-button-prev"),
        },
        pagination: {
          el: slider.querySelector(".swiper-pagination"),
          type: "fraction",
        },
        on: {
          init: updateTitle,
          slideChange: updateTitle,
        },
      });
    });
  };

  const createPopup = ({
    id,
    className = "",
    hasTitle = true
  }) => {
    if (document.getElementById(id)) return;

    const popup = document.createElement("div");
    popup.id = id;
    popup.className = `media-popup ${className}`;

    popup.innerHTML = `
      <div class="popup-overlay"></div>
      <div class="popup-box">
        <button class="popup-close trans js-close-popup"></button>
        <div class="popup-body" id="${id}-body"></div>
      </div>
    `;

    document.body.appendChild(popup);
  };

  const initPopup = () => {
    const media = getPopupElements("mediaPopup");
    const premises = getPopupElements("premisesPopup");
    const premisesDetail = getPopupElements("premisesDetailPopup");
    const $header = $("header.header-common");
    if (!$header.length || !media) return;

    const openTriggers = document.querySelectorAll(".js-open-popup");
    let currentPopup = null;
    const popupStack = [];
    let disposeDetailWaves = null;

    const open = (popupId) => {
      const popupEl = getPopupElements(popupId);
      if (!popupEl) return;

      const {
        popup
      } = popupEl;

      // Nếu popup này chưa có trong stack thì thêm vào
      if (!popupStack.includes(popup)) {
        popupStack.push(popup);
      }

      currentPopup = popup;

      $header.removeClass("is-hide");
      document.body.style.overflow = "hidden";
      freezeWindow(true);

      window.__APP_STATE__?.observer?.disable();

      setTimeout(() => {
        popup.classList.add("is-open");
      }, 300);
    };

    const mountApartmentSlider = (slider) => {
      if (!window.Swiper || !slider) return;
      const count = slider.querySelectorAll('.swiper-slide').length;
      if (!count) return;
      new Swiper(slider, {
        slidesPerView: 1,
        speed: 500,
        loop: count > 1,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        pagination: {
          el: slider.querySelector('.apartment-detail-dots'),
          clickable: true,
          bulletElement: 'button',
        },
        a11y: { paginationBulletMessage: 'Xem ảnh {{index}}' },
      });
    };

    window.terpOpenApartmentDetailModal = (html) => {
      if (!premisesDetail || typeof html !== 'string' || html === '') return false;
      disposeDetailWaves?.();
      premisesDetail.body.querySelectorAll('.js-apartment-slider').forEach((slider) => slider.swiper?.destroy(true, true));
      premisesDetail.body.innerHTML = html;
      disposeDetailWaves = initCanvasWaves(premisesDetail.body);
      open(premisesDetail.popup.id);
      premisesDetail.body.querySelectorAll('.js-apartment-slider').forEach(mountApartmentSlider);
      return true;
    };

    const close = (popup) => {
      if (!popup) return;

      popup.classList.remove("is-open");

      // Xóa HTML động tương ứng
      if (popup === media?.popup) {
        media.body.innerHTML = "";
      }

      if (popup === premises?.popup) {
        premises.body.innerHTML = "";
      }

      if (popup === premisesDetail?.popup) {
        disposeDetailWaves?.();
        disposeDetailWaves = null;
        premisesDetail.body.querySelectorAll('.js-apartment-slider').forEach((slider) => slider.swiper?.destroy(true, true));
        premisesDetail.body.innerHTML = "";
      }

      // Xóa popup khỏi stack
      const index = popupStack.indexOf(popup);

      if (index !== -1) {
        popupStack.splice(index, 1);
      }

      // Lấy popup trước đó
      currentPopup = popupStack[popupStack.length - 1] || null;

      // Nếu vẫn còn popup trước đó
      if (currentPopup) {
        currentPopup.classList.add("is-open");
        return;
      }

      // Không còn popup nào
      document.body.style.overflow = "";
      freezeWindow(false);

      if (window.__APP_STATE__?.sliderState?.active) {
        window.__APP_STATE__?.observer?.enable();
      }
    };

    // Mở popup
    openTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const popupId = trigger.dataset.popup;
        if (!popupId) return;
        open(popupId);
      });
    });

    // Đóng popup
    document.addEventListener("click", (e) => {
      if (!currentPopup) return;

      // click nút close (bất kỳ element nào có class close bên trong popup)
      if (e.target.closest(".js-close-popup")) {
        close(currentPopup);
        return;
      }

      // Không đóng khi tương tác bên trong nội dung popup (form, input, nút gửi...)
      if (e.target.closest(".popup-wrapper, .popup-box")) {
        return;
      }

      // click backdrop: #popup-consult (container là .popup-overlay)
      if (e.target === currentPopup) {
        close(currentPopup);
        return;
      }

      // click backdrop: media popup (lớp .popup-overlay con)
      const backdrop = currentPopup.querySelector(":scope > .popup-overlay");
      if (backdrop && e.target === backdrop) {
        close(currentPopup);
      }
    });

    // Đóng bằng phím Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && currentPopup) {
        close(currentPopup);
      }
    });

    document.addEventListener("click", async (e) => {
      const slide = e.target.closest(".js-slide-image");
      const video = e.target.closest(".js-slide-video");
      const premisesItem = e.target.closest(".js-premises-item");
      const premisesDetailItem = e.target.closest(".js-premises-detail-item");

      if (slide && media) {
        const {
          body,
          title
        } = media;
        const images = JSON.parse(slide.dataset.gallery || "[]");
        if (!images.length) return;

        const slideItems = images
          .map(
            (img) => `
          <div class="swiper-slide">
            <div class="slide-wrapper">
              <div class="slide-image">
                <img class="object-common" src="${img.url}" alt="${img.alt}"
                  loading="eager" width="${img.w}" height="${img.h}" />
              </div>
            </div>
          </div>`
          )
          .join("");

        body.innerHTML = `
          <section class="section-gallery">
            <div class="wrapper">
              <div class="list-top-gallery-detail js-slider-gallery-detail">
                <div class="swiper">
                  <div class="swiper-wrapper">${slideItems}</div>
                  <div class="swiper-button-prev trans"></div>
                  <div class="swiper-button-next trans"></div>
                  <div class="swiper-controller">
                    <div></div>
                    <p class="swiper-title">${slide.dataset.title || ""}</p>
                    <div class="swiper-pagination"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>`;

        open(media.popup.id);
        if (window.Swiper) {
          const startIndex = Number(slide.dataset.index || 0);
          sliderGalleryDetail(body, Number.isFinite(startIndex) ? startIndex : 0);
        }
        return;
      }

      if (video && media) {
        const {
          body,
          title
        } = media;
        const url = video.dataset.url;
        open(media.popup.id);

        const finalUrl = url.includes("?") ?
          url + "&autoplay=1&mute=1" :
          url + "?autoplay=1&mute=1";

        body.innerHTML = `
            <section class="section-gallery">
              <div class="wrapper">
                <div class="list-top-gallery-detail">
                  <div class="slide-video yt-iframe-wrap">
                    <iframe class="object-common"
                      src="${finalUrl}"
                      allow="autoplay; encrypted-media"
                      referrerpolicy="strict-origin-when-cross-origin"
                      allowfullscreen>
                    </iframe>
                  </div>
                </div>
                <div class="swiper-controller">
                  <p class="swiper-title">${video.dataset.title || ""}</p>
                </div>
              </div>
            </section>
          `;
        return;
      }

      if (premisesItem && premises) {
        const {
          body
        } = premises;

        open("premisesPopup");
        body.innerHTML = "Loading...";

        try {
          const html = await (await fetch(premisesItem.dataset.url)).text();
          body.innerHTML = html;
          initProductsTopSlider(body);
          hoverApartment(body);
        } catch {
          body.innerHTML = "Load failed";
        }
      }

      if (premisesDetailItem && premisesDetail) {
        const template = document.getElementById(premisesDetailItem.dataset.template);
        if (template instanceof HTMLTemplateElement) {
          disposeDetailWaves?.();
          premisesDetail.body.replaceChildren(template.content.cloneNode(true));
          disposeDetailWaves = initCanvasWaves(premisesDetail.body);
          const floor = document.querySelector('.masterplan-floor-select .floor-current');
          const floorLabel = premisesDetail.body.querySelector('[data-apartment-floor]');
          if (floor && floorLabel) floorLabel.textContent = floor.textContent;
          open(premisesDetail.popup.id);
          premisesDetail.body.querySelectorAll('.js-apartment-slider').forEach((slider) => {
            mountApartmentSlider(slider);
          });
          return;
        }
        const url = premisesDetailItem.dataset.url;
        if (!url) return;

        const {
          body
        } = premisesDetail;

        open("premisesDetailPopup", {
          lock: false,
        });
        body.innerHTML = "Loading...";

        try {
          body.innerHTML = await (await fetch(url)).text();
        } catch {
          body.innerHTML = "Load failed";
        }
      }
    });
  };

  const inlineSvg = () => {
    const svgImages = document.querySelectorAll(".js-inline-svg");

    if (!svgImages.length) return Promise.resolve();

    const promises = [];

    svgImages.forEach((img) => {
      const src = img.getAttribute("src");

      if (!src) return;

      promises.push(
        fetch(src)
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${src}`
              );
            }

            return response.text();
          })
          .then((svg) => {
            const parser = new DOMParser();

            const svgDoc = parser.parseFromString(
              svg,
              "image/svg+xml"
            );

            const svgElement = svgDoc.querySelector("svg");

            if (!svgElement) {
              throw new Error(
                `Invalid SVG: ${src}`
              );
            }

            // Import SVG vào document hiện tại
            const importedSvg = document.importNode(
              svgElement,
              true
            );

            // Giữ lại class của img
            importedSvg.classList.add(
              ...img.classList
            );

            // Copy các attribute khác của img
            [...img.attributes].forEach((attr) => {
              if (
                attr.name !== "src" &&
                attr.name !== "class"
              ) {
                importedSvg.setAttribute(
                  attr.name,
                  attr.value
                );
              }
            });

            // Thay img bằng SVG inline
            if (img.closest('.masterplan-drawing')) initMasterplanUnitLinks(importedSvg);
            img.replaceWith(importedSvg);
          })
          .catch((error) => {
            console.error(
              "Cannot load SVG:",
              error
            );
          })
      );
    });

    return Promise.allSettled(promises);
  };

  const buttonTop = () => {
    const $btn = $(".js-button-top");
    if (!$btn.length) return;

    const threshold = 300;

    if (isDesktop()) {
      const toggleDesktop = () => {
        const s = window.__APP_STATE__?.sliderState;

        if (!s) {
          $btn.toggleClass("is-active", $(window).scrollTop() > threshold);
          return;
        }

        const hidden = s.active && s.cur <= 0;
        $btn.toggleClass("is-active", !hidden);
      };

      toggleDesktop();
      window.addEventListener("slider:panel-change", toggleDesktop);
      window.addEventListener("slider:released", toggleDesktop);
      $(window).on("scroll", () => {
        if (!window.__APP_STATE__?.sliderState) toggleDesktop();
      });

      $btn.on("click", (event) => {
        event.preventDefault();
        document.activeElement?.blur();
        const s = window.__APP_STATE__?.sliderState;

        if (s?.active) {
          window.__APP_STATE__?.goto?.(0, 1);
        } else {
          $("html, body").stop(true).animate({
            scrollTop: 0
          }, 500);
        }
      });
      return;
    }

    const toggle = () => {
      $btn.toggleClass("is-active", $(window).scrollTop() > threshold);
    };

    toggle();
    $(window).on("scroll", toggle);
    $btn.on("click", (event) => {
      event.preventDefault();
      $("html, body").stop(true).animate({
        scrollTop: 0
      }, 500);
    });
  };

  const initUtilitiesPairs = () => {
    const amenities = document.getElementById("section-amenities");
    amenities?.querySelectorAll("svg.amenities-overlay").forEach((pinLayer) => {
      const panel = pinLayer.closest(".amenities-panel") || amenities;
      const frame = amenities.querySelector(".amenities-frame");
      const pins = [...pinLayer.querySelectorAll("[data-pair]")];
      const mapToggle = document.createElement("div");
      mapToggle.className = "utilities-map-toggle amenities-map-toggle";
      mapToggle.innerHTML = `
        <figure class="toggle-image" style="display:none">
          <img class="toggle-img object-common" alt="" loading="lazy">
        </figure>
        <span class="toggle-text"></span>
      `;
      frame.appendChild(mapToggle);
      const demoImage = panel.querySelector(".amenities-map > img.object-common")?.src;
      let activePin = null;

      const hidePinToggle = () => {
        activePin?.classList.remove("is-active");
        activePin = null;
        mapToggle.classList.remove("is-active");
      };

      amenities.querySelectorAll(".amenities-tab").forEach((button) => {
        button.addEventListener("click", hidePinToggle);
      });

      const showToggleAt = (label, target, pin = null) => {
        if (!label || !target) return;
        activePin?.classList.remove("is-active");
        activePin = pin;
        pin?.classList.add("is-active");
        const showDemoImage = pin?.dataset.pair === "internal-30" && Boolean(demoImage);
        const toggleFigure = mapToggle.querySelector(".toggle-image");
        toggleFigure.style.display = showDemoImage ? "" : "none";
        mapToggle.classList.toggle("has-image", showDemoImage);
        if (showDemoImage) {
          const toggleImage = toggleFigure.querySelector("img");
          toggleImage.src = demoImage;
          toggleImage.alt = "Bản đồ minh họa vị trí tiện ích số 30";
        }
        mapToggle.querySelector(".toggle-text").textContent = [...label.childNodes]
          .map((node) => node.textContent.trim())
          .filter(Boolean)
          .join(" ");
        const targetRect = target.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        mapToggle.style.left = `${(targetRect.left - frameRect.left + targetRect.width / 2) / rem}rem`;
        mapToggle.style.top = `${(targetRect.top - frameRect.top + targetRect.height / 2) / rem}rem`;
        mapToggle.classList.add("is-active");
      };

      const showPinToggle = (pin) => {
        const [type, value] = pin.dataset.pair.split("-");
        const number = Number(value);
        const items = panel.querySelectorAll(`.amenities-legend-group.is-${type} .amenities-columns li`);
        showToggleAt(items[number - 1]?.querySelector("p"), pin, pin);
      };

      pins.forEach((pin) => {
        pin.addEventListener("mouseenter", () => showPinToggle(pin));
        pin.addEventListener("mouseleave", hidePinToggle);
      });

      panel.querySelectorAll(".amenities-legend-group .amenities-columns li").forEach((item) => {
        const type = item.closest(".amenities-legend-group").classList.contains("is-external") ?
          "external" : "internal";
        const number = item.querySelector("span")?.textContent.trim();
        const pin = [...pins].find((candidate) =>
          candidate.dataset.pair === `${type}-${number}`
        );
        item.addEventListener("mouseenter", () => {
          if (pin) showPinToggle(pin);
          else showToggleAt(item.querySelector("p"), item.querySelector("span"));
        });
        item.addEventListener("mouseleave", hidePinToggle);
      });
    });

    const popup = document.getElementById("utilitiesDiagram");
    if (!popup) return;
    // data-pair nằm trên .item-wrapper, không phải .list-item
    const pairItems = popup.querySelectorAll(".item-wrapper[data-pair]");
    if (!pairItems.length) return;

    const toggle = document.createElement("div");
    toggle.className = "utilities-map-toggle";
    toggle.innerHTML = `
    <figure class="toggle-image">
      <img class="toggle-img object-common" src="" alt="" loading="lazy">
    </figure>
    <span class="toggle-text"></span>
  `;

    const getActivePanel = () =>
      popup.querySelector(".tab-panel.active");

    const getSvgContainer = (panel) => {
      if (!panel) return null;
      // SVG inline nằm trong inner-tab-panel.active
      return (
        panel.querySelector(".inner-tab-panel.active svg") ||
        panel.querySelector("svg")
      );
    };

    const getPairContent = (pair, source) => {
      const panel =
        source?.closest(".tab-panel") ||
        getActivePanel();
      const item =
        source?.closest(".item-wrapper[data-pair]") ||
        panel?.querySelector(
          `.item-wrapper[data-pair="${pair}"]`,
        ) ||
        popup.querySelector(`.item-wrapper[data-pair="${pair}"]`);
      return {
        image: item?.dataset.image || source?.dataset.image || "",
        text: item?.querySelector(".text")?.textContent?.trim() || "",
      };
    };

    const positionToggle = (source, pair) => {
      const panel =
        source?.closest(".tab-panel") ||
        getActivePanel();
      if (!panel) return;

      // Tìm .premises-bg bên trong .inner-tab-panel.active
      const activeInnerPanel = panel.querySelector(".inner-tab-panel.active");
      const premisesBg = activeInnerPanel?.querySelector(".premises-bg") || panel.querySelector(".premises-bg");
      if (!premisesBg) return;

      const svgContainer = getSvgContainer(panel);
      if (!svgContainer) return;

      const svgEl = svgContainer.nodeType === 1 ? svgContainer : svgContainer.querySelector("svg");
      if (!svgEl) return;

      const target = svgEl.querySelector(`[data-pair="${pair}"]`);
      if (!target || !premisesBg) return;
      if (toggle.parentNode !== premisesBg) premisesBg.appendChild(toggle);

      const premisesRect = premisesBg.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      toggle.style.left = `${targetRect.left - premisesRect.left + targetRect.width / 2}px`;
      toggle.style.top = `${targetRect.top - premisesRect.top + targetRect.height / 2 - 10}px`;
    };

    const setSvgPairActive = (pair) => {
      const panel = getActivePanel();
      if (!panel) return;
      const svgContainer = getSvgContainer(panel);
      if (!svgContainer) return;
      const svgEl = svgContainer.nodeType === 1 ? svgContainer : svgContainer.querySelector("svg");
      if (!svgEl) return;

      svgEl.querySelectorAll("[data-pair]").forEach((g) => {
        g.classList.toggle("is-active", g.getAttribute("data-pair") === pair);
      });
    };

    const setActivePair = (pair, source) => {
      pairItems.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.pair === pair);
      });
      setSvgPairActive(pair);

      if (pair) {
        toggle.classList.add("is-active");
        const content = getPairContent(pair, source);
        const toggleFigure = toggle.querySelector(".toggle-image");
        const toggleImage = toggle.querySelector(".toggle-img");
        const toggleText = toggle.querySelector(".toggle-text");

        if (content.image) {
          toggleFigure.style.display = "";
          toggleImage.src = content.image;
          toggleImage.alt = content.text;
        } else {
          toggleFigure.style.display = "none";
          toggleImage.src = "";
        }

        if (toggleText) toggleText.textContent = content.text;
        positionToggle(source, pair);
      } else {
        toggle.classList.remove("is-active");
      }
    };

    // Đảm bảo toggle nằm trong đúng inner-tab-panel khi chuyển tab
    const ensureToggleInActivePanel = () => {
      const activePanel = getActivePanel();
      if (!activePanel) return;
      // Tìm .premises-bg bên trong .inner-tab-panel.active
      const activeInnerPanel = activePanel.querySelector(".inner-tab-panel.active");
      if (!activeInnerPanel) return;
      const premisesBg = activeInnerPanel.querySelector(".premises-bg");
      if (!premisesBg) return;
      if (toggle.parentNode !== premisesBg) {
        premisesBg.appendChild(toggle);
      }
    };

    pairItems.forEach((item) => {
      item.addEventListener("mouseenter", () =>
        setActivePair(item.dataset.pair, item),
      );
      item.addEventListener("mouseleave", () => setActivePair(""));
    });

    const addSvgHoverListeners = () => {
      const activePanel = getActivePanel();
      if (!activePanel) return;
      const svgContainer = getSvgContainer(activePanel);
      if (!svgContainer) return;
      const svgEl = svgContainer.nodeType === 1 ? svgContainer : svgContainer.querySelector("svg");
      if (!svgEl) return;

      svgEl.querySelectorAll("[data-pair]").forEach((g) => {
        g.style.cursor = "pointer";
        g.addEventListener("mouseenter", () =>
          setActivePair(g.getAttribute("data-pair"), g),
        );
        g.addEventListener("mouseleave", () => setActivePair(""));
      });
    };

    ensureToggleInActivePanel();

    addSvgHoverListeners();

    popup.querySelectorAll(".tab-btn").forEach((button) => {
      button.addEventListener("click", () => {
        setActivePair("");
        setTimeout(() => {
          addSvgHoverListeners();
          ensureToggleInActivePanel();
        }, 350);
      });
    });

    popup.querySelectorAll(".inner-tab-btn").forEach((button) => {
      button.addEventListener("click", () => {
        setActivePair("");
        setTimeout(() => {
          addSvgHoverListeners();
          ensureToggleInActivePanel();
        }, 350);
      });
    });
  };

  const initContactModal = () => {
    const modal = document.querySelector(".js-modal-overlay");
    if (!modal) return;

    const openButtons = document.querySelectorAll("[data-modal-open]");
    const closeButtons = document.querySelectorAll(
      "[data-modal-close], .popup-form__close"
    );

    const openModal = () => {
      modal.classList.add("is-open");
      document.body.style.overflow = 'hidden';
      // WinScroll.stop();
      freezeWindow(true);
      window.__APP_STATE__?.observer?.disable();
    };
    const closeModal = () => {
      modal.classList.remove("is-open");
      document.body.style.overflow = '';
      freezeWindow(false);
      if (window.__APP_STATE__?.sliderState?.active) {
        window.__APP_STATE__?.observer?.enable();
      }
    };

    openButtons.forEach((btn) => btn.addEventListener("click", openModal));
    closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Esc") closeModal();
    });
  };

  window.WebFontConfig = {
    custom: {
      families: [
        "Montserrat:n3,n4,n5,n6,n7",
      ],
      urls: [
        "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
      ],
    },
  };

  (() => {
    const wf = document.createElement("script");
    wf.src = "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js";
    wf.type = "text/javascript";
    wf.async = "true";
    const s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(wf, s);
  })();

  const initLocationRegional = () => {
    const section = document.querySelector('.section-location-regional');
    if (!section || typeof Swiper === 'undefined') return;
    const groupsEl = section.querySelector('.regional-groups');
    if (!groupsEl || !groupsEl.querySelector('.swiper-slide')) return;
    const outer = new Swiper(groupsEl, {
      slidesPerView: 1,
      speed: 650,
      loop: false,
      allowTouchMove: false,
      autoHeight: true,
    });
    const photos = [...section.querySelectorAll('.regional-photos')].map(element => new Swiper(element, {
      slidesPerView: 1,
      spaceBetween: 16,
      speed: 650,
      nested: true,
      loop: false,
      breakpoints: { 768: { slidesPerView: 2, spaceBetween: 30 } },
    }));
    const previous = section.querySelector('.regional-prev');
    const next = section.querySelector('.regional-next');
    const play = section.querySelector('.regional-play');
    let timer;
    let visible = false;
    let paused = false;
    let enterAtEnd = false;
    let dragging = false;
    const stop = () => window.clearTimeout(timer);
    const schedule = () => {
      stop();
      if (!visible || document.hidden || paused || dragging || outer.animating) return;
      const current = photos[outer.activeIndex];
      if (current.animating || (current.isEnd && outer.isEnd)) return;
      // Hold the final pair for a full interval before advancing the minute group.
      timer = window.setTimeout(() => {
        if (current.isEnd) outer.slideNext();
        else current.slideNext();
      }, 3000);
    };
    const updateControls = () => {
      previous.disabled = outer.isBeginning;
      next.disabled = outer.isEnd;
    };
    outer.on('slideChange', () => {
      stop();
      photos[outer.activeIndex].update();
      photos[outer.activeIndex].slideTo(enterAtEnd ? photos[outer.activeIndex].slides.length - 1 : 0, 0);
      enterAtEnd = false;
      updateControls();
    });
    outer.on('slideChangeTransitionEnd', schedule);
    photos.forEach(slider => {
      let gesture;
      slider.on('touchStart', (_, event) => {
        const point = event.touches?.[0] || event;
        gesture = { x: point.clientX, y: point.clientY, beginning: slider.isBeginning, end: slider.isEnd };
        dragging = true;
        stop();
      });
      slider.on('sliderFirstMove', stop);
      slider.on('touchEnd', (_, event) => {
        dragging = false;
        const point = event.changedTouches?.[0] || event;
        if (gesture && event.type !== 'pointercancel' && event.type !== 'touchcancel' && !outer.animating) {
          const dx = point.clientX - gesture.x;
          const dy = point.clientY - gesture.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0 && gesture.end && !outer.isEnd) outer.slideNext();
            else if (dx > 0 && gesture.beginning && !outer.isBeginning) {
              enterAtEnd = true;
              outer.slidePrev();
            }
          }
        }
        gesture = null;
        schedule();
      });
      slider.on('slideChangeTransitionStart', stop);
      slider.on('slideChangeTransitionEnd', schedule);
      slider.on('resize', schedule);
    });
    previous.addEventListener('click', () => outer.slidePrev());
    next.addEventListener('click', () => outer.slideNext());
    play.addEventListener('click', () => {
      paused = !paused;
      play.setAttribute('aria-pressed', String(paused));
      play.setAttribute('aria-label', paused ? 'Tiếp tục trình chiếu' : 'Tạm dừng trình chiếu');
      play.textContent = paused ? 'Tiếp tục' : 'Tạm dừng';
      schedule();
    });
    const syncVisibility = () => {
      const bounds = section.getBoundingClientRect();
      visible = isDesktop() ? section.classList.contains('is-active') : bounds.top < innerHeight && bounds.bottom > 0;
      schedule();
    };
    new IntersectionObserver(syncVisibility).observe(section);
    new MutationObserver(syncVisibility).observe(section, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('slider:panel-change', syncVisibility);
    window.addEventListener('resize', syncVisibility);
    document.addEventListener('visibilitychange', syncVisibility);
    updateControls();
    syncVisibility();
  };

  const initLocationIconsReveal = () => {
    const section = document.querySelector('.section-top-location');
    const map = section?.querySelector('.location-map');
    if (!map) return;
    const desktop = window.matchMedia('(min-width: 1025px)');
    let mapVisible = false;
    const sync = () => {
      section.classList.toggle('is-icons-visible', desktop.matches
        ? section.classList.contains('is-active') : mapVisible);
    };
    new IntersectionObserver(([entry]) => {
      mapVisible = entry.isIntersecting;
      sync();
    }, { threshold: .3 }).observe(map);
    new MutationObserver(sync).observe(section, {
      attributes: true,
      attributeFilter: ['class'],
    });
    desktop.addEventListener('change', sync);
    sync();
  };

  const initLocationTabs = () => {
    const section = document.querySelector('.section-top-location');
    if (!section) return;
    const tabs = [...section.querySelectorAll('[role="tab"]')];
    const panels = [...section.querySelectorAll('[role="tabpanel"]')];
    const track = section.querySelector('.location-tabs');
    if (!tabs.length || !track) return;
    let active = 0;
    let autoplayTimer;
    let isVisible = false;
    const content = section.querySelector('.location-content') || section;
    const stopAutoplay = () => window.clearTimeout(autoplayTimer);
    const startAutoplay = () => {
      stopAutoplay();
      if (tabs.length < 2 || !isVisible || document.hidden ||
        content.matches(':hover') || content.contains(document.activeElement)) return;
      autoplayTimer = window.setTimeout(() => select(active + 1), 5000);
    };
    const select = (index, focus = false) => {
      active = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === active));
        tab.tabIndex = i === active ? 0 : -1;
        panels[i].hidden = i !== active;
      });
      const tab = tabs[active];
      const left = tab.offsetLeft - tabs[0].offsetLeft;
      if (left < track.scrollLeft) track.scrollLeft = left;
      else if (left + tab.offsetWidth > track.scrollLeft + track.clientWidth) {
        track.scrollLeft = left + tab.offsetWidth - track.clientWidth;
      }
      if (focus) tab.focus({
        preventScroll: true
      });
      startAutoplay();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        const next = {
          ArrowRight: active + 1,
          ArrowLeft: active - 1,
          Home: 0,
          End: tabs.length - 1
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        event.stopPropagation();
        select(next, true);
      });
    });
    section.querySelector('.location-arrow.is-prev')?.addEventListener('click', () => select(active - 1));
    section.querySelector('.location-arrow.is-next')?.addEventListener('click', () => select(active + 1));
    content.addEventListener('mouseenter', stopAutoplay);
    content.addEventListener('mouseleave', startAutoplay);
    content.addEventListener('focusin', stopAutoplay);
    content.addEventListener('focusout', () => {
      window.setTimeout(startAutoplay, 0);
    });
    document.addEventListener('visibilitychange', startAutoplay);
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      startAutoplay();
    }, {
      threshold: 0
    });
    observer.observe(section);
  };

  const initAmenitiesFloors = () => {
    const section = document.querySelector('.section-top-amenities');
    if (!section) return;
    const heading = section.querySelector('.title-common-primary');
    if (heading && typeof gsap !== 'undefined') gsap.set(heading, { x: 0, xPercent: 0 });
    const map = section.querySelector('.amenities-map');
    const desktop = window.matchMedia('(min-width: 1025px)');
    let mapVisible = false;
    const syncReveal = () => {
      const visible = desktop.matches ? section.classList.contains('is-active') : mapVisible;
      if (section.classList.contains('is-amenities-visible') !== visible) {
        section.classList.toggle('is-amenities-visible', visible);
      }
    };
    if (map) new IntersectionObserver(([entry]) => {
      mapVisible = entry.isIntersecting;
      syncReveal();
    }, { threshold: .2 }).observe(map);
    new MutationObserver(syncReveal).observe(section, {
      attributes: true,
      attributeFilter: ['class'],
    });
    desktop.addEventListener('change', syncReveal);
    syncReveal();
    const tabs = [...section.querySelectorAll('.amenities-floor[role="tab"]')];
    const images = [...section.querySelectorAll('[data-amenities-floor]')];
    let running = [];
    images.forEach(image => image.decode?.().catch(() => {}));
    const highlight = number => {
      section.querySelectorAll('[data-amenity]').forEach(item => {
        item.classList.toggle('is-highlighted', Boolean(number) && item.dataset.amenity === number);
      });
    };
    const itemFrom = target => target instanceof Element ? target.closest('[data-amenity]') : null;
    section.addEventListener('pointerover', event => highlight(itemFrom(event.target)?.dataset.amenity));
    section.addEventListener('pointerout', event => highlight(itemFrom(event.relatedTarget)?.dataset.amenity));
    section.addEventListener('focusin', event => highlight(itemFrom(event.target)?.dataset.amenity));
    section.addEventListener('focusout', event => highlight(itemFrom(event.relatedTarget)?.dataset.amenity));
    const select = (tab, focus = false) => {
      if (tab.getAttribute('aria-selected') === 'true') {
        if (focus) tab.focus();
        return;
      }
      const wrapper = section.querySelector('.amenities-wrapper');
      const beforeHeight = wrapper?.getBoundingClientRect().height;
      running.forEach(animation => animation.cancel());
      running = [];
      tabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(item.getAttribute('aria-controls'));
        if (panel) panel.hidden = !active;
      });
      section.classList.toggle('is-floor-four', tab.dataset.floor === '4');
      highlight(null);
      images.forEach(image => {
        const active = image.dataset.amenitiesFloor === tab.dataset.floor;
        image.classList.toggle('is-active', active);
        image.setAttribute('aria-hidden', String(!active));
      });
      {
        const timing = { duration: 450, easing: 'cubic-bezier(.22, 1, .36, 1)' };
        const media = images.filter(image => image.dataset.amenitiesFloor === tab.dataset.floor);
        media.forEach(element => running.push(element.animate([
          { transform: 'scale(1.1)' }, { transform: 'scale(1)' },
        ], { duration: 700, easing: timing.easing })));
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) running.push(panel.animate([
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], timing));
        if (wrapper && beforeHeight && window.matchMedia('(max-width: 1024.98px)').matches) {
          const afterHeight = wrapper.getBoundingClientRect().height;
          running.push(wrapper.animate([
            { height: `${beforeHeight}px`, overflow: 'hidden' },
            { height: `${afterHeight}px`, overflow: 'hidden' },
          ], timing));
        }
      }
      if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        event.stopPropagation();
        select(tabs[next], true);
      });
    });
  };

  const initAmenitiesDrawers = () => {
    const groups = [...document.querySelectorAll('.amenities-legend-group')];
    const animations = new Map();
    const setOpen = (group, open) => {
      if (group.classList.contains('is-open') === open) return;
      const before = group.getBoundingClientRect();
      const columns = group.querySelector('.amenities-columns');
      const contentOpacity = columns ? getComputedStyle(columns).opacity : '0';
      animations.get(group)?.forEach(animation => animation.cancel());
      group.classList.toggle('is-open', open);
      group.querySelector('.amenities-toggle')?.setAttribute('aria-expanded', String(open));
      const after = group.getBoundingClientRect();
      const timing = {
        duration: 550,
        easing: 'cubic-bezier(.22, 1, .36, 1)'
      };
      const resize = group.animate([{
        height: `${before.height}px`,
        flexBasis: `${before.width}px`,
        minWidth: '0',
        overflow: 'hidden'
      },
      {
        height: `${after.height}px`,
        flexBasis: `${after.width}px`,
        minWidth: '0',
        overflow: 'hidden'
      }
      ], timing);
      const running = [resize];
      // Keep text at its expanded width while the outer panel reveals it.
      // Otherwise wrapping and scrollbars change on every animation frame.
      if (columns) {
        const width = `${open ? after.width : before.width}px`;
        running.push(columns.animate([{
          width,
          display: 'grid',
          overflow: 'hidden'
        },
        {
          width,
          display: 'grid',
          overflow: 'hidden'
        }
        ], timing));
        running.push(columns.animate([{
          opacity: open ? 0 : contentOpacity
        },
        {
          opacity: open ? 1 : 0
        }
        ], {
          duration: open ? 300 : 150,
          delay: open ? 140 : 0,
          fill: 'both'
        }));
      }
      animations.set(group, running);
      resize.onfinish = () => {
        if (animations.get(group) !== running) return;
        running.forEach(animation => animation.cancel());
        animations.delete(group);
      };
    };
    groups.forEach(group => {
      const button = group.querySelector('.amenities-toggle');
      const close = group.querySelector('.amenities-close');
      button?.addEventListener('click', () => {
        const willOpen = !group.classList.contains('is-open');
        groups.forEach(item => {
          if (item !== group) setOpen(item, false);
        });
        setOpen(group, willOpen);
      });
      close?.addEventListener('click', () => {
        setOpen(group, false);
        button?.focus();
      });
    });
  };

  const innerTabs = () => {
    const tabs = document.querySelectorAll('.js-inner-tabs');

    tabs.forEach(function (tab) {
      const buttons = tab.querySelectorAll('.inner-tab-btn');
      const panels = tab.querySelectorAll('.inner-tab-panel');

      buttons.forEach(function (button) {
        if (button.getAttribute('role') === 'tab') {
          button.addEventListener('keydown', function (event) {
            const enabled = [...buttons].filter(item => !item.disabled);
            const index = enabled.indexOf(button);
            const targets = {
              ArrowRight: (index + 1) % enabled.length,
              ArrowLeft: (index - 1 + enabled.length) % enabled.length,
              Home: 0,
              End: enabled.length - 1
            };
            if (!(event.key in targets)) return;
            event.preventDefault();
            const target = enabled[targets[event.key]];
            target.focus();
            target.click();
          });
        }

        button.addEventListener('click', function () {
          const target = button.dataset.tab;
          const nextPanel = tab.querySelector(`#${target}`);
          const currentPanel = tab.querySelector('.inner-tab-panel.active');

          if (!nextPanel || button.disabled) return;

          // Cancel pending transitions before a rapid click selects another panel.
          gsap.killTweensOf(panels);

          // Button
          buttons.forEach(function (item) {
            const active = item === button;
            item.classList.toggle('active', active);
            if (item.getAttribute('role') === 'tab') {
              item.setAttribute('aria-selected', String(active));
              item.tabIndex = active ? 0 : -1;
            }
          });

          if (currentPanel === nextPanel) {
            gsap.set(nextPanel, { autoAlpha: 1 });
            return;
          }

          // Fade out panel hiện tại
          if (currentPanel) {
            gsap.to(currentPanel, {
              autoAlpha: 0,
              duration: 0.2,
              ease: 'power1.inOut',
              onComplete: function () {
                currentPanel.classList.remove('active');

                // Panel mới
                nextPanel.classList.add('active');

                gsap.fromTo(
                  nextPanel, {
                  autoAlpha: 0
                }, {
                  autoAlpha: 1,
                  duration: 0.25,
                  ease: 'power1.out'
                }
                );
              }
            });
          }
        });
      });
    });
  };

  const initMasterplanUnitLinks = (svg) => {
    svg.querySelectorAll('[data-unit-type]').forEach((unit) => {
      unit.classList.add('js-premises-detail-item');
      unit.dataset.template = 'masterplan-studio-detail';
      unit.setAttribute('role', 'button');
      unit.setAttribute('focusable', 'false');
      unit.setAttribute('aria-label', 'Xem mặt bằng căn hộ');
      unit.setAttribute('aria-haspopup', 'dialog');
    });
  };

  const initMasterplanTowerPicker = () => {
    document.querySelectorAll('.masterplan-guide-toggle').forEach(trigger => {
      const guide = trigger.closest('.masterplan-guide');
      const list = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!guide || !list) return;
      const close = () => {
        list.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      };
      trigger.addEventListener('click', () => {
        const open = list.hidden;
        list.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
      });
      trigger.addEventListener('keydown', event => {
        if (event.key !== 'ArrowDown') return;
        event.preventDefault();
        list.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        list.querySelector('a')?.focus();
      });
      guide.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        close();
        trigger.focus({ preventScroll: true });
      });
      list.addEventListener('click', event => {
        const link = event.target.closest('a');
        if (!link) return;
        close();
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const picker = document.querySelector('.js-masterplan-tower');
        if (!picker) return;
        const tower = new URL(link.href, window.location.href).searchParams.get('tower');
        if (!tower) return;
        event.preventDefault();
        event.stopPropagation();
        picker.dispatchEvent(new CustomEvent('masterplan:select-tower', { detail: tower }));
        picker.closest('.section-masterplan-article')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      document.addEventListener('pointerdown', event => {
        if (!guide.contains(event.target)) close();
      });
      guide.addEventListener('focusout', event => {
        if (!guide.contains(event.relatedTarget)) close();
      });
      window.matchMedia('(min-width: 768px)').addEventListener('change', close);
    });
  };

  const initMasterplanTooltips = () => {
    const map = document.querySelector('#section-masterplan .masterplan-map');
    if (!map) return;
    const cards = [...map.querySelectorAll('[data-tower-info]')];
    const links = [...map.querySelectorAll('.masterplan-tower-link[data-tower]')];
    let active = null;
    let timer;
    const position = () => {
      if (!active) return;
      const { link, card } = active;
      const anchor = link.querySelector('circle');
      if (!anchor) return;
      const point = anchor.getBoundingClientRect();
      const bounds = map.getBoundingClientRect();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      card.style.left = `${Math.max(.3, Math.min((point.x + point.width / 2 - bounds.x) / rem + .5, (bounds.width - card.offsetWidth) / rem - .12))}rem`;
      card.style.top = `${Math.max(.25, Math.min((point.y + point.height / 2 - bounds.y) / rem + .45, (bounds.height - card.offsetHeight) / rem - .12))}rem`;
    };
    const hide = () => {
      cards.forEach(card => {
        card.classList.remove('is-visible');
        card.setAttribute('aria-hidden', 'true');
        card.inert = true;
      });
      links.forEach(link => link.classList.remove('is-highlighted'));
      active = null;
    };
    const scheduleHide = () => { clearTimeout(timer); timer = setTimeout(hide, 160); };
    links.forEach(link => {
      const card = cards.find(item => item.dataset.towerInfo === link.dataset.tower);
      if (!card) return;
      link.setAttribute('href', card.querySelector('a').getAttribute('href'));
      const show = () => {
        clearTimeout(timer);
        hide();
        active = { link, card };
        card.inert = false;
        card.setAttribute('aria-hidden', 'false');
        card.classList.add('is-visible');
        link.classList.add('is-highlighted');
        position();
      };
      link.addEventListener('pointerenter', show);
      link.addEventListener('focusin', show);
      link.addEventListener('pointerleave', scheduleHide);
      link.addEventListener('focusout', scheduleHide);
      card.addEventListener('pointerenter', () => clearTimeout(timer));
      card.addEventListener('focusin', () => clearTimeout(timer));
      card.addEventListener('pointerleave', scheduleHide);
      card.addEventListener('focusout', scheduleHide);
    });
    map.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
    new ResizeObserver(position).observe(map);
  };

  const initMasterplanTowerLinks = () => {
    const target = document.querySelector('.section-masterplan-article');
    const map = document.querySelector('#section-masterplan .masterplan-map');
    const pageUrl = map ? map.getAttribute('data-masterplan-url') : '';
    if (!target && !pageUrl) return;
    const panels = [...document.querySelectorAll('.panel')];
    const targetIndex = target ? panels.indexOf(target) : -1;
    const isPhone = () => window.matchMedia('(max-width: 767.98px)').matches;
    const navigate = () => {
      if (!target) return;
      if (isDesktop()) {
        const { sliderState, goto } = window.__APP_STATE__;
        if (!goto || !sliderState?.active || sliderState.animating || sliderState.switching || targetIndex < 0) return;
        goto(targetIndex, targetIndex > sliderState.cur ? 1 : -1);
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    const towerSlugFromRegion = (region) => {
      if (!region) return '';
      const label = (region.getAttribute('data-label') || '').trim().toLowerCase();
      const pair = (region.getAttribute('data-item-pair') || '').replace(/^region-/, '').toLowerCase();
      const options = document.querySelectorAll('#masterplan-tower-options a, .js-masterplan-tower [role="option"]');
      let match = '';
      options.forEach(option => {
        let slug = (option.dataset.value || '').toLowerCase();
        if (!slug && option.getAttribute('href')) {
          slug = (new URL(option.getAttribute('href'), window.location.href).searchParams.get('tower') || '').toLowerCase();
        }
        const text = (option.textContent || '').trim().toLowerCase();
        const token = slug.replace(/^the-/, '');
        if (!token) return;
        if (slug === pair || token === pair || text === label || label === token || label.endsWith(' ' + token)) {
          match = slug;
        }
      });
      return match;
    };
    const openTower = (region) => {
      if (!target) return;
      const picker = document.querySelector('.js-masterplan-tower');
      const tower = towerSlugFromRegion(region);
      if (picker && tower) {
        picker.dispatchEvent(new CustomEvent('masterplan:select-tower', { detail: tower }));
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const goToMasterplanPage = (region) => {
      if (!pageUrl) return;
      const url = new URL(pageUrl, window.location.href);
      if (isPhone()) {
        const tower = towerSlugFromRegion(region);
        if (tower) url.searchParams.set('tower', tower);
      }
      url.hash = 'section-masterplan-article';
      window.location.assign(url.toString());
    };
    const followRegion = (region) => {
      if (pageUrl) {
        goToMasterplanPage(region);
        return;
      }
      if (isPhone()) openTower(region);
      else navigate();
    };
    document.querySelectorAll('.masterplan-map .tower').forEach(tower => {
      tower.style.cursor = 'pointer';
      tower.addEventListener('click', event => {
        event.preventDefault();
        followRegion(tower);
      });
    });
    if (!map) return;
    map.addEventListener('click', event => {
      const region = event.target.closest('.dmp-region');
      if (!region || !map.contains(region)) return;
      event.preventDefault();
      event.stopPropagation();
      followRegion(region);
    }, true);
  };

  const initMasterplanFloors = () => {
    document.querySelectorAll(".js-masterplan-floor, .js-masterplan-tower").forEach((picker) => {
      const section = picker.closest(".section-masterplan-article");
      const isTowerPicker = picker.classList.contains('js-masterplan-tower');
      const image = isTowerPicker ? null : section?.querySelector('#masterplan-floor-image');
      const trigger = picker.querySelector('[role="combobox"]');
      const list = picker.querySelector('[role="listbox"]');
      const options = Array.from(picker.querySelectorAll('[role="option"]'));
      if (!trigger || !list || !options.length || (!isTowerPicker && !image)) return;
      let active = 0;

      const highlight = (index) => {
        active = Math.max(0, Math.min(options.length - 1, index));
        options.forEach((option, i) => option.classList.toggle("is-focused", i === active));
        trigger.setAttribute("aria-activedescendant", options[active].id);
        const option = options[active];
        if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
        else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight)
          list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
      };
      const close = () => {
        list.hidden = true;
        picker.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
        trigger.removeAttribute("aria-activedescendant");
      };
      const open = () => {
        list.hidden = false;
        picker.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        highlight(options.findIndex(option => option.getAttribute("aria-selected") === "true"));
      };
      const updateFloor = (option) => {
        const source = option.dataset.plan;
        if (image && source && image.getAttribute("src") !== source) image.src = source;
        if (isTowerPicker) {
          section.dataset.tower = option.dataset.value;
        } else if (image) {
          image.alt = `Mặt bằng ${option.textContent.trim()}: The Horizon, The Harmony và The Hill`;
          section.dataset.floor = option.dataset.value;
        }
        trigger.querySelector(".floor-current").textContent = option.textContent.trim();
        options.forEach(item => item.setAttribute("aria-selected", String(item === option)));
      };

      trigger.addEventListener("click", () => list.hidden ? open() : close());
      list.addEventListener("mousedown", event => event.preventDefault());
      options.forEach(option => option.addEventListener("click", () => {
        updateFloor(option);
        close();
        trigger.focus({ preventScroll: true });
      }));
      trigger.addEventListener("keydown", (event) => {
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          if (list.hidden) open();
          else highlight(event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : active + (event.key === "ArrowDown" ? 1 : -1));
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (list.hidden) open();
          else { updateFloor(options[active]); close(); }
        } else if (event.key === "Escape") {
          event.preventDefault();
          close();
        } else if (event.key === "Tab") close();
      });
      document.addEventListener("pointerdown", event => { if (!picker.contains(event.target)) close(); });
      picker.addEventListener("focusout", event => {
        if (event.relatedTarget && !picker.contains(event.relatedTarget)) close();
      });
      picker.addEventListener("wheel", event => event.stopPropagation(), { passive: true });
      picker.addEventListener("touchmove", event => event.stopPropagation(), { passive: true });
      if (isTowerPicker) {
        picker.addEventListener('masterplan:select-tower', event => {
          const option = options.find(item => item.dataset.value === event.detail);
          if (!option) return;
          updateFloor(option);
          close();
        });
      }
      const requestedTower = isTowerPicker ? new URLSearchParams(window.location.search).get('tower') : null;
      updateFloor(options.find(option => requestedTower && option.dataset.value === requestedTower)
        || options.find(option => option.getAttribute("aria-selected") === "true") || options[0]);
    });
  };

  // Any canvas[data-wave-src] is initialized automatically on every page.
  const initCanvasWaves = (scope = document) => {
    const cleanups = [];
    const waves = new Map();
    let frame = 0;
    let lastTime = 0;
    const tick = time => {
      frame = 0;
      // Decorative waves need only 30fps, including on high-refresh displays.
      if (!lastTime || time - lastTime >= 1000 / 60 - 1) {
        const elapsed = lastTime ? Math.min(time - lastTime, 100) : 0;
        lastTime = time;
        waves.forEach(wave => wave.update(elapsed));
      }
      if (waves.size) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (waves.size && !frame) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      } else if (!waves.size) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const syncHandlers = [];
    const syncAll = () => syncHandlers.forEach(sync => sync());
    document.addEventListener('visibilitychange', syncAll);
    scope.querySelectorAll('canvas[data-wave-src]').forEach(canvas => {
      const context = canvas.getContext('2d');
      if (!context) return;
      const source = new Image();
      const texture = document.createElement('canvas');
      const textureContext = texture.getContext('2d');
      if (!textureContext) return;
      let visible = false;
      let ready = false;
      let width = 0;
      let height = 0;
      const option = (name, fallback, min, max) => {
        const value = Number(canvas.dataset[name]);
        return canvas.dataset[name] !== undefined && Number.isFinite(value)
          ? Math.min(max, Math.max(min, value)) : fallback;
      };
      const speed = option('waveSpeed', 1, 0, 10);
      const amplitude = option('waveAmplitude', .055, 0, .2);
      const initialPhase = option('wavePhase', 0, -100, 100);
      const paddingRatio = Math.max(.08, amplitude + .015);
      const topOnly = canvas.dataset.waveEdge === 'top';
      let phase = initialPhase;

      const draw = () => {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, width, height);
        if (!width || !height) return;
        const padding = height * paddingRatio;
        const imageHeight = height - padding * (topOnly ? 1 : 2);
        if (amplitude === 0) {
          context.drawImage(texture, 0, padding, width, imageHeight);
          return;
        }
        // Shear each strip between shared endpoints so thin SVG lines stay continuous.
        // Keep the same bounded draw count instead of returning to per-pixel rendering.
        const stripWidth = Math.max(1, Math.ceil(width / 256));
        const displacement = x => {
          const progress = x / width;
          return Math.sin(progress * Math.PI * 4 + phase)
            * Math.sin(progress * Math.PI) * height * amplitude;
        };
        if (topOnly) {
          // A two-triangle mesh maps each strip onto a trapezoid:
          // the top follows the wave while both bottom vertices stay at height.
          const step = Math.max(1, Math.ceil(width / 128));
          for (let x = 0; x < width; x += step) {
            const right = Math.min(x + step, width);
            const span = right - x;
            const leftTop = padding + displacement(x);
            const rightTop = padding + displacement(right);
            const slope = (rightTop - leftTop) / span;
            const triangle = (points, shear, scale, offset) => {
              context.save();
              context.beginPath();
              context.moveTo(...points[0]);
              context.lineTo(...points[1]);
              context.lineTo(...points[2]);
              context.closePath();
              context.clip();
              context.setTransform(1, shear, 0, scale, x, offset);
              context.drawImage(texture, x, 0, span, texture.height, 0, 0, span, imageHeight);
              context.restore();
            };
            triangle([[x, leftTop], [right, rightTop], [x, height]],
              slope, (height - leftTop) / imageHeight, leftTop);
            triangle([[right, rightTop], [right, height], [x, height]],
              0, (height - rightTop) / imageHeight, rightTop);
          }
          return;
        }
        let startOffset = displacement(0);
        for (let x = 0; x < width; x += stripWidth) {
          const sliceWidth = Math.min(stripWidth, width - x);
          const endOffset = displacement(x + sliceWidth);
          context.setTransform(1, (endOffset - startOffset) / sliceWidth, 0, 1, x, padding + startOffset);
          context.drawImage(texture, x, 0, sliceWidth, texture.height, 0, 0, sliceWidth, imageHeight);
          startOffset = endOffset;
        }
        context.setTransform(1, 0, 0, 1, 0, 0);
      };
      const wave = {
        update(elapsed) {
          // Full-page sliders can hide panels without moving them offscreen.
          if (!canvas.isConnected || (canvas.checkVisibility && !canvas.checkVisibility({
            checkOpacity: true, checkVisibilityCSS: true,
          }))) return;
          phase += elapsed * .0007 * speed;
          draw();
        },
      };
      const sync = () => {
        waves.delete(canvas);
        if (ready && visible && !document.hidden && width && height) {
          draw();
          if (speed > 0 && amplitude > 0) waves.set(canvas, wave);
        }
        schedule();
      };
      const resize = () => {
        const bounds = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.round(bounds.width * ratio);
        height = Math.round(bounds.height * ratio);
        canvas.width = texture.width = width;
        canvas.height = height;
        texture.height = Math.max(1, Math.round(height * (1 - paddingRatio * 2)));
        context.imageSmoothingEnabled = textureContext.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = textureContext.imageSmoothingQuality = 'high';
        if (ready && width && height) textureContext.drawImage(source, 0, 0, texture.width, texture.height);
        sync();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      const intersectionObserver = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        sync();
      });
      intersectionObserver.observe(canvas);
      cleanups.push(() => {
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        source.onload = null;
      });
      syncHandlers.push(sync);
      source.onload = () => {
        ready = true;
        resize();
      };
      source.src = canvas.dataset.waveSrc;
    });
    return () => {
      cleanups.forEach(cleanup => cleanup());
      document.removeEventListener('visibilitychange', syncAll);
      waves.clear();
      cancelAnimationFrame(frame);
    };
  };

  initCanvasWaves();
  initOverviewCounters();

  waitForCriticalImages().then(() => {
    initIntro();
  });

  smoothScroll();
  initMasterplanTowerPicker();
  initMasterplanFloors();
  initLocationTabs();
  initLocationIconsReveal();
  initLocationRegional();
  initAmenitiesDrawers();
  initAmenitiesFloors();
  detectDevice();
  buttonTop();
  initContactPopup();
  triggerClick();
  fadeInAnimation();
  scrollPage();
  initPanelZoomAnimation();
  initMobileNavLinks();
  sliderKeyvisual();
  projectGallerySlider();
  projectVideosSlider();
  projectDocumentsSlider();
  newsSlider();
  window.addEventListener("scroll", handleDarkBg, {
    passive: true
  });
  sliderProjects();
  dragGalleryImage();
  partnersSlider();
  galleryImagesSlider();
  galleryVideoSlider();
  projectsSectionSlider();
  projectsUtilitiesSlider();
  recruitmentPositionSlider();
  recruitmentFileInput();
  projectsDetailScroll();
  initTabs();
  initTabsFromHash();
  createPopup({
    id: "mediaPopup",
  });
  createPopup({
    id: "premisesPopup",
    hasTitle: false,
  });
  createPopup({
    id: "premisesDetailPopup",
    className: "premises-detail-popup",
  });
  initPopup();
  inlineSvg().then(() => {
    initUtilitiesPairs();
    initMasterplanTowerLinks();
    initMasterplanTooltips();
  });
  initContactModal();
  initTopGallery();
  initDeveloperSliders();
  innerTabs();
})();
