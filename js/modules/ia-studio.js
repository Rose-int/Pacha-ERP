/* ==========================================================================
   Pachamama ERP - Google AI Studio (Gemini) Module
   ========================================================================== */

const iaStudioModule = {
    apiKeyKey: 'pachamama_erp_gemini_api_key',
    chatHistory: [],

    init() {
        this.renderLayout();
        this.bindEvents();
        this.scrollToBottom();
    },

    getApiKey() {
        return localStorage.getItem(this.apiKeyKey) || '';
    },

    setApiKey(key) {
        if (key) {
            localStorage.setItem(this.apiKeyKey, key.trim());
        } else {
            localStorage.removeItem(this.apiKeyKey);
        }
    },

    renderLayout() {
        const container = document.getElementById('view-ia-studio');
        if (!container) return;

        const apiKey = this.getApiKey();

        if (!apiKey) {
            this.renderSetup(container);
        } else {
            this.renderWorkspace(container);
        }
    },

    renderSetup(container) {
        container.innerHTML = `
            <div class="ia-container" style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - var(--header-height) - 40px); padding: 20px;">
                <div class="card ia-setup-card" style="max-width: 580px; width: 100%; border: 1px solid var(--border-color); box-shadow: var(--shadow-premium); border-radius: 16px; padding: 32px; display: flex; flex-direction: column; gap: 24px; background: linear-gradient(145deg, var(--bg-secondary) 0%, rgba(139, 92, 246, 0.02) 100%);">
                    <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                        <div class="ai-logo-glow" style="width: 64px; height: 64px; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); animation: pulseGlow 3s infinite;">
                            ✨
                        </div>
                        <h2 style="font-size: 1.5rem; font-weight: 700; margin-top: 8px; background: linear-gradient(135deg, var(--text-primary), var(--accent-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Asistente Inteligente Pachamama IA</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; max-width: 480px;">
                            Conecta Pachamama ERP con Google AI Studio para automatizar análisis de rendimiento, costos de mano de obra y auditorías de calibración y peso con modelos Gemini.
                        </p>
                    </div>

                    <div style="border-top: 1px solid var(--border-color); padding-top: 20px; display: flex; flex-direction: column; gap: 12px;">
                        <h3 style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">Instrucciones de Vinculación:</h3>
                        <ol style="margin-left: 20px; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px; line-height: 1.4;">
                            <li>Visita el portal de <a href="https://aistudio.google.com/" target="_blank" style="color: var(--accent-blue); text-decoration: underline; font-weight: 600;">Google AI Studio</a> y entra con tu cuenta.</li>
                            <li>Haz clic en el botón <strong>"Get API key"</strong> en el panel lateral.</li>
                            <li>Genera una nueva clave de API (Create API Key) y cópiala.</li>
                            <li>Pégala aquí abajo para vincular de forma segura en tu navegador.</li>
                        </ol>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                        <label for="ai-key-input" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">CLAVE DE API DE GEMINI</label>
                        <div style="position: relative; display: flex; align-items: center;">
                            <input type="password" id="ai-key-input" class="form-input" placeholder="AIzaSy..." style="padding-right: 40px; border-radius: 8px;">
                            <button type="button" id="btn-toggle-key-visibility" style="position: absolute; right: 12px; background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center;">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" id="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                        </div>
                    </div>

                    <button type="button" class="btn btn-primary" id="btn-save-key" style="background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); border: none; font-weight: 600; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);">
                        <span>Vinculación con Google AI Studio</span>
                    </button>
                </div>
            </div>
        `;
    },

    renderWorkspace(container) {
        container.innerHTML = `
            <div class="ia-banner" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%); border: 1px solid rgba(139, 92, 246, 0.15); padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="pulse-indicator" style="width: 8px; height: 8px; background-color: var(--accent-emerald); border-radius: 50%; display: inline-block; box-shadow: 0 0 8px var(--accent-emerald);"></span>
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Vinculado con Google AI Studio (Modelo: Gemini 2.5 Flash)</span>
                </div>
                <button class="btn btn-secondary btn-sm" id="btn-remove-key" style="background: transparent; color: var(--accent-rose); border-color: rgba(244, 63, 94, 0.2); font-size: 0.75rem; padding: 4px 10px;">Desvincular Cuenta</button>
            </div>

            <div class="panel-grid split-sidebar" style="height: calc(100vh - var(--header-height) - 130px); gap: 20px;">
                <!-- Preset Options Panel (Left) -->
                <div class="card" style="display: flex; flex-direction: column; gap: 16px; overflow-y: auto; max-height: 100%;">
                    <h3 class="card-title" style="font-size: 0.95rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Análisis con Un Clic</h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="ia-preset-card" data-prompt-type="executive">
                            <div class="preset-icon" style="background-color: var(--accent-emerald-glow); color: var(--accent-emerald);">📊</div>
                            <div class="preset-details">
                                <span class="preset-title">Reporte Ejecutivo Completo</span>
                                <span class="preset-desc">Analiza volúmenes procesados, desviaciones de peso y costos.</span>
                            </div>
                        </button>
                        
                        <button class="ia-preset-card" data-prompt-type="costing">
                            <div class="preset-icon" style="background-color: var(--accent-purple-glow); color: var(--accent-purple);">💰</div>
                            <div class="preset-details">
                                <span class="preset-title">Optimización de Mano de Obra</span>
                                <span class="preset-desc">Revisa tareo, costos de horas extras y eficiencia por supervisor.</span>
                            </div>
                        </button>
                        
                        <button class="ia-preset-card" data-prompt-type="quality">
                            <div class="preset-icon" style="background-color: var(--accent-orange-glow); color: var(--accent-orange);">📐</div>
                            <div class="preset-details">
                                <span class="preset-title">Control de Calidad y Calibres</span>
                                <span class="preset-desc">Evalúa la exactitud de calibres y previene desviaciones de sobrepeso.</span>
                            </div>
                        </button>

                        <button class="ia-preset-card" data-prompt-type="projections">
                            <div class="preset-icon" style="background-color: var(--accent-blue-glow); color: var(--accent-blue);">📈</div>
                            <div class="preset-details">
                                <span class="preset-title">Proyección de Exportación</span>
                                <span class="preset-desc">Proyecta la viabilidad del programa frente a rendimientos actuales.</span>
                            </div>
                        </button>
                    </div>

                    <div style="margin-top: auto; padding: 12px; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 6px;">
                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">💡 Consejos de Uso</span>
                        <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">
                            Gemini tiene acceso directo a los registros locales del ERP. Puedes preguntarle sobre tendencias de producción, comparar turnos, buscar anomalías de peso o solicitar simulaciones.
                        </p>
                    </div>
                </div>

                <!-- Chat Area Panel (Right) -->
                <div class="card" style="display: flex; flex-direction: column; padding: 0; overflow: hidden; height: 100%; border: 1px solid var(--border-color);">
                    <!-- Chat Header -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 10px; height: 10px; background-color: var(--accent-purple); border-radius: 50%;"></div>
                            <span style="font-weight: 600; font-size: 0.95rem;">Sala de Chat - Asistente Operativo IA</span>
                        </div>
                        <button class="btn btn-secondary btn-sm" id="btn-clear-chat" style="padding: 4px 8px; font-size: 0.75rem;">Limpiar Conversación</button>
                    </div>

                    <!-- Chat Messages list -->
                    <div id="ia-chat-messages" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; background-color: var(--bg-primary);">
                        <!-- Filled dynamically -->
                        ${this.chatHistory.length === 0 ? this.getWelcomeMessageHtml() : this.chatHistory.map(msg => this.renderMessageHtml(msg)).join('')}
                    </div>

                    <!-- Message Input area -->
                    <div style="padding: 16px 20px; border-top: 1px solid var(--border-color); background: var(--bg-secondary); display: flex; gap: 10px; align-items: center;">
                        <input type="text" id="ia-chat-input" class="form-input" placeholder="Pregunta sobre la producción, costos o rendimientos..." style="border-radius: 8px; flex: 1;" autocomplete="off">
                        <button class="btn btn-primary" id="btn-send-message" style="background: var(--accent-purple); border-color: var(--accent-purple); padding: 10px 20px; font-weight: 600; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    getWelcomeMessageHtml() {
        return `
            <div class="chat-welcome-box" style="text-align: center; margin: 40px auto; max-width: 420px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <div style="font-size: 2.5rem; animation: float 3s ease-in-out infinite;">🤖</div>
                <h4 style="font-weight: 600; color: var(--text-primary); font-size: 1.05rem; margin-top: 8px;">¿En qué puedo ayudarte hoy?</h4>
                <p style="color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5;">
                    Haz una pregunta personalizada sobre la planta o selecciona un análisis con un clic a la izquierda. Analizaré la base de datos de Pachamama ERP al instante.
                </p>
            </div>
        `;
    },

    renderMessageHtml(msg) {
        const isUser = msg.role === 'user';
        const avatar = isUser ? 'U' : 'AI';
        const avatarBg = isUser ? 'var(--accent-blue)' : 'var(--accent-purple)';
        const alignment = isUser ? 'flex-end' : 'flex-start';
        const contentBg = isUser ? 'rgba(59, 130, 246, 0.06)' : 'var(--bg-secondary)';
        const borderStyle = isUser ? 'border: 1px solid rgba(59, 130, 246, 0.15)' : 'border: 1px solid var(--border-color)';
        
        // Simple Markdown bold to HTML conversion
        let text = msg.text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background-color:rgba(128,128,128,0.1); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
            .replace(/\n/g, '<br>');

        return `
            <div style="display: flex; gap: 12px; align-self: ${alignment}; max-width: 85%; flex-direction: ${isUser ? 'row-reverse' : 'row'};">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: ${avatarBg}; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    ${avatar}
                </div>
                <div style="padding: 14px 18px; border-radius: 12px; background: ${contentBg}; ${borderStyle}; color: var(--text-primary); font-size: 0.88rem; line-height: 1.5; box-shadow: var(--shadow-premium);">
                    ${text}
                </div>
            </div>
        `;
    },

    bindEvents() {
        const pane = document.getElementById('view-ia-studio');
        if (!pane) return;

        // Toggle Key Visibility
        const btnToggleVis = document.getElementById('btn-toggle-key-visibility');
        const keyInput = document.getElementById('ai-key-input');
        if (btnToggleVis && keyInput) {
            btnToggleVis.addEventListener('click', () => {
                const eyeIcon = document.getElementById('eye-icon');
                if (keyInput.type === 'password') {
                    keyInput.type = 'text';
                    eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
                } else {
                    keyInput.type = 'password';
                    eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
                }
            });
        }

        // Save Key
        const btnSaveKey = document.getElementById('btn-save-key');
        if (btnSaveKey && keyInput) {
            btnSaveKey.addEventListener('click', () => {
                const key = keyInput.value.trim();
                if (!key) return alert("Por favor ingresa una clave de API válida.");
                this.setApiKey(key);
                alert("✅ Clave de API de Google AI Studio guardada correctamente.");
                this.renderLayout();
                this.bindEvents();
            });
        }

        // Remove Key
        const btnRemoveKey = document.getElementById('btn-remove-key');
        if (btnRemoveKey) {
            btnRemoveKey.addEventListener('click', () => {
                if (confirm("¿Estás seguro de desvincular el asistente de Google AI Studio? Tu API Key se eliminará localmente.")) {
                    this.setApiKey('');
                    this.chatHistory = [];
                    this.renderLayout();
                    this.bindEvents();
                }
            });
        }

        // Clear Chat
        const btnClearChat = document.getElementById('btn-clear-chat');
        if (btnClearChat) {
            btnClearChat.addEventListener('click', () => {
                this.chatHistory = [];
                const chatArea = document.getElementById('ia-chat-messages');
                if (chatArea) chatArea.innerHTML = this.getWelcomeMessageHtml();
            });
        }

        // Preset Prompt Buttons
        const presets = document.querySelectorAll('.ia-preset-card');
        presets.forEach(preset => {
            preset.addEventListener('click', () => {
                const type = preset.dataset.promptType;
                this.runPresetAnalysis(type);
            });
        });

        // Send Custom Message
        const chatInput = document.getElementById('ia-chat-input');
        const btnSendMessage = document.getElementById('btn-send-message');

        const sendHandler = () => {
            const query = chatInput.value.trim();
            if (!query) return;
            chatInput.value = '';
            this.handleUserQuery(query);
        };

        if (btnSendMessage && chatInput) {
            btnSendMessage.addEventListener('click', sendHandler);
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    sendHandler();
                }
            });
        }
    },

    scrollToBottom() {
        const chatArea = document.getElementById('ia-chat-messages');
        if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
        }
    },

    // Formulate Context for AI Studio Call
    getSystemDataContext() {
        const db = window.db;
        const data = {
            resumen_planta: {
                total_supervisores: db.getAll('supervisores').length,
                total_trabajadores: db.getAll('personal').length,
                tipos_caja: db.getAll('tipos_caja').map(c => ({ codigo: c.codigo, peso: c.peso_teorico, base: c.base_pallet })),
                destinos_activos: [...new Set(db.getAll('produccion_diaria').map(p => p.destino))]
            },
            produccion_diaria: db.getAll('produccion_diaria').slice(-15).map(p => ({
                fecha: p.fecha_produccion || p.fecha_calibrado,
                lote: p.lote_materia_prima,
                turno: p.turno_id,
                supervisor: db.getById('supervisores', p.supervisor_id)?.nombre || p.supervisor_id,
                destino: p.destino,
                cajas: p.calculos.totalCajas,
                kg_reales: p.calculos.kgReales,
                desviacion_porcentaje: p.calculos.desviacionPorc
            })),
            tareo_costos: db.getAll('tareo_diario').slice(-10).map(t => {
                const minutes = window.utils.diffMinutes(t.hora_inicio, t.hora_fin);
                const hours = minutes / 60;
                return {
                    fecha: t.fecha,
                    turno: t.turno_id,
                    grupo: t.grupo_id,
                    labor: db.getById('labores', t.labor_id)?.nombre || t.labor_id,
                    horas: hours
                };
            }),
            programa_exportacion: db.getAll('programa_exportacion').slice(0, 8).map(p => ({
                shipment: p.shipment,
                cliente: p.cliente,
                destino: p.destino,
                fecha: p.fecha_embarque,
                cajas_prog: p.cant_programada,
                kg_prog: p.kg_programados
            }))
        };
        return JSON.stringify(data, null, 2);
    },

    async callGeminiApi(promptText) {
        const apiKey = this.getApiKey();
        if (!apiKey) throw new Error("Clave de API no disponible");

        const dataContext = this.getSystemDataContext();
        
        const systemPrompt = `SYSTEM INSTRUCTION: Eres el Asistente IA de Pachamama Farms, un consultor experto en optimización de plantas exportadoras de mango. Analizas los datos operacionales del ERP (producción, costos, tareo, calidad) y respondes en español con formato Markdown claro y profesional, enfocándote en recomendaciones accionables. Sé breve, estructurado y directo en tus respuestas. Aquí están los datos del sistema en formato JSON:\n\n${dataContext}\n\nPREGUNTA O PETICIÓN DEL USUARIO: ${promptText}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: systemPrompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2
                }
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `HTTP error ${response.status}`);
        }

        const resData = await response.json();
        return resData.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta del modelo.";
    },

    async handleUserQuery(query) {
        const chatArea = document.getElementById('ia-chat-messages');
        if (!chatArea) return;

        // Clear welcome screen if first message
        if (this.chatHistory.length === 0) {
            chatArea.innerHTML = '';
        }

        // Add user message to history and view
        const userMsg = { role: 'user', text: query };
        this.chatHistory.push(userMsg);
        chatArea.innerHTML += this.renderMessageHtml(userMsg);
        this.scrollToBottom();

        // Render Loading message
        const loadingId = 'ai-loading-' + Date.now();
        chatArea.innerHTML += `
            <div id="${loadingId}" style="display: flex; gap: 12px; align-self: flex-start; max-width: 85%;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-purple); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    AI
                </div>
                <div style="padding: 14px 18px; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.88rem; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-premium);">
                    <span class="loading-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: jump 1.4s infinite ease-in-out;"></span>
                    <span class="loading-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: jump 1.4s infinite ease-in-out 0.2s;"></span>
                    <span class="loading-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: jump 1.4s infinite ease-in-out 0.4s;"></span>
                    <span>Analizando registros del ERP...</span>
                </div>
            </div>
        `;
        this.scrollToBottom();

        try {
            const aiResponse = await this.callGeminiApi(query);
            
            // Remove loading
            const loader = document.getElementById(loadingId);
            if (loader) loader.remove();

            // Add AI response to history and view
            const aiMsg = { role: 'ai', text: aiResponse };
            this.chatHistory.push(aiMsg);
            chatArea.innerHTML += this.renderMessageHtml(aiMsg);
            this.scrollToBottom();
        } catch (error) {
            console.error("Gemini API call failed", error);
            
            // Remove loading
            const loader = document.getElementById(loadingId);
            if (loader) loader.remove();

            const errMsg = { role: 'ai', text: `❌ **Error de Conexión:** No se pudo comunicar con Google AI Studio. Detalles del error: ${error.message}. Por favor, verifica tu API Key o conexión a internet.` };
            chatArea.innerHTML += this.renderMessageHtml(errMsg);
            this.scrollToBottom();
        }
    },

    runPresetAnalysis(type) {
        let query = '';
        switch (type) {
            case 'executive':
                query = "Genera un Reporte Ejecutivo de la producción diaria de mango. Resume los volúmenes en kilogramos reales procesados, la desviación de peso promedio de las cajas, identifica posibles cuellos de botella y da 3 recomendaciones estratégicas.";
                break;
            case 'costing':
                query = "Realiza una Auditoría de Costos de Mano de Obra y Tareo. Analiza las horas registradas por labor y turno, calcula si hay un uso elevado de recursos y recomienda cómo optimizar la eficiencia por supervisor y los grupos de trabajo.";
                break;
            case 'quality':
                query = "Audita el Control de Calidad y Calibrado de Materia Prima. Examina los porcentajes de desviación de las cajas (sobredosificación de peso o bajo peso) y sugiéreme controles preventivos para optimizar el rendimiento.";
                break;
            case 'projections':
                query = "Compara el programa comercial de exportación pendiente con los rendimientos reales de producción de mango de los últimos días. ¿Cumpliremos con las fechas de embarque programadas? Detalla los riesgos y proyecciones.";
                break;
        }

        if (query) {
            this.handleUserQuery(query);
        }
    }
};

window.iaStudioModule = iaStudioModule;
