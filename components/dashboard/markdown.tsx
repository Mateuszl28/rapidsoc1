"use client";

/**
 * Tiny, dependency-free markdown renderer.
 * Supports: headings (#-####), bold **x**, italic *x*, `code`, links [t](u),
 * unordered lists (-, *), ordered lists (1.), horizontal rules (---),
 * blank-line paragraphs. Intentionally limited — fast and safe.
 */
import React from "react";

function renderInline(text: string, key = 0): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  // protect code spans first
  const parts = text.split(/(`[^`]+`)/g);
  parts.forEach((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(<code key={`c-${key}-${i}`}>{part.slice(1, -1)}</code>);
      return;
    }
    // bold
    let html = part
      .replace(/\*\*([^*]+)\*\*/g, "§B§$1§/B§")
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1§I§$2§/I§")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '§A§$2§|§$1§/A§'
      );
    const tokens = html.split(/(§[A-Z]§|§\/[A-Z]§|§\|§)/g);
    let mode: "B" | "I" | "A" | null = null;
    let buf = "";
    let linkHref = "";
    tokens.forEach((tok, j) => {
      if (tok === "§B§") { mode = "B"; buf = ""; return; }
      if (tok === "§/B§") { nodes.push(<strong key={`b-${key}-${i}-${j}`}>{buf}</strong>); mode = null; return; }
      if (tok === "§I§") { mode = "I"; buf = ""; return; }
      if (tok === "§/I§") { nodes.push(<em key={`i-${key}-${i}-${j}`}>{buf}</em>); mode = null; return; }
      if (tok === "§A§") { mode = "A"; buf = ""; linkHref = ""; return; }
      if (tok === "§|§") { linkHref = buf; buf = ""; return; }
      if (tok === "§/A§") {
        nodes.push(
          <a key={`a-${key}-${i}-${j}`} href={linkHref} target="_blank" rel="noreferrer">
            {buf}
          </a>
        );
        mode = null; return;
      }
      if (mode) { buf += tok; return; }
      if (tok) nodes.push(tok);
    });
  });
  return <>{nodes}</>;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const out: React.ReactNode[] = [];
  let ul: string[] | null = null;
  let ol: string[] | null = null;

  const flushUl = (key: number) => {
    if (!ul) return;
    out.push(
      <ul key={`ul-${key}`}>
        {ul.map((li, i) => (
          <li key={i}>{renderInline(li, i)}</li>
        ))}
      </ul>
    );
    ul = null;
  };
  const flushOl = (key: number) => {
    if (!ol) return;
    out.push(
      <ol key={`ol-${key}`}>
        {ol.map((li, i) => (
          <li key={i}>{renderInline(li, i)}</li>
        ))}
      </ol>
    );
    ol = null;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushUl(idx);
      flushOl(idx);
      return;
    }
    if (/^---+$/.test(line)) {
      flushUl(idx);
      flushOl(idx);
      out.push(<hr key={`hr-${idx}`} />);
      return;
    }
    let m = line.match(/^(#{1,4})\s+(.*)$/);
    if (m) {
      flushUl(idx);
      flushOl(idx);
      const level = m[1].length;
      const text = m[2];
      const Tag = `h${Math.min(level, 4)}` as "h1" | "h2" | "h3" | "h4";
      out.push(<Tag key={`h-${idx}`}>{renderInline(text, idx)}</Tag>);
      return;
    }
    m = line.match(/^\s*[-*]\s+(.*)$/);
    if (m) {
      flushOl(idx);
      ul ??= [];
      ul.push(m[1]);
      return;
    }
    m = line.match(/^\s*\d+\.\s+(.*)$/);
    if (m) {
      flushUl(idx);
      ol ??= [];
      ol.push(m[1]);
      return;
    }
    flushUl(idx);
    flushOl(idx);
    out.push(<p key={`p-${idx}`}>{renderInline(line, idx)}</p>);
  });
  flushUl(9999);
  flushOl(9999);

  return <div className="prose-soc">{out}</div>;
}
