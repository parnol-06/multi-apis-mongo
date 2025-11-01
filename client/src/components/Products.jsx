import React, { useEffect, useState } from 'react';
import { productsApi } from '../services/api';

function ProductForm({ onSaved, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price || '');

  useEffect(()=>{ setName(initial?.name || ''); setPrice(initial?.price || ''); }, [initial]);

  async function submit(e){
    e.preventDefault();
    try{
      const body = { name, price: Number(price) };
      if(initial?.id){
        await productsApi.put(`/products/${initial.id}`, body);
      } else {
        await productsApi.post('/products', body);
      }
      onSaved();
      setName(''); setPrice('');
    }catch(err){
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  }

  return (
    <form onSubmit={submit} style={{marginBottom:12}}>
      <input placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} required />
      <input placeholder="Precio" value={price} onChange={e=>setPrice(e.target.value)} required style={{marginLeft:8}} />
      <button type="submit" style={{marginLeft:8}}>{initial?.id ? 'Actualizar' : 'Crear'}</button>
    </form>
  );
}

export default function Products(){
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load(){
    const r = await productsApi.get('/products');
    setProducts(r.data);
  }

  useEffect(()=>{ load(); }, []);

  async function remove(id){
    if(!window.confirm('Eliminar producto?')) return;
    await productsApi.delete(`/products/${id}`);
    load();
  }

  return (
    <div>
      <h2>Productos</h2>
      <ProductForm onSaved={load} initial={editing} />
      <table border="1" cellPadding="6">
        <thead><tr><th>Id</th><th>Nombre</th><th>Precio</th><th>Acciones</th></tr></thead>
        <tbody>
          {products.map(p=>(
            <tr key={p._id || p.id}>
              <td>{p._id || p.id}</td>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>
                <button onClick={()=>setEditing({id: p._id || p.id, name: p.name, price: p.price})}>Editar</button>
                <button onClick={()=>remove(p._id || p.id)} style={{marginLeft:8}}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
