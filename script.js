// script.js

// Initialize the map centered on the world
var map = L.map('map', {
  fullscreenControl: true
}).setView([20, 0], 2);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load project data
fetch('projects.json')
  .then(res => res.json())
  .then(projectData => {
    const projectsByCountry = {};
    projectData.projects.forEach(p => {
      projectsByCountry[p.country] = p;
    });

    // Load world GeoJSON
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(geojson => {
        L.geoJSON(geojson, {
          style: feature => {
            const cname = feature.properties.name;
            if (projectsByCountry[cname]) {
              return {
                color: '#3388ff',
                weight: 2,
                fillColor: '#ffeeaa',
                fillOpacity: 0.5
              };
            }
            return {
              color: '#999',
              weight: 1,
              fillOpacity: 0
            };
          },
          onEachFeature: (feature, layer) => {
            const cname = feature.properties.name;
            if (projectsByCountry[cname]) {
              const proj = projectsByCountry[cname];
              let popupHtml = `<strong>${cname}</strong><br>`;
              if (proj.image) {
                popupHtml += `<img src="${proj.image}" style="width:100px;"><br>`;
              }
              popupHtml += proj.description || '';
              layer.bindPopup(popupHtml);
            }
          }
        }).addTo(map);
      });
  });


function onEachFeature(feature, layer) {
  layer.on('click', function () {
    const countryName = feature.properties.name;
    const project = projects.find(p => p.country === countryName);
    const panel = document.getElementById('info-panel');
    if (project) {
      panel.innerHTML = `
        <h2>${project.name}</h2>
        <p>${project.description}</p>
      `;
    } else {
      panel.innerHTML = `<p>No project information available for ${countryName}.</p>`;
    }
  });
}

L.geoJSON(geojsonData, {
  onEachFeature: onEachFeature
}).addTo(map);

