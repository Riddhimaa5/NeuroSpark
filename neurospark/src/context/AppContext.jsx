import { createContext, useContext, useState } from 'react'
import { tGlobal } from '../utils/translations'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [child, setChild] = useState(null)
  const [taskResults, setTaskResults] = useState({})
  const [scores, setScores] = useState(null)
  const [appLanguage, setAppLanguage] = useState('English')

  const t = (key) => tGlobal(key, appLanguage)

  const updateTaskResult = (taskName, result) => {
    setTaskResults(prev => ({ ...prev, [taskName]: result }))
  }

  // Demo child — pre-loaded for hackathon demo
  const loadDemoChild = () => {
    setChild({
      name: 'Arjun',
      age: 7,
      dob: '2018-03-15',
      language: 'Kannada',
      gender: 'Male'
    })
    setAppLanguage('Kannada')
    setTaskResults({
      gaze: { faceDwell: 28, objectDwell: 72, saccadeCount: 48 },
      stroke: { reversalRate: 0.75, lettersAttempted: 4, reversals: 3 },
      phonology: { accuracy: 0.52, avgResponseTime: 4200 }
    })
    setScores({
      asd_social: 78,
      asd_repetitive: 42,
      dyslexia: 74,
      dysgraphia: 55,
      dyscalculia: 30,
      dyslexiaType: 'Phonological',
      asdProfile: 'Social Communication'
    })
  }

  return (
    <AppContext.Provider value={{
      child, setChild,
      taskResults, updateTaskResult,
      scores, setScores,
      appLanguage, setAppLanguage,
      loadDemoChild,
      t
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}