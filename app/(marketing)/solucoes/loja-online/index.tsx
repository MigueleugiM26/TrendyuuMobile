import Navbar from "@/src/components/main_page/Navbar";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Camera,
  HelpCircle,
  Layers,
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
const recursosLojasOnline = [
  {
    title: "Fotos Profissionais sem Estúdio",
    desc: "Tire uma foto simples do seu produto físico com o celular e a IA transforma em uma imagem publicitária de alta definição, com iluminação de estúdio e cenários limpos.",
    icon: Camera,
  },
  {
    title: "Unboxing e Vídeos de Review",
    desc: "Grave seu vídeo de unboxing ou reação e deixe o TrendYuu montar o corte perfeito, com legendas dinâmicas por IA e áudio otimizado focado em gerar desejo de compra.",
    icon: Video,
  },
  {
    title: "Canvas Studio para Criativos",
    desc: "Monte workflows de criativos conectando a foto do seu produto com as melhores referências de anúncios da internet para gerar anúncios impossíveis de serem ignorados.",
    icon: Layers,
  },
];

const faqsLojas = [
  {
    question:
      "Como os donos de lojas online podem usar a inteligência artificial para criar fotos de produtos?",
    answer:
      "Com a IA do TrendYuu, você não precisa de câmeras profissionais ou cenários caros. Basta fazer o upload de uma foto básica do produto tirada no celular. A ferramenta de Imagem Inteligente remove o fundo automaticamente e posiciona o produto em cenários de alta conversão com iluminação 3D de estúdio.",
  },
  {
    question:
      "Consigo criar anúncios de vídeo para dropshipping de forma automática?",
    answer:
      "Sim! Com o Editor de Shorts e Clipes Automáticos do TrendYuu, você pode transformar vídeos simples de fornecedores ou gravações próprias de teste de produtos em criativos de alta retenção no formato 9:16 para TikTok Ads, Reels e Pinterest Ads.",
  },
  {
    question:
      "Como os Templates Inteligentes ajudam no catálogo do meu e-commerce?",
    answer:
      "Nossos templates permitem que você padronize o estilo visual da sua loja. Você escolhe um modelo ideal de fundo ou iluminação e altera apenas o produto em si com prompts rápidos de IA, mantendo uma consistência visual impecável e profissional no feed e no site.",
  },
  {
    question:
      "Qual plano do TrendYuu é o melhor para quem faz dropshipping ou tem e-commerce?",
    answer:
      "O Plano Creator é altamente recomendado para e-commerces que precisam testar múltiplos criativos toda semana, pois desbloqueia até 87.500 créditos, acesso às IAs de imagem avançadas como NanoBanana Pro e isolamento de áudio para remover ruídos de vídeos de produtos.",
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
export default function LojasOnlineScreen() {
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
          {/* BADGE MINIMALISTA */}
          <View style={styles.heroBadge}>
            <Zap size={12} color="#f472b6" />
            <Text style={styles.heroBadgeText}>
              Escala e Conversão para E-commerce & Dropshipping
            </Text>
          </View>

          {/* TÍTULO EDITORIAL COM SERIF */}
          <Text style={styles.heroTitle}>
            Crie fotos e vídeos de produtos que vendem sozinhos.
          </Text>

          <Text style={styles.heroSubtitle}>
            Diga adeus às fotos amadoras e criativos saturados de dropshipping.
            Transforme fotos comuns de produtos em imagens de estúdio de alta
            definição e crie vídeos de unboxing magnéticos com a IA do{" "}
            <Text style={styles.heroSubtitleBold}>TrendYuu</Text>.
          </Text>

          <View style={styles.heroCtas}>
            <TouchableOpacity
              style={styles.ctaPink}
              activeOpacity={0.85}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.ctaPinkText}>Girar Criativos com IA</Text>
              <ArrowRight size={16} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
              <Text style={styles.ctaSecondaryText}>Ver recursos visuais</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* === SEÇÃO DE CONEXÃO DE DORES === */}
        <View style={styles.sectionDark}>
          <Text style={styles.sectionSubheading}>
            Seus anúncios estão caros porque suas imagens parecem genéricas?
          </Text>

          <View style={styles.doresGrid}>
            <View style={styles.doreCardRed}>
              <Text style={styles.doreCardTitleRed}>
                ❌ Criativos Saturados do AliExpress
              </Text>
              <Text style={styles.doreCardDesc}>
                Utilizar exatamente as mesmas imagens e vídeos que seus
                concorrentes faz o custo por clique (CPC) do Facebook Ads
                disparar e destrói sua margem de lucro.
              </Text>
            </View>

            <View style={styles.doreCardGreen}>
              <Text style={styles.doreCardTitleGreen}>
                ✅ Customização Exclusiva por IA
              </Text>
              <Text style={styles.doreCardDesc}>
                Utilize nossa tecnologia para mesclar referências estéticas e
                gerar novos cenários profissionais para o mesmo produto,
                destacando sua marca no feed do cliente.
              </Text>
            </View>
          </View>
        </View>

        {/* === RECURSOS DE VALOR === */}
        <View style={styles.sectionBlack}>
          <Text style={styles.sectionHeading}>
            Como usar Inteligência Artificial para impulsionar o seu E-commerce?
          </Text>
          <Text style={styles.sectionBody}>
            Uma suíte de geração visual que coloca a sua loja no mesmo nível de
            grandes marcas multinacionais com apenas alguns cliques.
          </Text>

          <View style={styles.recursosGrid}>
            {recursosLojasOnline.map((item, idx) => (
              <View key={idx} style={styles.recursoCard}>
                <View style={styles.iconBoxPink}>
                  <item.icon size={20} color="#f472b6" />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* === UNBOXING E PRODUTO PRO — DESTAQUE === */}
        <View style={styles.sectionDark}>
          <View style={styles.unboxingCard}>
            <View style={styles.unboxingContent}>
              <Text style={styles.unboxingBadge}>
                Editor de Unboxing Inteligente
              </Text>
              <Text style={styles.unboxingTitle}>
                📦 O empreendedor digital filma, a IA edita!
              </Text>
              <Text style={styles.unboxingDesc}>
                Grave reações espontâneas ou unboxings básicos no estoque da sua
                loja. Nossa inteligência artificial limpa o áudio, remove ecos
                indesejados, insere legendas automáticas de alto impacto e
                sincroniza trilhas musicais livres de direitos autorais geradas
                pelo Google Lyria 2 do TrendYuu.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.unboxingCta}
              activeOpacity={0.85}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.unboxingCtaText}>Começar Grátis</Text>
              <Play size={12} color="#000000" fill="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* === FAQ SEÇÃO === */}
        <View style={styles.sectionBlack}>
          <View style={styles.faqHeadingRow}>
            <HelpCircle size={24} color="#525252" />
            <Text style={styles.sectionHeading}> Perguntas Frequentes</Text>
          </View>
          <Text style={[styles.sectionBody, styles.textCenter]}>
            Respostas rápidas sobre como revolucionar a produção de fotos e
            criativos em massa com IA.
          </Text>

          <View style={styles.faqList}>
            {faqsLojas.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </View>
        </View>

        {/* === CTA DE FECHAMENTO === */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            Coloque mais profissionalismo e aumente o ROI da sua loja hoje.
          </Text>
          <Text style={styles.ctaBody}>
            Monte seu fluxo de criação visual em segundos com o TrendYuu e gaste
            menos tempo editando e mais tempo vendendo.
          </Text>
          <TouchableOpacity
            style={styles.ctaPink}
            activeOpacity={0.85}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.ctaPinkText}>
              Criar Conteúdo para Minha Loja
            </Text>
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
    borderColor: "rgba(236,72,153,0.2)",
    backgroundColor: "rgba(236,72,153,0.05)",
    marginBottom: 24,
  },
  heroBadgeText: {
    color: "#f472b6",
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
  ctaPink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#db2777",
    borderRadius: 8,
  },
  ctaPinkText: {
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

  // --- DORES ---
  doresGrid: {
    gap: 12,
  },
  doreCardRed: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#171717",
    backgroundColor: "rgba(10,10,10,0.2)",
  },
  doreCardGreen: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#171717",
    backgroundColor: "rgba(10,10,10,0.2)",
  },
  doreCardTitleRed: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f472b6",
    marginBottom: 8,
  },
  doreCardTitleGreen: {
    fontSize: 14,
    fontWeight: "500",
    color: "#34d399",
    marginBottom: 8,
  },
  doreCardDesc: {
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
  iconBoxPink: {
    height: 40,
    width: 40,
    borderRadius: 8,
    backgroundColor: "rgba(236,72,153,0.05)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.1)",
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

  // --- UNBOXING CARD ---
  unboxingCard: {
    backgroundColor: "#040404",
    borderWidth: 1,
    borderColor: "#171717",
    borderRadius: 16,
    padding: 24,
    gap: 24,
  },
  unboxingContent: {
    gap: 12,
  },
  unboxingBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#f472b6",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  unboxingTitle: {
    fontSize: 20,
    fontWeight: "400",
    letterSpacing: -0.3,
    color: "#f5f5f5",
  },
  unboxingDesc: {
    color: "#a3a3a3",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "300",
  },
  unboxingCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  unboxingCtaText: {
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
    color: "#ec4899",
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
    borderLeftColor: "rgba(236,72,153,0.3)",
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
