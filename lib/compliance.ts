export type FrameworkId = "GDPR" | "PCI-DSS" | "SOC2" | "NIS2" | "ISO-27001";
export type ControlStatus = "passing" | "warning" | "failing" | "not-applicable";

export interface Control {
  id: string;
  framework: FrameworkId;
  ref: string;          // e.g. "Art. 33", "Req. 8.3"
  title: string;
  status: ControlStatus;
  owner: string;
  lastReviewed: number;
  evidenceCount: number;
  note?: string;
}

export interface Framework {
  id: FrameworkId;
  name: string;
  summary: string;
  scope: string;
  totalControls: number;     // total in the framework (synthetic — partial coverage shown)
  reviewedControls: number;  // covered by Sentinel
}

const now = Date.now();

export const FRAMEWORKS: Framework[] = [
  { id: "GDPR",      name: "GDPR",       summary: "EU General Data Protection Regulation",       scope: "EU/EEA personal data",      totalControls: 99,  reviewedControls: 41 },
  { id: "PCI-DSS",   name: "PCI-DSS 4.0",summary: "Payment Card Industry Data Security Standard",scope: "Cardholder data environment", totalControls: 250, reviewedControls: 88 },
  { id: "SOC2",      name: "SOC 2 (Type II)", summary: "Trust Services Criteria — Security/Avail/Conf", scope: "Customer SaaS tenants", totalControls: 64, reviewedControls: 47 },
  { id: "NIS2",      name: "NIS2",       summary: "EU Network & Information Security Directive 2",scope: "EU essential entities", totalControls: 36,  reviewedControls: 20 },
  { id: "ISO-27001", name: "ISO/IEC 27001:2022", summary: "Information Security Management System", scope: "Org-wide ISMS", totalControls: 93, reviewedControls: 31 },
];

