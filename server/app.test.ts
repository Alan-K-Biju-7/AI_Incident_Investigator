import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

describe('evidence ingestion API', async () => {
  const app = await createApp();
  it('accepts safe evidence and returns traceable metadata', async () => {
    const response=await request(app).post('/api/incidents/inc-1042/evidence').attach('file',Buffer.from('2026-08-19T03:32:00Z ERROR pool timeout'),'checkout.log');
    expect(response.status).toBe(201);expect(response.body).toMatchObject({name:'checkout.log',detectedType:'log',status:'processing',provenance:{origin:'human-upload',parser:'log/pending'}});expect(response.body.sha256).toHaveLength(64);
  });
  it('rejects unsupported evidence types',async()=>{const response=await request(app).post('/api/incidents/inc-1042/evidence').attach('file',Buffer.from('binary'),'payload.exe');expect(response.status).toBe(415);expect(response.body.error).toBe('Unsupported evidence extension')});
  it('rejects uploads for incidents outside the workspace',async()=>{const response=await request(app).post('/api/incidents/missing/evidence').attach('file',Buffer.from('evidence'),'checkout.log');expect(response.status).toBe(404)});
});
