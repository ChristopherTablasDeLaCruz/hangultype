"use client";

type Props = {
  /** key currently flashing */
  activeKeys: string[];
  /** Suggested next key to press */
  guideKeys?: string[];
  /** is shift pressed */
  shiftActive: boolean;
};

/** Hangul rows */
const rows: string[][] = [
  ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"],
  ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"],
  ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"],
];

/** english key */
const hangulToQwerty: Record<string, string> = {
  "ㅂ": "Q", "ㅈ": "W", "ㄷ": "E", "ㄱ": "R", "ㅅ": "T",
  "ㅛ": "Y", "ㅕ": "U", "ㅑ": "I", "ㅐ": "O", "ㅔ": "P",
  "ㅁ": "A", "ㄴ": "S", "ㅇ": "D", "ㄹ": "F", "ㅎ": "G",
  "ㅗ": "H", "ㅓ": "J", "ㅏ": "K", "ㅣ": "L",
  "ㅋ": "Z", "ㅌ": "X", "ㅊ": "C", "ㅍ": "V",
  "ㅠ": "B", "ㅜ": "N", "ㅡ": "M",
};

/** Display substitutions when Shift is down */
const shiftMap: Record<string, string> = {
  "ㅂ": "ㅃ",
  "ㅈ": "ㅉ",
  "ㄷ": "ㄸ",
  "ㄱ": "ㄲ",
  "ㅅ": "ㅆ",
  "ㅐ": "ㅒ",
  "ㅔ": "ㅖ",
};

export default function KoreanKeyboard({
  activeKeys,
  guideKeys = [],
  shiftActive,
}: Props) {
  const isActive = (k: string) => activeKeys.includes(k);
  const isGuide = (k: string) => guideKeys.includes(k);

  const spaceActive = isActive(" ");
  const spaceGuide = isGuide(" ");

  return (
    <div className="inline-block p-4 rounded-lg bg-gray-200">
      {/* Row 1 */}
      <div className="flex justify-center gap-2 mb-2">
        {rows[0].map((k) => (
          <Key
            key={k}
            active={isActive(k)}
            guide={isGuide(k)}
            label={shiftActive && shiftMap[k] ? shiftMap[k] : k}
            hw={hangulToQwerty[k]}
          />
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-2 mb-2">
        {rows[1].map((k) => (
          <Key
            key={k}
            active={isActive(k)}
            guide={isGuide(k)}
            label={shiftActive && shiftMap[k] ? shiftMap[k] : k}
            hw={hangulToQwerty[k]}
          />
        ))}
      </div>

      {/* Row 3 with Left/Right Shift */}
      <div className="flex justify-center items-center gap-2 mb-2">
        <WideKey label="Shift" active={shiftActive} />
        {rows[2].map((k) => (
          <Key
            key={k}
            active={isActive(k)}
            guide={isGuide(k)}
            label={shiftActive && shiftMap[k] ? shiftMap[k] : k}
            hw={hangulToQwerty[k]}
          />
        ))}
        <WideKey label="Shift" active={shiftActive} />
      </div>

      {/* Bottom row: centered Space */}
      <div className="flex items-center gap-2">
        <div className="flex-1" />
        <div
          className={[
            "h-10 w-52 border rounded shadow transition-colors",
            spaceActive ? "bg-blue-500" : "bg-white",
            spaceGuide && !spaceActive ? "ring-2 ring-amber-400" : "",
          ].join(" ")}
          aria-label="Space"
          title="Space"
        />
        <div className="flex-1" />
      </div>
    </div>
  );
}

function Key({
  active,
  guide,
  label,
  hw,
}: {
  active: boolean;
  guide: boolean;
  label: string;
  hw?: string;
}) {
  const base =
    "w-10 h-12 flex flex-col items-center justify-center border rounded shadow transition-colors";
  const state = active ? "bg-blue-500 text-white" : "bg-white text-black";
  const guideRing = guide && !active ? "ring-2 ring-amber-400" : "";

  return (
    <div className={`${base} ${state} ${guideRing}`}>
      <span className="text-lg font-bold leading-none">{label}</span>
      {hw && (
        <span
          className={`text-[10px] leading-none mt-1 ${
            active ? "text-white/80" : "text-gray-500"
          }`}
        >
          {hw}
        </span>
      )}
    </div>
  );
}

function WideKey({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`w-20 h-10 flex items-center justify-center border rounded shadow text-sm font-bold transition-colors ${
        active ? "bg-blue-500 text-white" : "bg-white"
      }`}
    >
      {label}
    </div>
  );
}