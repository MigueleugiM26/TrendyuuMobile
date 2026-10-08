"use client";

import Footer from "@/src/components/main_page/footer";
import Navbar from "@/src/components/main_page/Navbar";
import {
  AI_IMAGE_MODELS,
  AIImageModelConfig,
  getAIImageModelLogo,
} from "@/src/types/aiModels";
import { useRouter } from "expo-router";
import {
  Camera,
  Lock,
  Palette,
  Play,
  ShieldCheck,
  Shirt,
  Sparkles,
  User,
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
  "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/variations_image.webp";
const HOW_IMAGE_SRC =
  "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/imagem_how%20to%20create.webp";
const VARIATION_ROUTE = "/ai-tools/variation-generator";
const PRICING_ROUTE = "/pricing";

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
      "FLUX é uma família de modelos de imagem conhecida por realismo fotográfico e forte aderência ao prompt. Para variações, pode ser usada em diferentes ângulos, fundos e iluminações.",
  },
  gpt: {
    label: "GPT Image",
    intro:
      "Modelos de imagem da OpenAI com compreensão semântica avançada. Podem ser usados em variações que envolvem múltiplos objetos, composição complexa e instruções detalhadas.",
  },
  gemini: {
    label: "Google",
    intro:
      "Os modelos Nano Banana, baseados em Gemini, permitem edição e geração a partir de referências usando linguagem natural, sendo úteis para alterações de cena, aparência e composição.",
  },
  seedream: {
    label: "Seedream",
    intro:
      "Seedream é focado em geração de imagens com estética consistente e suporte a diferentes resoluções. Pode ser usado para criativos com pessoas, conteúdo UGC e outras aplicações visuais.",
  },
};

// ─── Variation options ────────────────────────────────────────────────────
const VARIATION_OPTIONS = [
  {
    Icon: Camera,
    title: "Ângulos de câmera",
    description:
      "Crie versões com diferentes perspectivas, como frontal, lateral, close-up e plano aberto.",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/variation_angles.webp",
  },
  {
    Icon: User,
    title: "Aparência",
    description:
      "Ajuste características visuais como cabelo, tom de pele, olhos e outros elementos da aparência.",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/variation_aparence.webp",
  },
  {
    Icon: Palette,
    title: "Ambiente e cenário",
    description:
      "Altere o fundo e a ambientação da cena mantendo o sujeito como referência.",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/variations_ambiente.webp",
  },
  {
    Icon: Shirt,
    title: "Vestuário",
    description:
      "Crie diferentes versões de roupas, cores, estilos e combinações para o mesmo sujeito.",
    image:
      "https://cdn-frontend.trendyuu.com/public/imagens_paginas_features/variation_roupas.webp",
  },
];

// ─── Static card data ─────────────────────────────────────────────────────
const USE_CASES = [
  [
    "Criativos com pessoas",
    "Gere versões de um mesmo sujeito em diferentes ângulos, looks e cenários.",
  ],
  [
    "Conteúdo UGC",
    "Crie múltiplas versões de criativos no estilo UGC a partir de uma referência.",
  ],
  [
    "Anúncios com rosto",
    "Explore diferentes ângulos, expressões e contextos para anúncios com pessoas.",
  ],
  [
    "Influencer marketing",
    "Crie variações visuais de campanhas com o mesmo influenciador em diferentes contextos.",
  ],
  [
    "Testes A/B visuais",
    "Produza diferentes versões de um criativo para testar conceitos e elementos visuais.",
  ],
  [
    "Conteúdo para redes sociais",
    "Adapte uma imagem para diferentes posts, campanhas, capas e formatos sociais.",
  ],
];

const CREATIVE_SCALE_CARDS = [
  [
    "Variações para produtos",
    "Crie diferentes cenários, composições e apresentações para o mesmo produto.",
  ],
  [
    "Variações para anúncios",
    "Teste diferentes pessoas, ângulos, ambientes e estilos visuais.",
  ],
  [
    "Variações para redes sociais",
    "Adapte uma mesma referência para diferentes ideias e formatos de conteúdo.",
  ],
];

