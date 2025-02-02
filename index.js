import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.MASTODON_PASS) {
  throw new Error("environment not set");
}

await import("./src/index.js");
