import type {ChatConversation, ChatSource, ChatTurn} from "./types.ts";

export interface RenderOptions {
    /** 是否保留思考过程 */
    includeThinking?: boolean;
}

/** 正文里单独一行的 `}}}` 会提前结束超级块，加零宽字符规避。 */
const escapeSuperBlockEnd = (markdown: string) => markdown.replace(/^(\s*)\}\}\}\s*$/gm, "$1​}}}");

/**
 * 把对话转为思源 Kramdown：每一轮是一个超级块，用块属性 custom-chat-role 标记角色，
 * 主题按该属性渲染成 claude.ai 的样式。没有角色的段落按普通块输出。
 */
export const turnsToKramdown = (turns: ChatTurn[], source: ChatSource, options: RenderOptions = {}) => {
    const blocks: string[] = [];
    for (const turn of turns) {
        const markdown = turn.markdown.trim();
        if (!markdown || (turn.role === "thinking" && !options.includeThinking)) {
            continue;
        }
        if (turn.role === "note") {
            blocks.push(markdown);
            continue;
        }
        const fold = turn.role === "thinking" ? " fold=\"1\"" : "";
        blocks.push(`{{{row\n${escapeSuperBlockEnd(markdown)}\n}}}\n` +
            `{: custom-chat-role="${turn.role}" custom-chat-source="${source}"${fold}}`);
    }
    return blocks.join("\n\n") + "\n";
};

export const conversationToKramdown = (conv: ChatConversation, options: RenderOptions = {}) =>
    turnsToKramdown(conv.turns, conv.source, options);

/** 文档名不能包含路径分隔符。 */
export const safeDocTitle = (title: string) =>
    (title || "未命名对话").replace(/[/\\]/g, "／").replace(/[\r\n\t]+/g, " ").trim().slice(0, 120) || "未命名对话";
