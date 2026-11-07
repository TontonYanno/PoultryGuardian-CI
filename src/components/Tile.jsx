export default function Tile({icon,label,v,unit,pct,color}){
  return(<div className="panel p-4"><div className="flex justify-between text-[11px] tracking-widest uppercase text-mute"><span>{label}</span><span>{icon}</span></div>
    <div className="mt-1 text-3xl font-bold">{v}<span className="text-base font-normal text-mute ml-1">{unit}</span></div>
    <div className="h-1.5 mt-3 rounded-full bg-line overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{width:pct*100+'%',background:color}}/></div></div>);
}
