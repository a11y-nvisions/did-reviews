import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {ReactNode} from "react";
interface LayoutProps {
    children?:ReactNode[]|ReactNode
    title:string
}
interface NavLink {
    url:string
    text:string
    exect?:boolean
}
export default function MainLayout(props:LayoutProps) {
    const router = useRouter();
    const {pathname } = router;
    const navLinks:NavLink[] = [
        {url:"/home",text:"블로그 후기"},
        {url:"/interpark",text:"인터파크 후기"}
    ]
    return (
        <div id="layout-wrapper">
            <Head>
                <title>{props.title}</title>
            </Head>
            <header>
                <h1>{props.title}</h1>
                <nav>
                <ul>
                    {navLinks.map((e,i)=>{
                        return (
                            <li key={i}><Link key={i} href={e.url} aria-current={e.exect ? (pathname == e.url) : (pathname.startsWith(e.url))}>{e.text}</Link></li>
                        )
                    })}
                </ul>
                </nav>
            </header>
            <main>
                {props.children}
            </main>
        </div>
    )
}