
import React, { useState, useEffect, useMemo } from 'react';
import { Lesson, ViewState, WeeklySchedule, ScheduleSlot } from './types';
import Layout from './components/Layout';

const CLASS_MAPPING: Record<string, string[]> = {
  '1º Ano EM': ['100', '101', '102', '103'],
  '2º Ano EM': ['200SEA', '201SEA', '200CNS'],
  '3º Ano EM': ['300SEA', '301SEA', '300CNS']
};

const SHIFT_THEMES: Record<string, { main: string, text: string, light: string, border: string, softBorder: string }> = {
  matutino: { 
    main: 'bg-amber-600', 
    text: 'text-amber-600', 
    light: 'bg-amber-50', 
    border: 'border-amber-600',
    softBorder: 'border-amber-100'
  },
  vespertino: { 
    main: 'bg-sky-600', 
    text: 'text-sky-600', 
    light: 'bg-sky-50', 
    border: 'border-sky-600',
    softBorder: 'border-sky-100'
  },
  noturno: { 
    main: 'bg-indigo-600', 
    text: 'text-indigo-600', 
    light: 'bg-indigo-50', 
    border: 'border-indigo-600',
    softBorder: 'border-indigo-100'
  }
};

const DAYS_OF_WEEK = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const SHIFTS = ['matutino', 'vespertino', 'noturno'] as const;
const PERIOD_COUNT = 6;

