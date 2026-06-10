// Header.tsx
import Link from "next/link";
import React from "react";

const Header: React.FC = () => {
  return (
    <>
      <style>{`
        .webtools-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          box-sizing: border-box;
          background: linear-gradient(#5c5c5c, #2f2f2f);
          border-bottom: 2px solid #111;
          box-shadow: inset 0 1px 0 #888;
          z-index: 9999;
          font-family: Arial, sans-serif;
        }

        .webtools-logo {
          color: white;
          font-size: 18px;
          font-weight: bold;
        }

        .webtools-nav {
          display: flex;
          gap: 10px;
        }

        .jquery-btn {
          text-decoration: none;
          background: linear-gradient(#f6f6f6, #cfcfcf);
          border: 1px solid #888;
          border-radius: 4px;
          padding: 8px 16px;
          color: #222;
          font-size: 14px;
          box-shadow:
            inset 0 1px 0 #fff,
            0 1px 2px rgba(0, 0, 0, 0.3);
          transition: all 0.1s ease;
          user-select: none;
        }

        .jquery-btn:hover {
          background: linear-gradient(#ffffff, #d9d9d9);
        }

        .jquery-btn:active {
          background: linear-gradient(#bdbdbd, #e0e0e0);
          transform: translateY(1px);
        }

        main {
          margin: 0 10px;
          padding-top: 60px;
        }
      `}</style>

      <header className="webtools-header">
        <div className="webtools-logo">Web Tools</div>

        <nav className="webtools-nav">
          <Link href="/" className="jquery-btn">
            /
          </Link>

          <Link href="/webtools" className="jquery-btn">
            Home
          </Link>

          <Link
            href="https://shadowdara.github.io/blog/webtools/"
            className="jquery-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            News
          </Link>
        </nav>
      </header>
    </>
  );
};

export default Header;
