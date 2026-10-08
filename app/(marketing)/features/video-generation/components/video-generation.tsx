"use client";

// src/app/features/video-generation/components/VideoGenerationScreen.tsx

import Navbar from "@/src/components/main_page/Navbar";
import Footer from "@/src/components/main_page/footer";
import {
  AI_VIDEO_MODELS,
  AIVideoModelConfig,
  getAIVideoModelLogo,
} from "@/src/types/aiModels";
import { UserPlan } from "@/src/types/user";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HERO_VIDEO_SRC =
  "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/video_gerar_video.webm";
const TEXT_TO_VIDEO_ROUTE = "/ai-tools/text-to-video";
const PRICING_ROUTE = "/pricing";

// ─── Passos do "Como funciona" ────────────────────────────────────────────
const HOW_STEPS = [
  {
    number: "01",
    title: "Abra o gerador de vídeos com IA",
    description:
      "Acesse a ferramenta de texto para vídeo da TrendYuu direto no navegador, sem instalar nada.",
    image: "/how_to_use/tutorial_gerar_video1.png",
    imageAlt:
      "Passo 1: tela inicial do gerador de vídeos com IA da TrendYuu aberto no navegador",
  },
  {
    number: "02",
    title: "Escolha o modelo de IA",
    description:
      "Selecione entre Seedance 2.0 Mini, Seedance 2.0, Seedance 2.5, Veo 3.1 Lite, Veo 3.1 Fast e Veo 3.1 de acordo com o tipo de visual, realismo, velocidade e nível de detalhe que você precisa.",
    image: "/how_to_use/tutorial_gerar_video2.png",
    imageAlt:
      "Passo 2: seleção do modelo de IA (Seedance ou Veo) no gerador de vídeos da TrendYuu",
  },
  {
    number: "03",
    title: "Descreva o vídeo e gere",
    description:
      "Digite o prompt descrevendo o que você quer ver — produto, cena, movimento, iluminação — e clique em gerar. Baixe o vídeo pronto para usar em anúncios, redes sociais e e-commerce.",
    image: "/how_to_use/tutorial_gerar_video3.png",
    imageAlt:
      "Passo 3: campo de prompt sendo preenchido e vídeo sendo gerado no gerador de vídeos da TrendYuu",
  },
] as const;

// ─── Galeria de exemplos ──────────────────────────────────────────────────
interface VideoExample {
  id: string;
  model: string;
  thumb?: string;
  video: string;
  prompt: string;
}

const video_ai: VideoExample[] = [
  {
    id: "smart-showcase",
    model: "Smart Video · Product Showcase",
    video: "/videos/videoai1.mp4",
    thumb: undefined,
    prompt: "TODO: prompt usado neste vídeo",
  },
  {
    id: "smart-unboxing",
    model: "Smart Video · Unboxing",
    video: "/videos/videoai2.mp4",
    thumb: undefined,
    prompt: "TODO: prompt usado neste vídeo",
  },
  {
    id: "ai-video",
    model: "AI Video",
    video: "/videos/videoai3.mp4",
    thumb: undefined,
    prompt: "TODO: prompt usado neste vídeo",
  },
  {
    id: "canvas-1",
    model: "Canvas Video",
    video: "/videos/videoai4.mp4",
    thumb: undefined,
    prompt: "TODO: prompt usado neste vídeo",
  },
];

// ─── Provedores ────────────────────────────────────────────────────────────
interface ProviderGroup {
  id: string;
  label: string;
  logo: string;
  intro: string;
}

const PROVIDER_ORDER: string[] = ["seedance", "veo"];

const PROVIDER_META: Record<string, { label: string; intro: string }> = {
  seedance: {
    label: "Seedance",
    intro:
      "Seedance é a família de modelos de vídeo da ByteDance, focada em geração rápida com estética limpa e consistente. Vem em variantes Mini (prototipagem), 2.0 (equilíbrio) e 2.5 (cinematográfico), com suporte a imagens de referência e múltiplas resoluções (720p, 1080p e 4K).",
  },
  veo: {
    label: "Veo",
    intro:
      "Veo é a família de modelos de geração de vídeo do Google, conhecida por realismo cinematográfico, movimentos de câmera naturais e som integrado. Vem em variantes Lite (rápida e econômica), Fast (equilíbrio) e Pro (máxima qualidade).",
  },
};

