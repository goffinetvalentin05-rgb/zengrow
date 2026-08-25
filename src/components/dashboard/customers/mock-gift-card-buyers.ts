export type GiftCardBuyerMarketingStatus = "opt-in" | "opt-out";

export type GiftCardBuyer = {
  id: string;
  name: string;
  email: string;
  giftCardsBought: number;
  totalSpentChf: number;
  lastPurchaseLabel: string;
  marketingStatus: GiftCardBuyerMarketingStatus;
};

export const MOCK_GIFT_CARD_BUYERS: GiftCardBuyer[] = [
  {
    id: "buyer-anna",
    name: "Anna Müller",
    email: "anna@email.ch",
    giftCardsBought: 2,
    totalSpentChf: 250,
    lastPurchaseLabel: "24 août 2026",
    marketingStatus: "opt-in",
  },
  {
    id: "buyer-marc",
    name: "Marc Dupont",
    email: "marc@email.ch",
    giftCardsBought: 1,
    totalSpentChf: 150,
    lastPurchaseLabel: "20 août 2026",
    marketingStatus: "opt-out",
  },
  {
    id: "buyer-sophie",
    name: "Sophie Rossi",
    email: "sophie@email.ch",
    giftCardsBought: 3,
    totalSpentChf: 320,
    lastPurchaseLabel: "23 août 2026",
    marketingStatus: "opt-in",
  },
];
