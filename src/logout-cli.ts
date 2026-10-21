import { rm } from "node:fs/promises";
import { tokenPath } from "./token-store.js";

async function main(): Promise<void> {
  await rm(tokenPath, { force: true });
  process.stdout.write("Credencial LinkedIn local removida. Revogue também o acesso nas configurações do LinkedIn.\n");
}

main().catch((error: unknown) => {
  process.stderr.write(error instanceof Error ? error.message + "\n" : "Erro ao remover credencial\n");
  process.exitCode = 1;
});
