import WebSocket, { WebSocketServer } from "ws";
import { scratchify } from "./scratchify";
import jimp from "jimp";
import puppeteer, {Browser, Page } from "puppeteer";

(async () => {
  //const screenshot = await page.screenshot();
  //console.log(screenshot)

  wss.on("connection", (ws:WebSocket) => {
    // i sure do love initializing websockets. and puppeteer
    const wss = new WebSocketServer({ port: 8080 });
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://google.com');
    await page.setViewport({ width: 480*2, height: 360*2 });
    // note to self: send -> ws.send
    var pixelSize = 1;
    console.log('HEY');
    ws.on("error", console.error);
    ws.on("message", async (m:any) => {
      m = m.toString();
      const d = JSON.parse(m);
      console.log(d);
      switch (d.action) {
        case "setMetadata":
          pixelSize = d.pixelSize
          ws.send(JSON.stringify({type:"setMetadata",value:true}));
          break;
        case "goToUrl":
          await page.goto(d.url);
          ws.send(JSON.stringify({type:"goToUrl",value:true}));
          break;
        case "screenshot":
          const src = await screenshot(page,pixelSize);
          ws.send(JSON.stringify({type:"screenshot",value:src.join(' ').replace(/ /g, "")}));
          break;
        case "click":
          await page.click(d.x,d.y);
          ws.send(JSON.stringify({type:"click",value:true}))
      }
    });
    ws.on("close", () => {
      console.log(`Client disconnected! lmao!`);
      await browser.close();
    });
  });
})();

async function screenshot(page:Page,pixelSize:number = 1):Promise<string[]>{
  const screenshot = await page.screenshot();
  return await scratchify(screenshot,pixelSize);
}