// ─── Tabela comparativa ───────────────────────────────────────────────────
const COMPARE_ROWS = [
  ["Seedance 2.0 Mini", "Boa", "5s", "Não", "Baixo", "Prototipagem rápida"],
  ["Seedance 2.0", "Muito boa", "5–10s", "Não", "Médio", "Testes em escala"],
  [
    "Seedance 2.5",
    "Cinematográfica",
    "5–10s",
    "Sim",
    "Alto",
    "Vídeo de produto premium",
  ],
  ["Veo 3.1 Lite", "Muito boa", "5–10s", "Sim", "Médio", "Custo-benefício"],
  ["Veo 3.1 Fast", "Cinematográfica", "5–10s", "Sim", "Alto", "Campanhas"],
  ["Veo 3.1", "Máxima", "5–10s", "Sim", "Máximo", "Peças finais"],
];

// ─── Casos de uso ─────────────────────────────────────────────────────────
const USE_CASES = [
  [
    "Vídeos de produtos",
    "Crie cenas, movimentos de câmera e composições para produtos e lojas virtuais.",
  ],
  [
    "Vídeos para anúncios",
    "Desenvolva conceitos visuais para campanhas, ofertas e testes criativos.",
  ],
  [
    "Conteúdo para redes sociais",
    "Produza vídeos para Shorts, Reels, TikTok, carrosséis e campanhas sociais.",
  ],
  [
    "Vídeos para e-commerce",
    "Crie materiais visuais para páginas de produto, vitrines e catálogos.",
  ],
  [
    "Criativos para afiliados",
    "Transforme ideias de ofertas em vídeos para divulgação e aquisição.",
  ],
  [
    "Conceitos visuais",
    "Explore ideias, estilos, cenários e direções criativas rapidamente.",
  ],
];

