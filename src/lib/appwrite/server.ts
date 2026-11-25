import { Account, Client, Databases, Storage, Users } from "node-appwrite";
import { appwriteConfig } from "@/lib/config";

/** Server-side Appwrite admin client. Uses the API key — never imported by client code. */
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.apiKey);

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

/** Client scoped to a user session secret (stored inside the signed session cookie). */
export function createSessionClient(secret?: string) {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);
  if (secret) client.setSession(secret);
  return { client, account: new Account(client), databases: new Databases(client) };
}
