import type { SquareCategorySale, SquareParsedReport } from '../../types';

const MONEY =
  /(?:£|\$|€)?\s*\(?\s*([\d,]+(?:\.\d{1,2})?)\s*\)?/;

function parseMoney(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[£$€,\s]/g, '');
  const negative = /^\(.*\)$/.test(raw.trim()) || cleaned.startsWith('-');
  const n = Number(cleaned.replace(/[()-]/g, ''));
  if (Number.isNaN(n)) return null;
  return negative ? -Math.abs(n) : n;
}

function findMoneyAfterLabel(text: string, labels: string[]): number | null {
  for (const label of labels) {
    const re = new RegExp(
      `${label}\\s*[:\\-]?\\s*(?:\\([^)]*%\\))?\\s*${MONEY.source}`,
      'i',
    );
    const m = text.match(re);
    if (m) {
      const value = parseMoney(m[1]);
      if (value !== null) return value;
    }

    // OCR often puts the amount on the next line / nearby
    const loose = new RegExp(
      `${label}[^\\d£$€]{0,40}${MONEY.source}`,
      'i',
    );
    const m2 = text.match(loose);
    if (m2) {
      const value = parseMoney(m2[1]);
      if (value !== null) return value;
    }
  }
  return null;
}

function findIntAfterLabel(text: string, labels: string[]): number | null {
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:\\-]?\\s*(\\d+)`, 'i');
    const m = text.match(re);
    if (m) return Number(m[1]);
  }
  return null;
}

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function formatGbDate(d: Date): string {
  return d.toLocaleDateString('en-GB');
}

function parseReportDate(text: string): string | null {
  // 30 July 2026
  const long = text.match(
    /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i,
  );
  if (long) {
    const month = MONTHS[long[2].toLowerCase().slice(0, 3)];
    if (month !== undefined) {
      return formatGbDate(new Date(Number(long[3]), month, Number(long[1])));
    }
  }

  // Thursday 30 Jul / Thursday 30 Jul 2026
  const weekday = text.match(
    /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?,?\s*(\d{4})?/i,
  );
  if (weekday) {
    const month = MONTHS[weekday[2].toLowerCase().slice(0, 3)];
    const year = weekday[3] ? Number(weekday[3]) : new Date().getFullYear();
    if (month !== undefined) {
      return formatGbDate(new Date(year, month, Number(weekday[1])));
    }
  }

  // 30/07/2026
  const numeric = text.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/);
  if (numeric) {
    let year = Number(numeric[3]);
    if (year < 100) year += 2000;
    return formatGbDate(new Date(year, Number(numeric[2]) - 1, Number(numeric[1])));
  }

  return null;
}

function parseBusinessName(text: string): string | undefined {
  const m =
    text.match(/,\s*([A-Za-z][A-Za-z0-9 &'-]{1,60})\s*(?:\n|$)/) ||
    text.match(/daily sales summary report.*?for\s+\d{1,2}\s+\w+\s+\d{4}/i);
  // Prefer header like "Thursday 30 Jul, vintage hawick"
  const header = text.match(
    /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s+\d{1,2}\s+\w+\.?,?\s+([A-Za-z][A-Za-z0-9 &'-]{1,60})/i,
  );
  if (header?.[1] && !/net|sales|average|order/i.test(header[1])) {
    return header[1].trim();
  }
  if (m?.[1] && !/net|sales|average|order|BST|GMT/i.test(m[1])) {
    return m[1].trim();
  }
  return undefined;
}

function parsePeriod(text: string): string | undefined {
  const m = text.match(
    /((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s+\d{1,2}\s+\w+\.?,?\s+\d{1,2}:\d{2}\s*[–\-—]\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s+\d{1,2}\s+\w+\.?,?\s+\d{1,2}:\d{2}\s*(?:BST|GMT|UTC)?)/i,
  );
  return m?.[1]?.replace(/\s+/g, ' ').trim();
}

function parseCategories(text: string): SquareCategorySale[] {
  const categories: SquareCategorySale[] = [];
  const section =
    text.match(
      /Sales\s*breakdown([\s\S]*?)(?:Order\s*source|Point\s*of\s*Sale|Square,|$)/i,
    )?.[1] ?? text;

  // Category  items  £amount  (optional WoW)
  const rowRe =
    /^([A-Za-z][A-Za-z0-9 &/'&.-]{1,40})\s+(\d+(?:\.\d+)?)\s+(?:£|\$|€)?\s*([\d,]+(?:\.\d{1,2})?)/gm;

  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(section)) !== null) {
    const category = match[1].trim();
    if (/^(category|items|net|sales|description|amount|wow)$/i.test(category)) continue;
    if (/^(total|product|item|gross|return|discount|tax|tip|gift|refund|fee|order)/i.test(category)) {
      continue;
    }
    categories.push({
      category,
      itemsSold: Number(match[2]),
      netSales: parseMoney(match[3]) ?? 0,
    });
  }

  return categories;
}

function parseOrderSource(text: string): string | undefined {
  const m = text.match(/Order\s*source[\s\S]{0,80}?(Point\s*of\s*Sale|Online|Invoices?)/i);
  return m?.[1]?.replace(/\s+/g, ' ');
}

/**
 * Parse Square daily sales summary text (from a .txt export or OCR of the email screenshot).
 */
export function parseSquareReport(rawText: string): SquareParsedReport | null {
  const text = rawText
    .replace(/\u00a0/g, ' ')
    .replace(/[|]/g, ' ')
    .replace(/\r\n/g, '\n');

  const netSales = findMoneyAfterLabel(text, [
    'Net sales',
    'Net Sales',
  ]);
  const grossSales = findMoneyAfterLabel(text, [
    'Gross sales',
    'Gross Sales',
    'Product sales',
  ]);
  const taxes = findMoneyAfterLabel(text, ['Taxes', 'Tax', 'VAT']) ?? 0;
  const tips = findMoneyAfterLabel(text, ['Tips']) ?? 0;
  const feesRaw = findMoneyAfterLabel(text, ['Fees']);
  const fees = feesRaw !== null ? Math.abs(feesRaw) : 0;
  const totalSales =
    findMoneyAfterLabel(text, ['Total sales', 'Total Sales']) ??
    netSales ??
    grossSales;
  const averageOrder =
    findMoneyAfterLabel(text, ['Average order', 'Avg order', 'Avg\\. order']) ?? 0;
  const totalOrders =
    findIntAfterLabel(text, ['Total orders', 'Total Orders', 'Orders']) ?? 0;

  const date = parseReportDate(text) ?? new Date().toLocaleDateString('en-GB');

  if (netSales === null && grossSales === null && totalSales === null) {
    return null;
  }

  const resolvedNet = netSales ?? grossSales ?? totalSales ?? 0;
  const resolvedGross = grossSales ?? totalSales ?? resolvedNet;

  return {
    businessName: parseBusinessName(text),
    date,
    period: parsePeriod(text),
    netSales: resolvedNet,
    grossSales: resolvedGross,
    taxes,
    tips,
    fees,
    totalSales: totalSales ?? resolvedGross,
    totalOrders,
    averageOrder,
    categories: parseCategories(text),
    orderSource: parseOrderSource(text),
  };
}

export function squareReportToDailySale(
  report: SquareParsedReport,
  id = crypto.randomUUID(),
): import('../../types').DailySale {
  return {
    id,
    date: report.date,
    transactions: report.totalOrders,
    grossSales: report.grossSales,
    vat: report.taxes,
    netSales: report.netSales,
    source: 'Square',
    status: 'Imported',
    tips: report.tips,
    fees: report.fees,
    averageOrder: report.averageOrder,
    categories: report.categories,
  };
}
