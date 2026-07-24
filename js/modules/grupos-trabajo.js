/* ==========================================================================
   Pachamama ERP - Work Groups Configuration Module (Enhanced)
   ========================================================================== */

const gruposTrabajoModule = {
    selectedGrupoId: '',

    init() {
        this.selectedGrupoId = '';
        this.renderLayout();
        this.bindEvents();
        this.renderGroupsGrid();
    },

    renderLayout() {
        const container = document.getElementById('view-grupos-trabajo');
        if (!container) return;

        const supervisores = window.db.getAll('supervisores').filter(s => s.estado === 'Activo');

        container.innerHTML = `
            <style>
            .gt-group-card {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 16px;
                box-shadow: var(--shadow-premium);
                transition: all 0.25s ease;
            }
            .gt-group-card:hover {
                transform: translateY(-2px);
                border-color: var(--accent-emerald);
            }
            .gt-group-card.active-card {
                border: 2px solid var(--accent-emerald);
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
            }
            .gt-worker-pill {
                display: inline-flex;
                align-items: center;
                background: rgba(15, 23, 42, 0.04);
                border: 1px solid var(--border-color);
                border-radius: 20px;
                padding: 4px 10px;
                font-size: 0.75rem;
                font-weight: 500;
                color: var(--text-secondary);
                gap: 6px;
            }
            .gt-member-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 14px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                transition: background-color 0.2s;
            }
            .gt-member-row:hover {
                background-color: rgba(15, 23, 42, 0.01);
            }
            .unassigned-alert {
                background: rgba(217, 119, 6, 0.08);
                border: 1px solid rgba(217, 119, 6, 0.2);
                border-left: 5px solid #D97706;
                border-radius: 8px;
                padding: 12px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                gap: 16px;
                flex-wrap: wrap;
            }
            </style>

            <div class="banner" style="margin-bottom: 20px;">
                <div>
                    <strong>Grupos de Trabajo de la Planta</strong> - Define qué operarios pertenecen a cada grupo permanente. La asistencia diaria y el tareo utilizarán esta configuración por defecto.
                </div>
            </div>

            <!-- ⚠️ Unassigned Workers Alert Banner -->
            <div id="gt-unassigned-alert" class="unassigned-alert" style="display: none;">
                <!-- Loaded dynamically -->
            </div>

            <!-- Top Actions -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
                <button class="btn btn-primary" id="btn-toggle-new-group">➕ Crear Nuevo Grupo</button>
            </div>

            <!-- New Group Form Card (Collapsible) -->
            <div class="card" id="card-nuevo-grupo" style="display: none; margin-bottom: 24px; border: 1px solid var(--accent-emerald);">
                <div class="card-title">
                    <h2 id="form-group-title">Registrar Nuevo Grupo de Trabajo</h2>
                </div>
                <form id="form-gt-grupo">
                    <input type="hidden" id="gt-id" value="">
                    <div class="form-row" style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px;">
                        <div class="form-group">
                            <label>Nombre / Código del Grupo</label>
                            <input type="text" id="gt-nombre" class="form-input" placeholder="Ej. Grupo Calibrado A" required>
                        </div>
                        <div class="form-group">
                            <label>Área de Proceso</label>
                            <select id="gt-area" class="form-select" required>
                                <option value="Recepción">Recepción</option>
                                <option value="Calibrado">Calibrado</option>
                                <option value="Tratamiento Hidrotérmico">Tratamiento Hidrotérmico</option>
                                <option value="Empaque">Empaque</option>
                                <option value="Despacho">Despacho</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Supervisor Habitual</label>
                            <select id="gt-supervisor" class="form-select" required>
                                <option value="">Selecciona Supervisor...</option>
                                ${supervisores.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Turno Habitual</label>
                            <select id="gt-turno" class="form-select" required>
                                <option value="Dia">☀️ Día (08:00 - 20:00)</option>
                                <option value="Noche">🌙 Noche (20:00 - 08:00)</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                        <button type="button" class="btn btn-secondary" id="btn-cancel-group">Cancelar</button>
                        <button type="submit" class="btn btn-primary" id="btn-save-group">Guardar Grupo</button>
                    </div>
                </form>
            </div>

            <!-- Groups & Members Grid (Side-by-Side layout if a group is selected) -->
            <div style="display: grid; grid-template-columns: 1fr; gap: 24px; transition: all 0.3s;" id="gt-workspace-layout">
                
                <!-- Left/Main: Groups Grid -->
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">👥 Grupos Registrados</h3>
                    <div class="attendance-grid" id="gt-groups-container">
                        <!-- Loaded dynamically -->
                    </div>
                </div>

                <!-- Right/Slide-in: Members Manager -->
                <div class="card" id="card-manage-members" style="display: none; border: 2px solid var(--accent-emerald); align-self: start;">
                    <div class="card-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h2 id="manage-members-title" style="margin: 0; font-size: 1.25rem;">Integrantes del Grupo</h2>
                        <button class="btn btn-danger btn-sm" id="btn-close-members" style="padding: 4px 8px;">✕ Cerrar</button>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
                        Gestiona los operarios permanentes de este grupo. Los cambios se guardan automáticamente.
                    </p>

                    <!-- Search to add worker (Lupita) -->
                    <div style="display: flex; gap: 8px; align-items: center; background: rgba(15, 23, 42, 0.02); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color); position: relative; margin-bottom: 20px;">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--text-muted)" stroke-width="2.5" fill="none" style="margin-right: 4px;">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="gt-member-search" placeholder="Buscar operario por DNI, Código o Nombre para agregar a este grupo..." style="border: none; background: transparent; outline: none; width: 100%; font-size: 0.85rem; color: var(--text-primary);">
                        
                        <!-- Search Results -->
                        <div id="gt-search-results" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: var(--shadow-premium); z-index: 100; max-height: 200px; overflow-y: auto; margin-top: 4px;">
                            <!-- MATCHES -->
                        </div>
                    </div>

                    <!-- Members List -->
                    <div style="display: flex; flex-direction: column; gap: 10px;" id="gt-members-list-container">
                        <!-- Loaded dynamically -->
                    </div>
                </div>

            </div>
        `;
    },

    bindEvents() {
        const btnToggleNew = document.getElementById('btn-toggle-new-group');
        const btnCancel = document.getElementById('btn-cancel-group');
        const form = document.getElementById('form-gt-grupo');
        const cardNuevo = document.getElementById('card-nuevo-grupo');

        btnToggleNew.addEventListener('click', () => {
            document.getElementById('gt-id').value = '';
            document.getElementById('gt-nombre').value = '';
            document.getElementById('gt-supervisor').value = '';
            document.getElementById('gt-turno').value = 'Dia';
            document.getElementById('form-group-title').innerText = 'Registrar Nuevo Grupo de Trabajo';
            cardNuevo.style.display = cardNuevo.style.display === 'none' ? 'block' : 'none';
        });

        btnCancel.addEventListener('click', () => {
            cardNuevo.style.display = 'none';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGroup();
        });

        document.getElementById('btn-close-members').addEventListener('click', () => {
            this.closeMembersManager();
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            const results = document.getElementById('gt-search-results');
            const searchInput = document.getElementById('gt-member-search');
            if (results && searchInput && !results.contains(e.target) && e.target !== searchInput) {
                results.style.display = 'none';
            }
        });

        this.bindSearchEvent();
    },

    renderGroupsGrid() {
        const container = document.getElementById('gt-groups-container');
        if (!container) return;

        const grupos = window.db.getAll('grupos').filter(g => g.estado === 'Activo');
        const personal = window.db.getAll('personal').filter(p => p.estado === 'Activo');
        const supervisores = window.db.getAll('supervisores');

        // Check for unassigned workers
        const unassignedWorkers = personal.filter(p => !p.grupo_id);
        const unassignedContainer = document.getElementById('gt-unassigned-alert');
        if (unassignedContainer) {
            if (unassignedWorkers.length > 0) {
                unassignedContainer.style.display = 'flex';
                unassignedContainer.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px; color:#B45309;">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <span><strong>Operarios sin Grupo:</strong> Hay <strong>${unassignedWorkers.length}</strong> trabajadores que no están asignados a ningún grupo fijo.</span>
                    </div>
                    <button class="btn btn-secondary btn-sm" id="btn-view-unassigned" style="padding: 4px 12px; font-size: 0.75rem; border-color:#D97706; color:#B45309; background:rgba(217,119,6,0.05); font-weight:700;">Ver y Asignar</button>
                `;

                document.getElementById('btn-view-unassigned').addEventListener('click', () => {
                    this.showUnassignedModal(unassignedWorkers);
                });
            } else {
                unassignedContainer.style.display = 'none';
            }
        }

        container.innerHTML = '';

        if (grupos.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 20px; color:var(--text-muted);">No hay grupos de trabajo registrados.</div>`;
            return;
        }

        grupos.forEach(g => {
            const supName = supervisores.find(s => s.id === g.supervisor_id)?.nombre || 'Sin Supervisor';
            const groupWorkers = personal.filter(p => p.grupo_id === g.id);

            const card = document.createElement('div');
            card.className = `gt-group-card ${this.selectedGrupoId === g.id ? 'active-card' : ''}`;
            card.dataset.id = g.id;

            card.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span style="font-weight: 700; color: var(--text-primary); font-size: 1.1rem;">🛡️ ${g.codigo_grupo}</span>
                        <div style="display:flex; gap:6px;">
                            ${g.area_proceso ? `<span class="badge badge-purple" style="font-size:0.72rem; padding: 3px 8px;">${g.area_proceso}</span>` : ''}
                            <span class="badge ${g.turno_habitual === 'Dia' ? 'badge-green' : 'badge-purple'}" style="font-size:0.72rem; padding: 3px 8px; display:flex; align-items:center; gap:4px;">
                                ${g.turno_habitual === 'Dia' ? '☀️ Día' : '🌙 Noche'}
                            </span>
                        </div>
                    </div>
                    <span style="font-size: 0.82rem; color: var(--text-secondary);">Supervisor: <strong>${supName}</strong></span>
                </div>

                <!-- Workers preview -->
                <div style="margin-top: 6px; border-top: 1px dashed var(--border-color); padding-top: 10px;">
                    <label style="font-size:0.7rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom: 6px;">Integrantes (${groupWorkers.length})</label>
                    <div style="display:flex; flex-wrap:wrap; gap:6px; max-height:80px; overflow-y:auto; padding-right:4px;">
                        ${groupWorkers.length === 0 ? 
                            `<span style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Sin integrantes asignados</span>` : 
                            groupWorkers.map(w => `<span class="gt-worker-pill">${w.nombre} ${w.apellidos.charAt(0)}.</span>`).join('')
                        }
                    </div>
                </div>

                <!-- Actions -->
                <div style="display:flex; justify-content:space-between; gap: 8px; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                    <button class="btn btn-primary btn-sm btn-manage-mem" data-id="${g.id}" style="padding: 4px 10px; font-size:0.75rem; display:flex; align-items:center; gap:4px;">👥 Integrantes</button>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-secondary btn-sm btn-edit-grp" data-id="${g.id}" style="padding: 4px 8px; font-size:0.75rem;">✏️</button>
                        <button class="btn btn-danger btn-sm btn-del-grp" data-id="${g.id}" style="padding: 4px 8px; font-size:0.75rem;">✕</button>
                    </div>
                </div>
            `;

            // Event bindings
            card.querySelector('.btn-manage-mem').addEventListener('click', (e) => {
                e.stopPropagation();
                this.openMembersManager(g.id);
            });

            card.querySelector('.btn-edit-grp').addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadGroupToForm(g);
            });

            card.querySelector('.btn-del-grp').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteGroup(g);
            });

            container.appendChild(card);
        });
    },

    loadGroupToForm(g) {
        document.getElementById('gt-id').value = g.id;
        document.getElementById('gt-nombre').value = g.codigo_grupo;
        document.getElementById('gt-area').value = g.area_proceso || 'Otro';
        document.getElementById('gt-supervisor').value = g.supervisor_id;
        document.getElementById('gt-turno').value = g.turno_habitual;

        document.getElementById('form-group-title').innerText = 'Editar Grupo de Trabajo';
        document.getElementById('card-nuevo-grupo').style.display = 'block';
        document.getElementById('card-nuevo-grupo').scrollIntoView({ behavior: 'smooth' });
    },

    saveGroup() {
        const id = document.getElementById('gt-id').value;
        const nombre = document.getElementById('gt-nombre').value.trim();
        const areaProceso = document.getElementById('gt-area').value;
        const supervisorId = document.getElementById('gt-supervisor').value;
        const turnoHabitual = document.getElementById('gt-turno').value;

        if (!nombre || !supervisorId || !turnoHabitual) return;

        const record = {
            codigo_grupo: nombre,
            area_proceso: areaProceso,
            supervisor_id: supervisorId,
            turno_habitual: turnoHabitual,
            estado: 'Activo'
        };

        if (id) {
            // Edit existing group
            record.id = id;
            window.db.update('grupos', id, record);
            alert("Grupo de trabajo actualizado con éxito.");
        } else {
            // Insert new group
            window.db.insert('grupos', record);
            alert("Grupo de trabajo creado con éxito.");
        }

        document.getElementById('card-nuevo-grupo').style.display = 'none';
        this.renderGroupsGrid();
    },

    deleteGroup(g) {
        const personal = window.db.getAll('personal').filter(p => p.grupo_id === g.id && p.estado === 'Activo');
        if (personal.length > 0) {
            alert(`No se puede eliminar el grupo "${g.codigo_grupo}" porque tiene ${personal.length} operarios asignados. Remueve o mueve a los operarios primero.`);
            return;
        }

        if (confirm(`¿Estás seguro de eliminar el grupo "${g.codigo_grupo}"?`)) {
            // Delete group
            window.db.delete('grupos', g.id);
            alert("Grupo eliminado exitosamente.");
            if (this.selectedGrupoId === g.id) {
                this.closeMembersManager();
            }
            this.renderGroupsGrid();
        }
    },

    openMembersManager(groupId) {
        this.selectedGrupoId = groupId;

        // Change layout grid to 2 columns (Groups | Members)
        const layout = document.getElementById('gt-workspace-layout');
        layout.style.gridTemplateColumns = '1.2fr 1fr';

        // Show search input (which might have been hidden in showUnassignedModal)
        const searchBar = document.getElementById('gt-member-search').parentElement;
        searchBar.style.display = 'flex';

        // Load active group
        const g = window.db.getById('grupos', groupId);
        document.getElementById('manage-members-title').innerHTML = `Integrantes: <span style="color:var(--accent-emerald); font-weight:800;">${g.codigo_grupo}</span>`;
        document.getElementById('card-manage-members').style.display = 'block';

        this.renderGroupsGrid(); // Highlight active card
        this.renderMembersList();
    },

    closeMembersManager() {
        this.selectedGrupoId = '';
        const layout = document.getElementById('gt-workspace-layout');
        if (layout) {
            layout.style.gridTemplateColumns = '1fr';
        }
        const panel = document.getElementById('card-manage-members');
        if (panel) {
            panel.style.display = 'none';
        }
        this.renderGroupsGrid();
    },

    renderMembersList() {
        const container = document.getElementById('gt-members-list-container');
        if (!container || !this.selectedGrupoId) return;

        const personal = window.db.getAll('personal').filter(p => p.grupo_id === this.selectedGrupoId && p.estado === 'Activo');

        container.innerHTML = '';

        if (personal.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted); font-style:italic;">No hay integrantes asignados a este grupo. Agrega uno usando el buscador de arriba.</div>`;
            return;
        }

        personal.forEach(w => {
            const row = document.createElement('div');
            row.className = 'gt-member-row';
            row.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <span style="font-weight:600; font-size:0.88rem; color:var(--text-primary);">${w.nombre} ${w.apellidos}</span>
                    <span style="font-size:0.72rem; color:var(--text-muted);">Ficha: ${w.codigo} | DNI: ${w.dni}</span>
                </div>
                <button class="btn btn-danger btn-sm btn-remove-mem" data-id="${w.id}" style="padding: 2px 8px; font-size: 0.72rem;">Quitar</button>
            `;

            row.querySelector('.btn-remove-mem').addEventListener('click', () => {
                this.removeWorkerFromGroup(w.id);
            });

            container.appendChild(row);
        });
    },

    removeWorkerFromGroup(workerId) {
        const worker = window.db.getById('personal', workerId);
        if (!worker) return;

        // Unset group_id
        worker.grupo_id = '';
        window.db.update('personal', workerId, worker);

        this.renderMembersList();
        this.renderGroupsGrid();
    },

    showUnassignedModal(unassignedWorkers) {
        this.selectedGrupoId = 'UNASSIGNED';

        const layout = document.getElementById('gt-workspace-layout');
        layout.style.gridTemplateColumns = '1.2fr 1fr';

        document.getElementById('manage-members-title').innerHTML = `Operarios sin Grupo`;
        document.getElementById('card-manage-members').style.display = 'block';

        // Hide search input
        const searchBar = document.getElementById('gt-member-search').parentElement;
        searchBar.style.display = 'none';

        const container = document.getElementById('gt-members-list-container');
        container.innerHTML = '';

        const activeGroups = window.db.getAll('grupos').filter(g => g.estado === 'Activo');

        unassignedWorkers.forEach(w => {
            const row = document.createElement('div');
            row.className = 'gt-member-row';
            row.style.cssText = 'display:flex; flex-direction:column; gap:8px; padding:12px;';
            row.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <span style="font-weight:600; font-size:0.88rem; color:var(--text-primary);">${w.nombre} ${w.apellidos}</span>
                        <span style="font-size:0.72rem; color:var(--text-muted);">Cod: ${w.codigo} | DNI: ${w.dni}</span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px; border-top:1px dashed var(--border-color); padding-top:8px;">
                    <label style="font-size:0.7rem; color:var(--text-secondary); margin:0; font-weight:600;">Asignar a Grupo:</label>
                    <select class="form-select select-assign-group" style="padding: 4px 8px; font-size:0.75rem; width:auto; height:28px;">
                        <option value="">Seleccione grupo...</option>
                        ${activeGroups.map(g => `<option value="${g.id}">${g.codigo_grupo}</option>`).join('')}
                    </select>
                </div>
            `;

            row.querySelector('.select-assign-group').addEventListener('change', (e) => {
                const gId = e.target.value;
                if (!gId) return;

                w.grupo_id = gId;
                window.db.update('personal', w.id, w);
                
                // Refresh list of unassigned
                const personal = window.db.getAll('personal').filter(p => p.estado === 'Activo');
                const updatedUnassigned = personal.filter(p => !p.grupo_id);

                alert(`Operario asignado exitosamente al grupo.`);

                if (updatedUnassigned.length > 0) {
                    this.showUnassignedModal(updatedUnassigned);
                } else {
                    this.closeMembersManager();
                }
                this.renderGroupsGrid();
            });

            container.appendChild(row);
        });
    },

    bindSearchEvent() {
        const searchInput = document.getElementById('gt-member-search');
        const results = document.getElementById('gt-search-results');
        if (!searchInput || !results) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                results.style.display = 'none';
                return;
            }

            const personal = window.db.getAll('personal').filter(p => p.estado === 'Activo');
            const groups = window.db.getAll('grupos');
            
            // Matches: active workers not in the current group
            const matches = personal.filter(p => {
                if (p.grupo_id === this.selectedGrupoId) return false;
                const fullname = `${p.nombre} ${p.apellidos}`.toLowerCase();
                return fullname.includes(query) || p.dni.includes(query) || p.codigo.toLowerCase().includes(query);
            }).slice(0, 8);

            results.innerHTML = '';

            if (matches.length === 0) {
                results.innerHTML = `<div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No se encontraron operarios.</div>`;
                results.style.display = 'block';
                return;
            }

            matches.forEach(w => {
                const currentGrpName = groups.find(g => g.id === w.grupo_id)?.codigo_grupo || 'Sin grupo';
                const row = document.createElement('div');
                row.style.cssText = 'padding: 8px 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background-color 0.2s;';
                
                row.addEventListener('mouseover', () => { row.style.backgroundColor = 'rgba(15,23,42,0.03)'; });
                row.addEventListener('mouseout', () => { row.style.backgroundColor = 'transparent'; });
                
                row.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap: 2px;">
                        <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">${w.nombre} ${w.apellidos}</span>
                        <span style="font-size: 0.7rem; color: var(--text-muted);">Cod: ${w.codigo} | DNI: ${w.dni} | Actual: ${currentGrpName}</span>
                    </div>
                    <button class="btn btn-secondary btn-sm" style="padding: 2px 8px; font-size: 0.7rem; background-color: var(--accent-emerald-glow); color: var(--accent-emerald); border-color: rgba(16,185,129,0.2);">Asignar</button>
                `;

                row.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.addWorkerToGroup(w.id);
                    searchInput.value = '';
                    results.style.display = 'none';
                });

                results.appendChild(row);
            });

            results.style.display = 'block';
        });
    },

    addWorkerToGroup(workerId) {
        if (!this.selectedGrupoId) return;

        const worker = window.db.getById('personal', workerId);
        if (!worker) return;

        // Set group_id to current active group
        worker.grupo_id = this.selectedGrupoId;
        window.db.update('personal', workerId, worker);

        this.renderMembersList();
        this.renderGroupsGrid();
    }
};

window.gruposTrabajoModule = gruposTrabajoModule;
