"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import MoodTrends from "@/components/mood-trends"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TrendsPage() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedEntries = localStorage.getItem("moodEntries")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
    setIsLoading(false)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-300 to-amber-200 dark:from-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Link href="/">
            <Button variant="ghost" className="text-white" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Journal
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Mood Trends</h1>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-lg p-4 backdrop-blur-sm">
          {isLoading ? (
            <p>Loading trends...</p>
          ) : entries.length < 3 ? (
            <div className="text-center py-8">
              <p className="mb-4">You need at least 3 entries to view trends.</p>
              <Link href="/">
                <Button>Add More Entries</Button>
              </Link>
            </div>
          ) : (
            <MoodTrends entries={entries} />
          )}
        </div>
      </div>
    </main>
  )
}
