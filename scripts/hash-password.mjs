import bcrypt from "bcryptjs";

const pwd = process.argv[2];
if (!pwd) {
  console.error('Usage : npm run hash-password -- "votre-mot-de-passe"');
  process.exit(1);
}
const hash = bcrypt.hashSync(pwd, 12);
console.log("\nDRIVER_PASSWORD_HASH_B64=" + Buffer.from(hash).toString("base64") + "\n");
