import Navbar from "@/src/components/main_page/Navbar";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  HelpCircle,
  LayoutTemplate,
  Megaphone,
  Package,
  Rocket,
  Scissors,
  Video,
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
// DADOS DA PÁGINA
// ============================================
const perfis = [
  {
    title: "Afiliado",
    description:
      "Crie criativos e vídeos de review todos os dias sem depender de editor pra escalar suas campanhas.",
    icon: Megaphone,
  },
  {
    title: "Infoprodutor",
    description:
      "Transforme aulas, lançamentos e conteúdo de valor em posts, cortes e artes pra atrair alunos todo dia.",
    icon: Rocket,
  },
  {
    title: "Dropshipper",
    description:
      "Gere fotos de produto profissionais e vídeos de vendas sem precisar de estúdio ou fotógrafo.",
    icon: Package,
  },
];

const dores = [
  "Perco horas editando vídeo em vez de vender",
  "Não tenho dinheiro pra contratar editor ou designer todo mês",
  "Meu conteúdo não tem identidade visual e parece amador",
  "Fico sem postar e minhas vendas caem",
  "Preciso de foto de produto boa mas não tenho estúdio",
  "Uso 5 ferramentas diferentes e perco tempo entre elas",
];

const recursos = [
  {
    title: "Canvas Studio",
    description:
      "Crie artes, posts e carrosséis do zero com IA, direto na mesma tela onde você monta seus vídeos.",
    icon: LayoutTemplate,
    href: "/features/canvas-studio",
  },
  {
    title: "Foto de Produto",
    description:
      "Transforme uma foto simples em imagem de produto com qualidade de estúdio, sem fotógrafo.",
    icon: Camera,
    href: "/features/foto-produto",
  },
  {
    title: "Vídeo de Produto",
    description:
      "Gere vídeos de vendas e demonstração de produto com IA em poucos minutos.",
    icon: Video,
    href: "/features/video-produto",
  },
  {
    title: "Editor de Shorts",
    description:
      "Edite cortes, Reels e Shorts com legenda automática e narração por IA.",
    icon: Scissors,
    href: "/features/short-editor",
  },
];

const passos = [
  {
    step: "01",
    title: "Escolha a ferramenta certa pro seu conteúdo",
    description:
      "Vídeo, foto de produto, arte ou corte — tudo dentro da mesma plataforma.",
  },
  {
    step: "02",
    title: "Gere com IA em minutos",
    description:
      "Sem curva de aprendizado, sem precisar saber editar ou desenhar.",
  },
  {
    step: "03",
    title: "Publique e venda todo dia",
    description:
      "Exporte pronto pro Instagram, TikTok, YouTube ou onde você vende.",
  },
];

