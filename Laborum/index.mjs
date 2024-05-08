import { chromium } from "playwright";
import fs from "fs/promises";

async function laborumScraping() {
  const browser = await chromium.launch({ headless: false, slowMo: 3000 });

  const page = await browser.newPage();

  await page.goto(
    "https://www.laborum.cl/empleos-busqueda-mineria.html?recientes=true"
  );

  await page.waitForTimeout(2000);
  const links = await page.evaluate(() => {
    const data = [];
    const divsEnListado = document.querySelectorAll("#listado-avisos div");
    divsEnListado.forEach((div) => {
      const enlace = div.querySelector("a");
      if (enlace) {
        const url = enlace.getAttribute("href");
        console.log(url);

        const infoData = {
          url: url,
        };
        data.push(infoData);
      }
    });
    return { data };
  });
  // console.log(links, "links");

  // const jobs = await page.$$eval(".sc-eZXMBi.yCeAd", (info) => {
  //   info.map((el) => {
  //     const link = el.querySelectorAll("a")?.href;
  //     return { link };
  //   });
  // });
  // console.log(jobs);
  await saveJson(links);

  await browser.close();
}

async function saveJson(data) {
  try {
    const fileExists = await fs
      .access("jobs.json")
      .then(() => true)
      .catch(() => false);
    if (fileExists) {
      await fs.unlink("jobs.json");
      console.log("Archivo jobs.json existente borrado.");
    }
    await fs.writeFile("jobs.json", JSON.stringify(data, null, 2));
    console.log("La data ha sido guardada en jobs.json");
  } catch (error) {
    console.log("La data no ha sido guardada.", error);
  }
}
laborumScraping();
