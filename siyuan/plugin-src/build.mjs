// 打包为思源可直接加载的插件目录 ../plugins/ai-chat-notes/
import {build} from "esbuild";
import {cpSync, existsSync, mkdirSync, rmSync} from "node:fs";
import {fileURLToPath} from "node:url";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
const outDir = here("../plugins/ai-chat-notes/");

rmSync(outDir, {recursive: true, force: true});
mkdirSync(outDir, {recursive: true});

await build({
    entryPoints: [here("src/index.ts")],
    bundle: true,
    format: "cjs",
    platform: "browser",
    target: "es2020",
    external: ["siyuan"],
    outfile: outDir + "index.js",
    legalComments: "inline",
    charset: "utf8",
});

cpSync(here("src/index.css"), outDir + "index.css");
cpSync(here("plugin.json"), outDir + "plugin.json");
cpSync(here("README.md"), outDir + "README.md");
cpSync(here("i18n"), outDir + "i18n", {recursive: true});
for (const asset of ["icon.png", "preview.png"]) {
    if (existsSync(here(`assets/${asset}`))) {
        cpSync(here(`assets/${asset}`), outDir + asset);
    }
}
console.log("built", outDir);
