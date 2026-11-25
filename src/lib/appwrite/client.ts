"use client";

import { Account, Client, Databases, Storage } from "appwrite";
import { appwriteConfig } from "@/lib/config";

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const appwriteAccount = new Account(client);
export const appwriteDatabases = new Databases(client);
export const appwriteStorage = new Storage(client);
export { client as appwriteClient };
