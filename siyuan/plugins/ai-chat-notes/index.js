"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => AiChatNotes
});
module.exports = __toCommonJS(index_exports);
var import_siyuan4 = require("siyuan");

// src/clipboard.ts
var readClipboard = async () => {
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
      return { html, text };
    }
    if (navigator.clipboard?.readText) {
      return { html: "", text: await navigator.clipboard.readText() };
    }
  } catch (error) {
    console.warn("[ai-chat-notes] read clipboard", error);
  }
  return null;
};
var copyText = async (text) => {
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

// src/dialog.ts
var import_siyuan2 = require("siyuan");

// src/api.ts
var import_siyuan = require("siyuan");
var kernel = async (url, data = {}) => {
  const response = await (0, import_siyuan.fetchSyncPost)(url, data);
  if (!response || response.code !== 0) {
    throw new Error(response?.msg || `${url} 调用失败`);
  }
  return response.data;
};

// src/render.ts
var escapeSuperBlockEnd = (markdown) => markdown.replace(/^(\s*)\}\}\}\s*$/gm, "$1​}}}");
var turnsToKramdown = (turns, source, options = {}) => {
  const blocks = [];
  for (const turn of turns) {
    const markdown = turn.markdown.trim();
    if (!markdown || turn.role === "thinking" && !options.includeThinking) {
      continue;
    }
    if (turn.role === "note") {
      blocks.push(markdown);
      continue;
    }
    const fold = turn.role === "thinking" ? ' fold="1"' : "";
    blocks.push(`{{{row
${escapeSuperBlockEnd(markdown)}
}}}
{: custom-chat-role="${turn.role}" custom-chat-source="${source}"${fold}}`);
  }
  return blocks.join("\n\n") + "\n";
};
var conversationToKramdown = (conv, options = {}) => turnsToKramdown(conv.turns, conv.source, options);
var safeDocTitle = (title) => (title || "未命名对话").replace(/[/\\]/g, "／").replace(/[\r\n\t]+/g, " ").trim().slice(0, 120) || "未命名对话";

// src/types.ts
var SOURCE_LABELS = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  deepseek: "DeepSeek",
  kimi: "Kimi",
  doubao: "豆包",
  generic: "AI 对话"
};

// src/importer.ts
var listNotebooks = async () => (await kernel("/api/notebook/lsNotebooks")).notebooks || [];
var ensureNotebook = async (name) => {
  const found = (await listNotebooks()).find((notebook) => notebook.name === name);
  if (found) {
    if (found.closed) {
      await kernel("/api/notebook/openNotebook", { notebook: found.id });
    }
    return found.id;
  }
  return (await kernel("/api/notebook/createNotebook", { name })).notebook.id;
};
var loadImportedIds = async () => {
  const rows = await kernel("/api/query/sql", {
    stmt: "SELECT value FROM attributes WHERE name = 'custom-chat-id' LIMIT 1000000"
  });
  return new Set((rows || []).map((row) => row.value));
};
var importConversation = async (conv, options, imported) => {
  if (imported.has(conv.id)) {
    return { status: "skipped" };
  }
  const id = await kernel("/api/filetree/createDocWithMd", {
    notebook: options.notebookId,
    path: `/${conv.source === "generic" ? options.otherFolder : SOURCE_LABELS[conv.source]}/${safeDocTitle(conv.title)}`,
    markdown: conversationToKramdown(conv, { includeThinking: options.includeThinking })
  });
  const attrs = { "custom-chat-id": conv.id, "custom-chat-source": conv.source };
  if (conv.createdAt) {
    attrs["custom-chat-created"] = conv.createdAt;
  }
  await kernel("/api/attr/setBlockAttrs", { id, attrs });
  imported.add(conv.id);
  return { status: "created", id };
};

// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /* @__PURE__ */ new u8(0);
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
};
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = b4(data, e - 20) == 117853008;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i = 0; i < c; ++i) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// src/parse/text.ts
var USER_LABELS = [
  "you said",
  "you",
  "user",
  "human",
  "me",
  "question",
  "q",
  "您说",
  "你说",
  "用户\\s*\\(user\\)",
  "用户",
  "提问",
  "问题",
  "问",
  "我"
];
var ASSISTANT_LABELS = [
  "chatgpt said",
  "chatgpt\\s*说",
  "claude said",
  "gemini said",
  "assistant",
  "chatgpt",
  "claude",
  "gemini",
  "deepseek",
  "kimi",
  "doubao",
  "answer",
  "ai",
  "a",
  "助手\\s*\\(assistant\\)",
  "助手",
  "豆包",
  "回答",
  "答"
];
var COLON_ONLY = /* @__PURE__ */ new Set(["q", "a", "me", "ai", "我", "问", "答"]);
var labelGroup = (labels) => labels.join("|");
var ALL_LABELS = labelGroup([...USER_LABELS, ...ASSISTANT_LABELS]);
var COLON_LINE = new RegExp(
  `^\\s*(?:[#>]+\\s*)?(?:\\*\\*|__)?\\s*(${ALL_LABELS})\\s*(?:\\*\\*|__)?\\s*[:：]\\s*(?:\\*\\*|__)?\\s*(.*)$`,
  "i"
);
var HEADING_LINE = new RegExp(
  `^\\s*#{1,6}\\s*(?:\\*\\*)?\\s*(${ALL_LABELS})\\s*(?:\\*\\*)?\\s*(?:[-–—]\\s+.*)?$`,
  "i"
);
var USER_RE = new RegExp(`^(?:${labelGroup(USER_LABELS)})$`, "i");
var roleOfLabel = (label) => {
  return USER_RE.test(label.trim()) ? "user" : "assistant";
};
var matchLabel = (line) => {
  const colon = COLON_LINE.exec(line);
  if (colon) {
    return { role: roleOfLabel(colon[1]), rest: colon[2].replace(/(?:\*\*|__)\s*$/, "") };
  }
  const heading = HEADING_LINE.exec(line);
  if (heading && !COLON_ONLY.has(heading[1].trim().toLowerCase())) {
    return { role: roleOfLabel(heading[1]), rest: "" };
  }
  return null;
};
var normalizeTurns = (turns) => {
  const result = [];
  for (const turn of turns) {
    const markdown = turn.markdown.replace(/^\s*\n/, "").replace(/\s+$/, "");
    if (!markdown.trim()) {
      continue;
    }
    const last = result[result.length - 1];
    if (last && last.role === turn.role) {
      last.markdown += "\n\n" + markdown;
    } else {
      result.push({ role: turn.role, markdown });
    }
  }
  return result;
};
var parseConversationText = (text) => {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const turns = [];
  let current = { role: "note", markdown: "" };
  let fence = null;
  let hasUser = false;
  let hasAssistant = false;
  for (const line of lines) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      if (!fence) {
        fence = fenceMatch[1];
      } else if (fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) {
        fence = null;
      }
    }
    const hit = fence || fenceMatch ? null : matchLabel(line);
    if (hit) {
      turns.push(current);
      current = { role: hit.role, markdown: hit.rest ? hit.rest + "\n" : "" };
      if (hit.role === "user") {
        hasUser = true;
      } else {
        hasAssistant = true;
      }
      continue;
    }
    current.markdown += line + "\n";
  }
  turns.push(current);
  if (!hasUser || !hasAssistant) {
    return null;
  }
  let title;
  const first = turns[0];
  if (first.role === "note") {
    const heading = /^\s*#\s+(.+?)\s*$/m.exec(first.markdown);
    if (heading) {
      title = heading[1];
      first.markdown = first.markdown.replace(heading[0], "");
    }
  }
  return { title, turns: normalizeTurns(turns) };
};
var guessSourceFromText = (text) => {
  if (/^\s*(?:#+\s*)?(?:\*\*)?ChatGPT/im.test(text)) {
    return "chatgpt";
  }
  if (/^\s*(?:#+\s*)?(?:\*\*)?Claude/im.test(text)) {
    return "claude";
  }
  if (/^\s*(?:#+\s*)?(?:\*\*)?Gemini/im.test(text)) {
    return "gemini";
  }
  if (/^\s*(?:#+\s*)?(?:\*\*)?DeepSeek/im.test(text)) {
    return "deepseek";
  }
  return "generic";
};

// src/parse/html.ts
var SITE_RULES = [
  { source: "claude", user: '[data-testid="user-message"]', assistant: ".font-claude-response, .font-claude-message" },
  { source: "chatgpt", user: '[data-message-author-role="user"]', assistant: '[data-message-author-role="assistant"]' },
  { source: "gemini", user: "user-query", assistant: "model-response" },
  {
    source: "kimi",
    user: ".chat-content-item-user, .segment-user",
    assistant: ".chat-content-item-assistant, .segment-assistant"
  },
  { source: "doubao", user: '[data-testid="send_message"]', assistant: '[data-testid="receive_message"]' }
];
var DEEPSEEK_ANSWER = ".ds-markdown";
var CHROME_LINE = /^(已深度思考|已思考|思考中|深度思考|Thought for|Thinking|Copy|Copied|复制|已复制|重新生成|Regenerate|编辑|Edit|分享|Share|内容由\s*AI\s*生成|本回答由\s*AI\s*生成)(?:\s*[（(:：\d].{0,40})?\s*$/i;
var REMOVE_SELECTOR = 'button, svg, script, style, noscript, textarea, input, select, [role="button"], .sr-only';
var outermost = (elements) => elements.filter((element) => !elements.some((other) => other !== element && other.contains(element)));
var normalizeCodeBlocks = (root) => {
  root.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) {
      return;
    }
    let lang = /(?:^|\s)(?:language|lang)-([\w+#.-]+)/.exec(code.getAttribute("class") || "")?.[1] || "";
    if (!lang) {
      const label = Array.from(pre.querySelectorAll("div, span")).filter((element) => !element.contains(code) && !code.contains(element)).map((element) => (element.textContent || "").trim()).find((text) => /^[A-Za-z][\w+#.-]{0,20}$/.test(text));
      lang = label || "";
    }
    const newCode = pre.ownerDocument.createElement("code");
    newCode.textContent = code.textContent || "";
    if (lang) {
      newCode.setAttribute("class", "language-" + lang);
    }
    pre.innerHTML = "";
    pre.appendChild(newCode);
    if (lang) {
      [pre.previousElementSibling, pre.parentElement?.previousElementSibling].forEach((element) => {
        if (element && (element.textContent || "").trim().toLowerCase() === lang.toLowerCase()) {
          element.remove();
        }
      });
    }
  });
};
var cleanElement = (element) => {
  element.querySelectorAll(REMOVE_SELECTOR).forEach((item) => item.remove());
  normalizeCodeBlocks(element);
};
var elementToMarkdown = (element, toMarkdown) => {
  const clone = element.cloneNode(true);
  cleanElement(clone);
  const markdown = toMarkdown(clone.innerHTML).trim();
  return markdown || (clone.textContent || "").trim();
};
var stripChromeLines = (markdown) => markdown.split("\n").filter((line) => !CHROME_LINE.test(line.trim())).join("\n").trim();
var parseBySiteRules = (body, toMarkdown) => {
  for (const rule of SITE_RULES) {
    const matched = outermost(Array.from(body.querySelectorAll(`${rule.user}, ${rule.assistant}`)));
    if (matched.length === 0) {
      continue;
    }
    const turns = matched.map((element) => ({
      role: element.matches(rule.user) ? "user" : "assistant",
      markdown: elementToMarkdown(element, toMarkdown)
    }));
    const normalized = normalizeTurns(turns);
    if (normalized.length > 0) {
      return { source: rule.source, turns: normalized };
    }
  }
  return null;
};
var parseDeepSeek = (body, toMarkdown) => {
  const clone = body.cloneNode(true);
  const answers = outermost(Array.from(clone.querySelectorAll(DEEPSEEK_ANSWER)));
  if (answers.length === 0) {
    return null;
  }
  const answerTurns = answers.map((element, index) => {
    let thinking = false;
    for (let parent = element.parentElement; parent && parent !== clone; parent = parent.parentElement) {
      if (/think/i.test(parent.getAttribute("class") || "")) {
        thinking = true;
        break;
      }
    }
    const turn = {
      role: thinking ? "thinking" : "assistant",
      markdown: elementToMarkdown(element, toMarkdown)
    };
    const marker = clone.ownerDocument.createElement("acn-split");
    marker.setAttribute("data-index", String(index));
    element.replaceWith(marker);
    return turn;
  });
  const segments = clone.innerHTML.split(/<acn-split[^>]*><\/acn-split>/);
  const turns = [];
  segments.forEach((segment, index) => {
    const segmentBody = new DOMParser().parseFromString(segment, "text/html").body;
    cleanElement(segmentBody);
    const question = stripChromeLines(toMarkdown(segmentBody.innerHTML));
    if (question) {
      turns.push({ role: "user", markdown: question });
    }
    if (answerTurns[index]) {
      turns.push(answerTurns[index]);
    }
  });
  return { source: "deepseek", turns: normalizeTurns(turns) };
};
var parseConversationHTML = (html, toMarkdown) => {
  if (!html || !html.trim()) {
    return null;
  }
  const body = new DOMParser().parseFromString(html, "text/html").body;
  if (!body) {
    return null;
  }
  const result = parseBySiteRules(body, toMarkdown) || parseDeepSeek(body, toMarkdown);
  return result && result.turns.length > 0 ? result : null;
};
var htmlToPlainMarkdown = (html, toMarkdown) => {
  const body = new DOMParser().parseFromString(html, "text/html").body;
  if (!body) {
    return "";
  }
  return elementToMarkdown(body, toMarkdown);
};

// src/parse/files.ts
var SUPPORTED_EXTENSIONS = [".zip", ".json", ".md", ".markdown", ".txt", ".html", ".htm"];
var hashString = (text) => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};
var extOf = (name) => {
  const match = /\.[^./\\]+$/.exec(name);
  return match ? match[0].toLowerCase() : "";
};
var baseName = (name) => name.split(/[/\\]/).pop().replace(/\.[^.]+$/, "");
var toISO = (value) => {
  if (typeof value === "number" && isFinite(value)) {
    return new Date(value < 1e12 ? value * 1e3 : value).toISOString();
  }
  if (typeof value === "string" && value) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? void 0 : date.toISOString();
  }
  return void 0;
};
var fenceFor = (content) => {
  const longest = Math.max(2, ...Array.from(content.matchAll(/`+/g), (match) => match[0].length));
  return "`".repeat(longest + 1);
};
var codeBlock = (content, lang = "") => {
  const fence = fenceFor(content);
  return `${fence}${lang}
${content.replace(/\n$/, "")}
${fence}`;
};
var titleFromTurns = (turns, fallback) => {
  const question = turns.find((turn) => turn.role === "user");
  const line = question?.markdown.split("\n").map((item) => item.replace(/^[#>*\s-]+/, "").trim()).find(Boolean);
  if (!line) {
    return fallback;
  }
  return line.length > 40 ? line.slice(0, 40) + "..." : line;
};
var makeConversation = (source, rawId, title, turns, createdAt) => {
  const normalized = normalizeTurns(turns);
  return {
    id: `${source}:${rawId}`,
    source,
    title: (title || "").trim() || titleFromTurns(normalized, "未命名对话"),
    createdAt,
    turns: normalized
  };
};
var ARTIFACT_LANGS = {
  "text/html": "html",
  "application/vnd.ant.react": "jsx",
  "image/svg+xml": "svg",
  "application/vnd.ant.mermaid": "mermaid",
  "text/markdown": "markdown"
};
var artifactMarkdown = (title, type, language, content) => {
  const lang = language || ARTIFACT_LANGS[type] || "";
  const heading = `**📄 ${title || "Artifact"}**`;
  if (lang === "markdown") {
    return `${heading}

${content.trim()}`;
  }
  return `${heading}

${codeBlock(content, lang)}`;
};
var attrOf = (attrs, name) => new RegExp(`${name}="([^"]*)"`).exec(attrs)?.[1] || "";
var convertInlineArtifacts = (text) => text.replace(/<antThinking>[\s\S]*?<\/antThinking>/g, "").replace(/<antArtifact\b([^>]*)>([\s\S]*?)<\/antArtifact>/g, (_all, attrs, content) => "\n\n" + artifactMarkdown(
  attrOf(attrs, "title"),
  attrOf(attrs, "type"),
  attrOf(attrs, "language"),
  content.replace(/^\n/, "")
) + "\n\n");
var fromClaude = (conv) => {
  const turns = [];
  for (const message of conv.chat_messages || []) {
    const role = message.sender === "human" ? "user" : "assistant";
    const parts = Array.isArray(message.content) && message.content.length > 0 ? message.content : [{ type: "text", text: message.text || "" }];
    let buffer = [];
    const flush = () => {
      if (buffer.length > 0) {
        turns.push({ role, markdown: buffer.join("\n\n") });
        buffer = [];
      }
    };
    for (const part of parts) {
      if (part?.type === "text" && typeof part.text === "string") {
        buffer.push(convertInlineArtifacts(part.text));
      } else if (part?.type === "thinking" && typeof part.thinking === "string") {
        flush();
        turns.push({ role: "thinking", markdown: part.thinking });
      } else if (part?.type === "tool_use" && typeof part.input?.content === "string") {
        buffer.push(artifactMarkdown(part.input.title, part.input.type, part.input.language, part.input.content));
      }
    }
    const fileNames = [...message.attachments || [], ...message.files || []].map((file) => file?.file_name).filter(Boolean);
    if (fileNames.length > 0) {
      buffer.push(fileNames.map((fileName) => `📎 ${fileName}`).join("\n"));
    }
    flush();
  }
  return makeConversation(
    "claude",
    conv.uuid || hashString(JSON.stringify(conv).slice(0, 4e3)),
    conv.name,
    turns,
    toISO(conv.created_at)
  );
};
var stripChatGPTCitations = (text) => text.replace(/[^]*/g, "").replace(/【\d+(?::\d+)?†[^】]*】/g, "");
var mappingPath = (conv) => {
  const mapping = conv.mapping || {};
  const path = [];
  if (conv.current_node && mapping[conv.current_node]) {
    for (let node2 = mapping[conv.current_node]; node2; node2 = node2.parent ? mapping[node2.parent] : null) {
      path.unshift(node2);
      if (path.length > 1e5) {
        break;
      }
    }
    return path;
  }
  let node = Object.values(mapping).find((item) => !item?.parent || !mapping[item.parent]);
  while (node) {
    path.push(node);
    const children = node.children || [];
    node = children.length > 0 ? mapping[children[children.length - 1]] : null;
    if (path.length > 1e5) {
      break;
    }
  }
  return path;
};
var chatGPTTurn = (message) => {
  const role = message?.author?.role;
  if (!message || message.metadata?.is_visually_hidden_from_conversation || role !== "user" && role !== "assistant") {
    return null;
  }
  if (role === "assistant" && message.recipient && message.recipient !== "all") {
    return null;
  }
  const content = message.content || {};
  switch (content.content_type) {
    case "thoughts": {
      const thoughts = (content.thoughts || []).map((thought) => (thought.summary ? `**${thought.summary}**

` : "") + (thought.content || "")).join("\n\n");
      return thoughts.trim() ? { role: "thinking", markdown: thoughts } : null;
    }
    case "reasoning_recap":
    case "user_editable_context":
    case "code":
    case "execution_output":
      return null;
    default: {
      const parts = Array.isArray(content.parts) ? content.parts : [];
      const text = parts.map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (part?.content_type === "image_asset_pointer") {
          return "[图片]";
        }
        if (part?.content_type?.startsWith?.("audio")) {
          return "[音频]";
        }
        return typeof part?.text === "string" ? part.text : "";
      }).join("\n");
      const markdown = stripChatGPTCitations(text || content.text || "");
      return markdown.trim() ? { role, markdown } : null;
    }
  }
};
var DEEPSEEK_ROLES = { REQUEST: "user", RESPONSE: "assistant", THINK: "thinking" };
var fromMapping = (conv) => {
  const nodes = mappingPath(conv);
  const isDeepSeek = nodes.some((node) => Array.isArray(node?.message?.fragments));
  const turns = [];
  for (const node of nodes) {
    if (isDeepSeek) {
      for (const fragment of node?.message?.fragments || []) {
        const role = DEEPSEEK_ROLES[String(fragment?.type || "").toUpperCase()];
        if (role && typeof fragment.content === "string") {
          turns.push({ role, markdown: fragment.content });
        }
      }
    } else {
      const turn = chatGPTTurn(node?.message);
      if (turn) {
        turns.push(turn);
      }
    }
  }
  const source = isDeepSeek ? "deepseek" : "chatgpt";
  const rawId = conv.conversation_id || conv.id || hashString((conv.title || "") + (conv.create_time || "") + JSON.stringify(turns.slice(0, 2)));
  return makeConversation(source, rawId, conv.title, turns, toISO(conv.create_time ?? conv.inserted_at));
};
var GENERIC_ROLES = {
  user: "user",
  human: "user",
  me: "user",
  assistant: "assistant",
  ai: "assistant",
  bot: "assistant",
  model: "assistant",
  gpt: "assistant",
  claude: "assistant",
  chatgpt: "assistant",
  thinking: "thinking",
  reasoning: "thinking"
};
var genericContent = (content) => {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((item) => typeof item === "string" ? item : item?.text ?? item?.content ?? "").filter((item) => typeof item === "string").join("\n\n");
  }
  if (content && typeof content === "object") {
    return genericContent(content.parts ?? content.text ?? "");
  }
  return "";
};
var isRoleMessage = (item) => item && typeof item === "object" && typeof (item.role ?? item.sender ?? item.author) === "string" && (item.content !== void 0 || item.text !== void 0 || item.parts !== void 0);
var fromGeneric = (messages, title, rawId, createdAt) => {
  const turns = [];
  for (const message of messages) {
    const role = GENERIC_ROLES[String(message?.role ?? message?.sender ?? message?.author ?? "").toLowerCase()];
    if (!role) {
      continue;
    }
    if (typeof message.reasoning_content === "string" && message.reasoning_content.trim()) {
      turns.push({ role: "thinking", markdown: message.reasoning_content });
    }
    const markdown = genericContent(message.content ?? message.text ?? message.parts);
    if (markdown.trim()) {
      turns.push({ role, markdown });
    }
  }
  return makeConversation(
    "generic",
    rawId || hashString(title + JSON.stringify(turns.slice(0, 4))),
    title,
    turns,
    toISO(createdAt)
  );
};
var parseChatJSON = (json, fallbackTitle) => {
  const items = Array.isArray(json) ? json : [json];
  if (items.length > 0 && isRoleMessage(items[0])) {
    return [fromGeneric(items, fallbackTitle)].filter((conv) => conv.turns.length > 0);
  }
  const result = [];
  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }
    if (Array.isArray(item.chat_messages)) {
      result.push(fromClaude(item));
    } else if (item.mapping && typeof item.mapping === "object") {
      result.push(fromMapping(item));
    } else if (Array.isArray(item.messages)) {
      result.push(fromGeneric(
        item.messages,
        item.title || item.name || fallbackTitle,
        item.id,
        item.created_at ?? item.createdAt ?? item.create_time
      ));
    }
  }
  return result.filter((conv) => conv.turns.length > 0);
};
var parseChatText = (text, fileName) => {
  const parsed = parseConversationText(text);
  const title = parsed?.title || baseName(fileName);
  const turns = parsed ? parsed.turns : [{ role: "note", markdown: text }];
  const conv = makeConversation(parsed ? guessSourceFromText(text) : "generic", hashString(text), title, turns);
  return conv.turns.length > 0 ? [conv] : [];
};
var cleanPageTitle = (title) => title.replace(/\s*[-–|]\s*(Claude|ChatGPT|Gemini|DeepSeek|Kimi.*|豆包.*)\s*$/i, "").replace(/^\s*(ChatGPT|Gemini|DeepSeek)\s*[-–|]\s*/i, "").trim();
var parseChatHTML = (html, fileName, toMarkdown) => {
  const pageTitle = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() || "";
  const title = cleanPageTitle(pageTitle.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")) || baseName(fileName);
  const parsed = parseConversationHTML(html, toMarkdown);
  if (parsed) {
    return [makeConversation(parsed.source, hashString(html), title, parsed.turns)];
  }
  const markdown = htmlToPlainMarkdown(html, toMarkdown);
  return parseChatText(markdown, fileName).map((conv) => ({ ...conv, title }));
};
var decode = (data) => new TextDecoder("utf-8").decode(data).replace(/^﻿/, "");
var parseEntry = (name, data, toMarkdown) => {
  const ext = extOf(name);
  if (ext === ".json") {
    return parseChatJSON(JSON.parse(decode(data)), baseName(name));
  }
  if (ext === ".html" || ext === ".htm") {
    return parseChatHTML(decode(data), name, toMarkdown);
  }
  if (ext === ".md" || ext === ".markdown" || ext === ".txt") {
    return parseChatText(decode(data), name);
  }
  throw new Error(`不支持的文件类型：${name}`);
};
var parseChatFile = (name, data, toMarkdown) => {
  if (extOf(name) !== ".zip") {
    return parseEntry(name, data, toMarkdown);
  }
  const entries = unzipSync(data, {
    filter: (file) => !file.name.startsWith("__MACOSX/") && /\.(json|md|markdown|txt|html?)$/i.test(file.name)
  });
  const names = Object.keys(entries);
  const conversationFiles = names.filter((entry) => /(^|\/)conversations\.json$/i.test(entry));
  const targets = conversationFiles.length > 0 ? conversationFiles : names;
  const result = [];
  for (const entry of targets) {
    try {
      result.push(...parseEntry(entry, entries[entry], toMarkdown));
    } catch (error) {
      if (conversationFiles.length > 0) {
        throw error;
      }
    }
  }
  return result;
};

// src/dialog.ts
var fmt = (template, vars) => template.replace(/\$\{(\w+)}/g, (_all, key) => String(vars[key] ?? ""));
var escapeHtml = (text) => text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
var NEW_NOTEBOOK = "__acn_new__";
var openImportDialog = (options) => {
  const { i18n } = options;
  const isMobile = (0, import_siyuan2.getFrontend)().startsWith("mobile") || (0, import_siyuan2.getFrontend)() === "browser-mobile";
  const dialog = new import_siyuan2.Dialog({
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
    <button class="b3-button" data-type="import" disabled>${fmt(i18n.importN, { n: 0 })}</button>
</div>`
  });
  const root = dialog.element;
  const $ = (selector) => root.querySelector(selector);
  const fileInput = $("input[type=file]");
  const listElement = $(".acn-import__list");
  const statusElement = $(".acn-import__status");
  const searchInput = $("[data-type=search]");
  const allCheckbox = $("[data-type=all]");
  const notebookSelect = $("[data-type=notebook]");
  const importButton = $("[data-type=import]");
  const rows = [];
  let busy = false;
  const importedIds = loadImportedIds().catch(() => /* @__PURE__ */ new Set()).then((ids) => {
    ids.forEach((id) => options.knownIds.add(id));
    return options.knownIds;
  });
  const setStatus = (text) => {
    statusElement.textContent = text;
  };
  const visibleRows = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    return rows.filter((row) => !keyword || row.conv.title.toLowerCase().includes(keyword));
  };
  const updateImportButton = () => {
    const count = rows.filter((row) => row.selected && !row.existing).length;
    importButton.textContent = fmt(i18n.importN, { n: count });
    importButton.disabled = busy || count === 0;
  };
  const render = () => {
    $(".acn-import__toolbar").classList.toggle("fn__none", rows.length === 0);
    $(".acn-import__drop").classList.toggle("acn-import__drop--compact", rows.length > 0);
    listElement.innerHTML = visibleRows().map((row) => {
      const index = rows.indexOf(row);
      const date = row.conv.createdAt ? row.conv.createdAt.slice(0, 10) : "";
      const meta = [SOURCE_LABELS[row.conv.source], date, fmt(i18n.turns, { n: row.conv.turns.length })].filter(Boolean).join(" · ");
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
    const preferred = notebooks.find((notebook) => notebook.name === options.notebookName);
    notebookSelect.innerHTML = (preferred ? "" : `<option value="${NEW_NOTEBOOK}">${escapeHtml(options.notebookName)}${i18n.newNotebook}</option>`) + notebooks.map((notebook) => `<option value="${notebook.id}"${notebook === preferred ? " selected" : ""}>${escapeHtml(notebook.name)}</option>`).join("");
  };
  loadNotebooks();
  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    const known = new Set(rows.map((row) => row.conv.id));
    const ids = await importedIds;
    const messages = [];
    for (const file of files) {
      setStatus(fmt(i18n.parsing, { name: file.name }));
      try {
        const convs = parseChatFile(file.name, new Uint8Array(await file.arrayBuffer()), options.toMarkdown);
        if (convs.length === 0) {
          messages.push(fmt(i18n.noConversation, { name: file.name }));
        }
        convs.filter((conv) => !known.has(conv.id)).forEach((conv) => {
          known.add(conv.id);
          rows.push({ conv, selected: true, existing: ids.has(conv.id) });
        });
      } catch (error) {
        messages.push(fmt(i18n.parseFailed, { name: file.name, msg: error.message }));
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
  dropElement.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropElement.classList.add("acn-import__drop--over");
  });
  dropElement.addEventListener("dragleave", () => dropElement.classList.remove("acn-import__drop--over"));
  dropElement.addEventListener("drop", (event) => {
    event.preventDefault();
    dropElement.classList.remove("acn-import__drop--over");
    if (event.dataTransfer?.files.length) {
      handleFiles(event.dataTransfer.files);
    }
  });
  searchInput.addEventListener("input", render);
  allCheckbox.addEventListener("change", () => {
    visibleRows().forEach((row) => {
      row.selected = allCheckbox.checked;
    });
    render();
  });
  listElement.addEventListener("change", (event) => {
    const target = event.target;
    const row = rows[Number(target.dataset.index)];
    if (row) {
      row.selected = target.checked;
      updateImportButton();
    }
  });
  $("[data-type=cancel]").addEventListener("click", () => dialog.destroy());
  importButton.addEventListener("click", async () => {
    const targets = rows.filter((row) => row.selected && !row.existing);
    if (busy || targets.length === 0) {
      return;
    }
    busy = true;
    updateImportButton();
    const includeThinking = $("[data-type=thinking]").checked;
    let created = 0;
    let skipped = 0;
    let failed = 0;
    let lastError = "";
    let firstId = "";
    try {
      const notebookId = notebookSelect.value === NEW_NOTEBOOK ? await ensureNotebook(options.notebookName) : notebookSelect.value;
      const ids = await importedIds;
      for (let i = 0; i < targets.length; i++) {
        setStatus(fmt(i18n.importing, { done: i, total: targets.length }));
        try {
          const result = await importConversation(targets[i].conv, {
            notebookId,
            includeThinking,
            otherFolder: i18n.otherSource
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
          lastError = error.message;
        }
      }
    } catch (error) {
      failed = targets.length;
      lastError = error.message;
    }
    busy = false;
    const summary = fmt(i18n.importDone, { created, skipped }) + (failed ? fmt(i18n.importFailed, { failed, msg: lastError }) : "");
    setStatus(summary);
    (0, import_siyuan2.showMessage)(summary, failed ? 0 : 6e3, failed ? "error" : "info");
    render();
    await loadNotebooks();
    if (firstId && !isMobile) {
      (0, import_siyuan2.openTab)({ app: options.app, doc: { id: firstId } });
    }
  });
  return dialog;
};

// src/localMode.ts
var import_siyuan3 = require("siyuan");
var LOCAL_MODE_CLASS = "acn-local-only";
var siyuanConfig = () => window.siyuan?.config;
var applyLocalMode = (enabled) => {
  document.documentElement.classList.toggle(LOCAL_MODE_CLASS, enabled);
  if (!enabled) {
    return;
  }
  const config = siyuanConfig();
  if (config?.sync?.enabled) {
    (0, import_siyuan3.fetchPost)("/api/sync/setSyncEnable", { enabled: false }, () => {
      config.sync.enabled = false;
    });
  }
  if (config?.system?.downloadInstallPkg) {
    (0, import_siyuan3.fetchPost)("/api/system/setDownloadInstallPkg", { downloadInstallPkg: false }, () => {
      config.system.downloadInstallPkg = false;
    });
  }
};
var fetchWorkspaceDir = async () => {
  try {
    return (await kernel("/api/system/getWorkspaceInfo")).workspaceDir || "";
  } catch {
    return siyuanConfig()?.system?.workspaceDir || "";
  }
};
var openInFileManager = (path) => {
  try {
    const electron = window.require?.("electron");
    if (electron?.shell?.openPath) {
      electron.shell.openPath(path);
      return true;
    }
  } catch {
  }
  return false;
};

// src/parse/detect.ts
var detectPastedConversation = (textHTML, textPlain, toMarkdown) => {
  const fromHTML = parseConversationHTML(textHTML, toMarkdown);
  if (fromHTML) {
    return fromHTML;
  }
  const fromText = parseConversationText(textPlain || "");
  if (fromText) {
    return { source: guessSourceFromText(textPlain), turns: fromText.turns };
  }
  return null;
};

// src/index.ts
var STORAGE_NAME = "settings.json";
var ICONS = `<symbol id="iconAcnChat" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2"
 stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
<path d="M13 8H7"/><path d="M17 12H7"/></g></symbol>`;
var createLute = () => {
  const lute = window.Lute.New();
  [
    "SetKramdownIAL",
    "SetSuperBlock",
    "SetCallout",
    "SetTag",
    "SetInlineMath",
    "SetGFMStrikethrough",
    "SetMark",
    "SetImgPathAllowSpace"
  ].forEach((name) => lute[name]?.(true));
  ["SetSetext", "SetFootnotes", "SetLinkRef", "SetToC", "SetIndentCodeBlock", "SetYamlFrontMatter"].forEach((name) => lute[name]?.(false));
  return lute;
};
var isInCodeBlock = () => {
  const node = window.getSelection()?.anchorNode;
  const element = node instanceof Element ? node : node?.parentElement;
  return !!element?.closest('[data-type="NodeCodeBlock"], code');
};
var AiChatNotes = class extends import_siyuan4.Plugin {
  constructor() {
    super(...arguments);
    __publicField(this, "settings");
    __publicField(this, "fileLute");
    __publicField(this, "importedIds", /* @__PURE__ */ new Set());
    /** 粘贴时识别网页对话，识别到才接管，其余情况交给思源默认粘贴。 */
    __publicField(this, "onPaste", (event) => {
      const detail = event.detail;
      if (!this.settings.autoDetectPaste || detail.siyuanHTML || !detail.textHTML && !detail.textPlain || !detail.protyle?.lute || isInCodeBlock()) {
        return;
      }
      const lute = detail.protyle.lute;
      let conversation;
      try {
        conversation = detectPastedConversation(
          detail.textHTML || "",
          detail.textPlain || "",
          (html) => lute.HTML2Md(html)
        );
      } catch (error) {
        console.error("[ai-chat-notes] paste", error);
        return;
      }
      if (!conversation) {
        return;
      }
      event.preventDefault();
      const kramdown = turnsToKramdown(
        conversation.turns,
        conversation.source,
        { includeThinking: this.settings.includeThinking }
      );
      detail.resolve({
        textHTML: "",
        textPlain: detail.textPlain,
        siyuanHTML: lute.Md2BlockDOM(kramdown),
        files: detail.files
      });
    });
    /** 块标菜单：手动设置或取消提问 / 回答样式。 */
    __publicField(this, "onBlockIconMenu", (event) => {
      const ids = event.detail.blockElements.map((element) => element.getAttribute("data-node-id") || "").filter(Boolean);
      if (ids.length === 0) {
        return;
      }
      const setRole = (role) => ids.forEach((id) => (0, import_siyuan4.fetchPost)("/api/attr/setBlockAttrs", {
        id,
        attrs: role ? { "custom-chat-role": role } : { "custom-chat-role": "", "custom-chat-source": "" }
      }));
      const submenu = [
        { icon: "iconAcnChat", label: this.t.setUser, click: () => setRole("user") },
        { icon: "iconAcnChat", label: this.t.setAssistant, click: () => setRole("assistant") },
        { icon: "iconAcnChat", label: this.t.setThinking, click: () => setRole("thinking") },
        { type: "separator" },
        { icon: "iconClose", label: this.t.clearRole, click: () => setRole("") }
      ];
      event.detail.menu.addItem({ icon: "iconAcnChat", label: this.t.chatStyle, type: "submenu", submenu });
    });
  }
  get t() {
    return this.i18n;
  }
  async onload() {
    const saved = await this.loadData(STORAGE_NAME).catch(() => null);
    this.settings = {
      localMode: true,
      autoDetectPaste: true,
      notebookName: this.t.defaultNotebookName,
      includeThinking: false,
      ...saved && typeof saved === "object" ? saved : {}
    };
    this.addIcons(ICONS);
    this.addTopBar({
      id: "import",
      icon: "iconAcnChat",
      title: this.t.importChats,
      position: "right",
      callback: () => this.openImport()
    });
    this.addCommand({ langKey: "importChats", hotkey: "", callback: () => this.openImport() });
    this.addCommand({ langKey: "pasteAsChat", hotkey: "", callback: () => this.pasteAsChat() });
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
  get fileToMarkdown() {
    this.fileLute = this.fileLute || createLute();
    return (html) => this.fileLute.HTML2Md(html);
  }
  openImport() {
    openImportDialog({
      app: this.app,
      i18n: this.t,
      toMarkdown: this.fileToMarkdown,
      notebookName: this.settings.notebookName || this.t.defaultNotebookName,
      includeThinking: this.settings.includeThinking,
      knownIds: this.importedIds
    });
  }
  /** 命令「以对话格式粘贴」：读取剪贴板，没有说话人标记时整段作为回答插入。 */
  async pasteAsChat() {
    const editor = (0, import_siyuan4.getActiveEditor)(false);
    if (!editor) {
      (0, import_siyuan4.showMessage)(this.t.noEditor);
      return;
    }
    const clipboard = await readClipboard();
    if (!clipboard) {
      (0, import_siyuan4.showMessage)(this.t.clipboardDenied, 6e3, "error");
      return;
    }
    const lute = editor.protyle.lute || createLute();
    const toMarkdown = (html) => lute.HTML2Md(html);
    const detected = detectPastedConversation(clipboard.html, clipboard.text, toMarkdown);
    const markdown = clipboard.html ? toMarkdown(clipboard.html) : clipboard.text;
    const conversation = detected || (markdown.trim() ? { source: "generic", turns: [{ role: "assistant", markdown }] } : null);
    if (!conversation) {
      (0, import_siyuan4.showMessage)(this.t.clipboardEmpty);
      return;
    }
    const kramdown = turnsToKramdown(
      conversation.turns,
      conversation.source,
      { includeThinking: this.settings.includeThinking }
    );
    editor.insert(lute.Md2BlockDOM(kramdown), true);
  }
  initSetting() {
    const switchElement = (checked) => {
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
    this.setting = new import_siyuan4.Setting({
      confirmCallback: () => {
        this.settings = {
          localMode: localModeInput.checked,
          autoDetectPaste: autoDetectInput.checked,
          includeThinking: thinkingInput.checked,
          notebookName: notebookInput.value.trim() || this.t.defaultNotebookName
        };
        this.saveData(STORAGE_NAME, this.settings);
        applyLocalMode(this.settings.localMode);
      }
    });
    this.setting.addItem({ title: this.t.localMode, description: this.t.localModeDesc, actionElement: localModeInput });
    this.setting.addItem({
      title: this.t.autoDetectPaste,
      description: this.t.autoDetectPasteDesc,
      actionElement: autoDetectInput
    });
    this.setting.addItem({
      title: this.t.defaultNotebook,
      description: this.t.defaultNotebookDesc,
      createActionElement: () => {
        notebookInput.value = this.settings.notebookName;
        return notebookInput;
      }
    });
    this.setting.addItem({ title: this.t.includeThinking, actionElement: thinkingInput });
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
        fetchWorkspaceDir().then((value) => {
          dir = value;
          wrap.querySelector("input").value = value;
        });
        wrap.querySelector("[data-type=copy]").addEventListener("click", async () => {
          await copyText(dir);
          (0, import_siyuan4.showMessage)(this.t.copied);
        });
        const openButton = wrap.querySelector("[data-type=open]");
        openButton.classList.toggle("fn__none", !window.require);
        openButton.addEventListener("click", () => openInFileManager(dir));
        return wrap;
      }
    });
  }
};
