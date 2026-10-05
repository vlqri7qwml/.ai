import {kernel} from "./api.ts";
import {conversationToKramdown, safeDocTitle} from "./render.ts";
import {type ChatConversation, SOURCE_LABELS} from "./types.ts";

export interface Notebook {
    id: string;
    name: string;
    closed: boolean;
}

export const listNotebooks = async () =>
    (await kernel<{ notebooks: Notebook[] }>("/api/notebook/lsNotebooks")).notebooks || [];

/** 找到同名笔记本（必要时打开），没有则新建，返回笔记本 ID。 */
export const ensureNotebook = async (name: string) => {
    const found = (await listNotebooks()).find(notebook => notebook.name === name);
    if (found) {
        if (found.closed) {
            await kernel("/api/notebook/openNotebook", {notebook: found.id});
        }
        return found.id;
    }
    return (await kernel<{ notebook: Notebook }>("/api/notebook/createNotebook", {name})).notebook.id;
};

/** 已经导入过的对话 ID（文档属性 custom-chat-id）。 */
export const loadImportedIds = async () => {
    const rows = await kernel<{ value: string }[]>("/api/query/sql", {
        stmt: "SELECT value FROM attributes WHERE name = 'custom-chat-id' LIMIT 1000000",
    });
    return new Set((rows || []).map(row => row.value));
};

export interface ImportOptions {
    notebookId: string;
    includeThinking: boolean;
    /** 来源不明的对话放在这个目录下 */
    otherFolder: string;
}

export type ImportResult = { status: "created", id: string } | { status: "skipped" };

/** 每个对话导入为一篇文档，路径为 /<来源>/<标题>，已导入过的跳过。 */
export const importConversation = async (conv: ChatConversation, options: ImportOptions,
                                         imported: Set<string>): Promise<ImportResult> => {
    if (imported.has(conv.id)) {
        return {status: "skipped"};
    }
    const id = await kernel<string>("/api/filetree/createDocWithMd", {
        notebook: options.notebookId,
        path: `/${conv.source === "generic" ? options.otherFolder : SOURCE_LABELS[conv.source]}/${
            safeDocTitle(conv.title)}`,
        markdown: conversationToKramdown(conv, {includeThinking: options.includeThinking}),
    });
    const attrs: Record<string, string> = {"custom-chat-id": conv.id, "custom-chat-source": conv.source};
    if (conv.createdAt) {
        attrs["custom-chat-created"] = conv.createdAt;
    }
    await kernel("/api/attr/setBlockAttrs", {id, attrs});
    imported.add(conv.id);
    return {status: "created", id};
};
