// ─── Canvas Template Definitions ─────────────────────────────────────────────
//
// kind = "prompt"  → imagem gerada por IA (modal exibe imagem + prompt copiável)
// kind = "design"  → composição com layers (texto, shapes, stickers sobre imagem base)
//
// Categorias ativas: "Produto" | "Arte" | "Magazine" | "Branding"
// import { useTranslations } from "next-intl";
export type TemplateKind = "prompt" | "design";

export type TemplateLayer = {
  id: string;
  name: string;
  type: "text" | "sticker" | "shape" | "image";
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  scale: number;
  data: {
    content?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: string;
    src?: string;
    shape?: "rectangle" | "circle" | "triangle";
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    width?: number;
    height?: number;
  };
};

export type TemplateCreator = {
  name: string;
  avatar: string;
  handle: string;
  verifiedBadge?: string;
};

export type CanvasTemplate = {
  id: string;
  kind: TemplateKind;
  name: string;
  description: string;
  category:
    | "Produto"
    | "Arte"
    | "Magazine"
    | "Branding"
    | "Anime"
    | "Desenho"
    | "Poster"
    | "Fantasia"
    | "Transformar"
    | "Viral"
    | "Game"
    /*| "Copa2026"*/
    | "UserPublic";
  tags: string[];
  baseImageUrl: string;
  aiPrompt?: string;
  aspectRatio: string;
  width: number;
  height: number;
  layers: TemplateLayer[];
  creator: TemplateCreator;
  views?: number;
  likes?: number;
  settings: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    hueRotate: number;
    grayscale: number;
    sepia: number;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// const W = useTranslations("templates")

const R2 = (name_image: string) =>
  `https://cdn-frontend.trendyuu.com/template-thumbnails/${name_image}`;

const DEF = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  hueRotate: 0,
  grayscale: 0,
  sepia: 0,
};

const TRENDYUU: TemplateCreator = {
  name: "TrendYuu",
  handle: "@trendyuu",
  avatar:
    "https://cdn-frontend.trendyuu.com/public/brands/logo_trend_instagram.webp",
  verifiedBadge:
    "https://cdn-frontend.trendyuu.com/public/brands/verificado.webp",
};

