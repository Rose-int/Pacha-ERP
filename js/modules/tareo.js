/* ==========================================================================
   Pachamama ERP - Tareo Module with Exporter Allocations & Summary Reports
   ========================================================================== */

const tareoModule = {
    init() {
        this.renderLayout();
        this.bindEvents();
        this.updateTimelines();
        this.renderActiveGroupsList();
        this.refreshTable();
    },

    renderLayout() {
        const container = document.getElementById('view-tareo');
        if (!container) return;

        const turnos = window.db.getAll('turnos');

        container.innerHTML = `
            <div class="banner" style="margin-bottom: 20px;">
                <div>
                    <strong>Control de Tareo de Líneas por Grupo</strong> - Selecciona la fecha y turno. Asigna las horas a las líneas operativas indicando el <strong>Exportador / Dueño de la fruta</strong> (Pachamama, Camposol, Westfalia, etc.) para calcular las horas totales de esa actividad.
                </div>
            </div>

            <!-- Global Parameters Card -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="form-row" style="margin-bottom: 0;">
                    <div class="form-group" style="margin: 0;">
                        <label style="font-weight:700;">Fecha de Operación</label>
                        <input type="date" id="tar-fecha" class="form-input" style="height: 38px;" required>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label style="font-weight:700;">Turno Laboral</label>
                        <select id="tar-turno" class="form-select" style="height: 38px;">
                            ${turnos.map(t => `<option value="${t.id}">${t.nombre} (${t.hora_inicio} - ${t.hora_fin})</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Dual Columns Workspace -->
            <div class="workspace-grid" style="display: grid; grid-template-columns: 1fr 1.1fr; gap: 24px; align-items: start;">
                
                <!-- Left Panel: Group attendance list with quick allocation forms -->
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">📢 Grupos Asistentes (Pendientes de Asignar Tareo)</h3>
                    <div id="tareo-active-groups-list">
                        <!-- Loaded dynamically -->
                    </div>
                </div>

                <!-- Right Panel: visual timelines, history logs & summary report -->
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    
                    <!-- Timelines Card -->
                    <div class="card">
                        <div class="card-title">
                            <h2>Líneas de Tiempo de los Grupos</h2>
                        </div>
                        <div id="tareo-timelines-container" style="display: flex; flex-direction: column; gap: 14px;">
                            <!-- Stacked bar timelines loaded dynamically -->
                        </div>
                    </div>

                    <!-- Summary by Exporter Card (Direct Request!) -->
                    <div class="card" style="border: 2px solid var(--accent-purple);">
                        <div class="card-title">
                            <h2>Resumen de Horas por Exportador y Actividad</h2>
                        </div>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Exportador / Cliente</th>
                                        <th>Línea / Actividad</th>
                                        <th>Horas Totales Dedicadas</th>
                                    </tr>
                                </thead>
                                <tbody id="table-tareo-resumen-body">
                                    <!-- Populated dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- History logs table -->
                    <div class="card" style="overflow:hidden;">
                        <div class="card-title">
                            <h2>Distribución de Horas de Hoy</h2>
                        </div>
                        <div class="table-container" style="max-height: 400px; overflow-y:auto;">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Grupo</th>
                                        <th>Línea</th>
                                        <th>Exportador</th>
                                        <th>Empaque / Destino</th>
                                        <th>Horario</th>
                                        <th>Horas</th>
                                        <th>✕</th>
                                    </tr>
                                </thead>
                                <tbody id="table-tareo-body">
                                    <!-- Loads dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>
        `;
    },

    bindEvents() {
        const inputFecha = document.getElementById('tar-fecha');
        const selectTurno = document.getElementById('tar-turno');

        inputFecha.value = new Date().toISOString().split('T')[0];

        // Trigger updates when global date/turn is changed
        inputFecha.addEventListener('change', () => {
            this.updateTimelines();
            this.renderActiveGroupsList();
            this.refreshTable();
        });

        selectTurno.addEventListener('change', () => {
            this.updateTimelines();
            this.renderActiveGroupsList();
            this.refreshTable();
        });
    },

    renderActiveGroupsList() {
        const container = document.getElementById('tareo-active-groups-list');
        if (!container) return;

        const fecha = document.getElementById('tar-fecha').value;
        const turnoId = document.getElementById('tar-turno').value;

        const personal = window.db.getAll('personal').filter(p => p.estado === 'Activo');
        const asistencias = window.db.getAll('asistencia_diaria').filter(a => a.fecha === fecha && a.turno_id === turnoId);
        const grupos = window.db.getAll('grupos').filter(g => g.estado === 'Activo');
        const procesos = window.db.getAll('procesos');
        const empresas = window.db.getAll('empresas').filter(emp => emp.estado === 'Activo');
        const empaques = window.db.getAll('tipos_empaque').filter(e => e.estado === 'Activo');
        const turnConfig = window.db.getById('turnos', turnoId);

        container.innerHTML = '';

        // Find groups that have attendance logs today
        const groupIdsWithAsist = [...new Set(asistencias.map(a => {
            const worker = personal.find(p => p.id === a.trabajador_id);
            return a.grupo_temporal_id || (worker ? worker.grupo_id : null);
        }).filter(id => id !== null))];

        if (groupIdsWithAsist.length === 0) {
            container.innerHTML = `
                <div class="banner" style="background: rgba(217, 119, 6, 0.05); border: 1px solid rgba(217, 119, 6, 0.15); border-left: 4px solid #D97706; border-radius: 8px; color: #B45309; font-size: 0.9rem; padding: 16px;">
                    ⚠️ No se han registrado asistencias para este día/turno. Ve al módulo de <strong>Asistencia</strong> para marcar el ingreso de personal primero.
                </div>
            `;
            return;
        }

        groupIdsWithAsist.forEach(gId => {
            const g = grupos.find(grp => grp.id === gId);
            if (!g) return;

            // Get attendance stats for this group
            const groupLogs = asistencias.filter(a => {
                const worker = personal.find(p => p.id === a.trabajador_id);
                return a.grupo_temporal_id === gId || (!a.grupo_temporal_id && worker && worker.grupo_id === gId);
            });
            const presents = groupLogs.filter(a => a.estado_asistencia === 'Presente').length;
            const supervisorId = groupLogs[0] ? groupLogs[0].supervisor_id : g.supervisor_id;
            const supervisorName = window.db.getById('supervisores', supervisorId)?.nombre || 'Sin supervisor';

            // Find current tareo records for this group to calculate unallocated time
            const existingTareos = window.db.getAll('tareo_diario').filter(t => t.fecha === fecha && t.turno_id === turnoId && t.grupo_id === gId);
            
            // Calculate next suggested start time
            let suggestedStart = turnConfig.hora_inicio;
            if (existingTareos.length > 0) {
                const sorted = [...existingTareos].sort((a,b) => {
                    const startA = window.utils.timeToMin(a.hora_inicio);
                    const startB = window.utils.timeToMin(b.hora_inicio);
                    return startA - startB;
                });
                suggestedStart = sorted[sorted.length - 1].hora_fin;
            }

            const card = document.createElement('div');
            card.className = 'card';
            card.style.cssText = 'padding: 16px; margin-bottom: 16px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-surface-elevated);';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px dashed var(--border-color); padding-bottom:8px;">
                    <div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <h4 style="margin:0; font-size:1rem; font-weight:700; color:var(--text-primary);">🛡️ ${g.codigo_grupo}</h4>
                            ${g.area_proceso ? `<span class="badge badge-purple" style="font-size: 0.65rem; padding: 2px 6px;">${g.area_proceso}</span>` : ''}
                        </div>
                        <span style="font-size:0.75rem; color:var(--text-muted);">Supervisor hoy: <strong>${supervisorName}</strong></span>
                    </div>
                    <span class="badge badge-green" style="font-size:0.72rem; padding:4px 8px;">👥 ${presents} Presentes</span>
                </div>

                <form class="inline-tareo-form" data-grupo-id="${gId}" data-supervisor-id="${supervisorId}">
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:10px;">
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.7rem; font-weight:700; color:var(--text-secondary);">Línea / Proceso</label>
                            <select class="form-select input-proceso" required style="padding:6px 10px; font-size:0.8rem; height:34px;">
                                ${procesos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.7rem; font-weight:700; color:var(--text-secondary);">Exportador / Cliente</label>
                            <select class="form-select input-empresa" required style="padding:6px 10px; font-size:0.8rem; height:34px;">
                                ${empresas.map(emp => `<option value="${emp.id}">${emp.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.7rem; font-weight:700; color:var(--text-secondary);">Programa / Empaque</label>
                            <select class="form-select input-empaque" required style="padding:6px 10px; font-size:0.8rem; height:34px;">
                                ${empaques.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1.2fr; gap:10px; margin-bottom:10px; align-items:flex-end;">
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.7rem; font-weight:700; color:var(--text-secondary);">Hora Inicio</label>
                            <input type="time" class="form-input input-hora-ini" required value="${suggestedStart}" style="padding:6px 10px; font-size:0.8rem; height:34px;">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.7rem; font-weight:700; color:var(--text-secondary);">Hora Fin</label>
                            <input type="time" class="form-input input-hora-fin" required value="${turnConfig.hora_fin}" style="padding:6px 10px; font-size:0.8rem; height:34px;">
                        </div>
                        <button type="submit" class="btn btn-primary" style="padding: 0; height: 34px; font-size: 0.8rem; font-weight:700; width:100%; display:flex; align-items:center; justify-content:center; gap:4px;">⚡ Asignar Línea</button>
                    </div>

                    <div style="display:flex; gap:8px;">
                        <input type="text" class="form-input input-destino" readonly placeholder="Destino comercial" style="flex:1; padding:6px 10px; font-size:0.75rem; height:28px; background:rgba(15,23,42,0.03); border-color:var(--border-color);">
                        <input type="text" class="form-input input-obs" placeholder="Observaciones (opcional)" style="flex:2; padding:6px 10px; font-size:0.75rem; height:28px; border-color:var(--border-color);">
                    </div>
                </form>
            `;

            // Auto-complete destiny initially
            const selectEmpaque = card.querySelector('.input-empaque');
            const inputDestino = card.querySelector('.input-destino');
            
            const updateDestiny = () => {
                const emId = selectEmpaque.value;
                const emConfig = window.db.getById('tipos_empaque', emId);
                inputDestino.value = emConfig ? emConfig.destino : '';
            };
            selectEmpaque.addEventListener('change', updateDestiny);
            updateDestiny();

            // Submit handler
            card.querySelector('form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleInlineSubmit(e.target);
            });

            container.appendChild(card);
        });
    },

    handleInlineSubmit(form) {
        const fecha = document.getElementById('tar-fecha').value;
        const turnoId = document.getElementById('tar-turno').value;
        
        const grupoId = form.dataset.grupoId;
        const supervisorId = form.dataset.supervisorId;
        const procesoId = form.querySelector('.input-proceso').value;
        const empresaId = form.querySelector('.input-empresa').value;
        const empaqueId = form.querySelector('.input-empaque').value;
        const destino = form.querySelector('.input-destino').value;
        const start = form.querySelector('.input-hora-ini').value;
        const end = form.querySelector('.input-hora-fin').value;
        const obs = form.querySelector('.input-obs').value.trim();

        // Verify bounds
        const turnConfig = window.db.getById('turnos', turnoId);
        const inputStart = window.utils.timeToMin(start);
        const inputEnd = window.utils.timeToMin(end);
        const shiftStart = window.utils.timeToMin(turnConfig.hora_inicio);
        let shiftEnd = window.utils.timeToMin(turnConfig.hora_fin);
        
        if (shiftEnd < shiftStart) shiftEnd += 1440;

        let normalizedStart = inputStart;
        let normalizedEnd = inputEnd;
        if (turnConfig.cruza_medianoche) {
            if (normalizedStart < shiftStart) normalizedStart += 1440;
            if (normalizedEnd < shiftStart) normalizedEnd += 1440;
        }

        if (normalizedStart < shiftStart || normalizedEnd > shiftEnd) {
            alert(`Error: Las horas del tareo (${start} - ${end}) están fuera de los límites del turno seleccionado (${turnConfig.hora_inicio} - ${turnConfig.hora_fin}).`);
            return;
        }

        // Perform splits if crossing midnight
        const timeSegments = window.utils.splitMidnight(start, end);

        timeSegments.forEach(seg => {
            let targetDate = fecha;
            if (seg.dayOffset > 0) {
                const dateObj = new Date(fecha + 'T12:00:00');
                dateObj.setDate(dateObj.getDate() + 1);
                targetDate = dateObj.toISOString().split('T')[0];
            }

            const record = {
                fecha: targetDate,
                turno_id: turnoId,
                supervisor_id: supervisorId,
                grupo_id: grupoId,
                proceso_id: procesoId,
                empresa_id: empresaId,
                tipo_empaque_id: empaqueId,
                destino: destino,
                hora_inicio: seg.start,
                hora_fin: seg.end,
                observaciones: obs + (timeSegments.length > 1 ? ' (Dividido por medianoche)' : '')
            };

            window.db.insert('tareo_diario', record);
        });

        alert("✅ Línea de trabajo y exportador asignados con éxito.");
        this.refreshTable();
        this.updateTimelines();
        this.renderActiveGroupsList();
    },

    updateTimelines() {
        const container = document.getElementById('tareo-timelines-container');
        if (!container) return;

        const fecha = document.getElementById('tar-fecha').value;
        const turnoId = document.getElementById('tar-turno').value;

        if (!fecha || !turnoId) {
            container.innerHTML = '';
            return;
        }

        const groups = window.db.getAll('grupos').filter(g => g.estado === 'Activo');
        const tareos = window.db.getAll('tareo_diario').filter(t => t.fecha === fecha && t.turno_id === turnoId);
        const turnConfig = window.db.getById('turnos', turnoId);

        container.innerHTML = '';

        if (tareos.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted); font-size: 0.9rem;">No hay distribución de horas asignadas en este turno aún.</div>`;
            return;
        }

        const groupsWithTareos = groups.filter(g => tareos.some(t => t.grupo_id === g.id));

        groupsWithTareos.forEach(g => {
            const groupLogs = tareos.filter(t => t.grupo_id === g.id);
            const groupTimelineWrapper = document.createElement('div');
            groupTimelineWrapper.style.marginBottom = '12px';
            container.appendChild(groupTimelineWrapper);
            
            // Draw timeline bar
            this.drawSingleGroupBar(g, groupLogs, turnConfig, groupTimelineWrapper);
        });
    },

    drawSingleGroupBar(g, logs, turnConfig, container) {
        const shiftStartMin = window.utils.timeToMin(turnConfig.hora_inicio);
        let shiftEndMin = window.utils.timeToMin(turnConfig.hora_fin);
        if (shiftEndMin < shiftStartMin) shiftEndMin += 1440;
        const shiftTotalMins = shiftEndMin - shiftStartMin;

        const segments = [];
        logs.forEach(log => {
            let start = window.utils.timeToMin(log.hora_inicio);
            let end = window.utils.timeToMin(log.hora_fin);

            if (turnConfig.cruza_medianoche) {
                if (start < shiftStartMin) start += 1440;
                if (end < shiftStartMin) end += 1440;
            }

            segments.push({ start, end, log });
        });

        segments.sort((a, b) => a.start - b.start);

        const timelineBlocks = [];
        let currentPos = shiftStartMin;

        segments.forEach(seg => {
            if (seg.start > currentPos) {
                timelineBlocks.push({
                    allocated: false,
                    start: currentPos,
                    end: seg.start,
                    duration: seg.start - currentPos
                });
            }
            const correctedStart = Math.max(currentPos, seg.start);
            if (seg.end > correctedStart) {
                timelineBlocks.push({
                    allocated: true,
                    start: correctedStart,
                    end: seg.end,
                    duration: seg.end - correctedStart,
                    log: seg.log
                });
                currentPos = seg.end;
            }
        });

        if (currentPos < shiftEndMin) {
            timelineBlocks.push({
                allocated: false,
                start: currentPos,
                end: shiftEndMin,
                duration: shiftEndMin - currentPos
            });
        }

        let htmlSegments = '';
        const colorPalette = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4'];

        timelineBlocks.forEach((block, idx) => {
            const widthPct = (block.duration / shiftTotalMins) * 100;
            if (widthPct <= 0) return;

            if (block.allocated) {
                let prcName = window.db.getById('procesos', block.log.proceso_id)?.nombre || 'Labor';
                if (prcName.toUpperCase() === 'EMPAQUE' && block.log.tipo_empaque_id) {
                    const empaqueName = window.db.getById('tipos_empaque', block.log.tipo_empaque_id)?.nombre || '';
                    if (empaqueName) {
                        prcName = `Empaque - ${empaqueName}`;
                    }
                }
                const empName = window.db.getById('empresas', block.log.empresa_id)?.nombre || 'N/A';
                const color = colorPalette[idx % colorPalette.length];

                htmlSegments += `
                    <div class="tareo-timeline-segment" 
                         style="width: ${widthPct}%; background-color: ${color}; font-size: 0.72rem; font-weight: 700;" 
                         title="${prcName} (${empName}) (${block.log.hora_inicio} - ${block.log.hora_fin})">
                        ${prcName} (${empName})
                    </div>
                `;
            } else {
                const hrs = (block.duration / 60).toFixed(1);
                htmlSegments += `
                    <div class="tareo-timeline-segment segment-unallocated" 
                         style="width: ${widthPct}%;" 
                         title="Espacio libre sin asignar (${window.utils.minToTime(block.start)} - ${window.utils.minToTime(block.end)})">
                        Libre (${hrs}h)
                    </div>
                `;
            }
        });

        container.innerHTML = `
            <div class="tareo-timeline-wrapper" style="margin-bottom: 4px;">
                <div class="tareo-timeline-title" style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
                    <span style="font-weight:700; color:var(--text-primary);">🛡️ ${g.codigo_grupo}</span>
                    <span style="color:var(--text-muted); font-size:0.75rem;">(${logs.length} labores registradas)</span>
                </div>
                <div class="tareo-timeline-bar" style="height:24px; border-radius:6px; overflow:hidden; display:flex; background:rgba(0,0,0,0.05); border:1px solid var(--border-color);">
                    ${htmlSegments}
                </div>
            </div>
        `;
    },

    refreshTable() {
        const fecha = document.getElementById('tar-fecha').value;
        const turnoId = document.getElementById('tar-turno').value;

        const list = window.db.getAll('tareo_diario').filter(t => t.fecha === fecha && t.turno_id === turnoId);
        const tbody = document.getElementById('table-tareo-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No hay tareos registrados para esta fecha/turno.</td></tr>`;
            this.updateExporterSummary();
            return;
        }

        const sorted = [...list].sort((a, b) => window.utils.timeToMin(a.hora_inicio) - window.utils.timeToMin(b.hora_inicio));

        sorted.forEach(item => {
            const grpName = window.db.getById('grupos', item.grupo_id)?.codigo_grupo || 'N/A';
            let prcName = window.db.getById('procesos', item.proceso_id)?.nombre || 'N/A';
            if (prcName.toUpperCase() === 'EMPAQUE' && item.tipo_empaque_id) {
                const empaqueName = window.db.getById('tipos_empaque', item.tipo_empaque_id)?.nombre || '';
                if (empaqueName) {
                    prcName = `Empaque - ${empaqueName}`;
                }
            }
            const empName = window.db.getById('empresas', item.empresa_id)?.nombre || 'N/A';
            const empaqueName = window.db.getById('tipos_empaque', item.tipo_empaque_id)?.nombre || 'N/A';

            const durationMinutes = window.utils.diffMinutes(item.hora_inicio, item.hora_fin);
            const hoursDecimal = (durationMinutes / 60).toFixed(2);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${grpName}</strong></td>
                <td><span class="badge badge-purple">${prcName}</span></td>
                <td><span class="badge badge-secondary" style="background:rgba(15,23,42,0.05); color:var(--text-primary); border: 1px solid var(--border-color); font-weight:700;">${empName}</span></td>
                <td>
                    <div style="font-weight:500; font-size:0.8rem;">${empaqueName}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">${item.destino}</div>
                </td>
                <td>${item.hora_inicio} - ${item.hora_fin}</td>
                <td><strong>${hoursDecimal} hrs</strong></td>
                <td>
                    <button class="btn btn-danger btn-sm del-tar" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem;">✕</button>
                </td>
            `;

            tr.querySelector('.del-tar').addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (confirm("¿Estás seguro de eliminar este registro de tareo?")) {
                    window.db.delete('tareo_diario', id);
                    this.refreshTable();
                    this.updateTimelines();
                    this.renderActiveGroupsList();
                }
            });

            tbody.appendChild(tr);
        });

        this.updateExporterSummary();
    },

    updateExporterSummary() {
        const fecha = document.getElementById('tar-fecha').value;
        const turnoId = document.getElementById('tar-turno').value;
        const tbody = document.getElementById('table-tareo-resumen-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        const list = window.db.getAll('tareo_diario').filter(t => t.fecha === fecha && t.turno_id === turnoId);
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); font-size:0.8rem;">No hay actividades registradas en esta fecha/turno.</td></tr>`;
            return;
        }

        const summary = {}; // key = `${empresa_id}_${proceso_id}_${empaque_id}` -> hours

        list.forEach(item => {
            const empId = item.empresa_id || 'UNKNOWN';
            const procId = item.proceso_id || 'UNKNOWN';
            const empaqueId = item.tipo_empaque_id || '';
            
            const prcName = window.db.getById('procesos', procId)?.nombre || '';
            const isEmpaque = prcName.toUpperCase() === 'EMPAQUE';
            const key = isEmpaque ? `${empId}_${procId}_${empaqueId}` : `${empId}_${procId}`;

            const durationMinutes = window.utils.diffMinutes(item.hora_inicio, item.hora_fin);
            const hours = durationMinutes / 60;

            if (!summary[key]) {
                summary[key] = {
                    empresaId: empId,
                    procesoId: procId,
                    empaqueId: isEmpaque ? empaqueId : '',
                    hours: 0
                };
            }
            summary[key].hours += hours;
        });

        const sorted = Object.values(summary).sort((a, b) => b.hours - a.hours);

        sorted.forEach(item => {
            const empName = window.db.getById('empresas', item.empresaId)?.nombre || 'General';
            let procName = window.db.getById('procesos', item.procesoId)?.nombre || 'Actividad';
            if (procName.toUpperCase() === 'EMPAQUE' && item.empaqueId) {
                const empaqueName = window.db.getById('tipos_empaque', item.empaqueId)?.nombre || '';
                if (empaqueName) {
                    procName = `Empaque - ${empaqueName}`;
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${empName}</strong></td>
                <td><span class="badge badge-purple">${procName}</span></td>
                <td><strong style="color: var(--accent-emerald); font-size:1rem;">${item.hours.toFixed(2)} hrs</strong></td>
            `;
            tbody.appendChild(tr);
        });
    }
};

window.tareoModule = tareoModule;
