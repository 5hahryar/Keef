import { useState } from "react";

export default function LoginForm({ onSubmit, loading }: { onSubmit: (u: string, p: string) => Promise<void>, loading: boolean }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    
    return (
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(username, password) }}>
        <input 
          type="text" 
          placeholder="نام کاربری" 
          className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="رمز عبور" 
          className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading} className="w-full rounded-pill bg-brand-blue text-white py-3 text-lg disabled:opacity-50">
          {loading ? 'در حال ورود...' : 'ورود'}
        </button>
      </form>
    )
  }