"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from "lucide-react"

const moods = {
  happy: { emoji: "😊", label: "Happy", color: "bg-yellow-100 dark:bg-yellow-900/30" },
  neutral: { emoji: "😐", label: "Neutral", color: "bg-blue-100 dark:bg-blue-900/30" },
  sad: { emoji: "😔", label: "Sad", color: "bg-indigo-100 dark:bg-indigo-900/30" },
  angry: { emoji: "😠", label: "Angry", color: "bg-red-100 dark:bg-red-900/30" },
  tired: { emoji: "😴", label: "Tired", color: "bg-gray-100 dark:bg-gray-800" },
}

export default function MoodEntryList({ entries }) {
  const [filter, setFilter] = useState(null)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const filteredEntries = filter ? entries.filter((entry) => entry.mood === filter) : entries

  const handleExport = () => {
    // Create CSV content
    let csvContent = "Date,Mood,Note,Temperature,Weather\n"

    entries.forEach((entry) => {
      const date = formatDate(entry.date)
      const mood = moods[entry.mood]?.label || entry.mood
      const note = entry.note.replace(/,/g, ";") // Replace commas to avoid CSV issues
      const temp = entry.weather?.temp || "N/A"
      const condition = entry.weather?.condition || "N/A"

      csvContent += `${date},${mood},"${note}",${temp}°C,${condition}\n`
    })

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "mood-journal-export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Notes</h2>
        <Button variant="outline" size="sm" onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button variant={filter === null ? "default" : "outline"} size="sm" onClick={() => setFilter(null)}>
          All
        </Button>
        {Object.entries(moods).map(([id, mood]) => (
          <Button key={id} variant={filter === id ? "default" : "outline"} size="sm" onClick={() => setFilter(id)}>
            <span className="mr-1">{mood.emoji}</span> {mood.label}
          </Button>
        ))}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No entries found. Add your first mood entry!
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 rounded-lg ${moods[entry.mood]?.color || "bg-gray-100 dark:bg-gray-800"}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label={moods[entry.mood]?.label}>
                    {moods[entry.mood]?.emoji}
                  </span>
                  <div>
                    <p className="font-medium">{entry.note || "No note added"}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(entry.date)}</p>
                  </div>
                </div>
                {entry.weather && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <WeatherIcon condition={entry.weather.condition} />
                    <span className="ml-1">{entry.weather.temp}°C</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const WeatherIcon = ({ condition }) => {
  switch (condition?.toLowerCase()) {
    case "clear":
      return <Sun className="h-4 w-4" />
    case "clouds":
      return <Cloud className="h-4 w-4" />
    case "rain":
    case "drizzle":
      return <CloudRain className="h-4 w-4" />
    case "snow":
      return <CloudSnow className="h-4 w-4" />
    case "thunderstorm":
      return <CloudLightning className="h-4 w-4" />
    default:
      return <Sun className="h-4 w-4" />
  }
}
