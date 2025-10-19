
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Timer from './components/Timer';
import TodayStats from './components/TodayStats';
import ProjectManagement from './components/ProjectManagement';
import ReportGenerator from './components/ReportGenerator';
import Alert from './components/Alert';
import { useTimeTracker } from './hooks/useTimeTracker';
import { calculateStats, formatTime } from './utils/time.ts';
import { ProjectStat, Alert as AlertType } from './types';

const App: React.FC = () => {
    const {
        projects,
        timerState,
        setTimerState,
        addProject,
        deleteProject,
        toggleProjectVisibility,
        saveSession,
    } = useTimeTracker();

    const [alert, setAlert] = useState<AlertType | null>(null);
    const [timerDisplay, setTimerDisplay] = useState('00:00:00');

    const showAlert = useCallback((message: string, type: 'success' | 'warning' | 'error' = 'success') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    }, []);

    const handleProjectChange = (newProjectId: string | null) => {
        if (timerState.isRunning && timerState.currentProjectId && newProjectId !== timerState.currentProjectId) {
            // Save the current session for the old project
            saveSession(timerState.currentSessionStart!, timerState.currentProjectId, timerState.currentNote);

            if (newProjectId) {
                // A new project is selected, start a new session for it
                setTimerState({
                    isRunning: true,
                    currentProjectId: newProjectId,
                    currentSessionStart: Date.now(),
                    currentNote: '',
                });
                showAlert('Switched project. New session started.', 'success');
            } else {
                // No new project selected (i.e., "-- Choose a project --"), so stop everything
                setTimerState({
                    isRunning: false,
                    currentProjectId: null,
                    currentSessionStart: null,
                    currentNote: '',
                });
                showAlert('Project deselected. Timer stopped.', 'warning');
            }
        } else if (!timerState.isRunning) {
            // Timer isn't running, so just update the selected project.
            setTimerState(p => ({ ...p, currentProjectId: newProjectId }));
        }
    };

    const handleStartTimer = () => {
        if (!timerState.currentProjectId) {
            showAlert('Please select a project first.', 'warning');
            return;
        }
        if (timerState.isRunning) return;

        // If switching project while timer was running (paused then switched)
        if (timerState.currentSessionStart && timerState.currentProjectId) {
             saveSession(timerState.currentSessionStart, timerState.currentProjectId, timerState.currentNote);
        }

        setTimerState(prev => ({
            ...prev,
            isRunning: true,
            currentSessionStart: Date.now(),
        }));
    };

    const handlePauseTimer = () => {
        if (!timerState.isRunning) return;
        setTimerState(prev => ({ ...prev, isRunning: false }));
    };

    const handleStopTimer = () => {
        if (!timerState.currentSessionStart) return;

        saveSession(timerState.currentSessionStart, timerState.currentProjectId, timerState.currentNote);
        setTimerState({
            isRunning: false,
            currentProjectId: null,
            currentSessionStart: null,
            currentNote: '',
        });
        showAlert('Time session saved successfully!', 'success');
    };

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const todayStats: ProjectStat[] = useMemo(() => calculateStats(projects, today, 'day'), [projects, today]);
    const totalTodayHours = useMemo(() => todayStats.reduce((sum, s) => sum + s.hours, 0), [todayStats]);

    useEffect(() => {
        if (totalTodayHours > 8) {
            showAlert(`Warning: You've worked ${formatTime(totalTodayHours)} today (over 8 hours).`, 'warning');
        }
    }, [totalTodayHours, showAlert]);

    useEffect(() => {
        let interval: number | undefined;
        if (timerState.isRunning && timerState.currentSessionStart) {
            interval = window.setInterval(() => {
                const elapsed = Math.floor((Date.now() - (timerState.currentSessionStart as number)) / 1000);
                const hours = Math.floor(elapsed / 3600);
                const minutes = Math.floor((elapsed % 3600) / 60);
                const seconds = elapsed % 60;
                setTimerDisplay(
                    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                );
            }, 1000);
        } else if (!timerState.isRunning) {
            if (timerState.currentProjectId === null) {
                setTimerDisplay('00:00:00');
            }
        }
        return () => window.clearInterval(interval);
    }, [timerState.isRunning, timerState.currentSessionStart, timerState.currentProjectId]);

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                <Header />
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
                <main className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Timer
                                projects={projects}
                                timerState={timerState}
                                onProjectChange={handleProjectChange}
                                onNoteChange={(note) => setTimerState(p => ({ ...p, currentNote: note }))}
                                onStart={handleStartTimer}
                                onPause={handlePauseTimer}
                                onStop={handleStopTimer}
                                timerDisplay={timerDisplay}
                            />
                            <TodayStats stats={todayStats} totalHours={totalTodayHours} />
                        </div>
                        <div className="space-y-6">
                           <ProjectManagement
                                projects={projects}
                                onAddProject={addProject}
                                onDeleteProject={deleteProject}
                                onToggleVisibility={toggleProjectVisibility}
                                showAlert={showAlert}
                            />
                            <ReportGenerator projects={projects} showAlert={showAlert} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
