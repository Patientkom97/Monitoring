import { TYPES, STATUTS } from './config.js';

let chartTypeInstance = null;
let chartStatusInstance = null;

export function updateCharts(cases) {
  // Graphique par Type
  const typeCounts = TYPES.map(t => cases.filter(c => c.type === t).length);
  const ctxType = document.getElementById('chartType').getContext('2d');
  if (chartTypeInstance) chartTypeInstance.destroy();
  chartTypeInstance = new Chart(ctxType, {
    type: 'bar',
    data: { labels: TYPES, datasets: [{ label: 'Cas', data: typeCounts, backgroundColor: '#0f4c5c' }] },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // Graphique par Statut
  const statusCounts = STATUTS.map(s => cases.filter(c => c.statut === s).length);
  const ctxStatus = document.getElementById('chartStatus').getContext('2d');
  if (chartStatusInstance) chartStatusInstance.destroy();
  chartStatusInstance = new Chart(ctxStatus, {
    type: 'doughnut',
    data: { labels: STATUTS, datasets: [{ data: statusCounts, backgroundColor: ['#b3261e', '#a65f00', '#2e6b3f', '#3a5a9b', '#566673'] }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
}