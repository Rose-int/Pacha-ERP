/* ==========================================================================
   Pachamama ERP - Production Module (Simplified Packaging Capture without Client)
   ========================================================================== */

const produccionModule = {
    selectedBoxes: [], // Active box types added to the current form session
    selectedFilter: 'hoy',

    getFilteredRecords(records) {
        return this.filterComponent ? this.filterComponent.filter(records, 'fecha', 'lote_empaque') : records;
    },

    init() {
        this.selectedBoxes = [];
        this.renderLayout();

        this.filterComponent = new window.FilterComponent({
            containerId: 'prod-filter-toolbar-container',
            prefix: 'prod',
            onChange: () => this.refreshTable()
        });

        this.bindEvents();
        this.refreshTable();
    },

    renderLayout() {
        const container = document.getElementById('view-produccion');
        if (!container) return;

        const supervisores = window.db.getAll('supervisores').filter(s => s.estado === 'Activo');
        const turnos = window.db.getAll('turnos');
        const exportadores = window.db.getAll('empresas').filter(e => e.estado === 'Activo');
        const paradas = window.db.getAll('motivos_parada').filter(p => p.estado === 'Activo');
        const cajas = window.db.getAll('tipos_caja').filter(c => c.estado === 'Activo');

        // Available Destinations
        const destinos = ["Europa", "USA", "China", "Corea", "Chile", "Canada", "Colombia", "Otros"];

        container.innerHTML = `
            <div id="prod-filter-toolbar-container"></div>

            <!-- Supervisor Competition Card -->
            <div class="card" style="margin-bottom: 20px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8)); border: 1px solid var(--accent-emerald-glow);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">🏆</span>
                        <div>
                            <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700; background: linear-gradient(to right, #34d399, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Módulo de Competencia y Eficiencia</h2>
                            <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: var(--text-muted);">Compara el rendimiento y precisión de peso por turno</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">¿Quién eres? </label>
                        <select id="active-sup-selector" class="form-select" style="padding: 4px 10px; font-size: 0.8rem; width: 180px;">
                            <option value="">Selecciona tu nombre...</option>
                            ${window.utils.optionsHTML('supervisores')}
                        </select>
                    </div>
                </div>

                <!-- Personalized Supervisor Banner -->
                <div id="sup-personalized-banner" style="display: none; background: rgba(52, 211, 153, 0.05); border: 1px solid rgba(52, 211, 153, 0.15); border-radius: 8px; padding: 12px; margin-bottom: 15px;">
                    <!-- Filled dynamically -->
                </div>

                <!-- Pill Navigation for Areas -->
                <div class="leaderboard-pill-nav">
                    <button class="leaderboard-pill-btn active" id="btn-tab-lead-maritimo" type="button">🚢 Área Marítima</button>
                    <button class="leaderboard-pill-btn" id="btn-tab-lead-aereo" type="button">✈️ Área Aérea</button>
                </div>

                <!-- Leaderboard Area Panels -->
                <div id="panel-lead-maritimo">
                    <div id="ranking-precision-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                        <!-- Filled dynamically -->
                    </div>
                </div>
                
                <div id="panel-lead-aereo" style="display: none;">
                    <div id="ranking-speed-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                        <!-- Filled dynamically -->
                    </div>
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-icon kpi-green">
                        <svg viewBox="0 0 24 24"><path d="M20 7h-9L9 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="currentColor"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Kg Reales Procesados</span>
                        <span class="kpi-value" id="kpi-prod-total-kg">0.0 Kg</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon kpi-blue">
                        <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Cajas Totales</span>
                        <span class="kpi-value" id="kpi-prod-total-cajas">0</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon kpi-orange">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor"/><path d="M12 6v6l4 2" stroke="currentColor"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Tiempo Efectivo Prom.</span>
                        <span class="kpi-value" id="kpi-prod-tiempo-ef">0 min</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon kpi-purple">
                        <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Desviación % Prom.</span>
                        <span class="kpi-value" id="kpi-prod-desviacion">0.0 %</span>
                    </div>
                </div>
            </div>

            <div class="panel-grid split-sidebar">
                <!-- Registration Form -->
                <div class="card">
                    <h3 class="card-title">📝 Parte de Producción (Empaque)</h3>
                    <form id="form-produccion" style="display:flex; flex-direction:column; gap:14px;">
                        
                        <!-- Fixed Process Badge -->
                        <div style="background-color:rgba(16, 185, 129, 0.05); border:1px solid var(--accent-emerald-glow); border-radius:8px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; font-size:0.9rem;">
                            <span style="font-weight:600; color:var(--text-secondary);">Proceso Operativo:</span>
                            <span class="badge badge-green" style="font-size:0.85rem; padding: 4px 10px; font-weight:700;">EMPAQUE</span>
                            <input type="hidden" id="prod-proceso" value="PRO05">
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label>Fecha de Operación</label>
                                <input type="date" id="prod-fecha" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label>Turno</label>
                                <select id="prod-turno" class="form-select" required>
                                    ${turnos.map(t => `<option value="${t.id}">${t.nombre} (${t.hora_inicio}-${t.hora_fin})</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label>Supervisor de Turno</label>
                                <select id="prod-supervisor" class="form-select" required>
                                    <option value="">Selecciona Supervisor...</option>
                                    ${window.utils.optionsHTML('supervisores')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Exportador (Empresa)</label>
                                <select id="prod-exportador" class="form-select" required>
                                    <option value="">Selecciona Exportador...</option>
                                    ${window.utils.optionsHTML('empresas')}
                                </select>
                            </div>
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label>Vía de Embarque</label>
                                <select id="prod-via" class="form-select" required>
                                    <option value="MARITIMO">MARÍTIMO</option>
                                    <option value="AEREO">AÉREO</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>País Destino</label>
                                <select id="prod-destino-com" class="form-select" required>
                                    <option value="">Selecciona Destino...</option>
                                    ${destinos.map(d => `<option value="${d}">${d.toUpperCase()}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Time logs -->
                        <div class="form-row">
                            <div class="form-group">
                                <label>Hora Inicio</label>
                                <input type="time" id="prod-hora-ini" class="form-input" required value="08:00">
                            </div>
                            <div class="form-group">
                                <label>Hora Fin</label>
                                <input type="time" id="prod-hora-fin" class="form-input" required value="20:00">
                            </div>
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label>Tiempo Parada (min)</label>
                                <input type="number" id="prod-parada-min" class="form-input" value="0" min="0">
                            </div>
                            <div class="form-group">
                                <label>Motivo Parada</label>
                                <select id="prod-parada-motivo" class="form-select">
                                    <option value="">Ninguno</option>
                                    ${paradas.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Multi-Caja Selector Section -->
                        <div style="border-top: 1px solid var(--border-color); padding-top: 14px;">
                            <label style="font-size:0.85rem; font-weight:600; color:var(--text-secondary); margin-bottom:8px; display:block;">📦 Agregar Formatos de Caja</label>
                            <div style="display:flex; gap:10px; margin-bottom:12px;">
                                <select id="prod-select-caja" class="form-select" style="flex:1;">
                                    ${cajas.map(c => `<option value="${c.id}">${c.nombre} (Teórico: ${c.peso_teorico}kg)</option>`).join('')}
                                </select>
                                <button type="button" class="btn btn-secondary" id="btn-add-caja-row" style="padding: 0 16px;">+ Agregar</button>
                            </div>
                            <div id="cajas-rows-container">
                                <!-- Dynamically added box entries -->
                            </div>
                        </div>

                        <!-- Calculations Panel in Realtime -->
                        <div id="realtime-metrics" style="background-color:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px; padding:12px; font-size:0.8rem; display:flex; flex-direction:column; gap:6px;">
                            <div style="font-weight:600; color:var(--text-muted); border-bottom:1px solid var(--border-color); padding-bottom:4px; margin-bottom:4px;">CÁLCULOS ESTIMADOS (EN VIVO)</div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
                                <div>Kg Teóricos: <strong id="val-kg-teorico">0.00</strong></div>
                                <div>Kg Reales: <strong id="val-kg-real">0.00</strong></div>
                                <div>Desviación Kg: <strong id="val-kg-desv">0.00</strong></div>
                                <div>Desviación %: <strong id="val-pct-desv">0.00%</strong></div>
                                <div>Rango: <span class="badge badge-blue" id="val-rango" style="display:inline-block; font-size:0.7rem; padding: 1px 6px;">Dentro rango</span></div>
                                <div>Eficiencia Cajas/Hr: <strong id="val-cajas-hr">0.0</strong></div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Observaciones</label>
                            <textarea id="prod-obs" class="form-textarea" rows="2" placeholder="Notas operativas de la producción..."></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width:100%;">Guardar Parte de Producción</button>
                    </form>
                </div>

                <!-- Logs Table -->
                <div class="card" style="overflow:hidden; display:flex; flex-direction:column;">
                    <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
                        <h2 style="margin:0;">Historial de Producción (Empaque)</h2>
                        <button class="btn btn-secondary" id="btn-export-prod-excel">📥 Exportar Historial</button>
                    </div>

                    <!-- Search and Filter Bar -->
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:10px; margin-bottom:12px;">
                        <input type="text" id="prod-search" class="form-input" placeholder="🔍 Buscar por Supervisor, Lote Empaque, Obs..." style="font-size:0.8rem; padding:6px 12px; width:100%;">
                        <select id="prod-filter-empresa" class="form-select" style="font-size:0.8rem; padding:6px 12px; background:#1e293b; color:#fff; border-color:rgba(255,255,255,0.1);">
                            <option value="">🏢 Todos los Exportadores</option>
                            ${window.utils.optionsHTML('empresas')}
                        </select>
                    </div>

                    <div class="table-container" style="flex:1; overflow-y:auto; max-height: 600px;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha/Turno</th>
                                    <th>Supervisor</th>
                                    <th>Exportador (Empresa)</th>
                                    <th>Vía / Destino</th>
                                    <th>Cajas Procesadas</th>
                                    <th>Kg Reales</th>
                                    <th>Desv %</th>
                                    <th>Rango</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody id="table-produccion-body">
                                <!-- Load database records dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Database changes trigger UI updates
        document.addEventListener('db-changed', (e) => {
            if (e.detail && e.detail.key === 'produccion_diaria') {
                this.refreshTable();
            }
        });

        // History List Event Delegation for Delete Button
        const produccionTbody = document.getElementById('table-produccion-body');
        if (produccionTbody) {
            produccionTbody.addEventListener('click', (e) => {
                const btn = e.target.closest('.del-prod');
                if (btn) {
                    const id = btn.getAttribute('data-id');
                    if (confirm("¿Estás seguro de eliminar este parte de empaque?")) {
                        window.db.delete('produccion_diaria', id);
                        this.refreshTable();
                    }
                }
            });
        }

        // Historial Search & Filters
        const prodSearchInput = document.getElementById('prod-search');
        if (prodSearchInput) {
            prodSearchInput.addEventListener('input', () => this.refreshTable());
        }
        const prodEmpresaSelect = document.getElementById('prod-filter-empresa');
        if (prodEmpresaSelect) {
            prodEmpresaSelect.addEventListener('change', () => this.refreshTable());
        }

        const form = document.getElementById('form-produccion');
        if (!form) return;

        document.getElementById('prod-fecha').value = this.getLocalDateStr();

        // Add Box row logic
        const btnAddBox = document.getElementById('btn-add-caja-row');
        btnAddBox.addEventListener('click', () => {
            const cajaId = document.getElementById('prod-select-caja').value;
            if (!cajaId) return;
            const cajaConfig = window.db.getById('tipos_caja', cajaId);
            if (cajaConfig) {
                this.addBoxRow(cajaId, cajaConfig.nombre, 0, cajaConfig.peso_teorico);
            }
        });

        // Box filtering listeners based on Via and Destination
        const selectVia = document.getElementById('prod-via');
        const selectDestino = document.getElementById('prod-destino-com');

        selectVia.addEventListener('change', () => this.filterCajas());
        selectDestino.addEventListener('change', () => this.filterCajas());

        // Initial filter load
        this.filterCajas();

        // Live calculation triggers
        const triggerInputs = ['prod-hora-ini', 'prod-hora-fin', 'prod-parada-min'];
        triggerInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.updateLiveMetrics());
        });

        // Form Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Active Supervisor Selector Change (Direct, without PIN)
        const supSelector = document.getElementById('active-sup-selector');
        if (supSelector) {
            supSelector.value = localStorage.getItem('active_supervisor_id') || "";
            supSelector.addEventListener('change', (e) => {
                localStorage.setItem('active_supervisor_id', e.target.value);
                this.updateLeaderboard();
            });
        }

        // Leaderboard Tab Toggle Logic
        const btnMaritimo = document.getElementById('btn-tab-lead-maritimo');
        const btnAereo = document.getElementById('btn-tab-lead-aereo');
        const panelMaritimo = document.getElementById('panel-lead-maritimo');
        const panelAereo = document.getElementById('panel-lead-aereo');

        if (btnMaritimo && btnAereo && panelMaritimo && panelAereo) {
            btnMaritimo.addEventListener('click', () => {
                btnMaritimo.classList.add('active');
                btnAereo.classList.remove('active');
                panelMaritimo.style.display = 'block';
                panelAereo.style.display = 'none';
            });
            btnAereo.addEventListener('click', () => {
                btnAereo.classList.add('active');
                btnMaritimo.classList.remove('active');
                panelAereo.style.display = 'block';
                panelMaritimo.style.display = 'none';
            });
        }

        // Export Excel button
        document.getElementById('btn-export-prod-excel').addEventListener('click', () => {
            const data = window.db.getAll('produccion_diaria');
            const headers = ["Fecha", "Turno", "Supervisor", "Exportador", "Via", "Destino", "Cajas Summary", "KgTeoricos", "KgReales", "DesviacionPct", "Clasificacion", "CajasHora"];
            window.utils.exportToCSV("partes_produccion_empaque.csv", headers, data, (item) => {
                const sup = window.db.getById('supervisores', item.supervisor_id)?.nombre || '';
                const trn = window.db.getById('turnos', item.turno_id)?.nombre || '';
                const exp = window.db.getById('empresas', item.empresa_id)?.nombre || '';
                
                const boxesSummary = item.cajas.map(c => {
                    const cnf = window.db.getById('tipos_caja', c.tipo_caja_id);
                    return `${cnf ? cnf.codigo : ''}:${c.cantidad_cajas}`;
                }).join(';');

                return [
                    item.fecha, trn, sup, exp, item.via, item.destino,
                    boxesSummary, item.calculos.kgTeoricos, item.calculos.kgReales, item.calculos.desviacionPorc,
                    item.calculos.clasificacion, item.calculos.cajasHora
                ];
            });
        });
    },

    filterCajas() {
        const viaSelect = document.getElementById('prod-via');
        const destSelect = document.getElementById('prod-destino-com');
        const boxSelect = document.getElementById('prod-select-caja');
        if (!viaSelect || !destSelect || !boxSelect) return;

        const via = viaSelect.value;
        const destino = destSelect.value;

        if (!destino) {
            boxSelect.innerHTML = '<option value="">Selecciona destino para cargar cajas...</option>';
            return;
        }

        const cajas = window.db.getAll('tipos_caja').filter(c => c.estado === 'Activo');

        const filtered = cajas.filter(c => {
            // Normalise via (AEREO / MARITIMO)
            const cajaVia = (c.tipo_empaque_via || '').toUpperCase();
            const selectVia = via === 'AEREO' ? 'AEREO' : 'MARITIMO';
            if (cajaVia && cajaVia !== selectVia) return false;

            // Normalise destination country
            const cajaDest = (c.destino_pais || '').toLowerCase();
            const selectDest = (destino || '').toLowerCase();

            if (cajaDest === 'eur' && selectDest === 'europa') return true;
            if (cajaDest === 'usa' && selectDest === 'usa') return true;
            if (cajaDest === 'china' && selectDest === 'china') return true;
            if (cajaDest === 'corea' && selectDest === 'corea') return true;
            if (cajaDest === 'chile' && selectDest === 'chile') return true;
            if (cajaDest === selectDest) return true;

            return false;
        });

        boxSelect.innerHTML = filtered.map(c => `<option value="${c.id}">${c.nombre} (Teórico: ${c.peso_teorico}kg)</option>`).join('');
        if (filtered.length === 0) {
            boxSelect.innerHTML = '<option value="">No hay cajas para esta vía y destino</option>';
        }
    },

    addBoxRow(id, name, qty = 0, avgWeight = 0) {
        const container = document.getElementById('cajas-rows-container');
        const rowId = 'row-box-' + Math.random().toString(36).substring(2, 9);
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'caja-entry';
        rowDiv.id = rowId;
        rowDiv.innerHTML = `
            <div class="form-group" style="margin-bottom:0;">
                <span style="font-size:0.8rem; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:block;">${name}</span>
                <input type="hidden" class="caja-id-val" value="${id}">
            </div>
            
            <div class="form-group" style="margin-bottom:0;">
                <label style="font-size:0.7rem; margin-bottom:2px;">Cantidad</label>
                <div class="counter-widget">
                    <button type="button" class="counter-btn dec-btn">-</button>
                    <input type="number" class="counter-input caja-qty-val" value="${qty}" min="0">
                    <button type="button" class="counter-btn inc-btn">+</button>
                </div>
            </div>

            <div class="form-group" style="margin-bottom:0;">
                <label style="font-size:0.7rem; margin-bottom:2px;">Peso Prom. Real (Kg)</label>
                <input type="number" step="0.01" class="form-input caja-weight-val" value="${avgWeight}" style="padding: 7px 10px;">
            </div>

            <button type="button" class="btn btn-danger btn-sm btn-del-box-row" style="padding: 9px 12px; margin-bottom:0;">✖</button>
        `;

        container.appendChild(rowDiv);

        // Increments & decrements buttons
        rowDiv.querySelector('.dec-btn').addEventListener('click', () => {
            const input = rowDiv.querySelector('.caja-qty-val');
            input.value = Math.max(0, parseInt(input.value) - 1);
            this.updateLiveMetrics();
        });
        rowDiv.querySelector('.inc-btn').addEventListener('click', () => {
            const input = rowDiv.querySelector('.caja-qty-val');
            input.value = parseInt(input.value) + 1;
            this.updateLiveMetrics();
        });

        // Numeric change trigger
        rowDiv.querySelector('.caja-qty-val').addEventListener('input', () => this.updateLiveMetrics());
        rowDiv.querySelector('.caja-weight-val').addEventListener('input', () => this.updateLiveMetrics());

        // Delete Row
        rowDiv.querySelector('.btn-del-box-row').addEventListener('click', () => {
            rowDiv.remove();
            this.updateLiveMetrics();
        });

        this.updateLiveMetrics();
    },

    getFormBoxesData() {
        const rows = document.querySelectorAll('.caja-entry');
        const boxes = [];
        rows.forEach(row => {
            const id = row.querySelector('.caja-id-val').value;
            const qty = parseInt(row.querySelector('.caja-qty-val').value) || 0;
            const weight = parseFloat(row.querySelector('.caja-weight-val').value) || 0;
            
            if (qty > 0) {
                boxes.push({
                    tipo_caja_id: id,
                    cantidad_cajas: qty,
                    peso_promedio_real: weight
                });
            }
        });
        return boxes;
    },

    updateLiveMetrics() {
        const boxes = this.getFormBoxesData();
        const start = document.getElementById('prod-hora-ini').value;
        const end = document.getElementById('prod-hora-fin').value;
        const parada = parseInt(document.getElementById('prod-parada-min').value) || 0;

        const metrics = window.utils.calculateProductionMetrics(boxes, start, end, parada);

        document.getElementById('val-kg-teorico').innerText = metrics.kgTeoricos.toFixed(2);
        document.getElementById('val-kg-real').innerText = metrics.kgReales.toFixed(2);
        document.getElementById('val-kg-desv').innerText = metrics.desviacionKg.toFixed(2);
        
        const devPctEl = document.getElementById('val-pct-desv');
        devPctEl.innerText = `${metrics.desviacionPorc.toFixed(2)}%`;
        
        const rangeBadge = document.getElementById('val-rango');
        const metricsContainer = document.getElementById('realtime-metrics');

        if (metrics.desviacionPorc > 3.0) {
            devPctEl.style.color = 'var(--accent-orange)';
            if (metricsContainer) {
                metricsContainer.style.borderColor = 'var(--accent-orange)';
                metricsContainer.style.background = 'rgba(245, 158, 11, 0.08)';
            }
            rangeBadge.innerText = '⚠️ SOBREPESO';
            rangeBadge.className = 'badge badge-orange';
        } else if (metrics.desviacionPorc < -1.0) {
            devPctEl.style.color = 'var(--accent-rose)';
            if (metricsContainer) {
                metricsContainer.style.borderColor = 'var(--accent-rose)';
                metricsContainer.style.background = 'rgba(244, 63, 94, 0.08)';
            }
            rangeBadge.innerText = '⚠️ BAJO PESO';
            rangeBadge.className = 'badge badge-rose';
        } else {
            devPctEl.style.color = 'var(--accent-emerald)';
            if (metricsContainer) {
                metricsContainer.style.borderColor = 'var(--border-color)';
                metricsContainer.style.background = 'rgba(255,255,255,0.02)';
            }
            rangeBadge.innerText = '✅ DENTRO RANGO';
            rangeBadge.className = 'badge badge-green';
        }

        document.getElementById('val-cajas-hr').innerText = metrics.cajasHora.toFixed(1);
    },

    handleFormSubmit() {
        try {
            const fecha = document.getElementById('prod-fecha').value;
            const turnoId = document.getElementById('prod-turno').value;
            const supervisorId = document.getElementById('prod-supervisor').value;
            const exportadorId = document.getElementById('prod-exportador').value;
            const via = document.getElementById('prod-via').value;
            const destino = document.getElementById('prod-destino-com').value;
            const start = document.getElementById('prod-hora-ini').value;
            const end = document.getElementById('prod-hora-fin').value;
            const parada = parseInt(document.getElementById('prod-parada-min').value) || 0;
            const paradaMotivo = document.getElementById('prod-parada-motivo').value;
            const obs = document.getElementById('prod-obs').value;

            const boxes = this.getFormBoxesData();

            if (boxes.length === 0) {
                alert("Debes agregar al menos un tipo de caja con cantidad mayor a 0.");
                return;
            }

            // Determine if own production vs maquila based on Pachamama id
            const tipoProd = (exportadorId === "EXP001") ? "Propia" : "Maquila";
            const refId = `${exportadorId}-${via}-${destino}`;

            // Verify if we can match a pre-defined empaque type (fall back to a generic name otherwise)
            let empaqueId = "EMP_GENERIC";
            const matchingEmp = window.db.getAll('tipos_empaque').find(e => e.tipo_transito === (via === 'MARITIMO' ? 'Maritimo' : 'Aereo') && e.destino === destino);
            if (matchingEmp) {
                empaqueId = matchingEmp.id;
            }

            // Perform splits if crossing midnight
            const timeSegments = window.utils.splitMidnight(start, end);

            timeSegments.forEach((seg, idx) => {
                let targetDate = fecha;
                if (seg.dayOffset > 0) {
                    const dateObj = new Date(fecha + 'T12:00:00');
                    dateObj.setDate(dateObj.getDate() + 1);
                    targetDate = dateObj.toISOString().split('T')[0];
                }

                const metrics = window.utils.calculateProductionMetrics(boxes, seg.start, seg.end, idx === 0 ? parada : 0);

                const record = {
                    fecha: targetDate,
                    turno_id: turnoId,
                    supervisor_id: supervisorId,
                    empresa_id: exportadorId, // Exportador
                    cliente_id: "", // Omitted as requested
                    tipo_produccion: tipoProd,
                    referencia_id: refId,
                    proceso_id: "PRO05", // Always Empaque
                    tipo_empaque_id: empaqueId,
                    via: via,
                    destino: destino,
                    cajas: boxes,
                    hora_inicio: seg.start,
                    hora_fin: seg.end,
                    tiempo_parada_minutos: idx === 0 ? parada : 0,
                    motivo_parada_id: idx === 0 ? paradaMotivo : '',
                    observaciones: obs + (timeSegments.length > 1 ? ` (Parte dividida por medianoche. Segmento ${idx+1})` : ''),
                    calculos: metrics
                };

                window.db.insert('produccion_diaria', record);
            });

            alert(`Parte de producción guardado con éxito.${timeSegments.length > 1 ? " Se dividió en 2 registros por cruce de medianoche." : ""}`);
            
            // Reset form
            document.getElementById('form-produccion').reset();
            document.getElementById('prod-fecha').value = new Date().toISOString().split('T')[0];
            document.getElementById('cajas-rows-container').innerHTML = '';
            this.selectedBoxes = [];
            this.updateLiveMetrics();
            this.filterCajas();
            this.refreshTable();
        } catch (err) {
            alert("Error al guardar parte de producción:\n" + err.message + "\n\nDetalles:\n" + err.stack);
            console.error(err);
        }
    },

    refreshTable() {
        const list = window.db.getAll('produccion_diaria');
        const tbody = document.getElementById('table-produccion-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        let filtered = this.getFilteredRecords(list);

        const searchQuery = (document.getElementById('prod-search')?.value || '').toLowerCase().trim();
        const empresaFilter = document.getElementById('prod-filter-empresa')?.value;

        if (empresaFilter) {
            filtered = filtered.filter(item => item.empresa_id === empresaFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(item => {
                const supName = window.db.getById('supervisores', item.supervisor_id)?.nombre || '';
                return supName.toLowerCase().includes(searchQuery) ||
                       (item.lote_empaque || '').toLowerCase().includes(searchQuery) ||
                       (item.observaciones || '').toLowerCase().includes(searchQuery);
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted);">No se encontraron partes registrados para los filtros seleccionados.</td></tr>`;
            this.updateKPIs(0, 0, 0, 0);
            return;
        }

        let totalKg = 0;
        let totalCajas = 0;
        let totalEf = 0;
        let totalDesv = 0;

        const sorted = [...filtered].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        sorted.forEach(item => {
            const supName = window.db.getById('supervisores', item.supervisor_id)?.nombre || 'N/A';
            const trnName = window.db.getById('turnos', item.turno_id)?.nombre || 'N/A';
            const expName = window.db.getById('empresas', item.empresa_id)?.nombre || 'N/A';
            
            // Build via / destination text
            const viaText = item.via || 'MARITIMO';
            const destText = item.destino || 'Europa';

            // Safe fallback for old mock records missing the 'calculos' object
            const calculos = item.calculos || {
                kgReales: parseFloat(item.kg_reales) || 0,
                totalCajas: item.cajas ? item.cajas.reduce((sum, c) => sum + (parseInt(c.cantidad_cajas) || 0), 0) : 0,
                efectivoMins: parseFloat(item.tiempo_efectivo_minutos) || 0,
                desviacionPorc: parseFloat(item.desviacion_porc) || 0,
                clasificacion: item.clasificacion || 'Dentro rango',
                cajasHora: parseFloat(item.cajas_hora) || 0
            };

            totalKg += calculos.kgReales;
            totalCajas += calculos.totalCajas;
            totalEf += calculos.efectivoMins;
            totalDesv += calculos.desviacionPorc;

            const cajasSummary = item.cajas.map(c => {
                const cajaCnf = window.db.getById('tipos_caja', c.tipo_caja_id);
                return `${cajaCnf ? cajaCnf.nombre.split('(')[0] : 'Caja'}: <strong>${c.cantidad_cajas}</strong>`;
            }).join('<br>');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="font-weight:600;">${item.fecha}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${trnName} (${item.hora_inicio}-${item.hora_fin})</div>
                </td>
                <td>${supName}</td>
                <td>
                    <div style="font-weight:600;">${expName}</div>
                </td>
                <td>
                    <div style="font-weight:500;">${viaText}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${destText.toUpperCase()}</div>
                </td>
                <td style="font-size:0.8rem;">${cajasSummary}</td>
                <td><strong>${Number(calculos.kgReales).toLocaleString()} Kg</strong></td>
                <td style="color: ${calculos.desviacionPorc > 3 ? 'var(--accent-orange)' : calculos.desviacionPorc < -1 ? 'var(--accent-rose)' : 'var(--accent-emerald)'}">
                    ${calculos.desviacionPorc.toFixed(1)}%
                </td>
                <td>
                    <span class="badge ${calculos.clasificacion === 'Dentro rango' ? 'badge-green' : calculos.clasificacion === 'Sobrepeso' ? 'badge-orange' : 'badge-rose'}">
                        ${calculos.clasificacion}
                    </span>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm del-prod" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem;">✖</button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        const avgDesv = filtered.length > 0 ? totalDesv / filtered.length : 0;
        const avgEfMin = filtered.length > 0 ? totalEf / filtered.length : 0;
        this.updateKPIs(totalKg, totalCajas, avgEfMin, avgDesv);
        this.updateLeaderboard();
    },

    updateKPIs(kg, cajas, tiempo, desv) {
        document.getElementById('kpi-prod-total-kg').innerText = `${Math.round(kg).toLocaleString()} Kg`;
        document.getElementById('kpi-prod-total-cajas').innerText = cajas.toLocaleString();
        document.getElementById('kpi-prod-tiempo-ef').innerText = `${Math.round(tiempo)} min`;
        
        const desvEl = document.getElementById('kpi-prod-desviacion');
        desvEl.innerText = `${desv.toFixed(2)} %`;
        if (desv > 3.0) {
            desvEl.style.color = 'var(--accent-orange)';
        } else if (desv < -1.0) {
            desvEl.style.color = 'var(--accent-rose)';
        } else {
            desvEl.style.color = 'var(--accent-emerald)';
        }
    },

    updateLeaderboard() {
        const supervisores = window.db.getAll('supervisores');
        const cajas = window.db.getAll('tipos_caja');
        const list = window.db.getAll('produccion_diaria');
        const filteredList = this.getFilteredRecords(list);

        // Group data by Area (Vía) -> Box Type -> Supervisor
        const groups = {
            "MARITIMO": {},
            "AEREO": {}
        };

        // Seed rich historical baseline comparison records (to keep competition active)
        const mockHistorical = [
            // Maritimo - GENERICA MARRON B12 (CAJ001 equivalent or typical box ID)
            { via: "MARITIMO", cajaId: "CAJ001", supId: "SUP01", supName: "Carlos Ruiz", qty: 25400, hours: 140, kgReal: 102100, kgTeo: 101600 },
            { via: "MARITIMO", cajaId: "CAJ001", supId: "SUP02", supName: "Ana Gomez", qty: 28900, hours: 152, kgReal: 116200, kgTeo: 115600 },
            { via: "MARITIMO", cajaId: "CAJ001", supId: "SUP03", supName: "Pedro Castro", qty: 22100, hours: 130, kgReal: 88800, kgTeo: 88400 },
            
            // Maritimo - MISSION (CAJ002 equivalent)
            { via: "MARITIMO", cajaId: "CAJ002", supId: "SUP04", supName: "Cecilia", qty: 18500, hours: 110, kgReal: 74314, kgTeo: 74000 },
            { via: "MARITIMO", cajaId: "CAJ002", supId: "SUP05", supName: "Cristian", qty: 19000, hours: 112, kgReal: 76560, kgTeo: 76000 },
            { via: "MARITIMO", cajaId: "CAJ002", supId: "SUP02", supName: "Ana Gomez", qty: 21200, hours: 120, kgReal: 85226, kgTeo: 84800 },

            // Aereo - CAJA ALLPA (CAJ003 equivalent)
            { via: "AEREO", cajaId: "CAJ003", supId: "SUP01", supName: "Carlos Ruiz", qty: 12800, hours: 80, kgReal: 51940, kgTeo: 51200 },
            { via: "AEREO", cajaId: "CAJ003", supId: "SUP03", supName: "Pedro Castro", qty: 13100, hours: 82, kgReal: 52786, kgTeo: 52400 },
            { via: "AEREO", cajaId: "CAJ003", supId: "SUP05", supName: "Cristian", qty: 14300, hours: 85, kgReal: 57998, kgTeo: 57200 }
        ];

        const aggregate = {};

        // Helper key generator
        const getAggKey = (via, cajaId, supId) => `${via}_${cajaId}_${supId}`;

        // Initialize with historical seed data
        mockHistorical.forEach(h => {
            const key = getAggKey(h.via, h.cajaId, h.supId);
            aggregate[key] = {
                via: h.via,
                cajaId: h.cajaId,
                supId: h.supId,
                supName: h.supName,
                totalCajas: h.qty,
                totalHours: h.hours,
                totalKgReal: h.kgReal,
                totalKgTeo: h.kgTeo
            };
        });

        // Add real entries from database
        filteredList.forEach(item => {
            const via = item.via === 'AEREO' ? 'AEREO' : 'MARITIMO';
            const supId = item.supervisor_id;
            if (!supId) return;

            const supName = supervisores.find(s => s.id === supId)?.nombre || 'N/A';
            const durationMins = item.calculos?.duracionMins || item.calculos?.efectivoMins || 720;
            const hours = durationMins / 60;

            item.cajas.forEach(c => {
                const cajaId = c.tipo_caja_id;
                const boxConfig = cajas.find(bx => bx.id === cajaId);
                if (!boxConfig) return;

                const key = getAggKey(via, cajaId, supId);
                if (!aggregate[key]) {
                    aggregate[key] = {
                        via: via,
                        cajaId: cajaId,
                        supId: supId,
                        supName: supName,
                        totalCajas: 0,
                        totalHours: 0,
                        totalKgReal: 0,
                        totalKgTeo: 0
                    };
                }

                const qty = parseInt(c.cantidad_cajas) || 0;
                const avgRealWeight = parseFloat(c.peso_promedio_real) || 0;

                aggregate[key].totalCajas += qty;
                aggregate[key].totalHours += hours;
                aggregate[key].totalKgReal += qty * avgRealWeight;
                aggregate[key].totalKgTeo += qty * boxConfig.peso_teorico;
            });
        });

        // Group the aggregated data by Area (Vía) -> Box Type
        Object.values(aggregate).forEach(entry => {
            const via = entry.via;
            const cajaId = entry.cajaId;
            
            if (!groups[via][cajaId]) {
                const cajaName = cajas.find(c => c.id === cajaId)?.nombre || 'Formato Caja';
                groups[via][cajaId] = {
                    cajaId: cajaId,
                    cajaNombre: cajaName,
                    supervisores: []
                };
            }

            const desvPct = entry.totalKgTeo > 0 ? ((entry.totalKgReal - entry.totalKgTeo) / entry.totalKgTeo) * 100 : 0;
            const speed = entry.totalHours > 0 ? entry.totalCajas / entry.totalHours : 0;

            groups[via][cajaId].supervisores.push({
                supId: entry.supId,
                supName: entry.supName,
                desviacionPorc: desvPct,
                cajasHora: speed
            });
        });

        // Render function for rank list grouped by box type
        const renderRankList = (areaKey) => {
            const areaGroups = Object.values(groups[areaKey]);
            if (areaGroups.length === 0) {
                return `<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:0.8rem;">No hay registros históricos en esta área.</div>`;
            }

            return areaGroups.map(grp => {
                // Sort supervisors by speed (cajas/hora descending)
                const sortedSups = [...grp.supervisores].sort((a, b) => b.cajasHora - a.cajasHora);

                return `
                    <div style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                        <div style="font-weight: 700; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#e2e8f0;">📦 ${grp.cajaNombre.split('(')[0]}</span>
                            <span style="font-size:0.65rem; color:var(--text-muted); font-weight:normal; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px;">${grp.cajaId}</span>
                        </div>
                        <table style="width:100%; border-collapse:collapse; font-size:0.75rem; text-align:left;">
                            <thead>
                                <tr style="color:var(--text-muted); border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <th style="padding:4px 0; width:30px;">Pos</th>
                                    <th>Supervisor</th>
                                    <th style="text-align:right;">Rend. Cajas/Hr</th>
                                    <th style="text-align:right;">Desviación %</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedSups.map((s, idx) => {
                                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '👤';
                                    const statusColor = (s.desviacionPorc > 3.0 || s.desviacionPorc < -1.0) ? 'var(--accent-rose)' : 'var(--accent-emerald)';
                                    return `
                                        <tr style="border-bottom:1px solid rgba(255,255,255,0.02);">
                                            <td style="padding:6px 0; font-size:0.9rem; font-weight:bold;">${medal}</td>
                                            <td><strong>${s.supName}</strong></td>
                                            <td style="text-align:right; font-weight:600; color:#60a5fa;">${Math.round(s.cajasHora)} /hr</td>
                                            <td style="text-align:right; font-weight:700; color:${statusColor};">${s.desviacionPorc > 0 ? '+' : ''}${s.desviacionPorc.toFixed(1)}%</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }).join('');
        };

        const precisionContainer = document.getElementById('ranking-precision-list');
        const speedContainer = document.getElementById('ranking-speed-list');
        
        if (precisionContainer) {
            precisionContainer.innerHTML = renderRankList("MARITIMO");
        }
        if (speedContainer) {
            speedContainer.innerHTML = renderRankList("AEREO");
        }

        // Render Personalized Banner
        const banner = document.getElementById('sup-personalized-banner');
        const activeSupId = localStorage.getItem('active_supervisor_id');
        
        if (banner) {
            if (activeSupId) {
                const supObj = supervisores.find(s => s.id === activeSupId);
                
                if (supObj) {
                    banner.style.display = 'flex';
                    banner.style.alignItems = 'center';
                    banner.style.gap = '10px';
                    
                    let motivationalMsg = `📈 <strong>¡Hola, ${supObj.nombre}!</strong> Observa tu rendimiento arriba clasificado por formato. Tu precisión general es fundamental para el éxito de la campaña.`;
                    let bannerColor = "rgba(52, 211, 153, 0.05)";
                    let borderColor = "rgba(52, 211, 153, 0.15)";
                    
                    // Find if they have any out of range deviation on any box format
                    const supervisorEntries = Object.values(aggregate).filter(e => e.supId === activeSupId);
                    const outOfRange = supervisorEntries.find(e => {
                        const dev = e.totalKgTeo > 0 ? ((e.totalKgReal - e.totalKgTeo) / e.totalKgTeo) * 100 : 0;
                        return dev > 3.0 || dev < -1.0;
                    });
                    
                    if (outOfRange) {
                        const dev = ((outOfRange.totalKgReal - outOfRange.totalKgTeo) / outOfRange.totalKgTeo) * 100;
                        const boxName = cajas.find(c => c.id === outOfRange.cajaId)?.nombre.split('(')[0] || 'Caja';
                        if (dev > 3.0) {
                            motivationalMsg = `⚠️ <strong>¡Alerta de Sobrepeso, ${supObj.nombre}!</strong> En el formato <strong>${boxName}</strong> estás promediando <strong>+${dev.toFixed(1)}%</strong>. Reduce los gramos sobrantes para evitar pérdidas de fruta en despacho.`;
                            bannerColor = "rgba(245, 158, 11, 0.05)";
                            borderColor = "rgba(245, 158, 11, 0.15)";
                        } else {
                            motivationalMsg = `⚠️ <strong>¡Alerta de Bajo Peso, ${supObj.nombre}!</strong> En el formato <strong>${boxName}</strong> estás promediando <strong>${dev.toFixed(1)}%</strong>. Asegura que el llenado cumpla el neto para evitar rechazo del contenedor.`;
                            bannerColor = "rgba(244, 63, 94, 0.05)";
                            borderColor = "rgba(244, 63, 94, 0.15)";
                        }
                    } else if (supervisorEntries.length > 0) {
                        // Find their highest speed entry
                        const bestSpeed = [...supervisorEntries].sort((a,b) => (b.totalCajas / (b.totalHours||1)) - (a.totalCajas / (a.totalHours||1)))[0];
                        const boxName = cajas.find(c => c.id === bestSpeed.cajaId)?.nombre.split('(')[0] || 'Caja';
                        const speed = bestSpeed.totalCajas / (bestSpeed.totalHours || 1);
                        motivationalMsg = `🏆 <strong>¡Excelente desempeño, ${supObj.nombre}!</strong> Tu récord es de <strong>${Math.round(speed)} cajas/hora</strong> en el formato <strong>${boxName}</strong> con desviación óptima. ¡Tu equipo lidera en calidad!`;
                    }
                    
                    banner.style.background = bannerColor;
                    banner.style.borderColor = borderColor;
                    banner.innerHTML = `<span style="font-size:1.2rem;">💡</span> <span style="font-size:0.85rem; color:var(--text-secondary); line-height:1.45;">${motivationalMsg}</span>`;
                }
            } else {
                banner.style.display = 'none';
            }
        }
    }
};

window.produccionModule = produccionModule;
