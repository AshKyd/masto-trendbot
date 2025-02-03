import { isUspol } from "./filter.js";
import { loadCookies, saveCookies } from "./helpers.js";
import puppeteer from "puppeteer";

export default async function go() {
  // Launch the browser, restore state
  const browser = await puppeteer.launch(
    process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}
  );
  console.log("restoring cookies");
  loadCookies(browser);
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });

  // Load the login page first. This way we can tell if we need to authenticate
  // or if we're already in.
  console.log("loading login page");
  await page.goto(`https://${process.env.MASTODON_SERVER}/auth/sign_in`, {
    waitUntil: "load",
  });

  // check if we need to log in again
  const emailField = await page.$("input#user_email");
  const passwordField = await page.$("input#user_password");
  if (emailField && passwordField) {
    console.log("logging in");
    await emailField.type(process.env.MASTODON_EMAIL);
    await passwordField.type(process.env.MASTODON_PASS);

    await page.locator("form button").click();
    await page.waitForNavigation();

    console.log("storing cookies");
    await saveCookies(browser);
  }

  // Load the trends admin page
  console.log("loading trends");
  await page.goto(
    `https://${process.env.MASTODON_SERVER}/admin/trends/statuses`,
    {
      waitUntil: "load",
    }
  );

  let pageNumber = 0;
  /**
   * Iterative function that filters a page of trends and then loads the next page
   */
  async function filterTrends() {
    pageNumber++;
    console.log(`Inspecting page ${pageNumber}`);

    const totalTrends = await page.$$(".batch-table__row");

    // fetch trend IDs
    const trends = await page.$$eval(
      ".batch-table__row:not(.batch-table__row--muted) input",
      (inputs) => {
        return inputs.map((input) => input.value);
      }
    );

    if (!totalTrends.length) {
      console.error(
        "Trends missing. Maybe our account details are wrong. HTML debug follows:"
      );
      const data = await page.evaluate(() => document.body.outerHTML);
      console.log(data);
      setTimeout(() => {
        process.exit();
      }, 30000);
      return;
    }

    // Pull down the trend from the API and check if it needs to be filtered
    // Note: only works when the public API is available
    const toFilter = (
      await Promise.all(
        trends.map(async (trendId) => {
          const url = `https://${process.env.MASTODON_SERVER}/api/v1/statuses/${trendId}`;
          const res = await fetch(url);
          if (res.status !== 200) {
            console.log("error fetching", url);
            return false;
          }
          const json = await res.json();
          const isDisallowed = isUspol(json);
          const allowedServers = process.env.ALLOWLISTED_SERVERS.split(",");
          const isAllowListed = allowedServers.some((server) =>
            json.account.acct.includes(server)
          );

          if (isDisallowed) {
            if (isAllowListed) {
              console.log(json.account.acct, "is allowed");
              return false;
            }
            return trendId;
          }
        })
      )
    ).filter(Boolean);

    console.log(`filtering ${toFilter.length} of ${trends.length} trends`);
    if (toFilter.length) {
      // Check each of the checkboxes next to the posts we want to filter
      await Promise.all(
        toFilter.map((trendId) => {
          const selector = `.batch-table__row input[value="${trendId}"]`;
          return page.$eval(selector, (input) => {
            console.log(input);
            input.checked = true;
          });
        })
      );

      // Prepare to accept the dialog that's about to pop up
      page.once("dialog", async (dialog) => {
        console.log("accepting dialog");
        await dialog.accept();
      });

      // Click the button, triggering the confirmation dialog & page refresh.
      console.log("clicking reject");
      await page.locator('button[name="reject"]').click();
      console.log("waiting for post to complete");
      await page.waitForNavigation();
    }

    // Check if we have a "next" button, if so click it and do the whole process again
    const nextSelector = '.pagination a[rel="next"]';
    const nextButton = await page.$(nextSelector);
    if (nextButton) {
      await page.locator(nextSelector).click();
      await page.waitForNavigation();
      filterTrends();
    } else {
      console.log("all done");
      await browser.close();
    }
  }

  // filter the first page
  filterTrends();
}
