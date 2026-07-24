/* ==========================================================================
   Pachamama ERP - Trazabilidad Module
   ========================================================================== */

const trazabilidadModule = {
    init() {
        this.renderLayout();
        this.bindEvents();
        this.refreshHistory();
    },

    renderLayout() {
        const container = document.getElementById('view-trazabilidad');
        if (!container) return;

        const empresas = window.db.getAll('empresas').filter(e => e.estado === 'Activo');
        const empaques = window.db.getAll('tipos_empaque').filter(e => e.estado === 'Activo');
        const cajas = window.db.getAll('tipos_caja').filter(c => c.estado === 'Activo');
        const clientes = window.db.getAll('clientes').filter(c => c.estado === 'Activo');

        container.innerHTML = `
            <div class="banner">
                <div>
                    <strong>Módulo de Trazabilidad y Producción (Grilla Interactiva)</strong> - Registra el empaque diario de fruta vinculándolo con los lotes de balanza (Recepción) para asegurar la trazabilidad completa.
                </div>
            </div>

            <div class="tabs-container">
                <div class="tab-btn active" id="tab-trace-search">🔍 Consultar / Rastrear Lote</div>
                <div class="tab-btn" id="tab-trace-register">✍️ Registro de Producción (Grilla Excel)</div>
            </div>

            <!-- Tab 1: Search Panel -->
            <div class="panel-grid" id="panel-trace-search" style="display:flex; flex-direction:column; gap:24px;">
                <div class="card">
                    <h3 class="card-title">Buscar Lote de Fruta (Materia Prima o Pallet Empacado)</h3>
                    <div style="display:flex; gap:12px;">
                        <input type="text" id="input-trace-search-lote" class="form-input" style="flex:1;" placeholder="Ingresa lote de Materia Prima (ej: 26000001) o Pallet Empacado (ej: 26A000001)...">
                        <button class="btn btn-primary" id="btn-run-trace">🔎 Rastrear Lote</button>
                    </div>
                </div>

                <!-- Trace Result Container (Hidden until search) -->
                <div class="card" id="trace-result-card" style="display:none; flex-direction:column; gap:20px;">
                    <div class="card-title" style="border-bottom:1px solid var(--border-color); padding-bottom:10px; display:flex; align-items:center; gap:16px;">
                        <h2 style="margin:0;">Historial de Trazabilidad:</h2>
                        <div id="trace-sello-lote-container" style="display:inline-block; vertical-align:middle;"></div>
                        <span class="badge-ok" id="trace-status-badge" style="margin-left:auto;">REGISTRADO</span>
                    </div>

                    <!-- Flow Diagram Emulation -->
                    <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:space-between; position:relative; padding:10px 0;">
                        <div style="flex:1; min-width:140px; background-color:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px; padding:12px; text-align:center;">
                            <div style="font-size:0.75rem; color:var(--text-muted);">1. Recepción de Fruta</div>
                            <div style="font-weight:600; margin-top:4px;" id="flow-recepcion">-</div>
                        </div>
                        <div style="flex:1; min-width:140px; background-color:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px; padding:12px; text-align:center;">
                            <div style="font-size:0.75rem; color:var(--text-muted);">2. Calibrado y Calidad</div>
                            <div style="font-weight:600; margin-top:4px;" id="flow-calibrado">-</div>
                        </div>
                        <div style="flex:1; min-width:140px; background-color:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px; padding:12px; text-align:center;">
                            <div style="font-size:0.75rem; color:var(--text-muted);">3. Hidrotérmico</div>
                            <div style="font-weight:600; margin-top:4px;" id="flow-hidrotermico">-</div>
                        </div>
                        <div style="flex:1; min-width:140px; background-color:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px; padding:12px; text-align:center;">
                            <div style="font-size:0.75rem; color:var(--text-muted);">4. Maduración</div>
                            <div style="font-weight:600; margin-top:4px;" id="flow-maduracion">-</div>
                        </div>
                        <div style="flex:1; min-width:140px; background-color:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px; padding:12px; text-align:center;">
                            <div style="font-size:0.75rem; color:var(--text-muted);">5. Empaque / Producción</div>
                            <div style="font-weight:600; margin-top:4px;" id="flow-empaque">-</div>
                        </div>
                    </div>

                    <!-- Trace detail summary -->
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-top:10px;">
                        <div style="background-color:rgba(255,255,255,0.01); border:1px solid var(--border-color); border-radius:8px; padding:14px;">
                            <div style="font-size:0.8rem; color:var(--text-secondary);">Destinatario / Exportador</div>
                            <div style="font-size:1.1rem; font-weight:600; margin-top:4px;" id="det-cliente">-</div>
                            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;" id="det-destino">-</div>
                        </div>
                        <div style="background-color:rgba(255,255,255,0.01); border:1px solid var(--border-color); border-radius:8px; padding:14px;">
                            <div style="font-size:0.8rem; color:var(--text-secondary);">Empaque y Cajas</div>
                            <div style="font-size:1.1rem; font-weight:600; margin-top:4px;" id="det-cajas">-</div>
                            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;" id="det-formato">-</div>
                        </div>
                        <div style="background-color:rgba(255,255,255,0.01); border:1px solid var(--border-color); border-radius:8px; padding:14px;">
                            <div style="font-size:0.8rem; color:var(--text-secondary);">Control y Fechas</div>
                            <div style="font-size:1.1rem; font-weight:600; margin-top:4px;" id="det-supervisor">-</div>
                            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;" id="det-fecha">-</div>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; margin-top:16px; border-top:1px solid var(--border-color); padding-top:16px;">
                        <button type="button" class="btn btn-primary" id="btn-print-trace-report" style="font-weight:700; display:flex; align-items:center; gap:8px; padding:10px 20px;">
                            🖨️ Generar Reporte de Trazabilidad
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tab 2: Register Panel (Grilla Excel) -->
            <div class="panel-grid" id="panel-trace-register" style="display:none; flex-direction:column; gap:20px;">
                <div class="card" style="border:1px solid var(--border-color); padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                        <div>
                            <h2 style="margin:0; font-size:1.1rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
                                ✍️ Registro de Producción y Empaque (Grilla Estilo Excel)
                            </h2>
                            <p style="margin:4px 0 0 0; font-size:0.75rem; color:var(--text-muted);">
                                Agrega las filas que necesites, completa los campos y haz clic en Guardar Todo para procesar en lote.
                            </p>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button type="button" class="btn btn-secondary btn-sm" id="btn-grid-add-row" style="font-weight:600; display:flex; align-items:center; gap:4px; font-size:0.8rem; padding: 6px 12px;">
                                ➕ Agregar Fila
                            </button>
                            <button type="button" class="btn btn-danger btn-sm" id="btn-grid-clear-all" style="font-weight:600; display:flex; align-items:center; gap:4px; font-size:0.8rem; padding: 6px 12px;">
                                🗑️ Limpiar Todo
                            </button>
                        </div>
                    </div>

                    <!-- Excel Grid Container -->
                    <div style="overflow-x:auto; width:100%; border:1px solid var(--border-color); border-radius:8px; background:rgba(0,0,0,0.15);">
                        <table style="width:100%; border-collapse:collapse; min-width:1300px; font-size:0.82rem;" id="excel-grid-table">
                            <thead>
                                <tr style="background:rgba(255,255,255,0.03); border-bottom:1px solid var(--border-color); text-align:left;">
                                    <th style="padding:10px; font-weight:600; width:40px; text-align:center;">#</th>
                                    <th style="padding:10px; font-weight:600; width:120px;">Fecha Prod. *</th>
                                    <th style="padding:10px; font-weight:600; width:155px;">Recep Lote (Mat. Prima) *</th>
                                    <th style="padding:10px; font-weight:600; width:125px;">Variedad</th>
                                    <th style="padding:10px; font-weight:600; width:140px;">Exportador/Empaque *</th>
                                    <th style="padding:10px; font-weight:600; width:150px;">Tipo de Empaque *</th>
                                    <th style="padding:10px; font-weight:600; width:145px;">Pallet / Lote Prod. *</th>
                                    <th style="padding:10px; font-weight:600; width:150px;">Cliente Comprador *</th>
                                    <th style="padding:10px; font-weight:600; width:135px;">Tipo de Caja *</th>
                                    <th style="padding:10px; font-weight:600; width:80px; text-align:right;">Peso Caja (Kg) *</th>
                                    <th style="padding:10px; font-weight:600; width:80px; text-align:right;">Cantidad *</th>
                                    <th style="padding:10px; font-weight:600; width:100px; text-align:right;">Peso Total *</th>
                                    <th style="padding:10px; font-weight:600; width:40px; text-align:center;"></th>
                                </tr>
                            </thead>
                            <tbody id="excel-grid-body">
                                <!-- Dynamic rows added here -->
                            </tbody>
                            <tfoot>
                                <tr style="background:rgba(255,255,255,0.02); border-top:1px solid var(--border-color); font-weight:700;">
                                    <td colspan="4" style="padding:10px; text-align:right; color:var(--text-muted);">TOTALES DE LA GRILLA:</td>
                                    <td colspan="6" style="padding:10px; color:var(--text-secondary);">
                                        <span id="grid-summary-rows">0</span> filas registradas
                                    </td>
                                    <td style="padding:10px; text-align:right; color:var(--accent-blue);" id="grid-summary-cajas">0</td>
                                    <td style="padding:10px; text-align:right; color:var(--accent-emerald);" id="grid-summary-peso">0.0 Kg</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:12px;">
                        <button type="button" class="btn btn-primary" id="btn-grid-save-all" style="font-weight:700; font-size:0.9rem; padding:10px 24px; display:flex; align-items:center; gap:6px;">
                            💾 Guardar Todo en Producción
                        </button>
                    </div>
                </div>

                <!-- List -->
                <div class="card" style="overflow:hidden;">
                    <div class="card-title">
                        <h2>Historial de Movimientos de Trazabilidad y Producción</h2>
                    </div>
                    <div class="table-container" style="flex:1; overflow-y:auto; max-height:450px;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Pallet (Lote Prod)</th>
                                    <th>Lote Mat. Prima</th>
                                    <th>Exportador / Empaque</th>
                                    <th>Tipo Empaque</th>
                                    <th>Cliente Comprador</th>
                                    <th>Caja / Cantidad</th>
                                    <th>Peso Total</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody id="table-trazabilidad-body">
                                <!-- Loads dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const tabSearch = document.getElementById('tab-trace-search');
        const tabRegister = document.getElementById('tab-trace-register');
        const panelSearch = document.getElementById('panel-trace-search');
        const panelRegister = document.getElementById('panel-trace-register');

        // Tab Switching
        tabSearch.addEventListener('click', () => {
            tabSearch.classList.add('active');
            tabRegister.classList.remove('active');
            panelSearch.style.display = 'flex';
            panelRegister.style.display = 'none';
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabSearch.classList.remove('active');
            panelRegister.style.display = 'flex';
            panelSearch.style.display = 'none';
            
            // Initialize with one empty row if grid is empty
            const tbody = document.getElementById('excel-grid-body');
            if (tbody && tbody.children.length === 0) {
                this.addRow();
            }
        });

        // Run Trace Search
        const btnRunTrace = document.getElementById('btn-run-trace');
        if (btnRunTrace) {
            btnRunTrace.addEventListener('click', () => {
                this.runTraceSearch();
            });
        }

        const inputSearch = document.getElementById('input-trace-search-lote');
        if (inputSearch) {
            inputSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.runTraceSearch();
            });
        }

        // Grid buttons
        const btnAddRow = document.getElementById('btn-grid-add-row');
        if (btnAddRow) {
            btnAddRow.addEventListener('click', () => {
                this.addRow();
            });
        }

        const btnClearAll = document.getElementById('btn-grid-clear-all');
        if (btnClearAll) {
            btnClearAll.addEventListener('click', () => {
                if (confirm("¿Estás seguro de vaciar toda la grilla de registro?")) {
                    this.clearGrid();
                    this.addRow();
                }
            });
        }

        const btnSaveAll = document.getElementById('btn-grid-save-all');
        if (btnSaveAll) {
            btnSaveAll.addEventListener('click', () => {
                this.saveGridAll();
            });
        }

        const btnPrintReport = document.getElementById('btn-print-trace-report');
        if (btnPrintReport) {
            btnPrintReport.addEventListener('click', () => {
                const query = document.getElementById('input-trace-search-lote').value.trim();
                this.printTraceReport(query);
            });
        }
    },

    // Generates Pallet Code like "26A000001" dynamically based on selected date & shipping type
    generatePalletCode(dateStr, tipoEmpaqueId) {
        if (!dateStr || !tipoEmpaqueId) return '';
        
        const year = dateStr.split('-')[0]; // e.g. "2026"
        const shortYear = year.substring(2, 4); // e.g. "26"
        
        const emConfig = window.db.getById('tipos_empaque', tipoEmpaqueId);
        let type = 'P'; // default
        if (emConfig) {
            const transit = emConfig.tipo_transito ? emConfig.tipo_transito.toUpperCase() : '';
            const name = emConfig.nombre ? emConfig.nombre.toUpperCase() : '';
            if (transit.includes('AER') || transit.includes('AÉR') || name.includes('AER') || name.includes('AÉR')) {
                type = 'A';
            } else if (transit.includes('MAR') || name.includes('MAR')) {
                type = 'M';
            }
        }

        const list = window.db.getAll('trazabilidad_lotes');
        
        // Count existing lots for this year and type to make sequential
        const prefix = `${shortYear}${type}`;
        
        let maxSeq = 0;
        list.forEach(item => {
            const code = item.lote_fruta;
            if (code && code.startsWith(prefix) && code.length === 9) {
                const seqStr = code.substring(3); // e.g. "000001" -> 1
                const seq = parseInt(seqStr, 10);
                if (!isNaN(seq) && seq > maxSeq) {
                    maxSeq = seq;
                }
            }
        });

        const nextNum = maxSeq + 1;
        const paddedNum = String(nextNum).padStart(6, '0');
        
        return `${prefix}${paddedNum}`;
    },

    addRow(data = null) {
        const rowId = 'row-' + Math.random().toString(36).substring(2, 9);
        const rowData = data || {
            lote_fruta: '',
            fecha: new Date().toISOString().split('T')[0],
            lote_materia_prima: '',
            empresa_id: '',
            tipo_empaque_id: '',
            cliente_id: '',
            tipo_caja_id: '',
            peso_caja: 0,
            cantidad: 0
        };

        const tbody = document.getElementById('excel-grid-body');
        if (!tbody) return;

        const rowCount = tbody.children.length + 1;

        // Get master data lists
        const recepciones = window.db.getAll('recepcion_mp');
        const sortedRec = [...recepciones].sort((a,b) => new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`));
        const uniqueRecLotes = [...new Set(sortedRec.map(r => r.lote_materia_prima))];

        const empresas = window.db.getAll('empresas').filter(e => e.estado === 'Activo');
        const empaques = window.db.getAll('tipos_empaque').filter(e => e.estado === 'Activo');
        const cajas = window.db.getAll('tipos_caja').filter(c => c.estado === 'Activo');
        const clientes = window.db.getAll('clientes').filter(c => c.estado === 'Activo');

        const tr = document.createElement('tr');
        tr.id = rowId;
        tr.className = 'grid-row-item';
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

        tr.innerHTML = `
            <td style="padding:8px 6px; text-align:center; color:var(--text-muted); font-weight:bold;">${rowCount}</td>
            <td style="padding:4px 6px;">
                <input type="date" class="form-input grid-input-fecha" value="${rowData.fecha}" required style="font-size:0.75rem; padding:4px; background:rgba(0,0,0,0.25);">
            </td>
            <td style="padding:4px 6px;">
                <select class="form-select grid-input-recep" required style="font-size:0.75rem; padding:4px; background:rgba(0,0,0,0.25);">
                    <option value="">Lote MP...</option>
                    ${uniqueRecLotes.map(lote => {
                        const recItem = sortedRec.find(r => r.lote_materia_prima === lote);
                        const provName = window.db.getById('proveedores_mp', recItem?.proveedor_id)?.nombre || 'N/A';
                        return `<option value="${lote}" ${rowData.lote_materia_prima === lote ? 'selected' : ''}>${lote} - ${provName.substring(0, 15)}...</option>`;
                    }).join('')}
                </select>
            </td>
            <td style="padding:4px 6px; text-align:center; font-weight:600; color:var(--accent-blue);" class="grid-cell-variedad">
                -
            </td>
            <td style="padding:4px 6px;">
                <select class="form-select grid-input-empresa" required style="font-size:0.75rem; padding:4px; background:rgba(0,0,0,0.25);">
                    <option value="">Exportador...</option>
                    ${empresas.map(e => `<option value="${e.id}" ${rowData.empresa_id === e.id ? 'selected' : ''}>${e.nombre}</option>`).join('')}
                </select>
            </td>
            <td style="padding:4px 6px;">
                <select class="form-select grid-input-empaque" required style="font-size:0.75rem; padding:4px; background:rgba(0,0,0,0.25);">
                    <option value="">Tipo Empaque...</option>
                    ${empaques.map(e => `<option value="${e.id}" ${rowData.tipo_empaque_id === e.id ? 'selected' : ''}>${e.nombre}</option>`).join('')}
                </select>
            </td>
            <td style="padding:4px 6px;">
                <input type="text" class="form-input grid-input-lote" value="${rowData.lote_fruta}" placeholder="Auto" required style="font-size:0.75rem; padding:4px; font-weight:bold; color:var(--accent-orange); background:rgba(0,0,0,0.25); text-transform:uppercase;">
            </td>
            <td style="padding:4px 6px;">
                <select class="form-select grid-input-cliente" required style="font-size:0.75rem; padding:4px; background:rgba(0,0,0,0.25);">
                    <option value="">Cliente...</option>
                    ${clientes.map(c => `<option value="${c.id}" ${rowData.cliente_id === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
                </select>
            </td>
            <td style="padding:4px 6px;">
                <select class="form-select grid-input-caja" required style="font-size:0.75rem; padding:4px; background:rgba(0,0,0,0.25);">
                    <option value="">Tipo Caja...</option>
                    ${cajas.map(c => `<option value="${c.id}" ${rowData.tipo_caja_id === c.id ? 'selected' : ''}>${c.nombre.split('(')[0]}</option>`).join('')}
                </select>
            </td>
            <td style="padding:4px 6px;">
                <input type="number" step="0.01" class="form-input grid-input-pesocaja" value="${rowData.peso_caja}" required style="font-size:0.75rem; padding:4px; text-align:right; background:rgba(0,0,0,0.25);">
            </td>
            <td style="padding:4px 6px;">
                <input type="number" class="form-input grid-input-cantidad" value="${rowData.cantidad}" required min="1" style="font-size:0.75rem; padding:4px; text-align:right; background:rgba(0,0,0,0.25);">
            </td>
            <td style="padding:4px; text-align:right;" class="grid-cell-total-peso">
                ${(rowData.peso_caja * rowData.cantidad).toFixed(2)} Kg
            </td>
            <td style="padding:4px; text-align:center;">
                <button type="button" class="btn-grid-row-del" style="background:none; border:none; color:var(--accent-rose); cursor:pointer; font-size:1.1rem; padding:0; line-height:1;">✖</button>
            </td>
        `;

        // Get DOM Elements
        const inputFecha = tr.querySelector('.grid-input-fecha');
        const inputRecep = tr.querySelector('.grid-input-recep');
        const cellVariedad = tr.querySelector('.grid-cell-variedad');
        const inputEmpresa = tr.querySelector('.grid-input-empresa');
        const inputEmpaque = tr.querySelector('.grid-input-empaque');
        const inputLote = tr.querySelector('.grid-input-lote');
        const inputCaja = tr.querySelector('.grid-input-caja');
        const inputPesoCaja = tr.querySelector('.grid-input-pesocaja');
        const inputCantidad = tr.querySelector('.grid-input-cantidad');
        const cellTotalPeso = tr.querySelector('.grid-cell-total-peso');
        const btnDel = tr.querySelector('.btn-grid-row-del');

        // Autocomplete Pallet Code based on Date and Transit Type
        const autocompletePallet = () => {
            const dateVal = inputFecha.value;
            const empaqueVal = inputEmpaque.value;
            if (dateVal && empaqueVal) {
                inputLote.value = this.generatePalletCode(dateVal, empaqueVal);
            }
        };

        // Dynamically filter Box types based on selected Transit Type (Empaque)
        const filterCajasByEmpaque = () => {
            const emConfig = window.db.getById('tipos_empaque', inputEmpaque.value);
            let via = '';
            if (emConfig) {
                const transit = emConfig.tipo_transito ? emConfig.tipo_transito.toUpperCase() : '';
                const name = emConfig.nombre ? emConfig.nombre.toUpperCase() : '';
                if (transit.includes('AER') || transit.includes('AÉR') || name.includes('AER') || name.includes('AÉR')) via = 'AEREO';
                else if (transit.includes('MAR') || name.includes('MAR')) via = 'MARITIMO';
            }
            
            const filteredCajas = cajas.filter(c => {
                if (!via) return true;
                return c.tipo_empaque_via === via || c.tipo_empaque_via === 'VARIOS' || !c.tipo_empaque_via;
            });
            
            const currentVal = inputCaja.value;
            inputCaja.innerHTML = '<option value="">Tipo Caja...</option>' + 
                filteredCajas.map(c => `<option value="${c.id}" ${rowData.tipo_caja_id === c.id ? 'selected' : ''}>${c.nombre.split('(')[0]}</option>`).join('');
                
            if (filteredCajas.some(c => c.id === currentVal)) {
                inputCaja.value = currentVal;
            } else if (rowData.tipo_caja_id && filteredCajas.some(c => c.id === rowData.tipo_caja_id)) {
                inputCaja.value = rowData.tipo_caja_id;
            } else {
                inputCaja.value = '';
                inputPesoCaja.value = '';
                updateRowTotal();
            }
        };

        inputFecha.addEventListener('change', autocompletePallet);
        inputEmpaque.addEventListener('change', () => {
            autocompletePallet();
            filterCajasByEmpaque();
        });

        // Autofill weight when box changes
        inputCaja.addEventListener('change', () => {
            const boxCnf = window.db.getById('tipos_caja', inputCaja.value);
            if (boxCnf) {
                let extractedWeight = 4.0;
                const match = boxCnf.nombre.match(/(\d+(\.\d+)?)\s*Kg/i);
                if (match) {
                    extractedWeight = parseFloat(match[1]);
                }
                inputPesoCaja.value = extractedWeight;
                updateRowTotal();
            }
        });

        const updateRowTotal = () => {
            const pesoC = parseFloat(inputPesoCaja.value) || 0;
            const cant = parseInt(inputCantidad.value) || 0;
            cellTotalPeso.innerText = `${(pesoC * cant).toFixed(2)} Kg`;
            this.updateSummaryTotals();
        };

        inputPesoCaja.addEventListener('input', updateRowTotal);
        inputCantidad.addEventListener('input', updateRowTotal);

        // Autofill exporter and display variety when raw material lot changes
        inputRecep.addEventListener('change', () => {
            const selectedLMP = inputRecep.value;
            const rec = sortedRec.find(r => r.lote_materia_prima === selectedLMP);
            if (rec) {
                if (rec.empresa_id) inputEmpresa.value = rec.empresa_id;
                
                const varObj = window.db.getById('variedades', rec.variedad_id);
                cellVariedad.innerText = varObj ? varObj.nombre : 'N/A';
            } else {
                cellVariedad.innerText = '-';
            }
        });

        // Trigger change once to load initial values if editing existing data
        if (rowData.lote_materia_prima) {
            const rec = sortedRec.find(r => r.lote_materia_prima === rowData.lote_materia_prima);
            if (rec) {
                const varObj = window.db.getById('variedades', rec.variedad_id);
                cellVariedad.innerText = varObj ? varObj.nombre : 'N/A';
            }
        }

        btnDel.addEventListener('click', () => {
            tr.remove();
            this.renumberRows();
            this.updateSummaryTotals();
        });

        // Initialize dynamic filtering on load
        filterCajasByEmpaque();

        tbody.appendChild(tr);
        this.updateSummaryTotals();
    },

    renumberRows() {
        const tbody = document.getElementById('excel-grid-body');
        if (!tbody) return;
        Array.from(tbody.children).forEach((tr, idx) => {
            tr.children[0].innerText = idx + 1;
        });
    },

    updateSummaryTotals() {
        const tbody = document.getElementById('excel-grid-body');
        if (!tbody) return;

        let totalRows = tbody.children.length;
        let totalBoxes = 0;
        let totalPeso = 0;

        Array.from(tbody.children).forEach(tr => {
            const pesoC = parseFloat(tr.querySelector('.grid-input-pesocaja').value) || 0;
            const cant = parseInt(tr.querySelector('.grid-input-cantidad').value) || 0;
            totalBoxes += cant;
            totalPeso += (pesoC * cant);
        });

        document.getElementById('grid-summary-rows').innerText = totalRows;
        document.getElementById('grid-summary-cajas').innerText = totalBoxes.toLocaleString();
        document.getElementById('grid-summary-peso').innerText = `${totalPeso.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Kg`;
    },

    clearGrid() {
        const tbody = document.getElementById('excel-grid-body');
        if (tbody) tbody.innerHTML = '';
        this.updateSummaryTotals();
    },

    async saveGridAll() {
        const tbody = document.getElementById('excel-grid-body');
        if (!tbody || tbody.children.length === 0) {
            alert("No hay filas en la grilla para guardar. Agrega al menos una fila.");
            return;
        }

        const rows = Array.from(tbody.children);
        const recordsToInsert = [];
        let isValid = true;

        for (let i = 0; i < rows.length; i++) {
            const tr = rows[i];
            const rowNum = i + 1;
            const lote = tr.querySelector('.grid-input-lote').value.trim().toUpperCase();
            const fecha = tr.querySelector('.grid-input-fecha').value;
            const recep = tr.querySelector('.grid-input-recep').value;
            const empresa = tr.querySelector('.grid-input-empresa').value;
            const empaque = tr.querySelector('.grid-input-empaque').value;
            const cliente = tr.querySelector('.grid-input-cliente').value;
            const caja = tr.querySelector('.grid-input-caja').value;
            const pesoC = parseFloat(tr.querySelector('.grid-input-pesocaja').value) || 0;
            const cant = parseInt(tr.querySelector('.grid-input-cantidad').value) || 0;

            if (!lote || !fecha || !recep || !empresa || !empaque || !cliente || !caja || pesoC <= 0 || cant <= 0) {
                alert(`Error en Fila #${rowNum}: Todos los campos marcados con (*) son obligatorios y los números deben ser mayores a 0.`);
                isValid = false;
                break;
            }

            recordsToInsert.push({
                id: "TL_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                fecha,
                lote_fruta: lote,
                lote_materia_prima: recep,
                empresa_id: empresa,
                tipo_empaque_id: empaque,
                cliente_id: cliente,
                tipo_caja_id: caja,
                peso_caja: pesoC,
                cantidad: cant,
                peso_total: pesoC * cant,
                proceso_id: "PRO05", // Packaging
                supervisor_id: "SUP01",
                observaciones: `Registro masivo en Grilla. Lote MP: ${recep}`
            });
        }

        if (!isValid) return;

        // Insert in DB with async/await and error propagation
        let failedRowsCount = 0;
        let lastError = '';
        
        for (const rec of recordsToInsert) {
            try {
                await window.db.insert('trazabilidad_lotes', rec);
            } catch (err) {
                failedRowsCount++;
                lastError = err.message;
            }
        }

        if (failedRowsCount > 0) {
            alert(`⚠️ Se guardaron ${recordsToInsert.length} filas LOCALMENTE.\n\nNota: La sincronización de ${failedRowsCount} filas en la nube falló (Error: ${lastError}).`);
        } else {
            alert(`✅ Se registraron con éxito ${recordsToInsert.length} filas en la producción y empaque en la NUBE.`);
        }
        
        this.clearGrid();
        this.refreshHistory();
        this.addRow();
    },

    refreshHistory() {
        const list = window.db.getAll('trazabilidad_lotes');
        const tbody = document.getElementById('table-trazabilidad-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted);">No hay movimientos de producción registrados.</td></tr>`;
            return;
        }

        const sorted = [...list].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        sorted.forEach(item => {
            const empName = window.db.getById('empresas', item.empresa_id)?.nombre || 'PACHAMAMA';
            const emConfig = window.db.getById('tipos_empaque', item.tipo_empaque_id);
            const emName = emConfig ? emConfig.nombre : 'N/A';
            const loteMP = item.lote_materia_prima || 'N/A';
            const cliName = window.db.getById('clientes', item.cliente_id)?.nombre || 'N/A';

            let cantidad = 0;
            let pesoTotal = 0;
            let cajaTypeId = '';

            if (item.cajas && item.cajas.length > 0) {
                const cajaItem = item.cajas[0];
                cajaTypeId = cajaItem.tipo_caja_id;
                cantidad = cajaItem.cantidad;
                pesoTotal = cajaItem.peso;
            } else {
                cajaTypeId = item.tipo_caja_id;
                cantidad = item.cantidad;
                pesoTotal = item.peso_total;
            }

            const cajaConfig = window.db.getById('tipos_caja', cajaTypeId);
            const cajaName = cajaConfig ? cajaConfig.nombre.split('(')[0] : 'Caja';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.fecha}</strong></td>
                <td>
                    <div class="sello-lote" style="transform: scale(0.85) rotate(-1deg); transform-origin: left center;">
                        <div class="sello-lote__label">Batch</div>
                        <div class="sello-lote__codigo">${item.lote_fruta}</div>
                    </div>
                </td>
                <td>
                    <div class="sello-lote" style="transform: scale(0.85) rotate(1deg); transform-origin: left center;">
                        <div class="sello-lote__label">Batch</div>
                        <div class="sello-lote__codigo">${loteMP}</div>
                    </div>
                </td>
                <td><strong>${empName}</strong></td>
                <td><span class="badge badge-purple">${emName}</span></td>
                <td><strong>${cliName}</strong></td>
                <td>${cajaName} (x${cantidad})</td>
                <td><strong>${pesoTotal.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} Kg</strong></td>
                <td>
                    <button class="btn btn-danger btn-sm del-tra-rec" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem;">✖</button>
                </td>
            `;

            tr.querySelector('.del-tra-rec').addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm("¿Estás seguro de eliminar este registro?")) {
                    window.db.delete('trazabilidad_lotes', id);
                    this.refreshHistory();
                }
            });

            tbody.appendChild(tr);
        });
    },

    runTraceSearch() {
        const query = document.getElementById('input-trace-search-lote').value.trim();
        const resultCard = document.getElementById('trace-result-card');
        
        if (!query) {
            alert("Ingresa un código de lote para realizar la búsqueda.");
            return;
        }

        // Bidirectional trace search
        const list = window.db.getAll('trazabilidad_lotes').filter(t => 
            (t.lote_fruta && t.lote_fruta.toLowerCase() === query.toLowerCase()) ||
            (t.lote_materia_prima && t.lote_materia_prima.toLowerCase() === query.toLowerCase())
        );

        if (list.length === 0) {
            resultCard.style.display = 'none';
            alert(`No se encontraron registros operacionales para el lote "${query}".`);
            return;
        }

        // Fill Flow Steps
        const steps = {
            'PRO01': document.getElementById('flow-recepcion'),
            'PRO02': document.getElementById('flow-calibrado'),
            'PRO03': document.getElementById('flow-hidrotermico'),
            'PRO04': document.getElementById('flow-maduracion'),
            'PRO05': document.getElementById('flow-empaque')
        };

        // Reset flow steps
        for (let k in steps) {
            steps[k].innerText = '-';
            steps[k].parentElement.style.borderColor = 'var(--border-color)';
            steps[k].parentElement.style.backgroundColor = 'rgba(255,255,255,0.02)';
        }

        // Since we link to a raw material lot, let's mark reception as registered
        const rawLMP = list[0].lote_materia_prima;
        const matchingRecep = window.db.getAll('recepcion_mp').find(r => r.lote_materia_prima === rawLMP);
        
        if (matchingRecep) {
            const elRecep = steps['PRO01'];
            if (elRecep) {
                elRecep.innerText = '✅ RECIBIDO';
                elRecep.parentElement.style.borderColor = 'var(--accent-emerald)';
                elRecep.parentElement.style.backgroundColor = 'var(--accent-emerald-glow)';
            }
        }

        // Empaque is registered
        const elEmp = steps['PRO05'];
        if (elEmp) {
            elEmp.innerText = '✅ EMPACADO';
            elEmp.parentElement.style.borderColor = 'var(--accent-emerald)';
            elEmp.parentElement.style.backgroundColor = 'var(--accent-emerald-glow)';
        }

        // Load final details (Empaque)
        const finalRec = list[list.length - 1];
        
        const empName = window.db.getById('empresas', finalRec.empresa_id)?.nombre || 'PACHAMAMA';
        const cliName = window.db.getById('clientes', finalRec.cliente_id)?.nombre || 'N/A';
        
        let cantidad = 0;
        let pesoTotal = 0;
        let cajaTypeId = '';

        if (finalRec.cajas && finalRec.cajas.length > 0) {
            const cajaItem = finalRec.cajas[0];
            cajaTypeId = cajaItem.tipo_caja_id;
            cantidad = cajaItem.cantidad;
            pesoTotal = cajaItem.peso;
        } else {
            cajaTypeId = finalRec.tipo_caja_id;
            cantidad = finalRec.cantidad;
            pesoTotal = finalRec.peso_total;
        }

        const boxCnf = window.db.getById('tipos_caja', cajaTypeId);

        const titleSello = document.getElementById('trace-sello-lote-container');
        if (titleSello) {
            titleSello.innerHTML = `
                <div class="sello-lote">
                    <div class="sello-lote__label">Batch</div>
                    <div class="sello-lote__codigo">${query.toUpperCase()}</div>
                </div>
            `;
        } else {
            const oldTitle = document.getElementById('trace-title-lote');
            if (oldTitle) oldTitle.innerText = query.toUpperCase();
        }
        document.getElementById('det-cliente').innerText = `${empName} ➡️ ${cliName}`;
        document.getElementById('det-destino').innerText = `Lote MP Asoc: ${rawLMP} | Vía: ${window.db.getById('tipos_empaque', finalRec.tipo_empaque_id)?.tipo_transito || 'N/A'}`;
        document.getElementById('det-cajas').innerText = `${cantidad} Cajas - ${pesoTotal.toFixed(1)} Kg`;
        document.getElementById('det-formato').innerText = `Formato: ${boxCnf ? boxCnf.nombre : 'General'}`;
        document.getElementById('det-supervisor').innerText = 'Ana Gómez';
        document.getElementById('det-fecha').innerText = `F. Empaque: ${finalRec.fecha}`;

        resultCard.style.display = 'flex';
        resultCard.scrollIntoView({ behavior: 'smooth' });
    },

    printTraceReport(query) {
        if (!query) return;

        const list = window.db.getAll('trazabilidad_lotes').filter(t => 
            (t.lote_fruta && t.lote_fruta.toLowerCase() === query.toLowerCase()) ||
            (t.lote_materia_prima && t.lote_materia_prima.toLowerCase() === query.toLowerCase())
        );

        if (list.length === 0) {
            alert("No se puede generar reporte sin datos cargados.");
            return;
        }

        const finalRec = list[list.length - 1];
        const rawLMP = finalRec.lote_materia_prima;

        const recep = window.db.getAll('recepcion_mp').find(r => r.lote_materia_prima === rawLMP) || null;
        const cals = window.db.getAll('calibrado_mp').filter(c => c.lote_materia_prima === rawLMP);

        const empName = window.db.getById('empresas', finalRec.empresa_id)?.nombre || 'PACHAMAMA';
        const cliName = window.db.getById('clientes', finalRec.cliente_id)?.nombre || 'N/A';
        const transit = window.db.getById('tipos_empaque', finalRec.tipo_empaque_id)?.tipo_transito || 'N/A';

        let totalJabasCal = 0;
        let totalKgCal = 0;
        let calibradoRowsHtml = '';

        cals.forEach(c => {
            if (c.distribucion && Array.isArray(c.distribucion)) {
                c.distribucion.forEach(d => {
                    totalJabasCal += d.jabas;
                    totalKgCal += d.kg;
                    calibradoRowsHtml += `
                        <tr>
                            <td>${c.fecha_calibrado}</td>
                            <td>Destino: ${d.destino}</td>
                            <td><strong>${d.calidad}</strong></td>
                            <td>Cal. ${d.calibre}</td>
                            <td style="text-align:right;">${d.jabas} jabas</td>
                            <td style="text-align:right;"><strong>${d.kg.toLocaleString()} Kg</strong></td>
                        </tr>
                    `;
                });
            }
        });

        if (calibradoRowsHtml === '') {
            calibradoRowsHtml = `<tr><td colspan="6" style="text-align:center; color:#999; padding: 15px;">No hay registros de calibrado para este lote</td></tr>`;
        }

        let qcHtml = '<p style="color:#666; font-size:12px;">Sin evaluación de calidad registrada.</p>';
        if (recep && recep.calidad) {
            const qc = recep.calidad;
            qcHtml = `
                <table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:0.85rem;">
                    <tr>
                        <td style="padding:6px; border:1px solid #ddd; background:#f9f9f9; font-weight:600; width:25%;">Resultado General</td>
                        <td style="padding:6px; border:1px solid #ddd; font-weight:bold; color:${qc.estado === 'APROBADO' ? '#4A6B1E' : '#B23A1D'};">${qc.estado}</td>
                        <td style="padding:6px; border:1px solid #ddd; background:#f9f9f9; font-weight:600; width:25%;">Brix Promedio</td>
                        <td style="padding:6px; border:1px solid #ddd;">${qc.brix || 0}°Bx</td>
                    </tr>
                    <tr>
                        <td style="padding:6px; border:1px solid #ddd; background:#f9f9f9; font-weight:600;">Temperatura</td>
                        <td style="padding:6px; border:1px solid #ddd;">${qc.temperatura || 0}°C</td>
                        <td style="padding:6px; border:1px solid #ddd; background:#f9f9f9; font-weight:600;">Calibre Predominante</td>
                        <td style="padding:6px; border:1px solid #ddd;">Cal. ${qc.calibre || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px; border:1px solid #ddd; background:#f9f9f9; font-weight:600;">Fruta Certificada</td>
                        <td style="padding:6px; border:1px solid #ddd;">${qc.fruta_certificada || 'SI'}</td>
                        <td style="padding:6px; border:1px solid #ddd; background:#f9f9f9; font-weight:600;">Materia Seca Prom.</td>
                        <td style="padding:6px; border:1px solid #ddd;">${qc.materia_seca_promedio || '-'} %</td>
                    </tr>
                    <tr>
                        <td style="padding:6px; border:1px solid #ddd; background:#f9f9f9; font-weight:600;">Condición Lote</td>
                        <td style="padding:6px; border:1px solid #ddd;">${qc.condicion_lote || 'MARITIMO'}</td>
                        <td style="padding:6px; border:1px solid #ddd; background:#f9f9f9; font-weight:600;">Total Defectos</td>
                        <td style="padding:6px; border:1px solid #ddd;">${qc.defectos_totales || 0} und (${qc.porcentaje_aceptable || 100}% Aceptable)</td>
                    </tr>
                </table>
            `;
        }

        const w = window.open('', '_blank');
        w.document.write(`
            <html>
            <head>
                <title>Reporte de Trazabilidad - Lote ${query.toUpperCase()}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #2B1E10; padding: 30px; line-height: 1.5; background: #fff; }
                    .header-table { width: 100%; border-bottom: 3px solid #FFA33C; padding-bottom: 12px; margin-bottom: 20px; }
                    .logo-title { font-size: 24px; font-weight: bold; color: #FFA33C; text-transform: uppercase; letter-spacing: 1px; }
                    .report-title { font-size: 20px; font-weight: bold; color: #2B1E10; text-align: right; text-transform: uppercase; }
                    .section-title { font-size: 13px; font-weight: bold; color: #2B1E10; background: #EAF1DE; border-left: 5px solid #8BAE3C; padding: 6px 12px; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
                    table.data-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
                    table.data-table th { background: #f2ede2; border: 1px solid #c5bcae; padding: 8px; font-weight: bold; text-align: left; }
                    table.data-table td { border: 1px solid #e1dacb; padding: 8px; }
                    .sello-box { display: inline-block; background: #2B1E10; color: #FFA33C; padding: 6px 12px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold; }
                    .footer-print { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 11px; color: #777; display: flex; justify-content: space-between; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print" style="margin-bottom: 20px; text-align: right;">
                    <button onclick="window.print();" style="padding: 10px 20px; background: #FFA33C; border: none; color: #fff; font-weight: bold; border-radius: 4px; cursor: pointer;">🖨️ Imprimir Reporte</button>
                    <button onclick="window.close();" style="padding: 10px 20px; background: #6B6153; border: none; color: #fff; font-weight: bold; border-radius: 4px; cursor: pointer; margin-left: 8px;">Cerrar</button>
                </div>

                <table class="header-table">
                    <tr>
                        <td>
                            <div class="logo-title">🍋 PACHAMAMA ERP 🥭</div>
                            <div style="font-size: 12px; color: #6B6153;">Planta Exportadora de Mango y Limón</div>
                        </td>
                        <td>
                            <div class="report-title">Reporte de Trazabilidad Integral</div>
                            <div style="font-size: 12px; color: #6b6153; text-align: right;">Generado: ${new Date().toLocaleString()}</div>
                        </td>
                    </tr>
                </table>

                <div style="display:flex; justify-content:space-between; align-items:center; background:#F6F1E4; padding:15px; border-radius:6px; margin-bottom:20px; border:1px solid #6B6153;">
                    <div>
                        <span style="font-size:12px; color:#6B6153; text-transform:uppercase; font-weight:bold; display:block;">Código de Batch Buscado:</span>
                        <div class="sello-box">${query.toUpperCase()}</div>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:12px; color:#6B6153; text-transform:uppercase; font-weight:bold; display:block;">Asociación Lote MP:</span>
                        <span style="font-size:18px; font-weight:bold; color:#2B1E10;">Lote ${rawLMP}</span>
                    </div>
                </div>

                <!-- Recepción -->
                <div class="section-title">1. Recepción en Planta y Calidad de Materia Prima</div>
                ${recep ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Fecha/Hora Recepción</th>
                            <th>Proveedor / Fundo</th>
                            <th>Variedad</th>
                            <th>Empresa / Cliente</th>
                            <th style="text-align:right;">Jabas Guía / Planta</th>
                            <th style="text-align:right;">Peso Guía / Planta</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${recep.fecha} | ${recep.hora} hrs</td>
                            <td>
                                <strong>${window.db.getById('proveedores_mp', recep.proveedor_id)?.nombre || 'N/A'}</strong><br>
                                <span style="font-size:11px; color:#555;">Fundo: ${window.db.getById('proveedores_mp', recep.proveedor_id)?.fundo || '-'}</span>
                            </td>
                            <td>${window.db.getById('variedades', recep.variedad_id)?.nombre || 'N/A'}</td>
                            <td><strong>${empName}</strong> ➡️ ${cliName}</td>
                            <td style="text-align:right;">${recep.cant_jabas_guia || recep.cant_jabas} jb / ${recep.cant_jabas} jb</td>
                            <td style="text-align:right;">${(recep.peso_guia || recep.peso_neto).toLocaleString()} Kg / ${recep.peso_neto.toLocaleString()} Kg</td>
                        </tr>
                    </tbody>
                </table>
                <h4 style="margin: 15px 0 5px 0; font-size:12px; color:#2B1E10; text-transform:uppercase;">Control de Calidad</h4>
                ${qcHtml}
                ` : '<p style="color:#666; font-size:13px;">No se encontró registro de recepción de materia prima asociado a este lote.</p>'}

                <!-- Calibrado -->
                <div class="section-title">2. Proceso de Calibrado y Descarte</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Fecha Proceso</th>
                            <th>Identificador Pallet</th>
                            <th>Categoría Fitosanitaria</th>
                            <th>Calibre</th>
                            <th style="text-align:right;">Jabas Procesadas</th>
                            <th style="text-align:right;">Peso Neto Calibrado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${calibradoRowsHtml}
                    </tbody>
                    <tfoot style="font-weight:bold; background:#f2ede2;">
                        <tr>
                            <td colspan="4" style="text-align:right;">TOTALES CALIBRADO:</td>
                            <td style="text-align:right;">${totalJabasCal} envases</td>
                            <td style="text-align:right;">${totalKgCal.toLocaleString()} Kg</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- Empaque -->
                <div class="section-title">3. Empaque de Producto Terminado y Despacho</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Fecha Empaque</th>
                            <th>Código Pallet Fruta</th>
                            <th>Cliente / Destinatario</th>
                            <th>Vía Tránsito</th>
                            <th style="text-align:right;">Formato Cajas</th>
                            <th style="text-align:right;">Total Cajas</th>
                            <th style="text-align:right;">Total Peso Neto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(item => {
                            const cajaCfg = window.db.getById('tipos_caja', item.cajas?.[0]?.tipo_caja_id || item.tipo_caja_id);
                            const cajaName = cajaCfg ? cajaCfg.nombre : 'General';
                            const cantCajas = item.cajas?.[0]?.cantidad || item.cantidad;
                            const pesoNet = item.cajas?.[0]?.peso || item.peso_total;
                            return `
                            <tr>
                                <td>${item.fecha}</td>
                                <td><strong>${item.lote_fruta}</strong></td>
                                <td>${cliName}</td>
                                <td>🚢 ${transit}</td>
                                <td style="text-align:right;">${cajaName}</td>
                                <td style="text-align:right;">${cantCajas} cajas</td>
                                <td style="text-align:right;"><strong>${pesoNet.toLocaleString()} Kg</strong></td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <div class="footer-print">
                    <span>PACHAMAMA ERP - Sistema de Control de Trazabilidad Planta</span>
                    <span>Página 1 de 1</span>
                    <span>Firma Responsable Fitosanitario: ___________________________</span>
                </div>
            </body>
            </html>
        `);
        w.document.close();
    }
};

window.trazabilidadModule = trazabilidadModule;
