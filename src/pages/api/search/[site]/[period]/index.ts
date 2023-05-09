// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import SearchResultItem from '@/types'
import axios from 'axios'
import * as cheerio from "cheerio";
import retry from "axios-retry";

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<{data:SearchResultItem[],raw?:any}>
) {
  let {site,period} = req.query
  const date = (()=>{
    switch(period){
      case "last-week":
        return 7;
      case "month":
        return 30;
      case "quater":
        return 90;
      case "half":
        return 183;
      case "last-year":
        return 365;
      case "two-years-ago":
        return 365*2;
      case "three-years-ago":
        return 365*3;
      default:
        return 7;
    }
  })();
  const siteName = (()=>{
    switch(site){
      case "naver":
        return "blog.naver.com"
      case "tistory":
        return "tistory.com"
      default:
        return "blog.naver.com"
    }
  })()
  const [yyyy,mm,dd] = Intl.DateTimeFormat("ko-kr").format(new Date(Date.now() - (60*60*1000*24*date))).replaceAll(".","").split(" ");
  const API_KEY = "AIzaSyDzH6XQ6jKjkuZgZ_SlcnL2xl7eBlyPCOw";
  const keyword = `"어둠속의대화" OR "어둠속의 대화" OR "Dialog in the dark" site:${siteName} after:${yyyy}-${mm.padStart(2,"0")}-${dd.padStart(2,"0")}`;
  const API_URL=`https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=104005271dea040d7&q=${keyword}&lang=ko`
  retry(axios,{
    retries:5,
    retryDelay:(retryCount) => {
      return retryCount * 1000;
    }
  });

  const result = await axios({
    method:"get",
    url:API_URL,
  })


  if(result.status != 429){
    if(result.data.items && result.data.items instanceof Array) {
      res.status(200).json({
        data:(result.data.items).map((item:any,index:number)=>{
          const {title,link} = item;
          return {
            title,
            link,
            preview:item.snippet
          }
        }),
        raw:result.data.items
      })
    }
  }
}
