// Initialize the map
var map = L.map('map', {
  fullscreenControl: true
}).setView([20, 0], 2);

// Add OpenStreetMap tiles
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

    // Load GeoJSON
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(geojson => {
        L.geoJSON(geojson, {
          style: feature => {
            const cname = feature.properties.name;
            return {
              color: 'transparent',  // No border
              weight: 0,
              fillColor: projectsByCountry[cname] ? '#ffeeaa' : '#dddddd',
              fillOpacity: projectsByCountry[cname] ? 0.6 : 0.1
            };
          },
          onEachFeature: (feature, layer) => {
            const cname = feature.properties.name;
            layer.on('click', () => {
              const panel = document.getElementById('info-panel');
              const proj = projectsByCountry[cname];
              if (proj) {
                panel.innerHTML = `
                  <h2>${cname}</h2>
                  ${proj.image ? `<img src="${proj.image}" style="max-width: 100%; height: auto;"><br>` : ''}
                  <p>${proj.description}</p>
                `;
              } else {
                panel.innerHTML = `
                  <h2>${cname}</h2>
                  <p>No project information available.</p>
                `;
              }
            });
          }
        }).addTo(map);
      });
  });

