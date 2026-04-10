import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const TABS = ['characters', 'locations', 'lore']

const FIELDS = {
  characters: ['name', 'description', 'appearance', 'abilities', 'tags'],
  locations: ['name', 'description', 'geography', 'significance', 'tags'],
  lore: ['name', 'description', 'category', 'tags'],
}

function App() {
  const [activeTab, setActiveTab] = useState('characters')
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchEntries()
    setShowForm(false)
    setSelected(null)
    setSearch('')
  }, [activeTab])

  async function fetchEntries() {
    const { data } = await supabase.from(activeTab).select('*').order('created_at', { ascending: false })
    setEntries(data || [])
  }

  async function handleSubmit() {
    if (!form.name) return
    await supabase.from(activeTab).insert([form])
    setForm({})
    setShowForm(false)
    fetchEntries()
  }

  async function handleDelete(id) {
    await supabase.from(activeTab).delete().eq('id', id)
    setSelected(null)
    fetchEntries()
  }

  const filtered = entries.filter(e =>
    Object.values(e).some(v => v?.toString().toLowerCase().includes(search.toLowerCase()))
  )

  const fields = FIELDS[activeTab]

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', color: '#e5e7eb' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>📖 Lore Wiki</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '0.5rem 1.2rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
            background: activeTab === tab ? '#6366f1' : '#374151', color: 'white', textTransform: 'capitalize'
          }}>{tab}</button>
        ))}
      </div>

      {/* Search + Add */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: 'white' }}
        />
        <button onClick={() => { setShowForm(!showForm); setForm({}) }} style={{
          padding: '0.5rem 1.2rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
        }}>+ New Entry</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginTop: 0, textTransform: 'capitalize' }}>New {activeTab.slice(0, -1)}</h3>
          {fields.map(field => (
            <div key={field} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', textTransform: 'capitalize', color: '#9ca3af' }}>{field}</label>
              <textarea
                value={form[field] || ''}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                rows={field === 'description' ? 4 : 2}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #374151', background: '#111827', color: 'white', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleSubmit} style={{ padding: '0.5rem 1.2rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1.2rem', background: '#374151', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Entry list + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 2fr' : '1fr', gap: '1.5rem' }}>
        <div>
          {filtered.length === 0 && <p style={{ color: '#6b7280' }}>No entries yet.</p>}
          {filtered.map(entry => (
            <div key={entry.id} onClick={() => setSelected(entry)} style={{
              padding: '1rem', background: selected?.id === entry.id ? '#312e81' : '#1f2937',
              borderRadius: '8px', marginBottom: '0.75rem', cursor: 'pointer',
              border: selected?.id === entry.id ? '1px solid #6366f1' : '1px solid transparent'
            }}>
              <strong>{entry.name}</strong>
              {entry.tags && <p style={{ margin: '0.3rem 0 0', color: '#9ca3af', fontSize: '0.85rem' }}>{entry.tags}</p>}
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ background: '#1f2937', padding: '1.5rem', borderRadius: '8px', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>{selected.name}</h2>
              <button onClick={() => handleDelete(selected.id)} style={{
                padding: '0.4rem 0.8rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
              }}>Delete</button>
            </div>
            {fields.filter(f => f !== 'name').map(field => selected[field] && (
              <div key={field} style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.3rem', color: '#9ca3af', textTransform: 'capitalize', fontSize: '0.85rem' }}>{field}</p>
                <p style={{ margin: 0 }}>{selected[field]}</p>
              </div>
            ))}
            <button onClick={() => setSelected(null)} style={{
              marginTop: '1rem', padding: '0.4rem 0.8rem', background: '#374151', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App