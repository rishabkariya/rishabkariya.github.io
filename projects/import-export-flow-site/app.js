const icons = {
  factory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l5 3V9l5 3V5h8v16H3Z"/><path d="M7 17h2M12 17h2M17 17h2"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v10H3z"/><path d="M14 11h4l3 3v3h-7z"/><path d="M6.5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17.5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>`,
  warehouse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 12 4l9 6v11H3V10Z"/><path d="M7 21v-8h10v8M9 16h6"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8l1 3H7l1-3Z"/><path d="M6 6H5v15h14V6h-1"/><path d="M8 12h8M8 16h5"/></svg>`,
  crane: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16M6 21V7h10"/><path d="M6 7 11 3l5 4M16 7v5l3 2v3"/><path d="M12 7v14"/></svg>`,
  ship: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h16l-2 5H6l-2-5Z"/><path d="M7 14V7h10v7M9 7V4h6v3"/><path d="M6 21c1.2-.7 2.4-.7 3.6 0 1.2.7 2.4.7 3.6 0 1.2-.7 2.4-.7 3.6 0"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21M12 3c-2.2 2.5-3.3 5.5-3.3 9S9.8 18.5 12 21"/></svg>`,
  stamp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 13c.7-1.3.7-2.3.2-3.2A4 4 0 1 1 15 13"/><path d="M6 13h12v4H6zM4 21h16"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></svg>`,
};

const stages = [
  { id: "factory", x: 26, y: 92, label: "top", icon: "factory", title: "Seller Factory", short: "Factory", sub: "Cargo ready", parties: ["Exporter", "Factory", "Packing vendor"], documents: ["Invoice", "Packing list", "PO"], charges: ["Packing", "Loading", "Inspection"], watch: "Cargo readiness, cartons, gross weight, CBM, marks, and pickup timing." },
  { id: "pickup", x: 154, y: 92, label: "bottom", icon: "truck", title: "Pickup Truck", short: "Pickup", sub: "Origin inland", parties: ["Transporter", "Forwarder", "Exporter"], documents: ["Pickup note", "E-way bill", "LR"], charges: ["Trucking", "Detention", "Fuel"], watch: "Vehicle placement, route permits, pickup slot, and cargo handover proof." },
  { id: "cfs", x: 282, y: 92, label: "top", icon: "warehouse", title: "ICD / CFS", short: "ICD / CFS", sub: "Stuffing", parties: ["CFS/ICD", "CHA", "Forwarder", "Carrier"], documents: ["Shipping bill", "Stuffing report", "Container seal"], charges: ["CFS handling", "Stuffing", "Seal", "Lift-on/lift-off"], watch: "Container stuffing, seal number, first carrier handover, and cut-off pressure. This is often the FCA point." },
  { id: "exportClearance", x: 410, y: 92, label: "bottom", icon: "clipboard", title: "Export Clearance", short: "Export", sub: "Clearance", parties: ["CHA", "Customs", "Exporter"], documents: ["Shipping bill", "Certificate of origin", "License"], charges: ["CHA fee", "Exam fee", "Documentation"], watch: "HS code, export incentives, license requirement, customs query, and examination status." },
  { id: "originPort", x: 538, y: 92, label: "top", icon: "crane", title: "Origin Port", short: "Origin Port", sub: "Terminal", parties: ["Terminal", "Carrier", "NVOCC"], documents: ["VGM", "Gate-in slip", "SI"], charges: ["Origin THC", "Port dues", "B/L fee"], watch: "Gate cut-off, VGM cut-off, SI cut-off, terminal congestion, and roll-over risk." },
  { id: "vessel", x: 666, y: 92, label: "bottom", icon: "ship", title: "Vessel / Main Carriage", short: "Vessel", sub: "Main carriage", parties: ["Carrier", "NVOCC", "Insurer"], documents: ["MBL", "HBL", "Insurance cert"], charges: ["Ocean freight", "BAF", "CAF", "PSS"], watch: "ETA, transshipment, blank sailing, freight surcharges, and insurance coverage." },
  { id: "buyerPort", x: 806, y: 92, label: "top", icon: "crane", title: "Buyer Port", short: "Buyer Port", sub: "Arrival", parties: ["Destination terminal", "Carrier", "Consignee agent"], documents: ["Arrival notice", "Manifest", "Delivery order"], charges: ["Destination THC", "DO fee", "Demurrage"], watch: "Free days, DO release, original B/L surrender, port storage, and demurrage clock." },
  { id: "importClearance", x: 936, y: 92, label: "bottom", icon: "stamp", title: "Import Clearance", short: "Import", sub: "Clearance", parties: ["Importer", "Customs broker", "Customs"], documents: ["Bill of entry", "Invoice", "COO", "B/L"], charges: ["Duty", "GST/VAT", "Brokerage", "Inspection"], watch: "Importer of record, duty payment, valuation, HS classification, and regulatory approvals." },
  { id: "delivery", x: 1066, y: 92, label: "top", icon: "home", title: "Buyer Warehouse", short: "Warehouse", sub: "Delivery", parties: ["Buyer", "Warehouse", "Transporter"], documents: ["POD", "GRN", "Damage note"], charges: ["Final trucking", "Unloading", "Empty return"], watch: "Delivery appointment, unloading scope, empty return deadline, and POD closure." },
];

