"use client";

import Footer from "@/src/components/main_page/footer";
import Navbar from "@/src/components/main_page/Navbar";
import {
  AI_VIDEO_MODELS,
  AIVideoModelConfig,
  getAIVideoModelLogo,
} from "@/src/types/aiModels";
import { UserPlan } from "@/src/types/user";
import { useRouter } from "expo-router";
import {
  ArrowUp,
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

// ─── Routes & assets ──────────────────────────────────────────────────────
const HERO_IMAGE_SRC =
  "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/product_video.webp";
const HOW_IMAGE_SRC =
  "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/imagem_how%20to%20create.webp";
const PRODUCT_VIDEO_ROUTE = "/ai-tools/product-video";
const PRICING_ROUTE = "/pricing";

// ─── Presets ──────────────────────────────────────────────────────────────
const SCENE_PRESETS = [
  {
    emoji: "🛍️",
    label: "Exibição de produto",
    description: "Apresentação limpa e focada para lojas online",
  },
  {
    emoji: "☕",
    label: "Lifestyle",
    description: "Produto integrado naturalmente a ambientes reais",
  },
  {
    emoji: "💎",
    label: "Luxo",
    description: "Estética premium escura para marcas de alto padrão",
  },
  {
    emoji: "🌿",
    label: "Ao ar livre",
    description: "Ambiente natural com movimento orgânico e luz natural",
  },
  {
    emoji: "📦",
    label: "Unboxing",
    description: "Revelação em primeira pessoa com movimento satisfatório",
  },
  {
    emoji: "🔍",
    label: "Close detalhado",
    description: "Foco em textura e acabamento",
  },
  {
    emoji: "📱",
    label: "Redes sociais",
    description: "Conteúdo vertical chamativo para Reels e TikTok",
  },
  {
    emoji: "🎬",
    label: "Cinematográfico",
    description: "Estilo de filme com câmera dramática",
  },
  { emoji: "🎄", label: "Sazonal", description: "Tema festivo" },
  {
    emoji: "◻️",
    label: "Minimalista",
    description: "Visual limpo com muito espaço negativo",
  },
  {
    emoji: "🌑",
    label: "Escuro e dramático",
    description: "Sombras intensas e atmosfera cinematográfica",
  },
  { emoji: "🌊", label: "Verão", description: "Cenas vibrantes e ensolaradas" },
];

const MOOD_PRESETS = [
  { emoji: "🪞", label: "Limpo" },
  { emoji: "🏠", label: "Aconchegante" },
  { emoji: "👑", label: "Premium" },
  { emoji: "🎨", label: "Divertido" },
  { emoji: "🌸", label: "Elegante" },
  { emoji: "⚡", label: "Energético" },
  { emoji: "🌫️", label: "Misterioso" },
  { emoji: "🍃", label: "Fresco" },
  { emoji: "🔥", label: "Marcante" },
  { emoji: "🎞️", label: "Nostálgico" },
  { emoji: "🤖", label: "Futurista" },
  { emoji: "🧘", label: "Zen" },
];

const RHYTHM_PRESETS = [
  { emoji: "🐢", label: "Lento" },
  { emoji: "🚶", label: "Médio" },
  { emoji: "⚡", label: "Rápido" },
  { emoji: "🎢", label: "Dinâmico" },
];

const STYLE_PRESETS = [
  { emoji: "📷", label: "Realista" },
  { emoji: "🎞️", label: "Cinematográfico" },
  { emoji: "✨", label: "Animado" },
  { emoji: "🎥", label: "Documentário" },
];

// ─── Providers ────────────────────────────────────────────────────────────
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
      "Seedance é a família de modelos de vídeo da ByteDance, focada em geração rápida com estética limpa e consistente. Ideal para vídeos de produto em escala, com suporte a imagens de referência e múltiplas resoluções (720p, 1080p e 4K).",
  },
  veo: {
    label: "Veo",
    intro:
      "Veo é a família de modelos de geração de vídeo do Google, conhecida por realismo cinematográfico, movimentos de câmera naturais e som integrado. Ideal para vídeos de produto premium e anúncios finais.",
  },
};

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
    href: "/features/ai-variations",
    label: "Gerador de Variações com IA",
    desc: "Gere variações de uma imagem existente",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/variations_image.webp",
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
const FAQS = [
  {
    q: "Quanto custa o gerador de vídeo de produto com IA?",
    a: "O plano Essential começa em R$ 80,90/mês com 28.000 créditos. O plano Creator custa R$ 199,90/mês com 87.500 créditos. O plano Agency custa R$ 599,90/mês com 280.000 créditos e alta volumetria em 4K. Cada geração de vídeo de produto consome créditos conforme o modelo e a duração escolhidos.",
  },
  {
    q: "Preciso colocar cartão de crédito para usar?",
    a: "Sim. O acesso ao gerador de vídeo de produto requer a assinatura de um plano. Você pode explorar os modelos e preços livremente antes de assinar, e o cadastro leva menos de 30 segundos.",
  },
  {
    q: "Preciso saber escrever prompts?",
    a: "Não. Essa é a principal diferença do gerador de vídeo de produto. Em vez de escrever prompts, você escolhe presets prontos de cena, clima, ritmo e estilo. A IA monta o vídeo automaticamente com base nas suas escolhas.",
  },
  {
    q: "O que é o DNA da Marca?",
    a: "É um recurso que analisa o contexto da sua marca e escolhe automaticamente o melhor estilo visual para o vídeo — combinando cena, clima, ritmo e estilo sem que você precise configurar cada opção manualmente. Custa 20 créditos.",
  },
  {
    q: "Que tipos de cena eu posso escolher?",
    a: "Você pode escolher entre 12 presets de cena: Exibição de produto, Lifestyle, Luxo, Ao ar livre, Unboxing, Close detalhado, Redes sociais, Cinematográfico, Sazonal, Minimalista, Escuro e dramático e Verão.",
  },
  {
    q: "Posso usar os vídeos gerados comercialmente?",
    a: "Sim. Os vídeos de produto gerados podem ser usados comercialmente em anúncios, e-commerce, redes sociais e materiais de marketing, sem marca d'água e sem necessidade de crédito adicional.",
  },
  {
    q: "Qual a diferença entre gerador de vídeo e gerador de vídeo de produto?",
    a: "O gerador de vídeo genérico parte de texto ou imagem e exige que você escreva prompts. O gerador de vídeo de produto é guiado por presets: você escolhe cena, clima, ritmo e estilo, e a IA monta o vídeo automaticamente — ideal para quem precisa de vídeos de anúncio rápidos e consistentes.",
  },
  {
    q: "O que é o Modo Personagem?",
    a: "O Modo Personagem inclui uma pessoa no vídeo gerado — segurando, usando ou interagindo com o produto. É ideal para criativos estilo UGC, demonstrações de uso e anúncios com pessoas.",
  },
  {
    q: "Posso enviar uma imagem de referência do meu produto?",
    a: "Sim. A imagem de referência é opcional. Se você enviar uma foto do produto, a IA usa como base para manter a identidade visual nos vídeos gerados.",
  },
  {
    q: "Posso salvar meus presets favoritos?",
    a: "Sim. Você pode salvar presets com combinações de cena, clima, ritmo e estilo que funcionam para a sua marca, e reutilizá-los em novas gerações.",
  },
  {
    q: "Qual modelo é melhor para vídeos de produto?",
    a: "Para vídeos de produto, Seedance 2.0 Mini é ideal para gerações rápidas e testes. Seedance 2.0 e Veo 3.1 entregam qualidade cinematográfica com movimento natural e som integrado, sendo indicados para anúncios finais.",
  },
  {
    q: "Quais formatos e resoluções de vídeo são suportados?",
    a: "Os modelos suportam resoluções de 720p, 1080p e 4K, nos formatos 16:9 (widescreen), 9:16 (vertical para Reels e TikTok) e 1:1 (quadrado). As durações disponíveis são de 5s e 10s por clipe.",
  },
  {
    q: "Os vídeos gerados têm marca d'água?",
    a: "Não. Todos os vídeos de produto gerados são entregues sem marca d'água, prontos para uso em anúncios, catálogos e redes sociais.",
  },
  {
    q: "Como criar vídeos de produto em lote?",
    a: "Use a aba 'Em lote' para gerar múltiplas variações de vídeo de uma só vez, combinando presets diferentes. Ideal para testar várias direções criativas para o mesmo produto e escalar produção de anúncios.",
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

function PresetRow({
  emoji,
  label,
  description,
}: {
  emoji: string;
  label: string;
  description?: string;
}) {
  return (
    <View style={styles.presetRow}>
      <Text style={styles.presetEmoji}>{emoji}</Text>
      <Text style={styles.presetLabel}>{label}</Text>
      {description ? (
        <Text style={styles.presetDesc}> — {description}</Text>
      ) : null}
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────
interface ProductVideoScreenProps {
  userPlan?: UserPlan;
  userCredits?: number;
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function ProductVideoScreen({}: ProductVideoScreenProps) {
  const router = useRouter();

  // Provider panel — same logic as web
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

  const [activeProviderId, setActiveProviderId] = useState<string>("seedance");

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
            accessibilityLabel="Exemplos de vídeos de produto criados com inteligência artificial na TrendYuu"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Gerador de Vídeo de Produto com IA
            </Text>
            <Text style={styles.heroSubtitle}>
              Crie vídeos de produto profissionais sem escrever prompts. Escolha
              presets prontos de cena, clima, ritmo e estilo — ou use o DNA da
              Marca para que a IA escolha o melhor visual para o seu produto.
              Ideal para anúncios, e-commerce e redes sociais.
            </Text>
            <TouchableOpacity
              style={styles.ctaPink}
              activeOpacity={0.85}
              onPress={() =>
                router.push("/ai-tools/smart-video-generator" as any)
              }
            >
              <Text style={styles.ctaPinkText}>Abrir o Estúdio de Vídeo</Text>
              <ArrowUp size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════ COMO FUNCIONA ═══════════════════ */}
        <View style={styles.section}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Como criar um vídeo de produto com IA sem prompt?
            </Text>

            <View style={styles.howCard}>
              <Image
                source={{ uri: HOW_IMAGE_SRC }}
                style={styles.howImage}
                resizeMode="cover"
                accessibilityLabel="Demonstração do processo de criação de vídeo de produto com IA em três etapas"
              />
              <View style={styles.howSteps}>
                {[
                  [
                    "01",
                    "Envie o produto (opcional)",
                    "Faça upload de uma foto do produto, ative o Modo Personagem ou adicione contexto extra. Tudo opcional.",
                  ],
                  [
                    "02",
                    "Escolha cena, clima, ritmo e estilo",
                    "Selecione presets prontos em cada aba — ou use o DNA da Marca para que a IA escolha automaticamente o melhor estilo.",
                  ],
                  [
                    "03",
                    "Gere, baixe e use",
                    "Gere o vídeo e use o resultado em anúncios, e-commerce, redes sociais, páginas de produto e outros materiais.",
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
              O que é um gerador de vídeo de produto com IA?
            </Text>
            <Text style={styles.bodyText}>
              Um gerador de vídeo de produto com IA é uma ferramenta que usa
              inteligência artificial para criar vídeos de apresentação,
              demonstração e anúncio de produtos — sem exigir que você escreva
              prompts ou saiba edição de vídeo.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 12 }]}>
              Com o TrendYuu, você escolhe presets prontos de cena, clima, ritmo
              e estilo, e a IA monta o vídeo automaticamente. Isso torna a
              criação de vídeos de produto acessível para e-commerce,
              profissionais de performance e criadores que precisam de anúncios
              visuais em escala.
            </Text>
            <View style={styles.cardGrid}>
              {[
                [
                  "Vídeo de produto sem prompt",
                  "Escolha presets prontos e gere vídeos profissionais sem escrever uma linha de prompt. Ideal para quem nunca usou IA generativa antes.",
                ],
                [
                  "DNA da Marca",
                  "A IA analisa o contexto da sua marca e escolhe automaticamente a melhor combinação de cena, clima, ritmo e estilo.",
                ],
                [
                  "Modo personagem",
                  "Inclua uma pessoa no vídeo — segurando, usando ou interagindo com o produto — para criativos estilo UGC e demonstrações.",
                ],
                [
                  "Geração em lote",
                  "Gere múltiplas variações de vídeo de uma só vez, combinando presets diferentes para o mesmo produto.",
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

        {/* ═══════════════════ PRESETS ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Presets de cena, clima, ritmo e estilo
            </Text>
            <Text style={styles.sectionBody}>
              Combine presets prontos para criar o vídeo de produto perfeito
              para a sua marca — sem escrever prompts.
            </Text>

            {/* Cena */}
            <View style={styles.presetCard}>
              <Text style={styles.presetCardTitle}>🎬 Cena</Text>
              {SCENE_PRESETS.map((p) => (
                <PresetRow
                  key={p.label}
                  emoji={p.emoji}
                  label={p.label}
                  description={p.description}
                />
              ))}
            </View>

            {/* Clima */}
            <View style={[styles.presetCard, { marginTop: 12 }]}>
              <Text style={styles.presetCardTitle}>🔥 Clima</Text>
              {MOOD_PRESETS.map((p) => (
                <PresetRow key={p.label} emoji={p.emoji} label={p.label} />
              ))}

              <Text style={[styles.presetCardTitle, { marginTop: 20 }]}>
                🎢 Ritmo
              </Text>
              {RHYTHM_PRESETS.map((p) => (
                <PresetRow key={p.label} emoji={p.emoji} label={p.label} />
              ))}

              <Text style={[styles.presetCardTitle, { marginTop: 20 }]}>
                ✨ Estilo visual
              </Text>
              {STYLE_PRESETS.map((p) => (
                <PresetRow key={p.label} emoji={p.emoji} label={p.label} />
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════ PAINEL DE MODELOS ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Modelos de IA para gerar vídeo de produto
            </Text>
            <Text style={styles.sectionBody}>
              Compare diferentes modelos de inteligência artificial para
              encontrar a opção mais adequada para gerar vídeos de produto,
              criativos de anúncios e conteúdos visuais em escala.
            </Text>

            {/* Context cards */}
            <View style={styles.cardGrid}>
              {[
                [
                  "Seedance",
                  "A família Seedance (ByteDance) oferece diferentes opções para geração de vídeos de produto, com variantes voltadas para velocidade, equilíbrio entre qualidade e custo e resultados cinematográficos mais detalhados.",
                ],
                [
                  "Veo",
                  "Os modelos Veo (Google) são indicados para vídeos de produto cinematográficos, movimentos naturais de câmera, cenas complexas com som integrado e resultados de alta qualidade.",
                ],
              ].map(([title, desc]) => (
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
                                `${PRODUCT_VIDEO_ROUTE}?model=${model.id}` as any,
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
              Por que usar um gerador de vídeo de produto com IA?
            </Text>
            <View style={styles.benefitsGrid}>
              {[
                [
                  Sparkles,
                  "Sem prompts",
                  "Escolha presets prontos e gere vídeos profissionais sem escrever prompts. Ideal para quem nunca usou IA generativa.",
                ],
                [
                  Zap,
                  "Escale seus criativos de anúncio",
                  "Gere dezenas de variações visuais para testes A/B sem precisar de um time de edição — feito para profissionais de performance.",
                ],
                [
                  ShieldCheck,
                  "Identidade visual consistente",
                  "Use DNA da Marca e presets salvos para manter um estilo visual coeso em cada vídeo de produto.",
                ],
                [
                  Wand2,
                  "Da ideia ao vídeo em segundos",
                  "Sem precisar entender de edição ou prompt engineering. Escolha presets e receba um vídeo utilizável na hora.",
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
              Para quem é o gerador de vídeo de produto com IA?
            </Text>
            <View style={styles.audienceList}>
              {[
                [
                  "Vendedores de e-commerce",
                  "geram vídeos de produto sem estúdio físico ou equipe de edição",
                ],
                [
                  "Profissionais de performance",
                  "produzem variações de criativos em vídeo em escala para testes A/B",
                ],
                [
                  "Criadores de conteúdo e afiliados",
                  "criam vídeos para Shorts, Reels e TikTok sem saber editar",
                ],
                [
                  "Agências",
                  "entregam vídeos de produto para clientes mais rápido, sem expandir o time",
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
              Combine o gerador de vídeo de produto com outras ferramentas para
              escalar sua produção visual.
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
                  accessibilityLabel="Exemplos de vídeos de produtos gerados por inteligência artificial na plataforma TrendYuu"
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
              Perguntas frequentes sobre vídeo de produto com IA
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
              Pronto para criar seu primeiro vídeo de produto com IA?
            </Text>
            <Text style={styles.ctaBody}>
              Escolha um plano, selecione presets e gere vídeos de produto
              profissionais em minutos — sem prompt e sem equipe de produção.
              Ideal para e-commerce, performance e criadores de conteúdo.
            </Text>
            <TouchableOpacity
              style={[styles.ctaPink, { alignSelf: "center" }]}
              activeOpacity={0.85}
              onPress={() => router.push(PRODUCT_VIDEO_ROUTE as any)}
            >
              <Text style={styles.ctaPinkText}>Começar agora</Text>
            </TouchableOpacity>
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

  // --- HERO ---
  heroSection: {
    minHeight: 520,
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
    maxWidth: 560,
  },
  ctaPink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#db2777",
    borderRadius: 999,
    shadowColor: "#db2777",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
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
  howImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: "#09090b",
  },
  howSteps: { padding: 20 },
  howStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 16,
  },
  howStepBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(63,63,70,0.6)",
  },
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

  // --- PRESETS ---
  presetCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#09090b",
    padding: 20,
  },
  presetCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f5f5f5",
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  presetEmoji: { fontSize: 14, marginRight: 6 },
  presetLabel: { fontSize: 13, fontWeight: "600", color: "#e4e4e7" },
  presetDesc: { fontSize: 12, color: "#a1a1aa", flex: 1 },

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
});
