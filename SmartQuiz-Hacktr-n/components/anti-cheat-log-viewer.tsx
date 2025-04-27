"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon, EyeOpenIcon, ClipboardIcon } from "@radix-ui/react-icons"
import { EyeIcon, MousePointerIcon } from "lucide-react"

interface CheatEvent {
  type: string
  timestamp: number
  details?: any
}

interface StudentLog {
  studentId: string
  studentName: string
  quizCode: string
  startTime: number
  endTime?: number
  events: CheatEvent[]
  tabSwitchCount: number
  riskScore: number
}

function getRiskScore(events: CheatEvent[], tabSwitchCount: number): number {
  // Calculate a risk score based on suspicious events
  let score = 0
  
  // Tab switches are suspicious
  score += tabSwitchCount * 5
  
  // Count specific suspicious events
  const eventCounts: Record<string, number> = {}
  events.forEach(event => {
    eventCounts[event.type] = (eventCounts[event.type] || 0) + 1
  })
  
  // Copy/paste is highly suspicious
  score += (eventCounts['copy_content'] || 0) * 10
  score += (eventCounts['paste_content'] || 0) * 15
  
  // Idle mouse can indicate looking elsewhere
  score += (eventCounts['mouse_idle'] || 0) * 3
  
  // Window blur means they switched apps
  score += (eventCounts['window_blur'] || 0) * 8
  
  // Print attempts are suspicious
  score += (eventCounts['print_attempt'] || 0) * 20
  
  // Right-clicks might be trying to inspect elements
  score += (eventCounts['right_click'] || 0) * 2
  
  return Math.min(100, score) // Cap at 100
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString()
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'tab_switch':
    case 'tab_return':
      return <EyeIcon className="h-4 w-4 text-yellow-600" />
    case 'copy_content':
    case 'paste_content':
      return <ClipboardIcon className="h-4 w-4 text-red-600" />
    case 'mouse_idle':
      return <MousePointerIcon className="h-4 w-4 text-blue-600" />
    case 'print_attempt':
    case 'right_click':
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
    default:
      return null
  }
}

function getEventDescription(event: CheatEvent): string {
  switch (event.type) {
    case 'tracking_started':
      return "Anti-cheat tracking started"
    case 'tracking_ended':
      return "Anti-cheat tracking ended"
    case 'tab_switch':
      return "Student switched away from quiz tab"
    case 'tab_return':
      return "Student returned to quiz tab"
    case 'copy_content':
      return `Copied text: "${event.details?.text?.substring(0, 30)}${event.details?.text?.length > 30 ? '...' : ''}"`
    case 'paste_content':
      return `Pasted text: "${event.details?.text?.substring(0, 30)}${event.details?.text?.length > 30 ? '...' : ''}"`
    case 'mouse_idle':
      return `Mouse inactive for ${event.details?.seconds} seconds`
    case 'window_blur':
      return "Student switched to another application"
    case 'window_focus':
      return "Student returned to the quiz"
    case 'print_attempt':
      return "Attempted to print the page"
    case 'right_click':
      return "Right-clicked (possible attempt to access developer tools)"
    default:
      return event.type
  }
}

interface AntiCheatLogViewerProps {
  quizCode: string
}

