import Navbar from "@/src/components/main_page/Navbar";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  HelpCircle,
  Layers,
  Play,
  ShieldCheck,
  Sparkles,
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
const recursosAfiliados = [
  {
    title: "Criação de Shorts & Reels Virais",
    desc: "Crie dezenas de vídeos de review e depoimentos realistas por IA em minutos. Perfeito para TikTok, Reels e YouTube Shorts.",
    icon: Video,
  },
  {
    title: "Imagens de Produtos em Cenários Reais",
    desc: "Transforme qualquer foto simples do produtor em uma imagem de estúdio de alta conversão para os seus anúncios.",
    icon: Layers,
  },
  {
    title: "Editor de Criativos em Massa",
    desc: "Gere variações de criativos de imagem com gatilhos mentais diferentes para testar o seu público sem perder horas no Canva.",
    icon: Sparkles,
  },
];

const faqsAfiliados = [
  {
    question:
      "Qual é a melhor ferramenta de inteligência artificial para afiliados atualmente?",
    answer:
      "A melhor ferramenta é aquela que une todas as etapas em um só lugar. O TrendYuu foi desenvolvido focado em conversão para marketing de afiliados, permitindo criar vídeos curtos de vendas (Shorts/Reels), fotos profissionais de produtos e design de criativos sem precisar dominar edição.",
  },
  {
    question:
      "Como criar criativos de alta conversão para afiliados usando IA?",
    answer:
      "Para criar criativos que convertem, você precisa de um forte gancho visual e de uma boa cópia. Com a IA do TrendYuu, você pode gerar roteiros persuasivos, usar gerador de voz ultra-realista e legendar automaticamente vídeos para prender a atenção do usuário nos primeiros 3 segundos do anúncio.",
  },
  {
    question: "Consigo usar a IA para vender como afiliado sem aparecer?",
    answer:
      "Sim! Essa é a maior vantagem. Você pode criar canais de nicho (canais dark) no TikTok e Instagram usando as ferramentas de geração de vídeos, vozes neurais realistas e imagens geradas por IA para fazer reviews de produtos físicos e digitais de forma 100% oculta.",
  },
  {
    question:
      "A ferramenta serve para afiliados iniciantes na Hotmart, Kiwify ou Monetizze?",
    answer:
      "Com certeza. O TrendYuu é extremamente intuitivo e elimina a necessidade de contratar designers, editores ou estúdios fotográficos profissionais, permitindo que quem está começando monte seus primeiros anúncios profissionais com cliques simples.",
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
export default function AfiliadosScreen() {
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
          {/* BADGE COM ROSA ELEGANTE */}
          <View style={styles.heroBadge}>
            <Zap size={12} color="#f472b6" />
            <Text style={styles.heroBadgeText}>
              IA Focada em Marketing de Afiliados
            </Text>
          </View>

          {/* TÍTULO */}
          <Text style={styles.heroTitle}>
            A melhor ferramenta de inteligência artificial para afiliados
            venderem todo dia.
          </Text>

          <Text style={styles.heroSubtitle}>
            Chega de travar na hora de subir anúncios ou criar conteúdo. Crie
            criativos em vídeo altamente persuasivos, imagens de produtos
            profissionais e cortes automáticos com IA para escalar suas
            conversões.
          </Text>

          <View style={styles.heroCtas}>
            <TouchableOpacity
              style={styles.ctaWhite}
              activeOpacity={0.85}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.ctaWhiteText}>Começar a Vender com IA</Text>
              <ArrowRight size={16} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctaSecondary} activeOpacity={0.85}>
              <Text style={styles.ctaSecondaryText}>
                Ver recursos de conversão
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* === SEÇÃO DE DOR E SOLUÇÃO === */}
        <View style={styles.sectionDark}>
          <Text style={styles.sectionSubheading}>
            Por que a maioria dos afiliados falha na hora de criar anúncios?
          </Text>

          <View style={styles.dorSolucaoGrid}>
            {/* Card tradicional / negativo */}
            <View style={styles.dorCardNeutral}>
              <Text style={styles.dorCardLabelNeutral}>
                ❌ O Processo Tradicional Demorado
              </Text>
              <View style={styles.listItems}>
                {[
                  "Horas editando o mesmo vídeo no CapCut",
                  "Gastar rios de dinheiro contratando freelancers",
                  "Bloqueios no Facebook Ads por criativos repetidos",
                  "Dificuldade em achar ideias novas de conteúdo",
                ].map((item) => (
                  <Text key={item} style={styles.listItemNeutral}>
                    • {item}
                  </Text>
                ))}
              </View>
              <View style={styles.dorCardFooterNeutral}>
                <Text style={styles.dorCardFooterTextNeutral}>
                  Alto custo operacional e lentidão para testar produtos.
                </Text>
              </View>
            </View>

            {/* Card TrendYuu / positivo */}
            <View style={styles.dorCardPink}>
              <Text style={styles.dorCardLabelPink}>
                ✅ O Efeito de Escala com o TrendYuu
              </Text>
              <View style={styles.listItems}>
                {[
                  "Crie 10 variações de criativos em 3 minutos",
                  "Inteligência artificial focada em gatilhos de vendas",
                  "Imagens exclusivas que evitam bloqueios por padrão",
                  "Produção em massa para tráfego orgânico (Canais Dark)",
                ].map((item) => (
                  <Text key={item} style={styles.listItemPink}>
                    • {item}
                  </Text>
                ))}
              </View>
              <View style={styles.dorCardFooterPink}>
                <Text style={styles.dorCardFooterTextPink}>
                  Criação acelerada para múltiplos canais e campanhas.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* === RECURSOS PRÁTICOS === */}
        <View style={styles.sectionBlack}>
          <Text style={styles.sectionHeading}>
            Como criar criativos de alta conversão para afiliados?
          </Text>
          <Text style={styles.sectionBody}>
            Utilize nossa suíte completa de ferramentas guiadas por inteligência
            artificial e acelere o seu funil de vendas.
          </Text>

          <View style={styles.recursosGrid}>
            {recursosAfiliados.map((item, idx) => (
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

        {/* === SEÇÃO DE CONVERSÃO / ESCUDO === */}
        <View style={styles.sectionDark}>
          <View style={styles.escudoCard}>
            <View style={styles.escudoContent}>
              <Text style={styles.escudoBadge}>Segurança de Campanha</Text>
              <View style={styles.escudoTitleRow}>
                <ShieldCheck size={20} color="#f472b6" />
                <Text style={styles.escudoTitle}>
                  {" "}
                  Escudo Anti-Bloqueio Integrado
                </Text>
              </View>
              <Text style={styles.escudoDesc}>
                Nossa IA gera elementos visuais únicos e texturas personalizadas
                que evitam que o Facebook Ads e TikTok Ads marquem seus anúncios
                como duplicados, aumentando drasticamente a vida útil das suas
                contas de contingência.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.escudoCta}
              activeOpacity={0.85}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.escudoCtaText}>Começar Teste Grátis</Text>
              <Play size={14} color="#000000" fill="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* === FAQ SEÇÃO === */}
        <View style={styles.sectionBlack}>
          <View style={styles.faqHeadingRow}>
            <HelpCircle size={24} color="#525252" />
            <Text style={styles.sectionHeading}>
              {" "}
              Dúvidas Frequentes de Afiliados
            </Text>
          </View>
          <Text style={[styles.sectionBody, styles.textCenter]}>
            Tudo o que você precisa saber sobre como usar IA para impulsionar
            suas conversões de afiliados.
          </Text>

          <View style={styles.faqList}>
            {faqsAfiliados.map((faq, index) => (
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
            Comece a escalar suas vendas como afiliado hoje mesmo.
          </Text>
          <Text style={styles.ctaBody}>
            Pare de gastar dinheiro com edições lentas. Teste o TrendYuu e sinta
            a diferença no seu ROI.
          </Text>
          <TouchableOpacity
            style={styles.ctaWhite}
            activeOpacity={0.85}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.ctaWhiteText}>
              Criar Minha Conta de Afiliado
            </Text>
            <TrendingUp size={16} color="#ec4899" />
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
  ctaWhite: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  ctaWhiteText: {
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

  // --- DOR E SOLUÇÃO ---
  dorSolucaoGrid: {
    gap: 12,
  },
  dorCardNeutral: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#171717",
    backgroundColor: "#050505",
  },
  dorCardPink: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.1)",
    backgroundColor: "#080808",
  },
  dorCardLabelNeutral: {
    fontSize: 10,
    fontWeight: "600",
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  dorCardLabelPink: {
    fontSize: 10,
    fontWeight: "600",
    color: "#f472b6",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  listItems: {
    gap: 10,
    marginBottom: 24,
  },
  listItemNeutral: {
    fontSize: 12,
    color: "#a3a3a3",
    lineHeight: 18,
    fontWeight: "300",
  },
  listItemPink: {
    fontSize: 12,
    color: "#d4d4d4",
    lineHeight: 18,
    fontWeight: "300",
  },
  dorCardFooterNeutral: {
    borderTopWidth: 1,
    borderTopColor: "rgba(23,23,23,0.5)",
    paddingTop: 12,
  },
  dorCardFooterPink: {
    borderTopWidth: 1,
    borderTopColor: "rgba(236,72,153,0.1)",
    paddingTop: 12,
  },
  dorCardFooterTextNeutral: {
    fontSize: 11,
    color: "#525252",
  },
  dorCardFooterTextPink: {
    fontSize: 11,
    color: "rgba(244,114,182,0.8)",
    fontWeight: "500",
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
    backgroundColor: "#0a0a0a",
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
    fontSize: 14,
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

  // --- ESCUDO CARD ---
  escudoCard: {
    borderWidth: 1,
    borderColor: "#171717",
    backgroundColor: "#050505",
    borderRadius: 16,
    padding: 24,
    gap: 20,
  },
  escudoContent: {
    gap: 10,
  },
  escudoBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#f472b6",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  escudoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  escudoTitle: {
    fontSize: 18,
    fontWeight: "400",
    letterSpacing: -0.3,
    color: "#f5f5f5",
    flex: 1,
  },
  escudoDesc: {
    fontSize: 13,
    color: "#a3a3a3",
    lineHeight: 20,
    fontWeight: "300",
  },
  escudoCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  escudoCtaText: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 13,
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
    borderTopWidth: 1,
    borderTopColor: "#171717",
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
