"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from '@/components/admin/AdminSidebar';
import ImportPreviewModal from '@/components/admin/Importpreviewmodal';
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import {
  Search, Bell, Plus, Pencil, Trash2,
  ChevronDown, ChevronUp, Tag, ToggleLeft, ToggleRight,
  ImageOff, Filter, Star, Clock, Flame, Leaf, Wheat,
  Upload, Download,
} from "lucide-react";

// ── API base ──────────────────────────────────────────────────────────────────
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API = (RAW_API_BASE && RAW_API_BASE.length > 0 ? RAW_API_BASE : "/api").replace(/\/$/, "");
const IS_EXTERNAL_API = API.startsWith("http");

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  brand: "#e85d04",
  brandDark: "#dc2f02",
  bgBase: "#faf9f7",
  bgSurface: "#ffffff",
  bgElevated: "#f5f3ef",
  bgSubtle: "#ede9e3",
  textPrimary: "#1a1208",
  textSecond: "#6b5e4e",
  textMuted: "#a89880",
  border: "#e8e1d8",
  borderMed: "#d4c8bc",
  shadowCard: "0 2px 16px rgba(26,18,8,0.07)",
  shadowHover: "0 8px 32px rgba(26,18,8,0.12)",
  fontDisplay: "'Fraunces', Georgia, serif",
  fontBody: "'DM Sans', system-ui, sans-serif",
  r: { sm: "8px", md: "14px", lg: "20px", xl: "24px" },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  tags: TagKey[];
  prepTime: number;
  calories: number;
}
interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  items: MenuItem[];
}
type TagKey = "popular" | "vegano" | "picante" | "nuevo" | "sin-gluten";

const MENU_STORAGE_KEY = "rmp_admin_menu_v1";

