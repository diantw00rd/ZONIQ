document.addEventListener("DOMContentLoaded", () => {
  // --- YEAR DROPDOWN (2026-2028 only) ---
  const yearSelect = document.getElementById("year");
  for (let y = 2028; y >= 2026; y--) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }

 // Set the default selected year to 2026
 yearSelect.value = "2026";
 yearSelect.addEventListener("change", renderRegions);
 // After setting the default year, call renderRegions to show data for 2026 initially


  // --- MAP ---
  const map = L.map("map", {
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  }).setView([9.082, 8.6753], 6);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors & CartoDB',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  // --- DATA ---
  let geojsonCountries = null, geojsonRiskData = null, countryHighlightLayer = null, riskLayer = null;

  // --- COLOR SCALE ---
  function getColor(risk) {
    return risk > 80 ? '#00ffd0' :
           risk > 60 ? '#7ee8fa' :
           risk > 40 ? '#eec0c6' :
           risk > 20 ? '#4b6cb7' :
           risk > 0  ? '#182848' :
                        '#232526';
  }
  function updateLegend() {
    const legend = document.getElementById("legend");
    legend.innerHTML = `
      <strong>Predicted Risk (%)</strong>
      <div><span style="background:${getColor(90)}"></span> 80-100</div>
      <div><span style="background:${getColor(70)}"></span> 60-80</div>
      <div><span style="background:${getColor(50)}"></span> 40-60</div>
      <div><span style="background:${getColor(30)}"></span> 20-40</div>
      <div><span style="background:${getColor(10)}"></span> 0-20</div>
    `;
  }

  // --- REGIONS LAYER ---
  function renderRegions() {
    if (!geojsonRiskData) return;
    if (riskLayer) map.removeLayer(riskLayer);

    const year = parseInt(yearSelect.value);
    const filtered = {
      type: "FeatureCollection",
      features: geojsonRiskData.features.filter(
        f => f.properties.year === year && [2026, 2027, 2028].includes(f.properties.year)
      )
    };

    riskLayer = L.geoJSON(filtered, {
      pointToLayer: (feature, latlng) => {
        const risk = feature.properties.predicted_outbreak_prob * 100;
        return L.circleMarker(latlng, {
          radius: 10,
          fillColor: getColor(risk),
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.92
        }).on("click", () => showRegionInfo(feature, risk, year));
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.iu_region || "Unknown", {permanent: false});
      }
    }).addTo(map);
  }

  // --- INFO BOX ---
  function showRegionInfo(feature, risk, year) {
    const infoBox = document.getElementById("info-box");
    const infoContent = document.getElementById("info-content");
    infoContent.innerHTML = `
      <strong>${feature.properties.iu_region}</strong><br>
      <b>Year:</b> ${year}<br>
      <b>Predicted Risk:</b> <span style="color:${getColor(risk)};font-weight:bold">${risk.toFixed(2)}%</span><br>
      <b>IU Code:</b> ${feature.properties.iu_code}<br>
      <hr>
      <small>
        <em>Risk values are projections based on machine learning models integrating local climate trends and historical NTD prevalence.</em>
      </small>
    `;
    infoBox.classList.remove("hidden");
    infoBox.focus();
  }

  document.getElementById("close-info").addEventListener("click", () => {
    document.getElementById("info-box").classList.add("hidden");
  });

  // --- COUNTRY SEARCH AUTOCOMPLETE ---
  let countryNames = [];
  fetch("country-location.json")
    .then(res => res.json())
    .then(data => {
      geojsonCountries = data;
      countryNames = data.features.map(f => f.properties.name).filter(Boolean).sort();
      L.geoJSON(data, {
        style: { color: "#fff", weight: 1, fillOpacity: 0.01 },
        interactive: false,
      }).addTo(map);
    });

  // --- LOAD RISK GEOJSON DATA ---
  fetch("merged_data_geo.json")
    .then(res => res.json())
    .then(data => {
      data.features = data.features.filter(f => [2026, 2027, 2028].includes(f.properties.year));
      geojsonRiskData = data;
      renderRegions();
    });

  // --- AUTOCOMPLETE LOGIC ---
  const searchInput = document.getElementById("search");
  const autocompleteList = document.getElementById("autocomplete-list");
  let currentFocus = -1;

  searchInput.addEventListener("input", function () {
    const val = this.value.trim().toLowerCase();
    autocompleteList.innerHTML = "";
    if (!val || !countryNames.length) return;

    const matches = countryNames.filter(name => name.toLowerCase().startsWith(val));
    matches.forEach((name, idx) => {
      const item = document.createElement("li");
      item.textContent = name;
      item.addEventListener("mousedown", function (e) {
        e.preventDefault();
        selectCountry(name);
        autocompleteList.innerHTML = "";
      });
      autocompleteList.appendChild(item);
    });
    currentFocus = -1;
  });

  searchInput.addEventListener("keydown", function (e) {
    let items = autocompleteList.getElementsByTagName("li");
    if (e.key === "ArrowDown") {
      currentFocus++;
      addActive(items);
    } else if (e.key === "ArrowUp") {
      currentFocus--;
      addActive(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentFocus > -1 && items[currentFocus]) {
        items[currentFocus].dispatchEvent(new Event("mousedown"));
      } else {
        selectCountry(this.value);
        autocompleteList.innerHTML = "";
      }
    }
  });

  function addActive(items) {
    if (!items) return;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(items) {
    for (let item of items) item.classList.remove("autocomplete-active");
  }

  function selectCountry(countryName) {
    const name = countryName.trim().toLowerCase();
    if (!geojsonCountries) return;
    if (countryHighlightLayer) {
      map.removeLayer(countryHighlightLayer);
      countryHighlightLayer = null;
    }
    let found = false;
    countryHighlightLayer = L.geoJSON(geojsonCountries, {
      filter: f => f.properties.name.toLowerCase() === name,
      style: { color: "#00ffd0", weight: 3, fillOpacity: 0.1 },
      interactive: false, // <-- THIS LINE MAKES DOTS CLICKABLE
      onEachFeature: (feature, layer) => {
        map.fitBounds(layer.getBounds());
        found = true;
      }
    }).addTo(map);
    if (!found) alert("Country not found!");
    searchInput.value = countryNames.find(n => n.toLowerCase() === name) || countryName;
    autocompleteList.innerHTML = "";
  }

  document.addEventListener("click", function (e) {
    if (e.target !== searchInput) autocompleteList.innerHTML = "";
  });

  updateLegend();

  // --- HOW IT WORKS MODAL ---
  const modal = document.getElementById('howworks-modal');
  const openModal = document.getElementById('howworks-btn');
  const closeModal = document.getElementById('modal-close');
  openModal.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.focus();
  });
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
    }
  });
});
