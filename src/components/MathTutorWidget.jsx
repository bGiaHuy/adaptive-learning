import React, {useEffect, useRef, useState} from 'react';
import {MessageCircle, X} from 'lucide-react';
import MathTutorChat from './MathTutorChat';
import './math-tutor-widget.css';

export default function MathTutorWidget({userId}) {
  const [open,setOpen]=useState(false);
  const [conversationId]=useState(()=>{
    const key=`math-tutor:${userId}`;
    try {const saved=localStorage.getItem(key);if(saved&&/^[a-f0-9-]{36}$/i.test(saved))return saved;}catch{}
    const id=crypto.randomUUID();try{localStorage.setItem(key,id);}catch{}return id;
  });
  const launcher=useRef(null),close=useRef(null);
  useEffect(()=>{if(open)close.current?.focus();},[open]);
  function dismiss(){setOpen(false);launcher.current?.focus();}
  return <div className="math-tutor-widget">
    {open&&<section className="math-tutor-panel" role="dialog" aria-modal="false" aria-label="Gia sư Toán AI" onKeyDown={event=>{if(event.key==='Escape')dismiss();}}>
      <div className="math-tutor-panel-heading"><strong>Hỏi gia sư Toán</strong><button ref={close} type="button" onClick={dismiss} aria-label="Đóng gia sư"><X size={20}/></button></div>
      <MathTutorChat reviewId={conversationId} enabled general/>
      <p className="math-tutor-note">AI có thể nhầm. Hãy đối chiếu các bước giải với kiến thức đã học.</p>
    </section>}
    <button ref={launcher} className="math-tutor-launcher" type="button" aria-expanded={open} aria-label={open?'Đóng gia sư AI':'Mở gia sư AI'} onClick={()=>open?dismiss():setOpen(true)}><MessageCircle size={23}/><span>Gia sư AI</span></button>
  </div>;
}
