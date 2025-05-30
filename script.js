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
                color: 'transparent',         // no border
                weight: 0,
                fillColor: '#ffeeaa',
                fillOpacity: 0.5
              };
            }
            return {
              color: 'transparent',         // no border
              weight: 0,
              fillColor: '#dddddd',
              fillOpacity: 0.1
            };
          },
          onEachFeature: (feature, layer) => {
            const cname = feature.properties.name;
            layer.on('click', () => {
              const panel = document.getElementById('info-panel');
              const proj = projectsByCountry[cname];
              if (proj) {
                panel.innerHTML = `
                  <h2>${proj.name}</h2>
                  ${proj.image ? `<img src="${proj.image}" style="width:100%;max-width:300px;"><br>` : ''}
                  <p>${proj.description || 'No description available.'}</p>
                `;
              } else {
                panel.innerHTML = `<h2>${cname}</h2><p>No project information available.</p>`;
              }
            });
          }
        }).addTo(map);
      });
  });