const MODEL_CARDS = [
  [
    "Seedream",
    "Modelos voltados para geração de imagens com boa consistência visual e diferentes opções de resolução.",
  ],
  [
    "FLUX Pro",
    "Opção voltada para imagens com alto nível de realismo, detalhes e qualidade fotográfica.",
  ],
  [
    "GPT Image",
    "Indicado para instruções detalhadas, composição de cenas e alterações orientadas por linguagem natural.",
  ],
  [
    "Gemini e Nano Banana",
    "Modelos que permitem orientar alterações de imagem usando instruções em linguagem natural.",
  ],
];

const BENEFITS = [
  [
    Sparkles,
    "Multiplique um único criativo",
    "Transforme uma imagem de referência em várias versões para explorar diferentes ideias visuais.",
  ],
  [
    Camera,
    "Teste diferentes ângulos",
    "Explore perspectivas frontais, laterais, close-ups e outros enquadramentos sem produzir cada foto novamente.",
  ],
  [
    Palette,
    "Troque ambientes e cenários",
    "Crie diferentes contextos para uma mesma referência visual.",
  ],
  [
    Shirt,
    "Troque roupas e estilos",
    "Teste diferentes looks, cores e estilos no mesmo sujeito.",
  ],
  [
    ShieldCheck,
    "Preserve elementos da referência",
    "Use a imagem original como referência para manter características importantes enquanto modifica outros elementos.",
  ],
  [
    Zap,
    "Escale a produção de criativos",
    "Produza mais alternativas visuais para campanhas, anúncios e conteúdo sem começar cada peça do zero.",
  ],
];

const AUDIENCES = [
  [
    "Profissionais de performance",
    "Produzem diferentes versões de criativos para campanhas e testes.",
  ],
  [
    "Criadores de conteúdo e afiliados",
    "Criam mais variações visuais sem precisar produzir cada imagem do zero.",
  ],
  [
    "Agências e estúdios",
    "Produzem diferentes alternativas visuais para projetos e clientes.",
  ],
  [
    "Times de marketing",
    "Exploram diferentes conceitos, cenários e estilos para campanhas.",
  ],
];

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

