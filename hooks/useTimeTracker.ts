
import { useState, useEffect, useCallback } from 'react';
import { Project, Session, TimerState } from '../types';
import { loadProjects, saveProjects } from '../services/storageService';

export const useTimeTracker = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [timerState, setTimerState] = useState<TimerState>({
        isRunning: false,
        currentProjectId: null,
        currentSessionStart: null,
        currentNote: '',
    });

    useEffect(() => {
        setProjects(loadProjects());
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            saveProjects(projects);
        }
    }, [projects]);
    
    const addProject = useCallback((name: string) => {
        const newProject: Project = {
            id: Date.now().toString(),
            name: name,
            isHidden: false,
            sessions: [],
        };
        setProjects(prev => [...prev, newProject]);
    }, []);

    const deleteProject = useCallback((id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (timerState.currentProjectId === id) {
            setTimerState({
                isRunning: false,
                currentProjectId: null,
                currentSessionStart: null,
                currentNote: '',
            });
        }
    }, [timerState.currentProjectId]);

    const toggleProjectVisibility = useCallback((id: string) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, isHidden: !p.isHidden } : p));
    }, []);

    const saveSession = useCallback((startTime: number, projectId: string | null, note: string) => {
        if (!projectId) return;

        const endTime = Date.now();
        const duration = Math.floor((endTime - startTime) / 1000); // in seconds
        
        if (duration < 1) return; // Don't save sessions less than 1 second

        const newSession: Session = {
            id: Date.now().toString(),
            startTime,
            endTime,
            duration,
            note,
            date: new Date(startTime).toISOString().split('T')[0],
        };

        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === projectId) {
                return { ...p, sessions: [...p.sessions, newSession] };
            }
            return p;
        }));
    }, []);

    return {
        projects,
        timerState,
        setTimerState,
        addProject,
        deleteProject,
        toggleProjectVisibility,
        saveSession,
    };
};
