import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false, slowMo: 3000 });

const page = await browser.newPage();

await page.goto(
  "https://www.laborum.cl/empleos-busqueda-mineria.html?recientes=true"
);

await page.waitForTimeout(2000);
const links = await page.evaluate(() => {
  const items = document.querySelectorAll(".sc-eZXMBi.yCeAd");

  console.log(items, "items");
  const links = [];

  for (item of items) {
    links.push(item.innerHTML, item.href);
  }
  return links;
});
console.log(links, "links");

// const jobs = await page.$$eval(".sc-eZXMBi.yCeAd", (info) => {
//   info.map((el) => {
//     const link = el.querySelectorAll("a")?.href;
//     return { link };
//   });
// });
// console.log(jobs);

await browser.close();