const DEFAULT_SLOTS: ScheduleSlot[] = Array.from({ length: PERIOD_COUNT }, () => ({
  start: '',
  end: '',
  grade: '1º Ano EM',
  classGroup: '100',
  subject: '',
  content: ''
}));

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('menu');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeShift, setActiveShift] = useState<typeof SHIFTS[number]>('matutino');
  const [activeDay, setActiveDay] = useState(DAYS_OF_WEEK[0]);

  const [schedule, setSchedule] = useState<WeeklySchedule>(() => {
    const initial: any = {};
    SHIFTS.forEach(shift => {
      initial[shift] = {};
      DAYS_OF_WEEK.forEach(day => {
        initial[shift][day] = JSON.parse(JSON.stringify(DEFAULT_SLOTS));
      });
    });
    return initial as WeeklySchedule;
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    grade: '1º Ano EM',
    classGroup: '100',
    subject: '',
    content: '',
    nextLessonSuggestions: ''
  });

  useEffect(() => {
    const savedLessons = localStorage.getItem('prof_pro_vfinal_lessons');
    if (savedLessons) setLessons(JSON.parse(savedLessons));
    const savedSchedule = localStorage.getItem('prof_pro_vfinal_sched');
    if (savedSchedule) setSchedule(JSON.parse(savedSchedule));
  }, []);

  useEffect(() => {
    localStorage.setItem('prof_pro_vfinal_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('prof_pro_vfinal_sched', JSON.stringify(schedule));
  }, [schedule]);

  const todayName = useMemo(() => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const day = days[new Date().getDay()];
    return DAYS_OF_WEEK.includes(day) ? day : 'Segunda';
  }, []);

  const todaysClasses = useMemo(() => {
    const classes: { shift: typeof SHIFTS[number]; slot: ScheduleSlot; index: number }[] = [];
    SHIFTS.forEach(shift => {
      schedule[shift][todayName].forEach((slot, index) => {
        if (slot.subject.trim() !== '') {
          classes.push({ shift, slot, index });
        }
      });
    });
    return classes;
  }, [schedule, todayName]);

  const updateScheduleSlot = (index: number, field: keyof ScheduleSlot, value: string) => {
    const newSchedule = { ...schedule };
    const daySlots = [...(newSchedule[activeShift][activeDay])];
    
    if (field === 'grade') {
      daySlots[index] = { 
        ...daySlots[index], 
        grade: value, 
        classGroup: CLASS_MAPPING[value][0] 
      };
    } else {
      daySlots[index] = { ...daySlots[index], [field]: value };
    }
    
    newSchedule[activeShift][activeDay] = daySlots;
    setSchedule(newSchedule);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: Date.now()
    };
    setLessons(prev => [newLesson, ...prev]);
    setView('menu');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      grade: '1º Ano EM',
      classGroup: '100',
      subject: '',
      content: '',
      nextLessonSuggestions: ''
    });
  };

  const currentTheme = SHIFT_THEMES[activeShift];
  const inputClass = "w-full p-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 text-sm font-medium transition-all shadow-sm";

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col md:py-6">
      {view === 'menu' && (
        <Layout title="📘 RegOscar">
          <div className="space-y-4">
            {/* Visualização Rápida de Hoje com Cores por Turno */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-slate-800 font-black text-[11px] uppercase tracking-wider flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                  Horário de {todayName}
                </h2>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">HOJE</span>
              </div>
              <div className="divide-y divide-slate-50">
                {todaysClasses.length === 0 ? (
                  <div className="py-6 text-center px-6">
                    <p className="text-slate-400 text-[11px] font-medium">Nenhuma aula configurada para hoje.</p>
                  </div>
                ) : (
                  todaysClasses.map((item, i) => {
                    const theme = SHIFT_THEMES[item.shift];
                    return (
                      <div key={`${item.shift}-${i}`} className="flex items-center px-5 py-2.5 hover:bg-slate-50 transition-colors gap-3">
                        <div className="flex flex-col items-center justify-center min-w-[45px]">
                          <span className="text-[11px] font-black text-slate-800 leading-none">{item.slot.start || '--:--'}</span>
                          <span className={`text-[8px] font-black ${theme.text} uppercase tracking-tighter mt-0.5`}>{item.shift.substring(0,3)}</span>
                        </div>
                        <div className="w-px h-6 bg-slate-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-black text-slate-800 truncate leading-tight uppercase">{item.slot.subject}</p>
                          <p className={`text-[9px] font-bold ${theme.text} uppercase tracking-wide`}>
                            {item.slot.grade} • <span className="text-slate-400">T{item.slot.classGroup}</span>
                          </p>
                        </div>
                        <div className={`${theme.light} ${theme.text} px-2 py-1 rounded-lg text-[10px] font-black border ${theme.softBorder}`}>
                          {item.index + 1}º
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Menu Principal */}
            <button onClick={() => setView('schedule')} className="w-full bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center hover:border-slate-400 transition-all text-center group">
              <p className="font-black text-slate-800 text-sm uppercase tracking-wider group-hover:text-slate-950 transition-colors">Configuração de Horário</p>
            </button>
            
            <button onClick={() => setView('form')} className="w-full bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5 hover:border-blue-500 transition-all text-left">
              <div className="bg-blue-100 p-3.5 rounded-2xl text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M16 2v20"/>
                </svg>
              </div>
              <div><p className="font-black text-slate-800 text-sm">Registrar Aula</p><p className="text-slate-500 text-[11px]">Anotar conteúdo dado hoje.</p></div>
            </button>

            <button onClick={() => setView('list')} className="w-full bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5 hover:border-indigo-500 transition-all text-left">
              <div className="bg-indigo-100 p-3.5 rounded-2xl text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
              </div>
              <div><p className="font-black text-slate-800 text-sm">Histórico</p><p className="text-slate-500 text-[11px]">{lessons.length} aulas registradas.</p></div>
            </button>
          </div>
        </Layout>
      )}

      {view === 'schedule' && (
        <Layout title="📅 Configuração de Horário" onBack={() => setView('menu')}>
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
            {SHIFTS.map(s => (
              <button key={s} onClick={() => setActiveShift(s)} className={`flex-1 py-2.5 text-xs font-black rounded-xl capitalize transition-all ${activeShift === s ? `bg-white ${SHIFT_THEMES[s].text} shadow-sm` : 'text-slate-400'}`}>{s}</button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1.5 mb-5">
            {DAYS_OF_WEEK.map(d => (
              <button 
                key={d} 
                onClick={() => setActiveDay(d)} 
                className={`py-3 rounded-xl text-[10px] font-black border transition-all text-center ${activeDay === d ? `${currentTheme.main} text-white ${currentTheme.border} shadow-md` : 'bg-white text-slate-500 border-slate-200'}`}
              >
                {d.substring(0, 3)}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {schedule[activeShift][activeDay].map((slot, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 ${currentTheme.light} ${currentTheme.text} rounded-full flex items-center justify-center text-[10px] font-black`}>{i+1}º</span>
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      <input type="time" className="bg-transparent text-xs font-bold w-16 outline-none text-center" value={slot.start} onChange={e => updateScheduleSlot(i, 'start', e.target.value)} />
                      <span className="text-slate-300">-</span>
                      <input type="time" className="bg-transparent text-xs font-bold w-16 outline-none text-center" value={slot.end} onChange={e => updateScheduleSlot(i, 'end', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <select className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-1.5 rounded-lg outline-none" value={slot.grade} onChange={e => updateScheduleSlot(i, 'grade', e.target.value)}>
                      {Object.keys(CLASS_MAPPING).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select className="bg-amber-50 text-amber-700 text-[10px] font-black px-2 py-1.5 rounded-lg outline-none" value={slot.classGroup} onChange={e => updateScheduleSlot(i, 'classGroup', e.target.value)}>
                      {CLASS_MAPPING[slot.grade].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <input type="text" placeholder="Nome da Disciplina..." className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 placeholder:text-slate-300" value={slot.subject} onChange={e => updateScheduleSlot(i, 'subject', e.target.value)} />
              </div>
            ))}
          </div>
          <button onClick={() => setView('menu')} className={`w-full mt-8 ${currentTheme.main} text-white font-black py-4 rounded-3xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest`}>Salvar e Voltar</button>
        </Layout>
      )}

      {view === 'form' && (
        <Layout title="📝 Registrar Aula" onBack={() => setView('menu')}>
          <form onSubmit={handleSaveLesson} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Data</label>
                <input type="date" required className={inputClass} value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Disciplina</label>
                <input type="text" required placeholder="Ex: Matemática" className={inputClass} value={formData.subject} onChange={e => setFormData(p => ({...p, subject: e.target.value}))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ano/Série</label>
                <select className={inputClass} value={formData.grade} onChange={e => setFormData(p => ({...p, grade: e.target.value, classGroup: CLASS_MAPPING[e.target.value][0]}))}>
                  {Object.keys(CLASS_MAPPING).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Turma</label>
                <select className={inputClass} value={formData.classGroup} onChange={e => setFormData(p => ({...p, classGroup: e.target.value}))}>
                  {CLASS_MAPPING[formData.grade].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="px-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Conteúdo Ministrado</label>
              </div>
              <textarea required rows={6} placeholder="O que você ensinou hoje? Digite os tópicos abordados..." className={`${inputClass} resize-none leading-relaxed text-slate-700`} value={formData.content} onChange={e => setFormData(p => ({...p, content: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <div className="px-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Sugestões para a Próxima Aula</label>
              </div>
              <textarea rows={3} placeholder="O que planeja para o próximo encontro?" className={`${inputClass} resize-none leading-relaxed text-slate-700`} value={formData.nextLessonSuggestions} onChange={e => setFormData(p => ({...p, nextLessonSuggestions: e.target.value}))} />
            </div>
            <button type="submit" className="w-full bg-blue-700 text-white font-black py-4 rounded-3xl shadow-xl hover:bg-blue-800 transition-all text-sm uppercase tracking-widest flex justify-center items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Salvar Aula
            </button>
          </form>
        </Layout>
      )}

      {view === 'list' && (
        <Layout title="📋 Histórico" onBack={() => setView('menu')}>
          {lessons.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map(l => (
                <div key={l.id} className="bg-white border-l-[6px] border-indigo-500 rounded-2xl p-5 shadow-sm border border-slate-100 relative group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tight">
                      {new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                    </span>
                    <button onClick={() => setLessons(prev => prev.filter(x => x.id !== l.id))} className="text-slate-200 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <h3 className="font-black text-slate-800 leading-none">{l.grade} <span className="text-indigo-600 text-sm">Turma {l.classGroup}</span></h3>
                  <p className="text-indigo-400 text-[11px] font-black uppercase tracking-wide mt-1.5 mb-3">{l.subject}</p>
                  <div className="bg-slate-50/80 p-4 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{l.content}</div>
                  {l.nextLessonSuggestions && (
                    <div className="mt-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <p className="text-[9px] font-black uppercase text-blue-400 mb-1">Próxima Aula</p>
                      <p className="text-slate-600 text-xs italic">{l.nextLessonSuggestions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Layout>
      )}
    </div>
  );
};

export default App;
