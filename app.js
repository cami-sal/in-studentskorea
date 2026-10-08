// Foreign Students in Korea (1999–2026) & Global Origin Countries (2024 Visa Data)
// OpenStreetMap Leaflet + D3.js Dual-Mode Visualization

document.addEventListener("DOMContentLoaded", () => {
  const tooltip = d3.select("#tooltip");
  const loadingOverlay = document.getElementById("loadingOverlay");

  // Bilingual i18n Dictionary
  const i18n = {
    en: {
      pageTitle: "Foreign Students in Korea (1999–2026) — Interactive Map",
      mainTitle: "Foreign Students in Korea",
      mainSubtitle: "Continuous accumulation across 17 Korean provinces (1999–2026) and global countries of origin (2024 visa statistics).",
      modeKorea: "Domestic Distribution (1999–2026)",
      modeWorld: "Country of Origin (2024 Visa Data)",
      
      // Korea Mode Stats
      card1KoreaLabel: "National Total",
      card1KoreaSub: year => `Students across 17 provinces in ${year}`,
      card2KoreaLabel: "Total Circles",
      card2KoreaSub: unit => `1 circle = ${unit} students`,
      card3KoreaLabel: "Seoul Concentration",
      card3KoreaSub: pct => `${pct}% of national total`,
      card4KoreaLabel: "Capital Area (Seoul+Gyeonggi+Incheon)",
      card4KoreaSub: pct => `${pct}% of all foreign students`,

      // World Mode Stats
      card1WorldLabel: "Total International Students (2024)",
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
      visaAll: "All (D2+D4)",
      visaD2: "D-2 Degree",
      visaD4: "D-4 Language",
      continentFilter: "Filter by Continent",
      contAll: "All Continents (182)",
      contAsia: "Asia",
      contEurope: "Europe",
      contNA: "North America",
      contSA: "South America",
      contAfrica: "Africa",
      contOceania: "Oceania",
      topOriginsTitle: "Top Origin Countries",
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
      clickToZoom: "Click circle to zoom in",
      loading: "Loading geographic dataset..."
    },
    ko: {
      pageTitle: "국내 외국인 유학생 현황 (1999–2026) 및 출신국 통계 — 인터랙티브 지도",
      mainTitle: "국내 외국인 유학생 현황",
      mainSubtitle: "1999년부터 2026년까지 대한민국 전국 17개 시·도별 유학생 누적 추이 및 2024년 유학 비자 출신국 현황",
      modeKorea: "전국 시·도별 분포 (1999–2026)",
      modeWorld: "출신 국가별 현황 (2024 비자 통계)",

      // Korea Mode Stats
      card1KoreaLabel: "전국 총 유학생",
      card1KoreaSub: year => `${year}년 전국 17개 시·도 총 유학생`,
      card2KoreaLabel: "지도 내 총 원",
      card2KoreaSub: unit => `1개 원 = ${unit}명`,
      card3KoreaLabel: "서울 집중도",
      card3KoreaSub: pct => `전국 대비 ${pct}%`,
      card4KoreaLabel: "수도권 (서울·경기·인천)",
      card4KoreaSub: pct => `전체 유학생의 ${pct}%`,

      // World Mode Stats
      card1WorldLabel: "2024년 총 유학생 비자 발급",
      card1WorldSub: "학위 과정(D-2) 및 어학연수(D-4) 합계",
      card2WorldLabel: "출신 국가 수",
      card2WorldSub: "전 세계 6개 대륙 182개국",
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
      visaAll: "전체 (D2+D4)",
      visaD2: "D-2 학위과정",
      visaD4: "D-4 어학연수",
      continentFilter: "대륙별 필터",
      contAll: "전체 대륙 (182개국)",
      contAsia: "아시아주",
      contEurope: "유럽주",
      contNA: "북아메리카주",
      contSA: "남아메리카주",
      contAfrica: "아프리카주",
      contOceania: "오세아니아주",
      topOriginsTitle: "최다 유학생 출신국",
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
      clickToZoom: "원을 클릭하면 해당 국가로 확대됩니다",
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

    // 1. Initialize Leaflet Zoomable Map
    const map = L.map("chart", {
      center: [35.85, 127.85],
      zoom: 7,
      minZoom: 2,
      maxZoom: 18,
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
    const svg = overlay.select("svg").attr("pointer-events", "auto");

    // Korea Mode Layers
    const mapLayer = svg.append("g").attr("class", "leaflet-zoom-hide map-layer");
    const outerBorderLayer = svg.append("g").attr("class", "leaflet-zoom-hide outer-border-layer");
    const circleLayer = svg.append("g").attr("class", "leaflet-zoom-hide circle-layer");
    const labelLayer = svg.append("g").attr("class", "leaflet-zoom-hide label-layer");

    // World Mode Layers
    const countryCircleLayer = svg.append("g").attr("class", "leaflet-zoom-hide country-circle-layer").style("display", "none");

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

    // Reposition all SVG elements on Map Zoom / Pan
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

        circleLayer.selectAll(".map-circle")
          .attr("cx", d => map.latLngToLayerPoint([d.lat, d.lng]).x)
          .attr("cy", d => map.latLngToLayerPoint([d.lat, d.lng]).y)
          .attr("r", circleRadius);
      } else {
        // World Origin Circles repositioning
        countryCircleLayer.selectAll(".country-group")
          .attr("transform", d => {
            const pt = map.latLngToLayerPoint([d.lat, d.lng]);
            return `translate(${pt.x},${pt.y})`;
          });
      }
    }

    map.on("zoom", updateMapPositions);
    map.on("move", updateMapPositions);
    map.on("zoomend", updateMapPositions);
    map.on("viewreset", updateMapPositions);

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

      if (currentMode === "korea") {
        d3.select("#labelCard1").text(tLang.card1KoreaLabel);
        d3.select("#statCard1Val").text(d3.format(",")(national));
        d3.select("#statCard1Sub").text(tLang.card1KoreaSub(currentYearInt));

        d3.select("#labelCard2").text(tLang.card2KoreaLabel);
        d3.select("#statCard2Val").text(d3.format(",")(visiblePoints.length));
        d3.select("#statCard2Sub").text(tLang.card2KoreaSub(currentUnit));

        d3.select("#labelCard3").text(tLang.card3KoreaLabel);
        d3.select("#statCard3Val").text(d3.format(",")(seoulTotal));
        d3.select("#statCard3Sub").text(tLang.card3KoreaSub(seoulPct));

        d3.select("#labelCard4").text(tLang.card4KoreaLabel);
        d3.select("#statCard4Val").text(d3.format(",")(capitalSum));
        d3.select("#statCard4Sub").text(tLang.card4KoreaSub(capitalPct));
      }

      d3.select("#yearLabel").text(currentYearInt);
      d3.select("#yearSlider").property("value", t);
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
        d3.select("#labelCard1").text(tLang.card1WorldLabel);
        d3.select("#statCard1Val").text(d3.format(",")(totalStudentsAll));
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

      // D3 join on country groups
      const groups = countryCircleLayer.selectAll(".country-group")
        .data(filtered, d => d.country_kr)
        .join(
          enter => {
            const g = enter.append("g")
              .attr("class", "country-group")
              .attr("transform", d => {
                const pt = map.latLngToLayerPoint([d.lat, d.lng]);
                return `translate(${pt.x},${pt.y})`;
              });

            g.append("circle")
              .attr("class", "country-circle")
              .attr("r", 0)
              .transition().duration(400)
              .attr("r", d => radiusScale(getCountryCount(d)));

            g.append("circle")
              .attr("class", "country-center-dot")
              .attr("r", 2);

            g.on("mouseenter", function (event, d) {
              d3.select(this).select(".country-circle").classed("active", true);
              showCountryTooltip(event, d, totalStudentsAll);
            })
            .on("mousemove", function (event, d) {
              moveCountryTooltip(event);
            })
            .on("mouseleave", function (event, d) {
              d3.select(this).select(".country-circle").classed("active", false);
              hideTooltip();
            })
            .on("click", function (event, d) {
              map.flyTo([d.lat, d.lng], Math.max(map.getZoom(), 5), { duration: 1.2 });
            });

            return g;
          },
          update => {
            update.attr("transform", d => {
              const pt = map.latLngToLayerPoint([d.lat, d.lng]);
              return `translate(${pt.x},${pt.y})`;
            });

            update.select(".country-circle")
              .transition().duration(300)
              .attr("r", d => radiusScale(getCountryCount(d)));

            return update;
          },
          exit => exit.transition().duration(200).style("opacity", 0).remove()
        );

      populateTopCountriesList(filtered);
    }

    function populateTopCountriesList(list) {
      const topListContainer = d3.select("#topCountriesList");
      topListContainer.html("");

      const sorted = [...list].sort((a, b) => getCountryCount(b) - getCountryCount(a)).slice(0, 10);

      sorted.forEach((d, i) => {
        const item = topListContainer.append("div")
          .attr("class", "top-country-item")
          .on("click", () => {
            map.flyTo([d.lat, d.lng], 5, { duration: 1.2 });
            countryCircleLayer.selectAll(".country-circle").classed("active", x => x.country_kr === d.country_kr);
          })
          .on("mouseenter", (e) => {
            countryCircleLayer.selectAll(".country-circle").classed("active", x => x.country_kr === d.country_kr);
            showCountryTooltip(e, d, countryVisaData.reduce((s, x) => s + getCountryCount(x), 0));
          })
          .on("mouseleave", () => {
            countryCircleLayer.selectAll(".country-circle").classed("active", false);
            hideTooltip();
          });

        item.append("span")
          .attr("class", "top-country-rank")
          .text(`#${i + 1}`);

        item.append("span")
          .attr("class", "top-country-name")
          .text(currentLang === "ko" ? d.country_kr : d.country_en);

        item.append("span")
          .attr("class", "top-country-count")
          .text(d3.format(",")(getCountryCount(d)));
      });
    }

    // View Mode Switching
    function setMode(mode) {
      currentMode = mode;
      stop(); // Stop timeline playback if active

      d3.selectAll(".view-mode-btn").classed("active", function () {
        return this.dataset.mode === mode;
      });

      if (mode === "korea") {
        d3.select("#koreaControls").style("display", "flex");
        d3.select("#worldControls").style("display", "none");
        mapLayer.style("display", "inline");
        outerBorderLayer.style("display", "inline");
        circleLayer.style("display", "inline");
        labelLayer.style("display", "inline");
        countryCircleLayer.style("display", "none");

        map.flyTo([35.85, 127.85], 7, { duration: 1.2 });
        setTimeout(() => {
          updateMapPositions();
          renderKoreaTime(currentTime);
        }, 300);
      } else {
        d3.select("#koreaControls").style("display", "none");
        d3.select("#worldControls").style("display", "flex");
        mapLayer.style("display", "none");
        outerBorderLayer.style("display", "none");
        circleLayer.style("display", "none");
        labelLayer.style("display", "none");
        countryCircleLayer.style("display", "inline");

        map.flyTo([24, 20], 2.6, { duration: 1.4 });
        setTimeout(() => {
          updateMapPositions();
          renderWorldOrigins();
        }, 300);
      }
    }

    d3.selectAll(".view-mode-btn").on("click", function () {
      setMode(this.dataset.mode);
    });

    // World Visa Filter Group
    d3.selectAll(".visa-btn").on("click", function () {
      d3.selectAll(".visa-btn").classed("active", false);
      d3.select(this).classed("active", true);
      selectedVisa = this.dataset.visa;
      renderWorldOrigins();
    });

    // World Continent Filter
    d3.select("#continentSelect").on("change", function () {
      selectedContinent = this.value;
      renderWorldOrigins();
    });

    // Language switcher handler
    function updateLanguage(lang) {
      currentLang = lang;
      localStorage.setItem("preferred_lang", lang);
      const t = i18n[lang];

      document.title = t.pageTitle;
      d3.select("#mainTitle").text(t.mainTitle);
      d3.select("#mainSubtitle").text(t.mainSubtitle);

      d3.select("#modeKoreaTitle").text(t.modeKorea);
      d3.select("#modeWorldTitle").text(t.modeWorld);

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

      // World Panel texts
      d3.select("#labelWorldPanel").text(t.worldPanelTitle);
      d3.select("#labelVisaFilter").text(t.visaFilter);
      d3.select("#btnVisaAll").text(t.visaAll);
      d3.select("#btnVisaD2").text(t.visaD2);
      d3.select("#btnVisaD4").text(t.visaD4);
      d3.select("#labelContinentFilter").text(t.continentFilter);

      d3.select("#optContAll").text(t.contAll);
      d3.select("#optContAsia").text(`${t.contAsia} (44)`);
      d3.select("#optContEurope").text(`${t.contEurope} (45)`);
      d3.select("#optContNA").text(`${t.contNA} (2)`);
      d3.select("#optContSA").text(`${t.contSA} (31)`);
      d3.select("#optContAfrica").text(`${t.contAfrica} (52)`);
      d3.select("#optContOceania").text(`${t.contOceania} (8)`);

      d3.select("#labelTopOrigins").text(t.topOriginsTitle);
      d3.select("#mapSourceTag").text(t.sourceTag);

      // Update map province labels text
      labelTexts.text(d => currentLang === "ko" ? (krShortNames[d] || d) : d);

      // Update switcher active class
      d3.selectAll(".lang-btn").classed("active", function () {
        return this.dataset.lang === lang;
      });

      if (currentMode === "korea") {
        renderKoreaTime(currentTime);
      } else {
        renderWorldOrigins();
      }
    }

    // Attach click listeners to language buttons
    d3.selectAll(".lang-btn").on("click", function () {
      updateLanguage(this.dataset.lang);
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

    // World Origin Country Tooltip
    function showCountryTooltip(event, d, totalAll) {
      tooltip.style("opacity", 1);
      const tLang = i18n[currentLang];
      const count = getCountryCount(d);
      const share = totalAll > 0 ? ((count / totalAll) * 100).toFixed(2) : 0;
      const d2Pct = d.total > 0 ? ((d.d2 / d.total) * 100).toFixed(1) : 0;
      const d4Pct = d.total > 0 ? ((d.d4 / d.total) * 100).toFixed(1) : 0;

      const titleName = currentLang === "ko" ? d.country_kr : d.country_en;
      const subName = currentLang === "ko" ? d.country_en : d.country_kr;
      const contName = currentLang === "ko" ? d.continent_kr : d.continent_en;

      const mouseX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
      const mouseY = event.clientY || (event.touches ? event.touches[0].clientY : 0);
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let posX = mouseX + 16;
      let posY = mouseY + 16;
      if (posX + 260 > windowWidth) posX = mouseX - 265;
      if (posY + 200 > windowHeight) posY = mouseY - 205;

      tooltip
        .style("left", `${posX}px`)
        .style("top", `${posY}px`)
        .html(`
          <div class="tooltip-title">
            <span>${titleName}</span>
            <span class="tooltip-kr">${subName}</span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">🌍 ${contName} &bull; ${tLang.worldRankVal(d.rank, countryVisaData.length)}</div>
          <div class="tooltip-row">
            <span>${selectedVisa === "d2" ? tLang.tooltipD2 : (selectedVisa === "d4" ? tLang.tooltipD4 : "Total Students (2024):")}</span>
            <strong>${d3.format(",")(count)}</strong>
          </div>
          <div class="tooltip-row">
            <span>${tLang.tooltipShare}</span>
            <strong>${share}%</strong>
          </div>
          <div class="tooltip-row" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; margin-top: 4px;">
            <span>D-2 Degree (${d2Pct}%):</span>
            <strong>${d3.format(",")(d.d2)}</strong>
          </div>
          <div class="tooltip-row">
            <span>D-4 Language (${d4Pct}%):</span>
            <strong>${d3.format(",")(d.d4)}</strong>
          </div>
          <div style="font-size: 10px; color: #60a5fa; margin-top: 6px; text-align: right;">${tLang.clickToZoom}</div>
        `);
    }

    function moveCountryTooltip(event) {
      const mouseX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
      const mouseY = event.clientY || (event.touches ? event.touches[0].clientY : 0);
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let posX = mouseX + 16;
      let posY = mouseY + 16;
      if (posX + 260 > windowWidth) posX = mouseX - 265;
      if (posY + 200 > windowHeight) posY = mouseY - 205;

      tooltip
        .style("left", `${posX}px`)
        .style("top", `${posY}px`);
    }

    function hideTooltip() {
      tooltip.style("opacity", 0);
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
      renderKoreaTime(currentTime);
    });

    d3.select("#unitScale").on("change", function () {
      stop();
      const unit = +this.value;
      const t = i18n[currentLang];
      d3.select("#legendText").text(t.scaleSub(unit));
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

    // Initialize with current language and mode
    updateLanguage(currentLang);
    setMode("korea");

    // Initial layout trigger
    updateMapPositions();
    setTimeout(() => {
      map.invalidateSize();
      updateMapPositions();
    }, 250);
  }
});
