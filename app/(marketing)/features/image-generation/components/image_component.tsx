"use client";

import Footer from "@/src/components/main_page/footer";
import Navbar from "@/src/components/main_page/Navbar";
import {
  AI_IMAGE_MODELS,
  AIImageModelConfig,
  AIModelPlan,
  getAIImageModelLogo,
} from "@/src/types/aiModels";
import { UserPlan } from "@/src/types/user";
import { useRouter } from "expo-router";
import {
  ArrowUp,
  Check,
  Image as ImageIcon,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
  Zap,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Routes & assets ──────────────────────────────────────────────────────
const HERO_IMAGE_SRC =
  "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/image_background_page.webp";
const HOW_IMAGE_SRC =
  "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/imagem_how%20to%20create.webp";
const TEXT_TO_IMAGE_ROUTE = "/ai-tools/text-to-image";
const PRICING_ROUTE = "/pricing";

// ─── Helpers (ported 1-to-1 from web) ────────────────────────────────────
function isImageModelLocked(
  model: AIImageModelConfig,
  userPlan: UserPlan,
): boolean {
  if (model.status === "blocked") return true;
  const planHierarchy: Record<UserPlan, number> = {
    free: 0,
    essential: 1,
    creator: 2,
    agency: 3,
  };
  const modelPlanHierarchy: Record<AIModelPlan, number> = {
    free: 0,
    essential: 1,
    creator: 2,
    agency: 3,
  };
  return planHierarchy[userPlan] < modelPlanHierarchy[model.plan];
}

function getPlanBadgeStyle(plan: AIModelPlan): { bg: string; text: string } {
  switch (plan) {
    case "free":
      return { bg: "#52525b", text: "#f4f4f5" };
    case "essential":
      return { bg: "#854d0e", text: "#fef9c3" };
    case "creator":
      return { bg: "#166534", text: "#dcfce7" };
    case "agency":
      return { bg: "#9f1239", text: "#ffe4e6" };
    default:
      return { bg: "#52525b", text: "#f4f4f5" };
  }
}

const MODEL_SHORT_DESCRIPTIONS: Record<string, string> = {
  "flux-schnell": "Rápido e econômico, ideal para rascunhos",
  "flux-dev": "Equilíbrio entre qualidade e custo",
  "flux-pro": "Realismo fotográfico premium",
  "flux-pro-ultra": "Máxima qualidade e detalhe",
  "gpt-image-1": "Compreensão semântica avançada",
  "gpt-image-1-mini": "Versão rápida e econômica do GPT Image",
  "gemini-2.5-flash-image": "Geração rápida com consistência",
  "nano-banana": "Edição em linguagem natural",
  "seedream-3": "Estética limpa para e-commerce",
  "seedream-4": "Alta resolução até 4K",
};

function getModelDescription(modelId: string): string {
  return MODEL_SHORT_DESCRIPTIONS[modelId] ?? "";
}

// ─── Providers ────────────────────────────────────────────────────────────
interface ProviderGroup {
  id: string;
  label: string;
  logo: string;
  intro: string;
}

const PROVIDER_ORDER: string[] = ["flux", "gpt", "gemini", "seedream"];

const PROVIDER_META: Record<string, { label: string; intro: string }> = {
  flux: {
    label: "FLUX",
    intro:
      "FLUX é uma família de modelos de geração de imagem conhecida por realismo fotográfico, forte aderência ao prompt e excelente compreensão de iluminação e composição. Vem em variantes rápidas (Schnell, Flash, Turbo), equilibradas (Dev, Klein) e premium (Pro, Pro Ultra).",
  },
  gpt: {
    label: "GPT Image",
    intro:
      "Modelos de imagem da OpenAI com compreensão semântica avançada de prompts complexos. Excelentes para cenas com múltiplos objetos, tipografia razoável e edição via referência. Suportam múltiplas imagens de referência e fundo transparente.",
  },
  gemini: {
    label: "Google",
    intro:
      "Os modelos Nano Banana (Gemini) cobrem geração fotorrealista e edição em linguagem natural. Aceitam várias imagens de referência, são fundamentados no conhecimento de mundo do Gemini e priorizam consistência de personagem e cena.",
  },
  seedream: {
    label: "Seedream",
    intro:
      "Seedream é focado em geração rápida com estética limpa e consistente, com suporte a múltiplas resoluções (1K, 2K e 4K). Boa escolha para produção em escala de e-commerce e criativos de anúncio.",
  },
};

// ─── Static data ──────────────────────────────────────────────────────────
const USE_CASES = [
  [
    "Fotos de produtos",
    "Crie novas cenas, fundos e composições para produtos e lojas virtuais.",
  ],
  [
    "Imagens para anúncios",
    "Desenvolva conceitos visuais para campanhas, ofertas e testes criativos.",
  ],
  [
    "Conteúdo para redes sociais",
    "Produza imagens para posts, carrosséis, capas e campanhas sociais.",
  ],
  [
    "Imagens para e-commerce",
    "Crie materiais visuais para páginas de produto, vitrines e catálogos.",
  ],
  [
    "Criativos para afiliados",
    "Transforme ideias de ofertas em visuais para divulgação e aquisição.",
  ],
  [
    "Conceitos visuais",
    "Explore ideias, estilos, cenários e direções criativas rapidamente.",
  ],
];

const MODEL_OVERVIEW_CARDS = [
  [
    "FLUX para geração de imagens",
    "A família FLUX oferece diferentes opções para geração de imagens, com variantes voltadas para velocidade, equilíbrio entre qualidade e custo e resultados fotográficos mais detalhados.",
  ],
  [
    "GPT Image",
    "Os modelos GPT Image são indicados para instruções complexas, composição de cenas e fluxos que precisam interpretar diferentes elementos descritos no prompt.",
  ],
  [
    "Gemini e Nano Banana",
    "Os modelos de imagem do Gemini, incluindo Nano Banana, podem ser usados para geração e edição orientadas por linguagem natural e para fluxos que trabalham com imagens de referência.",
  ],
  [
    "Seedream",
    "Seedream é uma opção para criação de imagens com estética limpa, consistência visual e diferentes níveis de resolução, sendo útil para produção de conteúdo visual em escala.",
  ],
];

const RELATED_TOOLS = [
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
  {
    href: "/features/canvas",
    label: "Canvas com IA",
    desc: "Edite e componha imagens com IA",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/canvas_image.webp",
  },
];

const FAQS_PRIMARY = [
  {
    q: "O gerador de imagens por IA é gratuito?",
    a: "Sim. Você começa gratuitamente, sem cartão de crédito, e recebe créditos iniciais para gerar suas primeiras imagens. Para uso em escala, existem planos pagos com mais créditos e acesso a modelos premium como FLUX Pro Ultra e GPT Image.",
  },
  {
    q: "Posso usar as imagens geradas comercialmente?",
    a: "Sim. As imagens geradas podem ser usadas comercialmente em anúncios, e-commerce, redes sociais e materiais de marketing, sem marca d'água e sem necessidade de crédito adicional.",
  },
  {
    q: "Qual a diferença entre esse gerador e outros geradores de imagem por IA?",
    a: "Este gerador reúne em uma única plataforma os principais modelos do mercado — FLUX, GPT Image, Gemini (Nano Banana) e Seedream — com foco em fotografia de produto e criativos de anúncio. Você não precisa assinar várias ferramentas nem gerenciar chaves de API separadas.",
  },
  {
    q: "Preciso saber escrever prompts?",
    a: 'Não. Você pode descrever o que quer em linguagem simples do dia a dia — sem precisar entender de prompt engineering. Ex: "foto de um relógio de couro sobre mesa de madeira, luz suave da manhã".',
  },
  {
    q: "Quais formatos e resoluções de imagem são suportados?",
    a: "Os modelos suportam resoluções de 1K, 2K e 4K, nos formatos JPG, PNG e WebP. Modelos compatíveis geram fundo transparente para uso direto em e-commerce e composições.",
  },
  {
    q: "Qual modelo é melhor para fotografia de produto?",
    a: "Para fotografia de produto, FLUX Pro e Seedream entregam o melhor equilíbrio entre realismo, iluminação e consistência. GPT Image é ideal quando você precisa de cenas com múltiplos objetos ou tipografia legível.",
  },
  {
    q: "Preciso criar conta para gerar imagem?",
    a: "Você pode explorar os modelos e preços livremente. Para gerar e baixar imagens, é necessário criar uma conta gratuita — isso leva menos de 30 segundos.",
  },
  {
    q: "As imagens geradas têm marca d'água?",
    a: "Não. Todas as imagens geradas são entregues sem marca d'água, prontas para uso em anúncios, catálogos e redes sociais.",
  },
];

const FAQS_EXTRA = [
  {
    q: "Como criar uma imagem com IA?",
    a: "Descreva a imagem que deseja, escolha um modelo de geração e envie a solicitação. O modelo interpreta a descrição e cria uma nova imagem de acordo com as características informadas.",
  },
  {
    q: "O que é texto para imagem?",
    a: "Texto para imagem é uma tecnologia de inteligência artificial que transforma uma descrição escrita em uma imagem. Você descreve uma cena, produto ou conceito e o modelo gera o visual correspondente.",
  },
  {
    q: "Posso gerar imagens sem saber escrever prompts?",
    a: "Sim. Você pode começar com uma descrição em linguagem natural, como explicaria a ideia para outra pessoa. Quanto mais contexto relevante você fornecer, mais direcionado pode ser o resultado.",
  },
  {
    q: "Como criar fotos de produtos com IA?",
    a: "Você pode descrever o produto e a cena desejada ou trabalhar com uma imagem de referência quando o modelo escolhido oferecer esse recurso. Isso permite explorar fundos, ambientes, iluminação e composições diferentes para marketing e e-commerce.",
  },
  {
    q: "Como criar imagens para e-commerce com IA?",
    a: "Crie imagens de produto, cenas de uso, fundos e composições comerciais adaptadas à identidade visual da loja. Depois, use os materiais em páginas de produto, vitrines, catálogos e campanhas.",
  },
  {
    q: "Qual modelo de IA devo usar para gerar uma imagem?",
    a: "Depende do resultado que você procura. Alguns modelos priorizam velocidade, outros são mais indicados para realismo, instruções complexas, edição ou alta resolução. A TrendYuu reúne diferentes modelos para que você possa escolher conforme o projeto.",
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

// ─── Props ────────────────────────────────────────────────────────────────
interface ImageGenerationScreenProps {
  userPlan?: UserPlan;
  userCredits?: number;
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function ImageGenerationScreen({
  userPlan = "free",
  userCredits = 0,
}: ImageGenerationScreenProps) {
  const router = useRouter();

  // Prompt card state
  const [prompt, setPrompt] = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);

  // Provider panel state
  const [activeProviderId, setActiveProviderId] = useState<string>("flux");

  // ─── Providers derived from real models ─────────────────────────────
  const providers: ProviderGroup[] = useMemo(() => {
    const groups: Record<string, AIImageModelConfig[]> = {};
    Object.values(AI_IMAGE_MODELS).forEach((model) => {
      const prefix =
        PROVIDER_ORDER.find((p) => model.id.startsWith(p)) ?? "other";
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(model);
    });
    return PROVIDER_ORDER.filter((p) => groups[p]?.length).map((p) => {
      const meta = PROVIDER_META[p] ?? { label: p, intro: "" };
      const firstModel = groups[p][0];
      return {
        id: p,
        label: meta.label,
        logo: getAIImageModelLogo(firstModel.id),
        intro: meta.intro,
      };
    });
  }, []);

  const activeModels = useMemo(
    () =>
      Object.values(AI_IMAGE_MODELS).filter((m) =>
        m.id.startsWith(activeProviderId),
      ),
    [activeProviderId],
  );

  const activeProvider =
    providers.find((p) => p.id === activeProviderId) ?? providers[0];

  // ─── Available models for the prompt picker ──────────────────────────
  const availableImageModels = useMemo(
    () =>
      Object.values(AI_IMAGE_MODELS)
        .filter((m) => m.status !== "blocked")
        .map((m) => ({
          id: m.id,
          name: m.name,
          logo: getAIImageModelLogo(m.id),
          locked: isImageModelLocked(m, userPlan),
          plan: m.plan,
          status: m.status,
          baseCredits: m.baseCredits,
        })),
    [userPlan],
  );

  const getDefaultImageModel = (): string => {
    const unlocked = Object.values(AI_IMAGE_MODELS).filter(
      (m) => !isImageModelLocked(m, userPlan) && m.status !== "blocked",
    );
    if (!unlocked.length) return availableImageModels[0]?.id ?? "";
    return unlocked.reduce((best, m) =>
      m.baseCredits > best.baseCredits ? m : best,
    ).id;
  };

  const [selectedModelId, setSelectedModelId] = useState(
    getDefaultImageModel(),
  );

  const selectedModel = useMemo(
    () =>
      availableImageModels.find((m) => m.id === selectedModelId) ??
      availableImageModels[0],
    [availableImageModels, selectedModelId],
  );

  function handleSubmit() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const query = `?prompt=${encodeURIComponent(trimmed)}&model=${selectedModelId}`;
    router.push(`${TEXT_TO_IMAGE_ROUTE}${query}` as any);
  }

  return (
    <View style={styles.root}>
      {/* Sticky header */}
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
            accessibilityLabel="Exemplos de imagens e fotos de produtos criadas com inteligência artificial na TrendYuu"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Gerador de Imagens IA Grátis</Text>
            <Text style={styles.heroSubtitle}>
              Crie imagens com inteligência artificial a partir de texto e
              transforme ideias em visuais profissionais em segundos. Gere fotos
              de produtos, criativos para anúncios, imagens para redes sociais e
              outros conteúdos visuais usando FLUX, GPT Image, Gemini (Nano
              Banana) e Seedream em uma única plataforma.
            </Text>

            {/* ─── PROMPT CARD ─── */}
            <View style={styles.promptCard}>
              {/* Top toolbar */}
              <View style={styles.promptToolbar}>
                <TouchableOpacity
                  style={styles.imageRefBtn}
                  accessibilityLabel="Adicionar imagem de referência"
                >
                  <ImageIcon size={16} color="#71717a" />
                </TouchableOpacity>

                <View style={styles.toolbarSpacer} />

                {/* Model picker trigger */}
                <TouchableOpacity
                  style={styles.modelPickerBtn}
                  onPress={() => setShowModelPicker(true)}
                  accessibilityLabel="Selecionar modelo de imagem"
                >
                  {selectedModel?.locked && <Lock size={12} color="#71717a" />}
                  <View style={styles.modelLogoCircle}>
                    <Image
                      source={{ uri: selectedModel?.logo ?? "" }}
                      style={styles.modelLogoSmall}
                      resizeMode="contain"
                      accessibilityLabel={`Logo do modelo ${selectedModel?.name ?? "de imagem IA"}`}
                    />
                  </View>
                  <Text style={styles.modelPickerLabel}>
                    {selectedModel?.name}
                  </Text>
                  <Text style={styles.chevron}>⌄</Text>
                </TouchableOpacity>

                {/* Ratio pill */}
                <View style={styles.ratioPill}>
                  <Text style={styles.ratioPillText}>1:1</Text>
                  <Text style={styles.chevron}>⌄</Text>
                </View>
              </View>

              {/* Textarea */}
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Descreva a imagem que você quer gerar... ex: foto de um tênis branco sobre fundo de mármore, iluminação de estúdio"
                placeholderTextColor="#52525b"
                multiline
                style={styles.promptInput}
                accessibilityLabel="Descrição da imagem a ser gerada"
                onSubmitEditing={handleSubmit}
                returnKeyType="send"
              />

              {/* Bottom bar */}
              <View style={styles.promptBottom}>
                <Text style={styles.creditsText}>
                  <Text style={styles.creditsValue}>{userCredits}</Text>{" "}
                  créditos
                </Text>
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    !prompt.trim() && styles.sendBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!prompt.trim()}
                  accessibilityLabel="Gerar imagem"
                >
                  <ArrowUp size={14} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════ COMO FUNCIONA ═══════════════════ */}
        <View style={styles.section}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Como criar uma imagem com IA?
            </Text>
            <View style={styles.howCard}>
              <Image
                source={{ uri: HOW_IMAGE_SRC }}
                style={styles.howImage}
                resizeMode="cover"
                accessibilityLabel="Demonstração do processo de criação de imagem com IA em três etapas"
              />
              <View style={styles.howSteps}>
                {[
                  [
                    "01",
                    "Descreva sua imagem",
                    "Digite o que você quer ver — produto, cena, estilo, iluminação. Simples ou detalhado, do jeito que preferir.",
                  ],
                  [
                    "02",
                    "Escolha o modelo de IA",
                    "Escolha entre diferentes modelos de geração de imagem de acordo com o tipo de visual, realismo, velocidade e nível de detalhe que você precisa.",
                  ],
                  [
                    "03",
                    "Gere, baixe e use",
                    "Gere sua imagem e use o resultado em anúncios, e-commerce, redes sociais, páginas de produto e outros materiais de marketing.",
                  ],
                ].map(([num, title, desc], i) => (
                  <View
                    key={num}
                    style={[styles.howStep, i > 0 && styles.howStepBorder]}
                  >
                    <View style={styles.howBadge}>
                      <Text style={styles.howBadgeText}>{num}</Text>
                    </View>
                    <View style={styles.howStepText}>
                      <Text style={styles.howStepTitle}>{title}</Text>
                      <Text style={styles.howStepDesc}>{desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════ O QUE É ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              O que é um gerador de imagens IA?
            </Text>
            <Text style={styles.bodyText}>
              Um gerador de imagens IA é uma ferramenta que usa modelos de
              inteligência artificial para criar imagens a partir de instruções
              em texto, imagens de referência ou combinações dos dois. Em vez de
              começar uma arte do zero em um editor tradicional, você descreve o
              resultado que deseja e a IA gera uma nova imagem com base nessa
              descrição.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 12 }]}>
              Com um gerador de imagens por IA, você pode criar desde imagens
              conceituais até fotos de produtos, criativos para anúncios,
              imagens para redes sociais e materiais visuais para e-commerce. A
              qualidade do resultado depende do modelo escolhido, da descrição
              fornecida e das referências utilizadas.
            </Text>
            <View style={styles.cardGrid}>
              {[
                [
                  "Criar imagem com IA a partir de texto",
                  "Escreva o que você quer visualizar e deixe o modelo transformar sua descrição em uma imagem. Você pode especificar produto, ambiente, composição, iluminação, enquadramento e estilo.",
                ],
                [
                  "Texto para imagem",
                  "A geração texto-para-imagem permite transformar uma ideia escrita em um visual. É útil para campanhas, conteúdo social, conceitos, páginas de produto e materiais de marketing.",
                ],
                [
                  "Gerar fotos de produtos com IA",
                  "Crie novas composições para produtos, ambientes e campanhas sem precisar produzir cada variação em um ensaio fotográfico separado. Isso permite testar diferentes cenários e direções visuais.",
                ],
                [
                  "Criativos para anúncios com IA",
                  "Gere diferentes conceitos visuais para campanhas e testes criativos. Você pode adaptar a mesma ideia para anúncios, redes sociais, páginas de venda e outros canais.",
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

        {/* ═══════════════════ COMO ESCREVER UM PROMPT ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Como escrever um prompt para gerar imagens com IA
            </Text>
            <Text style={styles.bodyText}>
              Você não precisa escrever um prompt complicado para criar uma boa
              imagem. Uma descrição clara normalmente funciona melhor quando
              informa o que aparece na cena, onde está o objeto, como a imagem
              deve ser enquadrada e qual estilo visual você procura.
            </Text>
            <View style={styles.cardGrid}>
              {/* O que colocar no prompt */}
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>
                  O que colocar no prompt?
                </Text>
                {[
                  ["Objeto", "o que deve aparecer na imagem."],
                  ["Ambiente", "onde a cena acontece."],
                  ["Composição", "posição, enquadramento e perspectiva."],
                  [
                    "Iluminação",
                    "luz de estúdio, natural, suave, dramática etc.",
                  ],
                  [
                    "Estilo",
                    "fotográfico, editorial, comercial, minimalista e outros.",
                  ],
                ].map(([label, rest]) => (
                  <Text
                    key={label}
                    style={[styles.infoCardDesc, { marginTop: 8 }]}
                  >
                    <Text style={{ color: "#e4e4e7", fontWeight: "600" }}>
                      {label}:
                    </Text>{" "}
                    {rest}
                  </Text>
                ))}
              </View>
              {/* Exemplo */}
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>
                  Exemplo de prompt para imagem
                </Text>
                <Text style={[styles.infoCardDesc, { marginTop: 8 }]}>
                  <Text style={{ color: "#e4e4e7" }}>Simples:</Text> &quot;foto
                  de um tênis branco sobre uma mesa de mármore&quot;.
                </Text>
                <Text style={[styles.infoCardDesc, { marginTop: 12 }]}>
                  <Text style={{ color: "#e4e4e7" }}>Mais detalhado:</Text>{" "}
                  &quot;foto comercial de um tênis branco sobre mármore claro,
                  iluminação de estúdio suave, sombras naturais, enquadramento
                  frontal, fundo minimalista, fotografia de produto
                  premium&quot;.
                </Text>
                <Text style={[styles.infoCardDesc, { marginTop: 12 }]}>
                  O gerador também permite começar com uma descrição simples e
                  ajustar o resultado conforme a necessidade.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════ USE CASES ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              O que você pode criar com um gerador de imagens IA?
            </Text>
            <Text style={styles.sectionBody}>
              A geração de imagens com inteligência artificial pode ser usada em
              diferentes etapas da criação de conteúdo e do marketing digital.
            </Text>
            <View style={styles.cardGrid}>
              {USE_CASES.map(([title, desc]) => (
                <View key={title} style={styles.darkCard}>
                  <Text style={styles.infoCardTitle}>{title}</Text>
                  <Text style={styles.infoCardDesc}>{desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════ PAINEL DE MODELOS ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Modelos de IA para gerar imagem
            </Text>
            <Text style={styles.sectionBody}>
              Compare diferentes modelos de inteligência artificial para
              encontrar a opção mais adequada para gerar imagens, fotos de
              produtos, criativos de anúncios e conteúdos visuais em escala.
            </Text>
            <View style={styles.cardGrid}>
              {MODEL_OVERVIEW_CARDS.map(([title, desc]) => (
                <View key={title} style={styles.darkCard}>
                  <Text style={styles.infoCardTitle}>{title}</Text>
                  <Text style={styles.infoCardDesc}>{desc}</Text>
                </View>
              ))}
            </View>

            {/* Provider tab panel */}
            <View style={styles.modelPanel}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.providerTabs}
                contentContainerStyle={styles.providerTabsContent}
              >
                {providers.map((provider) => {
                  const isActive = provider.id === activeProviderId;
                  return (
                    <TouchableOpacity
                      key={provider.id}
                      onPress={() => setActiveProviderId(provider.id)}
                      style={[
                        styles.providerTab,
                        isActive && styles.providerTabActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: provider.logo }}
                        style={styles.providerLogo}
                        resizeMode="contain"
                        accessibilityLabel={`Logo ${provider.label}`}
                      />
                      <Text
                        style={[
                          styles.providerTabLabel,
                          isActive && styles.providerTabLabelActive,
                        ]}
                      >
                        {provider.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.modelDetail}>
                <Text style={styles.modelDetailTitle}>
                  {activeProvider?.label}
                </Text>
                <Text style={styles.modelDetailIntro}>
                  {activeProvider?.intro}
                </Text>
                <Text style={styles.modelDetailSubtitle}>
                  Modelos disponíveis
                </Text>
                <View style={styles.modelGrid}>
                  {activeModels.map((model) => {
                    const blocked = model.status === "blocked";
                    return (
                      <View key={model.id} style={styles.modelCard}>
                        <Text style={styles.modelCardName}>{model.name}</Text>
                        <View style={styles.modelCardFooter}>
                          <Text style={styles.modelCardCredits}>
                            {model.baseCredits.toLocaleString("pt-BR")} créditos
                          </Text>
                          <TouchableOpacity
                            disabled={blocked}
                            onPress={() =>
                              router.push(
                                `${TEXT_TO_IMAGE_ROUTE}?model=${model.id}` as any,
                              )
                            }
                            style={styles.modelCardAction}
                          >
                            {blocked ? (
                              <>
                                <Lock size={12} color="#52525b" />
                                <Text style={styles.modelCardActionTextBlocked}>
                                  {" "}
                                  Em breve
                                </Text>
                              </>
                            ) : (
                              <>
                                <Play
                                  size={12}
                                  color="#d4d4d8"
                                  fill="#d4d4d8"
                                />
                                <Text style={styles.modelCardActionText}>
                                  {" "}
                                  Testar
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════ BENEFÍCIOS ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Por que usar um gerador de imagens com IA?
            </Text>
            <View style={styles.benefitsGrid}>
              {[
                [
                  Sparkles,
                  "Dispense o banco de imagens",
                  "Crie visuais únicos e exclusivos para a sua marca sem depender de fotos de estoque genéricas.",
                ],
                [
                  Zap,
                  "Escale seus criativos de anúncio",
                  "Gere dezenas de variações visuais para testes A/B sem precisar de um time de criação — feito para profissionais de performance.",
                ],
                [
                  ShieldCheck,
                  "Identidade visual consistente",
                  "Defina um estilo de prompt e replique o mesmo visual em todos os seus criativos, mantendo a marca reconhecível.",
                ],
                [
                  Wand2,
                  "Da ideia à imagem em segundos",
                  "Sem precisar dominar Photoshop ou prompt engineering. Descreva o que você quer e receba um resultado utilizável na hora.",
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
              Para quem é o gerador de imagens com IA?
            </Text>
            <View style={styles.audienceList}>
              {[
                [
                  "Vendedores de e-commerce",
                  "criam fotos de produto sem estúdio físico ou fotógrafo.",
                ],
                [
                  "Profissionais de performance",
                  "produzem variações de criativos em escala para testes A/B.",
                ],
                [
                  "Criadores de conteúdo e afiliados",
                  "criam imagens para posts, campanhas e páginas de oferta.",
                ],
                [
                  "Agências",
                  "entregam imagens para clientes mais rápido, sem aumentar o time.",
                ],
              ].map(([strong, rest]) => (
                <View key={strong} style={styles.audienceItem}>
                  <Text style={styles.audienceText}>
                    <Text style={styles.audienceStrong}>{strong}</Text>
                    {" — "}
                    {rest}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════ FERRAMENTAS RELACIONADAS ═══════════════════ */}
        <View style={styles.section}>
          <View style={styles.px}>
            <Text style={styles.sectionTitleSm}>Outras ferramentas de IA</Text>
            <Text style={styles.sectionBody}>
              Combine o gerador de imagens com outras ferramentas para escalar
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
                  accessibilityLabel={item.label}
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

        {/* ═══════════════════ FAQ PRIMARY ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Perguntas frequentes sobre gerador de imagens IA
            </Text>
            {FAQS_PRIMARY.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </View>
        </View>

        {/* ═══════════════════ FAQ EXTRA ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Mais dúvidas sobre criação de imagens com IA
            </Text>
            {FAQS_EXTRA.map((faq) => (
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
              Pronto para criar sua primeira imagem com IA?
            </Text>
            <Text style={styles.ctaBody}>
              Comece gratuitamente, sem cartão de crédito, e gere suas primeiras
              imagens em menos de 30 segundos. Ideal para e-commerce, anúncios e
              criadores de conteúdo que precisam de visuais profissionais sem
              estúdio.
            </Text>
            <TouchableOpacity
              style={[styles.ctaPink, { alignSelf: "center" }]}
              activeOpacity={0.85}
              onPress={() => router.push(TEXT_TO_IMAGE_ROUTE as any)}
            >
              <Text style={styles.ctaPinkText}>Gerar imagem grátis</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Footer />
      </ScrollView>

      {/* ═══════════════════ MODEL PICKER MODAL ═══════════════════ */}
      <Modal
        visible={showModelPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModelPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowModelPicker(false)}
        />
        <SafeAreaView style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                Selecione o modelo de imagem IA
              </Text>
              <Text style={styles.modalSubtitle}>
                Escolha o melhor modelo para sua imagem
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowModelPicker(false)}
              style={styles.modalClose}
              accessibilityLabel="Fechar seletor de modelos"
            >
              <X size={16} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Model list */}
          <FlatList
            data={availableImageModels}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => {
              const locked = item.locked || false;
              const blocked = item.status === "blocked";
              const isSelected = selectedModelId === item.id;
              const badge = getPlanBadgeStyle(item.plan);

              return (
                <TouchableOpacity
                  onPress={() => {
                    if (!blocked) {
                      setSelectedModelId(item.id);
                      setShowModelPicker(false);
                    }
                  }}
                  disabled={blocked}
                  style={[
                    styles.modelPickerItem,
                    isSelected && styles.modelPickerItemSelected,
                    blocked && styles.modelPickerItemBlocked,
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.modelPickerLogoBox}>
                    <Image
                      source={{ uri: item.logo }}
                      style={styles.modelPickerLogo}
                      resizeMode="contain"
                      accessibilityLabel={`Logo ${item.name}`}
                    />
                  </View>
                  <View style={styles.modelPickerInfo}>
                    <View style={styles.modelPickerNameRow}>
                      <Text style={styles.modelPickerName}>{item.name}</Text>
                      {blocked && (
                        <View
                          style={[
                            styles.planBadge,
                            { backgroundColor: "rgba(234,179,8,0.2)" },
                          ]}
                        >
                          <Text
                            style={[styles.planBadgeText, { color: "#facc15" }]}
                          >
                            Em breve
                          </Text>
                        </View>
                      )}
                      {locked && !blocked && <Lock size={12} color="#eab308" />}
                      {item.plan && (
                        <View
                          style={[
                            styles.planBadge,
                            { backgroundColor: badge.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.planBadgeText,
                              { color: badge.text },
                            ]}
                          >
                            {item.plan}
                          </Text>
                        </View>
                      )}
                    </View>
                    {getModelDescription(item.id) ? (
                      <Text style={styles.modelPickerDesc} numberOfLines={1}>
                        {getModelDescription(item.id)}
                      </Text>
                    ) : null}
                    <Text style={styles.modelPickerCredits}>
                      {item.baseCredits} créditos
                    </Text>
                  </View>
                  {isSelected && <Check size={16} color="#f472b6" />}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(38,38,38,0.6)",
    backgroundColor: "rgba(10,10,10,0.8)",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    zIndex: 50,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  px: { paddingHorizontal: 24 },

  // --- HERO ---
  heroSection: {
    minHeight: 560,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.7)",
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

  // --- PROMPT CARD ---
  promptCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    backgroundColor: "rgba(24,24,27,0.8)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  promptToolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  imageRefBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#52525b",
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarSpacer: { flex: 1 },
  modelPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(39,39,42,0.6)",
  },
  modelLogoCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3f3f46",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  modelLogoSmall: { width: 18, height: 18 },
  modelPickerLabel: { fontSize: 12, fontWeight: "500", color: "#a1a1aa" },
  chevron: { fontSize: 12, color: "#71717a" },
  ratioPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(39,39,42,0.6)",
  },
  ratioPillText: { fontSize: 12, fontWeight: "500", color: "#a1a1aa" },
  promptInput: {
    minHeight: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#ffffff",
    lineHeight: 22,
    textAlignVertical: "top",
  },
  promptBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(24,24,27,0.25)",
  },
  creditsText: { fontSize: 12, color: "#71717a" },
  creditsValue: { color: "#a1a1aa" },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#db2777",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#db2777",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnDisabled: { opacity: 0.4 },
  ctaPink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#db2777",
    borderRadius: 8,
  },
  ctaPinkText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },

  // --- SECTIONS ---
  section: { paddingTop: 48, paddingBottom: 48 },
  sectionBordered: {
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    paddingTop: 48,
    paddingBottom: 48,
  },
  tinted: { backgroundColor: "rgba(23,23,23,0.4)" },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#f5f5f5",
    marginBottom: 12,
  },
  sectionTitleSm: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f5f5f5",
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 20,
    marginBottom: 24,
  },
  bodyText: { fontSize: 14, color: "#d4d4d8", lineHeight: 24 },

  // --- HOW-TO CARD ---
  howCard: {
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    backgroundColor: "rgba(39,39,42,0.5)",
    overflow: "hidden",
  },
  howImage: { width: "100%", aspectRatio: 4 / 3, backgroundColor: "#09090b" },
  howSteps: { padding: 20 },
  howStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 16,
  },
  howStepBorder: { borderTopWidth: 1, borderTopColor: "rgba(63,63,70,0.6)" },
  howBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(236,72,153,0.1)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  howBadgeText: { fontSize: 11, fontWeight: "700", color: "#ec4899" },
  howStepText: { flex: 1 },
  howStepTitle: { fontSize: 14, fontWeight: "600", color: "#f5f5f5" },
  howStepDesc: { fontSize: 13, color: "#a1a1aa", lineHeight: 20, marginTop: 4 },

  // --- CARDS ---
  cardGrid: { gap: 12, marginTop: 16 },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "rgba(39,39,42,0.4)",
    padding: 20,
  },
  darkCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    padding: 20,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f5f5f5",
    marginBottom: 8,
  },
  infoCardDesc: { fontSize: 12, color: "#a1a1aa", lineHeight: 20 },

  // --- MODEL PANEL ---
  modelPanel: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    overflow: "hidden",
  },
  providerTabs: { borderBottomWidth: 1, borderBottomColor: "#27272a" },
  providerTabsContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  providerTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  providerTabActive: { backgroundColor: "#18181b" },
  providerLogo: { width: 20, height: 20, opacity: 0.8 },
  providerTabLabel: { fontSize: 13, fontWeight: "500", color: "#71717a" },
  providerTabLabelActive: { color: "#e4e4e7" },
  modelDetail: { padding: 20 },
  modelDetailTitle: { fontSize: 20, fontWeight: "600", color: "#e4e4e7" },
  modelDetailIntro: {
    fontSize: 13,
    color: "#71717a",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  modelDetailSubtitle: { fontSize: 13, color: "#d4d4d8", marginBottom: 12 },
  modelGrid: { gap: 12 },
  modelCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#09090b",
    padding: 16,
  },
  modelCardName: { fontSize: 14, fontWeight: "500", color: "#e4e4e7" },
  modelCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  modelCardCredits: { fontSize: 12, color: "#71717a" },
  modelCardAction: { flexDirection: "row", alignItems: "center" },
  modelCardActionText: { fontSize: 13, fontWeight: "500", color: "#d4d4d8" },
  modelCardActionTextBlocked: { fontSize: 13, color: "#52525b" },

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

  // --- AUDIENCE ---
  audienceList: { gap: 12, marginTop: 16 },
  audienceItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "rgba(39,39,42,0.4)",
    padding: 16,
  },
  audienceText: { fontSize: 13, color: "#d4d4d8", lineHeight: 20 },
  audienceStrong: { color: "#f5f5f5", fontWeight: "600" },

  // --- RELATED TOOLS ---
  relatedList: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  relatedCard: {
    width: 180,
    minHeight: 280,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  relatedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.72)",
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
  faqAnswer: { fontSize: 13, color: "#a1a1aa", lineHeight: 22, marginTop: 8 },

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

  // --- MODEL PICKER MODAL ---
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "75%",
    backgroundColor: "#18181b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#3f3f46",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  modalTitle: { fontSize: 14, fontWeight: "600", color: "#f4f4f5" },
  modalSubtitle: { fontSize: 12, color: "#71717a", marginTop: 2 },
  modalClose: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(39,39,42,0.6)",
  },
  modalList: { padding: 12, gap: 4 },
  modelPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  modelPickerItemSelected: {
    backgroundColor: "rgba(39,39,42,0.8)",
    borderColor: "#3f3f46",
  },
  modelPickerItemBlocked: { opacity: 0.5 },
  modelPickerLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    backgroundColor: "rgba(39,39,42,0.8)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  modelPickerLogo: { width: 28, height: 28 },
  modelPickerInfo: { flex: 1, minWidth: 0 },
  modelPickerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  modelPickerName: { fontSize: 13, fontWeight: "500", color: "#e4e4e7" },
  modelPickerDesc: { fontSize: 11, color: "#71717a", marginTop: 2 },
  modelPickerCredits: { fontSize: 11, color: "#f472b6", marginTop: 2 },
  planBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  planBadgeText: { fontSize: 10, fontWeight: "600" },
});
