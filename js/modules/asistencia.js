/* ==========================================================================
   Pachamama ERP - Attendance Module with Inline Parameters (Date & Turn)
   ========================================================================== */

const asistenciaModule = {
    selectedGrupo: '',
    attendanceData: {}, // workerId -> { status, grupo_temporal_id }

    init() {
        this.selectedGrupo = '';
        this.attendanceData = {};
        this.renderLayout();
        this.bindEvents();
        this.renderGroupsGrid();
    },

    getSelectedDate() {
        const input = document.getElementById('asist-fecha');
        return input ? input.value : new Date().toISOString().split('T')[0];
    },

    getSelectedTurn() {
        const select = document.getElementById('asist-turno');
        return select ? select.value : 'TRN01';
    },

    renderLayout() {
        const container = document.getElementById('view-asistencia');
        if (!container) return;

        const turnos = window.db.getAll('turnos');

        container.innerHTML = `
            <style>
            @keyframes highlightFade {
                0% { background-color: var(--accent-emerald-glow); border-color: var(--accent-emerald); }
                100% { background-color: var(--bg-secondary); border-color: var(--border-color); }
            }
            .group-module-card {
                position: relative;
                overflow: hidden;
                border: 1px solid var(--border-color) !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            .group-module-card:hover {
                transform: translateY(-3px);
                border-color: var(--accent-emerald) !important;
                box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(16, 185, 129, 0.05) !important;
            }
            .group-module-card.active-group-card {
                border: 2px solid var(--accent-emerald) !important;
                background: linear-gradient(145deg, var(--bg-secondary), rgba(16, 185, 129, 0.02)) !important;
                box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.15) !important;
            }
            .asist-worker-card {
                border-radius: 12px !important;
                border: 1px solid var(--border-color) !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02) !important;
                transition: all 0.2s ease !important;
                border-left-width: 6px !important;
            }
            .asist-worker-card:hover {
                box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.05) !important;
                transform: translateY(-1px);
            }
            .asist-worker-card.asist-presente {
                border-left-color: var(--accent-emerald) !important;
            }
            .asist-worker-card.asist-falta {
                border-left-color: var(--accent-rose) !important;
                background-color: rgba(244, 63, 94, 0.01) !important;
            }
            </style>

            <div class="banner" style="margin-bottom: 20px;">
                <div>
                    <strong>Registro de Asistencia por Módulos de Grupo</strong> - Selecciona la fecha y el turno globales, luego haz clic en un grupo en la cuadrícula de abajo para tomar asistencia.
                </div>
            </div>

            <!-- Global Parameters Card -->
            <div class="card" style="margin-bottom: 20px; padding: 16px;">
                <div class="form-row" style="margin-bottom: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group" style="margin: 0;">
                        <label style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">Fecha de Operación</label>
                        <input type="date" id="asist-fecha" class="form-input" style="height: 38px; padding: 6px 12px; font-size: 0.85rem;" required>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">Turno Laboral</label>
                        <select id="asist-turno" class="form-select" style="height: 38px; padding: 6px 12px; font-size: 0.85rem;">
                            ${turnos.map(t => `<option value="${t.id}">${t.nombre} (${t.hora_inicio} - ${t.hora_fin})</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Groups Grid (Main Navigation Entry point) -->
            <div style="margin-bottom: 24px;">
                <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">👥 Módulos de Grupo de Trabajo</h3>
                <div class="attendance-grid" id="asist-groups-grid">
                    <!-- Loaded dynamically via renderGroupsGrid() -->
                </div>
            </div>

            <!-- Active Group Attendance List -->
            <div class="card" id="card-attendance-list" style="display:none; flex-direction: column; gap: 20px; border: 2px solid var(--accent-emerald);">
                <div class="card-title" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <h2 id="attendance-list-title" style="margin: 0; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">Asistencia: Grupo</h2>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">
                            Haz clic en las tarjetas de los operarios para marcar su **Falta** en el día y turno seleccionados.
                        </span>
                    </div>
                    <div style="display:flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <button class="btn btn-secondary btn-sm" id="btn-import-asist-csv" style="font-size:0.85rem; padding:8px 16px; display: flex; align-items: center; gap: 6px;">📥 Subir Excel (CSV)</button>
                        <input type="file" id="asist-import-file" style="display: none;" accept=".csv">
                        <button class="btn btn-primary btn-sm" id="btn-save-asistencia" style="font-size:0.85rem; padding:8px 16px;">💾 Guardar Asistencia</button>
                    </div>
                </div>

                <!-- Registration Parameters (Supervisor) placed directly here -->
                <div class="form-row" style="background: rgba(15, 23, 42, 0.01); padding: 16px; border-radius: 10px; border: 1px solid var(--border-color); margin-bottom: 0; display: grid; grid-template-columns: 1fr; gap: 16px;">
                    <div class="form-group" style="margin: 0;">
                        <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">Supervisor a Cargo</label>
                        <select id="asist-active-supervisor" class="form-select" style="height: 38px; padding: 6px 12px; font-size: 0.85rem;"></select>
                    </div>
                </div>

                <!-- 🔍 Search Bar for temporary workers (Lupita) -->
                <div style="display: flex; gap: 8px; align-items: center; background: rgba(15, 23, 42, 0.02); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color); position: relative;">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--text-muted)" stroke-width="2.5" fill="none" style="margin-right: 4px;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="asist-search-worker" placeholder="Buscar operario por nombre, DNI o código para traer a este grupo HOY..." style="border: none; background: transparent; outline: none; width: 100%; font-size: 0.85rem; color: var(--text-primary);">
                    
                    <!-- Search Results -->
                    <div id="asist-search-results" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: var(--shadow-premium); z-index: 100; max-height: 220px; overflow-y: auto; margin-top: 4px;">
                        <!-- Matches loaded dynamically -->
                    </div>
                </div>

                <div class="attendance-grid" id="attendance-container">
                    <!-- Workers of active group loaded dynamically -->
                </div>
            </div>

            <!-- History Logs -->
            <div class="card" style="margin-top: 24px;">
                <div class="card-title">
                    <h2>Historial de Asistencias Guardadas</h2>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Turno</th>
                                <th>Supervisor</th>
                                <th>Operarios Registrados</th>
                                <th>Presentes</th>
                                <th>Faltas</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody id="table-asistencia-historial-body">
                            <!-- Historical logs loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const fechaInput = document.getElementById('asist-fecha');
        const turnoSelect = document.getElementById('asist-turno');

        // Initial default value for date field
        fechaInput.value = new Date().toISOString().split('T')[0];

        // Listen for changes in Date and Turn to refresh both group status grid and the active list
        fechaInput.addEventListener('change', () => {
            this.renderGroupsGrid();
            if (this.selectedGrupo) {
                this.selectGroup(this.selectedGrupo, true);
            }
        });

        turnoSelect.addEventListener('change', () => {
            this.renderGroupsGrid();
            if (this.selectedGrupo) {
                this.selectGroup(this.selectedGrupo, true);
            }
        });

        // Save Attendance button binding
        document.getElementById('btn-save-asistencia').addEventListener('click', () => {
            this.saveAttendance();
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            const results = document.getElementById('asist-search-results');
            const searchInput = document.getElementById('asist-search-worker');
            if (results && searchInput && !results.contains(e.target) && e.target !== searchInput) {
                results.style.display = 'none';
            }
        });

        // CSV/Excel Import file triggers
        const importBtn = document.getElementById('btn-import-asist-csv');
        const importInput = document.getElementById('asist-import-file');

        if (importBtn && importInput) {
            importBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.selectedGrupo) {
                    alert("Por favor, seleccione primero un grupo de trabajo.");
                    return;
                }
                importInput.click();
            });

            importInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    this.importCSV(event.target.result);
                    importInput.value = ''; // clear select
                };
                reader.readAsText(file);
            });
        }

        this.bindSearchEvent();
        this.refreshHistory();
    },

    renderGroupsGrid() {
        const grid = document.getElementById('asist-groups-grid');
        if (!grid) return;

        const fecha = this.getSelectedDate();
        const turnoId = this.getSelectedTurn();

        const grupos = window.db.getAll('grupos').filter(g => g.estado === 'Activo');
        const personal = window.db.getAll('personal').filter(p => p.estado === 'Activo');
        const supervisores = window.db.getAll('supervisores');
        const asistencias = window.db.getAll('asistencia_diaria');

        grid.innerHTML = '';

        if (grupos.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 20px; color:var(--text-muted);">No hay grupos de trabajo activos en el sistema.</div>`;
            return;
        }

        grupos.forEach(g => {
            const supName = supervisores.find(s => s.id === g.supervisor_id)?.nombre || 'N/A';
            const workersCount = personal.filter(p => p.grupo_id === g.id).length;

            // Check if there is already attendance saved for this group, date, and turn
            const groupWorkersIds = personal.filter(p => p.grupo_id === g.id).map(p => p.id);
            const logsToday = asistencias.filter(a => a.fecha === fecha && a.turno_id === turnoId && groupWorkersIds.includes(a.trabajador_id));
            const isRegistered = logsToday.length > 0;

            let presents = 0;
            let absences = 0;
            if (isRegistered) {
                logsToday.forEach(log => {
                    if (log.estado_asistencia === 'Presente') presents++;
                    else absences++;
                });
            }
            const total = presents + absences;
            const presentsPct = total > 0 ? (presents / total) * 100 : 100;

            const card = document.createElement('div');
            card.className = `worker-card group-module-card ${this.selectedGrupo === g.id ? 'active-group-card' : ''}`;
            card.style.cssText = `
                cursor: pointer; 
                display: flex; 
                flex-direction: column; 
                justify-content: space-between; 
                gap: 12px; 
                background: var(--bg-secondary); 
                padding: 18px;
            `;

            card.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <span style="font-weight: 700; color: var(--text-primary); font-size: 1.05rem;">🛡️ ${g.codigo_grupo}</span>
                        <div style="display:flex; gap:6px; align-items:center;">
                            ${g.area_proceso ? `<span class="badge badge-purple" style="font-size: 0.7rem; padding: 2px 6px;">${g.area_proceso}</span>` : ''}
                            <span style="font-size: 0.72rem; color: var(--text-secondary); display:flex; align-items:center; gap:2px;">
                                ${g.turno_habitual === 'Dia' ? '☀️ Día' : '🌙 Noche'}
                            </span>
                        </div>
                    </div>
                    <span style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px;">Supervisor: <strong>${supName}</strong></span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${workersCount} operarios permanentes</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-color); padding-top: 10px; margin-top: 4px;">
                    ${isRegistered ? `
                        <div style="display:flex; flex-direction:column; gap:4px; width:100%;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="badge badge-green" style="font-size: 0.7rem; padding: 2px 6px;">✅ Asistencia (${presents}/${total})</span>
                                <span style="font-size:0.7rem; font-weight:700; color:var(--accent-emerald);">${presentsPct.toFixed(0)}%</span>
                            </div>
                            <div style="width:100%; height:6px; background:rgba(0,0,0,0.05); border-radius:10px; overflow:hidden; display:flex;">
                                <div style="width:${presentsPct}%; height:100%; background:var(--accent-emerald);"></div>
                                <div style="width:${100 - presentsPct}%; height:100%; background:var(--accent-rose);"></div>
                            </div>
                        </div>
                    ` : `
                        <span class="badge badge-orange" style="font-size: 0.72rem; padding: 4px 8px;">⏳ Registro Hoy</span>
                        <button class="btn btn-secondary btn-sm" style="padding: 2px 10px; font-size: 0.75rem; border-radius:6px;">Registrar</button>
                    `}
                </div>
            `;

            card.addEventListener('click', () => {
                this.selectGroup(g.id);
            });

            grid.appendChild(card);
        });
    },

    selectGroup(groupId, isChangeFromSelectors = false) {
        this.selectedGrupo = Math.random().toString(); // Trigger grid update if click was on different card
        this.selectedGrupo = groupId;

        const activeGroups = window.db.getAll('grupos').filter(g => g.estado === 'Activo');
        const g = activeGroups.find(grp => grp.id === groupId);
        if (!g) return;

        const fechaInput = document.getElementById('asist-fecha');
        const turnoSelect = document.getElementById('asist-turno');

        // (We preserve the globally selected date and shift, so we don't overwrite them)

        this.renderGroupsGrid(); // Re-render to highlight active card & sync status badges

        const fecha = fechaInput.value;
        const turnoId = turnoSelect.value;

        const personal = window.db.getAll('personal').filter(p => p.estado === 'Activo');
        const savedToday = window.db.getAll('asistencia_diaria').filter(a => a.fecha === fecha && a.turno_id === turnoId);
        const supervisores = window.db.getAll('supervisores').filter(s => s.estado === 'Activo');

        // Load workers permanently in this group, plus anyone who had a log today in this group
        const groupWorkers = personal.filter(p => {
            const hasLogToday = savedToday.find(s => s.trabajador_id === p.id);
            if (hasLogToday) {
                return hasLogToday.grupo_temporal_id === g.id || (!hasLogToday.grupo_temporal_id && p.grupo_id === g.id);
            }
            return p.grupo_id === g.id;
        });

        // Prepopulate supervisor selection
        const supSelect = document.getElementById('asist-active-supervisor');
        if (supSelect) {
            supSelect.innerHTML = supervisores.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
            
            // Default to group's permanent supervisor, or look if savedToday has a supervisor assigned
            const existingLog = savedToday.find(a => groupWorkers.map(w => w.id).includes(a.trabajador_id));
            if (existingLog) {
                supSelect.value = existingLog.supervisor_id;
            } else {
                supSelect.value = g.supervisor_id;
            }
        }

        // Set Title
        const title = document.getElementById('attendance-list-title');
        title.innerHTML = `Registro de Asistencia: <span style="color: var(--accent-emerald); font-weight:800;">${g.codigo_grupo}</span>`;

        const container = document.getElementById('attendance-container');
        container.innerHTML = '';
        this.attendanceData = {};

        if (groupWorkers.length === 0) {
            container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 20px; color:var(--text-muted);">No hay trabajadores asignados a este grupo. Usa el buscador de arriba para traer operarios temporales hoy.</div>`;
            document.getElementById('card-attendance-list').style.display = 'flex';
            return;
        }

        groupWorkers.forEach(w => {
            const log = savedToday.find(a => a.trabajador_id === w.id);
            const activeStatus = log ? log.estado_asistencia : 'Presente';
            const tempGroupId = log ? (log.grupo_temporal_id || w.grupo_id) : w.grupo_id;

            const turnConfig = window.db.getById('turnos', turnoId) || { hora_inicio: '08:30', hora_fin: '17:00' };
            const horaEntrada = log ? (log.hora_entrada || turnConfig.hora_inicio) : turnConfig.hora_inicio;
            const horaSalida = log ? (log.hora_salida || turnConfig.hora_fin) : turnConfig.hora_fin;

            this.attendanceData[w.id] = {
                status: activeStatus,
                grupo_temporal_id: tempGroupId,
                hora_entrada: horaEntrada,
                hora_salida: horaSalida
            };

            const card = document.createElement('div');
            card.className = `worker-card asist-worker-card ${activeStatus === 'Presente' ? 'asist-presente' : 'asist-falta'}`;
            card.style.cssText = `
                cursor: pointer; 
                display: flex; 
                flex-direction: column; 
                gap: 12px; 
                padding: 14px; 
                background: var(--bg-secondary); 
                border-top: 1px solid var(--border-color);
                border-right: 1px solid var(--border-color);
                border-bottom: 1px solid var(--border-color);
            `;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="worker-avatar" style="width: 36px; height: 36px; background: ${activeStatus === 'Presente' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-size: 0.9rem; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; transition: background-color var(--transition-speed);">
                            ${w.nombre.charAt(0)}${w.apellidos.charAt(0)}
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${w.nombre} ${w.apellidos}</span>
                            <span style="font-size: 0.72rem; color: var(--text-muted);">${w.grupo_id !== g.id ? '<span class="badge badge-orange" style="font-size:0.6rem; padding: 2px 4px; margin-right:4px;">Temp Hoy</span>' : ''}DNI: ${w.dni} | Código: ${w.codigo}</span>
                        </div>
                    </div>
                    
                    <div class="asist-toggle-badge" style="padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; color: white; background-color: ${activeStatus === 'Presente' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; display: flex; align-items: center; gap: 6px; transition: background-color var(--transition-speed);">
                        ${activeStatus === 'Presente' ? '✔️ Asistió' : '❌ Falta'}
                    </div>
                </div>

                <div class="worker-group-swap" style="border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 4px;" onclick="event.stopPropagation();">
                    <label style="font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Mover temporalmente a:</label>
                    <select class="form-select select-temp-group" data-worker-id="${w.id}" style="padding: 4px 8px; font-size: 0.75rem; width: 100%; height: 28px; margin-top:4px;">
                        ${activeGroups.map(grp => `<option value="${grp.id}" ${grp.id === tempGroupId ? 'selected' : ''}>${grp.id === w.grupo_id ? '🏠 ' : '🔄 '}${grp.codigo_grupo}</option>`).join('')}
                    </select>
                </div>

                <div class="asist-hours-container" style="display: ${activeStatus === 'Presente' ? 'flex' : 'none'}; gap: 8px; border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 4px;" onclick="event.stopPropagation();">
                    <div style="flex:1; display:flex; flex-direction:column; gap:2px;">
                        <label style="font-size:0.65rem; color:var(--text-muted); font-weight:600;">Hora Entrada:</label>
                        <input type="time" class="form-input input-asist-ini" data-worker-id="${w.id}" value="${horaEntrada}" style="padding:2px 6px; font-size:0.75rem; height:26px; border-color:var(--border-color);">
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; gap:2px;">
                        <label style="font-size:0.65rem; color:var(--text-muted); font-weight:600;">Hora Salida:</label>
                        <input type="time" class="form-input input-asist-fin" data-worker-id="${w.id}" value="${horaSalida}" style="padding:2px 6px; font-size:0.75rem; height:26px; border-color:var(--border-color);">
                    </div>
                </div>
            `;

            // Toggle attendance status when card is clicked
            card.addEventListener('click', () => {
                const currentStatus = this.attendanceData[w.id].status;
                const newStatus = currentStatus === 'Presente' ? 'Falta' : 'Presente';
                this.attendanceData[w.id].status = newStatus;

                // Update UI styles on the card
                const badge = card.querySelector('.asist-toggle-badge');
                const avatar = card.querySelector('.worker-avatar');

                if (newStatus === 'Presente') {
                    card.classList.remove('asist-falta');
                    card.classList.add('asist-presente');
                    badge.style.backgroundColor = 'var(--accent-emerald)';
                    badge.innerHTML = '✔️ Asistió';
                    avatar.style.backgroundColor = 'var(--accent-emerald)';
                    card.querySelector('.asist-hours-container').style.display = 'flex';
                } else {
                    card.classList.remove('asist-presente');
                    card.classList.add('asist-falta');
                    badge.style.backgroundColor = 'var(--accent-rose)';
                    badge.innerHTML = '❌ Falta';
                    avatar.style.backgroundColor = 'var(--accent-rose)';
                    card.querySelector('.asist-hours-container').style.display = 'none';
                }
            });

            // Hours input change listeners
            card.querySelector('.input-asist-ini').addEventListener('change', (e) => {
                this.attendanceData[w.id].hora_entrada = e.target.value;
            });
            card.querySelector('.input-asist-fin').addEventListener('change', (e) => {
                this.attendanceData[w.id].hora_salida = e.target.value;
            });

            // Group swap select listener
            card.querySelector('.select-temp-group').addEventListener('change', (e) => {
                this.attendanceData[w.id].grupo_temporal_id = e.target.value;
            });

            container.appendChild(card);
        });

        document.getElementById('card-attendance-list').style.display = 'flex';
        document.getElementById('card-attendance-list').scrollIntoView({ behavior: 'smooth' });
    },

    bindSearchEvent() {
        const searchInput = document.getElementById('asist-search-worker');
        const results = document.getElementById('asist-search-results');
        if (!searchInput || !results) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                results.style.display = 'none';
                return;
            }

            const personal = window.db.getAll('personal').filter(p => p.estado === 'Activo');
            const groups = window.db.getAll('grupos');
            
            // Exclude already loaded workers in the current grid
            const loadedWorkerIds = Object.keys(this.attendanceData);
            const matches = personal.filter(p => {
                if (loadedWorkerIds.includes(p.id)) return false;
                const fullname = `${p.nombre} ${p.apellidos}`.toLowerCase();
                return fullname.includes(query) || p.dni.includes(query) || p.codigo.toLowerCase().includes(query);
            }).slice(0, 10);

            results.innerHTML = '';

            if (matches.length === 0) {
                results.innerHTML = `<div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No se encontraron operarios.</div>`;
                results.style.display = 'block';
                return;
            }

            matches.forEach(w => {
                const grpName = groups.find(g => g.id === w.grupo_id)?.codigo_grupo || 'Sin Grupo';
                const row = document.createElement('div');
                row.style.cssText = 'padding: 8px 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background-color 0.2s;';
                
                row.addEventListener('mouseover', () => { row.style.backgroundColor = 'rgba(15,23,42,0.03)'; });
                row.addEventListener('mouseout', () => { row.style.backgroundColor = 'transparent'; });
                
                row.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap: 2px;">
                        <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">${w.nombre} ${w.apellidos}</span>
                        <span style="font-size: 0.7rem; color: var(--text-muted);">Cod: ${w.codigo} | DNI: ${w.dni} | Grp Fijo: ${grpName}</span>
                    </div>
                    <button class="btn btn-secondary btn-sm" style="padding: 2px 8px; font-size: 0.7rem; background-color: var(--accent-emerald-glow); color: var(--accent-emerald); border-color: rgba(16,185,129,0.2);">+ Traer Hoy</button>
                `;

                row.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.addWorkerTemporarily(w);
                    searchInput.value = '';
                    results.style.display = 'none';
                });

                results.appendChild(row);
            });

            results.style.display = 'block';
        });
    },

    addWorkerTemporarily(w) {
        const activeGroups = window.db.getAll('grupos').filter(g => g.estado === 'Activo');
        const container = document.getElementById('attendance-container');

        // Check if "No workers" placeholder is there and remove it
        if (container.querySelector('div[style*="grid-column"]')) {
            container.innerHTML = '';
        }

        const activeStatus = 'Presente';
        const tempGroupId = this.selectedGrupo;

        const turnConfig = window.db.getById('turnos', this.getSelectedTurn()) || { hora_inicio: '08:30', hora_fin: '17:00' };

        this.attendanceData[w.id] = {
            status: activeStatus,
            grupo_temporal_id: tempGroupId,
            hora_entrada: turnConfig.hora_inicio,
            hora_salida: turnConfig.hora_fin
        };

        const card = document.createElement('div');
        card.className = 'worker-card asist-worker-card asist-presente';
        card.style.cssText = `
            cursor: pointer; 
            display: flex; 
            flex-direction: column; 
            gap: 12px; 
            padding: 14px; 
            background: var(--bg-secondary); 
            border-top: 1px solid var(--border-color);
            border-right: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
            animation: highlightFade 1.0s ease-out;
        `;

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="worker-avatar" style="width: 36px; height: 36px; background: var(--accent-emerald); font-size: 0.9rem; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; transition: background-color var(--transition-speed);">
                        ${w.nombre.charAt(0)}${w.apellidos.charAt(0)}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${w.nombre} ${w.apellidos}</span>
                        <span style="font-size: 0.72rem; color: var(--text-muted);"><span class="badge badge-orange" style="font-size:0.6rem; padding: 2px 4px; margin-right:4px;">Temp Hoy</span>DNI: ${w.dni} | Código: ${w.codigo}</span>
                    </div>
                </div>
                
                <div class="asist-toggle-badge" style="padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; color: white; background-color: var(--accent-emerald); display: flex; align-items: center; gap: 6px; transition: background-color var(--transition-speed);">
                    ✔️ Asistió
                </div>
            </div>

            <div class="worker-group-swap" style="border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 4px;" onclick="event.stopPropagation();">
                <label style="font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Mover temporalmente a:</label>
                <select class="form-select select-temp-group" data-worker-id="${w.id}" style="padding: 4px 8px; font-size: 0.75rem; width: 100%; height: 28px; margin-top:4px;">
                    ${activeGroups.map(grp => `<option value="${grp.id}" ${grp.id === tempGroupId ? 'selected' : ''}>${grp.id === w.grupo_id ? '🏠 ' : '🔄 '}${grp.codigo_grupo}</option>`).join('')}
                </select>
            </div>

            <div class="asist-hours-container" style="display: flex; gap: 8px; border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 4px;" onclick="event.stopPropagation();">
                <div style="flex:1; display:flex; flex-direction:column; gap:2px;">
                    <label style="font-size:0.65rem; color:var(--text-muted); font-weight:600;">Hora Entrada:</label>
                    <input type="time" class="form-input input-asist-ini" data-worker-id="${w.id}" value="${turnConfig.hora_inicio}" style="padding:2px 6px; font-size:0.75rem; height:26px; border-color:var(--border-color);">
                </div>
                <div style="flex:1; display:flex; flex-direction:column; gap:2px;">
                    <label style="font-size:0.65rem; color:var(--text-muted); font-weight:600;">Hora Salida:</label>
                    <input type="time" class="form-input input-asist-fin" data-worker-id="${w.id}" value="${turnConfig.hora_fin}" style="padding:2px 6px; font-size:0.75rem; height:26px; border-color:var(--border-color);">
                </div>
            </div>
        `;

        // Toggle attendance status when card is clicked
        card.addEventListener('click', () => {
            const currentStatus = this.attendanceData[w.id].status;
            const newStatus = currentStatus === 'Presente' ? 'Falta' : 'Presente';
            this.attendanceData[w.id].status = newStatus;

            // Update UI styles on the card
            const badge = card.querySelector('.asist-toggle-badge');
            const avatar = card.querySelector('.worker-avatar');

            if (newStatus === 'Presente') {
                card.classList.remove('asist-falta');
                card.classList.add('asist-presente');
                badge.style.backgroundColor = 'var(--accent-emerald)';
                badge.innerHTML = '✔️ Asistió';
                avatar.style.backgroundColor = 'var(--accent-emerald)';
            } else {
                card.classList.remove('asist-presente');
                card.classList.add('asist-falta');
                badge.style.backgroundColor = 'var(--accent-rose)';
                badge.innerHTML = '❌ Falta';
                avatar.style.backgroundColor = 'var(--accent-rose)';
            }
        });

        // Group swap select listener
        card.querySelector('.select-temp-group').addEventListener('change', (e) => {
            this.attendanceData[w.id].grupo_temporal_id = e.target.value;
        });

        container.appendChild(card);
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    importCSV(text) {
        const rows = window.utils.parseCSV(text);
        if (rows.length === 0) {
            alert("El archivo CSV está vacío.");
            return;
        }

        const personal = window.db.getAll('personal').filter(p => p.estado === 'Activo');
        const activeGroups = window.db.getAll('grupos').filter(g => g.estado === 'Activo');
        const container = document.getElementById('attendance-container');
        
        container.innerHTML = '';
        this.attendanceData = {};

        let matchesCount = 0;

        // Skip header row if the first cell matches common header terms
        const firstCell = rows[0][0] ? rows[0][0].toLowerCase().trim() : '';
        const startIdx = (firstCell.includes('dni') || firstCell.includes('cod') || firstCell.includes('id') || firstCell.includes('nombre') || firstCell.includes('trabajador')) ? 1 : 0;

        for (let i = startIdx; i < rows.length; i++) {
            const row = rows[i];
            if (row.length === 0 || !row[0]) continue;

            const identifier = row[0].trim();
            if (!identifier) continue;

            // Find worker in plant by Code or DNI
            let worker = personal.find(p => p.codigo === identifier || p.dni === identifier);

            if (!worker) {
                // Fuzzy match by name if code/DNI didn't match
                const nameQuery = identifier.toLowerCase();
                worker = personal.find(p => `${p.nombre} ${p.apellidos}`.toLowerCase().includes(nameQuery));
            }

            if (worker) {
                // If not already in attendanceData (avoid duplicates in CSV)
                if (!this.attendanceData[worker.id]) {
                    this.attendanceData[worker.id] = {
                        status: 'Presente',
                        grupo_temporal_id: this.selectedGrupo
                    };

                    // Render worker card
                    const w = worker;
                    const tempGroupId = this.selectedGrupo;
                    const card = document.createElement('div');
                    card.className = 'worker-card asist-worker-card asist-presente';
                    card.style.cssText = `
                        cursor: pointer; 
                        display: flex; 
                        flex-direction: column; 
                        gap: 12px; 
                        padding: 14px; 
                        background: var(--bg-secondary); 
                        border-top: 1px solid var(--border-color);
                        border-right: 1px solid var(--border-color);
                        border-bottom: 1px solid var(--border-color);
                        animation: highlightFade 1.0s ease-out;
                    `;

                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="worker-avatar" style="width: 36px; height: 36px; background: var(--accent-emerald); font-size: 0.9rem; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; transition: background-color var(--transition-speed);">
                                    ${w.nombre.charAt(0)}${w.apellidos.charAt(0)}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${w.nombre} ${w.apellidos}</span>
                                    <span style="font-size: 0.72rem; color: var(--text-muted);">${w.grupo_id !== this.selectedGrupo ? '<span class="badge badge-orange" style="font-size:0.6rem; padding: 2px 4px; margin-right:4px;">Temp Hoy</span>' : ''}DNI: ${w.dni} | Código: ${w.codigo}</span>
                                </div>
                            </div>
                            
                            <div class="asist-toggle-badge" style="padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; color: white; background-color: var(--accent-emerald); display: flex; align-items: center; gap: 6px; transition: background-color var(--transition-speed);">
                                ✔️ Asistió
                            </div>
                        </div>

                        <div class="worker-group-swap" style="border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 4px;" onclick="event.stopPropagation();">
                            <label style="font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Mover temporalmente a:</label>
                            <select class="form-select select-temp-group" data-worker-id="${w.id}" style="padding: 4px 8px; font-size: 0.75rem; width: 100%; height: 28px; margin-top:4px;">
                                ${activeGroups.map(grp => `<option value="${grp.id}" ${grp.id === tempGroupId ? 'selected' : ''}>${grp.id === w.grupo_id ? '🏠 ' : '🔄 '}${grp.codigo_grupo}</option>`).join('')}
                            </select>
                        </div>
                    `;

                    // Toggle attendance status when card is clicked
                    card.addEventListener('click', () => {
                        const currentStatus = this.attendanceData[w.id].status;
                        const newStatus = currentStatus === 'Presente' ? 'Falta' : 'Presente';
                        this.attendanceData[w.id].status = newStatus;

                        // Update UI styles on the card
                        const badge = card.querySelector('.asist-toggle-badge');
                        const avatar = card.querySelector('.worker-avatar');

                        if (newStatus === 'Presente') {
                            card.classList.remove('asist-falta');
                            card.classList.add('asist-presente');
                            badge.style.backgroundColor = 'var(--accent-emerald)';
                            badge.innerHTML = '✔️ Asistió';
                            avatar.style.backgroundColor = 'var(--accent-emerald)';
                        } else {
                            card.classList.remove('asist-presente');
                            card.classList.add('asist-falta');
                            badge.style.backgroundColor = 'var(--accent-rose)';
                            badge.innerHTML = '❌ Falta';
                            avatar.style.backgroundColor = 'var(--accent-rose)';
                        }
                    });

                    // Group swap select listener
                    card.querySelector('.select-temp-group').addEventListener('change', (e) => {
                        this.attendanceData[w.id].grupo_temporal_id = e.target.value;
                    });

                    container.appendChild(card);
                    matchesCount++;
                }
            }
        }

        if (matchesCount === 0) {
            container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 20px; color:var(--text-muted);">No se encontraron operarios válidos en el archivo subido.</div>`;
        }

        alert(`✅ Carga finalizada.\n- Operarios cargados en la lista de hoy: ${matchesCount}\n- Todos iniciados como "Asistió". Puedes marcar las faltas haciendo clic en sus tarjetas.`);
    },

    async saveAttendance() {
        const fecha = document.getElementById('asist-fecha').value;
        const turnoId = document.getElementById('asist-turno').value;
        const supervisorId = document.getElementById('asist-active-supervisor').value;

        if (!this.selectedGrupo) {
            alert("No hay ningún grupo seleccionado.");
            return;
        }

        const currentLogs = window.db.getAll('asistencia_diaria');
        const workerIds = Object.keys(this.attendanceData);

        // Delete existing logs for these workers on this date/turn to prevent duplicate keys
        const logsToDelete = currentLogs.filter(log => 
            log.fecha === fecha && log.turno_id === turnoId && workerIds.includes(log.trabajador_id)
        );

        for (let log of logsToDelete) {
            await window.db.delete('asistencia_diaria', log.id);
        }

        // Insert updated/new logs
        for (let workerId of workerIds) {
            const data = this.attendanceData[workerId];
            await window.db.insert('asistencia_diaria', {
                fecha: fecha,
                turno_id: turnoId,
                supervisor_id: supervisorId,
                trabajador_id: workerId,
                estado_asistencia: data.status,
                grupo_temporal_id: data.grupo_temporal_id,
                hora_entrada: data.status === 'Presente' ? (data.hora_entrada || '') : '',
                hora_salida: data.status === 'Presente' ? (data.hora_salida || '') : ''
            });
        }

        alert("✅ Asistencia guardada correctamente para el grupo.");
        
        // Hide panel & refresh grid + history
        document.getElementById('card-attendance-list').style.display = 'none';
        this.selectedGrupo = '';
        this.renderGroupsGrid();
        this.refreshHistory();
    },

    refreshHistory() {
        const list = window.db.getAll('asistencia_diaria');
        const tbody = document.getElementById('table-asistencia-historial-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Group by Date, Turn, Supervisor
        const grouped = {};
        list.forEach(item => {
            const key = `${item.fecha}_${item.turno_id}_${item.supervisor_id}`;
            if (!grouped[key]) {
                grouped[key] = {
                    fecha: item.fecha,
                    turno_id: item.turno_id,
                    supervisor_id: item.supervisor_id,
                    total: 0,
                    presentes: 0,
                    faltas: 0
                };
            }
            grouped[key].total++;
            if (item.estado_asistencia === 'Presente') {
                grouped[key].presentes++;
            } else if (item.estado_asistencia === 'Falta') {
                grouped[key].faltas++;
            }
        });

        const sortedGroup = Object.values(grouped).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        if (sortedGroup.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No hay asistencias registradas aún.</td></tr>`;
            return;
        }

        sortedGroup.forEach(g => {
            const supName = window.db.getById('supervisores', g.supervisor_id)?.nombre || 'N/A';
            const trnName = window.db.getById('turnos', g.turno_id)?.nombre || 'N/A';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${g.fecha}</strong></td>
                <td>${trnName}</td>
                <td>${supName}</td>
                <td>${g.total} operarios</td>
                <td><span class="badge badge-green">${g.presentes} Pres.</span></td>
                <td><span class="badge badge-rose">${g.faltas} Faltas</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm ver-asist-det" data-fecha="${g.fecha}" data-turno="${g.turno_id}" data-sup="${g.supervisor_id}" style="padding:4px 8px; font-size:0.75rem;">Cargar</button>
                </td>
            `;

            tr.querySelector('.ver-asist-det').addEventListener('click', (e) => {
                const f = e.target.dataset.fecha;
                const t = e.target.dataset.turno;
                const s = e.target.dataset.sup;

                // Find a group ID that belongs to this supervisor
                const grupos = window.db.getAll('grupos');
                const matchingGrp = grupos.find(grp => grp.supervisor_id === s && grp.estado === 'Activo') || grupos[0];

                if (matchingGrp) {
                    this.selectedGrupo = matchingGrp.id;
                    
                    // Show attendance panel first to make inputs available
                    document.getElementById('card-attendance-list').style.display = 'flex';
                    
                    document.getElementById('asist-fecha').value = f;
                    document.getElementById('asist-turno').value = t;

                    this.selectGroup(matchingGrp.id, true);
                }
            });

            tbody.appendChild(tr);
        });
    }
};

window.asistenciaModule = asistenciaModule;
