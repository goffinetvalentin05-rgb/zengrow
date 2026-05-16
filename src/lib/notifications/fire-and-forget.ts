import type { CreateNotificationResult } from "@/src/lib/notifications/types";

/** N’interrompt pas le flux métier si la notification échoue. */
export function fireNotification(promise: Promise<CreateNotificationResult>): void {
  void promise.then((result) => {
    if (!result.ok) {
      console.error("[notification]", result.error);
    }
  });
}
