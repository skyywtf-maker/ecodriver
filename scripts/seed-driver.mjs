/**
 * Crée ou met à jour le compte chauffeur unique.
 *
 *   npm run seed-driver -- "email@exemple.fr" "mot-de-passe" "Nicolas"
 *
 * Le mot de passe n'est jamais stocké en clair : seul son hachage bcrypt part
 * en base. Relancer la commande met simplement à jour l'enregistrement.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [email, password, firstName = ""] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage : npm run seed-driver -- "email@exemple.fr" "mot-de-passe" "Prénom"');
  process.exit(1);
}

const db = new PrismaClient();
const passwordHash = bcrypt.hashSync(password, 12);
const existing = await db.driver.findFirst({ orderBy: { createdAt: "asc" } });

const driver = existing
  ? await db.driver.update({
      where: { id: existing.id },
      data: { email, passwordHash, firstName: firstName || existing.firstName },
    })
  : await db.driver.create({
      data: { email, passwordHash, firstName, contactEmail: email },
    });

console.log(`\nChauffeur ${existing ? "mis à jour" : "créé"} : ${driver.email}\n`);
await db.$disconnect();
