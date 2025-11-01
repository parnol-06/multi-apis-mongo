import React, { useEffect, useState } from 'react';
import { usersApi } from '../services/api';

function UserForm({ onSaved, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [email, setEmail] = useState(initial?.email || '');

  useEffect(()=>{ setName(initial?.name || ''); setEmail(initial?.email || ''); }, [initial]);

  async function submit(e){
    e.preventDefault();
    try{
      if(initial?.id){
        await usersApi.put(`/users/${initial.id}`, { name, email });
      } else {
        await usersApi.post('/users', { name, email });
      }
      onSaved();
      setName(''); setEmail('');
    }catch(err){
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  }

  return (
    <form onSubmit={submit} style={{marginBottom:12}}>
      <input placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} required />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{marginLeft:8}} />
      <button type="submit" style={{marginLeft:8}}>{initial?.id ? 'Actualizar' : 'Crear'}</button>
    </form>
  );
}

export default function Users(){
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load(){
    const r = await usersApi.get('/users');
    setUsers(r.data);
  }

  useEffect(()=>{ load(); }, []);

  async function remove(id){
    if(!window.confirm('Eliminar usuario?')) return;
    await usersApi.delete(`/users/${id}`);
    load();
  }

  return (
    <div>
      <h2>Usuarios</h2>
      <UserForm onSaved={load} initial={editing} />
      <table border="1" cellPadding="6">
        <thead><tr><th>Id</th><th>Nombre</th><th>Email</th><th>Acciones</th></tr></thead>
        <tbody>
          {users.map(u=>(
            <tr key={u.id || u._id}>
              <td>{u.id || u._id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <button onClick={()=>setEditing({id: u.id, name: u.name, email: u.email})}>Editar</button>
                <button onClick={()=>remove(u.id)} style={{marginLeft:8}}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
