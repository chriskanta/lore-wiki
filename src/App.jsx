import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

const PASSWORD = 'AnniraKuris'

const FIELDS = {
  characters: ['name', 'description', 'appearance', 'abilities', 'status', 'affiliation', 'relationships', 'hair', 'eyes', 'build', 'tags'],
  locations: ['name', 'description', 'geography', 'significance', 'tags'],
  lore: ['name', 'description', 'category', 'tags'],
}

const INFOBOX_FIELDS = {
  characters: ['status', 'affiliation', 'relationships', 'hair', 'eyes', 'build'],
  locations: ['significance'],
  lore: ['category'],
}

const MAIN_FIELDS = {
  characters: ['description', 'appearance', 'abilities'],
  locations: ['description', 'geography'],
  lore: ['description'],
}

const SECTION_DESCRIPTIONS = {
  characters: 'A record of those who have shaped the course of events — warriors, heirs, and those caught between.',
  locations: 'The lands, settlements, and places of significance across the known world.',
  lore: 'The histories, factions, and forces that underpin the world as it is known.',
}

const EXAMPLE_CHARACTER = {
  id: '__example__',
  name: 'Soran Vael',
  status: 'Deceased',
  affiliation: 'The Grey Order',
  relationships: 'Kuris (Mentor)\nAnnira (Acquaintance)\nUnknown Commander (Killer)',
  hair: 'Silver-white, cropped close at the sides, longer on top',
  eyes: 'Grey, with a faint luminescence when Seiki is active',
  build: 'Tall and lean, broad-shouldered despite his age',
  tags: 'grey order, deceased, seiki master, mentor',
  description: `Soran Vael was a senior archivist of the Grey Order and one of the last practitioners of the Veil technique — a Seiki discipline focused entirely on concealment and misdirection rather than force. He was not a warrior in the conventional sense, though those who underestimated him on that basis did not make the mistake twice.

He spent the latter years of his life documenting the emerging conflict between the clans, believing that what was coming would be unlike anything the order had recorded before. His notes form the basis of much of what is contained in this archive.

He was killed during the fall of the eastern outpost, the circumstances of which remain disputed. His body was never recovered.`,
  appearance: `Vael was an older man of striking appearance — the kind of face that had clearly been handsome in youth and had aged into something more interesting. His silver hair and pale grey eyes gave him an almost spectral quality, an impression he was not above using to unsettle those he negotiated with.

He dressed plainly by the standards of the Grey Order, preferring undyed travelling clothes to ceremonial robes. He carried no visible weapon. Those who knew him well noted that he was never still — always watching, always cataloguing, with the quiet alertness of someone who had survived long enough to know that safety is an illusion.`,
  abilities: `Vael was a master of Seiki Suppression and Flow, with a particular specialisation in what practitioners of the Grey Order called the Veil — the ability to render one's Seiki signature invisible to other users. In practice this meant he could move through spaces where Seiki-sensitive individuals were present without being detected, a rare and difficult skill that took decades to develop.

He was also a capable teacher, known for adapting his instruction to the student rather than expecting the student to adapt to him. His methods were unconventional. His results were not.`,
  image_url: null,
}

