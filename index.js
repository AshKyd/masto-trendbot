import * as dotenv from "dotenv";
import go from "./src/index.js";
import { CronJob } from "cron";
dotenv.config();

if (!process.env.MASTODON_PASS) {
  throw new Error("environment not set");
}

const cronString = process.env.CRON;
if (cronString) {
  console.log(`Starting in cron mode: ${cronString}`);
  const job = new CronJob(cronString, go);
  job.start();
} else {
  go();
}
