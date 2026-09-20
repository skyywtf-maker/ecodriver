import "server-only";
import { db } from "./db";

/**
 * Le chauffeur unique.
 *
 * Renvoie null tant qu'aucun enregistrement n'existe : c'est le cas avant le
 * premier `npm run seed-driver`, et les pages doivent le dire plutôt que de
 * planter.
 */
export async function getDriver() {
  return db.driver.findFirst({ orderBy: { createdAt: "asc" } });
}

/**
 * Coordonnées de notification.
 *
 * Elles viennent de la base, où le chauffeur peut les modifier lui-même. Les
 * variables d'environnement servent de secours tant que la fiche n'est pas
 * remplie, pour ne pas perdre une demande de course.
 */
export async function driverContact(): Promise<{ email: string; phone: string }> {
  const driver = await getDriver().catch(() => null);
  return {
    email: driver?.contactEmail || driver?.email || process.env.DRIVER_NOTIFICATION_EMAIL || "",
    phone: driver?.contactPhone || process.env.DRIVER_PHONE_E164 || "",
  };
}
