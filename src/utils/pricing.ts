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
  // ESSENTIAL
  essential_mensal: {
    ZA: { currency: "ZAR", displayPrice: "R154.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "44.20 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$20.90", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$15.60", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩17,700", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥1,875", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "45,000 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "17,200 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "11,200 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$221.00", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€17.25", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€17.25", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€17.25", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€17.25", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€17.25", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$30.20", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£16.00", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$26.20", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 80,90", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$20.10", symbol: "$" },
  },

  essential_anual: {
    ZA: { currency: "ZAR", displayPrice: "R924.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "265.20 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$125.40", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$93.60", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩106,200", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥11,250", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "270,000 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "103,200 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "67,200 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$1,326.00", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€103.50", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€103.50", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€103.50", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€103.50", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€103.50", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$181.20", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£96.00", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$157.20", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 485,40", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$120.60", symbol: "$" },
  },

  // ESSENTIAL DESCONTO (50% off essential_mensal — first-time subscribers only)
  essential_desconto_mensal: {
    ZA: { currency: "ZAR", displayPrice: "R115.50", symbol: "R" },
    AE: { currency: "AED", displayPrice: "33.15 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$15.68", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$11.70", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩13,275", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥1,406", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "33,750 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "12,900 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "8,400 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$165.75", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€12.94", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€12.94", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€12.94", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€12.94", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€12.94", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$22.65", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£12.00", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$19.65", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 60,68", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$15.08", symbol: "$" },
  },

  // CREATOR
  creator_mensal: {
    ZA: { currency: "ZAR", displayPrice: "R382.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "193.20 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$52.20", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$38.50", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩56,000", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥4,582", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "112,000 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "42,500 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "43,700 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$547.00", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€42.90", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€42.90", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€42.90", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€42.90", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€42.90", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$74.70", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£39.70", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$64.70", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 199,90", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$49.70", symbol: "$" },
  },

  creator_anual: {
    ZA: { currency: "ZAR", displayPrice: "R2,292.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "1,159.20 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$313.20", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$231.00", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩336,000", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥27,492", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "672,000 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "255,000 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "262,200 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$3,282.00", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€257.40", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€257.40", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€257.40", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€257.40", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€257.40", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$448.20", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£238.20", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$388.20", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 1.199,40", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$298.20", symbol: "$" },
  },

  // AGENCY
  agency_mensal: {
    ZA: { currency: "ZAR", displayPrice: "R1,540", symbol: "R" },
    AE: { currency: "AED", displayPrice: "807.40 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$231.20", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$150.00", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩175,600", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥18,635", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "449,100 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "166,665 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "185,600 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$2,200", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€172.60", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€172.60", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€172.60", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€172.60", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€172.60", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$300.90", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£159.60", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$260.50", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 599,90", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$200.00", symbol: "$" },
  },

  agency_anual: {
    ZA: { currency: "ZAR", displayPrice: "R9,240", symbol: "R" },
    AE: { currency: "AED", displayPrice: "4,844.40 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$1,387.20", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$900.00", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩1,053,600", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥111,810", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "2,694,600 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "999,999 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "1,113,600 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$13,200", symbol: "MX$" },

    ES: { currency: "EUR", displayPrice: "€1,035.60", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€1,035.60", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€1,035.60", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€1,035.60", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€1,035.60", symbol: "€" },

    AU: { currency: "AUD", displayPrice: "A$1,805.40", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£957.60", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$1,563.00", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 3.599,40", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$1,200.00", symbol: "$" },
  },
};

const DISPLAY_PRICES_AVULSO: Record<string, RegionalPricing> = {
  // MINI
  avulso_mini: {
    ZA: { currency: "ZAR", displayPrice: "R67.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "18.90 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$9.00", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$6.70", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩7,560", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥815", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "19,500 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "7,430 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "4,825 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$96.00", symbol: "MX$" },
    ES: { currency: "EUR", displayPrice: "€7.60", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€7.60", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€7.60", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€7.60", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€7.60", symbol: "€" },
    AU: { currency: "AUD", displayPrice: "A$13.10", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£7.00", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$11.30", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 34,90", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$8.70", symbol: "$" },
  },

  // BÁSICO
  avulso_basico: {
    ZA: { currency: "ZAR", displayPrice: "R144.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "41.00 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$19.50", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$14.70", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩16,500", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥1,738", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "41,600 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "15,970 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "10,400 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$204.00", symbol: "MX$" },
    ES: { currency: "EUR", displayPrice: "€16.00", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€16.00", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€16.00", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€16.00", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€16.00", symbol: "€" },
    AU: { currency: "AUD", displayPrice: "A$28.20", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£14.70", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$24.30", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 74,90", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$18.60", symbol: "$" },
  },

  // EXTRA
  avulso_extra: {
    ZA: { currency: "ZAR", displayPrice: "R285.00", symbol: "R" },
    AE: { currency: "AED", displayPrice: "81.90 AED", symbol: "AED" },
    NZ: { currency: "NZD", displayPrice: "NZ$38.60", symbol: "NZ$" },
    SG: { currency: "SGD", displayPrice: "S$28.80", symbol: "S$" },
    KR: { currency: "KRW", displayPrice: "₩32,900", symbol: "₩" },
    JP: { currency: "JPY", displayPrice: "¥3,475", symbol: "¥" },
    CO: { currency: "COP", displayPrice: "83,300 COP", symbol: "COL$" },
    AR: { currency: "ARS", displayPrice: "31,900 ARS", symbol: "ARS$" },
    CL: { currency: "CLP", displayPrice: "20,700 CLP", symbol: "CLP$" },
    MX: { currency: "MXN", displayPrice: "MX$409.00", symbol: "MX$" },
    ES: { currency: "EUR", displayPrice: "€32.00", symbol: "€" },
    FR: { currency: "EUR", displayPrice: "€32.00", symbol: "€" },
    DE: { currency: "EUR", displayPrice: "€32.00", symbol: "€" },
    IT: { currency: "EUR", displayPrice: "€32.00", symbol: "€" },
    EU: { currency: "EUR", displayPrice: "€32.00", symbol: "€" },
    AU: { currency: "AUD", displayPrice: "A$55.90", symbol: "A$" },
    GB: { currency: "GBP", displayPrice: "£29.70", symbol: "£" },
    CA: { currency: "CAD", displayPrice: "CA$48.40", symbol: "CA$" },
    BR: { currency: "BRL", displayPrice: "R$ 149,90", symbol: "R$" },
    US: { currency: "USD", displayPrice: "$37.20", symbol: "$" },
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
      currency: "BRL",
      displayPrice: "R$ 0,00",
      symbol: "R$",
    };
  }

  const region = userRegion?.toUpperCase() || "BR";
  const regionPrice = priceConfig[region] || priceConfig["BR"];

  if (!regionPrice) {
    console.warn(`No price found for region ${region}, falling back to BR`);
    return priceConfig["BR"];
  }

  return regionPrice;
}

export function getDescontoPriceForRegion(
  userRegion: string | null | undefined,
): PriceDisplay {
  return getPriceForUserRegion("essential_desconto", false, userRegion);
}

export function getAvulsoPriceForUserRegion(
  packType: string,
  userRegion: string | null | undefined,
): PriceDisplay {
  const priceConfig = DISPLAY_PRICES_AVULSO[packType];

  if (!priceConfig) {
    console.error(`No avulso price configuration found for pack: ${packType}`);
    return {
      currency: "BRL",
      displayPrice: "R$ 0,00",
      symbol: "R$",
    };
  }

  const region = userRegion?.toUpperCase() || "BR";
  const regionPrice = priceConfig[region] || priceConfig["BR"];

  if (!regionPrice) {
    console.warn(
      `No avulso price found for region ${region}, falling back to BR`,
    );
    return priceConfig["BR"];
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
