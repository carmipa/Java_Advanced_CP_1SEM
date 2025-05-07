// src/components/forms/TabbedForm.tsx
"use client";

import React, { ReactNode } from 'react';
import { Tab } from '@headlessui/react';

export interface AppTab {
    label: string;
    content: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
}

interface TabbedFormProps {
    tabs: AppTab[];
    selectedIndex?: number;
    onChange?: (index: number) => void;
}

const TabbedForm: React.FC<TabbedFormProps> = ({ tabs, selectedIndex, onChange }) => {
    return (
        <div className="w-full">
            <Tab.Group selectedIndex={selectedIndex} onChange={onChange}>
                {/* Container das Abas - Removemos a borda inferior daqui */}
                <Tab.List className="flex space-x-1 px-1 sm:px-2">
                    {tabs.map((tabItem) => (
                        <Tab
                            key={tabItem.label}
                            disabled={tabItem.disabled}
                            className={({ selected }) =>
                                `
                  px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-medium focus:outline-none flex items-center gap-2 whitespace-nowrap
                  rounded-t-md                           // Cantos superiores arredondados
                  transition-colors duration-150
                  relative                                // Para posicionamento do pseudo-elemento ou borda
                  group                                   // Para hover nos separadores (opcional)

                  ${tabItem.disabled
                                    ? 'text-slate-600 cursor-not-allowed' // Estilo desabilitado
                                    : selected
                                        ? 'bg-slate-800 text-sky-300 shadow-sm' // ABA ATIVA: Fundo mais claro (ajuste a cor), texto destacado
                                        : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700/70 hover:text-sky-200' // ABA INATIVA: Fundo escuro, hover sutil
                                }

                  /* Separador sutil à direita (exceto último) */
                  ${!tabItem.disabled && 'border-r border-slate-700/50 last:border-r-0'}
                `
                            }
                        >
                            {tabItem.icon}
                            {tabItem.label}
                        </Tab>
                    ))}
                    {/* Espaço vazio para preencher a linha abaixo das abas, exceto sob a ativa */}
                    <div className="flex-grow border-b border-slate-700"></div>
                </Tab.List>

                {/* Painéis de Conteúdo */}
                <Tab.Panels className="mt-[-1px]"> {/* Leve sobreposição para conectar */}
                    {tabs.map((tabItem, idx) => (
                        <Tab.Panel
                            key={idx}
                            // Fundo um pouco mais claro para conectar com a aba ativa
                            className="rounded-b-lg rounded-tr-lg bg-slate-800 p-3 sm:p-5 focus:outline-none border border-t-0 border-slate-700"
                        >
                            {tabItem.content}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default TabbedForm;