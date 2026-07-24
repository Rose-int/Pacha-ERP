/* ==========================================================================
   Pachamama ERP - Utilities
   ========================================================================== */

const utils = {
    // Convert 'HH:MM' string to minutes from 00:00
    timeToMin(timeStr) {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    },

    // Convert minutes from 00:00 to 'HH:MM'
    minToTime(mins) {
        if (mins < 0) mins = 0;
        mins = mins % 1440; // cap at 24 hours
        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        return `${h}:${m}`;
    },

    // Calculates difference in minutes between two HH:MM times, handling crossing midnight
    diffMinutes(start, end) {
        const startMin = this.timeToMin(start);
        let endMin = this.timeToMin(end);
        
        if (endMin < startMin) {
            // Crossed midnight
            endMin += 1440;
        }
        return endMin - startMin;
    },

    // Splits a log entry that crosses midnight into two separate records
    // Returns an array of one or two elements: [{start, end, crosses: false}, ...]
    splitMidnight(start, end) {
        const startMin = this.timeToMin(start);
        const endMin = this.timeToMin(end);
        
        if (endMin < startMin) {
            // Crosses midnight
            return [
                { start: start, end: "23:59", dayOffset: 0 },
                { start: "00:00", end: end, dayOffset: 1 }
            ];
        }
        return [{ start: start, end: end, dayOffset: 0 }];
    },

    // Perform automatic production calculations
    calculateProductionMetrics(boxesArray, timeStart, timeEnd, paradaMinutos) {
        const duracionMins = this.diffMinutes(timeStart, timeEnd);
        const efectivoMins = Math.max(0, duracionMins - Number(paradaMinutos || 0));
        
        let totalCajas = 0;
        let kgTeoricos = 0;
        let kgReales = 0;
        
        boxesArray.forEach(box => {
            const boxConfig = window.db.getById('tipos_caja', box.tipo_caja_id);
            if (boxConfig) {
                const qty = Number(box.cantidad_cajas || 0);
                const avgWeight = Number(box.peso_promedio_real || 0);
                
                totalCajas += qty;
                kgTeoricos += qty * boxConfig.peso_teorico;
                kgReales += qty * avgWeight;
            }
        });

        const desviacionKg = kgReales - kgTeoricos;
        const desviacionPorc = kgTeoricos > 0 ? (desviacionKg / kgTeoricos) * 100 : 0;
        
        // Classification thresholds
        let clasificacion = "Dentro rango";
        if (desviacionPorc > 3.0) {
            clasificacion = "Sobrepeso";
        } else if (desviacionPorc < -1.0) {
            clasificacion = "Bajo peso";
        }

        const horasEfectivas = efectivoMins / 60;
        const cajasHora = horasEfectivas > 0 ? totalCajas / horasEfectivas : 0;
        const kgHora = horasEfectivas > 0 ? kgReales / horasEfectivas : 0;

        return {
            totalCajas,
            duracionMins,
            efectivoMins,
            kgTeoricos: Math.round(kgTeoricos * 100) / 100,
            kgReales: Math.round(kgReales * 100) / 100,
            desviacionKg: Math.round(desviacionKg * 100) / 100,
            desviacionPorc: Math.round(desviacionPorc * 100) / 100,
            clasificacion,
            cajasHora: Math.round(cajasHora * 10) / 10,
            kgHora: Math.round(kgHora * 10) / 10,
            eficiencia: totalCajas > 0 ? Math.round((kgReales / (totalCajas * 10)) * 100) : 0 // hypothetical efficiency
        };
    },

    // Export array of objects to CSV
    exportToCSV(filename, headers, dataArray, mappingFn) {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM for Excel
        
        // Add headers
        csvContent += headers.join(",") + "\n";
        
        // Add rows
        dataArray.forEach(item => {
            const row = mappingFn(item);
            const escapedRow = row.map(val => {
                if (val === undefined || val === null) return '""';
                let str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            });
            csvContent += escapedRow.join(",") + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Import from CSV string
    parseCSV(text) {
        const lines = text.split(/\r\n|\n/);
        return lines.map(line => {
            // regex to split by comma except inside quotes
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            return matches.map(val => val.replace(/^"|"$/g, '').trim());
        }).filter(row => row.length > 0);
    },

    // Export data to a true Excel (.xlsx) file
    exportToExcel(filename, sheetName, headers, data, mapRowFn) {
        if (typeof XLSX === 'undefined') {
            alert("Error: La librería de Excel (SheetJS) no está cargada.");
            return;
        }
        try {
            const rows = data.map(mapRowFn);
            const wsData = [headers, ...rows];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            // Set auto column widths for premium feel
            const colWidths = headers.map((h, i) => {
                let maxLen = h.length;
                rows.forEach(r => {
                    const val = r[i] !== undefined && r[i] !== null ? String(r[i]) : '';
                    if (val.length > maxLen) maxLen = val.length;
                });
                return { wch: maxLen + 3 };
            });
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, filename);
        } catch (e) {
            console.error("Error writing Excel file", e);
            alert("Ocurrió un error al generar el archivo Excel.");
        }
    },

    // Parse true Excel file (.xlsx, .xls) to a 2D Array of rows and cells
    parseExcelFile(file) {
        return new Promise((resolve, reject) => {
            if (typeof XLSX === 'undefined') {
                reject(new Error("Librería de Excel no cargada."));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                    resolve(json);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    },

    // Generate HTML options list from a db collection to avoid code repetition
    optionsHTML(collectionKey, valueField = 'id', textField = 'nombre', selectedValue = '', filterFn = null) {
        if (!window.db) return '';
        let list = window.db.getAll(collectionKey) || [];
        if (filterFn && typeof filterFn === 'function') {
            list = list.filter(filterFn);
        }
        return list.map(item => `
            <option value="${item[valueField]}" ${item[valueField] === selectedValue ? 'selected' : ''}>
                ${item[textField]}
            </option>
        `).join('');
    }
};

class FilterComponent {
    constructor({ containerId, prefix, onChange }) {
        this.container = document.getElementById(containerId);
        this.prefix = prefix; // e.g. "rec", "cal", "calib", "prod"
        this.onChange = onChange;
        this.selectedFilter = 'hoy';
        
        if (this.container) {
            this.render();
            this.bindEvents();
        }
    }

    getLocalDateStr(d = new Date()) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    render() {
        this.container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px; background:rgba(0,0,0,0.05); border:1px solid var(--border-color); padding:10px 15px; border-radius:8px; width:100%;">
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <span style="font-size:0.8rem; font-weight:800; color:var(--text-secondary);">📅 Filtro de Fecha:</span>
                    <div style="display:flex; gap:4px; background:rgba(0,0,0,0.1); padding:2px; border-radius:6px;">
                        <button class="btn btn-secondary btn-sm ${this.prefix}-filter-chip active" data-filter="hoy" style="font-size:0.75rem; padding:4px 8px;">Hoy</button>
                        <button class="btn btn-secondary btn-sm ${this.prefix}-filter-chip" data-filter="semana" style="font-size:0.75rem; padding:4px 8px;">Semana</button>
                        <button class="btn btn-secondary btn-sm ${this.prefix}-filter-chip" data-filter="mes" style="font-size:0.75rem; padding:4px 8px;">Mes</button>
                        <button class="btn btn-secondary btn-sm ${this.prefix}-filter-chip" data-filter="campana" style="font-size:0.75rem; padding:4px 8px;">Campaña</button>
                        <button class="btn btn-secondary btn-sm ${this.prefix}-filter-chip" data-filter="personalizado" style="font-size:0.75rem; padding:4px 8px;">Personalizado</button>
                    </div>
                </div>

                <div id="${this.prefix}-custom-date-container" style="display:none; align-items:center; gap:6px; flex-wrap:wrap;">
                    <input type="date" id="${this.prefix}-kpi-start-date" class="form-input" style="padding:4px 8px; font-size:0.75rem; width:130px; background:var(--color-fondo);">
                    <span style="font-size:0.75rem; color:var(--text-muted);">al</span>
                    <input type="date" id="${this.prefix}-kpi-end-date" class="form-input" style="padding:4px 8px; font-size:0.75rem; width:130px; background:var(--color-fondo);">
                </div>
            </div>
        `;
    }

    bindEvents() {
        const chips = this.container.querySelectorAll(`.${this.prefix}-filter-chip`);
        const customDateContainer = document.getElementById(`${this.prefix}-custom-date-container`);
        
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                
                const val = chip.getAttribute('data-filter');
                this.selectedFilter = val;
                
                if (val === 'personalizado') {
                    if (customDateContainer) customDateContainer.style.display = 'flex';
                } else {
                    if (customDateContainer) customDateContainer.style.display = 'none';
                }
                
                this.onChange();
            });
        });

        const startPicker = document.getElementById(`${this.prefix}-kpi-start-date`);
        const endPicker = document.getElementById(`${this.prefix}-kpi-end-date`);
        if (startPicker && endPicker) {
            startPicker.value = this.getLocalDateStr();
            endPicker.value = this.getLocalDateStr();
            startPicker.addEventListener('change', () => this.onChange());
            endPicker.addEventListener('change', () => this.onChange());
        }
    }

    filter(records, dateField, batchField = 'lote_materia_prima') {
        const todayStr = this.getLocalDateStr();
        
        if (this.selectedFilter === 'hoy') {
            return records.filter(r => r[dateField] === todayStr);
        }
        
        if (this.selectedFilter === 'semana') {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - 7);
            const limitStr = this.getLocalDateStr(dateLimit);
            return records.filter(r => r[dateField] >= limitStr && r[dateField] <= todayStr);
        }
        
        if (this.selectedFilter === 'mes') {
            const currentMonthPrefix = todayStr.substring(0, 7);
            return records.filter(r => r[dateField] && r[dateField].startsWith(currentMonthPrefix));
        }

        if (this.selectedFilter === 'campana') {
            const selectEl = document.getElementById('global-campana-select');
            const selectedCamp = selectEl ? selectEl.value : '2526';
            return records.filter(r => {
                if (!r[batchField]) return false;
                return r[batchField].startsWith(selectedCamp);
            });
        }
        
        if (this.selectedFilter === 'personalizado') {
            const startEl = document.getElementById(`${this.prefix}-kpi-start-date`);
            const endEl = document.getElementById(`${this.prefix}-kpi-end-date`);
            const start = startEl ? startEl.value : '';
            const end = endEl ? endEl.value : '';
            if (start && end) {
                return records.filter(r => r[dateField] >= start && r[dateField] <= end);
            }
        }

        return records;
    }
}

window.utils = utils;
window.FilterComponent = FilterComponent;
