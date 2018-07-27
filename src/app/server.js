// @flow

import {StyleSheetServer} from "aphrodite/no-important";
import React from "react";
import ReactDOMServer from "react-dom/server";
import {match, RouterContext} from "react-router";

import {createRoutes} from "./createRoutes";
import {resolveTitleFromPath} from "./routeData";
import dedent from "./dedent";

export default function render(
  locals: {+path: string, +assets: {[string]: string}},
  callback: (error: ?mixed, result?: string) => void
): void {
  const bundlePath = locals.assets["main"];
  const url = locals.path;
  const routes = createRoutes();
  match({routes, location: url}, (error, redirectLocation, renderProps) => {
    if (error) {
      callback(error);
    } else if (renderProps) {
      const component = <RouterContext {...renderProps} />;
      const {html, css} = StyleSheetServer.renderStatic(() =>
        ReactDOMServer.renderToString(component)
      );
      const page = dedent`\
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>${resolveTitleFromPath(url)}</title>
        <style>${require("./index.css")}</style>
        <style data-aphrodite>${css.content}</style>
        </head>
        <body style="overflow-y:scroll">
        <div id="root">${html}</div>
        <script src="${bundlePath}"></script>
        </body>
        </html>
      `;
      callback(null, page);
    } else {
      // This shouldn't happen because we should only be visiting
      // the right routes.
      throw new Error(`unexpected 404 from ${url}`);
    }
  });
}