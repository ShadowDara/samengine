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
 * return type for the rendertext function
 */
export interface RenderTextResult {
  renderedChars: number;
  consumedChars: number;
  hasOverflow: boolean;
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
): RenderTextResult {
  ctx.fillStyle = style.color;
  ctx.font = `${style.size}px ${style.font}`;
  ctx.textBaseline = "top";

  let renderedChars = 0;
  let consumedChars = 0;

  const maxWidth = rect.width - padding * 2;
  const lineHeight = style.size * 1.2;

  let y = rect.y + padding;

  const paragraphs = text.split("\n");

  for (let p = 0; p < paragraphs.length; p++) {
    const paragraph = paragraphs[p];

    let line = "";

    const words = paragraph.split(" ");

    for (let w = 0; w < words.length; w++) {
      const originalWord = words[w];
      let word = originalWord;

      if (line.length > 0 && ctx.measureText(word).width > maxWidth) {
        if (y + lineHeight > rect.y + rect.height) {
          return {
            renderedChars,
            consumedChars,
            hasOverflow: true,
          };
        }

        ctx.fillText(line, rect.x + padding, y);
        renderedChars += line.length;

        y += lineHeight;
        line = "";
      }

      while (ctx.measureText(word).width > maxWidth) {
        const chunk = findLargestFittingChunk(ctx, word, maxWidth);

        if (chunk.length === 0) {
          break;
        }

        if (y + lineHeight > rect.y + rect.height) {
          return {
            renderedChars,
            consumedChars,
            hasOverflow: true,
          };
        }

        ctx.fillText(chunk, rect.x + padding, y);

        renderedChars += chunk.length;
        consumedChars += chunk.length;

        y += lineHeight;
        word = word.substring(chunk.length);
      }

      const testLine = line.length > 0 ? `${line} ${word}` : word;

      if (ctx.measureText(testLine).width > maxWidth) {
        if (y + lineHeight > rect.y + rect.height) {
          return {
            renderedChars,
            consumedChars,
            hasOverflow: true,
          };
        }

        ctx.fillText(line, rect.x + padding, y);
        renderedChars += line.length;

        y += lineHeight;
        line = word;
      } else {
        line = testLine;
      }

      consumedChars += word.length;

      // Leerzeichen im Originaltext mitzählen
      if (w < words.length - 1) {
        consumedChars += 1;
      }
    }

    if (line.length > 0) {
      if (y + lineHeight > rect.y + rect.height) {
        return {
          renderedChars,
          consumedChars,
          hasOverflow: true,
        };
      }

      ctx.fillText(line, rect.x + padding, y);
      renderedChars += line.length;

      y += lineHeight;
    }

    // Newline im Originaltext mitzählen
    if (p < paragraphs.length - 1) {
      consumedChars += 1;
    }
  }

  return {
    renderedChars,
    consumedChars,
    hasOverflow: false,
  };
}
