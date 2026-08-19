import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import { mkdir, unlink } from 'node:fs/promises';
import { demo } from './seed.js';
import { add, find, init, list } from './store.js';
import { validateEvidenceUpload } from './ingestion.js';
import { createProvenance } from './provenance.js';

export async function createApp() {
  await init(); await mkdir('uploads',{recursive:true});
  const app=express(); app.use(cors()); app.use(express.json({limit:'1mb'}));
  const upload=multer({dest:'uploads/',limits:{fileSize:(Number(process.env.MAX_UPLOAD_MB)||20)*1024*1024},fileFilter:(_request,file,callback)=>callback(null,!file.originalname.includes('..'))});
  app.get('/api/health',(_request,response)=>response.json({status:'ok',provider:process.env.LLM_PROVIDER||'mock'}));
  app.get('/api/incidents',(_request,response)=>response.json(list()));
  app.post('/api/incidents',async(request,response)=>response.status(201).json(await add(request.body)));
  app.get('/api/incidents/:id/investigation',(request,response)=>{const id=String(request.params.id);const incident=find(id);if(!incident)return response.status(404).json({error:'Incident not found'});return response.json(id===demo.incident.id?demo:{...demo,incident,evidence:[],timeline:[],hypotheses:[],recommendations:[],trace:[],metrics:[]})});
  app.post('/api/incidents/:id/evidence',upload.single('file'),async(request,response)=>{if(!find(String(request.params.id))){if(request.file)await unlink(request.file.path).catch(()=>undefined);return response.status(404).json({error:'Incident not found'})}if(!request.file)return response.status(400).json({error:'Safe file required'});const validation=await validateEvidenceUpload(request.file);if(!validation.accepted){await unlink(request.file.path).catch(()=>undefined);return response.status(415).json({error:validation.reason})}const provenance=createProvenance({sha256:validation.sha256!,originalName:validation.safeName,origin:'human-upload',parser:`${validation.detectedType}/pending`});return response.status(201).json({id:request.file.filename,name:validation.safeName,status:'processing',size:request.file.size,sha256:validation.sha256,detectedType:validation.detectedType,provenance})});
  app.post('/api/incidents/:id/feedback',(request,response)=>response.json({ok:true,recordedAt:new Date().toISOString(),feedback:request.body}));
  app.get('/api/incidents/:id/stream',(request,response)=>{response.setHeader('Content-Type','text/event-stream');response.setHeader('Cache-Control','no-cache');let index=0;const timer=setInterval(()=>{const item=demo.trace[index++];if(!item){response.write('event: complete\ndata: {}\n\n');clearInterval(timer);return response.end()}response.write(`event: trace\ndata: ${JSON.stringify(item)}\n\n`)},650);request.on('close',()=>clearInterval(timer))});
  app.use(express.static(path.resolve('dist')));app.get('/{*splat}',(_request,response)=>response.sendFile(path.resolve('dist/index.html')));
  app.use((error:Error,_request:express.Request,response:express.Response,_next:express.NextFunction)=>{console.error(JSON.stringify({level:'error',message:error.message}));if(error instanceof multer.MulterError&&error.code==='LIMIT_FILE_SIZE')return response.status(413).json({error:'Evidence file exceeds the configured size limit'});return response.status(500).json({error:'Request could not be completed'})});
  return app;
}
