import WebSocket, { WebSocketServer } from "ws";
import { scratchify } from "./scratchify";
import jimp from "jimp";
import puppeteer, {Browser, Page } from "puppeteer";

(async () => {
  // i sure do love initializing websockets. and puppeteer
  const wss = new WebSocketServer({ port: 8080 });
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto('https://google.com');
  await page.setViewport({ width: 480*2, height: 360*2 });
  //const screenshot = await page.screenshot();
  //console.log(screenshot)

  wss.on("connection", (ws:WebSocket) => {
    // note to self: send -> ws.send
    console.log('HEY');
    ws.on("error", console.error);
    ws.on("message", async (m:any) => {
      m = m.toString();
      const d = JSON.parse(m);
      console.log(d);
      switch (d.action) {
        case "goToUrl":
          await page.goto(d.url);
          break;
        case "screenshot":
          const src = await screenshot(page);
          ws.send(src.join(' ').replace(/ /g, ""));
          break;
      }
    });
  });
})();

async function screenshot(page:Page):Promise<string[]>{
  const screenshot = await page.screenshot();
  return await scratchify(screenshot,0.25);
}