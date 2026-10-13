---
title: "把静态搜索放进一个小站"
date: "2026-08-18"
description: "一篇拟真的技术文章，用来验证长标题、代码块与中文搜索内容。"
tags: ["Next.js", "搜索"]
featured: false
---

> 演示文章：以下内容用于测试站点结构，不是作者真实项目复盘。

## 从内容开始

静态站点的搜索可以在构建阶段生成索引，再由浏览器完成查询。这样不需要数据库，也不会增加服务器维护成本。

```js
const documents = posts.map(({ title, description, content }) => ({ title, description, content }));
```

## 中文检索

中文文章需要特别关注分词、命中片段和排序。真实示例应覆盖技术、产品和阅读等词语。
