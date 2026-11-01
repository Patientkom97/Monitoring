import { GRAV } from './config.js';

let map, markersLayer;

export function initMap(onLocationSelect) {
  map = L.map('map').setView([-2.8774, 29.2248], 6); // Centré sur la région Kivu
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    document.getElementById('inputLat').value = lat;
    document.getElementById('inputLng').value = lng;
    if (onLocationSelect) onLocationSelect(lat, lng);
  });
}

export function updateMapMarkers(cases) {
  markersLayer.clearLayers();
  cases.forEach(c => {
    if (c.lat && c.lng) {
      const marker = L.marker([c.lat, c.lng]);
      marker.bindPopup(`<b>${c.code}</b><br>${c.lieu}<br>Type: ${c.type}<br>Gravité: ${GRAV[c.grav]}`);
      markersLayer.addLayer(marker);
    }
  });
}