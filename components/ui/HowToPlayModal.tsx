'use client';

import { useState } from 'react';

type LangCode = 'en' | 'he' | 'es' | 'ru' | 'ar';

interface Step { heading: string; body: string }
interface LangContent { title: string; rtl: boolean; goalHeading: string; goal: string; roundHeading: string; steps: Step[]; rotation: string }

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
    goalHeading: 'Goal',
    goal: 'Find the spy and earn points. Each player who correctly votes for the spy gets +1 point. Points accumulate over all rounds – the winner is the player with the most points.',
    roundHeading: 'Each round',
    steps: [
      { heading: '1. Get your word', body: 'Each player privately looks at their word on their own screen – don\'t show anyone. All players get the same word, except one player (the Spy) who gets a different word from the same category. Nobody is told whether they are the spy. You only see your word.' },
      { heading: '2. First speaking round', body: 'In the order shown on screen, each player says 1–2 short associative words connected to their word. Don\'t be too obvious – but don\'t be too vague.' },
      { heading: '3. Second speaking round', body: 'Go around again. Use this round to pick up on anything that sounded off.' },
      { heading: '4. Vote', body: 'Everyone votes – including the spy – for who they think has the different word. You can vote for yourself if you suspect you are the spy.' },
      { heading: '5. Result', body: 'The spy is revealed along with both words. Everyone who voted for the spy earns +1 point.' },
    ],
    rotation: 'A new spy is chosen each round – never the same person two rounds in a row.',
  },
  he: {
    title: 'איך משחקים',
    rtl: true,
    goalHeading: 'מטרה',
    goal: 'מצאו את המרגל וצברו נקודות. כל שחקן שמצביע נכון על המרגל מקבל +1 נקודה. הנקודות מצטברות לאורך כל הסיבובים – המנצח הוא השחקן עם הכי הרבה נקודות.',
    roundHeading: 'כל סיבוב',
    steps: [
      { heading: '1. קבלו את המילה שלכם', body: 'כל שחקן מסתכל בנפרד על המילה שלו במסך שלו – אל תראו לאף אחד. לכל השחקנים יש אותה מילה, חוץ משחקן אחד (המרגל) שמקבל מילה שונה מאותה קטגוריה. אף אחד לא אומר לכם אם אתם המרגל – אתם רואים רק את המילה שלכם.' },
      { heading: '2. סיבוב דיבור ראשון', body: 'לפי הסדר המוצג על המסך, כל שחקן אומר 1–2 מילות אסוציאציה קצרות הקשורות למילה שלו. אל תהיו ברורים מדי – אבל גם לא מעורפלים מדי.' },
      { heading: '3. סיבוב דיבור שני', body: 'עוברים שוב. השתמשו בסיבוב הזה כדי לזהות מי נשמע לא במקום.' },
      { heading: '4. הצבעה', body: 'כולם מצביעים – כולל המרגל – על מי שלדעתם קיבל מילה שונה. אפשר להצביע על עצמכם אם אתם חושדים שאתם המרגל.' },
      { heading: '5. תוצאה', body: 'המרגל נחשף יחד עם שתי המילים. כל מי שהצביע על המרגל מקבל +1 נקודה.' },
    ],
    rotation: 'בכל סיבוב נבחר מרגל חדש – אף פעם לא אותו אדם שני סיבובים ברצף.',
  },
  es: {
    title: 'Cómo jugar',
    rtl: false,
    goalHeading: 'Objetivo',
    goal: 'Encuentra al espía y gana puntos. Cada jugador que vote correctamente por el espía obtiene +1 punto. Los puntos se acumulan a lo largo de todas las rondas – el ganador es el jugador con más puntos.',
    roundHeading: 'Cada ronda',
    steps: [
      { heading: '1. Recibe tu palabra', body: 'Cada jugador mira su palabra en su propia pantalla de forma privada – no la muestres. Todos los jugadores tienen la misma palabra, excepto uno (el Espía), que recibe una palabra diferente de la misma categoría. Nadie te dice si eres el espía. Solo ves tu palabra.' },
      { heading: '2. Primera ronda de hablar', body: 'En el orden que aparece en pantalla, cada jugador dice 1–2 palabras asociativas cortas relacionadas con su palabra. No seas demasiado obvio – pero tampoco demasiado vago.' },
      { heading: '3. Segunda ronda de hablar', body: 'Vuelve a dar la vuelta. Usa esta ronda para identificar a quien suene fuera de lugar.' },
      { heading: '4. Vota', body: 'Todos votan – incluido el espía – por quien creen que tiene la palabra diferente. Puedes votarte a ti mismo si sospechas que eres el espía.' },
      { heading: '5. Resultado', body: 'Se revela al espía junto con ambas palabras. Cada jugador que votó por el espía gana +1 punto.' },
    ],
    rotation: 'Se elige un nuevo espía cada ronda – nunca la misma persona dos rondas seguidas.',
  },
  ru: {
    title: 'Как играть',
    rtl: false,
    goalHeading: 'Цель',
    goal: 'Найдите шпиона и зарабатывайте очки. Каждый игрок, правильно проголосовавший за шпиона, получает +1 очко. Очки накапливаются на протяжении всех раундов – победитель тот, у кого больше всего очков.',
    roundHeading: 'Каждый раунд',
    steps: [
      { heading: '1. Получите своё слово', body: 'Каждый игрок смотрит на своё слово на своём экране – никому не показывайте. У всех игроков одинаковое слово, кроме одного (Шпиона), который получает другое слово из той же категории. Никто не говорит вам, шпион вы или нет. Вы видите только своё слово.' },
      { heading: '2. Первый круг высказываний', body: 'В порядке, показанном на экране, каждый игрок произносит 1–2 коротких ассоциативных слова, связанных с его словом. Не будьте слишком очевидны – но и не слишком расплывчаты.' },
      { heading: '3. Второй круг высказываний', body: 'Проходим ещё раз. Используйте этот круг, чтобы выявить того, кто звучит не на месте.' },
      { heading: '4. Голосование', body: 'Все голосуют – включая шпиона – за того, у кого, по их мнению, другое слово. Вы можете проголосовать за себя, если подозреваете, что вы шпион.' },
      { heading: '5. Результат', body: 'Шпион раскрывается вместе с обоими словами. Каждый, кто проголосовал за шпиона, получает +1 очко.' },
    ],
    rotation: 'В каждом раунде выбирается новый шпион – никогда не один и тот же человек два раунда подряд.',
  },
  ar: {
    title: 'كيف تلعب',
    rtl: true,
    goalHeading: 'الهدف',
    goal: 'اكتشف الجاسوس واجمع النقاط. كل لاعب يصوّت بشكل صحيح للجاسوس يحصل على +1 نقطة. تتراكم النقاط على مدار جميع الجولات – الفائز هو اللاعب الذي يحصل على أكبر عدد من النقاط.',
    roundHeading: 'كل جولة',
    steps: [
      { heading: '1. احصل على كلمتك', body: 'يرى كل لاعب كلمته على شاشته الخاصة – لا تُريها لأحد. جميع اللاعبين لديهم نفس الكلمة، إلا لاعب واحد (الجاسوس) الذي يحصل على كلمة مختلفة من نفس الفئة. لا أحد يخبرك إذا كنت الجاسوس. أنت ترى كلمتك فقط.' },
      { heading: '2. جولة التحدث الأولى', body: 'بالترتيب الظاهر على الشاشة، يقول كل لاعب 1–2 كلمة ترابطية قصيرة مرتبطة بكلمته. لا تكن واضحاً جداً – ولا غامضاً جداً.' },
      { heading: '3. جولة التحدث الثانية', body: 'مرّوا مجدداً. استخدم هذه الجولة لتحديد من يبدو صوته غير متناسب.' },
      { heading: '4. التصويت', body: 'يصوّت الجميع – بما في ذلك الجاسوس – لمن يعتقدون أن لديه الكلمة المختلفة. يمكنك التصويت لنفسك إذا كنت تشك في أنك الجاسوس.' },
      { heading: '5. النتيجة', body: 'يُكشف الجاسوس مع الكلمتين. كل من صوّت للجاسوس يحصل على +1 نقطة.' },
    ],
    rotation: 'يُختار جاسوس جديد في كل جولة – لا يكون الشخص نفسه جاسوساً في جولتين متتاليتين.',
  },
};

interface HowToPlayModalProps {
  onClose: () => void;
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  const [lang, setLang] = useState<LangCode>('en');
  const c = CONTENT[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md bg-card border border-border rounded-[14px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-heading text-xl text-text">{c.title}</h2>
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
            <button onClick={onClose} className="text-muted hover:text-text transition-colors text-xl leading-none" aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto" dir={c.rtl ? 'rtl' : 'ltr'}>

          {/* Goal */}
          <div className="space-y-1">
            <p className="font-heading text-sm text-accent tracking-wide">{c.goalHeading}</p>
            <p className="text-text font-body text-sm leading-relaxed">{c.goal}</p>
          </div>

          {/* Steps */}
          <div className="space-y-1">
            <p className="font-heading text-sm text-accent tracking-wide">{c.roundHeading}</p>
          </div>
          <div className="space-y-4">
            {c.steps.map((step) => (
              <div key={step.heading} className="space-y-0.5">
                <p className="font-body text-sm font-semibold text-text">{step.heading}</p>
                <p className="text-muted font-body text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          {/* Rotation note */}
          <p className="text-muted font-body text-sm leading-relaxed border-t border-border pt-4">{c.rotation}</p>
        </div>
      </div>
    </div>
  );
}
