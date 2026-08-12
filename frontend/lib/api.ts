const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:5050/api';
export function token(){return typeof window!=='undefined'?localStorage.getItem('token'):null}
export function user(){if(typeof window==='undefined')return null;const raw=localStorage.getItem('user');return raw?JSON.parse(raw):null}
export async function api<T>(path:string,options:RequestInit={}){const headers=new Headers(options.headers);headers.set('Content-Type','application/json');const t=token();if(t)headers.set('Authorization',`Bearer ${t}`);const res=await fetch(`${API}${path}`,{...options,headers});if(!res.ok){const body=await res.json().catch(()=>({message:'Request failed'}));throw new Error(body.message||'Request failed')}return res.status===204?null as T:res.json() as Promise<T>}
export function logout(){localStorage.removeItem('token');localStorage.removeItem('user');window.location.href='/login'}
