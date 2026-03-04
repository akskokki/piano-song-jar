type LastPlayedLabelProps = {
  lastPlayedAt: string | null
  className?: string
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
})

function getLastPlayedString(lastPlayedAt: string | null) {
  if (!lastPlayedAt) {
    return "never"
  }

  const playedAtMs = new Date(lastPlayedAt).getTime()

  if (Number.isNaN(playedAtMs)) {
    return "recently"
  }

  const diffSeconds = Math.floor((Date.now() - playedAtMs) / 1000)

  if (diffSeconds < 60) {
    return "just now"
  }

  const timeUnits = [
    { unit: "minute", seconds: 60 },
    { unit: "hour", seconds: 60 * 60 },
    { unit: "day", seconds: 60 * 60 * 24 },
    { unit: "week", seconds: 60 * 60 * 24 * 7 },
    { unit: "month", seconds: 60 * 60 * 24 * 30 },
    { unit: "year", seconds: 60 * 60 * 24 * 365 },
  ] as const

  let chosenUnit: (typeof timeUnits)[number] = timeUnits[0]

  for (const timeUnit of timeUnits) {
    if (diffSeconds >= timeUnit.seconds) {
      chosenUnit = timeUnit
      continue
    }

    break
  }

  const amount = Math.floor(diffSeconds / chosenUnit.seconds)
  return relativeTimeFormatter.format(-amount, chosenUnit.unit)
}

export function LastPlayedLabel({
  lastPlayedAt,
  className = "mt-1 text-xs text-zinc-500",
}: LastPlayedLabelProps) {
  return (
    <p className={className}>Last played {getLastPlayedString(lastPlayedAt)}</p>
  )
}
