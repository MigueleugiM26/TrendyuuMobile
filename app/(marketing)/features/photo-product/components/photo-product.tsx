"use client";

import Footer from "@/src/components/main_page/footer";
import Navbar from "@/src/components/main_page/Navbar";
import { AI_IMAGE_MODELS, getAIImageModelLogo } from "@/src/types/aiModels";
import { UserPlan } from "@/src/types/user";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Check,
  Coffee,
  Gem,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Routes ───────────────────────────────────────────────────────────────
const PRODUCT_STUDIO_ROUTE = "/ai-tools/smart-image-generator";
const PRODUCT_VIDEO_ROUTE = "/features/product-video";
const PRICING_ROUTE = "/pricing";

// ─── Featured model IDs ───────────────────────────────────────────────────
const FEATURED_IMAGE_MODEL_IDS = [
  "seedream-4.5",
  "flux-pro",
  "gpt-2.0",
  "gemini-3-pro",
];

// ─── Hero ─────────────────────────────────────────────────────────────────
const HERO_IMAGE_SRC = "/photo_product_thumb.png";

// ─── How-to steps ─────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    number: "01",
    title: "Escolha os presets da cena",
    description:
      "Selecione estilo, fundo, iluminação, clima e ângulo. Use presets prontos ou crie combinações salvas para a sua marca.",
    image: "/how_to_use/photo_product_1.png",
    imageAlt:
      "Passo 1: seleção de presets de estilo, fundo, iluminação e ângulo no Estúdio de Produto da TrendYuu",
  },
  {
    number: "02",
    title: "Ajuste as configurações",
    description:
      "Escolha o modelo de IA (Seedream 4.5, FLUX Pro, GPT Image ou Gemini), o formato da imagem (1:1, 9:16, 16:9) e a quantidade de fotos a gerar.",
    image: "/how_to_use/photo_product_2.png",
    imageAlt:
      "Passo 2: seleção do modelo de IA, formato e quantidade de fotos no Estúdio de Produto",
  },
  {
    number: "03",
    title: "Envie o produto e gere",
    description:
      "Faça upload da foto do produto (opcional) e clique em gerar. A IA monta a cena com os presets escolhidos em poucos segundos.",
    image: "/how_to_use/photo_product_3.png",
    imageAlt:
      "Passo 3: upload da foto do produto e geração da imagem no Estúdio de Produto da TrendYuu",
  },
] as const;

// ─── Gallery ──────────────────────────────────────────────────────────────
interface GalleryItem {
  id: string;
  image: string;
  alt: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "tenis",
    image: "/imagens_foto_produto/imagem_1.png",
    alt: "Foto de tênis esportivo com fundo branco gerada no Estúdio de Produto da TrendYuu",
  },
  {
    id: "cosmetico",
    image: "/imagens_foto_produto/imagem_2.png",
    alt: "Foto de sérum facial com fundo de mármore gerada no Estúdio de Produto da TrendYuu",
  },
  {
    id: "relogio",
    image: "/imagens_foto_produto/imagem_3.png",
    alt: "Foto de relógio de couro com fundo escuro e iluminação dramática gerada por IA",
  },
  {
    id: "joia",
    image: "/imagens_foto_produto/imagem_4.png",
    alt: "Foto de colar dourado com fundo de veludo gerada no Estúdio de Produto",
  },
  {
    id: "eletronico",
    image: "/imagens_foto_produto/imagem_5.png",
    alt: "Foto de fone de ouvido com fundo gradiente e iluminação neon gerada por IA",
  },
];

// ─── Audiences ────────────────────────────────────────────────────────────
const AUDIENCES = [
  {
    title: "Vendedores de e-commerce",
    description:
      "Geram fotos de produto sem estúdio físico ou equipe de produção.",
    image: "/ecomerce_photo_product.jpg",
  },
  {
    title: "Profissionais de performance",
    description: "Produzem variações de criativos em escala para testes A/B.",
    image: "/variation_photo_product.png",
  },
  {
    title: "Agências",
    description:
      "Entregam fotos de produto para clientes mais rápido, sem expandir o time.",
    image: "/agency_photo_product.png",
  },
];

// ─── Presets ──────────────────────────────────────────────────────────────
const STYLE_PRESETS = [
  {
    emoji: "🛍️",
    label: "E-commerce",
    description: "Foto limpa do produto para lojas online",
  },
  {
    emoji: "☕",
    label: "Estilo de Vida",
    description: "Produto em ambiente real",
  },
  {
    emoji: "💎",
    label: "Luxo",
    description: "Estética premium escura para marcas de alto padrão",
  },
  {
    emoji: "🌿",
    label: "Ao Ar Livre",
    description: "Ambiente natural com elementos orgânicos",
  },
  {
    emoji: "📐",
    label: "Flat Lay",
    description: "Composição de cima para baixo",
  },
  {
    emoji: "🎄",
    label: "Sazonal",
    description: "Cena temática festiva de feriados",
  },
  {
    emoji: "📰",
    label: "Editorial",
    description: "Composição artística digna de revista",
  },
  {
    emoji: "📱",
    label: "Redes Sociais",
    description: "Conteúdo chamativo para Instagram e TikTok",
  },
  {
    emoji: "◻️",
    label: "Minimalista",
    description: "Composição com espaço negativo ultra-limpo",
  },
  {
    emoji: "📷",
    label: "Retro / Vintage",
    description: "Estética nostálgica da era do filme",
  },
  {
    emoji: "🌑",
    label: "Escuro e Sombrio",
    description: "Sombras cinematográficas e contraste rico",
  },
  {
    emoji: "🌊",
    label: "Vibes de Verão",
    description: "Cena brilhante, fresca, inspirada na praia",
  },
  {
    emoji: "🥃",
    label: "Poster",
    description: "Composição otimizada para pôsteres e banners",
  },
];

