/**
 * 正文字数统计。
 *
 * 从原 `lib/content/posts.ts` 抽出为独立模块：它不依赖内容集合，是纯函数，
 * 因此可以在 node 环境的 vitest 里直接单测（见 tests/word-count.test.ts）。
 */

/**
 * 统计正文字数：CJK 逐字计，拉丁字母与数字按词计。
 *
 * 不能再用 `split(/\s+/)` —— 中文正文没有空格，整段只会算成 1。这里先剔掉
 * 围栏代码块、行内代码与 Markdown 标记，避免把语法算进字数，再分别累加
 * CJK 字符数与拉丁词数。
 */
export function countWords(markdown: string) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, " ")
    .replace(/^\s{0,3}>\s?/gm, " ")
    // MDX 文件里的 import/export 与 JSX 标签不计入字数
    .replace(/^\s*(?:import|export)\s.+$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_~]/g, " ");
  const cjk = text.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  const latin = text.replace(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g, " ").match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return cjk + latin;
}
