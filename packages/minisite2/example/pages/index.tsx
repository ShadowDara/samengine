import { h, Fragment } from "minisite/jsx-runtime";
import { Header } from "../components/Header.js";
// import styles from "./home.css?inline";
import "./index.css";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <h1>Home</h1>
        <p>Willkommen bei MiniSite.</p>
      </main>
      {/* <style>{styles}</style> */}
    </>
  );
}