const s = {
  page: { minHeight: '100vh', background: '#0f0f0f', color: '#d4c9b0', fontFamily: 'Georgia, serif' },
  nav: { borderBottom: '1px solid #2a2a2a', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: '#111' },
  navTitle: { fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#d4c9b0', padding: '1rem 0', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '0.05em' },
  navLink: { color: '#9a8f7a', fontSize: '0.9rem', cursor: 'pointer', padding: '1rem 0', borderBottom: '2px solid transparent' },
  navLinkActive: { color: '#d4c9b0', borderBottom: '2px solid #8b7355' },
  container: { maxWidth: '960px', margin: '0 auto', padding: '3rem 2rem' },
  hr: { border: 'none', borderTop: '1px solid #2a2a2a', margin: '2rem 0' },
  tag: { display: 'inline-block', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '3px', padding: '0.15rem 0.5rem', fontSize: '0.8rem', color: '#9a8f7a', marginRight: '0.4rem', marginBottom: '0.3rem' },
  entryCard: { borderBottom: '1px solid #1e1e1e', padding: '1rem 0', cursor: 'pointer' },
  input: { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#d4c9b0', fontFamily: 'Georgia, serif', fontSize: '0.95rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#d4c9b0', fontFamily: 'Georgia, serif', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' },
  btnPrimary: { padding: '0.4rem 1rem', background: '#2a2a2a', color: '#d4c9b0', border: '1px solid #3a3a3a', borderRadius: '3px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem' },
  btnDanger: { padding: '0.4rem 1rem', background: 'transparent', color: '#8b3a3a', border: '1px solid #5a2a2a', borderRadius: '3px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9rem' },
  label: { display: 'block', marginBottom: '0.3rem', color: '#6b6357', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  sectionLink: { display: 'block', padding: '1.2rem 1.5rem', background: '#141414', border: '1px solid #2a2a2a', borderRadius: '4px', marginBottom: '1rem', cursor: 'pointer' },
  infobox: { float: 'right', width: '260px', marginLeft: '2rem', marginBottom: '1rem', background: '#141414', border: '1px solid #2a2a2a', borderRadius: '4px', overflow: 'hidden' },
  infoboxHeader: { background: '#1e1a14', padding: '0.6rem 1rem', borderBottom: '1px solid #2a2a2a', textAlign: 'center' },
  infoboxRow: { padding: '0.5rem 1rem', borderBottom: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '0.2rem' },
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

function statusColour(status) {
  if (!status) return '#9a8f7a'
  const l = status.toLowerCase()
  if (l.includes('alive')) return '#4a7a4a'
  if (l.includes('deceased') || l.includes('dead')) return '#7a4a4a'
  if (l.includes('missing') || l.includes('unknown')) return '#7a6a3a'
  return '#9a8f7a'
}

function EntryForm({ onSave, onCancel, title, form, setForm, activeTab, imageFile, setImageFile, uploading }) {
  const fields = FIELDS[activeTab]
  return (
    <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ color: '#d4c9b0', marginTop: 0 }}>{title}</h3>
      {fields.map(field => (
        <div key={field} style={{ marginBottom: '1rem' }}>
          <label style={s.label}>{field}</label>
          <textarea
            value={form[field] || ''}
            onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
            rows={['description', 'relationships', 'appearance', 'abilities'].includes(field) ? 4 : 2}
            style={s.textarea}
          />
        </div>
      ))}
      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Image (optional)</label>
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ color: '#9a8f7a', fontSize: '0.9rem' }} />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={onSave} style={s.btnPrimary} disabled={uploading}>{uploading ? 'Uploading...' : 'Save Entry'}</button>
        <button onClick={onCancel} style={s.btnDanger}>Cancel</button>
      </div>
    </div>
  )
}

