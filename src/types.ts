export type Severity='critical'|'high'|'medium'|'low';
export type Status='investigating'|'resolved'|'monitoring';
export interface Incident{id:string;number:number;title:string;description:string;severity:Severity;status:Status;service:string;environment:string;startTime:string;confidence:number;affectedComponents:string[];rootCause?:string;createdAt:string}
export interface Evidence{id:string;name:string;type:'log'|'metric'|'deployment'|'git'|'chat'|'image'|'report'|'architecture';size:string;status:'ready'|'processing'|'failed';confidence:number;coverage:string;entities:string[];excerpt:string;reliability:number}
export interface TimelineEvent{id:string;time:string;title:string;detail:string;kind:string;evidenceIds:string[];confidence:number}
export interface ScoreBreakdown{direct:number;temporal:number;independent:number;verification:number;plausibility:number;contradiction:number;total:number}
export interface Hypothesis{id:string;rank:number;title:string;summary:string;confidence:number;status:'leading'|'alternative'|'rejected'|'accepted';supporting:string[];contradicting:string[];missing:string[];score:ScoreBreakdown}
export interface Recommendation{id:string;category:'Immediate mitigation'|'Short-term fix'|'Long-term prevention'|'Observability';title:string;detail:string;evidenceIds:string[];done:boolean}
export interface TraceItem{id:string;at:string;type:'plan'|'tool'|'finding'|'verification';title:string;summary:string;tool?:string;durationMs?:number;status:'complete'|'active'}
export interface GraphNode{id:string;label:string;type:string;x:number;y:number;confidence?:number}
export interface GraphEdge{id:string;source:string;target:string;label:string;strength:number}
export interface MetricPoint{time:string;latency:number;errors:number;pool:number;cpu:number}
export interface Investigation{incident:Incident;evidence:Evidence[];timeline:TimelineEvent[];hypotheses:Hypothesis[];recommendations:Recommendation[];trace:TraceItem[];graph:{nodes:GraphNode[];edges:GraphEdge[]};metrics:MetricPoint[]}
