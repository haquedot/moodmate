"use client"

const moods = [
  { id: "happy", emoji: "😊", label: "Happy", color: "bg-yellow-400" },
  { id: "neutral", emoji: "😐", label: "Neutral", color: "bg-blue-400" },
  { id: "sad", emoji: "😔", label: "Sad", color: "bg-indigo-400" },
  { id: "angry", emoji: "😠", label: "Angry", color: "bg-red-400" },
  { id: "tired", emoji: "😴", label: "Tired", color: "bg-gray-400" },
]

export default function MoodSelector({ selectedMood, onSelectMood }) {
  return (
    <div className="flex justify-between gap-2">
      {moods.map((mood) => (
        <button
          key={mood.id}
          className={`flex flex-col items-center p-2 rounded-full transition-all ${
            selectedMood === mood.id
              ? `${mood.color} scale-110 shadow-md`
              : "bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600"
          }`}
          onClick={() => onSelectMood(mood.id)}
          aria-label={`Select mood: ${mood.label}`}
        >
          <span className="text-2xl" role="img" aria-label={mood.label}>
            {mood.emoji}
          </span>
        </button>
      ))}
    </div>
  )
}
