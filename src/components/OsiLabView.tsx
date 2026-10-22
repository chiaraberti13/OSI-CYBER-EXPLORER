import { ChevronRight } from 'lucide-react';
import LayerDetails from './LayerDetails';
import OsiStack from './OsiStack';
import PacketInspector from './PacketInspector';
import PacketSimulator from './PacketSimulator';
import Terminal from './Terminal';
import { useStore } from '../store';

export default function OsiLabView() {
  const language = useStore((state) => state.language);

  const copy =
    language === 'it'
      ? {
          labs: 'Laboratori',
          category: 'Laboratori interattivi',
          title: 'Pila OSI',
          subtitle: 'Simulazione passo-passo di incapsulamento e decapsulamento, con ispettore dei pacchetti.'
        }
      : {
          labs: 'Labs',
          category: 'Interactive labs',
          title: 'OSI stack',
          subtitle: 'Step-by-step encapsulation and decapsulation simulation, with a packet inspector.'
        };

  return (
    <div>
      {/* Approved v2 page header: breadcrumb for orientation, then the title with a
          one-line summary of what the lab does. The theory back-link to the manual
          chapter is rendered once by App (LabManualLink), so it is not duplicated here. */}
      <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-[13px] text-slate-500">
        <span>{copy.labs}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
        <span>{copy.category}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
        <span aria-current="page" className="font-medium text-slate-900">
          {copy.title}
        </span>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">{copy.title}</h1>
      <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-slate-600">{copy.subtitle}</p>

      {/* Approved layout: the simulator spans the full width on top, then the OSI stack
          sits beside the layer details, and the packet inspector beside the console.
          Each panel owns its own header, so no external section labels are needed. */}
      <div className="mt-6 flex flex-col gap-5">
        <PacketSimulator />

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <OsiStack />
          </div>
          <div className="lg:col-span-7">
            <LayerDetails />
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <PacketInspector />
          </div>
          <div className="min-h-[360px] lg:col-span-5">
            <Terminal />
          </div>
        </div>
      </div>
    </div>
  );
}