// ─── Ferramentas relacionadas ──────────────────────────────────────────────
const RELATED_TOOLS = [
  {
    href: "/features/image-generation",
    label: "Gerador de Imagens com IA",
    desc: "Crie imagens a partir de texto",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/image_background_page.webp",
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
    desc: "Vídeos de produto com IA para anúncios",
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

// ─── FAQs ─────────────────────────────────────────────────────────────────
const FAQS_PRIMARY = [
  {
    q: "Quanto custa o gerador de vídeos com IA?",
    a: "O plano Essential começa em R$ 80,90/mês com 28.000 créditos. O plano Creator custa R$ 199,90/mês com 87.500 créditos e acesso a modelos premium como Veo 3.1 Fast e Seedance 2.5. O plano Agency custa R$ 599,90/mês com 280.000 créditos e alta volumetria em 4K.",
  },
  {
    q: "Preciso colocar cartão de crédito para testar?",
    a: "Sim. O acesso aos modelos de geração de vídeo requer a assinatura de um plano. Você pode explorar os modelos e preços livremente antes de assinar, e o cadastro leva menos de 30 segundos.",
  },
  {
    q: "Posso usar os vídeos gerados comercialmente?",
    a: "Sim. Os vídeos gerados podem ser usados comercialmente em anúncios, e-commerce, redes sociais e materiais de marketing, sem marca d'água e sem necessidade de crédito adicional.",
  },
  {
    q: "Qual a diferença entre esse gerador e outros geradores de vídeo por IA?",
    a: "Este gerador reúne em uma única plataforma os principais modelos do mercado — Seedance 2.0 Mini, Seedance 2.0, Seedance 2.5, Veo 3.1 Lite, Veo 3.1 Fast e Veo 3.1 — com foco em vídeos de produto e criativos de anúncio. Você não precisa assinar várias ferramentas nem gerenciar chaves de API separadas.",
  },
  {
    q: "Preciso saber escrever prompts?",
    a: "Não. Você pode descrever o que quer em linguagem simples do dia a dia — sem precisar entender de prompt engineering. Ex: 'vídeo cinematográfico de um relógio de couro girando sobre mesa de madeira, luz suave da manhã, movimento suave de câmera'.",
  },
  {
    q: "Quais formatos e resoluções de vídeo são suportados?",
    a: "Os modelos suportam resoluções de 720p, 1080p e 4K, nos formatos 16:9 (widescreen), 9:16 (vertical para Shorts, Reels e TikTok) e 1:1 (quadrado). As durações disponíveis são de 5s e 10s por clipe.",
  },
  {
    q: "Qual modelo é melhor para vídeos de produto?",
    a: "Para vídeos de produto, Veo 3.1 e Seedance 2.5 entregam o melhor equilíbrio entre realismo, movimento de câmera e consistência visual. Seedance 2.0 Mini e Seedance 2.0 são ideais para testes rápidos e criativos em escala.",
  },
  {
    q: "Os vídeos gerados têm marca d'água?",
    a: "Não. Todos os vídeos gerados são entregues sem marca d'água, prontos para uso em anúncios, catálogos e redes sociais.",
  },
];

const FAQS_EXTRA = [
  {
    q: "Como criar um vídeo com IA?",
    a: "Descreva o vídeo que deseja ou envie uma imagem de referência, escolha um modelo de geração e envie a solicitação. O modelo interpreta a descrição e cria um novo vídeo de acordo com as características informadas.",
  },
  {
    q: "O que é texto para vídeo?",
    a: "Texto para vídeo é uma tecnologia de inteligência artificial que transforma uma descrição escrita em um vídeo. Você descreve uma cena, produto ou conceito e o modelo gera o vídeo correspondente.",
  },
  {
    q: "Posso gerar vídeos sem saber escrever prompts?",
    a: "Sim. Você pode começar com uma descrição em linguagem natural, como explicaria a ideia para outra pessoa. Quanto mais contexto relevante você fornecer, mais direcionado pode ser o resultado.",
  },
  {
    q: "Como criar vídeos de produtos com IA?",
    a: "Você pode descrever o produto e a cena desejada ou trabalhar com uma imagem de referência quando o modelo escolhido oferecer esse recurso. Isso permite explorar movimentos de câmera, ambientes, iluminação e composições diferentes para marketing e e-commerce.",
  },
  {
    q: "Como criar vídeos para redes sociais com IA?",
    a: "Crie vídeos verticais para Shorts, Reels e TikTok, com formato 9:16 e duração otimizada para cada plataforma. Depois, use os materiais em campanhas, páginas de produto e anúncios.",
  },
  {
    q: "Qual modelo de IA devo usar para gerar um vídeo?",
    a: "Depende do resultado que você procura. Seedance 2.0 Mini é ideal para prototipagem rápida. Seedance 2.0 e Veo 3.1 Lite equilibram qualidade e custo. Seedance 2.5, Veo 3.1 Fast e Veo 3.1 entregam qualidade cinematográfica com movimento natural e som integrado.",
  },
];

// ─── Sub-component: FAQ item ───────────────────────────────────────────────
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

// ─── Props ─────────────────────────────────────────────────────────────────
interface VideoGenerationScreenProps {
  userPlan?: UserPlan;
  userCredits?: number;
}

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function VideoGenerationScreen({}: VideoGenerationScreenProps) {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [activeProviderId, setActiveProviderId] = useState<string>("seedance");

  const providers: ProviderGroup[] = useMemo(() => {
    const groups: Record<string, AIVideoModelConfig[]> = {};
    Object.values(AI_VIDEO_MODELS).forEach((model) => {
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
        logo: getAIVideoModelLogo(firstModel.id),
        intro: meta.intro,
      };
    });
  }, []);

  const activeModels = useMemo(
    () =>
      Object.values(AI_VIDEO_MODELS).filter((m) =>
        m.id.startsWith(activeProviderId),
      ),
    [activeProviderId],
  );

  const activeProvider =
    providers.find((p) => p.id === activeProviderId) ?? providers[0];

  return (
    <View style={styles.root}>
      {/* ── Sticky header ── */}
      <Navbar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════ HERO ═══════════════════ */}
        <View style={styles.heroSection}>
          <ExpoVideo
            source={{ uri: HERO_VIDEO_SRC }}
            style={StyleSheet.absoluteFillObject}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Gerador de Vídeos com IA</Text>
            <Text style={styles.heroSubtitle}>
              Crie vídeos com inteligência artificial a partir de texto ou
              imagem e transforme ideias em vídeos profissionais em segundos.
              Gere vídeos de produto, criativos para anúncios, conteúdo para
              Shorts, Reels e TikTok usando Seedance 2.0 Mini, Seedance 2.0,
              Seedance 2.5, Veo 3.1 Lite, Veo 3.1 Fast e Veo 3.1 em uma única
              plataforma — sem precisar dominar edição ou prompt engineering.
            </Text>
            <View style={styles.heroCtas}>
              <TouchableOpacity
                style={styles.ctaPink}
                activeOpacity={0.85}
                onPress={() => router.push(TEXT_TO_VIDEO_ROUTE as any)}
              >
                <Text style={styles.ctaPinkText}>Gerar Vídeo com IA</Text>
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

        {/* ═══════════════════ COMO FUNCIONA ═══════════════════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como gerar vídeos por IA</Text>

          {/* Step image */}
          <View style={styles.stepImageContainer}>
            <Image
              source={{ uri: HOW_STEPS[activeStep].image }}
              style={styles.stepImage}
              resizeMode="contain"
              accessibilityLabel={HOW_STEPS[activeStep].imageAlt}
            />
          </View>

          {/* Dot indicators */}
          <View style={styles.stepDots}>
            {HOW_STEPS.map((step, index) => (
              <TouchableOpacity
                key={step.number}
                onPress={() => setActiveStep(index)}
                style={[
                  styles.dot,
                  index === activeStep ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Step list */}
          <View style={styles.stepList}>
            {HOW_STEPS.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <TouchableOpacity
                  key={step.number}
                  onPress={() => setActiveStep(index)}
                  activeOpacity={0.8}
                  style={[styles.stepItem, isActive && styles.stepItemActive]}
                >
                  <View
                    style={[
                      styles.stepNumber,
                      isActive
                        ? styles.stepNumberActive
                        : styles.stepNumberInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumberText,
                        isActive
                          ? styles.stepNumberTextActive
                          : styles.stepNumberTextInactive,
                      ]}
                    >
                      {step.number}
                    </Text>
                  </View>
                  <View style={styles.stepTextContainer}>
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
                        styles.stepDescription,
                        isActive
                          ? styles.stepDescriptionActive
                          : styles.stepDescriptionInactive,
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

        {/* ═══════════════════ GALERIA DE EXEMPLOS ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.sectionPadded}>
            <Text style={styles.sectionTitle}>
              Exemplos de vídeos criados com IA
            </Text>
            <Text style={styles.sectionBody}>
              Veja exemplos de vídeos gerados com o gerador de vídeos com IA da
              TrendYuu.
            </Text>
          </View>

          <FlatList
            data={video_ai}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryList}
            snapToInterval={276} // card width (260) + gap (16)
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={styles.galleryCard}>
                <ExpoVideo
                  source={{ uri: item.video }}
                  style={styles.galleryVideo}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
                  isMuted
                  accessibilityLabel="Exemplo de vídeo gerado com IA na TrendYuu"
                />
              </View>
            )}
          />
        </View>

        {/* ═══════════════════ O QUE É ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.sectionPadded}>
            <Text style={styles.sectionTitle}>
              O que é uma IA que gera vídeo?
            </Text>
            <Text style={styles.bodyText}>
              Uma IA que gera vídeo é uma ferramenta que usa modelos de
              inteligência artificial para criar vídeos a partir de instruções
              em texto, imagens de referência ou combinações dos dois. Em vez de
              gravar ou editar tudo do zero, você descreve a cena que deseja e a
              IA gera o vídeo com base nessa descrição.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 12 }]}>
              Com um gerador de vídeos por IA, você pode criar desde vídeos
              conceituais até vídeos de produto, criativos para anúncios,
              conteúdo para redes sociais e materiais visuais para e-commerce. A
              qualidade do resultado depende do modelo escolhido, da descrição
              fornecida e das referências utilizadas.
            </Text>

            <View style={styles.cardGrid}>
              {[
                [
                  "Criar vídeo com IA a partir de texto",
                  "Escreva o que você quer visualizar e deixe o modelo transformar sua descrição em um vídeo. Você pode especificar produto, ambiente, movimento, iluminação, enquadramento e estilo.",
                ],
                [
                  "Texto para vídeo",
                  "A geração texto-para-vídeo permite transformar uma ideia escrita em um visual em movimento. É útil para campanhas, conteúdo social, conceitos, páginas de produto e materiais de marketing.",
                ],
                [
                  "Gerar vídeos de produtos com IA",
                  "Crie novas cenas, movimentos de câmera e ambientes para produtos sem precisar produzir cada variação em uma gravação separada. Isso permite testar diferentes cenários e direções visuais.",
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

        {/* ═══════════════════ USE CASES ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.sectionTinted]}>
          <View style={styles.sectionPadded}>
            <Text style={styles.sectionTitle}>
              O que você pode criar com um gerador de vídeos com IA?
            </Text>
            <Text style={styles.sectionBody}>
              A geração de vídeos com inteligência artificial pode ser usada em
              diferentes etapas da criação de conteúdo e do marketing digital.
            </Text>
            <View style={styles.cardGrid}>
              {USE_CASES.map(([title, description]) => (
                <View key={title} style={styles.useCaseCard}>
                  <Text style={styles.infoCardTitle}>{title}</Text>
                  <Text style={styles.infoCardDesc}>{description}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════ PAINEL DE MODELOS ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.sectionPadded}>
            <Text style={styles.sectionTitle}>
              Modelos de IA para gerar vídeo
            </Text>
            <Text style={styles.sectionBody}>
              Compare diferentes modelos de inteligência artificial para
              encontrar a opção mais adequada para gerar vídeos, vídeos de
              produto, criativos de anúncios e conteúdos visuais em escala.
            </Text>

            {/* Provider context cards */}
            <View style={styles.cardGrid}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>
                  Seedance (ByteDance) para geração de vídeos
                </Text>
                <Text style={styles.infoCardDesc}>
                  A família Seedance (ByteDance) oferece diferentes opções para
                  geração de vídeos, com variantes voltadas para velocidade,
                  equilíbrio entre qualidade e custo e resultados
                  cinematográficos mais detalhados.
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>
                  Veo (Google) para vídeos cinematográficos
                </Text>
                <Text style={styles.infoCardDesc}>
                  Os modelos Veo (Google) são indicados para vídeos
                  cinematográficos, movimentos naturais de câmera, cenas
                  complexas com som integrado e fluxos que precisam interpretar
                  diferentes elementos descritos no prompt.
                </Text>
              </View>
            </View>

            {/* Provider tab panel */}
            <View style={styles.modelPanel}>
              {/* Provider tabs (sidebar → horizontal scroll on mobile) */}
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

              {/* Active provider detail */}
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
                                `${TEXT_TO_VIDEO_ROUTE}?model=${model.id}` as any,
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

        {/* ═══════════════════ TABELA COMPARATIVA ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.sectionPadded}>
            <Text style={styles.sectionTitle}>
              Veo 3.1 vs Seedance 2.5: qual modelo usar?
            </Text>
            <Text style={styles.sectionBody}>
              Compare qualidade, duração, áudio e custo em créditos para
              escolher o modelo certo para cada tipo de vídeo.
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              {/* Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                {[
                  "Modelo",
                  "Qualidade",
                  "Duração",
                  "Áudio",
                  "Créditos",
                  "Quando usar",
                ].map((col) => (
                  <Text
                    key={col}
                    style={[styles.tableCell, styles.tableHeaderCell]}
                  >
                    {col}
                  </Text>
                ))}
              </View>
              {/* Rows */}
              {COMPARE_ROWS.map((row, i) => (
                <View
                  key={row[0]}
                  style={[
                    styles.tableRow,
                    i < COMPARE_ROWS.length - 1 && styles.tableRowBorder,
                  ]}
                >
                  {row.map((cell, j) => (
                    <Text
                      key={j}
                      style={[
                        styles.tableCell,
                        j === 0 && styles.tableCellHighlight,
                      ]}
                    >
                      {cell}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ═══════════════════ BENEFÍCIOS ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.sectionTinted]}>
          <View style={styles.sectionPadded}>
            <Text style={styles.sectionTitle}>
              Por que usar um gerador de vídeos com IA?
            </Text>
            <View style={styles.benefitsGrid}>
              {[
                [
                  Sparkles,
                  "Dispense a produtora",
                  "Vídeos de produto com qualidade de estúdio, sem agendar gravação, alugar equipamento ou pagar equipe por vídeo.",
                ],
                [
                  Zap,
                  "Escale seus criativos de anúncio",
                  "Gere dezenas de variações visuais para testes A/B sem precisar de um time de edição — feito para profissionais de performance.",
                ],
                [
                  ShieldCheck,
                  "Identidade visual consistente",
                  "Mantenha um estilo visual coeso em cada página de produto, anúncio e post — mesmo se você for um time de uma pessoa só.",
                ],
                [
                  Wand2,
                  "Da ideia ao vídeo em segundos",
                  "Sem precisar entender de prompt engineering. Descreva o que quer em linguagem simples e receba um resultado utilizável na hora.",
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

        {/* ═══════════════════ MARKETING ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.sectionPadded}>
            <Text style={styles.sectionTitle}>
              Gerador de vídeos com IA para marketing e vendas
            </Text>
            <Text style={styles.bodyText}>
              Vídeos são parte importante de anúncios, páginas de produto, redes
              sociais e campanhas digitais. Um gerador de vídeos com IA ajuda a
              transformar uma ideia de campanha em diferentes conceitos visuais
              sem depender de uma produção audiovisual para cada teste.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 12 }]}>
              Para e-commerce, isso significa criar mais opções de apresentação
              para um produto. Para performance, significa testar diferentes
              ângulos e conceitos de criativo. Para criadores e afiliados,
              significa produzir vídeos para ofertas e conteúdos com mais
              rapidez.
            </Text>
            <View style={styles.cardGrid}>
              {[
                [
                  "E-commerce",
                  "Vídeos de produtos, vitrines, catálogos e materiais para páginas de venda.",
                ],
                [
                  "Anúncios",
                  "Conceitos visuais para campanhas e testes de criativos em vídeo.",
                ],
                [
                  "Redes sociais",
                  "Shorts, Reels, TikTok e outras peças visuais em movimento.",
                ],
                [
                  "Conteúdo de venda",
                  "Vídeos para ofertas, lançamentos e materiais promocionais.",
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

        {/* ═══════════════════ FERRAMENTAS RELACIONADAS ═══════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionPadded}>
            <Text style={styles.sectionTitleSm}>Outras ferramentas de IA</Text>
            <Text style={styles.sectionBody}>
              Combine o gerador de vídeo com outras ferramentas para escalar sua
              produção visual.
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
                <View style={styles.relatedCardContent}>
                  <Text style={styles.relatedLabel}>{item.label}</Text>
                  <Text style={styles.relatedDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ═══════════════════ FAQ ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.sectionPadded}>
            <Text style={styles.sectionTitle}>
              Perguntas frequentes sobre gerador de vídeos com IA
            </Text>
            {FAQS_PRIMARY.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </View>
        </View>

        {/* ═══════════════════ FAQ EXTRA ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.sectionTinted]}>
          <View style={styles.sectionPadded}>
            <Text style={styles.sectionTitle}>
              Mais dúvidas sobre criação de vídeos com IA
            </Text>
            {FAQS_EXTRA.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </View>
        </View>

        {/* ═══════════════════ CTA FINAL ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.ctaSection]}>
          <View style={styles.sectionPadded}>
            <Text style={styles.ctaTitle}>
              Pronto para criar seu primeiro vídeo com IA?
            </Text>
            <Text style={styles.ctaBody}>
              Escolha um plano, acesse os melhores modelos de vídeo do mercado e
              gere vídeos profissionais em minutos. Ideal para e-commerce,
              anúncios e criadores de conteúdo que precisam de vídeos sem equipe
              de produção.
            </Text>
            <View style={styles.ctaButtons}>
              <TouchableOpacity
                style={styles.ctaPink}
                activeOpacity={0.85}
                onPress={() => router.push(TEXT_TO_VIDEO_ROUTE as any)}
              >
                <Text style={styles.ctaPinkText}>Começar agora</Text>
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

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(63,63,70,0.6)",
    backgroundColor: "rgba(10,10,10,0.8)",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    zIndex: 50,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // --- HERO ---
  heroSection: {
    minHeight: 480,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.65)",
  },
  heroContent: {
    position: "relative",
    zIndex: 10,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
    color: "#f5f5f5",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#d4d4d4",
    lineHeight: 22,
    marginBottom: 24,
  },
  heroCtas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  ctaPink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#db2777",
    borderRadius: 999,
  },
  ctaPinkText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  ctaOutline: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 999,
    backgroundColor: "rgba(24,24,27,0.6)",
  },
  ctaOutlineText: {
    color: "#e4e4e7",
    fontSize: 14,
    fontWeight: "500",
  },

  // --- SECTIONS ---
  section: {
    paddingTop: 48,
    paddingBottom: 48,
  },
  sectionPadded: {
    paddingHorizontal: 24,
  },
  sectionBordered: {
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    paddingTop: 48,
    paddingBottom: 48,
  },
  sectionTinted: {
    backgroundColor: "rgba(24,24,27,0.3)",
  },
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
  bodyText: {
    fontSize: 14,
    color: "#d4d4d8",
    lineHeight: 24,
    marginBottom: 8,
  },

  // --- HOW IT WORKS ---
  stepImageContainer: {
    marginTop: 20,
    marginHorizontal: 24,
    aspectRatio: 16 / 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    overflow: "hidden",
  },
  stepImage: {
    width: "100%",
    height: "100%",
  },
  stepDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#ec4899",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#3f3f46",
  },
  stepList: {
    marginHorizontal: 24,
    gap: 4,
  },
  stepItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 2,
    borderLeftColor: "transparent",
  },
  stepItemActive: {
    backgroundColor: "rgba(39,39,42,0.6)",
    borderLeftColor: "#ec4899",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  stepNumberActive: {
    backgroundColor: "rgba(236,72,153,0.1)",
    borderColor: "rgba(236,72,153,0.2)",
  },
  stepNumberInactive: {
    backgroundColor: "#18181b",
    borderColor: "#27272a",
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: "700",
  },
  stepNumberTextActive: { color: "#ec4899" },
  stepNumberTextInactive: { color: "#71717a" },
  stepTextContainer: { flex: 1 },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  stepTitleActive: { color: "#f5f5f5" },
  stepTitleInactive: { color: "#d4d4d8" },
  stepDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  stepDescriptionActive: { color: "#a1a1aa" },
  stepDescriptionInactive: { color: "#71717a" },

  // --- GALLERY ---
  galleryList: {
    paddingHorizontal: 24,
    gap: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  galleryCard: {
    width: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    overflow: "hidden",
  },
  galleryVideo: {
    width: 260,
    aspectRatio: 9 / 16,
  },

  // --- INFO CARDS ---
  cardGrid: {
    gap: 12,
    marginTop: 16,
  },
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
  infoCardDesc: {
    fontSize: 12,
    color: "#a1a1aa",
    lineHeight: 20,
  },
  useCaseCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    padding: 20,
  },

  // --- MODEL PANEL ---
  modelPanel: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    overflow: "hidden",
  },
  providerTabs: {
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  providerTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  providerTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  providerTabActive: {
    backgroundColor: "#18181b",
  },
  providerLogo: {
    width: 20,
    height: 20,
    opacity: 0.8,
  },
  providerTabLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#71717a",
  },
  providerTabLabelActive: {
    color: "#e4e4e7",
  },
  modelDetail: {
    padding: 20,
  },
  modelDetailTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e4e4e7",
  },
  modelDetailIntro: {
    fontSize: 13,
    color: "#71717a",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  modelDetailSubtitle: {
    fontSize: 13,
    color: "#d4d4d8",
    marginBottom: 12,
  },
  modelGrid: {
    gap: 12,
  },
  modelCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#09090b",
    padding: 16,
  },
  modelCardName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e4e4e7",
  },
  modelCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  modelCardCredits: {
    fontSize: 12,
    color: "#71717a",
  },
  modelCardAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  modelCardActionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#d4d4d8",
  },
  modelCardActionTextBlocked: {
    fontSize: 13,
    color: "#52525b",
  },

  // --- COMPARISON TABLE ---
  table: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  tableHeader: {
    backgroundColor: "rgba(39,39,42,0.6)",
  },
  tableCell: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    color: "#a1a1aa",
    minWidth: 110,
  },
  tableHeaderCell: {
    color: "#d4d4d8",
    fontWeight: "500",
  },
  tableCellHighlight: {
    color: "#e4e4e7",
  },

  // --- BENEFITS ---
  benefitsGrid: {
    gap: 24,
    marginTop: 20,
  },
  benefitItem: {},
  benefitIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#f5f5f5",
  },
  benefitDesc: {
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 20,
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
    minHeight: 240,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  relatedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.7)",
  },
  relatedCardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  relatedLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#e4e4e7",
  },
  relatedDesc: {
    fontSize: 11,
    color: "#a1a1aa",
    marginTop: 4,
  },

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
  faqToggle: {
    fontSize: 18,
    color: "#a1a1aa",
  },
  faqToggleOpen: {
    transform: [{ rotate: "45deg" }],
  },
  faqAnswer: {
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 22,
    marginTop: 8,
  },

  // --- CTA FINAL ---
  ctaSection: {
    alignItems: "center",
  },
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
