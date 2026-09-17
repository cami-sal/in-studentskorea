// Foreign Students in Korea (1999–2026) — D3.js Visualization

document.addEventListener("DOMContentLoaded", () => {
  const width = 1000, height = 840;
  const svg = d3.select("#chart");
  const tooltip = d3.select("#tooltip");
  const loadingOverlay = document.getElementById("loadingOverlay");

  // Load external dataset
  d3.json("./data.json")
    .then(data => {
      if (loadingOverlay) {
        loadingOverlay.style.opacity = "0";
        setTimeout(() => loadingOverlay.remove(), 300);
      }
      initVisualization(data);
    })
    .catch(err => {
      console.error("Error loading data.json:", err);
      if (loadingOverlay) {
        loadingOverlay.innerHTML = `
          <div style="text-align: center; padding: 20px; max-width: 450px;">
            <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Unable to load data.json</div>
            <div style="font-size: 13px; color: #64748b; line-height: 1.5;">
              If opening locally via <code>file://</code>, browsers block data requests. Please run a local web server (e.g. <code>python3 -m http.server</code> or VSCode Live Server) or view on <strong>GitHub Pages</strong>.
            </div>
          </div>
        `;
      }
    });

  function initVisualization(data) {
    const { koreaGeoData, rawData, provincePoints, provinceMeta } = data;

    // Accurate Mercator projection fitted to South Korea
    const projection = d3.geoMercator()
      .fitExtent([[30, 20], [970, 820]], koreaGeoData);

    const pathGenerator = d3.geoPath().projection(projection);

    // Pre-project all points to SVG pixels
    const projectedPoints = {};
    for (const [pname, pts] of Object.entries(provincePoints)) {
      projectedPoints[pname] = pts.map((pt, i) => {
        const [px, py] = projection(pt);
        return {
          id: `${pname}_${i}`,
          province: pname,
          x: px,
          y: py
        };
      });
    }

    const dataByYear = d3.group(rawData, d => d.Year);
    const provinceNames = Object.keys(provinceMeta);

    // SVG Layer Groups
    const mapLayer = svg.append("g").attr("class", "map-layer");
    const circleLayer = svg.append("g").attr("class", "circle-layer");
    const labelLayer = svg.append("g").attr("class", "label-layer");

    // Render Province Boundaries
    mapLayer.selectAll(".province-path")
      .data(koreaGeoData.features, d => d.properties.name)
      .join("path")
      .attr("class", "province-path")
      .attr("d", pathGenerator)
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

    // Province Text Badges
    const labelGroups = labelLayer.selectAll(".province-label-group")
      .data(provinceNames)
      .join("g")
      .attr("class", "province-label-group")
      .attr("transform", d => {
        const coords = projection(provinceMeta[d].center);
        return `translate(${coords[0]},${coords[1]})`;
      });

    labelGroups.append("text")
      .attr("class", "province-label-bg")
      .attr("y", -4)
      .text(d => d);

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
        const available = projectedPoints[pname] || [];
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

      // Sort strictly by arrival time so playback is a continuous stream
      list.sort((a, b) => a.time - b.time);
      allPointsSorted = list;
      allPointsTimestamps = list.map(d => d.time);
    }

    buildTimelinePoints(50);

    // Render Frame at continuous time T (1999.0 to 2026.0)
    function renderTime(t) {
      t = Math.max(1999.0, Math.min(2026.0, t));
      const currentYearInt = Math.min(2026, Math.floor(t));

      // Determine which points are active at time t
      const visibleCount = d3.bisectRight(allPointsTimestamps, t);
      const visiblePoints = allPointsSorted.slice(0, visibleCount);

      const circleRadius = currentUnit <= 25 ? 3.5 : (currentUnit <= 50 ? 4.2 : 5.0);

      // High performance D3 Join (Empty Circles swarm)
      circleLayer.selectAll(".empty-circle")
        .data(visiblePoints, d => d.id)
        .join(
          enter => enter.append("circle")
            .attr("class", "empty-circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
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
          update => update.attr("r", circleRadius),
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
      d3.select("#statYearSub").text(`Students across 17 provinces in ${currentYearInt}`);

      d3.select("#statTotalCircles").text(d3.format(",")(visiblePoints.length));
      d3.select("#statScaleSub").text(`1 circle = ${currentUnit} students`);

      d3.select("#statSeoulTotal").text(d3.format(",")(seoulTotal));
      d3.select("#statSeoulShare").text(`${seoulPct}% of national total`);

      d3.select("#statCapitalTotal").text(d3.format(",")(capitalSum));
      d3.select("#statCapitalShare").text(`${capitalPct}% of all foreign students`);

      // Update Toolbar
      d3.select("#yearLabel").text(currentYearInt);
      d3.select("#yearSlider").property("value", t);
    }

    // Tooltips & Highlight
    function highlightProvince(name, active) {
      d3.select(`#path-${name}`).classed("active", active);
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

      const nationalTotal = yearData.reduce((s, d) => s + d.Total, 0);
      const share = nationalTotal > 0 ? ((totalStudents / nationalTotal) * 100).toFixed(1) : 0;

      const sorted = [...yearData].sort((a, b) => b.Total - a.Total);
      const rank = sorted.findIndex(d => d.Province === provinceName) + 1;
      const circleCount = Math.round(totalStudents / currentUnit);

      tooltip
        .style("left", (event.clientX + 16) + "px")
        .style("top", (event.clientY + 16) + "px")
        .html(`
          <div class="tooltip-title">
            <span>${provinceName}</span>
            <span class="tooltip-kr">${meta.kr}</span>
          </div>
          <div class="tooltip-row">
            <span>Total Students (${currentYear}):</span>
            <strong>${d3.format(",")(totalStudents)}</strong>
          </div>
          <div class="tooltip-row">
            <span>Empty Circles on Map:</span>
            <strong>${d3.format(",")(circleCount)}</strong>
          </div>
          <div class="tooltip-row">
            <span>National Share:</span>
            <strong>${share}%</strong>
          </div>
          <div class="tooltip-row">
            <span>National Rank:</span>
            <strong>#${rank > 0 ? rank : '—'} of 17</strong>
          </div>
        `);
    }

    function hideTooltip() {
      tooltip.style("opacity", 0);
    }

    // Continuous Animation Player
    let currentTime = 2026;
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
      d3.select("#play").text("⏸ Pause").classed("btn-primary", false);
      animReq = requestAnimationFrame(step);
    }

    function stop() {
      isPlaying = false;
      if (animReq) cancelAnimationFrame(animReq);
      animReq = null;
      lastTime = null;
      d3.select("#play").text("▶ Play").classed("btn-primary", true);
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
      d3.select("#legendText").text(`1 circle = ${unit} students`);
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

    // Initial Render at 2026
    renderTime(2026);
  }
});