// ── Utilities ─────────────────────────────────────────────────────────────────
function normalizeStr(s: string) { return (s || "").trim(); }
function normalizeKey(s: string) { return normalizeStr(s).toLowerCase(); }
function parseBool(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["1","true","si","sí","yes","y","on"].includes(v)) return true;
    if (["0","false","no","n","off"].includes(v)) return false;
  }
  return fallback;
}
function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.trim().replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}
function toTagKeys(raw: unknown): TagKey[] {
  const allowed: TagKey[] = ["popular","vegano","picante","nuevo","sin-gluten"];
  const out: TagKey[] = [];
  const push = (k: string) => {
    const key = normalizeKey(k) as TagKey;
    if (allowed.includes(key) && !out.includes(key)) out.push(key);
  };
  if (Array.isArray(raw)) raw.forEach((x) => push(String(x)));
  else if (typeof raw === "string") raw.split(/[|,]/g).forEach((x) => push(x.trim()));
  return out;
}
function csvEscape(v: unknown) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i+1];
    if (inQuotes) {
      if (ch==='"' && next==='"') { cell+='"'; i++; continue; }
      if (ch==='"') { inQuotes=false; continue; }
      cell+=ch; continue;
    }
    if (ch==='"') { inQuotes=true; continue; }
    if (ch===",") { row.push(cell); cell=""; continue; }
    if (ch==="\r") continue;
    if (ch==="\n") { row.push(cell); rows.push(row); row=[]; cell=""; continue; }
    cell+=ch;
  }
  row.push(cell); rows.push(row);
  return rows.filter((r) => r.some((c) => String(c).trim().length>0));
}
function apiUrl(path: string) {
  return `${API}${path.startsWith("/") ? path : `/${path}`}`;
}
function filenameFromCD(v: string | null) {
  if (!v) return null;
  const m = v.match(/filename\*?=(?:UTF-8''|\"?)([^\";]+)\"?/i);
  if (!m?.[1]) return null;
  try { return decodeURIComponent(m[1]); } catch { return m[1]; }
}
async function downloadAsFile(url: string, fallback: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const filename = filenameFromCD(res.headers.get("content-disposition")) ?? fallback;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(a.href);
}

// ── Initial data ──────────────────────────────────────────────────────────────
const INITIAL_CATEGORIES: Category[] = [
  {
    id:1, name:"Entradas", icon:"🥗", color:"#16a34a",
    items:[
      {id:101,name:"Bruschetta Italiana",description:"Pan tostado con tomate fresco, albahaca y aceite de oliva.",price:89,available:true,tags:["vegano"],prepTime:8,calories:210},
      {id:102,name:"Tabla de Quesos",description:"Selección de quesos artesanales con mermelada de higo y nueces.",price:165,available:true,tags:["popular"],prepTime:5,calories:480},
      {id:103,name:"Caldo Tlalpeño",description:"Caldo de pollo con garbanzos, chipotle y epazote.",price:95,available:false,tags:["picante"],prepTime:12,calories:280},
    ],
  },
  {
    id:2, name:"Sopas & Cremas", icon:"🍲", color:"#d97706",
    items:[
      {id:201,name:"Crema de Elote",description:"Cremosa sopa de maíz con chorizo crocante.",price:110,available:true,tags:["popular","nuevo"],prepTime:10,calories:320},
      {id:202,name:"Sopa de Lima",description:"Tradicional sopa yucateca con pollo deshebrado.",price:105,available:true,tags:[],prepTime:10,calories:295},
    ],
  },
  {
    id:3, name:"Platos Fuertes", icon:"🍽️", color:"#e85d04",
    items:[
      {id:301,name:"Filete al Chipotle",description:"Filete de res 200g en salsa de chipotle con papas cambray.",price:285,available:true,tags:["popular","picante"],prepTime:25,calories:650},
      {id:302,name:"Pollo en Mole Negro",description:"Muslo de pollo rostizado bañado en mole negro.",price:215,available:true,tags:["popular"],prepTime:20,calories:580},
      {id:303,name:"Pasta Primavera",description:"Linguini con vegetales de temporada y parmesano.",price:175,available:true,tags:["vegano","sin-gluten"],prepTime:15,calories:420},
    ],
  },
  {
    id:4, name:"Postres", icon:"🍮", color:"#7c3aed",
    items:[
      {id:401,name:"Flan Napolitano",description:"Flan cremoso de vainilla con cajeta y nuez.",price:75,available:true,tags:["popular"],prepTime:5,calories:310},
      {id:402,name:"Volcán de Chocolate",description:"Bizcocho de chocolate con centro fundido.",price:95,available:true,tags:["nuevo"],prepTime:12,calories:480},
    ],
  },
  {
    id:5, name:"Bebidas", icon:"🥤", color:"#0ea5e9",
    items:[
      {id:501,name:"Agua de Jamaica",description:"Agua fresca con limón y menta.",price:45,available:true,tags:["vegano","sin-gluten"],prepTime:2,calories:80},
      {id:502,name:"Café de Olla",description:"Café negro con piloncillo y canela.",price:55,available:true,tags:["popular"],prepTime:4,calories:30},
    ],
  },
];

const TAG_CONFIG: Record<TagKey,{label:string;color:string;bg:string;icon:React.ReactNode}> = {
  popular:    {label:"Popular",   color:"#d97706",bg:"#fffbeb",icon:<Star size={9}/>},
  vegano:     {label:"Vegano",    color:"#16a34a",bg:"#f0fdf4",icon:<Leaf size={9}/>},
  picante:    {label:"Picante",   color:"#dc2626",bg:"#fef2f2",icon:<Flame size={9}/>},
  nuevo:      {label:"Nuevo",     color:"#7c3aed",bg:"#faf5ff",icon:<Tag size={9}/>},
  "sin-gluten":{label:"Sin Gluten",color:"#0ea5e9",bg:"#f0f9ff",icon:<Wheat size={9}/>},
};

// ── Small components ──────────────────────────────────────────────────────────
function TagBadge({ tag }: { tag: TagKey }) {
  const c = TAG_CONFIG[tag];
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:800,color:c.color,background:c.bg}}>
      {c.icon} {c.label}
    </span>
  );
}