const BACKGROUND_PRESETS = [
  { emoji: "⬜", label: "Branco" },
  { emoji: "🩶", label: "Cinza Claro" },
  { emoji: "🖤", label: "Mármore Escuro" },
  { emoji: "🪵", label: "Madeira" },
  { emoji: "🧱", label: "Concreto" },
  { emoji: "🌈", label: "Gradiente" },
  { emoji: "🌱", label: "Natureza" },
  { emoji: "🧵", label: "Tecido" },
  { emoji: "🏴", label: "Mármore Preto" },
  { emoji: "🏖️", label: "Areia" },
  { emoji: "🌿", label: "Musgo e Botânicos" },
  { emoji: "🟤", label: "Terrazzo" },
  { emoji: "🪞", label: "Espelho / Vidro" },
  { emoji: "🌆", label: "Cidade Neon" },
  { emoji: "🩷", label: "Rosa Pastel" },
  { emoji: "🌑", label: "Preto Profundo" },
  { emoji: "🍳", label: "Cozinha Rústica" },
  { emoji: "🧊", label: "Gelo e Geada" },
  { emoji: "🎀", label: "Veludo" },
  { emoji: "☀️", label: "Mesa Ao Ar Livre" },
];

const LIGHTING_PRESETS = [
  { emoji: "💡", label: "Estúdio" },
  { emoji: "☀️", label: "Natural" },
  { emoji: "🎭", label: "Dramático" },
  { emoji: "🔆", label: "Soft Box" },
  { emoji: "✨", label: "Retroiluminado" },
  { emoji: "🌙", label: "Brilho Neon" },
  { emoji: "🌅", label: "Hora Dourada" },
  { emoji: "🕯️", label: "Luz de Vela" },
  { emoji: "☁️", label: "Nublado" },
  { emoji: "🔦", label: "Spotlight" },
  { emoji: "⚡", label: "Luz Dividida" },
  { emoji: "🌟", label: "Luz de Contorno" },
  { emoji: "🪟", label: "Luz de Janela" },
  { emoji: "🌊", label: "Subaquático" },
];

const MOOD_PRESETS = [
  { emoji: "🪞", label: "Limpo" },
  { emoji: "🏠", label: "Aconchegante" },
  { emoji: "👑", label: "Premium" },
  { emoji: "🎨", label: "Brincalhão" },
  { emoji: "🌸", label: "Elegante" },
  { emoji: "🔩", label: "Cru" },
  { emoji: "🌹", label: "Romântico" },
  { emoji: "⚡", label: "Energético" },
  { emoji: "🌫️", label: "Misterioso" },
  { emoji: "🍃", label: "Fresco" },
  { emoji: "🔥", label: "Ousado" },
  { emoji: "🎞️", label: "Nostálgico" },
  { emoji: "🧘", label: "Zen" },
  { emoji: "🤖", label: "Futurista" },
  { emoji: "🧊", label: "Editorial Cool" },
  { emoji: "🔴", label: "Lua Sangrenta" },
];

const CAMERA_PRESETS = [
  { emoji: "➖", label: "Padrão" },
  { emoji: "👁️", label: "Na Altura dos Olhos" },
  { emoji: "🔽", label: "Ângulo Alto" },
  { emoji: "🔼", label: "Ângulo Baixo" },
  { emoji: "🕊️", label: "Vista Superior" },
  { emoji: "🔍", label: "Close-up" },
  { emoji: "🖼️", label: "Plano Aberto" },
  { emoji: "📐", label: "Inclinação Holandesa" },
  { emoji: "🔬", label: "Macro" },
];

// ─── Product types ────────────────────────────────────────────────────────
const PRODUCT_TYPES = [
  {
    Icon: Shirt,
    title: "Roupas e calçados",
    description:
      "Fotos de produto com fundo branco para catálogo, flat lay para redes sociais e cenas de lifestyle com modelo usando a peça.",
    example: "Ex: tênis, camiseta, vestido, bolsa",
  },
  {
    Icon: Sparkles,
    title: "Cosméticos e beleza",
    description:
      "Fotos de frascos, potes e kits com iluminação editorial, fundos de mármore e cenas premium — perfeitas para anúncios e Stories.",
    example: "Ex: sérum, batom, perfume, creme",
  },
  {
    Icon: Gem,
    title: "Joias e acessórios",
    description:
      "Fotos macro com fundos de veludo, iluminação dramática e close-up que destacam brilho, textura e detalhes das peças.",
    example: "Ex: colar, anel, relógio, óculos",
  },
  {
    Icon: Smartphone,
    title: "Eletrônicos e tecnologia",
    description:
      "Fotos com fundos de gradiente, neon e cenas de uso para fones, caixas de som, acessórios de celular e gadgets.",
    example: "Ex: fone, smartwatch, carregador",
  },
  {
    Icon: Coffee,
    title: "Alimentos e bebidas",
    description:
      "Fotos de potes, garrafas e embalagens com fundos rústicos, madeira, mesa ao ar livre e iluminação natural aconchegante.",
    example: "Ex: café, geleia, vinho, chocolate",
  },
];

