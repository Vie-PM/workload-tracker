
import { Project, ProjectStat, ReportType } from '../types';

/**
 * Formats a duration in total hours into a "Xh Ym" string.
 */
export const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
};

/**
 * Get the ISO week number for a given date.
 */
function getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
}

/**
 * Checks if a session date matches a given date and report type (day, week, month).
 */
function matchDateRange(sessionDateStr: string, reportDateStr: string, type: ReportType): boolean {
    const sessionD = new Date(sessionDateStr);
    const reportD = new Date(reportDateStr);

    if (type === 'day') {
        return sessionDateStr === reportDateStr;
    }
    
    if (type === 'week') {
        return getWeekNumber(sessionD) === getWeekNumber(reportD) && sessionD.getFullYear() === reportD.getFullYear();
    }
    
    if (type === 'month') {
        return sessionD.getMonth() === reportD.getMonth() && sessionD.getFullYear() === reportD.getFullYear();
    }
    
    return false;
}

/**
 * Calculates project statistics for a given date and report type.
 */
export const calculateStats = (projects: Project[], date: string, type: ReportType): ProjectStat[] => {
    const projectHours: { [key: string]: { projectName: string; hours: number } } = {};

    projects.forEach(project => {
        project.sessions.forEach(session => {
            if (matchDateRange(session.date, date, type)) {
                if (!projectHours[project.id]) {
                    projectHours[project.id] = { projectName: project.name, hours: 0 };
                }
                projectHours[project.id].hours += session.duration / 3600;
            }
        });
    });

    return Object.entries(projectHours)
        .map(([projectId, data]) => ({ projectId, ...data }))
        .sort((a, b) => b.hours - a.hours);
};
