"use client";

import Footer from "@/src/components/main_page/footer";
import Navbar from "@/src/components/main_page/Navbar";
import { AI_IMAGE_MODELS, AI_VIDEO_MODELS } from "@/src/types/aiModels";
import { UserPlan } from "@/src/types/user";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Box,
  Layers,
  RefreshCw,
  Wand2,
  Zap,
} from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Routes ───────────────────────────────────────────────────────────────
const CANVAS_DEMO_VIDEO = "/videos/canvas_demo.mp4";
const CANVAS_DEMO_THUMB =
  "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/canvas_demo_thumb.webp";
const PRICING_ROUTE = "/pricing";
const CANVAS_TOOL_ROUTE = "/ai-tools/canvas";

// ─── How-to steps ─────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    number: "01",
    title: "Adicione uma imagem de referência",
    description:
      "Adicione um nó de Upload ou outro nó que forneça uma imagem para usar como referência na criação.",
    image: "/how_to_use/tutorial_canvas.png",
    imageAlt:
      "Passo 1: nó de Upload adicionado ao Canvas com uma imagem de referência",
  },
  {
    number: "02",
    title: "Conecte a imagem ao nó",
    description:
      "Conecte o nó que contém a imagem de referência ao nó de geração. A imagem conectada pode então ser usada como referência para a nova criação.",
    image: "/how_to_use/tutorial_canvas2.png",
    imageAlt:
      "Passo 2: nó de upload conectado ao nó de geração de imagem no Canvas",
  },
  {
    number: "03",
    title: "Selecione a referência e gere",
    description:
      "Clique na imagem conectada ao nó para carregá-la na caixa de entrada. Depois, escreva o prompt descrevendo o resultado que deseja gerar e crie a nova imagem usando a referência.",
    image: "/how_to_use/tutorial_canvas3.png",
    imageAlt:
      "Passo 3: prompt sendo preenchido e imagem sendo gerada no Canvas",
  },
] as const;

// ─── Workflow examples ────────────────────────────────────────────────────
interface WorkflowExample {
  title: string;
  description: string;
  image: string;
  href: string;
}

const WORKFLOW_EXAMPLES: WorkflowExample[] = [
  {
    title: "Branding de Marca",
    description:
      "Crie identidade visual completa com logo, tipografia e elementos gráficos da marca a partir de um prompt.",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/exemplo_canvas_1.webp",
    href: `${CANVAS_TOOL_ROUTE}?template=branding`,
  },
  {
    title: "Marca de Produto",
    description:
      "Posicione seu produto em cenas realistas e gere imagens publicitárias prontas para catálogo e anúncios.",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/exemplo_canvas_2.webp",
    href: `${CANVAS_TOOL_ROUTE}?template=produto`,
  },
  {
    title: "UGC",
    description:
      "Gere conteúdo no estilo user-generated content com pessoas reais usando ou apresentando seu produto.",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/exemplo_canvas_3.webp",
    href: `${CANVAS_TOOL_ROUTE}?template=ugc`,
  },
];

