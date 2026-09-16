import LayerDetails from './LayerDetails';
import OsiStack from './OsiStack';
import PacketInspector from './PacketInspector';
import PacketSimulator from './PacketSimulator';
import Terminal from './Terminal';
import { useStore } from '../store';

export default function OsiLabView() {
  const language = useStore((state) => state.language);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <section className="lg:col-span-3 xl:col-span-3 flex flex-col gap-6">
        <div className="space-y-2.5">
          <h3 className="eyebrow px-1">{language === 'it' ? 'Console' : 'Console'}</h3>
          <div className="h-[320px]"><Terminal /></div>
        </div>
        <div className="space-y-2.5">
          <h3 className="eyebrow px-1">{language === 'it' ? 'Pacchetto' : 'Packet'}</h3>
          <PacketInspector />
        </div>
      </section>

      <section className="lg:col-span-5 xl:col-span-5 space-y-6">
        <div className="space-y-2.5">
          <h3 className="eyebrow px-1">{language === 'it' ? 'Simulatore' : 'Simulator'}</h3>
          <PacketSimulator />
        </div>
        <div className="space-y-2.5">
          <h3 className="eyebrow px-1">{language === 'it' ? 'Pila OSI' : 'OSI Stack'}</h3>
          <OsiStack />
        </div>
      </section>

      <section className="lg:col-span-4 xl:col-span-4 space-y-2.5">
        <h3 className="eyebrow px-1">{language === 'it' ? 'Dettagli del livello' : 'Layer details'}</h3>
        <LayerDetails />
      </section>
    </div>
  );
}
