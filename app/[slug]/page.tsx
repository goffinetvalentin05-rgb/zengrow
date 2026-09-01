import type { Metadata } from "next";
import { generatePublicProfileMetadata, PublicProfileRoute } from "@/src/components/discovery/public-profile-route";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return generatePublicProfileMetadata(slug);
}

export default async function ShortPublicProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  return <PublicProfileRoute username={slug} searchParams={searchParams} />;
}
