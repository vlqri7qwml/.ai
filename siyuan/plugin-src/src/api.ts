import {fetchSyncPost} from "siyuan";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 调用内核接口，code 非 0 时抛出错误。 */
export const kernel = async <T = any>(url: string, data: Record<string, unknown> = {}): Promise<T> => {
    const response = await fetchSyncPost(url, data);
    if (!response || response.code !== 0) {
        throw new Error(response?.msg || `${url} 调用失败`);
    }
    return response.data as T;
};
