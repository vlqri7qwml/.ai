import {fetchPost, getActiveEditor, type IMenu, Plugin, Setting, showMessage} from "siyuan";
import {copyText, readClipboard} from "./clipboard.ts";
import {openImportDialog, type I18n} from "./dialog.ts";
import {applyLocalMode, fetchWorkspaceDir, LOCAL_MODE_CLASS, openInFileManager} from "./localMode.ts";
import {detectPastedConversation} from "./parse/detect.ts";
import {turnsToKramdown} from "./render.ts";
import type {ChatRole, HtmlToMarkdown} from "./types.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */

const STORAGE_NAME = "settings.json";

interface Settings {
    localMode: boolean;
    autoDetectPaste: boolean;
    notebookName: string;
    includeThinking: boolean;
}

// Lucide message-square-text
const ICONS = `<symbol id="iconAcnChat" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2"
 stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
<path d="M13 8H7"/><path d="M17 12H7"/></g></symbol>`;

/** 新建一个与思源编辑器选项接近的 Lute 实例，用于导入文件时把 HTML 转为 Markdown。 */
const createLute = () => {
    const lute = (window as any).Lute.New();
    ["SetKramdownIAL", "SetSuperBlock", "SetCallout", "SetTag", "SetInlineMath", "SetGFMStrikethrough", "SetMark",
        "SetImgPathAllowSpace"].forEach(name => lute[name]?.(true));
    ["SetSetext", "SetFootnotes", "SetLinkRef", "SetToC", "SetIndentCodeBlock", "SetYamlFrontMatter"]
        .forEach(name => lute[name]?.(false));
    return lute;
};

const isInCodeBlock = () => {
    const node = window.getSelection()?.anchorNode;
    const element = node instanceof Element ? node : node?.parentElement;
    return !!element?.closest("[data-type=\"NodeCodeBlock\"], code");
};

export default class AiChatNotes extends Plugin {
    private settings!: Settings;
    private fileLute: any;
    private importedIds = new Set<string>();

    private get t() {
        return this.i18n as I18n;
    }

    async onload() {
        const saved = await this.loadData(STORAGE_NAME).catch(() => null);
        this.settings = {
            localMode: true,
            autoDetectPaste: true,
            notebookName: this.t.defaultNotebookName,
            includeThinking: false,
            ...(saved && typeof saved === "object" ? saved : {}),
        };
        this.addIcons(ICONS);
        this.addTopBar({
            id: "import",
            icon: "iconAcnChat",
            title: this.t.importChats,
            position: "right",
            callback: () => this.openImport(),
        });
        this.addCommand({langKey: "importChats", hotkey: "", callback: () => this.openImport()});
        this.addCommand({langKey: "pasteAsChat", hotkey: "", callback: () => this.pasteAsChat()});
        this.eventBus.on("paste", this.onPaste);
        this.eventBus.on("click-blockicon", this.onBlockIconMenu);
        this.initSetting();
        applyLocalMode(this.settings.localMode);
    }

    onunload() {
        this.eventBus.off("paste", this.onPaste);
        this.eventBus.off("click-blockicon", this.onBlockIconMenu);
        document.documentElement.classList.remove(LOCAL_MODE_CLASS);
    }

    private get fileToMarkdown(): HtmlToMarkdown {
        this.fileLute = this.fileLute || createLute();
        return html => this.fileLute.HTML2Md(html);
    }

    private openImport() {
        openImportDialog({
            app: this.app,
            i18n: this.t,
            toMarkdown: this.fileToMarkdown,
            notebookName: this.settings.notebookName || this.t.defaultNotebookName,
            includeThinking: this.settings.includeThinking,
            knownIds: this.importedIds,
        });
    }

    /** 粘贴时识别网页对话，识别到才接管，其余情况交给思源默认粘贴。 */
    private onPaste = (event: CustomEvent<any>) => {
        const detail = event.detail;
        if (!this.settings.autoDetectPaste || detail.siyuanHTML || (!detail.textHTML && !detail.textPlain) ||
            !detail.protyle?.lute || isInCodeBlock()) {
            return;
        }
        const lute = detail.protyle.lute;
        let conversation;
        try {
            conversation = detectPastedConversation(detail.textHTML || "", detail.textPlain || "",
                html => lute.HTML2Md(html));
        } catch (error) {
            console.error("[ai-chat-notes] paste", error);
            return;
        }
        if (!conversation) {
            return;
        }
        event.preventDefault();
        const kramdown = turnsToKramdown(conversation.turns, conversation.source,
            {includeThinking: this.settings.includeThinking});
        detail.resolve({
            textHTML: "",
            textPlain: detail.textPlain,
            siyuanHTML: lute.Md2BlockDOM(kramdown),
            files: detail.files,
        });
    };

