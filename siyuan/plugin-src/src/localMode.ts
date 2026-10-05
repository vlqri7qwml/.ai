import {fetchPost} from "siyuan";
import {kernel} from "./api.ts";

/** 本地模式下给根元素加的类名，插件样式据此隐藏云端入口。 */
export const LOCAL_MODE_CLASS = "acn-local-only";

/* eslint-disable @typescript-eslint/no-explicit-any */
const siyuanConfig = () => (window as any).siyuan?.config;

/** 开启本地模式：关闭云端同步与安装包自动下载，并隐藏云端相关入口。 */
export const applyLocalMode = (enabled: boolean) => {
    document.documentElement.classList.toggle(LOCAL_MODE_CLASS, enabled);
    if (!enabled) {
        return;
    }
    const config = siyuanConfig();
    if (config?.sync?.enabled) {
        fetchPost("/api/sync/setSyncEnable", {enabled: false}, () => {
            config.sync.enabled = false;
        });
    }
    if (config?.system?.downloadInstallPkg) {
        fetchPost("/api/system/setDownloadInstallPkg", {downloadInstallPkg: false}, () => {
            config.system.downloadInstallPkg = false;
        });
    }
};

/** 当前工作空间（笔记存储目录）。getConf 返回的配置中路径为空，需单独查询。 */
export const fetchWorkspaceDir = async (): Promise<string> => {
    try {
        return (await kernel<{ workspaceDir: string }>("/api/system/getWorkspaceInfo")).workspaceDir || "";
    } catch {
        return siyuanConfig()?.system?.workspaceDir || "";
    }
};

/** 桌面版在系统文件管理器中打开目录，其他环境返回 false。 */
export const openInFileManager = (path: string) => {
    try {
        const electron = (window as any).require?.("electron");
        if (electron?.shell?.openPath) {
            electron.shell.openPath(path);
            return true;
        }
    } catch {
        // 浏览器或移动端没有 Electron
    }
    return false;
};
