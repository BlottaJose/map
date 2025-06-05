// Initialize the map with fullscreen targeting #map-container
var map = L.map('map', {
  fullscreenControl: true,
  fullscreenControlOptions: {
    container: document.getElementById('map-container')
  }
}).setView([20, 0], 2);


// Borderless basemap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
}).addTo(map);

let projectsByCountry = {};

// Load project and geojson data
fetch('projects.json')
  .then(res => res.json())
  .then(projectData => {
    projectData.projects.forEach(p => {
      projectsByCountry[p.country] = p;
    });

    return fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
  })
  .then(res => res.json())
  .then(geojson => {
    const geoLayer = L.geoJSON(geojson, {
      style: feature => {
        const cname = feature.properties.name;
        return {
          color: 'transparent',
          weight: 0,
          fillColor: projectsByCountry[cname] ? '#ffeeaa' : '#dddddd',
          fillOpacity: projectsByCountry[cname] ? 0.6 : 0.1
        };
      },
      onEachFeature: (feature, layer) => {
        const cname = feature.properties.name;
        layer.on('click', (e) => {
          L.DomEvent.stopPropagation(e); // prevent triggering map click

          const panel = document.getElementById('info-panel');
          const proj = projectsByCountry[cname];
          if (proj) {
            panel.innerHTML = `
              <h2>${cname}</h2>
              ${proj.image ? `<img src="${proj.image}" style="max-width: 100%; height: auto;"><br>` : ''}
              <p>${proj.description}</p>
            `;
            panel.classList.add('active');
          } else {
            panel.innerHTML = `<h2>${cname}</h2><p>No project information available.</p>`;
            panel.classList.add('active');
          }
        });
      }
    });

    geoLayer.addTo(map);

    // Hide the panel on map click (outside countries)
    map.on('click', () => {
      const panel = document.getElementById('info-panel');
      panel.classList.remove('active');
    });
  });

// Custom fullscreen logic for #map-container
document.getElementById('custom-fullscreen-btn').addEventListener('click', () => {
  const container = document.getElementById('map-container');
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen(); // Safari
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen(); // Safari
    }
  }
});
