interface PriceDisplay {
  priceId?: string;
  currency: string;
  displayPrice: string;
  symbol: string;
}

interface RegionalPricing {
  [country: string]: PriceDisplay;
}

const DISPLAY_PRICES: Record<string, RegionalPricing> = {
  // STARTER
  starter_mensal: {
    ZA: { currency: "ZAR", displayPrice: "R76.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "21.80 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$10.30", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$7.70", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩8,720", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥925", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "22,200 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "8,488 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "5,512 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$109.00", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€8.50", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€8.50", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€8.50", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€8.50", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€8.50", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$14.90", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£7.90", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$12.90", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 39,90", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$9.90", symbol: "$" },
  },

  starter_anual: {
    ZA: { currency: "ZAR", displayPrice: "R461.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "214.80 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$60.10", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$46.60", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩52,100", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥5,593", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "134,600 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "51,200 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "32,700 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$659.00", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€50.90", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€50.90", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€50.90", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€50.90", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€50.90", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$88.80", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£47.00", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$77.00", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 239,99", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$59.00", symbol: "$" },
  },

  // CREATOR
  creator_mensal: {
    ZA: { currency: "ZAR", displayPrice: "R153.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "77.30 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$20.90", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$15.40", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩22,400", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥1,834", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "44,800 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "17,000 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "17,500 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$219.00", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€17.15", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€17.15", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€17.15", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€17.15", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€17.15", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$29.90", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£15.90", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$25.90", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 79,99", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$19.90", symbol: "$" },
  },

  creator_anual: {
    ZA: { currency: "ZAR", displayPrice: "R916.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "465.40 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$125.20", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$92.60", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩134,900", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥11,100", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "292,700 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "102,000 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "104,900 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$1,309.00", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€102.70", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€102.70", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€102.70", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€102.70", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€102.70", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$179.00", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£94.90", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$155.00", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 474,99", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$119.00", symbol: "$" },
  },

  // PRO
  pro_mensal: {
    ZA: { currency: "ZAR", displayPrice: "R385", symbol: "R" },
    AE: { currency: "AED", displayPrice: "201.90 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$57.80", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$37.50", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩43,900", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥4,660", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "112,300 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "42,800 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "46,400 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$550", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€43.15", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€43.15", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€43.15", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€43.15", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€43.15", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$75.25", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£39.90", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$65.15", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 150,00", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$50", symbol: "$" },
  },

  pro_anual: {
    ZA: { currency: "ZAR", displayPrice: "R2,310", symbol: "R" },
    AE: { currency: "AED", displayPrice: "1,102 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$346", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$225", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩262,000", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥27,900", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "449,000 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "257,000 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "278,400 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$3,301", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€258.75", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€258.75", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€258.75", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€258.75", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€258.75", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$451.50", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£240.00", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$390.90", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 900,00", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$300.00", symbol: "$" },
  },
};

export function getPriceForUserRegion(
  planType: string,
  isAnnual: boolean,
  userRegion: string | null | undefined,
): PriceDisplay {
  const planKey = `${planType}_${isAnnual ? "anual" : "mensal"}`;
  const priceConfig = DISPLAY_PRICES[planKey];

  if (!priceConfig) {
    console.error(`No price configuration found for plan: ${planKey}`);
    return {
      currency: "USD",
      displayPrice: "$0.00",
      symbol: "$",
    };
  }

  const region = userRegion?.toUpperCase() || "US";
  const regionPrice = priceConfig[region] || priceConfig["US"];

  if (!regionPrice) {
    console.warn(`No price found for region ${region}, falling back to US`);
    return priceConfig["US"];
  }

  return regionPrice;
}

export function getAvailableRegions(): string[] {
  const firstPlan = Object.values(DISPLAY_PRICES)[0];
  return Object.keys(firstPlan);
}

export function getRegionName(code: string): string {
  const regionNames: Record<string, string> = {
    US: "United States",
    BR: "Brazil",
    CA: "Canada",
    GB: "United Kingdom",
    AU: "Australia",
    ES: "Spain",
    FR: "France",
    DE: "Germany",
    IT: "Italy",
    EU: "European Union",
    JP: "Japan",
    MX: "Mexico",
    CL: "Chile",
    AR: "Argentina",
    CO: "Colombia",
    KR: "South Korea",
    SG: "Singapore",
    NZ: "New Zealand",
    AE: "United Arab Emirates",
    ZA: "South Africa",
  };
  return regionNames[code] || code;
}

export function formatPrice(amount: number, currency: string): string {
  const formatters: Record<string, Intl.NumberFormat> = {
    BRL: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    CAD: new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }),
    GBP: new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }),
    AUD: new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }),
    EUR: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }),
    JPY: new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }),
    MXN: new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }),
    CLP: new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }),
    ARS: new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }),
    COP: new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }),
    KRW: new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }),
    SGD: new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }),
    NZD: new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }),
    AED: new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED" }),
    ZAR: new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }),
  };

  const formatter = formatters[currency] || formatters["USD"];
  return formatter.format(amount);
}
