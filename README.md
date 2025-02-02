# Mastodon Trendbot

Automatic keyword filtering for Mastodon trending topics.

For the longest time I've been manually keyword filtering posts in the trending topics section to remove inflammatory trending topics that aren't topical to our server. There currently isn't an API endpoint to manage this, so this script uses Puppeteer to log in using a moderator account and navigate the admin section manually.

## Usage

1. install dependencies with `npm ci`
2. Set environment variables (see .env-example for examples)
3. `npm start`

## Environment variables

| Env var                          | Description                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| MASTODON_SERVER                  | server to connect to (e.g. "bne.social")                                              |
| MASTODON_EMAIL                   | user to log in as (e.g. "me@example.org")                                             |
| MASTODON_PASS                    | password to the user account                                                          |
| ALLOWLISTED_SERVERS              | servers that get automatically approved                                               |
| REJECTED_KEYWORDS                | comma separated keywords to reject. case insensitive. (e.g. "trump,musk,uspol")       |
| REJECTED_KEYWORDS_CASE_SENSITIVE | comma separated keywords to reject. case sensitive. (e.g. "USA")                      |
| OVERRIDE_KEYWORDS                | comma separated keywords that override a rejection. case insensitive. (e.g. "auspol") |
| CRON                             | optional crontab syntax to rerun this script (e.g. "_/15 _ \* \* \*")                 |
