import {existsSync} from "node:fs";
import {createRequire} from "node:module";
import {DOMParser as LinkedomParser} from "linkedom";
import type {HtmlToMarkdown} from "../src/types.ts";

// linkedom 只接受完整文档，浏览器的 DOMParser 可以直接解析片段，这里补齐外壳
class FragmentDOMParser {
    parseFromString(html: string, type: string) {
        const full = /<html[\s>]/i.test(html) ? html : `<!doctype html><html><head></head><body>${html}</body></html>`;
        return new LinkedomParser().parseFromString(full, type as "text/html");
    }
}
(globalThis as any).DOMParser = FragmentDOMParser;

interface LuteEngine {
    HTML2Md: (html: string) => string;
    Md2BlockDOM: (markdown: string) => string;
}

/**
 * 思源的 Lute 引擎（lute.min.js）。通过环境变量 LUTE_PATH 指定，
 * 例如思源安装目录下的 resources/stage/protyle/js/lute/lute.min.js；未提供时相关用例跳过。
 */
export const loadLute = (): LuteEngine | null => {
    const path = process.env.LUTE_PATH;
    if (!path || !existsSync(path)) {
        return null;
    }
    const global = globalThis as any;
    global.window = global;
    createRequire(import.meta.url)(path);
    const lute = global.Lute.New();
    // 与思源编辑器（app/src/protyle/render/setLute.ts）保持一致的关键选项
    ["SetKramdownIAL", "SetSuperBlock", "SetCallout", "SetTabs", "SetProtyleWYSIWYG", "SetBlockRef", "SetTag",
        "SetInlineMath", "SetGFMStrikethrough", "SetMark", "SetImgPathAllowSpace"].forEach(name => lute[name](true));
    ["SetSetext", "SetFootnotes", "SetLinkRef", "SetToC", "SetIndentCodeBlock", "SetYamlFrontMatter"]
        .forEach(name => lute[name](false));
    return lute;
};

export const lute = loadLute();

/** 没有 Lute 时用纯文本代替，只用于检查角色切分。 */
export const toMarkdown: HtmlToMarkdown = lute ?
    html => lute.HTML2Md(html) :
    html => (new FragmentDOMParser().parseFromString(html, "text/html").body.textContent || "").trim();
