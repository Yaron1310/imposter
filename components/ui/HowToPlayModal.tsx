'use client';

import { useState } from 'react';

type LangCode = 'en' | 'he' | 'es' | 'ru' | 'ar';

interface Section { heading: string; body: string }
interface LangContent { title: string; rtl: boolean; intro: string; sections: Section[] }

const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'he', label: '🇮🇱 עברית' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'ru', label: '🇷🇺 Русский' },
  { code: 'ar', label: '🇸🇦 العربية' },
];

const CONTENT: Record<LangCode, LangContent> = {
  en: {
    title: 'How to Play',
    rtl: false,
    intro: 'Each round, one player is secretly the Spy.',
    sections: [
      {
        heading: 'Classic',
        body: 'The spy has no word. Everyone else shares the same secret word. Players take turns giving a one-sentence clue. Then vote — who is the spy? Each correct vote earns +1 point.',
      },
      {
        heading: 'Super',
        body: 'The spy has a different word from the same category as everyone else. No one knows for sure if they are the spy. Everyone discusses, then votes. Each correct vote earns +1 point.',
      },
      {
        heading: 'Scoring',
        body: 'Points accumulate across rounds. There are no winners or losers per round — only scores.',
      },
    ],
  },
  he: {
    title: 'איך משחקים',
    rtl: true,
    intro: 'בכל סיבוב, שחקן אחד הוא בסתר הסייר.',
    sections: [
      {
        heading: 'קלאסי',
        body: 'לסייר אין מילה. לכל שאר השחקנים יש אותה מילה סודית. כל שחקן נותן רמז במשפט אחד. לאחר מכן מצביעים — מי הסייר? כל הצבעה נכונה מזכה ב־+1 נקודה.',
      },
      {
        heading: 'סופר',
        body: 'לסייר יש מילה שונה מאותה קטגוריה כמו כולם. אף אחד לא יודע בוודאות אם הוא הסייר. כולם מדברים ואז מצביעים. כל הצבעה נכונה מזכה ב־+1 נקודה.',
      },
      {
        heading: 'ניקוד',
        body: 'הנקודות מצטברות לאורך הסיבובים. אין מנצחים או מפסידים בכל סיבוב — רק ניקוד.',
      },
    ],
  },
  es: {
    title: 'Cómo jugar',
    rtl: false,
    intro: 'Cada ronda, un jugador es en secreto el Espía.',
    sections: [
      {
        heading: 'Clásico',
        body: 'El espía no tiene palabra. Los demás comparten la misma palabra secreta. Los jugadores dan pistas de una frase por turno. Luego votan — ¿quién es el espía? Cada voto correcto vale +1 punto.',
      },
      {
        heading: 'Super',
        body: 'El espía tiene una palabra diferente de la misma categoría. Nadie sabe con certeza si es el espía. Todos discuten y luego votan. Cada voto correcto vale +1 punto.',
      },
      {
        heading: 'Puntuación',
        body: 'Los puntos se acumulan entre rondas. No hay ganadores ni perdedores por ronda, solo puntuaciones.',
      },
    ],
  },
  ru: {
    title: 'Как играть',
    rtl: false,
    intro: 'В каждом раунде один игрок является тайным Шпионом.',
    sections: [
      {
        heading: 'Классика',
        body: 'У шпиона нет слова. Все остальные знают одно секретное слово. Игроки по очереди дают подсказки одним предложением. Затем голосуют — кто шпион? Каждый правильный голос даёт +1 очко.',
      },
      {
        heading: 'Супер',
        body: 'У шпиона другое слово из той же категории. Никто не знает наверняка, шпион ли он. Все обсуждают, затем голосуют. Каждый правильный голос даёт +1 очко.',
      },
      {
        heading: 'Очки',
        body: 'Очки накапливаются на протяжении раундов. Победителей и проигравших в каждом раунде нет — только счёт.',
      },
    ],
  },
  ar: {
    title: 'كيف تلعب',
    rtl: true,
    intro: 'في كل جولة، يكون أحد اللاعبين سراً هو الجاسوس.',
    sections: [
      {
        heading: 'كلاسيكي',
        body: 'الجاسوس لا يعرف الكلمة السرية. بقية اللاعبين يعرفون نفس الكلمة. يتناوب اللاعبون على إعطاء تلميح بجملة واحدة. ثم يصوتون — من هو الجاسوس؟ كل تصويت صحيح يمنح +1 نقطة.',
      },
      {
        heading: 'سوبر',
        body: 'الجاسوس لديه كلمة مختلفة من نفس الفئة. لا أحد يعرف على وجه اليقين إذا كان هو الجاسوس. الجميع يتناقشون ثم يصوتون. كل تصويت صحيح يمنح +1 نقطة.',
      },
      {
        heading: 'النقاط',
        body: 'تتراكم النقاط عبر الجولات. لا يوجد فائز أو خاسر في كل جولة — فقط النقاط.',
      },
    ],
  },
};

interface HowToPlayModalProps {
  onClose: () => void;
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  const [lang, setLang] = useState<LangCode>('en');
  const content = CONTENT[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md bg-card border border-border rounded-[14px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-heading text-xl text-text">{content.title}</h2>
          <div className="flex items-center gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              className="bg-surface border border-border text-text font-body text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-accent cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <button
              onClick={onClose}
              className="text-muted hover:text-text transition-colors text-xl leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto"
          dir={content.rtl ? 'rtl' : 'ltr'}
        >
          <p className="text-muted font-body text-sm">{content.intro}</p>
          {content.sections.map((s) => (
            <div key={s.heading} className="space-y-1">
              <p className="font-heading text-sm text-accent tracking-wide">{s.heading}</p>
              <p className="text-text font-body text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
