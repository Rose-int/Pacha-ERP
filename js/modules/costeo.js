/* ==========================================================================
   Pachamama ERP - Costeo de Producción Module
   ========================================================================== */

const costeoModule = {
    init() {
        this.renderLayout();
        this.bindEvents();
        this.calculateCosting();
    },

    renderLayout() {
        const container = document.getElementById('view-costeo');
        if (!container) return;

        container.innerHTML = `
            <div class="banner">
                <div>
                    <strong>Módulo de Costeo de Producción (MOD)</strong> - Distribuye el costo real de la planilla de operarios entre las cajas producidas, utilizando los coeficientes estándar de empaque y prorroga los costos de Recepción, Calibrado y Tratamiento Térmico.
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-icon kpi-blue">
                        <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Planilla Real Consolidada</span>
                        <span class="kpi-value" id="kpi-costeo-planilla">S/. 0.00</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon kpi-purple">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><polyline points="12 12 16 14"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Cajas Totales Producidas</span>
                        <span class="kpi-value" id="kpi-costeo-cajas">0</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon kpi-green">
                        <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Costo MOD Promedio / Caja</span>
                        <span class="kpi-value" id="kpi-costeo-promedio">S/. 0.00</span>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon kpi-orange">
                        <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor"/></svg>
                    </div>
                    <div class="kpi-details">
                        <span class="kpi-title">Eficiencia General de Costeo</span>
                        <span class="kpi-value" id="kpi-costeo-eficiencia">100%</span>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="card">
                <div class="form-row">
                    <div class="form-group">
                        <label>Rango de Fechas (Desde)</label>
                        <input type="date" id="costeo-fecha-desde" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Rango de Fechas (Hasta)</label>
                        <input type="date" id="costeo-fecha-hasta" class="form-input">
                    </div>
                    <div class="form-group" style="justify-content: flex-end; display:flex;">
                        <button class="btn btn-primary" id="btn-costeo-refresh" style="width:100%;">🔄 Calcular Costeo MOD</button>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 24px;">
                <!-- Process Summary -->
                <div class="card" style="margin: 0;">
                    <div class="card-title">
                        <h2>Planilla por Proceso / Área</h2>
                    </div>
                    <div class="table-container" style="max-height: 380px;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Área de Trabajo</th>
                                    <th style="text-align: right;">Costo MOD (S/.)</th>
                                    <th style="text-align: right;">%</th>
                                </tr>
                            </thead>
                            <tbody id="table-costeo-procesos-body">
                                <!-- Process breakdown -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Box list summary -->
                <div class="card" style="margin: 0;">
                    <div class="card-title">
                        <h2>Resumen General por Formato de Caja</h2>
                    </div>
                    <div class="table-container" style="max-height: 380px;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Formato Peso</th>
                                    <th style="text-align: right;">Cajas Producidas</th>
                                    <th style="text-align: right;">Kg Totales</th>
                                    <th style="text-align: right;">Costo MOD Promedio</th>
                                </tr>
                            </thead>
                            <tbody id="table-costeo-formatos-body">
                                <!-- Formats breakdown -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Main costing table -->
            <div class="card">
                <div class="card-title">
                    <h2>Costeo Unitario de Mano de Obra por Presentación de Caja</h2>
                    <button class="btn btn-secondary" id="btn-export-costeo-csv">📥 Exportar Reporte Costeo</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Presentación de Caja</th>
                                <th>Destino / Vía</th>
                                <th style="text-align: right;">Cant. Prod.</th>
                                <th style="text-align: right;">Recepción (S/.)</th>
                                <th style="text-align: right;">Calibrado (S/.)</th>
                                <th style="text-align: right;">Hidrotérmico (S/.)</th>
                                <th style="text-align: right;">Empaque (S/.)</th>
                                <th style="text-align: right;">Otros (S/.)</th>
                                <th style="text-align: right; background: rgba(var(--primary-rgb), 0.05); font-weight: 700;">Cost. Unit. (S/.)</th>
                                <th style="text-align: right; font-weight: 700;">Cost. Total (S/. )</th>
                            </tr>
                        </thead>
                        <tbody id="table-costeo-unitario-body">
                            <!-- Box-by-box costings -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Set dates (start of month to today)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        document.getElementById('costeo-fecha-desde').value = firstDay.toISOString().split('T')[0];
        document.getElementById('costeo-fecha-hasta').value = today.toISOString().split('T')[0];

        document.getElementById('btn-costeo-refresh').addEventListener('click', () => {
            this.calculateCosting();
        });

        document.getElementById('btn-export-costeo-csv').addEventListener('click', () => {
            this.exportCostingCSV();
        });
    },

    getCoefficient(box, exportadorName, via, empaqueDest) {
        const coefs = window.db.getAll('coeficientes_costeo');
        
        // Match exporter, via and destination
        let matches = coefs.filter(c => 
            c.exportador.toUpperCase() === exportadorName.toUpperCase() &&
            c.via.toUpperCase() === via.toUpperCase() &&
            c.empaque.toUpperCase() === empaqueDest.toUpperCase()
        );

        if (matches.length === 0) {
            // Fallback to via and destination only
            matches = coefs.filter(c => 
                c.via.toUpperCase() === via.toUpperCase() &&
                c.empaque.toUpperCase() === empaqueDest.toUpperCase()
            );
        }

        if (matches.length === 0) return { ctn: 5544, horas_ctn: 3.0 }; // Standard default

        // Find match by keyword in name
        const nameUpper = box.nombre.toUpperCase();
        let bestMatch = null;
        for (let c of matches) {
            const key = c.caja.toUpperCase();
            if (key !== "OGL" && key !== "PMM" && nameUpper.includes(key)) {
                bestMatch = c;
                break;
            }
        }

        if (!bestMatch) {
            bestMatch = matches.find(c => c.caja.toUpperCase() === "OGL") || 
                        matches.find(c => c.caja.toUpperCase() === "PMM") || 
                        matches[0];
        }

        return bestMatch;
    },

    calculateCosting() {
        const since = document.getElementById('costeo-fecha-desde').value;
        const until = document.getElementById('costeo-fecha-hasta').value;

        const personal = window.db.getAll('personal');
        const asistencia = window.db.getAll('asistencia_diaria');
        const tareo = window.db.getAll('tareo_diario');
        const produccion = window.db.getAll('produccion_diaria');
        const turnos = window.db.getAll('turnos');
        const tiposCaja = window.db.getAll('tipos_caja');
        const empresas = window.db.getAll('empresas');

        const filterFn = (item) => (!since || item.fecha >= since) && (!until || item.fecha <= until);
        
        const filteredAsist = asistencia.filter(filterFn);
        const filteredTareo = tareo.filter(filterFn);
        const filteredProd = produccion.filter(filterFn);

        // 1. Calculate worker daily costs per date and turn
        const workerCosts = {}; // workerCosts[worker_id][date][turn_id] = cost
        
        // Group attendance for quick lookups
        const asistGrouped = {};
        filteredAsist.forEach(a => {
            const key = `${a.fecha}-${a.turno_id}`;
            if (!asistGrouped[key]) asistGrouped[key] = [];
            asistGrouped[key].push(a);
        });

        // Loop over each day/turn combination
        const datesAndTurns = {};
        filteredTareo.forEach(t => {
            datesAndTurns[`${t.fecha}-${t.turno_id}`] = { fecha: t.fecha, turno_id: t.turno_id };
        });

        Object.values(datesAndTurns).forEach(dt => {
            const asistToday = asistGrouped[`${dt.fecha}-${dt.turno_id}`] || [];
            const tareosToday = filteredTareo.filter(t => t.fecha === dt.fecha && t.turno_id === dt.turno_id);
            const turnConfig = turnos.find(trn => trn.id === dt.turno_id);

            // Compute total tareo hours today for each worker present
            const workerActiveHours = {};
            asistToday.forEach(a => {
                const worker = personal.find(p => p.id === a.trabajador_id);
                if (!worker) return;

                // Find all tareos where this worker is in the group
                let totalHrs = 0;
                tareosToday.forEach(t => {
                    const belongs = a.grupo_temporal_id === t.grupo_id || (!a.grupo_temporal_id && worker.grupo_id === t.grupo_id);
                    if (belongs) {
                        const dur = window.utils.diffMinutes(t.hora_inicio, t.hora_fin) / 60;
                        totalHrs += dur;
                    }
                });
                workerActiveHours[worker.id] = totalHrs;
            });

            // Calculate payroll costs and allocate to tareos
            asistToday.forEach(a => {
                const worker = personal.find(p => p.id === a.trabajador_id);
                if (!worker || !workerActiveHours[worker.id]) return;

                const activeHrs = workerActiveHours[worker.id];
                
                // Normal vs Overtime calculation (standard 8 hour shift split)
                let normalHours = 0;
                let overtimeHours = 0;
                if (activeHrs <= 8) {
                    normalHours = activeHrs;
                } else {
                    normalHours = 8;
                    overtimeHours = activeHrs - 8;
                }
                const nightHours = (turnConfig && turnConfig.aplica_bono) ? activeHrs : 0;

                const costPEN = (normalHours * worker.costo_hora_normal) +
                                (overtimeHours * worker.costo_hora_extra) +
                                (nightHours * worker.bono_nocturno);

                // Convert to Soles if USD
                const exchangeRate = 3.8;
                const costInSoles = worker.moneda === 'USD' ? costPEN * exchangeRate : costPEN;

                if (!workerCosts[worker.id]) workerCosts[worker.id] = {};
                if (!workerCosts[worker.id][dt.fecha]) workerCosts[worker.id][dt.fecha] = {};
                workerCosts[worker.id][dt.fecha][dt.turno_id] = costInSoles;
            });
        });

        // 2. Allocate payroll costs to processes
        const processCosts = {
            "PRO01": 0, // Recepción
            "PRO02": 0, // Calibrado
            "PRO04": 0, // Hidrotérmico
            "PRO05": 0, // Empaque
            "OTROS": 0  // Descarte, despacho, indirectos
        };
        let totalPlanillaSoles = 0;

        filteredTareo.forEach(t => {
            const key = `${t.fecha}-${t.turno_id}`;
            const asistToday = asistGrouped[key] || [];
            const segmentHrs = window.utils.diffMinutes(t.hora_inicio, t.hora_fin) / 60;

            // Find worker active hours today on all tareos
            const workerActiveHours = {};
            asistToday.forEach(a => {
                const w = personal.find(p => p.id === a.trabajador_id);
                if (!w) return;
                let total = 0;
                filteredTareo.filter(tar => tar.fecha === t.fecha && tar.turno_id === t.turno_id).forEach(tar => {
                    const belongs = a.grupo_temporal_id === tar.grupo_id || (!a.grupo_temporal_id && w.grupo_id === tar.grupo_id);
                    if (belongs) {
                        total += window.utils.diffMinutes(tar.hora_inicio, tar.hora_fin) / 60;
                    }
                });
                workerActiveHours[w.id] = total;
            });

            asistToday.forEach(a => {
                const w = personal.find(p => p.id === a.trabajador_id);
                if (!w || !workerActiveHours[w.id]) return;

                const belongs = a.grupo_temporal_id === t.grupo_id || (!a.grupo_temporal_id && w.grupo_id === t.grupo_id);
                if (belongs) {
                    const dailyCost = workerCosts[w.id]?.[t.fecha]?.[t.turno_id] || 0;
                    const totalActiveToday = workerActiveHours[w.id];

                    // Cost fraction for this tareo segment
                    const segmentCost = dailyCost * (segmentHrs / totalActiveToday);
                    
                    // Allocate by process
                    let pId = t.proceso_id || "OTROS";
                    if (pId.includes("PRO01")) pId = "PRO01";
                    else if (pId.includes("PRO02")) pId = "PRO02";
                    else if (pId.includes("PRO04")) pId = "PRO04";
                    else if (pId.includes("PRO05")) pId = "PRO05";
                    else pId = "OTROS";

                    processCosts[pId] += segmentCost;
                    totalPlanillaSoles += segmentCost;
                }
            });
        });

        // 3. Compile quantities produced by box presentation
        const boxProduction = {}; // boxProduction[box_id] = { qty, kg, format }
        let totalCajasProducidas = 0;
        let totalKgProducidos = 0;

        filteredProd.forEach(p => {
            const exp = empresas.find(e => e.id === p.empresa_id);
            const expName = exp ? exp.nombre : "PACHAMAMA";

            p.cajas.forEach(c => {
                const box = tiposCaja.find(tc => tc.id === c.tipo_caja_id);
                if (!box) return;

                const qty = c.cantidad || 0;
                const weightPerBox = box.peso_teorico || 4.0;
                const kg = qty * weightPerBox;

                totalCajasProducidas += qty;
                totalKgProducidos += kg;

                if (!boxProduction[box.id]) {
                    boxProduction[box.id] = {
                        box: box,
                        qty: 0,
                        kg: 0,
                        workloads: 0, // equivalent hours sum
                        exporter: expName,
                        via: p.via || "MARITIMO",
                        destino: p.destino || "EUROPA"
                    };
                }
                boxProduction[box.id].qty += qty;
                boxProduction[box.id].kg += kg;

                // Standard packaging coefficient allocation
                const coef = this.getCoefficient(box, expName, p.via, p.destino);
                const hrsPerBox = coef.horas_ctn / (coef.ctn || 5544);
                boxProduction[box.id].workloads += qty * hrsPerBox;
            });
        });

        // 4. Perform ABC Allocation to produced box presentations
        const totalEmpaqueWorkloads = Object.values(boxProduction).reduce((sum, item) => sum + item.workloads, 0);
        const totalKgProducedSum = Object.values(boxProduction).reduce((sum, item) => sum + item.kg, 0);
        const totalHidroKgSum = Object.values(boxProduction).filter(item => item.box.requiere_hidrotermico).reduce((sum, item) => sum + item.kg, 0);
        const totalQtySum = Object.values(boxProduction).reduce((sum, item) => sum + item.qty, 0);

        const costingDetails = [];

        Object.values(boxProduction).forEach(item => {
            const box = item.box;
            const qty = item.qty;
            const kg = item.kg;

            // Allocation of Recepción (based on Kg)
            const allocatedRecep = totalKgProducedSum > 0 ? processCosts["PRO01"] * (kg / totalKgProducedSum) : 0;
            const uRecep = qty > 0 ? allocatedRecep / qty : 0;

            // Allocation of Calibrado (based on Kg)
            const allocatedCalib = totalKgProducedSum > 0 ? processCosts["PRO02"] * (kg / totalKgProducedSum) : 0;
            const uCalib = qty > 0 ? allocatedCalib / qty : 0;

            // Allocation of Hidrotérmico (only if required, based on Kg)
            let allocatedHidro = 0;
            if (box.requiere_hidrotermico && totalHidroKgSum > 0) {
                allocatedHidro = processCosts["PRO04"] * (kg / totalHidroKgSum);
            }
            const uHidro = qty > 0 ? allocatedHidro / qty : 0;

            // Allocation of Empaque (based on Standard Packaging Workloads)
            const allocatedEmpaque = totalEmpaqueWorkloads > 0 ? processCosts["PRO05"] * (item.workloads / totalEmpaqueWorkloads) : 0;
            const uEmpaque = qty > 0 ? allocatedEmpaque / qty : 0;

            // Allocation of Other/Indirect costs (based on overall quantity)
            const allocatedOtros = totalQtySum > 0 ? processCosts["OTROS"] * (qty / totalQtySum) : 0;
            const uOtros = qty > 0 ? allocatedOtros / qty : 0;

            const uTotalCost = uRecep + uCalib + uHidro + uEmpaque + uOtros;
            const totalAssigned = qty * uTotalCost;

            costingDetails.push({
                box: box,
                qty: qty,
                kg: kg,
                via: item.via,
                destino: item.destino,
                recepcion: uRecep,
                calibrado: uCalib,
                hidrotermico: uHidro,
                empaque: uEmpaque,
                otros: uOtros,
                unitario: uTotalCost,
                total: totalAssigned
            });
        });

        // 5. Render KPIs and UI tables
        const averageCost = totalQtySum > 0 ? totalPlanillaSoles / totalQtySum : 0;

        document.getElementById('kpi-costeo-planilla').innerText = `S/. ${totalPlanillaSoles.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('kpi-costeo-cajas').innerText = totalCajasProducidas.toLocaleString('es-PE');
        document.getElementById('kpi-costeo-promedio').innerText = `S/. ${averageCost.toFixed(3)}`;

        // Render Process Breakdown Table
        const tbodyProc = document.getElementById('table-costeo-procesos-body');
        if (tbodyProc) {
            tbodyProc.innerHTML = '';
            const processNames = {
                "PRO01": "🚚 Recepción MP",
                "PRO02": "📐 Calibrado",
                "PRO04": "♨️ Tratamiento Térmico",
                "PRO05": "📦 Empaque / Descarte",
                "OTROS": "⚙️ Indirectos / Soporte"
            };

            Object.keys(processCosts).forEach(pId => {
                const cost = processCosts[pId];
                const pct = totalPlanillaSoles > 0 ? (cost / totalPlanillaSoles) * 100 : 0;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${processNames[pId] || pId}</strong></td>
                    <td style="text-align: right; font-weight: 600;">S/. ${cost.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style="text-align: right; color: var(--text-secondary);">${pct.toFixed(1)}%</td>
                `;
                tbodyProc.appendChild(tr);
            });
        }

        // Render Format Breakdown Table
        const formatSummary = {}; // formatSummary[format] = { qty, kg, cost }
        costingDetails.forEach(cd => {
            const format = cd.box.formato || "Otro";
            if (!formatSummary[format]) {
                formatSummary[format] = { qty: 0, kg: 0, cost: 0 };
            }
            formatSummary[format].qty += cd.qty;
            formatSummary[format].kg += cd.kg;
            formatSummary[format].cost += cd.total;
        });

        const tbodyFormat = document.getElementById('table-costeo-formatos-body');
        if (tbodyFormat) {
            tbodyFormat.innerHTML = '';
            Object.keys(formatSummary).forEach(format => {
                const item = formatSummary[format];
                const avg = item.qty > 0 ? item.cost / item.qty : 0;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${format}</strong></td>
                    <td style="text-align: right;">${item.qty.toLocaleString('es-PE')}</td>
                    <td style="text-align: right;">${item.kg.toLocaleString('es-PE', { maximumFractionDigits: 1 })} Kg</td>
                    <td style="text-align: right; font-weight: 600;">S/. ${avg.toFixed(3)}</td>
                `;
                tbodyFormat.appendChild(tr);
            });
        }

        // Render Unit Costing Details Table
        const tbodyUnit = document.getElementById('table-costeo-unitario-body');
        if (tbodyUnit) {
            tbodyUnit.innerHTML = '';

            if (costingDetails.length === 0) {
                tbodyUnit.innerHTML = `
                    <tr>
                        <td colspan="10" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                            ⚠️ No se registran partes de producción ni tareos en el rango de fechas seleccionado.
                        </td>
                    </tr>
                `;
                return;
            }

            costingDetails.sort((a, b) => b.qty - a.qty).forEach(cd => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div style="font-weight: 600; color: var(--text-primary);">${cd.box.nombre}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${cd.box.codigo} (${cd.box.formato})</div>
                    </td>
                    <td>
                        <span class="badge ${cd.via === 'AEREO' ? 'badge-blue' : 'badge-green'}">${cd.via}</span>
                        <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">${cd.destino}</span>
                    </td>
                    <td style="text-align: right; font-weight: 600;">${cd.qty.toLocaleString('es-PE')}</td>
                    <td style="text-align: right; color: var(--text-secondary);">S/. ${cd.recepcion.toFixed(3)}</td>
                    <td style="text-align: right; color: var(--text-secondary);">S/. ${cd.calibrado.toFixed(3)}</td>
                    <td style="text-align: right; color: var(--text-secondary);">${cd.box.requiere_hidrotermico ? `S/. ${cd.hidrotermico.toFixed(3)}` : '-'}</td>
                    <td style="text-align: right; color: var(--text-secondary);">S/. ${cd.empaque.toFixed(3)}</td>
                    <td style="text-align: right; color: var(--text-secondary);">S/. ${cd.otros.toFixed(3)}</td>
                    <td style="text-align: right; background: rgba(var(--primary-rgb), 0.05); font-weight: 700; color: var(--primary-color);">S/. ${cd.unitario.toFixed(3)}</td>
                    <td style="text-align: right; font-weight: 700;">S/. ${cd.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                `;
                tbodyUnit.appendChild(tr);
            });
        }

        // Cache details for exporter CSV export
        this.currentCostings = costingDetails;
    },

    exportCostingCSV() {
        if (!this.currentCostings || this.currentCostings.length === 0) {
            alert("No hay registros cargados para exportar.");
            return;
        }

        let csv = 'Presentacion de Caja,Codigo,Formato,Via,Destino,Cantidad,Costo Recepcion (S/.),Costo Calibrado (S/.),Costo Hidrotermico (S/.),Costo Empaque (S/.),Costo Otros (S/.),Costo Unitario Total (S/.),Costo MOD Total (S/.)\n';
        
        this.currentCostings.forEach(cd => {
            const row = [
                `"${cd.box.nombre.replace(/"/g, '""')}"`,
                cd.box.codigo,
                cd.box.formato,
                cd.via,
                cd.destino,
                cd.qty,
                cd.recepcion.toFixed(4),
                cd.calibrado.toFixed(4),
                cd.hidrotermico.toFixed(4),
                cd.empaque.toFixed(4),
                cd.otros.toFixed(4),
                cd.unitario.toFixed(4),
                cd.total.toFixed(2)
            ];
            csv += row.join(',') + '\n';
        });

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `REPORTE_COSTEO_MOD_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

window.costeoModule = costeoModule;
