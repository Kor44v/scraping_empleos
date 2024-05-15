import { chromium } from "playwright";
import fs from "fs/promises";

async function getMaxPageNumber(page) {
  // Evaluar el contenido de la página para obtener el número de la última página
  const lastPageNumber = await page.evaluate(() => {
    // Seleccionar el contenedor principal de la paginación
    const paginationContainer = document.querySelector("div.sc-wENpt");

    if (paginationContainer) {
      // Encuentra el último div que contiene los enlaces de paginación
      const pageDivs = paginationContainer.querySelectorAll("div");

      if (pageDivs.length > 0) {
        // El penúltimo div es el que contiene los enlaces de las páginas
        const pageLinksDiv = pageDivs[pageDivs.length - 1];

        // Selecciona todos los enlaces de página dentro de este div
        const pageLinks = pageLinksDiv.querySelectorAll("a");

        if (pageLinks.length > 0) {
          // El último enlace de la lista tiene el número de la última página
          return parseInt(pageLinks[pageLinks.length - 1].innerText, 10);
        }
      }
    }
    return 1; // Retornar 1 si no se encuentra la paginación
  });

  return lastPageNumber;
}

async function ScrapePage(page, pageNumber) {
  await page.goto(
    `https://www.laborum.cl/empleos-busqueda-mineria.html?recientes=true&page=${pageNumber}`
  );
  await page.waitForTimeout(2000);
  const links = await page.evaluate(() => {
    const link = "https://www.laborum.cl";
    const data = [];
    const divList = document.querySelectorAll("#listado-avisos div");
    divList.forEach((div) => {
      const enlace = div.querySelector("a");
      if (enlace) {
        const url = enlace.getAttribute("href");
        const nameRaw = enlace.querySelector("h3");
        const name = nameRaw
          ? nameRaw.textContent.trim()
          : "Nombre de empleo no encontrado.";

        const dataInfo = {
          url: link + url,
          nombreEmpleo: name,
        };
        data.push(dataInfo);
      }
    });
    return data;
  });
  return links;
}
async function Main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    "https://www.laborum.cl/empleos-busqueda-mineria.html?recientes=true&page=1"
  );
  await page.waitForTimeout(2000);
  const maxPageNumber = await getMaxPageNumber(page);
  console.log("Buscando en:", maxPageNumber);

  let allLinks = [];
  for (let i = 1; i <= maxPageNumber; i++) {
    console.log(`Scraping pagina ${i}`);
    const links = await ScrapePage(page, i);
    allLinks = allLinks.concat(links);
  }
  await SaveJson(allLinks);
  await browser.close();
}
async function SaveJson(data) {
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
Main();
