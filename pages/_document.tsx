import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Remove FOUC prevention immediately
            if (typeof document !== 'undefined') {
              document.addEventListener('DOMContentLoaded', () => {
                const foucStyle = document.querySelector('[data-next-hide-fouc]');
                if (foucStyle) {
                  foucStyle.remove();
                }
              });
            }
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
