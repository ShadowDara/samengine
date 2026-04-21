// Generate the HTML File

export interface buildconfig {
    htmlhead: string;
    title: string;
    version: string;
    show_fullscreen_button: boolean;
    entryname: string;
    outdir: string;
    markdown_notes: Paragraph[];
    gameauthor: string;
}

export interface Paragraph {
    title: string;
    content: string;
    style?: Style;
}

export interface Style {
    color: string;
    bg_color: string;
}

export function new_buildconfig(): buildconfig {
    return {
        title: "My new Game",
        version: "Your Game Version",
        show_fullscreen_button: true,
        entryname: "main",
        outdir: "dist",
        markdown_notes: [],
        gameauthor: "DEV",
        htmlhead: `<link rel="icon" href="data:image/svg+xml;base64,${btoa(svgfile)}">`,
    }
}

const svgfile = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bg {
      fill: #0f1115;
    }
    .shape {
      fill: none;
      stroke: #e6e6e6;
      stroke-width: 18;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .fill {
      fill: #e6e6e6;
    }
  </style>

  <!-- Background -->
  <rect width="512" height="512" class="bg"/>

  <!-- Outer hexagon (tech / engine frame) -->
  <path class="shape"
    d="M256 80 L390 160 L390 352 L256 432 L122 352 L122 160 Z" />

  <!-- Inner rotated square (system core) -->
  <rect x="176" y="176" width="160" height="160"
        class="shape" transform="rotate(45 256 256)" />

  <!-- Core node -->
  <circle cx="256" cy="256" r="18" class="fill"/>

  <!-- Connection points -->
  <circle cx="256" cy="110" r="10" class="fill"/>
  <circle cx="256" cy="402" r="10" class="fill"/>
  <circle cx="110" cy="256" r="10" class="fill"/>
  <circle cx="402" cy="256" r="10" class="fill"/>
</svg>`;