const incoterms = {
  EXW: { title: "EXW - Ex Works", costUntil: "factory", riskAt: "factory", summary: "Buyer takes almost everything from seller premises.", note: "Risky for export compliance if buyer cannot handle origin export clearance." },
  FCA: { title: "FCA - Free Carrier", costUntil: "cfs", riskAt: "cfs", summary: "Seller covers origin delivery to carrier/CFS/ICD; buyer controls main freight.", note: "Best practical fit for many container shipments through ICD/CFS." },
  FOB: { title: "FOB - Free On Board", costUntil: "originPort", riskAt: "vessel", summary: "Seller covers until cargo is loaded on vessel at origin port.", note: "For container cargo handed over earlier at CFS/ICD, FCA often maps better." },
  CIF: { title: "CIF - Cost Insurance Freight", costUntil: "buyerPort", riskAt: "vessel", summary: "Seller pays freight and insurance to destination port, but risk transfers at origin vessel loading.", note: "Sea-only term. For multimodal/container moves, compare with CIP." },
  CPT: { title: "CPT - Carriage Paid To", costUntil: "delivery", riskAt: "cfs", summary: "Seller pays carriage to named place; buyer takes risk from first carrier handover.", note: "Cost point and risk point are different." },
  CIP: { title: "CIP - Carriage Insurance Paid To", costUntil: "delivery", riskAt: "cfs", summary: "Like CPT, plus seller-arranged insurance.", note: "Good for multimodal/container cargo where people casually say CIF." },
  DAP: { title: "DAP - Delivered At Place", costUntil: "delivery", riskAt: "delivery", summary: "Seller handles carriage to buyer place, buyer handles import clearance and duties.", note: "Seller delivers ready for unloading, not unloaded." },
  DPU: { title: "DPU - Delivered Place Unloaded", costUntil: "delivery", riskAt: "delivery", summary: "Seller delivers and unloads at named destination.", note: "Use only when seller can actually control unloading." },
  DDP: { title: "DDP - Delivered Duty Paid", costUntil: "delivery", riskAt: "delivery", summary: "Maximum seller responsibility including import clearance and duties.", note: "Seller needs local tax/customs capability in destination country." },
};

let selectedStage = "cfs";
let selectedIncoterm = "FCA";

const incotermSelect = document.querySelector("#incotermSelect");
const journeyNodes = document.querySelector("#journeyNodes");
const sellerPath = document.querySelector("#sellerPath");
const buyerPath = document.querySelector("#buyerPath");

