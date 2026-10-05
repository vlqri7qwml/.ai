import {Dialog, getFrontend, openTab, showMessage, type App} from "siyuan";
import {ensureNotebook, importConversation, listNotebooks, loadImportedIds} from "./importer.ts";
import {parseChatFile, SUPPORTED_EXTENSIONS} from "./parse/files.ts";
import {type ChatConversation, type HtmlToMarkdown, SOURCE_LABELS} from "./types.ts";

export type I18n = Record<string, string>;

export const fmt = (template: string, vars: Record<string, string | number>) =>
    template.replace(/\$\{(\w+)}/g, (_all, key: string) => String(vars[key] ?? ""));

export const escapeHtml = (text: string) => text.replace(/[&<>"']/g, char =>
    ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"})[char]!);

interface Row {
    conv: ChatConversation;
    selected: boolean;
    existing: boolean;
}

export interface ImportDialogOptions {
    app: App;
    i18n: I18n;
    toMarkdown: HtmlToMarkdown;
    notebookName: string;
    includeThinking: boolean;
    /** 本次运行中已导入的对话 ID。思源的 SQL 索引会延迟几秒，需要与查询结果合并后去重 */
    knownIds: Set<string>;
}

const NEW_NOTEBOOK = "__acn_new__";

export const openImportDialog = (options: ImportDialogOptions) => {
    const {i18n} = options;
    const isMobile = getFrontend().startsWith("mobile") || getFrontend() === "browser-mobile";
    const dialog = new Dialog({
        title: i18n.importChats,
        width: isMobile ? "92vw" : "760px",
        height: isMobile ? "80vh" : "72vh",
        content: `<div class="b3-dialog__content acn-import">
    <div class="acn-import__drop" data-type="drop">
        <svg class="acn-import__icon"><use xlink:href="#iconAcnChat"></use></svg>
        <div>${i18n.dropHint} <button class="b3-button b3-button--outline" data-type="pick">${i18n.pickFiles}</button></div>
        <div class="b3-label__text">${i18n.supportedFormats}</div>
        <input type="file" multiple accept="${SUPPORTED_EXTENSIONS.join(",")}" class="fn__none">
    </div>
    <div class="acn-import__toolbar fn__none">
        <input class="b3-text-field fn__flex-1" data-type="search" placeholder="${i18n.searchTitle}">
        <label class="acn-import__check"><input type="checkbox" data-type="all" checked> ${i18n.selectAll}</label>
    </div>
    <div class="acn-import__list"></div>
    <div class="acn-import__status b3-label__text"></div>
</div>
<div class="b3-dialog__action acn-import__action">
    <span class="ft__on-surface">${i18n.notebook}</span>
    <select class="b3-select" data-type="notebook"></select>
    <label class="acn-import__check"><input class="b3-switch" type="checkbox" data-type="thinking"${options.includeThinking ? " checked" : ""}> ${i18n.includeThinking}</label>
    <div class="fn__flex-1"></div>
    <button class="b3-button b3-button--cancel" data-type="cancel">${i18n.cancel}</button>
    <div class="fn__space"></div>
    <button class="b3-button" data-type="import" disabled>${fmt(i18n.importN, {n: 0})}</button>
</div>`,
    });
    const root = dialog.element;
    const $ = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
    const fileInput = $<HTMLInputElement>("input[type=file]");
    const listElement = $(".acn-import__list");
    const statusElement = $(".acn-import__status");
    const searchInput = $<HTMLInputElement>("[data-type=search]");
    const allCheckbox = $<HTMLInputElement>("[data-type=all]");
    const notebookSelect = $<HTMLSelectElement>("[data-type=notebook]");
    const importButton = $<HTMLButtonElement>("[data-type=import]");
    const rows: Row[] = [];
    let busy = false;
    const importedIds = loadImportedIds().catch(() => new Set<string>()).then(ids => {
        ids.forEach(id => options.knownIds.add(id));
        return options.knownIds;
    });

    const setStatus = (text: string) => {
        statusElement.textContent = text;
    };

    const visibleRows = () => {
        const keyword = searchInput.value.trim().toLowerCase();
        return rows.filter(row => !keyword || row.conv.title.toLowerCase().includes(keyword));
    };

    const updateImportButton = () => {
        const count = rows.filter(row => row.selected && !row.existing).length;
        importButton.textContent = fmt(i18n.importN, {n: count});
        importButton.disabled = busy || count === 0;
    };

    const render = () => {
        $(".acn-import__toolbar").classList.toggle("fn__none", rows.length === 0);
        $(".acn-import__drop").classList.toggle("acn-import__drop--compact", rows.length > 0);
        listElement.innerHTML = visibleRows().map(row => {
            const index = rows.indexOf(row);
            const date = row.conv.createdAt ? row.conv.createdAt.slice(0, 10) : "";
            const meta = [SOURCE_LABELS[row.conv.source], date, fmt(i18n.turns, {n: row.conv.turns.length})]
                .filter(Boolean).join(" · ");
            return `<label class="b3-list-item acn-import__row${row.existing ? " acn-import__row--existing" : ""}">
    <input type="checkbox" data-index="${index}"${row.selected && !row.existing ? " checked" : ""}${row.existing ? " disabled" : ""}>
    <span class="b3-list-item__text">${escapeHtml(row.conv.title)}</span>
    ${row.existing ? `<span class="acn-import__badge">${i18n.imported}</span>` : ""}
    <span class="b3-list-item__meta">${escapeHtml(meta)}</span>
</label>`;
        }).join("");
        updateImportButton();
    };

    const loadNotebooks = async () => {
        const notebooks = await listNotebooks().catch(() => []);
        const preferred = notebooks.find(notebook => notebook.name === options.notebookName);
        notebookSelect.innerHTML = (preferred ? "" :
            `<option value="${NEW_NOTEBOOK}">${escapeHtml(options.notebookName)}${i18n.newNotebook}</option>`) +
            notebooks.map(notebook => `<option value="${notebook.id}"${notebook === preferred ? " selected" : ""}>${
                escapeHtml(notebook.name)}</option>`).join("");
    };
    loadNotebooks();

    const handleFiles = async (fileList: FileList | File[]) => {
        // FileList 是实时的，清空 input 后会变空，需在第一个 await 之前复制出来
        const files = Array.from(fileList);
        const known = new Set(rows.map(row => row.conv.id));
        const ids = await importedIds;
        const messages: string[] = [];
        for (const file of files) {
            setStatus(fmt(i18n.parsing, {name: file.name}));
            try {
                const convs = parseChatFile(file.name, new Uint8Array(await file.arrayBuffer()), options.toMarkdown);
                if (convs.length === 0) {
                    messages.push(fmt(i18n.noConversation, {name: file.name}));
                }
                convs.filter(conv => !known.has(conv.id)).forEach(conv => {
                    known.add(conv.id);
                    rows.push({conv, selected: true, existing: ids.has(conv.id)});
                });
            } catch (error) {
                messages.push(fmt(i18n.parseFailed, {name: file.name, msg: (error as Error).message}));
            }
        }
        rows.sort((a, b) => (b.conv.createdAt || "").localeCompare(a.conv.createdAt || ""));
        setStatus(messages.join("\n"));
        render();
    };

    $("[data-type=pick]").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        if (fileInput.files?.length) {
            handleFiles(fileInput.files);
            fileInput.value = "";
        }
    });
    const dropElement = $("[data-type=drop]");
    dropElement.addEventListener("dragover", event => {
        event.preventDefault();
        dropElement.classList.add("acn-import__drop--over");
    });
    dropElement.addEventListener("dragleave", () => dropElement.classList.remove("acn-import__drop--over"));
    dropElement.addEventListener("drop", event => {
        event.preventDefault();
        dropElement.classList.remove("acn-import__drop--over");
        if (event.dataTransfer?.files.length) {
            handleFiles(event.dataTransfer.files);
        }
    });
    searchInput.addEventListener("input", render);
    allCheckbox.addEventListener("change", () => {
        visibleRows().forEach(row => {
            row.selected = allCheckbox.checked;
        });
        render();
    });
    listElement.addEventListener("change", event => {
        const target = event.target as HTMLInputElement;
        const row = rows[Number(target.dataset.index)];
        if (row) {
            row.selected = target.checked;
            updateImportButton();
        }
    });
    $("[data-type=cancel]").addEventListener("click", () => dialog.destroy());

    importButton.addEventListener("click", async () => {
        const targets = rows.filter(row => row.selected && !row.existing);
        if (busy || targets.length === 0) {
            return;
        }
        busy = true;
        updateImportButton();
        const includeThinking = $<HTMLInputElement>("[data-type=thinking]").checked;
        let created = 0;
        let skipped = 0;
        let failed = 0;
        let lastError = "";
        let firstId = "";
        try {
            const notebookId = notebookSelect.value === NEW_NOTEBOOK ?
                await ensureNotebook(options.notebookName) : notebookSelect.value;
            const ids = await importedIds;
            for (let i = 0; i < targets.length; i++) {
                setStatus(fmt(i18n.importing, {done: i, total: targets.length}));
                try {
                    const result = await importConversation(targets[i].conv, {
                        notebookId,
                        includeThinking,
                        otherFolder: i18n.otherSource,
                    }, ids);
                    if (result.status === "created") {
                        created++;
                        firstId = firstId || result.id;
                    } else {
                        skipped++;
                    }
                    targets[i].existing = true;
                } catch (error) {
                    failed++;
                    lastError = (error as Error).message;
                }
            }
        } catch (error) {
            failed = targets.length;
            lastError = (error as Error).message;
        }
        busy = false;
        const summary = fmt(i18n.importDone, {created, skipped}) +
            (failed ? fmt(i18n.importFailed, {failed, msg: lastError}) : "");
        setStatus(summary);
        showMessage(summary, failed ? 0 : 6000, failed ? "error" : "info");
        render();
        await loadNotebooks();
        if (firstId && !isMobile) {
            openTab({app: options.app, doc: {id: firstId}});
        }
    });
    return dialog;
};
