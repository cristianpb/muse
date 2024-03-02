// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
// SPA => only index.html is prerender
//export const prerender = true;
export const trailingSlash = "always";
