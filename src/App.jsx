import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

const PASSWORD = 'AnniraKuris'

const FIELDS = {
  characters: ['name', 'description', 'appearance', 'abilities', 'tags'],
  locations: ['name', 'description', 'geography', 'significance', 'tags'],
  lore: ['name', 'description', 'category', 'tags'],
}

const SECTION_DESCRIPTIONS = {
  characters: 'A record of those who have shaped the course of events — warriors, heirs, and those caught between.',
  locations: 'The lands, settlements, and places of significance across the known world.',
  lore: 'The histories, factions, and forces that underpin the world as it is known.',
}

function TextBlock({ text }) {
  if (!text) return null
  return (
    <>
      {text.split('\n').map((line, i) => (
        <p key={i} style={{ lineHeight: '1.9', color: '#b8ad98', margin: '0 0 0.8rem' }}>
          {line || <br />}
        </p>
      ))}
    </>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [page, setPage] = useState('home')
  const [activeTab, setActiveTab] = useState('characters')
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [search, setSearch] = useState('')
  const [homeText, setHomeText] = useState('')
  const [editingHome, setEditingHome] = useState(false)
  const [homeTextDraft, setHomeTextDraft] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchHomeText()
  }, [])

  async function fetchHomeText() {
    const { data } = await supabase.from('lore').select('*').eq('category', '__homepage__').single()
    if (data) setHomeText(data.description || '')
  }

  async function saveHomeText() {
    const { data } = await supabase.from('lore').select('*').eq('category', '__homepage__').single()
    if (data) {
      await supabase.from('lore').update({ description: homeTextDraft }).eq('id', data.id)
    } else {
      await supabase.from('lore').insert([{ name: 'Homepage', description: homeTextDraft, category: '__homepage__' }])
    }
    setHomeText(homeTextDraft)
    setEditingHome(false)
  }

  async function fetchEntries() {
    const { data } = await supabase.from(activeTab).select('*').order('name', { ascending: true })
    const filtered = (data || []).filter(e => e.category !== '__homepage__')
    setEntries(filtered)
  }

  useEffect(() => {
    if (authed && page !== 'home') fetchEntries()
    setSelected(null)
    setShowForm(false)
    setEditing(false)
    setSearch('')
  }, [page, authed, activeTab])

  async function uploadImage() {
    if (!imageFile) return null
    setUploading(true)
    const ext = imageFile.name.split('.').pop()
    const filename = `${uuidv4()}.${ext}`
    const { error } = await supabase.storage.from('images').upload(filename, imageFile)
    setUploading(false)
    if (error) { console.error(error); return null }
    const { data } = supabase.storage.from('images').getPublicUrl(filename)
    return data.publicUrl
  }

  async function handleSubmit() {
    if (!form.name) return
    const image_url = await uploadImage()
    await supabase.from(activeTab).insert([{ ...form, image_url }])
    setForm({})
    setImageFile(null)
    setShowForm(false)
    fetchEntries()
  }

  async function handleUpdate() {
    if (!form.name) return
    let image_url = selected.image_url
    if (imageFile) image_url = await uploadImage()
    await supabase.from(activeTab).update({ ...form, image_url }).eq('id', selected.id)
    setSelected({ ...selected, ...form, image_url })
    setEditing(false)
    setImageFile(null)
    fetchEntries()
  }

  async function handleDelete(id) {
    await supabase.from(activeTab).delete().eq('id', id)
    setSelected(null)
    fetchEntries()
  }

  function handleLogin() {
    if (passwordInput === PASSWORD) {
      setAuthed(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  function navigate(destination, tab = null) {
    setPage(destination)
    if (tab) setActiveTab(tab)
  }

  const filteredEntries = entries.filter(e =>
    Object.values(e).some(v => v?.toString().toLowerCase().includes(search.toLowerCase()))
  )

  const fields = FIELDS[activeTab]

  const styles = {
    page: { minHeight: '100vh', background: '#0f0f0f', color: '#d4c9b0', fontFamily: 'Georgia, serif' },
    nav: { borderBottom: '1px solid #2a2a2a', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: '#111' },
    navTitle: { fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#d4c9b0', padding: '1rem 0', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '0.05em' },
    navLink: { color: '#9a8f7a', fontSize: '0.9rem', cursor: 'pointer', padding: '1rem 0', borderBottom: '2px solid transparent' },
    navLinkActive: { color: '#d4c9b0', borderBottom: '2px solid #8b7355' },
    navRight: { marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' },
    container: { maxWidth: '860px', margin: '0 auto', padding: '3rem 2rem' },
    hr: { border: 'none', borderTop: '1px solid #2a2a2a', margin: '2rem 0' },
    tag: { display: 'inline-block', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '3px', padding: '0.15rem 0.5rem', fontSize: '0.8rem', color: '#9a8f7a', marginRight: '0.4rem', marginBottom: '0.3rem' },
    entryCard: { borderBottom: '1px solid #1e1e1e', padding: '1rem 0', cursor: 'pointer' },
    input: { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#d4c9b0', fontFamily: 'Georgia, serif', fontSize: '0.95rem', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#d4c9b0', fontFamily: 'Georgia, serif', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' },
    btnPrimary: { padding: '0.4rem 1rem', background: '#2a2a2a', color: '#d4c9b0', border: '1px solid #3a3a3a', borderRadius: '3px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem' },
    btnDanger: { padding: '0.4rem 1rem', background: 'transparent', color: '#8b3a3a', border: '1px solid #5a2a2a', borderRadius: '3px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem' },
    label: { display: 'block', marginBottom: '0.3rem', color: '#6b6357', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    sectionLink: { display: 'block', padding: '1.2rem 1.5rem', background: '#141414', border: '1px solid #2a2a2a', borderRadius: '4px', marginBottom: '1rem', cursor: 'pointer' },
  }

  const EntryForm = ({ onSave, onCancel, title }) => (
    <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ color: '#d4c9b0', marginTop: 0 }}>{title}</h3>
      {fields.map(field => (
        <div key={field} style={{ marginBottom: '1rem' }}>
          <label style={styles.label}>{field}</label>
          <textarea value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} rows={field === 'description' ? 5 : 2} style={styles.textarea} />
        </div>
      ))}
      <div style={{ marginBottom: '1rem' }}>
        <label style={styles.label}>Image (optional)</label>
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ color: '#9a8f7a', fontSize: '0.9rem' }} />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={onSave} style={styles.btnPrimary} disabled={uploading}>{uploading ? 'Uploading...' : 'Save Entry'}</button>
        <button onClick={onCancel} style={styles.btnDanger}>Cancel</button>
      </div>
    </div>
  )

  if (!authed) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '340px', width: '100%', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#d4c9b0', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>LORE WIKI</h1>
          <p style={{ color: '#6b6357', fontSize: '0.9rem', marginBottom: '2rem' }}>This record is restricted.</p>
          <input type="password" placeholder="Enter passphrase" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ ...styles.input, marginBottom: '0.75rem', textAlign: 'center' }} />
          {passwordError && <p style={{ color: '#8b3a3a', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>Incorrect passphrase.</p>}
          <button onClick={handleLogin} style={{ ...styles.btnPrimary, width: '100%' }}>Enter</button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navTitle} onClick={() => navigate('home')}>⬡ WORLD RECORD</span>
        {['characters', 'locations', 'lore'].map(tab => (
          <span key={tab} onClick={() => navigate('section', tab)} style={{ ...styles.navLink, ...(page === 'section' && activeTab === tab ? styles.navLinkActive : {}) }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </span>
        ))}
        <div style={styles.navRight}>
          <span style={{ ...styles.navLink, fontSize: '0.8rem' }} onClick={() => setAuthed(false)}>Lock</span>
        </div>
      </nav>

      {/* Home Page */}
      {page === 'home' && (
        <div style={styles.container}>
          <p style={{ color: '#6b6357', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>World Record — Public Archive</p>
          <h1 style={{ fontSize: '2.2rem', color: '#d4c9b0', margin: '0 0 0.5rem', letterSpacing: '0.05em' }}>[WORLD NAME]</h1>
          <p style={{ color: '#9a8f7a', fontSize: '1rem', marginBottom: '2rem', fontStyle: 'italic' }}>As recorded by those who lived it.</p>
          <hr style={styles.hr} />

          {editingHome ? (
            <>
              <textarea
                value={homeTextDraft}
                onChange={e => setHomeTextDraft(e.target.value)}
                rows={12}
                style={{ ...styles.textarea, marginBottom: '1rem' }}
                placeholder="Write the world introduction here. Press Enter for new paragraphs."
              />
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={saveHomeText} style={styles.btnPrimary}>Save</button>
                <button onClick={() => setEditingHome(false)} style={styles.btnDanger}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              {homeText ? <TextBlock text={homeText} /> : (
                <p style={{ color: '#6b6357', fontStyle: 'italic' }}>No introduction written yet. Click Edit to add one.</p>
              )}
              <button onClick={() => { setHomeTextDraft(homeText); setEditingHome(true) }} style={{ ...styles.btnPrimary, marginBottom: '2rem' }}>Edit Introduction</button>
            </>
          )}

          <hr style={styles.hr} />
          <h3 style={{ color: '#9a8f7a', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Browse the Archive</h3>
          {[
            { tab: 'characters', label: 'Characters', desc: SECTION_DESCRIPTIONS.characters },
            { tab: 'locations', label: 'Locations', desc: SECTION_DESCRIPTIONS.locations },
            { tab: 'lore', label: 'Lore', desc: SECTION_DESCRIPTIONS.lore },
          ].map(({ tab, label, desc }) => (
            <div key={tab} style={styles.sectionLink} onClick={() => navigate('section', tab)}>
              <strong style={{ color: '#d4c9b0', fontSize: '1rem' }}>{label}</strong>
              <p style={{ margin: '0.3rem 0 0', color: '#6b6357', fontSize: '0.9rem' }}>{desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Section Page */}
      {page === 'section' && !selected && (
        <div style={styles.container}>
          <p style={{ color: '#6b6357', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Archive — {activeTab}</p>
          <h1 style={{ fontSize: '1.8rem', color: '#d4c9b0', margin: '0.3rem 0 0.5rem' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <p style={{ color: '#9a8f7a', fontStyle: 'italic', marginBottom: '1.5rem' }}>{SECTION_DESCRIPTIONS[activeTab]}</p>
          <hr style={styles.hr} />
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <input placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...styles.input, flex: 1 }} />
            <button onClick={() => { setShowForm(!showForm); setForm({}) }} style={styles.btnPrimary}>+ New Entry</button>
          </div>
          {showForm && <EntryForm title={`New ${activeTab.slice(0, -1)}`} onSave={handleSubmit} onCancel={() => setShowForm(false)} />}
          {filteredEntries.length === 0 && <p style={{ color: '#6b6357', fontStyle: 'italic' }}>No entries recorded.</p>}
          {filteredEntries.map(entry => (
            <div key={entry.id} style={styles.entryCard} onClick={() => setSelected(entry)}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {entry.image_url && <img src={entry.image_url} alt={entry.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #2a2a2a' }} />}
                <div>
                  <strong style={{ color: '#d4c9b0', fontSize: '1.05rem' }}>{entry.name}</strong>
                  {entry.description && <p style={{ margin: '0.3rem 0 0.5rem', color: '#9a8f7a', fontSize: '0.9rem', lineHeight: '1.6' }}>{entry.description.slice(0, 120)}{entry.description.length > 120 ? '...' : ''}</p>}
                  {entry.tags && entry.tags.split(',').map(t => <span key={t} style={styles.tag}>{t.trim()}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entry Detail */}
      {page === 'section' && selected && (
        <div style={styles.container}>
          <p style={{ color: '#6b6357', fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setSelected(null)}>← Back to {activeTab}</p>
          <hr style={styles.hr} />
          {editing ? (
            <EntryForm title={`Editing: ${selected.name}`} onSave={handleUpdate} onCancel={() => setEditing(false)} />
          ) : (
            <>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                {selected.image_url && (
                  <img src={selected.image_url} alt={selected.name} style={{ width: '180px', height: '180px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2a2a2a', flexShrink: 0 }} />
                )}
                <div>
                  <h1 style={{ fontSize: '2rem', color: '#d4c9b0', margin: '0 0 0.5rem' }}>{selected.name}</h1>
                  {selected.tags && <div>{selected.tags.split(',').map(t => <span key={t} style={styles.tag}>{t.trim()}</span>)}</div>}
                </div>
              </div>
              <hr style={styles.hr} />
              {fields.filter(f => f !== 'name' && f !== 'tags').map(field => selected[field] && (
                <div key={field} style={{ marginBottom: '1.5rem' }}>
                  <p style={{ ...styles.label, marginBottom: '0.5rem' }}>{field}</p>
                  <TextBlock text={selected[field]} />
                </div>
              ))}
              <hr style={styles.hr} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => { setForm({ ...selected }); setEditing(true) }} style={styles.btnPrimary}>Edit</button>
                <button onClick={() => handleDelete(selected.id)} style={styles.btnDanger}>Delete Entry</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}