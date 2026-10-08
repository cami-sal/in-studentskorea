// Foreign Students in Korea (1999–2026) — OpenStreetMap Leaflet + D3.js Visualization

document.addEventListener("DOMContentLoaded", () => {
  const tooltip = d3.select("#tooltip");
  const loadingOverlay = document.getElementById("loadingOverlay");

  // Bilingual i18n Dictionary
  const i18n = {
    en: {
      pageTitle: "Foreign Students in Korea (1999–2026) — Point Accumulation Map",
      mainTitle: "Foreign Students in Korea",
      mainSubtitle: "Continuous accumulation of international university students across South Korea from 1999 to 2026.",
      nationalTotal: "National Total",
      yearSub: year => `Students across 17 provinces in ${year}`,
      totalCircles: "Total Circles",
      scaleSub: unit => `1 circle = ${unit} students`,
      seoulTotal: "Seoul Concentration",
      seoulShare: pct => `${pct}% of national total`,
      capitalTotal: "Capital Area (Seoul+Gyeonggi+Incheon)",
      capitalShare: pct => `${pct}% of all foreign students`,
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
      sourceTag: "Source: Higher Education in Korea / Ministry of Education",
      tooltipTotal: year => `Total Students (${year}):`,
      tooltipCircles: "Circles on Map:",
      tooltipShare: "National Share:",
      tooltipRank: "National Rank:",
      rankVal: rank => `#${rank > 0 ? rank : '—'} of 17`,
      loading: "Loading geographic dataset..."
    },
    ko: {
      pageTitle: "국내 외국인 유학생 현황 (1999–2026) — 인터랙티브 시각화 지도",
      mainTitle: "국내 외국인 유학생 현황",
      mainSubtitle: "1999년부터 2026년까지 대한민국 전국 17개 시·도별 외국인 유학생 누적 및 증가 추이",
      nationalTotal: "전국 총 유학생",
      yearSub: year => `${year}년 전국 17개 시·도 총 유학생`,
      totalCircles: "지도 내 총 원",
      scaleSub: unit => `1개 원 = ${unit}명`,
      seoulTotal: "서울 집중도",
      seoulShare: pct => `전국 대비 ${pct}%`,
      capitalTotal: "수도권 (서울·경기·인천)",
      capitalShare: pct => `전체 유학생의 ${pct}%`,
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
      sourceTag: "출처: 대학알리미 / 교육부 고등교육통계",
      tooltipTotal: year => `${year}년 총 유학생:`,
      tooltipCircles: "지도 내 원 개수:",
      tooltipShare: "전국 비중:",
      tooltipRank: "전국 순위:",
      rankVal: rank => `17개 시·도 중 ${rank > 0 ? rank : '—'}위`,
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
    const { koreaGeoData, rawData, provincePoints, provinceMeta } = data;

    // 1. Initialize Leaflet Zoomable Map (OpenStreetMap)
    const map = L.map("chart", {
      center: [35.85, 127.85],
      zoom: 7,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: false
    });

    // Zoom control at top right
    L.control.zoom({ position: "topright" }).addTo(map);

    // OpenStreetMap official direct tile layer (No API key required)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    // 2. Leaflet SVG Overlay Pane for D3 Elements
    L.svg({ clickable: true }).addTo(map);
    const overlay = d3.select(map.getPanes().overlayPane);
    const svg = overlay.select("svg").attr("pointer-events", "auto");

    const mapLayer = svg.append("g").attr("class", "leaflet-zoom-hide map-layer");
    const outerBorderLayer = svg.append("g").attr("class", "leaflet-zoom-hide outer-border-layer");
    const circleLayer = svg.append("g").attr("class", "leaflet-zoom-hide circle-layer");
    const labelLayer = svg.append("g").attr("class", "leaflet-zoom-hide label-layer");

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

    // Build Chronologically Ordered Point Swarm
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

    // Reposition all SVG elements on Map Zoom / Pan
    function updateMapPositions() {
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

      circleLayer.selectAll(".map-circle")
        .attr("cx", d => map.latLngToLayerPoint([d.lat, d.lng]).x)
        .attr("cy", d => map.latLngToLayerPoint([d.lat, d.lng]).y)
        .attr("r", circleRadius);
    }

    map.on("zoom", updateMapPositions);
    map.on("move", updateMapPositions);
    map.on("zoomend", updateMapPositions);
    map.on("viewreset", updateMapPositions);

    // Render Frame at continuous time T (1999.0 to 2026.0)
    function renderTime(t) {
      t = Math.max(1999.0, Math.min(2026.0, t));
      const currentYearInt = Math.min(2026, Math.floor(t));
      const tLang = i18n[currentLang];

      const visibleCount = d3.bisectRight(allPointsTimestamps, t);
      const visiblePoints = allPointsSorted.slice(0, visibleCount);

      const currentZoom = map.getZoom();
      const zoomScale = Math.max(0.75, Math.min(2.5, Math.pow(1.15, currentZoom - 7)));
      const baseRadius = currentUnit <= 25 ? 3.5 : (currentUnit <= 50 ? 4.2 : 5.0);
      const circleRadius = baseRadius * zoomScale;

      // High-performance D3 Join for student circles
      circleLayer.selectAll(".map-circle")
        .data(visiblePoints, d => d.id)
        .join(
          enter => enter.append("circle")
            .attr("class", "map-circle")
            .attr("cx", d => map.latLngToLayerPoint([d.lat, d.lng]).x)
            .attr("cy", d => map.latLngToLayerPoint([d.lat, d.lng]).y)
            .attr("r", circleRadius)
            .on("mouseenter", function (event, d) {
              highlightProvince(d.province, true);
              showTooltip(event, d.province);
            })
            .on("mousemove", function (event, d) {
              moveTooltip(event, d.province);
            })
            .on("mouseleave", function (event, d) {
              highlightProvince(d.province, false);
              hideTooltip();
            }),
          update => update
            .attr("cx", d => map.latLngToLayerPoint([d.lat, d.lng]).x)
            .attr("cy", d => map.latLngToLayerPoint([d.lat, d.lng]).y)
            .attr("r", circleRadius),
          exit => exit.remove()
        );

      // Update Province Count Badges and Stats
      const yearData = dataByYear.get(currentYearInt) || [];
      const lookup = new Map(yearData.map(d => [d.Province, d]));

      for (const pname of provinceNames) {
        const item = lookup.get(pname);
        const total = item ? item.Total : 0;
        d3.select(`#count-badge-${pname}`)
          .text(total > 0 ? d3.format(",")(total) : "");
      }

      const national = yearData.reduce((sum, d) => sum + d.Total, 0);
      const seoulTotal = lookup.get("Seoul") ? lookup.get("Seoul").Total : 0;
      const gyeonggiTotal = lookup.get("Gyeonggi") ? lookup.get("Gyeonggi").Total : 0;
      const incheonTotal = lookup.get("Incheon") ? lookup.get("Incheon").Total : 0;
      const capitalSum = seoulTotal + gyeonggiTotal + incheonTotal;
      const capitalPct = national > 0 ? ((capitalSum / national) * 100).toFixed(1) : 0;
      const seoulPct = national > 0 ? ((seoulTotal / national) * 100).toFixed(1) : 0;

      d3.select("#statNationalTotal").text(d3.format(",")(national));
      d3.select("#statYearSub").text(tLang.yearSub(currentYearInt));

      d3.select("#statTotalCircles").text(d3.format(",")(visiblePoints.length));
      d3.select("#statScaleSub").text(tLang.scaleSub(currentUnit));

      d3.select("#statSeoulTotal").text(d3.format(",")(seoulTotal));
      d3.select("#statSeoulShare").text(tLang.seoulShare(seoulPct));

      d3.select("#statCapitalTotal").text(d3.format(",")(capitalSum));
      d3.select("#statCapitalShare").text(tLang.capitalShare(capitalPct));

      // Update Toolbar
      d3.select("#yearLabel").text(currentYearInt);
      d3.select("#yearSlider").property("value", t);
    }

    // Language switcher handler
    function updateLanguage(lang) {
      currentLang = lang;
      localStorage.setItem("preferred_lang", lang);
      const t = i18n[lang];

      document.title = t.pageTitle;
      d3.select("#mainTitle").text(t.mainTitle);
      d3.select("#mainSubtitle").text(t.mainSubtitle);

      d3.select("#labelNationalTotal").text(t.nationalTotal);
      d3.select("#labelTotalCircles").text(t.totalCircles);
      d3.select("#labelSeoulTotal").text(t.seoulTotal);
      d3.select("#labelCapitalTotal").text(t.capitalTotal);

      d3.select("#labelTimeline").text(t.timeline);
      d3.select("#labelSpeed").text(t.speed);
      d3.select("#labelCohortScale").text(t.cohortScale);

      d3.select("#play").text(isPlaying ? t.pause : t.play);
      d3.select("#prevYear").text(t.prev);
      d3.select("#nextYear").text(t.next);

      d3.select("#optScale50").text(t.scale50);
      d3.select("#optScale100").text(t.scale100);
      d3.select("#optScale25").text(t.scale25);
      d3.select("#legendText").text(t.scaleSub(currentUnit));

      d3.select("#mapSourceTag").text(t.sourceTag);

      // Update map province labels text
      labelTexts.text(d => currentLang === "ko" ? (krShortNames[d] || d) : d);

      // Update switcher active class
      d3.selectAll(".lang-btn").classed("active", function () {
        return this.dataset.lang === lang;
      });

      // Re-render stats & cards
      renderTime(currentTime);
    }

    // Attach click listeners to language buttons
    d3.selectAll(".lang-btn").on("click", function () {
      const selected = this.dataset.lang;
      updateLanguage(selected);
    });

    // Tooltips & Highlight with Viewport-Safe Boundary & Touch Support
    function highlightProvince(name, active) {
      d3.selectAll(".province-path").classed("active", false);
      if (active && name) {
        d3.select(`#path-${name}`).classed("active", true);
      }
    }

    function showTooltip(event, provinceName) {
      tooltip.style("opacity", 1);
      moveTooltip(event, provinceName);
    }

    function moveTooltip(event, provinceName) {
      const yearSliderElem = document.getElementById("yearSlider");
      const currentYear = Math.min(2026, Math.floor(+yearSliderElem.value));
      const yearData = dataByYear.get(currentYear) || [];
      const item = yearData.find(x => x.Province === provinceName);
      const totalStudents = item ? item.Total : 0;
      const meta = provinceMeta[provinceName] || { kr: provinceName };
      const tLang = i18n[currentLang];

      const nationalTotal = yearData.reduce((s, d) => s + d.Total, 0);
      const share = nationalTotal > 0 ? ((totalStudents / nationalTotal) * 100).toFixed(1) : 0;

      const sorted = [...yearData].sort((a, b) => b.Total - a.Total);
      const rank = sorted.findIndex(d => d.Province === provinceName) + 1;
      const circleCount = Math.round(totalStudents / currentUnit);

      const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
      const clientY = event.clientY !== undefined ? event.clientY : (event.touches && event.touches[0] ? event.touches[0].clientY : 0);

      const tooltipWidth = 250;
      const tooltipHeight = 165;
      let left = clientX + 16;
      let top = clientY + 16;

      if (left + tooltipWidth > window.innerWidth - 16) {
        left = Math.max(12, clientX - tooltipWidth - 16);
      }
      if (top + tooltipHeight > window.innerHeight - 16) {
        top = Math.max(12, clientY - tooltipHeight - 16);
      }

      const primaryTitle = currentLang === "ko" ? meta.kr : provinceName;
      const secondaryTitle = currentLang === "ko" ? provinceName : meta.kr;

      tooltip
        .style("left", `${left}px`)
        .style("top", `${top}px`)
        .html(`
          <div class="tooltip-title">
            <span>${primaryTitle}</span>
            <span class="tooltip-kr">${secondaryTitle}</span>
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

    function hideTooltip() {
      tooltip.style("opacity", 0);
    }

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".province-path") && !e.target.closest(".map-circle")) {
        hideTooltip();
        highlightProvince(null, false);
      }
    });

    // Continuous Animation Player
    let isPlaying = false;
    let animReq = null;
    let lastTime = null;
    let playbackSpeed = 1.0;
    const totalDuration = 14000; // 14 seconds for complete 1999 -> 2026 playback

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
        renderTime(2026);
        stop();
        return;
      }

      renderTime(currentTime);
      animReq = requestAnimationFrame(step);
    }

    function play() {
      if (isPlaying) return stop();
      if (currentTime >= 2026) {
        currentTime = 1999;
        renderTime(1999);
      }
      isPlaying = true;
      lastTime = null;
      const t = i18n[currentLang];
      d3.select("#play").text(t.pause).classed("btn-primary", false);
      animReq = requestAnimationFrame(step);
    }

    function stop() {
      isPlaying = false;
      if (animReq) cancelAnimationFrame(animReq);
      animReq = null;
      lastTime = null;
      const t = i18n[currentLang];
      d3.select("#play").text(t.play).classed("btn-primary", true);
    }

    d3.select("#play").on("click", play);

    const yearSlider = document.getElementById("yearSlider");
    yearSlider.addEventListener("input", e => {
      stop();
      currentTime = +e.target.value;
      renderTime(currentTime);
    });

    d3.select("#unitScale").on("change", function () {
      stop();
      const unit = +this.value;
      const t = i18n[currentLang];
      d3.select("#legendText").text(t.scaleSub(unit));
      buildTimelinePoints(unit);
      renderTime(currentTime);
    });

    d3.selectAll(".speed-btn").on("click", function () {
      d3.selectAll(".speed-btn").classed("active", false);
      d3.select(this).classed("active", true);
      playbackSpeed = +this.dataset.speed;
    });

    d3.select("#prevYear").on("click", () => {
      stop();
      currentTime = Math.max(1999, Math.floor(currentTime) - 1);
      renderTime(currentTime);
    });

    d3.select("#nextYear").on("click", () => {
      stop();
      currentTime = Math.min(2026, Math.floor(currentTime) + 1);
      renderTime(currentTime);
    });

    // Initialize with current language
    updateLanguage(currentLang);

    // Initial render and layout trigger
    updateMapPositions();
    renderTime(2026);
    setTimeout(() => {
      map.invalidateSize();
      updateMapPositions();
    }, 200);
  }
});
