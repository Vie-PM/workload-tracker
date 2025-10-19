
import { Project } from '../types';

const STORAGE_KEY = 'reactTimeTrackerData';

export const loadProjects = (): Project[] => {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            return JSON.parse(savedData);
        }
    } catch (error) {
        console.error("Failed to parse projects from localStorage", error);
        return [];
    }
    return [];
};

export const saveProjects = (projects: Project[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
        console.error("Failed to save projects to localStorage", error);
    }
};
