import LayerDetails from './LayerDetails';
import OsiStack from './OsiStack';
import PacketInspector from './PacketInspector';
import PacketSimulator from './PacketSimulator';
import Terminal from './Terminal';
import { useStore } from '../store';

export default function OsiLabView() {
  const language = useStore((state) => state.language);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">
        {language === 'it' ? 'Pila OSI' : 'OSI stack'}
      </h1>
      {/* Three functional zones (console · simulator · layer details). A wider column
          gap and a hairline under each zone header group them visually so they read as
          distinct areas instead of one flat wall; the inner cards are unchanged. */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-x-8">
        <section className="flex flex-col gap-6 lg:col-span-3 xl:col-span-3">
          <div className="space-y-2.5">
            <h2 className="eyebrow border-b border-slate-100 px-1 pb-1.5">
              {language === 'it' ? 'Console' : 'Console'}
            </h2>
            <div className="h-[320px]">
              <Terminal />
            </div>
          </div>
          <div className="space-y-2.5">
            <h2 className="eyebrow border-b border-slate-100 px-1 pb-1.5">
              {language === 'it' ? 'Pacchetto' : 'Packet'}
            </h2>
            <PacketInspector />
          </div>
        </section>

        <section className="space-y-6 lg:col-span-5 xl:col-span-5">
          <div className="space-y-2.5">
            <h2 className="eyebrow border-b border-slate-100 px-1 pb-1.5">
              {language === 'it' ? 'Simulatore' : 'Simulator'}
            </h2>
            <PacketSimulator />
          </div>
          <div className="space-y-2.5">
            <h2 className="eyebrow border-b border-slate-100 px-1 pb-1.5">
              {language === 'it' ? 'Pila OSI' : 'OSI Stack'}
            </h2>
            <OsiStack />
          </div>
        </section>

        <section className="space-y-2.5 lg:col-span-4 xl:col-span-4">
          <h2 className="eyebrow border-b border-slate-100 px-1 pb-1.5">
            {language === 'it' ? 'Dettagli del livello' : 'Layer details'}
          </h2>
          <LayerDetails />
        </section>
      </div>
    </div>
  );
}
