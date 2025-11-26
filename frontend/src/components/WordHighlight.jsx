export default function WordHighlight({ word }) {
  const s = word.score || 50
  let color = "text-green-400"
  if (s > 80) color = "text-red-500 font-bold underline decoration-wavy decoration-red-500"
  else if (s > 60) color = "text-orange-400 font-semibold"
  else if (s > 40) color = "text-yellow-400"

  return <span className={color}>{word.word} </span>
}