import { TYPES, STATUTS, GRAV } from './config.js';
// [Connexion désactivée pour les tests]
// import { initAuth } from './auth.js';
import { fetchCases, insertCase, updateCaseStatus, deleteCase } from './db.js';
import { initMap, updateMapMarkers } from './map.js';
import { updateCharts } from './charts.js';
import { exportExcel, exportPDF } from './export.js';

let casesData = [];

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2500);
}

// Remplissage des listes de choix : exécuté UNE SEULE FOIS au démarrage,
// indépendamment de la base de données, de la carte et des graphiques.
// (Avant, il était refait à chaque rafraîchissement, ce qui effaçait les filtres choisis.)
function fillSelects() {
  document.getElementById('selType').innerHTML = TYPES.map(t => `<option>${t}</option>`).join('');
  document.getElementById('selStatut').innerHTML = STATUTS.map(s => `<option>${s}</option>`).join('');
  document.getElementById('fType').innerHTML = `<option value="">Tous les types</option>` + TYPES.map(t => `<option>${t}</option>`).join('');
  document.getElementById('fStatut').innerHTML = `<option value="">Tous les statuts</option>` + STATUTS.map(s => `<option>${s}</option>`).join('');
}

function renderUI() {

  // Statistiques haut de page
  const openCount = casesData.filter(c => c.statut !== "Clos").length;
  const critCount = casesData.filter(c => c.grav == 4 && c.statut !== "Clos").length;
  const vicCount = casesData.reduce((acc, c) => acc + (+c.n || 0), 0);

  document.getElementById('stats').innerHTML = `
    <div class="stat"><b>${casesData.length}</b><span>Total cas</span></div>
    <div class="stat"><b>${openCount}</b><span>Ouverts</span></div>
    <div class="stat crit"><b>${critCount}</b><span>Critiques</span></div>
    <div class="stat"><b>${vicCount}</b><span>Victimes</span></div>
  `;

  // Un échec des graphiques ou de la carte ne doit pas bloquer le reste de l'interface
  try { updateCharts(casesData); } catch (e) { console.warn("Graphiques indisponibles :", e); }
  try { updateMapMarkers(casesData); } catch (e) { console.warn("Carte indisponible :", e); }
  renderList();
}

function renderList() {
  const q = document.getElementById('q').value.toLowerCase();
  const fType = document.getElementById('fType').value;
  const fStatut = document.getElementById('fStatut').value;
  const fGrav = document.getElementById('fGrav').value;

  const filtered = casesData.filter(c =>
    (!fType || c.type === fType) &&
    (!fStatut || c.statut === fStatut) &&
    (!fGrav || String(c.grav) === fGrav) &&
    (!q || (c.code + " " + c.lieu + " " + c.desc).toLowerCase().includes(q))
  );

  const listEl = document.getElementById('list');
  if (!filtered.length) {
    listEl.innerHTML = '<div class="sub" style="text-align:center;padding:20px;">Aucun dossier trouvé.</div>';
    return;
  }

  listEl.innerHTML = filtered.map(c => `
    <article class="case g${c.grav}">
      <h3>${c.code}</h3>
      <div class="sub">${c.date} – ${c.lieu} – <b>${c.n} victime(s)</b></div>
      <div style="margin-bottom:8px"><span class="tag">${c.type}</span><span class="tag">Gravité : ${GRAV[c.grav]}</span></div>
      <p>${c.desc}</p>
      ${c.attachment ? `<div style="margin-bottom:8px"><a href="${c.attachment}" target="_blank" class="btn sm ghost">Voir la pièce jointe</a></div>` : ''}
      <div class="row">
        <label style="flex-direction:row;align-items:center">Statut: 
          <select data-id="${c.id}" class="sel-status">
            ${STATUTS.map(s => `<option ${s === c.statut ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </label>
        <button class="btn ghost sm btn-del" data-id="${c.id}">Supprimer</button>
      </div>
    </article>
  `).join('');
}

// Événements
document.getElementById('caseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const file = document.getElementById('inputAttachment').files[0];

  const caseObj = {
    code: formData.get('code'),
    date: formData.get('date'),
    lieu: formData.get('lieu'),
    lat: formData.get('lat') ? parseFloat(formData.get('lat')) : null,
    lng: formData.get('lng') ? parseFloat(formData.get('lng')) : null,
    type: formData.get('type'),
    grav: parseInt(formData.get('grav')),
    n: parseInt(formData.get('n')) || 1,
    src: formData.get('src'),
    statut: formData.get('statut'),
    auteur: formData.get('auteur'),
    noms: formData.get('noms'),
    desc: formData.get('desc')
  };

  try {
    await insertCase(caseObj, file);
    form.reset();
    toast("Cas enregistré avec succès");
    casesData = await fetchCases();
    renderUI();
  } catch (err) {
    toast("Erreur lors de l'enregistrement");
  }
});

document.getElementById('list').addEventListener('change', async (e) => {
  if (e.target.classList.contains('sel-status')) {
    const id = e.target.getAttribute('data-id');
    const statut = e.target.value;
    try {
      await updateCaseStatus(id, statut);
      toast("Statut mis à jour");
      casesData = await fetchCases();
      renderUI();
    } catch { toast("Erreur de mise à jour"); }
  }
});

document.getElementById('list').addEventListener('click', async (e) => {
  if (e.target.classList.contains('btn-del')) {
    if (!confirm("Supprimer ce dossier définitivement ?")) return;
    const id = e.target.getAttribute('data-id');
    try {
      await deleteCase(id);
      toast("Dossier supprimé");
      casesData = await fetchCases();
      renderUI();
    } catch { toast("Erreur de suppression"); }
  }
});

['q', 'fType', 'fStatut', 'fGrav'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderList);
});

document.getElementById('btnXls').addEventListener('click', () => {
  const withNames = document.getElementById('incNames').checked;
  exportExcel(casesData, withNames);
});

document.getElementById('btnPdf').addEventListener('click', () => {
  const withNames = document.getElementById('incNames').checked;
  exportPDF(casesData, withNames);
});

// Initialisation (MODE TEST : démarrage direct, sans connexion)
(async () => {
  fillSelects();
  try { initMap(); } catch (e) { console.warn("Carte indisponible :", e); }
  try {
    casesData = await fetchCases();
    renderUI();
  } catch {
    toast("Erreur de chargement des données");
    renderUI(); // affiche quand même les formulaires et les listes de choix
  }
})();

// ---------------------------------------------------------------
// Version d'origine avec connexion (à réactiver en production) :
// ---------------------------------------------------------------
// // Initialisation générale
// initAuth(async (user) => {
//   if (user) {
//     document.getElementById('authOverlay').style.display = 'none';
//     document.getElementById('appContent').style.display = 'block';
//     initMap();
//     try {
//       casesData = await fetchCases();
//       renderUI();
//     } catch { toast("Erreur de chargement des données"); }
//   } else {
//     document.getElementById('authOverlay').style.display = 'flex';
//     document.getElementById('appContent').style.display = 'none';
//   }
// });
