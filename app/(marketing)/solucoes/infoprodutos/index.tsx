import Navbar from "@/src/components/main_page/Navbar";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  HelpCircle,
  Layers,
  Music,
  Play,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ============================================
// DADOS DE CONTEÚDO
// ============================================
const recursosSaaSForProdutores = [
  {
    title: "Canvas Studio Integrado",
    desc: "Conecte imagens, referências e deixe a IA montar o conteúdo visual das suas landing pages, posts de atração e anúncios de captação de leads em segundos.",
    icon: Layers,
  },
  {
    title: "AutoClip (Clipes Automáticos)",
    desc: "Transforme suas aulas longas ou mentorias gravadas em múltiplos cortes curtos (Shorts/Reels) com legendas automáticas e edições virais em um só clique.",
    icon: Video,
  },
  {
    title: "Voz Realista & TrendYuu Music",
    desc: "Gere narrações profissionais para as suas VSLs (Vídeos de Vendas) escrevendo o texto, e monte trilhas sonoras originais usando a tecnologia Google Lyria.",
    icon: Music,
  },
];

const faqsSaaS = [
  {
    question:
      "Como os infoprodutores podem usar a inteligência artificial para criar conteúdo?",
    answer:
      "Os infoprodutores utilizam a inteligência artificial do TrendYuu para descentralizar a operação de design e edição. Com recursos como o Canvas Studio e o AutoClip, você consegue planejar, produzir artes para redes sociais, editar vídeos curtos a partir de aulas longas e gerar vozes de suporte em minutos.",
  },
  {
    question: "O que é o Canvas Studio e como ele ajuda a vender infoprodutos?",
    answer:
      "O Canvas Studio do TrendYuu permite montar fluxos visuais completos. Você conecta referências, textos e imagens de produtos, e a inteligência artificial cria os designs de anúncios, carrosséis educativos e banners para a sua área de membros automaticamente, sem que você precise usar o Photoshop.",
  },
  {
    question:
      "Como criar cortes automáticos de aulas online de maneira rápida?",
    answer:
      "Com a ferramenta AutoClip do TrendYuu, basta fazer o upload do vídeo da sua aula ou mentoria longa. A nossa inteligência artificial detecta as partes mais envolventes, corta o vídeo nos formatos ideais para TikTok e Reels, insere legendas automáticas por IA e remove as marcas d'água.",
  },
  {
    question:
      "Consigo criar criativos de anúncios para lançamentos sem contratar um designer?",
    answer:
      "Sim! Com as IAs avançadas integradas ao TrendYuu, como o GPT Image (1.5 e 2.0) e o Google Image3, você cria imagens ricas, realistas e exclusivas baseadas em prompts, reduzindo os custos de agências e evitando que seus anúncios sejam bloqueados por uso de imagens repetidas no Facebook Ads.",
  },
];

