import Image from 'next/image'
import { Inter } from 'next/font/google'
import MainLayout from '@/layout'
import { useEffect, useState } from 'react'
import SearchResultItem from '@/types'
import axios from 'axios'
import retry from "axios-retry";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const defaultPeriod = "week";
  const defaultSite = "naver";
  const [periodFilter,setPeriodFilter] = useState<"week"|"month"|"quater"|"half"|"last-year">(defaultPeriod);
  const [siteFilter,setSiteFilter] = useState<"naver"|"tistory">(defaultSite);
  const [items,updateItems] = useState<SearchResultItem[]>([])
  useEffect(()=>{
    (async ()=>{
      retry(axios,{
        retries:5,
        retryDelay:(retryCount) => {
          return retryCount * 1000;
        }
      });
      const searchResult = await axios({url:`/api/search/${siteFilter}/${periodFilter}`,method:"get"})
    
      updateItems(searchResult.data.data);
    })();
  },[periodFilter,siteFilter])
  
  return (
    <MainLayout title="어둠속의 대화 리뷰 - 블로그">
      <aside aria-label="필터" className="period-filters">
        <div className='filter sites'>
          <p><b id='site-filter-tit'>사이트</b></p>
          <div role={"list"} aria-labelledby={"site-filter-tit"}>
              {[
                {kind:"네이버 블로그",value:"naver"},
                {kind:"티스토리",value:"tistory"}
              ].map((radio,idx)=>{
                return (
                <div key={`site_${idx+1}`} role={"listitem"}>
                  <input aria-describedby="siteRadio_Description" type="radio" defaultChecked={radio.value == siteFilter} onChange={(evt)=>{
                    updateItems([])
                    setSiteFilter(evt.target.value as "naver"|"tistory");
                  }} id={`site_${radio.value}`} name="sites" value={radio.value} />
                  <label htmlFor={`site_${radio.value}`}>{radio.kind}</label>
                </div>
                )
              })
            }
          </div>
        </div>
        <div className='filter periods'>
          <p><b id='period-filter-tit'>기간</b></p>
          <div role={"list"} aria-labelledby={"period-filter-tit"}>
            {
              [
                {kind:"한주",periodName:"week"},
                {kind:"한달",periodName:"month"},
                {kind:"3개월",periodName:"quater"},
                {kind:"6개월",periodName:"half"},
                {kind:"작년",periodName:"last-year"}
              ].map((radio,idx)=>{
                return (
                <div key={`period_${idx+1}`} role="listitem">
                  <input aria-describedby='periodRadio_Description' defaultChecked={defaultPeriod == radio.periodName}
                  onChange={(evt)=>{
                    updateItems([])
                    setPeriodFilter(evt.target.value as "week"|"month"|"quater"|"half"|"last-year");
                  }}
                  type="radio" id={`period_${radio.periodName}`} name="period" value={radio.periodName} />
                  <label htmlFor={`period_${radio.periodName}`}>{radio.kind}</label>
                </div>
                )
              })
            }
          </div>
        </div>
      </aside>
      {items.map((result,index)=>{
        return (
          <article key={index}>
            <a href={result.link}>
              <h3>
                  {result.title}
              </h3>
              <p>{result.preview}</p>
            </a>
          </article>
        )
      })}
      <div style={{display:"none"}} id="siteRadio_Description">사이트 라디오 버튼 중 하나를 선택하면 목록이 자동으로 갱신됩니다. 기간 라디오버튼에는 영향을 미치지 않습니다.</div>
      <div style={{display:"none"}} id="periodRadio_Description">기간 라디오 버튼 중 하나를 선택하면 목록이 자동으로 갱신됩니다. 사이트 라디오버튼에는 영향을 미치지 않습니다.</div>
    </MainLayout>
  )
}