const faqs = [
  {
    question: "O TrendYuu serve pra quem tá começando como afiliado?",
    answer:
      "Sim. O TrendYuu foi feito justamente pra quem precisa criar conteúdo todos os dias sem ter equipe ou experiência em edição, incluindo afiliados iniciantes.",
  },
  {
    question:
      "Consigo criar conteúdo pra vender todo dia sem contratar editor?",
    answer:
      "Sim. Com o Editor de Shorts, o Canvas Studio e os geradores de imagem e vídeo por IA, você cria os criativos sozinho, direto na plataforma.",
  },
  {
    question:
      "Preciso de estúdio pra tirar foto de produto pro meu e-commerce?",
    answer:
      "Não. A ferramenta de Foto de Produto do TrendYuu transforma uma foto simples, tirada até com celular, em uma imagem com qualidade profissional.",
  },
  {
    question: "O TrendYuu funciona pra infoprodutor que dá aula e vende curso?",
    answer:
      "Sim. Você pode transformar trechos de aulas e lançamentos em cortes, posts e artes pra divulgar seu infoproduto todos os dias.",
  },
  {
    question: "Quanto custa o plano pra empreendedor digital?",
    answer:
      "O TrendYuu tem planos a partir de R$80,90/mês, com opções para quem está começando até quem já gerencia contas de clientes.",
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
export default function EmpreendedorDigitalScreen() {
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
          {/* BADGE */}
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              Feito pra empreendedor digital
            </Text>
          </View>

          {/* TÍTULO */}
          <Text style={styles.heroTitle}>
            A ferramenta de IA pra criar conteúdo todo dia e vender mais.
          </Text>

          <Text style={styles.heroSubtitle}>
            Se você é afiliado, infoprodutor ou dropshipper, o TrendYuu reúne
            edição de vídeo, criação de artes, fotos de produtos e geração
            inteligente num só lugar.
          </Text>

          <View style={styles.heroCtas}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              activeOpacity={0.85}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.ctaPrimaryText}>Começar agora</Text>
              <ArrowRight size={16} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
              <Text style={styles.ctaSecondaryText}>Ver ferramentas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* === PRA QUEM É === */}
        <View style={styles.sectionDark}>
          <Text style={styles.sectionSubheading}>
            Desenvolvido para acelerar o seu modelo de vendas online
          </Text>
          <Text style={styles.sectionSubtext}>
            Não importa o seu nicho, o TrendYuu se encaixa na sua rotina diária
            de criação de conteúdo.
          </Text>

          <View style={styles.perfilGrid}>
            {perfis.map((perfil) => (
              <View key={perfil.title} style={styles.perfilCard}>
                <View style={styles.iconBox}>
                  <perfil.icon size={20} color="#f472b6" />
                </View>
                <Text style={styles.cardTitle}>{perfil.title}</Text>
                <Text style={styles.cardDescription}>{perfil.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* === DORES === */}
        <View style={styles.sectionBlack}>
          <Text style={styles.sectionHeading}>
            Se algum desses problemas é seu, nós resolvemos.
          </Text>
          <Text style={styles.sectionBody}>
            A maioria dos empreendedores digitais trava na hora de produzir o
            criativo, não na estratégia comercial.
          </Text>

          <View style={styles.doresGrid}>
            {dores.map((dor) => (
              <View key={dor} style={styles.dorCard}>
                <CheckCircle2
                  size={16}
                  color="#ec4899"
                  style={styles.dorIcon}
                />
                <Text style={styles.dorText}>{dor}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* === RECURSOS PRÁTICOS === */}
        <View style={styles.sectionDark}>
          <Text style={styles.sectionHeading}>
            Tudo o que você precisa para criar conteúdo todos os dias
          </Text>
          <Text style={styles.sectionBody}>
            Quatro ferramentas essenciais unificadas em uma única assinatura —
            eliminando softwares desconexos.
          </Text>

          <View style={styles.recursosGrid}>
            {recursos.map((recurso) => (
              <TouchableOpacity
                key={recurso.href}
                style={styles.recursoCard}
                activeOpacity={0.8}
                onPress={() => router.push(recurso.href as any)}
              >
                <View>
                  <View style={styles.iconBox}>
                    <recurso.icon size={20} color="#f472b6" />
                  </View>
                  <Text style={styles.cardTitle}>{recurso.title}</Text>
                  <Text style={styles.cardDescription}>
                    {recurso.description}
                  </Text>
                </View>
                <View style={styles.recursoFooter}>
                  <Text style={styles.recursoLink}>Conhecer</Text>
                  <ArrowRight size={12} color="#f472b6" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* === COMO FUNCIONA === */}
        <View style={styles.sectionBlack}>
          <Text style={[styles.sectionHeading, styles.textCenter]}>
            Como funciona
          </Text>

          <View style={styles.passosGrid}>
            {passos.map((passo) => (
              <View key={passo.step} style={styles.passoItem}>
                <Text style={styles.passoStep}>{passo.step}</Text>
                <Text style={styles.passoTitle}>{passo.title}</Text>
                <Text style={styles.passoDescription}>{passo.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* === PERGUNTAS FREQUENTES === */}
        <View style={styles.sectionDark}>
          <View style={styles.faqHeadingRow}>
            <HelpCircle size={24} color="#525252" />
            <Text style={styles.sectionHeading}> Perguntas Frequentes</Text>
          </View>
          <Text style={[styles.sectionBody, styles.textCenter]}>
            Saiba como acelerar suas conversões diárias usando IA especializada.
          </Text>

          <View style={styles.faqList}>
            {faqs.map((faq) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </View>
        </View>

        {/* === CTA DE FECHAMENTO === */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            Comece a criar conteúdo pra vender todo dia.
          </Text>
          <Text style={styles.ctaBody}>
            Economize horas de trabalho operacional manual. Teste o TrendYuu
            agora mesmo e mude o nível da sua produção.
          </Text>
          <TouchableOpacity
            style={styles.ctaPrimary}
            activeOpacity={0.85}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.ctaPrimaryText}>Criar minha conta grátis</Text>
            <ArrowRight size={16} color="#ec4899" />
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
  heroCtas: {
    width: "100%",
    gap: 12,
  },
  ctaPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  ctaPrimaryText: {
    color: "#000000",
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
    marginBottom: 8,
  },
  sectionSubtext: {
    color: "#737373",
    fontSize: 12,
    fontWeight: "300",
    textAlign: "center",
    marginBottom: 32,
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

  // --- PERFIS ---
  perfilGrid: {
    gap: 12,
  },
  perfilCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#171717",
    backgroundColor: "#0a0a0a",
  },
  iconBox: {
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
    fontSize: 14,
    fontWeight: "500",
    color: "#e5e5e5",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 12,
    color: "#a3a3a3",
    lineHeight: 18,
    fontWeight: "300",
  },

  // --- DORES ---
  doresGrid: {
    gap: 10,
  },
  dorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#171717",
    padding: 16,
    backgroundColor: "#030303",
  },
  dorIcon: {
    marginTop: 1,
  },
  dorText: {
    fontSize: 12,
    color: "#d4d4d4",
    lineHeight: 18,
    fontWeight: "300",
    flex: 1,
  },

  // --- RECURSOS ---
  recursosGrid: {
    gap: 12,
  },
  recursoCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#171717",
    backgroundColor: "rgba(10,10,10,0.4)",
    justifyContent: "space-between",
    minHeight: 180,
  },
  recursoFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 16,
  },
  recursoLink: {
    fontSize: 11,
    color: "#f472b6",
  },

  // --- PASSOS ---
  passosGrid: {
    gap: 28,
    marginTop: 8,
  },
  passoItem: {},
  passoStep: {
    fontStyle: "italic",
    fontSize: 22,
    color: "rgba(244,114,182,0.8)",
    marginBottom: 8,
  },
  passoTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#e5e5e5",
    marginBottom: 6,
  },
  passoDescription: {
    fontSize: 12,
    color: "#a3a3a3",
    lineHeight: 18,
    fontWeight: "300",
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
    backgroundColor: "#000000",
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
