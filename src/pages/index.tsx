import MainLayout from "@/layout";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App(){
    const {push} = useRouter()
    useEffect(()=>{
        push("/home");
    },[]);
    return <MainLayout title="어둠속의 대화 리뷰">
        <p>Redirectiong...</p>
    </MainLayout>
}