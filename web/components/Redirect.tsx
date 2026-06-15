
type DownloadProps = {
  url: string;
};

export default function Redirect({ url }: DownloadProps) {
  return (
    <html>
      <head>
        <meta
          httpEquiv="refresh"
          content={`0;url=${url}`}
        />
      </head>

      <body>
        <h1>Redirecting...</h1>

        <p>
          If you are not redirected automatically,{" "}
          <a href={url}>click here</a>.
        </p>
      </body>
    </html>
  );
}