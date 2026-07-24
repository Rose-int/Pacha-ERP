/* ==========================================================================
   Pachamama ERP - Recursos Humanos Module
   ========================================================================== */

const rrhhModule = {
    init() {
        this.renderLayout();
        this.bindEvents();
        this.calculatePayroll();
    },

    renderLayout() {
        const container = document.getElementById('view-recursos-humanos');
        if (!container) return;

        container.innerHTML = `
            <div class="banner">
                <div>
                    <strong>Módulo de Control de Nómina y Tiempos (RRHH)</strong> - Vista consolidadora de asistencia y horas operativas. Permite calcular salarios normales, horas extras y bonificaciones nocturnas de manera automática en base al tareo diario.
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-icon kpi-blue">
                        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Personal Activo</span>
                        <span class="kpi-value" id="kpi-rrhh-personal">0</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon kpi-green">
                        <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Mano de Obra (Soles)</span>
                        <span class="kpi-value" id="kpi-rrhh-costo-pen">S/. 0.00</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon kpi-orange">
                        <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Mano de Obra (USD)</span>
                        <span class="kpi-value" id="kpi-rrhh-costo-usd">$ 0.00</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon kpi-purple">
                        <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Horas Trabajadas (Total)</span>
                        <span class="kpi-value" id="kpi-rrhh-horas">0.0 hrs</span>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="card">
                <div class="form-row">
                    <div class="form-group">
                        <label>Rango de Fechas (Desde)</label>
                        <input type="date" id="rrhh-fecha-desde" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Rango de Fechas (Hasta)</label>
                        <input type="date" id="rrhh-fecha-hasta" class="form-input">
                    </div>
                    <div class="form-group" style="justify-content: flex-end; display:flex;">
                        <button class="btn btn-primary" id="btn-rrhh-refresh" style="width:100%;">🔄 Recalcular Nómina</button>
                    </div>
                </div>
            </div>

            <div class="tabs-container">
                <div class="tab-btn active" id="tab-rrhh-payroll">💰 Consolidado de Nómina</div>
                <div class="tab-btn" id="tab-rrhh-history">🔄 Historial de Movimientos / Cambios</div>
            </div>

            <!-- Tab 1: Payroll Grid -->
            <div class="card" id="panel-rrhh-payroll">
                <div class="card-title">
                    <h2>Consolidado de Tareo por Operario</h2>
                    <button class="btn btn-secondary" id="btn-export-rrhh-excel">📥 Exportar Nómina</button>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Trabajador</th>
                                <th>Grupo (Fijo)</th>
                                <th>Horas Norm.</th>
                                <th>Horas Ext.</th>
                                <th>Horas Noct.</th>
                                <th>Total Horas</th>
                                <th>Costo Estimado</th>
                                <th>Moneda</th>
                            </tr>
                        </thead>
                        <tbody id="table-rrhh-payroll-body">
                            <!-- Dynamically loaded payroll rows -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Tab 2: Group changes logs -->
            <div class="card" id="panel-rrhh-history" style="display:none;">
                <div class="card-title">
                    <h2>Historial de Reasignaciones Temporales de Grupo</h2>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Operario</th>
                                <th>Grupo Original</th>
                                <th>Grupo Temporal Asignado</th>
                                <th>Supervisor Responsable</th>
                                <th>Estado Registro</th>
                            </tr>
                        </thead>
                        <tbody id="table-rrhh-history-body">
                            <!-- Dynamically loaded reassignments -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const tabPayroll = document.getElementById('tab-rrhh-payroll');
        const tabHistory = document.getElementById('tab-rrhh-history');
        const panelPayroll = document.getElementById('panel-rrhh-payroll');
        const panelHistory = document.getElementById('panel-rrhh-history');

        tabPayroll.addEventListener('click', () => {
            tabPayroll.classList.add('active');
            tabHistory.classList.remove('active');
            panelPayroll.style.display = 'flex';
            panelHistory.style.display = 'none';
        });

        tabHistory.addEventListener('click', () => {
            tabHistory.classList.add('active');
            tabPayroll.classList.remove('active');
            panelHistory.style.display = 'flex';
            panelPayroll.style.display = 'none';
        });

        // Set default dates (start of month to today)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        document.getElementById('rrhh-fecha-desde').value = firstDay.toISOString().split('T')[0];
        document.getElementById('rrhh-fecha-hasta').value = today.toISOString().split('T')[0];

        document.getElementById('btn-rrhh-refresh').addEventListener('click', () => {
            this.calculatePayroll();
        });

        // Export payroll Excel
        document.getElementById('btn-export-rrhh-excel').addEventListener('click', () => {
            this.exportPayrollCSV();
        });
    },

    calculatePayroll() {
        const since = document.getElementById('rrhh-fecha-desde').value;
        const until = document.getElementById('rrhh-fecha-hasta').value;

        const personal = window.db.getAll('personal');
        const asistencia = window.db.getAll('asistencia_diaria');
        const tareo = window.db.getAll('tareo_diario');
        const turnos = window.db.getAll('turnos');

        // Filter operative logs by date range
        const filterFn = (item) => (!since || item.fecha >= since) && (!until || item.fecha <= until);
        const filteredAsist = asistencia.filter(filterFn);
        const filteredTareo = tareo.filter(filterFn);

        // Prepopulate metrics structure per worker
        const payroll = {};
        personal.forEach(p => {
            payroll[p.id] = {
                worker: p,
                normalHours: 0,
                overtimeHours: 0,
                nightHours: 0,
                totalHours: 0,
                cost: 0
            };
        });

        // Calculate hours worked based on Tareo logs
        filteredTareo.forEach(t => {
            // Find workers who were present on this date, turn, and belong to this group (either temporarily or permanently)
            const asistToday = filteredAsist.filter(a => a.fecha === t.fecha && a.turno_id === t.turno_id && a.estado_asistencia === 'Presente');
            const turnConfig = turnos.find(trn => trn.id === t.turno_id);

            asistToday.forEach(a => {
                const worker = personal.find(p => p.id === a.trabajador_id);
                if (!worker) return;

                // Determine if this worker belongs to this tareo's group today
                const belongsToGroup = a.grupo_temporal_id === t.grupo_id || (!a.grupo_temporal_id && worker.grupo_id === t.grupo_id);
                if (belongsToGroup) {
                    const stats = payroll[worker.id];
                    if (stats && turnConfig) {
                        const shiftStartMin = window.utils.timeToMin(turnConfig.hora_inicio);
                        
                        const getNormalizedMin = (timeStr) => {
                            if (!timeStr) return null;
                            let min = window.utils.timeToMin(timeStr);
                            if (min < shiftStartMin) {
                                min += 1440;
                            }
                            return min;
                        };
                        
                        const tStart = getNormalizedMin(t.hora_inicio);
                        let tEnd = getNormalizedMin(t.hora_fin);
                        if (tEnd < tStart) tEnd += 1440;
                        
                        const wStart = getNormalizedMin(a.hora_entrada) || shiftStartMin;
                        let wEnd = getNormalizedMin(a.hora_salida) || getNormalizedMin(turnConfig.hora_fin);
                        if (wEnd < wStart) wEnd += 1440;
                        
                        // Calculate intersection between [tStart, tEnd] and [wStart, wEnd]
                        const overlapMins = Math.max(0, Math.min(tEnd, wEnd) - Math.max(tStart, wStart));
                        const workerSegmentHours = overlapMins / 60;
                        
                        if (workerSegmentHours <= 0) return;
                        
                        stats.totalHours += workerSegmentHours;
                        
                        // Classify hours into normal and overtime
                        if (stats.normalHours + workerSegmentHours <= 8) {
                            stats.normalHours += workerSegmentHours;
                        } else {
                            const normalDelta = Math.max(0, 8 - stats.normalHours);
                            stats.normalHours += normalDelta;
                            stats.overtimeHours += (workerSegmentHours - normalDelta);
                        }

                        // Determine night hours if turn crosses midnight or is Turno Noche
                        if (turnConfig.aplica_bono) {
                            stats.nightHours += workerSegmentHours;
                        }
                    }
                }
            });
        });

        // Calculate final cost
        let totalCostPEN = 0;
        let totalCostUSD = 0;
        let totalHoursCombined = 0;
        let activeCount = 0;

        const tbody = document.getElementById('table-rrhh-payroll-body');
        if (tbody) tbody.innerHTML = '';

        Object.values(payroll).forEach(item => {
            const p = item.worker;
            const groupName = window.db.getById('grupos', p.grupo_id)?.codigo_grupo || 'N/A';

            // Calculate cost: normal * normal_rate + overtime * overtime_rate + night * night_bonus
            const totalNormalPay = item.normalHours * p.costo_hora_normal;
            const totalOvertimePay = item.overtimeHours * p.costo_hora_extra;
            const totalNightPay = item.nightHours * p.bono_nocturno;
            item.cost = totalNormalPay + totalOvertimePay + totalNightPay;

            totalHoursCombined += item.totalHours;
            if (p.moneda === 'PEN') {
                totalCostPEN += item.cost;
            } else {
                totalCostUSD += item.cost;
            }
            if (p.estado === 'Activo') activeCount++;

            if (tbody) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${p.codigo}</strong></td>
                    <td>${p.nombre} ${p.apellidos}</td>
                    <td>${groupName}</td>
                    <td>${item.normalHours.toFixed(2)} hrs</td>
                    <td>${item.overtimeHours.toFixed(2)} hrs</td>
                    <td>${item.nightHours.toFixed(2)} hrs</td>
                    <td><strong>${item.totalHours.toFixed(2)} hrs</strong></td>
                    <td><strong>${p.moneda === 'PEN' ? 'S/.' : '$'} ${item.cost.toFixed(2)}</strong></td>
                    <td><span class="badge ${p.moneda === 'PEN' ? 'badge-green' : 'badge-blue'}">${p.moneda}</span></td>
                `;
                tbody.appendChild(tr);
            }
        });

        // Update KPIs
        document.getElementById('kpi-rrhh-personal').innerText = activeCount;
        document.getElementById('kpi-rrhh-costo-pen').innerText = `S/. ${totalCostPEN.toFixed(2)}`;
        document.getElementById('kpi-rrhh-costo-usd').innerText = `$ ${totalCostUSD.toFixed(2)}`;
        document.getElementById('kpi-rrhh-horas').innerText = `${totalHoursCombined.toFixed(1)} hrs`;

        // Render Tab 2: Reassignment logs
        this.renderReassignments(filteredAsist);
    },

    renderReassignments(filteredAsist) {
        const tbody = document.getElementById('table-rrhh-history-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        const personal = window.db.getAll('personal');
        const grupos = window.db.getAll('grupos');
        const supervisores = window.db.getAll('supervisores');

        // Filter only logs where a temporary group re-assignment was recorded
        const swaps = filteredAsist.filter(a => a.grupo_temporal_id && a.grupo_temporal_id !== personal.find(p => p.id === a.trabajador_id)?.grupo_id);

        if (swaps.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No hay reasignaciones temporales de grupo registradas en este período.</td></tr>`;
            return;
        }

        swaps.forEach(item => {
            const worker = personal.find(p => p.id === item.trabajador_id);
            if (!worker) return;

            const originalGrpName = grupos.find(g => g.id === worker.grupo_id)?.codigo_grupo || 'N/A';
            const tempGrpName = grupos.find(g => g.id === item.grupo_temporal_id)?.codigo_grupo || 'N/A';
            const supName = supervisores.find(s => s.id === item.supervisor_id)?.nombre || 'N/A';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.fecha}</td>
                <td><strong>${worker.nombre} ${worker.apellidos}</strong></td>
                <td>${originalGrpName}</td>
                <td><span class="badge badge-orange">${tempGrpName}</span></td>
                <td>${supName}</td>
                <td><span class="badge badge-green">Asistencia Registrada</span></td>
            `;
            tbody.appendChild(tr);
        });
    },

    exportPayrollCSV() {
        // Collect current rendered table data
        const rows = document.querySelectorAll('#table-rrhh-payroll-body tr');
        const data = [];
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length >= 9) {
                data.push({
                    codigo: cols[0].innerText,
                    nombre: cols[1].innerText,
                    grupo: cols[2].innerText,
                    normal: cols[3].innerText,
                    extra: cols[4].innerText,
                    nocturnas: cols[5].innerText,
                    total: cols[6].innerText,
                    costo: cols[7].innerText,
                    moneda: cols[8].innerText
                });
            }
        });

        const headers = ["Código", "Trabajador", "Grupo_Permanente", "Horas_Normales", "Horas_Extras", "Horas_Nocturnas", "Total_Horas", "Pago_Estimado", "Moneda"];
        window.utils.exportToCSV("reporte_rrhh_nomina.csv", headers, data, (item) => [
            item.codigo, item.nombre, item.grupo, item.normal, item.extra, item.nocturnas, item.total, item.costo, item.moneda
        ]);
    }
};

window.rrhhModule = rrhhModule;
