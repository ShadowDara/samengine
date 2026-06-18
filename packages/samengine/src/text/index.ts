import { type Rect } from "../types/index.js";

/**
 * For Text Input: Use canvasinput-ts
 */

function findLargestFittingChunk(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  let low = 0;
  let high = text.length;

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);

    if (ctx.measureText(text.slice(0, mid)).width <= maxWidth) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return text.slice(0, low);
}

/**
 * TextStyle interface
 * Text size is in PX
 */
export interface TextStyle {
  color: string;
  font: string;
  size: number;
}

/**
 * Rendert Text innerhalb eines Rechtecks mit automatischem Umbruch.
 * Lange Wörter werden ebenfalls umgebrochen.
 */
export function renderTextBox(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  text: string,
  style: TextStyle,
  padding: number = 4,
): void {
  ctx.fillStyle = style.color;
  ctx.font = `${style.size}px ${style.font}`;
  ctx.textBaseline = "top";

  const maxWidth = rect.width - padding * 2;
  const lineHeight = style.size * 1.2;

  let y = rect.y + padding;

  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    let line = "";

    const words = paragraph.split(" ");

    for (let word of words) {
      // Wenn bereits Text in der Zeile steht und das nächste Wort
      // alleine schon zu breit ist, zuerst die aktuelle Zeile ausgeben.
      if (line.length > 0 && ctx.measureText(word).width > maxWidth) {
        if (y + lineHeight > rect.y + rect.height) {
          return;
        }

        ctx.fillText(line, rect.x + padding, y);
        y += lineHeight;
        line = "";
      }

      while (ctx.measureText(word).width > maxWidth) {
        const chunk = findLargestFittingChunk(ctx, word, maxWidth);

        if (chunk.length === 0) {
          break;
        }

        if (y + lineHeight > rect.y + rect.height) {
          return;
        }

        ctx.fillText(chunk, rect.x + padding, y);

        y += lineHeight;
        word = word.substring(chunk.length);
      }

      const testLine = line.length > 0 ? `${line} ${word}` : word;

      if (ctx.measureText(testLine).width > maxWidth) {
        if (y + lineHeight > rect.y + rect.height) {
          return;
        }

        ctx.fillText(line, rect.x + padding, y);

        y += lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line.length > 0) {
      if (y + lineHeight > rect.y + rect.height) {
        return;
      }

      ctx.fillText(line, rect.x + padding, y);

      y += lineHeight;
    }
  }
}
