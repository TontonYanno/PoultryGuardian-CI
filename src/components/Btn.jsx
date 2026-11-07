const Btn=({on,danger,...p})=><button {...p} className={`px-3 py-2 rounded-xl text-sm font-medium border transition ${danger?'bg-red-600 border-red-500 text-white':on?'bg-amber-400 text-black border-amber-300':'border-line hover:bg-surface'} ${p.className||''}`}/>;
export default Btn