    /** 命令「以对话格式粘贴」：读取剪贴板，没有说话人标记时整段作为回答插入。 */
    private async pasteAsChat() {
        const editor = getActiveEditor(false);
        if (!editor) {
            showMessage(this.t.noEditor);
            return;
        }
        const clipboard = await readClipboard();
        if (!clipboard) {
            showMessage(this.t.clipboardDenied, 6000, "error");
            return;
        }
        const lute = editor.protyle.lute || createLute();
        const toMarkdown: HtmlToMarkdown = html => lute.HTML2Md(html);
        const detected = detectPastedConversation(clipboard.html, clipboard.text, toMarkdown);
        const markdown = clipboard.html ? toMarkdown(clipboard.html) : clipboard.text;
        const conversation = detected || (markdown.trim() ?
            {source: "generic" as const, turns: [{role: "assistant" as ChatRole, markdown}]} : null);
        if (!conversation) {
            showMessage(this.t.clipboardEmpty);
            return;
        }
        const kramdown = turnsToKramdown(conversation.turns, conversation.source,
            {includeThinking: this.settings.includeThinking});
        editor.insert(lute.Md2BlockDOM(kramdown), true);
    }

    /** 块标菜单：手动设置或取消提问 / 回答样式。 */
    private onBlockIconMenu = (event: CustomEvent<any>) => {
        const ids: string[] = (event.detail.blockElements as HTMLElement[])
            .map(element => element.getAttribute("data-node-id") || "").filter(Boolean);
        if (ids.length === 0) {
            return;
        }
        const setRole = (role: string) => ids.forEach(id => fetchPost("/api/attr/setBlockAttrs", {
            id,
            attrs: role ? {"custom-chat-role": role} : {"custom-chat-role": "", "custom-chat-source": ""},
        }));
        const submenu: IMenu[] = [
            {icon: "iconAcnChat", label: this.t.setUser, click: () => setRole("user")},
            {icon: "iconAcnChat", label: this.t.setAssistant, click: () => setRole("assistant")},
            {icon: "iconAcnChat", label: this.t.setThinking, click: () => setRole("thinking")},
            {type: "separator"},
            {icon: "iconClose", label: this.t.clearRole, click: () => setRole("")},
        ];
        event.detail.menu.addItem({icon: "iconAcnChat", label: this.t.chatStyle, type: "submenu", submenu});
    };

    private initSetting() {
        const switchElement = (checked: boolean) => {
            const input = document.createElement("input");
            input.type = "checkbox";
            input.className = "b3-switch fn__flex-center";
            input.checked = checked;
            return input;
        };
        const localModeInput = switchElement(this.settings.localMode);
        const autoDetectInput = switchElement(this.settings.autoDetectPaste);
        const thinkingInput = switchElement(this.settings.includeThinking);
        const notebookInput = document.createElement("input");
        notebookInput.className = "b3-text-field fn__flex-center fn__size200";

        this.setting = new Setting({
            confirmCallback: () => {
                this.settings = {
                    localMode: localModeInput.checked,
                    autoDetectPaste: autoDetectInput.checked,
                    includeThinking: thinkingInput.checked,
                    notebookName: notebookInput.value.trim() || this.t.defaultNotebookName,
                };
                this.saveData(STORAGE_NAME, this.settings);
                applyLocalMode(this.settings.localMode);
            },
        });
        this.setting.addItem({title: this.t.localMode, description: this.t.localModeDesc, actionElement: localModeInput});
        this.setting.addItem({
            title: this.t.autoDetectPaste,
            description: this.t.autoDetectPasteDesc,
            actionElement: autoDetectInput,
        });
        this.setting.addItem({
            title: this.t.defaultNotebook,
            description: this.t.defaultNotebookDesc,
            createActionElement: () => {
                notebookInput.value = this.settings.notebookName;
                return notebookInput;
            },
        });
        this.setting.addItem({title: this.t.includeThinking, actionElement: thinkingInput});
        this.setting.addItem({
            title: this.t.storageDir,
            // 思源的 row 表示标题在上、控件在下占满整行
            direction: "row",
            description: this.t.storageDirDesc,
            createActionElement: () => {
                let dir = "";
                const wrap = document.createElement("div");
                wrap.className = "fn__flex acn-setting__dir";
                wrap.innerHTML = `<input class="b3-text-field fn__flex-1" readonly>
<span class="fn__space"></span><button class="b3-button b3-button--outline" data-type="copy">${this.t.copyPath}</button>
<span class="fn__space"></span><button class="b3-button b3-button--outline" data-type="open">${this.t.openDir}</button>`;
                fetchWorkspaceDir().then(value => {
                    dir = value;
                    wrap.querySelector("input")!.value = value;
                });
                wrap.querySelector("[data-type=copy]")!.addEventListener("click", async () => {
                    await copyText(dir);
                    showMessage(this.t.copied);
                });
                const openButton = wrap.querySelector<HTMLButtonElement>("[data-type=open]")!;
                openButton.classList.toggle("fn__none", !(window as any).require);
                openButton.addEventListener("click", () => openInFileManager(dir));
                return wrap;
            },
        });
    }
}
