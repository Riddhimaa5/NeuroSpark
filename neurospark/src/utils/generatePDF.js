import { jsPDF } from 'jspdf'
import { dyslexiaTechniques, asdTechniques, universalAccommodations } from '../data/recommendations'
import { tGlobal } from './translations'

export function generatePDF(child, scores) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  const addLine = (text, fontSize = 11, bold = false, color = [30, 30, 30]) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, pageWidth - 40)
    lines.forEach(line => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(line, 20, y)
      y += fontSize * 0.5 + 2
    })
    y += 2
  }

  const addDivider = () => {
    if (y > 270) { doc.addPage(); y = 20 }
    doc.setDrawColor(230, 230, 230)
    doc.line(20, y, pageWidth - 20, y)
    y += 8
  }

  const addSection = (title) => {
    y += 4
    if (y > 270) { doc.addPage(); y = 20 }
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(20, y - 4, pageWidth - 40, 12, 2, 2, 'F')
    addLine(title, 10, true, [80, 80, 80])
    y += 2
  }

  // Header
  doc.setFillColor(10, 10, 10)
  doc.rect(0, 0, pageWidth, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('NeuroSpark', 20, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(tGlobal('Neurodevelopmental Screening Report', child?.language), pageWidth - 20, 18, { align: 'right' })
  y = 45

  // Child info
  addLine(`${tGlobal('Child', child?.language)}: ${child?.name || 'Unknown'}`, 14, true)
  addLine(`${tGlobal('Age', child?.language)}: ${child?.age}  |  ${tGlobal('Language', child?.language)}: ${child?.language || 'English'}  |  ${tGlobal('Date', child?.language)}: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 10, false, [100, 100, 100])
  addDivider()

  // Disclaimer
  addLine(tGlobal('IMPORTANT: This is a screening tool, not a clinical diagnosis. Please consult a qualified specialist for a full assessment.', child?.language), 9, false, [150, 80, 80])
  addDivider()

  // Scores
  addSection(tGlobal('SCREENING RESULTS', child?.language))
  const domains = [
    { label: tGlobal('ASD Social Communication', child?.language), score: scores.asd_social },
    { label: tGlobal('ASD Repetitive Behaviour', child?.language), score: scores.asd_repetitive },
    { label: `${tGlobal('Dyslexia', child?.language)} (${tGlobal(scores.dyslexiaType, child?.language)})`, score: scores.dyslexia },
    { label: tGlobal('Dysgraphia', child?.language), score: scores.dysgraphia },
    { label: tGlobal('Dyscalculia', child?.language), score: scores.dyscalculia },
  ]

  domains.forEach(d => {
    const level = d.score >= 70 ? tGlobal('HIGH CONCERN', child?.language) : d.score >= 40 ? tGlobal('MODERATE', child?.language) : tGlobal('LOW CONCERN', child?.language)
    const color = d.score >= 70 ? [180, 30, 30] : d.score >= 40 ? [180, 120, 20] : [30, 120, 60]
    if (y > 270) { doc.addPage(); y = 20 }
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    doc.text(`${d.label}`, 22, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...color)
    doc.text(`${level} (${d.score}/100)`, pageWidth - 22, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    y += 8

    // Progress bar
    doc.setFillColor(240, 240, 240)
    doc.roundedRect(22, y - 4, pageWidth - 44, 4, 1, 1, 'F')
    const barColor = d.score >= 70 ? [220, 38, 38] : d.score >= 40 ? [217, 119, 6] : [22, 163, 74]
    doc.setFillColor(...barColor)
    doc.roundedRect(22, y - 4, (pageWidth - 44) * (d.score / 100), 4, 1, 1, 'F')
    y += 8
  })

  addDivider()

  // Dyslexia type explanation
  if (scores.dyslexia >= 40) {
    addSection(`${tGlobal('DYSLEXIA TYPE:', child?.language)} ${tGlobal(scores.dyslexiaType, child?.language)?.toUpperCase()}`)
    const explanations = {
      Phonological: 'Difficulty connecting letters to their sounds. The brain struggles to break words into phonemes and blend them. Reading is slow and effortful. This is the most common form affecting ~80% of dyslexia cases.',
      Surface: 'Cannot recognise words as whole visual units. Every word must be decoded from scratch each time, even common sight words like "the" or "said". Reading speed is very slow.',
      'Rapid Naming': 'Processes letters correctly but cannot retrieve and produce them quickly. Reading is accurate but extremely slow. Often described as smart but slow.',
      Visual: 'Letters and words appear to move or rearrange on the page. Frequently loses place while reading. Whole-word reversals (was/saw) are common.',
    }
    addLine(explanations[scores.dyslexiaType] || '', 10)
    addDivider()
  }

  // Study techniques — Dyslexia
  if (scores.dyslexia >= 40) {
    const techs = dyslexiaTechniques[scores.dyslexiaType] || []
    addSection(`${tGlobal('STUDY TECHNIQUES', child?.language)}`)
    techs.forEach((t, i) => {
      addLine(`${i + 1}. ${t.title}`, 11, true)
      addLine(`   ${t.desc}`, 10, false, [80, 80, 80])
      addLine(`   Why it helps: This technique directly addresses ${scores.dyslexiaType} dyslexia by building the specific neural pathways that are affected.`, 9, false, [120, 120, 120])
      y += 2
    })
    addDivider()
  }

  // ASD techniques
  if (scores.asd_social >= 40) {
    const techs = asdTechniques[scores.asdProfile] || []
    addSection(`${tGlobal('STUDY TECHNIQUES', child?.language)}`)
    techs.forEach((t, i) => {
      addLine(`${i + 1}. ${t.title}`, 11, true)
      addLine(`   ${t.desc}`, 10, false, [80, 80, 80])
      y += 2
    })
    addDivider()
  }

  // Universal accommodations
  addSection(tGlobal('CLASSROOM ACCOMMODATIONS', child?.language))
  universalAccommodations.forEach((a, i) => {
    addLine(`• ${a}`, 10)
  })
  addDivider()

  // Daily activity schedule
  addSection(tGlobal('RECOMMENDED DAILY ACTIVITY SCHEDULE', child?.language))
  const schedule = [
    { time: 'Morning (15 min)', activity: 'Phoneme blending warm-up — tap sounds in 5 words' },
    { time: 'Before reading (5 min)', activity: 'Review sight word flashcards for the day' },
    { time: 'Reading time', activity: 'Use audiobook alongside text — follow with finger' },
    { time: 'After school (10 min)', activity: 'Orton-Gillingham letter-sound drill' },
    { time: 'Evening (5 min)', activity: 'Sensory break — movement activity of child\'s choice' },
    { time: 'Before bed', activity: 'Read one familiar book together — no pressure on decoding' },
  ]
  schedule.forEach(s => {
    addLine(`${s.time}: ${s.activity}`, 10)
  })
  addDivider()

  // Next steps
  addSection(tGlobal('NEXT STEPS', child?.language))
  addLine(tGlobal('1. Share this report with your child\'s class teacher immediately', child?.language), 10)
  addLine(tGlobal('2. Book an appointment with a qualified child psychologist for full assessment', child?.language), 10)
  addLine(tGlobal('3. Re-screen on NeuroSpark in 30 days to track progress', child?.language), 10)
  addLine(tGlobal('4. Join a parent support group — connect with other families', child?.language), 10)
  addDivider()

  // Footer
  if (y > 250) { doc.addPage(); y = 20 }
  y = doc.internal.pageSize.getHeight() - 20
  doc.setFontSize(9)
  doc.setTextColor(160, 160, 160)
  doc.text(tGlobal('Generated by NeuroSpark · Free neurodevelopmental screening · neurospark.app', child?.language), pageWidth / 2, y, { align: 'center' })

  doc.save(`NeuroSpark_Report_${child?.name || 'Child'}_${new Date().toLocaleDateString('en-IN')}.pdf`)
}