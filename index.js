import * as dotenv from "dotenv";
import go from "./src/index.js";
import { CronJob } from "cron";
dotenv.config();

[
  "MASTODON_SERVER",
  "MASTODON_EMAIL",
  "MASTODON_PASS",
  "ALLOWLISTED_SERVERS",
  "REJECTED_KEYWORDS",
  "REJECTED_KEYWORDS_CASE_SENSITIVE",
  "OVERRIDE_KEYWORDS",
].forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`${variable} not set`);
  }
});

const cronString = process.env.CRON;
if (cronString) {
  console.log(`Starting in cron mode: ${cronString}`);
  const job = new CronJob(cronString, go);
  job.start();
} else {
  go();
}
