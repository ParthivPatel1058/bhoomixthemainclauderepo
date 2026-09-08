import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, RotateCcw, TriangleAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import RobotImage from './RobotImage';
import { PriceBlock } from './RobotMeta';
import {
  FARM_SIZE_LABELS,
  FARM_TYPE_LABELS,
  MANUFACTURERS,
  USE_CASE_LABELS,
  findRobots,
  type FarmSize,
  type FarmType,
  type FinderAnswers,
  type UseCase,
} from '@/data/robotics';

const TASKS: UseCase[] = [
  'weeding',
  'spraying',
  'tilling',
  'seeding',
  'monitoring',
  'vegetation-management',
];

const FARMS: FarmType[] = ['field-crops', 'vegetables', 'orchard', 'solar-farm', 'other'];
const SIZES: FarmSize[] = ['small', 'medium', 'large'];

/**
 * One of the three questions.
 *
 * Module scope rather than a closure inside the component: a component
 * declared in a render body is a new type on every render, so React would tear
 * down and rebuild all three fieldsets each time an answer changed — losing
 * focus for anyone driving this from the keyboard.
 */
function Question<T extends string>({
  step,
  label,
  options,
  value,
  onPick,
}: {
  step: string;
  label: string;
  options: { key: T; label: string; detail?: string }[];
  value: T | null;
  onPick: (v: T | null) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 flex items-baseline gap-2.5">
        <span
          aria-hidden
          data-numeric
          className="text-[11px] font-semibold tracking-[0.1em] text-accent-ink"
        >
          {step}
        </span>
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(on ? null : o.key)}
              className={cn(
                'min-h-11 rounded-full border px-4 text-left text-[13px] font-medium transition-colors duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                on
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-secondary/50 hover:bg-muted/60',
              )}
            >
              {o.label}
              <span
                className={cn(
                  'ml-1.5 text-[11px]',
                  o.detail ? '' : 'hidden',
                  on ? 'opacity-80' : 'text-muted-foreground',
                )}
              >
                {o.detail}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Three questions, then the machines that match them.
 *
 * Deliberately not a wizard with a progress bar and a results page. All three
 * questions are on screen at once and the results update underneath as they
 * are answered, so a farmer can see immediately what changing "orchard" to
 * "vegetables" does — which is the actual thing worth learning here.
 *
 * Every suggestion carries its reasons. The ranking reads fields that are
 * genuinely in the catalogue and says which ones matched; there is no model
 * and no score shown, because presenting a number would imply a confidence
 * this has no basis for. The caveat under the results is not decoration
 * either: this is a shortlist to take to a manufacturer, not advice.
 */
export default function RobotFinder() {
  const { tx } = useLanguage();
  const [answers, setAnswers] = useState<FinderAnswers>({ task: null, farm: null, size: null });

  const asked = Boolean(answers.task || answers.farm || answers.size);
  const results = useMemo(() => (asked ? findRobots(answers) : []), [answers, asked]);

  const reset = () => setAnswers({ task: null, farm: null, size: null });

  return (
    <section aria-labelledby="finder-heading" className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="mb-3 flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-accent-ink" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-ink">
                {tx('Guided', 'मार्गदर्शन')}
              </span>
            </span>
            <h2
              id="finder-heading"
              className="text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl"
            >
              {tx('Which machine suits your farm?', 'आपके खेत के लिए कौन-सी मशीन?')}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {tx(
                'Answer what you can. The list below narrows as you go, and every suggestion says why it appeared.',
                'जितना बता सकें बताएँ। नीचे की सूची उसी हिसाब से छँटती जाएगी, और हर सुझाव बताएगा कि वह क्यों आया।',
              )}
            </p>
          </div>

          {asked && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-semibold text-foreground transition-colors hover:border-secondary/50 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RotateCcw aria-hidden className="h-3.5 w-3.5" />
              {tx('Start again', 'फिर से शुरू करें')}
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-3">
          <Question
            step="01"
            label={tx('What do you want help with?', 'किस काम में मदद चाहिए?')}
            value={answers.task}
            onPick={(task) => setAnswers((a) => ({ ...a, task }))}
            options={TASKS.map((t) => ({
              key: t,
              label: tx(USE_CASE_LABELS[t].en, USE_CASE_LABELS[t].hi),
            }))}
          />
          <Question
            step="02"
            label={tx('What kind of farm?', 'किस तरह का खेत?')}
            value={answers.farm}
            onPick={(farm) => setAnswers((a) => ({ ...a, farm }))}
            options={FARMS.map((f) => ({
              key: f,
              label: tx(FARM_TYPE_LABELS[f].en, FARM_TYPE_LABELS[f].hi),
            }))}
          />
          <Question
            step="03"
            label={tx('How much land?', 'कितनी ज़मीन?')}
            value={answers.size}
            onPick={(size) => setAnswers((a) => ({ ...a, size }))}
            options={SIZES.map((s) => ({
              key: s,
              label: tx(FARM_SIZE_LABELS[s].en, FARM_SIZE_LABELS[s].hi),
              detail: tx(FARM_SIZE_LABELS[s].detail.en, FARM_SIZE_LABELS[s].detail.hi),
            }))}
          />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {!asked ? (
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Compass aria-hidden className="h-4 w-4" />
            {tx(
              'Pick an answer above to see matching machines.',
              'मिलती-जुलती मशीनें देखने के लिए ऊपर कोई जवाब चुनें।',
            )}
          </p>
        ) : results.length === 0 ? (
          <div className="rounded-md border border-border bg-muted/40 p-5">
            <p className="text-sm font-semibold text-foreground">
              {tx('Nothing in the catalogue matches that yet.', 'फ़िलहाल इससे मेल खाती कोई मशीन नहीं है।')}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {tx(
                'This catalogue only lists machines we can verify against a manufacturer’s own published information, so it is short. Try a different task, or clear an answer.',
                'इस सूची में सिर्फ़ वही मशीनें हैं जिनकी पुष्टि निर्माता की अपनी प्रकाशित जानकारी से हो सकी, इसलिए यह छोटी है। कोई दूसरा काम चुनें या एक जवाब हटा दें।',
              )}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {tx(
                `${results.length} ${results.length === 1 ? 'match' : 'matches'}`,
                `${results.length} नतीजे`,
              )}
            </p>

            <ul className="grid gap-4 md:grid-cols-2">
              {results.slice(0, 4).map(({ robot, reasons }) => {
                const maker = MANUFACTURERS[robot.manufacturerId];
                return (
                  <li key={robot.id}>
                    <Link
                      to={`/robotic-farming/${robot.id}`}
                      className="group flex h-full gap-4 rounded-md border border-border bg-background p-4 transition-[border-color,box-shadow] duration-300 hover:border-secondary/50 hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <RobotImage
                        src={robot.image}
                        alt={robot.name}
                        fit={robot.platform === 'ground-robot' ? 'cover' : 'contain'}
                        className="h-24 w-24 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {maker?.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-foreground">
                          {robot.name}
                          <ArrowUpRight
                            aria-hidden
                            className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </p>
                        <ul className="mt-2 space-y-1">
                          {reasons.map((r) => (
                            <li
                              key={r.en}
                              className="flex gap-1.5 text-[12px] leading-snug text-muted-foreground"
                            >
                              <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary" />
                              {tx(r.en, r.hi)}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3">
                          <PriceBlock price={robot.price} />
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 flex gap-2.5 border-t border-border pt-5 text-[12px] leading-relaxed text-muted-foreground">
              <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" />
              {tx(
                'These are a starting shortlist, not a recommendation. Confirm row spacing, terrain suitability, price, availability and service cover directly with the manufacturer before you spend anything.',
                'ये सिर्फ़ शुरुआती सूची है, सिफ़ारिश नहीं। पैसा खर्च करने से पहले कतारों की दूरी, ज़मीन की उपयुक्तता, कीमत, उपलब्धता और सर्विस की पहुँच सीधे निर्माता से पक्की करें।',
              )}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
