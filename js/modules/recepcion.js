/* ==========================================================================
   Pachamama ERP - Recepción de Materia Prima (MP) Module
   ========================================================================== */

const recepcionModule = {
    currentTarimas: [], // Temporary detail array during entry
    currentTab: 'dashboard', // 'dashboard', 'registro', 'historial'
    selectedFilter: 'hoy', // 'hoy', 'semana', 'mes', 'campana', 'personalizado'

    getLocalDateStr(d = new Date()) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    runCampaignMigration() {
        try {
            const list = window.db.getAll('recepcion_mp');
            let updatedCount = 0;
            list.forEach(item => {
                if (item.fecha && item.lote_materia_prima) {
                    const date = new Date(item.fecha + 'T00:00:00');
                    const year = date.getFullYear();
                    const month = date.getMonth();
                    let startYear, endYear;
                    if (month >= 8) { // Campaña inicia en Septiembre (Mes 8)
                        startYear = year;
                        endYear = year + 1;
                    } else { // Enero a Agosto pertenece a la campaña que termina este año
                        startYear = year - 1;
                        endYear = year;
                    }
                    const correctCampaign = `${String(startYear).substring(2, 4)}${String(endYear).substring(2, 4)}`;
                    const currentCampaign = item.lote_materia_prima.substring(0, 4);
                    
                    if (correctCampaign !== currentCampaign) {
                        const oldLote = item.lote_materia_prima;
                        const newLote = correctCampaign + oldLote.substring(4);
                        console.log(`Migrating batch code: ${oldLote} -> ${newLote}`);
                        
                        item.lote_materia_prima = newLote;
                        window.db.update('recepcion_mp', item.id, item);
                        updatedCount++;

                        // Sync in calibrados
                        const calibrados = window.db.getAll('calibrado_mp');
                        calibrados.forEach(c => {
                            if (c.lote_materia_prima === oldLote) {
                                c.lote_materia_prima = newLote;
                                window.db.update('calibrado_mp', c.id, c);
                            }
                        });
                    }
                }
            });
            if (updatedCount > 0) {
                console.log(`Database Migration: Fixed ${updatedCount} campaign batch codes.`);
            }
        } catch (e) {
            console.error("Error during campaign migration:", e);
        }
    },

    init() {
        this.runCampaignMigration();
        this.currentTarimas = [];
        this.renderLayout();

        this.filterComponent = new window.FilterComponent({
            containerId: 'rec-filter-toolbar-container',
            prefix: 'rec',
            onChange: () => this.refreshData()
        });

        this.bindEvents();
        this.updateBatchCodePreview();
        this.refreshData();
    },

    renderLayout() {
        const container = document.getElementById('view-recepcion');
        if (!container) return;

        const variedades = window.db.getAll('variedades');
        const proveedores = window.db.getAll('proveedores_mp');
        const empresas = window.db.getAll('empresas');

        container.innerHTML = `
            <!-- Tab Navigation Header -->
            <div class="tabs-nav" style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                <button class="btn btn-secondary tab-btn active" data-rec-tab="dashboard" style="font-weight:700; display:flex; align-items:center; gap:6px;">📊 Dashboard Recepción</button>
                <button class="btn btn-secondary tab-btn" data-rec-tab="registro" style="font-weight:700; display:flex; align-items:center; gap:6px;">📥 Registrar Guías</button>
                <button class="btn btn-secondary tab-btn" data-rec-tab="historial" style="font-weight:700; display:flex; align-items:center; gap:6px;">📋 Historial de Recepción</button>
            </div>

            <!-- Tab Panel 1: Dashboard -->
            <div class="rec-tab-panel active" id="rec-tab-panel-dashboard">
                <div id="rec-filter-toolbar-container"></div>

                <!-- KPI Cards Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div class="card" style="padding: 15px; margin-bottom: 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.02)); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; min-height: 80px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">📋 Guías Registradas</span>
                        <strong id="kpi-rec-guias" style="font-size: 1.3rem; color: #3b82f6; margin-top: 5px; font-weight: 800;">0</strong>
                    </div>
                    <div class="card" style="padding: 15px; margin-bottom: 0; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02)); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; min-height: 80px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">⚖️ Kilogramos Recibidos</span>
                        <strong id="kpi-rec-kg" style="font-size: 1.3rem; color: var(--color-secundario); margin-top: 5px; font-weight: 800;">0.0 Kg</strong>
                    </div>
                    <div class="card" style="padding: 15px; margin-bottom: 0; background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02)); border: 1px solid rgba(139, 92, 246, 0.15); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; min-height: 80px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">📦 Jabas Recibidas</span>
                        <strong id="kpi-rec-jabas" style="font-size: 1.3rem; color: #8b5cf6; margin-top: 5px; font-weight: 800;">0</strong>
                    </div>
                    <div class="card" style="padding: 15px; margin-bottom: 0; background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02)); border: 1px solid rgba(245, 158, 11, 0.15); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; min-height: 80px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">🔢 Batches Generados</span>
                        <strong id="kpi-rec-batches" style="font-size: 1.3rem; color: var(--color-primario); margin-top: 5px; font-weight: 800;">0</strong>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div class="card" style="padding: 15px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">🏠 Recepciones Propias</span>
                        <h3 id="kpi-rec-propias" style="font-size: 1.4rem; color: var(--color-exito); margin-top: 5px; font-weight: 800;">0</h3>
                    </div>
                    <div class="card" style="padding: 15px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">🤝 Recepciones Maquila</span>
                        <h3 id="kpi-rec-maquila" style="font-size: 1.4rem; color: var(--color-primario); margin-top: 5px; font-weight: 800;">0</h3>
                    </div>
                    <div class="card" style="padding: 15px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">📊 Promedio Kg por Guía</span>
                        <h3 id="kpi-rec-promedio" style="font-size: 1.4rem; color: #06b6d4; margin-top: 5px; font-weight: 800;">0.0 Kg</h3>
                    </div>
                    <div class="card" style="padding: 15px;">
                        <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">⚖️ Peso Promedio Jaba</span>
                        <h3 id="kpi-rec-promedio-jaba" style="font-size: 1.4rem; color: #f43f5e; margin-top: 5px; font-weight: 800;">0.0 Kg</h3>
                    </div>
                </div>

                <!-- Interactive Charts Grid (Power BI Style for Reception) -->
                <div class="panel-grid two-cols" style="margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                    <div class="card" style="padding: 15px; background: var(--bg-secondary); border-radius: var(--radio-tarjeta); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
                        <span style="font-size: 0.72rem; color: var(--color-borde); text-transform: uppercase; font-weight: 700; font-family: var(--fuente-titulos); display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 10px;">🏢 Ingreso de MP por Exportador (Kg Neto)</span>
                        <div style="position: relative; height: 180px; width: 100%;">
                            <canvas id="chart-rec-exportadores"></canvas>
                        </div>
                    </div>
                    <div class="card" style="padding: 15px; background: var(--bg-secondary); border-radius: var(--radio-tarjeta); border: 1px solid var(--border-color); box-shadow: var(--shadow-premium);">
                        <span style="font-size: 0.72rem; color: var(--color-borde); text-transform: uppercase; font-weight: 700; font-family: var(--fuente-titulos); display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 10px;">🥭 Variedades Recibidas (Kg Neto)</span>
                        <div style="position: relative; height: 180px; width: 100%;">
                            <canvas id="chart-rec-variedades"></canvas>
                        </div>
                    </div>
                </div>

                <div class="card" style="padding: 20px;">
                    <h3 style="margin-top:0; font-size:0.95rem; color: var(--color-primario); text-transform: uppercase; font-weight:800; border-bottom:1px dashed var(--border-color); padding-bottom:6px;">🚨 Última Recepción Registrada</h3>
                    <div id="kpi-rec-latest-detail" style="font-size:0.85rem; line-height:1.6; padding-top:6px; color: var(--text-secondary);">
                        Cargando...
                    </div>
                </div>
            </div>

            <!-- Tab Panel 2: Registrar Guías -->
            <div class="rec-tab-panel" id="rec-tab-panel-registro" style="display: none;">
                <div class="card" style="max-width: 800px; margin: 0 auto;">
                    <h2 class="card-title">📥 Registro de Recepción de Fruta (Materia Prima)</h2>
                    <form id="form-recepcion-guia" novalidate>
                        
                        <!-- Adjuntar Guía Electrónica (OCR) -->
                        <div class="form-group" style="margin-bottom:15px; background: rgba(139, 92, 246, 0.05); border: 1px dashed rgba(139, 92, 246, 0.3); border-radius: 8px; padding: 10px;">
                            <label class="form-label" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; font-weight:700; color:var(--text-secondary);">
                                <span>📎 Adjuntar Guía de Remisión (PDF / Imagen)</span>
                                <span class="badge badge-purple" style="font-size:0.6rem; text-transform:uppercase;">Lectura Inteligente OCR</span>
                            </label>
                            <input type="file" id="rec-upload-guia" class="form-input" accept=".pdf,image/*" style="font-size:0.75rem; padding:4px; background:#0f172a; border-color:rgba(139,92,246,0.2);">
                            <div id="ocr-loading-status" style="font-size:0.7rem; color:var(--text-muted); margin-top:4px; display:none;">⏳ Procesando archivo con OCR...</div>
                        </div>

                         <!-- Tipo de Ingreso (Propio / Maquila) -->
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label class="form-label" for="rec-tipo-ingreso">Tipo de Ingreso / Recepción *</label>
                            <select id="rec-tipo-ingreso" class="form-select" required style="padding: 7px 10px; background: var(--color-exito-fondo); font-weight: 700; color: var(--color-exito-texto);">
                                <option value="">-- Seleccionar Tipo Ingreso --</option>
                                <option value="propia">🏠 Producción Propia (Pachamama Farms)</option>
                                <option value="maquila">🤝 Maquila (Servicio a Terceros)</option>
                            </select>
                        </div>

                        <div class="form-row" style="margin-bottom:12px; gap:12px;">
                            <div class="form-group">
                                <label class="form-label" for="rec-fecha">Fecha de Ingreso *</label>
                                <input type="date" id="rec-fecha" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="rec-hora">Hora de Ingreso *</label>
                                <input type="time" id="rec-hora" class="form-input" required>
                            </div>
                        </div>

                        <div class="form-row" style="margin-bottom:12px; gap:12px;">
                            <div class="form-group">
                                <label class="form-label" for="rec-empresa">Empresa / Exportador *</label>
                                <select id="rec-empresa" class="form-select" required style="padding: 7px 10px;">
                                    <option value="">-- Seleccionar Empresa --</option>
                                    ${window.utils.optionsHTML('empresas')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="rec-guia">Guía de Remisión *</label>
                                <input type="text" id="rec-guia" class="form-input" placeholder="ej: GR-001-12345" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="font-weight:700;" for="rec-lote-preview">Batch Auto-Generado *</label>
                                <input type="text" id="rec-lote-preview" class="form-input" style="font-weight:800; color:var(--color-primario); background:rgba(0,0,0,0.1); border-color:var(--color-primario);" readonly required placeholder="Ej: 2627PP0001">
                            </div>
                        </div>

                        <div class="form-row" style="margin-bottom:12px; gap:12px;">
                            <div class="form-group">
                                <label class="form-label" for="rec-variedad">Variedad *</label>
                                <select id="rec-variedad" class="form-select" required>
                                    <option value="">-- Seleccionar Variedad --</option>
                                    ${variedades.filter(v => v.estado === 'Activo').map(v => `<option value="${v.id}">${v.nombre} (${v.producto})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="rec-proveedor">Proveedor / Agricultor (Origen) *</label>
                                <select id="rec-proveedor" class="form-select" required>
                                    <option value="">-- Seleccionar Proveedor --</option>
                                    ${proveedores.map(p => `<option value="${p.id}">${p.nombre} - Fundo ${p.fundo} (${p.valle})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="rec-clp">CLP del Agricultor *</label>
                                <input type="text" id="rec-clp" class="form-input" style="font-weight:700;" required placeholder="ej: 015-0291-0012">
                            </div>
                        </div>

                        <div class="form-row" style="margin-bottom:12px; gap:12px;">
                            <div class="form-group">
                                <label class="form-label" for="rec-jabas-guia">Jabas Declaradas en Guía *</label>
                                <input type="number" id="rec-jabas-guia" class="form-input" placeholder="ej: 1000" min="1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="rec-peso-guia">Peso Declarado en Guía (Kg) *</label>
                                <input type="number" id="rec-peso-guia" class="form-input" placeholder="ej: 19350" step="0.1" min="1" required>
                            </div>
                        </div>

                        <!-- Pallets Capture Section -->
                        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-top:0; margin-bottom:10px;">⚖️ Detalle de Peso y Envases por Parihuela</h3>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; align-items: flex-end; margin-bottom: 12px;">
                                <div class="form-group">
                                    <label class="form-label" style="font-size:0.7rem; margin-bottom:4px;" for="pal-jabas">Cantidad de Envases</label>
                                    <input type="number" id="pal-jabas" class="form-input" placeholder="ej: 120" min="1" style="padding: 6px 10px; font-size: 0.8rem;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size:0.7rem; margin-bottom:4px;" for="pal-peso-bruto">Peso Bruto (Kg)</label>
                                    <input type="number" id="pal-peso-bruto" class="form-input" placeholder="ej: 3200" step="0.1" min="1" style="padding: 6px 10px; font-size: 0.8rem;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size:0.7rem; margin-bottom:4px;" for="pal-select-tarima-tipo">Peso de Parihuela</label>
                                    <select id="pal-select-tarima-tipo" class="form-select" style="padding: 6px 10px; font-size: 0.8rem; background: var(--color-fondo);">
                                        <option value="35.75">Parihuela Estándar (35.75 Kg)</option>
                                        <option value="24.0">Parihuela Canastilla (24.0 Kg)</option>
                                        <option value="29.5">Parihuela A Jaba (29.5 Kg)</option>
                                        <option value="23.5">Parihuela B Jaba (23.5 Kg)</option>
                                        <option value="custom">Otro Peso (Manual)</option>
                                    </select>
                                </div>
                                <div class="form-group" id="pal-tare-tarima-container" style="display:none;">
                                    <label class="form-label" style="font-size:0.7rem; margin-bottom:4px;" for="pal-tare-tarima">Tara Parihuela (Kg)</label>
                                    <input type="number" id="pal-tare-tarima" class="form-input" value="35.75" step="0.1" min="0" style="padding: 6px 10px; font-size: 0.8rem;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size:0.7rem; margin-bottom:4px;" for="pal-select-envase-tipo">Tipo Envase / Tara</label>
                                    <select id="pal-select-envase-tipo" class="form-select" style="padding: 6px 10px; font-size: 0.8rem; background: var(--color-fondo);">
                                        <option value="0.778">Canastilla (0.778 Kg)</option>
                                        <option value="1.7">Jaba (1.7 Kg)</option>
                                        <option value="custom">Otro Peso (Manual)</option>
                                    </select>
                                </div>
                                <div class="form-group" id="pal-tare-jaba-container" style="display:none;">
                                    <label class="form-label" style="font-size:0.7rem; margin-bottom:4px;" for="pal-tare-jaba">Tara Envase (Kg)</label>
                                    <input type="number" id="pal-tare-jaba" class="form-input" value="0.778" step="0.001" min="0" style="padding: 6px 10px; font-size: 0.8rem;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size:0.7rem; margin-bottom:4px;" for="pal-peso">Peso Neto (Kg)</label>
                                    <input type="number" id="pal-peso" class="form-input" style="background:rgba(0,0,0,0.1); padding: 6px 10px; font-size: 0.8rem; font-weight:700; color:var(--color-secundario);" placeholder="0.0" readonly>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size:0.7rem; margin-bottom:4px;" for="pal-avg">Prom. Envase</label>
                                    <input type="text" id="pal-avg" class="form-input" style="background:rgba(0,0,0,0.1); padding: 6px 10px; font-size: 0.8rem;" placeholder="0.0" readonly>
                                </div>
                                <button type="button" class="btn btn-secondary btn-sm" id="btn-add-tarima" style="height:33px; display:flex; align-items:center; justify-content:center; gap:2px; font-size:0.75rem;">➕ Agregar</button>
                            </div>

                            <div style="max-height: 160px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 12px; background: rgba(0,0,0,0.1);">
                                <table style="width: 100%; border-collapse: collapse; font-size: 0.7rem; text-align: left;">
                                    <thead>
                                        <tr style="background: rgba(255,255,255,0.03); color: var(--text-secondary); border-bottom: 1px solid var(--border-color);">
                                            <th style="padding: 6px 8px;">Parihuela N°</th>
                                            <th style="padding: 6px 8px; text-align: right;">Jabas</th>
                                            <th style="padding: 6px 8px; text-align: right;">P. Bruto</th>
                                            <th style="padding: 6px 8px; text-align: right;">P. Neto</th>
                                            <th style="padding: 6px 8px; text-align: right;">Prom. Neto</th>
                                            <th style="padding: 6px 8px; text-align: center;">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody id="list-tarimas-body">
                                        <!-- Rendered dynamically -->
                                    </tbody>
                                </table>
                            </div>

                            <!-- Live comparison box -->
                            <div id="live-comparison-box" style="padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.01); display: flex; flex-direction: column; gap: 10px;">
                                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px; font-size: 0.7rem; font-weight:700; text-transform: uppercase; color: var(--text-secondary);">
                                    <span>Métrica</span>
                                    <span>Guía</span>
                                    <span>Planta (Real)</span>
                                    <span>Diferencia</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                                    <span style="font-weight: 500; color: var(--text-secondary);">Jabas:</span>
                                    <span id="val-comparison-jabas-guia" style="font-weight: 600;">0</span>
                                    <span id="val-rec-jabas-total" style="font-weight: 600; color: var(--color-secundario);">0</span>
                                    <span id="val-comparison-jabas-diff" style="font-weight: 700; color: var(--text-secondary);">0</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                                    <span style="font-weight: 500; color: var(--text-secondary);">Peso Neto:</span>
                                    <span id="val-comparison-peso-guia" style="font-weight: 600;">0.0 Kg</span>
                                    <span id="val-rec-neto-total" style="font-weight: 600; color: #3b82f6;">0.0 Kg</span>
                                    <span id="val-comparison-peso-diff" style="font-weight: 700; color: var(--text-secondary);">0.0 Kg</span>
                                </div>
                            </div>
                        </div>

                        <!-- Sección de Transporte y Origen -->
                        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 12px; margin-top:15px;">
                            <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-top:0; margin-bottom:10px; display:flex; align-items:center; gap:6px;">🚚 Datos de Origen y Transporte (Opcional)</h3>
                            
                            <div class="form-group" style="margin-bottom:10px;">
                                <label class="form-label" style="font-size:0.75rem;" for="rec-punto-partida">Punto de Partida (Origen)</label>
                                <input type="text" id="rec-punto-partida" class="form-input" placeholder="Ej: Caserio Las Mercedes, Tambogrande, Piura" style="font-size: 0.8rem; padding: 6px 10px;">
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 10px;">
                                <div class="form-group">
                                    <label class="form-label" style="font-size:0.75rem;" for="rec-placa">Placa Vehículo</label>
                                    <input type="text" id="rec-placa" class="form-input" placeholder="Ej: BFH840" style="font-size: 0.8rem; padding: 6px 10px;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size:0.75rem;" for="rec-chofer">Nombre del Chofer</label>
                                    <input type="text" id="rec-chofer" class="form-input" placeholder="Ej: Mario Ramírez" style="font-size: 0.8rem; padding: 6px 10px;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size:0.75rem;" for="rec-precintos">Precintos</label>
                                    <input type="text" id="rec-precintos" class="form-input" placeholder="Ej: PF02489-PF02490" style="font-size: 0.8rem; padding: 6px 10px;">
                                </div>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom:15px; margin-top: 15px;">
                            <label class="form-label" for="rec-obs">Observaciones / Detalles</label>
                            <textarea id="rec-obs" class="form-input" placeholder="Ej: Envases correctos, chofer autorizado..." rows="2"></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width:100%; font-weight: 700;">💾 Guardar Recepción</button>
                    </form>
                </div>
            </div>

            <!-- Tab Panel 3: Historial de Guías -->
            <div class="rec-tab-panel" id="rec-tab-panel-historial" style="display: none;">
                <div class="card" style="display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                        <h2 class="card-title" style="margin:0;">📋 Historial de Ingresos de MP</h2>
                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <input type="text" id="rec-historial-search" class="form-input" placeholder="🔍 Buscar por Batch, Guía, Agricultor..." style="font-size:0.75rem; padding:4px 8px; width:220px;">
                            
                            <select id="rec-historial-empresa" class="form-select" style="font-size:0.75rem; padding:4px 8px; width:150px; background:var(--color-fondo);">
                                <option value="">Todas las Empresas</option>
                                ${window.utils.optionsHTML('empresas')}
                            </select>
                            
                            <select id="rec-historial-estado" class="form-select" style="font-size:0.75rem; padding:4px 8px; width:140px; background:var(--color-fondo);">
                                <option value="">Todos los Estados</option>
                                <option value="RECEPCIONADO">RECEPCIONADO</option>
                                <option value="APROBADO">APROBADO</option>
                                <option value="RECHAZADO">RECHAZADO</option>
                            </select>

                            <button id="btn-rec-exportar-excel" class="btn" style="font-size:0.75rem; padding:6px 12px; font-weight:700; display:flex; align-items:center; gap:6px; background:var(--color-exito); color:#ffffff; border:1px solid var(--color-exito); cursor:pointer; border-radius:var(--radio-control); transition: opacity 0.2s;">
                                💚 Exportar Excel
                            </button>
                        </div>
                    </div>

                    <div class="table-container" style="flex:1; overflow-y:auto; max-height:550px;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Lote (Batch)</th>
                                    <th>Número de Guía</th>
                                    <th style="text-align:right;">Kg Totales</th>
                                    <th style="text-align:right;">Jabas Totales</th>
                                    <th style="text-align:right;">Kg Prom. Jaba</th>
                                    <th style="text-align:center;">Estado</th>
                                    <th style="text-align:center;">Calidad</th>
                                    <th style="text-align:right;">% Desviación</th>
                                    <th style="text-align:center;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="table-recepcion-body">
                                <!-- Loaded dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- QR Scanner Modal -->
            <div id="qr-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px);">
                <div class="card" style="width: 100%; max-width: 420px; background: #1e293b; border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-premium);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                        <h3 style="margin: 0; font-size:1.1rem; color: #fff; font-weight:700; display:flex; align-items:center; gap:6px;">📷 <span>Escaneo de Guía / QR</span></h3>
                        <button type="button" id="btn-close-qr-modal" style="background:transparent; border:none; color:var(--text-secondary); cursor:pointer; font-size:1.2rem;">✖</button>
                    </div>
                    
                    <div id="reader" style="width: 100%; background: #0f172a; border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 15px; min-height: 250px;"></div>
                    
                    <div style="border-top: 1px dashed var(--border-color); padding-top: 15px;">
                        <label class="form-label" style="font-size:0.75rem; color:var(--text-secondary);">Simulador de Lectura QR:</label>
                        <div style="display:flex; gap:8px; margin-top:5px;">
                            <input type="text" id="sim-qr-data" class="form-input" placeholder="ej: GR-001-12345..." style="font-size: 0.8rem; padding:6px 10px;">
                            <button type="button" id="btn-sim-scan" class="btn btn-primary btn-sm" style="padding:4px 12px; font-size:0.8rem;">Leer</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Tab switching logic
        const tabButtons = document.querySelectorAll('[data-rec-tab]');
        const tabPanels = document.querySelectorAll('.rec-tab-panel');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-rec-tab');
                this.currentTab = targetTab;
                
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                tabPanels.forEach(panel => {
                    if (panel.id === `rec-tab-panel-${targetTab}`) {
                        panel.style.display = 'block';
                    } else {
                        panel.style.display = 'none';
                    }
                });

                this.refreshData();
            });
        });

        // History List Event Delegation
        const recepcionTbody = document.getElementById('table-recepcion-body');
        if (recepcionTbody) {
            recepcionTbody.addEventListener('click', (e) => {
                const btnEdit = e.target.closest('.edit-rec');
                const btnPrint = e.target.closest('.print-rec');
                const btnDel = e.target.closest('.del-rec');
                
                if (btnEdit) {
                    const id = btnEdit.getAttribute('data-id');
                    const item = window.db.getById('recepcion_mp', id);
                    if (item) this.openEditModal(item);
                } else if (btnPrint) {
                    const id = btnPrint.getAttribute('data-id');
                    this.printTicket(id);
                } else if (btnDel) {
                    const id = btnDel.getAttribute('data-id');
                    const rec = window.db.getById('recepcion_mp', id);
                    if (rec) {
                        const hasQualityEval = rec.estado !== 'RECEPCIONADO';
                        const calibrados = window.db.getAll('calibrados_mp') || [];
                        const inCalibrado = calibrados.some(c => c.lote_materia_prima === rec.lote_materia_prima);

                        if (hasQualityEval || inCalibrado) {
                            alert(`❌ No se puede eliminar el Lote ${rec.lote_materia_prima} porque ya cuenta con evaluaciones de Calidad o registros en el módulo de Calibrado.`);
                            return;
                        }

                        if (confirm(`¿Estás seguro de eliminar este registro de recepción? Se eliminará el lote ${rec.lote_materia_prima} permanentemente.`)) {
                            window.db.delete('recepcion_mp', id);
                            this.refreshData();
                        }
                    }
                }
            });
        }

        // Historial triggers
        document.getElementById('rec-historial-search').addEventListener('input', () => this.refreshHistoryTable());
        document.getElementById('rec-historial-empresa').addEventListener('change', () => this.refreshHistoryTable());
        document.getElementById('rec-historial-estado').addEventListener('change', () => this.refreshHistoryTable());

        // Excel Export Trigger
        const btnExport = document.getElementById('btn-rec-exportar-excel');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportHistoryToExcel());
        }

        // Database changes trigger UI updates
        document.addEventListener('db-changed', (e) => {
            if (e.detail && e.detail.key === 'recepcion_mp') {
                this.refreshData();
            }
        });

        // Registration: Tipo de Ingreso Change
        const tipoIngresoSelect = document.getElementById('rec-tipo-ingreso');
        const empresaSelect = document.getElementById('rec-empresa');
        if (tipoIngresoSelect && empresaSelect) {
            tipoIngresoSelect.addEventListener('change', () => {
                const val = tipoIngresoSelect.value;
                if (val === 'propia') {
                    empresaSelect.value = 'EXP001'; // Pachamama
                    empresaSelect.setAttribute('disabled', 'disabled');
                } else {
                    empresaSelect.removeAttribute('disabled');
                    if (empresaSelect.value === 'EXP001') {
                        empresaSelect.value = 'EXP002'; // Default maquila to Camposol
                    }
                }
                this.updateBatchCodePreview();
            });
            // Initial load config
            tipoIngresoSelect.dispatchEvent(new Event('change'));
        }

        // Trigger batch update when date changes
        const dateInput = document.getElementById('rec-fecha');
        dateInput.value = this.getLocalDateStr();
        dateInput.addEventListener('change', () => this.updateBatchCodePreview());

        if (empresaSelect) {
            empresaSelect.addEventListener('change', () => this.updateBatchCodePreview());
        }

        // Auto-populate CLP code when provider changes
        const proveedorSelect = document.getElementById('rec-proveedor');
        const clpInput = document.getElementById('rec-clp');
        if (proveedorSelect && clpInput) {
            proveedorSelect.addEventListener('change', () => {
                const provId = proveedorSelect.value;
                const prov = window.db.getById('proveedores_mp', provId);
                clpInput.value = prov && prov.clp ? prov.clp : '';
            });
            // Trigger once initially to populate default selection
            proveedorSelect.dispatchEvent(new Event('change'));
        }

        // Set default time
        document.getElementById('rec-hora').value = new Date().toTimeString().slice(0, 5);

        // OCR file upload simulation
        const fileInput = document.getElementById('rec-upload-guia');
        const ocrStatus = document.getElementById('ocr-loading-status');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (ocrStatus) ocrStatus.style.display = 'block';

                setTimeout(() => {
                    const fechaInput = document.getElementById('rec-fecha');
                    if (fechaInput) {
                        fechaInput.value = "2026-03-24";
                        fechaInput.dispatchEvent(new Event('change'));
                    }
                    
                    const horaInput = document.getElementById('rec-hora');
                    if (horaInput) {
                        horaInput.value = "13:31";
                        horaInput.dispatchEvent(new Event('change'));
                    }
                    
                    const tipo = document.getElementById('rec-tipo-ingreso');
                    if (tipo) {
                        tipo.value = "propia";
                        tipo.dispatchEvent(new Event('change'));
                    }
                    
                    const guiaInput = document.getElementById('rec-guia');
                    if (guiaInput) {
                        guiaInput.value = "T002-13123";
                        guiaInput.dispatchEvent(new Event('change'));
                    }
                    
                    const provSelect = document.getElementById('rec-proveedor');
                    if (provSelect) {
                        // Dynamically find option containing 'MERCEDES' to avoid ID mismatches
                        const options = Array.from(provSelect.options);
                        const mercedesOpt = options.find(opt => opt.text.toUpperCase().includes('MERCEDES'));
                        if (mercedesOpt) {
                            provSelect.value = mercedesOpt.value;
                        } else if (provSelect.options.length > 0) {
                            provSelect.selectedIndex = 0;
                        }
                        provSelect.dispatchEvent(new Event('change'));
                    }
                    
                    const varSelect = document.getElementById('rec-variedad');
                    if (varSelect) {
                        // Dynamically find option containing 'KENT' to avoid ID mismatches
                        const options = Array.from(varSelect.options);
                        const kentOpt = options.find(opt => opt.text.toUpperCase().includes('KENT'));
                        if (kentOpt) {
                            varSelect.value = kentOpt.value;
                        } else if (varSelect.options.length > 0) {
                            varSelect.selectedIndex = 0;
                        }
                        varSelect.dispatchEvent(new Event('change'));
                    }

                    const jabasInput = document.getElementById('rec-jabas-guia');
                    if (jabasInput) {
                        jabasInput.value = 1000;
                        jabasInput.dispatchEvent(new Event('input'));
                    }
                    
                    const pesoInput = document.getElementById('rec-peso-guia');
                    if (pesoInput) {
                        pesoInput.value = 19350;
                        pesoInput.dispatchEvent(new Event('input'));
                    }
                    
                    const partidaInput = document.getElementById('rec-punto-partida');
                    if (partidaInput) {
                        partidaInput.value = "Caserio Las Mercedes, Tambogrande, Piura";
                        partidaInput.dispatchEvent(new Event('input'));
                    }
                    
                    const placaInput = document.getElementById('rec-placa');
                    if (placaInput) {
                        placaInput.value = "BFH840";
                        placaInput.dispatchEvent(new Event('input'));
                    }
                    
                    const choferInput = document.getElementById('rec-chofer');
                    if (choferInput) {
                        choferInput.value = "MARIO CESAR RAMIREZ CHAVEZ";
                        choferInput.dispatchEvent(new Event('input'));
                    }
                    
                    const precintosInput = document.getElementById('rec-precintos');
                    if (precintosInput) {
                        precintosInput.value = "PF02489-PF02490";
                        precintosInput.dispatchEvent(new Event('input'));
                    }
                    
                    const obsInput = document.getElementById('rec-obs');
                    if (obsInput) {
                        obsInput.value = "Guía cargada vía OCR. Datos completados de origen y conductor.";
                        obsInput.dispatchEvent(new Event('input'));
                    }

                    this.updateBatchCodePreview();
                    this.updateComparisonUI();

                    if (ocrStatus) ocrStatus.style.display = 'none';
                    alert(`✅ Guía "${file.name}" analizada con éxito por OCR.\nSe completaron automáticamente los datos.`);
                }, 1200);
            });
        }

        // Live calculation of weights for guide comparison
        const inputJabasGuia = document.getElementById('rec-jabas-guia');
        const inputPesoGuia = document.getElementById('rec-peso-guia');
        if (inputJabasGuia) inputJabasGuia.addEventListener('input', () => this.updateComparisonUI());
        if (inputPesoGuia) inputPesoGuia.addEventListener('input', () => this.updateComparisonUI());

        // Live calculation for Pallets block
        const inputPalJabas = document.getElementById('pal-jabas');
        const inputPalPesoBruto = document.getElementById('pal-peso-bruto');
        const inputPalTareTarima = document.getElementById('pal-tare-tarima');
        const inputPalTareJaba = document.getElementById('pal-tare-jaba');
        const inputPalPesoNeto = document.getElementById('pal-peso');
        const inputPalAvg = document.getElementById('pal-avg');

        const calculatePalletNeto = () => {
            const jabas = parseInt(inputPalJabas.value) || 0;
            const bruto = parseFloat(inputPalPesoBruto.value) || 0;
            const tareTarima = parseFloat(inputPalTareTarima.value) || 0;
            const tareJaba = parseFloat(inputPalTareJaba.value) || 0;

            const totalTare = tareTarima + (jabas * tareJaba);
            const neto = Math.max(0, bruto - totalTare);

            inputPalPesoNeto.value = bruto > 0 ? neto.toFixed(2) : '';
            const avg = (jabas > 0 && neto > 0) ? (neto / jabas) : 0;
            inputPalAvg.value = avg > 0 ? `${avg.toFixed(2)} Kg/jb` : '';
        };

        inputPalJabas.addEventListener('input', calculatePalletNeto);
        if (inputPalPesoBruto) inputPalPesoBruto.addEventListener('input', calculatePalletNeto);
        if (inputPalTareTarima) inputPalTareTarima.addEventListener('input', calculatePalletNeto);
        if (inputPalTareJaba) inputPalTareJaba.addEventListener('input', calculatePalletNeto);

        const selectTarimaTipo = document.getElementById('pal-select-tarima-tipo');
        const selectEnvaseTipo = document.getElementById('pal-select-envase-tipo');
        const containerTareTarima = document.getElementById('pal-tare-tarima-container');
        const containerTareJaba = document.getElementById('pal-tare-jaba-container');

        if (selectTarimaTipo) {
            selectTarimaTipo.addEventListener('change', () => {
                const val = selectTarimaTipo.value;
                if (val === 'custom') {
                    if (containerTareTarima) containerTareTarima.style.display = 'block';
                } else {
                    if (containerTareTarima) containerTareTarima.style.display = 'none';
                    if (inputPalTareTarima) inputPalTareTarima.value = parseFloat(val);
                }
                calculatePalletNeto();
            });
        }

        if (selectEnvaseTipo) {
            selectEnvaseTipo.addEventListener('change', () => {
                const val = selectEnvaseTipo.value;
                if (val === 'custom') {
                    if (containerTareJaba) containerTareJaba.style.display = 'block';
                } else {
                    if (containerTareJaba) containerTareJaba.style.display = 'none';
                    if (inputPalTareJaba) inputPalTareJaba.value = parseFloat(val);
                }
                calculatePalletNeto();
            });
        }

        // Add Pallet Button
        document.getElementById('btn-add-tarima').addEventListener('click', () => {
            const jabas = parseInt(inputPalJabas.value) || 0;
            const bruto = parseFloat(inputPalPesoBruto.value) || 0;
            const tareTarima = parseFloat(inputPalTareTarima.value) || 0;
            const tareJaba = parseFloat(inputPalTareJaba.value) || 0;
            const neto = parseFloat(inputPalPesoNeto.value) || 0;

            if (jabas <= 0 || bruto <= 0 || neto <= 0) {
                alert("Por favor ingrese cantidad de jabas, peso bruto y configuraciones de tara válidos.");
                return;
            }

            const envaseSelect = document.getElementById('pal-select-envase-tipo');
            let tipoEnvase = "CANASTILLA";
            if (envaseSelect) {
                if (envaseSelect.value === "1.7") tipoEnvase = "JABA";
                else if (envaseSelect.value === "custom") {
                    tipoEnvase = tareJaba >= 1.2 ? "JABA" : "CANASTILLA";
                }
            }

            this.currentTarimas.push({
                id: Date.now() + Math.random(),
                cant_jabas: jabas,
                peso_bruto: bruto,
                tara_tarima: tareTarima,
                tara_jabas: jabas * tareJaba,
                peso_neto: neto,
                peso_promedio: neto / jabas,
                tipo_envase: tipoEnvase
            });

            inputPalJabas.value = '';
            inputPalPesoBruto.value = '';
            inputPalPesoNeto.value = '';
            inputPalAvg.value = '';

            this.renderTarimasTable();
        });

        // Form Submit
        const mainForm = document.getElementById('form-recepcion-guia');
        if (mainForm) {
            mainForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleGuideSubmit();
            });
        }

        // QR Modal Controls
        const qrModal = document.getElementById('qr-modal');
        const btnScan = document.getElementById('btn-scan-qr');
        const btnClose = document.getElementById('btn-close-qr-modal');
        const btnSimScan = document.getElementById('btn-sim-scan');
        const simQrData = document.getElementById('sim-qr-data');
        let qrScanner = null;

        const startScanner = () => {
            if (typeof Html5Qrcode === 'undefined') {
                console.warn("Html5Qrcode library not loaded yet.");
                return;
            }
            qrScanner = new Html5Qrcode("reader");
            qrScanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    stopScanner();
                    document.getElementById('rec-guia').value = decodedText;
                    qrModal.style.display = 'none';
                },
                () => {}
            ).catch(() => {});
        };

        const stopScanner = () => {
            if (qrScanner) {
                qrScanner.stop().then(() => {
                    qrScanner = null;
                }).catch(() => {});
            }
        };

        if (btnScan && qrModal) {
            btnScan.addEventListener('click', () => {
                qrModal.style.display = 'flex';
                startScanner();
            });
        }

        if (btnClose) {
            btnClose.addEventListener('click', () => {
                stopScanner();
                qrModal.style.display = 'none';
            });
        }

        if (btnSimScan && simQrData) {
            btnSimScan.addEventListener('click', () => {
                const text = simQrData.value.trim();
                if (text) {
                    stopScanner();
                    document.getElementById('rec-guia').value = text;
                    qrModal.style.display = 'none';
                    simQrData.value = '';
                }
            });
        }
    },

    updateBatchCodePreview() {
        const fecha = document.getElementById('rec-fecha').value;
        const empresaId = document.getElementById('rec-empresa').value;
        const tipoIngreso = document.getElementById('rec-tipo-ingreso').value;
        const batch = this.generateLotCode(fecha, empresaId, tipoIngreso);
        
        const preview = document.getElementById('rec-lote-preview');
        if (preview) {
            preview.value = batch;
        }
    },

    getCompanyCode(empresaId, empresaNombre) {
        const name = (empresaNombre || '').toUpperCase();
        if (name.includes('PACHAMAMA')) return 'PP';
        if (name.includes('CAMPOSOL')) return 'CA';
        if (name.includes('AGROFRUTOS')) return 'AG';
        if (name.includes('FRUIT')) return 'FC';
        if (name.includes('MERCEDES')) return 'LM';
        if (name.includes('WESFALIA') || name.includes('WESTFALIA')) return 'WE';
        
        const cleaned = name.replace(/[^A-Z]/g, '');
        return cleaned.substring(0, 2) || 'XX';
    },

    generateLotCode(dateStr, empresaId, tipoIngreso) {
        if (!dateStr || !empresaId) return '';
        
        const date = new Date(dateStr + 'T00:00:00');
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11 (0=Ene, 7=Ago, 8=Sep)
        
        let startYear, endYear;
        if (month >= 8) { // Campaña inicia en Septiembre (Mes 8)
            startYear = year;
            endYear = year + 1;
        } else { // Enero a Agosto pertenece a la campaña que termina este año
            startYear = year - 1;
            endYear = year;
        }
        
        const shortYear1 = String(startYear).substring(2, 4);
        const shortYear2 = String(endYear).substring(2, 4);
        const campaignCode = `${shortYear1}${shortYear2}`; // e.g. "2526" or "2627"

        let companyCode = 'PP';
        if (tipoIngreso === 'maquila') {
            const empresa = window.db.getById('empresas', empresaId);
            companyCode = this.getCompanyCode(empresaId, empresa ? empresa.nombre : '');
        } else {
            companyCode = 'PP';
        }

        const prefix = `${campaignCode}${companyCode}`; // e.g. "2627PP" or "2627CA"

        const list = window.db.getAll('recepcion_mp');
        let maxSeq = 0;
        
        list.forEach(item => {
            const lote = item.lote_materia_prima;
            if (lote && lote.startsWith(prefix) && lote.length === 10) {
                const seqStr = lote.replace(prefix, ''); // e.g. "0001"
                const seq = parseInt(seqStr, 10);
                if (!isNaN(seq) && seq > maxSeq) {
                    maxSeq = seq;
                }
            }
        });

        const nextNum = maxSeq + 1;
        const paddedNum = String(nextNum).padStart(4, '0'); // e.g. "0001"
        return `${prefix}${paddedNum}`; // e.g. "2627PP0001" or "2627MQ0001"
    },

    renderTarimasTable() {
        const tbody = document.getElementById('list-tarimas-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.currentTarimas.forEach((t, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 6px 8px; font-weight:700;">Parihuela ${idx + 1}</td>
                <td style="padding: 6px 8px; text-align: right;">${t.cant_jabas}</td>
                <td style="padding: 6px 8px; text-align: right;">${t.peso_bruto.toFixed(1)} Kg</td>
                <td style="padding: 6px 8px; text-align: right; font-weight:700; color:var(--color-secundario);">${t.peso_neto.toFixed(1)} Kg</td>
                <td style="padding: 6px 8px; text-align: right; color:var(--text-muted);">${t.peso_promedio.toFixed(2)} Kg/jb</td>
                <td style="padding: 6px 8px; text-align: center;">
                    <button type="button" class="btn btn-danger btn-sm del-tarima-row" data-id="${t.id}" style="padding:2px 6px; font-size:0.65rem;">✖</button>
                </td>
            `;

            tr.querySelector('.del-tarima-row').addEventListener('click', (e) => {
                const rowId = parseFloat(e.currentTarget.dataset.id);
                this.currentTarimas = this.currentTarimas.filter(tRow => tRow.id !== rowId);
                this.renderTarimasTable();
            });

            tbody.appendChild(tr);
        });

        this.updateComparisonUI();
    },

    updateComparisonUI() {
        const inputJabas = document.getElementById('rec-jabas-guia');
        const inputPeso = document.getElementById('rec-peso-guia');

        const jabasGuia = parseInt(inputJabas?.value) || 0;
        const pesoGuia = parseFloat(inputPeso?.value) || 0;

        let totalJabas = 0;
        let totalNeto = 0;
        this.currentTarimas.forEach(t => {
            totalJabas += t.cant_jabas;
            totalNeto += t.peso_neto;
        });

        const valJabasGuia = document.getElementById('val-comparison-jabas-guia');
        const valJabasTotal = document.getElementById('val-rec-jabas-total');
        const valJabasDiff = document.getElementById('val-comparison-jabas-diff');

        const valPesoGuia = document.getElementById('val-comparison-peso-guia');
        const valPesoTotal = document.getElementById('val-rec-neto-total');
        const valPesoDiff = document.getElementById('val-comparison-peso-diff');

        if (valJabasGuia) valJabasGuia.innerText = jabasGuia;
        if (valJabasTotal) valJabasTotal.innerText = totalJabas;
        if (valJabasDiff) {
            const diff = totalJabas - jabasGuia;
            valJabasDiff.innerText = diff > 0 ? `+${diff}` : diff;
            valJabasDiff.style.color = diff === 0 ? 'var(--text-secondary)' : (diff < 0 ? 'var(--color-alerta)' : 'var(--color-exito)');
        }

        if (valPesoGuia) valPesoGuia.innerText = `${pesoGuia.toFixed(1)} Kg`;
        if (valPesoTotal) valPesoTotal.innerText = `${totalNeto.toFixed(1)} Kg`;
        if (valPesoDiff) {
            const diff = totalNeto - pesoGuia;
            valPesoDiff.innerText = `${diff > 0 ? '+' : ''}${diff.toFixed(1)} Kg`;
            valPesoDiff.style.color = Math.abs(diff) <= 50 ? 'var(--text-secondary)' : (diff < 0 ? 'var(--color-alerta)' : 'var(--color-exito)');
        }
    },

    refreshData() {
        this.refreshKPIs();
        this.refreshHistoryTable();
    },

    refreshKPIs() {
        const list = window.db.getAll('recepcion_mp');
        
        // Date filters logic
        const filtered = this.getFilteredRecords(list);
        
        let sumKg = 0;
        let sumJabas = 0;
        let batchCodes = new Set();
        let guiasCount = filtered.length;
        let propias = 0;
        let maquila = 0;

        filtered.forEach(item => {
            sumKg += item.peso_neto || 0;
            sumJabas += item.cant_jabas || 0;
            if (item.lote_materia_prima) batchCodes.add(item.lote_materia_prima);
            
            if (item.tipo_ingreso === 'propia' || item.empresa_id === 'EXP001') {
                propias++;
            } else {
                maquila++;
            }
        });

        const promKg = guiasCount > 0 ? (sumKg / guiasCount) : 0;
        const promJaba = sumJabas > 0 ? (sumKg / sumJabas) : 0;

        document.getElementById('kpi-rec-guias').innerText = guiasCount;
        document.getElementById('kpi-rec-kg').innerText = `${sumKg.toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Kg`;
        document.getElementById('kpi-rec-jabas').innerText = sumJabas;
        document.getElementById('kpi-rec-batches').innerText = batchCodes.size;
        
        document.getElementById('kpi-rec-propias').innerText = propias;
        document.getElementById('kpi-rec-maquila').innerText = maquila;
        document.getElementById('kpi-rec-promedio').innerText = `${promKg.toFixed(1)} Kg`;
        
        const elPromJaba = document.getElementById('kpi-rec-promedio-jaba');
        if (elPromJaba) {
            elPromJaba.innerText = `${promJaba.toFixed(2)} Kg`;
        }

        // Latest reception details
        const latestDetailBox = document.getElementById('kpi-rec-latest-detail');
        if (latestDetailBox) {
            if (filtered.length > 0) {
                // sort by date & time or id descending
                const sorted = [...filtered].sort((a,b) => {
                    const dtA = `${a.fecha}T${a.hora}`;
                    const dtB = `${b.fecha}T${b.hora}`;
                    return dtB.localeCompare(dtA);
                });
                const latest = sorted[0];
                const empName = window.db.getById('empresas', latest.empresa_id)?.nombre || 'PACHAMAMA';
                const provName = window.db.getById('proveedores_mp', latest.proveedor_id)?.nombre || 'N/A';
                const latestPromJaba = latest.cant_jabas > 0 ? (latest.peso_neto / latest.cant_jabas) : 0;
                
                latestDetailBox.innerHTML = `
                    Lote/Batch: <strong style="color:var(--color-primario); font-family:monospace;">${latest.lote_materia_prima}</strong> | 
                    Guía: <strong>${latest.guia_remision}</strong> | 
                    Exportador: <strong>${empName}</strong> <br>
                    Proveedor: <strong>${provName}</strong> | 
                    Peso Neto Real: <strong>${latest.peso_neto.toFixed(1)} Kg</strong> (${latest.cant_jabas} jabas) | 
                    Peso Prom. Jaba: <strong>${latestPromJaba.toFixed(2)} Kg/jaba</strong> <br>
                    Fecha/Hora: <strong>${latest.fecha} ${latest.hora}</strong>
                `;
            } else {
                latestDetailBox.innerHTML = `<span style="font-style:italic; color:var(--text-secondary);">Ninguna recepción registrada en el rango de fechas seleccionado.</span>`;
            }
        }

        // Render Chart.js charts for Reception
        if (window.Chart) {
            if (this.chartInstances && this.chartInstances.recExportadores) {
                this.chartInstances.recExportadores.destroy();
            }
            if (this.chartInstances && this.chartInstances.recVariedades) {
                this.chartInstances.recVariedades.destroy();
            }
            this.chartInstances = this.chartInstances || {};

            // 1. Group by Exporter
            const clientWeight = {};
            filtered.forEach(r => {
                const empName = window.db.getById('empresas', r.empresa_id)?.nombre || 'PACHAMAMA';
                clientWeight[empName] = (clientWeight[empName] || 0) + r.peso_neto;
            });

            const ctxExp = document.getElementById('chart-rec-exportadores');
            if (ctxExp) {
                this.chartInstances.recExportadores = new Chart(ctxExp, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(clientWeight),
                        datasets: [{
                            label: 'Kg Recibidos',
                            data: Object.values(clientWeight),
                            backgroundColor: '#FFA33C',
                            borderColor: '#2B1E10',
                            borderWidth: 1,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: { color: 'rgba(107, 97, 83, 0.1)' },
                                ticks: { color: '#2B1E10', font: { family: 'IBM Plex Sans', size: 9 } }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: '#2B1E10', font: { family: 'IBM Plex Sans', size: 9 } }
                            }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            }

            // 2. Group by Variety
            const varietyWeight = {};
            filtered.forEach(r => {
                const varName = window.db.getById('variedades', r.variedad_id)?.nombre || 'N/A';
                varietyWeight[varName] = (varietyWeight[varName] || 0) + r.peso_neto;
            });

            const ctxVar = document.getElementById('chart-rec-variedades');
            if (ctxVar) {
                this.chartInstances.recVariedades = new Chart(ctxVar, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(varietyWeight),
                        datasets: [{
                            data: Object.values(varietyWeight),
                            backgroundColor: ['#8BAE3C', '#FFA33C', '#B23A1D', '#6B6153'],
                            borderColor: '#ffffff',
                            borderWidth: 1.5
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: { color: '#2B1E10', font: { family: 'IBM Plex Sans', size: 10 } }
                            }
                        },
                        cutout: '50%'
                    }
                });
            }
        }
    },

    getFilteredRecords(records) {
        return this.filterComponent ? this.filterComponent.filter(records, 'fecha') : records;
    },

    refreshHistoryTable() {
        const tbody = document.getElementById('table-recepcion-body');
        if (!tbody) return;

        const list = window.db.getAll('recepcion_mp');
        const searchQuery = (document.getElementById('rec-historial-search').value || '').toLowerCase().trim();
        const empresaFilter = document.getElementById('rec-historial-empresa').value;
        const estadoFilter = document.getElementById('rec-historial-estado').value;

        let filtered = this.getFilteredRecords(list);

        // Apply filters
        if (searchQuery) {
            filtered = filtered.filter(item => {
                const provName = window.db.getById('proveedores_mp', item.proveedor_id)?.nombre || '';
                return (item.lote_materia_prima || '').toLowerCase().includes(searchQuery) ||
                       (item.guia_remision || '').toLowerCase().includes(searchQuery) ||
                       provName.toLowerCase().includes(searchQuery);
            });
        }

        if (empresaFilter) {
            filtered = filtered.filter(item => item.empresa_id === empresaFilter);
        }

        if (estadoFilter) {
            filtered = filtered.filter(item => item.estado === estadoFilter);
        }

        tbody.innerHTML = '';

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:20px; color:var(--text-secondary); font-style:italic;">
                        No se encontraron registros de recepción.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            
            let statusLabel = '<span class="badge" style="background:#64748b; color:#fff;">RECEPCIONADO</span>';
            if (item.estado === 'APROBADO') {
                statusLabel = '<span class="badge badge-success" style="background:var(--color-exito-fondo); color:var(--color-exito-texto);">APROBADO</span>';
            } else if (item.estado === 'RECHAZADO') {
                statusLabel = '<span class="badge badge-danger" style="background:var(--color-alerta-fondo); color:var(--color-alerta-texto);">RECHAZADO</span>';
            }

            // Quality column: displays ✔ when evaluated by both Quality and SENASA, ✖ when pending.
            const isEvaluated = item.senasa_aprobado !== undefined && item.senasa_aprobado !== null;
            const qualitySymbol = isEvaluated 
                ? '<span style="color:var(--color-exito); font-size:1.1rem; font-weight:bold;">✔</span>' 
                : '<span style="color:var(--color-alerta); font-size:1.1rem; font-weight:bold;">✖</span>';

            const desvPct = item.peso_guia > 0 ? (((item.peso_neto - item.peso_guia) / item.peso_guia) * 100) : 0;
            const promJaba = item.cant_jabas > 0 ? (item.peso_neto / item.cant_jabas) : 0;

            tr.innerHTML = `
                <td style="font-weight:700; color:var(--color-primario); font-family:monospace;">${item.lote_materia_prima}</td>
                <td>${item.guia_remision}</td>
                <td style="text-align:right; font-weight:700;">${item.peso_neto.toFixed(1)} Kg</td>
                <td style="text-align:right;">${item.cant_jabas}</td>
                <td style="text-align:right; font-weight:600; color:var(--accent-blue);">${promJaba.toFixed(2)} Kg</td>
                <td style="text-align:center;">${statusLabel}</td>
                <td style="text-align:center;">${qualitySymbol}</td>
                <td style="text-align:right; color:${desvPct < 0 ? 'var(--color-alerta)' : 'var(--color-exito)'}; font-weight:700;">
                    ${desvPct > 0 ? '+' : ''}${desvPct.toFixed(2)} %
                </td>
                <td style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-secondary btn-sm edit-rec" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem; margin-right:4px;">✏️ Modificar</button>
                    <button class="btn btn-secondary btn-sm print-rec" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem; margin-right:4px;">🖨️ Ticket</button>
                    <button class="btn btn-danger btn-sm del-rec" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem;">✖</button>
                </td>
            `;

            tbody.appendChild(tr);
        });
    },

    async handleGuideSubmit() {
        try {
            const tipo_ingreso = document.getElementById('rec-tipo-ingreso').value;
            const fecha = document.getElementById('rec-fecha').value;
            const hora = document.getElementById('rec-hora').value;
            const empresa_id = document.getElementById('rec-empresa').value;
            const guia = document.getElementById('rec-guia').value.trim();
            const variedad_id = document.getElementById('rec-variedad').value;
            const proveedor_id = document.getElementById('rec-proveedor').value;
            
            const cant_jabas_guia = parseInt(document.getElementById('rec-jabas-guia').value) || 0;
            const peso_guia = parseFloat(document.getElementById('rec-peso-guia').value) || 0;

            const punto_partida = document.getElementById('rec-punto-partida').value;
            const placa = document.getElementById('rec-placa').value;
            const chofer = document.getElementById('rec-chofer').value;
            const precintos = document.getElementById('rec-precintos').value;
            const observaciones = document.getElementById('rec-obs').value.trim();

            if (!fecha || !hora || !guia || !proveedor_id || !variedad_id || cant_jabas_guia <= 0 || peso_guia <= 0) {
                alert("⚠️ Por favor rellenar todos los campos obligatorios del origen y de la guía.");
                return;
            }

            if (this.currentTarimas.length === 0) {
                alert("⚠️ Debe registrar al menos una parihuela (pallet) en el detalle de pesos.");
                return;
            }

            // Calculations
            let totalJabas = 0;
            let totalBruto = 0;
            let totalTara = 0;
            let totalNeto = 0;
            this.currentTarimas.forEach(t => {
                totalJabas += t.cant_jabas;
                totalBruto += t.peso_bruto;
                totalTara += (t.tara_tarima + t.tara_jabas);
                totalNeto += t.peso_neto;
            });

            // Duplicate Guide Check
            const list = window.db.getAll('recepcion_mp');
            const duplicateRecord = list.find(item => 
                item.empresa_id === empresa_id && 
                item.guia_remision && 
                item.guia_remision.trim().toUpperCase() === guia.trim().toUpperCase()
            );

            if (duplicateRecord) {
                const provName = window.db.getById('proveedores_mp', duplicateRecord.proveedor_id)?.nombre || 'N/A';
                alert(`⚠️ Error: La Guía de Remisión "${guia}" para la Empresa seleccionada ya se encuentra registrada en el sistema.

• Lote / Batch: ${duplicateRecord.lote_materia_prima}
• Fecha de Registro: ${duplicateRecord.fecha} a las ${duplicateRecord.hora}
• Proveedor: ${provName}

Si no la visualizas en la tabla del "Historial de Recepción", se debe a que está activa una fecha de filtro diferente en la barra superior (ej: "Hoy"). 

Por favor, cambia el rango de fechas a "Todos" o selecciona la fecha de registro correspondiente.`);
                return;
            }

            // Generate atomic code
            const batchCode = this.generateLotCode(fecha, empresa_id, tipo_ingreso);

            // Confirm summary
            const empName = window.db.getById('empresas', empresa_id)?.nombre || 'PACHAMAMA';
            const confirmationSummary = `
                📋 CONFIRMACIÓN DE RECEPCIÓN
                ----------------------------
                • Batch / Lote: ${batchCode}
                • Guía de Remisión: ${guia}
                • Empresa: ${empName}
                • Jabas Reales: ${totalJabas}
                • Peso Neto Real: ${totalNeto.toFixed(1)} Kg
                ----------------------------
                ¿Desea guardar esta recepción?
            `;

            if (!confirm(confirmationSummary.trim())) {
                return;
            }

            const clp = document.getElementById('rec-clp').value.trim();

            const record = {
                lote_materia_prima: batchCode,
                tipo_ingreso,
                empresa_id,
                guia_remision: guia,
                fecha,
                hora,
                variedad_id,
                proveedor_id,
                clp,
                punto_partida,
                placa,
                chofer,
                precintos,
                cant_jabas_guia,
                peso_guia,
                cant_jabas: totalJabas,
                peso_bruto: totalBruto,
                peso_tara: totalTara,
                peso_neto: totalNeto,
                diff_jabas: totalJabas - cant_jabas_guia,
                diff_peso: totalNeto - peso_guia,
                estado: 'RECEPCIONADO',
                senasa_aprobado: null,
                calidad_aprobada: null,
                tarimas: this.currentTarimas.map((t, idx) => ({
                    numero: idx + 1,
                    cant_jabas: t.cant_jabas,
                    peso_bruto: t.peso_bruto,
                    tara_tarima: t.tara_tarima,
                    tara_jabas: t.tara_jabas,
                    peso_neto: t.peso_neto,
                    peso_promedio: t.peso_promedio,
                    tipo_envase: t.tipo_envase
                })),
                observaciones
            };

            await window.db.insert('recepcion_mp', record);

            alert(`BATCH ${batchCode} FUE REGISTRADO CON EXITO\n\nRecepción registrada correctamente.\nBatch generado: ${batchCode}\n\nEl lote ya se encuentra disponible para evaluación en el módulo de Calidad.`);

            // Reset Form and reload
            this.clearRegistrationForm();
            this.refreshData();

            // Prompt if want new registration
            const wantNew = confirm("¿Deseas generar otro registro de recepción?");
            if (!wantNew) {
                // Navigate to History Tab
                const tabHistorial = document.querySelector('[data-rec-tab="historial"]');
                if (tabHistorial) tabHistorial.click();
            }
        } catch (error) {
            console.error("Error saving raw material receipt:", error);
            alert("❌ Ocurrió un error al guardar los datos: " + error.message);
        }
    },

    clearRegistrationForm() {
        this.currentTarimas = [];
        this.renderTarimasTable();
        
        document.getElementById('rec-guia').value = '';
        document.getElementById('rec-jabas-guia').value = '';
        document.getElementById('rec-peso-guia').value = '';
        document.getElementById('rec-punto-partida').value = '';
        document.getElementById('rec-placa').value = '';
        document.getElementById('rec-chofer').value = '';
        document.getElementById('rec-precintos').value = '';
        document.getElementById('rec-obs').value = '';

        const fileInput = document.getElementById('rec-upload-guia');
        if (fileInput) fileInput.value = '';

        const palJabas = document.getElementById('pal-jabas');
        const palPesoBruto = document.getElementById('pal-peso-bruto');
        const palPeso = document.getElementById('pal-peso');
        const palAvg = document.getElementById('pal-avg');
        if (palJabas) palJabas.value = '';
        if (palPesoBruto) palPesoBruto.value = '';
        if (palPeso) palPeso.value = '';
        if (palAvg) palAvg.value = '';

        const empresaSelect = document.getElementById('rec-empresa');
        if (empresaSelect) empresaSelect.selectedIndex = 0;

        const variedadSelect = document.getElementById('rec-variedad');
        if (variedadSelect) variedadSelect.selectedIndex = 0;

        const proveedorSelect = document.getElementById('rec-proveedor');
        if (proveedorSelect) {
            proveedorSelect.selectedIndex = 0;
            proveedorSelect.dispatchEvent(new Event('change'));
        }

        const tipoSelect = document.getElementById('rec-tipo-ingreso');
        if (tipoSelect) {
            tipoSelect.value = '';
            tipoSelect.dispatchEvent(new Event('change'));
        }

        const clpInput = document.getElementById('rec-clp');
        if (clpInput) clpInput.value = '';

        document.getElementById('rec-fecha').value = this.getLocalDateStr();
        document.getElementById('rec-hora').value = new Date().toTimeString().slice(0, 5);

        this.updateBatchCodePreview();
        this.updateComparisonUI();
    },

    openEditModal(item) {
        const hasTarimas = item.tarimas && item.tarimas.length > 0;

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(43, 30, 16, 0.4)'; // Warm dark brown overlay
        overlay.style.backdropFilter = 'blur(4px)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        const card = document.createElement('div');
        card.style.backgroundColor = '#ffffff'; // White background matching --bg-secondary
        card.style.border = '1.5px solid var(--color-borde)'; // Pachamama border
        card.style.borderRadius = 'var(--radio-tarjeta)';
        card.style.padding = '24px';
        card.style.maxWidth = hasTarimas ? '950px' : '550px';
        card.style.width = '95%';
        card.style.boxShadow = 'var(--shadow-premium)';
        card.style.color = 'var(--color-tinta)'; // Dark brown text
        card.style.fontFamily = 'var(--fuente-cuerpo)';

        const title = document.createElement('h3');
        title.innerHTML = `✏️ Modificar Lote Recepción <br><span style="font-size:0.95rem; font-weight:800; color:var(--color-primario); font-family:var(--fuente-codigo); margin-top:4px; display:inline-block; border-bottom:2px solid var(--color-primario); padding-bottom:2px;">Lote / Batch: ${item.lote_materia_prima}</span>`;
        title.style.margin = '0 0 15px 0';
        title.style.fontSize = '1.3rem';
        title.style.color = 'var(--color-tinta)';
        title.style.fontWeight = '800';
        title.style.fontFamily = 'var(--fuente-titulos)';
        card.appendChild(title);

        const formContainer = document.createElement('div');
        formContainer.style.display = 'flex';
        formContainer.style.flexDirection = 'column';
        formContainer.style.gap = '10px';

        // Retrieve names for reference only
        const provName = window.db.getById('proveedores_mp', item.proveedor_id)?.nombre || 'N/A';
        const empName = window.db.getById('empresas', item.empresa_id)?.nombre || 'N/A';

        if (hasTarimas) {
            formContainer.innerHTML = `
                <div style="font-size: 0.75rem; color: var(--color-tinta); background: var(--color-fondo); padding: 10px; border-radius: 8px; margin-bottom: 5px; border: 1px solid rgba(107, 97, 83, 0.3); line-height: 1.5;">
                    <strong>Guía de Origen:</strong> <span style="color:var(--color-primario); font-weight:700;">${item.guia_remision}</span> | <strong>Exportador:</strong> <span>${empName}</span> <br>
                    <strong>Proveedor:</strong> <span>${provName}</span> | <strong>Fecha:</strong> <span>${item.fecha}</span>
                </div>

                <div class="table-container" style="max-height: 280px; overflow-y: auto; border: 1px solid rgba(107, 97, 83, 0.3); border-radius: 8px; margin-bottom: 12px; background:#ffffff;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.75rem; text-align:left;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--color-borde); background:var(--color-fondo); color:var(--color-tinta); font-weight:700;">
                                <th style="padding:10px 10px;">Parihuela N°</th>
                                <th style="padding:10px 10px; width:110px; text-align:center;">Jabas</th>
                                <th style="padding:10px 10px; width:130px; text-align:right;">P. Bruto</th>
                                <th style="padding:10px 10px; text-align:right;">P. Neto</th>
                                <th style="padding:10px 10px; text-align:right;">Prom. Neto</th>
                                <th style="padding:10px 10px; text-align:center; width:80px;">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${item.tarimas.map((t, idx) => {
                                const unitJabaTara = t.cant_jabas > 0 ? (t.tara_jabas / t.cant_jabas) : 1.7;
                                return `
                                    <tr class="edit-tarima-row" data-id="${t.id}" data-tara-tarima="${t.tara_tarima}" data-tara-jaba-unit="${unitJabaTara}" style="border-bottom:1px solid rgba(107, 97, 83, 0.15);">
                                        <td style="padding:8px 10px; font-weight:700; color:var(--color-tinta);">Parihuela ${idx + 1}</td>
                                        <td style="padding:4px 6px; text-align:center;">
                                            <input type="number" class="form-input edit-tar-jabas" value="${t.cant_jabas}" min="1" style="width:70px; padding:6px 8px; font-size:0.75rem; text-align:center; background:#ffffff; border-color:var(--color-borde); color:var(--color-tinta); font-weight:700;">
                                        </td>
                                        <td style="padding:4px 6px; text-align:right;">
                                            <input type="number" class="form-input edit-tar-bruto" value="${t.peso_bruto}" min="0.1" step="0.1" style="width:100px; padding:4px 8px; font-size:0.75rem; text-align:right; font-weight:700; color:var(--color-tinta); background:#ffffff; border-color:var(--color-borde);">
                                        </td>
                                        <td style="padding:8px 10px; text-align:right; font-weight:700; color:var(--color-secundario);" class="edit-tar-neto-label">${t.peso_neto.toFixed(1)} Kg</td>
                                        <td style="padding:8px 10px; text-align:right; color:var(--text-muted);" class="edit-tar-avg-label">${t.peso_promedio.toFixed(2)} Kg/jb</td>
                                        <td style="padding:4px 6px; text-align:center;">
                                            <button type="button" class="btn btn-danger btn-sm del-edit-tarima-row" data-id="${t.id}" style="padding:2px 6px; font-size:0.65rem;">✖</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Summary of calculated totals -->
                <div style="background:var(--color-fondo); padding:12px; border-radius:8px; border:1px solid rgba(107, 97, 83, 0.3); font-size:0.75rem; display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; text-align:center; margin-bottom: 12px;">
                    <div>
                        <div style="color:var(--color-borde); margin-bottom:4px; font-weight:600;">Total Jabas</div>
                        <strong id="edit-summary-jabas" style="font-size:1.05rem; color:var(--color-tinta);">${item.cant_jabas}</strong>
                    </div>
                    <div>
                        <div style="color:var(--color-borde); margin-bottom:4px; font-weight:600;">Total Bruto</div>
                        <strong id="edit-summary-bruto" style="font-size:1.05rem; color:var(--color-primario);">${item.peso_bruto.toFixed(1)} Kg</strong>
                    </div>
                    <div>
                        <div style="color:var(--color-borde); margin-bottom:4px; font-weight:600;">Prom. Jaba</div>
                        <strong id="edit-summary-prom" style="font-size:1.05rem; color:#854d0e;">${(item.cant_jabas > 0 ? (item.peso_neto / item.cant_jabas) : 0).toFixed(2)} Kg/jb</strong>
                    </div>
                    <div>
                        <div style="color:var(--color-borde); margin-bottom:4px; font-weight:600;">Total Neto</div>
                        <strong id="edit-summary-neto" style="font-size:1.05rem; color:var(--color-secundario);">${item.peso_neto.toFixed(1)} Kg</strong>
                    </div>
                </div>

                <div>
                    <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:4px; color:var(--color-tinta);">Observaciones</label>
                    <textarea id="edit-rec-obs" class="form-input" style="width:100%; background:#ffffff; border-color:var(--color-borde); color:var(--color-tinta);" rows="2">${item.observaciones || ''}</textarea>
                </div>
            `;
        } else {
            formContainer.innerHTML = `
                <div style="font-size: 0.75rem; color: var(--color-tinta); background: var(--color-fondo); padding: 10px; border-radius: 8px; margin-bottom: 5px; border: 1px solid rgba(107, 97, 83, 0.3); line-height: 1.5;">
                    <strong>Guía de Origen:</strong> <span style="color:var(--color-primario); font-weight:700;">${item.guia_remision}</span> | <strong>Exportador:</strong> <span>${empName}</span> <br>
                    <strong>Proveedor:</strong> <span>${provName}</span> | <strong>Fecha:</strong> <span>${item.fecha}</span>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; grid-gap:12px; gap:12px;">
                    <div>
                        <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:4px; color:var(--color-tinta);">Cantidad Jabas Reales *</label>
                        <input type="number" id="edit-rec-jabas" class="form-input" style="width:100%; background:#ffffff; border-color:var(--color-borde); color:var(--color-tinta); font-weight:700;" value="${item.cant_jabas || 0}" required>
                    </div>
                    <div>
                        <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:4px; color:var(--color-tinta);">Peso Bruto Real (Kg) *</label>
                        <input type="number" id="edit-rec-bruto" class="form-input" style="width:100%; background:#ffffff; border-color:var(--color-borde); color:var(--color-primario); font-weight:700;" step="0.1" value="${item.peso_bruto || 0}" required>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; grid-gap:12px; gap:12px;">
                    <div>
                        <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:4px; color:var(--color-tinta);">Peso Tarimas / Tara (Kg) *</label>
                        <input type="number" id="edit-rec-tara" class="form-input" style="width:100%; background:#ffffff; border-color:var(--color-borde); color:var(--color-tinta); font-weight:700;" step="0.1" value="${item.peso_tara || 0}" required>
                    </div>
                    <div>
                        <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:4px; color:var(--color-tinta);">Peso Neto Calculado (Kg)</label>
                        <input type="number" id="edit-rec-neto" class="form-input" style="width:100%; background:var(--color-fondo); color:var(--color-secundario); font-weight:800; border-color:var(--color-borde);" value="${item.peso_neto || 0}" readonly>
                    </div>
                </div>

                <div>
                    <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:4px; color:var(--color-tinta);">Observaciones</label>
                    <textarea id="edit-rec-obs" class="form-input" style="width:100%; background:#ffffff; border-color:var(--color-borde); color:var(--color-tinta);" rows="2">${item.observaciones || ''}</textarea>
                </div>
            `;
        }

        card.appendChild(formContainer);

        // Bind listeners
        if (hasTarimas) {
            const recalculateTarimas = () => {
                let sumJabas = 0;
                let sumBruto = 0;
                let sumTara = 0;
                let sumNeto = 0;

                formContainer.querySelectorAll('.edit-tarima-row').forEach(row => {
                    const jEl = row.querySelector('.edit-tar-jabas');
                    const bEl = row.querySelector('.edit-tar-bruto');
                    
                    const jVal = parseInt(jEl.value) || 0;
                    const bVal = parseFloat(bEl.value) || 0;
                    
                    const taraTarima = parseFloat(row.dataset.taraTarima) || 0;
                    const unitJabaTara = parseFloat(row.dataset.taraJabaUnit) || 1.7;

                    const taraJabas = jVal * unitJabaTara;
                    const taraTotal = taraTarima + taraJabas;
                    const neto = Math.max(0, bVal - taraTotal);

                    const avg = jVal > 0 ? (neto / jVal) : 0;

                    const labelTaraJabas = row.querySelector('.edit-tar-tara-jabas-label');
                    if (labelTaraJabas) {
                        labelTaraJabas.innerText = `${taraJabas.toFixed(2)} Kg`;
                    }
                    const labelNeto = row.querySelector('.edit-tar-neto-label');
                    if (labelNeto) {
                        labelNeto.innerText = `${neto.toFixed(1)} Kg`;
                    }
                    const labelAvg = row.querySelector('.edit-tar-avg-label');
                    if (labelAvg) {
                        labelAvg.innerText = `${avg.toFixed(2)} Kg/jb`;
                    }

                    sumJabas += jVal;
                    sumBruto += bVal;
                    sumTara += taraTotal;
                    sumNeto += neto;
                });

                const sumProm = sumJabas > 0 ? (sumNeto / sumJabas) : 0;
                formContainer.querySelector('#edit-summary-jabas').innerText = sumJabas;
                formContainer.querySelector('#edit-summary-bruto').innerText = `${sumBruto.toFixed(1)} Kg`;
                const promSummaryEl = formContainer.querySelector('#edit-summary-prom');
                if (promSummaryEl) {
                    promSummaryEl.innerText = `${sumProm.toFixed(2)} Kg/jb`;
                }
                formContainer.querySelector('#edit-summary-neto').innerText = `${sumNeto.toFixed(1)} Kg`;
            };

            formContainer.querySelectorAll('.edit-tar-jabas, .edit-tar-bruto').forEach(input => {
                input.addEventListener('input', recalculateTarimas);
            });
            formContainer.querySelectorAll('.del-edit-tarima-row').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const row = e.currentTarget.closest('.edit-tarima-row');
                    if (row) {
                        row.remove();
                        recalculateTarimas();
                    }
                });
            });
        } else {
            const editJabas = formContainer.querySelector('#edit-rec-jabas');
            const editBruto = formContainer.querySelector('#edit-rec-bruto');
            const editTara = formContainer.querySelector('#edit-rec-tara');
            const editNeto = formContainer.querySelector('#edit-rec-neto');

            const recEditNeto = () => {
                const bruto = parseFloat(editBruto.value) || 0;
                const tara = parseFloat(editTara.value) || 0;
                editNeto.value = Math.max(0, bruto - tara).toFixed(1);
            };

            editBruto.addEventListener('input', recEditNeto);
            editTara.addEventListener('input', recEditNeto);
        }

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.style.gap = '10px';
        actions.style.marginTop = '20px';

        const btnCancel = document.createElement('button');
        btnCancel.innerText = 'Cancelar';
        btnCancel.style.padding = '8px 16px';
        btnCancel.style.borderRadius = 'var(--radio-control)';
        btnCancel.style.border = '1px solid var(--color-borde)';
        btnCancel.style.backgroundColor = 'transparent';
        btnCancel.style.color = 'var(--color-tinta)';
        btnCancel.style.fontFamily = 'var(--fuente-cuerpo)';
        btnCancel.style.fontWeight = '600';
        btnCancel.style.cursor = 'pointer';
        btnCancel.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        const btnSave = document.createElement('button');
        btnSave.innerText = 'Guardar';
        btnSave.style.padding = '8px 16px';
        btnSave.style.borderRadius = 'var(--radio-control)';
        btnSave.style.border = 'none';
        btnSave.style.backgroundColor = 'var(--color-primario)';
        btnSave.style.color = 'var(--color-primario-texto-sobre)';
        btnSave.style.fontFamily = 'var(--fuente-cuerpo)';
        btnSave.style.fontWeight = '700';
        btnSave.style.cursor = 'pointer';
        
        btnSave.addEventListener('click', async () => {
            const obs = formContainer.querySelector('#edit-rec-obs').value.trim();
            let updated = {};

            if (hasTarimas) {
                const updatedTarimas = [];
                let totalJabas = 0;
                let totalBruto = 0;
                let totalTara = 0;
                let totalNeto = 0;
                let validationError = false;

                formContainer.querySelectorAll('.edit-tarima-row').forEach(row => {
                    const id = parseFloat(row.dataset.id);
                    const jEl = row.querySelector('.edit-tar-jabas');
                    const bEl = row.querySelector('.edit-tar-bruto');
                    
                    const jVal = parseInt(jEl.value) || 0;
                    const bVal = parseFloat(bEl.value) || 0;
                    
                    if (jVal <= 0 || bVal <= 0) {
                        validationError = true;
                    }

                    const taraTarima = parseFloat(row.dataset.taraTarima) || 0;
                    const unitJabaTara = parseFloat(row.dataset.taraJabaUnit) || 1.7;

                    const taraJabas = jVal * unitJabaTara;
                    const taraTotal = taraTarima + taraJabas;
                    const neto = Math.max(0, bVal - taraTotal);

                    updatedTarimas.push({
                        id,
                        cant_jabas: jVal,
                        peso_bruto: bVal,
                        tara_tarima: taraTarima,
                        tara_jabas: taraJabas,
                        peso_neto: neto,
                        peso_promedio: jVal > 0 ? (neto / jVal) : 0,
                        tipo_envase: item.tarimas.find(t => t.id === id)?.tipo_envase || 'JABA'
                    });

                    totalJabas += jVal;
                    totalBruto += bVal;
                    totalTara += taraTotal;
                    totalNeto += neto;
                });

                if (validationError) {
                    alert("⚠️ Por favor ingrese cantidad de jabas y peso bruto válidos para todas las tarimas.");
                    return;
                }

                updated = {
                    cant_jabas: totalJabas,
                    peso_bruto: totalBruto,
                    peso_tara: totalTara,
                    peso_neto: totalNeto,
                    diff_jabas: totalJabas - item.cant_jabas_guia,
                    diff_peso: totalNeto - item.peso_guia,
                    observaciones: obs,
                    tarimas: updatedTarimas
                };
            } else {
                const editJabas = formContainer.querySelector('#edit-rec-jabas');
                const editBruto = formContainer.querySelector('#edit-rec-bruto');
                const editTara = formContainer.querySelector('#edit-rec-tara');
                const editNeto = formContainer.querySelector('#edit-rec-neto');

                const jabas = parseInt(editJabas.value) || 0;
                const bruto = parseFloat(editBruto.value) || 0;
                const tara = parseFloat(editTara.value) || 0;
                const neto = parseFloat(editNeto.value) || 0;

                if (jabas <= 0 || bruto <= 0 || tara < 0 || neto <= 0) {
                    alert("⚠️ Valores de pesos o cantidades no válidos.");
                    return;
                }

                updated = {
                    cant_jabas: jabas,
                    peso_bruto: bruto,
                    peso_tara: tara,
                    peso_neto: neto,
                    diff_jabas: jabas - item.cant_jabas_guia,
                    diff_peso: neto - item.peso_guia,
                    observaciones: obs,
                    tarimas: []
                };
            }

            await window.db.update('recepcion_mp', item.id, updated);
            alert("✅ Lote de Recepción modificado correctamente.");
            document.body.removeChild(overlay);
            this.refreshData();
        });

        actions.appendChild(btnCancel);
        actions.appendChild(btnSave);
        card.appendChild(actions);

        overlay.appendChild(card);
        document.body.appendChild(overlay);
    },

    printTicket(itemId) {
        const item = window.db.getById('recepcion_mp', itemId);
        if (!item) return;

        const prov = window.db.getById('proveedores_mp', item.proveedor_id);
        const provName = prov ? prov.nombre : 'N/A';
        const provFundo = prov ? prov.fundo : 'N/A';
        const varName = window.db.getById('variedades', item.variedad_id)?.nombre || 'N/A';
        const empName = window.db.getById('empresas', item.empresa_id)?.nombre || 'PACHAMAMA';

        const tempQrDiv = document.createElement('div');
        const qrContent = JSON.stringify({
            lote: item.lote_materia_prima,
            guia: item.guia_remision,
            prov: provName,
            var: varName,
            jabas: item.cant_jabas,
            neto: item.peso_neto
        });

        if (typeof QRCode !== 'undefined') {
            new QRCode(tempQrDiv, {
                text: qrContent,
                width: 150,
                height: 150,
                correctLevel: QRCode.CorrectLevel.M
            });
        }

        setTimeout(() => {
            const qrImg = tempQrDiv.querySelector('img') || tempQrDiv.querySelector('canvas');
            const qrSrc = qrImg ? (qrImg.src || qrImg.toDataURL()) : '';

            const printWindow = window.open('', '_blank', 'width=450,height=650');
            if (!printWindow) {
                alert("Por favor habilita las ventanas emergentes (popups) para poder imprimir el ticket.");
                return;
            }

            const palletRows = item.tarimas ? item.tarimas.map(t => `
                <tr>
                    <td style="padding: 4px; border-bottom:1px solid #ddd;">Tarima ${t.numero}</td>
                    <td style="padding: 4px; border-bottom:1px solid #ddd; text-align:right;">${t.cant_jabas}</td>
                    <td style="padding: 4px; border-bottom:1px solid #ddd; text-align:right;">${t.peso_neto.toFixed(1)} Kg</td>
                </tr>
            `).join('') : `
                <tr>
                    <td style="padding: 4px; border-bottom:1px solid #ddd;">Tarima 1</td>
                    <td style="padding: 4px; border-bottom:1px solid #ddd; text-align:right;">${item.cant_jabas}</td>
                    <td style="padding: 4px; border-bottom:1px solid #ddd; text-align:right;">${item.peso_neto.toFixed(1)} Kg</td>
                </tr>
            `;

            const diffJabas = item.diff_jabas !== undefined ? item.diff_jabas : 0;
            const diffPeso = item.diff_peso !== undefined ? item.diff_peso : 0;

            printWindow.document.write(`
                <html>
                <head>
                    <title>Ticket de Recepcion - Lote ${item.lote_materia_prima}</title>
                    <style>
                        body {
                            font-family: 'Courier New', Courier, monospace;
                            font-size: 11px;
                            width: 280px;
                            margin: 0 auto;
                            padding: 10px;
                            color: #000;
                        }
                        .text-center { text-align: center; }
                        .header { font-size: 15px; font-weight: bold; margin-bottom: 2px; }
                        .subheader { font-size: 10px; margin-bottom: 12px; border-bottom: 1px dashed #000; padding-bottom: 6px; }
                        .lot-box {
                            border: 2px solid #000;
                            padding: 6px;
                            font-size: 16px;
                            font-weight: bold;
                            text-align: center;
                            margin-bottom: 12px;
                            letter-spacing: 1px;
                        }
                        .info-table { width: 100%; margin-bottom: 12px; border-collapse: collapse; }
                        .info-table td { padding: 3px 0; vertical-align: top; }
                        .divider { border-top: 1px dashed #000; margin: 8px 0; }
                        .pallet-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                        .pallet-table th { border-bottom: 1px solid #000; padding: 4px; text-align: left; }
                        .pallet-table td { padding: 4px; }
                        .qr-container { display: flex; justify-content: center; margin: 15px 0; }
                        .signature-container { margin-top: 35px; display: flex; justify-content: space-between; }
                        .sig-line { width: 120px; border-top: 1px solid #000; text-align: center; font-size: 9px; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="text-center header">PACHAMAMA FRUIT S.A.</div>
                    <div class="text-center subheader">TICKET DE RECEPCION DE FRUTA</div>
                    
                    <div class="lot-box">LOTE: ${item.lote_materia_prima}</div>
                    
                    <table class="info-table">
                        <tr><td><strong>Fecha:</strong></td><td style="text-align:right;">${item.fecha} ${item.hora}</td></tr>
                        <tr><td><strong>Exportador:</strong></td><td style="text-align:right; font-weight:bold;">${empName}</td></tr>
                        <tr><td><strong>Guia GR:</strong></td><td style="text-align:right;">${item.guia_remision}</td></tr>
                        <tr><td><strong>Proveedor:</strong></td><td style="text-align:right;">${provName}</td></tr>
                        <tr><td><strong>Fundo:</strong></td><td style="text-align:right;">${provFundo}</td></tr>
                        <tr><td><strong>Variedad:</strong></td><td style="text-align:right;">${varName}</td></tr>
                        ${item.punto_partida ? `<tr><td><strong>Punto Partida:</strong></td><td style="text-align:right; font-size:9px;">${item.punto_partida}</td></tr>` : ''}
                        ${item.placa ? `<tr><td><strong>Placa Vehículo:</strong></td><td style="text-align:right;">${item.placa}</td></tr>` : ''}
                        ${item.chofer ? `<tr><td><strong>Conductor:</strong></td><td style="text-align:right; font-size:9px;">${item.chofer}</td></tr>` : ''}
                        ${item.precintos ? `<tr><td><strong>Precintos:</strong></td><td style="text-align:right; font-size:9px;">${item.precintos}</td></tr>` : ''}
                    </table>

                    <div class="divider"></div>
                    <div style="font-weight:bold; margin-bottom:4px;">COMPARATIVO GUIA VS PLANTA</div>
                    <table class="info-table" style="font-size:10px;">
                        <tr>
                            <td><strong>Métrica</strong></td>
                            <td style="text-align:right;"><strong>Guía</strong></td>
                            <td style="text-align:right;"><strong>Planta</strong></td>
                            <td style="text-align:right;"><strong>Dif.</strong></td>
                        </tr>
                        <tr>
                            <td>Jabas</td>
                            <td style="text-align:right;">${item.cant_jabas_guia || item.cant_jabas}</td>
                            <td style="text-align:right;">${item.cant_jabas}</td>
                            <td style="text-align:right;">${diffJabas > 0 ? '+' : ''}${diffJabas}</td>
                        </tr>
                        <tr>
                            <td>Peso Neto</td>
                            <td style="text-align:right;">${(item.peso_guia || item.peso_neto).toFixed(1)}K</td>
                            <td style="text-align:right;">${item.peso_neto.toFixed(1)}K</td>
                            <td style="text-align:right;">${diffPeso > 0 ? '+' : ''}${diffPeso.toFixed(1)}K</td>
                        </tr>
                    </table>

                    <div class="divider"></div>
                    <div style="font-weight:bold; margin-bottom:4px;">DETALLE DE TARIMAS (PALLETS)</div>
                    
                    <table class="pallet-table">
                        <thead>
                            <tr>
                                <th>Tarima</th>
                                <th style="text-align:right;">Jabas</th>
                                <th style="text-align:right;">Neto (Kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${palletRows}
                        </tbody>
                        <tfoot>
                            <tr style="font-weight:bold; border-top: 1px solid #000;">
                                <td>TOTALES:</td>
                                <td style="text-align:right;">${item.cant_jabas}</td>
                                <td style="text-align:right;">${item.peso_neto.toFixed(1)} Kg</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="divider"></div>
                    <div class="qr-container">
                        ${qrSrc ? `<img src="${qrSrc}" style="width:130px; height:130px;" />` : '<div style="font-size:10px; color:#555;">[QR Code]</div>'}
                    </div>
                    <div class="text-center" style="font-size:8px; color:#555; margin-bottom:15px;">
                        Escanee esta etiqueta en la tina o calibrado
                    </div>

                    <div class="signature-container">
                        <div class="sig-line">SUPERVISOR MP</div>
                        <div class="sig-line">CONDUCTOR / EXPORT.</div>
                    </div>

                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }, 300);
    },

    exportHistoryToExcel() {
        try {
            const list = window.db.getAll('recepcion_mp');
            const searchQuery = (document.getElementById('rec-historial-search').value || '').toLowerCase().trim();
            const empresaFilter = document.getElementById('rec-historial-empresa').value;
            const estadoFilter = document.getElementById('rec-historial-estado').value;

            let filtered = this.getFilteredRecords(list);

            if (searchQuery) {
                filtered = filtered.filter(item => {
                    const provName = window.db.getById('proveedores_mp', item.proveedor_id)?.nombre || '';
                    return (item.lote_materia_prima || '').toLowerCase().includes(searchQuery) ||
                           (item.guia_remision || '').toLowerCase().includes(searchQuery) ||
                           provName.toLowerCase().includes(searchQuery);
                });
            }

            if (empresaFilter) {
                filtered = filtered.filter(item => item.empresa_id === empresaFilter);
            }

            if (estadoFilter) {
                filtered = filtered.filter(item => item.estado === estadoFilter);
            }

            if (filtered.length === 0) {
                alert("No hay registros en la tabla para exportar.");
                return;
            }

            // Create data rows for sheet
            const data = filtered.map(item => {
                const empName = window.db.getById('empresas', item.empresa_id)?.nombre || 'N/A';
                const provName = window.db.getById('proveedores_mp', item.proveedor_id)?.nombre || 'N/A';
                const varName = window.db.getById('variedades', item.variedad_id)?.nombre || 'N/A';
                const desvPct = item.peso_guia > 0 ? (((item.peso_neto - item.peso_guia) / item.peso_guia) * 100) : 0;
                
                return {
                    'Lote (Batch)': item.lote_materia_prima,
                    'Guía de Remisión': item.guia_remision,
                    'Exportador': empName,
                    'Proveedor/Agricultor': provName,
                    'Variedad': varName,
                    'Fecha de Ingreso': item.fecha,
                    'Hora de Ingreso': item.hora,
                    'CLP': item.clp || '',
                    'Jabas Guía': item.cant_jabas_guia || 0,
                    'Peso Guía (Kg)': item.peso_guia || 0,
                    'Jabas Reales': item.cant_jabas || 0,
                    'Peso Neto Real (Kg)': item.peso_neto || 0,
                    'Dif. Jabas': item.diff_jabas || 0,
                    'Dif. Peso (Kg)': item.diff_peso || 0,
                    'Desviación (%)': desvPct.toFixed(2) + ' %',
                    'Chofer': item.chofer || '',
                    'Placa': item.placa || '',
                    'Precintos': item.precintos || '',
                    'Estado': item.estado,
                    'Evaluación Calidad': (item.senasa_aprobado !== undefined && item.senasa_aprobado !== null) ? 'EVALUADO' : 'PENDIENTE',
                    'Observaciones': item.observaciones || ''
                };
            });

            // Convert to sheet using XLSX library
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Recepción MP");

            // Adjust column widths automatically
            const maxLen = {};
            data.forEach(row => {
                Object.keys(row).forEach(key => {
                    const val = String(row[key]);
                    maxLen[key] = Math.max(maxLen[key] || key.length, val.length);
                });
            });
            worksheet['!cols'] = Object.keys(maxLen).map(key => ({
                wch: maxLen[key] + 3
            }));

            // Generate filename
            const dateStr = new Date().toISOString().slice(0, 10);
            const filename = `Reporte_Recepcion_MP_${dateStr}.xlsx`;

            // Save file
            XLSX.writeFile(workbook, filename);

        } catch (error) {
            console.error("Error al exportar a Excel:", error);
            alert("❌ Ocurrió un error al exportar los datos a Excel: " + error.message);
        }
    }
};

window.recepcionModule = recepcionModule;
