import { GRAV } from './config.js';

export function exportExcel(rows, withNames) {
  const head = ["Code", "Date", "Lieu", "Type", "Gravité", "Victimes", "Source", "Statut", "Résumé", "Auteur"];
  if (withNames) head.push("Noms");
  const body = rows.map(c => {
    let r = [c.code, c.date, c.lieu, c.type, GRAV[c.grav], c.n, c.src, c.statut, c.desc, c.auteur || "anonyme"];
    if (withNames) r.push(c.noms);
    return r;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([head, ...body]);
  XLSX.utils.book_append_sheet(wb, ws, "Dossiers");
  XLSX.writeFile(wb, `dossiers-ddh-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportPDF(rows, withNames) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Observatoire des droits humains - Registre", 14, 14);

  const head = [["Code", "Date", "Lieu", "Type", "Gravité", "Victimes", "Statut", "Résumé"]];
  const body = rows.map(c => [c.code, c.date, c.lieu, c.type, GRAV[c.grav], c.n, c.statut, c.desc]);

  doc.autoTable({ head, body, startY: 20, styles: { fontSize: 8 } });
  doc.save(`dossiers-ddh-${new Date().toISOString().slice(0, 10)}.pdf`);
}