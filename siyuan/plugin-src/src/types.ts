/** 对话中一段内容的角色；note 表示没有说话人标记的普通文字。 */
export type ChatRole = "user" | "assistant" | "thinking" | "note";

export type ChatSource = "claude" | "chatgpt" | "gemini" | "deepseek" | "kimi" | "doubao" | "generic";

export interface ChatTurn {
    role: ChatRole;
    /** Markdown 正文 */
    markdown: string;
}

export interface ChatConversation {
    /** 稳定 ID，用于重复导入时去重，形如 `claude:<uuid>` */
    id: string;
    source: ChatSource;
    title: string;
    /** ISO 8601 时间 */
    createdAt?: string;
    turns: ChatTurn[];
}

/** HTML 片段转 Markdown，运行时由思源的 Lute 提供。 */
export type HtmlToMarkdown = (html: string) => string;

export const SOURCE_LABELS: Record<ChatSource, string> = {
    claude: "Claude",
    chatgpt: "ChatGPT",
    gemini: "Gemini",
    deepseek: "DeepSeek",
    kimi: "Kimi",
    doubao: "豆包",
    generic: "AI 对话",
};
