/* ==========================================================================
   Pachamama ERP - Módulo de Calidad (Muestreo y Evaluación)
   ========================================================================== */

const calidadModule = {
    currentQCSamples: [],
    selectedItem: null,
    currentTab: 'pendientes', // 'pendientes', 'evaluados', 'rechazados'
    currentFormTab: 'general', // 'general', 'muestras', 'defectos'
    selectedFilter: 'hoy',

    getLocalDateStr(d = new Date()) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    getFilteredRecords(records) {
        return this.filterComponent ? this.filterComponent.filter(records, 'fecha') : records;
    },

    init() {
        this.selectedItem = null;
        this.currentQCSamples = [];
        this.renderLayout();

        this.filterComponent = new window.FilterComponent({
            containerId: 'cal-filter-toolbar-container',
            prefix: 'cal',
            onChange: () => this.refreshData()
        });

        this.bindEvents();
        this.refreshData();
    },

    renderLayout() {
        const container = document.getElementById('view-calidad');
        if (!container) return;

        const empresas = window.db.getAll('empresas');

        container.innerHTML = `
            <!-- Tab Navigation Header -->
            <div class="tabs-nav" style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                <button class="btn btn-secondary tab-btn active" data-cal-tab="dashboard" style="font-weight:700; display:flex; align-items:center; gap:6px;">📊 Dashboard Calidad</button>
                <button class="btn btn-secondary tab-btn" data-cal-tab="bandeja" style="font-weight:700; display:flex; align-items:center; gap:6px;">🔬 Bandeja de Evaluación</button>
            </div>

            <!-- Dashboard View -->
            <div class="cal-view-panel active" id="cal-panel-dashboard">
                <div id="cal-filter-toolbar-container"></div>

                <!-- KPI Summary Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div class="card" style="padding: 15px; margin-bottom: 0; background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02)); border: 1px solid rgba(245, 158, 11, 0.15); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; min-height: 80px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">⏳ Batches Pendientes</span>
                        <strong id="kpi-cal-pendientes" style="font-size: 1.3rem; color: var(--color-primario); margin-top: 5px; font-weight: 800;">0</strong>
                    </div>
                    <div class="card" style="padding: 15px; margin-bottom: 0; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02)); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; min-height: 80px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">🟢 Batches Aprobados</span>
                        <strong id="kpi-cal-aprobados" style="font-size: 1.3rem; color: var(--color-exito); margin-top: 5px; font-weight: 800;">0</strong>
                    </div>
                    <div class="card" style="padding: 15px; margin-bottom: 0; background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.02)); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; min-height: 80px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">🔴 Batches Rechazados</span>
                        <strong id="kpi-cal-rechazados" style="font-size: 1.3rem; color: var(--color-alerta); margin-top: 5px; font-weight: 800;">0</strong>
                    </div>
                    <div class="card" style="padding: 15px; margin-bottom: 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.02)); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; min-height: 80px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">✅ Aprobaciones SENASA</span>
                        <strong id="kpi-cal-senasa-aprobados" style="font-size: 1.3rem; color: #3b82f6; margin-top: 5px; font-weight: 800;">0</strong>
                    </div>
                    <div class="card" style="padding: 15px; margin-bottom: 0; background: linear-gradient(135deg, rgba(100, 116, 139, 0.08), rgba(100, 116, 139, 0.02)); border: 1px solid rgba(100, 116, 139, 0.15); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; min-height: 80px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">❌ Rechazos SENASA</span>
                        <strong id="kpi-cal-senasa-rechazados" style="font-size: 1.3rem; color: #64748b; margin-top: 5px; font-weight: 800;">0</strong>
                    </div>
                </div>

                <div class="card">
                    <h2 class="card-title">📈 Resumen Diario de Calidad</h2>
                    <div style="padding: 20px; text-align: center; color: var(--color-borde);">
                        <p style="font-size:0.95rem;">Dashboard de Control de Calidad y Fitosanitario (SENASA)</p>
                        <div id="cal-dashboard-charts" style="display:flex; justify-content:space-around; flex-wrap:wrap; gap:20px; margin-top:20px;">
                            <!-- Dynamically generated visual distribution summary -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tray / Bandeja View -->
            <div class="cal-view-panel" id="cal-panel-bandeja" style="display: none;">
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Top: Tray Tables -->
                    <div class="card" style="display:flex; flex-direction:column; padding: 16px; width: 100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; flex-wrap:wrap; gap:10px;">
                            <h2 class="card-title" style="margin:0;">📋 Bandeja de Lotes MP</h2>
                            
                            <!-- Sub-tabs within Tray (Bandeja) -->
                            <div style="display:flex; gap:5px; background:rgba(0,0,0,0.1); padding:3px; border-radius:6px;">
                                <button class="btn btn-secondary btn-sm cal-subtab-btn active" data-cal-subtab="pendientes" style="font-size:0.75rem; padding:4px 10px; font-weight:700;">Pendientes</button>
                                <button class="btn btn-secondary btn-sm cal-subtab-btn" data-cal-subtab="evaluados" style="font-size:0.75rem; padding:4px 10px; font-weight:700;">Evaluados</button>
                                <button class="btn btn-secondary btn-sm cal-subtab-btn" data-cal-subtab="rechazados" style="font-size:0.75rem; padding:4px 10px; font-weight:700;">Rechazados</button>
                            </div>
                        </div>

                        <!-- Search Bar & Filters -->
                        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:10px; margin-bottom:12px;">
                            <input type="text" id="cal-tray-search" class="form-input" placeholder="🔍 Buscar por Batch, Guía, Proveedor..." style="font-size:0.8rem; padding:6px 12px; width:100%;">
                            <select id="cal-tray-empresa" class="form-select" style="font-size:0.8rem; padding:6px 12px; background:#1e293b; color:#fff; border-color:rgba(255,255,255,0.1);">
                                <option value="">🏢 Todos los Exportadores</option>
                                ${empresas.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('')}
                            </select>
                        </div>

                        <div class="table-container" style="overflow-y:auto; max-height:550px;">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Lote (Batch)</th>
                                        <th>Guía</th>
                                        <th>Proveedor</th>
                                        <th>CLP</th>
                                        <th>Variedad</th>
                                        <th style="text-align:right;">Peso Neto</th>
                                        <th style="text-align:center;">SENASA</th>
                                        <th style="text-align:center;">Calidad</th>
                                        <th style="text-align:center;">Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="table-cal-tray-body">
                                    <!-- Loaded dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Bottom: Evaluation Form -->
                    <div class="card" id="card-cal-evaluation" style="display: none; padding: 18px; width: 100%; max-width: 800px; margin: 20px auto 0 auto;">
                        <h2 class="card-title" id="title-cal-eval-batch" style="font-size:1.0rem; border-bottom: 1px solid var(--border-color); padding-bottom:8px; margin-bottom:12px; color: var(--color-primario);">🔬 Evaluación: Seleccione un Lote</h2>
                        
                        <form id="form-calidad-inspeccion" novalidate>
                            <input type="hidden" id="cal-eval-item-id">
                            
                            <!-- Mandatory SENASA Section -->
                            <div style="background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 8px; padding: 12px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
                                <span style="font-size: 0.8rem; font-weight: 800; color: #3b82f6;">📋 INSPECCIÓN FITOSANITARIA OBLIGATORIA</span>
                                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                                    <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary);" for="senasa-aprobacion-btns">¿SENASA aprobó el lote? *</label>
                                    <div id="senasa-aprobacion-btns" style="display: flex; gap: 8px;">
                                        <button type="button" class="btn btn-secondary btn-sm senasa-opt-btn" data-senasa="SI" style="font-weight:700; padding:6px 14px; display:flex; align-items:center; gap:4px;">✅ Sí</button>
                                        <button type="button" class="btn btn-secondary btn-sm senasa-opt-btn" data-senasa="NO" style="font-weight:700; padding:6px 14px; display:flex; align-items:center; gap:4px;">❌ No</button>
                                    </div>
                                    <input type="hidden" id="cal-senasa-aprobado" required>
                                </div>
                            </div>

                            <!-- Evaluation Fields Container (Initially blocked until SENASA selection) -->
                            <div id="cal-form-fields-container" style="opacity:0.3; pointer-events:none; transition: all 0.3s ease;">
                                <!-- Sub-tabs within Quality evaluation -->
                                <div class="tabs-container" style="margin-bottom: 12px; border-bottom: 1px solid var(--border-color); display: flex; gap: 8px;">
                                    <div class="tab-btn active" data-cal-form-tab="general" style="padding: 6px 12px; font-size: 0.72rem; cursor:pointer; font-weight: 700;">📋 General</div>
                                    <div class="tab-btn" data-cal-form-tab="muestras" style="padding: 6px 12px; font-size: 0.72rem; cursor:pointer; font-weight: 700;">🥭 Muestras (<span id="cal-samples-count-badge">12</span>)</div>
                                    <div class="tab-btn" data-cal-form-tab="defectos" style="padding: 6px 12px; font-size: 0.72rem; cursor:pointer; font-weight: 700;">⚠️ Defectos</div>
                                </div>
                                
                                <!-- Tab Panel A: General -->
                                <div class="cal-form-tab-panel" id="cal-form-panel-general">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                                        <div class="form-group">
                                            <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;" for="cal-condicion">Condición Lote</label>
                                            <select id="cal-condicion" class="form-select" style="padding: 6px 10px; font-size: 0.8rem; background:#ffffff;">
                                                <option value="MARITIMO">🚢 Marítimo</option>
                                                <option value="AEREO">✈️ Aéreo</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;" for="cal-certificada">Fruta Certificada</label>
                                            <select id="cal-certificada" class="form-select" style="padding: 6px 10px; font-size: 0.8rem; background:#ffffff;">
                                                <option value="SI">Sí</option>
                                                <option value="NO">No</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                                        <div class="form-group">
                                            <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;" for="cal-toldo">Uso de Toldo</label>
                                            <select id="cal-toldo" class="form-select" style="padding: 6px 10px; font-size: 0.8rem; background:#ffffff;">
                                                <option value="SI">Sí</option>
                                                <option value="NO">No</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;" for="cal-transporte-limpio">Transporte Limpio</label>
                                            <select id="cal-transporte-limpio" class="form-select" style="padding: 6px 10px; font-size: 0.8rem; background:#ffffff;">
                                                <option value="SI">Sí</option>
                                                <option value="NO">No</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                                        <div class="form-group">
                                            <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;" for="cal-mtd-ceratitis">MTD Ceratitis</label>
                                            <input type="number" id="cal-mtd-ceratitis" class="form-input" value="0" min="0" style="padding: 6px 10px; font-size: 0.8rem;">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;" for="cal-mtd-anastrepha">MTD Anastrepha</label>
                                            <input type="number" id="cal-mtd-anastrepha" class="form-input" value="0" min="0" style="padding: 6px 10px; font-size: 0.8rem;">
                                        </div>
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                                        <div class="form-group">
                                            <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;" for="cal-temp">Temp. Producto (°C) *</label>
                                            <input type="number" id="cal-temp" class="form-input" placeholder="ej: 24.5" min="0" max="45" step="0.1" style="padding: 6px 10px; font-size: 0.8rem;" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;" for="cal-proceso">Tipo Proceso</label>
                                            <select id="cal-proceso" class="form-select" style="padding: 6px 10px; font-size: 0.8rem; background:#ffffff;">
                                                <option value="CONVENCIONAL">CONVENCIONAL</option>
                                                <option value="ORGANICO">ORGÁNICO</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group" style="margin-bottom: 10px;">
                                        <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;" for="cal-responsable">Responsable Inspección</label>
                                        <input type="text" id="cal-responsable" class="form-input" value="DIANA SERNAQUE SANTOS" style="padding: 6px 10px; font-size: 0.8rem;">
                                    </div>

                                    <!-- Internal Quality Decision -->
                                    <div style="margin-top: 15px; padding: 10px; background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; display: flex; flex-direction: column; gap: 6px;">
                                        <label class="form-label" style="font-weight: 700; font-size: 0.8rem;" for="cal-calidad-aprobado-btns">Resultado Calidad Interna *</label>
                                        <div id="cal-calidad-aprobado-btns" style="display: flex; gap: 8px; justify-content: flex-end;">
                                            <button type="button" class="btn btn-secondary btn-sm calidad-opt-btn" data-calidad-opt="SI" style="font-weight:700; padding:6px 14px; display:flex; align-items:center; gap:4px;">✅ Aprobado</button>
                                            <button type="button" class="btn btn-secondary btn-sm calidad-opt-btn" data-calidad-opt="NO" style="font-weight:700; padding:6px 14px; display:flex; align-items:center; gap:4px;">❌ Rechazado</button>
                                        </div>
                                        <input type="hidden" id="cal-calidad-aprobada" required>
                                    </div>
                                </div>
                                
                                <!-- Tab Panel B: Muestras -->
                                <div class="cal-form-tab-panel" id="cal-form-panel-muestras" style="display: none;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-secundario);">🥭 Detalle por Fruta Muestreada</span>
                                        <div class="form-group" style="margin-bottom: 0; display: flex; align-items: center; gap: 8px;">
                                            <label class="form-label" style="margin-bottom: 0; font-weight: 700; font-size: 0.75rem; white-space: nowrap;" for="cal-cant-mangos">Mangos a evaluar:</label>
                                            <input type="number" id="cal-cant-mangos" class="form-input" min="1" max="40" value="12" style="width: 55px; padding: 3px 6px; font-size: 0.75rem; text-align: center; background: #0f172a; border-color: rgba(255,255,255,0.1);">
                                        </div>
                                    </div>
                                    <div class="table-container" id="cal-samples-table-container" style="max-height: 290px; overflow: auto; border: 1px solid var(--border-color); border-radius: 8px; padding-bottom: 8px;">
                                        <!-- Dynamic horizontal table loaded here -->
                                    </div>
                                    <div style="margin-top: 10px; background: rgba(0,0,0,0.15); padding: 8px; border-radius: 6px; font-size: 0.75rem; display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; border: 1px solid var(--border-color);">
                                        <span>Peso Prom.: <strong id="lbl-val-prom-peso" style="color: var(--color-primario);">0.0 g</strong></span>
                                        <span>Firmeza Prom.: <strong id="lbl-val-prom-firmeza" style="color: var(--color-primario);">0.0 Lbs</strong></span>
                                        <span>Madurez Prom.: <strong id="lbl-val-prom-madurez" style="color: var(--color-primario);">1.0</strong></span>
                                        <span>Brix Prom.: <strong id="lbl-val-prom-brix" style="color: var(--color-primario);">0.0°Bx</strong></span>
                                        <span>Chapa Prom.: <strong id="lbl-val-prom-chapa" style="color: var(--color-primario);">0%</strong></span>
                                        <span>M.Seca Prom.: <strong id="lbl-val-prom-ms" style="color: var(--color-primario);">0.0%</strong></span>
                                    </div>
                                </div>
                                
                                <!-- Tab Panel C: Defectos -->
                                <div class="cal-form-tab-panel" id="cal-form-panel-defectos" style="display: none;">
                                    <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-secundario); display: block; margin-bottom: 8px;">⚠️ Registro de Defectos (Unidades con Defecto)</span>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; max-height: 250px; overflow-y: auto; padding-right: 4px;">
                                        
                                        <!-- Column 1 Defects -->
                                        <div style="display: flex; flex-direction: column; gap: 6px;">
                                            <span style="font-size: 0.62rem; font-weight: bold; text-transform: uppercase; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 2px;">Fisiopatías / Calidad</span>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-antracnosis">Antracnosis</label>
                                                <input type="number" id="cal-def-antracnosis" class="form-input cal-defect-item" data-defect="antracnosis" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-mosca">Larva Mosca</label>
                                                <input type="number" id="cal-def-mosca" class="form-input cal-defect-item" data-defect="mosca" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-oidium">Oidium</label>
                                                <input type="number" id="cal-def-oidium" class="form-input cal-defect-item" data-defect="oidium" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-querezas">Querezas</label>
                                                <input type="number" id="cal-def-querezas" class="form-input cal-defect-item" data-defect="querezas" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-trips">Trips</label>
                                                <input type="number" id="cal-def-trips" class="form-input cal-defect-item" data-defect="trips" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-cicatriz">Cicatriz / Costra</label>
                                                <input type="number" id="cal-def-cicatriz" class="form-input cal-defect-item" data-defect="cicatriz" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-deformacion">Deformación</label>
                                                <input type="number" id="cal-def-deformacion" class="form-input cal-defect-item" data-defect="deformacion" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-insolacion">Insolación</label>
                                                <input type="number" id="cal-def-insolacion" class="form-input cal-defect-item" data-defect="insolacion" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-mancha">Mancha Necrót.</label>
                                                <input type="number" id="cal-def-mancha" class="form-input cal-defect-item" data-defect="mancha" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-lenticelas">Lenticelas</label>
                                                <input type="number" id="cal-def-lenticelas" class="form-input cal-defect-item" data-defect="lenticelas" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-dano-mecanico">Daños Mecán.</label>
                                                <input type="number" id="cal-def-dano-mecanico" class="form-input cal-defect-item" data-defect="dano_mecanico" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-golpe">Golpe</label>
                                                <input type="number" id="cal-def-golpe" class="form-input cal-defect-item" data-defect="golpe" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-latex">Látex</label>
                                                <input type="number" id="cal-def-latex" class="form-input cal-defect-item" data-defect="latex" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                        </div>
                                        
                                        <!-- Column 2 Defects -->
                                        <div style="display: flex; flex-direction: column; gap: 6px;">
                                            <span style="font-size: 0.62rem; font-weight: bold; text-transform: uppercase; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 2px;">Defectos de Condición</span>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-sombreado">Sin chapa / Somb.</label>
                                                <input type="number" id="cal-def-sombreado" class="form-input cal-defect-item" data-defect="sombreado" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-pedunculo">Pedúnculo Largo</label>
                                                <input type="number" id="cal-def-pedunculo" class="form-input cal-defect-item" data-defect="pedunculo" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-rameado">Rameado</label>
                                                <input type="number" id="cal-def-rameado" class="form-input cal-defect-item" data-defect="rameado" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-sin-pedunculo">Sin Pedúnculo</label>
                                                <input type="number" id="cal-def-sin-pedunculo" class="form-input cal-defect-item" data-defect="sin_pedunculo" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-sobrecalibre">Sobre Calibre</label>
                                                <input type="number" id="cal-def-sobrecalibre" class="form-input cal-defect-item" data-defect="sobrecalibre" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-maduro">Maduro</label>
                                                <input type="number" id="cal-def-maduro" class="form-input cal-defect-item" data-defect="maduro" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-verde">Verde</label>
                                                <input type="number" id="cal-def-verde" class="form-input cal-defect-item" data-defect="verde" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-chinches">Chinches</label>
                                                <input type="number" id="cal-def-chinches" class="form-input cal-defect-item" data-defect="chinches" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-puntos-negros">Puntos Negros</label>
                                                <input type="number" id="cal-def-puntos-negros" class="form-input cal-defect-item" data-defect="puntos_negros" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-pulpa">Pulpa Gelat.</label>
                                                <input type="number" id="cal-def-pulpa" class="form-input cal-defect-item" data-defect="pulpa" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-pepa">Daño en Pepa</label>
                                                <input type="number" id="cal-def-pepa" class="form-input cal-defect-item" data-defect="pepa" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-manzano">Manzano</label>
                                                <input type="number" id="cal-def-manzano" class="form-input cal-defect-item" data-defect="manzano" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                                                <label style="font-size: 0.72rem; flex: 1;" for="cal-def-otros">Otros</label>
                                                <input type="number" id="cal-def-otros" class="form-input cal-defect-item" data-defect="otros" value="0" min="0" style="padding: 4px; width: 45px; font-size: 0.72rem; text-align: center;">
                                            </div>
                                        </div>
                                    </div>
                                    <div style="background: rgba(15,23,42,0.015); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; display: flex; flex-direction:column; gap: 6px; font-size: 0.75rem;">
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <span>Defectos Calidad (C1): <strong id="cal-defects-col1-summary">0 und (0%)</strong></span>
                                            <span>Defectos Condición (C2): <strong id="cal-defects-col2-summary">0 und (0%)</strong></span>
                                        </div>
                                        <div style="border-top:1px dashed var(--border-color); padding-top:4px; display:flex; justify-content:space-between; align-items:center;">
                                            <span>Defectos Totales: <strong id="cal-defects-grand-total">0 und</strong></span>
                                            <span id="cal-defects-acceptable-box">Aceptable: <strong style="color: var(--color-exito);" id="cal-defects-acceptable-pct">100 %</strong></span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 15px;">
                                    <button type="submit" class="btn btn-primary" style="width:100%; font-weight: 700;">💾 Guardar Muestreo de Calidad</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Database changes trigger UI updates
        document.addEventListener('db-changed', (e) => {
            if (e.detail && e.detail.key === 'recepcion_mp') {
                this.refreshData();
            }
        });

        // Tab switching logic for main tabs
        const tabButtons = document.querySelectorAll('[data-cal-tab]');
        const tabPanels = document.querySelectorAll('.cal-view-panel');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-cal-tab');
                
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                tabPanels.forEach(panel => {
                    if (panel.id === `cal-panel-${targetTab}`) {
                        panel.style.display = 'block';
                    } else {
                        panel.style.display = 'none';
                    }
                });

                this.refreshData();
            });
        });

        // Tray Event Delegation for Evaluation Button
        const trayTbody = document.getElementById('table-cal-tray-body');
        if (trayTbody) {
            trayTbody.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-eval-lote');
                if (btn) {
                    const id = btn.getAttribute('data-id');
                    const record = window.db.getById('recepcion_mp', id);
                    if (record) {
                        this.loadEvaluationForm(record);
                    }
                }
            });
        }

        // Sub-tabs switching in tray list
        const subtabButtons = document.querySelectorAll('[data-cal-subtab]');
        subtabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                subtabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTab = btn.getAttribute('data-cal-subtab');
                this.refreshTrayTable();
            });
        });

        // Form tabs switching
        const formTabs = document.querySelectorAll('[data-cal-form-tab]');
        const formPanels = document.querySelectorAll('.cal-form-tab-panel');
        formTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.calFormTab;
                formTabs.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentFormTab = targetTab;
                
                formPanels.forEach(panel => {
                    if (panel.id === `cal-form-panel-${targetTab}`) {
                        panel.style.display = 'block';
                    } else {
                        panel.style.display = 'none';
                    }
                });
            });
        });

        // Search Input in Tray
        const searchInput = document.getElementById('cal-tray-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.refreshTrayTable();
            });
        }
        const calEmpresaSelect = document.getElementById('cal-tray-empresa');
        if (calEmpresaSelect) {
            calEmpresaSelect.addEventListener('change', () => {
                this.refreshTrayTable();
            });
        }

        // SENASA buttons logic
        const senasaBtns = document.querySelectorAll('.senasa-opt-btn');
        const senasaInput = document.getElementById('cal-senasa-aprobado');
        const fieldsContainer = document.getElementById('cal-form-fields-container');
        
        senasaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                senasaBtns.forEach(b => {
                    b.classList.remove('btn-success', 'btn-danger');
                    b.classList.add('btn-secondary');
                });
                
                const val = btn.getAttribute('data-senasa');
                senasaInput.value = val;
                
                if (val === 'SI') {
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-success'); // Custom coloring
                    btn.style.backgroundColor = 'var(--color-exito)';
                    btn.style.color = '#fff';
                } else {
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-danger');
                    btn.style.backgroundColor = 'var(--color-alerta)';
                    btn.style.color = '#fff';
                }

                // Enable the rest of the form
                fieldsContainer.style.opacity = '1';
                fieldsContainer.style.pointerEvents = 'auto';
            });
        });

        // Calidad buttons logic
        const calidadBtns = document.querySelectorAll('.calidad-opt-btn');
        const calidadInput = document.getElementById('cal-calidad-aprobada');
        calidadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                calidadBtns.forEach(b => {
                    b.classList.remove('btn-success', 'btn-danger');
                    b.classList.add('btn-secondary');
                    b.style.backgroundColor = '';
                    b.style.color = '';
                });

                const val = btn.getAttribute('data-calidad-opt');
                calidadInput.value = val;

                if (val === 'SI') {
                    btn.classList.remove('btn-secondary');
                    btn.style.backgroundColor = 'var(--color-exito)';
                    btn.style.color = '#fff';
                } else {
                    btn.classList.remove('btn-secondary');
                    btn.style.backgroundColor = 'var(--color-alerta)';
                    btn.style.color = '#fff';
                }
            });
        });

        // Mango count change
        const mangosCountInput = document.getElementById('cal-cant-mangos');
        if (mangosCountInput) {
            mangosCountInput.addEventListener('change', () => {
                this.adjustSamplesCount();
            });
        }

        // Live recalculations for defects inputs
        document.addEventListener('input', (e) => {
            if (e.target && e.target.classList.contains('cal-defect-item')) {
                this.recalculateQCStats();
            }
        });

        // Form Submit
        const form = document.getElementById('form-calidad-inspeccion');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQCSubmit();
            });
        }
    },

    refreshData() {
        this.refreshKPIs();
        this.refreshTrayTable();
    },

    refreshKPIs() {
        const list = window.db.getAll('recepcion_mp');
        const filtered = this.getFilteredRecords(list);
        
        let pendientes = 0;
        let aprobados = 0;
        let rechazados = 0;
        let senasaAprobados = 0;
        let senasaRechazados = 0;

        filtered.forEach(item => {
            if (item.estado === 'RECEPCIONADO') {
                pendientes++;
            } else if (item.estado === 'APROBADO') {
                aprobados++;
            } else if (item.estado === 'RECHAZADO') {
                rechazados++;
            }

            if (item.senasa_aprobado === 'Aprobado') {
                senasaAprobados++;
            } else if (item.senasa_aprobado === 'Rechazado') {
                senasaRechazados++;
            }
        });

        document.getElementById('kpi-cal-pendientes').innerText = pendientes;
        document.getElementById('kpi-cal-aprobados').innerText = aprobados;
        document.getElementById('kpi-cal-rechazados').innerText = rechazados;
        document.getElementById('kpi-cal-senasa-aprobados').innerText = senasaAprobados;
        document.getElementById('kpi-cal-senasa-rechazados').innerText = senasaRechazados;

        // Render simple visual chart in Dashboard
        const chartDiv = document.getElementById('cal-dashboard-charts');
        if (chartDiv) {
            const total = aprobados + rechazados + pendientes;
            const approvedPct = total > 0 ? Math.round((aprobados / total) * 100) : 0;
            const rejectedPct = total > 0 ? Math.round((rechazados / total) * 100) : 0;
            const pendingPct = total > 0 ? Math.round((pendientes / total) * 100) : 0;

            chartDiv.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                    <div style="font-size:0.8rem; font-weight:700; color:var(--text-secondary);">Distribución de Lotes</div>
                    <div style="display:flex; height:24px; width:300px; border-radius:12px; overflow:hidden; background:rgba(0,0,0,0.1); border:1px solid var(--border-color);">
                        <div style="width:${approvedPct}%; background:var(--color-exito); transition:width 0.5s;" title="Aprobados: ${approvedPct}%"></div>
                        <div style="width:${rejectedPct}%; background:var(--color-alerta); transition:width 0.5s;" title="Rechazados: ${rejectedPct}%"></div>
                        <div style="width:${pendingPct}%; background:var(--color-primario); transition:width 0.5s;" title="Pendientes: ${pendingPct}%"></div>
                    </div>
                    <div style="display:flex; gap:12px; font-size:0.75rem; margin-top:5px;">
                        <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:8px; height:8px; background:var(--color-exito); border-radius:50%;"></span> Aprobado (${approvedPct}%)</span>
                        <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:8px; height:8px; background:var(--color-alerta); border-radius:50%;"></span> Rechazado (${rejectedPct}%)</span>
                        <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:8px; height:8px; background:var(--color-primario); border-radius:50%;"></span> Pendiente (${pendingPct}%)</span>
                    </div>
                </div>
            `;
        }
    },

    refreshTrayTable() {
        const tbody = document.getElementById('table-cal-tray-body');
        if (!tbody) return;

        const list = window.db.getAll('recepcion_mp');
        const filteredList = this.getFilteredRecords(list);
        const searchQuery = (document.getElementById('cal-tray-search')?.value || '').toLowerCase().trim();

        // Filter by subtab status
        let filtered = filteredList.filter(item => {
            if (this.currentTab === 'pendientes') {
                return item.estado === 'RECEPCIONADO';
            } else if (this.currentTab === 'evaluados') {
                return item.estado === 'APROBADO' || item.estado === 'RECHAZADO';
            } else if (this.currentTab === 'rechazados') {
                return item.estado === 'RECHAZADO';
            }
            return true;
        });

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(item => {
                const provName = window.db.getById('proveedores_mp', item.proveedor_id)?.nombre || '';
                const varName = window.db.getById('variedades', item.variedad_id)?.nombre || '';
                const prov = window.db.getById('proveedores_mp', item.proveedor_id);
                const clp = item.clp || (prov && prov.clp ? prov.clp : '');
                return (item.lote_materia_prima || '').toLowerCase().includes(searchQuery) ||
                       (item.guia_remision || '').toLowerCase().includes(searchQuery) ||
                       provName.toLowerCase().includes(searchQuery) ||
                       varName.toLowerCase().includes(searchQuery) ||
                       clp.toLowerCase().includes(searchQuery);
            });
        }

        // Filter by Empresa (Exportador)
        const empresaFilter = document.getElementById('cal-tray-empresa')?.value;
        if (empresaFilter) {
            filtered = filtered.filter(item => item.empresa_id === empresaFilter);
        }

        tbody.innerHTML = '';

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center; padding:20px; color:var(--text-secondary); font-style:italic;">
                        No se encontraron batches.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(item => {
            const prov = window.db.getById('proveedores_mp', item.proveedor_id);
            const provName = prov?.nombre || 'N/A';
            const clp = item.clp || (prov && prov.clp ? prov.clp : 'N/A');
            const varName = window.db.getById('variedades', item.variedad_id)?.nombre || 'N/A';

            const tr = document.createElement('tr');

            let senasaLabel = '<span class="badge" style="background:#64748b; color:#fff;">PENDIENTE</span>';
            if (item.senasa_aprobado === 'Aprobado') {
                senasaLabel = '<span class="badge badge-success" style="background:var(--color-exito-fondo); color:var(--color-exito-texto);">APROBADO</span>';
            } else if (item.senasa_aprobado === 'Rechazado') {
                senasaLabel = '<span class="badge badge-danger" style="background:var(--color-alerta-fondo); color:var(--color-alerta-texto);">RECHAZADO</span>';
            }

            let calidadLabel = '<span class="badge" style="background:#64748b; color:#fff;">PENDIENTE</span>';
            if (item.calidad_aprobada === 'Aprobado') {
                calidadLabel = '<span class="badge badge-success" style="background:var(--color-exito-fondo); color:var(--color-exito-texto);">APROBADA</span>';
            } else if (item.calidad_aprobada === 'Rechazado') {
                calidadLabel = '<span class="badge badge-danger" style="background:var(--color-alerta-fondo); color:var(--color-alerta-texto);">RECHAZADA</span>';
            }

            tr.innerHTML = `
                <td style="font-weight:700; color:var(--color-primario); font-family:monospace;">${item.lote_materia_prima}</td>
                <td>${item.guia_remision}</td>
                <td style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${provName}</td>
                <td style="font-family:monospace; font-weight:600;">${clp}</td>
                <td style="font-weight:600;">${varName}</td>
                <td style="text-align:right; font-weight:700;">${item.peso_neto.toFixed(1)} Kg</td>
                <td style="text-align:center;">${senasaLabel}</td>
                <td style="text-align:center;">${calidadLabel}</td>
                <td style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-primary btn-sm btn-eval-lote" data-id="${item.id}" style="padding:4px 10px; font-size:0.75rem;">
                        ${this.currentTab === 'pendientes' ? '🔬 Evaluar' : '✏️ Editar Eval'}
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });
    },

    loadEvaluationForm(item) {
        this.selectedItem = item;
        
        // Show card
        const formCard = document.getElementById('card-cal-evaluation');
        if (formCard) {
            formCard.style.display = 'block';
            formCard.scrollIntoView({ behavior: 'smooth' });
        }

        document.getElementById('cal-eval-item-id').value = item.id;
        document.getElementById('title-cal-eval-batch').innerText = `🔬 Evaluación: Lote ${item.lote_materia_prima} (Guía ${item.guia_remision})`;

        // Reset SENASA and Calidad Buttons
        const senasaBtns = document.querySelectorAll('.senasa-opt-btn');
        senasaBtns.forEach(btn => {
            btn.classList.remove('btn-success', 'btn-danger');
            btn.classList.add('btn-secondary');
            btn.style.backgroundColor = '';
            btn.style.color = '';
        });
        document.getElementById('cal-senasa-aprobado').value = '';

        const calidadBtns = document.querySelectorAll('.calidad-opt-btn');
        calidadBtns.forEach(btn => {
            btn.classList.remove('btn-success', 'btn-danger');
            btn.classList.add('btn-secondary');
            btn.style.backgroundColor = '';
            btn.style.color = '';
        });
        document.getElementById('cal-calidad-aprobada').value = '';

        // Reset fields container blocking
        const fieldsContainer = document.getElementById('cal-form-fields-container');
        fieldsContainer.style.opacity = '0.3';
        fieldsContainer.style.pointerEvents = 'none';

        // Load existing values if editing
        if (item.senasa_aprobado) {
            const val = item.senasa_aprobado === 'Aprobado' ? 'SI' : 'NO';
            const btn = document.querySelector(`.senasa-opt-btn[data-senasa="${val}"]`);
            if (btn) btn.click(); // This will enable the form as well
        }

        if (item.calidad_aprobada) {
            const val = item.calidad_aprobada === 'Aprobado' ? 'SI' : 'NO';
            const btn = document.querySelector(`.calidad-opt-btn[data-calidad-opt="${val}"]`);
            if (btn) btn.click();
        }

        // General settings
        document.getElementById('cal-condicion').value = item.calidad?.condicion_lote || 'MARITIMO';
        document.getElementById('cal-certificada').value = item.calidad?.fruta_certificada || 'SI';
        document.getElementById('cal-toldo').value = item.calidad?.uso_toldo || 'SI';
        document.getElementById('cal-transporte-limpio').value = item.calidad?.transporte_limpio || 'SI';
        document.getElementById('cal-mtd-ceratitis').value = item.calidad?.mtd_ceratitis !== undefined ? item.calidad?.mtd_ceratitis : 0;
        document.getElementById('cal-mtd-anastrepha').value = item.calidad?.mtd_anastrepha !== undefined ? item.calidad?.mtd_anastrepha : 0;
        document.getElementById('cal-temp').value = item.calidad?.temperatura || '';
        document.getElementById('cal-proceso').value = item.calidad?.tipo_proceso || 'CONVENCIONAL';
        document.getElementById('cal-responsable').value = item.calidad?.responsable || 'DIANA SERNAQUE SANTOS';

        // Load Samples
        if (item.calidad?.detalles_muestras && item.calidad.detalles_muestras.length > 0) {
            this.currentQCSamples = JSON.parse(JSON.stringify(item.calidad.detalles_muestras));
        } else {
            // Generate 12 default sample mangos
            this.currentQCSamples = [];
            for (let i = 1; i <= 12; i++) {
                this.currentQCSamples.push({
                    numero: i,
                    peso: 380 + Math.round(Math.random() * 80), // dummy default
                    calibre: i % 2 === 0 ? 8 : 9,
                    penetrometro: (22.0 + Math.random() * 4).toFixed(1),
                    stage: 2.5,
                    brix: (6.5 + Math.random() * 2).toFixed(1),
                    chapa: 35,
                    ms: 15.5
                });
            }
        }
        document.getElementById('cal-cant-mangos').value = this.currentQCSamples.length;

        // Load Defects
        const defects = item.calidad?.detalles_defectos || {};
        document.querySelectorAll('.cal-defect-item').forEach(input => {
            const name = input.dataset.defect;
            input.value = defects[name] !== undefined ? defects[name] : 0;
        });

        // Initialize view form tabs
        const tabBtnGeneral = document.querySelector('[data-cal-form-tab="general"]');
        if (tabBtnGeneral) tabBtnGeneral.click();

        this.renderQCSamples();
        this.recalculateQCStats();
    },

    adjustSamplesCount() {
        const count = parseInt(document.getElementById('cal-cant-mangos').value) || 12;
        const currentCount = this.currentQCSamples.length;
        if (count > currentCount) {
            for (let i = currentCount + 1; i <= count; i++) {
                this.currentQCSamples.push({
                    numero: i,
                    peso: 400,
                    calibre: 8,
                    penetrometro: '24.0',
                    stage: 2.5,
                    brix: '7.5',
                    chapa: 30,
                    ms: 15.0
                });
            }
        } else if (count < currentCount) {
            this.currentQCSamples = this.currentQCSamples.slice(0, count);
        }

        this.renderQCSamples();
        this.recalculateQCStats();
    },

    renderQCSamples() {
        const container = document.getElementById('cal-samples-table-container');
        if (!container) return;

        document.getElementById('cal-samples-count-badge').innerText = this.currentQCSamples.length;

        let tableHtml = `
            <table style="width: 100%; min-width: 650px; border-collapse: collapse; font-size: 0.72rem; text-align: center;">
                <thead>
                    <tr style="background: rgba(255,255,255,0.03); color: var(--text-secondary); border-bottom: 1px solid var(--border-color); font-weight:700;">
                        <th style="padding: 6px 4px; width:45px;">N°</th>
                        <th style="padding: 6px 4px;">Peso (g)</th>
                        <th style="padding: 6px 4px;">Calibre</th>
                        <th style="padding: 6px 4px;">Firmeza (Lbs)</th>
                        <th style="padding: 6px 4px;">Madurez (H.)</th>
                        <th style="padding: 6px 4px;">Brix</th>
                        <th style="padding: 6px 4px;">Chapa (%)</th>
                        <th style="padding: 6px 4px;">M.Seca (%)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.currentQCSamples.forEach((s, idx) => {
            tableHtml += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                    <td style="padding:4px; font-weight:700; color:var(--text-secondary);">${s.numero}</td>
                    <td style="padding:2px;">
                        <input type="number" class="form-input sample-input" data-idx="${idx}" data-field="peso" value="${s.peso || ''}" style="padding:4px; font-size:0.72rem; text-align:center; width:65px;">
                    </td>
                    <td style="padding:2px;">
                        <select class="form-select sample-input" data-idx="${idx}" data-field="calibre" style="padding:4px; font-size:0.72rem; text-align:center; width:55px;">
                            ${[4,5,6,7,8,9,10,12,14,16,18,20].map(c => `<option value="${c}" ${s.calibre == c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </td>
                    <td style="padding:2px;">
                        <input type="number" class="form-input sample-input" data-idx="${idx}" data-field="penetrometro" value="${s.penetrometro || ''}" step="0.1" style="padding:4px; font-size:0.72rem; text-align:center; width:60px;">
                    </td>
                    <td style="padding:2px;">
                        <select class="form-select sample-input" data-idx="${idx}" data-field="stage" style="padding:4px; font-size:0.72rem; text-align:center; width:60px;">
                            ${[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0].map(val => `<option value="${val}" ${s.stage == val ? 'selected' : ''}>${val.toFixed(1)}</option>`).join('')}
                        </select>
                    </td>
                    <td style="padding:2px;">
                        <input type="number" class="form-input sample-input" data-idx="${idx}" data-field="brix" value="${s.brix || ''}" step="0.1" style="padding:4px; font-size:0.72rem; text-align:center; width:55px;">
                    </td>
                    <td style="padding:2px;">
                        <input type="number" class="form-input sample-input" data-idx="${idx}" data-field="chapa" value="${s.chapa || ''}" style="padding:4px; font-size:0.72rem; text-align:center; width:55px;">
                    </td>
                    <td style="padding:2px;">
                        <input type="number" class="form-input sample-input" data-idx="${idx}" data-field="ms" value="${s.ms || ''}" step="0.1" style="padding:4px; font-size:0.72rem; text-align:center; width:60px;">
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;

        container.innerHTML = tableHtml;

        // Bind input events to live updates
        container.querySelectorAll('.sample-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.currentTarget.dataset.idx);
                const field = e.currentTarget.dataset.field;
                let val = e.currentTarget.value;
                
                if (field === 'peso' || field === 'calibre' || field === 'chapa') {
                    this.currentQCSamples[idx][field] = parseInt(val) || 0;
                } else if (field === 'penetrometro' || field === 'brix' || field === 'stage' || field === 'ms') {
                    this.currentQCSamples[idx][field] = parseFloat(val) || 0;
                }
                
                this.recalculateQCStats();
            });
        });
    },

    recalculateQCStats() {
        const samples = this.currentQCSamples;
        const totalSamples = samples.length;

        // Live Averages calculation
        const brixes = samples.map(s => parseFloat(s.brix)).filter(v => !isNaN(v));
        const avgBrix = brixes.length > 0 ? (brixes.reduce((a,b)=>a+b,0) / brixes.length) : 0;
        
        const weights = samples.map(s => parseInt(s.peso)).filter(v => !isNaN(v));
        const avgWeight = weights.length > 0 ? (weights.reduce((a,b)=>a+b,0) / weights.length) : 0;

        const penetrometers = samples.map(s => parseFloat(s.penetrometro)).filter(v => !isNaN(v));
        const avgPenet = penetrometers.length > 0 ? (penetrometers.reduce((a,b)=>a+b,0) / penetrometers.length) : 0;

        const stages = samples.map(s => parseFloat(s.stage)).filter(v => !isNaN(v));
        const avgStage = stages.length > 0 ? (stages.reduce((a,b)=>a+b,0) / stages.length) : 0;

        const chapas = samples.map(s => parseInt(s.chapa)).filter(v => !isNaN(v));
        const avgChapa = chapas.length > 0 ? (chapas.reduce((a,b)=>a+b,0) / chapas.length) : 0;

        const mss = samples.map(s => parseFloat(s.ms)).filter(v => !isNaN(v));
        const avgMS = mss.length > 0 ? (mss.reduce((a,b)=>a+b,0) / mss.length) : 0;

        const lblPeso = document.getElementById('lbl-val-prom-peso');
        const lblFirmeza = document.getElementById('lbl-val-prom-firmeza');
        const lblMadurez = document.getElementById('lbl-val-prom-madurez');
        const lblBrix = document.getElementById('lbl-val-prom-brix');
        const lblChapa = document.getElementById('lbl-val-prom-chapa');
        const lblMS = document.getElementById('lbl-val-prom-ms');

        if (lblPeso) lblPeso.innerText = `${avgWeight.toFixed(1)} g`;
        if (lblFirmeza) lblFirmeza.innerText = `${avgPenet.toFixed(1)} Lbs`;
        if (lblMadurez) lblMadurez.innerText = `${avgStage.toFixed(2)}`;
        if (lblBrix) lblBrix.innerText = `${avgBrix.toFixed(1)}°Bx`;
        if (lblChapa) lblChapa.innerText = `${avgChapa.toFixed(0)}%`;
        if (lblMS) lblMS.innerText = `${avgMS.toFixed(1)}%`;

        // Defects calculations
        const defectValues = {};
        document.querySelectorAll('.cal-defect-item').forEach(input => {
            const defect = input.dataset.defect;
            const val = parseInt(input.value) || 0;
            defectValues[defect] = val;
        });

        let totalCol1 = 0;
        let totalCol2 = 0;
        const col1Defects = ['antracnosis', 'mosca', 'oidium', 'querezas', 'trips', 'cicatriz', 'deformacion', 'insolacion', 'mancha', 'lenticelas', 'dano_mecanico', 'golpe', 'latex'];
        const col2Defects = ['sombreado', 'pedunculo', 'rameado', 'sin_pedunculo', 'sobrecalibre', 'maduro', 'verde', 'chinches', 'puntos_negros', 'pulpa', 'pepa', 'manzano', 'otros'];
        
        for (let def in defectValues) {
            if (col1Defects.includes(def)) totalCol1 += defectValues[def];
            if (col2Defects.includes(def)) totalCol2 += defectValues[def];
        }

        const grandTotalDefects = totalCol1 + totalCol2;
        const pctAcceptable = totalSamples > 0 ? Math.max(0, 100 - Math.round((grandTotalDefects / totalSamples) * 100)) : 100;

        document.getElementById('cal-defects-col1-summary').innerText = `${totalCol1} und (${totalSamples > 0 ? Math.round((totalCol1/totalSamples)*100) : 0}%)`;
        document.getElementById('cal-defects-col2-summary').innerText = `${totalCol2} und (${totalSamples > 0 ? Math.round((totalCol2/totalSamples)*100) : 0}%)`;
        document.getElementById('cal-defects-grand-total').innerText = `${grandTotalDefects} und`;
        document.getElementById('cal-defects-acceptable-pct').innerText = `${pctAcceptable} %`;

        if (pctAcceptable < 85) {
            document.getElementById('cal-defects-acceptable-pct').style.color = 'var(--color-alerta)';
        } else {
            document.getElementById('cal-defects-acceptable-pct').style.color = 'var(--color-exito)';
        }
    },

    async handleQCSubmit() {
        try {
            const itemId = document.getElementById('cal-eval-item-id').value;
            if (!itemId) {
                alert("⚠️ Seleccione un lote para evaluar.");
                return;
            }

            const record = window.db.getById('recepcion_mp', itemId);
            if (!record) {
                alert("❌ El lote seleccionado no existe.");
                return;
            }

            const senasa_aprobado_sel = document.getElementById('cal-senasa-aprobado').value;
            if (!senasa_aprobado_sel) {
                alert("⚠️ Debe registrar si SENASA aprobó o no el lote de manera obligatoria.");
                return;
            }

            const calidad_aprobada_sel = document.getElementById('cal-calidad-aprobada').value;
            if (!calidad_aprobada_sel) {
                alert("⚠️ Debe seleccionar el resultado de Calidad Interna (Aprobado o Rechazado).");
                return;
            }

            // Averages and stats from samples
            const samples = this.currentQCSamples;
            const brixes = samples.map(s => parseFloat(s.brix)).filter(v => !isNaN(v));
            const avgBrix = brixes.length > 0 ? (brixes.reduce((a,b)=>a+b,0) / brixes.length) : 0;
            
            const weights = samples.map(s => parseInt(s.peso)).filter(v => !isNaN(v));
            const avgWeight = weights.length > 0 ? (weights.reduce((a,b)=>a+b,0) / weights.length) : 0;

            const penetrometers = samples.map(s => parseFloat(s.penetrometro)).filter(v => !isNaN(v));
            const avgPenet = penetrometers.length > 0 ? (penetrometers.reduce((a,b)=>a+b,0) / penetrometers.length) : 0;

            const stages = samples.map(s => parseFloat(s.stage)).filter(v => !isNaN(v));
            const avgStage = stages.length > 0 ? (stages.reduce((a,b)=>a+b,0) / stages.length) : 0;

            const chapas = samples.map(s => parseInt(s.chapa)).filter(v => !isNaN(v));
            const avgChapa = chapas.length > 0 ? (chapas.reduce((a,b)=>a+b,0) / chapas.length) : 0;

            const mss = samples.map(s => parseFloat(s.ms)).filter(v => !isNaN(v));
            const avgMS = mss.length > 0 ? (mss.reduce((a,b)=>a+b,0) / mss.length) : 0;

            const calibreCounts = { 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 12: 0, 14: 0, 16: 0 };
            samples.map(s => parseInt(s.calibre)).filter(v => !isNaN(v)).forEach(c => {
                if (calibreCounts[c] !== undefined) calibreCounts[c]++;
            });

            let predominantCal = 8;
            let maxCount = -1;
            for (let cal in calibreCounts) {
                if (calibreCounts[cal] > maxCount) {
                    maxCount = calibreCounts[cal];
                    predominantCal = parseInt(cal);
                }
            }

            // Defects values
            const defectValues = {};
            document.querySelectorAll('.cal-defect-item').forEach(input => {
                const defect = input.dataset.defect;
                const val = parseInt(input.value) || 0;
                defectValues[defect] = val;
            });

            let totalCol1 = 0;
            let totalCol2 = 0;
            const col1Defects = ['antracnosis', 'mosca', 'oidium', 'querezas', 'trips', 'cicatriz', 'deformacion', 'insolacion', 'mancha', 'lenticelas', 'dano_mecanico', 'golpe', 'latex'];
            const col2Defects = ['sombreado', 'pedunculo', 'rameado', 'sin_pedunculo', 'sobrecalibre', 'maduro', 'verde', 'chinches', 'puntos_negros', 'pulpa', 'pepa', 'manzano', 'otros'];
            for (let def in defectValues) {
                if (col1Defects.includes(def)) totalCol1 += defectValues[def];
                if (col2Defects.includes(def)) totalCol2 += defectValues[def];
            }
            const grandTotalDefects = totalCol1 + totalCol2;
            const pctAcceptable = samples.length > 0 ? Math.max(0, 100 - Math.round((grandTotalDefects / samples.length) * 100)) : 100;

            const qc_temp = parseFloat(document.getElementById('cal-temp').value) || 0;
            const qc_condicion = document.getElementById('cal-condicion').value;
            const qc_certificada = document.getElementById('cal-certificada').value;
            const qc_toldo = document.getElementById('cal-toldo').value;
            const qc_transporte_limpio = document.getElementById('cal-transporte-limpio').value;
            const qc_mtd_ceratitis = parseInt(document.getElementById('cal-mtd-ceratitis').value) || 0;
            const qc_mtd_anastrepha = parseInt(document.getElementById('cal-mtd-anastrepha').value) || 0;
            const qc_proceso = document.getElementById('cal-proceso').value;
            const qc_responsable = document.getElementById('cal-responsable').value;

            // Determinar estados fitosanitarios y de calidad
            const senasa_aprobado = senasa_aprobado_sel === 'SI' ? 'Aprobado' : 'Rechazado';
            const calidad_aprobada = calidad_aprobada_sel === 'SI' ? 'Aprobado' : 'Rechazado';

            // REGLA PARA CONTINUAR EL PROCESO:
            // Un Batch únicamente podrá estar disponible para los módulos posteriores cuando se cumplan ambas condiciones:
            // Estado SENASA = Aprobado Y Estado Calidad = Aprobado.
            const nuevoEstado = (senasa_aprobado === 'Aprobado' && calidad_aprobada === 'Aprobado') ? 'APROBADO' : 'RECHAZADO';

            record.senasa_aprobado = senasa_aprobado;
            record.calidad_aprobada = calidad_aprobada;
            record.estado = nuevoEstado;
            
            record.calidad = {
                estado: nuevoEstado, // Conservar consistencia con modelos anteriores
                calibre: predominantCal.toString(),
                brix: parseFloat(avgBrix.toFixed(1)),
                temperatura: qc_temp,
                condicion_lote: qc_condicion,
                fruta_certificada: qc_certificada,
                uso_toldo: qc_toldo,
                transporte_limpio: qc_transporte_limpio,
                mtd_ceratitis: qc_mtd_ceratitis,
                mtd_anastrepha: qc_mtd_anastrepha,
                tipo_proceso: qc_proceso,
                responsable: qc_responsable,
                
                peso_promedio: parseFloat(avgWeight.toFixed(1)),
                penetrometro_promedio: parseFloat(avgPenet.toFixed(1)),
                stage_promedio: parseFloat(avgStage.toFixed(1)),
                chapa_promedio: parseFloat(avgChapa.toFixed(1)),
                materia_seca_promedio: parseFloat(avgMS.toFixed(1)),
                
                defectos_totales: grandTotalDefects,
                porcentaje_aceptable: pctAcceptable,
                detalles_defectos: defectValues,
                
                muestreo_detallado: true,
                detalles_muestras: samples,
                distribucion_calibres: calibreCounts
            };

            // Confirm summary
            const confirmationSummary = `
                🔬 CONFIRMACIÓN DE EVALUACIÓN DE CALIDAD
                --------------------------------------
                • Lote / Batch: ${record.lote_materia_prima}
                • Guía de Remisión: ${record.guia_remision}
                • Resultado SENASA: ${senasa_aprobado}
                • Resultado Calidad: ${calidad_aprobada}
                • Estado Final del Batch: ${nuevoEstado}
                --------------------------------------
                ¿Desea guardar esta evaluación?
            `;

            if (!confirm(confirmationSummary.trim())) {
                return;
            }

            await window.db.update('recepcion_mp', record.id, record);

            alert(`BATCH ${record.lote_materia_prima} FUE EVALUADO CON EXITO\n\nEvaluación guardada con éxito.\nEstado Final: ${nuevoEstado}\n(SENASA: ${senasa_aprobado} | Calidad: ${calidad_aprobada})`);

            // Reset evaluation panel UI
            this.selectedItem = null;
            document.getElementById('cal-eval-item-id').value = '';
            document.getElementById('cal-senasa-aprobado').value = '';
            document.getElementById('cal-calidad-aprobada').value = '';
            
            const formCard = document.getElementById('card-cal-evaluation');
            if (formCard) formCard.style.display = 'none';
            document.getElementById('title-cal-eval-batch').innerText = `🔬 Evaluación: Seleccione un Lote`;

            // Reset SENASA and Calidad Buttons styles
            const senasaBtns = document.querySelectorAll('.senasa-opt-btn');
            senasaBtns.forEach(btn => {
                btn.classList.remove('btn-success', 'btn-danger');
                btn.classList.add('btn-secondary');
                btn.style.backgroundColor = '';
                btn.style.color = '';
            });

            const calidadBtns = document.querySelectorAll('.calidad-opt-btn');
            calidadBtns.forEach(btn => {
                btn.classList.remove('btn-success', 'btn-danger');
                btn.classList.add('btn-secondary');
                btn.style.backgroundColor = '';
                btn.style.color = '';
            });

            const fieldsContainer = document.getElementById('cal-form-fields-container');
            fieldsContainer.style.opacity = '0.3';
            fieldsContainer.style.pointerEvents = 'none';

            this.refreshData();
        } catch (error) {
            console.error("Error saving quality inspection:", error);
            alert("❌ Ocurrió un error al guardar los datos de calidad: " + error.message);
        }
    }
};

window.calidadModule = calidadModule;
