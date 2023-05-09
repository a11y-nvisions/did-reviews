import MainLayout from "@/layout";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Review } from "./api/interpark";

export default function Interpark(){
    const [items,updateItems] = useState<Review[][]>([]);
    const [isLoaded,setIsLoaded] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement|null>(null);
    useEffect(()=>{
        (async()=>{
            const response = await axios.get("/api/interpark")
            const {data} = await response;
            return await data.list;
        })().then(r=>{
            updateItems(r as Review[][])
            setIsLoaded(true);
            ref.current?.focus();
        });
        return;
    },[])
    return (
        <MainLayout title="어둠속의 대화 리뷰 - 인터파크">
        <div style={{display: !isLoaded ? "block" : "none"}} tabIndex={-1} ref={(r)=>{
            if(isLoaded){
                setTimeout(()=>{
                    r?.focus();
                },100);
            }
        }}>리뷰를 로드하는 중...</div>
        <div className="reviews" tabIndex={-1} ref={isLoaded ? ref : null}>
            {items.map((sect,idx)=>{
                return (
                    <section key={idx} id={sect[0].branch == "북촌" ? "bukchon" : "dongtan"}>
                        <h2 style={{textAlign:"center"}}>{sect[0].branch}</h2>
                        {sect.map((review,idx)=>{
                            return (
                            <article key={idx}>
                                <h3>[{review.branch}]{review.title}</h3>
                                <div className="info">
                                    <p className="username">{review.name}|{review.date}</p>
                                    <p className="stars" style={{userSelect:"none"}}>
                                    <span aria-hidden={true}>
                                        별점:
                                    </span>
                                    <span className="star-graphic" style={{
                                        "--progress":`${(()=>{
                                            const percent = (Number(review.star))/5*100;
                                            return `${percent}%`;
                                        })()}`,
                                    } as React.CSSProperties} aria-valuemin={0} aria-valuenow={Number(review.star)} aria-valuemax={5} role={"meta"}
                                    aria-label={"별점"}>★★★★★</span>
                                    <span aria-hidden={true}>({Number(review.star).toFixed(1)})</span>
                                    </p>
                                </div>
                                <div className="body">
                                    <p className="content">
                                        {review.content}
                                    </p>
                                </div>
                            </article>
                        )})}
                        
                    </section>
                );
            })}
        </div>
        </MainLayout>
      )
}