function MenuCard({ item, color, onToggle, onEdit, onDelete }: { item:MenuItem;color:string;onToggle:()=>void;onEdit:()=>void;onDelete:()=>void }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{background:T.bgSurface,borderRadius:T.r.xl,border:`1px solid ${item.available?T.border:"#f0ebe4"}`,boxShadow:hover?T.shadowHover:T.shadowCard,opacity:item.available?1:0.72,transition:"all .2s",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{height:128,background:`${color}12`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0}}>
        <ImageOff size={26} style={{color:`${color}50`}}/>
        <div style={{position:"absolute",inset:0,background:`${color}ee`,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:hover?1:0,transition:"opacity .2s"}}>
          <button onClick={onEdit} style={{padding:8,background:"#fff",border:"none",borderRadius:10,cursor:"pointer",display:"flex",boxShadow:"0 2px 8px rgba(0,0,0,.12)"}}><Pencil size={14} style={{color:T.textPrimary}}/></button>
          <button onClick={onDelete} style={{padding:8,background:"#fff",border:"none",borderRadius:10,cursor:"pointer",display:"flex",boxShadow:"0 2px 8px rgba(0,0,0,.12)"}}><Trash2 size={14} style={{color:"#dc2626"}}/></button>
        </div>
        <span style={{position:"absolute",top:8,right:8,fontSize:9,fontWeight:800,textTransform:"uppercase",padding:"3px 8px",borderRadius:99,background:item.available?"#ecfdf5":"#fef2f2",color:item.available?"#059669":"#dc2626"}}>{item.available?"Disponible":"No disponible"}</span>
      </div>
      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:4}}>
          <h4 style={{fontWeight:700,fontSize:14,color:T.textPrimary,lineHeight:1.3,margin:0}}>{item.name}</h4>
          <span style={{fontWeight:900,fontSize:16,color:T.brand,flexShrink:0}}>${item.price}</span>
        </div>
        <p style={{fontSize:12,color:T.textMuted,lineHeight:1.5,margin:"0 0 10px",flex:1}}>{item.description}</p>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.textMuted,marginBottom:10}}>
          <span style={{display:"flex",alignItems:"center",gap:3}}><Clock size={11}/> {item.prepTime} min</span>
          <span>·</span><span>{item.calories} kcal</span>
        </div>
        {item.tags.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>{item.tags.map((t)=><TagBadge key={t} tag={t}/>)}</div>}
        <button onClick={onToggle} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,border:"none",background:"none",cursor:"pointer",padding:0,color:item.available?"#059669":T.textMuted}}>
          {item.available?<ToggleRight size={20} style={{color:"#059669"}}/>:<ToggleLeft size={20} style={{color:T.textMuted}}/>}
          {item.available?"Activo":"Inactivo"}
        </button>
      </div>
    </div>
  );
}

function CategorySection({ category, search, filterAvail, onAdd, onToggle, onEdit, onDelete }: { category:Category;search:string;filterAvail:string;onAdd:(id:number)=>void;onToggle:(cId:number,iId:number)=>void;onEdit:(cId:number,item:MenuItem)=>void;onDelete:(cId:number,iId:number)=>void }) {
  const [open, setOpen] = useState(true);
  const [addHover, setAddHover] = useState(false);
  const filtered = category.items.filter((i) => {
    const ms = i.name.toLowerCase().includes(search.toLowerCase())||i.description.toLowerCase().includes(search.toLowerCase());
    const ma = filterAvail==="all"?true:filterAvail==="available"?i.available:!i.available;
    return ms&&ma;
  });
  if (search && filtered.length===0) return null;
  return (
    <div style={{marginBottom:40}}>
      <div onClick={()=>setOpen((o)=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,background:`${category.color}18`}}>{category.icon}</div>
          <div>
            <h3 style={{fontFamily:T.fontDisplay,fontWeight:900,fontSize:18,color:T.textPrimary,margin:0,letterSpacing:"-.02em"}}>{category.name}</h3>
            <p style={{fontSize:12,color:T.textMuted,margin:"2px 0 0"}}>{filtered.length} platillo{filtered.length!==1?"s":""} · {filtered.filter((i)=>i.available).length} disponibles</p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={(e)=>{e.stopPropagation();onAdd(category.id);}} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,padding:"6px 12px",borderRadius:10,border:"none",cursor:"pointer",background:`${category.color}18`,color:category.color}}><Plus size={13}/> Agregar</button>
          <span style={{color:T.textMuted}}>{open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</span>
        </div>
      </div>
      <div style={{height:1,marginBottom:16,background:`linear-gradient(to right, ${category.color}50, transparent)`}}/>
      {open&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",gap:16}}>
          {filtered.map((item)=><MenuCard key={item.id} item={item} color={category.color} onToggle={()=>onToggle(category.id,item.id)} onEdit={()=>onEdit(category.id,item)} onDelete={()=>onDelete(category.id,item.id)}/>)}
          <button onMouseEnter={()=>setAddHover(true)} onMouseLeave={()=>setAddHover(false)} onClick={()=>onAdd(category.id)} style={{height:280,border:`2px dashed ${addHover?category.color:`${category.color}45`}`,borderRadius:24,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:addHover?`${category.color}08`:"transparent",color:addHover?category.color:`${category.color}80`,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
            <div style={{width:40,height:40,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:`${category.color}18`}}><Plus size={20} style={{color:category.color}}/></div>
            Nuevo platillo
          </button>
        </div>
      )}
    </div>
  );
}

