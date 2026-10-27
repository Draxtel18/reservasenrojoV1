'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { questions, sections } from '@/content/editorial';

export function BackToTop() {
  const pathname = usePathname();
  return <Link className="back-top" href="/#inicio" onClick={event => {
    // Keep modified clicks and cross-page navigation as ordinary links.
    if (pathname !== '/' || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Scrolling is an action on every activation, not a same-URL navigation.
    if (location.hash !== '#inicio') history.replaceState(history.state, '', '/#inicio');
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
    const mode = document.documentElement.dataset.motion;
    const animate = mode !== 'reduced';
    window.scrollTo({ top: 0, behavior: animate ? 'smooth' : 'instant' });
  }}>Volver al inicio <span>↑</span></Link>;
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);
  return <header className="site-header">
    <Link className="brand" href="/" aria-label="Reservas en rojo, inicio" onClick={() => setOpen(false)}><Image src="/media/logo-transparent.png" alt="Reservas en rojo" width={151} height={101} priority /></Link>
    <span className="edition">Especial periodístico <span>Piura, Perú</span></span>
    <button ref={menuButton} className="menu-button" aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? 'Cerrar menú' : 'Menú'}</button>
    <nav id="navigation" aria-label="Navegación principal" className={open ? 'navigation is-open' : 'navigation'} onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); } }}>
      {[sections[0], sections[5], sections[6]].map(([id, label]) => <Link key={id} href={`/${id}`} aria-current={pathname === `/${id}` ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
      <Link className="header-action" href="/#formatos" onClick={() => setOpen(false)}>Explorar</Link>
    </nav>
  </header>;
}

export function Motion() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const override = useRef<string | null>(null);
  useEffect(() => {
    try { override.current = sessionStorage.getItem('reservas-motion'); } catch { /* Storage is optional. */ }
    // The owner explicitly approved the original full choreography as the default.
    setEnabled(override.current ? override.current === 'enabled' : true);
  }, []);
  useEffect(() => {
    if (enabled === null) return;
    document.documentElement.dataset.motion = enabled ? 'enabled' : 'reduced';
    document.documentElement.dataset.motionStyle = 'full';
    const elements = new Set<HTMLElement>();
    const animations = new Set<Animation>();
    const reveal = (element: HTMLElement) => {
      const kind = element.dataset.motionEnter || element.dataset.reveal;
      const original = getComputedStyle(element).transform;
      const end = original === 'none' ? 'none' : original;
      const media = kind === 'media' || kind === 'hero-photo';
      const row = kind === 'row' || kind === 'statement';
      const title = kind === 'title';
      const page = kind === 'page';
      element.classList.add('revealed');
      element.dataset.motionState = 'entering';
      const frames: Keyframe[] = [
        { opacity: page ? .7 : 0, transform: page ? 'translateY(12px)' : row ? 'translateX(-28px)' : media ? 'translateY(32px) scale(1.045)' : `translateY(${title ? '90%' : '32px'})`,
          clipPath: media ? 'inset(8% 0 8% 0)' : title ? 'inset(0 0 100% 0)' : 'inset(0)' },
        { opacity: 1, transform: end, clipPath: 'inset(0)' },
      ];
      const animation = element.animate(frames, { duration: page ? 550 : media ? 1100 : title ? 900 : row ? 650 : 800,
        delay: page ? 0 : Number(element.dataset.motionOrder || 0) * 80,
        easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' });
      animations.add(animation);
      animation.onfinish = () => {
        element.dataset.motionState = 'visible';
        animations.delete(animation);
        animation.cancel();
      };
    };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { observer.unobserve(entry.target); reveal(entry.target as HTMLElement); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .06 });
    const register = () => {
      if (previousPath.current !== pathname) {
        document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
        previousPath.current = pathname;
      }
      if (!enabled) return;
      document.querySelectorAll<HTMLElement>('[data-reveal], [data-motion-enter]').forEach((element, index) => {
        if (elements.has(element)) return;
        elements.add(element);
        element.dataset.motionOrder = String(index % 3);
        if (!element.animate) return;
        if (element.dataset.motionEnter === 'page') { reveal(element); return; }
        element.dataset.motionState = 'pending';
        observer.observe(element);
      });
    };
    // Route streams can arrive after the pathname changes; register those nodes too.
    const mutations = new MutationObserver(register);
    const frame = requestAnimationFrame(() => {
      register();
      if (enabled) mutations.observe(document.body, { childList: true, subtree: true });
    });
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); mutations.disconnect();
      animations.forEach(animation => animation.cancel());
      elements.forEach(element => { element.dataset.motionState = 'visible'; });
    };
  }, [pathname, enabled]);
  function toggle() {
    const next = !enabled;
    override.current = next ? 'enabled' : 'reduced';
    try { sessionStorage.setItem('reservas-motion', override.current); } catch { /* Continue without persistence. */ }
    setEnabled(next);
  }
  if (enabled === null) return null;
  const slot = document.getElementById('motion-control-slot');
  const label = enabled ? 'Pausar animaciones' : 'Activar animaciones';
  return <><div className="reading-progress" aria-hidden="true" />
    {slot && createPortal(<button className="motion-control" onClick={toggle} aria-label={label} title={`${label}. No cambia la configuración del dispositivo.`}>
      <span aria-hidden="true">{enabled ? 'Ⅱ' : '▷'}</span><span className="motion-label">{label}</span>
    </button>, slot)}</>;
}

export function Quiz() {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  const question = questions[step];
  useEffect(() => {
    if (started.current) { if (question) questionHeading.current?.focus(); else resultHeading.current?.focus(); }
  }, [step, question]);
  function next() { started.current = true; setStep(step + 1); setChoice(null); }
  function reset() { started.current = true; setStep(0); setChoice(null); setScore(0); }
  return <div className="quiz" data-ui>
    {question ? <>
      <p className="quiz-count">Pregunta {step + 1} de {questions.length}</p>
      <progress aria-label="Progreso del cuestionario" value={step} max={questions.length} />
      <h3 ref={questionHeading} tabIndex={-1}>{question.prompt}</h3>
      <div className="answers">{question.answers.map((answer, index) => <button key={answer} disabled={choice !== null} aria-pressed={choice === index} className={choice === index ? 'answer selected' : 'answer'} onClick={() => { setChoice(index); if (index === question.correct) setScore(score + 1); }}>{answer}<span aria-hidden="true">{choice === index ? '●' : '○'}</span></button>)}</div>
      <div aria-live="polite" className="quiz-feedback">{choice !== null && <><p><strong>{choice === question.correct ? 'Respuesta correcta.' : 'Revisemos la respuesta.'}</strong> {question.explanation}</p><button className="button" onClick={next}>{step === questions.length - 1 ? 'Ver resultado' : 'Siguiente pregunta'}</button></>}</div>
    </> : <div className="quiz-result"><h3 ref={resultHeading} tabIndex={-1}>Tu recorrido</h3><p className="score">{score} de {questions.length}</p><p>Informarse también es distinguir lo que sabemos de lo que falta por verificar. Vuelve al documental para seguir explorando.</p><button className="button" onClick={reset}>Reiniciar cuestionario</button></div>}
    <noscript>El cuestionario necesita JavaScript. Puedes explorar la investigación y acceder al documental sin completarlo.</noscript>
  </div>;
}
