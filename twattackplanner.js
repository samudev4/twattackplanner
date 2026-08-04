(function() {
    'use strict';

    const SCRIPT_VERSION = "3.0";
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
        "spear": 18,
        "sword": 22,
        "axe": 18,
        "archer": 18,
        "spy": 9,
        "light": 10,
        "marcher": 10,
        "heavy": 11,
        "ram": 30,
        "catapult": 30,
        "knight": 10,
        "snob": 35
    };

    const UNIT_NAMES = {
        "spear": "Lanza",
        "sword": "Espada",
        "axe": "Hacha",
        "archer": "Arquero",
        "spy": "Espía",
        "light": "C. Ligera",
        "marcher": "Arquero C.",
        "heavy": "C. Pesada",
        "ram": "Ariete",
        "catapult": "Catapulta",
        "knight": "Paladín",
        "snob": "Noble"
    };

    // Lectura de datos del juego desde el objeto global game_data
    const worldSpeed = (typeof game_data !== 'undefined' && game_data.worldConfig) ? parseFloat(game_data.worldConfig.speed) : 1;
    const unitSpeedMultiplier = (typeof game_data !== 'undefined' && game_data.worldConfig) ? parseFloat(game_data.worldConfig.unit_speed) : 1;

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

    // 2. ESTILOS CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #tw-planner-window {
            position: fixed;
            width: 480px;
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
        .tw-planner-body { padding: 10px; }
        .tw-box {
            background: rgba(255, 255, 255, 0.65);
            border: 1px solid #7d5128;
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 8px;
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
            margin-bottom: 5px;
        }
        .tw-input {
            background: #fff;
            border: 1px solid #7d5128;
            padding: 3px 5px;
            border-radius: 3px;
            font-size: 11px;
            box-sizing: border-box;
        }
        .tw-input-coord { width: 42px; text-align: center; }
        .tw-btn {
            background: linear-gradient(180deg, #6c9e3f 0%, #3d6919 100%);
            color: #fff;
            border: 1px solid #28470f;
            border-radius: 3px;
            padding: 4px 8px;
            font-weight: bold;
            cursor: pointer;
            font-size: 10px;
            text-align: center;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .tw-btn:hover { background: linear-gradient(180deg, #7cb349 0%, #487c1e 100%); }
        .tw-btn-danger { background: linear-gradient(180deg, #c0392b 0%, #7f8c8d 100%); background-color: #a93226; border-color: #641e16; }
        .tw-btn-secondary { background: linear-gradient(180deg, #888 0%, #444 100%); border-color: #222; }
        .tw-btn-action { background: linear-gradient(180deg, #2980b9 0%, #1a5276 100%); border-color: #1b4f72; }
        
        .tw-unit-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 4px;
            margin-top: 5px;
        }
        .tw-unit-item {
            display: flex;
            align-items: center;
            gap: 4px;
            background: rgba(255,255,255,0.5);
            padding: 2px 4px;
            border: 1px solid #ccc;
            border-radius: 3px;
        }
        .tw-unit-item input { width: 100%; font-size: 10px; padding: 2px; }

        .tw-card {
            background: #f4e4c1;
            border: 1px solid #9c7444;
            border-left: 4px solid #8a4b10;
            padding: 6px 8px;
            border-radius: 3px;
            margin-bottom: 6px;
            position: relative;
        }
        .tw-card-del {
            position: absolute;
            top: 4px;
            right: 4px;
            background: #c0392b;
            color: #fff;
            border: none;
            border-radius: 3px;
            width: 16px;
            height: 16px;
            cursor: pointer;
            font-weight: bold;
            line-height: 12px;
            text-align: center;
        }
        .tw-footer {
            margin-top: 6px;
            padding-top: 4px;
            border-top: 1px solid #b89160;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #572d00;
        }
        .tw-footer a { color: #8a4b10; text-decoration: none; font-weight: bold; }
        .tw-timer {
            font-weight: bold;
            font-family: monospace;
            font-size: 11px;
            padding: 2px 4px;
            background: #fff;
            border: 1px solid #999;
            border-radius: 3px;
            display: inline-block;
        }
        .tw-timer-warn { color: #c0392b; background: #fadbd8; }
        .tw-timer-ok { color: #27ae60; }
    `;
    document.head.appendChild(style);

    // 3. ESTRUCTURA INTERFAZ
    const initialPos = getStoredPosition();
    const container = document.createElement('div');
    container.id = 'tw-planner-window';
    container.style.top = initialPos.top;
    container.style.left = initialPos.left;

    const currentWorld = (typeof game_data !== 'undefined' && game_data.world) ? game_data.world : "Desconocido";

    // Obtener fecha de mañana por defecto para el input de fecha
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDateStr = tomorrow.toISOString().split('T')[0];

    container.innerHTML = `
        <div id="tw-planner-header">
            <span>🛡️ Planificador Avanzado de Ataques</span>
            <button id="tw-btn-toggle" style="background:none; border:none; color:#f0e2be; cursor:pointer; font-weight:bold;">_</button>
        </div>

        <div id="tw-planner-content" class="tw-planner-body">
            <!-- INFO DEL MUNDO -->
            <div style="font-size: 10px; color: #572d00; margin-bottom: 6px; display:flex; justify-content:space-between;">
                <span><strong>Mundo:</strong> ${currentWorld}</span>
                <span><strong>Vel. Mundo:</strong> ${worldSpeed} | <strong>Vel. Unidades:</strong> ${unitSpeedMultiplier}</span>
            </div>

            <!-- FORMULARIO DE ATAQUE -->
            <div id="tw-form-panel" class="tw-box">
                <div class="tw-title-sm">Nuevo Plan de Ataque</div>

                <div class="tw-row">
                    <span style="width:55px; font-weight:bold;">Origen:</span>
                    <input type="number" id="tw-ox" class="tw-input tw-input-coord" placeholder="X">
                    <span>|</span>
                    <input type="number" id="tw-oy" class="tw-input tw-input-coord" placeholder="Y">
                    <button id="tw-btn-current-village" class="tw-btn tw-btn-secondary" style="font-size:9px;">📍 Usar actual</button>
                </div>

                <div class="tw-row">
                    <span style="width:55px; font-weight:bold;">Destino:</span>
                    <input type="number" id="tw-tx" class="tw-input tw-input-coord" placeholder="X">
                    <span>|</span>
                    <input type="number" id="tw-ty" class="tw-input tw-input-coord" placeholder="Y">
                </div>

                <div class="tw-row">
                    <span style="width:55px; font-weight:bold;">Llegada:</span>
                    <input type="date" id="tw-target-date" class="tw-input" value="${defaultDateStr}">
                    <input type="number" id="tw-h" class="tw-input" placeholder="HH" min="0" max="23" style="width:38px;">:
                    <input type="number" id="tw-m" class="tw-input" placeholder="MM" min="0" max="59" style="width:38px;">:
                    <input type="number" id="tw-s" class="tw-input" placeholder="SS" min="0" max="59" style="width:38px;">
                </div>

                <!-- SELECCIÓN DE TROPAS -->
                <div style="font-weight:bold; margin-top:6px; margin-bottom:2px;">Tropas a enviar:</div>
                <div class="tw-unit-grid" id="tw-unit-inputs"></div>

                <div style="display:flex; gap:6px; margin-top:8px;">
                    <button id="tw-add-btn" class="tw-btn" style="flex:1;">+ Añadir Ataque</button>
                    <button id="tw-clear-form-btn" class="tw-btn tw-btn-danger" title="Limpiar formulario">🧹 Limpiar</button>
                </div>
            </div>

            <!-- LISTA DE ATAQUES -->
            <div class="tw-box" style="margin-bottom:0;">
                <div class="tw-title-sm" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>📜 Plan de Ataques</span>
                    <div>
                        <button id="tw-export-bb-btn" class="tw-btn tw-btn-action" style="font-size:9px;">📋 Exportar BBCode</button>
                        <button id="tw-clear-all-btn" style="background:none; border:none; color:#a93226; cursor:pointer; font-size:10px; text-decoration:underline; margin-left:4px;">Borrar</button>
                    </div>
                </div>
                <div id="tw-attack-list" style="max-height: 180px; overflow-y: auto;"></div>
            </div>

            <!-- MODAL BBCODE -->
            <div id="tw-bbcode-panel" class="tw-box" style="display:none; background:#ebd2a9;">
                <div class="tw-title-sm">📋 BBCode Generado</div>
                <textarea id="tw-bbcode-output" style="width:100%; height:100px; font-size:10px; font-family:monospace; box-sizing:border-box;"></textarea>
                <button id="tw-close-bbcode-btn" class="tw-btn tw-btn-secondary" style="margin-top:4px; width:100%;">Cerrar</button>
            </div>

            <!-- PIE DE PÁGINA -->
            <div class="tw-footer">
                <span>hecho por <strong>samudev4</strong></span>
                <span>v${SCRIPT_VERSION} | <a href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">GitHub</a></span>
            </div>
        </div>
    `;

    document.body.appendChild(container);

    // Generar inputs para cada unidad
    const unitContainer = document.getElementById('tw-unit-inputs');
    Object.keys(BASE_UNIT_SPEEDS).forEach(unitKey => {
        const div = document.createElement('div');
        div.className = 'tw-unit-item';
        div.innerHTML = `
            <img src="https://dses.innogamescdn.com/asset/8b8e01d/graphic/unit/unit_${unitKey}.png" title="${UNIT_NAMES[unitKey]}" style="width:14px; height:14px;">
            <input type="number" min="0" class="tw-input tw-unit-count" data-unit="${unitKey}" placeholder="0">
        `;
        unitContainer.appendChild(div);
    });

    // 4. LÓGICA ARRASTRE Y MINIMIZAR
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

    // 5. CÁLCULOS Y FUNCIONES
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
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    function formatDuration(ms) {
        if (ms < 0) return "00:00:00";
        const sec = Math.floor(ms / 1000);
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

    // Renderizar ataques y cuentas atrás
    function renderAttacks() {
        const list = document.getElementById('tw-attack-list');
        list.innerHTML = '';
        const attacks = getStoredAttacks();

        if (attacks.length === 0) {
            list.innerHTML = '<div style="color:#777; text-align:center; padding:8px;">No hay ataques planificados</div>';
            return;
        }

        const now = Date.now();

        attacks.forEach((atk, index) => {
            const launchMs = new Date(atk.launchDate).getTime();
            const diffMs = launchMs - now;

            const card = document.createElement('div');
            card.className = 'tw-card';

            let unitsSummary = [];
            Object.keys(atk.units).forEach(u => {
                if (atk.units[u] > 0) unitsSummary.push(`${UNIT_NAMES[u]}: ${atk.units[u]}`);
            });

            const rallyUrl = buildRallyUrl(atk);
            const isWarn = diffMs < 60000 && diffMs > 0; // Menos de 1 minuto

            card.innerHTML = `
                <button class="tw-card-del" data-index="${index}">×</button>
                <div style="font-weight:bold; color:#603000;">${atk.ox}|${atk.oy} ➔ ${atk.tx}|${atk.ty}</div>
                <div style="font-size:10px; color:#444; margin: 2px 0;">Tropas: ${unitsSummary.join(', ') || 'Sin especificar'}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                    <div>
                        <div>🚀 Enviar: <strong>${atk.launchDate}</strong></div>
                        <div>🎯 Llegada: <strong>${atk.targetDate}</strong></div>
                    </div>
                    <div style="text-align:right;">
                        <div class="tw-timer ${isWarn ? 'tw-timer-warn' : 'tw-timer-ok'}">${formatDuration(diffMs)}</div>
                        <div style="margin-top:3px;">
                            <a href="${rallyUrl}" target="_blank" class="tw-btn tw-btn-action" style="text-decoration:none; padding:2px 6px;">⚔️ Enviar</a>
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

    // Bucle para actualizar temporizadores cada segundo
    setInterval(() => {
        const attacks = getStoredAttacks();
        if (attacks.length > 0) {
            renderAttacks();
        }
    }, 1000);

    // 6. EVENTOS DE BOTONES
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

        if (!dateVal) {
            alert('Por favor, selecciona una fecha válida.');
            return;
        }

        const targetDate = new Date(`${dateVal}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);

        // Recopilar tropas
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

        // Cálculo de tiempo de viaje ajustado a velocidad de mundo y tropas
        const dx = ox - tx;
        const dy = oy - ty;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const baseMinPerTile = BASE_UNIT_SPEEDS[slowestUnit];
        const realMinPerTile = baseMinPerTile / (worldSpeed * unitSpeedMultiplier);
        const totalDurationMs = dist * realMinPerTile * 60 * 1000;

        const launchDate = new Date(targetDate.getTime() - totalDurationMs);

        const newAttack = {
            ox, oy, tx, ty, units,
            dist: dist.toFixed(2),
            targetDate: formatDate(targetDate),
            launchDate: formatDate(launchDate)
        };

        const attacks = getStoredAttacks();
        attacks.push(newAttack);
        saveAttacks(attacks);
        renderAttacks();
    });

    // EXPORTAR BBCODE
    document.getElementById('tw-export-bb-btn').addEventListener('click', () => {
        const attacks = getStoredAttacks();
        if (attacks.length === 0) {
            alert('No hay ataques para exportar.');
            return;
        }

        let bb = `[table][tr][th]Origen[/th][th]Destino[/th][th]Tropas[/th][th]Hora Envio[/th][th]Hora Llegada[/th][/tr]`;
        attacks.forEach(atk => {
            let uStr = [];
            Object.keys(atk.units).forEach(u => {
                if (atk.units[u] > 0) uStr.push(`[unit]${u}[/unit] ${atk.units[u]}`);
            });
            bb += `\n[tr][td][coord]${atk.ox}|${atk.oy}[/coord][/td][td][coord]${atk.tx}|${atk.ty}[/coord][/td][td]${uStr.join(' ')}[/td][td]${atk.launchDate}[/td][td]${atk.targetDate}[/td][/tr]`;
        });
        bb += `\n[/table]`;

        document.getElementById('tw-bbcode-output').value = bb;
        document.getElementById('tw-bbcode-panel').style.display = 'block';
    });

    document.getElementById('tw-close-bbcode-btn').addEventListener('click', () => {
        document.getElementById('tw-bbcode-panel').style.display = 'none';
    });

    // Inicializar
    renderAttacks();
})();