// ─────────────────────────────────────────────────────────────────────────────
export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  // ══════════════════════════════════════
  //  PRODUTO
  // ══════════════════════════════════════

  {
    id: "produto-cafe-levitacao",
    kind: "prompt",
    name: "Produto Levitação",
    description:
      "Fotografia de produto com levitação dramática, splash de chocolate e grãos de café voando — perfeito para e-commerce premium.",
    category: "Produto",
    tags: ["produto", "levitação", "ecommerce", "café"],
    baseImageUrl: R2("produto_1.webp"),
    aiPrompt:
      "Product photography of a branded coffee jar levitating in mid-air, coffee beans and chocolate splashing around, dramatic warm caramel background, soft volumetric lighting, commercial photography, ultra HD, 8k render, premium brand aesthetic",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 108, saturation: 115 },
  },

  // ══════════════════════════════════════
  //  ARTE
  // ══════════════════════════════════════

  {
    id: "arte-retrato-aurora",
    kind: "prompt",
    name: "Retrato Aurora",
    description:
      "Retrato feminino com luzes de aurora boreal ao fundo — mood etéreo e editorial.",
    category: "Arte",
    tags: ["retrato", "aurora", "ia", "feminino"],
    baseImageUrl:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1080&h=1350&fit=crop&auto=format",
    aiPrompt:
      "Close-up portrait of a woman, aurora borealis reflected in eyes, pastel pink and teal tones, bokeh background with northern lights, editorial photography, soft rim lighting, ultra HD",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 95, saturation: 120, contrast: 108 },
  },

  {
    id: "arte-underwater-sunglasses",
    kind: "prompt",
    name: "Underwater Sunglasses",
    description:
      "Retrato de beleza subaquático com óculos amarelos translúcidos e reflexos solares na água.",
    category: "Arte",
    tags: ["retrato", "underwater", "beauty", "ia"],
    baseImageUrl: R2("arte2.webp"),
    aiPrompt:
      "Ultra-realistic underwater beauty portrait of a woman floating in clear blue water, close-up face shot, wearing translucent yellow sunglasses, eyes closed, sunlight refracting through water creating golden reflections and caustic light patterns across her face and glasses, air bubbles and ripples above her forehead, glossy wet skin, cinematic lighting, vibrant turquoise water background, fashion editorial photography style, summer pool aesthetic, macro beauty shot, high contrast highlights, crystal clear water texture, dreamy aquatic atmosphere, hyper-detailed skin, 8k, ultra sharp focus --ar 2:3",
    aspectRatio: "4:5",
    width: 1080,
    height: 1620,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 96, saturation: 118, contrast: 110 },
  },

  {
    id: "arte-lemons-fashion",
    kind: "prompt",
    name: "Lemon Fashion Beauty",
    description:
      "Retrato fashion com limões amarelos vibrantes criando uma estética editorial de verão.",
    category: "Arte",
    tags: ["retrato", "fashion", "lemons", "ia"],
    baseImageUrl: R2("arte1.webp"),
    aiPrompt:
      "Hyper-realistic fashion beauty portrait of a woman lying surrounded by fresh bright yellow lemons, close-up composition with lemons filling the entire background, woman wearing large translucent yellow sunglasses, glossy skin glowing under strong sunlight, eyes softly closed, relaxed expression, warm golden lighting creating dramatic highlights and shadows across her face and the lemons, vibrant citrus color palette, summer editorial fashion photography, ultra-detailed skin texture, macro beauty shot, high contrast, luxury magazine aesthetic, photorealistic, sharp focus, studio-quality lighting, 8k detail --ar 2:3",
    aspectRatio: "4:5",
    width: 1080,
    height: 1620,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, saturation: 125, contrast: 110 },
  },

  {
    id: "arte-underwater-amber-glasses",
    kind: "prompt",
    name: "Underwater Amber Glasses",
    description:
      "Retrato de beleza submerso com reflexos solares dramáticos e óculos âmbar.",
    category: "Arte",
    tags: ["retrato", "underwater", "beauty", "ia"],
    baseImageUrl: R2("arte3.webp"),
    aiPrompt:
      "Hyper-realistic underwater beauty portrait of a woman with greyish eyes partially submerged in clear water, extreme close-up face shot, wearing transparent amber/orange tinted eyeglasses, glossy wet skin with water droplets and ripples across her face, dramatic sunlight caustic reflections and shimmering light patterns refracting through the water onto her skin and glasses, soft parted lips, long eyelashes, cinematic lighting, crystal-clear water texture surrounding her face, fashion editorial photography style, luxury beauty campaign aesthetic, high contrast highlights, ultra-detailed skin pores, macro beauty shot, dreamy aquatic atmosphere, photorealistic, ultra sharp focus, 8k detail --ar 2:3",
    aspectRatio: "4:5",
    width: 1080,
    height: 1620,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 97, saturation: 118, contrast: 112 },
  },

  // ══════════════════════════════════════
  //  MAGAZINE
  // ══════════════════════════════════════

  {
    id: "magazine-vogue-cover",
    kind: "prompt",
    name: "Capa Magazine",
    description:
      "Capa de revista estilo Vogue com modelo em traje vibrante, tipografia editorial e layout limpo.",
    category: "Magazine",
    tags: ["magazine", "vogue", "editorial", "moda"],
    baseImageUrl: R2("magazine_1.webp"),
    aiPrompt:
      "Vogue magazine cover style, fashion model in bold colorful outfit, clean pink studio background, editorial typography overlay, spring style, high fashion photography, dramatic pose, ultra sharp",
    aspectRatio: "4:5",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 125 },
  },

  {
    id: "magazine-ceo-style",
    kind: "prompt",
    name: "Capa Magazine ceo",
    description: "Capa estilo business/Ceo luxuosa.",
    category: "Magazine",
    tags: ["magazine", "Ceo", "capa", "empresa"],
    baseImageUrl: R2("megazine_ceo.webp"),
    aiPrompt:
      "business magazine cover, successful young CEO, formal suit, confident pose, modern office background, professional lighting, sharp focus, editorial layout, realistic photography",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 125 },
  },

  {
    id: "megazine-viral",
    kind: "prompt",
    name: "Magazine moderna",
    description: "Capa de revista moderna estilo viral",
    category: "Magazine",
    tags: ["magazine", "modern", "capa", "viral"],
    baseImageUrl: R2("megazine-viral.webp"),
    aiPrompt:
      "person on a magazine cover, modern editorial layout, bold headlines, professional studio lighting, confident pose, ultra realistic, high fashion aesthetic",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 125 },
  },

  // ══════════════════════════════════════
  //  BRANDING
  // ══════════════════════════════════════

  {
    id: "branding-camiseta-rua",
    kind: "prompt",
    name: "Branding Streetwear",
    description:
      "Mockup de camiseta oversized com identidade de marca em cenário urbano ao entardecer — ideal para lançamentos de coleção.",
    category: "Branding",
    tags: ["camiseta", "streetwear", "mockup", "branding"],
    baseImageUrl: R2("brand_1.webp"),
    aiPrompt:
      "Oversized white t-shirt mockup worn by a person walking on a cobblestone street at golden hour, bold brand typography printed on the back, urban city background with warm bokeh lights, lifestyle photography, editorial style",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "branding-minimalista",
    kind: "prompt",
    name: "Branding Minimalista",
    description: "Foto de uma marca minimalista",
    category: "Branding",
    tags: ["branding", "minimalista", "branding"],
    baseImageUrl: R2("logo_minimal.webp"),
    aiPrompt:
      "inimalist modern logo for a tech startup called (name of your brand), clean typography, futuristic style, blue and purple gradient, flat design, white background, high contrast, brand identity, 8k.",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "branding-lifestyle",
    kind: "prompt",
    name: "Aura Coffee Co",
    description: "Uma cena que exala conforto e sofisticação minimalista.",
    category: "Branding",
    tags: ["branding", "lifestyle", "coffe", "productivity"],
    baseImageUrl: R2("brading_coffe.webp"),
    aiPrompt:
      "Aesthetic lifestyle photo representing a modern coffee brand, warm tones, cozy atmosphere, natural light, minimalist environment, brand storytelling, Instagram style, cinematic",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  // ══════════════════════════════════════
  //  POSTERS
  // ══════════════════════════════════════

  {
    id: "poster-samurai",
    kind: "prompt",
    name: "Poster filme Samurai",
    description:
      "Este pôster apresenta uma estética cyberpunk vibrante e chuvosa, focada em um samurai futurista de costas no centro de uma metrópole iluminada por néon.",
    category: "Poster",
    tags: ["poster", "samurai", "minimalita", "filme"],
    baseImageUrl: R2("poster-samurai.webp"),
    aiPrompt:
      "A cinematic movie poster of a [subject], dramatic lighting, ultra realistic, epic atmosphere, centered composition, depth of field, volumetric lighting, film grain, high contrast, dark background, 8k, highly detailed, title typography at the bottom, award-winning movie poster style",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "poster-moderno",
    kind: "prompt",
    name: "Poster Moderno",
    description:
      "A imagem apresenta um pôster de design moderno e corporativo voltado para uma startup de Inteligência Artificial.",
    category: "Poster",
    tags: ["poster", "IA", "startup"],
    baseImageUrl: R2("poster-moderno.webp"),
    aiPrompt:
      "A modern business poster for a startup about [theme], clean layout, minimal design, bold typography, gradient background, futuristic UI elements, professional, high-end branding, soft shadows, poster style, 4k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "poster-motivacional",
    kind: "prompt",
    name: "Poster Motivacional",
    description:
      "Esta imagem é um pôster de moda streetwear com uma estética urbana e industrial carregada.",
    category: "Poster",
    tags: ["poster", "motivacão", "disciplina"],
    baseImageUrl: R2("poster-motivacional.webp"),
    aiPrompt:
      "A motivational poster with the phrase [QUOTE], bold typography, minimalist design, strong contrast, black background, modern style, centered text, subtle lighting, inspirational aesthetic, clean layout",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "poster-futurista",
    kind: "prompt",
    name: "Poster Futurista",
    description:
      "A imagem apresenta um pôster cyberpunk com uma estética futurista e sombria.",
    category: "Poster",
    tags: ["poster", "futurista", "IA"],
    baseImageUrl: R2("poster-futurista.webp"),
    aiPrompt:
      "A futuristic poster about [theme], holographic elements, neon glow, dark background, sci-fi interface, ultra detailed, cyberpunk aesthetic, high contrast, modern tech design, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  // ══════════════════════════════════════
  //  FANTASIA
  // ══════════════════════════════════════

  {
    id: "cavaleiro-sombrio",
    kind: "prompt",
    name: "Cavaleiro sombrio",
    description:
      "A imagem apresenta um pôster de fantasia sombria com uma atmosfera gótica e opressiva.",
    category: "Fantasia",
    tags: ["fantasy", "cavaleiro", "épico"],
    baseImageUrl: R2("cavaleiro-sombrio.webp"),
    aiPrompt:
      "A dark fantasy scene of a [character/creature], surrounded by fog, ancient ruins, dramatic lighting, gothic atmosphere, ultra detailed, cinematic composition, dark tones, high contrast, 8k, fantasy art style",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "mundo-fantasia",
    kind: "prompt",
    name: "Mundo de fantasia",
    description:
      "Esta é uma ilustração digital vibrante de um mundo de fantasia etéreo, composta por ilhas flutuantes conectadas por pontes de corda suspensas.",
    category: "Fantasia",
    tags: ["fantasy", "world"],
    baseImageUrl: R2("mundo-fantasia.webp"),
    aiPrompt:
      "A powerful wizard casting magic, glowing energy, floating particles, arcane symbols, mystical environment, dramatic lighting, ultra detailed, fantasy art, cinematic composition, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "maga-rpg",
    kind: "prompt",
    name: "Rpg de magos",
    description:
      "Uma maga poderosa em uma tela de seleção de personagem, segurando um cajado brilhante cercada por runas místicas e elementos de interface de RPG.",
    category: "Fantasia",
    tags: ["fantasy", "maga", "rpg"],
    baseImageUrl: R2("maga-rpg.webp"),
    aiPrompt:
      "A fantasy RPG character selection screen style, [character], detailed armor, glowing effects, dark background, cinematic lighting, game UI elements, ultra detailed, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "fantasy-dragon",
    kind: "prompt",
    name: "Dragão medieval",
    description: "Fantasia épica de um dragão medieval",
    category: "Fantasia",
    tags: ["dragon", "fantasy", "medieval"],
    baseImageUrl: R2("fantasy-dragon.webp"),
    aiPrompt:
      "A majestic dragon flying over a fantasy kingdom, fire breathing, epic scale, cinematic lighting, ultra detailed scales, dramatic sky, high contrast, fantasy art, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  // ══════════════════════════════════════
  //  DESENHOS
  // ══════════════════════════════════════

  {
    id: "drawing-transformation",
    kind: "prompt",
    name: "Transforming person.",
    description:
      "Illustration of a viral transformation of a real person into a cartoon animation.",
    category: "Desenho",
    tags: ["desenho", "disney", "cowboy"],
    baseImageUrl: R2("cowboy.webp"),
    aiPrompt:
      "Transform this person into a Pixar-style character: big eyes, smooth skin, cinematic lighting, friendly appearance, high quality, 3D rendering.",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "woman-disney",
    kind: "prompt",
    name: "person_disney_woman",
    description: "Illustration of a viral drawing Disney.",
    category: "Desenho",
    tags: ["desenho", "disney", "woman"],
    baseImageUrl: R2("person_disney_woman.webp"),
    aiPrompt:
      "Disney-style woman, soft features, cheerful expression, warm lighting, colorful background, 3D animation style.",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "drawing-monster-animate",
    kind: "prompt",
    name: "drawing monster animate",
    description:
      "Criatura azul peluda e redonda com olhos grandes, usando chapéu de festa e cachecol colorido, em um quarto vibrante no estilo A Mansão Foster para Amigos Imaginários.",
    category: "Desenho",
    tags: ["desenho", "monster-animate", "cartoon-network"],
    baseImageUrl: R2("drawing_cartoon_monster.webp"),
    aiPrompt:
      "Imaginary blue furry creature in the style of Foster's, big curious eyes, funny accessories, playful pose, thick lines, vibrant colors, classic Cartoon Network.",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "superheroi",
    kind: "prompt",
    name: "Superheroi",
    description: "photo of superhero and destroyed city",
    category: "Transformar",
    tags: ["desenho", "superheroi", "destruição"],
    baseImageUrl: R2("superheroi.webp"),
    aiPrompt:
      " transformar essa pessoa em super-herói, traje futurista, capa, iluminação dramática, cenário de cidade destruída, estilo cinema. Aspect-ratio em 5:4 ",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  {
    id: "superpodersa-disney",
    kind: "prompt",
    name: "Menina Superpoderosa",
    description:
      "A imagem retrata uma menina super-heroína com estética vibrante dos anos 2000",
    category: "Desenho",
    tags: ["diney", "desenho", "superpoderosa"],
    baseImageUrl: R2("super_poderosa_disney.webp"),
    aiPrompt:
      "10-year-old girl with Powerpuff Girls-style superpowers, flying hair, colorful outfit, determined expression, thick lines, huge eyes, pop colors, Cartoon Network 2000s",
    aspectRatio: "4:5",
    width: 1408,
    height: 768,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 108 },
  },

  // ══════════════════════════════════════
  //  ANIMES
  // ══════════════════════════════════════

  {
    id: "anime_girl_neon",
    kind: "prompt",
    name: "Garota Anime no Telhado Neon",
    description:
      "Ilustração anime de uma garota de 17 anos com cabelos prateados esvoaçantes e olhos azuis estrelados, pose dinâmica no telhado de um prédio à noite sob lua cheia, uniforme escolar com capa preta, fundo de cidade neon.",
    category: "Anime",
    tags: [
      "anime",
      "garota",
      "telhado",
      "lua-cheia",
      "cidade-neon",
      "capa-preta",
      "uniforme-escolar",
    ],
    baseImageUrl: R2("anime_girl_neon_2.webp"),
    aiPrompt:
      "Create a detailed anime illustration of a 17-year-old girl with long, flowing silver hair, large, wide blue eyes with starlight reflections, a specific expression, wearing a modern Japanese school uniform with a black cape, a dynamic pose on a rooftop at night under a full moon, in a modern anime style with cel-shading, dramatic lighting, and a neon city background, high quality, 8k.",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 100, saturation: 100 },
  },

  {
    id: "anime-shonen-batalha",
    kind: "prompt",
    name: "Batalha Shonen Épica",
    description:
      "Cena de batalha épica em estilo anime shonen, protagonista masculino com aura de energia azul ao redor, soco poderoso, fundo destruído com explosões, linhas de movimento e dramatic lighting.",
    category: "Anime",
    tags: [
      "shonen",
      "batalha",
      "ação",
      "aura-azul",
      "explosão",
      "protagonista-masculino",
      "anime-ação",
    ],
    baseImageUrl: R2("anime_batalha_shonen.webp"),
    aiPrompt:
      "Cena de batalha épica em estilo anime shonen, protagonista masculino com aura de energia azul ao redor, soco poderoso, fundo destruído com explosões, linhas de movimento, dramatic lighting, cores intensas, ultra detalhado",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 115, saturation: 110 },
  },

  {
    id: "anime-elfa-floresta",
    kind: "prompt",
    name: "Elfa na Floresta Mística",
    description:
      "Ilustração anime de uma garota elfa com cabelo prateado longo trançado, orelhas pontudas, armadura leve azul e prata, segurando espada, em uma floresta mágica antiga.",
    category: "Anime",
    tags: [
      "elfa",
      "floresta",
      "fantasia",
      "armadura",
      "cabelo-prateado",
      "anime",
    ],
    baseImageUrl: R2("person_anime_elfa.webp"),
    aiPrompt:
      "Create a detailed anime illustration of a 17-year-old elf girl with long flowing silver hair in a neat braid, elegant pointed elf ears, large bright blue eyes with starlight reflections, determined expression, wearing light blue and silver elven armor with intricate details, holding a glowing elven sword in her right hand, standing in a dynamic pose in an ancient mystical forest, tall glowing trees, soft magical mist, rays of moonlight filtering through the leaves, modern anime style with clean cel-shading, dramatic yet soft lighting, vibrant colors, high quality, ultra detailed, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "aurus-athletic",
    kind: "prompt",
    name: "aurus athletic infoproduto",
    description: "Ilustração visual de um infoproduto premium",
    category: "Produto",
    tags: ["academy", "athletic", "personal"],
    baseImageUrl: R2("aurus-athletic.webp"),
    aiPrompt:
      "Premium visual identity for an infoproduct (choose a brand name (no existing names)) - niche -> sports. Modern, luxurious, and clean style. Color palette: [colors]. Main logo, icon version, ebook cover, and 3D mockups. 8K, cinematic lighting.",
    aspectRatio: "5:4",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "maestria-foco",
    kind: "prompt",
    name: "maestria em foco: liderança e alta perfomance",
    description:
      "Este desing mostra uma presença masculina serena e confiante.Paleta é sofisticada, ideal para quem busca credibilidade e elegância discreta.",
    category: "Produto",
    tags: ["ebook", "desenvolvimento pessoal", "liderança"],
    baseImageUrl: R2("ebook_maestria_em_foco.webp"),
    aiPrompt:
      'Premium cover for the infoproduct "[Product Name]". Niche [your niche]. Minimalist luxury style, [color] tones. Confident woman/man, elegant typography. Realistic 3D mockups. Clean background, 8K.',
    aspectRatio: "5:4",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  // ══════════════════════════════════════
  //  TRANSFORMAR
  // ══════════════════════════════════════

  {
    id: "anos60",
    kind: "prompt",
    name: "Transformação anos 60",
    description:
      "A imagem apresenta uma releitura nostálgica e sofisticada do calçadão de Ipanema, no Rio de Janeiro, com uma estética marcante dos anos 60.",
    category: "Transformar",
    tags: ["transformar", "60s"],
    baseImageUrl: R2("anos60.webp"),
    aiPrompt:
      "Transform this person into a 1960s portrait, vintage photography style, classic fashion, soft film grain, warm tones, analog camera look, retro hairstyle, subtle blur, authentic 60s aesthetic, highly realistic",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "anos70",
    kind: "prompt",
    name: "Transformação anos 70",
    description:
      "A imagem apresenta um retrato estilizado com estética retrô dos anos 70. Nela, uma mulher sorridente posa em uma pista de dança de discoteca",
    category: "Transformar",
    tags: ["transformar", "70s"],
    baseImageUrl: R2("anos70.webp"),
    aiPrompt:
      "Transform this person into a 1970s style portrait, disco fashion, colorful tones, vintage film texture, flared clothes, retro hairstyle, warm lighting, analog aesthetic, highly realistic",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "anos80",
    kind: "prompt",
    name: "Transformação anos 80",
    description:
      "Uma mulher sorridente em uma estética synthwave dos anos 80. Ela está sentada à mesa de um café, segurando uma xícara, mas o ambiente original foi transformado em uma metrópole noturna vibrante.",
    category: "Transformar",
    tags: ["transformar", "80s", "neon"],
    baseImageUrl: R2("anos80.webp"),
    aiPrompt:
      "Transform this person into a 1980s portrait, neon lights, retro aesthetic, synthwave style, vibrant colors, dramatic lighting, vintage film grain, 80s fashion, highly detailed",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "anos90",
    kind: "prompt",
    name: "Transformação anos 90",
    description: "fotografia com estética vintage dos anos 90",
    category: "Transformar",
    tags: ["transformar", "90s"],
    baseImageUrl: R2("anos90.webp"),
    aiPrompt:
      "Transform this person into a 1990s portrait, streetwear style, VHS texture, slightly desaturated colors, retro urban fashion, film grain, nostalgic aesthetic, highly realistic",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "transformar-em-bilionario",
    kind: "prompt",
    name: "Transformar em bilionário",
    description:
      "Transformação de uma pessoa em um bilionário de forma luxuosa e cinematográfica.",
    category: "Transformar",
    tags: ["transformar", "billionaire"],
    baseImageUrl: R2("billionare.webp"),
    aiPrompt:
      "Transform this person into a billionaire lifestyle scene, luxury suit, private jet, cinematic lighting, ultra realistic",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "transformar-multiverso",
    kind: "prompt",
    name: "Transformação multiverso",
    description:
      "A imagem apresenta quatro variações de um mesmo personagem — um homem de 25 anos, branco, musculoso e com barba — adaptado a diferentes universos visuais:",
    category: "Transformar",
    tags: ["transformar", "multiverso"],
    baseImageUrl: R2("transformacao-multiverso.webp"),
    aiPrompt:
      "Create multiple versions of this person in different universes: cyberpunk, medieval warrior, futuristic soldier, fantasy mage, cinematic lighting, ultra detailed. ",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  // ══════════════════════════════════════
  //  VIRAL
  // ══════════════════════════════════════

  {
    id: "valentine-days-franca",
    kind: "prompt",
    name: "Valentine Days na França",
    description:
      "A imagem apresenta um smartphone sendo segurado por uma mão em primeiro plano, exibindo na tela a interface da câmera com uma fotografia de um casal.",
    category: "Viral",
    tags: ["valentinedays", "franca", "paris", "viral"],
    baseImageUrl: R2("valentine-days-franca.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "valentine-days-genebra",
    kind: "prompt",
    name: "Valentine Days em Genebra",
    description:
      "A imagem apresenta um smartphone sendo segurado por uma mão em primeiro plano, exibindo na tela a interface da câmera com uma fotografia de um casal.",
    category: "Viral",
    tags: ["valentinedays", "genebra", "suica", "viral"],
    baseImageUrl: R2("valentine-days-genebra.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "valentine-days-espanha",
    kind: "prompt",
    name: "Valentine Days na Espanha",
    description:
      "A imagem apresenta um smartphone sendo segurado por uma mão em primeiro plano, exibindo na tela a interface da câmera com uma fotografia de um casal na espanha.",
    category: "Viral",
    tags: ["valentinedays", "espanha", "viral"],
    baseImageUrl: R2("valentine-days-espanha.webp"),
    aspectRatio: "4:5",
    width: 2752,
    height: 1536,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "carta-anime-night",
    kind: "prompt",
    name: "Anime Trading Card Style",
    description:
      "Esta imagem apresenta uma carta colecionável personalizada, criada no estilo visual das cartas de Pokémon TCG (Sun & Moon Series), mas com uma temática de K-pop.",
    category: "Viral",
    tags: ["card", "anime"],
    baseImageUrl: R2("carta-anime-nights.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "carta-anime-shadow",
    kind: "prompt",
    name: "Shadow Trainer: Ultimate Collab GX",
    description:
      "Uma arte digital que simula uma carta de Pokémon TCG do tipo TAG TEAM.",
    category: "Viral",
    tags: ["card", "anime"],
    baseImageUrl: R2("carta-anime-shadows.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  // ══════════════════════════════════════
  //  GAME
  // ══════════════════════════════════════

  {
    id: "game-the-last",
    kind: "prompt",
    name: "Último Sobrevivente",
    description:
      "Transforme sua foto em um sobrevivente de um mundo devastado, com cenários abandonados, natureza tomando conta e um clima intenso de sobrevivência.",
    category: "Game",
    tags: ["last", "game", "survival"],
    baseImageUrl: R2("game-the-last.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "game-red-dead",
    kind: "prompt",
    name: "Foto no velho oeste.",
    description:
      "Retrato cinematográfico de um pistoleiro inspirado no velho oeste de games como (Red Dead Redemption...).",
    category: "Game",
    tags: ["game", "faroeste"],
    baseImageUrl: R2("game-red-dead.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "game-resident-evil",
    kind: "prompt",
    name: "Fuga do Apocalipse",
    description:
      "Transforme sua foto em um sobrevivente em um cenário de terror, com atmosfera sombria, tensão constante e um ambiente cheio de perigos.",
    category: "Game",
    tags: ["horror", "game", "zumbi"],
    baseImageUrl: R2("game-resident.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "game-god-of-war",
    kind: "prompt",
    name: "Guerreiro dos Deuses",
    description:
      "Torne-se um guerreiro lendário com armadura divina e arma mística.",
    category: "Game",
    tags: ["war", "god", "legendary"],
    baseImageUrl: R2("game-god-of-war.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "game-minecraft",
    kind: "prompt",
    name: "Aventura em Blocos",
    description:
      "Entre em um universo totalmente pixelado, onde você se torna um personagem de blocos explorando um mundo criativo e cheio de possibilidades.",
    category: "Game",
    tags: ["block", "game", "world"],
    baseImageUrl: R2("game-minecraft.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "game-geshin",
    kind: "prompt",
    name: "Herói Anime Fantasia",
    description:
      "Transforme sua foto em um personagem de anime com visual mágico, roupas detalhadas e um universo vibrante cheio de energia e fantasia.",
    category: "Game",
    tags: ["game", "fantasty", "hero"],
    baseImageUrl: R2("game-geshin.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  {
    id: "game-lol",
    kind: "prompt",
    name: "Lenda da Arena",
    description:
      "Entre na arena como um herói lendário, com poderes únicos, efeitos visuais intensos e um estilo digno de batalhas épicas.",
    category: "Game",
    tags: ["game", "legendary", "lol"],
    baseImageUrl: R2("game-lol.webp"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 105 },
  },

  // ══════════════════════════════════════
  //  PRODUTO — Lip Gloss TREND
  // ══════════════════════════════════════

  {
    id: "produto-lipgloss-beauty",
    kind: "prompt",
    name: "Beauty Lip Gloss",
    description:
      "Fotografia editorial de produto cosmético com modelo aplicando lip gloss rosa — estética premium para marcas de beleza.",
    category: "Produto",
    tags: ["produto", "beleza", "cosmético", "lipgloss", "makeup"],
    baseImageUrl: R2("produto_lipgloss_beauty.webp"),
    aiPrompt:
      "Close-up beauty campaign photo of a woman applying pink lip gloss, freckled skin, elegant hands, gold applicator brush, matte pink bottle with gold cap, deep rose background, professional studio lighting, ultra sharp, commercial beauty photography, premium brand aesthetic, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 108, saturation: 115 },
  },

  {
    id: "produto-lipgloss-berries",
    kind: "prompt",
    name: "Lip Gloss Berry Flatlay",
    description:
      "Flatlay luxuoso de lip gloss matte rodeado por frutas vermelhas frescas — perfeito para lançamentos de coleção.",
    category: "Produto",
    tags: ["produto", "flatlay", "beleza", "berries", "cosmético"],
    baseImageUrl: R2("produto_lipgloss_berries.webp"),
    aiPrompt:
      "Luxury beauty flatlay, matte lip gloss bottle with gold cap open on a dark berry surface surrounded by fresh raspberries, blueberries and blackberries with water droplets, dramatic moody lighting, editorial product photography, ultra detailed, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 95, contrast: 115, saturation: 120 },
  },

  {
    id: "produto-lipgloss-icecream",
    kind: "prompt",
    name: "Lip Gloss Ice Cream",
    description:
      "Composição playful de lip gloss ao lado de sorvete rosa — ideal para campanhas de verão com estética doce e girlie.",
    category: "Produto",
    tags: ["produto", "beleza", "verão", "icecream", "cosmético"],
    baseImageUrl: R2("produto_lipgloss_icecream.webp"),
    aiPrompt:
      "Flat lay beauty product photography, pink matte lip gloss bottle with gold details next to a swirled pink soft serve ice cream cone on a pastel pink linen background, playful summer aesthetic, natural light, ultra sharp, commercial beauty photography, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 105, saturation: 118 },
  },

  // ══════════════════════════════════════
  //  PRODUTO — Trend Choco Bar
  // ══════════════════════════════════════

  {
    id: "produto-choco-lifestyle-lilac",
    kind: "prompt",
    name: "Choco Bar Lifestyle Lilás",
    description:
      "Foto lifestyle de produto alimentício com modelo em fundo lilás pastel — estética jovem e descontraída para redes sociais.",
    category: "Produto",
    tags: ["produto", "chocolate", "lifestyle", "snack", "alimentício"],
    baseImageUrl: R2("produto_choco_lifestyle_lilac.webp"),
    aiPrompt:
      "Lifestyle product photography of a smiling woman in a pastel lilac t-shirt pulling a colorful protein chocolate bar from her pocket, soft purple background, natural daylight, editorial style, commercial food photography, ultra sharp, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 105, saturation: 110 },
  },

  {
    id: "produto-choco-brasil",
    kind: "prompt",
    name: "Choco Bar Brasil Outdoor",
    description:
      "Foto outdoor vibrante com modelo segurando barra de chocolate em cenário brasileiro com palmeiras e céu azul.",
    category: "Produto",
    tags: ["produto", "chocolate", "brasil", "outdoor", "tropical"],
    baseImageUrl: R2("produto_choco_brasil.webp"),
    aiPrompt:
      "Commercial product photography of a smiling woman with curly hair holding a protein chocolate bar toward camera, low-angle shot, tropical palm trees and blue sky in background, vibrant summer colors, ultra realistic, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 105, contrast: 110, saturation: 125 },
  },

  {
    id: "produto-choco-bite-pink",
    kind: "prompt",
    name: "Choco Bar Bite Pink",
    description:
      "Close dramático de barra de chocolate com mordida exposta em fundo rosa vibrante — impacto visual máximo para feed.",
    category: "Produto",
    tags: ["produto", "chocolate", "snack", "pink", "impacto"],
    baseImageUrl: R2("produto_choco_bite_pink.webp"),
    aiPrompt:
      "Bold commercial product photography, hand with pink nails holding a bitten chocolate protein bar with colorful packaging, vibrant hot pink background, dramatic close-up, strong contrast, editorial style, ultra sharp, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 115, saturation: 130 },
  },

  {
    id: "produto-choco-bolsa",
    kind: "prompt",
    name: "Choco Bar na Bolsa",
    description:
      "Foto lifestyle elegante com modelo colocando barra de chocolate em bolsa bege — posicionamento premium e feminino.",
    category: "Produto",
    tags: ["produto", "chocolate", "lifestyle", "snack", "elegante"],
    baseImageUrl: R2("produto_choco_bolsa.webp"),
    aiPrompt:
      "Elegant lifestyle product photography of a smiling woman in a white tank top placing a protein chocolate bar into a beige leather handbag, mint green background, soft natural lighting, premium food editorial style, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1450,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 108, saturation: 112 },
  },

  // ══════════════════════════════════════
  //  VIRAL — Páscoa
  // ══════════════════════════════════════

  {
    id: "viral-pascoa-coelho-texto",
    kind: "prompt",
    name: "Feliz Páscoa — Coelho 3D",
    description:
      "Arte 3D fofa de coelho de Páscoa com texto 'Feliz Páscoa' — perfeito para stories e posts sazonais virais.",
    category: "Viral",
    tags: ["pascoa", "easter", "coelho", "3d", "sazonal"],
    baseImageUrl: R2("viral_pascoa_coelho_texto.webp"),
    aiPrompt:
      "Cute 3D rendered Easter bunny character, fluffy brown fur, big amber eyes, burlap bow tie with yellow flower, holding a decorated Easter egg with floral patterns, vibrant turquoise background with swirling patterns, colorful Easter eggs in background, bold friendly text 'Feliz Páscoa' in cream with brown outline, Pixar-style rendering, ultra detailed, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 105, contrast: 110, saturation: 125 },
  },

  {
    id: "viral-pascoa-coelho-closeup",
    kind: "prompt",
    name: "Coelho Páscoa Close-up 3D",
    description:
      "Close-up 3D do coelhinho de Páscoa segurando ovo decorado — arte fofa para engajamento sazonal.",
    category: "Viral",
    tags: ["pascoa", "easter", "coelho", "3d", "sazonal"],
    baseImageUrl: R2("viral_pascoa_coelho_closeup.webp"),
    aiPrompt:
      "Close-up 3D rendered cute Easter bunny, fluffy brown fur, large expressive amber eyes, burlap bow tie with yellow daisy, holding a hand-painted Easter egg with blue and yellow floral motifs, soft turquoise swirling background with blurred Easter eggs, Pixar animation style, ultra detailed, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 105, contrast: 108, saturation: 122 },
  },

  {
    id: "viral-pascoa-coelho-jardim",
    kind: "prompt",
    name: "Coelho Páscoa no Jardim",
    description:
      "Coelhinho 3D sentado em jardim primaveril segurando ovo colorido — arte horizontal para capas e banners sazonais.",
    category: "Viral",
    tags: ["pascoa", "easter", "coelho", "3d", "jardim", "sazonal"],
    baseImageUrl: R2("viral_pascoa_coelho_jardim.webp"),
    aiPrompt:
      "Cute 3D Easter bunny sitting on soft grass, fluffy brown fur, flower crown on head, holding a large colorful Easter egg with pink flowers and 'Happy Easter' text, magical turquoise glowing background with bokeh lights, small bell flowers and tiny blooms around, Pixar movie quality rendering, ultra detailed, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 105, contrast: 108, saturation: 122 },
  },

  // ══════════════════════════════════════
  //  NOVOS TEMPLATES — Março 2026
  // ══════════════════════════════════════
  //
  //  📁 RENOMEAR e mover para /public/templates/:
  //
  //  1774799824171_...v1b0qp...  →  branding_design_minimalista.png
  //  1774799824176_...7gj6l7...  →  branding_futuro_digital.png
  //  1774799824177_...eb4swv...  →  branding_green_finance.png
  //  1774799824177_...453jag...  →  branding_crescimento_redes.png
  //  1774799824178_...mu0wtf...  →  branding_inovacao_startup.png
  //  1774799824178_...c476at...  →  branding_marca_elite.png
  //  1774799824179_...13eg3f...  →  branding_criatividade_design.png
  //  1774799824179_...5bln2a...  →  branding_vendas_impacto.png
  //  1774799824179_...pbvky4...  →  branding_ia_inovacao_futura.png
  //  1774799824179_...zfdyv2...  →  branding_produtividade_futuro.png
  //  1774799824180_...59b29m...  →  produto_aether_neo_green_banner.png
  //  1774799824180_...fp15ge...  →  produto_trend_sincronismo_estilo.png
  //  1774799824180_...egz07j...  →  produto_aether_neo_rose_sync.png
  //  1774799824180_...cd7tw5...  →  produto_aether_neo_green_poster.png
  //  1774799824181_...3phkbi...  →  produto_aether_neo_green_grid.png
  //  1774799824181_...4fz4ft...  →  poster_resista_distorcao.png
  //  1774799824181_...pvkirx...  →  branding_principios_design.png

  // ── Branding ─────────────────────────────────────────────────────────────────

  {
    id: "branding-design-minimalista",
    kind: "prompt",
    name: "Design Minimalista",
    description:
      "Post editorial clean com modelo de perfil em blazer branco e tipografia bold — ideal para agências de design e criadores de conteúdo.",
    category: "Branding",
    tags: ["branding", "minimalista", "editorial", "design", "agencia"],
    baseImageUrl: R2("branding_design_minimalista.webp"),
    aiPrompt:
      "Minimalist editorial post for a design brand, woman in profile wearing white blazer, clean white background, bold black sans-serif typography, professional layout, premium brand aesthetic, ultra sharp, 8k",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 108, saturation: 95 },
  },

  {
    id: "branding-futuro-digital",
    kind: "prompt",
    name: "Futuro Digital",
    description:
      "Post estilo tech futurista com modelo feminina em traje cyber e paleta teal — perfeito para marcas de tecnologia e inovação.",
    category: "Branding",
    tags: ["branding", "tech", "futurista", "teal", "inovação"],
    baseImageUrl: R2("branding_futuro_digital.webp"),
    aiPrompt:
      "Futuristic tech brand post, woman in teal cyberpunk suit, side profile, geometric grid background, node connection lines, teal gradient, bold uppercase typography, modern tech aesthetic, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 98, contrast: 112, saturation: 118 },
  },

  {
    id: "branding-green-finance",
    kind: "prompt",
    name: "Green Finance — Consultoria",
    description:
      "Post sofisticado para consultoria financeira com modelo masculino em terno verde escuro e elementos de UI financeiros.",
    category: "Branding",
    tags: ["branding", "finanças", "consultoria", "verde", "premium"],
    baseImageUrl: R2("branding_green_finance.webp"),
    aiPrompt:
      "Premium financial consulting post, confident man in dark green suit, side profile, deep green abstract background with geometric circles, subtle financial chart icons, bold serif and sans-serif typography, luxury business aesthetic, ultra sharp, 8k",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 96, contrast: 115, saturation: 105 },
  },

  {
    id: "branding-crescimento-redes",
    kind: "prompt",
    name: "Crescimento nas Redes Sociais",
    description:
      "Post vibrante para criadores de conteúdo com modelo segurando smartphone e paleta rosa — layout com dicas e CTA.",
    category: "Branding",
    tags: ["branding", "redes sociais", "criadores", "rosa", "infoproduto"],
    baseImageUrl: R2("branding_crescimento_redes.webp"),
    aiPrompt:
      "Social media growth post for content creators, woman in all-pink outfit holding smartphone, vibrant pink background with organic blob shapes, bold white typography, social media icons (Instagram, TikTok, YouTube), clean list layout, commercial photography, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 108, saturation: 120 },
  },

  {
    id: "branding-inovacao-startup",
    kind: "prompt",
    name: "Inovação que Transforma — Startup",
    description:
      "Post motivacional para startups com modelo masculino em blazer laranja e fundo monocromático vibrante.",
    category: "Branding",
    tags: [
      "branding",
      "startup",
      "laranja",
      "empreendedorismo",
      "motivacional",
    ],
    baseImageUrl: R2("branding_inovacao_startup.webp"),
    aiPrompt:
      "Bold startup motivation post, young man in orange blazer, side profile looking up, vibrant orange monochromatic background with abstract geometric shapes, clean sans-serif typography, entrepreneurship brand aesthetic, ultra sharp, 8k",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 108, saturation: 122 },
  },

  {
    id: "branding-marca-elite",
    kind: "prompt",
    name: "Construa Sua Marca de Elite",
    description:
      "Post premium dark com modelo feminina em terno preto e tipografia serifada luxuosa — posicionamento de alto padrão.",
    category: "Branding",
    tags: ["branding", "luxo", "dark", "premium", "editorial"],
    baseImageUrl: R2("branding_marca_elite.webp"),
    aiPrompt:
      "Ultra-premium dark branding post, elegant woman in black blazer side profile, dark gradient background, serif luxury typography, gold jewelry details, high-end brand design, cinematic lighting, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 88, contrast: 118, saturation: 88 },
  },

  {
    id: "branding-criatividade-design",
    kind: "prompt",
    name: "Criatividade & Design Gráfico",
    description:
      "Post com ilustração vetorial dourada de designer escrevendo — estética retrô moderna para designers e agências criativas.",
    category: "Branding",
    tags: [
      "branding",
      "design gráfico",
      "ilustração",
      "dourado",
      "criatividade",
    ],
    baseImageUrl: R2("branding_criatividade_design.webp"),
    aiPrompt:
      "Graphic design agency post, stylized vector illustration of a professional woman in golden blazer writing in a notebook, golden yellow palette, retro-modern flat illustration style, bold typography, creative brand aesthetic, ultra sharp, 8k",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 105, contrast: 110, saturation: 125 },
  },

  {
    id: "branding-vendas-impacto",
    kind: "prompt",
    name: "Vendas Impacto — Resultados",
    description:
      "Post de alta conversão para agências de marketing digital com modelo masculino em terno vermelho e layout de autoridade.",
    category: "Branding",
    tags: ["branding", "vendas", "marketing digital", "vermelho", "autoridade"],
    baseImageUrl: R2("branding_vendas_impacto.webp"),
    aiPrompt:
      "High-impact sales and marketing post, confident man in red turtleneck blazer, side profile, bold deep red background with subtle star/sparkle patterns, large bold white typography, authority brand positioning, commercial photography, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 96, contrast: 118, saturation: 115 },
  },

  {
    id: "branding-ia-inovacao",
    kind: "prompt",
    name: "IA — Inovação Futura",
    description:
      "Post futurista roxo com androide feminina em armadura cyber e tipografia bold — perfeito para marcas de IA e tech.",
    category: "Branding",
    tags: ["branding", "ia", "roxo", "tech", "futurista", "androide"],
    baseImageUrl: R2("branding_ia_inovacao_futura.webp"),
    aiPrompt:
      "Futuristic AI brand post, female android in purple cyber armor with headset, side profile, deep purple gradient background, bold white mixed-weight typography, sci-fi technology aesthetic, dramatic lighting, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 96, contrast: 115, saturation: 118 },
  },

  {
    id: "branding-produtividade-futuro",
    kind: "prompt",
    name: "Produtividade do Futuro",
    description:
      "Post estilo ilustração cyberpunk azul com personagem masculino em óculos HUD — tecnologia e eficiência para marcas tech.",
    category: "Branding",
    tags: [
      "branding",
      "produtividade",
      "cyberpunk",
      "azul",
      "tech",
      "ilustração",
    ],
    baseImageUrl: R2("branding_produtividade_futuro.webp"),
    aiPrompt:
      "Futuristic productivity tech post, stylized illustration of a Black man in dark cyberpunk jacket wearing neon blue HUD glasses, deep blue gradient with circuit board elements, bold white tech typography, digital interface aesthetic, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 95, contrast: 118, saturation: 115 },
  },

  {
    id: "branding-principios-design-digital",
    kind: "prompt",
    name: "Princípios de Design Digital",
    description:
      "Post educativo clean com modelo feminina em look verde e óculos — layout informativo para designers e agências.",
    category: "Branding",
    tags: ["branding", "design", "educativo", "verde", "agencia", "tips"],
    baseImageUrl: R2("branding_principios_design.webp"),
    aiPrompt:
      "Educational design tips post, professional woman in green blazer and dark sunglasses, side profile, split green background (light and dark green), numbered list layout with bold and regular typography, clean minimalist design, commercial photography, ultra sharp, 8k",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 110, saturation: 108 },
  },

  // ── Produto — Aether & Trend (Tênis) ─────────────────────────────────────────

  {
    id: "produto-aether-neo-green-banner",
    kind: "prompt",
    name: "Aether Neo-Green Sync — Banner",
    description:
      "Banner horizontal premium da coleção Aether Neo-Green Sync com múltiplos ângulos do tênis e modelo feminina holográfica.",
    category: "Produto",
    tags: ["produto", "tenis", "aether", "verde neon", "banner", "sportswear"],
    baseImageUrl: R2("produto_aether_neo_green_banner.webp"),
    aiPrompt:
      "Premium sneaker collection banner, neon green athletic shoe multiple angles, holographic woman model, dark background with green digital grid and circuit elements, bold tech typography, AETHER brand, futuristic product photography, ultra sharp, 16:9, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 118, saturation: 130 },
  },

  {
    id: "produto-trend-sincronismo",
    kind: "prompt",
    name: "Trend — Sincronismo de Estilo",
    description:
      "Post vertical para campanha de tênis Trend Neo-Rosa com modelo feminina em cenário brasileiro e detalhes técnicos do produto.",
    category: "Produto",
    tags: ["produto", "tenis", "trend", "rosa neon", "moda", "campanha"],
    baseImageUrl: R2("produto_trend_sincronismo_estilo.webp"),
    aiPrompt:
      "Athletic sneaker campaign post, woman in sage green blazer smiling in tropical Brazilian setting, bold neon pink sneaker product shot with technical callouts (Nitro Mesh, Response Foam), pink neon glow effects, bold pink typography, commercial sportswear photography, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 112, saturation: 125 },
  },

  {
    id: "produto-aether-neo-rose-sync",
    kind: "prompt",
    name: "Aether Neo-Rose Sync",
    description:
      "Poster vertical de produto com tênis rosa neon flutuante em ambiente dark cyberpunk — alta intensidade visual para lançamentos.",
    category: "Produto",
    tags: ["produto", "tenis", "aether", "rosa neon", "dark", "cyberpunk"],
    baseImageUrl: R2("produto_aether_neo_rose_sync.webp"),
    aiPrompt:
      "Ultra-dramatic sneaker product poster, hot pink neon athletic shoe levitating in a dark cyberpunk corridor with pink neon grid lines and energy particles, technical callout labels, bold neon pink typography, dark background with magenta glow, commercial product photography, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 96, contrast: 120, saturation: 135 },
  },

  {
    id: "produto-aether-neo-green-poster",
    kind: "prompt",
    name: "Aether Neo-Green Sync — Poster",
    description:
      "Poster vertical de produto com tênis verde neon flutuante em corredor digital verde — estética tech premium para campanhas.",
    category: "Produto",
    tags: ["produto", "tenis", "aether", "verde neon", "dark", "tech"],
    baseImageUrl: R2("produto_aether_neo_green_poster.webp"),
    aiPrompt:
      "Premium sneaker product poster, neon green athletic shoe levitating in a dark digital corridor with green neon grid lines and glowing particles, AETHER logo, technical callout labels, bold neon green tech typography, dark background with lime green glow, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 96, contrast: 120, saturation: 135 },
  },

  {
    id: "produto-aether-neo-green-grid",
    kind: "prompt",
    name: "Aether Neo-Green — Grid Feed",
    description:
      "Layout de grid com 5 posts coordenados da coleção Aether Neo-Green — ideal para planejamento de feed no Instagram.",
    category: "Produto",
    tags: [
      "produto",
      "tenis",
      "aether",
      "verde neon",
      "grid",
      "feed instagram",
    ],
    baseImageUrl: R2("produto_aether_neo_green_grid.webp"),
    aiPrompt:
      "Instagram feed grid layout with 5 coordinated posts for a neon green sneaker collection (Aether brand): product hero shot, lifestyle model shot, detail close-up, full body model, brand CTA — dark background with green neon effects, consistent visual identity, 16:9 banner composition, ultra sharp, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 98, contrast: 118, saturation: 130 },
  },

  // ── Poster — Coleção Subterrânea ─────────────────────────────────────────────

  {
    id: "poster-resista-distorcao",
    kind: "prompt",
    name: "Resista — Coleção Subterrânea",
    description:
      "Poster de moda streetwear dark com estética industrial, tipografia brutal vermelha e fotografia em preto e branco.",
    category: "Poster",
    tags: [
      "poster",
      "streetwear",
      "dark",
      "industrial",
      "vermelho",
      "editorial",
    ],
    baseImageUrl: R2("poster_resista_distorcao.webp"),
    aiPrompt:
      "Brutal industrial fashion poster, close-up black and white portrait of a young person with dramatic makeup, dark coat, chain necklace, bold distressed red typography 'RESISTA', gritty concrete wall texture, underground fashion collection aesthetic, high contrast, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 88, contrast: 130, saturation: 60 },
  },

  {
    id: "produto-burger-x-tudo",
    kind: "prompt",
    name: "X-Tudo — Promoção Artesanal",
    description:
      "Post de oferta de hambúrguer artesanal com batata frita em fundo vermelho de lanchonete brasileira — foco em preço e apetite.",
    category: "Produto",
    tags: ["produto", "food", "hamburguer", "promoção", "lanchonete", "brasil"],
    baseImageUrl: R2("produto_burger_x_tudo.webp"),
    aiPrompt:
      "Bold Brazilian burger restaurant post, giant X-Tudo burger with egg, bacon, cheese, tomato and lettuce, crispy fries in metal basket, rustic wooden board, red brick background, bold typography 'X-TUDO POR R$12,99', warm restaurant lighting, commercial food photography, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 112, saturation: 118 },
  },

  {
    id: "produto-burger-combo-banner",
    kind: "prompt",
    name: "Combo Burger — 2 por R$25,90",
    description:
      "Banner horizontal de promoção de combo de hambúrgueres com confetes e mão segurando cartão — apelo festivo e de conversão.",
    category: "Produto",
    tags: ["produto", "food", "hamburguer", "combo", "promoção", "banner"],
    baseImageUrl: R2("produto_burger_combo_banner.webp"),
    aiPrompt:
      "Festive burger combo promotion banner, 5 different artisanal burgers lined up on wooden board, tattooed hand holding purple credit card, confetti and celebration atmosphere, bold typography '2 POR R$25,90', 'O MELHOR COMBO DE HAMBÚRGUER!', commercial food photography, ultra sharp, 16:9, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 105, contrast: 112, saturation: 120 },
  },

  {
    id: "produto-burger-cinema-banner",
    kind: "prompt",
    name: "Burger Cinema — Leve seu Lanche",
    description:
      "Banner temático de cinema com hambúrguer artesanal, batata frita e refil grátis — criativo para campanhas virais de food.",
    category: "Produto",
    tags: [
      "produto",
      "food",
      "hamburguer",
      "cinema",
      "viral",
      "criativo",
      "banner",
    ],
    baseImageUrl: R2("produto_burger_cinema_banner.webp"),
    aiPrompt:
      "Creative cinema-themed burger promotion banner, artisanal burger with fries on wooden board, two branded cups with 'REFIL GRÁTIS', film reels, movie clapboard and spotlight decorations, deep red background, bold typography 'LEVE SEU LANCHE PARA O CINEMA', commercial food photography, ultra sharp, 16:9, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 115, saturation: 118 },
  },

  {
    id: "criativo-programador",
    kind: "prompt",
    name: "Post Seja Programador!",
    description: "Imagem de post no X de criativo de curso de programação",
    category: "Produto",
    tags: ["produto", "programador", "curso", "viral"],
    baseImageUrl: R2("criativo-programador.webp"),
    aspectRatio: "4:5",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 115, saturation: 118 },
  },

  {
    id: "antes-depois",
    kind: "prompt",
    name: "O Salto da Eficiência: Do Caos à Clareza",
    description:
      "Este criativo utiliza a técnica de split-screen (tela dividida) para ilustrar a jornada de transformação digital de uma empresa.",
    category: "Produto",
    tags: ["produto", "empresa", "antes&depois"],
    baseImageUrl: R2("criativo-antes-depois.webp"),
    aspectRatio: "4:5",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 115, saturation: 118 },
  },

  {
    id: "post-sorveteria",
    kind: "prompt",
    name: "Combo Supremo: Sorvetes & Shakes Conversão",
    description:
      "Criativo projetado especificamente para sorveterias e cafeterias, este design utiliza gatilhos de felicidade e indulgência para capturar a atenção no feed.",
    category: "Produto",
    tags: ["produto", "sorveteria", "criativo"],
    baseImageUrl: R2("criativo-sorveteria.webp"),
    aspectRatio: "4:5",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 115, saturation: 118 },
  },

  {
    id: "criativo-port",
    kind: "prompt",
    name: "VÉA: Visionary UI Glow",
    description:
      "Este template de alta conversão funde o minimalismo editorial com a interatividade de UI moderna. Projetado especificamente para o nicho de beleza de luxo e design visual, o layout utiliza uma estética de aplicativo móvel para criar uma experiência imersiva no carrossel.",
    category: "Produto",
    tags: ["produto", "beleza"],
    baseImageUrl: R2("criativo-portfolio.webp"),
    aspectRatio: "4:5",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 115, saturation: 118 },
  },

  {
    id: "produto-burger-preco-baixo-banner",
    kind: "prompt",
    name: "Burger — Preço Baixo Combo",
    description:
      "Banner horizontal clean de combo de hambúrguer, batata e Coca-Cola com destaque no preço — conversão direta para delivery.",
    category: "Produto",
    tags: [
      "produto",
      "food",
      "hamburguer",
      "combo",
      "preco",
      "delivery",
      "banner",
    ],
    baseImageUrl: R2("produto_burger_preco_baixo_banner.webp"),
    aiPrompt:
      "Clean food promo banner, large artisanal burger with cheese and vegetables, crispy fries in metal basket and Coca-Cola glass, warm beige background, bold red typography 'PREÇO BAIXO APENAS R$15,90', wooden cutting board, commercial food photography, ultra sharp, 16:9, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 110, saturation: 115 },
  },

  {
    id: "criativo-ideias",
    kind: "prompt",
    name: "CRIATIVO PIXEL-PUNK 2026",
    description:
      "Um template de alto impacto que une o caos do glitch art com o polimento do design gráfico moderno. Criado para quem não quer apenas postar, mas sim parar o scroll.",
    category: "Produto",
    tags: ["produto", "criativo", "punk"],
    baseImageUrl: R2("criativo-ideias.webp"),
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 110, saturation: 115 },
  },
  {
    id: "filmes-para-empresarios",
    kind: "prompt",
    name: "Business Cinema Editorial",
    description:
      "Um template de colagem retro-moderna ideal para listas de recomendações e conteúdo educativo de alto valor.",
    category: "Produto",
    tags: ["produto", "filmes", "empresario"],
    baseImageUrl: R2("tres-filmes-assistir.webp"),
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 110, saturation: 115 },
  },

  {
    id: "criativo-cobra-caro",
    kind: "prompt",
    name: "Pop Art: Dinheiro Audacioso",
    description:
      "Inspirado na cultura urbana e na arte contemporânea, o template Dinheiro Audacioso é a escolha certa para posts que exigem impacto visual imediato.",
    category: "Produto",
    tags: ["produto", "Dinheiro", "dicas"],
    baseImageUrl: R2("foto-cobra-caro.webp"),
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 110, saturation: 115 },
  },
  // ══════════════════════════════════════
  //  VIRAL — Criadores de Conteúdo
  // ══════════════════════════════════════

  {
    id: "viral-sentimentos-dar-nome",
    kind: "prompt",
    name: "Como Dar Nome aos Sentimentos",
    description:
      "Post editorial minimalista com duas mulheres de perfil em fundo bege — ideal para criadores de conteúdo de psicologia, bem-estar e autoconhecimento.",
    category: "Viral",
    tags: [
      "sentimentos",
      "psicologia",
      "autoconhecimento",
      "editorial",
      "viral",
    ],
    baseImageUrl: R2("viral_sentimentos_dar_nome.webp"),
    aiPrompt:
      "Minimalist editorial Instagram post, two women facing each other in profile, soft beige neutral background, clean serif typography overlay 'Como dar nome aos seus sentimentos', subtle blue highlight on keyword, emotional wellness aesthetic, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 105, saturation: 95 },
  },

  {
    id: "branding-formula-perfil-zero",
    kind: "prompt",
    name: "Copie a Minha Fórmula",
    description:
      "Post de alto impacto estilo pop art com cientista em preto e branco e elementos laranja vibrantes — perfeito para criadores de conteúdo e infoprodutores de marketing.",
    category: "Branding",
    tags: ["branding", "fórmula", "perfil", "marketing", "viral", "laranja"],
    baseImageUrl: R2("branding_formula_perfil_zero.webp"),
    aiPrompt:
      "Bold pop art social media post, smiling Black woman scientist in lab coat holding two beakers, black and white photography with vibrant orange graphic elements, bold white uppercase typography 'COPIE A MINHA FÓRMULA', science icons and sparkle stickers, high energy educational brand aesthetic, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 120, saturation: 0 },
  },

  {
    id: "viral-burnout-mulheres",
    kind: "prompt",
    name: "Burnout em Mulheres Multitarefas",
    description:
      "Post editorial intimista de mulher exausta no laptop à noite — conteúdo de alto engajamento para nichos de saúde mental, liderança feminina e bem-estar.",
    category: "Viral",
    tags: ["burnout", "saúde mental", "mulheres", "editorial", "viral"],
    baseImageUrl: R2("viral_burnout_mulheres.webp"),
    aiPrompt:
      "Intimate editorial post, exhausted woman at desk late at night, warm yellow desk lamp, dark cozy home office, laptop open, glasses in hand, serif typography 'Burnout em mulheres multitarefas', frosted glass text box overlay, moody cinematic lighting, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 88, contrast: 115, saturation: 90 },
  },

  {
    id: "viral-grande-mentira-thumbnail",
    kind: "prompt",
    name: "A Grande Mentira — Thumbnail YouTube",
    description:
      "Thumbnail de YouTube de alta conversão com modelo feminina em fundo escuro e tipografia laranja bold — estilo de autoridade para nicho de negócios, finanças e desenvolvimento pessoal.",
    category: "Viral",
    tags: [
      "thumbnail",
      "youtube",
      "mentira",
      "autoridade",
      "laranja",
      "negócios",
    ],
    baseImageUrl: R2("viral_grande_mentira_thumbnail.webp"),
    aiPrompt:
      "High-CTR YouTube thumbnail, confident blonde woman in dark blazer, serious expression, dark moody office background, bold orange uppercase typography 'A GRANDE MENTIRA', bold white typography 'QUE CAÍMOS', dramatic cinematic lighting, ultra sharp, 16:9, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 96, contrast: 115, saturation: 105 },
  },

  {
    id: "viral-ler-mais-livros-thumbnail",
    kind: "prompt",
    name: "Como Ler Mais Livros — Thumbnail",
    description:
      "Thumbnail YouTube estilo educativo com modelo apontando para texto, fundo de biblioteca e layout com avatar de criador — alto CTR para nichos de produtividade e educação.",
    category: "Viral",
    tags: [
      "thumbnail",
      "youtube",
      "livros",
      "leitura",
      "educação",
      "produtividade",
    ],
    baseImageUrl: R2("viral_ler_mais_livros_thumbnail.webp"),
    aiPrompt:
      "YouTube educational thumbnail, smiling Black woman with curly hair in navy blazer pointing at white card with bold black text 'COMO LER MAIS LIVROS', yellow highlight on key phrase, library bokeh background, creator avatar badge top left, clean professional layout, ultra sharp, 16:9, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 108, saturation: 112 },
  },

  {
    id: "viral-isso-mudou-minha-vida",
    kind: "prompt",
    name: "Isso Mudou Minha Vida — Thumbnail",
    description:
      "Thumbnail de YouTube com modelo ruiva em close, tipografia bold verde e branca e storytelling de transformação — estilo de alta conversão para nichos lifestyle e autodesenvolvimento.",
    category: "Viral",
    tags: [
      "thumbnail",
      "youtube",
      "transformação",
      "lifestyle",
      "autodesenvolvimento",
    ],
    baseImageUrl: R2("viral_isso_mudou_minha_vida.webp"),
    aiPrompt:
      "High-CTR YouTube thumbnail, close-up thoughtful redhead woman with long auburn hair in beige sweater, neutral warm bedroom background, large bold white typography 'ISSO' and 'MINHA VIDA', elegant mint green serif 'MUDOU', small handwritten annotations 'insegura' and 'confiante' with arrows, ultra sharp, 16:9, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 105, saturation: 108 },
  },

  {
    id: "viral-hustle-cultura-thumbnail",
    kind: "prompt",
    name: "O Que É Hustle Cultura? — Thumbnail",
    description:
      "Thumbnail YouTube dark com homem encapuzado em cenário urbano noturno e tipografia dourada — alto impacto para nichos de empreendedorismo, mentalidade e negócios.",
    category: "Viral",
    tags: [
      "thumbnail",
      "youtube",
      "hustle",
      "empreendedorismo",
      "mentalidade",
      "dark",
    ],
    baseImageUrl: R2("viral_hustle_cultura_thumbnail.webp"),
    aiPrompt:
      "Dark cinematic YouTube thumbnail, serious athletic man in black hoodie seated on wet city street at night, neon bokeh city lights background, bold gold distressed typography 'HUSTLE', white brush stroke with bold black text 'CULTURA?', small serif 'O que é' top left, dramatic low-key lighting, ultra sharp, 16:9, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 88, contrast: 120, saturation: 95 },
  },

  {
    id: "viral-aprenda-focar-thumbnail",
    kind: "prompt",
    name: "Aprenda a Focar — Thumbnail Aula",
    description:
      "Thumbnail educativo clean com modelo profissional feminina em fundo grid e tipografia amarela bold — ideal para aulas, cursos e conteúdo de produtividade.",
    category: "Viral",
    tags: ["thumbnail", "youtube", "foco", "produtividade", "aula", "educação"],
    baseImageUrl: R2("viral_aprenda_focar_thumbnail.webp"),
    aiPrompt:
      "Clean educational YouTube thumbnail, professional woman with glasses in navy blazer, serious focused expression, white grid graph paper background, bold black sans-serif typography 'Aprenda a', large black bold 'FOCAR.' on vibrant yellow highlight, small 'aula #5' label top left, ultra sharp, 16:9, 8k",
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 112, saturation: 100 },
  },

  {
    id: "branding-pena-ninguem-parou",
    kind: "prompt",
    name: "Pena que Ninguém Parou pra Ler",
    description:
      "Post de marketing bold com tipografia laranja massiva e modelo feminina — estilo de alto scroll-stop para criadores que vendem atenção e conteúdo de copywriting.",
    category: "Branding",
    tags: [
      "branding",
      "copywriting",
      "marketing",
      "laranja",
      "atenção",
      "viral",
    ],
    baseImageUrl: R2("branding_pena_ninguem_parou.webp"),
    aiPrompt:
      "High-impact marketing social media post, serious brunette woman in black top, large bold orange typography 'Pena que ninguém', strip of green-tinted repeated portrait photos as divider, small green badge 'O CONTEÚDO é BOM.', bold white text 'parou (pra) ler.', editorial magazine-inspired layout, ultra sharp, 4:5, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 115, saturation: 110 },
  },

  {
    id: "viral-querida-autoexigencia",
    kind: "prompt",
    name: "Querida Autoexigência",
    description:
      "Post editorial com polaroid de mulher em campo aberto e fundo creme — estética de alto engajamento para nichos de autoconhecimento, psicologia e bem-estar feminino.",
    category: "Viral",
    tags: ["autoexigência", "bem-estar", "editorial", "psicologia", "feminino"],
    baseImageUrl: R2("viral_querida_autoexigencia.webp"),
    aiPrompt:
      "Elegant editorial Instagram post, cream off-white background, polaroid-style framed photo of joyful woman in olive green dress in golden hour field with arms open wide, clean serif typography 'Querida autoexigência' with orange highlight on 'auto', subtitle 'Meu papo hoje é com você...', minimal wellness brand aesthetic, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 105, saturation: 108 },
  },
  // ══════════════════════════════════════
  //  COPA DO MUNDO
  // ══════════════════════════════════════
  /*
  {
    id: "copa-torcedor-brasil-pulando",
    kind: "prompt",
    name: "Vai Brasil!",
    description:
      "homem no meio de uma 'ola' na arquibancada, pulando de alegria, atmosfera vibrante e colorida, fotografia de ação esportiva, alta velocidade de obturado, torcida do Brasil.",
    category: "Copa2026",
    tags: ["copa", "brasil", "torcedor", "arquibancada", "futebol"],
    baseImageUrl: R2("copa-torcedor-brasil-pulando.jpeg"),
    aiPrompt:
      "Vibrant World Cup Instagram post, ecstatic young Brazilian male fan mid-jump in packed stadium bleachers, wearing iconic yellow Brazil number 10 jersey and denim shorts, arms raised in celebration, sea of yellow-and-green-clad fans waving Brazilian flags in the background, golden hour stadium lighting, dynamic motion, ultra sharp, hyper realistic, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 105, contrast: 115, saturation: 130 },
  },
  {
    id: "copa-selfie-grupo-portugal",
    kind: "prompt",
    name: "Selfie no Estádio",
    description:
      "Selfie em grupo no estádio da Copa do Mundo, torcedores da seleção de Portugal, homem no centro sorrindo, torcida ao fundo desfocada (bokeh), campo verde bem iluminado ao fundo, estilo fotografia de smartphone de altíssima qualidade.",
    category: "Copa2026",
    tags: ["copa", "selfie", "torcedores", "estádio", "amizade"],
    baseImageUrl: R2("copa-selfie-grupo-portugal.jpeg"),
    aiPrompt:
      "Joyful Instagram post of group of Portuguese fans taking a selfie in stadium bleachers during FIFA World Cup match, wearing red and green Portugal jerseys with flags draped over shoulders, smiling and cheering, football pitch and packed crowd visible in background, bright daylight, scarves and small flags waving, ultra sharp, hyper realistic, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 103, contrast: 110, saturation: 118 },
  },
  {
    id: "copa-torcedora-confete",
    kind: "prompt",
    name: "Festa da Vitória",
    description:
      "Alegria na Arquibancada: Mulher na arquibancada de um megaestádio lotado, vestindo camisa da seleção do Estados Unidos, vibrando intensamente com os braços pro ar, chuva de papel picado, iluminação noturna de estádio, hiper-realista.",
    category: "Copa2026",
    tags: ["copa", "comemoração", "confete", "vitória", "estádio"],
    baseImageUrl: R2("copa-torcedora-confete.jpeg"),
    aiPrompt:
      "Epic World Cup Instagram post, joyful female fan in stadium bleachers at night with arms raised high in celebration, wearing red-and-blue national team jersey with flag-pattern headband and face paint, red white and blue confetti and stars falling from above, bright stadium floodlights, ecstatic crowd waving flags behind, cinematic depth of field, ultra sharp, hyper realistic, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 120, saturation: 122 },
  },
  {
    id: "copa-figurinha-vintage-1970",
    kind: "prompt",
    name: "Figurinha Vintage 1970",
    description:
      "Template de figurinha vintage da Copa do Mundo de 1970, homem segurando uma bola de futebol clássica de couro. Textura de papel levemente envelhecido, cores retrô, estilo fotografia analógica.",
    category: "Copa2026",
    tags: ["copa", "figurinha", "vintage", "1970", "colecionável"],
    baseImageUrl: R2("copa-figurinha-vintage-1970.jpeg"),
    aiPrompt:
      "Vintage 1970 World Cup sticker album card layout, aged cream paper with worn folds and stains, green header banner reading 'COPA DO MUNDO DE 1970' in bold white serif type, 'BRASIL — FIGURINHA NÚMERO 110' subtitle, framed photo on the right of smiling Brazilian football player in classic yellow jersey and blue shorts holding a worn leather ball at the center of a sunlit pitch with 'MEXICO 70' and 'COPA DO MUNDO' banners behind him, CBF crest and FIFA classic logo, retro green script signature, nostalgic editorial design, ultra sharp, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 100, contrast: 108, saturation: 95 },
  },
  {
    id: "copa-card-fifa-2026",
    kind: "prompt",
    name: "Card FIFA 2026",
    description:
      "Template de figurinha oficial da Copa do Mundo, retrato em close-up de homem, sorrindo. Fundo com grafismos dinâmicos com as cores de Brasil, estilo card colecionável brilhante, iluminação de estúdio profissional, 8k.",
    category: "Copa2026",
    tags: ["copa", "fifa", "card", "2026", "jogador"],
    baseImageUrl: R2("copa-card-fifa-2026.jpeg"),
    aiPrompt:
      "Premium FIFA World Cup 2026 player trading card, vertical layout with ornate holographic golden frame and decorative scrollwork, 'FIFA WORLD CUP 2026' banner header, large 'BRASIL' title in glowing green-yellow chrome typography, centered portrait of smiling Brazilian midfielder in 2026 yellow national team jersey with CBF crest, vibrant blue-green ray-light background with stylized World Cup trophy silhouette, player name 'GABRIEL SILVA' below with 'MIDFIELDER | #8' and 'BRASIL NATIONAL TEAM', card number in bottom corner, ultra sharp, hyper realistic, 8k",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "mascote-eua",
    kind: "prompt",
    name: "Mascote da Copa do EUA",
    description: "Águia mascote do EUA com bola dominada no meio campo.",
    category: "Copa2026",
    tags: ["copa", "mascote", "fifa", "2026"],
    baseImageUrl: R2("aguia-eua.png"),
    aiPrompt:
      "Clutch, an animated, athletic, and stylish mascot, is a fierce yet friendly anthropomorphic bald eagle representing the USA. Clutch wears the American national soccer team jersey and skillfully dribbles a ball under the bright stadium lights during a World Cup match. Dynamic action pose, determined gaze, American flags waving in the blurred crowd in the background, electrifying sports photography style, 3D rendering, Unreal Engine 5 rendering quality.",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "mascote-mexico",
    kind: "prompt",
    name: "Mascote da Copa do México",
    description: "Mascote tigre do méxico comemorando um gol na copa do mundo.",
    category: "Copa2026",
    tags: ["copa", "mascote", "fifa", "2026", "mexico"],
    baseImageUrl: R2("mascote_mexico.png"),
    aiPrompt:
      "An animated, friendly, and charismatic mascot named Zavu, representing Mexico. Zavu is a cheerful anthropomorphic character, wearing the green jersey of the Mexican national football team and a traditional Mexican sombrero. He celebrates a goal, with his arms raised in a sign of victory, on a World Cup football field. Green, white, and red confetti and smoke fill the air, stadium lights shine, creating a vibrant and festive atmosphere, 3D animated film style, and detailed textures.",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "mascote-canada",
    kind: "prompt",
    name: "Mascote da Copa do Canadá",
    description:
      "Mascote Alce do Canadá defendendo um penâlti na copa do mundo.",
    category: "Copa2026",
    tags: ["copa", "mascote", "fifa", "2026", "canada"],
    baseImageUrl: R2("alce.jpeg"),
    aiPrompt:
      "An animated, cute, and energetic mascot named Maple, an anthropomorphic character representing a Canadian moose. The mascot wears the red and white jersey of the Canadian national soccer team and enthusiastically plays goalkeeper on a vibrant World Cup soccer field. Cheerful expression, dynamic pose, with a soccer ball in hand. Stadium setting filled with enthusiastic fans and Canadian flags, cinematic lighting, Pixar 3D style, high level of detail, 8K",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "mascote-canarinho-brasil",
    kind: "prompt",
    name: "Mascote canarinho do Brasil",
    description: "Mascote Canarinho brasileiro com a taça de copa do mundo.",
    category: "Copa2026",
    tags: ["copa", "mascote", "fifa", "2026", "brasil"],
    baseImageUrl: R2("canarinho_brasil.png"),
    aiPrompt:
      "A fierce and determined anthropomorphic yellow canary mascot, known as Canarinho Pistola, representing the Brazil national football team. The mascot has an angry, intense facial expression, fluffy yellow feathers, and is wearing the iconic yellow Brazil soccer jersey with the number 10, blue shorts, and white socks with green stripes. He is standing confidently on a vibrant green soccer pitch inside a packed World Cup stadium, flexing one muscular arm and holding the golden World Cup trophy under the other wing, with a soccer ball nearby. The background shows a blurry, enthusiastic crowd waving Brazilian flags, green and yellow confetti falling, and bright stadium lights shining. Cinematic lighting, highly detailed 3D Pixar animation style, 8k resolution",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "figurinha-brasil",
    kind: "prompt",
    name: "Figurinha do Brasil",
    description: "Figurinha do Brasil albúm copa do mundo",
    category: "Copa2026",
    tags: ["copa", "album", "figurinhas", "fifa", "2026", "brasil"],
    baseImageUrl: R2("figurinha-brasil.jpeg"),
    aiPrompt: "",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "figurinha-espanha",
    kind: "prompt",
    name: "Figurinha da Espanha",
    description: "Figurinha da Espanha albúm copa do mundo",
    category: "Copa2026",
    tags: ["copa", "album", "figurinhas", "fifa", "2026", "espanha"],
    baseImageUrl: R2("figurinha-espanha.jpeg"),
    aiPrompt:
      "A holographic collectible football sticker card held between fingers, featuring a 3D chibi-style cartoon character of a young Spanish man with warm tan skin, short straight dark hair, playful smile, wearing the red Spain national team jersey number 10 with the RFEF badge on the chest, Disney Pixar art style. Top left corner shows 'ESP' text and Spanish flag icon. Top right corner shows 'AI FOOTBALL' badge. Background is holographic foil with deep red and golden yellow patterns, bull silhouette motif, circuit lines and content creator icons. At the bottom, a shiny gold ribbon banner with bold text '[TRENDYUU]'. Glossy prismatic rainbow shimmer effect. Physical card photography, shallow depth of field, studio lighting, ultra-detailed. --ar ",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "figurinha-eua",
    kind: "prompt",
    name: "Figurinha do EUA",
    description: "Figurinha da EUA albúm copa do mundo",
    category: "Copa2026",
    tags: ["copa", "album", "figurinhas", "fifa", "2026", "eua"],
    baseImageUrl: R2("figurinha-eua.jpeg"),
    aiPrompt:
      "A holographic collectible football sticker card held between fingers, featuring a 3D chibi-style cartoon character of a young American man with light skin, freckles, blond short hair, confident smirk, wearing the white USA national team jersey number 10 with the US Soccer Federation badge on the chest, Disney Pixar art style. Top left corner shows 'USA' text and American flag icon. Top right corner shows 'AI FOOTBALL' badge. Background is holographic foil with red, white and blue geometric patterns, stars, circuit lines and content creator icons (play buttons, waveforms). At the bottom, a shiny gold ribbon banner with bold text '[TRENDYUU]'. Glossy prismatic rainbow shimmer effect. Physical card photography, shallow depth of field, studio lighting, ultra-detailed. --ar 3:4",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "figurinha-franca", 
    kind: "prompt", 
    name: "Figurinha do Franca", 
    description: "Figurinha da França albúm copa do mundo", 
    category: "Copa2026", 
    tags: ["copa", "album", "figurinhas", "fifa", "2026", "franca"],
    baseImageUrl: R2("figurinha-franca.jpeg"), 
    aiPrompt: "A holographic collectible football sticker card held between fingers, featuring a 3D chibi-style cartoon character of a young French man with dark brown skin, short tight coiled black hair, sharp elegant features, big confident smile, wearing the dark blue France national team jersey number 10 with the FFF rooster badge on the chest, Disney Pixar art style. Top left corner shows "FRA" text and French flag icon. Top right corner shows "AI FOOTBALL" badge. Background is holographic foil with deep blue, white and red tricolor patterns, Eiffel Tower silhouette motif, circuit lines and content creator icons. At the bottom, a shiny gold ribbon banner with bold text "[TRENDYUU]". Glossy prismatic rainbow shimmer effect. Physical card photography, shallow depth of field, studio lighting, ultra-detailed. --ar 3:4", 
    aspectRatio: "4:5", 
    width: 1080, 
    height: 1350, 
    layers: [], 
    creator: TRENDYUU, 
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "figurinha-mexico",
    kind: "prompt",
    name: "Figurinha do México",
    description: "Figurinha do México albúm copa do mundo",
    category: "Copa2026",
    tags: ["copa", "album", "figurinhas", "fifa", "2026", "mexico"],
    baseImageUrl: R2("figurinha-mexico.jpeg"),
    aiPrompt:
      "A holographic collectible football sticker card held between fingers, featuring a 3D chibi-style cartoon character of a young Mexican man with medium brown skin, short straight black hair, wide enthusiastic smile, wearing the dark green Mexico national team jersey number 10 with the FMF eagle badge on the chest, Disney Pixar art style. Top left corner shows 'MEX' text and Mexican flag icon. Top right corner shows 'AI FOOTBALL' badge. Background is holographic foil with green, white and red patterns, Aztec sun stone motif, circuit lines and content creator icons. At the bottom, a shiny gold ribbon banner with bold text '[TRENDYUU]'. Glossy prismatic rainbow shimmer effect. Physical card photography, shallow depth of field, studio lighting, ultra-detailed.",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "figurinha-argentina",
    kind: "prompt",
    name: "Figurinha da Argentina",
    description: "Figurinha da Argentina albúm copa do mundo",
    category: "Copa2026",
    tags: ["copa", "album", "figurinhas", "fifa", "2026", "argentina"],
    baseImageUrl: R2("figurinha-argentina.png"),
    aiPrompt:
      "A holographic collectible football sticker card held between fingers, featuring a 3D chibi-style cartoon character of a young Argentine man with light olive skin, short messy dark brown hair, intense determined eyes, wearing the light blue and white striped Argentina national team jersey number 10 with the AFA badge on the chest, Disney Pixar art style. Top left corner shows 'ARG' text and Argentina flag icon. Top right corner shows 'AI FOOTBALL' badge. Background is holographic foil with sky blue and white diagonal stripes, sun of May motif, circuit lines and content creator icons. At the bottom, a shiny gold ribbon banner with bold text '[TRENDYUU]'. Glossy prismatic rainbow shimmer effect. Physical card photography, shallow depth of field, studio lighting, ultra-detailed.",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "churrasco-copa",
    kind: "prompt",
    name: "Churrasco em familia na Copa",
    description: "Churrasco em familia assistindo jogo da seleção na copa",
    category: "Copa2026",
    tags: ["copa", "churrasco", "familia"],
    baseImageUrl: R2("churrasco-copa.png"),
    aiPrompt:
      "Churrasco de Copa do Mundo, [GÊNERO/PESSOA] vestindo camisa da seleção com um espetinho na mão e sorrindo, TV passando o jogo ao fundo, dia ensolarado, clima familiar, cores tropicais.",
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  {
    id: "penalti-decisivo",
    kind: "prompt",
    name: "Pênalti decisivo",
    description: "Penalti decisivo em uma final de Copa do mundo.",
    category: "Copa2026",
    tags: ["copa", "penalti", "fifa", "alemanha"],
    baseImageUrl: R2("penalti-alemanha.png"),
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    layers: [],
    creator: TRENDYUU,
    settings: { ...DEF, brightness: 102, contrast: 115, saturation: 125 },
  },
  */
];

// ─── Categorias ───────────────────────────────────────────────────────────────
export const TEMPLATE_CATEGORIES = [
  "Todos",
  "Produto",
  "Arte",
  "Magazine",
  "Branding",
  "Desenho",
  "Anime",
  "Poster",
  "Fantasia",
  "Transformar",
  "Viral",
  "Game",
  /*"Copa2026",*/
  "UserPublic",
] as const;