// ─── Marketplace specs ────────────────────────────────────────────────────
const MARKETPLACE_SPECS = [
  {
    name: "Mercado Livre",
    size: "1200 × 1200 px (mín. 500 × 500)",
    background: "Fundo branco puro obrigatório",
    format: "1:1",
    notes: "Produto 70–90% do quadro. Sem textos.",
  },
  {
    name: "Shopee",
    size: "1000 × 1000 px (mín. 500 × 500)",
    background: "Fundo branco ou claro neutro",
    format: "1:1",
    notes: "Produto centralizado.",
  },
  {
    name: "Amazon",
    size: "1600 × 1600 px (mín. 1000 px)",
    background: "Fundo branco puro (RGB 255,255,255)",
    format: "1:1",
    notes: "Produto ocupando ao menos 85%.",
  },
  {
    name: "Magalu",
    size: "1000 × 1000 px (mín. 500 × 500)",
    background: "Fundo branco",
    format: "1:1",
    notes: "Produto visível por inteiro.",
  },
];

// ─── Photoroom comparison ──────────────────────────────────────────────────
const PHOTOROOM_HIGHLIGHTS = [
  [
    "Mais que trocar o fundo",
    "Não só substitui o fundo: cria uma cena completa com estilo, luz, clima e ângulo escolhidos por você.",
  ],
  [
    "Fundo branco pronto para marketplace",
    "Gere fotos no padrão de Mercado Livre, Shopee, Amazon e Magalu com um clique, no formato quadrado 1:1.",
  ],
  [
    "Em português e em reais",
    "Interface, suporte e cobrança em português (R$). Sem conversão de dólar nem barreira de idioma.",
  ],
];

const COMPARISON_ROWS = [
  ["Estilos de foto", "12+ estilos prontos", "Templates por categoria"],
  [
    "Fundos",
    "21 fundos (branco, mármore, madeira, veludo...)",
    "Biblioteca de fundos",
  ],
  ["Iluminação", "14 tipos configuráveis", "Presets por template"],
  [
    "Ângulo de câmera",
    "9 ângulos (macro, vista superior, close-up...)",
    "Limitado ao template",
  ],
  ["Modo Lote", "Sim — múltiplas fotos de uma vez", "Plano pago"],
  [
    "Modelos de IA",
    "Seedream 4.5, FLUX Pro, GPT Image, Gemini",
    "Modelo proprietário",
  ],
  ["Idioma", "Português (pt-BR)", "Inglês (com tradução parcial)"],
  ["Cobrança", "Em reais (R$)", "Em dólar (US$) — sujeito a IOF"],
  ["Marca d'água", "Não", "Não (planos pagos)"],
];

// ─── Related tools ────────────────────────────────────────────────────────
const RELATED_TOOLS = [
  {
    href: "/features/image-generation",
    label: "Gerador de Imagens com IA",
    desc: "Crie imagens a partir de texto",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/image_background_page.webp",
  },
  {
    href: "/features/video-generation",
    label: "Gerador de Vídeos com IA",
    desc: "Crie vídeos a partir de texto ou imagem",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/video_generation.webp",
  },
  {
    href: "/features/variations",
    label: "Gerador de Variações com IA",
    desc: "Gere variações de uma imagem existente",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/variations_image.webp",
  },
  {
    href: "/features/product-video",
    label: "Vídeo de Produto com IA",
    desc: "Vídeos de produto com presets, sem prompt",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/product_video.webp",
  },
];