const FAQS = [
  {
    q: "Posso usar o gerador de variações de imagens com IA de graça?",
    a: "Sim. O gerador de variações pode ser usado gratuitamente dentro dos limites de uso disponíveis na sua conta. Para gerar mais variações e ter acesso a mais créditos e recursos, você pode comprar créditos ou escolher um dos planos pagos da TrendYuu.",
  },
  {
    q: "Preciso colocar cartão de crédito para usar?",
    a: "Não. Você pode usar o gerador de variações gratuitamente sem cadastrar cartão de crédito. Quando seus créditos gratuitos acabarem e você quiser continuar gerando, poderá comprar créditos ou assinar um plano pago.",
  },
  {
    q: "O que é o TrendYuu Variations?",
    a: "É um gerador de variações de imagens com IA. Você envia uma imagem de referência, como uma foto de rosto ou pessoa, e a ferramenta cria versões alternativas com diferentes ângulos de câmera, aparência, ambiente, vestuário e sobreposição de texto.",
  },
  {
    q: "Que tipo de variações eu posso gerar?",
    a: "Você pode variar ângulos de câmera, aparência, ambiente e fundo da cena, vestuário e outros elementos visuais. Também é possível adicionar sobreposição de texto e instruções personalizadas em linguagem natural.",
  },
  {
    q: "Posso usar as variações para anúncios e marketing?",
    a: "Sim. As variações podem ser utilizadas em diferentes materiais de marketing, como anúncios, redes sociais, páginas de produto, e-commerce e campanhas digitais, respeitando os termos aplicáveis ao uso do conteúdo gerado.",
  },
  {
    q: "Qual a diferença entre gerador de imagens e gerador de variações?",
    a: "O gerador de imagens cria uma imagem a partir de uma descrição ou prompt. O gerador de variações parte de uma imagem de referência existente e cria novas versões dela, permitindo alterar elementos como ângulos, aparência, ambientes, vestuário e composição.",
  },
  {
    q: "Preciso saber escrever prompts?",
    a: "Não. As principais opções de variação podem ser configuradas pela interface, incluindo ângulos, aparência, ambiente, vestuário e texto. Também é possível adicionar instruções personalizadas em linguagem natural.",
  },
  {
    q: "Quais formatos de imagem são aceitos no upload?",
    a: "O upload aceita imagens nos formatos JPG, PNG e WebP, com tamanho máximo de 10MB.",
  },
  {
    q: "Qual modelo de IA devo usar para gerar variações?",
    a: "A escolha depende do resultado desejado. A TrendYuu disponibiliza diferentes modelos, como Seedream, FLUX, GPT Image e Gemini, que podem apresentar características distintas de realismo, consistência, edição e compreensão das instruções.",
  },
  {
    q: "As variações têm marca d'água?",
    a: "As imagens geradas pela ferramenta são entregues sem marca d'água, de acordo com as condições aplicáveis ao uso do serviço.",
  },
  {
    q: "Como criar variações de uma imagem com IA?",
    a: "Envie uma imagem de referência, selecione o modelo de IA, configure as opções de variação e clique em gerar. Você pode definir elementos como ângulos, aparência, ambiente, vestuário e texto, além de adicionar instruções personalizadas em linguagem natural.",
  },
  {
    q: "Como criar variações de criativos com pessoas?",
    a: "Envie uma imagem de referência de uma pessoa, escolha o modelo de IA e configure elementos como ângulos de câmera, aparência, ambiente e vestuário. Depois, gere as versões desejadas para explorar diferentes ideias de criativos.",
  },
  {
    q: "Quantas variações posso gerar por vez?",
    a: "A quantidade de variações disponíveis depende do modelo de IA utilizado e das opções disponíveis na ferramenta. Cada variação consome créditos de acordo com o modelo selecionado.",
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
interface VariationsScreenProps {
  userPlan?: string;
  userCredits?: number;
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function VariationsScreen({}: VariationsScreenProps) {
  const router = useRouter();

  // Provider tabs — same logic as web
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

  const [activeProviderId, setActiveProviderId] = useState<string>("seedream");

  const activeModels = useMemo(
    () =>
      Object.values(AI_IMAGE_MODELS).filter((m) =>
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
            accessibilityLabel="Exemplos de variações de imagens criadas com inteligência artificial na TrendYuu"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Gerador de Variações de Imagens com IA
            </Text>
            <Text style={styles.heroSubtitle}>
              Envie uma imagem de referência e crie novas versões com IA. Varie
              ângulos, aparência, ambientes, roupas e outros elementos para
              produzir mais criativos a partir de uma única imagem.
            </Text>
            <TouchableOpacity
              style={styles.ctaPink}
              activeOpacity={0.85}
              onPress={() => router.push(VARIATION_ROUTE as any)}
            >
              <Sparkles size={18} color="#ffffff" />
              <Text style={styles.ctaPinkText}>Gerar variações agora</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════ COMO FUNCIONA ═══════════════════ */}
        <View style={styles.section}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Como criar variações de uma imagem com IA?
            </Text>

            {/* How-to card */}
            <View style={styles.howCard}>
              <Image
                source={{ uri: HOW_IMAGE_SRC }}
                style={styles.howImage}
                resizeMode="cover"
                accessibilityLabel="Demonstração de como criar variações de uma imagem com inteligência artificial"
              />
              <View style={styles.howSteps}>
                {[
                  [
                    "01",
                    "Envie sua imagem de referência",
                    "Faça o upload de uma imagem JPG, PNG ou WebP e escolha o modelo de IA que deseja utilizar.",
                  ],
                  [
                    "02",
                    "Configure as opções de variação",
                    "Defina ângulos, aparência, ambiente, vestuário, texto e outras instruções para orientar cada versão.",
                  ],
                  [
                    "03",
                    "Gere, baixe e use",
                    "Gere múltiplas versões e use os resultados em anúncios, e-commerce, redes sociais, páginas de produto e outros materiais visuais.",
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
              O que é um gerador de variações de imagens com IA?
            </Text>
            <Text style={styles.bodyText}>
              Um gerador de variações de imagens com IA cria novas versões a
              partir de uma imagem de referência. Em vez de começar do zero,
              você fornece uma imagem existente e usa inteligência artificial
              para modificar elementos como ângulo, aparência, cenário,
              vestuário e composição.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 12 }]}>
              Esse tipo de geração é útil para transformar uma única imagem em
              vários criativos para anúncios, redes sociais, conteúdo UGC,
              e-commerce e campanhas digitais.
            </Text>
            <View style={styles.cardGrid}>
              {[
                [
                  "Variações a partir de uma imagem de referência",
                  "Use uma imagem existente como ponto de partida e crie versões alternativas sem precisar produzir cada imagem manualmente.",
                ],
                [
                  "Imagem para imagem",
                  "Transforme uma referência em diferentes resultados visuais, mantendo elementos importantes enquanto altera o contexto da imagem.",
                ],
                [
                  "Criativos com pessoas e UGC",
                  "Crie diferentes versões de criativos com pessoas, looks, ângulos e cenários para explorar novas ideias visuais.",
                ],
                [
                  "Variações para anúncios com IA",
                  "Adapte um mesmo conceito visual para diferentes anúncios, públicos, formatos e canais de aquisição.",
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

        {/* ═══════════════════ OPÇÕES DE VARIAÇÃO ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              O que você pode alterar em uma imagem com IA?
            </Text>
            <Text style={styles.sectionBody}>
              Combine diferentes instruções para criar versões únicas a partir
              da mesma imagem de referência.
            </Text>
          </View>
          <FlatList
            data={VARIATION_OPTIONS}
            keyExtractor={(item) => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsList}
            renderItem={({ item }) => (
              <View style={styles.optionCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.optionImage}
                  resizeMode="cover"
                  accessibilityLabel={`Exemplo de variação: ${item.title}`}
                />
                <View style={styles.optionBody}>
                  <View style={styles.optionTitleRow}>
                    <item.Icon size={18} color="#ec4899" />
                    <Text style={styles.optionTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.optionDesc}>{item.description}</Text>
                </View>
              </View>
            )}
          />
        </View>

        {/* ═══════════════════ USE CASES ═══════════════════ */}
        <View style={[styles.sectionBordered, styles.tinted]}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              O que você pode criar com variações de imagens?
            </Text>
            <Text style={styles.sectionBody}>
              Transforme uma única imagem de referência em diferentes criativos
              para conteúdo, marketing, anúncios e redes sociais.
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

        {/* ═══════════════════ CRIATIVOS EM ESCALA ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Crie várias versões de um mesmo criativo
            </Text>
            <Text style={styles.bodyText}>
              Uma única imagem pode servir como ponto de partida para dezenas de
              ideias visuais. Gere versões para testar diferentes conceitos
              antes de produzir cada peça do zero.
            </Text>
            <View style={styles.cardGrid}>
              {CREATIVE_SCALE_CARDS.map(([title, desc]) => (
                <View key={title} style={styles.infoCard}>
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
              Modelos de IA para gerar variações
            </Text>
            <Text style={styles.sectionBody}>
              Escolha entre diferentes modelos de inteligência artificial para
              gerar variações de imagens de acordo com o resultado visual que
              você procura.
            </Text>

            {/* Static model overview cards */}
            <View style={styles.cardGrid}>
              {MODEL_CARDS.map(([title, desc]) => (
                <View key={title} style={styles.darkCard}>
                  <Text style={styles.infoCardTitle}>{title}</Text>
                  <Text style={styles.infoCardDesc}>{desc}</Text>
                </View>
              ))}
            </View>

            {/* Interactive provider panel */}
            <View style={styles.modelPanel}>
              {/* Provider tabs */}
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
                    const details = [
                      model.supportsReferenceImage
                        ? `Aceita até ${model.maxReferenceImages ?? 1} imagem(ns) de referência.`
                        : "",
                      model.max_generation_images
                        ? `Gera até ${model.max_generation_images} variações por vez.`
                        : "",
                      model.resolutionTiers?.length
                        ? `Resoluções: ${model.resolutionTiers.join(", ")}.`
                        : "",
                      model.supportsSeed ? "Suporta seed." : "",
                      model.supportsTransparentBg
                        ? "Fundo transparente disponível."
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <View key={model.id} style={styles.modelCard}>
                        <Text style={styles.modelCardName}>{model.name}</Text>
                        {details ? (
                          <Text style={styles.modelCardDetails}>{details}</Text>
                        ) : null}
                        <View style={styles.modelCardFooter}>
                          <Text style={styles.modelCardCredits}>
                            {model.baseCredits.toLocaleString("pt-BR")} créditos
                          </Text>
                          <TouchableOpacity
                            disabled={blocked}
                            onPress={() =>
                              router.push(
                                `${VARIATION_ROUTE}?model=${model.id}` as any,
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
              Por que gerar variações de uma imagem?
            </Text>
            <View style={styles.benefitsGrid}>
              {BENEFITS.map(([Icon, title, desc]) => (
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
              Para quem é o gerador de variações com IA?
            </Text>
            <Text style={styles.bodyText}>
              A ferramenta pode ser usada por profissionais que precisam criar
              diferentes versões de uma mesma referência visual para conteúdo,
              marketing e publicidade.
            </Text>
            <View style={styles.cardGrid}>
              {AUDIENCES.map(([title, desc]) => (
                <View key={title} style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>{title}</Text>
                  <Text style={styles.infoCardDesc}>{desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ═══════════════════ FERRAMENTAS RELACIONADAS ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitleSm}>Outras ferramentas de IA</Text>
            <Text style={styles.sectionBody}>
              Combine o gerador de variações com outras ferramentas da TrendYuu
              para criar diferentes tipos de conteúdo visual.
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

        {/* ═══════════════════ FAQ ═══════════════════ */}
        <View style={styles.sectionBordered}>
          <View style={styles.px}>
            <Text style={styles.sectionTitle}>
              Perguntas frequentes sobre variações de imagens com IA
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
              Pronto para gerar sua primeira variação?
            </Text>
            <Text style={styles.ctaBody}>
              Envie uma imagem de referência e crie novas versões para anúncios,
              redes sociais, conteúdo UGC e outros projetos visuais.
            </Text>
            <TouchableOpacity
              style={[styles.ctaPink, { alignSelf: "center" }]}
              activeOpacity={0.85}
              onPress={() => router.push(VARIATION_ROUTE as any)}
            >
              <Text style={styles.ctaPinkText}>Gerar variações agora</Text>
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
  },
  ctaPink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#db2777",
    borderRadius: 999,
    shadowColor: "#db2777",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaPinkText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },

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
  howSteps: { padding: 20, gap: 0 },
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

  // --- INFO CARDS ---
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

  // --- VARIATION OPTIONS (horizontal FlatList) ---
  optionsList: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 16,
    paddingBottom: 4,
  },
  optionCard: {
    width: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "rgba(39,39,42,0.4)",
    overflow: "hidden",
  },
  optionImage: { width: 260, aspectRatio: 16 / 9 },
  optionBody: { padding: 16 },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  optionTitle: { fontSize: 14, fontWeight: "600", color: "#f5f5f5" },
  optionDesc: { fontSize: 12, color: "#a1a1aa", lineHeight: 20 },

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
  modelCardDetails: {
    fontSize: 12,
    color: "#71717a",
    lineHeight: 18,
    marginTop: 6,
  },
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
