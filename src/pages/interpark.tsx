import MainLayout from "@/layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { Review } from "./api/interpark";

export default function Interpark(){
    const [items,updateItems] = useState<Review[]>([]);
    const [isLoaded,setIsLoaded] = useState<boolean>(false);
    useEffect(()=>{
        (async()=>{
            const response = await axios.get("/api/interpark")
            const {data} = response;
            return data.list;
        })().then(r=>{
            updateItems(r as Review[])
            setIsLoaded(true);
        });
    },[])
    return (
        <MainLayout title="어둠속의 대화 리뷰 - 인터파크">
        <div style={{display: !isLoaded ? "block" : "none"}}>리뷰를 로드하는 중...</div>
          {items.map((review,idx)=>{
            return (
                <>
                    <article key={idx}>
                        <h2>{review.title}</h2>
                        <div className="info">
                            <p className="username">{review.name}</p> | <p className="username">{review.date}</p>
                        </div>
                    </article>
                </>
            )
          })}
        </MainLayout>
      )
}