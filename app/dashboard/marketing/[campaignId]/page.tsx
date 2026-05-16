import { redirect } from "next/navigation";

type CampaignDetailPageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { campaignId } = await params;
  redirect(`/dashboard/marketing?campaign=${encodeURIComponent(campaignId)}`);
}
