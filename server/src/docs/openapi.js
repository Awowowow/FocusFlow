export const openapi = {
  openapi: "3.1.0",
  info: {
    title: "FocusFlow API",
    version: "1.0.0",
    description: "Authenticated task and time tracking API. Session authentication uses an HTTP-only cookie.",
  },
  servers: [{ url: "http://localhost:4000/api", description: "Local API" }],
  tags: [{ name: "Auth" }, { name: "Tasks" }, { name: "Time" }, { name: "Summary" }],
  paths: {
    "/auth/register": { post: { tags: ["Auth"], summary: "Create account and session", responses: { 201: { description: "Registered" }, 400: { description: "Validation error" }, 409: { description: "Email in use" } } } },
    "/auth/login": { post: { tags: ["Auth"], summary: "Authenticate user", responses: { 200: { description: "Signed in" }, 401: { description: "Invalid credentials" } } } },
    "/auth/logout": { post: { tags: ["Auth"], summary: "End session", responses: { 204: { description: "Signed out" } } } },
    "/auth/me": { get: { tags: ["Auth"], summary: "Current user", responses: { 200: { description: "Authenticated user" } } } },
    "/tasks": {
      get: { tags: ["Tasks"], summary: "List owned tasks with tracked totals", responses: { 200: { description: "Tasks" } } },
      post: { tags: ["Tasks"], summary: "Create a task", responses: { 201: { description: "Created" } } },
    },
    "/tasks/{taskId}": {
      get: { tags: ["Tasks"], summary: "Retrieve an owned task", responses: { 200: { description: "Task" }, 404: { description: "Not found" } } },
      patch: { tags: ["Tasks"], summary: "Update task details/status", responses: { 200: { description: "Updated" } } },
      delete: { tags: ["Tasks"], summary: "Delete a stopped task", responses: { 204: { description: "Deleted" }, 409: { description: "Active timer prevents deletion" } } },
    },
    "/tasks/suggest": { post: { tags: ["Tasks"], summary: "Suggest structured fields from natural language", responses: { 200: { description: "Suggestion; falls back locally without AI key" } } } },
    "/tasks/{taskId}/timer/start": { post: { tags: ["Time"], summary: "Start exclusive timer", responses: { 201: { description: "Started" }, 409: { description: "Another timer is active" } } } },
    "/tasks/{taskId}/timer/stop": { post: { tags: ["Time"], summary: "Stop and persist elapsed session", responses: { 200: { description: "Stopped" } } } },
    "/time/active": { get: { tags: ["Time"], summary: "Active user timer", responses: { 200: { description: "Active timer or null" } } } },
    "/time/logs": {
      get: { tags: ["Time"], summary: "List owned time logs", responses: { 200: { description: "Logs" } } },
      post: { tags: ["Time"], summary: "Create a completed historical time log", responses: { 201: { description: "Created" }, 409: { description: "Overlapping log" } } },
    },
    "/time/logs/{logId}": {
      patch: { tags: ["Time"], summary: "Correct a completed time log", responses: { 200: { description: "Updated" }, 409: { description: "Active or overlapping log" } } },
      delete: { tags: ["Time"], summary: "Delete a completed time log", responses: { 204: { description: "Deleted" }, 409: { description: "Active log" } } },
    },
    "/summary/today": { get: { tags: ["Summary"], summary: "Daily productivity summary with open task reminders", responses: { 200: { description: "Summary" } } } },
    "/summary/weekly": { get: { tags: ["Summary"], summary: "Seven day tracked-time series", responses: { 200: { description: "Chart-ready series" } } } },
  },
};
