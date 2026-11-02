// Brand kit: colours, fonts and company details kept in one place.

export interface BrandKit {
  colours: { name: string; hex: string }[];
  fonts: string[];
  legalName: string;
  companyNumber: string;
  vatNumber: string;
  registeredAddress: string;
  notes: string;
}

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** UK company numbers are 8 characters: digits, or a 2-letter prefix (SC, NI, OC…) and 6 digits. */
export function normaliseCompanyNumber(v: unknown) {
  const t = s(v, 12).toUpperCase().replace(/\s+/g, "");
  if (/^\d{1,8}$/.test(t)) return t.padStart(8, "0");
  return /^[A-Z]{2}\d{6}$/.test(t) ? t : "";
}

export function companiesHouseLinks(number: string) {
  if (!number) return null;
  const base = `https://find-and-update.company-information.service.gov.uk/company/${number}`;
  return { overview: base, filings: `${base}/filing-history`, officers: `${base}/officers` };
}

export function normaliseKit(raw: unknown): BrandKit {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    colours: (Array.isArray(r.colours) ? r.colours : [])
      .slice(0, 12)
      .map((c) => ({ name: s((c as Record<string, unknown>)?.name, 40), hex: s((c as Record<string, unknown>)?.hex, 7).toLowerCase() }))
      .filter((c) => /^#[0-9a-f]{6}$/.test(c.hex)),
    fonts: (Array.isArray(r.fonts) ? r.fonts : []).map((f) => s(f, 60)).filter(Boolean).slice(0, 4),
    legalName: s(r.legalName, 160),
    companyNumber: normaliseCompanyNumber(r.companyNumber),
    vatNumber: s(r.vatNumber, 20).toUpperCase().replace(/\s+/g, ""),
    registeredAddress: s(r.registeredAddress, 300),
    notes: s(r.notes, 2000),
  };
}

export function kitFromForm(form: FormData): BrandKit {
  const colours: { name: string; hex: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const hex = String(form.get(`colours.${i}.hex`) ?? "");
    if (hex) colours.push({ name: String(form.get(`colours.${i}.name`) ?? ""), hex });
  }
  return normaliseKit({
    colours,
    fonts: String(form.get("fonts") ?? "").split(/\n|,/),
    legalName: form.get("legalName"),
    companyNumber: form.get("companyNumber"),
    vatNumber: form.get("vatNumber"),
    registeredAddress: form.get("registeredAddress"),
    notes: form.get("notes"),
  });
}
