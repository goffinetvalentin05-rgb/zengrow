import { PROFILE_TYPE_LABELS, type ProfileType } from "@/src/lib/discovery/constants";

export function defaultRoleLabel(profileType: ProfileType | null, categoryName: string | null) {
  if (profileType && categoryName) {
    if (profileType === "builder") return `${categoryName} Builder`;
    if (profileType === "founder") return `${categoryName} Founder`;
    if (profileType === "operator") return `${categoryName} Operator`;
    if (profileType === "creator") return `${categoryName} Creator`;
    if (profileType === "coach") return `${categoryName} Coach`;
    if (profileType === "investor") return `${categoryName} Investor`;
    if (profileType === "freelancer") return `${categoryName} Freelancer`;
    if (profileType === "marketer") return `${categoryName} Marketer`;
    if (profileType === "developer") return `${categoryName} Developer`;
  }
  if (profileType) return PROFILE_TYPE_LABELS[profileType];
  return categoryName;
}
