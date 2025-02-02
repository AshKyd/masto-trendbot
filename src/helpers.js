import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Get the current module's URL
const __filename = fileURLToPath(import.meta.url);
// Get the directory name
export const __dirname = path.dirname(__filename);

export function resolvePath(relativePath) {
  return path.resolve(__dirname, relativePath);
}

export function getFilename(filename) {
  const stateRoot = resolvePath("../state");
  try {
    fs.mkdirSync(stateRoot);
  } catch (e) {}

  return path.resolve(stateRoot, filename);
}

export async function saveCookies(browser) {
  const cookies = await browser.cookies();
  fs.writeFileSync(
    getFilename("cookies.json"),
    JSON.stringify(cookies, null, 2)
  );
}

export async function loadCookies(browser) {
  // ... puppeteer code
  try {
    const cookiesString = fs.readFileSync(getFilename("cookies.json"), "utf8");
    const cookies = JSON.parse(cookiesString);
    await browser.setCookie(...cookies);
  } catch (e) {
    console.log(e.message);
  }
}
