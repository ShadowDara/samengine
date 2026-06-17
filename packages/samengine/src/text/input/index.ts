// Text Input Lib

export interface TextInputOptions {
    x: number;
    y: number;
    width: number;
    height: number;

    placeholder?: string;
    maxLength?: number;
    password?: boolean;
}

export class CanvasTextInput {
    public value = "";
    public focused = false;

    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;

    readonly placeholder: string;
    readonly maxLength: number;
    readonly password: boolean;

    private input: HTMLInputElement;

    private cursorVisible = true;
    private cursorBlink = 0;

    constructor(options: TextInputOptions) {
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;

        this.placeholder = options.placeholder ?? "";
        this.maxLength = options.maxLength ?? Infinity;
        this.password = options.password ?? false;

        this.input = document.createElement("input");

        this.input.type = this.password ? "password" : "text";

        this.input.style.position = "fixed";
        this.input.style.left = "-99999px";
        this.input.style.top = "-99999px";
        this.input.style.opacity = "0";
        this.input.style.pointerEvents = "none";

        document.body.appendChild(this.input);

        this.input.addEventListener("input", () => {
            let text = this.input.value;

            if (text.length > this.maxLength) {
                text = text.slice(0, this.maxLength);
                this.input.value = text;
            }

            this.value = text;
        });

        this.input.addEventListener("focus", () => {
            this.focused = true;
        });

        this.input.addEventListener("blur", () => {
            this.focused = false;
        });
    }

    destroy(): void {
        this.input.remove();
    }

    focus(): void {
        this.input.focus();
    }

    blur(): void {
        this.input.blur();
    }

    onMouseDown(mx: number, my: number): boolean {
        const inside =
            mx >= this.x &&
            mx <= this.x + this.width &&
            my >= this.y &&
            my <= this.y + this.height;

        if (inside) {
            this.focus();
        } else {
            this.blur();
        }

        return inside;
    }

    update(deltaMs: number): void {
        this.cursorBlink += deltaMs;

        if (this.cursorBlink >= 500) {
            this.cursorVisible = !this.cursorVisible;
            this.cursorBlink = 0;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        ctx.fillStyle = "#fff";
        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        ctx.strokeStyle =
            this.focused ? "#4a90e2" : "#888";

        ctx.strokeRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        ctx.font = "20px sans-serif";
        ctx.textBaseline = "middle";

        const drawText =
            this.password
                ? "•".repeat(this.value.length)
                : this.value;

        if (
            drawText.length === 0 &&
            !this.focused
        ) {
            ctx.fillStyle = "#999";

            ctx.fillText(
                this.placeholder,
                this.x + 8,
                this.y + this.height / 2
            );
        } else {
            ctx.fillStyle = "#000";

            ctx.fillText(
                drawText,
                this.x + 8,
                this.y + this.height / 2
            );
        }

        if (this.focused && this.cursorVisible) {
            const cursorPos =
                this.input.selectionStart ??
                drawText.length;

            const before =
                drawText.slice(0, cursorPos);

            const width =
                ctx.measureText(before).width;

            const cx = this.x + 8 + width;

            ctx.beginPath();

            ctx.moveTo(cx, this.y + 4);
            ctx.lineTo(
                cx,
                this.y + this.height - 4
            );

            ctx.stroke();
        }

        const start =
            this.input.selectionStart ?? 0;

        const end =
            this.input.selectionEnd ?? 0;

        if (start !== end) {
            const a = Math.min(start, end);
            const b = Math.max(start, end);

            const left =
                ctx.measureText(
                    drawText.slice(0, a)
                ).width;

            const selected =
                ctx.measureText(
                    drawText.slice(a, b)
                ).width;

            ctx.fillStyle =
                "rgba(0,120,215,0.3)";

            ctx.fillRect(
                this.x + 8 + left,
                this.y + 4,
                selected,
                this.height - 8
            );

            ctx.fillStyle = "#000";

            ctx.fillText(
                drawText,
                this.x + 8,
                this.y + this.height / 2
            );
        }

        ctx.restore();
    }
}
