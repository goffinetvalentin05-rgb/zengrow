export type PublicPagePublishState = {
  pageStatus: "draft" | "published";
  publishedAt: string | null;
  hasUnpublishedChanges: boolean;
};