export function AntiCheatLogViewer({ quizCode }: AntiCheatLogViewerProps) {
  const [studentLogs, setStudentLogs] = useState<StudentLog[]>([])
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  
  useEffect(() => {
    // Function to load all student logs from localStorage
    const loadStudentLogs = () => {
      const logs: StudentLog[] = []
      
      // Get student names from localStorage
      const studentNames: Record<string, string> = {}
      
      // Scan localStorage for student logs
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        
        // Check for student join records to get names
        if (key && key.startsWith('student_join_')) {
          try {
            const studentData = JSON.parse(localStorage.getItem(key) || '{}')
            studentNames[studentData.id] = studentData.name
          } catch (error) {
            console.error('Error parsing student data:', error)
          }
        }
        
        // Check for activity logs
        if (key && key.startsWith(`quiz_activity_log_${quizCode}`)) {
          try {
            const log = JSON.parse(localStorage.getItem(key) || '{}')
            const studentId = key.split('_').pop() // Extract student ID from key
            
            if (studentId && log.events && Array.isArray(log.events)) {
              // Calculate risk score
              const riskScore = getRiskScore(log.events, log.tabSwitchCount || 0)
              
              logs.push({
                studentId,
                studentName: studentNames[studentId] || 'Unknown Student',
                quizCode: log.quizCode || quizCode,
                startTime: log.startTime || Date.now(),
                endTime: log.endTime,
                events: log.events,
                tabSwitchCount: log.tabSwitchCount || 0,
                riskScore
              })
            }
          } catch (error) {
            console.error('Error parsing activity log:', error)
          }
        }
      }
      
      // Update state with the logs
      setStudentLogs(logs)
      
      // Set selected student to the first one if not already set
      if (logs.length > 0 && !selectedStudent) {
        setSelectedStudent(logs[0].studentId)
      }
    }
    
    // Load initial logs
    loadStudentLogs()
    
    // Set up broadcast channel to receive real-time updates
    try {
      const channel = new BroadcastChannel('smartquiz_anticheat_channel')
      
      channel.onmessage = (event) => {
        const data = event.data
        
        // Check if this is a cheat event
        if (data.type === 'cheat_event' && data.quizCode === quizCode) {
          console.log('Received anti-cheat event:', data)
          // Reload logs when new events come in
          loadStudentLogs()
        }
      }
      
      setBroadcastChannel(channel)
      
      return () => {
        channel.close()
      }
    } catch (error) {
      console.error('BroadcastChannel not supported:', error)
      
      // Fallback: poll localStorage every 5 seconds
      const intervalId = setInterval(loadStudentLogs, 5000)
      return () => clearInterval(intervalId)
    }
  }, [quizCode, selectedStudent])
  
  // Get the selected student's log
  const selectedLog = studentLogs.find(log => log.studentId === selectedStudent)
  
  // Sort students by risk score (highest first)
  const sortedStudents = [...studentLogs].sort((a, b) => b.riskScore - a.riskScore)
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Anti-Cheat Monitoring</CardTitle>
          <CardDescription>
            Monitor student activity and detect potential cheating
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentLogs.length === 0 ? (
            <Alert>
              <AlertDescription>
                No student activity data available yet. Data will appear once students start the quiz with anti-cheat enabled.
              </AlertDescription>
            </Alert>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Detailed Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {sortedStudents.map(log => (
                    <Card 
                      key={log.studentId}
                      className={`cursor-pointer border-l-4 ${
                        log.riskScore > 50 ? 'border-l-red-500' : 
                        log.riskScore > 25 ? 'border-l-yellow-500' : 
                        'border-l-green-500'
                      } ${selectedStudent === log.studentId ? 'bg-gray-50' : ''}`}
                      onClick={() => setSelectedStudent(log.studentId)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{log.studentName}</h3>
                            <p className="text-sm text-gray-500">
                              {log.events.length} tracked events • {log.tabSwitchCount} tab switches
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${
                              log.riskScore > 50 ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                              log.riskScore > 25 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                              'bg-green-100 text-green-800 hover:bg-green-100'
                            }`}>
                              Risk: {log.riskScore}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="md:col-span-1 space-y-4">
                    {sortedStudents.map(log => (
                      <div 
                        key={log.studentId}
                        className={`p-3 border rounded-md cursor-pointer ${
                          selectedStudent === log.studentId ? 'bg-gray-50 border-gray-400' : ''
                        }`}
                        onClick={() => setSelectedStudent(log.studentId)}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{log.studentName}</h3>
                          <Badge className={`${
                            log.riskScore > 50 ? 'bg-red-100 text-red-800' : 
                            log.riskScore > 25 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {log.riskScore}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="md:col-span-2">
                    {selectedLog ? (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {selectedLog.studentName} - Activity Log
                          </CardTitle>
                          <CardDescription>
                            {selectedLog.events.length} events • Started: {new Date(selectedLog.startTime).toLocaleTimeString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <div>
                                <span className="text-sm font-medium">Tab Switches:</span> {selectedLog.tabSwitchCount}
                              </div>
                              <div>
                                <span className="text-sm font-medium">Risk Score:</span> {selectedLog.riskScore}%
                              </div>
                            </div>
                            
                            <ScrollArea className="h-[400px] rounded-md border p-2">
                              <div className="space-y-2">
                                {selectedLog.events.map((event, index) => (
                                  <div key={index} className="py-2 border-b border-gray-100 flex items-start gap-2">
                                    <div className="mt-0.5">
                                      {getEventIcon(event.type)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <span className="font-medium">{getEventDescription(event)}</span>
                                        <span className="text-gray-500 text-sm">
                                          {formatTimestamp(event.timestamp)}
                                        </span>
                                      </div>
                                      {event.details && event.details.from && event.details.to && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          Changed from {event.details.from} to {event.details.to}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50 rounded-md p-8">
                        <p className="text-gray-500">Select a student to view their activity log</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 