function EntryDetail({ entry, activeTab, onEdit, onDelete, onBack }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={s.infobox}>
        <div style={s.infoboxHeader}>
          <strong style={{ color: '#d4c9b0', fontSize: '0.95rem' }}>{entry.name}</strong>
        </div>
        {entry.image_url && (
          <img src={entry.image_url} alt={entry.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
        )}
        {INFOBOX_FIELDS[activeTab].map(field => entry[field] && (
          <div key={field} style={s.infoboxRow}>
            <span style={{ color: '#6b6357', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field}</span>
            {field === 'status'
              ? <span style={{ color: statusColour(entry[field]), fontSize: '0.9rem' }}>{entry[field]}</span>
              : <span style={{ color: '#b8ad98', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{entry[field]}</span>
            }
          </div>
        ))}
        {entry.tags && (
          <div style={s.infoboxRow}>
            <span style={{ color: '#6b6357', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</span>
            <div>{entry.tags.split(',').map(t => <span key={t} style={s.tag}>{t.trim()}</span>)}</div>
          </div>
        )}
      </div>

      <h1 style={{ fontSize: '2rem', color: '#d4c9b0', margin: '0 0 1.5rem' }}>{entry.name}</h1>
      {MAIN_FIELDS[activeTab].map(field => entry[field] && (
        <div key={field} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#9a8f7a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #2a2a2a', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>{field}</h3>
          <TextBlock text={entry[field]} />
        </div>
      ))}
      <div style={{ clear: 'both' }} />
      <hr style={s.hr} />
      {entry.id !== '__example__' && (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onEdit} style={s.btnPrimary}>Edit</button>
          <button onClick={() => onDelete(entry.id)} style={s.btnDanger}>Delete Entry</button>
        </div>
      )}
      {entry.id === '__example__' && (
        <p style={{ color: '#6b6357', fontStyle: 'italic', fontSize: '0.85rem' }}>This is an example entry and cannot be edited or deleted.</p>
      )}
    </div>
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
  const [showExample, setShowExample] = useState(false)

  useEffect(() => { fetchHomeText() }, [])

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
    setEntries((data || []).filter(e => e.category !== '__homepage__'))
  }

  useEffect(() => {
    if (authed && page !== 'home') fetchEntries()
    setSelected(null)
    setShowForm(false)
    setEditing(false)
    setSearch('')
    setShowExample(false)
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
    if (passwordInput === PASSWORD) { setAuthed(true); setPasswordError(false) }
    else setPasswordError(true)
  }

  function navigate(destination, tab = null) {
    setPage(destination)
    if (tab) setActiveTab(tab)
  }

  const filteredEntries = entries.filter(e =>
    Object.values(e).some(v => v?.toString().toLowerCase().includes(search.toLowerCase()))
  )

  if (!authed) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '340px', width: '100%', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#d4c9b0', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>LORE WIKI</h1>
          <p style={{ color: '#6b6357', fontSize: '0.9rem', marginBottom: '2rem' }}>This record is restricted.</p>
          <input type="password" placeholder="Enter passphrase" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ ...s.input, marginBottom: '0.75rem', textAlign: 'center' }} />
          {passwordError && <p style={{ color: '#8b3a3a', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>Incorrect passphrase.</p>}
          <button onClick={handleLogin} style={{ ...s.btnPrimary, width: '100%' }}>Enter</button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle} onClick={() => navigate('home')}>⬡ WORLD RECORD</span>
        {['characters', 'locations', 'lore'].map(tab => (
          <span key={tab} onClick={() => navigate('section', tab)} style={{ ...s.navLink, ...(page === 'section' && activeTab === tab ? s.navLinkActive : {}) }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </span>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ ...s.navLink, fontSize: '0.8rem' }} onClick={() => setAuthed(false)}>Lock</span>
        </div>
      </nav>

      {/* Home */}
      {page === 'home' && (
        <div style={s.container}>
          <p style={{ color: '#6b6357', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>World Record — Public Archive</p>
          <h1 style={{ fontSize: '2.2rem', color: '#d4c9b0', margin: '0 0 0.5rem', letterSpacing: '0.05em' }}>[WORLD NAME]</h1>
          <p style={{ color: '#9a8f7a', fontSize: '1rem', marginBottom: '2rem', fontStyle: 'italic' }}>As recorded by those who lived it.</p>
          <hr style={s.hr} />
          {editingHome ? (
            <>
              <textarea value={homeTextDraft} onChange={e => setHomeTextDraft(e.target.value)} rows={12} style={{ ...s.textarea, marginBottom: '1rem' }} placeholder="Write the world introduction here. Press Enter for new paragraphs." />
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={saveHomeText} style={s.btnPrimary}>Save</button>
                <button onClick={() => setEditingHome(false)} style={s.btnDanger}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              {homeText ? <TextBlock text={homeText} /> : <p style={{ color: '#6b6357', fontStyle: 'italic' }}>No introduction written yet.</p>}
              <button onClick={() => { setHomeTextDraft(homeText); setEditingHome(true) }} style={{ ...s.btnPrimary, marginBottom: '2rem' }}>Edit Introduction</button>
            </>
          )}
          <hr style={s.hr} />
          <h3 style={{ color: '#9a8f7a', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Browse the Archive</h3>
          {[
            { tab: 'characters', label: 'Characters', desc: SECTION_DESCRIPTIONS.characters },
            { tab: 'locations', label: 'Locations', desc: SECTION_DESCRIPTIONS.locations },
            { tab: 'lore', label: 'Lore', desc: SECTION_DESCRIPTIONS.lore },
          ].map(({ tab, label, desc }) => (
            <div key={tab} style={s.sectionLink} onClick={() => navigate('section', tab)}>
              <strong style={{ color: '#d4c9b0' }}>{label}</strong>
              <p style={{ margin: '0.3rem 0 0', color: '#6b6357', fontSize: '0.9rem' }}>{desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Section list */}
      {page === 'section' && !selected && !showExample && (
        <div style={s.container}>
          <p style={{ color: '#6b6357', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Archive — {activeTab}</p>
          <h1 style={{ fontSize: '1.8rem', color: '#d4c9b0', margin: '0.3rem 0 0.5rem' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <p style={{ color: '#9a8f7a', fontStyle: 'italic', marginBottom: '1.5rem' }}>{SECTION_DESCRIPTIONS[activeTab]}</p>
          <hr style={s.hr} />
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <input placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...s.input, flex: 1 }} />
            <button onClick={() => { setShowForm(!showForm); setForm({}) }} style={s.btnPrimary}>+ New Entry</button>
            {activeTab === 'characters' && (
              <button onClick={() => setShowExample(true)} style={{ ...s.btnPrimary, color: '#9a8f7a', borderColor: '#2a2a2a' }}>Example</button>
            )}
          </div>
          {showForm && (
            <EntryForm
              title={`New ${activeTab.slice(0, -1)}`}
              onSave={handleSubmit}
              onCancel={() => setShowForm(false)}
              form={form}
              setForm={setForm}
              activeTab={activeTab}
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploading={uploading}
            />
          )}
          {filteredEntries.length === 0 && <p style={{ color: '#6b6357', fontStyle: 'italic' }}>No entries recorded.</p>}
          {filteredEntries.map(entry => (
            <div key={entry.id} style={s.entryCard} onClick={() => setSelected(entry)}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {entry.image_url && <img src={entry.image_url} alt={entry.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #2a2a2a', flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <strong style={{ color: '#d4c9b0', fontSize: '1.05rem' }}>{entry.name}</strong>
                    {entry.status && <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '3px', border: `1px solid ${statusColour(entry.status)}`, color: statusColour(entry.status) }}>{entry.status}</span>}
                  </div>
                  {entry.description && <p style={{ margin: '0.3rem 0 0.5rem', color: '#9a8f7a', fontSize: '0.9rem', lineHeight: '1.6' }}>{entry.description.slice(0, 120)}{entry.description.length > 120 ? '...' : ''}</p>}
                  {entry.tags && entry.tags.split(',').map(t => <span key={t} style={s.tag}>{t.trim()}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Example page */}
      {page === 'section' && showExample && (
        <div style={s.container}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <p style={{ color: '#6b6357', fontSize: '0.85rem', cursor: 'pointer', margin: 0 }} onClick={() => setShowExample(false)}>← Back to characters</p>
            <span style={{ background: '#1e1a14', border: '1px solid #3a3218', color: '#8b7a3a', fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '3px' }}>Example Entry</span>
          </div>
          <hr style={s.hr} />
          <EntryDetail entry={EXAMPLE_CHARACTER} activeTab="characters" onBack={() => setShowExample(false)} />
        </div>
      )}

      {/* Entry detail */}
      {page === 'section' && selected && !showExample && (
        <div style={s.container}>
          <p style={{ color: '#6b6357', fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setSelected(null)}>← Back to {activeTab}</p>
          <hr style={s.hr} />
          {editing ? (
            <EntryForm
              title={`Editing: ${selected.name}`}
              onSave={handleUpdate}
              onCancel={() => setEditing(false)}
              form={form}
              setForm={setForm}
              activeTab={activeTab}
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploading={uploading}
            />
          ) : (
            <EntryDetail
              entry={selected}
              activeTab={activeTab}
              onEdit={() => { setForm({ ...selected }); setEditing(true) }}
              onDelete={handleDelete}
              onBack={() => setSelected(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}