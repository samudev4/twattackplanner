(function() {
    'use strict';

    // Configuración del Script / Metadata
    const SCRIPT_VERSION = "2.6";
    const GITHUB_URL = "https://github.com/samudev4"; // Cambia esta URL por la de tu repositorio si prefieres

    // Evitar duplicar la interfaz si ya está abierta
    if (document.getElementById('tw-planner-window')) {
        const content = document.getElementById('tw-planner-content');
        if (content.style.display === 'none') {
            content.style.display = 'block';
        }
        return;
    }

    // 1. CONFIGURACIÓN Y VELOCIDADES POR DEFECTO (Minutos por casilla)
    const DEFAULT_SPEEDS = {
        "Lanza": 18,
        "Espada": 22,
        "Hacha": 18,
        "Arquero": 18,
        "Espía": 9,
        "Caballería Ligera": 10,
        "Arquero a Caballo": 10,
        "Caballería Pesada": 11,
        "Ariete": 30,
        "Catapulta": 30,
        "Paladín": 10,
        "Noble": 35
    };

    function getStoredSpeeds() {
        const saved = localStorage.getItem('tw_planner_speeds');
        return saved ? JSON.parse(saved) : { ...DEFAULT_SPEEDS };
    }

    function saveSpeeds(speeds) {
        localStorage.setItem('tw_planner_speeds', JSON.stringify(speeds));
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
        return saved ? JSON.parse(saved) : { top: '60px', left: '60px' };
    }

    function savePosition(top, left) {
        localStorage.setItem('tw_planner_pos', JSON.stringify({ top, left }));
    }

    // 2. INYECCIÓN DE ESTILOS CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #tw-planner-window {
            position: fixed;
            width: 420px;
            background: #e1c38a url('https://dses.innogamescdn.com/asset/8b8e01d/graphic/index/main_bg.jpg') repeat;
            border: 3px solid #603000;
            border-radius: 6px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.7);
            font-family: Verdana, Arial, sans-serif;
            font-size: 11px;
            color: #222;
            z-index: 999999;
            box-sizing: border-box;
        }
        #tw-planner-header {
            background: linear-gradient(180deg, #8a4b10 0%, #572d00 100%);
            color: #f0e2be;
            padding: 8px 12px;
            font-weight: bold;
            font-size: 13px;
            border-bottom: 2px solid #3b1a00;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
        }
        .tw-planner-body {
            padding: 12px;
        }
        .tw-box {
            background: rgba(255, 255, 255, 0.6);
            border: 1px solid #7d5128;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
        }
        .tw-title-sm {
            font-weight: bold;
            color: #603000;
            margin-bottom: 6px;
            border-bottom: 1px solid #b89160;
            padding-bottom: 3px;
        }
        .tw-row {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
        }
        .tw-input {
            background: #fff;
            border: 1px solid #7d5128;
            padding: 4px;
            border-radius: 3px;
            font-size: 11px;
            box-sizing: border-box;
        }
        .tw-input-coord {
            width: 45px;
            text-align: center;
        }
        .tw-select {
            background: #fff;
            border: 1px solid #7d5128;
            padding: 4px;
            border-radius: 3px;
            width: 100%;
        }
        .tw-btn {
            background: linear-gradient(180deg, #6c9e3f 0%, #3d6919 100%);
            color: #fff;
            border: 1px solid #28470f;
            border-radius: 3px;
            padding: 6px 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 11px;
            text-align: center;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .tw-btn:hover {
            background: linear-gradient(180deg, #7cb349 0%, #487c1e 100%);
        }
        .tw-btn-danger {
            background: linear-gradient(180deg, #c0392b 0%, #7f8c8d 100%);
            background-color: #a93226;
            border-color: #641e16;
        }
        .tw-btn-secondary {
            background: linear-gradient(180deg, #888 0%, #444 100%);
            border-color: #222;
        }
        .tw-card {
            background: #f4e4c1;
            border: 1px solid #9c7444;
            border-left: 4px solid #8a4b10;
            padding: 8px;
            border-radius: 3px;
            margin-bottom: 6px;
            position: relative;
        }
        .tw-card-del {
            position: absolute;
            top: 6px;
            right: 6px;
            background: #c0392b;
            color: #fff;
            border: none;
            border-radius: 3px;
            width: 18px;
            height: 18px;
            cursor: pointer;
            font-weight: bold;
            line-height: 14px;
            text-align: center;
        }
        .tw-footer {
            margin-top: 10px;
            padding-top: 6px;
            border-top: 1px solid #b89160;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #572d00;
        }
        .tw-footer a {
            color: #8a4b10;
            text-decoration: none;
            font-weight: bold;
        }
        .tw-footer a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);

    // 3. ESTRUCTURA DE LA INTERFAZ HTML
    const initialPos = getStoredPosition();
    const container = document.createElement('div');
    container.id = 'tw-planner-window';
    container.style.top = initialPos.top;
    container.style.left = initialPos.left;

    container.innerHTML = `
        <div id="tw-planner-header">
            <span>🛡️ Planificador de Ataques</span>
            <div>
                <button id="tw-btn-settings" title="Ajustes de Velocidad" style="background:none; border:none; color:#f0e2be; cursor:pointer; font-size:14px; margin-right:5px;">⚙️</button>
                <button id="tw-btn-toggle" style="background:none; border:none; color:#f0e2be; cursor:pointer; font-weight:bold;">_</button>
            </div>
        </div>

        <div id="tw-planner-content" class="tw-planner-body">
            <!-- PANEL DE AJUSTES -->
            <div id="tw-settings-panel" class="tw-box" style="display:none; background:#ebd2a9;">
                <div class="tw-title-sm">⚙️ Ajuste de Velocidades (min/campo)</div>
                <div id="tw-settings-list" style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; max-height:150px; overflow-y:auto; margin-bottom:8px;"></div>
                <div style="display:flex; gap:6px;">
                    <button id="tw-save-settings-btn" class="tw-btn" style="flex:1;">Guardar Ajustes</button>
                    <button id="tw-cancel-settings-btn" class="tw-btn tw-btn-secondary">Volver</button>
                </div>
            </div>

            <!-- FORMULARIO DE ATAQUE -->
            <div id="tw-form-panel" class="tw-box">
                <div class="tw-title-sm">Nuevo Plan de Ataque</div>

                <div class="tw-row">
                    <span style="width:70px; font-weight:bold;">Origen:</span>
                    <input type="number" id="tw-ox" class="tw-input tw-input-coord" placeholder="X">
                    <span>|</span>
                    <input type="number" id="tw-oy" class="tw-input tw-input-coord" placeholder="Y">
                </div>

                <div class="tw-row">
                    <span style="width:70px; font-weight:bold;">Destino:</span>
                    <input type="number" id="tw-tx" class="tw-input tw-input-coord" placeholder="X">
                    <span>|</span>
                    <input type="number" id="tw-ty" class="tw-input tw-input-coord" placeholder="Y">
                </div>

                <div class="tw-row">
                    <span style="width:70px; font-weight:bold;">Tropa más lenta:</span>
                    <select id="tw-unit" class="tw-select"></select>
                </div>

                <div class="tw-row" style="flex-wrap:wrap;">
                    <span style="width:100%; font-weight:bold; margin-bottom:2px;">Hora de Llegada:</span>
                    <input type="number" id="tw-h" class="tw-input" placeholder="HH" min="0" max="23" style="width:50px;"> :
                    <input type="number" id="tw-m" class="tw-input" placeholder="MM" min="0" max="59" style="width:50px;"> :
                    <input type="number" id="tw-s" class="tw-input" placeholder="SS" min="0" max="59" style="width:50px;">
                </div>

                <div style="display:flex; gap:6px; margin-top:8px;">
                    <button id="tw-add-btn" class="tw-btn" style="flex:1;">+ Añadir Ataque</button>
                    <button id="tw-clear-form-btn" class="tw-btn tw-btn-danger" title="Limpiar formulario">🧹 Limpiar</button>
                </div>
            </div>

            <!-- LISTA DE ATAQUES -->
            <div class="tw-box" style="margin-bottom:0;">
                <div class="tw-title-sm" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>📜 Plan de Ataques</span>
                    <button id="tw-clear-all-btn" style="background:none; border:none; color:#a93226; cursor:pointer; font-size:10px; text-decoration:underline;">Borrar todos</button>
                </div>
                <div id="tw-attack-list" style="max-height: 200px; overflow-y: auto;"></div>
            </div>

            <!-- PIE DE PÁGINA / CREDITS -->
            <div class="tw-footer">
                <span>Hecho por <strong>REDWALDA</strong></span>
                <span>v${SCRIPT_VERSION} | <a href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">GitHub</a></span>
            </div>
        </div>
    `;

    document.body.appendChild(container);

    // 4. LÓGICA DE ARRASTRE
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

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Toggle Minimizar
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

    // 5. FUNCIONES DE FORMATO Y CÁLCULOS
    function populateUnitSelect() {
        const select = document.getElementById('tw-unit');
        select.innerHTML = '';
        const speeds = getStoredSpeeds();
        Object.keys(speeds).forEach(unit => {
            const opt = document.createElement('option');
            opt.value = unit;
            opt.textContent = `${unit} (${speeds[unit]} min/campo)`;
            select.appendChild(opt);
        });
    }

    function renderSettingsList() {
        const listContainer = document.getElementById('tw-settings-list');
        listContainer.innerHTML = '';
        const speeds = getStoredSpeeds();

        Object.keys(speeds).forEach(unit => {
            const item = document.createElement('div');
            item.style = 'display:flex; flex-direction:column; gap:2px;';
            item.innerHTML = `
                <span style="font-size:10px;">${unit}:</span>
                <input type="number" step="0.1" class="tw-input tw-setting-val" data-unit="${unit}" value="${speeds[unit]}">
            `;
            listContainer.appendChild(item);
        });
    }

    function formatTime(date) {
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    }

    function formatDuration(totalMs) {
        const totalSeconds = Math.round(totalMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');

        return `${hh}:${mm}:${ss}`;
    }

    function renderAttacks() {
        const list = document.getElementById('tw-attack-list');
        list.innerHTML = '';
        const attacks = getStoredAttacks();

        if (attacks.length === 0) {
            list.innerHTML = '<div style="color:#777; text-align:center; padding:10px;">No hay ataques planificados</div>';
            return;
        }

        attacks.forEach((atk, index) => {
            const card = document.createElement('div');
            card.className = 'tw-card';
            card.innerHTML = `
                <button class="tw-card-del" data-index="${index}">×</button>
                <div style="font-weight:bold; color:#603000;">${atk.ox}|${atk.oy} ➔ ${atk.tx}|${atk.ty}</div>
                <div>Tropa: <strong>${atk.unit}</strong> | Dist: ${atk.dist} casillas</div>
                <div style="color:#d35400; font-weight:bold; margin-top:2px;">⏳ Duración: ${atk.durationStr}</div>
                <div style="color:#27ae60; font-weight:bold; margin-top:2px;">🚀 Enviar: ${atk.launchStr}</div>
                <div style="color:#2980b9; font-weight:bold;">🎯 Llegada: ${atk.targetStr}</div>
            `;

            card.querySelector('.tw-card-del').addEventListener('click', () => {
                attacks.splice(index, 1);
                saveAttacks(attacks);
                renderAttacks();
            });

            list.appendChild(card);
        });
    }

    // 6. EVENTOS DE BOTONES
    document.getElementById('tw-clear-form-btn').addEventListener('click', () => {
        document.getElementById('tw-ox').value = '';
        document.getElementById('tw-oy').value = '';
        document.getElementById('tw-tx').value = '';
        document.getElementById('tw-ty').value = '';
        document.getElementById('tw-h').value = '';
        document.getElementById('tw-m').value = '';
        document.getElementById('tw-s').value = '';
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
        const unit = document.getElementById('tw-unit').value;

        if (isNaN(ox) || isNaN(oy) || isNaN(tx) || isNaN(ty)) {
            alert('Asegúrate de ingresar coordenadas X e Y válidas para origen y destino.');
            return;
        }

        const h = parseInt(document.getElementById('tw-h').value) || 0;
        const m = parseInt(document.getElementById('tw-m').value) || 0;
        const s = parseInt(document.getElementById('tw-s').value) || 0;

        const targetDate = new Date();
        targetDate.setHours(h, m, s, 0);
        if (targetDate.getTime() < Date.now()) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const dx = ox - tx;
        const dy = oy - ty;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const speeds = getStoredSpeeds();
        const speedMinPerTile = speeds[unit] || 10;
        const totalDurationMs = dist * speedMinPerTile * 60 * 1000;

        const launchDate = new Date(targetDate.getTime() - totalDurationMs);

        const newAttack = {
            ox, oy, tx, ty, unit,
            dist: dist.toFixed(2),
            durationStr: formatDuration(totalDurationMs),
            launchStr: formatTime(launchDate),
            targetStr: formatTime(targetDate)
        };

        const currentAttacks = getStoredAttacks();
        currentAttacks.push(newAttack);
        saveAttacks(currentAttacks);
        renderAttacks();
    });

    const settingsPanel = document.getElementById('tw-settings-panel');
    const formPanel = document.getElementById('tw-form-panel');

    document.getElementById('tw-btn-settings').addEventListener('click', () => {
        renderSettingsList();
        formPanel.style.display = 'none';
        settingsPanel.style.display = 'block';
    });

    document.getElementById('tw-cancel-settings-btn').addEventListener('click', () => {
        settingsPanel.style.display = 'none';
        formPanel.style.display = 'block';
    });

    document.getElementById('tw-save-settings-btn').addEventListener('click', () => {
        const newSpeeds = {};
        document.querySelectorAll('.tw-setting-val').forEach(input => {
            const unit = input.getAttribute('data-unit');
            const val = parseFloat(input.value);
            if (!isNaN(val) && val > 0) {
                newSpeeds[unit] = val;
            }
        });

        saveSpeeds(newSpeeds);
        populateUnitSelect();
        settingsPanel.style.display = 'none';
        formPanel.style.display = 'block';
    });

    // Inicializar estado
    populateUnitSelect();
    renderAttacks();
})();
