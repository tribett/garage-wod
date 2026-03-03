import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllTerms } from '@/lib/glossary'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'

export function GlossaryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const allTerms = useMemo(() => getAllTerms(), [])

  const filtered = useMemo(() => {
    if (!search.trim()) return allTerms
    const q = search.toLowerCase()
    return allTerms.filter(
      (entry) =>
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q),
    )
  }, [allTerms, search])

  return (
    <div className="animate-fade-in">
      <Header
        title="Glossary"
        subtitle={`${allTerms.length} CrossFit terms`}
        rightAction={
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Back
          </button>
        }
      />

      <div className="px-5 space-y-4 pb-8">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms..."
            className="
              w-full h-10 pl-9 pr-3 rounded-xl text-sm
              bg-zinc-50 border border-zinc-200 text-zinc-900
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
              placeholder:text-zinc-400 dark:placeholder:text-zinc-600
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
            "
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">
            No terms match &ldquo;{search}&rdquo;
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => (
              <Card key={entry.term} padding="sm">
                <p className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-0.5">
                  {entry.term}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {entry.definition}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