export const CONTROLS: Control[] = [
  // GDPR
  { id: "C-001", framework: "GDPR",    ref: "Art. 32",  title: "Pseudonymisation & encryption of personal data",       status: "passing", owner: "data-eng",  lastReviewed: now - 1000*60*60*12, evidenceCount: 4 },
  { id: "C-002", framework: "GDPR",    ref: "Art. 33",  title: "Breach notification to supervisory authority (72h)",   status: "warning", owner: "legal",     lastReviewed: now - 1000*60*55,    evidenceCount: 2, note: "Active draft for INC-2041 in flight." },
  { id: "C-003", framework: "GDPR",    ref: "Art. 34",  title: "Communication of breach to data subjects",             status: "passing", owner: "comms",     lastReviewed: now - 1000*60*60*24*4,evidenceCount: 1 },
  { id: "C-004", framework: "GDPR",    ref: "Art. 25",  title: "Data protection by design and by default",             status: "warning", owner: "platform",  lastReviewed: now - 1000*60*60*8,  evidenceCount: 3, note: "Two services still log raw PAN in dev." },
  { id: "C-005", framework: "GDPR",    ref: "Art. 30",  title: "Records of processing activities (ROPA)",              status: "passing", owner: "data-eng",  lastReviewed: now - 1000*60*60*24*9,evidenceCount: 5 },
  { id: "C-006", framework: "GDPR",    ref: "Art. 35",  title: "Data protection impact assessment (DPIA)",             status: "passing", owner: "legal",     lastReviewed: now - 1000*60*60*24*16,evidenceCount: 2 },

  // PCI-DSS
  { id: "C-101", framework: "PCI-DSS", ref: "Req. 1.2", title: "Network segmentation between CHD and other zones",     status: "failing", owner: "infra",     lastReviewed: now - 1000*60*45,    evidenceCount: 1, note: "Jumpbox VLAN can reach finance DB on SMB — see INC-2041." },
  { id: "C-102", framework: "PCI-DSS", ref: "Req. 3.5", title: "PAN protected with strong cryptography",               status: "passing", owner: "data-eng",  lastReviewed: now - 1000*60*60*22, evidenceCount: 6 },
  { id: "C-103", framework: "PCI-DSS", ref: "Req. 8.3", title: "MFA for all admin access to CDE",                      status: "warning", owner: "secops",    lastReviewed: now - 1000*60*60*5,  evidenceCount: 2, note: "Legacy-auth carve-out eliminated; verifying coverage." },
  { id: "C-104", framework: "PCI-DSS", ref: "Req. 10.7",title: "Log retention ≥ 1 year, ≥3 months online",             status: "passing", owner: "secops",    lastReviewed: now - 1000*60*60*24*3,evidenceCount: 4 },
  { id: "C-105", framework: "PCI-DSS", ref: "Req. 11.4",title: "IDS/IPS at perimeter and segmenting boundaries",       status: "passing", owner: "infra",     lastReviewed: now - 1000*60*60*24*1,evidenceCount: 3 },
  { id: "C-106", framework: "PCI-DSS", ref: "Req. 12.10",title: "Incident response plan invoked + documented",         status: "warning", owner: "secops",    lastReviewed: now - 1000*60*50,    evidenceCount: 2, note: "INC-2041 case file open." },

  // SOC2
  { id: "C-201", framework: "SOC2",    ref: "CC6.1",    title: "Logical access security (provisioning)",               status: "passing", owner: "secops",    lastReviewed: now - 1000*60*60*24*1, evidenceCount: 4 },
  { id: "C-202", framework: "SOC2",    ref: "CC6.6",    title: "Access removal upon termination",                      status: "passing", owner: "secops",    lastReviewed: now - 1000*60*60*24*3, evidenceCount: 2 },
  { id: "C-203", framework: "SOC2",    ref: "CC7.2",    title: "System monitoring detects anomalies",                  status: "passing", owner: "soc",       lastReviewed: now - 1000*60*60*1,  evidenceCount: 7 },
  { id: "C-204", framework: "SOC2",    ref: "CC7.3",    title: "Incident response procedures executed",                status: "warning", owner: "soc",       lastReviewed: now - 1000*60*40,    evidenceCount: 2, note: "INC-2041 contained but not closed." },
  { id: "C-205", framework: "SOC2",    ref: "CC8.1",    title: "Change management — segregation of duties",            status: "passing", owner: "platform",  lastReviewed: now - 1000*60*60*24*7, evidenceCount: 3 },

  // NIS2
  { id: "C-301", framework: "NIS2",    ref: "Art. 21.2(c)",title: "Incident handling capability",                       status: "passing", owner: "soc",       lastReviewed: now - 1000*60*60*4, evidenceCount: 4 },
  { id: "C-302", framework: "NIS2",    ref: "Art. 23",  title: "Significant-incident reporting (24h pre-notification)",status: "warning", owner: "legal",     lastReviewed: now - 1000*60*48,    evidenceCount: 1, note: "INC-2041 trigger pending exfil confirmation." },
  { id: "C-303", framework: "NIS2",    ref: "Art. 21.2(d)",title: "Supply chain security (third parties)",              status: "warning", owner: "vendor-risk",lastReviewed: now - 1000*60*60*24*5, evidenceCount: 2, note: "Vendor TPRM cycle in flight." },

  // ISO-27001
  { id: "C-401", framework: "ISO-27001", ref: "A.5.7", title: "Threat intelligence",                                    status: "passing", owner: "soc",       lastReviewed: now - 1000*60*60*6, evidenceCount: 3 },
  { id: "C-402", framework: "ISO-27001", ref: "A.8.2", title: "Privileged access rights",                               status: "warning", owner: "secops",    lastReviewed: now - 1000*60*60*3, evidenceCount: 2, note: "Service-account inventory in progress." },
  { id: "C-403", framework: "ISO-27001", ref: "A.8.16", title: "Monitoring activities",                                 status: "passing", owner: "soc",       lastReviewed: now - 1000*60*60*7, evidenceCount: 4 },
  { id: "C-404", framework: "ISO-27001", ref: "A.5.30", title: "ICT readiness for business continuity",                 status: "passing", owner: "infra",     lastReviewed: now - 1000*60*60*24*11, evidenceCount: 2 },
];

export const FRAMEWORK_SCORE: Record<FrameworkId, number> = (() => {
  const out = {} as Record<FrameworkId, number>;
  for (const f of FRAMEWORKS) {
    const controls = CONTROLS.filter((c) => c.framework === f.id);
    if (controls.length === 0) { out[f.id] = 0; continue; }
    let s = 0, total = 0;
    for (const c of controls) {
      if (c.status === "not-applicable") continue;
      total += 1;
      if (c.status === "passing") s += 1;
      else if (c.status === "warning") s += 0.5;
    }
    out[f.id] = total === 0 ? 0 : Math.round((s / total) * 100);
  }
  return out;
})();
