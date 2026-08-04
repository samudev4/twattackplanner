(function() {
    'use strict';

    const SCRIPT_VERSION = "3.4";
    const GITHUB_URL = "https://github.com/samudev4";

    if (document.getElementById('tw-planner-window')) {
        const content = document.getElementById('tw-planner-content');
        if (content.style.display === 'none') {
            content.style.display = 'block';
        }
        return;
    }

    // 1. CONFIGURACIÓN DE UNIDADES Y VELOCIDADES BASE (Minutos por casilla en velocidad 1)
    const BASE_UNIT_SPEEDS = {
        "spear": 18, "sword": 22, "axe": 18, "archer": 18,
        "spy": 9, "light": 10, "marcher": 10, "heavy": 11,
        "ram": 30, "catapult": 30, "knight": 10, "snob": 35
    };

    const UNIT_NAMES = {
        "spear": "Lanza", "sword": "Espada", "axe": "Hacha", "archer": "Arquero",
        "spy": "Espía", "light": "C. Ligera", "marcher": "Arquero C.", "heavy": "C. Pesada",
        "ram": "Ariete", "catapult": "Catapulta", "knight": "Paladín", "snob": "Noble"
    };

    // LECTURA/ALMACENAMIENTO DE VELOCIDADES
    function getStoredWorldSpeeds() {
        const saved = localStorage.getItem('tw_planner_world_speeds');
        if (saved) return JSON.parse(saved);

        let ws = 1, us = 1;
        if (typeof game_data !== 'undefined') {
            if (game_data.WorldConfig) {
                ws = parseFloat(game_data.WorldConfig.speed) || 1;
                us = parseFloat(game_data.WorldConfig.unit_speed) || 1;
            } else if (game_data.worldConfig) {
                ws = parseFloat(game_data.worldConfig.speed) || 1;
                us = parseFloat(game_data.worldConfig.unit_speed) || 1;
            }
        }
        return { worldSpeed: ws, unitSpeed: us };
    }

    function saveWorldSpeeds(ws, us) {
        localStorage.setItem('tw_planner_world_speeds', JSON.stringify({ worldSpeed: ws, unitSpeed: us }));
    }

    function getStoredAttacks() {
        const saved = localStorage.getItem('tw_planner_attacks');
        return saved ? JSON.parse(saved) : [];
    }

    function saveAttacks(attacks) {
        localStorage.setItem('tw_planner_attacks', JSON.stringify(attacks));
    }

    function getStoredPosition() {
        const saved = localStorage.getItem('tw_planner_pos');
        return saved ? JSON.parse(saved) : { top: '50px', left: '50px' };
    }

    function savePosition(top, left) {
        localStorage.setItem('tw_planner_pos', JSON.stringify({ top, left }));
    }

    // 2. ESTILOS CSS - INTERFAZ MEJORADA
    const style = document.createElement('style');
    style.innerHTML = `
        #tw-planner-window {
            position: fixed;
            width: 560px;
            background: #e1c38a url('https://dses.innogamescdn.com/asset/8b8e01d/graphic/index/main_bg.jpg') repeat;
            border: 3px solid #603000;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            font-family: Verdana, Arial, sans-serif;
            font-size: 13px;
            color: #222;
            z-index: 999999;
            box-sizing: border-box;
        }
        #tw-planner-header {
            background: linear-gradient(180deg, #8a4b10 0%, #572d00 100%);
            color: #f0e2be;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 15px;
            border-bottom: 2px solid #3b1a00;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            border-top-left-radius: 7px;
            border-top-right-radius: 7px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        .tw-planner-body { padding: 12px; }
        .tw-box {
            background: rgba(255, 255, 255, 0.75);
            border: 1px solid #7d5128;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.05);
        }
        .tw-title-sm {
            font-weight: bold;
            color: #603000;
            margin-bottom: 8px;
            border-bottom: 2px solid #b89160;
            padding-bottom: 5px;
            font-size: 14px;
        }
        .tw-row {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
        }
        .tw-input {
            background: #fff;
            border: 1px solid #7d5128;
            padding: 6px 8px;
            border-radius: 5px;
            font-size: 13px;
            box-sizing: border-box;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
            transition: border-color 0.2s;
        }
        .tw-input:focus {
            border-color: #3d6919;
            outline: none;
        }
        .tw-input-coord { width: 55px; text-align: center; }
        .tw-input-time { width: 40px; text-align: center; }
        .tw-input-ms { width: 48px; text-align: center; }
        
        .tw-btn {
            background: linear-gradient(180deg, #6c9e3f 0%, #3d6919 100%);
            color: #fff;
            border: 1px solid #28470f;
            border-radius: 6px;
            padding: 6px 12px;
            font-weight: bold;
            cursor: pointer;
            font-size: 12px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
            transition: all 0.2s ease;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.4);
        }
        .tw-btn:hover { 
            background: linear-gradient(180deg, #7cb349 0%, #487c1e 100%);
            transform: translateY(-1px);
            box-shadow: 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
        }
        .tw-btn:active {
            transform: translateY(1px);
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .tw-btn-danger { background: linear-gradient(180deg, #d35400 0%, #a04000 100%); border-color: #78281f; }
        .tw-btn-danger:hover { background: linear-gradient(180deg, #e59866 0%, #ba4a00 100%); }
        .tw-btn-secondary { background: linear-gradient(180deg, #95a5a6 0%, #7f8c8d 100%); border-color: #616a6b; }
        .tw-btn-secondary:hover { background: linear-gradient(180deg, #bdc3c7 0%, #95a5a6 100%); }
        .tw-btn-action { background: linear-gradient(180deg, #2980b9 0%, #1a5276 100%); border-color: #1b4f72; }
        .tw-btn-action:hover { background: linear-gradient(180deg, #5dade2 0%, #21618c 100%); }

        .tw-unit-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            margin-top: 8px;
        }
        .tw-unit-item {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(255,255,255,0.8);
            padding: 4px 6px;
            border: 1px solid #b89160;
            border-radius: 5px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .tw-unit-item input { width: 100%; font-size: 13px; padding: 4px; text-align: center; }

        .tw-card {
            background: #fdf5e6;
            border: 1px solid #d4b58a;
            border-left: 5px solid #8a4b10;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 10px;
            position: relative;
            box-shadow: 0 2px 5px rgba(0,0,0,0.08);
            transition: transform 0.2s;
        }
        .tw-card:hover { transform: translateX(2px); }
        .tw-card-del {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #c0392b;
            color: #fff;
            border: none;
            border-radius: 4px;
            width: 22px;
            height: 22px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            line-height: 22px;
            text-align: center;
            padding: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .tw-card-del:hover { background: #e74c3c; }
        
        .tw-footer {
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid #b89160;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #572d00;
        }
        .tw-footer a { color: #8a4b10; text-decoration: none; font-weight: bold; transition: color 0.2s; }
        .tw-footer a:hover { color: #d35400; }
        
        .tw-timer {
            font-weight: bold;
            font-family: monospace;
            font-size: 14px;
            padding: 4px 8px;
            background: #fff;
            border: 1px solid #bbb;
            border-radius: 4px;
            display: inline-block;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
        }
        .tw-timer-warn { color: #c0392b; background: #fadbd8; border-color:#e6b0aa; }
        .tw-timer-ok { color: #27ae60; }
        .tw-speed-edit { cursor: pointer; text-decoration: underline; font-weight: bold; color: #1a5276; }
        .tw-speed-edit:hover { color: #2980b9; }
    `;
    document.head.appendChild(style);

    // 3. ESTRUCTURA INTERFAZ
    const initialPos = getStoredPosition();
    const container = document.createElement('div');
    container.id = 'tw-planner-window';
    container.style.top = initialPos.top;
    container.style.left = initialPos.left;

    const currentWorld = (typeof game_data !== 'undefined' && game_data.world) ? game_data.world : "Desconocido";
    const speeds = getStoredWorldSpeeds();

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const defaultDateStr = `${yyyy}-${mm}-${dd}`;

    container.innerHTML = `
        <div id="tw-planner-header">
            <span>🛡️ Planificador de Ataques</span>
            <button id="tw-btn-toggle" style="background:none; border:none; color:#f0e2be; cursor:pointer; font-weight:bold; font-size:16px;">_</button>
        </div>

        <div id="tw-planner-content" class="tw-planner-body">
            <!-- INFO DEL MUNDO -->
            <div style="font-size: 12px; color: #572d00; margin-bottom: 10px; display:flex; justify-content:space-between; background:rgba(255,255,255,0.6); padding:6px 10px; border-radius:5px; border: 1px solid #d4b58a;">
                <span><strong>Mundo:</strong> ${currentWorld}</span>
                <span>
                    <strong>Vel. Mundo:</strong> <span id="tw-ws-val" class="tw-speed-edit" title="Cambiar">${speeds.worldSpeed}</span> | 
                    <strong>Unidades:</strong> <span id="tw-us-val" class="tw-speed-edit" title="Cambiar">${speeds.unitSpeed}</span>
                </span>
            </div>

            <!-- FORMULARIO DE ATAQUE -->
            <div id="tw-form-panel" class="tw-box">
                <div class="tw-title-sm">🎯 Configurar Nuevo Ataque</div>

                <div class="tw-row">
                    <span style="width:65px; font-weight:bold;">Origen:</span>
                    <input type="text" inputmode="numeric" maxlength="3" id="tw-ox" class="tw-input tw-input-coord" placeholder="XXX">
                    <span style="font-weight:bold; color:#8a4b10;">|</span>
                    <input type="text" inputmode="numeric" maxlength="3" id="tw-oy" class="tw-input tw-input-coord" placeholder="YYY">
                    <button id="tw-btn-current-village" class="tw-btn tw-btn-secondary" style="margin-left:auto;">📍 Usar actual</button>
                </div>

                <div class="tw-row">
                    <span style="width:65px; font-weight:bold;">Destino:</span>
                    <input type="text" inputmode="numeric" maxlength="3" id="tw-tx" class="tw-input tw-input-coord" placeholder="XXX">
                    <span style="font-weight:bold; color:#8a4b10;">|</span>
                    <input type="text" inputmode="numeric" maxlength="3" id="tw-ty" class="tw-input tw-input-coord" placeholder="YYY">
                </div>

                <div class="tw-row" style="margin-top: 10px;">
                    <span style="width:65px; font-weight:bold;">Llegada:</span>
                    <input type="date" id="tw-target-date" class="tw-input" value="${defaultDateStr}" style="width: 130px;">
                    <input type="text" inputmode="numeric" maxlength="2" id="tw-h" class="tw-input tw-input-time" placeholder="HH">
                    <span style="font-weight:bold;">:</span>
                    <input type="text" inputmode="numeric" maxlength="2" id="tw-m" class="tw-input tw-input-time" placeholder="MM">
                    <span style="font-weight:bold;">:</span>
                    <input type="text" inputmode="numeric" maxlength="2" id="tw-s" class="tw-input tw-input-time" placeholder="SS">
                    <span style="font-weight:bold;">.</span>
                    <input type="text" inputmode="numeric" maxlength="3" id="tw-ms" class="tw-input tw-input-ms" placeholder="MS">
                </div>

                <!-- SELECCIÓN DE TROPAS -->
                <div style="font-weight:bold; margin-top:12px; margin-bottom:4px; border-bottom: 1px dashed #b89160; padding-bottom:4px;">Tropas a enviar:</div>
                <div class="tw-unit-grid" id="tw-unit-inputs"></div>

                <div style="display:flex; gap:10px; margin-top:12px;">
                    <button id="tw-add-btn" class="tw-btn" style="flex:2; font-size: 14px;">➕ Añadir al Planificador</button>
                    <button id="tw-clear-form-btn" class="tw-btn tw-btn-danger" title="Limpiar formulario" style="flex:1;">🧹 Limpiar</button>
                </div>
            </div>

            <!-- LISTA DE ATAQUES -->
            <div class="tw-box" style="margin-bottom:0;">
                <div class="tw-title-sm" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>📜 Plan de Ataques</span>
                    <div>
                        <button id="tw-export-bb-btn" class="tw-btn tw-btn-action">📋 Exportar BBCode</button>
                        <button id="tw-clear-all-btn" style="background:none; border:none; color:#c0392b; cursor:pointer; font-size:12px; text-decoration:underline; margin-left:8px; font-weight:bold;">Borrar Todo</button>
                    </div>
                </div>
                <div id="tw-attack-list" style="max-height: 220px; overflow-y: auto; padding-right:5px;"></div>
            </div>

            <!-- MODAL BBCODE -->
            <div id="tw-bbcode-panel" class="tw-box" style="display:none; background:#ebd2a9;">
                <div class="tw-title-sm">📋 BBCode Generado</div>
                <textarea id="tw-bbcode-output" style="width:100%; height:120px; font-size:12px; font-family:monospace; box-sizing:border-box; border-radius:5px; padding:8px; border:1px solid #8a4b10;"></textarea>
                <button id="tw-close-bbcode-btn" class="tw-btn tw-btn-secondary" style="margin-top:8px; width:100%;">Cerrar</button>
            </div>

            <!-- PIE DE PÁGINA -->
            <div class="tw-footer">
                <span>hecho por <strong>samudev4</strong></span>
                <span>v${SCRIPT_VERSION} | <a href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">GitHub</a></span>
            </div>
        </div>
    `;

    document.body.appendChild(container);

    // Inputs para unidades
    const unitContainer = document.getElementById('tw-unit-inputs');
    Object.keys(BASE_UNIT_SPEEDS).forEach(unitKey => {
        const div = document.createElement('div');
        div.className = 'tw-unit-item';
        div.innerHTML = `
            <img src="https://dses.innogamescdn.com/asset/8b8e01d/graphic/unit/unit_${unitKey}.png" title="${UNIT_NAMES[unitKey]}" style="width:16px; height:16px;">
            <input type="text" inputmode="numeric" maxlength="5" class="tw-input tw-unit-count" data-unit="${unitKey}" placeholder="0">
        `;
        unitContainer.appendChild(div);
    });

    // 4. PETICIÓN AUTOMÁTICA DE CONFIGURACIÓN DEL MUNDO
    function fetchWorldConfig() {
        if (typeof $ !== 'undefined') {
            $.ajax({
                url: '/interface.php?func=get_config',
                type: 'GET',
                dataType: 'xml',
                success: function(xml) {
                    const ws = parseFloat($(xml).find('speed').text());
                    const us = parseFloat($(xml).find('unit_speed').text());
                    if (!isNaN(ws) && !isNaN(us)) {
                        saveWorldSpeeds(ws, us);
                        document.getElementById('tw-ws-val').textContent = ws;
                        document.getElementById('tw-us-val').textContent = us;
                    }
                }
            });
        }
    }

    if (speeds.worldSpeed === 1 && speeds.unitSpeed === 1) {
        fetchWorldConfig();
    }

    function setupSpeedEditEvents() {
        document.getElementById('tw-ws-val').addEventListener('click', () => {
            const current = getStoredWorldSpeeds();
            const val = prompt('Introduce la Velocidad del Mundo:', current.worldSpeed);
            if (val !== null && !isNaN(parseFloat(val))) {
                const newWs = parseFloat(val);
                saveWorldSpeeds(newWs, current.unitSpeed);
                document.getElementById('tw-ws-val').textContent = newWs;
            }
        });

        document.getElementById('tw-us-val').addEventListener('click', () => {
            const current = getStoredWorldSpeeds();
            const val = prompt('Introduce la Velocidad de las Unidades:', current.unitSpeed);
            if (val !== null && !isNaN(parseFloat(val))) {
                const newUs = parseFloat(val);
                saveWorldSpeeds(current.worldSpeed, newUs);
                document.getElementById('tw-us-val').textContent = newUs;
            }
        });
    }
    setupSpeedEditEvents();

    // 5. LÓGICA ARRASTRE Y MINIMIZAR
    const header = document.getElementById('tw-planner-header');
    let isDragging = false, offsetX = 0, offsetY = 0;

    header.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        offsetX = e.clientX - container.offsetLeft;
        offsetY = e.clientY - container.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const newTop = `${e.clientY - offsetY}px`;
        const newLeft = `${e.clientX - offsetX}px`;
        container.style.top = newTop;
        container.style.left = newLeft;
        savePosition(newTop, newLeft);
    });

    document.addEventListener('mouseup', () => { isDragging = false; });

    const toggleBtn = document.getElementById('tw-btn-toggle');
    const content = document.getElementById('tw-planner-content');
    toggleBtn.addEventListener('click', () => {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleBtn.textContent = '_';
        } else {
            content.style.display = 'none';
            toggleBtn.textContent = '+';
        }
    });

    // 6. CÁLCULOS Y FUNCIONES
    function getSlowestUnitKey(unitsObj) {
        let slowestKey = null;
        let maxTime = -1;
        Object.keys(unitsObj).forEach(u => {
            if (unitsObj[u] > 0) {
                const baseTime = BASE_UNIT_SPEEDS[u];
                if (baseTime > maxTime) {
                    maxTime = baseTime;
                    slowestKey = u;
                }
            }
        });
        return slowestKey;
    }

    function formatDate(d) {
        const pad = n => String(n).padStart(2, '0');
        const padMs = n => String(n).padStart(3, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${padMs(d.getMilliseconds())}`;
    }

    function formatDuration(ms) {
        if (ms <= 0) return "00:00:00";
        const sec = Math.round(ms / 1000);
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        const pad = n => String(n).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    function buildRallyUrl(atk) {
        const villageId = (typeof game_data !== 'undefined' && game_data.village) ? game_data.village.id : '';
        let url = `/game.php?village=${villageId}&screen=place&x=${atk.tx}&y=${atk.ty}`;
        Object.keys(atk.units).forEach(u => {
            if (atk.units[u] > 0) {
                url += `&${u}=${atk.units[u]}`;
            }
        });
        return url;
    }

    function renderAttacks() {
        const list = document.getElementById('tw-attack-list');
        list.innerHTML = '';
        const attacks = getStoredAttacks();

        if (attacks.length === 0) {
            list.innerHTML = '<div style="color:#777; text-align:center; padding:15px; font-style:italic;">No hay ataques planificados</div>';
            return;
        }

        const now = Date.now();

        attacks.forEach((atk, index) => {
            const [datePart, timePart] = atk.launchDate.split(' ');
            const [d, m, y] = datePart.split('/');
            const launchMs = new Date(`${y}-${m}-${d}T${timePart}`).getTime();
            const diffMs = launchMs - now;

            const card = document.createElement('div');
            card.className = 'tw-card';

            let unitsSummary = [];
            Object.keys(atk.units).forEach(u => {
                if (atk.units[u] > 0) unitsSummary.push(`${UNIT_NAMES[u]}: ${atk.units[u]}`);
            });

            const rallyUrl = buildRallyUrl(atk);
            const isWarn = diffMs < 60000 && diffMs > 0;

            card.innerHTML = `
                <button class="tw-card-del" data-index="${index}" title="Eliminar Ataque">×</button>
                <div style="font-weight:bold; color:#603000; font-size:14px; margin-bottom:4px;">${atk.ox}|${atk.oy} ➔ ${atk.tx}|${atk.ty}</div>
                <div style="font-size:11px; color:#444; margin-bottom: 6px; padding:4px; background:rgba(255,255,255,0.5); border-radius:3px;">
                    <strong>Tropas:</strong> ${unitsSummary.join(', ') || 'Sin especificar'}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                    <div style="line-height:1.5;">
                        <div style="color:#2c3e50;">⏱️ Duración: <strong>${atk.durationStr}</strong></div>
                        <div style="color:#d35400;">🚀 Enviar: <strong>${atk.launchDate}</strong></div>
                        <div style="color:#27ae60;">🎯 Llegada: <strong>${atk.targetDate}</strong></div>
                    </div>
                    <div style="text-align:right;">
                        <div class="tw-timer ${isWarn ? 'tw-timer-warn' : 'tw-timer-ok'}">${formatDuration(diffMs)}</div>
                        <div style="margin-top:6px;">
                            <a href="${rallyUrl}" target="_blank" class="tw-btn tw-btn-action" style="text-decoration:none; display:inline-block;">⚔️ Ir a la Plaza</a>
                        </div>
                    </div>
                </div>
            `;

            card.querySelector('.tw-card-del').addEventListener('click', () => {
                attacks.splice(index, 1);
                saveAttacks(attacks);
                renderAttacks();
            });

            list.appendChild(card);
        });
    }

    setInterval(() => {
        const attacks = getStoredAttacks();
        if (attacks.length > 0) {
            renderAttacks();
        }
    }, 1000);

    // 7. EVENTOS DE FORMULARIO
    document.getElementById('tw-btn-current-village').addEventListener('click', () => {
        if (typeof game_data !== 'undefined' && game_data.village) {
            document.getElementById('tw-ox').value = game_data.village.x;
            document.getElementById('tw-oy').value = game_data.village.y;
        } else {
            alert('No se pudieron leer las coordenadas del pueblo actual.');
        }
    });

    document.getElementById('tw-clear-form-btn').addEventListener('click', () => {
        document.getElementById('tw-ox').value = '';
        document.getElementById('tw-oy').value = '';
        document.getElementById('tw-tx').value = '';
        document.getElementById('tw-ty').value = '';
        document.getElementById('tw-h').value = '';
        document.getElementById('tw-m').value = '';
        document.getElementById('tw-s').value = '';
        document.getElementById('tw-ms').value = '';
        document.querySelectorAll('.tw-unit-count').forEach(i => i.value = '');
    });

    document.getElementById('tw-clear-all-btn').addEventListener('click', () => {
        if (confirm('¿Seguro que quieres borrar todos los ataques del planificador?')) {
            saveAttacks([]);
            renderAttacks();
        }
    });

    document.getElementById('tw-add-btn').addEventListener('click', () => {
        const ox = parseFloat(document.getElementById('tw-ox').value);
        const oy = parseFloat(document.getElementById('tw-oy').value);
        const tx = parseFloat(document.getElementById('tw-tx').value);
        const ty = parseFloat(document.getElementById('tw-ty').value);

        if (isNaN(ox) || isNaN(oy) || isNaN(tx) || isNaN(ty)) {
            alert('Por favor, ingresa coordenadas válidas de Origen y Destino.');
            return;
        }

        const dateVal = document.getElementById('tw-target-date').value;
        const h = parseInt(document.getElementById('tw-h').value) || 0;
        const m = parseInt(document.getElementById('tw-m').value) || 0;
        const s = parseInt(document.getElementById('tw-s').value) || 0;
        const ms = parseInt(document.getElementById('tw-ms').value) || 0;

        if (!dateVal) {
            alert('Por favor, selecciona una fecha válida.');
            return;
        }

        const targetDate = new Date(`${dateVal}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`);

        const units = {};
        document.querySelectorAll('.tw-unit-count').forEach(input => {
            const count = parseInt(input.value) || 0;
            if (count > 0) {
                units[input.getAttribute('data-unit')] = count;
            }
        });

        const slowestUnit = getSlowestUnitKey(units);
        if (!slowestUnit) {
            alert('Debes indicar la cantidad de al menos una tropa para el ataque.');
            return;
        }

        const dx = ox - tx;
        const dy = oy - ty;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const currentSpeeds = getStoredWorldSpeeds();
        const baseMinPerTile = BASE_UNIT_SPEEDS[slowestUnit];
        const realMinPerTile = baseMinPerTile / (currentSpeeds.worldSpeed * currentSpeeds.unitSpeed);
        
        const totalDurationMs = Math.round(dist * realMinPerTile * 60) * 1000;

        const launchDate = new Date(targetDate.getTime() - totalDurationMs);

        const newAttack = {
            ox, oy, tx, ty, units,
            dist: dist.toFixed(2),
            durationStr: formatDuration(totalDurationMs),
            targetDate: formatDate(targetDate),
            launchDate: formatDate(launchDate)
        };

        const attacks = getStoredAttacks();
        attacks.push(newAttack);
        saveAttacks(attacks);
        renderAttacks();
    });

    // EXPORTAR BBCODE COMPATIBLE CON GUERRAS TRIBALES
    document.getElementById('tw-export-bb-btn').addEventListener('click', () => {
        const attacks = getStoredAttacks();
        if (attacks.length === 0) {
            alert('No hay ataques para exportar.');
            return;
        }

        let bb = `[b]🛡️ PLANIFICACIÓN DE ATAQUES[/b]\n`;
        attacks.forEach((atk, index) => {
            let uStr = [];
            Object.keys(atk.units).forEach(u => {
                if (atk.units[u] > 0) uStr.push(`[unit]${u}[/unit] ${atk.units[u]}`);
            });

            bb += `\n[b]#${index + 1} | Origen:[/b] [coord]${atk.ox}|${atk.oy}[/coord] ➔ [b]Destino:[/b] [coord]${atk.tx}|${atk.ty}[/coord]\n`;
            bb += `[b]Tropas:[/b] ${uStr.join(' ') || 'Sin especificar'}\n`;
            bb += `[b]Duración:[/b] ${atk.durationStr}\n`;
            bb += `[b]🚀 Enviar:[/b] ${atk.launchDate}\n`;
            bb += `[b]🎯 Llegada:[/b] ${atk.targetDate}\n`;
            bb += `--------------------------------------------------\n`;
        });

        document.getElementById('tw-bbcode-output').value = bb.trim();
        document.getElementById('tw-bbcode-panel').style.display = 'block';
    });

    document.getElementById('tw-close-bbcode-btn').addEventListener('click', () => {
        document.getElementById('tw-bbcode-panel').style.display = 'none';
    });

    // Inicializar
    renderAttacks();
})();