// ============================================
// SUB-COMPONENTS
// ============================================
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setOpen((prev) => !prev)}
      style={styles.faqItem}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Text style={[styles.faqToggle, open && styles.faqToggleOpen]}>+</Text>
      </View>
      {open && (
        <View style={styles.faqAnswerWrapper}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================
// MAIN SCREEN
// ============================================
export default function InfoprodutoresScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <Navbar />

      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* === HERO SECTION === */}
        <View style={styles.heroSection}>
          {/* BADGE COM ROXO ELEGANTE */}
          <View style={styles.heroBadge}>
            <Zap size={12} color="#c084fc" />
            <Text style={styles.heroBadgeText}>
              Ideias que viram infoprodutos lucrativos em minutos
            </Text>
          </View>

          {/* TÍTULO */}
          <Text style={styles.heroTitle}>
            A melhor inteligência artificial para infoprodutores acelerarem
            conteúdo e vendas.
          </Text>

          <Text style={styles.heroSubtitle}>
            Crie fotos, artes dinâmicas no{" "}
            <Text style={styles.heroSubtitleBold}>Canvas Studio</Text>, vídeos
            para criativos de anúncios e faça cortes rápidos das suas aulas (
            <Text style={styles.heroSubtitleBold}>AutoClip</Text>) com legendas
            automáticas. Tudo em um só ecossistema, focado no marketing digital.
          </Text>

          <View style={styles.heroCtas}>
            <TouchableOpacity
              style={styles.ctaPurple}
              activeOpacity={0.85}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.ctaPurpleText}>Começar Grátis</Text>
              <ArrowRight size={16} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
              <Text style={styles.ctaSecondaryText}>
                Ver recursos do TrendYuu
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* === SEÇÃO DE BENEFÍCIOS REAIS DO TRENDYUU === */}
        <View style={styles.sectionDark}>
          <Text style={styles.sectionSubheading}>
            Por que produtores digitais usam o TrendYuu ao invés de ferramentas
            complexas?
          </Text>

          <View style={styles.benefitsGrid}>
            <View style={[styles.benefitCard, styles.benefitCardPink]}>
              <Text style={styles.benefitTitlePink}>
                🎨 Sem Depender de Designers
              </Text>
              <Text style={styles.benefitDesc}>
                Não perca tempo montando peças no Photoshop ou Canva do zero.
                Insira seu modelo de IA de imagem preferido (NanoBanana, GPT
                Image ou Google Image3), selecione o estilo de fundo e gere
                criativos prontos para conversão.
              </Text>
            </View>

            <View style={[styles.benefitCard, styles.benefitCardPurple]}>
              <Text style={styles.benefitTitlePurple}>
                🎬 Edição Automatizada de Retenção
              </Text>
              <Text style={styles.benefitDesc}>
                Transforme suas mentorias e webinars em pilhas de conteúdo
                orgânico. O AutoClip gera até 1.200 minutos por mês de cortes
                automáticos de alta fidelidade com legenda e cortes dinâmicos de
                tela dividida (Split Screen).
              </Text>
            </View>
          </View>
        </View>

        {/* === RECURSOS EM DESTAQUE === */}
        <View style={styles.sectionBlack}>
          <Text style={styles.sectionHeading}>
            Como criar conteúdos para seu infoproduto que vendem em minutos?
          </Text>
          <Text style={styles.sectionBody}>
            Explore a infraestrutura robusta do TrendYuu desenhada
            exclusivamente para quem vende conhecimento na internet.
          </Text>

          <View style={styles.recursosGrid}>
            {recursosSaaSForProdutores.map((item, idx) => (
              <View key={idx} style={styles.recursoCard}>
                <View style={styles.iconBoxPurple}>
                  <item.icon size={20} color="#c084fc" />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* === SEÇÃO DO PLANO IDEAL === */}
        <View style={styles.sectionDark}>
          <View style={styles.planCard}>
            <Text style={styles.planBadge}>Recomendado</Text>
            <Text style={styles.planTitle}>
              🚀 Plano Creator: O Motor de Atração de Alunos
            </Text>
            <Text style={styles.planDesc}>
              Perfeito para infoprodutores que estão escalando o tráfego
              orgânico e pago. Desbloqueie até 87.500 créditos mensais, IAs de
              imagem avançadas (GPT Image 2.0 e NanoBanana Pro), editor dinâmico
              de tela dividida para reações e 300MB de armazenamento em nuvem.
            </Text>

            <View style={styles.planFeatures}>
              {[
                "Sem marcas d'água",
                "AutoClip Creator (600 min/mês)",
                "Vozes realistas para VSL",
                "Sem limites de criativos de imagem",
              ].map((feat) => (
                <View key={feat} style={styles.planFeatureItem}>
                  <Text style={styles.planFeatureText}>✓ {feat}</Text>
                </View>
              ))}
            </View>

            <View style={styles.planBottom}>
              <Text style={styles.planPrice}>
                R$ 199,90
                <Text style={styles.planPriceSuffix}>/Mês</Text>
              </Text>
              <TouchableOpacity
                style={styles.planCta}
                activeOpacity={0.85}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.planCtaText}>Garantir Plano Creator</Text>
                <Play size={12} color="#000000" fill="#000000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* === SEÇÃO DE FAQ === */}
        <View style={styles.sectionBlack}>
          <View style={styles.faqHeadingRow}>
            <HelpCircle size={24} color="#525252" />
            <Text style={styles.sectionHeading}> Perguntas Frequentes</Text>
          </View>
          <Text style={[styles.sectionBody, styles.textCenter]}>
            Soluções e esclarecimentos para você dominar as vendas de
            infoprodutos usando a nossa plataforma.
          </Text>

          <View style={styles.faqList}>
            {faqsSaaS.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </View>
        </View>

        {/* === CTA DE CONVERSÃO FINAL === */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            Faça suas ideias virarem infoprodutos de sucesso em minutos.
          </Text>
          <Text style={styles.ctaBody}>
            Experimente a velocidade da criação automatizada no TrendYuu e foque
            apenas no que realmente importa: faturar alto.
          </Text>
          <TouchableOpacity
            style={styles.ctaPurple}
            activeOpacity={0.85}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.ctaPurpleText}>Começar a Criar de Graça</Text>
            <TrendingUp size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  main: {
    flex: 1,
  },
  mainContent: {
    paddingBottom: 40,
  },

  // --- HERO ---
  heroSection: {
    paddingTop: 80,
    paddingBottom: 64,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
    alignItems: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.2)",
    backgroundColor: "rgba(168,85,247,0.05)",
    marginBottom: 24,
  },
  heroBadgeText: {
    color: "#c084fc",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontStyle: "italic",
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: "#f5f5f5",
    textAlign: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#a3a3a3",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "300",
    marginBottom: 32,
    maxWidth: 360,
  },
  heroSubtitleBold: {
    color: "#e5e5e5",
    fontWeight: "500",
  },
  heroCtas: {
    width: "100%",
    gap: 12,
  },
  ctaPurple: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#9333ea",
    borderRadius: 8,
  },
  ctaPurpleText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  ctaSecondary: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 8,
    backgroundColor: "rgba(10,10,10,0.5)",
  },
  ctaSecondaryText: {
    color: "#d4d4d4",
    fontSize: 14,
    fontWeight: "500",
  },

  // --- SECTIONS ---
  sectionDark: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
    backgroundColor: "#020202",
  },
  sectionBlack: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
    backgroundColor: "#000000",
  },
  sectionSubheading: {
    fontSize: 18,
    fontWeight: "400",
    color: "#d4d4d4",
    letterSpacing: -0.3,
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: "400",
    letterSpacing: -0.3,
    color: "#f5f5f5",
    marginBottom: 12,
    textAlign: "center",
  },
  sectionBody: {
    color: "#737373",
    fontSize: 13,
    fontWeight: "300",
    textAlign: "center",
    marginBottom: 32,
  },
  textCenter: {
    textAlign: "center",
  },

  // --- BENEFITS ---
  benefitsGrid: {
    gap: 12,
  },
  benefitCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#171717",
    backgroundColor: "#0a0a0a",
  },
  benefitCardPink: {
    // hover:border-pink-500/10 — static border matches base
  },
  benefitCardPurple: {
    // hover:border-purple-500/10 — static border matches base
  },
  benefitTitlePink: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f472b6",
    marginBottom: 8,
  },
  benefitTitlePurple: {
    fontSize: 14,
    fontWeight: "500",
    color: "#c084fc",
    marginBottom: 8,
  },
  benefitDesc: {
    fontSize: 12,
    color: "#a3a3a3",
    lineHeight: 18,
    fontWeight: "300",
  },

  // --- RECURSOS ---
  recursosGrid: {
    gap: 12,
  },
  recursoCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#171717",
    backgroundColor: "rgba(10,10,10,0.4)",
    minHeight: 180,
  },
  iconBoxPurple: {
    height: 40,
    width: 40,
    borderRadius: 8,
    backgroundColor: "rgba(168,85,247,0.05)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#e5e5e5",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: "#a3a3a3",
    lineHeight: 18,
    fontWeight: "300",
  },

  // --- PLAN CARD ---
  planCard: {
    backgroundColor: "#040404",
    borderWidth: 1,
    borderColor: "#171717",
    borderRadius: 16,
    padding: 24,
  },
  planBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#c084fc",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "400",
    letterSpacing: -0.3,
    color: "#f5f5f5",
    marginBottom: 12,
  },
  planDesc: {
    color: "#a3a3a3",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "300",
    marginBottom: 20,
  },
  planFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  planFeatureItem: {
    width: "47%",
  },
  planFeatureText: {
    fontSize: 11,
    color: "#737373",
  },
  planBottom: {
    alignItems: "center",
    gap: 12,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "300",
    color: "#f5f5f5",
  },
  planPriceSuffix: {
    fontSize: 12,
    color: "#737373",
  },
  planCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  planCtaText: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 12,
  },

  // --- FAQ ---
  faqHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#171717",
    padding: 20,
    backgroundColor: "#040404",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: "500",
    color: "#d4d4d4",
    flex: 1,
    paddingRight: 12,
  },
  faqToggle: {
    color: "#a855f7",
    fontSize: 20,
    fontWeight: "300",
  },
  faqToggleOpen: {
    transform: [{ rotate: "45deg" }],
  },
  faqAnswerWrapper: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(168,85,247,0.3)",
  },
  faqAnswer: {
    fontSize: 12,
    color: "#a3a3a3",
    lineHeight: 18,
    fontWeight: "300",
  },

  // --- CLOSING CTA ---
  ctaSection: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    backgroundColor: "#020202",
    alignItems: "center",
  },
  ctaTitle: {
    fontStyle: "italic",
    fontSize: 30,
    fontWeight: "400",
    color: "#f5f5f5",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 16,
  },
  ctaBody: {
    color: "#a3a3a3",
    fontSize: 13,
    fontWeight: "300",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    maxWidth: 340,
  },
});
