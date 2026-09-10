package main

import (
	"context"
	"encoding/json"
	"time"

	"github.com/rexionmars/TerraEnergyEngine/internal/sidecar"
)

// App is the struct the frontend is bound to. Every exported method on it is
// callable from the interface through the generated wailsjs bindings.
type App struct {
	ctx    context.Context
	runner *sidecar.Runner
	// Why the runner could not be built; reported by Ping in place of a result.
	runnerErr error
}

// NewApp creates a new App.
func NewApp() *App {
	return &App{}
}

// startup runs once, before the frontend can call any binding, so the fields
// it writes are never read concurrently with the write.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.runner, a.runnerErr = sidecar.NewRunner()
}

// shutdown stops a request still running when the window closes. Without it
// the interpreter, and every process it started, outlives the application.
func (a *App) shutdown(context.Context) {
	if a.runner != nil {
		a.runner.Cancel()
	}
}

// SidecarStatus is what Ping reports about the Python side.
type SidecarStatus struct {
	OK bool `json:"ok"`
	// Interpreter the runner resolved, as a path or a command name.
	Python string `json:"python"`
	// Version the interpreter reported, when it answered.
	Version string `json:"version,omitempty"`
	Error   string `json:"error,omitempty"`
}

// Starting an interpreter and importing the package takes well under a second
// on a warm machine; the first start after boot can be several.
const pingTimeout = 15 * time.Second

// Ping starts the sidecar with the ping action and reports whether it answered.
func (a *App) Ping() SidecarStatus {
	if a.runner == nil {
		msg := "sidecar unavailable"
		if a.runnerErr != nil {
			msg = a.runnerErr.Error()
		}
		return SidecarStatus{Error: msg}
	}

	status := SidecarStatus{Python: a.runner.Python()}
	ctx, cancel := context.WithTimeout(a.ctx, pingTimeout)
	defer cancel()

	raw, err := a.runner.Probe(ctx)
	if err != nil {
		status.Error = err.Error()
		return status
	}
	var reply struct {
		Python string `json:"python"`
	}
	if err := json.Unmarshal(raw, &reply); err != nil {
		status.Error = "unreadable ping reply: " + err.Error()
		return status
	}
	status.OK = true
	status.Version = reply.Python
	return status
}
