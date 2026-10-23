// Foreign Students in Korea (1999–2026) & Global Origin Countries (2025 Visa Data)
// OpenStreetMap Leaflet + D3.js Dual-Mode Visualization

document.addEventListener("DOMContentLoaded", () => {
  const tooltip = d3.select("#tooltip");
  const loadingOverlay = document.getElementById("loadingOverlay");

  // Bilingual i18n Dictionary
  const i18n = {
    en: {
      kickerText: "INTERNATIONAL STUDENTS IN KOREA CARTOGRAPHY · 1999–2026 ARCHIVE",
      pageTitle: "Foreign Students in Korea (1999–2026) — Interactive Map",
      mainTitle: "Foreign Students in Korea",
      mainSubtitle: "Continuous accumulation across 17 Korean provinces (1999–2026) and global countries of origin (2025 statistics).",
      modeKorea: "Domestic Distribution (1999–2026)",
      modeWorld: "Country of Origin (2025 Data)",

      // Korea Mode Stats
      statIdx1Korea: "01 / TOTAL",
      statIdx2Korea: "02 / COHORT",
      statIdx3Korea: "03 / FOCUS",
      statIdx4Korea: "04 / METROPOLIS",
      card1KoreaLabel: "National Total",
      card1KoreaSub: year => `Students across 17 provinces in ${year}`,
      card2KoreaLabel: "Total Circles",
      card2KoreaSub: unit => `1 circle = ${unit} students`,
      card3KoreaLabel: "Seoul Concentration",
      card3KoreaSub: pct => `${pct}% of national total`,
      card4KoreaLabel: "Capital Area (Seoul+Gyeonggi+Incheon)",
      card4KoreaSub: pct => `${pct}% of all foreign students`,

      // World Mode Stats
      statIdx1World: "01 / TOTAL ENROLLMENT",
      statIdx2World: "02 / ORIGIN COUNTRIES",
      statIdx3World: "03 / PRIMARY ORIGIN",
      statIdx4World: "04 / VISA PROPORTION",
      card1WorldLabel: "Total International Students (2025)",
      card1WorldSub: "Nationwide degree & training enrollment",
      card2WorldLabel: "Countries of Origin",
      card2WorldSub: "Across 6 global continents",
      card3WorldLabel: "Top Origin Country",
      card3WorldSub: (country, pct) => `${country} (${pct}% share)`,
      card4WorldLabel: "Visa Breakdown",
      card4WorldSub: (d2Pct, d4Pct) => `D-2 Degree: ${d2Pct}% | D-4 Language: ${d4Pct}%`,

      // Korea Controls
      timeline: "Timeline",
      play: "▶ Play",
      pause: "⏸ Pause",
      prev: "◀ Prev",
      next: "Next ▶",
      speed: "Speed",
      cohortScale: "Cohort Scale",
      scale50: "1 circle = 50 students",
      scale100: "1 circle = 100 students",
      scale25: "1 circle = 25 students (dense)",
      scaleSub: unit => `1 circle = ${unit} students`,

      // World Controls
      worldPanelTitle: "Origin Countries",
      visaFilter: "Visa Category",
      visaAll: "All (D2/D4)",
      visaD2: "D-2 Degree",
      visaD4: "D-4 Language",
      visaGuideToggle: "Visa Guide",
      d2GuideName: "Degree Programs (70.7%)",
      d2GuideDesc: "Bachelor's, Master's, Doctoral & exchange programs at universities.",
      d4GuideName: "Language & Training (29.3%)",
      d4GuideDesc: "Non-degree Korean language institutes (어학당) & general training.",
      continentFilter: "Filter by Continent",
      contAll: "All Continents (189)",
      contAsia: "Asia",
      contEurope: "Europe",
      contNA: "North America",
      contSA: "South America",
      contAfrica: "Africa",
      contOceania: "Oceania",
      topOriginsTitle: "Top Origin Countries",
      countryFinder: "Search & Jump to Country",
      selectPrompt: "— Choose or search a country —",
      calloutOriginRank: rank => `#${rank} ORIGIN COUNTRY`,
      calloutStudents: "students in Korea",
      calloutDegree: "Degree",
      calloutLanguage: "Language",
      calloutShare: pct => `${pct}% of all international students`,
      calloutBesideNote: "Pacific Ocean Anchor · Land Area Colored",
      worldLegendTitle: "Student Volume (Color Temperature)",
      tempHotLabel: "Most (50k+)",
      tempCoolLabel: "Fewest (<100)",
      calloutClose: "Close",
      sourceTag: "Source: Higher Education in Korea / Ministry of Justice Immigration Statistics",

      // Tooltips
      tooltipTotal: year => `Total Students (${year}):`,
      tooltipCircles: "Circles on Map:",
      tooltipShare: "National Share:",
      tooltipRank: "National Rank:",
      rankVal: rank => `#${rank > 0 ? rank : '—'} of 17`,
      worldRankVal: (rank, total) => `#${rank} of ${total} countries`,
      tooltipD2: "D-2 Degree Students:",
      tooltipD4: "D-4 Language / Training:",
      clickToZoom: "Click country or circle to view",
      showMenu: "Show Menu",
      hideMenu: "Hide",
      modeLanguage: "Linguistic Groups",
      languagePanelTitle: "Linguistic Groups",
      showLanguagePanel: "Language Legend",
      hideLanguagePanel: "Hide",
      languageSearchPlaceholder: "Search language or country...",
      countriesCountLabel: cnt => `${cnt} countries`,
      studentsCountLabel: "students",
      statIdx1Lang: "01 / TOTAL",
      statIdx2Lang: "02 / DIVERSITY",
      statIdx3Lang: "03 / MOST WIDESPREAD",
      statIdx4Lang: "04 / TOP 3 REACH",
      card1LangLabel: "Total International Students",
      card1LangSub: "Across 182 countries worldwide",
      card2LangLabel: "Linguistic Groups Represented",
      card2LangSub: "Organized by number of speaking countries",
      card3LangLabel: "Most Widespread Language",
      card3LangSub: (name, count, students) => `${name} (${count} countries · ${students} students)`,
      card4LangLabel: "Top 3 Languages by Reach",
      card4LangSub: "English, French & Spanish (87 countries combined)",
      loading: "Loading geographic dataset..."
    },
    ko: {
      kickerText: "대한민국 외국인 유학생 통계지도 · 1999–2026 아카이브",
      pageTitle: "국내 외국인 유학생 현황 (1999–2026) 및 출신국 통계 — 인터랙티브 지도",
      mainTitle: "국내 외국인 유학생 현황",
      mainSubtitle: "1999년부터 2026년까지 대한민국 전국 17개 시·도별 유학생 누적 추이 및 2025년 유학 비자 출신국 현황",
      modeKorea: "전국 시·도별 분포 (1999–2026)",
      modeWorld: "출신 국가별 현황 (2025 통계)",

      // Korea Mode Stats
      statIdx1Korea: "01 / 전국 총계",
      statIdx2Korea: "02 / 원 단위",
      statIdx3Korea: "03 / 서울 비중",
      statIdx4Korea: "04 / 수도권 집중",
      card1KoreaLabel: "전국 총 유학생",
      card1KoreaSub: year => `${year}년 전국 17개 시·도 총 유학생`,
      card2KoreaLabel: "지도 내 총 원",
      card2KoreaSub: unit => `1개 원 = ${unit}명`,
      card3KoreaLabel: "서울 집중도",
      card3KoreaSub: pct => `전국 대비 ${pct}%`,
      card4KoreaLabel: "수도권 (서울·경기·인천)",
      card4KoreaSub: pct => `전체 유학생의 ${pct}%`,

      // World Mode Stats
      statIdx1World: "01 / 총 발급 건수",
      statIdx2World: "02 / 출신 국가군",
      statIdx3World: "03 / 최다 출신국",
      statIdx4World: "04 / 비자 유형 비율",
      card1WorldLabel: "2025년 총 체류 유학생",
      card1WorldSub: "학위 과정(D-2) 및 어학연수(D-4) 합계",
      card2WorldLabel: "출신 국가 수",
      card2WorldSub: "전 세계 6개 대륙 189개국",
      card3WorldLabel: "최다 출신국",
      card3WorldSub: (country, pct) => `${country} (전체 ${pct}%)`,
      card4WorldLabel: "비자 유형 비율",
      card4WorldSub: (d2Pct, d4Pct) => `D-2 학위과정: ${d2Pct}% | D-4 연수: ${d4Pct}%`,

      // Korea Controls
      timeline: "타임라인",
      play: "▶ 재생",
      pause: "⏸ 일시정지",
      prev: "◀ 이전",
      next: "다음 ▶",
      speed: "재생 속도",
      cohortScale: "표시 단위",
      scale50: "1개 원 = 50명",
      scale100: "1개 원 = 100명",
      scale25: "1개 원 = 25명 (밀집)",
      scaleSub: unit => `1개 원 = ${unit}명`,

      // World Controls
      worldPanelTitle: "출신국 통계",
      visaFilter: "비자 유형",
      visaAll: "전체 (D2/D4)",
      visaD2: "D-2 학위",
      visaD4: "D-4 어학연수",
      visaGuideToggle: "비자 안내",
      d2GuideName: "정규 학위과정 (70.7%)",
      d2GuideDesc: "전문학사·학사·석사·박사 및 교환학생 등 대학 정규 학위과정",
      d4GuideName: "일반·어학연수 (29.3%)",
      d4GuideDesc: "대학 부설 한국어학당 어학연수 및 직업훈련 등 비학위 연수과정",
      continentFilter: "대륙별 필터",
      contAll: "전체 대륙 (189개국)",
      contAsia: "아시아주",
      contEurope: "유럽주",
      contNA: "북아메리카주",
      contSA: "남아메리카주",
      contAfrica: "아프리카주",
      contOceania: "오세아니아주",
      topOriginsTitle: "최다 유학생 출신국",
      countryFinder: "국가 바로가기 및 검색",
      selectPrompt: "— 국가를 선택하세요 —",
      calloutOriginRank: rank => `출신국 순위 #${rank}위`,
      calloutStudents: "국내 체류 유학생",
      calloutDegree: "학위과정",
      calloutLanguage: "어학연수",
      calloutShare: pct => `전체 외국인 유학생의 ${pct}%`,
      calloutBesideNote: "태평양 앵커 · 국토 영역 강조 표시됨",
      worldLegendTitle: "유학생 규모 (색온도 단계)",
      tempHotLabel: "최다 (5만+)",
      tempCoolLabel: "최소 (100 미만)",
      calloutClose: "닫기",
      sourceTag: "출처: 교육부 고등교육통계 / 법무부 출입국·외국인정책본부 통계연보",

      // Tooltips
      tooltipTotal: year => `${year}년 총 유학생:`,
      tooltipCircles: "지도 내 원 개수:",
      tooltipShare: "전국 비중:",
      tooltipRank: "전국 순위:",
      rankVal: rank => `17개 시·도 중 ${rank > 0 ? rank : '—'}위`,
      worldRankVal: (rank, total) => `전체 ${total}개국 중 ${rank}위`,
      tooltipD2: "D-2 학위과정 유학생:",
      tooltipD4: "D-4 일반·어학연수:",
      clickToZoom: "국가나 원을 클릭하면 상세 정보가 표시됩니다",
      showMenu: "메뉴 보기",
      hideMenu: "숨기기",
      modeLanguage: "언어권별 현황",
      languagePanelTitle: "언어권별 유학생",
      showLanguagePanel: "언어권 범례 보기",
      hideLanguagePanel: "숨기기",
      languageSearchPlaceholder: "언어 또는 국가 검색...",
      countriesCountLabel: cnt => `${cnt}개국`,
      studentsCountLabel: "명",
      statIdx1Lang: "01 / 전체 총계",
      statIdx2Lang: "02 / 언어 다양성",
      statIdx3Lang: "03 / 최다 사용국",
      statIdx4Lang: "04 / 3대 사용국 범위",
      card1LangLabel: "총 외국인 유학생",
      card1LangSub: "전 세계 182개 출신국 합계",
      card2LangLabel: "대표 언어권 수",
      card2LangSub: "사용 국가 수 순위로 정렬",
      card3LangLabel: "최다 사용 국가 언어권",
      card3LangSub: (name, count, students) => `${name} (${count}개국 · ${students}명)`,
      card4LangLabel: "상위 3대 다국가 언어권",
      card4LangSub: "영어, 프랑스어, 스페인어 (총 87개국)",
      loading: "지리 데이터 불러오는 중..."
    }
  };

  const krShortNames = {
    "Seoul": "서울",
    "Busan": "부산",
    "Daegu": "대구",
    "Incheon": "인천",
    "Gwangju": "광주",
    "Daejeon": "대전",
    "Ulsan": "울산",
    "Sejong": "세종",
    "Gyeonggi": "경기",
    "Gangwon": "강원",
    "Chungbuk": "충북",
    "Chungnam": "충남",
    "Jeonbuk": "전북",
    "Jeonnam": "전남",
    "Gyeongbuk": "경북",
    "Gyeongnam": "경남",
    "Jeju": "제주"
  };

  let currentLang = localStorage.getItem("preferred_lang") || "en";
  let currentMode = "korea"; // "korea" or "world"
  let selectedVisa = "all";  // "all", "d2", "d4"
  let selectedContinent = "all"; // "all", "Asia", "Europe", ...

  function hideLoading() {
    if (loadingOverlay) {
      loadingOverlay.style.opacity = "0";
      setTimeout(() => {
        if (loadingOverlay.parentNode) {
          loadingOverlay.remove();
        }
      }, 300);
    }
  }

  // Load external dataset (Universal support: checks embedded window data first, then fetches data.json)
  if (window.FOREIGN_STUDENTS_DATA) {
    hideLoading();
    initVisualization(window.FOREIGN_STUDENTS_DATA);
  } else {
    d3.json("data.json")
      .then(data => {
        hideLoading();
        initVisualization(data);
      })
      .catch(err => {
        console.error("Error loading data.json via fetch:", err);
        if (loadingOverlay) {
          loadingOverlay.innerHTML = `
            <div style="text-align: center; padding: 20px; max-width: 450px;">
              <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
              <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Unable to load dataset</div>
              <div style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Please ensure <code>data.js</code> or <code>data.json</code> is in the same folder, or run a local web server (e.g. <code>python3 -m http.server</code> or VSCode Live Server).
              </div>
            </div>
          `;
        }
      });
  }

  function initVisualization(data) {
    const { koreaGeoData, rawData, provincePoints, provinceMeta, countryVisaData = [] } = data;

    // Smooth Numeric Rolling Counter for Stat Cards
    const statAnimators = {};
    function animateNumericValue(elementId, targetValue, duration = 380, formatter = d3.format(",")) {
      const el = document.getElementById(elementId);
      if (!el) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        el.textContent = formatter(targetValue);
        el.dataset.currentVal = targetValue;
        return;
      }

      const prevVal = parseFloat(el.dataset.currentVal) || parseFloat(el.textContent.replace(/[^0-9.-]/g, "")) || 0;
      if (prevVal === targetValue) {
        el.textContent = formatter(targetValue);
        return;
      }

      if (statAnimators[elementId]) {
        cancelAnimationFrame(statAnimators[elementId]);
      }

      const startTime = performance.now();
      const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

      function frame(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const currentInterp = prevVal + (targetValue - prevVal) * easeOutQuart(progress);
        el.textContent = formatter(Math.round(currentInterp));

        if (progress < 1) {
          statAnimators[elementId] = requestAnimationFrame(frame);
        } else {
          el.textContent = formatter(targetValue);
          el.dataset.currentVal = targetValue;
          delete statAnimators[elementId];
        }
      }

      statAnimators[elementId] = requestAnimationFrame(frame);
    }

    // Coordinated Sidebar Controls Panel Transitions
    let isPanelCollapsed = false;

    function switchControlsPanel(hideId, showId) {
      const hideEl = document.getElementById(hideId);
      const showEl = document.getElementById(showId);

      if (hideEl) {
        hideEl.classList.remove("panel-visible");
        hideEl.classList.add("panel-hidden");
        hideEl.style.display = "none";
      }

      if (showEl) {
        showEl.style.display = "flex";
        showEl.classList.remove("is-user-collapsed");
        showEl.classList.remove("panel-hidden");
        showEl.classList.add("panel-visible");
      }
    }

    // Toggle (hide/show) the informative menu panel
    function toggleMenuPanel(forceState) {
      if (typeof forceState === "boolean") {
        isPanelCollapsed = forceState;
      } else {
        isPanelCollapsed = !isPanelCollapsed;
      }

      const koreaPanel = document.getElementById("koreaControls");
      const worldPanel = document.getElementById("worldControls");
      const floatBtn = document.getElementById("btnShowMapPanel");

      if (isPanelCollapsed) {
        if (koreaPanel) koreaPanel.classList.add("is-user-collapsed");
        if (worldPanel) worldPanel.classList.add("is-user-collapsed");
        if (floatBtn) floatBtn.style.display = "inline-flex";
      } else {
        if (koreaPanel) koreaPanel.classList.remove("is-user-collapsed");
        if (worldPanel) worldPanel.classList.remove("is-user-collapsed");
        if (floatBtn) floatBtn.style.display = "none";
      }
    }

    const btnHideKorea = document.getElementById("btnHideKoreaPanel");
    if (btnHideKorea) {
      btnHideKorea.addEventListener("click", () => toggleMenuPanel(true));
    }
    const btnHideWorld = document.getElementById("btnHideWorldPanel");
    if (btnHideWorld) {
      btnHideWorld.addEventListener("click", () => toggleMenuPanel(true));
    }
    const btnShowMap = document.getElementById("btnShowMapPanel");
    if (btnShowMap) {
      btnShowMap.addEventListener("click", () => toggleMenuPanel(false));
    }

    // Sidebar Legends Management
    function updateSidebarLegends(mode) {
      const sidebarLegends = document.getElementById("sidebarLegends");
      const cardKorea = document.getElementById("legendCardKorea");
      const cardWorld = document.getElementById("legendCardWorld");
      const cardLang = document.getElementById("languageControls");

      const badgeKorea = document.getElementById("badgeKoreaLegend");
      const badgeWorld = document.getElementById("badgeWorldLegend");
      const badgeLang = document.getElementById("badgeLanguageLegend");

      [cardKorea, cardWorld, cardLang].forEach(card => {
        if (card) {
          card.classList.remove("is-active-mode");
          card.classList.add("is-collapsed");
          card.style.display = "none";
          const header = card.querySelector(".legend-card-header");
          if (header) header.setAttribute("aria-expanded", "false");
        }
      });

      if (badgeKorea) badgeKorea.style.display = "none";
      if (badgeWorld) badgeWorld.style.display = "none";
      if (badgeLang) badgeLang.style.display = "none";

      if (mode === "korea") {
        // In Domestic Distribution mode, the map legend is integrated inside the Timeline box (#koreaControls)
        if (sidebarLegends) sidebarLegends.style.display = "none";
      } else if (mode === "world") {
        // In Country of Origin mode, the student volume legend is in the same box as origin countries menu (#worldControls)
        if (sidebarLegends) sidebarLegends.style.display = "none";
      } else if (mode === "language") {
        if (sidebarLegends) sidebarLegends.style.display = "flex";
        if (cardLang) {
          cardLang.style.display = "flex";
          cardLang.classList.add("is-active-mode");
          cardLang.classList.remove("is-collapsed");
          const header = cardLang.querySelector(".legend-card-header");
          if (header) header.setAttribute("aria-expanded", "true");
        }
        if (badgeLang) badgeLang.style.display = "inline-flex";
      }
    }

    function showLanguageControls() {
      updateSidebarLegends("language");
    }

    function hideLanguageControls() {
      // In sidebar layout, legends remain in place outside the map
    }

    // Legend Accordion Click & Mode Selection Listeners
    document.querySelectorAll(".sidebar-legend-card .legend-card-header").forEach(header => {
      header.addEventListener("click", function (e) {
        e.stopPropagation();
        const card = this.closest(".sidebar-legend-card");
        if (!card) return;
        const legendType = card.dataset.legend;
        // If clicking on a collapsed/inactive card, switch to that mode
        if (card.classList.contains("is-collapsed") && legendType && currentMode !== legendType) {
          setMode(legendType);
          return;
        }
        // Otherwise toggle collapsed state
        card.classList.toggle("is-collapsed");
        const isCollapsed = card.classList.contains("is-collapsed");
        this.setAttribute("aria-expanded", (!isCollapsed).toString());
      });
      header.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    // Clicking legend card to switch mode
    const cardKoreaEl = document.getElementById("legendCardKorea");
    if (cardKoreaEl) {
      cardKoreaEl.addEventListener("click", (e) => {
        if (e.target.closest("select, input, button, .legend-chevron")) return;
        if (currentMode !== "korea") setMode("korea");
      });
    }
    const cardWorldEl = document.getElementById("legendCardWorld");
    if (cardWorldEl) {
      cardWorldEl.addEventListener("click", (e) => {
        if (e.target.closest("select, input, button, .legend-chevron")) return;
        if (currentMode !== "world") setMode("world");
      });
    }
    const cardLangEl = document.getElementById("languageControls");
    if (cardLangEl) {
      cardLangEl.addEventListener("click", (e) => {
        if (e.target.closest("select, input, button, .legend-chevron, .language-item")) return;
        if (currentMode !== "language") setMode("language");
      });
    }

    const langSearchInput = document.getElementById("languageSearchInput");
    if (langSearchInput) {
      langSearchInput.addEventListener("input", function () {
        renderLanguageLegendList(this.value.trim().toLowerCase());
      });
    }

    // 1. Initialize Leaflet Zoomable Map with Strict Bounds Clamping (No White Space / Cannot Slide Out of View)
    const map = L.map("chart", {
      center: [35.85, 127.85],
      zoom: 7,
      minZoom: 5.6,
      maxZoom: 18,
      maxBounds: [
        [30.5, 121.5],
        [40.5, 134.5]
      ],
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: false
    });

    // Zoom control at top right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Permanent, 100% Key-Free, Open-Access Tile Layer (ESRI World Light Gray Canvas)
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 16,
      attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
    }).addTo(map);

    // 2. Leaflet SVG Overlay Pane for D3 Elements
    L.svg({ clickable: true }).addTo(map);
    const overlay = d3.select(map.getPanes().overlayPane);
    const svg = overlay.select("svg")
      .attr("pointer-events", "none")
      .style("pointer-events", "none");

    // Korea Mode Layers (Explicit pointer-events on interactive paths/circles)
    const mapLayer = svg.append("g").attr("class", "leaflet-zoom-hide map-layer").style("pointer-events", "auto");
    const outerBorderLayer = svg.append("g").attr("class", "leaflet-zoom-hide outer-border-layer").style("pointer-events", "none");
    const circleLayer = svg.append("g").attr("class", "leaflet-zoom-hide circle-layer").style("pointer-events", "auto");
    const labelLayer = svg.append("g").attr("class", "leaflet-zoom-hide label-layer").style("pointer-events", "none");

    // High-Performance Event Delegation for Timeline Circles (Zero per-circle listener overhead)
    circleLayer
      .on("mouseover", function (event) {
        const target = event.target;
        if (target && target.classList && target.classList.contains("map-circle")) {
          const prov = target.getAttribute("data-province") || (target.__data__ && target.__data__.province);
          if (prov) {
            highlightProvince(prov, true);
            showTooltip(event, prov);
          }
        }
      })
      .on("mousemove", function (event) {
        const target = event.target;
        if (target && target.classList && target.classList.contains("map-circle")) {
          const prov = target.getAttribute("data-province") || (target.__data__ && target.__data__.province);
          if (prov) {
            moveTooltip(event, prov);
          }
        }
      })
      .on("mouseout", function (event) {
        const target = event.target;
        if (target && target.classList && target.classList.contains("map-circle")) {
          const prov = target.getAttribute("data-province") || (target.__data__ && target.__data__.province);
          if (prov) {
            highlightProvince(prov, false);
            hideTooltip();
          }
        }
      });

    // Dedicated Leaflet Panes for World Mode (Hardware-Accelerated 60fps Native Vector Layers)
    map.createPane("worldCountriesPane");
    const worldPane = map.getPane("worldCountriesPane");
    worldPane.style.zIndex = 390;
    worldPane.style.pointerEvents = "auto";

    map.createPane("worldMarkersPane");
    const worldMarkersPane = map.getPane("worldMarkersPane");
    worldMarkersPane.style.zIndex = 410;
    worldMarkersPane.style.pointerEvents = "auto";

    const worldMarkersLayer = L.layerGroup();
    const countryMarkerMap = new Map();

    let selectedCountryName = null;
    let activeCountryNameMarker = null;
    let activeCountryCalloutMarker = null;
    let activeLeaderLine = null;
    let activeLeaderAnchor = null;
    let lastCountryActionTime = 0;
    const countryLayerMap = new Map();
    const countryLayerListMap = new Map();

    // Color Temperature Scale (Hot Red -> Orange -> Amber -> Teal -> Cool Blue)
    function getCountryThermalStyle(count) {
      const val = Math.max(1, count || 1);
      // Logarithmic temperature scale from 1 to 100,000 students
      const t = Math.max(0.0, Math.min(1.0, Math.log10(val) / 5.0)); // log10(100000) = 5
      const stops = [
        { t: 0.00, rgb: [37, 99, 235], stroke: "#1d4ed8" },  // Cool Royal Blue (<10)
        { t: 0.38, rgb: [14, 165, 233], stroke: "#0284c7" }, // Sky Blue (~80, e.g. Chile)
        { t: 0.58, rgb: [20, 184, 166], stroke: "#0f766e" }, // Teal (~1,000)
        { t: 0.74, rgb: [245, 158, 11], stroke: "#d97706" }, // Warm Amber (~5,000)
        { t: 0.86, rgb: [249, 115, 22], stroke: "#ea580c" }, // Vivid Orange (~15,000)
        { t: 1.00, rgb: [239, 68, 68], stroke: "#b91c1c" }  // Hot Red (50,000–100,000)
      ];

      for (let i = 0; i < stops.length - 1; i++) {
        const s0 = stops[i];
        const s1 = stops[i + 1];
        if (t >= s0.t && t <= s1.t) {
          const u = (t - s0.t) / (s1.t - s0.t);
          const r = Math.round(s0.rgb[0] + u * (s1.rgb[0] - s0.rgb[0]));
          const g = Math.round(s0.rgb[1] + u * (s1.rgb[1] - s0.rgb[1]));
          const b = Math.round(s0.rgb[2] + u * (s1.rgb[2] - s0.rgb[2]));
          return {
            fill: `rgba(${r}, ${g}, ${b}, 0.52)`,
            stroke: s1.stroke,
            hex: `rgb(${r}, ${g}, ${b})`
          };
        }
      }
      return { fill: "rgba(239, 68, 68, 0.52)", stroke: "#b91c1c", hex: "#ef4444" };
    }

    // Precise Geographic Point-in-Polygon Ray Casting for World Countries
    function isPointInRing(lat, lng, ring) {
      let inside = false;
      const n = ring.length;
      let j = n - 1;
      for (let i = 0; i < n; i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];
        const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi);
        if (intersect) inside = !inside;
        j = i;
      }
      return inside;
    }

    function findCountryAtLatLng(lat, lng) {
      const geo = window.WORLD_COUNTRIES_GEOJSON;
      if (!geo || !geo.features) return null;
      // Normalize longitude to [-180, 180] for checking against standard bounds
      const normLng = ((lng + 180) % 360 + 360) % 360 - 180;
      for (const f of geo.features) {
        const p = f.properties;
        const b = p.bounds; // [minLat, minLng, maxLat, maxLng]
        if (b && lat >= b[0] - 0.25 && lat <= b[2] + 0.25 && normLng >= b[1] - 0.25 && normLng <= b[3] + 0.25) {
          const geom = f.geometry;
          if (geom.type === "Polygon") {
            if (isPointInRing(lat, normLng, geom.coordinates[0])) return p.country_en;
          } else if (geom.type === "MultiPolygon") {
            for (const poly of geom.coordinates) {
              if (isPointInRing(lat, normLng, poly[0])) return p.country_en;
            }
          }
        }
      }
      return null;
    }

    // Linguistic Group Definitions & 182-Country Mapping (Color Harmony System)
    let selectedLanguageGroup = null;

    const LANGUAGE_GROUPS = {
      "Vietnamese": { color: "#dc2626", en: "Vietnamese", ko: "베트남어" },
      "Chinese": { color: "#ea580c", en: "Chinese (Mandarin / Cantonese)", ko: "중국어 (보통화·광둥어)" },
      "Mongolian": { color: "#7c3aed", en: "Mongolian", ko: "몽골어" },
      "Uzbek": { color: "#059669", en: "Uzbek", ko: "우즈베크어" },
      "Nepali": { color: "#0d9488", en: "Nepali", ko: "네팔어" },
      "Burmese": { color: "#be123c", en: "Burmese", ko: "미얀마어" },
      "English": { color: "#2563eb", en: "English", ko: "영어" },
      "Russian": { color: "#0284c7", en: "Russian", ko: "러시아어" },
      "Japanese": { color: "#db2777", en: "Japanese", ko: "일본어" },
      "Indonesian / Malay": { color: "#16a34a", en: "Indonesian / Malay", ko: "인도네시아어·말레이어" },
      "French": { color: "#4f46e5", en: "French", ko: "프랑스어" },
      "Bengali": { color: "#65a30d", en: "Bengali", ko: "벵골어" },
      "Urdu": { color: "#d97706", en: "Urdu", ko: "우르두어" },
      "Spanish": { color: "#f59e0b", en: "Spanish", ko: "스페인어" },
      "German": { color: "#475569", en: "German", ko: "독일어" },
      "Thai / Lao": { color: "#9333ea", en: "Thai / Lao", ko: "태국어·라오어" },
      "Arabic": { color: "#b45309", en: "Arabic", ko: "아랍어" },
      "Turkish": { color: "#0891b2", en: "Turkish / Turkic", ko: "튀르키예어·투르크어족" },
      "Persian": { color: "#e11d48", en: "Persian (Farsi / Dari)", ko: "페르시아어" },
      "Italian": { color: "#10b981", en: "Italian", ko: "이탈리아어" },
      "Portuguese": { color: "#c026d3", en: "Portuguese", ko: "포르투갈어" },
      "Other": { color: "#64748b", en: "Other Regional Languages", ko: "기타 언어권" }
    };

    const COUNTRY_LANGUAGE_MAP = {
      "vietnam": "Vietnamese",
      "china": "Chinese",
      "taiwan": "Chinese",
      "hong kong": "Chinese",
      "macau": "Chinese",
      "korean-chinese (joseonjok)": "Chinese",
      "mongolia": "Mongolian",
      "uzbekistan": "Uzbek",
      "nepal": "Nepali",
      "bhutan": "Nepali",
      "myanmar": "Burmese",
      "japan": "Japanese",
      "bangladesh": "Bengali",
      "indonesia": "Indonesian / Malay",
      "malaysia": "Indonesian / Malay",
      "brunei": "Indonesian / Malay",
      "russia": "Russian",
      "kyrgyzstan": "Russian",
      "kazakhstan": "Russian",
      "belarus": "Russian",
      "tajikistan": "Russian",
      "ukraine": "Russian",
      "korean-russian (koryo-saram)": "Russian",
      "moldova": "Russian",
      "pakistan": "Urdu",
      "germany": "German",
      "austria": "German",
      "thailand": "Thai / Lao",
      "laos": "Thai / Lao",
      "turkey": "Turkish",
      "azerbaijan": "Turkish",
      "turkmenistan": "Turkish",
      "italy": "Italian",
      "iran": "Persian",
      "afghanistan": "Persian",
      "france": "French",
      "belgium": "French",
      "switzerland": "French",
      "cameroon": "French",
      "senegal": "French",
      "dr congo": "French",
      "republic of the congo": "French",
      "cote d'ivoire": "French",
      "madagascar": "French",
      "gabon": "French",
      "rwanda": "French",
      "burundi": "French",
      "mali": "French",
      "guinea": "French",
      "burkina faso": "French",
      "togo": "French",
      "benin": "French",
      "central african republic": "French",
      "niger": "French",
      "chad": "French",
      "haiti": "French",
      "luxembourg": "French",
      "comoros": "French",
      "spain": "Spanish",
      "mexico": "Spanish",
      "colombia": "Spanish",
      "peru": "Spanish",
      "ecuador": "Spanish",
      "chile": "Spanish",
      "argentina": "Spanish",
      "dominican republic": "Spanish",
      "venezuela": "Spanish",
      "bolivia": "Spanish",
      "paraguay": "Spanish",
      "panama": "Spanish",
      "el salvador": "Spanish",
      "costa rica": "Spanish",
      "guatemala": "Spanish",
      "honduras": "Spanish",
      "nicaragua": "Spanish",
      "uruguay": "Spanish",
      "cuba": "Spanish",
      "equatorial guinea": "Spanish",
      "brazil": "Portuguese",
      "portugal": "Portuguese",
      "angola": "Portuguese",
      "mozambique": "Portuguese",
      "timor-leste": "Portuguese",
      "cape verde": "Portuguese",
      "saudi arabia": "Arabic",
      "morocco": "Arabic",
      "egypt": "Arabic",
      "tunisia": "Arabic",
      "algeria": "Arabic",
      "jordan": "Arabic",
      "sudan": "Arabic",
      "united arab emirates": "Arabic",
      "iraq": "Arabic",
      "yemen": "Arabic",
      "syria": "Arabic",
      "palestine": "Arabic",
      "oman": "Arabic",
      "libya": "Arabic",
      "lebanon": "Arabic",
      "bahrain": "Arabic",
      "qatar": "Arabic",
      "kuwait": "Arabic",
      "mauritania": "Arabic",
      "somalia": "Arabic",
      "united states": "English",
      "united kingdom": "English",
      "canada": "English",
      "australia": "English",
      "new zealand": "English",
      "ireland": "English",
      "india": "English",
      "philippines": "English",
      "nigeria": "English",
      "ghana": "English",
      "kenya": "English",
      "uganda": "English",
      "south africa": "English",
      "zimbabwe": "English",
      "zambia": "English",
      "malawi": "English",
      "liberia": "English",
      "sierra leone": "English",
      "botswana": "English",
      "south sudan": "English",
      "gambia": "English",
      "jamaica": "English",
      "bahamas": "English",
      "trinidad and tobago": "English",
      "guyana": "English",
      "belize": "English",
      "barbados": "English",
      "saint lucia": "English",
      "saint vincent and the grenadines": "English",
      "saint kitts and nevis": "English",
      "antigua and barbuda": "English",
      "dominica": "English",
      "fiji": "English",
      "papua new guinea": "English",
      "solomon islands": "English",
      "kiribati": "English",
      "tonga": "English",
      "samoa": "English",
      "british overseas citizen": "English",
      "british overseas territories": "English",
      "lesotho": "English",
      "eswatini": "English",
      "namibia": "English",
      "singapore": "English"
    };

    // Returns the color temperature style for a country feature in World mode
    function getWorldCountryThermalStyle(feature) {
      const p = feature && feature.properties;
      if (!p) {
        return {
          className: "country-polygon",
          fillColor: "#e5e3db",
          fillOpacity: 0.30,
          color: "#d4d0c5",
          weight: 0.6,
          opacity: 0.5
        };
      }

      const cData = countryVisaData.find(x =>
        (x.country_en && p.country_en && x.country_en.toLowerCase() === p.country_en.toLowerCase()) ||
        (x.country_kr && p.country_kr && x.country_kr === p.country_kr)
      );

      // Continent filter in World mode
      if (selectedContinent !== "all") {
        const continent = cData ? cData.continent_en : "";
        if (continent !== selectedContinent) {
          return {
            className: "country-polygon",
            fillColor: "#e5e3db",
            fillOpacity: 0.15,
            color: "#ded8cb",
            weight: 0.5,
            opacity: 0.35
          };
        }
      }

      const count = cData ? getCountryCount(cData) : (p.total || 0);
      const isSelected = selectedCountryName && p.country_en && (p.country_en.toLowerCase() === selectedCountryName.toLowerCase());

      if (count > 0) {
        const thermal = getCountryThermalStyle(count);
        return {
          className: isSelected ? "country-polygon country-polygon-active" : "country-polygon",
          fillColor: thermal.hex,
          fillOpacity: isSelected ? 0.95 : (selectedCountryName ? 0.38 : 0.70),
          color: isSelected ? "#0f172a" : (selectedCountryName ? "#cbd5e1" : "#ffffff"),
          weight: isSelected ? 2.4 : 0.75,
          opacity: isSelected ? 1 : 0.9
        };
      }

      // 0 students or unrepresented country
      return {
        className: "country-polygon",
        fillColor: "#e5e3db",
        fillOpacity: 0.28,
        color: "#d4d0c5",
        weight: 0.55,
        opacity: 0.5
      };
    }

    // Update all country polygons to their temperature map styles
    function updateWorldCountriesThermalStyle() {
      if (!worldCountryGeoLayer || currentMode !== "world") return;
      worldCountryGeoLayer.eachLayer(layer => {
        if (!layer.feature) return;
        const style = getWorldCountryThermalStyle(layer.feature);
        layer.setStyle(style);
      });
    }

    function getWrappedWorldGeoJSON() {
      const raw = window.WORLD_COUNTRIES_GEOJSON || { type: "FeatureCollection", features: [] };
      if (!raw || !raw.features) return raw;
      const feats = [];
      for (let i = 0; i < raw.features.length; i++) {
        feats.push(raw.features[i]);
      }
      // Cloned features shifted by +360 longitude so world can drift continuously without gaps
      for (let i = 0; i < raw.features.length; i++) {
        const f = raw.features[i];
        const geom = f.geometry;
        let coords;
        if (geom.type === "Polygon") {
          coords = geom.coordinates.map(ring => ring.map(pt => [pt[0] + 360, pt[1]]));
        } else if (geom.type === "MultiPolygon") {
          coords = geom.coordinates.map(poly => poly.map(ring => ring.map(pt => [pt[0] + 360, pt[1]])));
        } else {
          coords = geom.coordinates;
        }
        feats.push({
          type: "Feature",
          properties: f.properties,
          geometry: {
            type: geom.type,
            coordinates: coords
          }
        });
      }
      return { type: "FeatureCollection", features: feats };
    }

    // Leaflet GeoJSON Polygon Layer for World Countries (With +360 wrapping for seamless continuous sliding)
    const worldCountryGeoLayer = L.geoJSON(getWrappedWorldGeoJSON(), {
      pane: "worldCountriesPane",
      interactive: true,
      style: function (feature) {
        if (currentMode === "world") {
          return getWorldCountryThermalStyle(feature);
        }
        return {
          className: "country-polygon",
          fillColor: "#cbd5e1",
          fillOpacity: 0.15,
          color: "#94a3b8",
          weight: 0.95,
          opacity: 0.55
        };
      },
      onEachFeature: function (feature, layer) {
        const p = feature.properties;
        if (p && p.country_en) {
          const en = p.country_en.toLowerCase();
          countryLayerMap.set(en, layer);
          if (!countryLayerListMap.has(en)) countryLayerListMap.set(en, []);
          countryLayerListMap.get(en).push(layer);
          if (p.country_kr) {
            countryLayerMap.set(p.country_kr, layer);
            if (!countryLayerListMap.has(p.country_kr)) countryLayerListMap.set(p.country_kr, []);
            countryLayerListMap.get(p.country_kr).push(layer);
          }
        }

        layer.on({
          mouseover: function (e) {
            if (currentMode === "language") {
              const cName = (p.country_en || "").toLowerCase();
              const lang = COUNTRY_LANGUAGE_MAP[cName] || "Other";
              layer.setStyle({
                fillOpacity: 0.90,
                color: "#0f172a",
                weight: 1.25
              });
              if (layer.bringToFront) layer.bringToFront();
              const cData = countryVisaData.find(x => x.country_en && x.country_en.toLowerCase() === p.country_en.toLowerCase());
              showLanguageTooltip(e.originalEvent || e, p, cData, lang);
              return;
            }

            const cData = countryVisaData.find(x => x.country_en && x.country_en.toLowerCase() === p.country_en.toLowerCase());
            if (selectedCountryName !== p.country_en) {
              const count = cData ? getCountryCount(cData) : (p.total || 0);
              const hoverThermal = count > 0 ? getCountryThermalStyle(count) : null;
              layer.setStyle({
                fillColor: hoverThermal ? hoverThermal.hex : "#cbd5e1",
                fillOpacity: count > 0 ? 0.92 : 0.45,
                color: "#0f172a",
                weight: 1.35,
                opacity: 1
              });
              if (layer.bringToFront) layer.bringToFront();
            }
            if (cData || p) {
              showCountryTooltip(e.originalEvent || e, cData || p);
            }
          },
          mousemove: function (e) {
            moveCountryTooltip(e.originalEvent || e);
          },
          mouseout: function (e) {
            if (currentMode === "language") {
              const cName = (p.country_en || "").toLowerCase();
              const lang = COUNTRY_LANGUAGE_MAP[cName] || "Other";
              const def = LANGUAGE_GROUPS[lang] || { color: "#64748b" };
              const isTargetLang = selectedLanguageGroup && selectedLanguageGroup === lang;
              const isDimmed = selectedLanguageGroup && selectedLanguageGroup !== lang;
              layer.setStyle({
                fillColor: def.color,
                fillOpacity: isDimmed ? 0.20 : (isTargetLang ? 0.88 : 0.62),
                color: isTargetLang ? "#0f172a" : "#ffffff",
                weight: isTargetLang ? 1.4 : 0.75
              });
              hideTooltip();
              return;
            }

            if (selectedCountryName !== p.country_en) {
              if (currentMode === "world") {
                layer.setStyle(getWorldCountryThermalStyle(layer.feature));
              } else {
                worldCountryGeoLayer.resetStyle(layer);
              }
            }
            hideTooltip();
          },
          click: function (e) {
            if (e.originalEvent) {
              e.originalEvent._countryHandled = true;
              L.DomEvent.stop(e.originalEvent);
            }
            lastCountryActionTime = Date.now();
            if (currentMode === "language") {
              const cName = (p.country_en || "").toLowerCase();
              const lang = COUNTRY_LANGUAGE_MAP[cName] || "Other";
              selectedLanguageGroup = selectedLanguageGroup === lang ? null : lang;
              renderLanguageView();
              const targetItem = document.querySelector(`.language-item[data-lang="${lang}"]`);
              if (targetItem) {
                targetItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
              return;
            }
            selectCountry(p.country_en);
          }
        });

        // Tag underlying DOM path for bulletproof delegated clicks
        setTimeout(() => {
          if (layer._path) {
            layer._path.setAttribute("data-country", p.country_en);
            layer._path.style.cursor = "pointer";
          }
        }, 80);
      }
    });

    // Delegated click on #chart container to catch direct clicks on polygons or bubbles
    const chartContainerEl = document.getElementById("chart");
    if (chartContainerEl) {
      chartContainerEl.addEventListener("click", function (e) {
        if (currentMode === "korea") return;
        const target = e.target.closest("[data-country]");
        if (target && target.getAttribute("data-country")) {
          const cName = target.getAttribute("data-country");
          lastCountryActionTime = Date.now();
          if (currentMode === "language") {
            const lang = COUNTRY_LANGUAGE_MAP[cName.toLowerCase()] || "Other";
            selectedLanguageGroup = selectedLanguageGroup === lang ? null : lang;
            renderLanguageView();
            const targetItem = document.querySelector(`.language-item[data-lang="${lang}"]`);
            if (targetItem) {
              targetItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
            return;
          }
          selectCountry(cName);
        }
      });
    }

    // Dismiss active country callout when clicking blank area of map, or select country via coordinate ray-casting
    map.on("click", function (e) {
      if (Date.now() - lastCountryActionTime < 450) return;
      if (e.originalEvent && (e.originalEvent._countryHandled || e.originalEvent._stopped)) return;
      if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.closest("[data-country]")) return;

      if (currentMode === "language") {
        if (e.latlng) {
          const hitCountry = findCountryAtLatLng(e.latlng.lat, e.latlng.lng);
          if (hitCountry) {
            lastCountryActionTime = Date.now();
            const lang = COUNTRY_LANGUAGE_MAP[hitCountry.toLowerCase()] || "Other";
            selectedLanguageGroup = selectedLanguageGroup === lang ? null : lang;
            renderLanguageView();
            return;
          }
        }
        if (selectedLanguageGroup) {
          selectedLanguageGroup = null;
          renderLanguageView();
        }
        return;
      }

      if (currentMode === "world") {
        if (e.latlng) {
          const hitCountry = findCountryAtLatLng(e.latlng.lat, e.latlng.lng);
          if (hitCountry) {
            lastCountryActionTime = Date.now();
            selectCountry(hitCountry);
            return;
          }
        }
        if (selectedCountryName) {
          selectCountry(null);
        }
      }
    });

    // D3 Geo Transform using Leaflet's internal coordinates
    function projectPoint(x, y) {
      const point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }
    const transform = d3.geoTransform({ point: projectPoint });
    const pathGenerator = d3.geoPath().projection(transform);

    // Prepare point coordinates [lng, lat]
    const rawProvincePoints = {};
    for (const [pname, pts] of Object.entries(provincePoints)) {
      rawProvincePoints[pname] = pts.map((pt, i) => ({
        id: `${pname}_${i}`,
        province: pname,
        lng: pt[0],
        lat: pt[1]
      }));
    }

    const dataByYear = d3.group(rawData, d => d.Year);
    const provinceNames = Object.keys(provinceMeta);

    // Render Province Boundaries
    const provincePaths = mapLayer.selectAll(".province-path")
      .data(koreaGeoData.features, d => d.properties.name)
      .join("path")
      .attr("class", "province-path")
      .attr("id", d => `path-${d.properties.name}`)
      .on("mouseenter", function (event, d) {
        highlightProvince(d.properties.name, true);
        showTooltip(event, d.properties.name);
      })
      .on("mousemove", function (event, d) {
        moveTooltip(event, d.properties.name);
      })
      .on("mouseleave", function (event, d) {
        highlightProvince(d.properties.name, false);
        hideTooltip();
      });

    // Refined Border of Korea
    const outerBorderPaths = outerBorderLayer.selectAll(".outer-border-path")
      .data(koreaGeoData.features)
      .join("path")
      .attr("class", "outer-border-path");

    // Province Text Badges
    const labelGroups = labelLayer.selectAll(".province-label-group")
      .data(provinceNames)
      .join("g")
      .attr("class", "province-label-group");

    const labelTexts = labelGroups.append("text")
      .attr("class", "province-label-bg")
      .attr("y", -4)
      .text(d => currentLang === "ko" ? (krShortNames[d] || d) : d);

    labelGroups.append("text")
      .attr("class", "province-count-badge")
      .attr("id", d => `count-badge-${d}`)
      .attr("y", 8)
      .text("");

    // Build Chronologically Ordered Point Swarm for Korea Timeline
    let currentUnit = 50;
    let allPointsSorted = [];
    let allPointsTimestamps = [];

    function buildTimelinePoints(unit) {
      currentUnit = unit;
      const list = [];

      for (const pname of provinceNames) {
        const available = rawProvincePoints[pname] || [];
        let prevCount = 0;

        for (let yr = 1999; yr <= 2026; yr++) {
          const yearRows = dataByYear.get(yr) || [];
          const item = yearRows.find(d => d.Province === pname);
          const total = item ? item.Total : 0;
          const countNeeded = Math.round(total / unit);
          const currentCount = Math.min(countNeeded, available.length);

          if (yr === 1999) {
            for (let i = 0; i < currentCount; i++) {
              list.push({
                ...available[i],
                time: 1999.0
              });
            }
            prevCount = currentCount;
          } else {
            if (currentCount > prevCount) {
              const diff = currentCount - prevCount;
              for (let i = prevCount; i < currentCount; i++) {
                const fraction = (i - prevCount + 1) / diff;
                list.push({
                  ...available[i],
                  time: (yr - 1) + fraction
                });
              }
              prevCount = currentCount;
            }
          }
        }
      }

      list.sort((a, b) => a.time - b.time);
      allPointsSorted = list;
      allPointsTimestamps = list.map(d => d.time);
    }

    buildTimelinePoints(50);

    // Current continuous time state
    let currentTime = 2026;
    let isPlaying = false;
    let animReq = null;
    let lastTime = null;
    let playbackSpeed = 1.0;
    const totalDuration = 14000;

    // Reposition all SVG elements on Map Zoom / Pan with Direct Attribute Writes
    function updateMapPositions() {
      if (currentMode === "korea") {
        provincePaths.attr("d", pathGenerator);
        outerBorderPaths.attr("d", pathGenerator);

        labelGroups.attr("transform", d => {
          const pt = map.latLngToLayerPoint([provinceMeta[d].center[1], provinceMeta[d].center[0]]);
          return `translate(${pt.x},${pt.y})`;
        });

        const currentZoom = map.getZoom();
        const zoomScale = Math.max(0.75, Math.min(2.5, Math.pow(1.15, currentZoom - 7)));
        const baseRadius = currentUnit <= 25 ? 3.5 : (currentUnit <= 50 ? 4.2 : 5.0);
        const circleRadius = baseRadius * zoomScale;

        // Ultra-fast attribute update directly on SVG circle nodes (10x faster than D3 wrapper creation)
        const circleNodes = circleLayer.node().children;
        const totalCircles = circleNodes.length;
        for (let i = 0; i < totalCircles; i++) {
          const c = circleNodes[i];
          const d = c.__data__;
          if (d) {
            const pt = map.latLngToLayerPoint([d.lat, d.lng]);
            c.setAttribute("cx", pt.x);
            c.setAttribute("cy", pt.y);
            c.setAttribute("r", circleRadius);
          }
        }
      }
    }

    // Coalesce drag/move events into animation frames for 60fps silky panning in Korea mode
    let posUpdateScheduled = false;
    function scheduleMapPositionsUpdate() {
      if (currentMode !== "korea") return; // Let Leaflet hardware-accelerate world zoom/pan
      if (!posUpdateScheduled) {
        posUpdateScheduled = true;
        requestAnimationFrame(() => {
          updateMapPositions();
          posUpdateScheduled = false;
        });
      }
    }

    map.on("zoom", scheduleMapPositionsUpdate);
    map.on("move", scheduleMapPositionsUpdate);
    map.on("zoomend", function () {
      if (currentMode === "korea") updateMapPositions();
    });
    map.on("viewreset", function () {
      if (currentMode === "korea") updateMapPositions();
    });

    let lastRenderedYearInt = -1;
    let lastRenderedUnit = -1;
    let lastRenderedLang = "";
    let cachedKoreaStats = null;

    // Render Frame for Korea at continuous time T (1999.0 to 2026.0)
    function renderKoreaTime(t) {
      t = Math.max(1999.0, Math.min(2026.0, t));
      const currentYearInt = Math.min(2026, Math.floor(t));
      const tLang = i18n[currentLang];

      const visibleCount = d3.bisectRight(allPointsTimestamps, t);
      const visiblePoints = allPointsSorted.slice(0, visibleCount);

      const currentZoom = map.getZoom();
      const zoomScale = Math.max(0.75, Math.min(2.5, Math.pow(1.15, currentZoom - 7)));
      const baseRadius = currentUnit <= 25 ? 3.5 : (currentUnit <= 50 ? 4.2 : 5.0);
      const circleRadius = baseRadius * zoomScale;

      // Incremental D3 Join: update is a NO-OP because stationary circles do not move
      circleLayer.selectAll(".map-circle")
        .data(visiblePoints, d => d.id)
        .join(
          enter => enter.append("circle")
            .attr("class", "map-circle empty-circle")
            .attr("fill", "none")
            .attr("stroke", "#2563eb")
            .attr("stroke-width", 1.3)
            .attr("stroke-opacity", 0.85)
            .attr("cx", d => map.latLngToLayerPoint([d.lat, d.lng]).x)
            .attr("cy", d => map.latLngToLayerPoint([d.lat, d.lng]).y)
            .attr("r", circleRadius)
            .attr("data-province", d => d.province),
          update => update, // Zero DOM mutations for existing circles at 60fps!
          exit => exit.remove()
        );

      // Cache and update province badges & stat labels only when integer year changes (27 times vs 840 times!)
      if (currentYearInt !== lastRenderedYearInt || currentUnit !== lastRenderedUnit || currentLang !== lastRenderedLang) {
        lastRenderedYearInt = currentYearInt;
        lastRenderedUnit = currentUnit;
        lastRenderedLang = currentLang;

        const yearData = dataByYear.get(currentYearInt) || [];
        const lookup = new Map(yearData.map(d => [d.Province, d]));

        for (const pname of provinceNames) {
          const item = lookup.get(pname);
          const total = item ? item.Total : 0;
          const badgeEl = document.getElementById(`count-badge-${pname}`);
          if (badgeEl) {
            badgeEl.textContent = total > 0 ? d3.format(",")(total) : "";
          }
        }

        const national = yearData.reduce((sum, d) => sum + d.Total, 0);
        const seoulTotal = lookup.get("Seoul") ? lookup.get("Seoul").Total : 0;
        const gyeonggiTotal = lookup.get("Gyeonggi") ? lookup.get("Gyeonggi").Total : 0;
        const incheonTotal = lookup.get("Incheon") ? lookup.get("Incheon").Total : 0;
        const capitalSum = seoulTotal + gyeonggiTotal + incheonTotal;
        const capitalPct = national > 0 ? ((capitalSum / national) * 100).toFixed(1) : 0;
        const seoulPct = national > 0 ? ((seoulTotal / national) * 100).toFixed(1) : 0;

        cachedKoreaStats = { national, seoulTotal, capitalSum, capitalPct, seoulPct };

        if (currentMode === "korea") {
          const s1 = document.getElementById("statIdx1");
          if (s1) s1.textContent = tLang.statIdx1Korea;
          const s2 = document.getElementById("statIdx2");
          if (s2) s2.textContent = tLang.statIdx2Korea;
          const s3 = document.getElementById("statIdx3");
          if (s3) s3.textContent = tLang.statIdx3Korea;
          const s4 = document.getElementById("statIdx4");
          if (s4) s4.textContent = tLang.statIdx4Korea;

          const l1 = document.getElementById("labelCard1");
          if (l1) l1.textContent = tLang.card1KoreaLabel;
          const sub1 = document.getElementById("statCard1Sub");
          if (sub1) sub1.textContent = tLang.card1KoreaSub(currentYearInt);

          const l2 = document.getElementById("labelCard2");
          if (l2) l2.textContent = tLang.card2KoreaLabel;
          const sub2 = document.getElementById("statCard2Sub");
          if (sub2) sub2.textContent = tLang.card2KoreaSub(currentUnit);

          const l3 = document.getElementById("labelCard3");
          if (l3) l3.textContent = tLang.card3KoreaLabel;
          const sub3 = document.getElementById("statCard3Sub");
          if (sub3) sub3.textContent = tLang.card3KoreaSub(seoulPct);

          const l4 = document.getElementById("labelCard4");
          if (l4) l4.textContent = tLang.card4KoreaLabel;
          const sub4 = document.getElementById("statCard4Sub");
          if (sub4) sub4.textContent = tLang.card4KoreaSub(capitalPct);
        }
      }

      if (currentMode === "korea" && cachedKoreaStats) {
        if (isPlaying) {
          // Instant 60fps odometer readout during active playback
          const c1 = document.getElementById("statCard1Val");
          if (c1) { c1.textContent = d3.format(",")(cachedKoreaStats.national); c1.dataset.currentVal = cachedKoreaStats.national; }
          const c2 = document.getElementById("statCard2Val");
          if (c2) { c2.textContent = d3.format(",")(visiblePoints.length); c2.dataset.currentVal = visiblePoints.length; }
          const c3 = document.getElementById("statCard3Val");
          if (c3) { c3.textContent = d3.format(",")(cachedKoreaStats.seoulTotal); c3.dataset.currentVal = cachedKoreaStats.seoulTotal; }
          const c4 = document.getElementById("statCard4Val");
          if (c4) { c4.textContent = d3.format(",")(cachedKoreaStats.capitalSum); c4.dataset.currentVal = cachedKoreaStats.capitalSum; }
        } else {
          // Smooth numeric tween rollup during scrubs, steps, and mode switches
          animateNumericValue("statCard1Val", cachedKoreaStats.national);
          animateNumericValue("statCard2Val", visiblePoints.length);
          animateNumericValue("statCard3Val", cachedKoreaStats.seoulTotal);
          animateNumericValue("statCard4Val", cachedKoreaStats.capitalSum);
        }
      }

      const yLabel = document.getElementById("yearLabel");
      if (yLabel) yLabel.textContent = currentYearInt;

      const sliderElem = document.getElementById("yearSlider");
      if (sliderElem) {
        sliderElem.value = t;
        const progressPct = Math.max(0, Math.min(100, ((t - 1999) / (2026 - 1999)) * 100));
        sliderElem.style.setProperty("--range-progress", `${progressPct}%`);
      }
    }

    // =========================================================================
    // World Origin Countries Visualization Logic
    // =========================================================================
    function getCountryCount(d) {
      if (selectedVisa === "d2") return d.d2;
      if (selectedVisa === "d4") return d.d4;
      return d.total;
    }

    function renderWorldOrigins() {
      const tLang = i18n[currentLang];

      // Filter by continent and valid count
      let filtered = countryVisaData.filter(d => {
        if (d.lat === 0 && d.lng === 0) return false;
        if (selectedContinent !== "all" && d.continent_en !== selectedContinent) return false;
        return getCountryCount(d) > 0;
      });

      // Recalculate ranking among filtered/all
      const totalStudentsAll = countryVisaData.reduce((sum, d) => sum + getCountryCount(d), 0);
      const totalD2 = countryVisaData.reduce((sum, d) => sum + d.d2, 0);
      const totalD4 = countryVisaData.reduce((sum, d) => sum + d.d4, 0);
      const totalSum = totalD2 + totalD4;

      const d2Pct = totalSum > 0 ? ((totalD2 / totalSum) * 100).toFixed(1) : 0;
      const d4Pct = totalSum > 0 ? ((totalD4 / totalSum) * 100).toFixed(1) : 0;

      const topCountry = countryVisaData[0];
      const topCountryName = currentLang === "ko" ? topCountry.country_kr : topCountry.country_en;
      const topCountryPct = totalSum > 0 ? ((topCountry.total / totalSum) * 100).toFixed(1) : 0;

      // Update World Mode Stats Cards
      if (currentMode === "world") {
        d3.select("#statIdx1").text(tLang.statIdx1World);
        d3.select("#statIdx2").text(tLang.statIdx2World);
        d3.select("#statIdx3").text(tLang.statIdx3World);
        d3.select("#statIdx4").text(tLang.statIdx4World);

        d3.select("#labelCard1").text(tLang.card1WorldLabel);
        animateNumericValue("statCard1Val", totalStudentsAll);
        d3.select("#statCard1Sub").text(tLang.card1WorldSub);

        d3.select("#labelCard2").text(tLang.card2WorldLabel);
        d3.select("#statCard2Val").text(`${filtered.length} / ${countryVisaData.length}`);
        d3.select("#statCard2Sub").text(tLang.card2WorldSub);

        d3.select("#labelCard3").text(tLang.card3WorldLabel);
        d3.select("#statCard3Val").text(topCountryName);
        d3.select("#statCard3Sub").text(tLang.card3WorldSub(d3.format(",")(topCountry.total), topCountryPct));

        d3.select("#labelCard4").text(tLang.card4WorldLabel);
        d3.select("#statCard4Val").text(`${d2Pct}% / ${d4Pct}%`);
        d3.select("#statCard4Sub").text(tLang.card4WorldSub(d2Pct, d4Pct));
      }

      d3.select("#worldCountBadge").text(filtered.length);

      // Proportional circle radius scale: sqrt(count)
      const maxCount = d3.max(filtered, d => getCountryCount(d)) || 1;
      const radiusScale = d3.scaleSqrt()
        .domain([1, Math.max(100000, maxCount)])
        .range([3.5, 42]);

      // Render / Update Leaflet Native Origin Markers with Color Temperature (60fps Butter-Smooth)
      const activeCountriesSet = new Set(filtered.map(d => d.country_kr));

      // Remove markers no longer in filtered list
      for (const [cKr, marker] of countryMarkerMap.entries()) {
        if (!activeCountriesSet.has(cKr)) {
          if (worldMarkersLayer.hasLayer(marker)) {
            worldMarkersLayer.removeLayer(marker);
          }
        }
      }

      // Add or update markers with color temperature and smooth Leaflet projection
      filtered.forEach(d => {
        const count = getCountryCount(d);
        const r = radiusScale(count);
        const thermal = getCountryThermalStyle(count);
        const isSelected = selectedCountryName && (d.country_en.toLowerCase() === selectedCountryName.toLowerCase() || d.country_kr === selectedCountryName);

        let marker = countryMarkerMap.get(d.country_kr);
        if (!marker) {
          marker = L.circleMarker([d.lat, d.lng], {
            pane: "worldMarkersPane",
            radius: r,
            fillColor: thermal.fill,
            fillOpacity: 1,
            color: isSelected ? "#ffffff" : thermal.stroke,
            weight: isSelected ? 3.5 : 1.8,
            opacity: 0.95,
            className: "world-country-marker"
          });

          marker.on({
            mouseover: function (e) {
              if (selectedCountryName !== d.country_en) {
                marker.setStyle({
                  weight: 3.2,
                  color: "#ffffff"
                });
              }
              showCountryTooltip(e.originalEvent || e, d);
            },
            mousemove: function (e) {
              moveCountryTooltip(e.originalEvent || e);
            },
            mouseout: function (e) {
              if (selectedCountryName !== d.country_en) {
                const curStyle = getCountryThermalStyle(getCountryCount(d));
                marker.setStyle({
                  weight: 1.8,
                  color: curStyle.stroke
                });
              }
              hideTooltip();
            },
            click: function (e) {
              if (e.originalEvent) {
                e.originalEvent._countryHandled = true;
                L.DomEvent.stop(e.originalEvent);
              }
              lastCountryActionTime = Date.now();
              selectCountry(d.country_en);
            }
          });

          marker.on("add", function () {
            if (marker._path) {
              marker._path.setAttribute("data-country", d.country_en);
              marker._path.style.cursor = "pointer";
            }
          });

          countryMarkerMap.set(d.country_kr, marker);
          countryMarkerMap.set(d.country_en.toLowerCase(), marker);
        } else {
          marker.setLatLng([d.lat, d.lng]);
          marker.setRadius(r);
          marker.setStyle({
            fillColor: thermal.fill,
            color: isSelected ? "#ffffff" : thermal.stroke,
            weight: isSelected ? 3.5 : 1.8
          });
        }

        if (!worldMarkersLayer.hasLayer(marker)) {
          worldMarkersLayer.addLayer(marker);
        }
      });

      populateTopCountriesList(filtered);
      updateWorldCountriesThermalStyle();
    }

    // Dismiss active country callout and clear leader line
    function clearSelectedCountry(resetCamera = true) {
      if (selectedCountryName) {
        const prevLayer = countryLayerMap.get(selectedCountryName.toLowerCase());
        if (prevLayer) {
          if (currentMode === "world") {
            prevLayer.setStyle(getWorldCountryThermalStyle(prevLayer.feature));
          } else {
            worldCountryGeoLayer.resetStyle(prevLayer);
          }
        }
        const prevMarker = countryMarkerMap.get(selectedCountryName.toLowerCase());
        if (prevMarker) {
          const cData = countryVisaData.find(x => x.country_en.toLowerCase() === selectedCountryName.toLowerCase());
          const curStyle = getCountryThermalStyle(cData ? getCountryCount(cData) : 1);
          prevMarker.setStyle({
            opacity: 1,
            fillOpacity: 0.52,
            weight: 1.8,
            color: curStyle.stroke
          });
        }
      }
      selectedCountryName = null;
      if (currentMode === "world") {
        updateWorldCountriesThermalStyle();
      }

      if (activeCountryNameMarker) {
        map.removeLayer(activeCountryNameMarker);
        activeCountryNameMarker = null;
      }
      if (activeCountryCalloutMarker) {
        map.removeLayer(activeCountryCalloutMarker);
        activeCountryCalloutMarker = null;
      }
      if (activeLeaderLine) {
        map.removeLayer(activeLeaderLine);
        activeLeaderLine = null;
      }
      if (activeLeaderAnchor) {
        map.removeLayer(activeLeaderAnchor);
        activeLeaderAnchor = null;
      }

      const countrySelect = document.getElementById("countrySelect");
      if (countrySelect) countrySelect.value = "";

      d3.selectAll(".top-country-item").classed("active", false);

      if (resetCamera) {
        if (window.Globe3D && window.Globe3D.getIsVisible()) {
          window.Globe3D.focusOnKorea(true);
        } else {
          map.flyTo([24, 20], 2.6, { duration: 1.5, easeLinearity: 0.35 });
        }
      }
    }

    // Select country: fly camera, color polygon, and show big letters callout
    function selectCountry(countryName) {
      hideTooltip();
      if (!countryName) {
        clearSelectedCountry(true);
        return;
      }

      // If already active, reset previous layer style
      if (selectedCountryName) {
        const prevLayer = countryLayerMap.get(selectedCountryName.toLowerCase());
        if (prevLayer) {
          worldCountryGeoLayer.resetStyle(prevLayer);
        }
      }
      clearSelectedCountry(false);

      // Lookup in countryVisaData
      const cData = countryVisaData.find(d =>
        (d.country_en && d.country_en.toLowerCase() === countryName.toLowerCase()) ||
        (d.country_kr && d.country_kr === countryName)
      );
      if (!cData) return;

      selectedCountryName = cData.country_en;

      if (window.Globe3D && window.Globe3D.getIsVisible()) {
        window.Globe3D.focusCountry(cData.country_en);
      }

      const count = getCountryCount(cData);
      const thermal = getCountryThermalStyle(count);

      // Color the country area polygon matching the circle's thermal color
      const layer = countryLayerMap.get(cData.country_en.toLowerCase()) || countryLayerMap.get(cData.country_kr);
      if (layer) {
        layer.setStyle({
          fillColor: thermal.hex,
          fillOpacity: 0.96,
          color: "#0f172a",
          weight: 2.4,
          opacity: 1
        });
        if (layer.bringToFront) layer.bringToFront();
      }
      updateWorldCountriesThermalStyle();

      // Hide the selected country's origin bubble circle so ONLY the name is inside the territory polygon
      const curMarker = countryMarkerMap.get(cData.country_en.toLowerCase());
      if (curMarker) {
        curMarker.setStyle({
          opacity: 0,
          fillOpacity: 0
        });
      }

      const tLang = i18n[currentLang];
      const displayName = currentLang === "ko" ? cData.country_kr : cData.country_en;
      const totalAll = countryVisaData.reduce((s, x) => s + x.total, 0);
      const sharePct = totalAll > 0 ? ((cData.total / totalAll) * 100).toFixed(2) : 0;
      const rank = cData.rank || (countryVisaData.findIndex(x => x.country_en === cData.country_en) + 1);

      // Thin country detection: Chile or narrow bounds
      const isChile = cData.country_en.toLowerCase() === "chile";
      const featProp = layer && layer.feature && layer.feature.properties;
      const isThin = isChile || (featProp && featProp.is_thin && featProp.aspect_ratio > 3.0);

      // 1. Render ONLY the Country Name inside the country polygon territory
      const nameLatLng = isChile ? [-33.5, -70.7] : [cData.lat, cData.lng];
      const nameHtml = `
        <div class="in-country-name-badge ${isThin ? 'is-thin-country' : ''}">
          <div class="in-country-name-text">${displayName}</div>
        </div>
      `;
      const nameIcon = L.divIcon({
        className: "leaflet-country-name-icon",
        html: nameHtml,
        iconSize: [0, 0]
      });
      activeCountryNameMarker = L.marker(nameLatLng, {
        icon: nameIcon,
        interactive: false,
        zIndexOffset: 800
      }).addTo(map);


      // 2. Compute Mainland Target Center and Optimal Zoom to Center Country on Screen
      let targetCenter = [cData.lat, cData.lng];
      let targetZoom = 5.0;

      if (cData.country_en === "France") {
        targetCenter = [46.6, 2.2];
        targetZoom = 5.2;
      } else if (cData.country_en === "United States") {
        targetCenter = [39.0, -96.5];
        targetZoom = 4.2;
      } else if (isChile) {
        targetCenter = [-33.5, -70.7];
        targetZoom = 4.6;
      } else if (layer && layer.getBounds) {
        const bounds = layer.getBounds();
        const latSpan = bounds.getNorth() - bounds.getSouth();
        const lngSpan = bounds.getEast() - bounds.getWest();

        if (lngSpan > 40 || latSpan > 30) {
          targetCenter = [cData.lat, cData.lng];
          targetZoom = 3.6;
        } else if (lngSpan > 20 || latSpan > 15) {
          targetCenter = [cData.lat, cData.lng];
          targetZoom = 4.2;
        } else if (lngSpan > 8 || latSpan > 6) {
          targetCenter = [cData.lat, cData.lng];
          targetZoom = 4.8;
        } else {
          targetCenter = [cData.lat, cData.lng];
          targetZoom = 5.4;
        }
      }

      // Smoothly fly and center directly on the country
      map.flyTo(targetCenter, targetZoom, {
        duration: 1.6,
        easeLinearity: 0.35
      });

      // 3. Position Leader Line & Side Stats Modal beside the Centered Country
      const isChileCountry = cData.country_en.toLowerCase() === "chile";
      const placeWest = isChileCountry || (targetCenter[1] < -60 && targetCenter[1] > -120);
      const offsetDeg = targetZoom >= 5.2 ? 3.8 : (targetZoom >= 4.5 ? 5.5 : 8.5);

      let countryAnchor;
      let modalLatLng;
      let lineStart;
      let calloutClass;

      if (placeWest) {
        calloutClass = "callout-beside-west";
        countryAnchor = [targetCenter[0], targetCenter[1] - (offsetDeg * 0.38)];
        modalLatLng = [targetCenter[0], targetCenter[1] - offsetDeg];
        lineStart = [targetCenter[0], modalLatLng[1] + (offsetDeg * 0.15)];
      } else {
        calloutClass = "callout-beside-east";
        countryAnchor = [targetCenter[0], targetCenter[1] + (offsetDeg * 0.38)];
        modalLatLng = [targetCenter[0], targetCenter[1] + offsetDeg];
        lineStart = [targetCenter[0], modalLatLng[1] - (offsetDeg * 0.15)];
      }

      // Leader Line from Country Anchor to Modal Edge
      activeLeaderLine = L.polyline([lineStart, countryAnchor], {
        color: thermal.stroke,
        weight: 2.2,
        dashArray: "5, 5",
        opacity: 0.95
      }).addTo(map);

      activeLeaderAnchor = L.circleMarker(countryAnchor, {
        radius: 4.5,
        color: thermal.stroke,
        fillColor: thermal.hex,
        fillOpacity: 1,
        weight: 2.2
      }).addTo(map);

      // 3. Side Information Modal with ONLY the other stats (Rank, Total Students, Visas, Share)
      const calloutHtml = `
        <div class="country-hero-callout ${calloutClass}" id="countryHeroCallout" style="border-color: ${thermal.stroke}; box-shadow: 0 16px 36px -4px rgba(18, 18, 17, 0.32), 0 0 0 1px ${thermal.stroke}44;">
          <button class="callout-close-btn" id="btnCloseCountryCallout" type="button" aria-label="${tLang.calloutClose}" title="${tLang.calloutClose}">×</button>
          <div class="callout-header-row">
            <span class="callout-rank-pill" style="color: ${thermal.stroke}; background: ${thermal.fill}; border-color: ${thermal.stroke}50;">${tLang.calloutOriginRank(rank)}</span>
          </div>
          <div class="callout-student-count">
            <span class="callout-count-num" style="color: ${thermal.stroke};">${d3.format(",")(cData.total)}</span>
            <span class="callout-count-unit">${tLang.calloutStudents}</span>
          </div>
          <div class="callout-visa-breakdown">
            <div class="callout-visa-chip d2">
              <span><span class="callout-chip-dot"></span> ${tLang.calloutDegree}</span>
              <strong>${d3.format(",")(cData.d2)}</strong>
            </div>
            <div class="callout-visa-chip d4">
              <span><span class="callout-chip-dot"></span> ${tLang.calloutLanguage}</span>
              <strong>${d3.format(",")(cData.d4)}</strong>
            </div>
          </div>
          <div class="callout-pct-bar-wrapper">
            <div class="callout-pct-bar-track">
              <div class="callout-pct-bar-fill" style="width: ${Math.min(100, Math.max(2, sharePct * 2.5))}%; background: linear-gradient(90deg, ${thermal.hex}, ${thermal.stroke});"></div>
            </div>
            <div class="callout-pct-text">
              <span>${tLang.calloutShare(sharePct)}</span>
              <strong>${sharePct}%</strong>
            </div>
          </div>
        </div>
      `;

      const calloutIcon = L.divIcon({
        className: "leaflet-country-callout-icon",
        html: calloutHtml,
        iconSize: [0, 0]
      });

      activeCountryCalloutMarker = L.marker(modalLatLng, {
        icon: calloutIcon,
        interactive: true,
        zIndexOffset: 1000
      }).addTo(map);

      // Disable click propagation on callout and wire close button
      const calloutEl = document.getElementById("countryHeroCallout");
      if (calloutEl) {
        L.DomEvent.disableClickPropagation(calloutEl);
      }
      const closeBtn = document.getElementById("btnCloseCountryCallout");
      if (closeBtn) {
        L.DomEvent.disableClickPropagation(closeBtn);
        closeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          selectCountry(null);
        });
      }

      // Sync Country Select dropdown
      const countrySelect = document.getElementById("countrySelect");
      if (countrySelect) {
        countrySelect.value = cData.country_en;
      }

      // Sync Top Origins leaderboard item
      d3.selectAll(".top-country-item").classed("active", function () {
        return d3.select(this).select(".top-country-name").text().toLowerCase() === displayName.toLowerCase();
      });

      // Highlight corresponding map marker with glowing white ring
      const selMarker = countryMarkerMap.get(cData.country_kr) || countryMarkerMap.get(cData.country_en.toLowerCase());
      if (selMarker) {
        selMarker.setStyle({
          weight: 3.8,
          color: "#ffffff"
        });
        if (selMarker.bringToFront) selMarker.bringToFront();
      }
    }

    let lastPopulatedSelectLang = null;

    function populateCountrySelect() {
      if (lastPopulatedSelectLang === currentLang) {
        if (selectedCountryName) {
          const sel = document.getElementById("countrySelect");
          if (sel) sel.value = selectedCountryName;
        }
        return;
      }
      lastPopulatedSelectLang = currentLang;

      const sel = document.getElementById("countrySelect");
      if (!sel) return;
      const tLang = i18n[currentLang];

      const sorted = [...countryVisaData].sort((a, b) => {
        const nameA = currentLang === "ko" ? a.country_kr : a.country_en;
        const nameB = currentLang === "ko" ? b.country_kr : b.country_en;
        return nameA.localeCompare(nameB);
      });

      const options = [`<option value="" id="optSelectPrompt">${tLang.selectPrompt}</option>`];
      for (let i = 0; i < sorted.length; i++) {
        const c = sorted[i];
        const name = currentLang === "ko" ? c.country_kr : c.country_en;
        options.push(`<option value="${c.country_en}">${name} (#${c.rank} · ${d3.format(",")(c.total)}${currentLang === "ko" ? "명" : ""})</option>`);
      }
      sel.innerHTML = options.join("");

      if (selectedCountryName) {
        sel.value = selectedCountryName;
      }
    }

    d3.select("#countrySelect").on("change", function () {
      if (this.value) {
        selectCountry(this.value);
      } else {
        selectCountry(null);
      }
    });

    function populateTopCountriesList(list) {
      const topListContainer = document.getElementById("topCountriesList");
      if (!topListContainer) return;

      const sorted = [...list].sort((a, b) => getCountryCount(b) - getCountryCount(a)).slice(0, 10);

      const items = sorted.map((d, i) => {
        const isActive = selectedCountryName && selectedCountryName.toLowerCase() === d.country_en.toLowerCase();
        const countryName = currentLang === "ko" ? d.country_kr : d.country_en;
        const count = d3.format(",")(getCountryCount(d));
        return `
          <div class="top-country-item ${isActive ? 'active' : ''}" data-country="${d.country_en}">
            <span class="top-country-rank">#${i + 1}</span>
            <span class="top-country-name">${countryName}</span>
            <span class="top-country-count">${count}</span>
          </div>
        `;
      });
      topListContainer.innerHTML = items.join("");
    }

    // Delegated interaction for Top Origins Leaderboard (zero anonymous closures per item)
    const topListEl = document.getElementById("topCountriesList");
    if (topListEl) {
      topListEl.addEventListener("click", function (e) {
        const item = e.target.closest(".top-country-item");
        if (item && item.dataset.country) {
          selectCountry(item.dataset.country);
        }
      });
      topListEl.addEventListener("mouseenter", hideTooltip);
      topListEl.addEventListener("mouseover", function (e) {
        hideTooltip();
        const item = e.target.closest(".top-country-item");
        if (item && item.dataset.country) {
          const cName = item.dataset.country;
          const cData = countryVisaData.find(x => x.country_en && x.country_en.toLowerCase() === cName.toLowerCase());
          if (cData) {
            d3.selectAll(".top-country-item").classed("active", false);
            item.classList.add("active");
            const layer = countryLayerMap.get(cData.country_en.toLowerCase()) || countryLayerMap.get(cData.country_kr);
            if (layer && selectedCountryName !== cData.country_en) {
              const count = getCountryCount(cData);
              const hoverThermal = count > 0 ? getCountryThermalStyle(count) : null;
              layer.setStyle({
                fillColor: hoverThermal ? hoverThermal.hex : "#cbd5e1",
                fillOpacity: 0.92,
                color: "#0f172a",
                weight: 1.4,
                opacity: 1
              });
              if (layer.bringToFront) layer.bringToFront();
            }
          }
        }
      });
      topListEl.addEventListener("mouseout", function (e) {
        const item = e.target.closest(".top-country-item");
        if (item && (!selectedCountryName || selectedCountryName.toLowerCase() !== (item.dataset.country || "").toLowerCase())) {
          item.classList.remove("active");
          const layer = countryLayerMap.get((item.dataset.country || "").toLowerCase());
          if (layer && currentMode === "world") {
            layer.setStyle(getWorldCountryThermalStyle(layer.feature));
          }
        }
        hideTooltip();
      });

      const leftSidebar = document.getElementById("leftSidebarCol");
      if (leftSidebar) {
        leftSidebar.addEventListener("mouseenter", hideTooltip);
      }
    }

    // ----------------------------------------------------
    // Linguistic Groups Aggregation, Map Layer & Legend Logic
    // ----------------------------------------------------
    function getLanguageGroupStats() {
      const statsMap = new Map();
      const totalAllStudents = countryVisaData.reduce((s, x) => s + getCountryCount(x), 0);

      // Initialize all language groups
      Object.keys(LANGUAGE_GROUPS).forEach(key => {
        const def = LANGUAGE_GROUPS[key];
        statsMap.set(key, {
          id: key,
          color: def.color,
          en: def.en,
          ko: def.ko,
          total: 0,
          d2: 0,
          d4: 0,
          countries: []
        });
      });

      // Aggregate each country in countryVisaData
      countryVisaData.forEach(c => {
        const cName = (c.country_en || "").toLowerCase();
        const langKey = COUNTRY_LANGUAGE_MAP[cName] || "Other";
        const group = statsMap.get(langKey);
        if (group) {
          const count = getCountryCount(c);
          group.total += count;
          group.d2 += (c.d2 || 0);
          group.d4 += (c.d4 || 0);
          group.countries.push({
            country_en: c.country_en,
            country_kr: c.country_kr,
            total: count
          });
        }
      });

      // Calculate percentages and sort descending by number of countries that speak the language
      const list = Array.from(statsMap.values()).map(g => {
        g.pct = totalAllStudents > 0 ? ((g.total / totalAllStudents) * 100).toFixed(1) : "0.0";
        g.countries.sort((a, b) => b.total - a.total);
        return g;
      });

      return list.sort((a, b) => {
        if (b.countries.length !== a.countries.length) {
          return b.countries.length - a.countries.length;
        }
        return b.total - a.total;
      });
    }

    function highlightLanguageGroupOnMap(langId, isPreview = false) {
      if (!worldCountryGeoLayer) return;
      worldCountryGeoLayer.eachLayer(layer => {
        const p = layer.feature && layer.feature.properties;
        if (!p) return;
        const cName = (p.country_en || "").toLowerCase();
        const lang = COUNTRY_LANGUAGE_MAP[cName] || "Other";
        const def = LANGUAGE_GROUPS[lang] || { color: "#64748b" };

        if (!langId) {
          // Normal state: all groups colorful and visible
          layer.setStyle({
            fillColor: def.color,
            fillOpacity: 0.65,
            color: "#ffffff",
            weight: 0.8,
            opacity: 0.85
          });
        } else if (lang === langId) {
          // Focused group: crisp elegant stroke
          layer.setStyle({
            fillColor: def.color,
            fillOpacity: 0.92,
            color: "#0f172a",
            weight: 1.4,
            opacity: 1
          });
          if (layer.bringToFront) layer.bringToFront();
        } else {
          // Dimmed background
          layer.setStyle({
            fillColor: def.color,
            fillOpacity: 0.14,
            color: "#cbd5e1",
            weight: 0.6,
            opacity: 0.40
          });
        }
      });
    }

    function renderLanguageLegendList(searchQuery = "") {
      const legendListEl = document.getElementById("languageLegendList");
      if (!legendListEl) return;

      const groupStats = getLanguageGroupStats();
      const q = (searchQuery || "").trim().toLowerCase();
      const tLang = i18n[currentLang];

      const maxCountriesCount = d3.max(groupStats, g => g.countries.length) || 1;

      // Filter groups if query entered
      const filtered = groupStats.filter(g => {
        if (!q) return true;
        const nameEn = g.en.toLowerCase();
        const nameKo = g.ko.toLowerCase();
        if (nameEn.includes(q) || nameKo.includes(q)) return true;
        return g.countries.some(c =>
          (c.country_en && c.country_en.toLowerCase().includes(q)) ||
          (c.country_kr && c.country_kr.toLowerCase().includes(q))
        );
      });

      // Update badge count
      const badge = document.getElementById("langCountBadge");
      if (badge) badge.textContent = filtered.length;

      if (filtered.length === 0) {
        legendListEl.innerHTML = `
          <div style="padding: 16px; text-align: center; color: var(--muted); font-size: 12px;">
            ${currentLang === "ko" ? "일치하는 언어권 또는 국가가 없습니다" : "No matching linguistic groups or countries found"}
          </div>
        `;
        return;
      }

      const itemsHtml = filtered.map(g => {
        const isSelected = selectedLanguageGroup === g.id;
        const isDimmed = selectedLanguageGroup && selectedLanguageGroup !== g.id;
        const langName = currentLang === "ko" ? g.ko : g.en;
        const barWidth = Math.max(4, ((g.countries.length / maxCountriesCount) * 100).toFixed(1));
        const countriesLabel = currentLang === "ko" ? `${g.countries.length}개국` : `${g.countries.length} countries`;

        return `
          <div class="language-item ${isSelected ? 'active' : ''} ${isDimmed ? 'is-dimmed' : ''}" data-lang="${g.id}" role="listitem" tabindex="0">
            <div class="language-item-header">
              <div class="language-item-title-wrap">
                <span class="language-color-dot" style="background: ${g.color};"></span>
                <span class="language-name">${langName}</span>
                <span class="language-countries-badge">${countriesLabel}</span>
              </div>
              <div class="language-item-val-wrap">
                <span class="language-students-val">${d3.format(",")(g.total)}</span>
                <span class="language-students-pct">(${g.pct}%)</span>
              </div>
            </div>
            <div class="language-bar-track">
              <div class="language-bar-fill" style="width: ${barWidth}%; background: ${g.color};"></div>
            </div>
          </div>
        `;
      }).join("");

      legendListEl.innerHTML = itemsHtml;

      // Delegated listeners for clicks and hover
      legendListEl.querySelectorAll(".language-item").forEach(item => {
        const langId = item.getAttribute("data-lang");

        item.addEventListener("click", () => {
          selectedLanguageGroup = selectedLanguageGroup === langId ? null : langId;
          renderLanguageView(q);
        });

        item.addEventListener("mouseenter", () => {
          if (!selectedLanguageGroup) {
            highlightLanguageGroupOnMap(langId, true);
          }
        });

        item.addEventListener("mouseleave", () => {
          if (!selectedLanguageGroup) {
            highlightLanguageGroupOnMap(null);
          }
        });
      });
    }

    function renderLanguageView(searchQuery = "") {
      const groupStats = getLanguageGroupStats();
      const tLang = i18n[currentLang];
      const totalStudentsAll = countryVisaData.reduce((sum, d) => sum + getCountryCount(d), 0);

      // Update stat cards for Language Mode
      if (currentMode === "language") {
        d3.select("#statIdx1").text(tLang.statIdx1Lang);
        d3.select("#statIdx2").text(tLang.statIdx2Lang);
        d3.select("#statIdx3").text(tLang.statIdx3Lang);
        d3.select("#statIdx4").text(tLang.statIdx4Lang);

        d3.select("#labelCard1").text(tLang.card1LangLabel);
        animateNumericValue("statCard1Val", totalStudentsAll);
        d3.select("#statCard1Sub").text(tLang.card1LangSub);

        d3.select("#labelCard2").text(tLang.card2LangLabel);
        d3.select("#statCard2Val").text(`${groupStats.length} Groups`);
        d3.select("#statCard2Sub").text(tLang.card2LangSub);

        d3.select("#labelCard3").text(tLang.card3LangLabel);
        const topGroup = groupStats[0]; // Group with most countries (English: 44 countries)
        const topGroupName = currentLang === "ko" ? topGroup.ko : topGroup.en;
        d3.select("#statCard3Val").text(topGroupName);
        d3.select("#statCard3Sub").text(tLang.card3LangSub(topGroupName, topGroup.countries.length, d3.format(",")(topGroup.total)));

        d3.select("#labelCard4").text(tLang.card4LangLabel);
        const top3Countries = groupStats.slice(0, 3).reduce((sum, g) => sum + g.countries.length, 0);
        d3.select("#statCard4Val").text(`${top3Countries} Countries`);
        d3.select("#statCard4Sub").text(tLang.card4LangSub);
      }

      // Update Map Polygons
      highlightLanguageGroupOnMap(selectedLanguageGroup);

      // Update Legend list on left
      renderLanguageLegendList(searchQuery);
    }

    // ----------------------------------------------------
    // Language View Continuous Auto-Slide Animation (One-time until user interaction)
    // ----------------------------------------------------
    let languageDriftActive = false;
    let languageDriftStoppedForever = false;
    let languageDriftRaf = null;
    let languageDriftArmed = false;
    let isInternalDriftMove = false;

    function armDriftStopListeners() {
      if (languageDriftStoppedForever) return;
      languageDriftArmed = false;
      // Arm after 150ms so the click that activated Language view does not immediately stop it
      setTimeout(() => {
        if (!languageDriftStoppedForever) {
          languageDriftArmed = true;
        }
      }, 150);

      window.addEventListener("pointerdown", handleUserInteractionToStopDrift, { capture: true, passive: true });
      window.addEventListener("mousedown", handleUserInteractionToStopDrift, { capture: true, passive: true });
      window.addEventListener("touchstart", handleUserInteractionToStopDrift, { capture: true, passive: true });
      window.addEventListener("wheel", handleUserInteractionToStopDrift, { capture: true, passive: true });
      window.addEventListener("keydown", handleUserInteractionToStopDrift, { capture: true, passive: true });
      if (map) {
        map.on("dragstart", handleUserInteractionToStopDrift);
        map.on("zoomstart", handleUserInteractionToStopDrift);
        map.on("movestart", onMapMoveStart);
      }
    }

    function removeDriftStopListeners() {
      window.removeEventListener("pointerdown", handleUserInteractionToStopDrift, { capture: true });
      window.removeEventListener("mousedown", handleUserInteractionToStopDrift, { capture: true });
      window.removeEventListener("touchstart", handleUserInteractionToStopDrift, { capture: true });
      window.removeEventListener("wheel", handleUserInteractionToStopDrift, { capture: true });
      window.removeEventListener("keydown", handleUserInteractionToStopDrift, { capture: true });
      if (map) {
        map.off("dragstart", handleUserInteractionToStopDrift);
        map.off("zoomstart", handleUserInteractionToStopDrift);
        map.off("movestart", onMapMoveStart);
      }
    }

    function onMapMoveStart(e) {
      if (!isInternalDriftMove && languageDriftArmed) {
        handleUserInteractionToStopDrift(e);
      }
    }

    function handleUserInteractionToStopDrift(e) {
      if (!languageDriftArmed || languageDriftStoppedForever) return;
      stopLanguageDrift(true);
    }

    function stopLanguageDrift(isUserStop = false) {
      languageDriftActive = false;
      if (languageDriftRaf) {
        cancelAnimationFrame(languageDriftRaf);
        languageDriftRaf = null;
      }
      if (isUserStop) {
        languageDriftStoppedForever = true;
        languageDriftArmed = false;
        removeDriftStopListeners();
      }
    }

    function startLanguageDrift() {
      if (languageDriftStoppedForever || currentMode !== "language" || languageDriftActive) return;
      languageDriftActive = true;

      let lastTime = performance.now();
      const SPEED_PX_PER_SEC = 28; // Slow, continuous, elegant drift

      function driftStep(now) {
        if (languageDriftStoppedForever || currentMode !== "language") {
          languageDriftActive = false;
          languageDriftRaf = null;
          return;
        }

        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        const dx = SPEED_PX_PER_SEC * dt;
        isInternalDriftMove = true;
        map.panBy([dx, 0], { animate: false });
        isInternalDriftMove = false;

        // Seamless wrap when reaching 180° longitude
        const center = map.getCenter();
        if (center.lng >= 180) {
          isInternalDriftMove = true;
          map.setView([center.lat, center.lng - 360], map.getZoom(), { animate: false });
          isInternalDriftMove = false;
        }

        languageDriftRaf = requestAnimationFrame(driftStep);
      }

      languageDriftRaf = requestAnimationFrame(driftStep);
    }

    // Coordinated View Mode Switching (Hero Moment Spatial Choreography)
    function setMode(mode) {
      if (mode !== "language" && languageDriftActive) {
        stopLanguageDrift(true);
      }
      currentMode = mode;
      document.body.setAttribute("data-active-mode", mode);
      stop(); // Stop timeline playback if active

      d3.selectAll(".view-mode-btn").classed("active", function () {
        return this.dataset.mode === mode;
      });

      updateSidebarLegends(mode);

      map.invalidateSize();

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (mode === "korea") {
        document.body.classList.remove("mode-language");
        clearSelectedCountry(false);
        lastRenderedYearInt = -1;

        // Hide 3D Globe and show 2D Korea map
        if (window.Globe3D) {
          window.Globe3D.hide();
        }
        const globeEl = document.getElementById("globeContainer");
        if (globeEl) globeEl.style.display = "none";
        const chartEl = document.getElementById("chart");
        if (chartEl) chartEl.style.display = "block";
        map.invalidateSize();

        map.setMinZoom(5.6);
        map.setMaxBounds([
          [30.5, 121.5],
          [40.5, 134.5]
        ]);
        if (worldCountryGeoLayer && map.hasLayer(worldCountryGeoLayer)) {
          map.removeLayer(worldCountryGeoLayer);
        }
        if (worldMarkersLayer && map.hasLayer(worldMarkersLayer)) {
          map.removeLayer(worldMarkersLayer);
        }

        hideLanguageControls();
        switchControlsPanel("worldControls", "koreaControls");

        mapLayer.style("display", "inline").style("opacity", "0");
        outerBorderLayer.style("display", "inline").style("opacity", "0");
        circleLayer.style("display", "inline").style("opacity", "0");
        labelLayer.style("display", "inline").style("opacity", "0");

        requestAnimationFrame(() => {
          mapLayer.style("opacity", "1");
          outerBorderLayer.style("opacity", "1");
          circleLayer.style("opacity", "1");
          labelLayer.style("opacity", "1");
        });

        if (prefersReducedMotion) {
          map.setView([35.85, 127.85], 7);
          updateMapPositions();
          renderKoreaTime(currentTime);
        } else {
          map.flyTo([35.85, 127.85], 7, { duration: 1.5, easeLinearity: 0.35 });
          map.once("moveend", () => {
            updateMapPositions();
            renderKoreaTime(currentTime);
          });
        }
      } else if (mode === "world") {
        document.body.classList.remove("mode-language");
        hideLanguageControls();
        switchControlsPanel("koreaControls", "worldControls");

        // Hide 2D Leaflet Map and display 3D Cosmic Globe floating in space
        const chartEl = document.getElementById("chart");
        if (chartEl) chartEl.style.display = "none";
        const globeEl = document.getElementById("globeContainer");
        if (globeEl) globeEl.style.display = "block";

        if (window.Globe3D) {
          window.Globe3D.show(data, currentLang);
          window.Globe3D.setVisaFilter(selectedVisa);
          window.Globe3D.setContinentFilter(selectedContinent);
        }

        populateCountrySelect();
        renderWorldOrigins();
      } else if (mode === "language") {
        document.body.classList.add("mode-language");
        clearSelectedCountry(false);

        // Hide 3D Globe and show 2D Map for Linguistic Groups
        if (window.Globe3D) {
          window.Globe3D.hide();
        }
        const globeEl = document.getElementById("globeContainer");
        if (globeEl) globeEl.style.display = "none";
        const chartEl = document.getElementById("chart");
        if (chartEl) chartEl.style.display = "block";
        map.invalidateSize();

        // Hide left sidebar panels (korea & world) and floating button
        const kc = document.getElementById("koreaControls");
        if (kc) {
          kc.classList.remove("panel-visible");
          kc.classList.add("panel-hidden");
          kc.style.display = "none";
        }
        const wc = document.getElementById("worldControls");
        if (wc) {
          wc.classList.remove("panel-visible");
          wc.classList.add("panel-hidden");
          wc.style.display = "none";
        }
        const fb = document.getElementById("btnShowMapPanel");
        if (fb) fb.style.display = "none";

        // Show right language legend controls
        showLanguageControls();

        map.setMinZoom(2.2);
        map.setMaxBounds([
          [-82, -360],
          [82, 600]
        ]);

        mapLayer.style("opacity", "0");
        outerBorderLayer.style("opacity", "0");
        circleLayer.style("opacity", "0");
        labelLayer.style("opacity", "0");
        setTimeout(() => {
          if (currentMode !== "korea") {
            mapLayer.style("display", "none");
            outerBorderLayer.style("display", "none");
            circleLayer.style("display", "none");
            labelLayer.style("display", "none");
          }
        }, 420);

        // Hide bubble circle markers in language mode so country language colors are crisp
        if (worldMarkersLayer && map.hasLayer(worldMarkersLayer)) {
          map.removeLayer(worldMarkersLayer);
        }
        if (worldCountryGeoLayer && !map.hasLayer(worldCountryGeoLayer)) {
          worldCountryGeoLayer.addTo(map);
        }

        renderLanguageView();

        if (prefersReducedMotion) {
          map.setView([24, 25], 2.6);
        } else {
          map.flyTo([24, 25], 2.6, { duration: 1.5, easeLinearity: 0.35 });
        }

        // Language map continuous auto-slide to the left (once until user interaction)
        if (!languageDriftStoppedForever) {
          armDriftStopListeners();
          let driftTriggered = false;
          const onReadyToDrift = () => {
            if (driftTriggered) return;
            driftTriggered = true;
            if (currentMode === "language" && !languageDriftStoppedForever) {
              startLanguageDrift();
            }
          };
          if (prefersReducedMotion) {
            setTimeout(onReadyToDrift, 100);
          } else {
            map.once("moveend", onReadyToDrift);
            setTimeout(onReadyToDrift, 1600); // Fallback if moveend doesn't fire
          }
        }
      }
    }

    d3.selectAll(".view-mode-btn").on("click", function () {
      setMode(this.dataset.mode);
    });

    // World Visa Filter Group & Explainer Highlight
    function updateVisaGuideHighlight(visa) {
      if (visa === "d2") {
        d3.select("#guideItemD2").classed("is-highlighted", true).classed("is-dimmed", false);
        d3.select("#guideItemD4").classed("is-highlighted", false).classed("is-dimmed", true);
      } else if (visa === "d4") {
        d3.select("#guideItemD4").classed("is-highlighted", true).classed("is-dimmed", false);
        d3.select("#guideItemD2").classed("is-highlighted", false).classed("is-dimmed", true);
      } else {
        d3.select("#guideItemD2").classed("is-highlighted", false).classed("is-dimmed", false);
        d3.select("#guideItemD4").classed("is-highlighted", false).classed("is-dimmed", false);
      }
    }

    d3.selectAll(".visa-btn").on("click", function () {
      d3.selectAll(".visa-btn").classed("active", false);
      d3.select(this).classed("active", true);
      selectedVisa = this.dataset.visa;
      updateVisaGuideHighlight(selectedVisa);
      renderWorldOrigins();
      if (window.Globe3D && window.Globe3D.getIsVisible()) {
        window.Globe3D.setVisaFilter(selectedVisa);
      }
    });

    // Toggle Visa Explainer Guide Card
    let isVisaGuideOpen = true;
    d3.select("#btnVisaGuideToggle").on("click", function () {
      isVisaGuideOpen = !isVisaGuideOpen;
      d3.select("#visaGuideCard").classed("is-collapsed", !isVisaGuideOpen);
      d3.select(this).attr("aria-expanded", isVisaGuideOpen);
    });

    // World Continent Filter
    d3.select("#continentSelect").on("change", function () {
      selectedContinent = this.value;
      renderWorldOrigins();
      if (window.Globe3D && window.Globe3D.getIsVisible()) {
        window.Globe3D.setContinentFilter(selectedContinent);
      }
    });

    // Language switcher handler
    function updateLanguage(lang) {
      currentLang = lang;
      localStorage.setItem("preferred_lang", lang);
      const t = i18n[lang];

      document.title = t.pageTitle;
      d3.select("#kickerText").text(t.kickerText);
      d3.select("#mainTitle").text(t.mainTitle);
      d3.select("#mainSubtitle").text(t.mainSubtitle);

      d3.select("#modeKoreaTitle").text(t.modeKorea);
      d3.select("#modeWorldTitle").text(t.modeWorld);

      d3.select("#labelTimeline").text(t.timeline);
      d3.select("#labelSpeed").text(t.speed);
      d3.select("#labelCohortScale").text(t.cohortScale);

      d3.select("#play")
        .text(isPlaying ? t.pause : t.play)
        .classed("is-playing", isPlaying)
        .classed("btn-primary", !isPlaying);
      d3.select("#prevYear").text(t.prev);
      d3.select("#nextYear").text(t.next);

      d3.select("#optScale50").text(t.scale50);
      d3.select("#optScale100").text(t.scale100);
      d3.select("#optScale25").text(t.scale25);
      d3.select("#legendText").text(t.scaleSub(currentUnit));
      d3.select("#sidebarLegendsTitle").text(lang === "ko" ? "지도 범례" : "Map Legend");
      d3.select("#legendKoreaTitle").text(lang === "ko" ? "지도 범례" : "Map Legend");
      d3.selectAll(".legend-active-badge").text(lang === "ko" ? "활성" : "Active");

      // World Panel texts
      d3.select("#labelWorldPanel").text(t.worldPanelTitle);
      d3.select("#labelVisaFilter").text(t.visaFilter);
      d3.select("#labelVisaGuideToggle").text(t.visaGuideToggle);
      d3.select("#btnVisaAll").text(t.visaAll);
      d3.select("#btnVisaD2").text(t.visaD2);
      d3.select("#btnVisaD4").text(t.visaD4);
      d3.select("#d2GuideName").text(t.d2GuideName);
      d3.select("#d2GuideDesc").text(t.d2GuideDesc);
      d3.select("#d4GuideName").text(t.d4GuideName);
      d3.select("#d4GuideDesc").text(t.d4GuideDesc);
      d3.select("#labelContinentFilter").text(t.continentFilter);

      d3.select("#optContAll").text(t.contAll);
      d3.select("#optContAsia").text(`${t.contAsia} (49)`);
      d3.select("#optContEurope").text(`${t.contEurope} (41)`);
      d3.select("#optContNA").text(`${t.contNA} (4)`);
      d3.select("#optContSA").text(`${t.contSA} (32)`);
      d3.select("#optContAfrica").text(`${t.contAfrica} (51)`);
      d3.select("#optContOceania").text(`${t.contOceania} (12)`);

      d3.select("#labelTopOrigins").text(t.topOriginsTitle);
      d3.select("#labelCountryFinder").text(t.countryFinder);
      d3.select("#worldLegendTitle").text(t.worldLegendTitle);
      d3.select("#tempHotLabel").text(t.tempHotLabel);
      d3.select("#tempCoolLabel").text(t.tempCoolLabel);
      d3.select("#mapSourceTag").text(t.sourceTag);

      d3.select("#labelShowPanel").text(t.showMenu);
      d3.select("#labelHideKorea").text(t.hideMenu);
      d3.select("#labelHideWorld").text(t.hideMenu);

      // 3D Globe HUD labels
      d3.select("#globeHudTitle").text(lang === "ko" ? "3D 글로벌 유입" : "3D Cosmic Flow");
      d3.select("#labelGlobeRotate").text(lang === "ko" ? "회전" : "Rotate");
      d3.select("#labelGlobeReset").text(lang === "ko" ? "한국 중심" : "Focus Korea");

      // Language Mode Panel & Tabs texts
      d3.select("#modeLanguageTitle").text(t.modeLanguage);
      d3.select("#labelLanguagePanel").text(t.languagePanelTitle);
      d3.select("#labelShowLanguagePanel").text(t.showLanguagePanel);
      d3.select("#labelHideLanguage").text(t.hideLanguagePanel);
      const searchInp = document.getElementById("languageSearchInput");
      if (searchInp) searchInp.placeholder = t.languageSearchPlaceholder;

      // Re-populate and sync country quick select
      populateCountrySelect();

      // If a country callout is active, update its language in real time
      if (selectedCountryName) {
        selectCountry(selectedCountryName);
      }

      // Update map province labels text
      labelTexts.text(d => currentLang === "ko" ? (krShortNames[d] || d) : d);

      // Reset language caches
      lastRenderedLang = "";
      lastPopulatedSelectLang = null;
      populateCountrySelect();

      // Update switcher active class
      d3.selectAll(".lang-btn").classed("active", function () {
        return this.dataset.lang === lang;
      });

      if (currentMode === "korea") {
        renderKoreaTime(currentTime);
      } else if (currentMode === "world") {
        renderWorldOrigins();
      } else if (currentMode === "language") {
        renderLanguageView();
      }
    }

    // Attach robust click listeners to language buttons
    document.querySelectorAll(".lang-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const lang = this.getAttribute("data-lang") || (this.dataset && this.dataset.lang);
        if (lang) updateLanguage(lang);
      });
    });

    // Tooltips & Highlight with Viewport-Safe Boundary & Touch Support
    function highlightProvince(name, active) {
      d3.selectAll(".province-path").classed("active", false);
      if (active && name) {
        d3.select(`#path-${name}`).classed("active", true);
      }
    }

    function showTooltip(event, provinceName) {
      tooltip
        .classed("tooltip-country-compact", false)
        .classed("tooltip-language-styled", false)
        .style("opacity", 1)
        .classed("is-visible", true);
      moveTooltip(event, provinceName);
    }

    function moveTooltip(event, provinceName) {
      const yearSliderElem = document.getElementById("yearSlider");
      const currentYear = Math.min(2026, Math.floor(+yearSliderElem.value));
      const yearData = dataByYear.get(currentYear) || [];
      const item = yearData.find(x => x.Province === provinceName);
      const totalStudents = item ? item.Total : 0;
      const meta = provinceMeta[provinceName] || { kr: provinceName };

      const national = yearData.reduce((sum, d) => sum + d.Total, 0);
      const share = national > 0 ? ((totalStudents / national) * 100).toFixed(1) : 0;
      const circleCount = Math.round(totalStudents / currentUnit);

      const sorted = [...yearData].sort((a, b) => b.Total - a.Total);
      const rank = sorted.findIndex(x => x.Province === provinceName) + 1;

      const titleName = currentLang === "ko" ? (krShortNames[provinceName] || meta.kr || provinceName) : provinceName;
      const subName = currentLang === "ko" ? provinceName : (meta.kr || krShortNames[provinceName] || "");
      const tLang = i18n[currentLang];

      const mouseX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
      const mouseY = event.clientY || (event.touches ? event.touches[0].clientY : 0);
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let posX = mouseX + 16;
      let posY = mouseY + 16;
      if (posX + 230 > windowWidth) posX = mouseX - 235;
      if (posY + 160 > windowHeight) posY = mouseY - 165;

      tooltip
        .style("left", `${posX}px`)
        .style("top", `${posY}px`)
        .html(`
          <div class="tooltip-title">
            <span>${titleName}</span>
            <span class="tooltip-kr">${subName}</span>
          </div>
          <div class="tooltip-row">
            <span>${tLang.tooltipTotal(currentYear)}</span>
            <strong>${d3.format(",")(totalStudents)}</strong>
          </div>
          <div class="tooltip-row">
            <span>${tLang.tooltipCircles}</span>
            <strong>${d3.format(",")(circleCount)}</strong>
          </div>
          <div class="tooltip-row">
            <span>${tLang.tooltipShare}</span>
            <strong>${share}%</strong>
          </div>
          <div class="tooltip-row">
            <span>${tLang.tooltipRank}</span>
            <strong>${tLang.rankVal(rank)}</strong>
          </div>
        `);
    }

    // World Origin Country Tooltip (Compact country name modal matching web style)
    function showCountryTooltip(event, d) {
      if (!d) return;
      if (selectedCountryName && d.country_en && selectedCountryName.toLowerCase() === d.country_en.toLowerCase()) {
        hideTooltip();
        return;
      }

      tooltip
        .classed("tooltip-language-styled", false)
        .classed("tooltip-country-compact", true)
        .classed("is-visible", true)
        .style("opacity", 1);

      const titleName = currentLang === "ko"
        ? (d.country_kr || d.country_en || d.name || "")
        : (d.country_en || d.country_kr || d.name || "");
      const subName = currentLang === "ko"
        ? (d.country_en || "")
        : (d.country_kr || "");

      const mouseX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
      const mouseY = event.clientY || (event.touches ? event.touches[0].clientY : 0);
      const windowWidth = window.innerWidth;

      let posX = mouseX + 12;
      let posY = mouseY - 36;
      if (posY < 10) posY = mouseY + 18;
      if (posX + 220 > windowWidth) posX = mouseX - 180;
      if (posX < 10) posX = 10;

      const subHtml = (subName && subName.toLowerCase() !== titleName.toLowerCase())
        ? `<span class="country-compact-sub">${subName}</span>`
        : "";

      tooltip
        .style("left", `${posX}px`)
        .style("top", `${posY}px`)
        .html(`
          <div class="country-compact-title">
            <span class="country-compact-main">${titleName}</span>
            ${subHtml}
          </div>
        `);
    }

    // Linguistic Group World Tooltip (Styled matching the rest of the web)
    function showLanguageTooltip(event, p, cData, languageKey) {
      tooltip
        .classed("tooltip-country-compact", false)
        .classed("tooltip-language-styled", true)
        .classed("is-visible", true)
        .style("opacity", 1);

      const tLang = i18n[currentLang];
      const langDef = LANGUAGE_GROUPS[languageKey] || { color: "#64748b", en: languageKey, ko: languageKey };
      const langName = currentLang === "ko" ? (langDef.ko || languageKey) : (langDef.en || languageKey);

      const count = cData ? getCountryCount(cData) : 0;
      const totalAll = countryVisaData.reduce((s, x) => s + getCountryCount(x), 0);
      const share = totalAll > 0 ? ((count / totalAll) * 100).toFixed(2) : "0.00";

      const titleName = currentLang === "ko" ? (p.country_kr || p.country_en) : p.country_en;
      const subName = currentLang === "ko" ? p.country_en : (p.country_kr || "");

      const mouseX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
      const mouseY = event.clientY || (event.touches ? event.touches[0].clientY : 0);
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let posX = mouseX + 14;
      let posY = mouseY + 16;
      if (posX + 270 > windowWidth) posX = mouseX - 280;
      if (posY + 190 > windowHeight) posY = mouseY - 195;

      tooltip
        .style("left", `${posX}px`)
        .style("top", `${posY}px`)
        .html(`
          <div class="lang-modal-main-title">
            <span class="lang-color-dot" style="background: ${langDef.color}; box-shadow: 0 0 6px ${langDef.color}88;"></span>
            <span class="lang-title-text">${langName}</span>
          </div>
          <div class="lang-modal-country-subtitle">
            <span class="lang-country-main">${titleName}</span>
            ${subName && subName !== titleName ? `<span class="lang-country-sub">${subName}</span>` : ""}
          </div>
          <div class="tooltip-divider"></div>
          <div class="tooltip-row">
            <span>${currentLang === "ko" ? "국내 유학생 수:" : "Students in Korea:"}</span>
            <strong>${d3.format(",")(count)}</strong>
          </div>
          <div class="tooltip-row">
            <span>${tLang.tooltipShare}</span>
            <strong>${share}%</strong>
          </div>
        `);
    }

    function moveCountryTooltip(event) {
      const mouseX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
      const mouseY = event.clientY || (event.touches ? event.touches[0].clientY : 0);
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const isLanguage = tooltip.classed("tooltip-language-styled");
      let posX = mouseX + 14;
      let posY = isLanguage ? (mouseY + 16) : (mouseY - 36);

      if (isLanguage) {
        if (posX + 270 > windowWidth) posX = mouseX - 280;
        if (posY + 190 > windowHeight) posY = mouseY - 195;
      } else {
        if (posY < 10) posY = mouseY + 18;
        if (posX + 220 > windowWidth) posX = mouseX - 180;
      }
      if (posX < 10) posX = 10;

      tooltip
        .style("left", `${posX}px`)
        .style("top", `${posY}px`);
    }

    function hideTooltip() {
      tooltip
        .style("opacity", 0)
        .classed("is-visible", false)
        .classed("tooltip-country-compact", false)
        .classed("tooltip-language-styled", false);
    }

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".province-path") && !e.target.closest(".map-circle") && !e.target.closest(".country-group") && !e.target.closest(".top-country-item")) {
        hideTooltip();
        highlightProvince(null, false);
      }
    });

    // Continuous Animation Player for Korea Mode
    function step(timestamp) {
      if (!isPlaying) return;
      if (!lastTime) {
        lastTime = timestamp;
        animReq = requestAnimationFrame(step);
        return;
      }
      const dt = timestamp - lastTime;
      lastTime = timestamp;

      currentTime += (2026 - 1999) * (dt / totalDuration) * playbackSpeed;

      if (currentTime >= 2026) {
        currentTime = 2026;
        renderKoreaTime(2026);
        stop();
        return;
      }

      renderKoreaTime(currentTime);
      animReq = requestAnimationFrame(step);
    }

    function play() {
      if (isPlaying) return stop();
      if (currentTime >= 2026) {
        currentTime = 1999;
        renderKoreaTime(1999);
      }
      isPlaying = true;
      lastTime = null;
      const t = i18n[currentLang];
      d3.select("#play")
        .text(t.pause)
        .classed("btn-primary", false)
        .classed("is-playing", true);
      d3.select("#yearBadgeDot").classed("is-active", true);
      animReq = requestAnimationFrame(step);
    }

    function stop() {
      isPlaying = false;
      if (animReq) cancelAnimationFrame(animReq);
      animReq = null;
      lastTime = null;
      const t = i18n[currentLang];
      d3.select("#play")
        .text(t.play)
        .classed("btn-primary", true)
        .classed("is-playing", false);
      d3.select("#yearBadgeDot").classed("is-active", false);
    }

    d3.select("#play").on("click", play);

    const yearSlider = document.getElementById("yearSlider");
    yearSlider.addEventListener("input", e => {
      stop();
      currentTime = +e.target.value;
      renderKoreaTime(currentTime);
    });

    d3.select("#unitScale").on("change", function () {
      stop();
      const unit = +this.value;
      const t = i18n[currentLang];
      d3.select("#legendText").text(t.scaleSub(unit));
      circleLayer.selectAll("*").remove();
      lastRenderedYearInt = -1;
      lastRenderedUnit = -1;
      buildTimelinePoints(unit);
      renderKoreaTime(currentTime);
    });

    d3.selectAll(".speed-btn").on("click", function () {
      d3.selectAll(".speed-btn").classed("active", false);
      d3.select(this).classed("active", true);
      playbackSpeed = +this.dataset.speed;
    });

    d3.select("#prevYear").on("click", () => {
      stop();
      currentTime = Math.max(1999, Math.floor(currentTime) - 1);
      renderKoreaTime(currentTime);
    });

    d3.select("#nextYear").on("click", () => {
      stop();
      currentTime = Math.min(2026, Math.floor(currentTime) + 1);
      renderKoreaTime(currentTime);
    });

    // Expose helpers on window for programmatic access and verification
    window.selectCountry = selectCountry;
    window.clearSelectedCountry = clearSelectedCountry;
    window.setMode = setMode;
    window.updateLanguage = updateLanguage;

    // Initialize with current language and mode
    updateLanguage(currentLang);
    setMode("korea");
    renderLanguageLegendList("");

    // Initial layout trigger
    updateMapPositions();
    setTimeout(() => {
      map.invalidateSize();
      updateMapPositions();
    }, 250);

    window.addEventListener("resize", () => {
      if (map) {
        map.invalidateSize();
        updateMapPositions();
      }
    });
  }
});