// ─── Audiences ────────────────────────────────────────────────────────────
const AUDIENCES = [
  {
    title: "Lojas e e-commerces",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/ecormece.webp",
  },
  {
    title: "Gestores de tráfego e performance",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/perfomance.webp",
  },
  {
    title: "Social media e infoprodutores",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/creator.webp",
  },
  {
    title: "Agências e estúdios de criação",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/agency.webp",
  },
  {
    title: "Dropshipping e marca própria",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/drop.webp",
  },
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

// ─── Comparison table data ────────────────────────────────────────────────
const COMPARISON_ROWS = [
  {
    tool: "TrendYuu Canvas",
    lang: "Português (pt-BR)",
    install: "Nenhuma — abre no navegador",
    billing: "Em reais (R$)",
    models:
      "FLUX, GPT Image, Gemini, Seedream, Seedance 2.5, Veo 3.1, Kling, Pika e outros",
    highlight: true,
  },
  {
    tool: "ComfyUI",
    lang: "Inglês",
    install: "Local ou servidor próprio",
    billing: "Dólar (US$)",
    models: "Depende de extensões",
    highlight: false,
  },
  {
    tool: "Weavy",
    lang: "Inglês",
    install: "Navegador",
    billing: "Dólar (US$)",
    models: "Modelos parceiros",
    highlight: false,
  },
  {
    tool: "Freepik Spaces",
    lang: "Inglês / Português",
    install: "Navegador",
    billing: "Dólar (US$) / Real (R$)",
    models: "Modelos parceiros",
    highlight: false,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Quanto custa o Canvas com IA?",
    a: "O Canvas com IA pode ser usado gratuitamente dentro dos limites disponíveis na sua conta. Para continuar gerando após os créditos gratuitos, você pode comprar créditos ou escolher um plano pago. O plano Essential custa R$ 80,90/mês com 28.000 créditos, o Creator custa R$ 199,90/mês com 87.500 créditos e o Agency custa R$ 599,90/mês com 280.000 créditos.",
  },
  {
    q: "Preciso colocar cartão de crédito para usar?",
    a: "Não. Você pode usar o Canvas com IA gratuitamente dentro dos limites disponíveis na sua conta, sem cadastrar cartão de crédito. Quando quiser continuar gerando após os créditos gratuitos, poderá comprar créditos ou escolher um plano pago.",
  },
  {
    q: "O que é um Canvas node-based com IA?",
    a: "É um editor visual em que você organiza diferentes nós em um canvas. Você pode adicionar imagens de referência, conectar essas imagens a nós de geração, inserir instruções em texto e criar novos conteúdos visuais dentro do mesmo projeto.",
  },
  {
    q: "Quais nós estão disponíveis no Canvas?",
    a: "O Canvas inclui nós de Prompt de texto, Upload de imagem, Geração de imagem, Geração de vídeo e Saída. Os nós de geração de imagem oferecem modelos como FLUX, GPT Image, Gemini e Seedream, enquanto os nós de vídeo incluem modelos como Seedance 2.5 e Veo 3.1.",
  },
  {
    q: "Posso salvar e reutilizar workflows?",
    a: "Sim. Você pode salvar seus workflows para reutilizar a estrutura em novos projetos e organizar processos de criação visual com mais rapidez.",
  },
  {
    q: "Posso usar os resultados do Canvas comercialmente?",
    a: "Sim. Os resultados gerados pelo Canvas podem ser usados comercialmente em anúncios, e-commerce, redes sociais e materiais de marketing, conforme os termos aplicáveis ao serviço e aos modelos utilizados. Os resultados são entregues sem marca d'água.",
  },
  {
    q: "Qual a diferença entre Canvas e o gerador de imagens?",
    a: "O gerador de imagens cria imagens diretamente a partir de uma solicitação. O Canvas permite organizar diferentes nós em um espaço visual, conectar imagens de referência aos nós de geração, adicionar prompts e combinar diferentes etapas de criação dentro do mesmo projeto.",
  },
  {
    q: "Preciso saber programar para usar o Canvas?",
    a: "Não. O Canvas é visual e node-based. Você adiciona nós, conecta imagens de referência e organiza as etapas visualmente, sem precisar escrever código ou dominar programação.",
  },
  {
    q: "O Canvas funciona com imagens e vídeos?",
    a: "Sim. O Canvas oferece nós para geração de imagens e vídeos. Você pode trabalhar com referências visuais, prompts e diferentes modelos de geração dentro do mesmo canvas.",
  },
  {
    q: "Quais modelos de IA estão disponíveis no Canvas?",
    a: "O Canvas integra modelos de imagem como FLUX, GPT Image, Gemini e Seedream, além de modelos de vídeo como Seedance 2.5 e Veo 3.1. Você escolhe o modelo disponível no nó de geração conforme a necessidade do projeto.",
  },
  {
    q: "O Canvas tem resolução máxima?",
    a: "A resolução disponível depende do modelo de IA utilizado no nó de geração. Alguns modelos e configurações podem oferecer geração em até 4K.",
  },
  {
    q: "Os resultados do Canvas têm marca d'água?",
    a: "Não. Os resultados gerados pelo Canvas são entregues sem marca d'água, podendo ser utilizados em anúncios, catálogos, e-commerce e redes sociais, conforme os termos aplicáveis.",
  },
  {
    q: "Como criar uma imagem com referência no Canvas?",
    a: "Adicione uma imagem de referência ao Canvas e conecte-a ao nó de geração. Depois, clique na imagem conectada para carregá-la na caixa de entrada, escreva o prompt descrevendo o resultado desejado e gere a nova imagem usando a referência.",
  },
];

// ─── buildModelList (same logic as web) ──────────────────────────────────
const BRAND_MAP = [
  {
    match: (id: string) => id.startsWith("flux"),
    name: "FLUX",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/flux.webp",
    category: "Imagem" as const,
  },
  {
    match: (id: string) => id.startsWith("gpt"),
    name: "OpenAI",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/openai.webp",
    category: "Imagem" as const,
  },
  {
    match: (id: string) => id.startsWith("gemini"),
    name: "Google",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/googlenewlogo.webp",
    category: "Imagem" as const,
  },
  {
    match: (id: string) => id.startsWith("seedream"),
    name: "Seedream",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
    category: "Imagem" as const,
  },
  {
    match: (id: string) => id.startsWith("sd-"),
    name: "Stability AI",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/stability.webp",
    category: "Imagem" as const,
  },
  {
    match: (id: string) => id.startsWith("veo"),
    name: "Google Veo",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/googlenewlogo.webp",
    category: "Vídeo" as const,
  },
  {
    match: (id: string) => id.startsWith("seedance"),
    name: "Seedance",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
    category: "Vídeo" as const,
  },
  {
    match: (id: string) => id.startsWith("wan"),
    name: "Wan AI",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/wan.webp",
    category: "Vídeo" as const,
  },
  {
    match: (id: string) => id.startsWith("pixverse"),
    name: "PixVerse",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/pixverse.webp",
    category: "Vídeo" as const,
  },
  {
    match: (id: string) => id.startsWith("pika"),
    name: "Pika",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/pika.webp",
    category: "Vídeo" as const,
  },
  {
    match: (id: string) => id.startsWith("kling"),
    name: "Kling",
    logo: "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/kling.webp",
    category: "Vídeo" as const,
  },
];

function buildModelList() {
  const allModels = [
    ...Object.values(AI_IMAGE_MODELS).filter((m) => m.status === "available"),
    ...Object.values(AI_VIDEO_MODELS).filter((m) => m.status === "available"),
  ];
  const seen = new Set<string>();
  const brands: {
    id: string;
    name: string;
    logo: string;
    category: "Imagem" | "Vídeo";
  }[] = [];
  for (const model of allModels) {
    const brand = BRAND_MAP.find((b) => b.match(model.id));
    if (!brand || seen.has(brand.name)) continue;
    seen.add(brand.name);
    brands.push({
      id: brand.name.toLowerCase().replace(/\s+/g, "-"),
      name: brand.name,
      logo: brand.logo,
      category: brand.category,
    });
  }
  brands.sort((a, b) =>
    a.category === b.category ? 0 : a.category === "Imagem" ? -1 : 1,
  );
  return brands;
}

// ─── Draggable node card ──────────────────────────────────────────────────
interface NodeCardProps {
  label: string;
  image: string;
  prompt: string;
  port: "left" | "right";
}

function NodeCard({ label, image, prompt, port }: NodeCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => pan.extractOffset(),
    }),
  ).current;

  return (
    <Animated.View
      style={[styles.nodeCard, { transform: pan.getTranslateTransform() }]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.nodeCardLabel}>{label}</Text>
      <Image
        source={{ uri: image }}
        style={styles.nodeCardImage}
        resizeMode="cover"
      />
      <Text style={styles.nodeCardPrompt} numberOfLines={1}>
        {prompt}
      </Text>
      <View
        style={[
          styles.nodePort,
          port === "right" ? styles.nodePortRight : styles.nodePortLeft,
        ]}
      />
    </Animated.View>
  );
}

