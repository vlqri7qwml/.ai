#!/usr/bin/env node
// 把 Claude 风格主题和 AI 对话笔记插件安装到思源工作空间（Windows / macOS / Linux 通用）。
//
// 用法：
//   node install.mjs <工作空间目录>
//   node install.mjs <工作空间目录> --enable [--api http://127.0.0.1:6806] [--token <API token>]
//
// --enable 需要思源正在运行：通过内核接口信任第三方插件（等同于在 设置 - 集市 中确认信任）、启用插件，
// 并把明亮 / 暗黑模式主题都切换为 claude-style。
import {cpSync, existsSync, mkdirSync, rmSync, statSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const THEME = "claude-style";
const PLUGIN = "ai-chat-notes";

const args = process.argv.slice(2);
const option = (name, fallback) => {
    const index = args.indexOf(name);
    return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const workspace = args.find((arg, index) => !arg.startsWith("--") && !["--api", "--token"].includes(args[index - 1]));

if (!workspace) {
    console.log("用法：node install.mjs <工作空间目录> [--enable] [--api http://127.0.0.1:6806] [--token <API token>]");
    console.log("工作空间目录就是思源的笔记存储目录，例如 ~/SiYuan 或 Docker 映射的 ./workspace");
    process.exit(1);
}
if (existsSync(workspace) && !statSync(workspace).isDirectory()) {
    console.error(`${workspace} 不是目录`);
    process.exit(1);
}

const copyDir = (from, to) => {
    rmSync(to, {recursive: true, force: true});
    mkdirSync(to, {recursive: true});
    cpSync(from, to, {recursive: true});
    console.log(`已安装 ${to}`);
};

copyDir(join(here, "themes", THEME), join(workspace, "conf", "appearance", "themes", THEME));
copyDir(join(here, "plugins", PLUGIN), join(workspace, "data", "plugins", PLUGIN));

if (!args.includes("--enable")) {
    console.log("\n下一步：重启思源，在 设置 - 集市 中确认信任第三方插件，然后在 设置 - 集市 - 已下载 - 插件 中启用");
    console.log("「AI 对话笔记」，并在 设置 - 外观 中把明亮 / 暗黑模式的主题都选为「Claude 风格」。");
    console.log("也可以在思源运行时加上 --enable 参数自动完成。");
    process.exit(0);
}

const api = option("--api", "http://127.0.0.1:6806").replace(/\/$/, "");
const token = option("--token", "");
const post = async (path, body = {}) => {
    const response = await fetch(api + path, {
        method: "POST",
        headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Token ${token}`} : {})},
        body: JSON.stringify(body),
    });
    const json = await response.json();
    if (json.code !== 0) {
        throw new Error(`${path}: ${json.msg}`);
    }
    return json.data;
};

try {
    const {conf} = await post("/api/system/getConf");
    if (!conf.bazaar.trust || conf.bazaar.petalDisabled) {
        await post("/api/setting/setBazaar", {...conf.bazaar, trust: true, petalDisabled: false});
        console.log("已在 设置 - 集市 中信任并启用第三方插件");
    }
    await post("/api/petal/setPetalEnabled", {packageName: PLUGIN, enabled: true});
    console.log("已启用插件 ai-chat-notes");
    const appearance = {...conf.appearance, themeLight: THEME, themeDark: THEME};
    await post("/api/setting/setAppearance", appearance);
    console.log("已切换主题为 claude-style，刷新思源界面即可看到效果");
} catch (error) {
    console.error(`自动启用失败：${error.message}`);
    console.error("请确认思源正在运行；设置了访问授权码时，用 --token 传入 设置 - 鉴权 中的 API token");
    process.exit(1);
}
