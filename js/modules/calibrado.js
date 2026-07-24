/* ==========================================================================
   Pachamama ERP - Calibrado de Materia Prima Module
   ========================================================================== */

const calibradoModule = {
    currentDestinations: {},        // Store structured inputs for active batch: { 'Europa': { '8_Marítima': { jabas: X, kg: Y } } }
    activeBatchOrder: null,         // Holds reference to the selected batch's Orden de Calibrado
    currentTab: 'orden',            // 'orden', 'distribucion', 'historial'
    activeDistributionBatchId: null,// ID of the batch currently being distributed in Tab 2
    activeDestTab: 'Europa',        // Active destination tab in the distribution screen: 'Europa', 'Estados Unidos', etc.

    // Default mango weight ranges (grams) by caliber
    DEFAULT_RANGES: {
        5: { min: 701, max: 850 },
        6: { min: 581, max: 700 },
        7: { min: 501, max: 580 },
        8: { min: 441, max: 500 },
        9: { min: 391, max: 440 },
        10: { min: 351, max: 390 },
        12: { min: 291, max: 320 },
        14: { min: 251, max: 270 },
        16: { min: 211, max: 230 }
    },

    // Static Routes Map based on user definition
    ROUTES_MAP: {
        'Europa': {
            'Marítima': { empaque: 'Marítimo', maduracion: 'No', hidrotermico: 'No' },
            'M. Frutura': { empaque: 'Marítimo', maduracion: 'No', hidrotermico: 'No' },
            'M. Wisha': { empaque: 'Marítimo', maduracion: 'No', hidrotermico: 'No' },
            'M. Selection': { empaque: 'Marítimo', maduracion: 'No', hidrotermico: 'No' },
            'Aérea': { empaque: 'Aéreo', maduracion: 'Sí', hidrotermico: 'No' }
        },
        'Estados Unidos': {
            'Pinto B': { empaque: 'Marítimo', maduracion: 'No', hidrotermico: 'Sí' },
            'Walmart': { empaque: 'Marítimo', maduracion: 'No', hidrotermico: 'Sí' },
            'Aérea': { empaque: 'Aéreo', maduracion: 'Sí', hidrotermico: 'Sí' }
        },
        'Chile': {
            'Marítima': { empaque: 'Marítimo', maduracion: 'No', hidrotermico: 'Sí' }
        },
        'China': {
            'Marítima': { empaque: 'Marítimo', maduracion: 'No', hidrotermico: 'Sí' },
            'Aérea': { empaque: 'Aéreo', maduracion: 'Sí', hidrotermico: 'Sí' }
        },
        'Corea': {
            'Marítima': { empaque: 'Marítimo', maduracion: 'No', hidrotermico: 'Sí' },
            'Aérea': { empaque: 'Aéreo', maduracion: 'Sí', hidrotermico: 'Sí' }
        }
    },

    getLocalDateStr(d = new Date()) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    init() {
        this.currentDestinations = {};
        this.activeBatchOrder = null;
        this.activeDistributionBatchId = null;
        this.activeDestTab = 'Europa';
        this.renderLayout();
        this.bindEvents();
        this.refreshTable();
        this.refreshOrderLookupTable();
    },

    renderLayout() {
        const container = document.getElementById('view-calibrado');
        if (!container) return;

        const recepciones = window.db.getAll('recepcion_mp').filter(r => {
            const st = (r.estado || '').toUpperCase();
            return st === 'APROBADO' || st === 'APROBADA' || st === 'CALIDAD_OK';
        });

        // Filter batches that don't have any calibrado record yet
        const calibrados = window.db.getAll('calibrado_mp') || [];
        const pendingOrderLotes = [...new Set(recepciones.map(r => r.lote_materia_prima))]
            .filter(lote => !calibrados.some(c => c.lote_materia_prima === lote))
            .sort((a,b) => b.localeCompare(a));

        // Filter batches that have an Order but are pending Distribution
        const pendingDistLotes = calibrados
            .filter(c => c.estado === 'PENDIENTE_DISTRIBUCION')
            .map(c => c.lote_materia_prima)
            .sort((a,b) => b.localeCompare(a));

        const calibres = [5, 6, 7, 8, 9, 10, 12, 14, 16];

        container.innerHTML = `
            <!-- Tab Navigation Header -->
            <div class="tabs-nav" style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                <button class="btn btn-secondary tab-btn active" data-calib-tab="orden" style="font-weight:700; display:flex; align-items:center; gap:6px;">📋 1. Orden de Calibrado</button>
                <button class="btn btn-secondary tab-btn" data-calib-tab="distribucion" style="font-weight:700; display:flex; align-items:center; gap:6px;">🗺️ 2. Registrar Calibrado (Distribución)</button>
                <button class="btn btn-secondary tab-btn" data-calib-tab="historial" style="font-weight:700; display:flex; align-items:center; gap:6px;">📜 3. Historial Completo</button>
            </div>

            <!-- Tab Panel 1: Registrar Orden de Calibrado -->
            <div class="calib-tab-panel active" id="calib-tab-panel-orden">
                <div style="display: grid; grid-template-columns: 2.2fr 1.3fr; gap: 15px;">
                    
                    <!-- Left: Form to register new orders -->
                    <form id="form-cal-orden" novalidate style="display:flex; flex-direction:column; gap:15px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            
                            <!-- Col 1.1: General Data -->
                            <div class="card" style="padding: 15px; display:flex; flex-direction:column; gap:10px;">
                                <h3 style="margin-top:0; font-size:0.85rem; color: var(--color-primario); text-transform: uppercase; font-weight:800; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 5px;">Orden de Calibrado</h3>
                                
                                <div class="form-group">
                                    <label class="form-label" for="ord-lote-select">Lote MP (Aprobado) *</label>
                                    <select id="ord-lote-select" class="form-select" required style="padding: 6px 10px; font-size:0.8rem;">
                                        <option value="">Selecciona Lote...</option>
                                        ${pendingOrderLotes.map(l => `<option value="${l}">${l}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="ord-fecha">Fecha Proceso *</label>
                                    <input type="date" id="ord-fecha" class="form-input" required style="padding: 6px 10px; font-size:0.8rem;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="ord-calibres-descarte">Calibres Descarte (sin pedido) *</label>
                                    <input type="text" id="ord-calibres-descarte" class="form-input" placeholder="Ej: 5, 16" value="5, 16" required style="padding: 6px 10px; font-size:0.8rem;">
                                </div>
                            </div>

                            <!-- Col 1.2: Actions -->
                            <div class="card" style="padding: 15px; display:flex; flex-direction:column; justify-content:space-between;">
                                <div>
                                    <h3 style="margin-top:0; font-size:0.85rem; color: var(--color-primario); text-transform: uppercase; font-weight:800; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 5px;">Instrucciones</h3>
                                    <p style="font-size:0.75rem; color:var(--text-secondary); line-height:1.5; margin:10px 0 0 0;">
                                        Configure los rangos de gramos mínimos y máximos para cada calibre que se utilizarán para dividir la fruta en este lote. Los pesos reales (Kg) se registrarán en la etapa de Distribución.
                                    </p>
                                </div>

                                <button type="submit" class="btn btn-primary" style="width:100%; font-weight:700; padding:10px; margin-top:10px; font-size:0.8rem;">💾 Guardar Rangos de Calibrado</button>
                            </div>
                        </div>

                        <!-- Caliber weights and ranges table -->
                        <div class="card" style="padding: 15px;">
                            <h3 style="margin-top:0; font-size:0.85rem; color: var(--color-primario); text-transform: uppercase; font-weight:800; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 10px;">Rangos de Gramos por Calibre</h3>
                            <div class="table-container" style="max-height: 380px; overflow-y: auto;">
                                <table style="width:100%; font-size:0.75rem; border-collapse:collapse; text-align:left;">
                                    <thead>
                                        <tr style="border-bottom: 1px solid var(--border-color); color:var(--text-secondary);">
                                            <th style="padding:8px;">Calibre</th>
                                            <th style="padding:8px; text-align:center;">Rango Mínimo (Gramos)</th>
                                            <th style="padding:8px; text-align:center;">Rango Máximo (Gramos)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${calibres.map(c => {
                                            const rng = this.DEFAULT_RANGES[c];
                                            return `
                                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                                                    <td style="padding:8px; font-weight:700;">Calibre ${c}</td>
                                                    <td style="padding:8px; text-align:center;">
                                                        <input type="number" class="form-input ord-rango-min" data-calibre="${c}" value="${rng.min}" style="width:100px; text-align:center; padding:4px; font-size:0.75rem; background:rgba(0,0,0,0.15); font-weight:700; color:var(--accent-blue);"> <span style="color:var(--text-muted);">g</span>
                                                    </td>
                                                    <td style="padding:8px; text-align:center;">
                                                        <input type="number" class="form-input ord-rango-max" data-calibre="${c}" value="${rng.max}" style="width:100px; text-align:center; padding:4px; font-size:0.75rem; background:rgba(0,0,0,0.15); font-weight:700; color:var(--accent-blue);"> <span style="color:var(--text-muted);">g</span>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </form>

                    <!-- Right: Search/Look up registered orders -->
                    <div class="card" style="padding: 15px; display:flex; flex-direction:column; gap:10px;">
                        <h3 style="margin-top:0; font-size:0.85rem; color: var(--color-primario); text-transform: uppercase; font-weight:800; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 5px;">Órdenes Registradas</h3>
                        <input type="text" id="ord-lookup-search" class="form-input" placeholder="🔍 Buscar lote..." style="padding: 5px 10px; font-size:0.75rem;">
                        
                        <div class="table-container" style="flex:1; overflow-y:auto; max-height:480px;">
                            <table style="width:100%; font-size:0.72rem; border-collapse:collapse;">
                                <thead>
                                    <tr style="border-bottom: 1px solid var(--border-color); color:var(--text-secondary); text-align:left;">
                                        <th style="padding:6px;">Batch</th>
                                        <th style="padding:6px;">Fecha Orden</th>
                                        <th style="padding:6px; text-align:center;">Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="ord-lookup-tbody">
                                    <!-- Loaded dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Panel 2: Registrar Calibrado (Distribución por Destinos) -->
            <div class="calib-tab-panel" id="calib-tab-panel-distribucion" style="display: none;">
                <!-- Section 2.1: Table of Pending Batches to choose from -->
                <div id="dist-batch-list-view">
                    <div class="card" style="padding: 20px;">
                        <h3 style="margin-top:0; font-size:0.95rem; color: var(--color-primario); text-transform: uppercase; font-weight:800; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 15px;">Selección de Batch para Calibrado / Distribución</h3>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Batch</th>
                                        <th>Fecha Orden</th>
                                        <th>Calibres Descarte</th>
                                        <th style="text-align:center; width:180px;">Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="dist-batch-list-tbody">
                                    <!-- Loaded dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Section 2.2: Full screen distribution view (hidden by default) -->
                <div id="dist-active-workspace-view" style="display:none;">
                    <div class="card" style="padding:15px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.1); border:1px solid var(--border-color); flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <button type="button" class="btn btn-secondary btn-sm" id="btn-dist-back-to-list" style="font-weight:700; padding:5px 12px;">🔙 Volver a la Lista</button>
                            <div>
                                <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Distribución para:</span>
                                <strong id="dist-workspace-batch-title" style="font-size:1.1rem; color:var(--color-primario); margin-left:5px; font-family:monospace;"></strong>
                            </div>
                        </div>
                        <div style="display:flex; gap:15px; font-size:0.78rem; text-align:right; flex-wrap:wrap; align-items:center;">
                            <div>Kilos Aptos (Balanza): <strong id="dist-workspace-aptos-kg" style="color:var(--accent-blue); font-size:1rem;">0.0 Kg</strong></div>
                            <div>Distribuidos: <strong id="dist-workspace-ruteado-kg" style="color:var(--color-exito); font-size:1rem;">0.0 Kg</strong></div>
                            <div>Diferencia: <strong id="dist-workspace-restante-kg" style="color:var(--color-alerta); font-size:1rem;">0.0 Kg</strong></div>
                        </div>
                    </div>

                    <!-- Métricas y Balanza (Defectos, fuera de calibre, calibrados) -->
                    <div class="card" style="padding:15px; margin-bottom:15px;">
                        <h3 style="margin-top:0; font-size:0.85rem; color: var(--color-primario); text-transform: uppercase; font-weight:800; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">⚖️ Métricas y Balanza del Batch</h3>
                        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
                            <div class="form-group">
                                <label class="form-label" for="dist-kg-calibrados">Kg Calibrados (Total Balanza) *</label>
                                <input type="number" id="dist-kg-calibrados" class="form-input" placeholder="0.0" min="0" step="0.1" style="font-weight:700; color:var(--text-primary);">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="dist-kg-defectos">Kg Defectos *</label>
                                <input type="number" id="dist-kg-defectos" class="form-input" placeholder="0.0" min="0" step="0.1" style="font-weight:700; color:var(--color-alerta);">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="dist-kg-fuera">Kg Fuera Calibre *</label>
                                <input type="number" id="dist-kg-fuera" class="form-input" placeholder="0.0" min="0" step="0.1" style="font-weight:700; color:var(--color-alerta);">
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="font-weight:800;">Kg Aptos (Balanza)</label>
                                <input type="text" id="dist-kg-aptos-balanza" class="form-input" style="font-weight:800; color:var(--color-exito); background:rgba(0,0,0,0.15);" readonly value="0.0">
                            </div>
                        </div>
                    </div>

                    <!-- Side-by-side: Left=Grids container with destination tabs, Right=Caliber availability lookup panel -->
                    <div style="display:grid; grid-template-columns: 2.2fr 1fr; gap:15px; align-items:start;">
                        
                        <!-- Left: Destination Grids and tabs -->
                        <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:15px;">
                            <!-- Destination Tabs -->
                            <div class="tabs-nav" style="display:flex; gap:6px; border-bottom:1px solid var(--border-color); padding-bottom:8px;" id="dist-dest-tabs-container">
                                <!-- Generated dynamically: tabs for Europa, Estados Unidos, Chile, China, Corea -->
                            </div>

                            <!-- Active Destination Grid Table -->
                            <div id="dist-active-grid-table-container">
                                <!-- Rendered dynamically based on activeDestTab -->
                            </div>

                            <div style="display:flex; justify-content:flex-end; margin-top:10px; border-top:1px solid var(--border-color); padding-top:12px;">
                                <button type="button" class="btn btn-primary" id="btn-dist-save-workspace" style="font-weight:800; padding:10px 30px; font-size:0.9rem;">💾 Guardar Distribución del Lote</button>
                            </div>
                        </div>

                        <!-- Right: Caliber remaining legend -->
                        <div class="card" style="padding:15px; position:sticky; top:10px;">
                            <h3 style="margin-top:0; font-size:0.85rem; color: var(--color-primario); text-transform: uppercase; font-weight:800; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">⚖️ Kilos Distribuidos por Calibre</h3>
                            <div id="dist-workspace-caliber-avail-list" style="display:flex; flex-direction:column; gap:6px;">
                                <!-- Rendered dynamically -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Panel 3: Historial de Calibrados -->
            <div class="calib-tab-panel" id="calib-tab-panel-historial" style="display: none;">
                <div class="card" style="display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                        <h2 class="card-title" style="margin:0;">📋 Historial de Lotes Calibrados</h2>
                        <div style="display:flex; gap:8px;">
                            <input type="text" id="calib-search" class="form-input" placeholder="🔍 Buscar por Batch..." style="font-size:0.75rem; padding:4px 8px; width:220px;">
                            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-cal-excel">📥 Exportar Excel</button>
                        </div>
                    </div>

                    <div class="table-container" style="overflow-x:auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Batch</th>
                                    <th>Empresa</th>
                                    <th>Fecha Calibrado</th>
                                    <th style="text-align:right;">Kg Calibrados</th>
                                    <th style="text-align:right;">Kg Aptos</th>
                                    <th style="text-align:right;">Kg Defectos</th>
                                    <th style="text-align:right;">Kg Fuera Calibre</th>
                                    <th>Calibres Descarte</th>
                                    <th>Destinos</th>
                                    <th>Estado</th>
                                    <th style="width:160px; text-align:center;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="table-calibrado-body">
                                <!-- Loaded dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Tab switching
        const tabButtons = document.querySelectorAll('[data-calib-tab]');
        const tabPanels = document.querySelectorAll('.calib-tab-panel');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-calib-tab');
                this.currentTab = target;
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tabPanels.forEach(p => {
                    p.style.display = p.id === `calib-tab-panel-${target}` ? 'block' : 'none';
                });
                if (target === 'orden') {
                    this.refreshOrderLookupTable();
                } else if (target === 'distribucion') {
                    this.refreshPendingDistTable();
                } else if (target === 'historial') {
                    this.refreshTable();
                }
            });
        });

        // Set default dates
        const dateOrder = document.getElementById('ord-fecha');
        if (dateOrder) dateOrder.value = this.getLocalDateStr();

        // ----------------- TAB 1: ORDEN DE CALIBRADO EVENTS -----------------
        const selectLoteOrd = document.getElementById('ord-lote-select');
        const ordLoteNeto = document.getElementById('ord-info-lote-neto');
        if (selectLoteOrd) {
            selectLoteOrd.addEventListener('change', () => {
                const val = selectLoteOrd.value;
                if (!val) {
                    ordLoteNeto.innerText = 'Selecciona lote...';
                    return;
                }
                const rec = window.db.getAll('recepcion_mp').find(r => r.lote_materia_prima === val);
                if (rec) {
                    const emp = window.db.getById('empresas', rec.empresa_id)?.nombre || 'Pachamama';
                    ordLoteNeto.innerText = `${rec.peso_neto.toLocaleString()} Kg (${emp})`;
                }
            });
        }

        // Form Submit for Tab 1 (Orden de Calibrado)
        const formOrder = document.getElementById('form-cal-orden');
        if (formOrder) {
            formOrder.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderSubmit();
            });
        }

        // Lookup search input in Tab 1
        const lookupSearch = document.getElementById('ord-lookup-search');
        if (lookupSearch) {
            lookupSearch.addEventListener('input', () => this.refreshOrderLookupTable());
        }

        // Click action listener for registered orders in Tab 1
        const lookupTbody = document.getElementById('ord-lookup-tbody');
        if (lookupTbody) {
            lookupTbody.addEventListener('click', (e) => {
                const btnView = e.target.closest('.view-ord-pesos');
                if (btnView) {
                    const id = btnView.dataset.id;
                    const item = window.db.getById('calibrado_mp', id);
                    if (item) this.openOrderDetailsModal(item);
                }
            });
        }

        // ----------------- TAB 2: DISTRIBUCION EVENTS -----------------
        const distBatchTbody = document.getElementById('dist-batch-list-tbody');
        if (distBatchTbody) {
            distBatchTbody.addEventListener('click', (e) => {
                const btnDist = e.target.closest('.btn-distribute-batch');
                if (btnDist) {
                    const id = btnDist.dataset.id;
                    const item = window.db.getById('calibrado_mp', id);
                    if (item) this.openDistributionWorkspace(item);
                }
            });
        }

        const btnBackToList = document.getElementById('btn-dist-back-to-list');
        if (btnBackToList) {
            btnBackToList.addEventListener('click', () => {
                this.activeDistributionBatchId = null;
                document.getElementById('dist-active-workspace-view').style.display = 'none';
                document.getElementById('dist-batch-list-view').style.display = 'block';
                this.refreshPendingDistTable();
            });
        }

        const btnSaveWorkspace = document.getElementById('btn-dist-save-workspace');
        if (btnSaveWorkspace) {
            btnSaveWorkspace.addEventListener('click', () => {
                this.handleDistributionSubmit();
            });
        }

        // ----------------- TAB 3: HISTORIAL EVENTS -----------------
        const searchInput = document.getElementById('calib-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.refreshTable());
        }

        // History delegation for actions
        const tbody = document.getElementById('table-calibrado-body');
        if (tbody) {
            tbody.addEventListener('click', (e) => {
                const btnView = e.target.closest('.view-cal-ficha');
                const btnDel = e.target.closest('.del-cal');
                if (btnView) {
                    const id = btnView.dataset.id;
                    const item = window.db.getById('calibrado_mp', id);
                    if (item) this.openDetailModal(item);
                } else if (btnDel) {
                    const id = btnDel.dataset.id;
                    if (confirm("⚠️ ¿Estás seguro de eliminar este registro de calibrado? Esto liberará el batch para ruteo de nuevo.")) {
                        window.db.delete('calibrado_mp', id);
                        this.init();
                    }
                }
            });
        }

        // Global DB Changed event
        document.addEventListener('db-changed', (e) => {
            if (e.detail && (e.detail.key === 'calibrado_mp' || e.detail.key === 'recepcion_mp')) {
                if (this.currentTab === 'orden') {
                    this.refreshOrderLookupTable();
                } else if (this.currentTab === 'distribucion' && !this.activeDistributionBatchId) {
                    this.refreshPendingDistTable();
                } else if (this.currentTab === 'historial') {
                    this.refreshTable();
                }
            }
        });
    },

    // Save weight ranges (Tab 1)
    async handleOrderSubmit() {
        try {
            const lote_materia_prima = document.getElementById('ord-lote-select').value;
            const fecha_calibrado = document.getElementById('ord-fecha').value;
            const calibres_descarte = document.getElementById('ord-calibres-descarte').value.trim();

            if (!lote_materia_prima) return alert("Por favor selecciona un Lote MP.");

            // Collect caliber ranges
            const rangos_calibres = {};
            const calibres = [5, 6, 7, 8, 9, 10, 12, 14, 16];
            let rangeError = false;

            calibres.forEach(c => {
                const minEl = document.querySelector(`.ord-rango-min[data-calibre="${c}"]`);
                const maxEl = document.querySelector(`.ord-rango-max[data-calibre="${c}"]`);
                const min = parseInt(minEl.value) || 0;
                const max = parseInt(maxEl.value) || 0;

                if (min > max) {
                    rangeError = true;
                }
                rangos_calibres[c] = { min, max };
            });

            if (rangeError) {
                return alert("Error: El rango mínimo de gramos no puede ser mayor que el rango máximo.");
            }

            const record = {
                lote_materia_prima,
                fecha_calibrado,
                supervisor_id: '', // removed supervisor input from Tab 1
                calibres_descarte,
                pesos_calibres: {}, // no weights in Tab 1
                rangos_calibres,
                kg_aptos_orden: 0,  // no weights in Tab 1
                kg_defectos: 0,
                kg_fuera_calibre: 0,
                kg_aptos: 0,
                kg_calibrados: 0,
                estado: 'PENDIENTE_DISTRIBUCION',
                distribucion: [] // Empty distribution array initially
            };

            await window.db.insert('calibrado_mp', record);
            alert(`✅ Rangos de Calibrado para el Batch ${lote_materia_prima} guardados correctamente.\n\nPase a la pestaña "2. Registrar Calibrado" para distribuir.`);
            
            // Reload module to clear form and refresh grids
            this.init();
        } catch (error) {
            console.error("Error saving caliber order:", error);
            alert("❌ Ocurrió un error al guardar: " + error.message);
        }
    },

    // Refresh side lookup list in Tab 1
    refreshOrderLookupTable() {
        const tbody = document.getElementById('ord-lookup-tbody');
        if (!tbody) return;

        const list = window.db.getAll('calibrado_mp') || [];
        const query = (document.getElementById('ord-lookup-search')?.value || '').toLowerCase().trim();

        let filtered = list;
        if (query) {
            filtered = list.filter(item => item.lote_materia_prima.toLowerCase().includes(query));
        }

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:15px; color:var(--text-muted); font-style:italic;">No hay órdenes.</td></tr>`;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding:6px; font-weight:700; font-family:monospace;">${item.lote_materia_prima}</td>
                <td style="padding:6px;">${item.fecha_calibrado}</td>
                <td style="padding:6px; text-align:center;">
                    <button type="button" class="btn btn-secondary btn-sm view-ord-pesos" data-id="${item.id}" style="padding:2px 6px; font-size:0.68rem; font-weight:700;">👁️ Ver Rangos</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Modal to view registered caliber ranges of Tab 1
    openOrderDetailsModal(item) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:10000; padding:20px;';

        const rangos = item.rangos_calibres || {};
        const calibres = [5, 6, 7, 8, 9, 10, 12, 14, 16];

        modal.innerHTML = `
            <div class="card" style="width:100%; max-width:450px; padding:20px; position:relative; box-shadow:0 10px 25px rgba(0,0,0,0.5); border: 1px solid var(--border-color); background:var(--color-tarjeta-bg || #1e293b); color:var(--text-primary);">
                <button id="modal-close-btn" style="position:absolute; top:12px; right:12px; background:none; border:none; color:var(--text-secondary); font-size:1.4rem; cursor:pointer;">&times;</button>
                
                <h3 style="margin-top:0; color:var(--color-primario); border-bottom:1px solid var(--border-color); padding-bottom:8px; font-size:1rem; text-transform:uppercase;">
                    ⚖️ Rangos Configurados - Batch ${item.lote_materia_prima}
                </h3>
                
                <div style="margin-bottom:15px; font-size:0.8rem; line-height:1.5;">
                    <div>Fecha Proceso: <strong>${item.fecha_calibrado}</strong></div>
                    <div>Calibres Descarte: <strong style="color:var(--color-alerta);">${item.calibres_descarte || ''}</strong></div>
                </div>

                <div class="table-container" style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;">
                    <table style="width:100%; font-size:0.75rem; text-align:left; border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:1px solid var(--border-color); color:var(--text-secondary);">
                                <th style="padding:5px;">Calibre</th>
                                <th style="padding:5px; text-align:center;">Rango Configurado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${calibres.map(c => {
                                const rng = rangos[c] || { min: 0, max: 0 };
                                return `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                                        <td style="padding:6px; font-weight:700;">Calibre ${c}</td>
                                        <td style="padding:6px; text-align:center; color:var(--accent-blue); font-weight:700;">${rng.min} - ${rng.max} gramos</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="display:flex; justify-content:flex-end;">
                    <button class="btn btn-secondary btn-sm" id="modal-close-btn-bottom" style="padding:5px 12px;">Cerrar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const close = () => document.body.removeChild(modal);
        modal.querySelector('#modal-close-btn').addEventListener('click', close);
        modal.querySelector('#modal-close-btn-bottom').addEventListener('click', close);
    },

    // ----------------- TAB 2: DISTRIBUCION SCREEN -----------------

    // Refresh list of pending batches in Tab 2
    refreshPendingDistTable() {
        const tbody = document.getElementById('dist-batch-list-tbody');
        if (!tbody) return;

        const calibrados = window.db.getAll('calibrado_mp') || [];
        const pending = calibrados.filter(c => c.estado === 'PENDIENTE_DISTRIBUCION');

        tbody.innerHTML = '';
        if (pending.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--text-muted); font-style:italic;">No hay lotes con Rangos de Calibrado listos para distribuir.</td></tr>`;
            return;
        }

        pending.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:700; font-family:monospace; color:var(--color-primario);">${item.lote_materia_prima}</td>
                <td>${item.fecha_calibrado}</td>
                <td style="text-align:center; color:var(--color-alerta); font-weight:700;">${item.calibres_descarte || ''}</td>
                <td style="text-align:center;">
                    <button type="button" class="btn btn-primary btn-sm btn-distribute-batch" data-id="${item.id}" style="padding:4px 10px; font-size:0.75rem; font-weight:700;">🗺️ Distribuir Fruta</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Open workspace to perform distribution (hides list)
    openDistributionWorkspace(item) {
        this.activeDistributionBatchId = item.id;
        this.activeBatchOrder = item;
        this.currentDestinations = {};
        this.activeDestTab = 'Europa'; // default active destination tab

        // Load metrics if already present
        document.getElementById('dist-kg-calibrados').value = item.kg_calibrados || '';
        document.getElementById('dist-kg-defectos').value = item.kg_defectos || '';
        document.getElementById('dist-kg-fuera').value = item.kg_fuera_calibre || '';
        document.getElementById('dist-kg-aptos-balanza').value = item.kg_aptos || '0.0';

        // Group already stored distribution if editing
        if (item.distribucion && item.distribucion.length > 0) {
            item.distribucion.forEach(d => {
                if (!this.currentDestinations[d.destino]) this.currentDestinations[d.destino] = {};
                this.currentDestinations[d.destino][`${d.calibre}_${d.calidad}`] = { jabas: d.jabas, kg: d.kg };
            });
        }

        // Initialize empty destinations if not present
        const dests = ['Europa', 'Estados Unidos', 'Chile', 'China', 'Corea'];
        dests.forEach(d => {
            if (!this.currentDestinations[d]) this.currentDestinations[d] = {};
        });

        // Show workspace, hide list
        document.getElementById('dist-batch-list-view').style.display = 'none';
        document.getElementById('dist-active-workspace-view').style.display = 'block';

        // Update titles and headers
        document.getElementById('dist-workspace-batch-title').innerText = item.lote_materia_prima;
        
        // Listeners for balanza metrics inside Tab 2
        const inputCal = document.getElementById('dist-kg-calibrados');
        const inputDef = document.getElementById('dist-kg-defectos');
        const inputFue = document.getElementById('dist-kg-fuera');
        
        const calculateAptosBalanza = () => {
            const cal = parseFloat(inputCal.value) || 0;
            const def = parseFloat(inputDef.value) || 0;
            const fue = parseFloat(inputFue.value) || 0;
            const apt = Math.max(0, cal - def - fue);
            document.getElementById('dist-kg-aptos-balanza').value = apt.toFixed(1);
            this.updateWorkspaceDistributionKPIs();
        };

        [inputCal, inputDef, inputFue].forEach(el => {
            el.removeEventListener('input', calculateAptosBalanza);
            el.addEventListener('input', calculateAptosBalanza);
        });

        // Render workspace tabs
        this.renderDestinationWorkspaceTabs();
        this.renderActiveDestinationGrid();
        this.renderWorkspaceCaliberAvailabilityLegend();
        this.updateWorkspaceDistributionKPIs();
    },

    renderDestinationWorkspaceTabs() {
        const container = document.getElementById('dist-dest-tabs-container');
        if (!container) return;

        const dests = ['Europa', 'Estados Unidos', 'Chile', 'China', 'Corea'];
        
        container.innerHTML = dests.map(d => {
            // Count distributed Kg in this destination in UI
            let sumKg = 0;
            if (this.currentDestinations[d]) {
                for (let key in this.currentDestinations[d]) {
                    sumKg += this.currentDestinations[d][key].kg || 0;
                }
            }

            const activeClass = this.activeDestTab === d ? 'active btn-accent' : 'btn-secondary';
            const badge = sumKg > 0 ? `<span class="badge badge-green" style="font-size:0.6rem; padding:1px 4px; margin-left:5px;">${sumKg.toFixed(0)}Kg</span>` : '';

            return `
                <button type="button" class="btn btn-sm ${activeClass}" onclick="calibradoModule.changeActiveDestTab('${d}')" style="font-weight:700; padding:6px 12px; font-size:0.75rem;">
                    ${d} ${badge}
                </button>
            `;
        }).join('');
    },

    changeActiveDestTab(dest) {
        this.activeDestTab = dest;
        this.renderDestinationWorkspaceTabs();
        this.renderActiveDestinationGrid();
    },

    renderActiveDestinationGrid() {
        const container = document.getElementById('dist-active-grid-table-container');
        if (!container) return;

        const dest = this.activeDestTab;
        const qualities = Object.keys(this.ROUTES_MAP[dest] || {});
        const calibres = [5, 6, 7, 8, 9, 10, 12, 14, 16];

        container.innerHTML = `
            <div class="table-container" style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.75rem; text-align:center;">
                    <thead>
                        <tr style="border-bottom:1px solid var(--border-color); background:rgba(0,0,0,0.1);">
                            <th style="padding:10px; text-align:left; font-size:0.8rem; color:var(--color-primario);">Calibre</th>
                            ${qualities.map(q => `<th style="padding:10px;">${q} <span style="font-size:0.62rem; color:var(--text-muted); display:block;">(Jabas / Kilos)</span></th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${calibres.map(c => {
                            const rng = this.activeBatchOrder.rangos_calibres?.[c] || { min: 0, max: 0 };
                            return `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <td style="padding:8px; text-align:left; font-weight:700;">
                                        Calibre ${c}
                                        <div style="font-size:0.6rem; color:var(--text-muted); font-weight:500;">Rango: ${rng.min}-${rng.max}g</div>
                                    </td>
                                    ${qualities.map(q => {
                                        const cellVal = this.currentDestinations[dest]?.[`${c}_${q}`] || { jabas: '', kg: '' };
                                        return `
                                            <td style="padding:6px;">
                                                <div style="display:inline-flex; align-items:center; gap:2px;">
                                                    <input type="number" class="form-input dist-cell-jabas" placeholder="J" data-calibre="${c}" data-calidad="${q}" value="${cellVal.jabas}" min="0" style="width: 44px; text-align: center; font-size: 0.72rem; padding: 4px 2px; height:24px; background:var(--color-fondo);">
                                                    <input type="number" class="form-input dist-cell-kg" placeholder="Kg" data-calibre="${c}" data-calidad="${q}" value="${cellVal.kg}" min="0" step="0.1" style="width: 55px; text-align: center; font-size: 0.72rem; padding: 4px 2px; height:24px; background:var(--color-fondo); font-weight:700; color:var(--accent-blue);">
                                                </div>
                                            </td>
                                        `;
                                    }).join('')}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="border-top:2px solid var(--border-color); font-weight:700; background:rgba(0,0,0,0.15);">
                            <td style="padding:12px; text-align:left;">TOTAL ${dest.toUpperCase()}:</td>
                            <td colspan="${qualities.length}" style="padding:12px; text-align:right; font-size:0.8rem;">
                                Total Kg: <span id="dist-total-kg-${dest}" style="color:var(--accent-blue); margin-right:15px; font-weight:800;">0.0</span> 
                                Total Jabas: <span id="dist-total-jabas-${dest}" style="color:var(--text-primary); font-weight:800;">0</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        // Bind input listeners inside active destination tab for real-time updates
        container.querySelectorAll('.dist-cell-jabas, .dist-cell-kg').forEach(input => {
            input.addEventListener('input', () => {
                const cal = input.dataset.calibre;
                const qual = input.dataset.calidad;
                const cellKey = `${cal}_${qual}`;
                
                if (!this.currentDestinations[dest][cellKey]) {
                    this.currentDestinations[dest][cellKey] = { jabas: '', kg: '' };
                }

                if (input.classList.contains('dist-cell-jabas')) {
                    this.currentDestinations[dest][cellKey].jabas = input.value === '' ? '' : parseInt(input.value) || 0;
                } else {
                    this.currentDestinations[dest][cellKey].kg = input.value === '' ? '' : parseFloat(input.value) || 0;
                }

                this.calculateDestinationTotals(dest);
                this.renderWorkspaceCaliberAvailabilityLegend();
                this.updateWorkspaceDistributionKPIs();
            });
        });

        // Compute initially
        this.calculateDestinationTotals(dest);
    },

    renderWorkspaceCaliberAvailabilityLegend() {
        const container = document.getElementById('dist-workspace-caliber-avail-list');
        if (!container || !this.activeBatchOrder) return;

        const calibres = [5, 6, 7, 8, 9, 10, 12, 14, 16];
        const rangos = this.activeBatchOrder.rangos_calibres || {};

        container.innerHTML = calibres.map(c => {
            const rng = rangos[c] || { min: 0, max: 0 };
            
            // Calculate what has been distributed so far in UI for this caliber
            let distributed = 0;
            for (let dest in this.currentDestinations) {
                for (let cellKey in this.currentDestinations[dest]) {
                    const [cal, qual] = cellKey.split('_');
                    if (parseInt(cal) === c) {
                        distributed += this.currentDestinations[dest][cellKey].kg || 0;
                    }
                }
            }

            const activeStyle = distributed > 0 ? 'rgba(52, 211, 153, 0.1); border-color:rgba(52, 211, 153, 0.3); font-weight:700;' : '';

            return `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.08); border:1px solid var(--border-color); padding:8px; border-radius:6px; font-size:0.75rem; ${activeStyle}">
                    <div>
                        <strong>Calibre ${c}:</strong> 
                        <span style="color:var(--text-secondary); margin-left:5px;">Rango: ${rng.min}-${rng.max}g</span>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-weight:800; color:var(--accent-blue);">${distributed.toLocaleString()} Kg</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    updateWorkspaceDistributionKPIs() {
        // Here, the reference is the Kg Aptos entered in the Balanza metrics!
        const aptos = parseFloat(document.getElementById('dist-kg-aptos-balanza').value) || 0;
        
        let sumDistributed = 0;
        for (let dest in this.currentDestinations) {
            for (let cellKey in this.currentDestinations[dest]) {
                sumDistributed += this.currentDestinations[dest][cellKey].kg || 0;
            }
        }

        const diff = aptos - sumDistributed;

        document.getElementById('dist-workspace-aptos-kg').innerText = `${aptos.toLocaleString()} Kg`;
        document.getElementById('dist-workspace-ruteado-kg').innerText = `${sumDistributed.toLocaleString()} Kg`;
        
        const elRestante = document.getElementById('dist-workspace-restante-kg');
        if (elRestante) {
            elRestante.innerText = `${diff.toLocaleString()} Kg`;
            if (Math.abs(diff) < 0.1) {
                elRestante.style.color = 'var(--color-exito)';
            } else if (diff < 0) {
                elRestante.style.color = 'var(--color-alerta)';
                elRestante.innerText = `Exceso: ${Math.abs(diff).toLocaleString()} Kg`;
            } else {
                elRestante.style.color = 'var(--color-alerta)';
            }
        }
    },

    // Finalize calibration and save distribution (Tab 2)
    async handleDistributionSubmit() {
        try {
            if (!this.activeBatchOrder) return alert("Por favor seleccione un Lote.");

            const lote_materia_prima = this.activeBatchOrder.lote_materia_prima;
            
            // Read balanza metrics
            const kg_calibrados = parseFloat(document.getElementById('dist-kg-calibrados').value) || 0;
            const kg_defectos = parseFloat(document.getElementById('dist-kg-defectos').value) || 0;
            const kg_fuera_calibre = parseFloat(document.getElementById('dist-kg-fuera').value) || 0;
            const kg_aptos = parseFloat(document.getElementById('dist-kg-aptos-balanza').value) || 0;

            if (kg_calibrados <= 0) {
                return alert("Por favor ingrese el total de Kg Calibrados.");
            }

            // Compile the caliber distribution
            const distribucion = [];
            let totalDistributedKg = 0;
            const caliberWeightsDistributed = {};

            for (let dest in this.currentDestinations) {
                for (let cellKey in this.currentDestinations[dest]) {
                    const [calibre, calidad] = cellKey.split('_');
                    const cellData = this.currentDestinations[dest][cellKey];
                    
                    if (cellData.kg > 0 || cellData.jabas > 0) {
                        const routeInfo = this.ROUTES_MAP[dest]?.[calidad] || { empaque: 'Marítimo', maduracion: 'No', hidrotermico: 'No' };
                        distribucion.push({
                            destino: dest,
                            calidad: calidad,
                            calibre: parseInt(calibre),
                            jabas: parseInt(cellData.jabas) || 0,
                            kg: parseFloat(cellData.kg) || 0,
                            empaque: routeInfo.empaque,
                            maduracion: routeInfo.maduracion,
                            hidrotermico: routeInfo.hidrotermico
                        });

                        const cNum = parseInt(calibre);
                        if (!caliberWeightsDistributed[cNum]) caliberWeightsDistributed[cNum] = 0;
                        caliberWeightsDistributed[cNum] += cellData.kg;

                        totalDistributedKg += cellData.kg;
                    }
                }
            }

            if (distribucion.length === 0) {
                return alert("Deber ingresar al menos un registro en las grillas de distribución.");
            }

            // Warning if distributed Kg doesn't match total Kg Aptos
            const diff = Math.abs(kg_aptos - totalDistributedKg);
            if (diff > 5) {
                const proceed = confirm(`⚠️ Atención: Los Kg totales distribuidos (${totalDistributedKg.toFixed(1)} Kg) no coinciden exactamente con los Kilos Aptos totales de balanza (${kg_aptos.toFixed(1)} Kg).\nDiferencia: ${diff.toFixed(1)} Kg.\n¿Deseas guardar la distribución con esta diferencia?`);
                if (!proceed) return;
            }

            // Update record in database
            const record = {
                ...this.activeBatchOrder,
                pesos_calibres: caliberWeightsDistributed, // Save weights by caliber generated from the distribution
                kg_calibrados,
                kg_defectos,
                kg_fuera_calibre,
                kg_aptos,
                distribucion,
                estado: 'PROCESADO'
            };

            await window.db.update('calibrado_mp', this.activeBatchOrder.id, record);

            // Update status of the receipt to 'CALIBRADO'
            const rec = window.db.getAll('recepcion_mp').find(r => r.lote_materia_prima === lote_materia_prima);
            if (rec) {
                await window.db.update('recepcion_mp', rec.id, { estado: 'CALIBRADO' });
            }

            alert(`✅ Calibrado y Distribución del Batch ${lote_materia_prima} finalizados con éxito.`);
            this.init();
            
            // Switch view
            document.getElementById('dist-active-workspace-view').style.display = 'none';
            document.getElementById('dist-batch-list-view').style.display = 'block';
            this.refreshPendingDistTable();

            // Switch to History Tab
            document.querySelector('[data-calib-tab="historial"]').click();
        } catch (error) {
            console.error("Error saving distribution:", error);
            alert("❌ Ocurrió un error al guardar: " + error.message);
        }
    },

    refreshTable() {
        const tbody = document.getElementById('table-calibrado-body');
        if (!tbody) return;

        const list = window.db.getAll('calibrado_mp');
        tbody.innerHTML = '';

        const searchQuery = (document.getElementById('calib-search')?.value || '').toLowerCase().trim();
        let filtered = [...list];

        if (searchQuery) {
            filtered = filtered.filter(item => {
                return (item.lote_materia_prima || '').toLowerCase().includes(searchQuery);
            });
        }

        const sortedList = filtered.sort((a, b) => new Date(b.fecha_calibrado) - new Date(a.fecha_calibrado));

        if (sortedList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:20px; color:var(--text-muted);">No hay registros en el historial.</td></tr>`;
            return;
        }

        sortedList.forEach(item => {
            const rec = window.db.getAll('recepcion_mp').find(r => r.lote_materia_prima === item.lote_materia_prima);
            const empName = rec ? (window.db.getById('empresas', rec.empresa_id)?.nombre || 'Pachamama') : 'N/A';
            
            const destNames = item.distribucion && item.distribucion.length > 0 
                ? [...new Set(item.distribucion.map(d => d.destino))].join(', ')
                : 'Pendiente';
            
            const statusBadge = item.estado === 'PROCESADO' 
                ? `<span class="badge badge-green" style="font-size:0.7rem;">PROCESADO</span>`
                : `<span class="badge" style="font-size:0.7rem; background:#d97706; color:#fff;">ORDENADO</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="sello-lote">
                        <div class="sello-lote__label">Batch</div>
                        <div class="sello-lote__codigo">${item.lote_materia_prima}</div>
                    </div>
                </td>
                <td><strong>${empName}</strong></td>
                <td>${item.fecha_calibrado}</td>
                <td style="text-align:right; font-weight:700;">${item.kg_calibrados.toLocaleString()} Kg</td>
                <td style="text-align:right; font-weight:700; color:var(--color-exito);">${item.kg_aptos.toLocaleString()} Kg</td>
                <td style="text-align:right; color:var(--color-alerta);">${item.kg_defectos.toLocaleString()} Kg</td>
                <td style="text-align:right; color:var(--color-alerta);">${item.kg_fuera_calibre.toLocaleString()} Kg</td>
                <td style="text-align:center;">${item.calibres_descarte || ''}</td>
                <td><span style="font-size:0.75rem; font-weight:700; color:var(--accent-blue);">${destNames}</span></td>
                <td>${statusBadge}</td>
                <td style="text-align:center;">
                    <button class="btn btn-secondary btn-sm view-cal-ficha" data-id="${item.id}" style="padding:4px 8px; font-size:0.7rem; font-weight:700; margin-right:4px;">👁️ Ver Ficha</button>
                    <button class="btn btn-danger btn-sm del-cal" data-id="${item.id}" style="padding:4px 8px; font-size:0.7rem; font-weight:700;">✖</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    openDetailModal(item) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.65); display:flex; align-items:center; justify-content:center; z-index:10000; padding:20px;';
        
        // Group distribution by destination
        const destGroups = {};
        if (item.distribucion) {
            item.distribucion.forEach(d => {
                if (!destGroups[d.destino]) destGroups[d.destino] = [];
                destGroups[d.destino].push(d);
            });
        }

        const pesos = item.pesos_calibres || {};
        const rangos = item.rangos_calibres || {};
        const calibres = [5, 6, 7, 8, 9, 10, 12, 14, 16];

        modal.innerHTML = `
            <div class="card" style="width:100%; max-width:850px; max-height:90vh; overflow-y:auto; padding:24px; position:relative; box-shadow:0 10px 25px rgba(0,0,0,0.5); border: 1px solid var(--border-color); background: var(--color-tarjeta-bg || #1e293b); color: var(--text-primary);">
                <button id="modal-close-btn" style="position:absolute; top:15px; right:15px; background:none; border:none; color:var(--text-secondary); font-size:1.5rem; cursor:pointer;">&times;</button>
                
                <h2 style="margin-top:0; color:var(--color-primario); font-family:var(--fuente-titulos); border-bottom:1px solid var(--border-color); padding-bottom:10px;">📋 Ficha de Calibrado - Lote ${item.lote_materia_prima}</h2>
                
                <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:15px; margin-bottom:20px; border-bottom:1px dashed var(--border-color); padding-bottom:15px; font-size:0.82rem; line-height:1.6;">
                    <div>
                        <p style="margin:4px 0;"><span style="color:var(--text-secondary);">Fecha Calibrado:</span> <strong>${item.fecha_calibrado}</strong></p>
                        <p style="margin:4px 0;"><span style="color:var(--text-secondary);">Calibres Descarte:</span> <strong style="color:var(--color-alerta);">${item.calibres_descarte || 'Ninguno'}</strong></p>
                        <p style="margin:4px 0;"><span style="color:var(--text-secondary);">Kg Calibrados (Balanza):</span> <strong style="color:var(--text-primary); font-size:0.9rem;">${item.kg_calibrados.toLocaleString()} Kg</strong></p>
                    </div>
                    <div style="background: rgba(0,0,0,0.1); padding: 8px 12px; border-radius: 6px; border:1px solid var(--border-color);">
                        <p style="margin:4px 0;"><span style="color:var(--text-secondary);">Kg Defectos:</span> <strong style="color:var(--color-alerta);">${item.kg_defectos.toLocaleString()} Kg</strong></p>
                        <p style="margin:4px 0;"><span style="color:var(--text-secondary);">Kg Fuera Calibre:</span> <strong style="color:var(--color-alerta);">${item.kg_fuera_calibre.toLocaleString()} Kg</strong></p>
                        <p style="margin:4px 0; border-top:1px solid var(--border-color); padding-top:4px;"><span style="color:var(--text-secondary); font-weight:700;">Kg Aptos Totales:</span> <strong style="color:var(--color-exito); font-size:0.95rem;">${item.kg_aptos.toLocaleString()} Kg</strong></p>
                    </div>
                </div>

                <!-- Section: Caliber Weights and Gram Ranges from Order -->
                <h3 style="margin-top:0; font-size:0.9rem; color:var(--text-primary); text-transform:uppercase; font-weight:700;">Pesos por Calibre y Gramos del Lote:</h3>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:20px; background:rgba(0,0,0,0.1); padding:10px; border-radius:6px; border:1px solid var(--border-color);">
                    ${calibres.map(c => {
                        const rng = rangos[c] || { min: 0, max: 0 };
                        return `
                            <div style="text-align:center; font-size:0.75rem; background:rgba(255,255,255,0.02); padding:5px; border-radius:4px; border:1px solid rgba(255,255,255,0.03);">
                                <div style="color:var(--text-secondary); font-weight:600;">Cal ${c} (${rng.min}-${rng.max}g)</div>
                                <div style="font-weight:800; color:var(--accent-blue);">${(pesos[c] || 0).toFixed(1)} Kg</div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Section: Distribution breakdown -->
                <h3 style="margin-top:0; font-size:0.9rem; color:var(--text-primary); text-transform:uppercase; font-weight:700;">Distribución Detallada por Destinos:</h3>
                
                <div style="display:flex; flex-direction:column; gap:15px;">
                    ${Object.keys(destGroups).length === 0 ? '<p style="color:var(--text-muted); font-size:0.85rem; font-style:italic;">Pendiente de distribución.</p>' : 
                      Object.keys(destGroups).map(dest => {
                          const dists = destGroups[dest];
                          const destKg = dists.reduce((acc, curr) => acc + curr.kg, 0);
                          const destJabas = dists.reduce((acc, curr) => acc + curr.jabas, 0);
                          return `
                            <div style="border:1px solid var(--border-color); border-radius:8px; padding:12px; background:rgba(255,255,255,0.01);">
                                <h4 style="margin:0 0 10px 0; color:var(--color-primario); text-transform:uppercase; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center;">
                                    <span>✈️/🚢 Destino: ${dest}</span>
                                    <span style="font-size:0.75rem; color:var(--text-secondary); background:rgba(0,0,0,0.2); padding:3px 8px; border-radius:4px;">
                                        Total: <strong>${destKg.toLocaleString()} Kg</strong> / <strong>${destJabas} Jabas</strong>
                                    </span>
                                </h4>
                                <table style="width:100%; font-size:0.75rem; text-align:left; border-collapse:collapse;">
                                    <thead>
                                        <tr style="border-bottom:1px solid var(--border-color); color:var(--text-secondary);">
                                            <th style="padding:6px 4px;">Calibre</th>
                                            <th style="padding:6px 4px;">Calidad</th>
                                            <th style="padding:6px 4px; text-align:right;">Jabas</th>
                                            <th style="padding:6px 4px; text-align:right;">Kg</th>
                                            <th style="padding:6px 4px; text-align:center;">Ruta Proceso Asignada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${dists.map(d => `
                                            <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
                                                <td style="padding:6px 4px;"><strong>Calibre ${d.calibre}</strong></td>
                                                <td style="padding:6px 4px;">${d.calidad}</td>
                                                <td style="padding:6px 4px; text-align:right;">${d.jabas}</td>
                                                <td style="padding:6px 4px; text-align:right; font-weight:700; color:var(--accent-blue);">${d.kg.toLocaleString()} Kg</td>
                                                <td style="padding:6px 4px; text-align:center;">
                                                    <span class="badge ${d.empaque === 'Aéreo' ? 'badge-purple' : 'badge-green'}" style="font-size:0.65rem; padding:2px 6px;">
                                                        Empaque: ${d.empaque} | Madur: ${d.maduracion} | Hidro: ${d.hidrotermico}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                          `;
                      }).join('')
                    }
                </div>

                <div style="display:flex; justify-content:flex-end; margin-top:20px; border-top:1px solid var(--border-color); padding-top:15px;">
                    <button class="btn btn-secondary" id="modal-close-btn-bottom" style="padding: 6px 15px;">Cerrar Ficha</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const close = () => document.body.removeChild(modal);
        modal.querySelector('#modal-close-btn').addEventListener('click', close);
        modal.querySelector('#modal-close-btn-bottom').addEventListener('click', close);
    }
};

window.calibradoModule = calibradoModule;
