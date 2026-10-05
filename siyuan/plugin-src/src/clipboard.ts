/** 读取剪贴板的 HTML 与纯文本，无权限或不支持时返回 null。 */
export const readClipboard = async (): Promise<{ html: string, text: string } | null> => {
    try {
        if (navigator.clipboard?.read) {
            let html = "";
            let text = "";
            for (const item of await navigator.clipboard.read()) {
                if (!html && item.types.includes("text/html")) {
                    html = await (await item.getType("text/html")).text();
                }
                if (!text && item.types.includes("text/plain")) {
                    text = await (await item.getType("text/plain")).text();
                }
            }
            return {html, text};
        }
        if (navigator.clipboard?.readText) {
            return {html: "", text: await navigator.clipboard.readText()};
        }
    } catch (error) {
        console.warn("[ai-chat-notes] read clipboard", error);
    }
    return null;
};

export const copyText = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        textarea.remove();
        return ok;
    }
};
