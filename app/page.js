"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import MoodSelector from "@/components/mood-selector"
import MoodEntryList from "@/components/mood-entry-list"
import ThemeToggle from "@/components/theme-toggle"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function Home() {
  const [date, setDate] = useState(new Date())
  const [note, setNote] = useState("")
  const [selectedMood, setSelectedMood] = useState(null)
  const [location, setLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("new-entry")

  useEffect(() => {
    const savedEntries = localStorage.getItem("moodEntries")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ latitude, longitude })

          try {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "demo_key"}`,
            )

            if (response.ok) {
              const data = await response.json()
              setWeather({
                temp: Math.round(data.main.temp),
                condition: data.weather[0].main,
                icon: data.weather[0].icon,
                city: data.name
              })
            } else {
              console.error("Failed to fetch weather data")
            }
          } catch (error) {
            console.error("Error fetching weather:", error)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
        },
      )
    }
  }, [])

  const handleSaveEntry = () => {
    if (!selectedMood) {
      toast.warning("Please select a mood before saving")
      return
    }

    const newEntry = {
      id: Date.now(),
      date: date.toISOString(),
      mood: selectedMood,
      note: note,
      weather: weather,
    }

    const updatedEntries = [newEntry, ...entries]
    setEntries(updatedEntries)
    localStorage.setItem("moodEntries", JSON.stringify(updatedEntries))

    setNote("")
    setSelectedMood(null)
    setActiveTab("all-entries")
    toast.success("Mood entry saved successfully!")
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDatesWithEntries = () => {
    return entries.reduce((acc, entry) => {
      const entryDate = new Date(entry.date)
      const dateString = entryDate.toISOString().split("T")[0]

      if (!acc[dateString]) {
        acc[dateString] = []
      }

      acc[dateString].push(entry.mood)
      return acc
    }, {})
  }

  const datesWithEntries = getDatesWithEntries()

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-100 to-amber-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">MoodMate</h1>
            <p className="text-sm text-orange-500 dark:text-orange-300">Track your daily moods and reflections</p>
          </div>

          <div className="w-full flex items-center justify-between md:justify-end gap-4">
            {weather && (
              <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-700/70 px-3 py-2 rounded-lg shadow-sm">
                <WeatherIcon condition={weather.condition} className="h-5 w-5 text-orange-500 dark:text-orange-300" />
                <div>
                  <p className="text-sm font-medium">{weather.temp}°C</p>
                  {weather.city && <p className="text-xs text-gray-500 dark:text-gray-400">{weather.city}</p>}
                </div>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-max">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-orange-500" />
                  <span>Calendar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-8">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    className="border-0"
                    modifiers={{
                      booked: Object.keys(datesWithEntries).map((date) => new Date(date)),
                    }}
                    modifiersStyles={{
                      booked: {
                        fontWeight: "bold",
                        backgroundColor: "#f97316",
                        color: "white",
                        borderRadius: "50%",
                      },
                    }}
                  />
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setDate(new Date())}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Today
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new-entry" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Entry
                </TabsTrigger>
                <TabsTrigger value="all-entries">
                  All Entries
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new-entry">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex flex-col">
                      <span className="text-lg font-normal">{formatDate(date)}</span>
                      <span className="text-2xl font-semibold">How are you feeling today?</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <MoodSelector selectedMood={selectedMood} onSelectMood={setSelectedMood} />

                    <div className="space-y-2">
                      <label htmlFor="note" className="text-sm font-medium">
                        Add notes (optional)
                      </label>
                      <Textarea
                        id="note"
                        placeholder="What's on your mind? Any particular reason for this mood?"
                        className="min-h-[120px]"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                        onClick={handleSaveEntry}
                        disabled={!selectedMood}
                      >
                        Save Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="all-entries">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Mood History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <p>Loading entries...</p>
                      </div>
                    ) : entries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <Cloud className="h-12 w-12 text-gray-400" />
                        <h3 className="text-lg font-medium">No entries yet</h3>
                        <p className="text-sm text-gray-500">Start by adding your first mood entry</p>
                        <Button
                          onClick={() => setActiveTab("new-entry")}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Entry
                        </Button>
                      </div>
                    ) : (
                      <MoodEntryList entries={entries} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {entries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Mood Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      title="Total Entries"
                      value={entries.length}
                      icon={<CalendarIcon className="h-5 w-5" />}
                    />
                    <StatCard
                      title="Frequent Mood"
                      value={getMostFrequentMood(entries)}
                      icon={<Sun className="h-5 w-5" />}
                    />
                    <StatCard
                      title="Last Entry"
                      value={formatShortDate(new Date(entries[0].date))}
                      icon={<CalendarIcon className="h-5 w-5" />}
                    />
                    <StatCard
                      title="Current Streak"
                      value={calculateStreak(entries)}
                      icon={<CloudLightning className="h-5 w-5" />}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

const WeatherIcon = ({ condition, className }) => {
  switch (condition?.toLowerCase()) {
    case "clear":
      return <Sun className={className} />
    case "clouds":
      return <Cloud className={className} />
    case "rain":
    case "drizzle":
      return <CloudRain className={className} />
    case "snow":
      return <CloudSnow className={className} />
    case "thunderstorm":
      return <CloudLightning className={className} />
    default:
      return <Sun className={className} />
  }
}

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-slate-700 rounded-lg">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-100 dark:bg-slate-600 mb-2">
        {icon}
      </div>
      <h3 className="text-center text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

const formatShortDate = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

const getMostFrequentMood = (entries) => {
  if (entries.length === 0) return "N/A"

  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1
    return acc
  }, {})

  return Object.keys(moodCounts).reduce((a, b) =>
    moodCounts[a] > moodCounts[b] ? a : b
  )
}

const calculateStreak = (entries) => {
  if (entries.length === 0) return 0

  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  )

  let streak = 0
  let prevDate = new Date()

  const today = new Date().toDateString()
  const hasToday = sortedEntries.some(entry =>
    new Date(entry.date).toDateString() === today
  )

  if (hasToday) {
    streak = 1
    prevDate = new Date(today)
  }

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date)
    if (entryDate.toDateString() === prevDate.toDateString()) continue

    const diffDays = Math.floor((prevDate - entryDate) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      streak++
      prevDate = entryDate
    } else {
      break
    }
  }

  return streak > 0 ? `${streak} days` : "No streak"
}