// ─── FAQs ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Quanto custa o Estúdio de Produto com IA?",
    a: "O plano Essential começa em R$ 80,90/mês com 28.000 créditos. O plano Creator custa R$ 199,90/mês com 87.500 créditos. O plano Agency custa R$ 599,90/mês com 280.000 créditos e alta volumetria em 4K. Cada imagem gerada consome créditos conforme o modelo e a configuração escolhidos — por exemplo, 520 créditos por imagem com Seedream 4.5.",
  },
  {
    q: "Preciso colocar cartão de crédito para usar?",
    a: "Sim. O acesso ao Estúdio de Produto requer a assinatura de um plano. Você pode explorar os modelos e preços livremente antes de assinar, e o cadastro leva menos de 30 segundos.",
  },
  {
    q: "Preciso saber escrever prompts?",
    a: "Não. Essa é uma das principais vantagens do Estúdio de Produto. Em vez de escrever prompts, você escolhe presets prontos de estilo, fundo, iluminação, clima e ângulo. A IA monta a foto de produto automaticamente com base nas suas escolhas.",
  },
  {
    q: "Como gerar foto com fundo branco para Mercado Livre e Shopee?",
    a: "Escolha o estilo E-commerce e o fundo Branco. A IA gera a foto no formato quadrado 1:1, com o produto centralizado e fundo branco puro. A imagem sai pronta para subir no anúncio do Mercado Livre, Shopee, Amazon e Magalu — sem edição extra.",
  },
  {
    q: "O que é o DNA da Marca?",
    a: "É um recurso que analisa o contexto da sua marca e escolhe automaticamente o melhor estilo visual para a foto de produto — combinando estilo, fundo, iluminação, clima e ângulo sem que você precise configurar cada opção manualmente. Custa 20 créditos.",
  },
  {
    q: "Que estilos de foto eu posso escolher?",
    a: "Você pode escolher entre 12 estilos: E-commerce, Estilo de Vida, Luxo, Ao Ar Livre, Flat Lay, Sazonal, Editorial, Redes Sociais, Minimalista, Retro/Vintage, Escuro e Sombrio e Vibes de Verão.",
  },
  {
    q: "Quais fundos estão disponíveis?",
    a: "O Estúdio oferece 21 fundos: Branco, Cinza Claro, Mármore Escuro, Madeira, Concreto, Gradiente, Natureza, Tecido, Mármore Preto, Areia, Musgo e Botânicos, Terrazzo, Espelho/Vidro, Cidade Neon, Rosa Pastel, Preto Profundo, Cozinha Rústica, Gelo e Geada, Veludo e Mesa Ao Ar Livre.",
  },
  {
    q: "Quais tipos de iluminação eu posso usar?",
    a: "Você pode escolher entre 15 iluminações: Estúdio, Natural, Dramático, Soft Box, Retroiluminado, Brilho Neon, Hora Dourada, Luz de Vela, Nublado, Spotlight, Luz Dividida, Luz de Contorno, Luz de Janela e Subaquático.",
  },
  {
    q: "Quais ângulos de câmera estão disponíveis?",
    a: "O Estúdio oferece 9 ângulos: Padrão, Na Altura dos Olhos, Ângulo Alto, Ângulo Baixo, Vista Superior, Close-up, Plano Aberto, Inclinação Holandesa e Macro.",
  },
  {
    q: "Posso salvar predefinições e presets personalizados?",
    a: "Sim. Você pode salvar predefinições com combinações de estilo, fundo, iluminação, clima e ângulo que funcionam para a sua marca, e reutilizá-las em novas gerações. Também é possível criar presets personalizados dentro de cada categoria.",
  },
  {
    q: "O que é o Modo Personagem?",
    a: "O Modo Personagem inclui uma pessoa na imagem gerada — segurando, usando ou interagindo com o produto. É ideal para criativos estilo UGC, demonstrações de uso e anúncios com pessoas.",
  },
  {
    q: "O que é o Modo Pôster?",
    a: "O Modo Pôster otimiza a composição e o formato da imagem para saída em pôsteres e banners, com enquadramento e proporção adequados para esse tipo de material.",
  },
  {
    q: "O que é o Modo Lote?",
    a: "O Modo Lote permite gerar múltiplas fotos de produto de uma só vez, combinando presets diferentes ou aplicando a mesma configuração a vários produtos. Ideal para catálogos e e-commerce com muitos itens.",
  },
  {
    q: "Posso enviar uma imagem de referência do meu produto?",
    a: "Sim. A imagem de referência é opcional. Se você enviar uma foto do produto, a IA usa como base para manter a identidade visual nas imagens geradas.",
  },
  {
    q: "Qual modelo é melhor para fotos de produto?",
    a: "Para fotos de produto, Seedream 4.5 entrega excelente consistência do produto, realismo de iluminação e fidelidade ao original. FLUX Pro também é uma ótima opção para realismo premium e detalhes finos.",
  },
  {
    q: "As fotos geradas têm marca d'água?",
    a: "Não. Todas as fotos de produto geradas são entregues sem marca d'água, prontas para uso em anúncios, catálogos e redes sociais.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setOpen((v) => !v)}
      style={styles.faqItem}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{q}</Text>
        <Text style={[styles.faqToggle, open && styles.faqToggleOpen]}>+</Text>
      </View>
      {open && <Text style={styles.faqAnswer}>{a}</Text>}
    </TouchableOpacity>
  );
}

