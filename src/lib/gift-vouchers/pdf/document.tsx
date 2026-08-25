import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatGiftVoucherDate } from "@/src/lib/gift-vouchers/map";
import type { GiftVoucherPresentation } from "@/src/lib/gift-vouchers/branding";
import { isExperienceOfferKind } from "@/src/lib/gift-vouchers/offers/types";
import { formatCentsAsChfPdf, pdfSafeText } from "@/src/lib/gift-vouchers/pdf/text";

export type GiftVoucherPdfDocumentProps = {
  presentation: GiftVoucherPresentation;
  publicUrl: string;
  logoDataUrl: string | null;
  coverDataUrl: string | null;
  qrDataUrl: string;
  fontFamily: string;
};

export function GiftVoucherPdfDocument({
  presentation,
  publicUrl,
  logoDataUrl,
  coverDataUrl,
  qrDataUrl,
  fontFamily,
}: GiftVoucherPdfDocumentProps) {
  const styles = makeStyles(fontFamily);
  const initial = pdfSafeText(presentation.restaurantName.slice(0, 1).toUpperCase());
  const experience = isExperienceOfferKind(presentation.offerKind);
  const heading = pdfSafeText(
    experience
      ? presentation.experienceLabel || presentation.offerTitle
      : presentation.offerTitle,
  );
  const rows: Array<{ label: string; value: string }> = [
    { label: "Bénéficiaire", value: pdfSafeText(presentation.recipientName || "—") },
  ];
  if (presentation.includeBuyerOnPdf && presentation.buyerName) {
    rows.push({ label: "Offert par", value: pdfSafeText(presentation.buyerName) });
  }
  if (experience && presentation.partySize && presentation.partySize > 0) {
    rows.push({
      label: "Personnes",
      value: presentation.partySize === 1 ? "1 personne" : `${presentation.partySize} personnes`,
    });
  }
  rows.push(
    { label: "Expiration", value: pdfSafeText(formatGiftVoucherDate(presentation.expiresAt)) },
    { label: "Code", value: pdfSafeText(presentation.code) },
  );

  return (
    <Document
      title={pdfSafeText(`${heading} ${presentation.code}`)}
      author={pdfSafeText(presentation.restaurantName)}
    >
      <Page size="A4" wrap={false} style={styles.page}>
        <View style={styles.header}>
          {logoDataUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={logoDataUrl} style={styles.logo} />
          ) : (
            <View style={[styles.logoFallback, { backgroundColor: presentation.accentColor }]}>
              <Text style={styles.logoFallbackText}>{initial}</Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.restaurantName}>{pdfSafeText(presentation.restaurantName)}</Text>
            {presentation.footer ? <Text style={styles.contact}>{pdfSafeText(presentation.footer)}</Text> : null}
          </View>
        </View>

        {coverDataUrl ? (
          <View style={styles.coverWrap}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={coverDataUrl} style={styles.cover} />
          </View>
        ) : (
          <View style={[styles.coverFallback, { backgroundColor: presentation.accentColor }]}>
            <Text style={{ color: presentation.foregroundColor, fontSize: 16, fontFamily, fontWeight: 600 }}>
              {heading}
            </Text>
          </View>
        )}

        <Text style={[styles.kicker, { color: presentation.accentColor }]}>
          {experience ? "Expérience" : "Bon cadeau"}
        </Text>
        <Text style={styles.title}>{heading}</Text>
        {experience && presentation.offerDescription ? (
          <Text style={styles.description}>{pdfSafeText(presentation.offerDescription)}</Text>
        ) : null}
        {!experience ? (
          <Text style={[styles.amount, { color: presentation.accentColor }]}>
            {formatCentsAsChfPdf(presentation.initialAmountCents)}
          </Text>
        ) : null}

        <View style={styles.grid}>
          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
          ))}
        </View>

        {presentation.message ? <Text style={styles.message}>{pdfSafeText(presentation.message)}</Text> : null}

        <Text style={styles.terms}>{pdfSafeText(presentation.terms)}</Text>

        <View style={styles.footerBlock}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={qrDataUrl} style={styles.qr} />
          <Text style={styles.code}>{pdfSafeText(presentation.code)}</Text>
          <Text style={styles.qrHint}>
            {pdfSafeText(
              experience
                ? "Scannez ce QR pour consulter le bon et l’ajouter à Apple Wallet. Il n’encaisse pas le bon."
                : "Scannez ce QR pour consulter le solde et ajouter le bon à Apple Wallet. Il n’encaisse pas le bon.",
            )}
          </Text>
          <Text style={styles.qrHint}>{pdfSafeText(publicUrl)}</Text>
          <Text style={styles.footer}>{pdfSafeText("Document généré par ZenGrow")}</Text>
        </View>
      </Page>
    </Document>
  );
}

function makeStyles(fontFamily: string) {
  return StyleSheet.create({
    page: {
      fontFamily,
      fontSize: 10,
      color: "#1e293b",
      backgroundColor: "#ffffff",
      paddingTop: 36,
      paddingBottom: 40,
      paddingHorizontal: 44,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 22,
    },
    headerText: {
      marginLeft: 14,
      flexGrow: 1,
    },
    logo: {
      width: 56,
      height: 56,
      objectFit: "contain",
    },
    logoFallback: {
      width: 56,
      height: 56,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    logoFallbackText: {
      color: "#ffffff",
      fontSize: 22,
      fontFamily,
      fontWeight: 600,
    },
    restaurantName: {
      fontSize: 18,
      fontFamily,
      fontWeight: 600,
      color: "#0f172a",
    },
    contact: {
      marginTop: 3,
      fontSize: 9,
      color: "#64748b",
      maxWidth: 360,
    },
    coverWrap: {
      height: 210,
      width: "100%",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 22,
    },
    cover: {
      width: "100%",
      height: 210,
      objectFit: "cover",
      objectPosition: "center",
      borderRadius: 10,
    },
    coverFallback: {
      height: 210,
      width: "100%",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    kicker: {
      fontSize: 9,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    title: {
      fontSize: 26,
      fontFamily,
      fontWeight: 600,
      color: "#0f172a",
      marginBottom: 6,
    },
    description: {
      fontSize: 11,
      lineHeight: 1.45,
      color: "#334155",
      marginBottom: 16,
    },
    amount: {
      fontSize: 28,
      fontFamily,
      fontWeight: 700,
      marginBottom: 18,
    },
    grid: {
      borderTopWidth: 1,
      borderTopColor: "#e2e8f0",
      paddingTop: 14,
      marginBottom: 16,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    label: {
      fontSize: 9,
      color: "#64748b",
      width: "34%",
    },
    value: {
      fontSize: 11,
      fontFamily,
      fontWeight: 600,
      color: "#0f172a",
      width: "66%",
      textAlign: "right",
    },
    message: {
      marginTop: 4,
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: "#f8fafc",
      fontSize: 11,
      lineHeight: 1.45,
    },
    terms: {
      fontSize: 8.5,
      lineHeight: 1.45,
      color: "#475569",
      marginBottom: 18,
    },
    footerBlock: {
      marginTop: "auto",
      alignItems: "center",
    },
    qr: {
      width: 108,
      height: 108,
      marginBottom: 8,
    },
    code: {
      fontSize: 13,
      fontFamily,
      fontWeight: 600,
      letterSpacing: 1.6,
      marginBottom: 4,
    },
    qrHint: {
      fontSize: 8,
      color: "#64748b",
      textAlign: "center",
      maxWidth: 320,
    },
    footer: {
      marginTop: 10,
      fontSize: 8,
      color: "#94a3b8",
      textAlign: "center",
    },
  });
}
