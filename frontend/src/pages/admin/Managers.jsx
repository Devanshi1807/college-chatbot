import { useState, useEffect } from 'react';
import api from '../../api';
import { formatDate } from '../../utils';

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function FaqManager({ categories }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ categoryId: '', question: '', answer: '', keywords: '', priority: 0, isActive: true });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.getFaqs().then(setFaqs).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm({
      categoryId: categories[0]?.id || '',
      question: '',
      answer: '',
      keywords: '',
      priority: 0,
      isActive: true,
    });
    setModal('create');
  };

  const openEdit = (faq) => {
    setForm({
      categoryId: faq.categoryId,
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords || '',
      priority: faq.priority,
      isActive: faq.isActive,
    });
    setModal({ type: 'edit', id: faq.id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.createFaq(form);
      } else {
        await api.updateFaq(modal.id, form);
      }
      setModal(null);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await api.deleteFaq(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">FAQs ({faqs.length})</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          + Add FAQ
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {faq.category?.name}
                    </span>
                    {!faq.isActive && (
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="font-medium text-slate-800 text-sm">{faq.question}</p>
                  <p className="text-slate-600 text-sm mt-1 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(faq)} className="text-sm text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(faq.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add FAQ' : 'Edit FAQ'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Answer</label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              rows={5}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Keywords (for search)</label>
            <input
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="admission eapcet documents"
            />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                className="w-24 border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <span className="text-sm">Active</span>
            </label>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ department: '', phone: '', email: '', officeHours: '', location: '', isActive: true });

  const load = () => api.getContacts().then(setContacts);
  useEffect(load, []);

  const openCreate = () => {
    setForm({ department: '', phone: '', email: '', officeHours: '', location: '', isActive: true });
    setModal('create');
  };

  const openEdit = (c) => {
    setForm({ department: c.department, phone: c.phone || '', email: c.email || '', officeHours: c.officeHours || '', location: c.location || '', isActive: c.isActive });
    setModal({ type: 'edit', id: c.id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modal === 'create') await api.createContact(form);
    else await api.updateContact(modal.id, form);
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    await api.deleteContact(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Contacts</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">+ Add Contact</button>
      </div>
      <div className="space-y-2">
        {contacts.map((c) => (
          <div key={c.id} className="bg-white border rounded-lg p-4 flex justify-between">
            <div>
              <p className="font-medium">{c.department}</p>
              <p className="text-sm text-slate-600">{c.phone} · {c.email}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(c)} className="text-sm text-blue-600">Edit</button>
              <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Contact' : 'Edit Contact'}>
        <form onSubmit={handleSave} className="space-y-3">
          {['department', 'phone', 'email', 'officeHours', 'location'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required={field === 'department'}
              />
            </div>
          ))}
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg">Save</button>
        </form>
      </Modal>
    </div>
  );
}

export function DateManager() {
  const [dates, setDates] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', description: '', category: 'admission', isActive: true });

  const load = () => api.getDates().then(setDates);
  useEffect(load, []);

  const openCreate = () => {
    setForm({ title: '', date: '', description: '', category: 'admission', isActive: true });
    setModal('create');
  };

  const openEdit = (d) => {
    setForm({
      title: d.title,
     date: d.date ? d.date.slice(0, 10) : '',
      description: d.description || '',
      category: d.category,
      isActive: d.isActive,
    });
    setModal({ type: 'edit', id: d.id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modal === 'create') await api.createDate(form);
    else await api.updateDate(modal.id, form);
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this date?')) return;
    await api.deleteDate(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Important Dates</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">+ Add Date</button>
      </div>
      <div className="space-y-2">
        {dates.map((d) => (
          <div key={d.id} className="bg-white border rounded-lg p-4 flex justify-between">
            <div>
              <p className="font-medium">{d.title}</p>
              <p className="text-sm text-slate-600">
  {d.date ? formatDate(d.date) : "No Date"} · {d.category}
</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(d)} className="text-sm text-blue-600">Edit</button>
              <button onClick={() => handleDelete(d.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Date' : 'Edit Date'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2">
              <option value="admission">Admission</option>
              <option value="counseling">Counseling</option>
              <option value="reporting">Reporting</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg">Save</button>
        </form>
      </Modal>
    </div>
  );
}

export function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '', sortOrder: 0, isActive: true });

  const load = () => api.getCategories().then(setCategories);
  useEffect(load, []);

  const openCreate = () => {
    setForm({ name: '', description: '', icon: '', sortOrder: 0, isActive: true });
    setModal('create');
  };

  const openEdit = (c) => {
    setForm({ name: c.name, description: c.description || '', icon: c.icon || '', sortOrder: c.sortOrder, isActive: c.isActive });
    setModal({ type: 'edit', id: c.id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modal === 'create') await api.createCategory(form);
    else await api.updateCategory(modal.id, form);
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? All linked FAQs will also be deleted.')) return;
    await api.deleteCategory(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Categories</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">+ Add Category</button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {categories.map((c) => (
          <div key={c.id} className="bg-white border rounded-lg p-4 flex justify-between">
            <div>
              <p className="font-medium">{c.icon} {c.name}</p>
              <p className="text-xs text-slate-500">{c._count?.faqs ?? 0} FAQs</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(c)} className="text-sm text-blue-600">Edit</button>
              <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Category' : 'Edit Category'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="🎓" />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg">Save</button>
        </form>
      </Modal>
    </div>
  );
}