function stageIndex(id) {
  return stages.findIndex((stage) => stage.id === id);
}

function ownerFor(stageId, type) {
  const term = incoterms[selectedIncoterm];
  const breakId = type === "cost" ? term.costUntil : term.riskAt;
  return stageIndex(stageId) <= stageIndex(breakId) ? "seller" : "buyer";
}

function renderIncoterms() {
  incotermSelect.innerHTML = Object.keys(incoterms)
    .map((code) => `<option value="${code}">${code}</option>`)
    .join("");
  incotermSelect.value = selectedIncoterm;
}

function renderNodes() {
  const riskId = incoterms[selectedIncoterm].riskAt;
  journeyNodes.innerHTML = stages.map((stage) => `
    <button class="node-button label-${stage.label} ${stage.id === selectedStage ? "active" : ""} ${stage.id === riskId ? "risk-point" : ""}"
      style="left:${stage.x}px; top:${stage.y}px"
      data-stage="${stage.id}"
      type="button">
      <span class="icon-shell">${icons[stage.icon]}</span>
      <strong>${stage.short}</strong>
      <small>${stage.sub}</small>
    </button>
  `).join("");

  document.querySelectorAll(".node-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedStage = button.dataset.stage;
      render();
    });
  });
}

function fillPills(id, items) {
  document.querySelector(id).innerHTML = items.map((item) => `<span>${item}</span>`).join("");
}

function renderDetails() {
  const stage = stages.find((item) => item.id === selectedStage);
  const term = incoterms[selectedIncoterm];
  const costOwner = ownerFor(stage.id, "cost");
  const riskOwner = ownerFor(stage.id, "risk");

  document.querySelector("#stageIcon").innerHTML = icons[stage.icon];
  document.querySelector("#stageTitle").textContent = stage.title;
  document.querySelector("#stageSubtitle").textContent = stage.sub;
  document.querySelector("#stageWatch").textContent = stage.watch;
  document.querySelector("#costOwner").textContent = costOwner;
  document.querySelector("#costOwner").className = costOwner;
  document.querySelector("#costOwner").parentElement.className = `owner-box ${costOwner}`;
  document.querySelector("#riskOwner").textContent = riskOwner;
  document.querySelector("#riskOwner").className = riskOwner;
  document.querySelector("#riskOwner").parentElement.className = `owner-box ${riskOwner}`;

  fillPills("#parties", stage.parties);
  fillPills("#documents", stage.documents);
  fillPills("#charges", stage.charges);

  document.querySelector("#incotermTitle").textContent = term.title;
  document.querySelector("#incotermSummary").textContent = term.summary;
  document.querySelector("#costTill").textContent = stages[stageIndex(term.costUntil)].title;
  document.querySelector("#riskAt").textContent = stages[stageIndex(term.riskAt)].title;
  document.querySelector("#incotermNote").textContent = term.note;
}

function renderPathOwnership() {
  const riskPercent = ((stageIndex(incoterms[selectedIncoterm].costUntil) + 1) / stages.length) * 1200;
  document.documentElement.style.setProperty("--seller-length", `${riskPercent}`);
  document.documentElement.style.setProperty("--buyer-length", `${1200 - riskPercent}`);
  sellerPath.style.strokeDasharray = `${riskPercent} 1200`;
  buyerPath.style.strokeDasharray = `${1200 - riskPercent} 1200`;
  buyerPath.style.strokeDashoffset = `${-riskPercent}`;
}

function render() {
  renderPathOwnership();
  renderNodes();
  renderDetails();
}

incotermSelect.addEventListener("change", (event) => {
  selectedIncoterm = event.target.value;
  render();
});

document.querySelector("#shipmentSelect").addEventListener("change", (event) => {
  document.body.dataset.shipment = event.target.value;
});

renderIncoterms();
render();