function ItemModal({ catId, categories, item, onClose, onSave }: { catId:number;categories:Category[];item:MenuItem|null;onClose:()=>void;onSave:(cId:number,data:Partial<MenuItem>)=>void }) {
  const [form, setForm] = useState<Partial<MenuItem>>(item??{name:"",description:"",price:0,available:true,tags:[],prepTime:10,calories:0});
  const tagKeys = Object.keys(TAG_CONFIG) as TagKey[];
  const cat = categories.find((c)=>c.id===catId);
  const inp: React.CSSProperties = {width:"100%",padding:"10px 12px",border:`1px solid ${T.borderMed}`,borderRadius:12,fontSize:14,fontFamily:T.fontBody,color:T.textPrimary,background:T.bgSurface,outline:"none",boxSizing:"border-box"};
  return (
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(26,18,8,0.5)",backdropFilter:"blur(4px)"}}>
      <div style={{background:T.bgSurface,borderRadius:28,boxShadow:"0 24px 64px rgba(26,18,8,0.18)",width:"100%",maxWidth:520,overflow:"hidden"}}>
        <div style={{padding:"28px 32px 20px",borderBottom:`1px solid ${T.border}`}}>
          <h2 style={{fontFamily:T.fontDisplay,fontWeight:900,fontSize:22,color:T.textPrimary,margin:"0 0 4px",letterSpacing:"-.02em"}}>{item?"Editar platillo":"Nuevo platillo"}</h2>
          <p style={{fontSize:13,color:T.textMuted,margin:0}}>Categoría: {cat?.icon} {cat?.name}</p>
        </div>
        <div style={{padding:"24px 32px",display:"flex",flexDirection:"column",gap:16,maxHeight:"58vh",overflowY:"auto"}}>
          <div><label style={{display:"block",fontSize:12,fontWeight:700,color:T.textSecond,marginBottom:6}}>Nombre *</label><input style={inp} value={form.name} onChange={(e)=>setForm((f)=>({...f,name:e.target.value}))} placeholder="Ej. Pollo en salsa verde"/></div>
          <div><label style={{display:"block",fontSize:12,fontWeight:700,color:T.textSecond,marginBottom:6}}>Descripción</label><textarea style={{...inp,resize:"none"}} rows={3} value={form.description} onChange={(e)=>setForm((f)=>({...f,description:e.target.value}))} placeholder="Describe el platillo..."/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {([ ["Precio ($)","price"],["Prep. (min)","prepTime"],["Calorías","calories"] ] as const).map(([lbl,key])=>(
              <div key={key}><label style={{display:"block",fontSize:12,fontWeight:700,color:T.textSecond,marginBottom:6}}>{lbl}</label><input type="number" min={0} style={inp} value={form[key] as number} onChange={(e)=>setForm((p)=>({...p,[key]:Number(e.target.value)}))}/></div>
            ))}
          </div>
          <div><label style={{display:"block",fontSize:12,fontWeight:700,color:T.textSecond,marginBottom:8}}>Etiquetas</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{tagKeys.map((t)=>{const cfg=TAG_CONFIG[t];const sel=form.tags?.includes(t);return(<button key={t} type="button" onClick={()=>setForm((f)=>({...f,tags:sel?f.tags?.filter((x)=>x!==t):[...(f.tags??[]),t]}))} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:99,fontSize:11,fontWeight:700,cursor:"pointer",border:`1.5px solid ${sel?cfg.color:T.border}`,background:sel?cfg.bg:"transparent",color:sel?cfg.color:T.textMuted}}>{cfg.icon} {cfg.label}</button>);})}</div>
          </div>
          <button type="button" onClick={()=>setForm((f)=>({...f,available:!f.available}))} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:600,border:"none",background:"none",cursor:"pointer",padding:0,color:form.available?"#059669":T.textMuted}}>
            {form.available?<ToggleRight size={24} style={{color:"#059669"}}/>:<ToggleLeft size={24} style={{color:T.textMuted}}/>}
            {form.available?"Disponible en menú":"No disponible"}
          </button>
        </div>
        <div style={{padding:"18px 32px",borderTop:`1px solid ${T.border}`,background:T.bgElevated,display:"flex",justifyContent:"flex-end",gap:10}}>
          <button onClick={onClose} style={{padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:700,border:"none",cursor:"pointer",background:T.bgSubtle,color:T.textSecond}}>Cancelar</button>
          <button disabled={!form.name} onClick={()=>{onSave(catId,form);onClose();}} style={{padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:700,border:"none",cursor:"pointer",color:"#fff",background:form.name?T.brand:"#ccc",boxShadow:form.name?"0 4px 12px rgba(232,93,4,.3)":"none"}}>{item?"Guardar cambios":"Agregar platillo"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminMenuPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [search, setSearch]         = useState("");
  const [filterAvail, setFilterAvail] = useState<"all"|"available"|"unavailable">("all");
  const [modal, setModal]           = useState<{catId:number;item:MenuItem|null}|null>(null);
  const [searchFocus, setSearchFocus] = useState(false);
  const fileInputRef                  = useRef<HTMLInputElement|null>(null);
  const [importBusy, setImportBusy]   = useState(false);
  const pendingFormatRef              = useRef<"csv"|"json"|"xlsx"|null>(null);
  const [ioOpen, setIoOpen]           = useState<null|"import"|"export">(null);
  const ioWrapRef                     = useRef<HTMLDivElement|null>(null);

  // ── NUEVO: estado del modal de preview ──────────────────────────────────────
  const [preview, setPreview] = useState<{
    file: File;
    parsedRows: Array<Record<string,unknown>>;
    dbRows: Array<Record<string,unknown>>;
  }|null>(null);

  // ── Cargar menú guardado localmente ────────────────────────────────────────
  useEffect(() => {
    if (IS_EXTERNAL_API) return;
    try {
      const raw = localStorage.getItem(MENU_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setCategories(parsed);
      else if (parsed && Array.isArray(parsed.categories)) setCategories(parsed.categories);
    } catch {}
  }, []);

  useEffect(() => {
    if (IS_EXTERNAL_API) return;
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify({version:1,savedAt:new Date().toISOString(),categories}));
    } catch {}
  }, [categories]);

  useEffect(() => {
    if (!IS_EXTERNAL_API) return;
    void loadFromDb();
  }, []);

  useEffect(() => {
    if (!ioOpen) return;
    const h = (e: MouseEvent) => { if (!ioWrapRef.current?.contains(e.target as Node)) setIoOpen(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ioOpen]);

  // ── Cargar platillos desde DB y convertir al modelo frontend ───────────────
  async function loadFromDb() {
    try {
      const res = await fetch(apiUrl("/platillos/export.json"));
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      // El backend retorna { rows: [...] } con columnas snake_case
      const rows: Record<string,unknown>[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.rows) ? data.rows : [];
      if (!rows.length) return;
      setCategories(mapDbRows(rows));
    } catch {}
  }

  function mapDbRows(rows: Record<string,unknown>[]): Category[] {
    const colors = ["#e85d04","#2563eb","#059669","#7c3aed","#d97706","#0ea5e9"];
    const byCat = new Map<string|number, Category>();
    rows.forEach((r, idx) => {
      const catId  = r.categoria_id ?? 0;
      const catKey = String(catId);
      if (!byCat.has(catKey)) {
        byCat.set(catKey, {
          id: Number(catId) || idx+1,
          name: `Categoría ${catId}`,
          icon: "🍽️",
          color: colors[Math.abs(Number(catId)) % colors.length],
          items: [],
        });
      }
      const tags: TagKey[] = [];
      if (parseBool(r.es_popular,false)) tags.push("popular");
      if (parseBool(r.es_vegano,false)) tags.push("vegano");
      if (parseBool(r.es_picante,false)) tags.push("picante");
      if (parseBool(r.es_nuevo,false)) tags.push("nuevo");
      if (parseBool(r.es_sin_gluten,false)) tags.push("sin-gluten");
      byCat.get(catKey)!.items.push({
        id:      Number(r.id) || Date.now()+idx,
        name:    String(r.nombre ?? ""),
        description: String(r.descripcion_corta ?? r.descripcion ?? ""),
        price:   parseNumber(r.precio, 0),
        available: parseBool(r.disponible, true),
        tags,
        prepTime: parseNumber(r.tiempo_preparacion, 10),
        calories: 0,
      });
    });
    return Array.from(byCat.values()).sort((a,b) => a.id-b.id);
  }

  // ── handleImportFile — ahora abre el preview modal ─────────────────────────
  async function handleImportFile(file: File) {
    setImportBusy(true);
    try {
      const requested = pendingFormatRef.current;
      pendingFormatRef.current = null;
      const lower = file.name.toLowerCase();
      const isXlsx = lower.endsWith(".xlsx");
      const isJson = lower.endsWith(".json");

      // Validación formato vs archivo
      if (requested==="csv" && (isJson||isXlsx)) { alert("Archivo no es CSV."); return; }
      if (requested==="json" && !isJson) { alert("Archivo no es JSON."); return; }
      if (requested==="xlsx" && !isXlsx) { alert("Archivo no es Excel."); return; }

      // 1. Parsear archivo localmente
      let parsedRows: Array<Record<string,unknown>> = [];

      if (isJson) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) parsedRows = parsed;
        else if (Array.isArray(parsed?.rows)) parsedRows = parsed.rows;
        else if (Array.isArray(parsed?.categories)) {
          for (const cat of parsed.categories) {
            for (const item of cat.items??[]) parsedRows.push({...item, category:cat.name});
          }
        }
      } else if (isXlsx) {
        const XLSX = await import("xlsx");
        const buf  = await file.arrayBuffer();
        const wb   = XLSX.read(buf, { type:"array" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        parsedRows = XLSX.utils.sheet_to_json(ws, { defval:"" }) as Array<Record<string,unknown>>;
      } else {
        // CSV
        const text = await file.text();
        const grid = parseCsv(text);
        if (grid.length < 2) return;
        const [headerRow, ...dataRows] = grid;
        parsedRows = dataRows.map((cols) => {
          const obj: Record<string,unknown> = {};
          headerRow.forEach((h,i) => { obj[h.trim()] = cols[i]?.trim() ?? ""; });
          return obj;
        });
      }

      if (!parsedRows.length) { alert("El archivo no tiene datos."); return; }

      // 2. Obtener filas actuales de DB para calcular el diff
      let dbRows: Array<Record<string,unknown>> = [];
      if (IS_EXTERNAL_API) {
        try {
          const res = await fetch(apiUrl("/platillos/export.json"));
          if (res.ok) {
            const data = await res.json().catch(() => null);
            dbRows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
          }
        } catch {}
      }

      // 3. Abrir modal de preview
      setPreview({ file, parsedRows, dbRows });

    } catch (e: any) {
      alert(e?.message ?? "No se pudo leer el archivo.");
    } finally {
      setImportBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Callback cuando la importación es exitosa ───────────────────────────────
  async function handleImportSuccess(result: { inserted: number; updated: number }) {
    setPreview(null);
    alert(`✓ Importación exitosa\nInsertados: ${result.inserted}\nActualizados: ${result.updated}`);
    // Recargar menú desde DB
    if (IS_EXTERNAL_API) await loadFromDb();
  }

  // ── CRUD helpers ───────────────────────────────────────────────────────────
  function toggleItem(catId:number, itemId:number) {
    setCategories((cs)=>cs.map((c)=>c.id!==catId?c:{...c,items:c.items.map((i)=>i.id!==itemId?i:{...i,available:!i.available})}));
  }
  function deleteItem(catId:number, itemId:number) {
    if (!confirm("¿Eliminar este platillo?")) return;
    setCategories((cs)=>cs.map((c)=>c.id!==catId?c:{...c,items:c.items.filter((i)=>i.id!==itemId)}));
  }
  function saveItem(catId:number, data:Partial<MenuItem>) {
    setCategories((cs)=>cs.map((c)=>{
      if (c.id!==catId) return c;
      const exists = c.items.find((i)=>i.id===data.id);
      if (exists) return {...c,items:c.items.map((i)=>i.id===data.id?{...i,...data} as MenuItem:i)};
      return {...c,items:[...c.items,{id:Date.now(),name:data.name??"",description:data.description??"",price:data.price??0,available:data.available??true,tags:data.tags??[],prepTime:data.prepTime??10,calories:data.calories??0}]};
    }));
  }

  // ── Export helpers ─────────────────────────────────────────────────────────
  function exportJson() {
    const blob = new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),categories},null,2)],{type:"application/json"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`menu_${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  }
  function exportCsv() {
    const header = ["category","name","description","price","available","tags","prepTime","calories"];
    const lines  = [header.join(",")];
    categories.forEach((c)=>c.items.forEach((i)=>lines.push([csvEscape(c.name),csvEscape(i.name),csvEscape(i.description),csvEscape(i.price),csvEscape(i.available?1:0),csvEscape(i.tags.join("|")),csvEscape(i.prepTime),csvEscape(i.calories)].join(","))));
    const blob = new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`menu_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  }
  async function exportDbExcel() {
    setImportBusy(true);
    try { await downloadAsFile(apiUrl("/platillos/export/dishes/excel"),`platillos_${new Date().toISOString().slice(0,10)}.xlsx`); }
    finally { setImportBusy(false); }
  }
  async function downloadTemplate(fmt:"csv"|"json"|"xlsx") {
    setImportBusy(true);
    try {
      if (fmt==="xlsx") await downloadAsFile(apiUrl("/platillos/export/dishes/excel"),`template_platillos.xlsx`);
      else await downloadAsFile(apiUrl(`/platillos/template.${fmt}`),`template_platillos.${fmt}`);
    } finally { setImportBusy(false); }
  }
  function ensureApi() {
    if (!IS_EXTERNAL_API) { alert("Configura NEXT_PUBLIC_API_URL para usar importación desde DB."); return false; }
    return true;
  }

  const user = useSelector((state: RootState) => state.auth.user);
  function handleLogout() {}

  const totalItems   = categories.reduce((s,c)=>s+c.items.length,0);
  const availItems   = categories.reduce((s,c)=>s+c.items.filter((i)=>i.available).length,0);
  const popularItems = categories.reduce((s,c)=>s+c.items.filter((i)=>i.tags.includes("popular")).length,0);
  const avgPrice     = +(categories.flatMap((c)=>c.items).reduce((s,i)=>s+i.price,0)/(totalItems||1)).toFixed(0);
  const stats        = [
    {label:"Total Platillos",value:totalItems,sub:`${categories.length} categorías`,color:"#e85d04"},
    {label:"Disponibles",value:availItems,sub:`${totalItems-availItems} no disp.`,color:"#059669"},
    {label:"Populares",value:popularItems,sub:"con etiqueta ⭐",color:"#d97706"},
    {label:"Precio Promedio",value:`$${avgPrice}`,sub:"del menú completo",color:"#7c3aed"},
  ];
  const filterOpts = [{key:"all" as const,label:"Todos"},{key:"available" as const,label:"Disponibles"},{key:"unavailable" as const,label:"No disponibles"}];

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:T.fontBody,background:T.bgBase,color:T.textPrimary}}>
      {/* ── Preview Modal ── */}
      {preview && (
        <ImportPreviewModal
          file={preview.file}
          parsedRows={preview.parsedRows}
          dbRows={preview.dbRows}
          apiBase={API}
          onClose={() => setPreview(null)}
          onSuccess={handleImportSuccess}
        />
      )}

      <AdminSidebar activePage="menu" user={user} onLogout={handleLogout} />

      <main style={{flex:1,marginLeft:260,padding:"40px 48px"}}>
        {/* Header */}
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:36}}>
          <div>
            <h1 style={{fontFamily:T.fontDisplay,fontWeight:900,fontSize:32,letterSpacing:"-.03em",lineHeight:1.1,margin:"0 0 6px",color:T.textPrimary}}>Catálogo del Menú</h1>
            <p style={{fontSize:14,color:T.textMuted,margin:0}}>Administra platillos, categorías y disponibilidad</p>
          </div>
          <div ref={ioWrapRef} style={{display:"flex",alignItems:"center",gap:14,position:"relative"}}>
            <input ref={fileInputRef} type="file" accept=".csv,.json,.xlsx" style={{display:"none"}} onChange={(e)=>{ const f=e.target.files?.[0]; if(f) void handleImportFile(f); }}/>

            {/* Importar */}
            <div style={{position:"relative"}}>
              <button type="button" onClick={()=>setIoOpen((v)=>v==="import"?null:"import")} disabled={importBusy}
                style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,fontSize:13,fontWeight:700,border:`1px solid ${T.border}`,cursor:importBusy?"not-allowed":"pointer",color:T.textSecond,background:T.bgSurface,opacity:importBusy?0.7:1}}>
                <Upload size={16}/> {importBusy?"Cargando...":"Importar"}
              </button>
              {ioOpen==="import"&&(
                <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,minWidth:165,background:T.bgSurface,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:T.shadowCard,padding:6,zIndex:10}}>
                  {[
                    {label:"Plantilla CSV",   action:()=>{ setIoOpen(null); if(ensureApi()) void downloadTemplate("csv"); }},
                    {label:"Importar CSV",    action:()=>{ setIoOpen(null); if(ensureApi()){ pendingFormatRef.current="csv"; fileInputRef.current?.click(); }}},
                    null,
                    {label:"Plantilla JSON",  action:()=>{ setIoOpen(null); if(ensureApi()) void downloadTemplate("json"); }},
                    {label:"Importar JSON",   action:()=>{ setIoOpen(null); if(ensureApi()){ pendingFormatRef.current="json"; fileInputRef.current?.click(); }}},
                    null,
                    {label:"Plantilla Excel", action:()=>{ setIoOpen(null); if(ensureApi()) void downloadTemplate("xlsx"); }},
                    {label:"Importar Excel",  action:()=>{ setIoOpen(null); if(ensureApi()){ pendingFormatRef.current="xlsx"; fileInputRef.current?.click(); }}},
                  ].map((item, i) => item===null
                    ? <div key={i} style={{height:1,background:T.border,margin:"6px 8px"}}/>
                    : <button key={item.label} type="button" onClick={item.action} style={{width:"100%",display:"block",padding:"10px 12px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:700,color:T.textPrimary,textAlign:"left"}} onMouseEnter={(e)=>e.currentTarget.style.background=T.bgElevated} onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>{item.label}</button>
                  )}
                </div>
              )}
            </div>

            {/* Exportar */}
            <div style={{position:"relative"}}>
              <button type="button" onClick={()=>setIoOpen((v)=>v==="export"?null:"export")} disabled={importBusy}
                style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,fontSize:13,fontWeight:700,border:`1px solid ${T.border}`,cursor:importBusy?"not-allowed":"pointer",color:T.textSecond,background:T.bgSurface,opacity:importBusy?0.7:1}}>
                <Download size={16}/> {importBusy?"Cargando...":"Exportar"}
              </button>
              {ioOpen==="export"&&(
                <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,minWidth:165,background:T.bgSurface,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:T.shadowCard,padding:6,zIndex:10}}>
                  {[
                    {label:"CSV (local)",      action:()=>{ setIoOpen(null); exportCsv(); }},
                    {label:"JSON (local)",     action:()=>{ setIoOpen(null); exportJson(); }},
                    null,
                    {label:"Excel desde DB",   action:()=>{ setIoOpen(null); if(ensureApi()) void exportDbExcel(); }},
                  ].map((item, i) => item===null
                    ? <div key={i} style={{height:1,background:T.border,margin:"6px 8px"}}/>
                    : <button key={item.label} type="button" onClick={item.action} style={{width:"100%",display:"block",padding:"10px 12px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:700,color:T.textPrimary,textAlign:"left"}} onMouseEnter={(e)=>e.currentTarget.style.background=T.bgElevated} onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>{item.label}</button>
                  )}
                </div>
              )}
            </div>

            <div style={{width:1,height:28,background:T.border}}/>
            <button style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:12,fontSize:13,fontWeight:700,border:"none",cursor:"pointer",color:"#fff",background:T.brand,boxShadow:"0 4px 12px rgba(232,93,4,.28)"}}>
              <Plus size={15}/> Nueva Categoría
            </button>
          </div>
        </header>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:32}}>
          {stats.map((s)=>(
            <div key={s.label} style={{background:T.bgSurface,borderRadius:20,border:`1px solid ${T.border}`,padding:"20px 22px",boxShadow:T.shadowCard}}>
              <div style={{width:28,height:3,borderRadius:99,background:s.color,marginBottom:16}}/>
              <p style={{fontFamily:T.fontDisplay,fontSize:30,fontWeight:900,color:s.color,margin:"0 0 4px",letterSpacing:"-.03em"}}>{s.value}</p>
              <p style={{fontSize:12,fontWeight:700,color:T.textPrimary,margin:"0 0 2px"}}>{s.label}</p>
              <p style={{fontSize:11,color:T.textMuted,margin:0}}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:36}}>
          <div style={{position:"relative",flex:1,maxWidth:320}}>
            <Search size={15} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:T.textMuted,pointerEvents:"none"}}/>
            <input type="text" placeholder="Buscar platillo..." value={search} onChange={(e)=>setSearch(e.target.value)} onFocus={()=>setSearchFocus(true)} onBlur={()=>setSearchFocus(false)}
              style={{width:"100%",paddingLeft:36,paddingRight:14,paddingTop:10,paddingBottom:10,borderRadius:12,fontSize:14,fontFamily:T.fontBody,color:T.textPrimary,background:T.bgSurface,outline:"none",transition:"all .15s",boxSizing:"border-box",border:`1px solid ${searchFocus?T.brand:T.border}`,boxShadow:searchFocus?"0 0 0 3px rgba(232,93,4,.10)":"none"}}/>
          </div>
          <div style={{display:"flex",gap:4,padding:4,borderRadius:12,background:T.bgElevated,border:`1px solid ${T.border}`}}>
            {filterOpts.map((o)=>(
              <button key={o.key} onClick={()=>setFilterAvail(o.key)} style={{padding:"6px 14px",borderRadius:9,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",transition:"all .15s",background:filterAvail===o.key?T.bgSurface:"transparent",color:filterAvail===o.key?T.textPrimary:T.textMuted,boxShadow:filterAvail===o.key?"0 1px 4px rgba(26,18,8,0.1)":"none"}}>{o.label}</button>
            ))}
          </div>
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",border:`1px solid ${T.border}`,background:T.bgSurface,color:T.textSecond}}>
            <Filter size={14}/> Filtros
          </button>
        </div>

        {/* Categories */}
        {categories.map((cat)=>(
          <CategorySection key={cat.id} category={cat} search={search} filterAvail={filterAvail}
            onAdd={(cId)=>setModal({catId:cId,item:null})}
            onToggle={toggleItem} onEdit={(cId,item)=>setModal({catId:cId,item})} onDelete={deleteItem}/>
        ))}
      </main>

      {/* Item edit modal */}
      {modal&&<ItemModal catId={modal.catId} categories={categories} item={modal.item} onClose={()=>setModal(null)} onSave={saveItem}/>}
    </div>
  );
}
