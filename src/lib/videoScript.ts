import { makeRng, pick } from "./seed";
import type { Lang } from "./i18n";

export interface Scene {
  shot: string;
  onScreenText: string;
  voiceover: string;
}

export interface VideoScript {
  angle: string;
  length: string;
  hookText: string;
  hookVoiceover: string;
  scenes: Scene[];
  cta: string;
}

interface Angle {
  angle: string;
  hookText: ((p: string) => string)[];
  hookVoiceover: ((p: string) => string)[];
  scenes: ((p: string, benefit: string) => Scene[])[];
  cta: string[];
}

const ANGLES: Record<Lang, Angle[]> = {
  ru: [
    {
      angle: "UGC-распаковка",
      hookText: [(p) => `мне прислали ${p}...`, (p) => `не ожидала, что ${p} настолько...`],
      hookVoiceover: [(p) => `Так, у меня тут ${p}, и мне нужно вам показать.`, () => `Стоп, я должна показать вам эту штуку прямо сейчас.`],
      scenes: [
        (p, benefit) => [
          { shot: "Крупный план коробки/упаковки в руках", onScreenText: "распаковка", voiceover: `Открываю ${p} первый раз.` },
          { shot: "Товар крупным планом, поворот в руках", onScreenText: "вот это да", voiceover: `Смотрите какой — сразу видно, для чего он.` },
          { shot: "Демонстрация использования товара", onScreenText: benefit, voiceover: `Вот что реально решает: ${benefit}.` },
          { shot: "Реакция на камеру крупным планом", onScreenText: "теперь я поняла хайп", voiceover: "Теперь понятно, почему все о нём говорят." },
        ],
      ],
      cta: ["Ссылка в шапке профиля", "Смотри в шапке — разлетается быстро"],
    },
    {
      angle: "Проблема → решение",
      hookText: [() => `если у тебя тоже так — смотри`, () => `эта проблема бесила меня годами`],
      hookVoiceover: [() => `Если у тебя та же проблема — досмотри до конца.`, () => `Годами боролась с этим, пока не нашла решение.`],
      scenes: [
        (p, benefit) => [
          { shot: "Инсценировка проблемы «до»", onScreenText: "до:", voiceover: "Вот так было раньше — постоянно раздражало." },
          { shot: "Товар в кадре, вводится в сцену", onScreenText: p, voiceover: `Потом я нашла ${p}.` },
          { shot: "Использование товара, крупный план результата", onScreenText: "после:", voiceover: `Теперь ${benefit} — и это заняло секунды.` },
          { shot: "Сравнение «до/после» в одном кадре", onScreenText: "разница видна сразу", voiceover: "Разница на лицо, буквально." },
        ],
      ],
      cta: ["Забирай по ссылке в шапке", "Ссылка в описании, пока в наличии"],
    },
    {
      angle: "POV / день из жизни",
      hookText: [(p) => `POV: ты наконец купил(а) ${p}`, (p) => `когда ${p} меняет твоё утро`],
      hookVoiceover: [(p) => `POV: сегодня тот день, когда ты попробовал ${p}.`, (_p) => "Раньше моё утро выглядело совсем иначе."],
      scenes: [
        (p, benefit) => [
          { shot: "Обычная бытовая сцена (утро/рабочий стол/дорога)", onScreenText: "обычный день", voiceover: "Обычное утро, ничего особенного." },
          { shot: "Товар появляется в кадре естественно", onScreenText: p, voiceover: `Но теперь у меня есть ${p}.` },
          { shot: "Товар используется в реальном контексте", onScreenText: benefit, voiceover: `И это реально даёт ${benefit}.` },
          { shot: "Финальный крупный план товара + улыбка в камеру", onScreenText: "маленькая деталь, большая разница", voiceover: "Маленькая деталь, а ощущается по-другому." },
        ],
      ],
      cta: ["Ссылка в шапке — забирай, пока не закончилось", "Кликай в шапку профиля"],
    },
  ],
  en: [
    {
      angle: "UGC unboxing",
      hookText: [(p) => `they sent me the ${p}...`, (p) => `I did not expect the ${p} to be this...`],
      hookVoiceover: [(p) => `Okay so I have the ${p} here and I need to show you.`, () => `Wait, I have to show you this right now.`],
      scenes: [
        (p, benefit) => [
          { shot: "Close-up of box/packaging in hand", onScreenText: "unboxing", voiceover: `Opening the ${p} for the first time.` },
          { shot: "Close-up of product, turning it in hand", onScreenText: "okay wow", voiceover: "Look at this — you can tell what it's for right away." },
          { shot: "Demo of the product in use", onScreenText: benefit, voiceover: `This is what it actually solves: ${benefit}.` },
          { shot: "Close-up reaction to camera", onScreenText: "now I get the hype", voiceover: "Now I get why everyone's talking about it." },
        ],
      ],
      cta: ["Link in bio", "Check the link in bio — selling fast"],
    },
    {
      angle: "Problem → Solution",
      hookText: [() => `if this is also you, watch this`, () => `this problem annoyed me for years`],
      hookVoiceover: [() => `If you deal with the same thing, watch to the end.`, () => `I fought this for years before finding a fix.`],
      scenes: [
        (p, benefit) => [
          { shot: "Staged 'before' problem scene", onScreenText: "before:", voiceover: "This is how it used to be — constantly annoying." },
          { shot: "Product enters the frame", onScreenText: p, voiceover: `Then I found the ${p}.` },
          { shot: "Using the product, close-up on the result", onScreenText: "after:", voiceover: `Now ${benefit} — and it took seconds.` },
          { shot: "Before/after comparison in one shot", onScreenText: "the difference is obvious", voiceover: "You can see the difference immediately." },
        ],
      ],
      cta: ["Grab it — link in bio", "Link in bio, while it's in stock"],
    },
    {
      angle: "POV / day in the life",
      hookText: [(p) => `POV: you finally bought the ${p}`, (p) => `when the ${p} changes your morning`],
      hookVoiceover: [(p) => `POV: today's the day you tried the ${p}.`, () => "My mornings used to look completely different."],
      scenes: [
        (p, benefit) => [
          { shot: "Ordinary everyday scene (morning/desk/commute)", onScreenText: "just a normal day", voiceover: "Normal morning, nothing special." },
          { shot: "Product appears naturally in frame", onScreenText: p, voiceover: `But now I have the ${p}.` },
          { shot: "Product used in real context", onScreenText: benefit, voiceover: `And it actually delivers ${benefit}.` },
          { shot: "Final close-up of product + smile to camera", onScreenText: "small detail, big difference", voiceover: "Small detail, but it feels different." },
        ],
      ],
      cta: ["Link in bio — grab it before it's gone", "Tap the link in bio"],
    },
  ],
};

export function generateVideoScripts(productName: string, benefit: string, lang: Lang = "ru"): VideoScript[] {
  const rng = makeRng(`${productName}|${benefit}|video|${lang}`);
  return ANGLES[lang].map((a) => ({
    angle: a.angle,
    length: lang === "en" ? "15–30 sec" : "15–30 сек",
    hookText: pick(rng, a.hookText)(productName),
    hookVoiceover: pick(rng, a.hookVoiceover)(productName),
    scenes: pick(rng, a.scenes)(productName, benefit),
    cta: pick(rng, a.cta),
  }));
}
