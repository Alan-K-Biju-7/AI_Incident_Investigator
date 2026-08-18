import{mkdir,readFile,writeFile}from'node:fs/promises';import path from'node:path';import type{Incident}from'../src/types.js';import{demo}from'./seed.js';
const root=path.resolve('.data'),file=path.join(root,'incidents.json');let cache:Incident[]=[];
export async function init(){await mkdir(root,{recursive:true});try{cache=JSON.parse(await readFile(file,'utf8'))}catch{cache=[demo.incident];await persist()}}
const persist=()=>writeFile(file,JSON.stringify(cache,null,2));
export const list=()=>cache;
export const find=(id:string)=>cache.find(i=>i.id===id);
export async function add(input:Partial<Incident>){const now=new Date().toISOString();const incident:Incident={id:`inc-${Date.now()}`,number:1100+cache.length,title:input.title||'Untitled incident',description:input.description||'',severity:input.severity||'medium',status:'investigating',service:input.service||'unknown-service',environment:input.environment||'production',startTime:input.startTime||now,confidence:0,affectedComponents:input.affectedComponents||[],createdAt:now};cache.unshift(incident);await persist();return incident}
