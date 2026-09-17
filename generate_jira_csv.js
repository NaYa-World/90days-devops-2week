import fs from 'fs';

const filePath = './src/data/phases_v5.ts';
let fileContent = fs.readFileSync(filePath, 'utf-8');

// The file starts with:
// import { Phase } from '../types/roadmap';
//
// export const PHASES_V5: Phase[] = [
// ...
// ]

const startString = 'export const PHASES_V5: Phase[] = ';
const startIdx = fileContent.indexOf(startString);

if (startIdx === -1) {
  console.error("Could not find start string");
  process.exit(1);
}

// Extract everything from the start of the array
let jsonStr = fileContent.substring(startIdx + startString.length).trim();

// The file ends with `];` or `]` maybe with a semicolon.
if (jsonStr.endsWith(';')) {
  jsonStr = jsonStr.slice(0, -1);
}

try {
  const phases = JSON.parse(jsonStr);
  
  // Now generate a CSV format suitable for Jira
  // Jira CSV columns: Issue Type, Summary, Description, Parent Id, Epic Name
  // Let's create Epics for Phases, and Tasks for Days.

  let csvRows = [];
  // Header
  csvRows.push(['Issue ID', 'Parent ID', 'Issue Type', 'Status', 'Summary', 'Description']);

  let currentId = 1;

  for (const phase of phases) {
    const epicName = `Phase ${phase.phase}: ${phase.title}`;
    const epicId = currentId++;
    
    // Create an Epic
    csvRows.push([epicId, '', 'Epic', 'Backlog', epicName, `Days: ${phase.days}\nCost: ${phase.estimatedCost}`]);
    
    // Create a Task for the weekly project
    if (phase.weeklyProject) {
        let desc = `Scenario: ${phase.weeklyProject.scenario}\n\nSuccess Criteria:\n- ${phase.weeklyProject.successCriteria.join('\n- ')}\n\nArtifact: ${phase.weeklyProject.artifact}`;
        csvRows.push([currentId++, epicId, 'Task', 'Backlog', `[Project] ${phase.weeklyProject.title}`, desc]);
    }

    // Create a Task for the incident drill
    if (phase.incidentDrill) {
        let desc = `Scenario: ${phase.incidentDrill.scenario}\n\nTime Limit: ${phase.incidentDrill.timeLimit}\nPost Mortem Required: ${phase.incidentDrill.postMortemRequired}`;
        csvRows.push([currentId++, epicId, 'Task', 'Backlog', `[Incident Drill] ${phase.incidentDrill.title}`, desc]);
    }

    // Create a Task for each day
    for (const day of phase.dayTasks) {
        let desc = `Scenario: ${day.scenario}\n\nTasks:\n- ${day.tasks.join('\n- ')}\n\nCommands to run:\n${(day.commands || []).join('\n')}\n\nGotcha: ${day.gotcha}\n\nInterview Answer: ${day.interviewAnswer}`;
        csvRows.push([currentId++, epicId, 'Task', 'Backlog', `[${day.id}] ${day.title}`, desc]);
    }
  }

  // Escape CSV function
  const escapeCsv = (str) => {
    if (str == null || str === '') return '""';
    str = String(str).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = csvRows.map(row => row.map(escapeCsv).join(',')).join('\n');
  fs.writeFileSync('./jira_tasks.csv', csvContent);
  console.log('Successfully wrote jira_tasks.csv');

} catch (err) {
  console.error("Error parsing JSON:", err);
}