function PresetPill({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View style={styles.presetPill}>
      <Text style={styles.presetEmoji}>{emoji}</Text>
      <Text style={styles.presetLabel}>{label}</Text>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────
interface ProductStudioPageProps {
  userPlan?: UserPlan;
  userCredits?: number;
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function ProductStudioScreen({}: ProductStudioPageProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <View style={styles.root}>
      <Navbar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════ HERO ═══════════════════ */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: HERO_IMAGE_SRC }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            accessibilityLabel="Exemplos de fotos de produto criadas com o Estúdio de Produto com IA da TrendYuu"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Foto de Produto com IA para E-commerce e Anúncios
            </Text>
            <Text style={styles.heroSubtitle}>
              Transforme a foto do celular em foto de estúdio. Escolha estilo,
              fundo, iluminação, clima e ângulo — e a IA monta a imagem com
              fundo branco para Mercado Livre e Shopee, cenário editorial ou
              lifestyle. Sem marca d&apos;água.
            </Text>
            <View style={styles.heroCtas}>
              <TouchableOpacity
                style={styles.ctaPink}
                activeOpacity={0.85}
                onPress={() => router.push(PRODUCT_STUDIO_ROUTE as any)}
              >
                <Text style={styles.ctaPinkText}>Abrir o Estúdio</Text>
                <ArrowRight size={16} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ctaOutline}
                activeOpacity={0.85}
                onPress={() => router.push(PRICING_ROUTE as any)}
              >
                <Text style={styles.ctaOutlineText}>Ver planos e preços</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ═══════════════════ GALERIA ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Produtos gerados no Estúdio de Produto
            </Text>
            <Text style={styles.sectionBody}>
              Fotos de produto criadas com IA, sem estúdio físico, em poucos
              segundos. Cada imagem abaixo foi gerada a partir de uma foto comum
              de celular.
            </Text>
          </View>
          <FlatList
            data={[...GALLERY_ITEMS, ...GALLERY_ITEMS]}
            keyExtractor={(item, i) => `${item.id}-${i}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryList}
            renderItem={({ item }) => (
              <View style={styles.galleryCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                  accessibilityLabel={item.alt}
                />
              </View>
            )}
          />
        </View>

        {/* ═══════════════════ COMO FUNCIONA ═══════════════════ */}
        <View style={styles.section}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Como criar fotos de produto profissionais com IA?
            </Text>
          </View>

          {/* Step image */}
          <View style={styles.stepImageContainer}>
            <Image
              source={{ uri: HOW_STEPS[activeStep].image }}
              style={styles.stepImage}
              resizeMode="contain"
              accessibilityLabel={HOW_STEPS[activeStep].imageAlt}
            />
          </View>

          {/* Dots */}
          <View style={styles.stepDots}>
            {HOW_STEPS.map((step, i) => (
              <TouchableOpacity
                key={step.number}
                onPress={() => setActiveStep(i)}
                style={[
                  styles.dot,
                  i === activeStep ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Step list */}
          <View style={styles.px}>
            {HOW_STEPS.map((step, i) => {
              const isActive = i === activeStep;
              return (
                <TouchableOpacity
                  key={step.number}
                  onPress={() => setActiveStep(i)}
                  activeOpacity={0.8}
                  style={[styles.stepItem, isActive && styles.stepItemActive]}
                >
                  <View
                    style={[
                      styles.stepBadge,
                      isActive
                        ? styles.stepBadgeActive
                        : styles.stepBadgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepBadgeText,
                        isActive
                          ? styles.stepBadgeTextActive
                          : styles.stepBadgeTextInactive,
                      ]}
                    >
                      {step.number}
                    </Text>
                  </View>
                  <View style={styles.stepText}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isActive
                          ? styles.stepTitleActive
                          : styles.stepTitleInactive,
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text
                      style={[
                        styles.stepDesc,
                        isActive
                          ? styles.stepDescActive
                          : styles.stepDescInactive,
                      ]}
                    >
                      {step.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ═══════════════════ O QUE É ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              O que é um Estúdio de Produto com IA?
            </Text>
            <Text style={styles.bodyText}>
              Um Estúdio de Produto com IA é uma ferramenta que usa inteligência
              artificial para criar fotos de produto profissionais sem exigir
              estúdio físico, equipamento fotográfico ou equipe de produção. Em
              vez de agendar um ensaio, você escolhe presets prontos de estilo,
              fundo, iluminação, clima e ângulo, e a IA monta a imagem
              automaticamente.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 12 }]}>
              Com o Estúdio de Produto do TrendYuu, você pode criar desde fotos
              limpas para e-commerce até imagens editoriais para redes sociais,
              flat lays, cenas de lifestyle e composições de luxo.
            </Text>
            <View style={styles.cardGrid}>
              {[
                [
                  "Fotos de produto sem estúdio físico",
                  "Gere fotos profissionais de e-commerce, catálogo, lifestyle e editorial sem agendar ensaio, alugar equipamento ou contratar fotógrafo.",
                ],
                [
                  "DNA da Marca",
                  "A IA analisa o contexto da sua marca e escolhe automaticamente a melhor combinação de estilo, fundo, iluminação, clima e ângulo.",
                ],
                [
                  "Presets personalizados",
                  "Crie presets próprios dentro de cada categoria e salve predefinições com combinações que funcionam para a sua marca.",
                ],
                [
                  "Modos Personagem, Pôster e Lote",
                  "Inclua pessoas na cena, otimize a composição para pôsteres e banners, ou gere múltiplas fotos de uma só vez no Modo Lote.",
                ],
              ].map(([title, desc]) => (
                <View key={title} style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>{title}</Text>
                  <Text style={styles.infoCardDesc}>{desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════ MARKETPLACES ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Fotos de produto para Mercado Livre, Shopee e Amazon
            </Text>
            <Text style={styles.bodyText}>
              Cada marketplace tem exigências próprias de fundo, tamanho mínimo
              e formato. O Estúdio de Produto gera imagens no padrão quadrado
              1:1 com fundo branco puro, prontas para subir direto no seu
              anúncio.
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                {["Marketplace", "Tamanho", "Fundo", "Formato", "Obs."].map(
                  (h) => (
                    <Text
                      key={h}
                      style={[styles.tableCell, styles.tableHeaderCell]}
                    >
                      {h}
                    </Text>
                  ),
                )}
              </View>
              {MARKETPLACE_SPECS.map((spec, i) => (
                <View
                  key={spec.name}
                  style={[
                    styles.tableRow,
                    i < MARKETPLACE_SPECS.length - 1 && styles.tableRowBorder,
                  ]}
                >
                  <Text style={[styles.tableCell, styles.tableCellHighlight]}>
                    {spec.name}
                  </Text>
                  <Text style={styles.tableCell}>{spec.size}</Text>
                  <Text style={styles.tableCell}>{spec.background}</Text>
                  <Text style={styles.tableCell}>{spec.format}</Text>
                  <Text style={[styles.tableCell, { fontSize: 11 }]}>
                    {spec.notes}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ═══════════════════ PRESETS ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Presets de estilo, fundo, iluminação, clima e ângulo
            </Text>
            <Text style={styles.sectionBody}>
              Combine presets prontos para criar a foto de produto perfeita para
              a sua marca — sem escrever prompts.
            </Text>

            {/* Estilo */}
            <Text style={styles.presetGroupTitle}>Estilo de Foto</Text>
            {STYLE_PRESETS.map((p) => (
              <View key={p.label} style={styles.stylePresetRow}>
                <Text style={styles.presetEmoji}>{p.emoji}</Text>
                <Text style={styles.stylePresetLabel}>{p.label}</Text>
                <Text style={styles.stylePresetDesc}> — {p.description}</Text>
              </View>
            ))}

            {/* Fundos */}
            <Text style={[styles.presetGroupTitle, { marginTop: 24 }]}>
              Fundos
            </Text>
            <View style={styles.pillGrid}>
              {BACKGROUND_PRESETS.map((p) => (
                <PresetPill key={p.label} {...p} />
              ))}
            </View>

            {/* Iluminação */}
            <Text style={[styles.presetGroupTitle, { marginTop: 24 }]}>
              Iluminação
            </Text>
            <View style={styles.pillGrid}>
              {LIGHTING_PRESETS.map((p) => (
                <PresetPill key={p.label} {...p} />
              ))}
            </View>

            {/* Clima */}
            <Text style={[styles.presetGroupTitle, { marginTop: 24 }]}>
              Clima
            </Text>
            <View style={styles.pillGrid}>
              {MOOD_PRESETS.map((p) => (
                <PresetPill key={p.label} {...p} />
              ))}
            </View>

            {/* Ângulo */}
            <Text style={[styles.presetGroupTitle, { marginTop: 24 }]}>
              Ângulo da Câmera
            </Text>
            <View style={styles.pillGrid}>
              {CAMERA_PRESETS.map((p) => (
                <PresetPill key={p.label} {...p} />
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════ TIPOS DE PRODUTO ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Fotos de produto por categoria
            </Text>
            <Text style={styles.sectionBody}>
              Cada tipo de produto pede um estilo, iluminação e ângulo
              específicos. O Estúdio de Produto tem presets prontos para cada
              categoria.
            </Text>
            <View style={styles.cardGrid}>
              {PRODUCT_TYPES.map(({ Icon, title, description, example }) => (
                <View key={title} style={styles.productTypeCard}>
                  <View style={styles.productTypeIconBox}>
                    <Icon size={20} color="#71717a" />
                  </View>
                  <Text style={styles.infoCardTitle}>{title}</Text>
                  <Text style={styles.infoCardDesc}>{description}</Text>
                  <Text style={styles.productTypeExample}>{example}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════ PAINEL DE MODELOS ═══════════════════ */}
        <View style={[styles.sectionBordered]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Modelos de IA para gerar fotos de produto
            </Text>
            <Text style={styles.sectionBody}>
              Compare diferentes modelos de inteligência artificial para
              encontrar a opção mais adequada para gerar fotos de produto,
              criativos de anúncios e conteúdos visuais em escala.
            </Text>
            <View style={styles.cardGrid}>
              {FEATURED_IMAGE_MODEL_IDS.map((modelId) => {
                const model = AI_IMAGE_MODELS[modelId];
                if (!model) return null;
                const logo = getAIImageModelLogo(model.id);
                return (
                  <View key={model.id} style={styles.modelCard}>
                    <View style={styles.modelLogoBox}>
                      <Image
                        source={{ uri: logo }}
                        style={styles.modelLogo}
                        resizeMode="contain"
                        accessibilityLabel={`Logo ${model.name}`}
                      />
                    </View>
                    <Text style={styles.modelName}>{model.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ═══════════════════ BENEFÍCIOS ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Por que usar um Estúdio de Produto com IA?
            </Text>
            <View style={styles.benefitsGrid}>
              {[
                [
                  Sparkles,
                  "Dispense o estúdio",
                  "Fotos de produto com qualidade profissional, sem agendar ensaio, alugar equipamento ou pagar fotógrafo por imagem.",
                ],
                [
                  Zap,
                  "Escale seus criativos",
                  "Gere dezenas de variações visuais para testes A/B e catálogos sem precisar de um time de produção.",
                ],
                [
                  ShieldCheck,
                  "Identidade visual consistente",
                  "Use DNA da Marca e predefinições salvas para manter um estilo visual coeso em cada foto de produto.",
                ],
                [
                  Wand2,
                  "Da ideia à foto em segundos",
                  "Sem precisar entender de fotografia ou prompt engineering. Escolha presets e receba fotos utilizáveis na hora.",
                ],
              ].map(([Icon, title, desc]) => (
                <View key={title as string} style={styles.benefitItem}>
                  <View style={styles.benefitIconRow}>
                    <Icon size={20} color="#ec4899" />
                    <Text style={styles.benefitTitle}>{title as string}</Text>
                  </View>
                  <Text style={styles.benefitDesc}>{desc as string}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════ PARA QUEM É ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Para quem é o Estúdio de Produto com IA?
            </Text>
            <Text style={styles.sectionBody}>
              Do vendedor solo à agência, o Estúdio de Produto foi feito para
              quem precisa produzir fotos de produto em escala — sem estúdio,
              sem fotógrafo, sem equipe de produção.
            </Text>
          </View>
          <FlatList
            data={AUDIENCES}
            keyExtractor={(item) => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.audienceList}
            renderItem={({ item }) => (
              <View style={styles.audienceCard}>
                <Image
                  source={{ uri: item.image }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                  accessibilityLabel={`Ilustração para ${item.title}`}
                />
                <View style={styles.audienceOverlay} />
                <View style={styles.audienceContent}>
                  <Text style={styles.audienceTitle}>{item.title}</Text>
                  <Text style={styles.audienceDesc}>{item.description}</Text>
                </View>
              </View>
            )}
          />
        </View>

        {/* ═══════════════════ ALTERNATIVA AO PHOTOROOM ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Alternativa ao Photoroom para fotos de produto
            </Text>
            <Text style={styles.bodyText}>
              Se você procura uma alternativa ao Photoroom para criar fotos de
              produto com IA, o Estúdio da TrendYuu entrega o mesmo resultado —
              e vai além. Em vez de trocar só o fundo, você monta a cena
              inteira: estilo, fundo, iluminação, clima e ângulo da câmera, com
              mais de 12 estilos, 21 fundos e 14 tipos de iluminação. Tudo em
              português, com cobrança em reais e sem depender de conversão de
              dólar.
            </Text>
            <View style={styles.cardGrid}>
              {PHOTOROOM_HIGHLIGHTS.map(([title, desc]) => (
                <View key={title} style={styles.infoCard}>
                  <View style={styles.checkRow}>
                    <Check size={14} color="#ec4899" />
                    <Text style={styles.infoCardTitle}> {title}</Text>
                  </View>
                  <Text style={styles.infoCardDesc}>{desc}</Text>
                </View>
              ))}
            </View>

            {/* Comparison table */}
            <Text style={[styles.presetGroupTitle, { marginTop: 24 }]}>
              TrendYuu Estúdio vs Photoroom
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                {["Recurso", "TrendYuu Estúdio", "Photoroom"].map((h) => (
                  <Text
                    key={h}
                    style={[
                      styles.tableCell,
                      styles.tableHeaderCell,
                      { minWidth: 140 },
                    ]}
                  >
                    {h}
                  </Text>
                ))}
              </View>
              {COMPARISON_ROWS.map((row, i) => (
                <View
                  key={row[0]}
                  style={[
                    styles.tableRow,
                    i < COMPARISON_ROWS.length - 1 && styles.tableRowBorder,
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellHighlight,
                      { minWidth: 140 },
                    ]}
                  >
                    {row[0]}
                  </Text>
                  <Text style={[styles.tableCell, { minWidth: 140 }]}>
                    {row[1]}
                  </Text>
                  <Text style={[styles.tableCell, { minWidth: 140 }]}>
                    {row[2]}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.px}>
            <View style={styles.compareCtas}>
              <TouchableOpacity
                style={styles.ctaPink}
                activeOpacity={0.85}
                onPress={() => router.push(PRODUCT_STUDIO_ROUTE as any)}
              >
                <Text style={styles.ctaPinkText}>Abrir o Estúdio</Text>
                <ArrowRight size={16} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(PRICING_ROUTE as any)}
                style={styles.linkButton}
              >
                <Text style={styles.linkButtonText}>Ver planos e preços</Text>
                <ArrowRight size={14} color="#f472b6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ═══════════════════ CONEXÃO COM VÍDEO DE PRODUTO ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Transforme a foto em vídeo de produto
            </Text>
            <Text style={styles.bodyText}>
              Depois de gerar a foto de estúdio do seu produto, você pode ir
              além: transforme essa imagem em um vídeo curto para anúncios e
              redes sociais. O Vídeo de Produto com IA gera cenas em movimento a
              partir da mesma imagem, mantendo a identidade visual — ideal para
              Reels, TikTok e criativos de performance.
            </Text>
            <TouchableOpacity
              style={[
                styles.ctaPink,
                { alignSelf: "flex-start", marginTop: 20 },
              ]}
              activeOpacity={0.85}
              onPress={() => router.push(PRODUCT_VIDEO_ROUTE as any)}
            >
              <Text style={styles.ctaPinkText}>
                Ver Vídeo de Produto com IA
              </Text>
              <ArrowRight size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════ FERRAMENTAS RELACIONADAS ═══════════════════ */}
        <View style={styles.section}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>Outras ferramentas de IA</Text>
            <Text style={styles.sectionBody}>
              Combine o Estúdio de Produto com outras ferramentas para escalar
              sua produção visual.
            </Text>
          </View>
          <FlatList
            data={RELATED_TOOLS}
            keyExtractor={(item) => item.href}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.relatedCard}
                activeOpacity={0.85}
                onPress={() => router.push(item.href as any)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                <View style={styles.relatedOverlay} />
                <View style={styles.relatedContent}>
                  <Text style={styles.relatedLabel}>{item.label}</Text>
                  <Text style={styles.relatedDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ═══════════════════ FAQ ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Perguntas frequentes sobre Estúdio de Produto com IA
            </Text>
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </View>
        </View>

        {/* ═══════════════════ CTA FINAL ═══════════════════ */}
        <View
          style={[styles.sectionBordered, styles.tinted, styles.ctaSection]}
        >
          <View style={styles.px}>
            <Text style={styles.ctaTitle}>
              Pronto para criar sua primeira foto de produto com IA?
            </Text>
            <Text style={styles.ctaBody}>
              Escolha um plano, selecione presets e gere fotos de produto
              profissionais em minutos — sem estúdio físico e sem saber
              fotografar. Ideal para e-commerce, performance e criadores de
              conteúdo.
            </Text>
            <View style={styles.ctaButtons}>
              <TouchableOpacity
                style={styles.ctaPink}
                activeOpacity={0.85}
                onPress={() => router.push(PRODUCT_STUDIO_ROUTE as any)}
              >
                <Text style={styles.ctaPinkText}>Abrir o Estúdio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ctaOutline}
                activeOpacity={0.85}
                onPress={() => router.push(PRICING_ROUTE as any)}
              >
                <Text style={styles.ctaOutlineText}>Ver planos e preços</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09090b" },
  navWrapper: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "rgba(9,9,11,0.8)",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  px: { paddingHorizontal: 24 },

  // --- HERO ---
  heroSection: {
    minHeight: 480,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,9,11,0.72)",
  },
  heroContent: {
    position: "relative",
    zIndex: 10,
    paddingHorizontal: 24,
    paddingTop: 96,
    paddingBottom: 48,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 38,
    color: "#f5f5f5",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#d4d4d8",
    lineHeight: 22,
    marginBottom: 24,
  },
  heroCtas: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  ctaPink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#db2777",
    borderRadius: 999,
  },
  ctaPinkText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  ctaOutline: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 999,
    backgroundColor: "rgba(24,24,27,0.6)",
  },
  ctaOutlineText: { color: "#e4e4e7", fontSize: 14, fontWeight: "500" },

  // --- SECTIONS ---
  section: { paddingTop: 48, paddingBottom: 48 },
  sectionBordered: {
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    paddingTop: 48,
    paddingBottom: 48,
  },
  tinted: { backgroundColor: "rgba(24,24,27,0.4)" },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#f5f5f5",
    marginBottom: 12,
  },
  sectionBody: {
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 20,
    marginBottom: 24,
  },
  bodyText: { fontSize: 14, color: "#d4d4d8", lineHeight: 24 },

  // --- GALLERY ---
  galleryList: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 16,
    paddingBottom: 4,
  },
  galleryCard: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    overflow: "hidden",
    backgroundColor: "#09090b",
  },
  galleryImage: { width: 220, aspectRatio: 4 / 5 },

  // --- HOW-TO STEPS ---
  stepImageContainer: {
    marginHorizontal: 24,
    marginTop: 20,
    aspectRatio: 16 / 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    overflow: "hidden",
  },
  stepImage: { width: "100%", height: "100%" },
  stepDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  dot: { height: 8, borderRadius: 999 },
  dotActive: { width: 24, backgroundColor: "#ec4899" },
  dotInactive: { width: 8, backgroundColor: "#3f3f46" },
  stepItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 2,
    borderLeftColor: "transparent",
    marginBottom: 4,
  },
  stepItemActive: {
    backgroundColor: "rgba(39,39,42,0.6)",
    borderLeftColor: "#ec4899",
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  stepBadgeActive: {
    backgroundColor: "rgba(236,72,153,0.1)",
    borderColor: "rgba(236,72,153,0.2)",
  },
  stepBadgeInactive: { backgroundColor: "#18181b", borderColor: "#27272a" },
  stepBadgeText: { fontSize: 11, fontWeight: "700" },
  stepBadgeTextActive: { color: "#ec4899" },
  stepBadgeTextInactive: { color: "#71717a" },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: "600" },
  stepTitleActive: { color: "#f5f5f5" },
  stepTitleInactive: { color: "#d4d4d8" },
  stepDesc: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  stepDescActive: { color: "#a1a1aa" },
  stepDescInactive: { color: "#71717a" },

  // --- CARDS ---
  cardGrid: { gap: 12, marginTop: 16 },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "rgba(39,39,42,0.4)",
    padding: 20,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f5f5f5",
    marginBottom: 8,
  },
  infoCardDesc: { fontSize: 12, color: "#a1a1aa", lineHeight: 20 },

  // --- PRESETS ---
  presetGroupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f5f5f5",
    marginBottom: 12,
    marginTop: 8,
  },
  stylePresetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  presetEmoji: { fontSize: 14, marginRight: 6 },
  stylePresetLabel: { fontSize: 13, fontWeight: "600", color: "#e4e4e7" },
  stylePresetDesc: { fontSize: 12, color: "#a1a1aa", flex: 1 },
  pillGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    gap: 4,
  },
  presetLabel: { fontSize: 12, color: "#d4d4d8" },

  // --- PRODUCT TYPES ---
  productTypeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    padding: 20,
  },
  productTypeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(39,39,42,0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  productTypeExample: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#71717a",
    marginTop: 8,
  },

  // --- MODELS ---
  modelCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modelLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "rgba(39,39,42,0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  modelLogo: { width: 28, height: 28 },
  modelName: { fontSize: 14, fontWeight: "600", color: "#f5f5f5", flex: 1 },

  // --- BENEFITS ---
  benefitsGrid: { gap: 24, marginTop: 20 },
  benefitItem: {},
  benefitIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  benefitTitle: { fontSize: 16, fontWeight: "500", color: "#f5f5f5" },
  benefitDesc: { fontSize: 13, color: "#a1a1aa", lineHeight: 20 },

  // --- AUDIENCES ---
  audienceList: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 16,
    paddingBottom: 4,
  },
  audienceCard: {
    width: 240,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  audienceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,9,11,0.65)",
  },
  audienceContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    minHeight: 320,
    justifyContent: "flex-end",
  },
  audienceTitle: { fontSize: 14, fontWeight: "600", color: "#f5f5f5" },
  audienceDesc: {
    fontSize: 12,
    color: "#a1a1aa",
    marginTop: 4,
    lineHeight: 18,
  },

  // --- TABLE ---
  table: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
  },
  tableRow: { flexDirection: "row" },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: "#27272a" },
  tableHeader: { backgroundColor: "rgba(39,39,42,0.6)" },
  tableCell: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    color: "#a1a1aa",
    minWidth: 120,
  },
  tableHeaderCell: { color: "#d4d4d8", fontWeight: "500" },
  tableCellHighlight: { color: "#e4e4e7", fontWeight: "500" },

  // --- COMPARISON CTA ---
  compareCtas: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 16,
    marginTop: 20,
  },
  linkButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  linkButtonText: { fontSize: 13, fontWeight: "500", color: "#f472b6" },
  checkRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },

  // --- RELATED TOOLS ---
  relatedList: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  relatedCard: {
    width: 180,
    minHeight: 260,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  relatedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,9,11,0.72)",
  },
  relatedContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  relatedLabel: { fontSize: 13, fontWeight: "500", color: "#e4e4e7" },
  relatedDesc: { fontSize: 11, color: "#a1a1aa", marginTop: 4 },

  // --- FAQ ---
  faqItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: "500",
    color: "#f5f5f5",
    flex: 1,
    paddingRight: 12,
  },
  faqToggle: { fontSize: 18, color: "#a1a1aa" },
  faqToggleOpen: { transform: [{ rotate: "45deg" }] },
  faqAnswer: {
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 22,
    marginTop: 8,
  },

  // --- CTA FINAL ---
  ctaSection: { alignItems: "center" },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#f5f5f5",
    textAlign: "center",
    marginBottom: 12,
  },
  ctaBody: {
    fontSize: 13,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
});
