/* ==========================================================================
   Pachamama ERP - Executive Interactive Dashboard (Power BI Style)
   ========================================================================== */

const dashboardModule = {
    chartInstances: {},

    init() {
        this.renderLayout();
        this.populateFilterDropdowns();
        this.bindEvents();
        this.updateDashboard();
    },

    renderLayout() {
        const container = document.getElementById('view-dashboard-ejecutivo');
        if (!container) return;

        container.innerHTML = `
            <div class="banner" style="margin-bottom: 20px;">
                <div>
                    <strong>📊 Dashboard Interactivo Tipo Power BI</strong> - Panel de control dinámico. Modifica los filtros superiores para explorar el desempeño de producción, costos y recepciones en tiempo real.
                </div>
            </div>

            <!-- Interactive Filters (Power BI Filter Pane) -->
            <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--radio-tarjeta); border: 1px solid var(--border-color); display: flex; flex-wrap: wrap; gap: 16px; align-items: center; margin-bottom: 24px; box-shadow: var(--shadow-premium);">
                <div style="flex: 1; min-width: 140px;">
                    <label style="display:block; font-size: 10px; font-weight: 700; color: var(--color-borde); text-transform: uppercase; margin-bottom: 4px; letter-spacing:0.5px;">Tipo Lote</label>
                    <select id="filt-dash-tipo" class="form-input" style="width: 100%; padding: 6px 10px; font-size: 0.75rem; background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary); border-radius: var(--radio-control); outline: none;">
                        <option value="ALL">-- Todos --</option>
                        <option value="PROPIO">Pachamama (Propio)</option>
                        <option value="maquila">Maquila</option>
                    </select>
                </div>

                <div style="flex: 1; min-width: 180px;">
                    <label style="display:block; font-size: 10px; font-weight: 700; color: var(--color-borde); text-transform: uppercase; margin-bottom: 4px; letter-spacing:0.5px;">Exportador / Cliente</label>
                    <select id="filt-dash-empresa" class="form-input" style="width: 100%; padding: 6px 10px; font-size: 0.75rem; background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary); border-radius: var(--radio-control); outline: none;">
                        <option value="ALL">-- Todos --</option>
                    </select>
                </div>

                <div style="flex: 1; min-width: 150px;">
                    <label style="display:block; font-size: 10px; font-weight: 700; color: var(--color-borde); text-transform: uppercase; margin-bottom: 4px; letter-spacing:0.5px;">Variedad</label>
                    <select id="filt-dash-variedad" class="form-input" style="width: 100%; padding: 6px 10px; font-size: 0.75rem; background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary); border-radius: var(--radio-control); outline: none;">
                        <option value="ALL">-- Todas --</option>
                    </select>
                </div>

                <div style="flex: 1; min-width: 140px;">
                    <label style="display:block; font-size: 10px; font-weight: 700; color: var(--color-borde); text-transform: uppercase; margin-bottom: 4px; letter-spacing:0.5px;">Fecha Desde</label>
                    <input type="date" id="filt-dash-desde" class="form-input" style="width: 100%; padding: 6px 10px; font-size: 0.75rem; background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary); border-radius: var(--radio-control); outline: none;">
                </div>

                <div style="flex: 1; min-width: 140px;">
                    <label style="display:block; font-size: 10px; font-weight: 700; color: var(--color-borde); text-transform: uppercase; margin-bottom: 4px; letter-spacing:0.5px;">Fecha Hasta</label>
                    <input type="date" id="filt-dash-hasta" class="form-input" style="width: 100%; padding: 6px 10px; font-size: 0.75rem; background: var(--bg-primary); border-color: var(--border-color); color: var(--text-primary); border-radius: var(--radio-control); outline: none;">
                </div>

                <div style="display:flex; align-items:flex-end; height:100%; padding-top:16px;">
                    <button id="btn-dash-reset" type="button" class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.75rem; height: 32px; display:flex; align-items:center; justify-content:center; border-radius: var(--radio-control); background:var(--bg-primary); color:var(--color-tinta); border: 1px solid var(--color-borde);">
                        🧹 Limpiar
                    </button>
                </div>
            </div>

            <!-- KPI Cards Block -->
            <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <!-- KPI 1: Kg Recibidos -->
                <div class="kpi-card" style="box-shadow: var(--shadow-premium); background: var(--bg-secondary); border-radius: var(--radio-tarjeta);">
                    <div class="kpi-icon" style="background-color: var(--accent-orange-glow); color: var(--color-primario); width: 44px; height: 44px; border-radius: 8px;">
                        📥
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title" style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">MP Recibida</span>
                        <h3 class="kpi-value" id="dash-kpi-kg-rec" style="font-size: 1.15rem; color: var(--color-tinta); font-weight: 800; font-family: var(--fuente-titulos);">0 Kg</h3>
                        <span style="font-size:0.6rem; color:var(--text-muted);">Materia Prima en Guías</span>
                    </div>
                </div>

                <!-- KPI 2: Kg Empacados -->
                <div class="kpi-card" style="box-shadow: var(--shadow-premium); background: var(--bg-secondary); border-radius: var(--radio-tarjeta);">
                    <div class="kpi-icon" style="background-color: var(--color-exito-fondo); color: var(--color-exito-texto); width: 44px; height: 44px; border-radius: 8px;">
                        📦
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title" style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Neto Empacado</span>
                        <h3 class="kpi-value" id="dash-kpi-kg-emp" style="font-size: 1.15rem; color: var(--color-exito-texto); font-weight: 800; font-family: var(--fuente-titulos);">0 Kg</h3>
                        <span style="font-size:0.6rem; color:var(--text-muted);">Listo para Exportación</span>
                    </div>
                </div>

                <!-- KPI 3: Cajas Producidas -->
                <div class="kpi-card" style="box-shadow: var(--shadow-premium); background: var(--bg-secondary); border-radius: var(--radio-tarjeta);">
                    <div class="kpi-icon" style="background-color: var(--accent-blue-glow); color: var(--color-primario); width: 44px; height: 44px; border-radius: 8px;">
                        🗳️
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title" style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Cajas Producidas</span>
                        <h3 class="kpi-value" id="dash-kpi-cajas" style="font-size: 1.15rem; color: var(--color-tinta); font-weight: 800; font-family: var(--fuente-titulos);">0</h3>
                        <span style="font-size:0.6rem; color:var(--text-muted);">Formatos Varios</span>
                    </div>
                </div>

                <!-- KPI 4: Pallets Armados -->
                <div class="kpi-card" style="box-shadow: var(--shadow-premium); background: var(--bg-secondary); border-radius: var(--radio-tarjeta);">
                    <div class="kpi-icon" style="background-color: var(--accent-orange-glow); color: var(--color-primario); width: 44px; height: 44px; border-radius: 8px;">
                        🪜
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title" style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Pallets Armados</span>
                        <h3 class="kpi-value" id="dash-kpi-pallets" style="font-size: 1.15rem; color: var(--color-tinta); font-weight: 800; font-family: var(--fuente-titulos);">0</h3>
                        <span style="font-size:0.6rem; color:var(--text-muted);">Trazados por Despachar</span>
                    </div>
                </div>

                <!-- KPI 5: Eficiencia de Planta -->
                <div class="kpi-card" style="box-shadow: var(--shadow-premium); background: var(--bg-secondary); border-radius: var(--radio-tarjeta);">
                    <div class="kpi-icon" style="background-color: var(--color-exito-fondo); color: var(--color-exito-texto); width: 44px; height: 44px; border-radius: 8px;">
                        ⚡
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title" style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Eficiencia Empaque</span>
                        <h3 class="kpi-value" id="dash-kpi-eficiencia" style="font-size: 1.15rem; color: var(--color-tinta); font-weight: 800; font-family: var(--fuente-titulos);">0.0 Kg/h</h3>
                        <span style="font-size:0.6rem; color:var(--text-muted);">Kg por hora-hombre</span>
                    </div>
                </div>

                <!-- KPI 6: Costo MOD -->
                <div class="kpi-card" style="box-shadow: var(--shadow-premium); background: var(--bg-secondary); border-radius: var(--radio-tarjeta);">
                    <div class="kpi-icon" style="background-color: var(--color-alerta-fondo); color: var(--color-alerta-texto); width: 44px; height: 44px; border-radius: 8px;">
                        💰
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title" style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Costo MOD</span>
                        <h3 class="kpi-value" id="dash-kpi-costo" style="font-size: 1.15rem; color: var(--color-alerta-texto); font-weight: 800; font-family: var(--fuente-titulos);">S/. 0.00</h3>
                        <span style="font-size:0.6rem; color:var(--text-muted);" id="dash-kpi-costo-kg">S/. 0.00 / Kg</span>
                    </div>
                </div>
            </div>

            <!-- Charts Section (Grid Layout) -->
            <div class="panel-grid two-cols" style="margin-bottom: 24px;">
                <!-- Chart 1: Bar Chart of Client Weight -->
                <div class="card" style="background: var(--bg-secondary); border-radius: var(--radio-tarjeta); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
                    <h3 class="card-title" style="font-size:0.85rem; color:var(--color-tinta); margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">🏢 VOLUMEN MP POR EXPORTADOR (Kg Neto)</h3>
                    <div style="position: relative; height: 230px; width: 100%;">
                        <canvas id="chart-recepcion-clientes"></canvas>
                    </div>
                </div>

                <!-- Chart 2: Doughnut Chart of Production Type -->
                <div class="card" style="background: var(--bg-secondary); border-radius: var(--radio-tarjeta); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
                    <h3 class="card-title" style="font-size:0.85rem; color:var(--color-tinta); margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">💼 TIPO DE SERVICIO (Propia vs Maquila)</h3>
                    <div style="position: relative; height: 230px; width: 100%; display:flex; justify-content:center; align-items:center;">
                        <canvas id="chart-tipo-produccion"></canvas>
                    </div>
                </div>
            </div>

            <div class="panel-grid two-cols" style="margin-bottom: 24px;">
                <!-- Chart 3: Pie Chart of Mango Varieties -->
                <div class="card" style="background: var(--bg-secondary); border-radius: var(--radio-tarjeta); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
                    <h3 class="card-title" style="font-size:0.85rem; color:var(--color-tinta); margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">🥭 DISTRIBUCIÓN POR VARIEDAD DE MANGO</h3>
                    <div style="position: relative; height: 230px; width: 100%; display:flex; justify-content:center; align-items:center;">
                        <canvas id="chart-variedad-recepcion"></canvas>
                    </div>
                </div>

                <!-- Chart 4: Line Chart of Daily Incoming Weight -->
                <div class="card" style="background: var(--bg-secondary); border-radius: var(--radio-tarjeta); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
                    <h3 class="card-title" style="font-size:0.85rem; color:var(--color-tinta); margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">📈 EVOLUCIÓN DIARIA DE INGRESO (Kg Neto)</h3>
                    <div style="position: relative; height: 230px; width: 100%;">
                        <canvas id="chart-evolucion-recepcion"></canvas>
                    </div>
                </div>
            </div>

            <!-- Rankings and Process Tables -->
            <div class="panel-grid two-cols">
                <!-- Supervisor Ranking -->
                <div class="card" style="background: var(--bg-secondary); border-radius: var(--radio-tarjeta); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
                    <h3 class="card-title" style="font-size:0.85rem; color:var(--color-tinta); margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">👮 RENDIMIENTO POR SUPERVISOR (Cajas Empacadas)</h3>
                    <div class="table-container" style="background: transparent;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color); background: var(--color-fondo); color: var(--color-tinta);">
                                    <th style="padding: 8px 10px;">Pos</th>
                                    <th style="padding: 8px 10px;">Supervisor</th>
                                    <th style="padding: 8px 10px; text-align:right;">Cajas Procesadas</th>
                                    <th style="padding: 8px 10px; text-align:center;">Eficiencia Cajas/Hr</th>
                                </tr>
                            </thead>
                            <tbody id="table-rank-supervisor">
                                <!-- Loaded dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Process Metrics -->
                <div class="card" style="background: var(--bg-secondary); border-radius: var(--radio-tarjeta); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
                    <h3 class="card-title" style="font-size:0.85rem; color:var(--color-tinta); margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">⚙️ DESEMPEÑO POR PROCESO EN PLANTA</h3>
                    <div class="table-container" style="background: transparent;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color); background: var(--color-fondo); color: var(--color-tinta);">
                                    <th style="padding: 8px 10px;">Proceso</th>
                                    <th style="padding: 8px 10px; text-align:right;">Kg Procesados</th>
                                    <th style="padding: 8px 10px; text-align:center;">Tiempo Operativo</th>
                                    <th style="padding: 8px 10px; text-align:center;">Desviación Promedio</th>
                                </tr>
                            </thead>
                            <tbody id="table-dash-procesos">
                                <!-- Loaded dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    populateFilterDropdowns() {
        // Populate Empresa/Exportador
        const empresas = window.db.getAll('empresas');
        const empSelect = document.getElementById('filt-dash-empresa');
        if (empSelect) {
            empresas.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.innerText = e.nombre;
                empSelect.appendChild(opt);
            });
        }

        // Populate Varieties
        const variedades = window.db.getAll('variedades');
        const varSelect = document.getElementById('filt-dash-variedad');
        if (varSelect) {
            variedades.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.id;
                opt.innerText = v.nombre;
                varSelect.appendChild(opt);
            });
        }
    },

    bindEvents() {
        const filters = ['filt-dash-tipo', 'filt-dash-empresa', 'filt-dash-variedad', 'filt-dash-desde', 'filt-dash-hasta'];
        
        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => this.updateDashboard());
            }
        });

        const resetBtn = document.getElementById('btn-dash-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                document.getElementById('filt-dash-tipo').value = 'ALL';
                document.getElementById('filt-dash-empresa').value = 'ALL';
                document.getElementById('filt-dash-variedad').value = 'ALL';
                document.getElementById('filt-dash-desde').value = '';
                document.getElementById('filt-dash-hasta').value = '';
                this.updateDashboard();
            });
        }
    },

    updateDashboard() {
        // 1. Retrieve raw data
        let recepciones = window.db.getAll('recepcion_mp');
        let producciones = window.db.getAll('produccion_diaria');
        const personal = window.db.getAll('personal');
        const asistencia = window.db.getAll('asistencia_diaria');
        const tareo = window.db.getAll('tareo_diario');
        const trazabilidad = window.db.getAll('trazabilidad_lotes');

        // 2. Fetch filter values
        const fTipo = document.getElementById('filt-dash-tipo').value;
        const fEmpresa = document.getElementById('filt-dash-empresa').value;
        const fVariedad = document.getElementById('filt-dash-variedad').value;
        const fDesde = document.getElementById('filt-dash-desde').value;
        const fHasta = document.getElementById('filt-dash-hasta').value;

        // Get global campaign filter value
        const globalCampSelect = document.getElementById('global-campana-select');
        const selectedCamp = globalCampSelect ? globalCampSelect.value : '2627';

        // 3. Filter Recepciones
        recepciones = recepciones.filter(r => {
            // Apply campaign filtering (batch code starts with campaign code, e.g. "2627")
            if (r.lote_materia_prima && !r.lote_materia_prima.startsWith(selectedCamp)) return false;

            if (fTipo !== 'ALL') {
                if (fTipo === 'PROPIO' && r.tipo_ingreso !== 'PROPIO') return false;
                if (fTipo === 'maquila' && r.tipo_ingreso !== 'maquila') return false;
            }
            if (fEmpresa !== 'ALL' && r.empresa_id !== fEmpresa) return false;
            if (fVariedad !== 'ALL' && r.variedad_id !== fVariedad) return false;
            if (fDesde && r.fecha < fDesde) return false;
            if (fHasta && r.fecha > fHasta) return false;
            return true;
        });

        // Match producciones with the active filtered raw material lot codes
        const filteredLoteCodes = new Set(recepciones.map(r => r.lote_materia_prima));
        
        producciones = producciones.filter(p => {
            // Check matching batch code in production OR starts with selected campaign if no reception matches
            return filteredLoteCodes.has(p.lote_materia_prima) || (p.lote_materia_prima && p.lote_materia_prima.startsWith(selectedCamp));
        });

        // 4. Calculate KPI metrics
        let totalKgRec = 0;
        recepciones.forEach(r => {
            totalKgRec += r.peso_neto;
        });

        let totalKgEmp = 0;
        let totalCajas = 0;
        producciones.forEach(p => {
            totalKgEmp += p.calculos.kgReales;
            totalCajas += p.calculos.totalCajas;
        });

        // Count pallets associated with filtered batches
        const totalPallets = trazabilidad.filter(t => filteredLoteCodes.has(t.lote_materia_prima)).length;

        // Labor Cost & Hours Calculation
        let totalHoras = 0;
        let totalCosto = 0;
        tareo.forEach(t => {
            // Check if tareo batch is in our active set
            if (!filteredLoteCodes.has(t.lote_materia_prima)) return;

            const minutes = window.utils.diffMinutes(t.hora_inicio, t.hora_fin);
            const hours = minutes / 60;
            const asistToday = asistencia.filter(a => a.fecha === t.fecha && a.turno_id === t.turno_id && a.estado_asistencia === 'Presente');

            asistToday.forEach(a => {
                const w = personal.find(p => p.id === a.trabajador_id);
                if (w && (a.grupo_temporal_id === t.grupo_id || (!a.grupo_temporal_id && w.grupo_id === t.grupo_id))) {
                    totalHoras += hours;
                    totalCosto += hours * w.costo_hora_normal;
                }
            });
        });

        const eficienciaKgHr = totalHoras > 0 ? (totalKgEmp / totalHoras) : 0;
        const costoPorKg = totalKgEmp > 0 ? (totalCosto / totalKgEmp) : 0;

        // Update KPI values in the DOM
        document.getElementById('dash-kpi-kg-rec').innerText = `${totalKgRec.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} Kg`;
        document.getElementById('dash-kpi-kg-emp').innerText = `${totalKgEmp.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} Kg`;
        document.getElementById('dash-kpi-cajas').innerText = totalCajas.toLocaleString();
        document.getElementById('dash-kpi-pallets').innerText = totalPallets.toLocaleString();
        document.getElementById('dash-kpi-eficiencia').innerText = `${eficienciaKgHr.toFixed(1)} Kg/h`;
        document.getElementById('dash-kpi-costo').innerText = `S/. ${totalCosto.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('dash-kpi-costo-kg').innerText = `S/. ${costoPorKg.toFixed(2)} / Kg`;

        // 5. Build and Update Chart.js instances
        this.buildCharts(recepciones, producciones);

        // 6. Refresh rankings and metrics tables
        this.renderSupervisorRanking(producciones);
        this.renderProcessSummary(producciones);
    },

    buildCharts(recepciones, producciones) {
        // Destroy existing chart instances to avoid overlap/errors
        Object.keys(this.chartInstances).forEach(key => {
            if (this.chartInstances[key]) {
                this.chartInstances[key].destroy();
            }
        });

        // 📊 CHART 1: Client Weight (Bar Chart)
        const ctxClient = document.getElementById('chart-recepcion-clientes');
        if (ctxClient) {
            const clientWeight = {};
            recepciones.forEach(r => {
                const empName = window.db.getById('empresas', r.empresa_id)?.nombre || 'PACHAMAMA';
                clientWeight[empName] = (clientWeight[empName] || 0) + r.peso_neto;
            });

            this.chartInstances['client'] = new Chart(ctxClient, {
                type: 'bar',
                data: {
                    labels: Object.keys(clientWeight),
                    datasets: [{
                        label: 'Kg Recibidos',
                        data: Object.values(clientWeight),
                        backgroundColor: '#FFA33C',
                        borderColor: '#2B1E10',
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(107, 97, 83, 0.1)' },
                            ticks: { color: '#2B1E10', font: { family: 'IBM Plex Sans', size: 10 } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#2B1E10', font: { family: 'IBM Plex Sans', size: 10 } }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // 📊 CHART 2: Tipo de Servicio (Doughnut Chart)
        const ctxType = document.getElementById('chart-tipo-produccion');
        if (ctxType) {
            let propiaKg = 0;
            let maquilaKg = 0;
            recepciones.forEach(r => {
                if (r.tipo_ingreso === 'PROPIO') propiaKg += r.peso_neto;
                else maquilaKg += r.peso_neto;
            });

            this.chartInstances['type'] = new Chart(ctxType, {
                type: 'doughnut',
                data: {
                    labels: ['Propio', 'Maquila'],
                    datasets: [{
                        data: [propiaKg, maquilaKg],
                        backgroundColor: ['#8BAE3C', '#FFA33C'],
                        borderColor: '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#2B1E10', font: { family: 'IBM Plex Sans', size: 11 } }
                        }
                    },
                    cutout: '60%'
                }
            });
        }

        // 📊 CHART 3: Varieties Distribution (Pie Chart)
        const ctxVariety = document.getElementById('chart-variedad-recepcion');
        if (ctxVariety) {
            const varietiesData = {};
            recepciones.forEach(r => {
                const varName = window.db.getById('variedades', r.variedad_id)?.nombre || 'N/A';
                varietiesData[varName] = (varietiesData[varName] || 0) + r.peso_neto;
            });

            this.chartInstances['variety'] = new Chart(ctxVariety, {
                type: 'pie',
                data: {
                    labels: Object.keys(varietiesData),
                    datasets: [{
                        data: Object.values(varietiesData),
                        backgroundColor: ['#FFA33C', '#8BAE3C', '#B23A1D', '#6B6153'],
                        borderColor: '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#2B1E10', font: { family: 'IBM Plex Sans', size: 11 } }
                        }
                    }
                }
            });
        }

        // 📊 CHART 4: Daily Evolution (Line Chart)
        const ctxEvol = document.getElementById('chart-evolucion-recepcion');
        if (ctxEvol) {
            const dailyIncoming = {};
            recepciones.forEach(r => {
                dailyIncoming[r.fecha] = (dailyIncoming[r.fecha] || 0) + r.peso_neto;
            });

            const sortedDates = Object.keys(dailyIncoming).sort();
            const values = sortedDates.map(d => dailyIncoming[d]);

            this.chartInstances['evol'] = new Chart(ctxEvol, {
                type: 'line',
                data: {
                    labels: sortedDates,
                    datasets: [{
                        label: 'Ingreso Diario (Kg)',
                        data: values,
                        fill: true,
                        backgroundColor: 'rgba(139, 174, 60, 0.15)',
                        borderColor: '#8BAE3C',
                        borderWidth: 3,
                        pointBackgroundColor: '#FFA33C',
                        pointBorderColor: '#2B1E10',
                        pointHoverRadius: 6,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(107, 97, 83, 0.1)' },
                            ticks: { color: '#2B1E10', font: { family: 'IBM Plex Sans', size: 10 } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#2B1E10', font: { family: 'IBM Plex Sans', size: 10 } }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
    },

    renderSupervisorRanking(producciones) {
        const tbody = document.getElementById('table-rank-supervisor');
        if (!tbody) return;

        tbody.innerHTML = '';

        const sups = {};
        producciones.forEach(p => {
            const s = p.supervisor_id;
            if (!sups[s]) sups[s] = { boxes: 0, hours: 0 };
            sups[s].boxes += p.calculos.totalCajas;
            sups[s].hours += p.calculos.efectivoMins / 60;
        });

        const sorted = Object.entries(sups).sort((a, b) => b[1].boxes - a[1].boxes);

        if (sorted.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding: 15px; font-style:italic;">No hay registros para los filtros seleccionados.</td></tr>`;
            return;
        }

        sorted.forEach(([supId, stats], idx) => {
            const name = window.db.getById('supervisores', supId)?.nombre || 'N/A';
            const avgSpeed = stats.hours > 0 ? (stats.boxes / stats.hours).toFixed(1) : '0';

            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border-color)';
            tr.innerHTML = `
                <td style="padding: 8px 10px;"><strong>#${idx + 1}</strong></td>
                <td style="padding: 8px 10px;">${name}</td>
                <td style="padding: 8px 10px; text-align:right;"><strong>${stats.boxes.toLocaleString()} cajas</strong></td>
                <td style="padding: 8px 10px; text-align:center;"><span class="badge badge-green" style="background: var(--color-exito-fondo); color: var(--color-exito-texto);">${avgSpeed} cajas/hr</span></td>
            `;
            tbody.appendChild(tr);
        });
    },

    renderProcessSummary(producciones) {
        const tbody = document.getElementById('table-dash-procesos');
        if (!tbody) return;

        tbody.innerHTML = '';

        const procs = {};
        producciones.forEach(p => {
            const pr = p.proceso_id;
            if (!procs[pr]) procs[pr] = { kg: 0, time: 0, desv: 0, count: 0 };
            procs[pr].kg += p.calculos.kgReales;
            procs[pr].time += p.calculos.efectivoMins;
            procs[pr].desv += p.calculos.desviacionPorc;
            procs[pr].count++;
        });

        const list = window.db.getAll('procesos');

        list.forEach(p => {
            const stats = procs[p.id] || { kg: 0, time: 0, desv: 0, count: 0 };
            const avgDesv = stats.count > 0 ? stats.desv / stats.count : 0;
            const hoursOperative = (stats.time / 60).toFixed(1);

            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border-color)';
            tr.innerHTML = `
                <td style="padding: 8px 10px;"><strong>${p.nombre}</strong></td>
                <td style="padding: 8px 10px; text-align:right;">${Number(stats.kg).toLocaleString()} Kg</td>
                <td style="padding: 8px 10px; text-align:center;">${hoursOperative} hrs</td>
                <td style="padding: 8px 10px; text-align:center;">
                    <span class="badge ${avgDesv > 3.0 ? 'badge-orange' : avgDesv < -1.0 ? 'badge-rose' : 'badge-green'}" style="padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">
                        ${avgDesv.toFixed(2)} %
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
};

window.dashboardModule = dashboardModule;
