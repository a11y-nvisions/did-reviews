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
  branch?:string
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
      star=_.querySelector('[data-star]')?.getAttribute('data-star') ?? "알수 없음",
      date=infoNode[1].textContent ?? "알 수 없음",
      views=infoNode[2].textContent ?? "알 수 없음",
      like=infoNode[3].textContent ?? "알 수 없음";
      const title = _.querySelector(".bbsTitle")?.textContent ?? "알 수 없음";
      const content = _.querySelector(".bbsText")?.textContent ?? "알 수 없음";
      const branch = document.title.match(/북촌|동탄/);
      
      return {
        name,
        star,
        date,
        branch: branch ? branch[0] : "알 수 없음",
        views,
        like:like.replace("공감하기",""),
        title,
        content
      }
    })
  })
  await page.close();
  return await reviewList;
}
export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<{
    list:Review[][]
    length?:number
  }>
) {
  const collecter = await puppeteer.launch({headless:"new",defaultViewport:viewport});
  const page = await collecter.newPage();
  await page.goto("https://tickets.interpark.com/search?keyword=DIALOGUE%20IN%20THE%20DARK");
  await page.waitForSelector("ul.itemList");
  const items = await (await page.$$eval("#ticketContent .itemList>li",(li)=>{
    const list = li.map((_)=>{  
        return {
          url:_.querySelector(".itemName>a")?.getAttribute('href')!,
          onSale:_.querySelector(".tag.onSale")?.textContent == "판매중",
      };
    })
    const filtered = list.filter(_=>_.onSale);
    const latest = list.slice(0,3);
    if ( filtered.length < 2 ) {
      return latest;
    }
    return filtered;
  }))
  const reviews = await (await (await PromisePool.for(items.map(async items=>getReview(collecter,items.url))).process(_=>_))).results;
  const review = await reviews.map(_=>_.sort((a,b)=>{
    const aDate=new Date(a.date?.replace(".","-") ?? Date.now())
    const bDate=new Date(b.date?.replace(".","-") ?? Date.now())
    if(aDate>bDate) {
      return -1;
    }
    return 0;
  }));
  res.status(200).json({list:review,length:reviews.length})
}
