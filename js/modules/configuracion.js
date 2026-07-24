/* ==========================================================================
   Pachamama ERP - Configuration Module
   ========================================================================== */

const configuracionModule = {
    activeSubSection: 'personal',

    async importExcelFile(dbKey, file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    
                    let importedCount = 0;
                    
                    if (dbKey === 'grupos' || dbKey === 'personal') {
                        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        const groupDefs = {}; // groupNum -> area
                        const workers = [];
                        
                        rows.forEach((row, idx) => {
                            if (idx === 0 || !row[0] || String(row[0]).includes('DNI')) {
                                return;
                            }
                            
                            const dni = String(row[0]).trim();
                            const fullName = String(row[1]).trim();
                            const labor = row[2] ? String(row[2]).trim() : 'VARIOS';
                            const groupNum = row[3] ? String(row[3]).trim() : 'GRUPO 1';
                            const areaRaw = row[4] ? String(row[4]).trim().toUpperCase() : '';
                            
                            let areaMapped = 'Otro';
                            if (areaRaw.includes('EMPAQUE')) areaMapped = 'Empaque';
                            else if (areaRaw.includes('RECEPCION') || areaRaw.includes('RECEPCIÓN')) areaMapped = 'Recepción';
                            else if (areaRaw.includes('CALIBRADO')) areaMapped = 'Calibrado';
                            else if (areaRaw.includes('HIDRO') || areaRaw.includes('HIDROTÉRMICO')) areaMapped = 'Tratamiento Hidrotérmico';
                            else if (areaRaw.includes('DESPACHO')) areaMapped = 'Despacho';
                            else if (areaRaw) areaMapped = areaRaw.charAt(0) + areaRaw.slice(1).toLowerCase();
                            
                            groupDefs[groupNum] = areaMapped;
                            
                            let nombre = fullName;
                            let apellidos = '';
                            if (fullName.includes(',')) {
                                const parts = fullName.split(',');
                                apellidos = parts[0].trim();
                                nombre = parts[1].trim();
                            }
                            
                            workers.push({ dni, nombre, apellidos, labor, groupNum });
                        });
                        
                        const groupMap = {};
                        for (let [groupNum, areaMapped] of Object.entries(groupDefs)) {
                            const groupCodeUpper = groupNum.toUpperCase();
                            let existingGroup = window.db.getAll('grupos').find(g => g.codigo_grupo.toUpperCase() === groupCodeUpper);
                            
                            const groupRecord = {
                                codigo_grupo: groupNum,
                                area_proceso: areaMapped,
                                supervisor_id: 'SUP01',
                                turno_habitual: 'Día',
                                estado: 'Activo'
                            };
                            
                            if (!existingGroup) {
                                await window.db.insert('grupos', groupRecord);
                                const updatedGroups = window.db.getAll('grupos');
                                existingGroup = updatedGroups.find(g => g.codigo_grupo.toUpperCase() === groupCodeUpper);
                            } else {
                                await window.db.update('grupos', existingGroup.id, { area_proceso: areaMapped });
                            }
                            
                            if (existingGroup) {
                                groupMap[groupNum] = existingGroup;
                            }
                        }
                        
                        const personalList = window.db.getAll('personal');
                        const laboresList = window.db.getAll('labores');
                        
                        for (let w of workers) {
                            const laborUpper = w.labor.toUpperCase();
                            let laborObj = laboresList.find(l => l.nombre.toUpperCase() === laborUpper);
                            if (!laborObj) {
                                const newLabor = {
                                    nombre: w.labor,
                                    estado: 'Activo'
                                };
                                await window.db.insert('labores', newLabor);
                                const updatedLabores = window.db.getAll('labores');
                                laborObj = updatedLabores.find(l => l.nombre.toUpperCase() === laborUpper);
                            }
                            
                            const groupObj = groupMap[w.groupNum];
                            const groupId = groupObj ? groupObj.id : 'GRP01';
                            const laborId = laborObj ? laborObj.id : 'LAB01';
                            
                            const existingWorker = personalList.find(p => p.dni === w.dni);
                            const workerRecord = {
                                dni: w.dni,
                                nombre: w.nombre,
                                apellidos: w.apellidos,
                                grupo_id: groupId,
                                labor_id: laborId,
                                estado: 'Activo',
                                codigo: 'T' + w.dni.substring(w.dni.length - 3)
                            };
                            
                            if (existingWorker) {
                                await window.db.update('personal', existingWorker.id, workerRecord);
                            } else {
                                await window.db.insert('personal', workerRecord);
                            }
                            importedCount++;
                        }
                        
                        resolve(importedCount);
                        return;
                    }
                    
                    const rows = XLSX.utils.sheet_to_json(worksheet);
                    for (let row of rows) {
                        const cleanRow = {};
                        for (let [k, v] of Object.entries(row)) {
                            cleanRow[k.trim().toUpperCase()] = v ? String(v).trim() : '';
                        }

                        let record = {};
                        if (dbKey === 'proveedores_mp') {
                            const nombre = cleanRow['PROVEEDOR'] || cleanRow['NOMBRE PROVEEDOR'] || cleanRow['NOMBRE'] || cleanRow['NOMBRE_PROVEEDOR'] || '';
                            if (!nombre) continue;
                            const fundo = cleanRow['FUNDO'] || 'N/A';
                            const valle = cleanRow['VALLE'] || 'N/A';
                            const clp = cleanRow['CLP'] || '015-0291-0000';
                            record = { nombre: nombre.toUpperCase(), fundo, valle, clp, estado: 'Activo' };
                        } else if (dbKey === 'variedades') {
                            const nombre = cleanRow['VARIEDAD'] || cleanRow['NOMBRE'] || '';
                            if (!nombre) continue;
                            const producto = cleanRow['PRODUCTO'] || 'MANGO';
                            record = { nombre: nombre.toUpperCase(), producto: producto.toUpperCase(), estado: 'Activo' };
                        } else if (dbKey === 'productos') {
                            const nombre = cleanRow['PRODUCTO'] || cleanRow['NOMBRE'] || '';
                            if (!nombre) continue;
                            record = { nombre: nombre.toUpperCase(), estado: 'Activo' };
                        } else if (dbKey === 'grupos') {
                            const codigo_grupo = cleanRow['GRUPO'] || cleanRow['CODIGO_GRUPO'] || cleanRow['CODIGO GRUPO'] || '';
                            if (!codigo_grupo) continue;
                            const supervisor_id = cleanRow['SUPERVISOR'] || 'SUP01';
                            const turno_habitual = cleanRow['TURNO'] || 'Día';
                            record = { codigo_grupo, supervisor_id, turno_habitual, estado: 'Activo' };
                        } else if (dbKey === 'personal') {
                            const dni = cleanRow['DNI'] || '';
                            if (!dni) continue;
                            const nombre = cleanRow['NOMBRE'] || '';
                            const apellidos = cleanRow['APELLIDOS'] || '';
                            const grupo_id = cleanRow['GRUPO'] || 'GRP01';
                            const labor_id = cleanRow['LABOR'] || 'LAB01';
                            record = { dni, nombre, apellidos, grupo_id, labor_id, estado: 'Activo' };
                        } else if (dbKey === 'supervisores') {
                            const nombre = cleanRow['SUPERVISOR'] || cleanRow['NOMBRE'] || cleanRow['NOMBRE SUPERVISOR'] || '';
                            if (!nombre) continue;
                            const dni = cleanRow['DNI'] || '';
                            record = { nombre: nombre.toUpperCase(), dni, estado: 'Activo' };
                        } else {
                            const nombre = cleanRow['NOMBRE'] || cleanRow['CLIENTE'] || cleanRow['EMPRESA'] || cleanRow['DESCRIPCION'] || '';
                            if (!nombre) continue;
                            record = { nombre: nombre.toUpperCase(), estado: 'Activo' };
                        }

                        let existing = null;
                        if (dbKey === 'personal') {
                            existing = window.db.getAll(dbKey).find(item => item.dni === record.dni);
                        } else if (dbKey === 'supervisores') {
                            existing = window.db.getAll(dbKey).find(item => item.nombre.toLowerCase() === record.nombre.toLowerCase());
                        } else if (dbKey === 'proveedores_mp') {
                            existing = window.db.getAll(dbKey).find(item => item.nombre.toLowerCase() === record.nombre.toLowerCase());
                        } else if (dbKey === 'variedades') {
                            existing = window.db.getAll(dbKey).find(item => item.nombre.toLowerCase() === record.nombre.toLowerCase() && item.producto.toLowerCase() === record.producto.toLowerCase());
                        } else if (dbKey === 'grupos') {
                            existing = window.db.getAll(dbKey).find(item => item.codigo_grupo.toLowerCase() === record.codigo_grupo.toLowerCase());
                        } else {
                            existing = window.db.getAll(dbKey).find(item => item.nombre && item.nombre.toLowerCase() === record.nombre.toLowerCase());
                        }

                        if (existing) {
                            await window.db.update(dbKey, existing.id, record);
                        } else {
                            await window.db.insert(dbKey, record);
                        }
                        importedCount++;
                    }
                    resolve(importedCount);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        });
    },

    init() {
        this.renderLayout();
        this.bindEvents();
        this.loadSubSection(this.activeSubSection);
    },

    renderLayout() {
        const container = document.getElementById('view-configuracion');
        if (!container) return;

        container.innerHTML = `
            <div class="banner" style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div>
                        <strong>Módulo de Configuración de Tablas Maestras</strong> - Administra las entidades principales del sistema. Los cambios aquí afectarán la captura de datos operacionales.
                    </div>
                </div>
            </div>
            
            <div class="panel-grid split-sidebar">
                <!-- Config Navigation -->
                <div class="card">
                    <h3 class="card-title" style="font-size: 0.95rem; text-transform: uppercase; color: var(--text-muted);">Tablas Maestras</h3>
                    <div class="config-nav">
                        <div class="config-nav-btn active" data-sub="personal">👥 Personal</div>
                        <div class="config-nav-btn" data-sub="supervisores">👮 Supervisores</div>
                        <div class="config-nav-btn" data-sub="grupos">🛡️ Grupos</div>
                        <div class="config-nav-btn" data-sub="labores">🔨 Labores</div>
                        <div class="config-nav-btn" data-sub="turnos">⏰ Turnos</div>
                        <div class="config-nav-btn" data-sub="cajas">📦 Tipos de Caja</div>
                        <div class="config-nav-btn" data-sub="empaques">🏷️ Tipos de Empaque</div>
                        <div class="config-nav-btn" data-sub="programa">📊 Programa Exportación</div>
                        <div class="config-nav-btn" data-sub="empresas">🏢 Empresas</div>
                        <div class="config-nav-btn" data-sub="clientes">🤝 Clientes</div>
                        <div class="config-nav-btn" data-sub="proveedores">🌾 Proveedores</div>
                        <div class="config-nav-btn" data-sub="variedades">🥭 Variedades</div>
                        <div class="config-nav-btn" data-sub="productos">🍎 Productos</div>
                        <div class="config-nav-btn" data-sub="paradas">🛑 Motivos de Parada</div>
                    </div>
                    <h3 class="card-title" style="font-size: 0.95rem; text-transform: uppercase; color: var(--text-muted); margin-top: 20px;">Ajustes del Sistema</h3>
                    <div class="config-nav" style="margin-top: 8px;">
                        <div class="config-nav-btn" data-sub="modulos">👁️ Visibilidad de Módulos</div>
                        <div class="config-nav-btn" data-sub="cloud">☁️ Conexión Google Cloud</div>
                    </div>
                </div>

                <!-- Config Forms & Lists -->
                <div class="card" id="config-content-pane">
                    <!-- Dynamic content will load here -->
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Switch sub-sections
        const navBtns = document.querySelectorAll('.config-nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeSubSection = btn.dataset.sub;
                this.loadSubSection(this.activeSubSection);
            });
        });
    },

    loadSubSection(section) {
        const oldPane = document.getElementById('config-content-pane');
        if (!oldPane) return;
        
        // Clonar el panel para eliminar listeners acumulados y evitar múltiples confirmaciones
        const pane = oldPane.cloneNode(false);
        oldPane.parentNode.replaceChild(pane, oldPane);

        pane.innerHTML = '';

        switch (section) {
            case 'personal':
                this.renderPersonal(pane);
                break;
            case 'supervisores':
                this.renderSupervisores(pane);
                break;
            case 'labores':
                this.renderSimpleTable(pane, 'labores', 'Labor', ['Nombre', 'Estado'], (item) => [item.nombre, item.estado]);
                break;
            case 'empresas':
                this.renderSimpleTable(pane, 'empresas', 'Empresa', ['Nombre', 'Estado'], (item) => [item.nombre, item.estado]);
                break;
            case 'clientes':
                this.renderSimpleTable(pane, 'clientes', 'Cliente', ['Nombre', 'Estado'], (item) => [item.nombre, item.estado]);
                break;
            case 'proveedores':
                this.renderProveedores(pane);
                break;
            case 'variedades':
                this.renderVariedades(pane);
                break;
            case 'productos':
                this.renderSimpleTable(pane, 'productos', 'Producto', ['Nombre', 'Estado'], (item) => [item.nombre, item.estado]);
                break;
            case 'paradas':
                this.renderSimpleTable(pane, 'motivos_parada', 'Motivo de Parada', ['Nombre', 'Estado'], (item) => [item.nombre, item.estado]);
                break;
            case 'turnos':
                this.renderTurnos(pane);
                break;
            case 'cajas':
                this.renderCajas(pane);
                break;
            case 'empaques':
                this.renderEmpaques(pane);
                break;
            case 'grupos':
                this.renderGrupos(pane);
                break;
            case 'programa':
                this.renderPrograma(pane);
                break;
            case 'modulos':
                this.renderModulos(pane);
                break;
            case 'cloud':
                this.renderCloudConfig(pane);
                break;
        }
    },

    // 👥 Render Personal Form and Table
    renderPersonal(pane) {
        const list = window.db.getAll('personal');
        const supervisores = window.db.getAll('supervisores');
        const grupos = window.db.getAll('grupos');
        const labores = window.db.getAll('labores');

        pane.innerHTML = `
            <div class="card-title">
                <h2>Administrar Personal</h2>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button class="btn btn-secondary" id="btn-export-personal">📥 Exportar CSV</button>
                    <button class="btn btn-secondary" id="btn-import-personal-excel">📤 Importar Excel</button>
                    <input type="file" id="file-import-personal-excel" style="display:none;" accept=".xlsx, .xls">
                    <button class="btn btn-primary" id="btn-new-personal">+ Nuevo Trabajador</button>
                </div>
            </div>

            <!-- Excel Import Panel (Collapsible) -->
            <div id="personal-excel-import-panel" style="display: none; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-direction: column; gap: 12px; margin-bottom: 15px; background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px; width: 100%;">
                <h3 style="margin:0 0 4px 0; font-size:0.85rem; font-weight: 700; color: var(--color-primario);">Copiar y pegar columnas de Excel (Personal / Trabajadores)</h3>
                <p style="font-size:0.75rem; color:var(--text-secondary); margin:0 0 4px 0;">Pega las columnas desde Excel. Orden requerido: <strong>DNI | Nombres | Apellidos | Sexo (M/F) | Código Ficha (opcional) | Labor (opcional) | Grupo (opcional) | Costo H. Normal (opcional)</strong></p>
                <textarea id="personal-excel-data" class="form-input" style="height:120px; font-family:monospace; font-size:0.75rem; background: var(--color-fondo);" placeholder="Ejemplo:&#10;77665544	Juan	Perez	M	T001	Selección	GRUPO A	10.25&#10;88776655	Maria	Lopez	F	T002	Empaque	GRUPO B	11.50"></textarea>
                <div style="display:flex; gap:10px; justify-content: flex-end; margin-top:8px;">
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-close-personal-excel" style="font-size:0.75rem; padding:4px 10px;">Cerrar</button>
                    <button type="button" class="btn btn-primary btn-sm" id="btn-process-personal-excel" style="font-size:0.75rem; padding:4px 10px;">Procesar e Importar</button>
                </div>
            </div>
            
            <!-- Add/Edit Panel (Hidden by default) -->
            <form id="form-personal" style="display: none; border-bottom: 1px solid var(--border-color); padding-bottom: 24px; flex-direction: column; gap: 16px;">
                <input type="hidden" id="per-id">
                <div class="form-row">
                    <div class="form-group">
                        <label>Código Ficha</label>
                        <input type="text" id="per-codigo" class="form-input" required placeholder="T001">
                    </div>
                    <div class="form-group">
                        <label>DNI</label>
                        <input type="text" id="per-dni" class="form-input" required placeholder="DNI">
                    </div>
                    <div class="form-group">
                        <label>Nombres</label>
                        <input type="text" id="per-nombre" class="form-input" required placeholder="Juan">
                    </div>
                    <div class="form-group">
                        <label>Apellidos</label>
                        <input type="text" id="per-apellidos" class="form-input" required placeholder="Pérez">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Sexo</label>
                        <select id="per-sexo" class="form-select">
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Fecha de Ingreso</label>
                        <input type="date" id="per-fecha" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label>Supervisor Asignado</label>
                        <select id="per-supervisor" class="form-select">
                            ${supervisores.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Grupo Permanente</label>
                        <select id="per-grupo" class="form-select">
                            ${grupos.map(g => `<option value="${g.id}">${g.codigo_grupo}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Labor Principal</label>
                        <select id="per-labor" class="form-select">
                            ${labores.map(l => `<option value="${l.id}">${l.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Contrato</label>
                        <select id="per-contrato" class="form-select">
                            <option value="Temporal">Temporal / Campaña</option>
                            <option value="Indefinido">Indefinido</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Costo Hora Normal</label>
                        <input type="number" step="0.01" id="per-costo-normal" class="form-input" required placeholder="10.00">
                    </div>
                    <div class="form-group">
                        <label>Costo Hora Extra</label>
                        <input type="number" step="0.01" id="per-costo-extra" class="form-input" required placeholder="15.00">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Bono Nocturno (hora)</label>
                        <input type="number" step="0.01" id="per-bono" class="form-input" required value="2.50">
                    </div>
                    <div class="form-group">
                        <label>Moneda Pago</label>
                        <select id="per-moneda" class="form-select">
                            <option value="PEN">Soles (S/.)</option>
                            <option value="USD">Dólares ($)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="per-estado" class="form-select">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo (Cesado / Despedido)</option>
                        </select>
                    </div>
                </div>

                <div class="form-row" id="row-cese-container" style="display: none; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(244, 63, 94, 0.02); padding: 12px; border-radius: 8px; border: 1px dashed var(--accent-rose);">
                    <div class="form-group" style="margin:0;">
                        <label style="color: var(--accent-rose); font-weight:700;">Fecha de Cese / Salida *</label>
                        <input type="date" id="per-fecha-cese" class="form-input">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label style="color: var(--accent-rose); font-weight:700;">Motivo de Cese *</label>
                        <select id="per-motivo-cese" class="form-select">
                            <option value="">Selecciona motivo...</option>
                            <option value="Renuncia">Renuncia Voluntaria</option>
                            <option value="Despido">Despido / Cese Operativo</option>
                            <option value="Fin de Contrato">Fin de Contrato</option>
                            <option value="Abandono de Trabajo">Abandono de Trabajo</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Observaciones</label>
                    <input type="text" id="per-obs" class="form-input" placeholder="Ninguna">
                </div>

                <div style="display:flex; gap:10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-personal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>

            <!-- Table -->
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombres y Apellidos</th>
                            <th>DNI</th>
                            <th>Labor</th>
                            <th>Grupo</th>
                            <th>Supervisor</th>
                            <th>Costo H.</th>
                            <th>Estado</th>
                            <th style="width: 120px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="table-personal-body">
                        ${list.map(p => {
                            const sup = supervisores.find(s => s.id === p.supervisor_id)?.nombre || 'N/A';
                            const grp = grupos.find(g => g.id === p.grupo_id)?.codigo_grupo || 'N/A';
                            const lab = labores.find(l => l.id === p.labor_id)?.nombre || 'N/A';
                            return `
                                <tr>
                                    <td><strong>${p.codigo}</strong></td>
                                    <td>${p.nombre} ${p.apellidos}</td>
                                    <td>${p.dni}</td>
                                    <td>${lab}</td>
                                    <td>${grp}</td>
                                    <td>${sup}</td>
                                    <td>${p.moneda === 'PEN' ? 'S/.' : '$'}${Number(p.costo_hora_normal).toFixed(2)}</td>
                                    <td>
                                        ${p.estado === 'Activo' ? 
                                            '<span class="badge badge-green">Activo</span>' : 
                                            `<span class="badge badge-rose" title="Cese: ${p.fecha_cese || 'N/A'}">Cesado: ${p.motivo_cese || 'Inactivo'}</span>`
                                        }
                                    </td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm edit-per" data-id="${p.id}" style="padding:4px 8px; font-size:0.75rem;">Editar</button>
                                        <button class="btn btn-danger btn-sm del-per" data-id="${p.id}" style="padding:4px 8px; font-size:0.75rem;">Eliminar</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Toggle Form
        const btnNew = document.getElementById('btn-new-personal');
        const form = document.getElementById('form-personal');
        const btnCancel = document.getElementById('btn-cancel-personal');

        document.getElementById('btn-export-personal').addEventListener('click', () => {
            this.exportTableToCSV('personal');
        });

        // Excel Upload event bindings
        const fileInput = document.getElementById('file-import-personal-excel');
        const uploadBtn = document.getElementById('btn-import-personal-excel');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const count = await this.importExcelFile('personal', file);
                    alert(`¡Importación exitosa! Se procesaron ${count} registros de Personal.`);
                    this.loadSubSection('personal');
                } catch (err) {
                    console.error(err);
                    alert("❌ Error al importar Excel: " + err.message);
                }
            });
        }

        const estadoSelect = document.getElementById('per-estado');
        const ceseContainer = document.getElementById('row-cese-container');
        const toggleCeseFields = () => {
            if (estadoSelect.value === 'Inactivo') {
                ceseContainer.style.display = 'grid';
            } else {
                ceseContainer.style.display = 'none';
            }
        };
        estadoSelect.addEventListener('change', toggleCeseFields);

        btnNew.addEventListener('click', () => {
            document.getElementById('per-id').value = '';
            form.reset();
            ceseContainer.style.display = 'none';
            form.style.display = 'flex';
        });

        btnCancel.addEventListener('click', () => {
            form.style.display = 'none';
        });

        // Submit form
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('per-id').value;
            const data = {
                codigo: document.getElementById('per-codigo').value,
                dni: document.getElementById('per-dni').value,
                nombre: document.getElementById('per-nombre').value,
                apellidos: document.getElementById('per-apellidos').value,
                sexo: document.getElementById('per-sexo').value,
                fecha_ingreso: document.getElementById('per-fecha').value,
                supervisor_id: document.getElementById('per-supervisor').value,
                grupo_id: document.getElementById('per-grupo').value,
                labor_id: document.getElementById('per-labor').value,
                tipo_contrato: document.getElementById('per-contrato').value,
                costo_hora_normal: parseFloat(document.getElementById('per-costo-normal').value),
                costo_hora_extra: parseFloat(document.getElementById('per-costo-extra').value),
                bono_nocturno: parseFloat(document.getElementById('per-bono').value),
                moneda: document.getElementById('per-moneda').value,
                estado: document.getElementById('per-estado').value,
                fecha_cese: document.getElementById('per-estado').value === 'Inactivo' ? document.getElementById('per-fecha-cese').value : '',
                motivo_cese: document.getElementById('per-estado').value === 'Inactivo' ? document.getElementById('per-motivo-cese').value : '',
                observaciones: document.getElementById('per-obs').value
            };

            if (id) {
                window.db.update('personal', id, data);
            } else {
                window.db.insert('personal', data);
            }
            this.loadSubSection('personal');
        });

        // Edit/Delete handlers
        pane.addEventListener('click', async (e) => {
            if (e.target.classList.contains('edit-per')) {
                const id = e.target.dataset.id;
                const p = window.db.getById('personal', id);
                if (p) {
                    document.getElementById('per-id').value = p.id;
                    document.getElementById('per-codigo').value = p.codigo;
                    document.getElementById('per-dni').value = p.dni;
                    document.getElementById('per-nombre').value = p.nombre;
                    document.getElementById('per-apellidos').value = p.apellidos;
                    document.getElementById('per-sexo').value = p.sexo;
                    document.getElementById('per-fecha').value = p.fecha_ingreso;
                    document.getElementById('per-supervisor').value = p.supervisor_id;
                    document.getElementById('per-grupo').value = p.grupo_id;
                    document.getElementById('per-labor').value = p.labor_id;
                    document.getElementById('per-contrato').value = p.tipo_contrato;
                    document.getElementById('per-costo-normal').value = p.costo_hora_normal;
                    document.getElementById('per-costo-extra').value = p.costo_hora_extra;
                    document.getElementById('per-bono').value = p.bono_nocturno;
                    document.getElementById('per-moneda').value = p.moneda;
                    document.getElementById('per-estado').value = p.estado;
                    document.getElementById('per-fecha-cese').value = p.fecha_cese || '';
                    document.getElementById('per-motivo-cese').value = p.motivo_cese || '';
                    toggleCeseFields();
                    document.getElementById('per-obs').value = p.observaciones || '';
                    form.style.display = 'flex';
                }
            } else if (e.target.classList.contains('del-per')) {
                const id = e.target.dataset.id;
                if (confirm("¿Estás seguro de eliminar este trabajador?")) {
                    await window.db.delete('personal', id);
                    this.loadSubSection('personal');
                }
            }
        });
    },

    // 👮 / 🏢 Generic Rendering for simple fields (Supervisores, Labores, Clientes, Empresas, Motivos)
    renderSimpleTable(pane, dbKey, labelTitle, headers, mapRowFn) {
        const list = window.db.getAll(dbKey);
        pane.innerHTML = `
            <div class="card-title">
                <h2>Administrar ${labelTitle}s</h2>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button class="btn btn-secondary" id="btn-export-simp">📥 Exportar Excel</button>
                    <button class="btn btn-secondary" id="btn-import-simp-excel">📤 Subir Excel</button>
                    <input type="file" id="file-import-simp-excel" style="display:none;" accept=".xlsx, .xls">
                    <button class="btn btn-primary" id="btn-new-simple">+ Nuevo ${labelTitle}</button>
                </div>
            </div>
            
            <form id="form-simple" style="display: none; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-direction: column; gap: 12px;">
                <input type="hidden" id="simp-id">
                <div class="form-row-2">
                    <div class="form-group">
                        <label>Nombre / Descripción</label>
                        <input type="text" id="simp-nombre" class="form-input" required placeholder="Ingresar...">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="simp-estado" class="form-select">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div style="display:flex; gap:10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-simple">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                            <th style="width: 120px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(item => `
                            <tr>
                                ${mapRowFn(item).map((val, idx) => {
                                    if (val === 'Activo' || val === 'Inactivo') {
                                        return `<td><span class="badge ${val === 'Activo' ? 'badge-green' : 'badge-rose'}">${val}</span></td>`;
                                    }
                                    return `<td>${val}</td>`;
                                }).join('')}
                                <td>
                                    <button class="btn btn-secondary btn-sm edit-simp" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem;">Editar</button>
                                    <button class="btn btn-danger btn-sm del-simp" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const form = document.getElementById('form-simple');
        document.getElementById('btn-export-simp').addEventListener('click', () => {
            this.exportTableToCSV(dbKey);
        });

        // Excel Upload event bindings
        const fileInput = document.getElementById('file-import-simp-excel');
        const uploadBtn = document.getElementById('btn-import-simp-excel');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const count = await this.importExcelFile(dbKey, file);
                    alert(`¡Importación exitosa! Se procesaron ${count} registros.`);
                    this.loadSubSection(this.activeSubSection);
                } catch (err) {
                    console.error(err);
                    alert("❌ Error al importar Excel: " + err.message);
                }
            });
        }

        document.getElementById('btn-new-simple').addEventListener('click', () => {
            document.getElementById('simp-id').value = '';
            form.reset();
            form.style.display = 'flex';
        });

        document.getElementById('btn-cancel-simple').addEventListener('click', () => {
            form.style.display = 'none';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('simp-id').value;
            const data = {
                nombre: document.getElementById('simp-nombre').value,
                estado: document.getElementById('simp-estado').value
            };

            if (id) {
                await window.db.update(dbKey, id, data);
            } else {
                await window.db.insert(dbKey, data);
            }
            this.loadSubSection(this.activeSubSection);
        });

        pane.addEventListener('click', async (e) => {
            if (e.target.classList.contains('edit-simp')) {
                const id = e.target.dataset.id;
                const item = window.db.getById(dbKey, id);
                if (item) {
                    document.getElementById('simp-id').value = item.id;
                    document.getElementById('simp-nombre').value = item.nombre;
                    document.getElementById('simp-estado').value = item.estado;
                    form.style.display = 'flex';
                }
            } else if (e.target.classList.contains('del-simp')) {
                const id = e.target.dataset.id;
                if (confirm("¿Estás seguro de eliminar este registro?")) {
                    await window.db.delete(dbKey, id);
                    this.loadSubSection(this.activeSubSection);
                }
            }
        });
    },

    // 🥭 Variedades
    renderVariedades(pane) {
        const list = window.db.getAll('variedades');
        pane.innerHTML = `
            <div class="card-title">
                <h2>Administrar Variedades</h2>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button class="btn btn-secondary" id="btn-export-var">📥 Exportar Excel</button>
                    <button class="btn btn-secondary" id="btn-import-var-excel">📤 Subir Excel</button>
                    <input type="file" id="file-import-var-excel" style="display:none;" accept=".xlsx, .xls">
                    <button class="btn btn-primary" id="btn-new-var">+ Nueva Variedad</button>
                </div>
            </div>
            
            <form id="form-var" style="display: none; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-direction: column; gap: 12px;">
                <input type="hidden" id="var-id">
                <div class="form-row-3" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label>Producto</label>
                        <select id="var-producto" class="form-select" required>
                            <option value="MANGO">MANGO</option>
                            <option value="PALTA">PALTA</option>
                            <option value="OTRO">OTRO</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nombre Variedad</label>
                        <input type="text" id="var-nombre" class="form-input" required placeholder="ej: KENT">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="var-estado" class="form-select">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div style="display:flex; gap:10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-var">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Variedad</th>
                            <th>Estado</th>
                            <th style="width: 120px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(item => `
                            <tr>
                                <td>${item.producto}</td>
                                <td>${item.nombre}</td>
                                <td><span class="badge ${item.estado === 'Activo' ? 'badge-green' : 'badge-rose'}">${item.estado}</span></td>
                                <td>
                                    <button class="btn btn-secondary btn-sm edit-var" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem;">Editar</button>
                                    <button class="btn btn-danger btn-sm del-var" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const form = document.getElementById('form-var');
        document.getElementById('btn-export-var').addEventListener('click', () => {
            this.exportTableToCSV('variedades');
        });

        // Excel Upload event bindings
        const fileInput = document.getElementById('file-import-var-excel');
        const uploadBtn = document.getElementById('btn-import-var-excel');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const count = await this.importExcelFile('variedades', file);
                    alert(`¡Importación exitosa! Se procesaron ${count} registros de Variedades.`);
                    this.loadSubSection('variedades');
                } catch (err) {
                    console.error(err);
                    alert("❌ Error al importar Excel: " + err.message);
                }
            });
        }

        document.getElementById('btn-new-var').addEventListener('click', () => {
            document.getElementById('var-id').value = '';
            form.reset();
            form.style.display = 'flex';
        });
        document.getElementById('btn-cancel-var').addEventListener('click', () => {
            form.style.display = 'none';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('var-id').value;
            const data = {
                producto: document.getElementById('var-producto').value,
                nombre: document.getElementById('var-nombre').value.toUpperCase(),
                estado: document.getElementById('var-estado').value
            };

            if (id) {
                await window.db.update('variedades', id, data);
            } else {
                await window.db.insert('variedades', data);
            }
            this.loadSubSection('variedades');
        });

        pane.addEventListener('click', async (e) => {
            if (e.target.classList.contains('edit-var')) {
                const id = e.target.dataset.id;
                const item = window.db.getById('variedades', id);
                if (item) {
                    document.getElementById('var-id').value = item.id;
                    document.getElementById('var-producto').value = item.producto;
                    document.getElementById('var-nombre').value = item.nombre;
                    document.getElementById('var-estado').value = item.estado;
                    form.style.display = 'flex';
                }
            } else if (e.target.classList.contains('del-var')) {
                const id = e.target.dataset.id;
                if (confirm("¿Estás seguro de eliminar esta variedad?")) {
                    await window.db.delete('variedades', id);
                    this.loadSubSection('variedades');
                }
            }
        });
    },

    // 🌾 Proveedores
    renderProveedores(pane) {
        const list = window.db.getAll('proveedores_mp');
        pane.innerHTML = `
            <div class="card-title">
                <h2>Administrar Proveedores / Agricultores</h2>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-secondary" id="btn-export-prov">📥 Exportar CSV</button>
                    <button class="btn btn-secondary" id="btn-import-prov-excel">📤 Importar Excel</button>
                    <button class="btn btn-primary" id="btn-new-prov">+ Nuevo Proveedor</button>
                </div>
            </div>

            <!-- Excel Import Panel (Collapsible) -->
            <div id="prov-excel-import-panel" style="display: none; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-direction: column; gap: 12px; margin-bottom: 15px; background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px; width: 100%;">
                <h3 style="margin:0 0 4px 0; font-size:0.85rem; font-weight: 700; color: var(--color-primario);">Copiar y pegar columnas de Excel (Nombre | Fundo | Valle | CLP | Estado opcional)</h3>
                <p style="font-size:0.75rem; color:var(--text-secondary); margin:0 0 4px 0;">Pega las columnas desde Excel. Formato: <strong>Nombre | Fundo (ej: Las Mercedes) | Valle (ej: Piura) | CLP (ej: 015-0291-0012) | Estado (Activo/Inactivo)</strong></p>
                <textarea id="prov-excel-data" class="form-input" style="height:120px; font-family:monospace; font-size:0.75rem; background: var(--color-fondo);" placeholder="Ejemplo:&#10;WAYQUE	Fundo Wayque	Piura	015-0291-0001	Activo&#10;LECARNAQUE OTERO ALBERTO	Fundo Alberto	Sullana	015-0291-0002	Activo"></textarea>
                <div style="display:flex; gap:10px; justify-content: flex-end; margin-top:8px;">
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-close-prov-excel" style="font-size:0.75rem; padding:4px 10px;">Cerrar</button>
                    <button type="button" class="btn btn-primary btn-sm" id="btn-process-prov-excel" style="font-size:0.75rem; padding:4px 10px;">Procesar e Importar</button>
                </div>
            </div>
            
            <form id="form-prov" style="display: none; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-direction: column; gap: 12px;">
                <input type="hidden" id="prov-id">
                <div class="form-row-2" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label>Nombre / Razón Social *</label>
                        <input type="text" id="prov-nombre" class="form-input" required placeholder="ej: AGROINVERSIONES LAS MERCEDES SAC">
                    </div>
                    <div class="form-group">
                        <label>Fundo (Nombre del Campo) *</label>
                        <input type="text" id="prov-fundo" class="form-input" required placeholder="ej: Las Mercedes">
                    </div>
                </div>
                <div class="form-row-3" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label>Valle (Ubicación) *</label>
                        <input type="text" id="prov-valle" class="form-input" required placeholder="ej: Piura">
                    </div>
                    <div class="form-group">
                        <label>CLP (Código de Lugar de Producción) *</label>
                        <input type="text" id="prov-clp" class="form-input" required placeholder="ej: 015-0291-0012">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="prov-estado" class="form-select">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div style="display:flex; gap:10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-prov">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>

            <div class="table-container" style="max-height:600px; overflow-y:auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Fundo</th>
                            <th>Valle</th>
                            <th>CLP</th>
                            <th>Estado</th>
                            <th style="width: 120px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(item => `
                            <tr>
                                <td>${item.nombre}</td>
                                <td>${item.fundo}</td>
                                <td>${item.valle}</td>
                                <td style="font-family:monospace; font-weight:600;">${item.clp || 'N/A'}</td>
                                <td><span class="badge ${item.estado === 'Activo' ? 'badge-green' : 'badge-rose'}">${item.estado}</span></td>
                                <td>
                                    <button class="btn btn-secondary btn-sm edit-prov" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem;">Editar</button>
                                    <button class="btn btn-danger btn-sm del-prov" data-id="${item.id}" style="padding:4px 8px; font-size:0.75rem;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const form = document.getElementById('form-prov');
        document.getElementById('btn-export-prov').addEventListener('click', () => {
            this.exportTableToCSV('proveedores_mp');
        });

        const importPanel = document.getElementById('prov-excel-import-panel');
        document.getElementById('btn-import-prov-excel').addEventListener('click', () => {
            importPanel.style.display = importPanel.style.display === 'none' ? 'flex' : 'none';
        });
        document.getElementById('btn-close-prov-excel').addEventListener('click', () => {
            importPanel.style.display = 'none';
        });

        document.getElementById('btn-process-prov-excel').addEventListener('click', async () => {
            const rawText = document.getElementById('prov-excel-data').value.trim();
            if (!rawText) return alert("Pega los datos del Excel primero.");
            
            const rows = rawText.split('\n');
            let importedCount = 0;
            
            for (let row of rows) {
                const cols = row.split('\t');
                const nombre = cols[0] ? cols[0].trim().toUpperCase() : '';
                const fundo = cols[1] ? cols[1].trim() : 'N/A';
                const valle = cols[2] ? cols[2].trim() : 'N/A';
                const clp = cols[3] ? cols[3].trim() : 'N/A';
                let estado = cols[4] ? cols[4].trim() : 'Activo';
                
                if (estado.toLowerCase().startsWith('in') || estado.toLowerCase() === 'inactivo') {
                    estado = 'Inactivo';
                } else {
                    estado = 'Activo';
                }
                
                if (nombre) {
                    const existing = window.db.getAll('proveedores_mp').find(item => item.nombre.toLowerCase() === nombre.toLowerCase());
                    if (existing) {
                        await window.db.update('proveedores_mp', existing.id, { fundo, valle, clp, estado });
                    } else {
                        await window.db.insert('proveedores_mp', { nombre, fundo, valle, clp, estado });
                    }
                    importedCount++;
                }
            }
            
            alert(`¡Importación exitosa! Se procesaron ${importedCount} registros de Proveedores.`);
            this.loadSubSection('proveedores');
        });

        document.getElementById('btn-new-prov').addEventListener('click', () => {
            document.getElementById('prov-id').value = '';
            form.reset();
            form.style.display = 'flex';
        });
        document.getElementById('btn-cancel-prov').addEventListener('click', () => {
            form.style.display = 'none';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('prov-id').value;
            const data = {
                nombre: document.getElementById('prov-nombre').value.toUpperCase(),
                fundo: document.getElementById('prov-fundo').value,
                valle: document.getElementById('prov-valle').value,
                clp: document.getElementById('prov-clp').value,
                estado: document.getElementById('prov-estado').value
            };

            if (id) {
                await window.db.update('proveedores_mp', id, data);
            } else {
                await window.db.insert('proveedores_mp', data);
            }
            this.loadSubSection('proveedores');
        });

        pane.addEventListener('click', async (e) => {
            if (e.target.classList.contains('edit-prov')) {
                const id = e.target.dataset.id;
                const item = window.db.getById('proveedores_mp', id);
                if (item) {
                    document.getElementById('prov-id').value = item.id;
                    document.getElementById('prov-nombre').value = item.nombre;
                    document.getElementById('prov-fundo').value = item.fundo;
                    document.getElementById('prov-valle').value = item.valle;
                    document.getElementById('prov-clp').value = item.clp || '';
                    document.getElementById('prov-estado').value = item.estado;
                    form.style.display = 'flex';
                }
            } else if (e.target.classList.contains('del-prov')) {
                const id = e.target.dataset.id;
                if (confirm("¿Estás seguro de eliminar este proveedor?")) {
                    await window.db.delete('proveedores_mp', id);
                    this.loadSubSection('proveedores');
                }
            }
        });
    },

    // 👮 Supervisores
    renderSupervisores(pane) {
        const list = window.db.getAll('supervisores');
        pane.innerHTML = `
            <div class="card-title">
                <h2>Administrar Supervisores</h2>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button class="btn btn-secondary" id="btn-export-supervisores">📥 Exportar Excel</button>
                    <button class="btn btn-secondary" id="btn-import-supervisores-excel">📤 Subir Excel</button>
                    <input type="file" id="file-import-supervisores-excel" style="display:none;" accept=".xlsx, .xls">
                    <button class="btn btn-primary" id="btn-new-supervisor">+ Nuevo Supervisor</button>
                </div>
            </div>
            
            <form id="form-supervisor" style="display: none; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-direction: column; gap: 12px;">
                <input type="hidden" id="sup-id">
                <div class="form-row-3" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label>Nombre / Apellidos</label>
                        <input type="text" id="sup-nombre" class="form-input" required placeholder="Carlos Perez">
                    </div>
                    <div class="form-group">
                        <label>DNI</label>
                        <input type="text" id="sup-dni" class="form-input" placeholder="12345678">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="sup-estado" class="form-select">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div style="display:flex; gap:10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-supervisor">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>DNI</th>
                            <th>Estado</th>
                            <th style="width: 120px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(s => `
                            <tr>
                                <td><strong>${s.nombre}</strong></td>
                                <td>${s.dni || 'N/A'}</td>
                                <td><span class="badge ${s.estado === 'Activo' ? 'badge-green' : 'badge-rose'}">${s.estado}</span></td>
                                <td>
                                    <button class="btn btn-secondary btn-sm edit-sup" data-id="${s.id}" style="padding:4px 8px; font-size:0.75rem;">Editar</button>
                                    <button class="btn btn-danger btn-sm del-sup" data-id="${s.id}" style="padding:4px 8px; font-size:0.75rem;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const form = document.getElementById('form-supervisor');
        document.getElementById('btn-export-supervisores').addEventListener('click', () => {
            this.exportTableToCSV('supervisores');
        });

        // Excel Upload event bindings
        const fileInput = document.getElementById('file-import-supervisores-excel');
        const uploadBtn = document.getElementById('btn-import-supervisores-excel');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const count = await this.importExcelFile('supervisores', file);
                    alert(`¡Importación exitosa! Se procesaron ${count} registros de Supervisores.`);
                    this.loadSubSection('supervisores');
                } catch (err) {
                    console.error(err);
                    alert("❌ Error al importar Excel: " + err.message);
                }
            });
        }

        document.getElementById('btn-new-supervisor').addEventListener('click', () => {
            document.getElementById('sup-id').value = '';
            form.reset();
            form.style.display = 'flex';
        });

        document.getElementById('btn-cancel-supervisor').addEventListener('click', () => {
            form.style.display = 'none';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('sup-id').value;
            const data = {
                nombre: document.getElementById('sup-nombre').value,
                dni: document.getElementById('sup-dni').value,
                estado: document.getElementById('sup-estado').value
            };

            if (id) {
                await window.db.update('supervisores', id, data);
            } else {
                await window.db.insert('supervisores', data);
            }
            this.loadSubSection('supervisores');
        });

        pane.addEventListener('click', async (e) => {
            if (e.target.classList.contains('edit-sup')) {
                const id = e.target.dataset.id;
                const s = window.db.getById('supervisores', id);
                if (s) {
                    document.getElementById('sup-id').value = s.id;
                    document.getElementById('sup-nombre').value = s.nombre;
                    document.getElementById('sup-dni').value = s.dni || '';
                    document.getElementById('sup-estado').value = s.estado;
                    form.style.display = 'flex';
                }
            } else if (e.target.classList.contains('del-sup')) {
                const id = e.target.dataset.id;
                if (confirm("¿Estás seguro de eliminar este supervisor?")) {
                    await window.db.delete('supervisores', id);
                    this.loadSubSection('supervisores');
                }
            }
        });
    },

    // ⏰ Turnos
    renderTurnos(pane) {
        const list = window.db.getAll('turnos');
        pane.innerHTML = `
            <div class="card-title">
                <h2>Administrar Turnos</h2>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                            <th>Cruza Medianoche</th>
                            <th>Bono Nocturno</th>
                            <th>Horas Normales</th>
                            <th>Horas Extras</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(t => `
                            <tr>
                                <td><strong>${t.nombre}</strong></td>
                                <td>${t.hora_inicio}</td>
                                <td>${t.hora_fin}</td>
                                <td>${t.cruza_medianoche ? '✅ Sí' : '❌ No'}</td>
                                <td>${t.aplica_bono ? '✅ Sí' : '❌ No'}</td>
                                <td>${t.horas_normales} hrs</td>
                                <td>${t.horas_extras} hrs</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // 🛡️ Grupos
    renderGrupos(pane) {
        const list = window.db.getAll('grupos');
        const supervisores = window.db.getAll('supervisores');
        pane.innerHTML = `
            <div class="card-title">
                <h2>Administrar Grupos de Supervisión</h2>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button class="btn btn-secondary" id="btn-import-grupos-excel">📤 Subir Excel</button>
                    <input type="file" id="file-import-grupos-excel" style="display:none;" accept=".xlsx, .xls">
                    <button class="btn btn-primary" id="btn-new-grupo">+ Nuevo Grupo</button>
                </div>
            </div>
            
            <form id="form-grupo" style="display: none; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-direction: column; gap: 12px;">
                <input type="hidden" id="grp-id">
                <div class="form-row" style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label>Código/Nombre Grupo</label>
                        <input type="text" id="grp-codigo" class="form-input" required placeholder="Grupo X">
                    </div>
                    <div class="form-group">
                        <label>Área de Proceso</label>
                        <select id="grp-area" class="form-select">
                            <option value="Recepción">Recepción</option>
                            <option value="Calibrado">Calibrado</option>
                            <option value="Tratamiento Hidrotérmico">Tratamiento Hidrotérmico</option>
                            <option value="Empaque">Empaque</option>
                            <option value="Despacho">Despacho</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Supervisor</label>
                        <select id="grp-supervisor" class="form-select">
                            ${supervisores.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Turno Habitual</label>
                        <select id="grp-turno" class="form-select">
                            <option value="Día">Día</option>
                            <option value="Noche">Noche</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="grp-estado" class="form-select">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div style="display:flex; gap:10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-grupo">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Código Grupo</th>
                            <th>Área de Proceso</th>
                            <th>Supervisor Responsable</th>
                            <th>Turno Habitual</th>
                            <th>Estado</th>
                            <th style="width: 120px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(g => {
                            const supName = supervisores.find(s => s.id === g.supervisor_id)?.nombre || 'N/A';
                            return `
                                <tr>
                                    <td><strong>${g.codigo_grupo}</strong></td>
                                    <td><span class="badge badge-purple">${g.area_proceso || 'Otro'}</span></td>
                                    <td>${supName}</td>
                                    <td>${g.turno_habitual}</td>
                                    <td><span class="badge ${g.estado === 'Activo' ? 'badge-green' : 'badge-rose'}">${g.estado}</span></td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm edit-grp" data-id="${g.id}" style="padding:4px 8px; font-size:0.75rem;">Editar</button>
                                        <button class="btn btn-danger btn-sm del-grp" data-id="${g.id}" style="padding:4px 8px; font-size:0.75rem;">Eliminar</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const form = document.getElementById('form-grupo');
        
        // Excel Upload event bindings
        const fileInput = document.getElementById('file-import-grupos-excel');
        const uploadBtn = document.getElementById('btn-import-grupos-excel');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const count = await this.importExcelFile('grupos', file);
                    alert(`¡Importación exitosa! Se procesaron ${count} registros de Trabajadores asignados a sus Grupos.`);
                    this.loadSubSection('grupos');
                } catch (err) {
                    console.error(err);
                    alert("❌ Error al importar Excel: " + err.message);
                }
            });
        }

        document.getElementById('btn-new-grupo').addEventListener('click', () => {
            document.getElementById('grp-id').value = '';
            form.reset();
            form.style.display = 'flex';
        });
        document.getElementById('btn-cancel-grupo').addEventListener('click', () => {
            form.style.display = 'none';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('grp-id').value;
            const data = {
                codigo_grupo: document.getElementById('grp-codigo').value,
                area_proceso: document.getElementById('grp-area').value,
                supervisor_id: document.getElementById('grp-supervisor').value,
                turno_habitual: document.getElementById('grp-turno').value,
                estado: document.getElementById('grp-estado').value
            };

            if (id) {
                window.db.update('grupos', id, data);
            } else {
                window.db.insert('grupos', data);
            }
            this.loadSubSection('grupos');
        });

        pane.addEventListener('click', async (e) => {
            if (e.target.classList.contains('edit-grp')) {
                const id = e.target.dataset.id;
                const g = window.db.getById('grupos', id);
                if (g) {
                    document.getElementById('grp-id').value = g.id;
                    document.getElementById('grp-codigo').value = g.codigo_grupo;
                    document.getElementById('grp-area').value = g.area_proceso || 'Otro';
                    document.getElementById('grp-supervisor').value = g.supervisor_id;
                    document.getElementById('grp-turno').value = g.turno_habitual;
                    document.getElementById('grp-estado').value = g.estado;
                    form.style.display = 'flex';
                }
            } else if (e.target.classList.contains('del-grp')) {
                const id = e.target.dataset.id;
                const workersInGroup = window.db.getAll('personal').filter(p => p.grupo_id === id);
                if (workersInGroup.length > 0) {
                    const activeCount = workersInGroup.filter(p => p.estado === 'Activo').length;
                    const inactiveCount = workersInGroup.length - activeCount;
                    alert(`⚠️ No se puede eliminar este grupo porque tiene operarios asignados (${activeCount} activos, ${inactiveCount} cesados).\nPor favor, retire o reasigne a los trabajadores de este grupo antes de eliminarlo.`);
                    return;
                }
                if (confirm("¿Estás seguro de eliminar este grupo?")) {
                    await window.db.delete('grupos', id);
                    this.loadSubSection('grupos');
                }
            }
        });
    },

    // 📦 Tipos de Caja
    renderCajas(pane) {
        const list = window.db.getAll('tipos_caja');
        pane.innerHTML = `
            <div class="card-title">
                <h2>Administrar Tipos de Caja</h2>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-secondary" id="btn-export-cajas">📥 Exportar CSV</button>
                    <button class="btn btn-primary" id="btn-new-caja">+ Nuevo Tipo de Caja</button>
                </div>
            </div>
            
            <form id="form-caja" style="display: none; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-direction: column; gap: 12px;">
                <input type="hidden" id="caj-id">
                <div class="form-row">
                    <div class="form-group">
                        <label>Código</label>
                        <input type="text" id="caj-codigo" class="form-input" required placeholder="WISHA_B12">
                    </div>
                    <div class="form-group">
                        <label>Nombre Comercial</label>
                        <input type="text" id="caj-nombre" class="form-input" required placeholder="Caja Wisha B12 (4 kg)">
                    </div>
                    <div class="form-group">
                        <label>Peso Teórico (Kg)</label>
                        <input type="number" step="0.01" id="caj-peso" class="form-input" required placeholder="4.0">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Formato / Molde</label>
                        <input type="text" id="caj-formato" class="form-input" required placeholder="B12">
                    </div>
                    <div class="form-group">
                        <label>Base por Pallet</label>
                        <input type="number" id="caj-base" class="form-input" required placeholder="10">
                    </div>
                    <div class="form-group">
                        <label>Cajas por Pallet (Total)</label>
                        <input type="number" id="caj-total" class="form-input" required placeholder="240">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="caj-estado" class="form-select">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; align-items: end;">
                    <div class="form-group">
                        <label>Vía de Tránsito</label>
                        <select id="caj-via" class="form-select">
                            <option value="VARIOS">VARIOS (Cualquiera)</option>
                            <option value="MARITIMO">MARITIMO</option>
                            <option value="AEREO">AEREO</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Destino / País</label>
                        <input type="text" id="caj-destino" class="form-input" placeholder="ej: USA, EUROPA, VARIOS">
                    </div>
                    <div class="form-group" style="display: flex; align-items: center; height: 38px; padding-bottom: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 500;">
                            <input type="checkbox" id="caj-hidrotermico" style="width: 16px; height: 16px;">
                            Req. Hidrotérmico (Nube/Destino)
                        </label>
                    </div>
                    <div class="form-group" style="display: flex; align-items: center; height: 38px; padding-bottom: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 500;">
                            <input type="checkbox" id="caj-maduracion" style="width: 16px; height: 16px;">
                            Req. Maduración (Cámara)
                        </label>
                    </div>
                </div>
                <div style="display:flex; gap:10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-caja">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Peso Teórico</th>
                            <th>Formato</th>
                            <th>Base/Pallet</th>
                            <th>Cajas/Pallet</th>
                            <th>Vía / Destino</th>
                            <th>Tratamientos</th>
                            <th>Estado</th>
                            <th style="width: 120px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(c => `
                            <tr>
                                <td><strong>${c.codigo}</strong></td>
                                <td>${c.nombre}</td>
                                <td>${Number(c.peso_teorico).toFixed(2)} Kg</td>
                                <td>${c.formato}</td>
                                <td>${c.base_pallet}</td>
                                <td>${c.cant_pallet}</td>
                                <td>
                                    <span class="badge badge-purple" style="font-size:0.75rem;">${c.tipo_empaque_via || 'VARIOS'}</span>
                                    <span style="font-size:0.75rem; color:var(--text-secondary); margin-left:4px;">${c.destino_pais || 'VARIOS'}</span>
                                </td>
                                <td>
                                    ${c.requiere_hidrotermico ? '<span class="badge badge-green" style="font-size:0.7rem; padding: 2px 4px;">♨️ Hidro</span>' : ''}
                                    ${c.requiere_maduracion ? '<span class="badge badge-orange" style="font-size:0.7rem; padding: 2px 4px; margin-left: 2px;">🍎 Madur</span>' : ''}
                                    ${!c.requiere_hidrotermico && !c.requiere_maduracion ? '<span style="font-style:italic; color:var(--text-muted); font-size:0.75rem;">Ninguno</span>' : ''}
                                </td>
                                <td><span class="badge ${c.estado === 'Activo' ? 'badge-green' : 'badge-rose'}">${c.estado}</span></td>
                                <td>
                                    <button class="btn btn-secondary btn-sm edit-caj" data-id="${c.id}" style="padding:4px 8px; font-size:0.75rem;">Editar</button>
                                    <button class="btn btn-danger btn-sm del-caj" data-id="${c.id}" style="padding:4px 8px; font-size:0.75rem;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const form = document.getElementById('form-caja');
        document.getElementById('btn-export-cajas').addEventListener('click', () => {
            this.exportTableToCSV('tipos_caja');
        });

        document.getElementById('btn-new-caja').addEventListener('click', () => {
            document.getElementById('caj-id').value = '';
            form.reset();
            document.getElementById('caj-hidrotermico').checked = false;
            document.getElementById('caj-maduracion').checked = false;
            form.style.display = 'flex';
        });
        document.getElementById('btn-cancel-caja').addEventListener('click', () => {
            form.style.display = 'none';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('caj-id').value;
            const data = {
                codigo: document.getElementById('caj-codigo').value,
                nombre: document.getElementById('caj-nombre').value,
                peso_teorico: parseFloat(document.getElementById('caj-peso').value),
                formato: document.getElementById('caj-formato').value,
                base_pallet: parseInt(document.getElementById('caj-base').value),
                cant_pallet: parseInt(document.getElementById('caj-total').value),
                tipo_empaque_via: document.getElementById('caj-via').value,
                destino_pais: document.getElementById('caj-destino').value.toUpperCase().trim() || 'VARIOS',
                requiere_hidrotermico: document.getElementById('caj-hidrotermico').checked,
                requiere_maduracion: document.getElementById('caj-maduracion').checked,
                estado: document.getElementById('caj-estado').value
            };

            if (id) {
                window.db.update('tipos_caja', id, data);
            } else {
                window.db.insert('tipos_caja', data);
            }
            this.loadSubSection('cajas');
        });

        pane.addEventListener('click', async (e) => {
            if (e.target.classList.contains('edit-caj')) {
                const id = e.target.dataset.id;
                const c = window.db.getById('tipos_caja', id);
                if (c) {
                    document.getElementById('caj-id').value = c.id;
                    document.getElementById('caj-codigo').value = c.codigo;
                    document.getElementById('caj-nombre').value = c.nombre;
                    document.getElementById('caj-peso').value = c.peso_teorico;
                    document.getElementById('caj-formato').value = c.formato;
                    document.getElementById('caj-base').value = c.base_pallet;
                    document.getElementById('caj-total').value = c.cant_pallet;
                    document.getElementById('caj-via').value = c.tipo_empaque_via || 'VARIOS';
                    document.getElementById('caj-destino').value = c.destino_pais || 'VARIOS';
                    document.getElementById('caj-hidrotermico').checked = !!c.requiere_hidrotermico;
                    document.getElementById('caj-maduracion').checked = !!c.requiere_maduracion;
                    document.getElementById('caj-estado').value = c.estado;
                    form.style.display = 'flex';
                }
            } else if (e.target.classList.contains('del-caj')) {
                const id = e.target.dataset.id;
                if (confirm("¿Estás seguro de eliminar esta caja?")) {
                    await window.db.delete('tipos_caja', id);
                    this.loadSubSection('cajas');
                }
            }
        });
    },

    // 🏷️ Tipos de Empaque
    renderEmpaques(pane) {
        const list = window.db.getAll('tipos_empaque');
        pane.innerHTML = `
            <div class="card-title">
                <h2>Administrar Tipos de Empaque</h2>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-secondary" id="btn-export-empaques">📥 Exportar CSV</button>
                    <button class="btn btn-primary" id="btn-new-empaque">+ Nuevo Empaque</button>
                </div>
            </div>
            
            <form id="form-empaque" style="display: none; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-direction: column; gap: 12px;">
                <input type="hidden" id="emp-id">
                <div class="form-row">
                    <div class="form-group">
                        <label>Código</label>
                        <input type="text" id="emp-codigo" class="form-input" required placeholder="MAR_EUR">
                    </div>
                    <div class="form-group">
                        <label>Nombre Programa / Empaque</label>
                        <input type="text" id="emp-nombre" class="form-input" required placeholder="Marítimo Europa">
                    </div>
                    <div class="form-group">
                        <label>Tipo de Tránsito</label>
                        <select id="emp-transito" class="form-select">
                            <option value="Marítimo">Marítimo</option>
                            <option value="Aéreo">Aéreo</option>
                            <option value="Terrestre">Terrestre</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Destino Final</label>
                        <input type="text" id="emp-destino" class="form-input" required placeholder="Holanda">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="emp-estado" class="form-select">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div style="display:flex; gap:10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-empaque">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Tipo Tránsito</th>
                            <th>Destino</th>
                            <th>Estado</th>
                            <th style="width: 120px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(e => `
                            <tr>
                                <td><strong>${e.codigo}</strong></td>
                                <td>${e.nombre}</td>
                                <td>${e.tipo_transito}</td>
                                <td>${e.destino}</td>
                                <td><span class="badge ${e.estado === 'Activo' ? 'badge-green' : 'badge-rose'}">${e.estado}</span></td>
                                <td>
                                    <button class="btn btn-secondary btn-sm edit-emp" data-id="${e.id}" style="padding:4px 8px; font-size:0.75rem;">Editar</button>
                                    <button class="btn btn-danger btn-sm del-emp" data-id="${e.id}" style="padding:4px 8px; font-size:0.75rem;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const form = document.getElementById('form-empaque');
        document.getElementById('btn-export-empaques').addEventListener('click', () => {
            this.exportTableToCSV('tipos_empaque');
        });

        document.getElementById('btn-new-empaque').addEventListener('click', () => {
            document.getElementById('emp-id').value = '';
            form.reset();
            form.style.display = 'flex';
        });
        document.getElementById('btn-cancel-empaque').addEventListener('click', () => {
            form.style.display = 'none';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('emp-id').value;
            const data = {
                codigo: document.getElementById('emp-codigo').value,
                nombre: document.getElementById('emp-nombre').value,
                tipo_transito: document.getElementById('emp-transito').value,
                destino: document.getElementById('emp-destino').value,
                estado: document.getElementById('emp-estado').value
            };

            if (id) {
                window.db.update('tipos_empaque', id, data);
            } else {
                window.db.insert('tipos_empaque', data);
            }
            this.loadSubSection('empaques');
        });

        pane.addEventListener('click', async (e) => {
            if (e.target.classList.contains('edit-emp')) {
                const id = e.target.dataset.id;
                const em = window.db.getById('tipos_empaque', id);
                if (em) {
                    document.getElementById('emp-id').value = em.id;
                    document.getElementById('emp-codigo').value = em.codigo;
                    document.getElementById('emp-nombre').value = em.nombre;
                    document.getElementById('emp-transito').value = em.tipo_transito;
                    document.getElementById('emp-destino').value = em.destino;
                    document.getElementById('emp-estado').value = em.estado;
                    form.style.display = 'flex';
                }
            } else if (e.target.classList.contains('del-emp')) {
                const id = e.target.dataset.id;
                if (confirm("¿Estás seguro de eliminar este empaque?")) {
                    await window.db.delete('tipos_empaque', id);
                    this.loadSubSection('empaques');
                }
            }
        });
    },

    // 📊 Programa de Exportación (Excel Import Emulation)
    renderPrograma(pane) {
        const prog = window.db.getAll('programa_exportacion');
        pane.innerHTML = `
            <div class="card-title">
                <h2>Programa Comercial de Exportación (Pachamama Propio)</h2>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-accent" id="btn-import-excel">📋 Pegar / Subir Excel</button>
                    <button class="btn btn-secondary" id="btn-export-excel-prog">📥 Exportar Programa</button>
                </div>
            </div>

            <!-- Paste Excel Area (Hidden) -->
            <div id="excel-import-panel" style="display:none; border:1px dashed var(--border-color); padding:16px; border-radius:8px; flex-direction:column; gap:12px; background: rgba(0,0,0,0.02);">
                <label style="font-size:0.85rem; font-weight:600;">Copia y pega las columnas de tu Excel aquí (Shipment, Cliente, Destino, Naviera, Booking, Container, BL, Fecha, Cajas Prog, Kg Prog):</label>
                <textarea id="excel-data" class="form-textarea" rows="6" placeholder="SHP004\tWalmart\tMiami\tMaersk\tBKG-9988\tMSKU1122\tBL-3344\t2026-07-15\t5000\t20000" style="font-family: monospace; font-size:0.8rem; background: var(--color-fondo);"></textarea>
                
                <!-- True File Selector -->
                <div style="border: 1px dashed var(--border-color); padding: 10px; border-radius: 6px; display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">O seleccionar archivo Excel (.xlsx):</span>
                    <input type="file" id="programa-excel-file" accept=".xlsx, .xls" style="font-size: 0.75rem; color: var(--text-primary);">
                </div>

                <div style="display:flex; gap:10px; justify-content:flex-end;">
                    <button class="btn btn-secondary btn-sm" id="btn-close-excel">Cerrar</button>
                    <button class="btn btn-primary btn-sm" id="btn-process-excel">Procesar e Importar</button>
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Shipment</th>
                            <th>Cliente</th>
                            <th>Destino</th>
                            <th>Naviera</th>
                            <th>Booking</th>
                            <th>Contenedor</th>
                            <th>BL</th>
                            <th>F. Embarque</th>
                            <th>Cajas Prog.</th>
                            <th>Kg Prog.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${prog.map(p => `
                            <tr>
                                <td><strong>${p.shipment}</strong></td>
                                <td>${p.cliente}</td>
                                <td>${p.destino}</td>
                                <td>${p.naviera}</td>
                                <td>${p.booking}</td>
                                <td>${p.container}</td>
                                <td>${p.bl}</td>
                                <td>${p.fecha_embarque}</td>
                                <td>${p.cant_programada}</td>
                                <td>${Number(p.kg_programados).toLocaleString()} Kg</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Action Bindings
        const importPanel = document.getElementById('excel-import-panel');
        document.getElementById('btn-import-excel').addEventListener('click', () => {
            importPanel.style.display = importPanel.style.display === 'none' ? 'flex' : 'none';
        });
        document.getElementById('btn-close-excel').addEventListener('click', () => {
            importPanel.style.display = 'none';
        });

        // Excel processing
        document.getElementById('btn-process-excel').addEventListener('click', async () => {
            const fileInput = document.getElementById('programa-excel-file');
            let rows = [];

            if (fileInput && fileInput.files.length > 0) {
                try {
                    rows = await window.utils.parseExcelFile(fileInput.files[0]);
                } catch (err) {
                    console.error(err);
                    return alert("Error al procesar el archivo Excel.");
                }
            } else {
                const rawText = document.getElementById('excel-data').value.trim();
                if (!rawText) return alert("Pega los datos del Excel o selecciona un archivo primero.");
                rows = rawText.split('\n').map(r => r.split('\t'));
            }

            let importedCount = 0;
            const newRecords = [];

            rows.forEach(cols => {
                if (cols.length >= 8) {
                    newRecords.push({
                        shipment: cols[0] ? String(cols[0]).trim() : 'SHP_TEMP',
                        cliente: cols[1] ? String(cols[1]).trim() : 'Cliente General',
                        destino: cols[2] ? String(cols[2]).trim() : 'Por Definir',
                        naviera: cols[3] ? String(cols[3]).trim() : 'N/A',
                        booking: cols[4] ? String(cols[4]).trim() : 'N/A',
                        container: cols[5] ? String(cols[5]).trim() : 'N/A',
                        bl: cols[6] ? String(cols[6]).trim() : 'N/A',
                        fecha_embarque: cols[7] ? String(cols[7]).trim() : new Date().toISOString().split('T')[0],
                        cant_programada: cols[8] ? parseInt(String(cols[8]).trim()) : 0,
                        kg_programados: cols[9] ? parseFloat(String(cols[9]).trim()) : 0
                    });
                    importedCount++;
                }
            });

            if (newRecords.length > 0) {
                const currentProg = window.db.getAll('programa_exportacion');
                for (let rec of newRecords) {
                    const existing = currentProg.find(item => item.shipment === rec.shipment);
                    if (existing) {
                        await window.db.update('programa_exportacion', existing.id, rec);
                    } else {
                        await window.db.insert('programa_exportacion', rec);
                    }
                }
                alert(`¡Importación exitosa! Se procesaron ${importedCount} filas.`);
                this.loadSubSection('programa');
            } else {
                alert("No se pudo detectar un formato válido de columnas. Asegúrate de copiar las columnas completas.");
            }
        });

        // Export program
        document.getElementById('btn-export-excel-prog').addEventListener('click', () => {
            const data = window.db.getAll('programa_exportacion');
            const headers = ["Shipment", "Cliente", "Destino", "Naviera", "Booking", "Contenedor", "BL", "F_Embarque", "Cajas_Prog", "Kg_Prog"];
            window.utils.exportToExcel("programa_exportacion.xlsx", "PROGRAMA", headers, data, (item) => [
                item.shipment, item.cliente, item.destino, item.naviera, item.booking, item.container, item.bl, item.fecha_embarque, item.cant_programada, item.kg_programados
            ]);
        });
    },

    exportTableToCSV(dbKey) {
        const data = window.db.getAll(dbKey);
        if (data.length === 0) {
            alert("No hay registros en esta tabla para exportar.");
            return;
        }
        
        let headers = [];
        let mapFn = null;
        
        if (dbKey === 'empresas') {
            headers = ["ID", "Exportador", "Estado"];
            mapFn = (item) => [item.id, item.nombre, item.estado];
        } else if (dbKey === 'clientes') {
            headers = ["ID", "Cliente", "Estado"];
            mapFn = (item) => [item.id, item.nombre, item.estado];
        } else if (dbKey === 'supervisores') {
            headers = ["ID", "Supervisor", "Estado"];
            mapFn = (item) => [item.id, item.nombre, item.estado];
        } else if (dbKey === 'labores') {
            headers = ["ID", "Labor", "Estado"];
            mapFn = (item) => [item.id, item.nombre, item.estado];
        } else if (dbKey === 'motivos_parada') {
            headers = ["ID", "Motivo", "Estado"];
            mapFn = (item) => [item.id, item.nombre, item.estado];
        } else if (dbKey === 'tipos_caja') {
            headers = ["ID", "Codigo", "Nombre", "PesoTeorico", "Formato", "BasePallet", "CajasPallet", "ViaTransito", "DestinoPais", "ReqHidrotermico", "ReqMaduracion", "Estado"];
            mapFn = (item) => [
                item.id, 
                item.codigo, 
                item.nombre, 
                item.peso_teorico, 
                item.formato, 
                item.base_pallet, 
                item.cant_pallet, 
                item.tipo_empaque_via || 'VARIOS', 
                item.destino_pais || 'VARIOS', 
                item.requiere_hidrotermico ? 'SI' : 'NO', 
                item.requiere_maduracion ? 'SI' : 'NO', 
                item.estado
            ];
        } else if (dbKey === 'personal') {
            headers = ["ID", "Codigo", "DNI", "Nombre", "Apellidos", "GrupoID", "LaborID", "Estado"];
            mapFn = (item) => [item.id, item.codigo, item.dni, item.nombre, item.apellidos, item.grupo_id, item.labor_id, item.estado];
        } else if (dbKey === 'variedades') {
            headers = ["ID", "Producto", "Nombre", "Estado"];
            mapFn = (item) => [item.id, item.producto, item.nombre, item.estado];
        } else if (dbKey === 'proveedores_mp') {
            headers = ["ID", "Nombre", "Fundo", "Valle", "CLP", "Estado"];
            mapFn = (item) => [item.id, item.nombre, item.fundo, item.valle, item.clp, item.estado];
        } else if (dbKey === 'productos') {
            headers = ["ID", "Producto", "Estado"];
            mapFn = (item) => [item.id, item.nombre, item.estado];
        } else if (dbKey === 'tipos_empaque') {
            headers = ["ID", "Codigo", "Nombre", "TipoTransito", "Destino", "Estado"];
            mapFn = (item) => [item.id, item.codigo, item.nombre, item.tipo_transito, item.destino, item.estado];
        }
        
        if (headers.length > 0) {
            window.utils.exportToExcel(`catalogo_${dbKey}.xlsx`, dbKey.toUpperCase(), headers, data, mapFn);
        } else {
            alert("Exportación no configurada para esta tabla.");
        }
    },

    renderModulos(pane) {
        const hiddenKey = 'pachamama_erp_hidden_modules';
        let hiddenModules = [];
        try {
            const stored = localStorage.getItem(hiddenKey);
            if (stored) {
                hiddenModules = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error reading hidden modules", e);
        }

        // List of all modules as in index.html sidebar
        const modules = [
            { id: 'dashboard-ejecutivo', name: '📊 Dashboard Ejecutivo', desc: 'Resumen gráfico del desempeño de la planta en tiempo real.' },
            { id: 'recepcion', name: '🚚 Recepción MP', desc: 'Control de entrada de materia prima, pesaje y códigos QR.' },
            { id: 'calibrado', name: '📐 Calibrado MP', desc: 'Clasificación de mangos por calibre, calidad y envase.' },
            { id: 'produccion', name: '⚙️ Producción', desc: 'Monitoreo de líneas de empaque y cálculo de rendimiento.' },
            { id: 'grupos-trabajo', name: '👥 Grupos de Trabajo', desc: 'Administración de los integrantes permanentes de cada grupo de trabajo.' },
            { id: 'asistencia', name: '👮 Asistencia', desc: 'Control de asistencia diario de todo el personal.' },
            { id: 'tareo', name: '⏰ Tareo', desc: 'Asignación de trabajadores a grupos, horas de inicio/fin y labores.' },
            { id: 'trazabilidad', name: '📦 Trazabilidad', desc: 'Seguimiento completo desde el lote de materia prima hasta el producto final.' },
            { id: 'recursos-humanos', name: '💰 Recursos Humanos', desc: 'Cálculo de nómina estimado, horas normales, extras y nocturnas.' },
            { id: 'costeo', name: '🪙 Costeo de Producción', desc: 'Cálculo del costo unitario de mano de obra por presentación de caja y proceso.' },
            { id: 'configuracion', name: '⚙️ Configuración', desc: 'Administración de maestros del sistema (Siempre visible).', critical: true }
        ];

        pane.innerHTML = `
            <div class="card-title">
                <h2>Visibilidad de Módulos</h2>
                <button class="btn btn-primary" id="btn-save-modules">💾 Guardar Cambios</button>
            </div>
            
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
                Selecciona cuáles módulos del menú lateral deseas que estén visibles para los operarios o administradores de la planta. Desmarca para ocultar. El módulo de <strong>Configuración</strong> no puede ser ocultado para evitar la pérdida de acceso al sistema.
            </p>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                ${modules.map(mod => {
                    const isVisible = !hiddenModules.includes(mod.id);
                    const disabledAttr = mod.critical ? 'checked disabled style="cursor: not-allowed; opacity: 0.7;"' : '';
                    const checkedAttr = isVisible ? 'checked' : '';
                    
                    return `
                        <div class="card" style="padding: 16px; margin: 0; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; border-radius: 8px;">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <span style="font-weight: 600; color: var(--text-primary); font-size: 1rem;">${mod.name}</span>
                                <span style="font-size: 0.85rem; color: var(--text-secondary);">${mod.desc}</span>
                            </div>
                            <div>
                                <label class="switch-container" style="position: relative; display: inline-block; width: 44px; height: 22px;">
                                    <input type="checkbox" class="mod-visibility-chk" data-mod="${mod.id}" ${checkedAttr} ${disabledAttr} style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${isVisible ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)'}; transition: .3s; border-radius: 34px;">
                                        <span class="slider-knob" style="position: absolute; content: ''; height: 16px; width: 16px; left: ${isVisible ? '24px' : '4px'}; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%;"></span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // Bind switch events to animate slider locally
        const checkboxes = pane.querySelectorAll('.mod-visibility-chk');
        checkboxes.forEach(chk => {
            chk.addEventListener('change', (e) => {
                if (chk.disabled) return;
                const slider = chk.nextElementSibling;
                const knob = slider.querySelector('.slider-knob');
                if (chk.checked) {
                    slider.style.backgroundColor = 'var(--accent-emerald)';
                    knob.style.left = '24px';
                } else {
                    slider.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    knob.style.left = '4px';
                }
            });
        });

        // Save action
        const saveBtn = document.getElementById('btn-save-modules');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const hiddenList = [];
                pane.querySelectorAll('.mod-visibility-chk').forEach(chk => {
                    if (!chk.checked && !chk.disabled) {
                        hiddenList.push(chk.dataset.mod);
                    }
                });

                localStorage.setItem(hiddenKey, JSON.stringify(hiddenList));
                
                // Re-apply visibility in sidebar immediately
                if (window.appController) {
                    window.appController.applyModuleVisibility();
                    // If current view was hidden, we navigated elsewhere, so make sure we reflect the active view
                    window.appController.navigate(window.appController.currentView);
                }

                alert("✅ Configuración de visibilidad de módulos guardada y aplicada.");
            });
        }
    },

    // ☁️ Google Cloud (Firebase Firestore) Sync Config
    renderCloudConfig(pane) {
        const configKey = 'pachamama_erp_firebase_config';
        const currentConfig = localStorage.getItem(configKey) || '';
        const isConnected = !!window.db.firestore;

        pane.innerHTML = `
            <div class="card-title">
                <h2>Conexión a Base de Datos en Google Cloud</h2>
            </div>
            
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5;">
                Sincroniza todas las áreas de tu empresa (Recepción, Calibrado, Producción, Asistencia, Tareo) en tiempo real en la nube de <strong>Google Cloud (Firebase)</strong>. Una vez conectado, los datos de todas las áreas se guardarán de forma centralizada en tu cuenta y estarán seguros aunque limpies el navegador.
            </p>

            ${isConnected ? `
                <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 8px; padding: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.5rem;">🟢</span>
                        <div>
                            <strong style="color: var(--accent-emerald); font-size: 0.95rem;">Estado: Conectado a Google Cloud</strong>
                            <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-secondary);">El ERP está sincronizando todas las transacciones en tiempo real con Firestore.</p>
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-sm" id="btn-cloud-disconnect" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.2); cursor: pointer;">Desconectar</button>
                </div>

                <div class="card" style="padding: 16px; background: var(--bg-primary); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px; margin: 0;">
                    <h3 style="font-size: 0.9rem; font-weight: 600;">Acciones de Sincronización</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-primary btn-sm" id="btn-cloud-push-local" style="cursor: pointer;">📤 Subir datos locales a la nube</button>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">
                        Usa este botón si tienes registros capturados localmente en este navegador que aún no están en la nube de Google Cloud.
                    </span>
                </div>
            ` : `
                <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.15); border-radius: 8px; padding: 16px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.5rem;">🟡</span>
                    <div>
                        <strong style="color: var(--accent-orange); font-size: 0.95rem;">Estado: Modo Local Offline</strong>
                        <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-secondary);">Los datos solo se están guardando en el navegador de este dispositivo.</p>
                    </div>
                </div>

                <form id="form-cloud-config" style="display: flex; flex-direction: column; gap: 16px;">
                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">Configuración SDK de Firebase (Objeto JSON)</label>
                        <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">
                            Copia el objeto <code>firebaseConfig</code> desde tu consola de Firebase (Engranaje -> Configuración del proyecto -> Tus Apps -> Código CDN/npm).
                        </p>
                        <textarea id="cloud-config-json" class="form-textarea" rows="8" required placeholder='{\n  "apiKey": "AIzaSy...",\n  "authDomain": "pachamama-erp.firebaseapp.com",\n  "projectId": "pachamama-erp",\n  "storageBucket": "pachamama-erp.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "..."\n}' style="font-family: monospace; font-size: 0.8rem; padding: 12px; border-radius: 8px;"></textarea>
                    </div>

                    <div style="display: flex; justify-content: flex-end;">
                        <button type="submit" class="btn btn-primary" style="background: var(--accent-blue); border-color: var(--accent-blue); font-weight: 600; cursor: pointer;">Conectar e Iniciar Sincronización</button>
                    </div>
                </form>
            `}
        `;

        // Bind events
        if (isConnected) {
            document.getElementById('btn-cloud-disconnect').addEventListener('click', () => {
                if (confirm("¿Estás seguro de desconectar el sistema de Google Cloud? El ERP volverá a operar de forma aislada en este navegador.")) {
                    localStorage.setItem('pachamama_erp_cloud_disabled', 'true');
                    localStorage.removeItem(configKey);
                    window.db.disconnectFirestore();
                    this.loadSubSection('cloud');
                }
            });

            document.getElementById('btn-cloud-push-local').addEventListener('click', async () => {
                const btn = document.getElementById('btn-cloud-push-local');
                btn.disabled = true;
                btn.innerText = "Subiendo datos...";
                try {
                    await window.db.pushLocalDataToCloud();
                    alert("✅ ¡Todos los datos locales se han subido con éxito a Google Cloud!");
                } catch (e) {
                    alert("❌ Error al subir datos: " + e.message);
                } finally {
                    btn.disabled = false;
                    btn.innerText = "📤 Subir datos locales a la nube";
                }
            });
        } else {
            const form = document.getElementById('form-cloud-config');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const rawJson = document.getElementById('cloud-config-json').value.trim();
                    try {
                        const parsed = JSON.parse(rawJson);
                        if (!parsed.projectId || !parsed.apiKey) {
                            throw new Error("El objeto de configuración debe tener al menos 'projectId' y 'apiKey'.");
                        }
                        
                        localStorage.removeItem('pachamama_erp_cloud_disabled');
                        localStorage.setItem(configKey, JSON.stringify(parsed));
                        window.db.initFirestore();
                        
                        if (window.db.firestore) {
                            const pushConfirm = confirm("✅ Conexión establecida. ¿Deseas subir todos los datos locales actuales de este navegador a tu base de datos en Google Cloud?");
                            if (pushConfirm) {
                                await window.db.pushLocalDataToCloud();
                            }
                            alert("✅ Configuración guardada y sincronización iniciada.");
                            this.loadSubSection('cloud');
                        } else {
                            throw new Error("Error al inicializar Firebase con los datos provistos.");
                        }
                    } catch (err) {
                        alert("❌ Error en la configuración: " + err.message + "\\nAsegúrate de copiar el formato JSON completo correctamente.");
                        localStorage.removeItem(configKey);
                        window.db.disconnectFirestore();
                    }
                });
            }
        }
    }
};

window.configuracionModule = configuracionModule;
