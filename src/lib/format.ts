export const pct=(value:number)=>`${Math.round(value*100)}%`;
export const time=(iso:string)=>new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso));
export const since=(iso:string)=>{const minutes=Math.max(1,Math.floor((Date.now()-new Date(iso).getTime())/60000));return minutes<60?`${minutes}m ago`:minutes<1440?`${Math.floor(minutes/60)}h ago`:`${Math.floor(minutes/1440)}d ago`};
export const initials=(name:string)=>name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
