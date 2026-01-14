import { BoardProvider } from './context/BoardContext'
import { Layout } from './components/Layout'

function App() {
  return (
    <BoardProvider>
      <Layout />
    </BoardProvider>
  )
}

export default App
