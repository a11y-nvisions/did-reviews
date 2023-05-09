// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer, { Browser, Page } from "puppeteer";
import PromisePool from '@supercharge/promise-pool/dist';
export type Review = {
  name?:string
  star?:string
  date?:string
  views?:string
  title?:string
  content?:string
}

const viewport = {width:1920,height:1080};
async function getReview(collecter:Browser,url:string){
  const page = await collecter.newPage();
  await page.goto(url);
  await page.waitForSelector(".popupCloseBtn",{timeout:3000});
  await page.click(".popupCloseBtn");
  await page.waitForSelector("[data-target=REVIEW]");
  await page.click("[data-target=REVIEW]");
  await page.waitForSelector(".reviewList");
  const reviewList:Review[] = await page.$$eval(".bbsList.reviewList > li",(items)=>{
    return items.map(_=>{
      const infoNode = _.querySelectorAll(".rightSide .bbsItemInfoList");
      const name=infoNode[0].querySelector(".name")?.textContent ?? "알 수 없음",
      star = document.querySelector('[data-star]')?.getAttribute('data-star') ?? "알수 없음",
      date=infoNode[1].textContent ?? "알 수 없음",
      views=infoNode[2].textContent ?? "알 수 없음",
      like=infoNode[3].textContent ?? "알 수 없음";
      const title = _.querySelector(".bbsTitle")?.textContent ?? "알 수 없음";
      const content = _.querySelector(".bbsText")?.textContent ?? "알 수 없음";
      return {
        name,
        star,
        date,
        views,
        like:like.replace("공감하기",""),
        title,
        content
      }
    })
  })
  await page.close();
  return reviewList;
}
export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<{
    list:Review[]
  }>
) {
  const collecter = await puppeteer.launch({headless:"new",defaultViewport:viewport});
  const page = await collecter.newPage();
  await page.goto("https://tickets.interpark.com/search?keyword=DIALOGUE%20IN%20THE%20DARK");
  await page.setRequestInterception(true);
  await page.waitForSelector("ul.itemList")
  const urls = await page.$$eval("ul.itemList li .itemName>a",(a)=>a.map(_=>_.href));
  const lists = await (await PromisePool.for([...urls.map(async url=>await getReview(collecter,url))]).process((_)=>_)).results;
  const list = await lists.flat();
  res.status(200).json({list:list})
}
