import esbuild from "esbuild";
import inlineImage from "esbuild-plugin-inline-image";

await esbuild.build({
    logLevel: "info",
    entryPoints: ["main/src/main.ts"],
    bundle: true,
    minify: true,
    outfile: "public/bundle.min.js",
    plugins: [inlineImage()],
});
