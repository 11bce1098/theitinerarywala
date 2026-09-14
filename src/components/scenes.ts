/**
 * Per-country cover scenes — flat travel-poster illustrations of the
 * landmark each destination is actually known for.
 *
 * Drawn at a 400x250 viewBox. Fills are flat on purpose: no gradients or
 * ids inside a scene body, so the same scene can appear twice on one page
 * without colliding. The sky gradient and sun live in CoverArt.astro, which
 * owns the only unique ids.
 *
 * `--depth` on a layer drives the hover parallax (higher = further back).
 */
export interface Scene {
  /** Recognisable subject, used for the accessible description. */
  subject: string;
  skyTop: string;
  skyBottom: string;
  sun: { x: number; y: number; r: number; fill: string };
  body: string;
}

const GEORGIA: Scene = {
  subject: 'Gergeti Trinity Church below Mount Kazbek',
  skyTop: '#c7dbec',
  skyBottom: '#f7e1c4',
  sun: { x: 330, y: 56, r: 20, fill: '#e39a2d' },
  body: `
    <!-- Mount Kazbek, snow-capped -->
    <polygon class="cover-ridge" style="--depth:4" fill="#93a8ba"
      points="140,250 272,44 400,250" />
    <polygon class="cover-ridge" style="--depth:4" fill="#f2f4f6"
      points="272,44 316,112 300,103 286,119 272,105 257,121 243,109 228,114" />
    <!-- lesser peak to the left -->
    <polygon class="cover-ridge" style="--depth:3" fill="#adbecb"
      points="0,250 96,96 196,250" />
    <polygon class="cover-ridge" style="--depth:3" fill="#eef1f4"
      points="96,96 124,142 113,134 103,146 93,135 82,147 71,138" />
    <!-- wooded mid ridge -->
    <path class="cover-ridge" style="--depth:2" fill="#6d8a7c"
      d="M0,170 L56,154 L112,168 L168,150 L226,166 L286,152 L344,168 L400,156 L400,250 L0,250 Z" />
    <g class="cover-ridge" style="--depth:2" fill="#5b7a6c">
      <polygon points="30,168 36,152 42,168" />
      <polygon points="196,160 202,143 208,160" />
      <polygon points="322,166 328,150 334,166" />
    </g>
    <!-- foreground knoll the church stands on -->
    <path class="cover-ridge" style="--depth:1" fill="#456049"
      d="M0,216 L40,210 L70,200 L120,196 L170,199 L230,208 L300,203 L400,212 L400,250 L0,250 Z" />
    <!-- Gergeti Trinity: bell tower, nave, drum and conical roof -->
    <g fill="#ede7d9">
      <rect x="72" y="160" width="18" height="38" />
      <polygon points="68,161 81,136 94,161" />
      <rect x="96" y="168" width="52" height="30" />
      <rect x="148" y="178" width="14" height="20" />
      <rect x="112" y="140" width="20" height="30" />
      <polygon points="107,141 122,107 137,141" />
    </g>
    <g fill="#8f9a86">
      <rect x="116" y="150" width="5" height="11" />
      <rect x="124" y="150" width="5" height="11" />
      <rect x="107" y="178" width="7" height="13" />
      <rect x="130" y="178" width="7" height="13" />
    </g>
    <path stroke="#ede7d9" stroke-width="2.5" fill="none"
      d="M122,107 V95 M116,100 H128 M81,136 V127 M76,131 H86" />
  `,
};

const ARMENIA: Scene = {
  subject: 'Khor Virap monastery below Mount Ararat',
  skyTop: '#e7dcce',
  skyBottom: '#f8d9ab',
  sun: { x: 72, y: 56, r: 19, fill: '#e3b02d' },
  body: `
    <!-- Greater Ararat -->
    <polygon class="cover-ridge" style="--depth:4" fill="#9c92a6"
      points="-20,250 178,36 360,250" />
    <polygon class="cover-ridge" style="--depth:4" fill="#f4f1f4"
      points="178,36 228,116 210,106 194,124 178,108 161,126 145,112 128,118" />
    <!-- Lesser Ararat (Sis) -->
    <polygon class="cover-ridge" style="--depth:3" fill="#ac9fad"
      points="316,250 380,128 440,250" />
    <polygon class="cover-ridge" style="--depth:3" fill="#eeeaee"
      points="380,128 402,166 392,159 382,170 372,160 362,168" />
    <!-- sunlit plain -->
    <path class="cover-ridge" style="--depth:2" fill="#b09872"
      d="M0,182 L64,174 L128,184 L192,172 L256,182 L320,172 L400,182 L400,250 L0,250 Z" />
    <!-- vineyards -->
    <path class="cover-ridge" style="--depth:1" fill="#6d6f45"
      d="M0,218 L66,210 L132,216 L200,206 L262,200 L330,206 L400,216 L400,250 L0,250 Z" />
    <g fill="#5c5e38">
      <rect x="10" y="228" width="46" height="4" />
      <rect x="76" y="236" width="46" height="4" />
      <rect x="142" y="228" width="46" height="4" />
      <rect x="208" y="238" width="46" height="4" />
      <rect x="300" y="230" width="46" height="4" />
    </g>
    <!-- Khor Virap: walled monastery with drum and conical roof -->
    <g fill="#efe8d8">
      <rect x="248" y="192" width="100" height="20" />
      <rect x="278" y="166" width="38" height="28" />
      <rect x="290" y="138" width="16" height="30" />
      <polygon points="285,139 298,110 311,139" />
    </g>
    <g fill="#9a8f7d">
      <rect x="294" y="148" width="4" height="10" />
      <rect x="290" y="176" width="6" height="12" />
      <rect x="300" y="176" width="6" height="12" />
      <rect x="266" y="198" width="6" height="14" />
      <rect x="324" y="198" width="6" height="14" />
    </g>
    <path stroke="#efe8d8" stroke-width="2.5" fill="none"
      d="M298,110 V98 M292,103 H304" />
  `,
};

export const scenes: Record<string, Scene> = {
  georgia: GEORGIA,
  armenia: ARMENIA,
};

export function sceneFor(country: string | undefined): Scene | undefined {
  return country ? scenes[country.trim().toLowerCase()] : undefined;
}
