import { h, Fragment } from "minisite/jsx-runtime";
import { Header } from "../components/Header.js";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <h1>Home</h1>
        <p>Willkommen bei MiniSite.</p>
      </main>
      <style>
        {`body {
              font-family: system-ui;
              padding: 20px;
          }
          .app {
              border: 1px solid #ddd;
              padding: 12px;
          }
          textarea {
              box-sizing: border-box;
              min-height: 160px;
              width: 100%;
          }
          #markdown-preview {
              border-top: 1px solid #ddd;
              margin-top: 16px;
              padding-top: 16px;
          }
          button {
              margin-top: 10px;
              padding: 8px 12px;
          }`}
      </style>
    </>
  );
}
