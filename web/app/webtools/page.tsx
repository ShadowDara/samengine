'use client';

import Link from "next/link";

export default function Home() {
    return (
        <>
            <h1>Webtools</h1>

            <ul>
                <li><span><Link href="malitogen.html">Malito Generator</Link></span></li>
                <li><span><Link href="/webtools/scriptcreator">Script Creator</Link></span></li>
                <li><span><Link href="sx.html">SX</Link></span></li>
                <li><span><Link href="/webtools/finder">finder</Link></span></li>
            </ul>
        </>
    )
}
