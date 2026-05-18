import React, { useState } from 'react'
import axios from 'axios'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Plus,
  Bot,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  Sparkles,
  TrendingUp,
  CreditCard,
  ChevronRight,
} from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale)

function App() {
  const [file, setFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [insights, setInsights] = useState('')
  const [transactions, setTransactions] = useState([])
  const [date, setDate] = useState('')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const addTransaction = () => {
    if (!date || !desc || !amount) return

    setTransactions([
      ...transactions,
      {
        Date: date,
        Description: desc,
        Amount: parseFloat(amount),
      },
    ])

    setDate('')
    setDesc('')
    setAmount('')
  }

  const submitManualData = async () => {
    setIsAnalyzing(true)
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/manual/',
        transactions,
      )

      setAnalysis(res.data.analysis)
      setInsights(res.data.insights)
    } catch (err) {
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('http://127.0.0.1:8000/upload/', formData)

      setAnalysis(res.data.analysis)
      setInsights(res.data.insights)
    } catch (err) {
      console.error(err)
      alert('Error uploading file')
    } finally {
      setIsUploading(false)
    }
  }

  let chartData
  if (analysis) {
    chartData = {
      labels: Object.keys(analysis.category_spending),
      datasets: [
        {
          label: 'Expenses',
          data: Object.values(analysis.category_spending),
          backgroundColor: [
            'rgba(0, 240, 255, 0.8)',
            'rgba(157, 0, 255, 0.8)',
            'rgba(0, 255, 136, 0.8)',
            'rgba(255, 51, 102, 0.8)',
            'rgba(255, 204, 0, 0.8)',
          ],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          hoverOffset: 10,
        },
      ],
    }
  }

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#ffffff',
          font: {
            family: "'Outfit', sans-serif",
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        titleColor: '#00f0ff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
  }

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '40px 20px',
        minHeight: '100vh',
      }}
    >
      {/* Background Floating Orbs */}
      <motion.div
        className='floating-orb'
        style={{
          width: '400px',
          height: '400px',
          background: 'rgba(0, 240, 255, 0.15)',
          top: '10%',
          left: '5%',
        }}
        animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className='floating-orb'
        style={{
          width: '500px',
          height: '500px',
          background: 'rgba(157, 0, 255, 0.12)',
          bottom: '5%',
          right: '10%',
        }}
        animate={{ y: [0, -60, 0], x: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '50px',
          }}
        >
          <div
            style={{
              background:
                'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              padding: '12px',
              borderRadius: '16px',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
            }}
          >
            <Activity color='#fff' size={32} />
          </div>
          <div>
            <h1
              style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700 }}
              className='gradient-text'
            >
              AI FINANCE ADVISOR
            </h1>
            <p
              style={{
                margin: 0,
                color: 'var(--text-muted)',
                fontSize: '1.1rem',
              }}
            >
              Next-Gen Finance Dashboard
            </p>
          </div>
        </motion.header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px',
          }}
        >
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='glass-panel'
            style={{ padding: '30px' }}
          >
            <h2
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1.5rem',
                marginBottom: '25px',
              }}
            >
              <CreditCard className='neon-cyan' />
              <span>Manual Entry</span>
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                marginBottom: '25px',
              }}
            >
              <input
                className='glass-input'
                type='date'
                placeholder='Date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
              <input
                className='glass-input'
                placeholder='Description (e.g. Groceries)'
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <input
                className='glass-input'
                type='number'
                placeholder='Amount (₹)'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                className='glass-button'
                onClick={addTransaction}
                style={{ marginTop: '10px' }}
              >
                <Plus size={18} /> Add Transaction
              </button>
            </div>

            {transactions.length > 0 && (
              <div
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  padding: '15px',
                  marginBottom: '25px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}
                className='scrollbar-hide'
              >
                {transactions.map((t, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom:
                        i !== transactions.length - 1
                          ? '1px solid rgba(255,255,255,0.05)'
                          : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem' }}>{t.Description}</div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {t.Date}
                      </div>
                    </div>
                    <div
                      style={{ fontWeight: 600, color: 'var(--accent-green)' }}
                    >
                      ₹{t.Amount}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <button
              className='glass-button primary-button'
              onClick={submitManualData}
              disabled={transactions.length === 0 || isAnalyzing}
              style={{
                width: '100%',
                opacity: transactions.length === 0 ? 0.5 : 1,
              }}
            >
              {isAnalyzing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Activity size={20} />
                </motion.div>
              ) : (
                <Sparkles size={20} />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '30px 0',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: 'rgba(255,255,255,0.1)',
                }}
              ></div>
              <div
                style={{
                  padding: '0 15px',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                }}
              >
                OR
              </div>
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: 'rgba(255,255,255,0.1)',
                }}
              ></div>
            </div>

            <h2
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1.5rem',
                marginBottom: '20px',
              }}
            >
              <Upload className='neon-purple' />
              <span>Upload CSV</span>
            </h2>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              <div
                style={{
                  border: '2px dashed rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  padding: '30px',
                  textAlign: 'center',
                  background: file
                    ? 'rgba(0, 240, 255, 0.05)'
                    : 'rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
              >
                <input
                  type='file'
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
                <Upload
                  size={32}
                  color={file ? 'var(--accent-cyan)' : 'var(--text-muted)'}
                  style={{ marginBottom: '10px' }}
                />
                <div style={{ color: file ? '#fff' : 'var(--text-muted)' }}>
                  {file ? file.name : 'Drag & drop or click to select'}
                </div>
              </div>

              <button
                className='glass-button primary-button'
                onClick={handleUpload}
                disabled={!file || isUploading}
                style={{ width: '100%', opacity: !file ? 0.5 : 1 }}
              >
                {isUploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Activity size={20} />
                  </motion.div>
                ) : (
                  <ChevronRight size={20} />
                )}
                {isUploading ? 'Uploading...' : 'Upload & Analyze'}
              </button>
            </div>
          </motion.div>

          {/* Right Column: Dashboard & Insights */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
          >
            <AnimatePresence mode='wait'>
              {!analysis && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='glass-panel'
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '40px',
                    textAlign: 'center',
                    borderStyle: 'dashed',
                  }}
                >
                  <Bot
                    size={64}
                    color='var(--text-muted)'
                    style={{ marginBottom: '20px', opacity: 0.5 }}
                  />
                  <h3 style={{ color: 'var(--text-muted)' }}>
                    Waiting for Data
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.3)',
                      maxWidth: '300px',
                    }}
                  >
                    Upload your bank statement or add transactions manually to
                    generate an AI-powered financial dashboard.
                  </p>
                </motion.div>
              )}

              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '30px',
                  }}
                >
                  {/* Summary Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                    }}
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      className='glass-panel'
                      style={{
                        padding: '25px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          right: '-10px',
                          top: '-10px',
                          opacity: 0.1,
                        }}
                      >
                        <TrendingUp size={100} />
                      </div>
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.9rem',
                          marginBottom: '8px',
                        }}
                      >
                        Total Income
                      </div>
                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: 700,
                          color: 'var(--accent-green)',
                        }}
                      >
                        ₹{analysis.total_income.toLocaleString()}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className='glass-panel'
                      style={{
                        padding: '25px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          right: '-10px',
                          top: '-10px',
                          opacity: 0.1,
                        }}
                      >
                        <DollarSign size={100} />
                      </div>
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.9rem',
                          marginBottom: '8px',
                        }}
                      >
                        Total Expense
                      </div>
                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: 700,
                          color: '#ff3366',
                        }}
                      >
                        ₹{analysis.total_expense.toLocaleString()}
                      </div>
                    </motion.div>
                  </div>

                  {/* Chart Panel */}
                  <div className='glass-panel' style={{ padding: '30px' }}>
                    <h2
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '1.5rem',
                        marginBottom: '20px',
                      }}
                    >
                      <PieChartIcon className='neon-cyan' />
                      <span>Expense Distribution</span>
                    </h2>
                    <div
                      style={{
                        height: '300px',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <Pie data={chartData} options={chartOptions} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom AI Insights */}
        <AnimatePresence>
          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className='glass-panel'
              style={{
                marginTop: '30px',
                padding: '30px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background:
                    'linear-gradient(to bottom, var(--accent-cyan), var(--accent-purple))',
                }}
              ></div>
              <h2
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.5rem',
                  marginBottom: '20px',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Bot className='neon-purple' />
                </motion.div>
                <span className='gradient-text-accent'>
                  AI Advisor Insights
                </span>
              </h2>

              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '25px',
                  borderRadius: '16px',
                  border: '1px solid rgba(157, 0, 255, 0.2)',
                  lineHeight: '1.8',
                  fontSize: '1.1rem',
                  color: '#e2e8f0',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: insights.replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
