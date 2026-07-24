/* ==========================================================================
   Pachamama ERP - Main App Controller
   ========================================================================== */

const app = {
    currentView: 'dashboard-ejecutivo',

    async init() {
        // Wait for Database to load from IndexedDB
        try {
            await window.db.load();
            
            // Upgraded multi-pass batch-code based test guides cleaner
            const cleanTestRecords = async () => {
                if (!window.db) return;
                const testLotes = ['2627PP0001', '2627PP0002', '2627CA0001'];
                
                // Clear recepcion_mp test records
                const lingering = window.db.getAll('recepcion_mp') || [];
                const idsToDelete = lingering
                    .filter(r => testLotes.includes(r.lote_materia_prima) || (r.id && r.id.startsWith('REC_TEST')))
                    .map(r => r.id);
                if (idsToDelete.length > 0) {
                    console.log("Lingering local test records detected, deleting them:", idsToDelete);
                    for (let id of idsToDelete) {
                        await window.db.delete('recepcion_mp', id);
                    }
                }
                
                // Clear calibrado_mp test records
                const lingeringCal = window.db.getAll('calibrado_mp') || [];
                const calIdsToDelete = lingeringCal
                    .filter(c => testLotes.includes(c.lote_materia_prima) || (c.id && c.id.startsWith('CAL_TEST')))
                    .map(c => c.id);
                if (calIdsToDelete.length > 0) {
                    console.log("Lingering local calibrado test records detected, deleting them:", calIdsToDelete);
                    for (let id of calIdsToDelete) {
                        await window.db.delete('calibrado_mp', id);
                    }
                }

                // Fallback direct Firestore collection delete
                if (window.db.firestore) {
                    const firestore = window.db.firestore;
                    for (let id of ['REC_TEST_0001', 'REC_TEST_0002', 'REC_TEST_0003']) {
                        await firestore.collection('recepciones_mp').doc(id).delete().catch(() => {});
                    }
                    for (let lote of testLotes) {
                        try {
                            const snap = await firestore.collection('recepciones_mp').where('lote_materia_prima', '==', lote).get();
                            snap.forEach(async (doc) => {
                                await doc.ref.delete().catch(() => {});
                            });
                        } catch(e) {}
                    }
                    for (let lote of testLotes) {
                        try {
                            const snap = await firestore.collection('calibrados_mp').where('lote_materia_prima', '==', lote).get();
                            snap.forEach(async (doc) => {
                                await doc.ref.delete().catch(() => {});
                            });
                        } catch(e) {}
                    }
                }
            };

            // Run immediately
            await cleanTestRecords();
            // Run again at 2 seconds and 5 seconds to catch late Firestore syncs
            setTimeout(cleanTestRecords, 2000);
            setTimeout(cleanTestRecords, 5000);

            // Auto-upload database to Firestore once on first load
            setTimeout(async () => {
                if (window.db && window.db.firestore) {
                    const uploadFlag = STORAGE_PREFIX + 'initial_cloud_upload';
                    if (!localStorage.getItem(uploadFlag)) {
                        console.log("Auto-uploading local database to Firestore...");
                        try {
                            await window.db.pushLocalDataToCloud();
                            localStorage.setItem(uploadFlag, 'true');
                            console.log("All local database records successfully synced to Google Cloud Firestore!");
                        } catch(err) {
                            console.error("Firestore sync error:", err);
                        }
                    }
                }
            }, 6000);

            // Self-healing check: if database seeds didn't load properly, clear and force reload
            if (!window.db.getAll('variedades') || window.db.getAll('variedades').length === 0) {
                console.warn("Variedades vacías detectadas. Reiniciando base de datos para cargar semillas nuevas...");
                localStorage.clear();
                if (window.db.idb) {
                    for (let store of window.db.storeNames) {
                        await window.db.idb.clear(store).catch(e => console.error(e));
                    }
                }
                location.reload();
                return;
            }

            // ONE-TIME RUN ONLY: CLEAR DATABASE FOR OPTION B
            if (!localStorage.getItem('pachamama_database_cleared_optB_v3')) {
                const opsStores = ['recepcion_mp', 'calibrado_mp', 'produccion_diaria', 'asistencia_diaria', 'tareo_diario', 'trazabilidad_lotes'];
                
                // Clear local IndexedDB and cache
                if (window.db) {
                    for (let store of opsStores) {
                        if (window.db.idb && window.db.storeNames.includes(store)) {
                            await window.db.idb.clear(store).catch(() => {});
                        }
                        window.db.cache[store] = [];
                    }
                }
                
                // Clear Firestore collections
                if (window.db && window.db.firestore) {
                    for (let store of opsStores) {
                        const firestoreKey = window.db.getFirestoreCollectionKey(store);
                        try {
                            const snapshot = await window.db.firestore.collection(firestoreKey).get();
                            const batch = window.db.firestore.batch();
                            let count = 0;
                            snapshot.forEach(doc => {
                                batch.delete(doc.ref);
                                count++;
                            });
                            if (count > 0) {
                                await batch.commit();
                                console.log(`Option B: Cleared Firestore collection ${firestoreKey} (${count} docs).`);
                            }
                        } catch (err) {
                            console.error(`Error clearing Firestore collection ${store}:`, err);
                        }
                    }
                }
                
                localStorage.setItem('pachamama_database_cleared_optB_v3', 'true');
                console.log("Option B: All local and cloud operational databases have been cleared.");
                window.location.reload();
                return;
            }
            
            } catch (e) {
            console.error("Critical: Failed to load IndexedDB", e);
        }

        this.bindGlobalEvents();
        this.applyModuleVisibility();
        this.navigate(this.currentView);

        // Dynamic connectivity setup
        this.updateConnectivityStatus();
        window.addEventListener('online', () => this.updateConnectivityStatus());
        window.addEventListener('offline', () => this.updateConnectivityStatus());
        setInterval(() => this.updateConnectivityStatus(), 5000);
    },

    updateConnectivityStatus() {
        const cloudStatus = document.getElementById('global-cloud-status');
        const footer = document.querySelector('.sidebar-footer');
        const isOnline = navigator.onLine && window.db && window.db.firestore;

        if (isOnline) {
            if (cloudStatus) {
                cloudStatus.innerHTML = `
                    <span class="badge badge-green" style="display:flex; align-items:center; gap:6px; background: rgba(16, 185, 129, 0.1); color: var(--color-exito); border: 1px solid rgba(16, 185, 129, 0.2); font-weight:700; font-size:0.75rem; padding: 4px 10px;">
                        <span style="display:inline-block; width:6px; height:6px; background:var(--color-exito); border-radius:50%; animation: pulse-green 1.5s infinite;"></span>
                        Nube Sincronizada
                    </span>
                `;
            }
            if (footer) {
                footer.innerHTML = `
                    <div style="display:flex; align-items:center; gap:6px; justify-content:center;">
                        <span style="display:inline-block; width:6px; height:6px; background:var(--color-exito); border-radius:50%;"></span>
                        v1.0.0 (Modo Cloud)
                    </div>
                `;
            }
        } else {
            if (cloudStatus) {
                cloudStatus.innerHTML = `
                    <span class="badge badge-rose" style="display:flex; align-items:center; gap:6px; background: rgba(244, 63, 94, 0.1); color: var(--color-alerta); border: 1px solid rgba(244, 63, 94, 0.2); font-weight:700; font-size:0.75rem; padding: 4px 10px;">
                        <span style="display:inline-block; width:6px; height:6px; background:var(--color-alerta); border-radius:50%;"></span>
                        Modo Local (Offline)
                    </span>
                `;
            }
            if (footer) {
                footer.innerHTML = `
                    <div style="display:flex; align-items:center; gap:6px; justify-content:center;">
                        <span style="display:inline-block; width:6px; height:6px; background:var(--color-alerta); border-radius:50%;"></span>
                        v1.0.0 (Modo Offline)
                    </div>
                `;
            }
        }
    },

    bindGlobalEvents() {
        const sidebar = document.querySelector('.sidebar');

        // Sidebar Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const view = item.dataset.view;
                if (view) {
                    this.navigate(view);
                    // Auto close sidebar on mobile navigation
                    if (sidebar) {
                        sidebar.classList.remove('open');
                        document.body.classList.remove('sidebar-open');
                    }
                }
            });
        });

        // Mobile Sidebar Toggles & Overlay
        const mobileToggle = document.getElementById('mobile-sidebar-toggle');
        const mobileClose = document.getElementById('mobile-sidebar-close');
        const overlay = document.getElementById('sidebar-overlay');

        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.add('open');
                document.body.classList.add('sidebar-open');
            });
        }

        const closeSidebar = () => {
            if (sidebar) sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
        };

        if (mobileClose) mobileClose.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);

        // Global Campaign Change listener
        const globalCampanaSelect = document.getElementById('global-campana-select');
        if (globalCampanaSelect) {
            globalCampanaSelect.addEventListener('change', () => {
                const currentView = this.currentView;
                if (currentView === 'dashboard-ejecutivo' && window.dashboardModule) {
                    window.dashboardModule.updateDashboard();
                } else {
                    let activeModule = null;
                    if (currentView === 'recepcion') activeModule = window.recepcionModule;
                    else if (currentView === 'calidad') activeModule = window.calidadModule;
                    else if (currentView === 'calibrado') activeModule = window.calibradoModule;
                    else if (currentView === 'produccion' || currentView === 'empaque') activeModule = window.produccionModule;
                    
                    if (activeModule && activeModule.filterComponent && activeModule.filterComponent.selectedFilter === 'campana') {
                        activeModule.refreshData();
                    }
                }
            });
        }

        // Global Keyboard Shortcut: Ctrl + Alt + R to Reset and Re-seed Database
        window.addEventListener('keydown', async (e) => {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
                e.preventDefault();
                if (confirm("⚠️ ¿Estás seguro de restablecer y volver a sembrar la base de datos local? Esto borrará el caché del dispositivo y recargará la página.")) {
                    try {
                        await window.db.reset();
                        alert("✅ Base de datos restablecida con éxito. Recargando la aplicación...");
                        window.location.reload();
                    } catch (err) {
                        console.error(err);
                        alert("❌ Error al restablecer la base de datos.");
                    }
                }
            }
        });
    },

    applyModuleVisibility() {
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

        const navItems = document.querySelectorAll('.nav-menu .nav-item');
        let firstVisibleView = null;
        let currentViewIsHidden = false;

        navItems.forEach(item => {
            const view = item.dataset.view;
            if (view) {
                const isHidden = hiddenModules.includes(view);
                if (isHidden) {
                    item.style.display = 'none';
                    if (this.currentView === view) {
                        currentViewIsHidden = true;
                    }
                } else {
                    item.style.display = 'flex';
                    if (!firstVisibleView) {
                        firstVisibleView = view;
                    }
                }
            }
        });

        // If current view is hidden, redirect to the first visible view
        if (currentViewIsHidden && firstVisibleView) {
            this.currentView = firstVisibleView;
        }
    },

    navigate(viewId) {
        this.currentView = viewId;

        // Toggle visibility of panels
        const panels = document.querySelectorAll('.view-panel');
        panels.forEach(p => p.classList.remove('active'));

        // Map viewIds to corresponding panel elements in index.html
        let panelId = viewId;
        if (viewId === 'empaque') panelId = 'produccion';

        const activePanel = document.getElementById(`view-${panelId}`);
        if (activePanel) {
            activePanel.classList.add('active');
        }

        // Synchronize sidebar active selection
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.view === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Title update in Header
        const headerTitle = document.getElementById('header-title-text');
        if (headerTitle) {
            const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
            headerTitle.innerText = navItem ? navItem.innerText.trim() : 'Pachamama ERP';
        }

        this.updateGlobalCloudStatus();

        // Module specific initializations
        switch (viewId) {
            case 'dashboard-ejecutivo':
                if (window.dashboardModule) window.dashboardModule.init();
                break;
            case 'configuracion':
                if (window.configuracionModule) window.configuracionModule.init();
                break;
            case 'ia-studio':
                if (window.iaStudioModule) window.iaStudioModule.init();
                break;
            case 'recepcion':
                if (window.recepcionModule) window.recepcionModule.init();
                break;
            case 'calidad':
                if (window.calidadModule) window.calidadModule.init();
                break;
            case 'calibrado':
                if (window.calibradoModule) window.calibradoModule.init();
                break;
            case 'produccion':
                if (window.produccionModule) window.produccionModule.init();
                break;
            case 'empaque':
                if (window.produccionModule) window.produccionModule.init();
                break;
            case 'grupos-trabajo':
                if (window.gruposTrabajoModule) window.gruposTrabajoModule.init();
                break;
            case 'asistencia':
                if (window.asistenciaModule) window.asistenciaModule.init();
                break;
            case 'tareo':
                if (window.tareoModule) window.tareoModule.init();
                break;
            case 'trazabilidad':
                if (window.trazabilidadModule) window.trazabilidadModule.init();
                break;
            case 'recursos-humanos':
                if (window.rrhhModule) window.rrhhModule.init();
                break;
            case 'costeo':
                if (window.costeoModule) window.costeoModule.init();
                break;
        }
    },

    updateGlobalCloudStatus() {
        const statusContainer = document.getElementById('global-cloud-status');
        if (!statusContainer) return;

        const isConnected = !!(window.db && window.db.firestore);
        if (isConnected) {
            statusContainer.innerHTML = `
                <span class="badge-ok" style="font-size: 0.72rem; font-weight: 700; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(74, 107, 30, 0.12); border-radius: 4px;">
                    <span style="display:inline-block; width:8px; height:8px; background:#4A6B1E; border-radius:50%; box-shadow: 0 0 8px #4A6B1E;"></span>
                    NUBE CONECTADA
                </span>
            `;
        } else {
            statusContainer.innerHTML = `
                <span class="badge-alerta" style="font-size: 0.72rem; font-weight: 700; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(178, 58, 29, 0.12); border-radius: 4px;">
                    <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="2.5" fill="none" style="display:inline-block; vertical-align:middle; margin-right:2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                    NUBE DESCONECTADA
                </span>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

window.appController = app;
