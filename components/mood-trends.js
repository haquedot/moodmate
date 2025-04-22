"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

export default function MoodTrends({ entries }) {
  const [weeklyData, setWeeklyData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])

  useEffect(() => {
    if (!entries || entries.length === 0) return

    // Process data for weekly trends
    const last7Days = getLastNDays(7)
    const weeklyTrends = processDataForPeriod(entries, last7Days)
    setWeeklyData(weeklyTrends)

    // Process data for monthly trends
    const last30Days = getLastNDays(30)
    const monthlyTrends = processDataForPeriod(entries, last30Days)
    setMonthlyData(monthlyTrends)
  }, [entries])

  // Get array of last N days
  const getLastNDays = (n) => {
    const result = []
    for (let i = 0; i < n; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      result.push(date.toISOString().split("T")[0])
    }
    return result.reverse() // Oldest to newest
  }

  // Process data for a given period
  const processDataForPeriod = (entries, dateArray) => {
    const moodCounts = {
      happy: 0,
      neutral: 0,
      sad: 0,
      angry: 0,
      tired: 0,
    }

    const dateEntries = {}
    dateArray.forEach((date) => {
      dateEntries[date] = []
    })

    // Group entries by date
    entries.forEach((entry) => {
      const entryDate = new Date(entry.date).toISOString().split("T")[0]
      if (dateArray.includes(entryDate)) {
        if (!dateEntries[entryDate]) {
          dateEntries[entryDate] = []
        }
        dateEntries[entryDate].push(entry)

        // Count moods
        if (moodCounts.hasOwnProperty(entry.mood)) {
          moodCounts[entry.mood]++
        }
      }
    })

    // Calculate dominant mood for each day
    const result = dateArray.map((date) => {
      const dayEntries = dateEntries[date] || []

      if (dayEntries.length === 0) {
        return { date, mood: null, count: 0 }
      }

      // Count moods for this day
      const dayMoodCounts = {}
      dayEntries.forEach((entry) => {
        if (!dayMoodCounts[entry.mood]) {
          dayMoodCounts[entry.mood] = 0
        }
        dayMoodCounts[entry.mood]++
      })

      // Find dominant mood
      let dominantMood = null
      let maxCount = 0

      Object.entries(dayMoodCounts).forEach(([mood, count]) => {
        if (count > maxCount) {
          dominantMood = mood
          maxCount = count
        }
      })

      return {
        date,
        mood: dominantMood,
        count: dayEntries.length,
      }
    })

    return {
      dailyMoods: result,
      moodCounts,
    }
  }

  const moods = {
    happy: { emoji: "😊", color: "bg-yellow-400" },
    neutral: { emoji: "😐", color: "bg-blue-400" },
    sad: { emoji: "😔", color: "bg-indigo-400" },
    angry: { emoji: "😠", color: "bg-red-400" },
    tired: { emoji: "😴", color: "bg-gray-400" },
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Mood Trends</h2>

      {/* Weekly Trends */}
      {weeklyData.dailyMoods && (
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-3">Weekly Overview</h3>

          <div className="flex justify-between items-end h-40 mb-2">
            {weeklyData.dailyMoods.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                {day.mood ? (
                  <div
                    className={`${moods[day.mood]?.color || "bg-gray-200"} w-8 rounded-t-md`}
                    style={{
                      height: `${day.count * 20 + 20}px`,
                      minHeight: "20px",
                    }}
                  >
                    <span className="flex justify-center pt-1">{moods[day.mood]?.emoji}</span>
                  </div>
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-700 w-8 h-5 rounded-t-md"></div>
                )}
                <span className="text-xs mt-1">{formatDate(day.date)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2 mt-4">
            {Object.entries(weeklyData.moodCounts).map(([mood, count]) => (
              <div key={mood} className="text-center">
                <div className="text-xl">{moods[mood]?.emoji}</div>
                <div className="text-sm font-medium">{count}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Monthly Trends */}
      {monthlyData.moodCounts && (
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-3">Monthly Distribution</h3>

          <div className="flex justify-between items-end h-40 mb-4">
            {Object.entries(monthlyData.moodCounts).map(([mood, count]) => (
              <div key={mood} className="flex flex-col items-center">
                <div
                  className={`${moods[mood]?.color || "bg-gray-200"} w-12 rounded-t-md flex items-end justify-center`}
                  style={{
                    height: `${count * 5 + 20}px`,
                    minHeight: "20px",
                  }}
                >
                  <span className="text-lg mb-1">{moods[mood]?.emoji}</span>
                </div>
                <span className="text-xs mt-1 capitalize">{mood}</span>
                <span className="text-xs font-medium">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