// ─── Mini flow stage (hero background) ───────────────────────────────────
const FLOW_CARDS: NodeCardProps[] = [
  {
    label: "Upload de imagem",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/canvas_capa_1.webp",
    prompt: "Foto do produto",
    port: "right",
  },
  {
    label: "Geração de imagem",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/exemplo_canvas_2.webp",
    prompt: "Produto em cena realista",
    port: "right",
  },
  {
    label: "Geração de imagem",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/canvas_capa_2.webp",
    prompt: "Criativo para anúncio",
    port: "left",
  },
  {
    label: "Geração de vídeo",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/exemplo_canvas_3.webp",
    prompt: "Vídeo UGC curto",
    port: "left",
  },
];

function FlowStage() {
  return (
    <View style={styles.flowStage} pointerEvents="box-none">
      <View style={styles.flowRow}>
        {FLOW_CARDS.slice(0, 2).map((card) => (
          <NodeCard key={card.prompt} {...card} />
        ))}
        {/* Centre node */}
        <View style={styles.flowNode}>
          <Wand2 size={20} color="#ffffff" />
        </View>
        {FLOW_CARDS.slice(2).map((card) => (
          <NodeCard key={card.prompt} {...card} />
        ))}
      </View>
    </View>
  );
}

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
interface CanvasScreenProps {
  userPlan?: UserPlan;
  userCredits?: number;
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function CanvasScreen({}: CanvasScreenProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const modelList = useMemo(() => buildModelList(), []);
  // Double for the infinite scroll feel
  const marqueeModels = useMemo(
    () => [...modelList, ...modelList],
    [modelList],
  );

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
          {/* Draggable flow stage in the background */}
          <View style={styles.heroFlowBg} pointerEvents="box-none">
            <FlowStage />
          </View>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Canvas com IA: Fluxos de Imagem e Vídeo
            </Text>
            <Text style={styles.heroSubtitle}>
              Monte fluxos visuais conectando nós de Prompt, Geração de imagem,
              Geração de vídeo e Saída em um canvas infinito. Integra FLUX, GPT
              Image, Gemini, Seedream, Seedance 2.5 e Veo 3.1 em um único editor
              — salve workflows e reutilize pipelines em escala.
            </Text>
            <View style={styles.heroCtas}>
              <TouchableOpacity
                style={styles.ctaPink}
                activeOpacity={0.85}
                onPress={() => router.push(CANVAS_TOOL_ROUTE as any)}
              >
                <Text style={styles.ctaPinkText}>Abrir Canvas Agora</Text>
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

        {/* ═══════════════════ DEMO VIDEO ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>Veja o Canvas em ação</Text>
            <Text style={styles.sectionBody}>
              Do prompt ao resultado final: monte um fluxo com múltiplos nós,
              conecte as etapas e execute tudo em um único canvas.
            </Text>
          </View>
          {/* Browser-chrome frame */}
          <View style={styles.videoFrame}>
            <View style={styles.videoChromeBar}>
              <View
                style={[
                  styles.chromeDot,
                  { backgroundColor: "rgba(239,68,68,0.8)" },
                ]}
              />
              <View
                style={[
                  styles.chromeDot,
                  { backgroundColor: "rgba(234,179,8,0.8)" },
                ]}
              />
              <View
                style={[
                  styles.chromeDot,
                  { backgroundColor: "rgba(34,197,94,0.8)" },
                ]}
              />
              <Text style={styles.chromeUrl}>canvas.trendyuu.com</Text>
            </View>
            <ExpoVideo
              source={{ uri: CANVAS_DEMO_VIDEO }}
              posterSource={{ uri: CANVAS_DEMO_THUMB }}
              style={styles.demoVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
              accessibilityLabel="Demonstração do Canvas com IA da TrendYuu"
            />
          </View>
        </View>

        {/* ═══════════════════ MODELOS (marquee) ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Modelos de IA disponíveis no Canvas
            </Text>
            <Text style={styles.sectionBody}>
              Os principais modelos de imagem e vídeo do mercado — FLUX, GPT
              Image, Gemini, Seedream, Seedance 2.5 e outros integrados em um
              único canvas.
            </Text>
          </View>
          <FlatList
            data={marqueeModels}
            keyExtractor={(item, i) => `${item.id}-${i}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.marqueeList}
            renderItem={({ item }) => (
              <View style={styles.marqueePill}>
                <Image
                  source={{ uri: item.logo }}
                  style={styles.marqueeLogo}
                  resizeMode="contain"
                  accessibilityLabel={`Logo ${item.name}`}
                />
                <Text style={styles.marqueeLabel}>{item.name}</Text>
              </View>
            )}
          />
        </View>

        {/* ═══════════════════ COMO FUNCIONA ═══════════════════ */}
        <View style={styles.section}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Como funciona o Canvas com IA?
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
                  <View style={styles.stepTextWrap}>
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
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>O que é um Canvas com IA?</Text>
            <Text style={styles.bodyText}>
              Um Canvas com IA é um editor visual em que você cria fluxos
              conectando nós. Cada nó faz uma operação específica — gerar
              imagem, gerar vídeo — e você liga a saída de um nó na entrada de
              outro para montar um pipeline completo de criação visual.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 12 }]}>
              Com o TrendYuu Canvas, você pode criar desde fluxos simples de
              geração de imagem até pipelines encadeados com múltiplas etapas,
              tudo em um canvas infinito. Você salva os workflows, reutiliza em
              novos projetos e compartilha com a equipe — padronizando a
              produção de criativos em escala.
            </Text>
            <View style={styles.cardGrid}>
              {[
                [
                  "Editor visual com IA",
                  "Arraste nós, conecte as saídas nas entradas e monte pipelines completos sem precisar de algo sob medida e sem sair do Canvas.",
                ],
                [
                  "Canvas infinito",
                  "Trabalhe com zoom, pan e organização livre. Monte fluxos grandes com múltiplos nós em paralelo em uma área sem limites.",
                ],
                [
                  "Workflows salvos e reutilizáveis",
                  "Salve os fluxos que funcionam, reutilize em novos projetos e compartilhe com sua equipe para padronizar pipelines de criação.",
                ],
                [
                  "Imagem e vídeo no mesmo fluxo",
                  "Combine nós de geração de imagem (FLUX, GPT Image, Gemini, Seedream) e de vídeo (Seedance 2.5, Veo 3.1) em um único workflow.",
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

        {/* ═══════════════════ WORKFLOWS PRONTOS ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>Workflows prontos para usar</Text>
            <Text style={styles.sectionBody}>
              Clique em um exemplo e abra direto no Canvas. Você pode usar como
              está ou adaptar para o seu projeto.
            </Text>
          </View>
          <FlatList
            data={WORKFLOW_EXAMPLES}
            keyExtractor={(item) => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.workflowList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.workflowCard}
                activeOpacity={0.85}
                onPress={() => router.push(item.href as any)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.workflowImage}
                  resizeMode="cover"
                  accessibilityLabel={`Exemplo de workflow: ${item.title}`}
                />
                <View style={styles.workflowCardBody}>
                  <View style={styles.workflowTitleRow}>
                    <Box size={14} color="#ec4899" />
                    <Text style={styles.workflowTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.workflowDesc}>{item.description}</Text>
                  <View style={styles.workflowCta}>
                    <Text style={styles.workflowCtaText}>Abrir no Canvas</Text>
                    <ArrowRight size={12} color="#f472b6" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ═══════════════════ BENEFÍCIOS ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Crie mais conteúdo a partir de uma única ideia
            </Text>
            <Text style={styles.sectionBody}>
              Use o Canvas para transformar produtos, referências e ideias em
              diferentes criativos para anúncios, redes sociais e vendas.
            </Text>
            <View style={styles.benefitsGrid}>
              {[
                [
                  Wand2,
                  "Transforme ideias em criativos",
                  "Comece com uma ideia, produto ou imagem de referência e desenvolva diferentes peças de conteúdo dentro do mesmo fluxo.",
                ],
                [
                  Layers,
                  "Crie várias peças de uma vez",
                  "Monte combinações diferentes de imagens e vídeos para testar novos criativos sem precisar começar tudo novamente.",
                ],
                [
                  RefreshCw,
                  "Reaproveite o que já funciona",
                  "Salve seus fluxos e reutilize estruturas que já deram certo para criar novos conteúdos com mais rapidez.",
                ],
                [
                  Zap,
                  "Menos ferramentas, mais produção",
                  "Organize diferentes etapas da criação em um único lugar, evitando ficar alternando entre várias ferramentas para produzir seus criativos.",
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

        {/* ═══════════════════ ALTERNATIVA AO COMFYUI ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Alternativa ao ComfyUI, Weavy e Freepik Spaces
            </Text>
            <Text style={styles.bodyText}>
              Se você procura uma alternativa ao ComfyUI, ao Weavy ou ao Freepik
              Spaces, o Canvas da TrendYuu entrega o mesmo conceito de fluxo
              visual com IA — em português, com cobrança em reais e sem precisar
              instalar nada no seu computador.
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 20 }}
          >
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                {[
                  "Ferramenta",
                  "Idioma",
                  "Instalação",
                  "Cobrança",
                  "Modelos inclusos",
                ].map((h) => (
                  <Text
                    key={h}
                    style={[styles.tableCell, styles.tableHeaderCell]}
                  >
                    {h}
                  </Text>
                ))}
              </View>
              {COMPARISON_ROWS.map((row, i) => (
                <View
                  key={row.tool}
                  style={[
                    styles.tableRow,
                    i < COMPARISON_ROWS.length - 1 && styles.tableRowBorder,
                    row.highlight && styles.tableRowHighlight,
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      row.highlight
                        ? styles.tableCellPrimary
                        : styles.tableCellNeutral,
                    ]}
                  >
                    {row.tool}
                  </Text>
                  <Text style={styles.tableCell}>{row.lang}</Text>
                  <Text style={styles.tableCell}>{row.install}</Text>
                  <Text style={styles.tableCell}>{row.billing}</Text>
                  <Text style={[styles.tableCell, { minWidth: 220 }]}>
                    {row.models}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ═══════════════════ COLABORAÇÃO ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Image
              source={{
                uri: "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/canvas_colaboração.webp",
              }}
              style={styles.collabImage}
              resizeMode="contain"
              accessibilityLabel="Equipe colaborando em um workflow no Canvas com IA da TrendYuu"
            />
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Colabore com sua equipe no mesmo Canvas
            </Text>
            <Text style={styles.bodyText}>
              Trabalhe em conjunto com designers, editores e profissionais de
              performance no mesmo workflow. Cada membro contribui com sua parte
              do pipeline — do prompt à exportação final — sem precisar alternar
              entre ferramentas ou perder o contexto do projeto.
            </Text>
            <View style={styles.collabList}>
              {[
                [
                  "Compartilhe workflows com o time",
                  "todos trabalham na mesma estrutura, mantendo o padrão visual da marca.",
                ],
                [
                  "Divida etapas entre os membros",
                  "um cria o prompt, outro ajusta a imagem, outro gera o vídeo. Cada um no seu nó.",
                ],
                [
                  "Padronize a produção de criativos",
                  "reutilize pipelines aprovados em novos projetos e escale a produção sem perder qualidade.",
                ],
              ].map(([strong, rest], i) => (
                <View key={strong} style={styles.collabItem}>
                  <View style={styles.collabBadge}>
                    <Text style={styles.collabBadgeText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.collabText}>
                    <Text style={styles.collabStrong}>{strong}</Text>
                    {" — "}
                    {rest}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[
                styles.ctaPink,
                { alignSelf: "flex-start", marginTop: 24 },
              ]}
              activeOpacity={0.85}
              onPress={() => router.push(CANVAS_TOOL_ROUTE as any)}
            >
              <Text style={styles.ctaPinkText}>Começar a colaborar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════ PARA QUEM É ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Para quem é o Canvas com IA?
            </Text>
            <Text style={styles.sectionBody}>
              O Canvas foi feito para quem precisa produzir criativos que vendem
              — imagens de produto, vídeos de anúncio e conteúdo para redes
              sociais — sem depender de estúdio, fotógrafo ou equipe grande.
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
                <Text style={styles.audienceTitle}>{item.title}</Text>
              </View>
            )}
          />
        </View>

        {/* ═══════════════════ FERRAMENTAS RELACIONADAS ═══════════════════ */}
        <View style={styles.section}>
          <View style={styles.px}>
            <Text style={styles.sectionTitleSm}>Outras ferramentas de IA</Text>
            <Text style={styles.sectionBody}>
              Combine o Canvas com outras ferramentas para escalar sua produção
              visual.
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
              Perguntas frequentes sobre Canvas com IA
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
              Pronto para montar seu primeiro fluxo com IA?
            </Text>
            <Text style={styles.ctaBody}>
              Abra o Canvas, escolha um workflow pronto ou comece do zero, e
              escale sua produção de imagem e vídeo sem depender de estúdio,
              fotógrafo ou equipe grande.
            </Text>
            <View style={styles.ctaButtons}>
              <TouchableOpacity
                style={styles.ctaPink}
                activeOpacity={0.85}
                onPress={() => router.push(CANVAS_TOOL_ROUTE as any)}
              >
                <Text style={styles.ctaPinkText}>Abrir Canvas Agora</Text>
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

  // --- NODE CARDS (draggable) ---
  flowStage: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  flowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  flowNode: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#db2777",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#db2777",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  nodeCard: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.7)",
    backgroundColor: "rgba(23,23,23,0.9)",
    overflow: "visible",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  nodeCardLabel: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 2,
    fontSize: 10,
    color: "#a1a1aa",
  },
  nodeCardImage: {
    width: "100%",
    height: 90,
  },
  nodeCardPrompt: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    color: "#e4e4e7",
  },
  nodePort: {
    position: "absolute",
    top: "50%",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f472b6",
    shadowColor: "#ec4899",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    marginTop: -6,
  },
  nodePortRight: { right: -6 },
  nodePortLeft: { left: -6 },

  // --- HERO ---
  heroSection: {
    minHeight: 520,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heroFlowBg: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    opacity: 0.35,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.55)",
  },
  heroContent: {
    position: "relative",
    zIndex: 10,
    paddingHorizontal: 24,
    paddingTop: 80,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#db2777",
    borderRadius: 999,
  },
  ctaPinkText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  ctaOutline: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 999,
    backgroundColor: "rgba(23,23,23,0.6)",
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

  // --- DEMO VIDEO ---
  videoFrame: {
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.8)",
    backgroundColor: "#09090b",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  videoChromeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
    backgroundColor: "rgba(10,10,10,0.7)",
  },
  chromeDot: { width: 10, height: 10, borderRadius: 5 },
  chromeUrl: {
    fontSize: 11,
    color: "#52525b",
    marginLeft: 8,
  },
  demoVideo: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },

  // --- MARQUEE ---
  marqueeList: { paddingHorizontal: 24, gap: 8, paddingVertical: 12 },
  marqueePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(39,39,42,0.4)",
  },
  marqueeLogo: { width: 28, height: 28 },
  marqueeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#e4e4e7",
  },

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
  stepTextWrap: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: "600" },
  stepTitleActive: { color: "#f5f5f5" },
  stepTitleInactive: { color: "#d4d4d8" },
  stepDesc: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  stepDescActive: { color: "#a1a1aa" },
  stepDescInactive: { color: "#71717a" },

  // --- INFO CARDS ---
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

  // --- WORKFLOWS ---
  workflowList: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 16,
    paddingBottom: 4,
  },
  workflowCard: {
    width: 280,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "rgba(39,39,42,0.4)",
    overflow: "hidden",
  },
  workflowImage: { width: 280, aspectRatio: 16 / 9 },
  workflowCardBody: { padding: 16 },
  workflowTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  workflowTitle: { fontSize: 14, fontWeight: "600", color: "#f5f5f5" },
  workflowDesc: { fontSize: 12, color: "#a1a1aa", lineHeight: 20 },
  workflowCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  workflowCtaText: { fontSize: 12, fontWeight: "500", color: "#f472b6" },

  // --- BENEFITS ---
  benefitsGrid: { gap: 24, marginTop: 8 },
  benefitItem: {},
  benefitIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  benefitTitle: { fontSize: 16, fontWeight: "500", color: "#f5f5f5" },
  benefitDesc: { fontSize: 13, color: "#a1a1aa", lineHeight: 20 },

  // --- COMPARISON TABLE ---
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
  tableRowHighlight: { backgroundColor: "rgba(236,72,153,0.04)" },
  tableCell: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    color: "#a1a1aa",
    minWidth: 120,
  },
  tableHeaderCell: { color: "#d4d4d8", fontWeight: "500" },
  tableCellPrimary: { color: "#f5f5f5", fontWeight: "600" },
  tableCellNeutral: { color: "#d4d4d8" },

  // --- COLLAB ---
  collabImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
  },
  collabList: { gap: 16, marginTop: 20 },
  collabItem: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  collabBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(236,72,153,0.1)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  collabBadgeText: { fontSize: 11, fontWeight: "700", color: "#ec4899" },
  collabText: { fontSize: 13, color: "#d4d4d8", lineHeight: 20, flex: 1 },
  collabStrong: { color: "#f5f5f5", fontWeight: "600" },

  // --- AUDIENCES ---
  audienceList: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 16,
    paddingBottom: 4,
  },
  audienceCard: {
    width: 220,
    height: 280,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#3f3f46",
    justifyContent: "flex-end",
    padding: 16,
  },
  audienceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.55)",
  },
  audienceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f5f5f5",
    position: "relative",
    zIndex: 1,
  },

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
    backgroundColor: "rgba(10,10,10,0.7)",
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
  ctaButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
});
