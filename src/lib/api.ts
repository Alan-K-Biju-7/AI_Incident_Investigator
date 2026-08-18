import type {Incident,Investigation} from '../types';
const json=async<T>(r:Response):Promise<T>=>{if(!r.ok)throw new Error((await r.json().catch(()=>null))?.error||`Request failed (${r.status})`);return r.json()};
export const api={
  incidents:()=>fetch('/api/incidents').then(json<Incident[]>),
  investigation:(id:string)=>fetch(`/api/incidents/${id}/investigation`).then(json<Investigation>),
  create:(body:Partial<Incident>)=>fetch('/api/incidents',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}).then(json<Incident>),
  feedback:(incidentId:string,body:object)=>fetch(`/api/incidents/${incidentId}/feedback`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}).then(json<{ok:boolean}>),
  upload:(incidentId:string,file:File)=>{const data=new FormData();data.append('file',file);return fetch(`/api/incidents/${incidentId}/evidence`,{method:'POST',body:data}).then(json)},
};
